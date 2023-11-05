#!/usr/bin/python3

'''
Create SSL self-signed certificate, if it doesn't exist.
Run a local web server to serve the current directory.
'''

import aiohttp
import asyncio
import os
import ssl
import sys

from aiohttp import web
import aiosignal
import mimetypes
import pathlib

mimetypes = mimetypes.MimeTypes()

def make_static_handler(rootpath):
	import pathlib
	rootpath = pathlib.Path(__file__).parent / rootpath
	
	async def handle(request:web.Request):
		'''
		Handle a request.
		'''
		# Get the path
		path = request.match_info.get('path', '')
		# If the path is empty, use index.html
		if path == '':
				path = '/'
		localpath = rootpath / path.lstrip("/")
		if localpath.is_dir():
				localpath = localpath / "index.html"
		if not localpath.exists():
				return web.Response(status=404)

		# Get the file contents
		print(f"Request for {localpath}: request={request}")
		try:
				with open(str(localpath), 'rb') as f:
						content = f.read()
		except FileNotFoundError:
				# If the file doesn't exist, return 404
				return web.Response(status=404)
		# Return the file contents
		mimetype = mimetypes.guess_type(localpath)[0]
		return web.Response(body=content, content_type=mimetype)

	return handle

# -----------------------------------------------------------------------------
# Basic HTTPS server key and certificate generation for a local-only development
# server.  This is not intended for production use. It is intended to be used
# for local development and testing.
# -----------------------------------------------------------------------------

from datetime import datetime, timedelta
import ipaddress

def generate_rsa_key(key_size=2048):
		"""Generates an rsa private key suitable for TLS"""
		from cryptography import x509
		from cryptography.x509.oid import NameOID
		from cryptography.hazmat.primitives import hashes
		from cryptography.hazmat.backends import default_backend
		from cryptography.hazmat.primitives import serialization
		from cryptography.hazmat.primitives.asymmetric import rsa

		key = rsa.generate_private_key(
						public_exponent=65537,
						key_size=2048,
						backend=default_backend(),
		)
		key_pem = key.private_bytes(
				encoding=serialization.Encoding.PEM,
				format=serialization.PrivateFormat.TraditionalOpenSSL,
				encryption_algorithm=serialization.NoEncryption(),
		)

		return key_pem

def generate_selfsigned_cert(key_pem, hostname, ip_addresses=None):
		"""Generates self signed certificate for a hostname, and optional IP addresses."""
		from cryptography import x509
		from cryptography.x509.oid import NameOID
		from cryptography.hazmat.primitives import hashes
		from cryptography.hazmat.backends import default_backend
		from cryptography.hazmat.primitives import serialization
		from cryptography.hazmat.primitives.asymmetric import rsa

		# deserialize the key
		key = serialization.load_pem_private_key(
				key_pem,
				password=None,
				backend=default_backend()
		)

		name = x509.Name([
				x509.NameAttribute(NameOID.COMMON_NAME, hostname)
		])

		# best practice seem to be to include the hostname in the SAN, which *SHOULD* mean COMMON_NAME is ignored.
		alt_names = [x509.DNSName(hostname)]

		# allow addressing by IP, for when you don't have real DNS (common in most testing scenarios
		if ip_addresses:
				for addr in ip_addresses:
						# openssl wants DNSnames for ips...
						alt_names.append(x509.DNSName(addr))
						# ... whereas golang's crypto/tls is stricter, and needs IPAddresses
						# note: older versions of cryptography do not understand ip_address objects
						alt_names.append(x509.IPAddress(ipaddress.ip_address(addr)))

		san = x509.SubjectAlternativeName(alt_names)

		# path_len=0 means this cert can only sign itself, not other certs.
		basic_contraints = x509.BasicConstraints(ca=True, path_length=0)
		now = datetime.utcnow()
		cert = (
				x509.CertificateBuilder()
				.subject_name(name)
				.issuer_name(name)
				.public_key(key.public_key())
				.serial_number(1000)
				.not_valid_before(now)
				.not_valid_after(now + timedelta(days=10*365))
				.add_extension(basic_contraints, False)
				.add_extension(san, False)
				.sign(key, hashes.SHA256(), default_backend())
		)
		cert_pem = cert.public_bytes(encoding=serialization.Encoding.PEM)

		return cert_pem

import yarl, os, pathlib

def main(host='0.0.0.0', port=8443, overwrite_creds=True):
		'''
		Create SSL self-signed certificate, if it doesn't exist.
		Run a local web server to serve the current directory.
		'''
		script_dir = pathlib.Path(__file__).resolve().parent
		
		# cd to script directory
		os.chdir(str(script_dir))

		# Get the current directory
		current_dir = pathlib.Path('.').resolve()
		
		# Get the key and certificate pem file paths in the scripts parent directory
		key_path = current_dir / 'key.pem'
		cert_path = current_dir / 'cert.pem'

		if not key_path.exists() or overwrite_creds:
				print(f"Generating new server secret key {repr(key_path)}")
				if cert_path.exists():
						if not overwrite_creds:
								# if the certificate exists, delete it
								raise(FileExistsError(f"Existing certificate {cert_path} is likely invalid, please delete it."))
						else:
								print(f"Removing old certificate {repr(cert_path)} (per --overwrite-creds)")
								os.remove(cert_path)
				# if the key doesn't exists, create a new one
				key_pem = generate_rsa_key()
				with open(key_path, 'wb') as f:
						f.write(key_pem)
				print(f"Created new key at {key_path}")
		else:
				# if the key exists, load it
				with open(key_path, 'rb') as f:
						key_pem = f.read()
				print(f"Using existing key at {key_path}")

		if not cert_path.exists():
				# If the certificate doesn't exist reate a new certificate
				cert_pem = generate_selfsigned_cert(key_pem, 'localhost', ['0.0.0.0', '127.0.0.1'])
				with open(cert_path, 'wb') as f:
						f.write(cert_pem)
				print(f"Created new certificate at {cert_path}")
		else:
				# If the certificate exists, load it
				with open(cert_path, 'rb') as f:
						cert_pem = f.read()
				print(f"Using existing certificate at {cert_path}")

		async def browse_to(app):
				url = yarl.URL.build(scheme='https', host=host, port=port)
				print(f"Browsing to {url}")
				await openbrowser(str(url))

		# Create the web server
		app = web.Application()

		# Add the startup event to open the browser
		if "DISPLAY" in os.environ.keys():
			app.on_startup.append(browse_to)

		# Add the route
		app.router.add_get('/{path:.*}', make_static_handler("."))

		# Run the web server
		"""
		app = web.Application()
		app.add_routes([web.get('/', handle),
										web.get('/{name}', handle)])
		"""

		ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
		ssl_context.load_cert_chain(cert_path, key_path)

		web.run_app(app, ssl_context=ssl_context, host=host, port=port)

async def runcommand(cmd, *args):
				import shlex, asyncio
				await asyncio.subprocess.create_subprocess_shell(
								cmd=" ".join([shlex.quote(wrd) for wrd in [cmd, *args]])
				)

async def openbrowser(url):
				await runcommand("xdg-open", url)

if __name__ == '__main__':
		main()
