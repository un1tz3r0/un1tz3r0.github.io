var Cf=0,Bh=1,Tf=2;var co=1,al=2,cr=3,ai=0,Ve=1,Hn=2,en=0,as=1,Uh=2,Oh=3,kh=4,Pf=5,Ni=100,Rf=101,If=102,Lf=103,Ff=104,Nf=200,Df=201,Bf=202,Uf=203,Ba=204,Ua=205,Of=206,kf=207,zf=208,Vf=209,Gf=210,Hf=211,Wf=212,qf=213,Xf=214,ll=0,cl=1,hl=2,ls=3,ul=4,dl=5,pl=6,fl=7,zh=0,Yf=1,jf=2,Fn=0,ho=1,uo=2,po=3,fo=4,mo=5,go=6,vo=7;var Vh=300,zi=301,gs=302,ml=303,gl=304,_o=306,Oa=1e3,zn=1001,ka=1002,Te=1003,$f=1004;var xo=1005;var Oe=1006,vl=1007;var Vi=1008;var nn=1009,Gh=1010,Hh=1011,hr=1012,_l=1013,Nn=1014,Dn=1015,sn=1016,xl=1017,bl=1018,ur=1020,Wh=35902,qh=35899,Xh=1021,Yh=1022,wn=1023,Gn=1026,Gi=1027,jh=1028,yl=1029,vs=1030,wl=1031;var Ml=1033,bo=33776,yo=33777,wo=33778,Mo=33779,Sl=35840,El=35841,Al=35842,Cl=35843,Tl=36196,Pl=37492,Rl=37496,Il=37488,Ll=37489,Fl=37490,Nl=37491,Dl=37808,Bl=37809,Ul=37810,Ol=37811,kl=37812,zl=37813,Vl=37814,Gl=37815,Hl=37816,Wl=37817,ql=37818,Xl=37819,Yl=37820,jl=37821,$l=36492,Zl=36494,Kl=36495,Jl=36283,Ql=36284,tc=36285,ec=36286;var zr=2300,za=2301,Da=2302,Th=2400,Ph=2401,Rh=2402;var Zf=3200,$h=3201;var Zh=0,Kf=1,di="",dn="srgb",cs="srgb-linear",Vr="linear",ne="srgb";var os=7680;var Ih=519,Jf=512,Qf=513,tm=514,nc=515,em=516,nm=517,ic=518,im=519,Lh=35044;var Kh="300 es",In=2e3,Gr=2001;function Jh(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function ov(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Hr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function sm(){let i=Hr("canvas");return i.style.display="block",i}var of={},Qs=null;function Qh(...i){let t="THREE."+i.shift();Qs?Qs("log",t,...i):console.log(t,...i)}function Dt(...i){let t="THREE."+i.shift();Qs?Qs("warn",t,...i):console.warn(t,...i)}function Nt(...i){let t="THREE."+i.shift();Qs?Qs("error",t,...i):console.error(t,...i)}function tr(...i){let t=i.join(" ");t in of||(of[t]=!0,Dt(...i))}function rm(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var li=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},Ge=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var ih=Math.PI/180,Va=180/Math.PI;function So(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ge[i&255]+Ge[i>>8&255]+Ge[i>>16&255]+Ge[i>>24&255]+"-"+Ge[t&255]+Ge[t>>8&255]+"-"+Ge[t>>16&15|64]+Ge[t>>24&255]+"-"+Ge[e&63|128]+Ge[e>>8&255]+"-"+Ge[e>>16&255]+Ge[e>>24&255]+Ge[n&255]+Ge[n>>8&255]+Ge[n>>16&255]+Ge[n>>24&255]).toLowerCase()}function Kt(i,t,e){return Math.max(t,Math.min(e,i))}function av(i,t){return(i%t+t)%t}function sh(i,t,e){return(1-e)*i+e*t}function Nr(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Qe(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var $t=class i{constructor(t=0,e=0){i.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Kt(this.x,t.x,e.x),this.y=Kt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Kt(this.x,t,e),this.y=Kt(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Kt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Kt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ye=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],d=n[s+3],u=r[o+0],p=r[o+1],m=r[o+2],v=r[o+3];if(a<=0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d;return}if(a>=1){t[e+0]=u,t[e+1]=p,t[e+2]=m,t[e+3]=v;return}if(d!==v||l!==u||c!==p||h!==m){let g=l*u+c*p+h*m+d*v;g<0&&(u=-u,p=-p,m=-m,v=-v,g=-g);let f=1-a;if(g<.9995){let _=Math.acos(g),w=Math.sin(_);f=Math.sin(f*_)/w,a=Math.sin(a*_)/w,l=l*f+u*a,c=c*f+p*a,h=h*f+m*a,d=d*f+v*a}else{l=l*f+u*a,c=c*f+p*a,h=h*f+m*a,d=d*f+v*a;let _=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=_,c*=_,h*=_,d*=_}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],d=r[o],u=r[o+1],p=r[o+2],m=r[o+3];return t[e]=a*m+h*d+l*p-c*u,t[e+1]=l*m+h*u+c*d-a*p,t[e+2]=c*m+h*p+a*u-l*d,t[e+3]=h*m-a*d-l*u-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),d=a(r/2),u=l(n/2),p=l(s/2),m=l(r/2);switch(o){case"XYZ":this._x=u*h*d+c*p*m,this._y=c*p*d-u*h*m,this._z=c*h*m+u*p*d,this._w=c*h*d-u*p*m;break;case"YXZ":this._x=u*h*d+c*p*m,this._y=c*p*d-u*h*m,this._z=c*h*m-u*p*d,this._w=c*h*d+u*p*m;break;case"ZXY":this._x=u*h*d-c*p*m,this._y=c*p*d+u*h*m,this._z=c*h*m+u*p*d,this._w=c*h*d-u*p*m;break;case"ZYX":this._x=u*h*d-c*p*m,this._y=c*p*d+u*h*m,this._z=c*h*m-u*p*d,this._w=c*h*d+u*p*m;break;case"YZX":this._x=u*h*d+c*p*m,this._y=c*p*d+u*h*m,this._z=c*h*m-u*p*d,this._w=c*h*d-u*p*m;break;case"XZY":this._x=u*h*d-c*p*m,this._y=c*p*d-u*h*m,this._z=c*h*m+u*p*d,this._w=c*h*d+u*p*m;break;default:Dt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],d=e[10],u=n+a+d;if(u>0){let p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(o-s)*p}else if(n>a&&n>d){let p=2*Math.sqrt(1+n-a-d);this._w=(h-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+c)/p}else if(a>d){let p=2*Math.sqrt(1+a-n-d);this._w=(r-c)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+d-n-a);this._w=(o-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Kt(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e<=0)return this;if(e>=1)return this.copy(t);let n=t._x,s=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},H=class i{constructor(t=0,e=0,n=0){i.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(af.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(af.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),h=2*(a*e-r*s),d=2*(r*n-o*e);return this.x=e+l*c+o*d-a*h,this.y=n+l*h+a*c-r*d,this.z=s+l*d+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Kt(this.x,t.x,e.x),this.y=Kt(this.y,t.y,e.y),this.z=Kt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Kt(this.x,t,e),this.y=Kt(this.y,t,e),this.z=Kt(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Kt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return rh.copy(this).projectOnVector(t),this.sub(rh)}reflect(t){return this.sub(rh.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Kt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},rh=new H,af=new Ye,Gt=class i{constructor(t,e,n,s,r,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],p=n[5],m=n[8],v=s[0],g=s[3],f=s[6],_=s[1],w=s[4],M=s[7],E=s[2],A=s[5],T=s[8];return r[0]=o*v+a*_+l*E,r[3]=o*g+a*w+l*A,r[6]=o*f+a*M+l*T,r[1]=c*v+h*_+d*E,r[4]=c*g+h*w+d*A,r[7]=c*f+h*M+d*T,r[2]=u*v+p*_+m*E,r[5]=u*g+p*w+m*A,r[8]=u*f+p*M+m*T,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],d=h*o-a*c,u=a*l-h*r,p=c*r-o*l,m=e*d+n*u+s*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/m;return t[0]=d*v,t[1]=(s*c-h*n)*v,t[2]=(a*n-s*o)*v,t[3]=u*v,t[4]=(h*e-s*l)*v,t[5]=(s*r-a*e)*v,t[6]=p*v,t[7]=(n*l-c*e)*v,t[8]=(o*e-n*r)*v,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(oh.makeScale(t,e)),this}rotate(t){return this.premultiply(oh.makeRotation(-t)),this}translate(t,e){return this.premultiply(oh.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},oh=new Gt,lf=new Gt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),cf=new Gt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function lv(){let i={enabled:!0,workingColorSpace:cs,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ne&&(s.r=oi(s.r),s.g=oi(s.g),s.b=oi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ne&&(s.r=Js(s.r),s.g=Js(s.g),s.b=Js(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===di?Vr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return tr("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return tr("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[cs]:{primaries:t,whitePoint:n,transfer:Vr,toXYZ:lf,fromXYZ:cf,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:dn},outputColorSpaceConfig:{drawingBufferColorSpace:dn}},[dn]:{primaries:t,whitePoint:n,transfer:ne,toXYZ:lf,fromXYZ:cf,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:dn}}}),i}var Zt=lv();function oi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Js(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var zs,Ga=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{zs===void 0&&(zs=Hr("canvas")),zs.width=t.width,zs.height=t.height;let s=zs.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=zs}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Hr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=oi(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(oi(e[n]/255)*255):e[n]=oi(e[n]);return{data:e,width:t.width,height:t.height}}else return Dt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},cv=0,er=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:cv++}),this.uuid=So(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayHeight,e.displayWidth,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(ah(s[o].image)):r.push(ah(s[o]))}else r=ah(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function ah(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ga.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Dt("Texture: Unable to serialize Texture."),{})}var hv=0,lh=new H,tn=class i extends li{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=zn,s=zn,r=Oe,o=Vi,a=wn,l=nn,c=i.DEFAULT_ANISOTROPY,h=di){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:hv++}),this.uuid=So(),this.name="",this.source=new er(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new $t(0,0),this.repeat=new $t(1,1),this.center=new $t(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Gt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(lh).x}get height(){return this.source.getSize(lh).y}get depth(){return this.source.getSize(lh).z}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Dt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Dt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Vh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Oa:t.x=t.x-Math.floor(t.x);break;case zn:t.x=t.x<0?0:1;break;case ka:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Oa:t.y=t.y-Math.floor(t.y);break;case zn:t.y=t.y<0?0:1;break;case ka:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};tn.DEFAULT_IMAGE=null;tn.DEFAULT_MAPPING=Vh;tn.DEFAULT_ANISOTROPY=1;var Me=class i{constructor(t=0,e=0,n=0,s=1){i.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],h=l[4],d=l[8],u=l[1],p=l[5],m=l[9],v=l[2],g=l[6],f=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-v)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+v)<.1&&Math.abs(m+g)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let w=(c+1)/2,M=(p+1)/2,E=(f+1)/2,A=(h+u)/4,T=(d+v)/4,F=(m+g)/4;return w>M&&w>E?w<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(w),s=A/n,r=T/n):M>E?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=A/s,r=F/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=T/r,s=F/r),this.set(n,s,r,e),this}let _=Math.sqrt((g-m)*(g-m)+(d-v)*(d-v)+(u-h)*(u-h));return Math.abs(_)<.001&&(_=1),this.x=(g-m)/_,this.y=(d-v)/_,this.z=(u-h)/_,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Kt(this.x,t.x,e.x),this.y=Kt(this.y,t.y,e.y),this.z=Kt(this.z,t.z,e.z),this.w=Kt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Kt(this.x,t,e),this.y=Kt(this.y,t,e),this.z=Kt(this.z,t,e),this.w=Kt(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Kt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ha=class extends li{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Oe,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Me(0,0,t,e),this.scissorTest=!1,this.viewport=new Me(0,0,t,e);let s={width:t,height:e,depth:n.depth},r=new tn(s);this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(t={}){let e={minFilter:Oe,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new er(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},ke=class extends Ha{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Wr=class extends tn{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Te,this.minFilter=Te,this.wrapR=zn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Wa=class extends tn{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Te,this.minFilter=Te,this.wrapR=zn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Di=class{constructor(t=new H(1/0,1/0,1/0),e=new H(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Tn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Tn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Tn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Tn):Tn.fromBufferAttribute(r,o),Tn.applyMatrix4(t.matrixWorld),this.expandByPoint(Tn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),ma.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ma.copy(n.boundingBox)),ma.applyMatrix4(t.matrixWorld),this.union(ma)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Tn),Tn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Dr),ga.subVectors(this.max,Dr),Vs.subVectors(t.a,Dr),Gs.subVectors(t.b,Dr),Hs.subVectors(t.c,Dr),Ci.subVectors(Gs,Vs),Ti.subVectors(Hs,Gs),ns.subVectors(Vs,Hs);let e=[0,-Ci.z,Ci.y,0,-Ti.z,Ti.y,0,-ns.z,ns.y,Ci.z,0,-Ci.x,Ti.z,0,-Ti.x,ns.z,0,-ns.x,-Ci.y,Ci.x,0,-Ti.y,Ti.x,0,-ns.y,ns.x,0];return!ch(e,Vs,Gs,Hs,ga)||(e=[1,0,0,0,1,0,0,0,1],!ch(e,Vs,Gs,Hs,ga))?!1:(va.crossVectors(Ci,Ti),e=[va.x,va.y,va.z],ch(e,Vs,Gs,Hs,ga))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Tn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Tn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(ei[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),ei[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),ei[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),ei[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),ei[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),ei[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),ei[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),ei[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(ei),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},ei=[new H,new H,new H,new H,new H,new H,new H,new H],Tn=new H,ma=new Di,Vs=new H,Gs=new H,Hs=new H,Ci=new H,Ti=new H,ns=new H,Dr=new H,ga=new H,va=new H,is=new H;function ch(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){is.fromArray(i,r);let a=s.x*Math.abs(is.x)+s.y*Math.abs(is.y)+s.z*Math.abs(is.z),l=t.dot(is),c=e.dot(is),h=n.dot(is);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var uv=new Di,Br=new H,hh=new H,hs=class{constructor(t=new H,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):uv.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Br.subVectors(t,this.center);let e=Br.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Br,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(hh.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Br.copy(t.center).add(hh)),this.expandByPoint(Br.copy(t.center).sub(hh))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},ni=new H,uh=new H,_a=new H,Pi=new H,dh=new H,xa=new H,ph=new H,qr=class{constructor(t=new H,e=new H(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ni)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=ni.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ni.copy(this.origin).addScaledVector(this.direction,e),ni.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){uh.copy(t).add(e).multiplyScalar(.5),_a.copy(e).sub(t).normalize(),Pi.copy(this.origin).sub(uh);let r=t.distanceTo(e)*.5,o=-this.direction.dot(_a),a=Pi.dot(this.direction),l=-Pi.dot(_a),c=Pi.lengthSq(),h=Math.abs(1-o*o),d,u,p,m;if(h>0)if(d=o*l-a,u=o*a-l,m=r*h,d>=0)if(u>=-m)if(u<=m){let v=1/h;d*=v,u*=v,p=d*(d+o*u+2*a)+u*(o*d+u+2*l)+c}else u=r,d=Math.max(0,-(o*u+a)),p=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(o*u+a)),p=-d*d+u*(u+2*l)+c;else u<=-m?(d=Math.max(0,-(-o*r+a)),u=d>0?-r:Math.min(Math.max(-r,-l),r),p=-d*d+u*(u+2*l)+c):u<=m?(d=0,u=Math.min(Math.max(-r,-l),r),p=u*(u+2*l)+c):(d=Math.max(0,-(o*r+a)),u=d>0?r:Math.min(Math.max(-r,-l),r),p=-d*d+u*(u+2*l)+c);else u=o>0?-r:r,d=Math.max(0,-(o*u+a)),p=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(uh).addScaledVector(_a,u),p}intersectSphere(t,e){ni.subVectors(t.center,this.origin);let n=ni.dot(this.direction),s=ni.dot(ni)-n*n,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(n=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),h>=0?(r=(t.min.y-u.y)*h,o=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,o=(t.min.y-u.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(t.min.z-u.z)*d,l=(t.max.z-u.z)*d):(a=(t.max.z-u.z)*d,l=(t.min.z-u.z)*d),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,ni)!==null}intersectTriangle(t,e,n,s,r){dh.subVectors(e,t),xa.subVectors(n,t),ph.crossVectors(dh,xa);let o=this.direction.dot(ph),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Pi.subVectors(this.origin,t);let l=a*this.direction.dot(xa.crossVectors(Pi,xa));if(l<0)return null;let c=a*this.direction.dot(dh.cross(Pi));if(c<0||l+c>o)return null;let h=-a*Pi.dot(ph);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},we=class i{constructor(t,e,n,s,r,o,a,l,c,h,d,u,p,m,v,g){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,h,d,u,p,m,v,g)}set(t,e,n,s,r,o,a,l,c,h,d,u,p,m,v,g){let f=this.elements;return f[0]=t,f[4]=e,f[8]=n,f[12]=s,f[1]=r,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=h,f[10]=d,f[14]=u,f[3]=p,f[7]=m,f[11]=v,f[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinant()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinant()===0)return this.identity();let e=this.elements,n=t.elements,s=1/Ws.setFromMatrixColumn(t,0).length(),r=1/Ws.setFromMatrixColumn(t,1).length(),o=1/Ws.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let u=o*h,p=o*d,m=a*h,v=a*d;e[0]=l*h,e[4]=-l*d,e[8]=c,e[1]=p+m*c,e[5]=u-v*c,e[9]=-a*l,e[2]=v-u*c,e[6]=m+p*c,e[10]=o*l}else if(t.order==="YXZ"){let u=l*h,p=l*d,m=c*h,v=c*d;e[0]=u+v*a,e[4]=m*a-p,e[8]=o*c,e[1]=o*d,e[5]=o*h,e[9]=-a,e[2]=p*a-m,e[6]=v+u*a,e[10]=o*l}else if(t.order==="ZXY"){let u=l*h,p=l*d,m=c*h,v=c*d;e[0]=u-v*a,e[4]=-o*d,e[8]=m+p*a,e[1]=p+m*a,e[5]=o*h,e[9]=v-u*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let u=o*h,p=o*d,m=a*h,v=a*d;e[0]=l*h,e[4]=m*c-p,e[8]=u*c+v,e[1]=l*d,e[5]=v*c+u,e[9]=p*c-m,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let u=o*l,p=o*c,m=a*l,v=a*c;e[0]=l*h,e[4]=v-u*d,e[8]=m*d+p,e[1]=d,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=p*d+m,e[10]=u-v*d}else if(t.order==="XZY"){let u=o*l,p=o*c,m=a*l,v=a*c;e[0]=l*h,e[4]=-d,e[8]=c*h,e[1]=u*d+v,e[5]=o*h,e[9]=p*d-m,e[2]=m*d-p,e[6]=a*h,e[10]=v*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(dv,t,pv)}lookAt(t,e,n){let s=this.elements;return hn.subVectors(t,e),hn.lengthSq()===0&&(hn.z=1),hn.normalize(),Ri.crossVectors(n,hn),Ri.lengthSq()===0&&(Math.abs(n.z)===1?hn.x+=1e-4:hn.z+=1e-4,hn.normalize(),Ri.crossVectors(n,hn)),Ri.normalize(),ba.crossVectors(hn,Ri),s[0]=Ri.x,s[4]=ba.x,s[8]=hn.x,s[1]=Ri.y,s[5]=ba.y,s[9]=hn.y,s[2]=Ri.z,s[6]=ba.z,s[10]=hn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],p=n[13],m=n[2],v=n[6],g=n[10],f=n[14],_=n[3],w=n[7],M=n[11],E=n[15],A=s[0],T=s[4],F=s[8],x=s[12],y=s[1],P=s[5],N=s[9],R=s[13],D=s[2],O=s[6],L=s[10],G=s[14],q=s[3],Z=s[7],et=s[11],it=s[15];return r[0]=o*A+a*y+l*D+c*q,r[4]=o*T+a*P+l*O+c*Z,r[8]=o*F+a*N+l*L+c*et,r[12]=o*x+a*R+l*G+c*it,r[1]=h*A+d*y+u*D+p*q,r[5]=h*T+d*P+u*O+p*Z,r[9]=h*F+d*N+u*L+p*et,r[13]=h*x+d*R+u*G+p*it,r[2]=m*A+v*y+g*D+f*q,r[6]=m*T+v*P+g*O+f*Z,r[10]=m*F+v*N+g*L+f*et,r[14]=m*x+v*R+g*G+f*it,r[3]=_*A+w*y+M*D+E*q,r[7]=_*T+w*P+M*O+E*Z,r[11]=_*F+w*N+M*L+E*et,r[15]=_*x+w*R+M*G+E*it,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],d=t[6],u=t[10],p=t[14],m=t[3],v=t[7],g=t[11],f=t[15],_=l*p-c*u,w=a*p-c*d,M=a*u-l*d,E=o*p-c*h,A=o*u-l*h,T=o*d-a*h;return e*(v*_-g*w+f*M)-n*(m*_-g*E+f*A)+s*(m*w-v*E+f*T)-r*(m*M-v*A+g*T)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],d=t[9],u=t[10],p=t[11],m=t[12],v=t[13],g=t[14],f=t[15],_=d*g*c-v*u*c+v*l*p-a*g*p-d*l*f+a*u*f,w=m*u*c-h*g*c-m*l*p+o*g*p+h*l*f-o*u*f,M=h*v*c-m*d*c+m*a*p-o*v*p-h*a*f+o*d*f,E=m*d*l-h*v*l-m*a*u+o*v*u+h*a*g-o*d*g,A=e*_+n*w+s*M+r*E;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let T=1/A;return t[0]=_*T,t[1]=(v*u*r-d*g*r-v*s*p+n*g*p+d*s*f-n*u*f)*T,t[2]=(a*g*r-v*l*r+v*s*c-n*g*c-a*s*f+n*l*f)*T,t[3]=(d*l*r-a*u*r-d*s*c+n*u*c+a*s*p-n*l*p)*T,t[4]=w*T,t[5]=(h*g*r-m*u*r+m*s*p-e*g*p-h*s*f+e*u*f)*T,t[6]=(m*l*r-o*g*r-m*s*c+e*g*c+o*s*f-e*l*f)*T,t[7]=(o*u*r-h*l*r+h*s*c-e*u*c-o*s*p+e*l*p)*T,t[8]=M*T,t[9]=(m*d*r-h*v*r-m*n*p+e*v*p+h*n*f-e*d*f)*T,t[10]=(o*v*r-m*a*r+m*n*c-e*v*c-o*n*f+e*a*f)*T,t[11]=(h*a*r-o*d*r-h*n*c+e*d*c+o*n*p-e*a*p)*T,t[12]=E*T,t[13]=(h*v*s-m*d*s+m*n*u-e*v*u-h*n*g+e*d*g)*T,t[14]=(m*a*s-o*v*s-m*n*l+e*v*l+o*n*g-e*a*g)*T,t[15]=(o*d*s-h*a*s+h*n*l-e*d*l-o*n*u+e*a*u)*T,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,d=a+a,u=r*c,p=r*h,m=r*d,v=o*h,g=o*d,f=a*d,_=l*c,w=l*h,M=l*d,E=n.x,A=n.y,T=n.z;return s[0]=(1-(v+f))*E,s[1]=(p+M)*E,s[2]=(m-w)*E,s[3]=0,s[4]=(p-M)*A,s[5]=(1-(u+f))*A,s[6]=(g+_)*A,s[7]=0,s[8]=(m+w)*T,s[9]=(g-_)*T,s[10]=(1-(u+v))*T,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;if(t.x=s[12],t.y=s[13],t.z=s[14],this.determinant()===0)return n.set(1,1,1),e.identity(),this;let r=Ws.set(s[0],s[1],s[2]).length(),o=Ws.set(s[4],s[5],s[6]).length(),a=Ws.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),Pn.copy(this);let c=1/r,h=1/o,d=1/a;return Pn.elements[0]*=c,Pn.elements[1]*=c,Pn.elements[2]*=c,Pn.elements[4]*=h,Pn.elements[5]*=h,Pn.elements[6]*=h,Pn.elements[8]*=d,Pn.elements[9]*=d,Pn.elements[10]*=d,e.setFromRotationMatrix(Pn),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,s,r,o,a=In,l=!1){let c=this.elements,h=2*r/(e-t),d=2*r/(n-s),u=(e+t)/(e-t),p=(n+s)/(n-s),m,v;if(l)m=r/(o-r),v=o*r/(o-r);else if(a===In)m=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===Gr)m=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=In,l=!1){let c=this.elements,h=2/(e-t),d=2/(n-s),u=-(e+t)/(e-t),p=-(n+s)/(n-s),m,v;if(l)m=1/(o-r),v=o/(o-r);else if(a===In)m=-2/(o-r),v=-(o+r)/(o-r);else if(a===Gr)m=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=m,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},Ws=new H,Pn=new we,dv=new H(0,0,0),pv=new H(1,1,1),Ri=new H,ba=new H,hn=new H,hf=new we,uf=new Ye,Ln=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(Kt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Kt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Kt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Kt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Kt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-Kt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:Dt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return hf.makeRotationFromQuaternion(t),this.setFromRotationMatrix(hf,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return uf.setFromEuler(this),this.setFromQuaternion(uf,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ln.DEFAULT_ORDER="XYZ";var Xr=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},fv=0,df=new H,qs=new Ye,ii=new we,ya=new H,Ur=new H,mv=new H,gv=new Ye,pf=new H(1,0,0),ff=new H(0,1,0),mf=new H(0,0,1),gf={type:"added"},vv={type:"removed"},Xs={type:"childadded",child:null},fh={type:"childremoved",child:null},ze=class i extends li{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:fv++}),this.uuid=So(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new H,e=new Ln,n=new Ye,s=new H(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new we},normalMatrix:{value:new Gt}}),this.matrix=new we,this.matrixWorld=new we,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Xr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return qs.setFromAxisAngle(t,e),this.quaternion.multiply(qs),this}rotateOnWorldAxis(t,e){return qs.setFromAxisAngle(t,e),this.quaternion.premultiply(qs),this}rotateX(t){return this.rotateOnAxis(pf,t)}rotateY(t){return this.rotateOnAxis(ff,t)}rotateZ(t){return this.rotateOnAxis(mf,t)}translateOnAxis(t,e){return df.copy(t).applyQuaternion(this.quaternion),this.position.add(df.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(pf,t)}translateY(t){return this.translateOnAxis(ff,t)}translateZ(t){return this.translateOnAxis(mf,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ii.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?ya.copy(t):ya.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Ur.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ii.lookAt(Ur,ya,this.up):ii.lookAt(ya,Ur,this.up),this.quaternion.setFromRotationMatrix(ii),s&&(ii.extractRotation(s.matrixWorld),qs.setFromRotationMatrix(ii),this.quaternion.premultiply(qs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Nt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(gf),Xs.child=t,this.dispatchEvent(Xs),Xs.child=null):Nt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(vv),fh.child=t,this.dispatchEvent(fh),fh.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ii.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ii.multiply(t.parent.matrixWorld)),t.applyMatrix4(ii),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(gf),Xs.child=t,this.dispatchEvent(Xs),Xs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ur,t,mv),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ur,gv,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(t.shapes,d)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),d=o(t.shapes),u=o(t.skeletons),p=o(t.animations),m=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),p.length>0&&(n.animations=p),m.length>0&&(n.nodes=m)}return n.object=s,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};ze.DEFAULT_UP=new H(0,1,0);ze.DEFAULT_MATRIX_AUTO_UPDATE=!0;ze.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Rn=new H,si=new H,mh=new H,ri=new H,Ys=new H,js=new H,vf=new H,gh=new H,vh=new H,_h=new H,xh=new Me,bh=new Me,yh=new Me,Fi=class i{constructor(t=new H,e=new H,n=new H){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Rn.subVectors(t,e),s.cross(Rn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Rn.subVectors(s,e),si.subVectors(n,e),mh.subVectors(t,e);let o=Rn.dot(Rn),a=Rn.dot(si),l=Rn.dot(mh),c=si.dot(si),h=si.dot(mh),d=o*c-a*a;if(d===0)return r.set(0,0,0),null;let u=1/d,p=(c*l-a*h)*u,m=(o*h-a*l)*u;return r.set(1-p-m,m,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,ri)===null?!1:ri.x>=0&&ri.y>=0&&ri.x+ri.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,ri)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ri.x),l.addScaledVector(o,ri.y),l.addScaledVector(a,ri.z),l)}static getInterpolatedAttribute(t,e,n,s,r,o){return xh.setScalar(0),bh.setScalar(0),yh.setScalar(0),xh.fromBufferAttribute(t,e),bh.fromBufferAttribute(t,n),yh.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(xh,r.x),o.addScaledVector(bh,r.y),o.addScaledVector(yh,r.z),o}static isFrontFacing(t,e,n,s){return Rn.subVectors(n,e),si.subVectors(t,e),Rn.cross(si).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Rn.subVectors(this.c,this.b),si.subVectors(this.a,this.b),Rn.cross(si).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,o,a;Ys.subVectors(s,n),js.subVectors(r,n),gh.subVectors(t,n);let l=Ys.dot(gh),c=js.dot(gh);if(l<=0&&c<=0)return e.copy(n);vh.subVectors(t,s);let h=Ys.dot(vh),d=js.dot(vh);if(h>=0&&d<=h)return e.copy(s);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(Ys,o);_h.subVectors(t,r);let p=Ys.dot(_h),m=js.dot(_h);if(m>=0&&p<=m)return e.copy(r);let v=p*c-l*m;if(v<=0&&c>=0&&m<=0)return a=c/(c-m),e.copy(n).addScaledVector(js,a);let g=h*m-p*d;if(g<=0&&d-h>=0&&p-m>=0)return vf.subVectors(r,s),a=(d-h)/(d-h+(p-m)),e.copy(s).addScaledVector(vf,a);let f=1/(g+v+u);return o=v*f,a=u*f,e.copy(n).addScaledVector(Ys,o).addScaledVector(js,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},om={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ii={h:0,s:0,l:0},wa={h:0,s:0,l:0};function wh(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Ut=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=dn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Zt.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=Zt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Zt.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=Zt.workingColorSpace){if(t=av(t,1),e=Kt(e,0,1),n=Kt(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=wh(o,r,t+1/3),this.g=wh(o,r,t),this.b=wh(o,r,t-1/3)}return Zt.colorSpaceToWorking(this,s),this}setStyle(t,e=dn){function n(r){r!==void 0&&parseFloat(r)<1&&Dt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Dt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);Dt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=dn){let n=om[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Dt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=oi(t.r),this.g=oi(t.g),this.b=oi(t.b),this}copyLinearToSRGB(t){return this.r=Js(t.r),this.g=Js(t.g),this.b=Js(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=dn){return Zt.workingToColorSpace(He.copy(this),t),Math.round(Kt(He.r*255,0,255))*65536+Math.round(Kt(He.g*255,0,255))*256+Math.round(Kt(He.b*255,0,255))}getHexString(t=dn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Zt.workingColorSpace){Zt.workingToColorSpace(He.copy(this),e);let n=He.r,s=He.g,r=He.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let d=o-a;switch(c=h<=.5?d/(o+a):d/(2-o-a),o){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=Zt.workingColorSpace){return Zt.workingToColorSpace(He.copy(this),e),t.r=He.r,t.g=He.g,t.b=He.b,t}getStyle(t=dn){Zt.workingToColorSpace(He.copy(this),t);let e=He.r,n=He.g,s=He.b;return t!==dn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Ii),this.setHSL(Ii.h+t,Ii.s+e,Ii.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Ii),t.getHSL(wa);let n=sh(Ii.h,wa.h,e),s=sh(Ii.s,wa.s,e),r=sh(Ii.l,wa.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},He=new Ut;Ut.NAMES=om;var _v=0,ci=class extends li{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_v++}),this.uuid=So(),this.name="",this.type="Material",this.blending=as,this.side=ai,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ba,this.blendDst=Ua,this.blendEquation=Ni,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ut(0,0,0),this.blendAlpha=0,this.depthFunc=ls,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ih,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=os,this.stencilZFail=os,this.stencilZPass=os,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Dt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Dt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==as&&(n.blending=this.blending),this.side!==ai&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Ba&&(n.blendSrc=this.blendSrc),this.blendDst!==Ua&&(n.blendDst=this.blendDst),this.blendEquation!==Ni&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ls&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Ih&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==os&&(n.stencilFail=this.stencilFail),this.stencilZFail!==os&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==os&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},hi=class extends ci{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ut(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ln,this.combine=zh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var Re=new H,Ma=new $t,xv=0,pn=class{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:xv++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Lh,this.updateRanges=[],this.gpuType=Dn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Ma.fromBufferAttribute(this,e),Ma.applyMatrix3(t),this.setXY(e,Ma.x,Ma.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Re.fromBufferAttribute(this,e),Re.applyMatrix3(t),this.setXYZ(e,Re.x,Re.y,Re.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Re.fromBufferAttribute(this,e),Re.applyMatrix4(t),this.setXYZ(e,Re.x,Re.y,Re.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Re.fromBufferAttribute(this,e),Re.applyNormalMatrix(t),this.setXYZ(e,Re.x,Re.y,Re.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Re.fromBufferAttribute(this,e),Re.transformDirection(t),this.setXYZ(e,Re.x,Re.y,Re.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Nr(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Qe(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Nr(e,this.array)),e}setX(t,e){return this.normalized&&(e=Qe(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Nr(e,this.array)),e}setY(t,e){return this.normalized&&(e=Qe(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Nr(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Qe(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Nr(e,this.array)),e}setW(t,e){return this.normalized&&(e=Qe(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Qe(e,this.array),n=Qe(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Qe(e,this.array),n=Qe(n,this.array),s=Qe(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Qe(e,this.array),n=Qe(n,this.array),s=Qe(s,this.array),r=Qe(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Lh&&(t.usage=this.usage),t}};var Yr=class extends pn{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var jr=class extends pn{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var Qt=class extends pn{constructor(t,e,n){super(new Float32Array(t),e,n)}},bv=0,yn=new we,Mh=new ze,$s=new H,un=new Di,Or=new Di,De=new H,Pe=class i extends li{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:bv++}),this.uuid=So(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Jh(t)?jr:Yr)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Gt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return yn.makeRotationFromQuaternion(t),this.applyMatrix4(yn),this}rotateX(t){return yn.makeRotationX(t),this.applyMatrix4(yn),this}rotateY(t){return yn.makeRotationY(t),this.applyMatrix4(yn),this}rotateZ(t){return yn.makeRotationZ(t),this.applyMatrix4(yn),this}translate(t,e,n){return yn.makeTranslation(t,e,n),this.applyMatrix4(yn),this}scale(t,e,n){return yn.makeScale(t,e,n),this.applyMatrix4(yn),this}lookAt(t){return Mh.lookAt(t),Mh.updateMatrix(),this.applyMatrix4(Mh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter($s).negate(),this.translate($s.x,$s.y,$s.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Qt(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Dt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Di);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Nt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new H(-1/0,-1/0,-1/0),new H(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];un.setFromBufferAttribute(r),this.morphTargetsRelative?(De.addVectors(this.boundingBox.min,un.min),this.boundingBox.expandByPoint(De),De.addVectors(this.boundingBox.max,un.max),this.boundingBox.expandByPoint(De)):(this.boundingBox.expandByPoint(un.min),this.boundingBox.expandByPoint(un.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Nt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new hs);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Nt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new H,1/0);return}if(t){let n=this.boundingSphere.center;if(un.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];Or.setFromBufferAttribute(a),this.morphTargetsRelative?(De.addVectors(un.min,Or.min),un.expandByPoint(De),De.addVectors(un.max,Or.max),un.expandByPoint(De)):(un.expandByPoint(Or.min),un.expandByPoint(Or.max))}un.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)De.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(De));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)De.fromBufferAttribute(a,c),l&&($s.fromBufferAttribute(t,c),De.add($s)),s=Math.max(s,n.distanceToSquared(De))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Nt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Nt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new pn(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let F=0;F<n.count;F++)a[F]=new H,l[F]=new H;let c=new H,h=new H,d=new H,u=new $t,p=new $t,m=new $t,v=new H,g=new H;function f(F,x,y){c.fromBufferAttribute(n,F),h.fromBufferAttribute(n,x),d.fromBufferAttribute(n,y),u.fromBufferAttribute(r,F),p.fromBufferAttribute(r,x),m.fromBufferAttribute(r,y),h.sub(c),d.sub(c),p.sub(u),m.sub(u);let P=1/(p.x*m.y-m.x*p.y);isFinite(P)&&(v.copy(h).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(P),g.copy(d).multiplyScalar(p.x).addScaledVector(h,-m.x).multiplyScalar(P),a[F].add(v),a[x].add(v),a[y].add(v),l[F].add(g),l[x].add(g),l[y].add(g))}let _=this.groups;_.length===0&&(_=[{start:0,count:t.count}]);for(let F=0,x=_.length;F<x;++F){let y=_[F],P=y.start,N=y.count;for(let R=P,D=P+N;R<D;R+=3)f(t.getX(R+0),t.getX(R+1),t.getX(R+2))}let w=new H,M=new H,E=new H,A=new H;function T(F){E.fromBufferAttribute(s,F),A.copy(E);let x=a[F];w.copy(x),w.sub(E.multiplyScalar(E.dot(x))).normalize(),M.crossVectors(A,x);let P=M.dot(l[F])<0?-1:1;o.setXYZW(F,w.x,w.y,w.z,P)}for(let F=0,x=_.length;F<x;++F){let y=_[F],P=y.start,N=y.count;for(let R=P,D=P+N;R<D;R+=3)T(t.getX(R+0)),T(t.getX(R+1)),T(t.getX(R+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new pn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,p=n.count;u<p;u++)n.setXYZ(u,0,0,0);let s=new H,r=new H,o=new H,a=new H,l=new H,c=new H,h=new H,d=new H;if(t)for(let u=0,p=t.count;u<p;u+=3){let m=t.getX(u+0),v=t.getX(u+1),g=t.getX(u+2);s.fromBufferAttribute(e,m),r.fromBufferAttribute(e,v),o.fromBufferAttribute(e,g),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),a.fromBufferAttribute(n,m),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,g),a.add(h),l.add(h),c.add(h),n.setXYZ(m,a.x,a.y,a.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let u=0,p=e.count;u<p;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),o.fromBufferAttribute(e,u+2),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)De.fromBufferAttribute(t,e),De.normalize(),t.setXYZ(e,De.x,De.y,De.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,d=a.normalized,u=new c.constructor(l.length*h),p=0,m=0;for(let v=0,g=l.length;v<g;v++){a.isInterleavedBufferAttribute?p=l[v]*a.data.stride+a.offset:p=l[v]*h;for(let f=0;f<h;f++)u[m++]=c[p++]}return new pn(u,h,d)}if(this.index===null)return Dt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=t(l,n);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,d=c.length;h<d;h++){let u=c[h],p=t(u,n);l.push(p)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let p=c[d];h.push(p.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],d=r[c];for(let u=0,p=d.length;u<p;u++)h.push(d[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},_f=new we,ss=new qr,Sa=new hs,xf=new H,Ea=new H,Aa=new H,Ca=new H,Sh=new H,Ta=new H,bf=new H,Pa=new H,me=class extends ze{constructor(t=new Pe,e=new hi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){Ta.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],d=r[l];h!==0&&(Sh.fromBufferAttribute(d,t),o?Ta.addScaledVector(Sh,h):Ta.addScaledVector(Sh.sub(e),h))}e.add(Ta)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Sa.copy(n.boundingSphere),Sa.applyMatrix4(r),ss.copy(t.ray).recast(t.near),!(Sa.containsPoint(ss.origin)===!1&&(ss.intersectSphere(Sa,xf)===null||ss.origin.distanceToSquared(xf)>(t.far-t.near)**2))&&(_f.copy(r).invert(),ss.copy(t.ray).applyMatrix4(_f),!(n.boundingBox!==null&&ss.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,ss)))}_computeIntersections(t,e,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,v=u.length;m<v;m++){let g=u[m],f=o[g.materialIndex],_=Math.max(g.start,p.start),w=Math.min(a.count,Math.min(g.start+g.count,p.start+p.count));for(let M=_,E=w;M<E;M+=3){let A=a.getX(M),T=a.getX(M+1),F=a.getX(M+2);s=Ra(this,f,t,n,c,h,d,A,T,F),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let m=Math.max(0,p.start),v=Math.min(a.count,p.start+p.count);for(let g=m,f=v;g<f;g+=3){let _=a.getX(g),w=a.getX(g+1),M=a.getX(g+2);s=Ra(this,o,t,n,c,h,d,_,w,M),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,v=u.length;m<v;m++){let g=u[m],f=o[g.materialIndex],_=Math.max(g.start,p.start),w=Math.min(l.count,Math.min(g.start+g.count,p.start+p.count));for(let M=_,E=w;M<E;M+=3){let A=M,T=M+1,F=M+2;s=Ra(this,f,t,n,c,h,d,A,T,F),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let m=Math.max(0,p.start),v=Math.min(l.count,p.start+p.count);for(let g=m,f=v;g<f;g+=3){let _=g,w=g+1,M=g+2;s=Ra(this,o,t,n,c,h,d,_,w,M),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}}};function yv(i,t,e,n,s,r,o,a){let l;if(t.side===Ve?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===ai,a),l===null)return null;Pa.copy(a),Pa.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Pa);return c<e.near||c>e.far?null:{distance:c,point:Pa.clone(),object:i}}function Ra(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,Ea),i.getVertexPosition(l,Aa),i.getVertexPosition(c,Ca);let h=yv(i,t,e,n,Ea,Aa,Ca,bf);if(h){let d=new H;Fi.getBarycoord(bf,Ea,Aa,Ca,d),s&&(h.uv=Fi.getInterpolatedAttribute(s,a,l,c,d,new $t)),r&&(h.uv1=Fi.getInterpolatedAttribute(r,a,l,c,d,new $t)),o&&(h.normal=Fi.getInterpolatedAttribute(o,a,l,c,d,new H),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a,b:l,c,normal:new H,materialIndex:0};Fi.getNormal(Ea,Aa,Ca,u.normal),h.face=u,h.barycoord=d}return h}var nr=class i extends Pe{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],d=[],u=0,p=0;m("z","y","x",-1,-1,n,e,t,o,r,0),m("z","y","x",1,-1,n,e,-t,o,r,1),m("x","z","y",1,1,t,n,e,s,o,2),m("x","z","y",1,-1,t,n,-e,s,o,3),m("x","y","z",1,-1,t,e,n,s,r,4),m("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Qt(c,3)),this.setAttribute("normal",new Qt(h,3)),this.setAttribute("uv",new Qt(d,2));function m(v,g,f,_,w,M,E,A,T,F,x){let y=M/T,P=E/F,N=M/2,R=E/2,D=A/2,O=T+1,L=F+1,G=0,q=0,Z=new H;for(let et=0;et<L;et++){let it=et*P-R;for(let nt=0;nt<O;nt++){let _t=nt*y-N;Z[v]=_t*_,Z[g]=it*w,Z[f]=D,c.push(Z.x,Z.y,Z.z),Z[v]=0,Z[g]=0,Z[f]=A>0?1:-1,h.push(Z.x,Z.y,Z.z),d.push(nt/T),d.push(1-et/F),G+=1}}for(let et=0;et<F;et++)for(let it=0;it<T;it++){let nt=u+it+O*et,_t=u+it+O*(et+1),Bt=u+(it+1)+O*(et+1),Lt=u+(it+1)+O*et;l.push(nt,_t,Lt),l.push(_t,Bt,Lt),q+=6}a.addGroup(p,q,x),p+=q,u+=G}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function _s(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(Dt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function qe(i){let t={};for(let e=0;e<i.length;e++){let n=_s(i[e]);for(let s in n)t[s]=n[s]}return t}function wv(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function tu(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Zt.workingColorSpace}var Hi={clone:_s,merge:qe},Mv=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Sv=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Be=class extends ci{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mv,this.fragmentShader=Sv,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=_s(t.uniforms),this.uniformsGroups=wv(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}},$r=class extends ze{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new we,this.projectionMatrix=new we,this.projectionMatrixInverse=new we,this.coordinateSystem=In,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Li=new H,yf=new $t,wf=new $t,We=class extends $r{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Va*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(ih*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Va*2*Math.atan(Math.tan(ih*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Li.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Li.x,Li.y).multiplyScalar(-t/Li.z),Li.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Li.x,Li.y).multiplyScalar(-t/Li.z)}getViewSize(t,e){return this.getViewBounds(t,yf,wf),e.subVectors(wf,yf)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(ih*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Zs=-90,Ks=1,qa=class extends ze{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new We(Zs,Ks,t,e);s.layers=this.layers,this.add(s);let r=new We(Zs,Ks,t,e);r.layers=this.layers,this.add(r);let o=new We(Zs,Ks,t,e);o.layers=this.layers,this.add(o);let a=new We(Zs,Ks,t,e);a.layers=this.layers,this.add(a);let l=new We(Zs,Ks,t,e);l.layers=this.layers,this.add(l);let c=new We(Zs,Ks,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===In)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Gr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,o),t.setRenderTarget(n,2,s),t.render(e,a),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(d,u,p),t.xr.enabled=m,n.texture.needsPMREMUpdate=!0}},Zr=class extends tn{constructor(t=[],e=zi,n,s,r,o,a,l,c,h){super(t,e,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Kr=class extends ke{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Zr(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new nr(5,5,5),r=new Be({name:"CubemapFromEquirect",uniforms:_s(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ve,blending:en});r.uniforms.tEquirect.value=e;let o=new me(s,r),a=e.minFilter;return e.minFilter===Vi&&(e.minFilter=Oe),new qa(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}},Vn=class extends ze{constructor(){super(),this.isGroup=!0,this.type="Group"}},Ev={type:"move"},ir=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Vn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Vn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new H,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new H),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Vn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new H,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new H),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let v of t.hand.values()){let g=e.getJointPose(v,n),f=this._getHandJoint(c,v);g!==null&&(f.matrix.fromArray(g.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=g.radius),f.visible=g!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),p=.02,m=.005;c.inputState.pinching&&u>p+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=p-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Ev)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Vn;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}};var Jr=class i{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ut(t),this.near=e,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Qr=class extends ze{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ln,this.environmentIntensity=1,this.environmentRotation=new Ln,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}};var Xa=class extends tn{constructor(t=null,e=1,n=1,s,r,o,a,l,c=Te,h=Te,d,u){super(null,o,a,l,c,h,s,r,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Eh=new H,Av=new H,Cv=new Gt,kn=class{constructor(t=new H(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=Eh.subVectors(n,e).cross(Av.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let n=t.delta(Eh),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Cv.getNormalMatrix(t),s=this.coplanarPoint(Eh).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},rs=new hs,Tv=new $t(.5,.5),Ia=new H,sr=class{constructor(t=new kn,e=new kn,n=new kn,s=new kn,r=new kn,o=new kn){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=In,n=!1){let s=this.planes,r=t.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],p=r[7],m=r[8],v=r[9],g=r[10],f=r[11],_=r[12],w=r[13],M=r[14],E=r[15];if(s[0].setComponents(c-o,p-h,f-m,E-_).normalize(),s[1].setComponents(c+o,p+h,f+m,E+_).normalize(),s[2].setComponents(c+a,p+d,f+v,E+w).normalize(),s[3].setComponents(c-a,p-d,f-v,E-w).normalize(),n)s[4].setComponents(l,u,g,M).normalize(),s[5].setComponents(c-l,p-u,f-g,E-M).normalize();else if(s[4].setComponents(c-l,p-u,f-g,E-M).normalize(),e===In)s[5].setComponents(c+l,p+u,f+g,E+M).normalize();else if(e===Gr)s[5].setComponents(l,u,g,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),rs.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),rs.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(rs)}intersectsSprite(t){rs.center.set(0,0,0);let e=Tv.distanceTo(t.center);return rs.radius=.7071067811865476+e,rs.applyMatrix4(t.matrixWorld),this.intersectsSphere(rs)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(Ia.x=s.normal.x>0?t.max.x:t.min.x,Ia.y=s.normal.y>0?t.max.y:t.min.y,Ia.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Ia)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var rr=class extends ci{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ut(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},Ya=new H,ja=new H,Mf=new we,kr=new qr,La=new hs,Ah=new H,Sf=new H,us=class extends ze{constructor(t=new Pe,e=new rr){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Ya.fromBufferAttribute(e,s-1),ja.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Ya.distanceTo(ja);t.setAttribute("lineDistance",new Qt(n,1))}else Dt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),La.copy(n.boundingSphere),La.applyMatrix4(s),La.radius+=r,t.ray.intersectsSphere(La)===!1)return;Mf.copy(s).invert(),kr.copy(t.ray).applyMatrix4(Mf);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,u=n.attributes.position;if(h!==null){let p=Math.max(0,o.start),m=Math.min(h.count,o.start+o.count);for(let v=p,g=m-1;v<g;v+=c){let f=h.getX(v),_=h.getX(v+1),w=Fa(this,t,kr,l,f,_,v);w&&e.push(w)}if(this.isLineLoop){let v=h.getX(m-1),g=h.getX(p),f=Fa(this,t,kr,l,v,g,m-1);f&&e.push(f)}}else{let p=Math.max(0,o.start),m=Math.min(u.count,o.start+o.count);for(let v=p,g=m-1;v<g;v+=c){let f=Fa(this,t,kr,l,v,v+1,v);f&&e.push(f)}if(this.isLineLoop){let v=Fa(this,t,kr,l,m-1,p,m-1);v&&e.push(v)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Fa(i,t,e,n,s,r,o){let a=i.geometry.attributes.position;if(Ya.fromBufferAttribute(a,s),ja.fromBufferAttribute(a,r),e.distanceSqToSegment(Ya,ja,Ah,Sf)>n)return;Ah.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Ah);if(!(c<t.near||c>t.far))return{distance:c,point:Sf.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}var Bi=class extends tn{constructor(t,e,n=Nn,s,r,o,a=Te,l=Te,c,h=Gn,d=1){if(h!==Gn&&h!==Gi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:d};super(u,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new er(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},$a=class extends Bi{constructor(t,e=Nn,n=zi,s,r,o=Te,a=Te,l,c=Gn){let h={width:t,height:t,depth:1},d=[h,h,h,h,h,h];super(t,t,e,n,s,r,o,a,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},to=class extends tn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}};var eo=class i extends Pe{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],o=[],a=[],l=[],c=new H,h=new $t;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let d=0,u=3;d<=e;d++,u+=3){let p=n+d/e*s;c.x=t*Math.cos(p),c.y=t*Math.sin(p),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[u]/t+1)/2,h.y=(o[u+1]/t+1)/2,l.push(h.x,h.y)}for(let d=1;d<=e;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new Qt(o,3)),this.setAttribute("normal",new Qt(a,3)),this.setAttribute("uv",new Qt(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},ds=class i extends Pe{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],d=[],u=[],p=[],m=0,v=[],g=n/2,f=0;_(),o===!1&&(t>0&&w(!0),e>0&&w(!1)),this.setIndex(h),this.setAttribute("position",new Qt(d,3)),this.setAttribute("normal",new Qt(u,3)),this.setAttribute("uv",new Qt(p,2));function _(){let M=new H,E=new H,A=0,T=(e-t)/n;for(let F=0;F<=r;F++){let x=[],y=F/r,P=y*(e-t)+t;for(let N=0;N<=s;N++){let R=N/s,D=R*l+a,O=Math.sin(D),L=Math.cos(D);E.x=P*O,E.y=-y*n+g,E.z=P*L,d.push(E.x,E.y,E.z),M.set(O,T,L).normalize(),u.push(M.x,M.y,M.z),p.push(R,1-y),x.push(m++)}v.push(x)}for(let F=0;F<s;F++)for(let x=0;x<r;x++){let y=v[x][F],P=v[x+1][F],N=v[x+1][F+1],R=v[x][F+1];(t>0||x!==0)&&(h.push(y,P,R),A+=3),(e>0||x!==r-1)&&(h.push(P,N,R),A+=3)}c.addGroup(f,A,0),f+=A}function w(M){let E=m,A=new $t,T=new H,F=0,x=M===!0?t:e,y=M===!0?1:-1;for(let N=1;N<=s;N++)d.push(0,g*y,0),u.push(0,y,0),p.push(.5,.5),m++;let P=m;for(let N=0;N<=s;N++){let D=N/s*l+a,O=Math.cos(D),L=Math.sin(D);T.x=x*L,T.y=g*y,T.z=x*O,d.push(T.x,T.y,T.z),u.push(0,y,0),A.x=O*.5+.5,A.y=L*.5*y+.5,p.push(A.x,A.y),m++}for(let N=0;N<s;N++){let R=E+N,D=P+N;M===!0?h.push(D,D+1,R):h.push(D+1,D,R),F+=3}c.addGroup(f,F,M===!0?1:2),f+=F}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},no=class i extends ds{constructor(t=1,e=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var ps=class i extends Pe{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,d=t/a,u=e/l,p=[],m=[],v=[],g=[];for(let f=0;f<h;f++){let _=f*u-o;for(let w=0;w<c;w++){let M=w*d-r;m.push(M,-_,0),v.push(0,0,1),g.push(w/a),g.push(1-f/l)}}for(let f=0;f<l;f++)for(let _=0;_<a;_++){let w=_+c*f,M=_+c*(f+1),E=_+1+c*(f+1),A=_+1+c*f;p.push(w,M,A),p.push(M,E,A)}this.setIndex(p),this.setAttribute("position",new Qt(m,3)),this.setAttribute("normal",new Qt(v,3)),this.setAttribute("uv",new Qt(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var fs=class i extends Pe{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,h=[],d=new H,u=new H,p=[],m=[],v=[],g=[];for(let f=0;f<=n;f++){let _=[],w=f/n,M=0;f===0&&o===0?M=.5/e:f===n&&l===Math.PI&&(M=-.5/e);for(let E=0;E<=e;E++){let A=E/e;d.x=-t*Math.cos(s+A*r)*Math.sin(o+w*a),d.y=t*Math.cos(o+w*a),d.z=t*Math.sin(s+A*r)*Math.sin(o+w*a),m.push(d.x,d.y,d.z),u.copy(d).normalize(),v.push(u.x,u.y,u.z),g.push(A+M,1-w),_.push(c++)}h.push(_)}for(let f=0;f<n;f++)for(let _=0;_<e;_++){let w=h[f][_+1],M=h[f][_],E=h[f+1][_],A=h[f+1][_+1];(f!==0||o>0)&&p.push(w,M,A),(f!==n-1||l<Math.PI)&&p.push(M,E,A)}this.setIndex(p),this.setAttribute("position",new Qt(m,3)),this.setAttribute("normal",new Qt(v,3)),this.setAttribute("uv",new Qt(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var io=class i extends Pe{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);let o=[],a=[],l=[],c=[],h=new H,d=new H,u=new H;for(let p=0;p<=n;p++)for(let m=0;m<=s;m++){let v=m/s*r,g=p/n*Math.PI*2;d.x=(t+e*Math.cos(g))*Math.cos(v),d.y=(t+e*Math.cos(g))*Math.sin(v),d.z=e*Math.sin(g),a.push(d.x,d.y,d.z),h.x=t*Math.cos(v),h.y=t*Math.sin(v),u.subVectors(d,h).normalize(),l.push(u.x,u.y,u.z),c.push(m/s),c.push(p/n)}for(let p=1;p<=n;p++)for(let m=1;m<=s;m++){let v=(s+1)*p+m-1,g=(s+1)*(p-1)+m-1,f=(s+1)*(p-1)+m,_=(s+1)*p+m;o.push(v,g,_),o.push(g,f,_)}this.setIndex(o),this.setAttribute("position",new Qt(a,3)),this.setAttribute("normal",new Qt(l,3)),this.setAttribute("uv",new Qt(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};var or=class extends Be{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},ui=class extends ci{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ut(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ut(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Zh,this.normalScale=new $t(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ln,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var ar=class extends ci{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Zf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Za=class extends ci{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Na(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}var ms=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<s)){for(let a=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=e[++n],t<s)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Ka=class extends ms{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Th,endingEnd:Th}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ph:r=t,a=2*e-n;break;case Rh:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ph:o=t,l=2*n-e;break;case Rh:o=1,l=n+s[1]-s[0];break;default:o=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,p=this._weightNext,m=(n-e)/(s-e),v=m*m,g=v*m,f=-u*g+2*u*v-u*m,_=(1+u)*g+(-1.5-2*u)*v+(-.5+u)*m+1,w=(-1-p)*g+(1.5+p)*v+.5*m,M=p*g-p*v;for(let E=0;E!==a;++E)r[E]=f*o[h+E]+_*o[c+E]+w*o[l+E]+M*o[d+E];return r}},Ja=class extends ms{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(n-e)/(s-e),d=1-h;for(let u=0;u!==a;++u)r[u]=o[c+u]*d+o[l+u]*h;return r}},Qa=class extends ms{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},fn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Na(e,this.TimeBufferType),this.values=Na(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Na(t.times,Array),values:Na(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Qa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Ja(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Ka(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case zr:e=this.InterpolantFactoryMethodDiscrete;break;case za:e=this.InterpolantFactoryMethodLinear;break;case Da:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Dt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return zr;case this.InterpolantFactoryMethodLinear:return za;case this.InterpolantFactoryMethodSmooth:return Da}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Nt("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Nt("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){Nt("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){Nt("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(s!==void 0&&ov(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){Nt("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Da,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(s)l=!0;else{let d=a*n,u=d-n,p=d+n;for(let m=0;m!==n;++m){let v=e[d+m];if(v!==e[u+m]||v!==e[p+m]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let d=a*n,u=o*n;for(let p=0;p!==n;++p)e[u+p]=e[d+p]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};fn.prototype.ValueTypeName="";fn.prototype.TimeBufferType=Float32Array;fn.prototype.ValueBufferType=Float32Array;fn.prototype.DefaultInterpolation=za;var Ui=class extends fn{constructor(t,e,n){super(t,e,n)}};Ui.prototype.ValueTypeName="bool";Ui.prototype.ValueBufferType=Array;Ui.prototype.DefaultInterpolation=zr;Ui.prototype.InterpolantFactoryMethodLinear=void 0;Ui.prototype.InterpolantFactoryMethodSmooth=void 0;var tl=class extends fn{constructor(t,e,n,s){super(t,e,n,s)}};tl.prototype.ValueTypeName="color";var el=class extends fn{constructor(t,e,n,s){super(t,e,n,s)}};el.prototype.ValueTypeName="number";var nl=class extends ms{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-e)/(s-e),c=t*a;for(let h=c+a;c!==h;c+=4)Ye.slerpFlat(r,0,o,c-a,o,c,l);return r}},so=class extends fn{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new nl(this.times,this.values,this.getValueSize(),t)}};so.prototype.ValueTypeName="quaternion";so.prototype.InterpolantFactoryMethodSmooth=void 0;var Oi=class extends fn{constructor(t,e,n){super(t,e,n)}};Oi.prototype.ValueTypeName="string";Oi.prototype.ValueBufferType=Array;Oi.prototype.DefaultInterpolation=zr;Oi.prototype.InterpolantFactoryMethodLinear=void 0;Oi.prototype.InterpolantFactoryMethodSmooth=void 0;var il=class extends fn{constructor(t,e,n,s){super(t,e,n,s)}};il.prototype.ValueTypeName="vector";var sl=class{constructor(t,e,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let p=c[d],m=c[d+1];if(p.global&&(p.lastIndex=0),p.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},am=new sl,rl=class{constructor(t){this.manager=t!==void 0?t:am,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};rl.DEFAULT_MATERIAL_NAME="__DEFAULT";var lr=class extends ze{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Ut(t),this.intensity=e}dispose(){this.dispatchEvent({type:"dispose"})}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},ro=class extends lr{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ze.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ut(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Ch=new we,Ef=new H,Af=new H,Fh=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new $t(512,512),this.mapType=nn,this.map=null,this.mapPass=null,this.matrix=new we,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new sr,this._frameExtents=new $t(1,1),this._viewportCount=1,this._viewports=[new Me(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;Ef.setFromMatrixPosition(t.matrixWorld),e.position.copy(Ef),Af.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Af),e.updateMatrixWorld(),Ch.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ch,e.coordinateSystem,e.reversedDepth),e.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ch)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}};var ki=class extends $r{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Nh=class extends Fh{constructor(){super(new ki(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},oo=class extends lr{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ze.DEFAULT_UP),this.updateMatrix(),this.target=new ze,this.shadow=new Nh}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}},ao=class extends lr{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}};var ol=class extends We{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}},lo=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=performance.now();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}};var eu="\\[\\]\\.:\\/",Pv=new RegExp("["+eu+"]","g"),nu="[^"+eu+"]",Rv="[^"+eu.replace("\\.","")+"]",Iv=/((?:WC+[\/:])*)/.source.replace("WC",nu),Lv=/(WCOD+)?/.source.replace("WCOD",Rv),Fv=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",nu),Nv=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",nu),Dv=new RegExp("^"+Iv+Lv+Fv+Nv+"$"),Bv=["material","materials","bones","map"],Dh=class{constructor(t,e,n){let s=n||ve.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},ve=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Pv,"")}static parseTrackName(t){let e=Dv.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Bv.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=n(a.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Dt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){Nt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Nt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Nt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Nt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Nt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Nt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Nt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[s];if(o===void 0){let c=e.nodeName;Nt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Nt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Nt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ve.Composite=Dh;ve.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ve.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ve.prototype.GetterByBindingType=[ve.prototype._getValue_direct,ve.prototype._getValue_array,ve.prototype._getValue_arrayElement,ve.prototype._getValue_toArray];ve.prototype.SetterByBindingTypeAndVersioning=[[ve.prototype._setValue_direct,ve.prototype._setValue_direct_setNeedsUpdate,ve.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ve.prototype._setValue_array,ve.prototype._setValue_array_setNeedsUpdate,ve.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ve.prototype._setValue_arrayElement,ve.prototype._setValue_arrayElement_setNeedsUpdate,ve.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ve.prototype._setValue_fromArray,ve.prototype._setValue_fromArray_setNeedsUpdate,ve.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var _C=new Float32Array(1);function iu(i,t,e,n){let s=Uv(n);switch(e){case Xh:return i*t;case jh:return i*t/s.components*s.byteLength;case yl:return i*t/s.components*s.byteLength;case vs:return i*t*2/s.components*s.byteLength;case wl:return i*t*2/s.components*s.byteLength;case Yh:return i*t*3/s.components*s.byteLength;case wn:return i*t*4/s.components*s.byteLength;case Ml:return i*t*4/s.components*s.byteLength;case bo:case yo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case wo:case Mo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case El:case Cl:return Math.max(i,16)*Math.max(t,8)/4;case Sl:case Al:return Math.max(i,8)*Math.max(t,8)/2;case Tl:case Pl:case Il:case Ll:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Rl:case Fl:case Nl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Dl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Bl:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Ul:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ol:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case kl:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case zl:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Vl:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Gl:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Hl:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Wl:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case ql:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Xl:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Yl:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case jl:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case $l:case Zl:case Kl:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Jl:case Ql:return Math.ceil(i/4)*Math.ceil(t/4)*8;case tc:case ec:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Uv(i){switch(i){case nn:case Gh:return{byteLength:1,components:1};case hr:case Hh:case sn:return{byteLength:2,components:1};case xl:case bl:return{byteLength:2,components:4};case Nn:case _l:case Dn:return{byteLength:4,components:1};case Wh:case qh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"182"}}));typeof window<"u"&&(window.__THREE__?Dt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="182");function Rm(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function kv(i){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,d=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,h),a.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,l,c){let h=l.array,d=l.updateRanges;if(i.bindBuffer(c,a),d.length===0)i.bufferSubData(c,0,h);else{d.sort((p,m)=>p.start-m.start);let u=0;for(let p=1;p<d.length;p++){let m=d[u],v=d[p];v.start<=m.start+m.count+1?m.count=Math.max(m.count,v.start+v.count-m.start):(++u,d[u]=v)}d.length=u+1;for(let p=0,m=d.length;p<m;p++){let v=d[p];i.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var zv=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Vv=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Gv=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Hv=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Wv=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,qv=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Xv=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Yv=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,jv=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,$v=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Zv=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Kv=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Jv=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Qv=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,t_=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,e_=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,n_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,i_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,s_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,r_=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,o_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,a_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,l_=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,c_=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,h_=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,u_=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,d_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,p_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,f_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,m_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,g_="gl_FragColor = linearToOutputTexel( gl_FragColor );",v_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,__=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,x_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,b_=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,y_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,w_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,M_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,S_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,E_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,A_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,C_=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,T_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,P_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,R_=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,I_=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,L_=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,F_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,N_=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,D_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,B_=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,U_=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,O_=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( vec3( 1.0 ) - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,k_=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,z_=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,V_=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,G_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,H_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,W_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,q_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,X_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Y_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,j_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,$_=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Z_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,K_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,J_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Q_=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,tx=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ex=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,nx=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ix=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,sx=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,rx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ox=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ax=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,lx=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,cx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,hx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ux=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,dx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,px=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,fx=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,mx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,gx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,vx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,_x=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,xx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,bx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,yx=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 0, 5, phi ).x + bitangent * vogelDiskSample( 0, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 1, 5, phi ).x + bitangent * vogelDiskSample( 1, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 2, 5, phi ).x + bitangent * vogelDiskSample( 2, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 3, 5, phi ).x + bitangent * vogelDiskSample( 3, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 4, 5, phi ).x + bitangent * vogelDiskSample( 4, 5, phi ).y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadow = step( depth, dp );
			#else
				shadow = step( dp, depth );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,wx=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Mx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Sx=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Ex=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ax=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Cx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Tx=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Px=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Rx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Ix=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Lx=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Fx=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Nx=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Dx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Bx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ux=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Ox=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,kx=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,zx=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Vx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Gx=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Wx=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,qx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Xx=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Yx=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,jx=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,$x=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Zx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kx=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Jx=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Qx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,tb=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,eb=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,nb=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ib=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,sb=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rb=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ob=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,ab=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,lb=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cb=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,hb=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ub=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,db=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pb=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,fb=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,mb=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gb=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,vb=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,_b=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qt={alphahash_fragment:zv,alphahash_pars_fragment:Vv,alphamap_fragment:Gv,alphamap_pars_fragment:Hv,alphatest_fragment:Wv,alphatest_pars_fragment:qv,aomap_fragment:Xv,aomap_pars_fragment:Yv,batching_pars_vertex:jv,batching_vertex:$v,begin_vertex:Zv,beginnormal_vertex:Kv,bsdfs:Jv,iridescence_fragment:Qv,bumpmap_pars_fragment:t_,clipping_planes_fragment:e_,clipping_planes_pars_fragment:n_,clipping_planes_pars_vertex:i_,clipping_planes_vertex:s_,color_fragment:r_,color_pars_fragment:o_,color_pars_vertex:a_,color_vertex:l_,common:c_,cube_uv_reflection_fragment:h_,defaultnormal_vertex:u_,displacementmap_pars_vertex:d_,displacementmap_vertex:p_,emissivemap_fragment:f_,emissivemap_pars_fragment:m_,colorspace_fragment:g_,colorspace_pars_fragment:v_,envmap_fragment:__,envmap_common_pars_fragment:x_,envmap_pars_fragment:b_,envmap_pars_vertex:y_,envmap_physical_pars_fragment:L_,envmap_vertex:w_,fog_vertex:M_,fog_pars_vertex:S_,fog_fragment:E_,fog_pars_fragment:A_,gradientmap_pars_fragment:C_,lightmap_pars_fragment:T_,lights_lambert_fragment:P_,lights_lambert_pars_fragment:R_,lights_pars_begin:I_,lights_toon_fragment:F_,lights_toon_pars_fragment:N_,lights_phong_fragment:D_,lights_phong_pars_fragment:B_,lights_physical_fragment:U_,lights_physical_pars_fragment:O_,lights_fragment_begin:k_,lights_fragment_maps:z_,lights_fragment_end:V_,logdepthbuf_fragment:G_,logdepthbuf_pars_fragment:H_,logdepthbuf_pars_vertex:W_,logdepthbuf_vertex:q_,map_fragment:X_,map_pars_fragment:Y_,map_particle_fragment:j_,map_particle_pars_fragment:$_,metalnessmap_fragment:Z_,metalnessmap_pars_fragment:K_,morphinstance_vertex:J_,morphcolor_vertex:Q_,morphnormal_vertex:tx,morphtarget_pars_vertex:ex,morphtarget_vertex:nx,normal_fragment_begin:ix,normal_fragment_maps:sx,normal_pars_fragment:rx,normal_pars_vertex:ox,normal_vertex:ax,normalmap_pars_fragment:lx,clearcoat_normal_fragment_begin:cx,clearcoat_normal_fragment_maps:hx,clearcoat_pars_fragment:ux,iridescence_pars_fragment:dx,opaque_fragment:px,packing:fx,premultiplied_alpha_fragment:mx,project_vertex:gx,dithering_fragment:vx,dithering_pars_fragment:_x,roughnessmap_fragment:xx,roughnessmap_pars_fragment:bx,shadowmap_pars_fragment:yx,shadowmap_pars_vertex:wx,shadowmap_vertex:Mx,shadowmask_pars_fragment:Sx,skinbase_vertex:Ex,skinning_pars_vertex:Ax,skinning_vertex:Cx,skinnormal_vertex:Tx,specularmap_fragment:Px,specularmap_pars_fragment:Rx,tonemapping_fragment:Ix,tonemapping_pars_fragment:Lx,transmission_fragment:Fx,transmission_pars_fragment:Nx,uv_pars_fragment:Dx,uv_pars_vertex:Bx,uv_vertex:Ux,worldpos_vertex:Ox,background_vert:kx,background_frag:zx,backgroundCube_vert:Vx,backgroundCube_frag:Gx,cube_vert:Hx,cube_frag:Wx,depth_vert:qx,depth_frag:Xx,distance_vert:Yx,distance_frag:jx,equirect_vert:$x,equirect_frag:Zx,linedashed_vert:Kx,linedashed_frag:Jx,meshbasic_vert:Qx,meshbasic_frag:tb,meshlambert_vert:eb,meshlambert_frag:nb,meshmatcap_vert:ib,meshmatcap_frag:sb,meshnormal_vert:rb,meshnormal_frag:ob,meshphong_vert:ab,meshphong_frag:lb,meshphysical_vert:cb,meshphysical_frag:hb,meshtoon_vert:ub,meshtoon_frag:db,points_vert:pb,points_frag:fb,shadow_vert:mb,shadow_frag:gb,sprite_vert:vb,sprite_frag:_b},pt={common:{diffuse:{value:new Ut(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Gt},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Gt}},envmap:{envMap:{value:null},envMapRotation:{value:new Gt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Gt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Gt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Gt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Gt},normalScale:{value:new $t(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Gt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Gt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Gt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Gt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ut(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ut(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0},uvTransform:{value:new Gt}},sprite:{diffuse:{value:new Ut(16777215)},opacity:{value:1},center:{value:new $t(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Gt},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0}}},qn={basic:{uniforms:qe([pt.common,pt.specularmap,pt.envmap,pt.aomap,pt.lightmap,pt.fog]),vertexShader:qt.meshbasic_vert,fragmentShader:qt.meshbasic_frag},lambert:{uniforms:qe([pt.common,pt.specularmap,pt.envmap,pt.aomap,pt.lightmap,pt.emissivemap,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.fog,pt.lights,{emissive:{value:new Ut(0)}}]),vertexShader:qt.meshlambert_vert,fragmentShader:qt.meshlambert_frag},phong:{uniforms:qe([pt.common,pt.specularmap,pt.envmap,pt.aomap,pt.lightmap,pt.emissivemap,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.fog,pt.lights,{emissive:{value:new Ut(0)},specular:{value:new Ut(1118481)},shininess:{value:30}}]),vertexShader:qt.meshphong_vert,fragmentShader:qt.meshphong_frag},standard:{uniforms:qe([pt.common,pt.envmap,pt.aomap,pt.lightmap,pt.emissivemap,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.roughnessmap,pt.metalnessmap,pt.fog,pt.lights,{emissive:{value:new Ut(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag},toon:{uniforms:qe([pt.common,pt.aomap,pt.lightmap,pt.emissivemap,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.gradientmap,pt.fog,pt.lights,{emissive:{value:new Ut(0)}}]),vertexShader:qt.meshtoon_vert,fragmentShader:qt.meshtoon_frag},matcap:{uniforms:qe([pt.common,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.fog,{matcap:{value:null}}]),vertexShader:qt.meshmatcap_vert,fragmentShader:qt.meshmatcap_frag},points:{uniforms:qe([pt.points,pt.fog]),vertexShader:qt.points_vert,fragmentShader:qt.points_frag},dashed:{uniforms:qe([pt.common,pt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qt.linedashed_vert,fragmentShader:qt.linedashed_frag},depth:{uniforms:qe([pt.common,pt.displacementmap]),vertexShader:qt.depth_vert,fragmentShader:qt.depth_frag},normal:{uniforms:qe([pt.common,pt.bumpmap,pt.normalmap,pt.displacementmap,{opacity:{value:1}}]),vertexShader:qt.meshnormal_vert,fragmentShader:qt.meshnormal_frag},sprite:{uniforms:qe([pt.sprite,pt.fog]),vertexShader:qt.sprite_vert,fragmentShader:qt.sprite_frag},background:{uniforms:{uvTransform:{value:new Gt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qt.background_vert,fragmentShader:qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Gt}},vertexShader:qt.backgroundCube_vert,fragmentShader:qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qt.cube_vert,fragmentShader:qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qt.equirect_vert,fragmentShader:qt.equirect_frag},distance:{uniforms:qe([pt.common,pt.displacementmap,{referencePosition:{value:new H},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qt.distance_vert,fragmentShader:qt.distance_frag},shadow:{uniforms:qe([pt.lights,pt.fog,{color:{value:new Ut(0)},opacity:{value:1}}]),vertexShader:qt.shadow_vert,fragmentShader:qt.shadow_frag}};qn.physical={uniforms:qe([qn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Gt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Gt},clearcoatNormalScale:{value:new $t(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Gt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Gt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Gt},sheen:{value:0},sheenColor:{value:new Ut(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Gt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Gt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Gt},transmissionSamplerSize:{value:new $t},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Gt},attenuationDistance:{value:0},attenuationColor:{value:new Ut(0)},specularColor:{value:new Ut(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Gt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Gt},anisotropyVector:{value:new $t},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Gt}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag};var sc={r:0,b:0,g:0},xs=new Ln,xb=new we;function bb(i,t,e,n,s,r,o){let a=new Ut(0),l=r===!0?0:1,c,h,d=null,u=0,p=null;function m(w){let M=w.isScene===!0?w.background:null;return M&&M.isTexture&&(M=(w.backgroundBlurriness>0?e:t).get(M)),M}function v(w){let M=!1,E=m(w);E===null?f(a,l):E&&E.isColor&&(f(E,1),M=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function g(w,M){let E=m(M);E&&(E.isCubeTexture||E.mapping===_o)?(h===void 0&&(h=new me(new nr(1,1,1),new Be({name:"BackgroundCubeMaterial",uniforms:_s(qn.backgroundCube.uniforms),vertexShader:qn.backgroundCube.vertexShader,fragmentShader:qn.backgroundCube.fragmentShader,side:Ve,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(A,T,F){this.matrixWorld.copyPosition(F.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),xs.copy(M.backgroundRotation),xs.x*=-1,xs.y*=-1,xs.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(xs.y*=-1,xs.z*=-1),h.material.uniforms.envMap.value=E,h.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(xb.makeRotationFromEuler(xs)),h.material.toneMapped=Zt.getTransfer(E.colorSpace)!==ne,(d!==E||u!==E.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,d=E,u=E.version,p=i.toneMapping),h.layers.enableAll(),w.unshift(h,h.geometry,h.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new me(new ps(2,2),new Be({name:"BackgroundMaterial",uniforms:_s(qn.background.uniforms),vertexShader:qn.background.vertexShader,fragmentShader:qn.background.fragmentShader,side:ai,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=Zt.getTransfer(E.colorSpace)!==ne,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(d!==E||u!==E.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,d=E,u=E.version,p=i.toneMapping),c.layers.enableAll(),w.unshift(c,c.geometry,c.material,0,0,null))}function f(w,M){w.getRGB(sc,tu(i)),n.buffers.color.setClear(sc.r,sc.g,sc.b,M,o)}function _(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(w,M=1){a.set(w),l=M,f(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(w){l=w,f(a,l)},render:v,addToRenderList:g,dispose:_}}function yb(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,o=!1;function a(y,P,N,R,D){let O=!1,L=d(R,N,P);r!==L&&(r=L,c(r.object)),O=p(y,R,N,D),O&&m(y,R,N,D),D!==null&&t.update(D,i.ELEMENT_ARRAY_BUFFER),(O||o)&&(o=!1,M(y,P,N,R),D!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(D).buffer))}function l(){return i.createVertexArray()}function c(y){return i.bindVertexArray(y)}function h(y){return i.deleteVertexArray(y)}function d(y,P,N){let R=N.wireframe===!0,D=n[y.id];D===void 0&&(D={},n[y.id]=D);let O=D[P.id];O===void 0&&(O={},D[P.id]=O);let L=O[R];return L===void 0&&(L=u(l()),O[R]=L),L}function u(y){let P=[],N=[],R=[];for(let D=0;D<e;D++)P[D]=0,N[D]=0,R[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:N,attributeDivisors:R,object:y,attributes:{},index:null}}function p(y,P,N,R){let D=r.attributes,O=P.attributes,L=0,G=N.getAttributes();for(let q in G)if(G[q].location>=0){let et=D[q],it=O[q];if(it===void 0&&(q==="instanceMatrix"&&y.instanceMatrix&&(it=y.instanceMatrix),q==="instanceColor"&&y.instanceColor&&(it=y.instanceColor)),et===void 0||et.attribute!==it||it&&et.data!==it.data)return!0;L++}return r.attributesNum!==L||r.index!==R}function m(y,P,N,R){let D={},O=P.attributes,L=0,G=N.getAttributes();for(let q in G)if(G[q].location>=0){let et=O[q];et===void 0&&(q==="instanceMatrix"&&y.instanceMatrix&&(et=y.instanceMatrix),q==="instanceColor"&&y.instanceColor&&(et=y.instanceColor));let it={};it.attribute=et,et&&et.data&&(it.data=et.data),D[q]=it,L++}r.attributes=D,r.attributesNum=L,r.index=R}function v(){let y=r.newAttributes;for(let P=0,N=y.length;P<N;P++)y[P]=0}function g(y){f(y,0)}function f(y,P){let N=r.newAttributes,R=r.enabledAttributes,D=r.attributeDivisors;N[y]=1,R[y]===0&&(i.enableVertexAttribArray(y),R[y]=1),D[y]!==P&&(i.vertexAttribDivisor(y,P),D[y]=P)}function _(){let y=r.newAttributes,P=r.enabledAttributes;for(let N=0,R=P.length;N<R;N++)P[N]!==y[N]&&(i.disableVertexAttribArray(N),P[N]=0)}function w(y,P,N,R,D,O,L){L===!0?i.vertexAttribIPointer(y,P,N,D,O):i.vertexAttribPointer(y,P,N,R,D,O)}function M(y,P,N,R){v();let D=R.attributes,O=N.getAttributes(),L=P.defaultAttributeValues;for(let G in O){let q=O[G];if(q.location>=0){let Z=D[G];if(Z===void 0&&(G==="instanceMatrix"&&y.instanceMatrix&&(Z=y.instanceMatrix),G==="instanceColor"&&y.instanceColor&&(Z=y.instanceColor)),Z!==void 0){let et=Z.normalized,it=Z.itemSize,nt=t.get(Z);if(nt===void 0)continue;let _t=nt.buffer,Bt=nt.type,Lt=nt.bytesPerElement,$=Bt===i.INT||Bt===i.UNSIGNED_INT||Z.gpuType===_l;if(Z.isInterleavedBufferAttribute){let J=Z.data,ft=J.stride,Tt=Z.offset;if(J.isInstancedInterleavedBuffer){for(let gt=0;gt<q.locationSize;gt++)f(q.location+gt,J.meshPerAttribute);y.isInstancedMesh!==!0&&R._maxInstanceCount===void 0&&(R._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let gt=0;gt<q.locationSize;gt++)g(q.location+gt);i.bindBuffer(i.ARRAY_BUFFER,_t);for(let gt=0;gt<q.locationSize;gt++)w(q.location+gt,it/q.locationSize,Bt,et,ft*Lt,(Tt+it/q.locationSize*gt)*Lt,$)}else{if(Z.isInstancedBufferAttribute){for(let J=0;J<q.locationSize;J++)f(q.location+J,Z.meshPerAttribute);y.isInstancedMesh!==!0&&R._maxInstanceCount===void 0&&(R._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let J=0;J<q.locationSize;J++)g(q.location+J);i.bindBuffer(i.ARRAY_BUFFER,_t);for(let J=0;J<q.locationSize;J++)w(q.location+J,it/q.locationSize,Bt,et,it*Lt,it/q.locationSize*J*Lt,$)}}else if(L!==void 0){let et=L[G];if(et!==void 0)switch(et.length){case 2:i.vertexAttrib2fv(q.location,et);break;case 3:i.vertexAttrib3fv(q.location,et);break;case 4:i.vertexAttrib4fv(q.location,et);break;default:i.vertexAttrib1fv(q.location,et)}}}}_()}function E(){F();for(let y in n){let P=n[y];for(let N in P){let R=P[N];for(let D in R)h(R[D].object),delete R[D];delete P[N]}delete n[y]}}function A(y){if(n[y.id]===void 0)return;let P=n[y.id];for(let N in P){let R=P[N];for(let D in R)h(R[D].object),delete R[D];delete P[N]}delete n[y.id]}function T(y){for(let P in n){let N=n[P];if(N[y.id]===void 0)continue;let R=N[y.id];for(let D in R)h(R[D].object),delete R[D];delete N[y.id]}}function F(){x(),o=!0,r!==s&&(r=s,c(r.object))}function x(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:F,resetDefaultState:x,dispose:E,releaseStatesOfGeometry:A,releaseStatesOfProgram:T,initAttributes:v,enableAttribute:g,disableUnusedAttributes:_}}function wb(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function o(c,h,d){d!==0&&(i.drawArraysInstanced(n,c,h,d),e.update(h,n,d))}function a(c,h,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,d);let p=0;for(let m=0;m<d;m++)p+=h[m];e.update(p,n,1)}function l(c,h,d,u){if(d===0)return;let p=t.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<c.length;m++)o(c[m],h[m],u[m]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,u,0,d);let m=0;for(let v=0;v<d;v++)m+=h[v]*u[v];e.update(m,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Mb(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let T=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(T){return!(T!==wn&&n.convert(T)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(T){let F=T===sn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(T!==nn&&n.convert(T)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&T!==Dn&&!F)}function l(T){if(T==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Dt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),m=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),f=i.getParameter(i.MAX_VERTEX_ATTRIBS),_=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),w=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=i.getParameter(i.MAX_SAMPLES),A=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:p,maxVertexTextures:m,maxTextureSize:v,maxCubemapSize:g,maxAttributes:f,maxVertexUniforms:_,maxVaryings:w,maxFragmentUniforms:M,maxSamples:E,samples:A}}function Sb(i){let t=this,e=null,n=0,s=!1,r=!1,o=new kn,a=new Gt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let p=d.length!==0||u||n!==0||s;return s=u,n=d.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,p){let m=d.clippingPlanes,v=d.clipIntersection,g=d.clipShadows,f=i.get(d);if(!s||m===null||m.length===0||r&&!g)r?h(null):c();else{let _=r?0:n,w=_*4,M=f.clippingState||null;l.value=M,M=h(m,u,w,p);for(let E=0;E!==w;++E)M[E]=e[E];f.clippingState=M,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(d,u,p,m){let v=d!==null?d.length:0,g=null;if(v!==0){if(g=l.value,m!==!0||g===null){let f=p+v*4,_=u.matrixWorldInverse;a.getNormalMatrix(_),(g===null||g.length<f)&&(g=new Float32Array(f));for(let w=0,M=p;w!==v;++w,M+=4)o.copy(d[w]).applyMatrix4(_,a),o.normal.toArray(g,M),g[M+3]=o.constant}l.value=g,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,g}}function Eb(i){let t=new WeakMap;function e(o,a){return a===ml?o.mapping=zi:a===gl&&(o.mapping=gs),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===ml||a===gl)if(t.has(o)){let l=t.get(o).texture;return e(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Kr(l.height);return c.fromEquirectangularTexture(i,o),t.set(o,c),o.addEventListener("dispose",s),e(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}var Wi=4,lm=[.125,.215,.35,.446,.526,.582],ys=20,Ab=256,Eo=new ki,cm=new Ut,su=null,ru=0,ou=0,au=!1,Cb=new H,oc=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:o=256,position:a=Cb}=r;su=this._renderer.getRenderTarget(),ru=this._renderer.getActiveCubeFace(),ou=this._renderer.getActiveMipmapLevel(),au=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=dm(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=um(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(su,ru,ou),this._renderer.xr.enabled=au,t.scissorTest=!1,dr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===zi||t.mapping===gs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),su=this._renderer.getRenderTarget(),ru=this._renderer.getActiveCubeFace(),ou=this._renderer.getActiveMipmapLevel(),au=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Oe,minFilter:Oe,generateMipmaps:!1,type:sn,format:wn,colorSpace:cs,depthBuffer:!1},s=hm(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=hm(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Tb(r)),this._blurMaterial=Rb(r,t,e),this._ggxMaterial=Pb(r,t,e)}return s}_compileMaterial(t){let e=new me(new Pe,t);this._renderer.compile(e,Eo)}_sceneToCubeUV(t,e,n,s,r){let l=new We(90,1,e,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,p=d.toneMapping;d.getClearColor(cm),d.toneMapping=Fn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new me(new nr,new hi({name:"PMREM.Background",side:Ve,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,g=v.material,f=!1,_=t.background;_?_.isColor&&(g.color.copy(_),t.background=null,f=!0):(g.color.copy(cm),f=!0);for(let w=0;w<6;w++){let M=w%3;M===0?(l.up.set(0,c[w],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[w],r.y,r.z)):M===1?(l.up.set(0,0,c[w]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[w],r.z)):(l.up.set(0,c[w],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[w]));let E=this._cubeSize;dr(s,M*E,w>2?E:0,E,E),d.setRenderTarget(s),f&&d.render(v,l),d.render(t,l)}d.toneMapping=p,d.autoClear=u,t.background=_}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===zi||t.mapping===gs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=dm()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=um());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let l=this._cubeSize;dr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,Eo)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let l=o.uniforms,c=n/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=0+c*1.25,p=d*u,{_lodMax:m}=this,v=this._sizeLods[n],g=3*v*(n>m-Wi?n-m+Wi:0),f=4*(this._cubeSize-v);l.envMap.value=t.texture,l.roughness.value=p,l.mipInt.value=m-e,dr(r,g,f,3*v,2*v),s.setRenderTarget(r),s.render(a,Eo),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-n,dr(t,g,f,3*v,2*v),s.setRenderTarget(t),s.render(a,Eo)}_blur(t,e,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&Nt("blur direction must be either latitudinal or longitudinal!");let h=3,d=this._lodMeshes[s];d.material=c;let u=c.uniforms,p=this._sizeLods[n]-1,m=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*ys-1),v=r/m,g=isFinite(r)?1+Math.floor(h*v):ys;g>ys&&Dt(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${ys}`);let f=[],_=0;for(let T=0;T<ys;++T){let F=T/v,x=Math.exp(-F*F/2);f.push(x),T===0?_+=x:T<g&&(_+=2*x)}for(let T=0;T<f.length;T++)f[T]=f[T]/_;u.envMap.value=t.texture,u.samples.value=g,u.weights.value=f,u.latitudinal.value=o==="latitudinal",a&&(u.poleAxis.value=a);let{_lodMax:w}=this;u.dTheta.value=m,u.mipInt.value=w-n;let M=this._sizeLods[s],E=3*M*(s>w-Wi?s-w+Wi:0),A=4*(this._cubeSize-M);dr(e,E,A,3*M,2*M),l.setRenderTarget(e),l.render(d,Eo)}};function Tb(i){let t=[],e=[],n=[],s=i,r=i-Wi+1+lm.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>i-Wi?l=lm[o-i+Wi-1]:o===0&&(l=0),e.push(l);let c=1/(a-2),h=-c,d=1+c,u=[h,h,d,h,d,d,h,h,d,d,h,d],p=6,m=6,v=3,g=2,f=1,_=new Float32Array(v*m*p),w=new Float32Array(g*m*p),M=new Float32Array(f*m*p);for(let A=0;A<p;A++){let T=A%3*2/3-1,F=A>2?0:-1,x=[T,F,0,T+2/3,F,0,T+2/3,F+1,0,T,F,0,T+2/3,F+1,0,T,F+1,0];_.set(x,v*m*A),w.set(u,g*m*A);let y=[A,A,A,A,A,A];M.set(y,f*m*A)}let E=new Pe;E.setAttribute("position",new pn(_,v)),E.setAttribute("uv",new pn(w,g)),E.setAttribute("faceIndex",new pn(M,f)),n.push(new me(E,null)),s>Wi&&s--}return{lodMeshes:n,sizeLods:t,sigmas:e}}function hm(i,t,e){let n=new ke(i,t,e);return n.texture.mapping=_o,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function dr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Pb(i,t,e){return new Be({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Ab,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:lc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:en,depthTest:!1,depthWrite:!1})}function Rb(i,t,e){let n=new Float32Array(ys),s=new H(0,1,0);return new Be({name:"SphericalGaussianBlur",defines:{n:ys,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:lc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:en,depthTest:!1,depthWrite:!1})}function um(){return new Be({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:lc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:en,depthTest:!1,depthWrite:!1})}function dm(){return new Be({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:lc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:en,depthTest:!1,depthWrite:!1})}function lc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Ib(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===ml||l===gl,h=l===zi||l===gs;if(c||h){let d=t.get(a),u=d!==void 0?d.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==u)return e===null&&(e=new oc(i)),d=c?e.fromEquirectangular(a,d):e.fromCubemap(a,d),d.texture.pmremVersion=a.pmremVersion,t.set(a,d),d.texture;if(d!==void 0)return d.texture;{let p=a.image;return c&&p&&p.height>0||h&&p&&s(p)?(e===null&&(e=new oc(i)),d=c?e.fromEquirectangular(a):e.fromCubemap(a),d.texture.pmremVersion=a.pmremVersion,t.set(a,d),a.addEventListener("dispose",r),d.texture):null}}}return a}function s(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function Lb(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&tr("WebGLRenderer: "+n+" extension not supported."),s}}}function Fb(i,t,e,n){let s={},r=new WeakMap;function o(d){let u=d.target;u.index!==null&&t.remove(u.index);for(let m in u.attributes)t.remove(u.attributes[m]);u.removeEventListener("dispose",o),delete s[u.id];let p=r.get(u);p&&(t.remove(p),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function a(d,u){return s[u.id]===!0||(u.addEventListener("dispose",o),s[u.id]=!0,e.memory.geometries++),u}function l(d){let u=d.attributes;for(let p in u)t.update(u[p],i.ARRAY_BUFFER)}function c(d){let u=[],p=d.index,m=d.attributes.position,v=0;if(p!==null){let _=p.array;v=p.version;for(let w=0,M=_.length;w<M;w+=3){let E=_[w+0],A=_[w+1],T=_[w+2];u.push(E,A,A,T,T,E)}}else if(m!==void 0){let _=m.array;v=m.version;for(let w=0,M=_.length/3-1;w<M;w+=3){let E=w+0,A=w+1,T=w+2;u.push(E,A,A,T,T,E)}}else return;let g=new(Jh(u)?jr:Yr)(u,1);g.version=v;let f=r.get(d);f&&t.remove(f),r.set(d,g)}function h(d){let u=r.get(d);if(u){let p=d.index;p!==null&&u.version<p.version&&c(d)}else c(d);return r.get(d)}return{get:a,update:l,getWireframeAttribute:h}}function Nb(i,t,e){let n;function s(u){n=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function l(u,p){i.drawElements(n,p,r,u*o),e.update(p,n,1)}function c(u,p,m){m!==0&&(i.drawElementsInstanced(n,p,r,u*o,m),e.update(p,n,m))}function h(u,p,m){if(m===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,u,0,m);let g=0;for(let f=0;f<m;f++)g+=p[f];e.update(g,n,1)}function d(u,p,m,v){if(m===0)return;let g=t.get("WEBGL_multi_draw");if(g===null)for(let f=0;f<u.length;f++)c(u[f]/o,p[f],v[f]);else{g.multiDrawElementsInstancedWEBGL(n,p,0,r,u,0,v,0,m);let f=0;for(let _=0;_<m;_++)f+=p[_]*v[_];e.update(f,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=d}function Db(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:Nt("WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Bb(i,t,e){let n=new WeakMap,s=new Me;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0,u=n.get(a);if(u===void 0||u.count!==d){let x=function(){T.dispose(),n.delete(a),a.removeEventListener("dispose",x)};u!==void 0&&u.texture.dispose();let p=a.morphAttributes.position!==void 0,m=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],f=a.morphAttributes.normal||[],_=a.morphAttributes.color||[],w=0;p===!0&&(w=1),m===!0&&(w=2),v===!0&&(w=3);let M=a.attributes.position.count*w,E=1;M>t.maxTextureSize&&(E=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);let A=new Float32Array(M*E*4*d),T=new Wr(A,M,E,d);T.type=Dn,T.needsUpdate=!0;let F=w*4;for(let y=0;y<d;y++){let P=g[y],N=f[y],R=_[y],D=M*E*4*y;for(let O=0;O<P.count;O++){let L=O*F;p===!0&&(s.fromBufferAttribute(P,O),A[D+L+0]=s.x,A[D+L+1]=s.y,A[D+L+2]=s.z,A[D+L+3]=0),m===!0&&(s.fromBufferAttribute(N,O),A[D+L+4]=s.x,A[D+L+5]=s.y,A[D+L+6]=s.z,A[D+L+7]=0),v===!0&&(s.fromBufferAttribute(R,O),A[D+L+8]=s.x,A[D+L+9]=s.y,A[D+L+10]=s.z,A[D+L+11]=R.itemSize===4?s.w:1)}}u={count:d,texture:T,size:new $t(M,E)},n.set(a,u),a.addEventListener("dispose",x)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let p=0;for(let v=0;v<c.length;v++)p+=c[v];let m=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",m),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function Ub(i,t,e,n){let s=new WeakMap;function r(l){let c=n.render.frame,h=l.geometry,d=t.get(l,h);if(s.get(d)!==c&&(t.update(d),s.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let u=l.skeleton;s.get(u)!==c&&(u.update(),s.set(u,c))}return d}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}var Ob={[ho]:"LINEAR_TONE_MAPPING",[uo]:"REINHARD_TONE_MAPPING",[po]:"CINEON_TONE_MAPPING",[fo]:"ACES_FILMIC_TONE_MAPPING",[go]:"AGX_TONE_MAPPING",[vo]:"NEUTRAL_TONE_MAPPING",[mo]:"CUSTOM_TONE_MAPPING"};function kb(i,t,e,n,s){let r=new ke(t,e,{type:i,depthBuffer:n,stencilBuffer:s}),o=new ke(t,e,{type:sn,depthBuffer:!1,stencilBuffer:!1}),a=new Pe;a.setAttribute("position",new Qt([-1,3,0,-1,-1,0,3,-1,0],3)),a.setAttribute("uv",new Qt([0,2,0,0,2,0],2));let l=new or({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),c=new me(a,l),h=new ki(-1,1,1,-1,0,1),d=null,u=null,p=!1,m,v=null,g=[],f=!1;this.setSize=function(_,w){r.setSize(_,w),o.setSize(_,w);for(let M=0;M<g.length;M++){let E=g[M];E.setSize&&E.setSize(_,w)}},this.setEffects=function(_){g=_,f=g.length>0&&g[0].isRenderPass===!0;let w=r.width,M=r.height;for(let E=0;E<g.length;E++){let A=g[E];A.setSize&&A.setSize(w,M)}},this.begin=function(_,w){if(p||_.toneMapping===Fn&&g.length===0)return!1;if(v=w,w!==null){let M=w.width,E=w.height;(r.width!==M||r.height!==E)&&this.setSize(M,E)}return f===!1&&_.setRenderTarget(r),m=_.toneMapping,_.toneMapping=Fn,!0},this.hasRenderPass=function(){return f},this.end=function(_,w){_.toneMapping=m,p=!0;let M=r,E=o;for(let A=0;A<g.length;A++){let T=g[A];if(T.enabled!==!1&&(T.render(_,E,M,w),T.needsSwap!==!1)){let F=M;M=E,E=F}}if(d!==_.outputColorSpace||u!==_.toneMapping){d=_.outputColorSpace,u=_.toneMapping,l.defines={},Zt.getTransfer(d)===ne&&(l.defines.SRGB_TRANSFER="");let A=Ob[u];A&&(l.defines[A]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=M.texture,_.setRenderTarget(v),_.render(c,h),v=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){r.dispose(),o.dispose(),a.dispose(),l.dispose()}}var Im=new tn,hu=new Bi(1,1),Lm=new Wr,Fm=new Wa,Nm=new Zr,pm=[],fm=[],mm=new Float32Array(16),gm=new Float32Array(9),vm=new Float32Array(4);function fr(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=pm[s];if(r===void 0&&(r=new Float32Array(s),pm[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Ie(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Le(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function cc(i,t){let e=fm[t];e===void 0&&(e=new Int32Array(t),fm[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function zb(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Vb(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ie(e,t))return;i.uniform2fv(this.addr,t),Le(e,t)}}function Gb(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ie(e,t))return;i.uniform3fv(this.addr,t),Le(e,t)}}function Hb(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ie(e,t))return;i.uniform4fv(this.addr,t),Le(e,t)}}function Wb(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ie(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Le(e,t)}else{if(Ie(e,n))return;vm.set(n),i.uniformMatrix2fv(this.addr,!1,vm),Le(e,n)}}function qb(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ie(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Le(e,t)}else{if(Ie(e,n))return;gm.set(n),i.uniformMatrix3fv(this.addr,!1,gm),Le(e,n)}}function Xb(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ie(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Le(e,t)}else{if(Ie(e,n))return;mm.set(n),i.uniformMatrix4fv(this.addr,!1,mm),Le(e,n)}}function Yb(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function jb(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ie(e,t))return;i.uniform2iv(this.addr,t),Le(e,t)}}function $b(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ie(e,t))return;i.uniform3iv(this.addr,t),Le(e,t)}}function Zb(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ie(e,t))return;i.uniform4iv(this.addr,t),Le(e,t)}}function Kb(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Jb(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ie(e,t))return;i.uniform2uiv(this.addr,t),Le(e,t)}}function Qb(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ie(e,t))return;i.uniform3uiv(this.addr,t),Le(e,t)}}function ty(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ie(e,t))return;i.uniform4uiv(this.addr,t),Le(e,t)}}function ey(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(hu.compareFunction=e.isReversedDepthBuffer()?ic:nc,r=hu):r=Im,e.setTexture2D(t||r,s)}function ny(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Fm,s)}function iy(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Nm,s)}function sy(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Lm,s)}function ry(i){switch(i){case 5126:return zb;case 35664:return Vb;case 35665:return Gb;case 35666:return Hb;case 35674:return Wb;case 35675:return qb;case 35676:return Xb;case 5124:case 35670:return Yb;case 35667:case 35671:return jb;case 35668:case 35672:return $b;case 35669:case 35673:return Zb;case 5125:return Kb;case 36294:return Jb;case 36295:return Qb;case 36296:return ty;case 35678:case 36198:case 36298:case 36306:case 35682:return ey;case 35679:case 36299:case 36307:return ny;case 35680:case 36300:case 36308:case 36293:return iy;case 36289:case 36303:case 36311:case 36292:return sy}}function oy(i,t){i.uniform1fv(this.addr,t)}function ay(i,t){let e=fr(t,this.size,2);i.uniform2fv(this.addr,e)}function ly(i,t){let e=fr(t,this.size,3);i.uniform3fv(this.addr,e)}function cy(i,t){let e=fr(t,this.size,4);i.uniform4fv(this.addr,e)}function hy(i,t){let e=fr(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function uy(i,t){let e=fr(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function dy(i,t){let e=fr(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function py(i,t){i.uniform1iv(this.addr,t)}function fy(i,t){i.uniform2iv(this.addr,t)}function my(i,t){i.uniform3iv(this.addr,t)}function gy(i,t){i.uniform4iv(this.addr,t)}function vy(i,t){i.uniform1uiv(this.addr,t)}function _y(i,t){i.uniform2uiv(this.addr,t)}function xy(i,t){i.uniform3uiv(this.addr,t)}function by(i,t){i.uniform4uiv(this.addr,t)}function yy(i,t,e){let n=this.cache,s=t.length,r=cc(e,s);Ie(n,r)||(i.uniform1iv(this.addr,r),Le(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=hu:o=Im;for(let a=0;a!==s;++a)e.setTexture2D(t[a]||o,r[a])}function wy(i,t,e){let n=this.cache,s=t.length,r=cc(e,s);Ie(n,r)||(i.uniform1iv(this.addr,r),Le(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||Fm,r[o])}function My(i,t,e){let n=this.cache,s=t.length,r=cc(e,s);Ie(n,r)||(i.uniform1iv(this.addr,r),Le(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||Nm,r[o])}function Sy(i,t,e){let n=this.cache,s=t.length,r=cc(e,s);Ie(n,r)||(i.uniform1iv(this.addr,r),Le(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Lm,r[o])}function Ey(i){switch(i){case 5126:return oy;case 35664:return ay;case 35665:return ly;case 35666:return cy;case 35674:return hy;case 35675:return uy;case 35676:return dy;case 5124:case 35670:return py;case 35667:case 35671:return fy;case 35668:case 35672:return my;case 35669:case 35673:return gy;case 5125:return vy;case 36294:return _y;case 36295:return xy;case 36296:return by;case 35678:case 36198:case 36298:case 36306:case 35682:return yy;case 35679:case 36299:case 36307:return wy;case 35680:case 36300:case 36308:case 36293:return My;case 36289:case 36303:case 36311:case 36292:return Sy}}var uu=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=ry(e.type)}},du=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Ey(e.type)}},pu=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],n)}}},lu=/(\w+)(\])?(\[|\.)?/g;function _m(i,t){i.seq.push(t),i.map[t.id]=t}function Ay(i,t,e){let n=i.name,s=n.length;for(lu.lastIndex=0;;){let r=lu.exec(n),o=lu.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){_m(e,c===void 0?new uu(a,i,t):new du(a,i,t));break}else{let d=e.map[a];d===void 0&&(d=new pu(a),_m(e,d)),e=d}}}var pr=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);Ay(a,l,this)}let s=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&n.push(o)}return n}};function xm(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var Cy=37297,Ty=0;function Py(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var bm=new Gt;function Ry(i){Zt._getMatrix(bm,Zt.workingColorSpace,i);let t=`mat3( ${bm.elements.map(e=>e.toFixed(4))} )`;switch(Zt.getTransfer(i)){case Vr:return[t,"LinearTransferOETF"];case ne:return[t,"sRGBTransferOETF"];default:return Dt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function ym(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+Py(i.getShaderSource(t),a)}else return r}function Iy(i,t){let e=Ry(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var Ly={[ho]:"Linear",[uo]:"Reinhard",[po]:"Cineon",[fo]:"ACESFilmic",[go]:"AgX",[vo]:"Neutral",[mo]:"Custom"};function Fy(i,t){let e=Ly[t];return e===void 0?(Dt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var rc=new H;function Ny(){Zt.getLuminanceCoefficients(rc);let i=rc.x.toFixed(4),t=rc.y.toFixed(4),e=rc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Dy(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Co).join(`
`)}function By(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Uy(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function Co(i){return i!==""}function wm(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Mm(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Oy=/^[ \t]*#include +<([\w\d./]+)>/gm;function fu(i){return i.replace(Oy,zy)}var ky=new Map;function zy(i,t){let e=qt[t];if(e===void 0){let n=ky.get(t);if(n!==void 0)e=qt[n],Dt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return fu(e)}var Vy=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Sm(i){return i.replace(Vy,Gy)}function Gy(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Em(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var Hy={[co]:"SHADOWMAP_TYPE_PCF",[cr]:"SHADOWMAP_TYPE_VSM"};function Wy(i){return Hy[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var qy={[zi]:"ENVMAP_TYPE_CUBE",[gs]:"ENVMAP_TYPE_CUBE",[_o]:"ENVMAP_TYPE_CUBE_UV"};function Xy(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":qy[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var Yy={[gs]:"ENVMAP_MODE_REFRACTION"};function jy(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Yy[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var $y={[zh]:"ENVMAP_BLENDING_MULTIPLY",[Yf]:"ENVMAP_BLENDING_MIX",[jf]:"ENVMAP_BLENDING_ADD"};function Zy(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":$y[i.combine]||"ENVMAP_BLENDING_NONE"}function Ky(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function Jy(i,t,e,n){let s=i.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=Wy(e),c=Xy(e),h=jy(e),d=Zy(e),u=Ky(e),p=Dy(e),m=By(r),v=s.createProgram(),g,f,_=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Co).join(`
`),g.length>0&&(g+=`
`),f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Co).join(`
`),f.length>0&&(f+=`
`)):(g=[Em(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Co).join(`
`),f=[Em(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Fn?"#define TONE_MAPPING":"",e.toneMapping!==Fn?qt.tonemapping_pars_fragment:"",e.toneMapping!==Fn?Fy("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",qt.colorspace_pars_fragment,Iy("linearToOutputTexel",e.outputColorSpace),Ny(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Co).join(`
`)),o=fu(o),o=wm(o,e),o=Mm(o,e),a=fu(a),a=wm(a,e),a=Mm(a,e),o=Sm(o),a=Sm(a),e.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,f=["#define varying in",e.glslVersion===Kh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Kh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let w=_+g+o,M=_+f+a,E=xm(s,s.VERTEX_SHADER,w),A=xm(s,s.FRAGMENT_SHADER,M);s.attachShader(v,E),s.attachShader(v,A),e.index0AttributeName!==void 0?s.bindAttribLocation(v,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function T(P){if(i.debug.checkShaderErrors){let N=s.getProgramInfoLog(v)||"",R=s.getShaderInfoLog(E)||"",D=s.getShaderInfoLog(A)||"",O=N.trim(),L=R.trim(),G=D.trim(),q=!0,Z=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(q=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,E,A);else{let et=ym(s,E,"vertex"),it=ym(s,A,"fragment");Nt("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+O+`
`+et+`
`+it)}else O!==""?Dt("WebGLProgram: Program Info Log:",O):(L===""||G==="")&&(Z=!1);Z&&(P.diagnostics={runnable:q,programLog:O,vertexShader:{log:L,prefix:g},fragmentShader:{log:G,prefix:f}})}s.deleteShader(E),s.deleteShader(A),F=new pr(s,v),x=Uy(s,v)}let F;this.getUniforms=function(){return F===void 0&&T(this),F};let x;this.getAttributes=function(){return x===void 0&&T(this),x};let y=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(v,Cy)),y},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Ty++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=E,this.fragmentShader=A,this}var Qy=0,mu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new gu(t),e.set(t,n)),n}},gu=class{constructor(t){this.id=Qy++,this.code=t,this.usedTimes=0}};function tw(i,t,e,n,s,r,o){let a=new Xr,l=new mu,c=new Set,h=[],d=new Map,u=s.logarithmicDepthBuffer,p=s.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(x){return c.add(x),x===0?"uv":`uv${x}`}function g(x,y,P,N,R){let D=N.fog,O=R.geometry,L=x.isMeshStandardMaterial?N.environment:null,G=(x.isMeshStandardMaterial?e:t).get(x.envMap||L),q=G&&G.mapping===_o?G.image.height:null,Z=m[x.type];x.precision!==null&&(p=s.getMaxPrecision(x.precision),p!==x.precision&&Dt("WebGLProgram.getParameters:",x.precision,"not supported, using",p,"instead."));let et=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,it=et!==void 0?et.length:0,nt=0;O.morphAttributes.position!==void 0&&(nt=1),O.morphAttributes.normal!==void 0&&(nt=2),O.morphAttributes.color!==void 0&&(nt=3);let _t,Bt,Lt,$;if(Z){let ce=qn[Z];_t=ce.vertexShader,Bt=ce.fragmentShader}else _t=x.vertexShader,Bt=x.fragmentShader,l.update(x),Lt=l.getVertexShaderID(x),$=l.getFragmentShaderID(x);let J=i.getRenderTarget(),ft=i.state.buffers.depth.getReversed(),Tt=R.isInstancedMesh===!0,gt=R.isBatchedMesh===!0,Wt=!!x.map,le=!!x.matcap,Vt=!!G,jt=!!x.aoMap,se=!!x.lightMap,zt=!!x.bumpMap,xe=!!x.normalMap,U=!!x.displacementMap,be=!!x.emissiveMap,Jt=!!x.metalnessMap,re=!!x.roughnessMap,St=x.anisotropy>0,I=x.clearcoat>0,b=x.dispersion>0,z=x.iridescence>0,K=x.sheen>0,Q=x.transmission>0,j=St&&!!x.anisotropyMap,wt=I&&!!x.clearcoatMap,at=I&&!!x.clearcoatNormalMap,xt=I&&!!x.clearcoatRoughnessMap,It=z&&!!x.iridescenceMap,st=z&&!!x.iridescenceThicknessMap,ct=K&&!!x.sheenColorMap,Mt=K&&!!x.sheenRoughnessMap,At=!!x.specularMap,lt=!!x.specularColorMap,Ot=!!x.specularIntensityMap,k=Q&&!!x.transmissionMap,ut=Q&&!!x.thicknessMap,ot=!!x.gradientMap,vt=!!x.alphaMap,rt=x.alphaTest>0,tt=!!x.alphaHash,ht=!!x.extensions,kt=Fn;x.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(kt=i.toneMapping);let pe={shaderID:Z,shaderType:x.type,shaderName:x.name,vertexShader:_t,fragmentShader:Bt,defines:x.defines,customVertexShaderID:Lt,customFragmentShaderID:$,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:p,batching:gt,batchingColor:gt&&R._colorsTexture!==null,instancing:Tt,instancingColor:Tt&&R.instanceColor!==null,instancingMorph:Tt&&R.morphTexture!==null,outputColorSpace:J===null?i.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:cs,alphaToCoverage:!!x.alphaToCoverage,map:Wt,matcap:le,envMap:Vt,envMapMode:Vt&&G.mapping,envMapCubeUVHeight:q,aoMap:jt,lightMap:se,bumpMap:zt,normalMap:xe,displacementMap:U,emissiveMap:be,normalMapObjectSpace:xe&&x.normalMapType===Kf,normalMapTangentSpace:xe&&x.normalMapType===Zh,metalnessMap:Jt,roughnessMap:re,anisotropy:St,anisotropyMap:j,clearcoat:I,clearcoatMap:wt,clearcoatNormalMap:at,clearcoatRoughnessMap:xt,dispersion:b,iridescence:z,iridescenceMap:It,iridescenceThicknessMap:st,sheen:K,sheenColorMap:ct,sheenRoughnessMap:Mt,specularMap:At,specularColorMap:lt,specularIntensityMap:Ot,transmission:Q,transmissionMap:k,thicknessMap:ut,gradientMap:ot,opaque:x.transparent===!1&&x.blending===as&&x.alphaToCoverage===!1,alphaMap:vt,alphaTest:rt,alphaHash:tt,combine:x.combine,mapUv:Wt&&v(x.map.channel),aoMapUv:jt&&v(x.aoMap.channel),lightMapUv:se&&v(x.lightMap.channel),bumpMapUv:zt&&v(x.bumpMap.channel),normalMapUv:xe&&v(x.normalMap.channel),displacementMapUv:U&&v(x.displacementMap.channel),emissiveMapUv:be&&v(x.emissiveMap.channel),metalnessMapUv:Jt&&v(x.metalnessMap.channel),roughnessMapUv:re&&v(x.roughnessMap.channel),anisotropyMapUv:j&&v(x.anisotropyMap.channel),clearcoatMapUv:wt&&v(x.clearcoatMap.channel),clearcoatNormalMapUv:at&&v(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xt&&v(x.clearcoatRoughnessMap.channel),iridescenceMapUv:It&&v(x.iridescenceMap.channel),iridescenceThicknessMapUv:st&&v(x.iridescenceThicknessMap.channel),sheenColorMapUv:ct&&v(x.sheenColorMap.channel),sheenRoughnessMapUv:Mt&&v(x.sheenRoughnessMap.channel),specularMapUv:At&&v(x.specularMap.channel),specularColorMapUv:lt&&v(x.specularColorMap.channel),specularIntensityMapUv:Ot&&v(x.specularIntensityMap.channel),transmissionMapUv:k&&v(x.transmissionMap.channel),thicknessMapUv:ut&&v(x.thicknessMap.channel),alphaMapUv:vt&&v(x.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(xe||St),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:R.isPoints===!0&&!!O.attributes.uv&&(Wt||vt),fog:!!D,useFog:x.fog===!0,fogExp2:!!D&&D.isFogExp2,flatShading:x.flatShading===!0&&x.wireframe===!1,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:ft,skinning:R.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:it,morphTextureStride:nt,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:kt,decodeVideoTexture:Wt&&x.map.isVideoTexture===!0&&Zt.getTransfer(x.map.colorSpace)===ne,decodeVideoTextureEmissive:be&&x.emissiveMap.isVideoTexture===!0&&Zt.getTransfer(x.emissiveMap.colorSpace)===ne,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Hn,flipSided:x.side===Ve,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:ht&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ht&&x.extensions.multiDraw===!0||gt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return pe.vertexUv1s=c.has(1),pe.vertexUv2s=c.has(2),pe.vertexUv3s=c.has(3),c.clear(),pe}function f(x){let y=[];if(x.shaderID?y.push(x.shaderID):(y.push(x.customVertexShaderID),y.push(x.customFragmentShaderID)),x.defines!==void 0)for(let P in x.defines)y.push(P),y.push(x.defines[P]);return x.isRawShaderMaterial===!1&&(_(y,x),w(y,x),y.push(i.outputColorSpace)),y.push(x.customProgramCacheKey),y.join()}function _(x,y){x.push(y.precision),x.push(y.outputColorSpace),x.push(y.envMapMode),x.push(y.envMapCubeUVHeight),x.push(y.mapUv),x.push(y.alphaMapUv),x.push(y.lightMapUv),x.push(y.aoMapUv),x.push(y.bumpMapUv),x.push(y.normalMapUv),x.push(y.displacementMapUv),x.push(y.emissiveMapUv),x.push(y.metalnessMapUv),x.push(y.roughnessMapUv),x.push(y.anisotropyMapUv),x.push(y.clearcoatMapUv),x.push(y.clearcoatNormalMapUv),x.push(y.clearcoatRoughnessMapUv),x.push(y.iridescenceMapUv),x.push(y.iridescenceThicknessMapUv),x.push(y.sheenColorMapUv),x.push(y.sheenRoughnessMapUv),x.push(y.specularMapUv),x.push(y.specularColorMapUv),x.push(y.specularIntensityMapUv),x.push(y.transmissionMapUv),x.push(y.thicknessMapUv),x.push(y.combine),x.push(y.fogExp2),x.push(y.sizeAttenuation),x.push(y.morphTargetsCount),x.push(y.morphAttributeCount),x.push(y.numDirLights),x.push(y.numPointLights),x.push(y.numSpotLights),x.push(y.numSpotLightMaps),x.push(y.numHemiLights),x.push(y.numRectAreaLights),x.push(y.numDirLightShadows),x.push(y.numPointLightShadows),x.push(y.numSpotLightShadows),x.push(y.numSpotLightShadowsWithMaps),x.push(y.numLightProbes),x.push(y.shadowMapType),x.push(y.toneMapping),x.push(y.numClippingPlanes),x.push(y.numClipIntersection),x.push(y.depthPacking)}function w(x,y){a.disableAll(),y.instancing&&a.enable(0),y.instancingColor&&a.enable(1),y.instancingMorph&&a.enable(2),y.matcap&&a.enable(3),y.envMap&&a.enable(4),y.normalMapObjectSpace&&a.enable(5),y.normalMapTangentSpace&&a.enable(6),y.clearcoat&&a.enable(7),y.iridescence&&a.enable(8),y.alphaTest&&a.enable(9),y.vertexColors&&a.enable(10),y.vertexAlphas&&a.enable(11),y.vertexUv1s&&a.enable(12),y.vertexUv2s&&a.enable(13),y.vertexUv3s&&a.enable(14),y.vertexTangents&&a.enable(15),y.anisotropy&&a.enable(16),y.alphaHash&&a.enable(17),y.batching&&a.enable(18),y.dispersion&&a.enable(19),y.batchingColor&&a.enable(20),y.gradientMap&&a.enable(21),x.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reversedDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),x.push(a.mask)}function M(x){let y=m[x.type],P;if(y){let N=qn[y];P=Hi.clone(N.uniforms)}else P=x.uniforms;return P}function E(x,y){let P=d.get(y);return P!==void 0?++P.usedTimes:(P=new Jy(i,y,x,r),h.push(P),d.set(y,P)),P}function A(x){if(--x.usedTimes===0){let y=h.indexOf(x);h[y]=h[h.length-1],h.pop(),d.delete(x.cacheKey),x.destroy()}}function T(x){l.remove(x)}function F(){l.dispose()}return{getParameters:g,getProgramCacheKey:f,getUniforms:M,acquireProgram:E,releaseProgram:A,releaseShaderCache:T,programs:h,dispose:F}}function ew(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function nw(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Am(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Cm(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(d,u,p,m,v,g){let f=i[t];return f===void 0?(f={id:d.id,object:d,geometry:u,material:p,groupOrder:m,renderOrder:d.renderOrder,z:v,group:g},i[t]=f):(f.id=d.id,f.object=d,f.geometry=u,f.material=p,f.groupOrder=m,f.renderOrder=d.renderOrder,f.z=v,f.group=g),t++,f}function a(d,u,p,m,v,g){let f=o(d,u,p,m,v,g);p.transmission>0?n.push(f):p.transparent===!0?s.push(f):e.push(f)}function l(d,u,p,m,v,g){let f=o(d,u,p,m,v,g);p.transmission>0?n.unshift(f):p.transparent===!0?s.unshift(f):e.unshift(f)}function c(d,u){e.length>1&&e.sort(d||nw),n.length>1&&n.sort(u||Am),s.length>1&&s.sort(u||Am)}function h(){for(let d=t,u=i.length;d<u;d++){let p=i[d];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function iw(){let i=new WeakMap;function t(n,s){let r=i.get(n),o;return r===void 0?(o=new Cm,i.set(n,[o])):s>=r.length?(o=new Cm,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function sw(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new H,color:new Ut};break;case"SpotLight":e={position:new H,direction:new H,color:new Ut,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new H,color:new Ut,distance:0,decay:0};break;case"HemisphereLight":e={direction:new H,skyColor:new Ut,groundColor:new Ut};break;case"RectAreaLight":e={color:new Ut,position:new H,halfWidth:new H,halfHeight:new H};break}return i[t.id]=e,e}}}function rw(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $t};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $t};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $t,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var ow=0;function aw(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function lw(i){let t=new sw,e=rw(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new H);let s=new H,r=new we,o=new we;function a(c){let h=0,d=0,u=0;for(let x=0;x<9;x++)n.probe[x].set(0,0,0);let p=0,m=0,v=0,g=0,f=0,_=0,w=0,M=0,E=0,A=0,T=0;c.sort(aw);for(let x=0,y=c.length;x<y;x++){let P=c[x],N=P.color,R=P.intensity,D=P.distance,O=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===vs?O=P.shadow.map.texture:O=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)h+=N.r*R,d+=N.g*R,u+=N.b*R;else if(P.isLightProbe){for(let L=0;L<9;L++)n.probe[L].addScaledVector(P.sh.coefficients[L],R);T++}else if(P.isDirectionalLight){let L=t.get(P);if(L.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let G=P.shadow,q=e.get(P);q.shadowIntensity=G.intensity,q.shadowBias=G.bias,q.shadowNormalBias=G.normalBias,q.shadowRadius=G.radius,q.shadowMapSize=G.mapSize,n.directionalShadow[p]=q,n.directionalShadowMap[p]=O,n.directionalShadowMatrix[p]=P.shadow.matrix,_++}n.directional[p]=L,p++}else if(P.isSpotLight){let L=t.get(P);L.position.setFromMatrixPosition(P.matrixWorld),L.color.copy(N).multiplyScalar(R),L.distance=D,L.coneCos=Math.cos(P.angle),L.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),L.decay=P.decay,n.spot[v]=L;let G=P.shadow;if(P.map&&(n.spotLightMap[E]=P.map,E++,G.updateMatrices(P),P.castShadow&&A++),n.spotLightMatrix[v]=G.matrix,P.castShadow){let q=e.get(P);q.shadowIntensity=G.intensity,q.shadowBias=G.bias,q.shadowNormalBias=G.normalBias,q.shadowRadius=G.radius,q.shadowMapSize=G.mapSize,n.spotShadow[v]=q,n.spotShadowMap[v]=O,M++}v++}else if(P.isRectAreaLight){let L=t.get(P);L.color.copy(N).multiplyScalar(R),L.halfWidth.set(P.width*.5,0,0),L.halfHeight.set(0,P.height*.5,0),n.rectArea[g]=L,g++}else if(P.isPointLight){let L=t.get(P);if(L.color.copy(P.color).multiplyScalar(P.intensity),L.distance=P.distance,L.decay=P.decay,P.castShadow){let G=P.shadow,q=e.get(P);q.shadowIntensity=G.intensity,q.shadowBias=G.bias,q.shadowNormalBias=G.normalBias,q.shadowRadius=G.radius,q.shadowMapSize=G.mapSize,q.shadowCameraNear=G.camera.near,q.shadowCameraFar=G.camera.far,n.pointShadow[m]=q,n.pointShadowMap[m]=O,n.pointShadowMatrix[m]=P.shadow.matrix,w++}n.point[m]=L,m++}else if(P.isHemisphereLight){let L=t.get(P);L.skyColor.copy(P.color).multiplyScalar(R),L.groundColor.copy(P.groundColor).multiplyScalar(R),n.hemi[f]=L,f++}}g>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=pt.LTC_FLOAT_1,n.rectAreaLTC2=pt.LTC_FLOAT_2):(n.rectAreaLTC1=pt.LTC_HALF_1,n.rectAreaLTC2=pt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=u;let F=n.hash;(F.directionalLength!==p||F.pointLength!==m||F.spotLength!==v||F.rectAreaLength!==g||F.hemiLength!==f||F.numDirectionalShadows!==_||F.numPointShadows!==w||F.numSpotShadows!==M||F.numSpotMaps!==E||F.numLightProbes!==T)&&(n.directional.length=p,n.spot.length=v,n.rectArea.length=g,n.point.length=m,n.hemi.length=f,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.pointShadow.length=w,n.pointShadowMap.length=w,n.spotShadow.length=M,n.spotShadowMap.length=M,n.directionalShadowMatrix.length=_,n.pointShadowMatrix.length=w,n.spotLightMatrix.length=M+E-A,n.spotLightMap.length=E,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=T,F.directionalLength=p,F.pointLength=m,F.spotLength=v,F.rectAreaLength=g,F.hemiLength=f,F.numDirectionalShadows=_,F.numPointShadows=w,F.numSpotShadows=M,F.numSpotMaps=E,F.numLightProbes=T,n.version=ow++)}function l(c,h){let d=0,u=0,p=0,m=0,v=0,g=h.matrixWorldInverse;for(let f=0,_=c.length;f<_;f++){let w=c[f];if(w.isDirectionalLight){let M=n.directional[d];M.direction.setFromMatrixPosition(w.matrixWorld),s.setFromMatrixPosition(w.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(g),d++}else if(w.isSpotLight){let M=n.spot[p];M.position.setFromMatrixPosition(w.matrixWorld),M.position.applyMatrix4(g),M.direction.setFromMatrixPosition(w.matrixWorld),s.setFromMatrixPosition(w.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(g),p++}else if(w.isRectAreaLight){let M=n.rectArea[m];M.position.setFromMatrixPosition(w.matrixWorld),M.position.applyMatrix4(g),o.identity(),r.copy(w.matrixWorld),r.premultiply(g),o.extractRotation(r),M.halfWidth.set(w.width*.5,0,0),M.halfHeight.set(0,w.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),m++}else if(w.isPointLight){let M=n.point[u];M.position.setFromMatrixPosition(w.matrixWorld),M.position.applyMatrix4(g),u++}else if(w.isHemisphereLight){let M=n.hemi[v];M.direction.setFromMatrixPosition(w.matrixWorld),M.direction.transformDirection(g),v++}}}return{setup:a,setupView:l,state:n}}function Tm(i){let t=new lw(i),e=[],n=[];function s(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function o(h){n.push(h)}function a(){t.setup(e)}function l(h){t.setupView(e,h)}let c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function cw(i){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new Tm(i),t.set(s,[a])):r>=o.length?(a=new Tm(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var hw=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,uw=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,dw=[new H(1,0,0),new H(-1,0,0),new H(0,1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1)],pw=[new H(0,-1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1),new H(0,-1,0),new H(0,-1,0)],Pm=new we,Ao=new H,cu=new H;function fw(i,t,e){let n=new sr,s=new $t,r=new $t,o=new Me,a=new ar,l=new Za,c={},h=e.maxTextureSize,d={[ai]:Ve,[Ve]:ai,[Hn]:Hn},u=new Be({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new $t},radius:{value:4}},vertexShader:hw,fragmentShader:uw}),p=u.clone();p.defines.HORIZONTAL_PASS=1;let m=new Pe;m.setAttribute("position",new pn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new me(m,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=co;let f=this.type;this.render=function(A,T,F){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||A.length===0)return;A.type===al&&(Dt("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),A.type=co);let x=i.getRenderTarget(),y=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),N=i.state;N.setBlending(en),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let R=f!==this.type;R&&T.traverse(function(D){D.material&&(Array.isArray(D.material)?D.material.forEach(O=>O.needsUpdate=!0):D.material.needsUpdate=!0)});for(let D=0,O=A.length;D<O;D++){let L=A[D],G=L.shadow;if(G===void 0){Dt("WebGLShadowMap:",L,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let q=G.getFrameExtents();if(s.multiply(q),r.copy(G.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/q.x),s.x=r.x*q.x,G.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/q.y),s.y=r.y*q.y,G.mapSize.y=r.y)),G.map===null||R===!0){if(G.map!==null&&(G.map.depthTexture!==null&&(G.map.depthTexture.dispose(),G.map.depthTexture=null),G.map.dispose()),this.type===cr){if(L.isPointLight){Dt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}G.map=new ke(s.x,s.y,{format:vs,type:sn,minFilter:Oe,magFilter:Oe,generateMipmaps:!1}),G.map.texture.name=L.name+".shadowMap",G.map.depthTexture=new Bi(s.x,s.y,Dn),G.map.depthTexture.name=L.name+".shadowMapDepth",G.map.depthTexture.format=Gn,G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=Te,G.map.depthTexture.magFilter=Te}else{L.isPointLight?(G.map=new Kr(s.x),G.map.depthTexture=new $a(s.x,Nn)):(G.map=new ke(s.x,s.y),G.map.depthTexture=new Bi(s.x,s.y,Nn)),G.map.depthTexture.name=L.name+".shadowMap",G.map.depthTexture.format=Gn;let et=i.state.buffers.depth.getReversed();this.type===co?(G.map.depthTexture.compareFunction=et?ic:nc,G.map.depthTexture.minFilter=Oe,G.map.depthTexture.magFilter=Oe):(G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=Te,G.map.depthTexture.magFilter=Te)}G.camera.updateProjectionMatrix()}let Z=G.map.isWebGLCubeRenderTarget?6:1;for(let et=0;et<Z;et++){if(G.map.isWebGLCubeRenderTarget)i.setRenderTarget(G.map,et),i.clear();else{et===0&&(i.setRenderTarget(G.map),i.clear());let it=G.getViewport(et);o.set(r.x*it.x,r.y*it.y,r.x*it.z,r.y*it.w),N.viewport(o)}if(L.isPointLight){let it=G.camera,nt=G.matrix,_t=L.distance||it.far;_t!==it.far&&(it.far=_t,it.updateProjectionMatrix()),Ao.setFromMatrixPosition(L.matrixWorld),it.position.copy(Ao),cu.copy(it.position),cu.add(dw[et]),it.up.copy(pw[et]),it.lookAt(cu),it.updateMatrixWorld(),nt.makeTranslation(-Ao.x,-Ao.y,-Ao.z),Pm.multiplyMatrices(it.projectionMatrix,it.matrixWorldInverse),G._frustum.setFromProjectionMatrix(Pm,it.coordinateSystem,it.reversedDepth)}else G.updateMatrices(L);n=G.getFrustum(),M(T,F,G.camera,L,this.type)}G.isPointLightShadow!==!0&&this.type===cr&&_(G,F),G.needsUpdate=!1}f=this.type,g.needsUpdate=!1,i.setRenderTarget(x,y,P)};function _(A,T){let F=t.update(v);u.defines.VSM_SAMPLES!==A.blurSamples&&(u.defines.VSM_SAMPLES=A.blurSamples,p.defines.VSM_SAMPLES=A.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new ke(s.x,s.y,{format:vs,type:sn})),u.uniforms.shadow_pass.value=A.map.depthTexture,u.uniforms.resolution.value=A.mapSize,u.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(T,null,F,u,v,null),p.uniforms.shadow_pass.value=A.mapPass.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(T,null,F,p,v,null)}function w(A,T,F,x){let y=null,P=F.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(P!==void 0)y=P;else if(y=F.isPointLight===!0?l:a,i.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0||T.alphaToCoverage===!0){let N=y.uuid,R=T.uuid,D=c[N];D===void 0&&(D={},c[N]=D);let O=D[R];O===void 0&&(O=y.clone(),D[R]=O,T.addEventListener("dispose",E)),y=O}if(y.visible=T.visible,y.wireframe=T.wireframe,x===cr?y.side=T.shadowSide!==null?T.shadowSide:T.side:y.side=T.shadowSide!==null?T.shadowSide:d[T.side],y.alphaMap=T.alphaMap,y.alphaTest=T.alphaToCoverage===!0?.5:T.alphaTest,y.map=T.map,y.clipShadows=T.clipShadows,y.clippingPlanes=T.clippingPlanes,y.clipIntersection=T.clipIntersection,y.displacementMap=T.displacementMap,y.displacementScale=T.displacementScale,y.displacementBias=T.displacementBias,y.wireframeLinewidth=T.wireframeLinewidth,y.linewidth=T.linewidth,F.isPointLight===!0&&y.isMeshDistanceMaterial===!0){let N=i.properties.get(y);N.light=F}return y}function M(A,T,F,x,y){if(A.visible===!1)return;if(A.layers.test(T.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&y===cr)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse,A.matrixWorld);let R=t.update(A),D=A.material;if(Array.isArray(D)){let O=R.groups;for(let L=0,G=O.length;L<G;L++){let q=O[L],Z=D[q.materialIndex];if(Z&&Z.visible){let et=w(A,Z,x,y);A.onBeforeShadow(i,A,T,F,R,et,q),i.renderBufferDirect(F,null,R,et,A,q),A.onAfterShadow(i,A,T,F,R,et,q)}}}else if(D.visible){let O=w(A,D,x,y);A.onBeforeShadow(i,A,T,F,R,O,null),i.renderBufferDirect(F,null,R,O,A,null),A.onAfterShadow(i,A,T,F,R,O,null)}}let N=A.children;for(let R=0,D=N.length;R<D;R++)M(N[R],T,F,x,y)}function E(A){A.target.removeEventListener("dispose",E);for(let F in c){let x=c[F],y=A.target.uuid;y in x&&(x[y].dispose(),delete x[y])}}}var mw={[ll]:cl,[hl]:pl,[ul]:fl,[ls]:dl,[cl]:ll,[pl]:hl,[fl]:ul,[dl]:ls};function gw(i,t){function e(){let k=!1,ut=new Me,ot=null,vt=new Me(0,0,0,0);return{setMask:function(rt){ot!==rt&&!k&&(i.colorMask(rt,rt,rt,rt),ot=rt)},setLocked:function(rt){k=rt},setClear:function(rt,tt,ht,kt,pe){pe===!0&&(rt*=kt,tt*=kt,ht*=kt),ut.set(rt,tt,ht,kt),vt.equals(ut)===!1&&(i.clearColor(rt,tt,ht,kt),vt.copy(ut))},reset:function(){k=!1,ot=null,vt.set(-1,0,0,0)}}}function n(){let k=!1,ut=!1,ot=null,vt=null,rt=null;return{setReversed:function(tt){if(ut!==tt){let ht=t.get("EXT_clip_control");tt?ht.clipControlEXT(ht.LOWER_LEFT_EXT,ht.ZERO_TO_ONE_EXT):ht.clipControlEXT(ht.LOWER_LEFT_EXT,ht.NEGATIVE_ONE_TO_ONE_EXT),ut=tt;let kt=rt;rt=null,this.setClear(kt)}},getReversed:function(){return ut},setTest:function(tt){tt?J(i.DEPTH_TEST):ft(i.DEPTH_TEST)},setMask:function(tt){ot!==tt&&!k&&(i.depthMask(tt),ot=tt)},setFunc:function(tt){if(ut&&(tt=mw[tt]),vt!==tt){switch(tt){case ll:i.depthFunc(i.NEVER);break;case cl:i.depthFunc(i.ALWAYS);break;case hl:i.depthFunc(i.LESS);break;case ls:i.depthFunc(i.LEQUAL);break;case ul:i.depthFunc(i.EQUAL);break;case dl:i.depthFunc(i.GEQUAL);break;case pl:i.depthFunc(i.GREATER);break;case fl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}vt=tt}},setLocked:function(tt){k=tt},setClear:function(tt){rt!==tt&&(ut&&(tt=1-tt),i.clearDepth(tt),rt=tt)},reset:function(){k=!1,ot=null,vt=null,rt=null,ut=!1}}}function s(){let k=!1,ut=null,ot=null,vt=null,rt=null,tt=null,ht=null,kt=null,pe=null;return{setTest:function(ce){k||(ce?J(i.STENCIL_TEST):ft(i.STENCIL_TEST))},setMask:function(ce){ut!==ce&&!k&&(i.stencilMask(ce),ut=ce)},setFunc:function(ce,On,ti){(ot!==ce||vt!==On||rt!==ti)&&(i.stencilFunc(ce,On,ti),ot=ce,vt=On,rt=ti)},setOp:function(ce,On,ti){(tt!==ce||ht!==On||kt!==ti)&&(i.stencilOp(ce,On,ti),tt=ce,ht=On,kt=ti)},setLocked:function(ce){k=ce},setClear:function(ce){pe!==ce&&(i.clearStencil(ce),pe=ce)},reset:function(){k=!1,ut=null,ot=null,vt=null,rt=null,tt=null,ht=null,kt=null,pe=null}}}let r=new e,o=new n,a=new s,l=new WeakMap,c=new WeakMap,h={},d={},u=new WeakMap,p=[],m=null,v=!1,g=null,f=null,_=null,w=null,M=null,E=null,A=null,T=new Ut(0,0,0),F=0,x=!1,y=null,P=null,N=null,R=null,D=null,O=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),L=!1,G=0,q=i.getParameter(i.VERSION);q.indexOf("WebGL")!==-1?(G=parseFloat(/^WebGL (\d)/.exec(q)[1]),L=G>=1):q.indexOf("OpenGL ES")!==-1&&(G=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),L=G>=2);let Z=null,et={},it=i.getParameter(i.SCISSOR_BOX),nt=i.getParameter(i.VIEWPORT),_t=new Me().fromArray(it),Bt=new Me().fromArray(nt);function Lt(k,ut,ot,vt){let rt=new Uint8Array(4),tt=i.createTexture();i.bindTexture(k,tt),i.texParameteri(k,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(k,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let ht=0;ht<ot;ht++)k===i.TEXTURE_3D||k===i.TEXTURE_2D_ARRAY?i.texImage3D(ut,0,i.RGBA,1,1,vt,0,i.RGBA,i.UNSIGNED_BYTE,rt):i.texImage2D(ut+ht,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,rt);return tt}let $={};$[i.TEXTURE_2D]=Lt(i.TEXTURE_2D,i.TEXTURE_2D,1),$[i.TEXTURE_CUBE_MAP]=Lt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),$[i.TEXTURE_2D_ARRAY]=Lt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),$[i.TEXTURE_3D]=Lt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),J(i.DEPTH_TEST),o.setFunc(ls),zt(!1),xe(Bh),J(i.CULL_FACE),jt(en);function J(k){h[k]!==!0&&(i.enable(k),h[k]=!0)}function ft(k){h[k]!==!1&&(i.disable(k),h[k]=!1)}function Tt(k,ut){return d[k]!==ut?(i.bindFramebuffer(k,ut),d[k]=ut,k===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=ut),k===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=ut),!0):!1}function gt(k,ut){let ot=p,vt=!1;if(k){ot=u.get(ut),ot===void 0&&(ot=[],u.set(ut,ot));let rt=k.textures;if(ot.length!==rt.length||ot[0]!==i.COLOR_ATTACHMENT0){for(let tt=0,ht=rt.length;tt<ht;tt++)ot[tt]=i.COLOR_ATTACHMENT0+tt;ot.length=rt.length,vt=!0}}else ot[0]!==i.BACK&&(ot[0]=i.BACK,vt=!0);vt&&i.drawBuffers(ot)}function Wt(k){return m!==k?(i.useProgram(k),m=k,!0):!1}let le={[Ni]:i.FUNC_ADD,[Rf]:i.FUNC_SUBTRACT,[If]:i.FUNC_REVERSE_SUBTRACT};le[Lf]=i.MIN,le[Ff]=i.MAX;let Vt={[Nf]:i.ZERO,[Df]:i.ONE,[Bf]:i.SRC_COLOR,[Ba]:i.SRC_ALPHA,[Gf]:i.SRC_ALPHA_SATURATE,[zf]:i.DST_COLOR,[Of]:i.DST_ALPHA,[Uf]:i.ONE_MINUS_SRC_COLOR,[Ua]:i.ONE_MINUS_SRC_ALPHA,[Vf]:i.ONE_MINUS_DST_COLOR,[kf]:i.ONE_MINUS_DST_ALPHA,[Hf]:i.CONSTANT_COLOR,[Wf]:i.ONE_MINUS_CONSTANT_COLOR,[qf]:i.CONSTANT_ALPHA,[Xf]:i.ONE_MINUS_CONSTANT_ALPHA};function jt(k,ut,ot,vt,rt,tt,ht,kt,pe,ce){if(k===en){v===!0&&(ft(i.BLEND),v=!1);return}if(v===!1&&(J(i.BLEND),v=!0),k!==Pf){if(k!==g||ce!==x){if((f!==Ni||M!==Ni)&&(i.blendEquation(i.FUNC_ADD),f=Ni,M=Ni),ce)switch(k){case as:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Uh:i.blendFunc(i.ONE,i.ONE);break;case Oh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case kh:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Nt("WebGLState: Invalid blending: ",k);break}else switch(k){case as:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Uh:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Oh:Nt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case kh:Nt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Nt("WebGLState: Invalid blending: ",k);break}_=null,w=null,E=null,A=null,T.set(0,0,0),F=0,g=k,x=ce}return}rt=rt||ut,tt=tt||ot,ht=ht||vt,(ut!==f||rt!==M)&&(i.blendEquationSeparate(le[ut],le[rt]),f=ut,M=rt),(ot!==_||vt!==w||tt!==E||ht!==A)&&(i.blendFuncSeparate(Vt[ot],Vt[vt],Vt[tt],Vt[ht]),_=ot,w=vt,E=tt,A=ht),(kt.equals(T)===!1||pe!==F)&&(i.blendColor(kt.r,kt.g,kt.b,pe),T.copy(kt),F=pe),g=k,x=!1}function se(k,ut){k.side===Hn?ft(i.CULL_FACE):J(i.CULL_FACE);let ot=k.side===Ve;ut&&(ot=!ot),zt(ot),k.blending===as&&k.transparent===!1?jt(en):jt(k.blending,k.blendEquation,k.blendSrc,k.blendDst,k.blendEquationAlpha,k.blendSrcAlpha,k.blendDstAlpha,k.blendColor,k.blendAlpha,k.premultipliedAlpha),o.setFunc(k.depthFunc),o.setTest(k.depthTest),o.setMask(k.depthWrite),r.setMask(k.colorWrite);let vt=k.stencilWrite;a.setTest(vt),vt&&(a.setMask(k.stencilWriteMask),a.setFunc(k.stencilFunc,k.stencilRef,k.stencilFuncMask),a.setOp(k.stencilFail,k.stencilZFail,k.stencilZPass)),be(k.polygonOffset,k.polygonOffsetFactor,k.polygonOffsetUnits),k.alphaToCoverage===!0?J(i.SAMPLE_ALPHA_TO_COVERAGE):ft(i.SAMPLE_ALPHA_TO_COVERAGE)}function zt(k){y!==k&&(k?i.frontFace(i.CW):i.frontFace(i.CCW),y=k)}function xe(k){k!==Cf?(J(i.CULL_FACE),k!==P&&(k===Bh?i.cullFace(i.BACK):k===Tf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ft(i.CULL_FACE),P=k}function U(k){k!==N&&(L&&i.lineWidth(k),N=k)}function be(k,ut,ot){k?(J(i.POLYGON_OFFSET_FILL),(R!==ut||D!==ot)&&(i.polygonOffset(ut,ot),R=ut,D=ot)):ft(i.POLYGON_OFFSET_FILL)}function Jt(k){k?J(i.SCISSOR_TEST):ft(i.SCISSOR_TEST)}function re(k){k===void 0&&(k=i.TEXTURE0+O-1),Z!==k&&(i.activeTexture(k),Z=k)}function St(k,ut,ot){ot===void 0&&(Z===null?ot=i.TEXTURE0+O-1:ot=Z);let vt=et[ot];vt===void 0&&(vt={type:void 0,texture:void 0},et[ot]=vt),(vt.type!==k||vt.texture!==ut)&&(Z!==ot&&(i.activeTexture(ot),Z=ot),i.bindTexture(k,ut||$[k]),vt.type=k,vt.texture=ut)}function I(){let k=et[Z];k!==void 0&&k.type!==void 0&&(i.bindTexture(k.type,null),k.type=void 0,k.texture=void 0)}function b(){try{i.compressedTexImage2D(...arguments)}catch(k){Nt("WebGLState:",k)}}function z(){try{i.compressedTexImage3D(...arguments)}catch(k){Nt("WebGLState:",k)}}function K(){try{i.texSubImage2D(...arguments)}catch(k){Nt("WebGLState:",k)}}function Q(){try{i.texSubImage3D(...arguments)}catch(k){Nt("WebGLState:",k)}}function j(){try{i.compressedTexSubImage2D(...arguments)}catch(k){Nt("WebGLState:",k)}}function wt(){try{i.compressedTexSubImage3D(...arguments)}catch(k){Nt("WebGLState:",k)}}function at(){try{i.texStorage2D(...arguments)}catch(k){Nt("WebGLState:",k)}}function xt(){try{i.texStorage3D(...arguments)}catch(k){Nt("WebGLState:",k)}}function It(){try{i.texImage2D(...arguments)}catch(k){Nt("WebGLState:",k)}}function st(){try{i.texImage3D(...arguments)}catch(k){Nt("WebGLState:",k)}}function ct(k){_t.equals(k)===!1&&(i.scissor(k.x,k.y,k.z,k.w),_t.copy(k))}function Mt(k){Bt.equals(k)===!1&&(i.viewport(k.x,k.y,k.z,k.w),Bt.copy(k))}function At(k,ut){let ot=c.get(ut);ot===void 0&&(ot=new WeakMap,c.set(ut,ot));let vt=ot.get(k);vt===void 0&&(vt=i.getUniformBlockIndex(ut,k.name),ot.set(k,vt))}function lt(k,ut){let vt=c.get(ut).get(k);l.get(ut)!==vt&&(i.uniformBlockBinding(ut,vt,k.__bindingPointIndex),l.set(ut,vt))}function Ot(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},Z=null,et={},d={},u=new WeakMap,p=[],m=null,v=!1,g=null,f=null,_=null,w=null,M=null,E=null,A=null,T=new Ut(0,0,0),F=0,x=!1,y=null,P=null,N=null,R=null,D=null,_t.set(0,0,i.canvas.width,i.canvas.height),Bt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:J,disable:ft,bindFramebuffer:Tt,drawBuffers:gt,useProgram:Wt,setBlending:jt,setMaterial:se,setFlipSided:zt,setCullFace:xe,setLineWidth:U,setPolygonOffset:be,setScissorTest:Jt,activeTexture:re,bindTexture:St,unbindTexture:I,compressedTexImage2D:b,compressedTexImage3D:z,texImage2D:It,texImage3D:st,updateUBOMapping:At,uniformBlockBinding:lt,texStorage2D:at,texStorage3D:xt,texSubImage2D:K,texSubImage3D:Q,compressedTexSubImage2D:j,compressedTexSubImage3D:wt,scissor:ct,viewport:Mt,reset:Ot}}function vw(i,t,e,n,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new $t,h=new WeakMap,d,u=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(I,b){return p?new OffscreenCanvas(I,b):Hr("canvas")}function v(I,b,z){let K=1,Q=St(I);if((Q.width>z||Q.height>z)&&(K=z/Math.max(Q.width,Q.height)),K<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){let j=Math.floor(K*Q.width),wt=Math.floor(K*Q.height);d===void 0&&(d=m(j,wt));let at=b?m(j,wt):d;return at.width=j,at.height=wt,at.getContext("2d").drawImage(I,0,0,j,wt),Dt("WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+j+"x"+wt+")."),at}else return"data"in I&&Dt("WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),I;return I}function g(I){return I.generateMipmaps}function f(I){i.generateMipmap(I)}function _(I){return I.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?i.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function w(I,b,z,K,Q=!1){if(I!==null){if(i[I]!==void 0)return i[I];Dt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let j=b;if(b===i.RED&&(z===i.FLOAT&&(j=i.R32F),z===i.HALF_FLOAT&&(j=i.R16F),z===i.UNSIGNED_BYTE&&(j=i.R8)),b===i.RED_INTEGER&&(z===i.UNSIGNED_BYTE&&(j=i.R8UI),z===i.UNSIGNED_SHORT&&(j=i.R16UI),z===i.UNSIGNED_INT&&(j=i.R32UI),z===i.BYTE&&(j=i.R8I),z===i.SHORT&&(j=i.R16I),z===i.INT&&(j=i.R32I)),b===i.RG&&(z===i.FLOAT&&(j=i.RG32F),z===i.HALF_FLOAT&&(j=i.RG16F),z===i.UNSIGNED_BYTE&&(j=i.RG8)),b===i.RG_INTEGER&&(z===i.UNSIGNED_BYTE&&(j=i.RG8UI),z===i.UNSIGNED_SHORT&&(j=i.RG16UI),z===i.UNSIGNED_INT&&(j=i.RG32UI),z===i.BYTE&&(j=i.RG8I),z===i.SHORT&&(j=i.RG16I),z===i.INT&&(j=i.RG32I)),b===i.RGB_INTEGER&&(z===i.UNSIGNED_BYTE&&(j=i.RGB8UI),z===i.UNSIGNED_SHORT&&(j=i.RGB16UI),z===i.UNSIGNED_INT&&(j=i.RGB32UI),z===i.BYTE&&(j=i.RGB8I),z===i.SHORT&&(j=i.RGB16I),z===i.INT&&(j=i.RGB32I)),b===i.RGBA_INTEGER&&(z===i.UNSIGNED_BYTE&&(j=i.RGBA8UI),z===i.UNSIGNED_SHORT&&(j=i.RGBA16UI),z===i.UNSIGNED_INT&&(j=i.RGBA32UI),z===i.BYTE&&(j=i.RGBA8I),z===i.SHORT&&(j=i.RGBA16I),z===i.INT&&(j=i.RGBA32I)),b===i.RGB&&(z===i.UNSIGNED_INT_5_9_9_9_REV&&(j=i.RGB9_E5),z===i.UNSIGNED_INT_10F_11F_11F_REV&&(j=i.R11F_G11F_B10F)),b===i.RGBA){let wt=Q?Vr:Zt.getTransfer(K);z===i.FLOAT&&(j=i.RGBA32F),z===i.HALF_FLOAT&&(j=i.RGBA16F),z===i.UNSIGNED_BYTE&&(j=wt===ne?i.SRGB8_ALPHA8:i.RGBA8),z===i.UNSIGNED_SHORT_4_4_4_4&&(j=i.RGBA4),z===i.UNSIGNED_SHORT_5_5_5_1&&(j=i.RGB5_A1)}return(j===i.R16F||j===i.R32F||j===i.RG16F||j===i.RG32F||j===i.RGBA16F||j===i.RGBA32F)&&t.get("EXT_color_buffer_float"),j}function M(I,b){let z;return I?b===null||b===Nn||b===ur?z=i.DEPTH24_STENCIL8:b===Dn?z=i.DEPTH32F_STENCIL8:b===hr&&(z=i.DEPTH24_STENCIL8,Dt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Nn||b===ur?z=i.DEPTH_COMPONENT24:b===Dn?z=i.DEPTH_COMPONENT32F:b===hr&&(z=i.DEPTH_COMPONENT16),z}function E(I,b){return g(I)===!0||I.isFramebufferTexture&&I.minFilter!==Te&&I.minFilter!==Oe?Math.log2(Math.max(b.width,b.height))+1:I.mipmaps!==void 0&&I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?b.mipmaps.length:1}function A(I){let b=I.target;b.removeEventListener("dispose",A),F(b),b.isVideoTexture&&h.delete(b)}function T(I){let b=I.target;b.removeEventListener("dispose",T),y(b)}function F(I){let b=n.get(I);if(b.__webglInit===void 0)return;let z=I.source,K=u.get(z);if(K){let Q=K[b.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&x(I),Object.keys(K).length===0&&u.delete(z)}n.remove(I)}function x(I){let b=n.get(I);i.deleteTexture(b.__webglTexture);let z=I.source,K=u.get(z);delete K[b.__cacheKey],o.memory.textures--}function y(I){let b=n.get(I);if(I.depthTexture&&(I.depthTexture.dispose(),n.remove(I.depthTexture)),I.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(b.__webglFramebuffer[K]))for(let Q=0;Q<b.__webglFramebuffer[K].length;Q++)i.deleteFramebuffer(b.__webglFramebuffer[K][Q]);else i.deleteFramebuffer(b.__webglFramebuffer[K]);b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer[K])}else{if(Array.isArray(b.__webglFramebuffer))for(let K=0;K<b.__webglFramebuffer.length;K++)i.deleteFramebuffer(b.__webglFramebuffer[K]);else i.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&i.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let K=0;K<b.__webglColorRenderbuffer.length;K++)b.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(b.__webglColorRenderbuffer[K]);b.__webglDepthRenderbuffer&&i.deleteRenderbuffer(b.__webglDepthRenderbuffer)}let z=I.textures;for(let K=0,Q=z.length;K<Q;K++){let j=n.get(z[K]);j.__webglTexture&&(i.deleteTexture(j.__webglTexture),o.memory.textures--),n.remove(z[K])}n.remove(I)}let P=0;function N(){P=0}function R(){let I=P;return I>=s.maxTextures&&Dt("WebGLTextures: Trying to use "+I+" texture units while this GPU supports only "+s.maxTextures),P+=1,I}function D(I){let b=[];return b.push(I.wrapS),b.push(I.wrapT),b.push(I.wrapR||0),b.push(I.magFilter),b.push(I.minFilter),b.push(I.anisotropy),b.push(I.internalFormat),b.push(I.format),b.push(I.type),b.push(I.generateMipmaps),b.push(I.premultiplyAlpha),b.push(I.flipY),b.push(I.unpackAlignment),b.push(I.colorSpace),b.join()}function O(I,b){let z=n.get(I);if(I.isVideoTexture&&Jt(I),I.isRenderTargetTexture===!1&&I.isExternalTexture!==!0&&I.version>0&&z.__version!==I.version){let K=I.image;if(K===null)Dt("WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)Dt("WebGLRenderer: Texture marked for update but image is incomplete");else{$(z,I,b);return}}else I.isExternalTexture&&(z.__webglTexture=I.sourceTexture?I.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,z.__webglTexture,i.TEXTURE0+b)}function L(I,b){let z=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&z.__version!==I.version){$(z,I,b);return}else I.isExternalTexture&&(z.__webglTexture=I.sourceTexture?I.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,z.__webglTexture,i.TEXTURE0+b)}function G(I,b){let z=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&z.__version!==I.version){$(z,I,b);return}e.bindTexture(i.TEXTURE_3D,z.__webglTexture,i.TEXTURE0+b)}function q(I,b){let z=n.get(I);if(I.isCubeDepthTexture!==!0&&I.version>0&&z.__version!==I.version){J(z,I,b);return}e.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture,i.TEXTURE0+b)}let Z={[Oa]:i.REPEAT,[zn]:i.CLAMP_TO_EDGE,[ka]:i.MIRRORED_REPEAT},et={[Te]:i.NEAREST,[$f]:i.NEAREST_MIPMAP_NEAREST,[xo]:i.NEAREST_MIPMAP_LINEAR,[Oe]:i.LINEAR,[vl]:i.LINEAR_MIPMAP_NEAREST,[Vi]:i.LINEAR_MIPMAP_LINEAR},it={[Jf]:i.NEVER,[im]:i.ALWAYS,[Qf]:i.LESS,[nc]:i.LEQUAL,[tm]:i.EQUAL,[ic]:i.GEQUAL,[em]:i.GREATER,[nm]:i.NOTEQUAL};function nt(I,b){if(b.type===Dn&&t.has("OES_texture_float_linear")===!1&&(b.magFilter===Oe||b.magFilter===vl||b.magFilter===xo||b.magFilter===Vi||b.minFilter===Oe||b.minFilter===vl||b.minFilter===xo||b.minFilter===Vi)&&Dt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(I,i.TEXTURE_WRAP_S,Z[b.wrapS]),i.texParameteri(I,i.TEXTURE_WRAP_T,Z[b.wrapT]),(I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY)&&i.texParameteri(I,i.TEXTURE_WRAP_R,Z[b.wrapR]),i.texParameteri(I,i.TEXTURE_MAG_FILTER,et[b.magFilter]),i.texParameteri(I,i.TEXTURE_MIN_FILTER,et[b.minFilter]),b.compareFunction&&(i.texParameteri(I,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(I,i.TEXTURE_COMPARE_FUNC,it[b.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Te||b.minFilter!==xo&&b.minFilter!==Vi||b.type===Dn&&t.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){let z=t.get("EXT_texture_filter_anisotropic");i.texParameterf(I,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function _t(I,b){let z=!1;I.__webglInit===void 0&&(I.__webglInit=!0,b.addEventListener("dispose",A));let K=b.source,Q=u.get(K);Q===void 0&&(Q={},u.set(K,Q));let j=D(b);if(j!==I.__cacheKey){Q[j]===void 0&&(Q[j]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,z=!0),Q[j].usedTimes++;let wt=Q[I.__cacheKey];wt!==void 0&&(Q[I.__cacheKey].usedTimes--,wt.usedTimes===0&&x(b)),I.__cacheKey=j,I.__webglTexture=Q[j].texture}return z}function Bt(I,b,z){return Math.floor(Math.floor(I/z)/b)}function Lt(I,b,z,K){let j=I.updateRanges;if(j.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,b.width,b.height,z,K,b.data);else{j.sort((st,ct)=>st.start-ct.start);let wt=0;for(let st=1;st<j.length;st++){let ct=j[wt],Mt=j[st],At=ct.start+ct.count,lt=Bt(Mt.start,b.width,4),Ot=Bt(ct.start,b.width,4);Mt.start<=At+1&&lt===Ot&&Bt(Mt.start+Mt.count-1,b.width,4)===lt?ct.count=Math.max(ct.count,Mt.start+Mt.count-ct.start):(++wt,j[wt]=Mt)}j.length=wt+1;let at=i.getParameter(i.UNPACK_ROW_LENGTH),xt=i.getParameter(i.UNPACK_SKIP_PIXELS),It=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,b.width);for(let st=0,ct=j.length;st<ct;st++){let Mt=j[st],At=Math.floor(Mt.start/4),lt=Math.ceil(Mt.count/4),Ot=At%b.width,k=Math.floor(At/b.width),ut=lt,ot=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Ot),i.pixelStorei(i.UNPACK_SKIP_ROWS,k),e.texSubImage2D(i.TEXTURE_2D,0,Ot,k,ut,ot,z,K,b.data)}I.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,at),i.pixelStorei(i.UNPACK_SKIP_PIXELS,xt),i.pixelStorei(i.UNPACK_SKIP_ROWS,It)}}function $(I,b,z){let K=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(K=i.TEXTURE_3D);let Q=_t(I,b),j=b.source;e.bindTexture(K,I.__webglTexture,i.TEXTURE0+z);let wt=n.get(j);if(j.version!==wt.__version||Q===!0){e.activeTexture(i.TEXTURE0+z);let at=Zt.getPrimaries(Zt.workingColorSpace),xt=b.colorSpace===di?null:Zt.getPrimaries(b.colorSpace),It=b.colorSpace===di||at===xt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,It);let st=v(b.image,!1,s.maxTextureSize);st=re(b,st);let ct=r.convert(b.format,b.colorSpace),Mt=r.convert(b.type),At=w(b.internalFormat,ct,Mt,b.colorSpace,b.isVideoTexture);nt(K,b);let lt,Ot=b.mipmaps,k=b.isVideoTexture!==!0,ut=wt.__version===void 0||Q===!0,ot=j.dataReady,vt=E(b,st);if(b.isDepthTexture)At=M(b.format===Gi,b.type),ut&&(k?e.texStorage2D(i.TEXTURE_2D,1,At,st.width,st.height):e.texImage2D(i.TEXTURE_2D,0,At,st.width,st.height,0,ct,Mt,null));else if(b.isDataTexture)if(Ot.length>0){k&&ut&&e.texStorage2D(i.TEXTURE_2D,vt,At,Ot[0].width,Ot[0].height);for(let rt=0,tt=Ot.length;rt<tt;rt++)lt=Ot[rt],k?ot&&e.texSubImage2D(i.TEXTURE_2D,rt,0,0,lt.width,lt.height,ct,Mt,lt.data):e.texImage2D(i.TEXTURE_2D,rt,At,lt.width,lt.height,0,ct,Mt,lt.data);b.generateMipmaps=!1}else k?(ut&&e.texStorage2D(i.TEXTURE_2D,vt,At,st.width,st.height),ot&&Lt(b,st,ct,Mt)):e.texImage2D(i.TEXTURE_2D,0,At,st.width,st.height,0,ct,Mt,st.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){k&&ut&&e.texStorage3D(i.TEXTURE_2D_ARRAY,vt,At,Ot[0].width,Ot[0].height,st.depth);for(let rt=0,tt=Ot.length;rt<tt;rt++)if(lt=Ot[rt],b.format!==wn)if(ct!==null)if(k){if(ot)if(b.layerUpdates.size>0){let ht=iu(lt.width,lt.height,b.format,b.type);for(let kt of b.layerUpdates){let pe=lt.data.subarray(kt*ht/lt.data.BYTES_PER_ELEMENT,(kt+1)*ht/lt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,rt,0,0,kt,lt.width,lt.height,1,ct,pe)}b.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,rt,0,0,0,lt.width,lt.height,st.depth,ct,lt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,rt,At,lt.width,lt.height,st.depth,0,lt.data,0,0);else Dt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else k?ot&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,rt,0,0,0,lt.width,lt.height,st.depth,ct,Mt,lt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,rt,At,lt.width,lt.height,st.depth,0,ct,Mt,lt.data)}else{k&&ut&&e.texStorage2D(i.TEXTURE_2D,vt,At,Ot[0].width,Ot[0].height);for(let rt=0,tt=Ot.length;rt<tt;rt++)lt=Ot[rt],b.format!==wn?ct!==null?k?ot&&e.compressedTexSubImage2D(i.TEXTURE_2D,rt,0,0,lt.width,lt.height,ct,lt.data):e.compressedTexImage2D(i.TEXTURE_2D,rt,At,lt.width,lt.height,0,lt.data):Dt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):k?ot&&e.texSubImage2D(i.TEXTURE_2D,rt,0,0,lt.width,lt.height,ct,Mt,lt.data):e.texImage2D(i.TEXTURE_2D,rt,At,lt.width,lt.height,0,ct,Mt,lt.data)}else if(b.isDataArrayTexture)if(k){if(ut&&e.texStorage3D(i.TEXTURE_2D_ARRAY,vt,At,st.width,st.height,st.depth),ot)if(b.layerUpdates.size>0){let rt=iu(st.width,st.height,b.format,b.type);for(let tt of b.layerUpdates){let ht=st.data.subarray(tt*rt/st.data.BYTES_PER_ELEMENT,(tt+1)*rt/st.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,tt,st.width,st.height,1,ct,Mt,ht)}b.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,st.width,st.height,st.depth,ct,Mt,st.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,At,st.width,st.height,st.depth,0,ct,Mt,st.data);else if(b.isData3DTexture)k?(ut&&e.texStorage3D(i.TEXTURE_3D,vt,At,st.width,st.height,st.depth),ot&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,st.width,st.height,st.depth,ct,Mt,st.data)):e.texImage3D(i.TEXTURE_3D,0,At,st.width,st.height,st.depth,0,ct,Mt,st.data);else if(b.isFramebufferTexture){if(ut)if(k)e.texStorage2D(i.TEXTURE_2D,vt,At,st.width,st.height);else{let rt=st.width,tt=st.height;for(let ht=0;ht<vt;ht++)e.texImage2D(i.TEXTURE_2D,ht,At,rt,tt,0,ct,Mt,null),rt>>=1,tt>>=1}}else if(Ot.length>0){if(k&&ut){let rt=St(Ot[0]);e.texStorage2D(i.TEXTURE_2D,vt,At,rt.width,rt.height)}for(let rt=0,tt=Ot.length;rt<tt;rt++)lt=Ot[rt],k?ot&&e.texSubImage2D(i.TEXTURE_2D,rt,0,0,ct,Mt,lt):e.texImage2D(i.TEXTURE_2D,rt,At,ct,Mt,lt);b.generateMipmaps=!1}else if(k){if(ut){let rt=St(st);e.texStorage2D(i.TEXTURE_2D,vt,At,rt.width,rt.height)}ot&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,ct,Mt,st)}else e.texImage2D(i.TEXTURE_2D,0,At,ct,Mt,st);g(b)&&f(K),wt.__version=j.version,b.onUpdate&&b.onUpdate(b)}I.__version=b.version}function J(I,b,z){if(b.image.length!==6)return;let K=_t(I,b),Q=b.source;e.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+z);let j=n.get(Q);if(Q.version!==j.__version||K===!0){e.activeTexture(i.TEXTURE0+z);let wt=Zt.getPrimaries(Zt.workingColorSpace),at=b.colorSpace===di?null:Zt.getPrimaries(b.colorSpace),xt=b.colorSpace===di||wt===at?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,xt);let It=b.isCompressedTexture||b.image[0].isCompressedTexture,st=b.image[0]&&b.image[0].isDataTexture,ct=[];for(let tt=0;tt<6;tt++)!It&&!st?ct[tt]=v(b.image[tt],!0,s.maxCubemapSize):ct[tt]=st?b.image[tt].image:b.image[tt],ct[tt]=re(b,ct[tt]);let Mt=ct[0],At=r.convert(b.format,b.colorSpace),lt=r.convert(b.type),Ot=w(b.internalFormat,At,lt,b.colorSpace),k=b.isVideoTexture!==!0,ut=j.__version===void 0||K===!0,ot=Q.dataReady,vt=E(b,Mt);nt(i.TEXTURE_CUBE_MAP,b);let rt;if(It){k&&ut&&e.texStorage2D(i.TEXTURE_CUBE_MAP,vt,Ot,Mt.width,Mt.height);for(let tt=0;tt<6;tt++){rt=ct[tt].mipmaps;for(let ht=0;ht<rt.length;ht++){let kt=rt[ht];b.format!==wn?At!==null?k?ot&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,ht,0,0,kt.width,kt.height,At,kt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,ht,Ot,kt.width,kt.height,0,kt.data):Dt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):k?ot&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,ht,0,0,kt.width,kt.height,At,lt,kt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,ht,Ot,kt.width,kt.height,0,At,lt,kt.data)}}}else{if(rt=b.mipmaps,k&&ut){rt.length>0&&vt++;let tt=St(ct[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,vt,Ot,tt.width,tt.height)}for(let tt=0;tt<6;tt++)if(st){k?ot&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,0,0,ct[tt].width,ct[tt].height,At,lt,ct[tt].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,Ot,ct[tt].width,ct[tt].height,0,At,lt,ct[tt].data);for(let ht=0;ht<rt.length;ht++){let pe=rt[ht].image[tt].image;k?ot&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,ht+1,0,0,pe.width,pe.height,At,lt,pe.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,ht+1,Ot,pe.width,pe.height,0,At,lt,pe.data)}}else{k?ot&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,0,0,At,lt,ct[tt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,Ot,At,lt,ct[tt]);for(let ht=0;ht<rt.length;ht++){let kt=rt[ht];k?ot&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,ht+1,0,0,At,lt,kt.image[tt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,ht+1,Ot,At,lt,kt.image[tt])}}}g(b)&&f(i.TEXTURE_CUBE_MAP),j.__version=Q.version,b.onUpdate&&b.onUpdate(b)}I.__version=b.version}function ft(I,b,z,K,Q,j){let wt=r.convert(z.format,z.colorSpace),at=r.convert(z.type),xt=w(z.internalFormat,wt,at,z.colorSpace),It=n.get(b),st=n.get(z);if(st.__renderTarget=b,!It.__hasExternalTextures){let ct=Math.max(1,b.width>>j),Mt=Math.max(1,b.height>>j);Q===i.TEXTURE_3D||Q===i.TEXTURE_2D_ARRAY?e.texImage3D(Q,j,xt,ct,Mt,b.depth,0,wt,at,null):e.texImage2D(Q,j,xt,ct,Mt,0,wt,at,null)}e.bindFramebuffer(i.FRAMEBUFFER,I),be(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,Q,st.__webglTexture,0,U(b)):(Q===i.TEXTURE_2D||Q>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,Q,st.__webglTexture,j),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Tt(I,b,z){if(i.bindRenderbuffer(i.RENDERBUFFER,I),b.depthBuffer){let K=b.depthTexture,Q=K&&K.isDepthTexture?K.type:null,j=M(b.stencilBuffer,Q),wt=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;be(b)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,U(b),j,b.width,b.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,U(b),j,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,j,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,wt,i.RENDERBUFFER,I)}else{let K=b.textures;for(let Q=0;Q<K.length;Q++){let j=K[Q],wt=r.convert(j.format,j.colorSpace),at=r.convert(j.type),xt=w(j.internalFormat,wt,at,j.colorSpace);be(b)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,U(b),xt,b.width,b.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,U(b),xt,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,xt,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function gt(I,b,z){let K=b.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,I),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let Q=n.get(b.depthTexture);if(Q.__renderTarget=b,(!Q.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),K){if(Q.__webglInit===void 0&&(Q.__webglInit=!0,b.depthTexture.addEventListener("dispose",A)),Q.__webglTexture===void 0){Q.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,Q.__webglTexture),nt(i.TEXTURE_CUBE_MAP,b.depthTexture);let It=r.convert(b.depthTexture.format),st=r.convert(b.depthTexture.type),ct;b.depthTexture.format===Gn?ct=i.DEPTH_COMPONENT24:b.depthTexture.format===Gi&&(ct=i.DEPTH24_STENCIL8);for(let Mt=0;Mt<6;Mt++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,0,ct,b.width,b.height,0,It,st,null)}}else O(b.depthTexture,0);let j=Q.__webglTexture,wt=U(b),at=K?i.TEXTURE_CUBE_MAP_POSITIVE_X+z:i.TEXTURE_2D,xt=b.depthTexture.format===Gi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(b.depthTexture.format===Gn)be(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,xt,at,j,0,wt):i.framebufferTexture2D(i.FRAMEBUFFER,xt,at,j,0);else if(b.depthTexture.format===Gi)be(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,xt,at,j,0,wt):i.framebufferTexture2D(i.FRAMEBUFFER,xt,at,j,0);else throw new Error("Unknown depthTexture format")}function Wt(I){let b=n.get(I),z=I.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==I.depthTexture){let K=I.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),K){let Q=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,K.removeEventListener("dispose",Q)};K.addEventListener("dispose",Q),b.__depthDisposeCallback=Q}b.__boundDepthTexture=K}if(I.depthTexture&&!b.__autoAllocateDepthBuffer)if(z)for(let K=0;K<6;K++)gt(b.__webglFramebuffer[K],I,K);else{let K=I.texture.mipmaps;K&&K.length>0?gt(b.__webglFramebuffer[0],I,0):gt(b.__webglFramebuffer,I,0)}else if(z){b.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[K]),b.__webglDepthbuffer[K]===void 0)b.__webglDepthbuffer[K]=i.createRenderbuffer(),Tt(b.__webglDepthbuffer[K],I,!1);else{let Q=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,j=b.__webglDepthbuffer[K];i.bindRenderbuffer(i.RENDERBUFFER,j),i.framebufferRenderbuffer(i.FRAMEBUFFER,Q,i.RENDERBUFFER,j)}}else{let K=I.texture.mipmaps;if(K&&K.length>0?e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=i.createRenderbuffer(),Tt(b.__webglDepthbuffer,I,!1);else{let Q=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,j=b.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,j),i.framebufferRenderbuffer(i.FRAMEBUFFER,Q,i.RENDERBUFFER,j)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function le(I,b,z){let K=n.get(I);b!==void 0&&ft(K.__webglFramebuffer,I,I.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),z!==void 0&&Wt(I)}function Vt(I){let b=I.texture,z=n.get(I),K=n.get(b);I.addEventListener("dispose",T);let Q=I.textures,j=I.isWebGLCubeRenderTarget===!0,wt=Q.length>1;if(wt||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=b.version,o.memory.textures++),j){z.__webglFramebuffer=[];for(let at=0;at<6;at++)if(b.mipmaps&&b.mipmaps.length>0){z.__webglFramebuffer[at]=[];for(let xt=0;xt<b.mipmaps.length;xt++)z.__webglFramebuffer[at][xt]=i.createFramebuffer()}else z.__webglFramebuffer[at]=i.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){z.__webglFramebuffer=[];for(let at=0;at<b.mipmaps.length;at++)z.__webglFramebuffer[at]=i.createFramebuffer()}else z.__webglFramebuffer=i.createFramebuffer();if(wt)for(let at=0,xt=Q.length;at<xt;at++){let It=n.get(Q[at]);It.__webglTexture===void 0&&(It.__webglTexture=i.createTexture(),o.memory.textures++)}if(I.samples>0&&be(I)===!1){z.__webglMultisampledFramebuffer=i.createFramebuffer(),z.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let at=0;at<Q.length;at++){let xt=Q[at];z.__webglColorRenderbuffer[at]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,z.__webglColorRenderbuffer[at]);let It=r.convert(xt.format,xt.colorSpace),st=r.convert(xt.type),ct=w(xt.internalFormat,It,st,xt.colorSpace,I.isXRRenderTarget===!0),Mt=U(I);i.renderbufferStorageMultisample(i.RENDERBUFFER,Mt,ct,I.width,I.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.RENDERBUFFER,z.__webglColorRenderbuffer[at])}i.bindRenderbuffer(i.RENDERBUFFER,null),I.depthBuffer&&(z.__webglDepthRenderbuffer=i.createRenderbuffer(),Tt(z.__webglDepthRenderbuffer,I,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(j){e.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),nt(i.TEXTURE_CUBE_MAP,b);for(let at=0;at<6;at++)if(b.mipmaps&&b.mipmaps.length>0)for(let xt=0;xt<b.mipmaps.length;xt++)ft(z.__webglFramebuffer[at][xt],I,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+at,xt);else ft(z.__webglFramebuffer[at],I,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0);g(b)&&f(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(wt){for(let at=0,xt=Q.length;at<xt;at++){let It=Q[at],st=n.get(It),ct=i.TEXTURE_2D;(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(ct=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ct,st.__webglTexture),nt(ct,It),ft(z.__webglFramebuffer,I,It,i.COLOR_ATTACHMENT0+at,ct,0),g(It)&&f(ct)}e.unbindTexture()}else{let at=i.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(at=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(at,K.__webglTexture),nt(at,b),b.mipmaps&&b.mipmaps.length>0)for(let xt=0;xt<b.mipmaps.length;xt++)ft(z.__webglFramebuffer[xt],I,b,i.COLOR_ATTACHMENT0,at,xt);else ft(z.__webglFramebuffer,I,b,i.COLOR_ATTACHMENT0,at,0);g(b)&&f(at),e.unbindTexture()}I.depthBuffer&&Wt(I)}function jt(I){let b=I.textures;for(let z=0,K=b.length;z<K;z++){let Q=b[z];if(g(Q)){let j=_(I),wt=n.get(Q).__webglTexture;e.bindTexture(j,wt),f(j),e.unbindTexture()}}}let se=[],zt=[];function xe(I){if(I.samples>0){if(be(I)===!1){let b=I.textures,z=I.width,K=I.height,Q=i.COLOR_BUFFER_BIT,j=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,wt=n.get(I),at=b.length>1;if(at)for(let It=0;It<b.length;It++)e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+It,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+It,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,wt.__webglMultisampledFramebuffer);let xt=I.texture.mipmaps;xt&&xt.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglFramebuffer);for(let It=0;It<b.length;It++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(Q|=i.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(Q|=i.STENCIL_BUFFER_BIT)),at){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,wt.__webglColorRenderbuffer[It]);let st=n.get(b[It]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,st,0)}i.blitFramebuffer(0,0,z,K,0,0,z,K,Q,i.NEAREST),l===!0&&(se.length=0,zt.length=0,se.push(i.COLOR_ATTACHMENT0+It),I.depthBuffer&&I.resolveDepthBuffer===!1&&(se.push(j),zt.push(j),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,zt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,se))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),at)for(let It=0;It<b.length;It++){e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+It,i.RENDERBUFFER,wt.__webglColorRenderbuffer[It]);let st=n.get(b[It]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+It,i.TEXTURE_2D,st,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.resolveDepthBuffer===!1&&l){let b=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[b])}}}function U(I){return Math.min(s.maxSamples,I.samples)}function be(I){let b=n.get(I);return I.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Jt(I){let b=o.render.frame;h.get(I)!==b&&(h.set(I,b),I.update())}function re(I,b){let z=I.colorSpace,K=I.format,Q=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||z!==cs&&z!==di&&(Zt.getTransfer(z)===ne?(K!==wn||Q!==nn)&&Dt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Nt("WebGLTextures: Unsupported texture color space:",z)),b}function St(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(c.width=I.naturalWidth||I.width,c.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(c.width=I.displayWidth,c.height=I.displayHeight):(c.width=I.width,c.height=I.height),c}this.allocateTextureUnit=R,this.resetTextureUnits=N,this.setTexture2D=O,this.setTexture2DArray=L,this.setTexture3D=G,this.setTextureCube=q,this.rebindTextures=le,this.setupRenderTarget=Vt,this.updateRenderTargetMipmap=jt,this.updateMultisampleRenderTarget=xe,this.setupDepthRenderbuffer=Wt,this.setupFrameBufferTexture=ft,this.useMultisampledRTT=be,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function _w(i,t){function e(n,s=di){let r,o=Zt.getTransfer(s);if(n===nn)return i.UNSIGNED_BYTE;if(n===xl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===bl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Wh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===qh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Gh)return i.BYTE;if(n===Hh)return i.SHORT;if(n===hr)return i.UNSIGNED_SHORT;if(n===_l)return i.INT;if(n===Nn)return i.UNSIGNED_INT;if(n===Dn)return i.FLOAT;if(n===sn)return i.HALF_FLOAT;if(n===Xh)return i.ALPHA;if(n===Yh)return i.RGB;if(n===wn)return i.RGBA;if(n===Gn)return i.DEPTH_COMPONENT;if(n===Gi)return i.DEPTH_STENCIL;if(n===jh)return i.RED;if(n===yl)return i.RED_INTEGER;if(n===vs)return i.RG;if(n===wl)return i.RG_INTEGER;if(n===Ml)return i.RGBA_INTEGER;if(n===bo||n===yo||n===wo||n===Mo)if(o===ne)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===bo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===yo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===wo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Mo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===bo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===yo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===wo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Mo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Sl||n===El||n===Al||n===Cl)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Sl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===El)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Al)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Cl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Tl||n===Pl||n===Rl||n===Il||n===Ll||n===Fl||n===Nl)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Tl||n===Pl)return o===ne?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Rl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Il)return r.COMPRESSED_R11_EAC;if(n===Ll)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Fl)return r.COMPRESSED_RG11_EAC;if(n===Nl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Dl||n===Bl||n===Ul||n===Ol||n===kl||n===zl||n===Vl||n===Gl||n===Hl||n===Wl||n===ql||n===Xl||n===Yl||n===jl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Dl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Bl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ul)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ol)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===kl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===zl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Vl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Gl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Hl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Wl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ql)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Xl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Yl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===jl)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===$l||n===Zl||n===Kl)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===$l)return o===ne?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Zl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Kl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Jl||n===Ql||n===tc||n===ec)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Jl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ql)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===tc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ec)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ur?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var xw=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,bw=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,vu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new to(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new Be({vertexShader:xw,fragmentShader:bw,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new me(new ps(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},_u=class extends li{constructor(t,e){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,d=null,u=null,p=null,m=null,v=typeof XRWebGLBinding<"u",g=new vu,f={},_=e.getContextAttributes(),w=null,M=null,E=[],A=[],T=new $t,F=null,x=new We;x.viewport=new Me;let y=new We;y.viewport=new Me;let P=[x,y],N=new ol,R=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let J=E[$];return J===void 0&&(J=new ir,E[$]=J),J.getTargetRaySpace()},this.getControllerGrip=function($){let J=E[$];return J===void 0&&(J=new ir,E[$]=J),J.getGripSpace()},this.getHand=function($){let J=E[$];return J===void 0&&(J=new ir,E[$]=J),J.getHandSpace()};function O($){let J=A.indexOf($.inputSource);if(J===-1)return;let ft=E[J];ft!==void 0&&(ft.update($.inputSource,$.frame,c||o),ft.dispatchEvent({type:$.type,data:$.inputSource}))}function L(){s.removeEventListener("select",O),s.removeEventListener("selectstart",O),s.removeEventListener("selectend",O),s.removeEventListener("squeeze",O),s.removeEventListener("squeezestart",O),s.removeEventListener("squeezeend",O),s.removeEventListener("end",L),s.removeEventListener("inputsourceschange",G);for(let $=0;$<E.length;$++){let J=A[$];J!==null&&(A[$]=null,E[$].disconnect(J))}R=null,D=null,g.reset();for(let $ in f)delete f[$];t.setRenderTarget(w),p=null,u=null,d=null,s=null,M=null,Lt.stop(),n.isPresenting=!1,t.setPixelRatio(F),t.setSize(T.width,T.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,n.isPresenting===!0&&Dt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){a=$,n.isPresenting===!0&&Dt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function($){c=$},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(s,e)),d},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function($){if(s=$,s!==null){if(w=t.getRenderTarget(),s.addEventListener("select",O),s.addEventListener("selectstart",O),s.addEventListener("selectend",O),s.addEventListener("squeeze",O),s.addEventListener("squeezestart",O),s.addEventListener("squeezeend",O),s.addEventListener("end",L),s.addEventListener("inputsourceschange",G),_.xrCompatible!==!0&&await e.makeXRCompatible(),F=t.getPixelRatio(),t.getSize(T),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let ft=null,Tt=null,gt=null;_.depth&&(gt=_.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,ft=_.stencil?Gi:Gn,Tt=_.stencil?ur:Nn);let Wt={colorFormat:e.RGBA8,depthFormat:gt,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(Wt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),M=new ke(u.textureWidth,u.textureHeight,{format:wn,type:nn,depthTexture:new Bi(u.textureWidth,u.textureHeight,Tt,void 0,void 0,void 0,void 0,void 0,void 0,ft),stencilBuffer:_.stencil,colorSpace:t.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{let ft={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,ft),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),M=new ke(p.framebufferWidth,p.framebufferHeight,{format:wn,type:nn,colorSpace:t.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Lt.setContext(s),Lt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function G($){for(let J=0;J<$.removed.length;J++){let ft=$.removed[J],Tt=A.indexOf(ft);Tt>=0&&(A[Tt]=null,E[Tt].disconnect(ft))}for(let J=0;J<$.added.length;J++){let ft=$.added[J],Tt=A.indexOf(ft);if(Tt===-1){for(let Wt=0;Wt<E.length;Wt++)if(Wt>=A.length){A.push(ft),Tt=Wt;break}else if(A[Wt]===null){A[Wt]=ft,Tt=Wt;break}if(Tt===-1)break}let gt=E[Tt];gt&&gt.connect(ft)}}let q=new H,Z=new H;function et($,J,ft){q.setFromMatrixPosition(J.matrixWorld),Z.setFromMatrixPosition(ft.matrixWorld);let Tt=q.distanceTo(Z),gt=J.projectionMatrix.elements,Wt=ft.projectionMatrix.elements,le=gt[14]/(gt[10]-1),Vt=gt[14]/(gt[10]+1),jt=(gt[9]+1)/gt[5],se=(gt[9]-1)/gt[5],zt=(gt[8]-1)/gt[0],xe=(Wt[8]+1)/Wt[0],U=le*zt,be=le*xe,Jt=Tt/(-zt+xe),re=Jt*-zt;if(J.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(re),$.translateZ(Jt),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),gt[10]===-1)$.projectionMatrix.copy(J.projectionMatrix),$.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{let St=le+Jt,I=Vt+Jt,b=U-re,z=be+(Tt-re),K=jt*Vt/I*St,Q=se*Vt/I*St;$.projectionMatrix.makePerspective(b,z,K,Q,St,I),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function it($,J){J===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(J.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(s===null)return;let J=$.near,ft=$.far;g.texture!==null&&(g.depthNear>0&&(J=g.depthNear),g.depthFar>0&&(ft=g.depthFar)),N.near=y.near=x.near=J,N.far=y.far=x.far=ft,(R!==N.near||D!==N.far)&&(s.updateRenderState({depthNear:N.near,depthFar:N.far}),R=N.near,D=N.far),N.layers.mask=$.layers.mask|6,x.layers.mask=N.layers.mask&3,y.layers.mask=N.layers.mask&5;let Tt=$.parent,gt=N.cameras;it(N,Tt);for(let Wt=0;Wt<gt.length;Wt++)it(gt[Wt],Tt);gt.length===2?et(N,x,y):N.projectionMatrix.copy(x.projectionMatrix),nt($,N,Tt)};function nt($,J,ft){ft===null?$.matrix.copy(J.matrixWorld):($.matrix.copy(ft.matrixWorld),$.matrix.invert(),$.matrix.multiply(J.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(J.projectionMatrix),$.projectionMatrixInverse.copy(J.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=Va*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(!(u===null&&p===null))return l},this.setFoveation=function($){l=$,u!==null&&(u.fixedFoveation=$),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=$)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(N)},this.getCameraTexture=function($){return f[$]};let _t=null;function Bt($,J){if(h=J.getViewerPose(c||o),m=J,h!==null){let ft=h.views;p!==null&&(t.setRenderTargetFramebuffer(M,p.framebuffer),t.setRenderTarget(M));let Tt=!1;ft.length!==N.cameras.length&&(N.cameras.length=0,Tt=!0);for(let Vt=0;Vt<ft.length;Vt++){let jt=ft[Vt],se=null;if(p!==null)se=p.getViewport(jt);else{let xe=d.getViewSubImage(u,jt);se=xe.viewport,Vt===0&&(t.setRenderTargetTextures(M,xe.colorTexture,xe.depthStencilTexture),t.setRenderTarget(M))}let zt=P[Vt];zt===void 0&&(zt=new We,zt.layers.enable(Vt),zt.viewport=new Me,P[Vt]=zt),zt.matrix.fromArray(jt.transform.matrix),zt.matrix.decompose(zt.position,zt.quaternion,zt.scale),zt.projectionMatrix.fromArray(jt.projectionMatrix),zt.projectionMatrixInverse.copy(zt.projectionMatrix).invert(),zt.viewport.set(se.x,se.y,se.width,se.height),Vt===0&&(N.matrix.copy(zt.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),Tt===!0&&N.cameras.push(zt)}let gt=s.enabledFeatures;if(gt&&gt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){d=n.getBinding();let Vt=d.getDepthInformation(ft[0]);Vt&&Vt.isValid&&Vt.texture&&g.init(Vt,s.renderState)}if(gt&&gt.includes("camera-access")&&v){t.state.unbindTexture(),d=n.getBinding();for(let Vt=0;Vt<ft.length;Vt++){let jt=ft[Vt].camera;if(jt){let se=f[jt];se||(se=new to,f[jt]=se);let zt=d.getCameraImage(jt);se.sourceTexture=zt}}}}for(let ft=0;ft<E.length;ft++){let Tt=A[ft],gt=E[ft];Tt!==null&&gt!==void 0&&gt.update(Tt,J,c||o)}_t&&_t($,J),J.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:J}),m=null}let Lt=new Rm;Lt.setAnimationLoop(Bt),this.setAnimationLoop=function($){_t=$},this.dispose=function(){}}},bs=new Ln,yw=new we;function ww(i,t){function e(g,f){g.matrixAutoUpdate===!0&&g.updateMatrix(),f.value.copy(g.matrix)}function n(g,f){f.color.getRGB(g.fogColor.value,tu(i)),f.isFog?(g.fogNear.value=f.near,g.fogFar.value=f.far):f.isFogExp2&&(g.fogDensity.value=f.density)}function s(g,f,_,w,M){f.isMeshBasicMaterial||f.isMeshLambertMaterial?r(g,f):f.isMeshToonMaterial?(r(g,f),d(g,f)):f.isMeshPhongMaterial?(r(g,f),h(g,f)):f.isMeshStandardMaterial?(r(g,f),u(g,f),f.isMeshPhysicalMaterial&&p(g,f,M)):f.isMeshMatcapMaterial?(r(g,f),m(g,f)):f.isMeshDepthMaterial?r(g,f):f.isMeshDistanceMaterial?(r(g,f),v(g,f)):f.isMeshNormalMaterial?r(g,f):f.isLineBasicMaterial?(o(g,f),f.isLineDashedMaterial&&a(g,f)):f.isPointsMaterial?l(g,f,_,w):f.isSpriteMaterial?c(g,f):f.isShadowMaterial?(g.color.value.copy(f.color),g.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(g,f){g.opacity.value=f.opacity,f.color&&g.diffuse.value.copy(f.color),f.emissive&&g.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(g.map.value=f.map,e(f.map,g.mapTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,e(f.alphaMap,g.alphaMapTransform)),f.bumpMap&&(g.bumpMap.value=f.bumpMap,e(f.bumpMap,g.bumpMapTransform),g.bumpScale.value=f.bumpScale,f.side===Ve&&(g.bumpScale.value*=-1)),f.normalMap&&(g.normalMap.value=f.normalMap,e(f.normalMap,g.normalMapTransform),g.normalScale.value.copy(f.normalScale),f.side===Ve&&g.normalScale.value.negate()),f.displacementMap&&(g.displacementMap.value=f.displacementMap,e(f.displacementMap,g.displacementMapTransform),g.displacementScale.value=f.displacementScale,g.displacementBias.value=f.displacementBias),f.emissiveMap&&(g.emissiveMap.value=f.emissiveMap,e(f.emissiveMap,g.emissiveMapTransform)),f.specularMap&&(g.specularMap.value=f.specularMap,e(f.specularMap,g.specularMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest);let _=t.get(f),w=_.envMap,M=_.envMapRotation;w&&(g.envMap.value=w,bs.copy(M),bs.x*=-1,bs.y*=-1,bs.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(bs.y*=-1,bs.z*=-1),g.envMapRotation.value.setFromMatrix4(yw.makeRotationFromEuler(bs)),g.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=f.reflectivity,g.ior.value=f.ior,g.refractionRatio.value=f.refractionRatio),f.lightMap&&(g.lightMap.value=f.lightMap,g.lightMapIntensity.value=f.lightMapIntensity,e(f.lightMap,g.lightMapTransform)),f.aoMap&&(g.aoMap.value=f.aoMap,g.aoMapIntensity.value=f.aoMapIntensity,e(f.aoMap,g.aoMapTransform))}function o(g,f){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,f.map&&(g.map.value=f.map,e(f.map,g.mapTransform))}function a(g,f){g.dashSize.value=f.dashSize,g.totalSize.value=f.dashSize+f.gapSize,g.scale.value=f.scale}function l(g,f,_,w){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,g.size.value=f.size*_,g.scale.value=w*.5,f.map&&(g.map.value=f.map,e(f.map,g.uvTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,e(f.alphaMap,g.alphaMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest)}function c(g,f){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,g.rotation.value=f.rotation,f.map&&(g.map.value=f.map,e(f.map,g.mapTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,e(f.alphaMap,g.alphaMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest)}function h(g,f){g.specular.value.copy(f.specular),g.shininess.value=Math.max(f.shininess,1e-4)}function d(g,f){f.gradientMap&&(g.gradientMap.value=f.gradientMap)}function u(g,f){g.metalness.value=f.metalness,f.metalnessMap&&(g.metalnessMap.value=f.metalnessMap,e(f.metalnessMap,g.metalnessMapTransform)),g.roughness.value=f.roughness,f.roughnessMap&&(g.roughnessMap.value=f.roughnessMap,e(f.roughnessMap,g.roughnessMapTransform)),f.envMap&&(g.envMapIntensity.value=f.envMapIntensity)}function p(g,f,_){g.ior.value=f.ior,f.sheen>0&&(g.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),g.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(g.sheenColorMap.value=f.sheenColorMap,e(f.sheenColorMap,g.sheenColorMapTransform)),f.sheenRoughnessMap&&(g.sheenRoughnessMap.value=f.sheenRoughnessMap,e(f.sheenRoughnessMap,g.sheenRoughnessMapTransform))),f.clearcoat>0&&(g.clearcoat.value=f.clearcoat,g.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(g.clearcoatMap.value=f.clearcoatMap,e(f.clearcoatMap,g.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,e(f.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(g.clearcoatNormalMap.value=f.clearcoatNormalMap,e(f.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Ve&&g.clearcoatNormalScale.value.negate())),f.dispersion>0&&(g.dispersion.value=f.dispersion),f.iridescence>0&&(g.iridescence.value=f.iridescence,g.iridescenceIOR.value=f.iridescenceIOR,g.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(g.iridescenceMap.value=f.iridescenceMap,e(f.iridescenceMap,g.iridescenceMapTransform)),f.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=f.iridescenceThicknessMap,e(f.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),f.transmission>0&&(g.transmission.value=f.transmission,g.transmissionSamplerMap.value=_.texture,g.transmissionSamplerSize.value.set(_.width,_.height),f.transmissionMap&&(g.transmissionMap.value=f.transmissionMap,e(f.transmissionMap,g.transmissionMapTransform)),g.thickness.value=f.thickness,f.thicknessMap&&(g.thicknessMap.value=f.thicknessMap,e(f.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=f.attenuationDistance,g.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(g.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(g.anisotropyMap.value=f.anisotropyMap,e(f.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=f.specularIntensity,g.specularColor.value.copy(f.specularColor),f.specularColorMap&&(g.specularColorMap.value=f.specularColorMap,e(f.specularColorMap,g.specularColorMapTransform)),f.specularIntensityMap&&(g.specularIntensityMap.value=f.specularIntensityMap,e(f.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,f){f.matcap&&(g.matcap.value=f.matcap)}function v(g,f){let _=t.get(f).light;g.referencePosition.value.setFromMatrixPosition(_.matrixWorld),g.nearDistance.value=_.shadow.camera.near,g.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Mw(i,t,e,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,w){let M=w.program;n.uniformBlockBinding(_,M)}function c(_,w){let M=s[_.id];M===void 0&&(m(_),M=h(_),s[_.id]=M,_.addEventListener("dispose",g));let E=w.program;n.updateUBOMapping(_,E);let A=t.render.frame;r[_.id]!==A&&(u(_),r[_.id]=A)}function h(_){let w=d();_.__bindingPointIndex=w;let M=i.createBuffer(),E=_.__size,A=_.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,E,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,w,M),M}function d(){for(let _=0;_<a;_++)if(o.indexOf(_)===-1)return o.push(_),_;return Nt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(_){let w=s[_.id],M=_.uniforms,E=_.__cache;i.bindBuffer(i.UNIFORM_BUFFER,w);for(let A=0,T=M.length;A<T;A++){let F=Array.isArray(M[A])?M[A]:[M[A]];for(let x=0,y=F.length;x<y;x++){let P=F[x];if(p(P,A,x,E)===!0){let N=P.__offset,R=Array.isArray(P.value)?P.value:[P.value],D=0;for(let O=0;O<R.length;O++){let L=R[O],G=v(L);typeof L=="number"||typeof L=="boolean"?(P.__data[0]=L,i.bufferSubData(i.UNIFORM_BUFFER,N+D,P.__data)):L.isMatrix3?(P.__data[0]=L.elements[0],P.__data[1]=L.elements[1],P.__data[2]=L.elements[2],P.__data[3]=0,P.__data[4]=L.elements[3],P.__data[5]=L.elements[4],P.__data[6]=L.elements[5],P.__data[7]=0,P.__data[8]=L.elements[6],P.__data[9]=L.elements[7],P.__data[10]=L.elements[8],P.__data[11]=0):(L.toArray(P.__data,D),D+=G.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,N,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(_,w,M,E){let A=_.value,T=w+"_"+M;if(E[T]===void 0)return typeof A=="number"||typeof A=="boolean"?E[T]=A:E[T]=A.clone(),!0;{let F=E[T];if(typeof A=="number"||typeof A=="boolean"){if(F!==A)return E[T]=A,!0}else if(F.equals(A)===!1)return F.copy(A),!0}return!1}function m(_){let w=_.uniforms,M=0,E=16;for(let T=0,F=w.length;T<F;T++){let x=Array.isArray(w[T])?w[T]:[w[T]];for(let y=0,P=x.length;y<P;y++){let N=x[y],R=Array.isArray(N.value)?N.value:[N.value];for(let D=0,O=R.length;D<O;D++){let L=R[D],G=v(L),q=M%E,Z=q%G.boundary,et=q+Z;M+=Z,et!==0&&E-et<G.storage&&(M+=E-et),N.__data=new Float32Array(G.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=M,M+=G.storage}}}let A=M%E;return A>0&&(M+=E-A),_.__size=M,_.__cache={},this}function v(_){let w={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(w.boundary=4,w.storage=4):_.isVector2?(w.boundary=8,w.storage=8):_.isVector3||_.isColor?(w.boundary=16,w.storage=12):_.isVector4?(w.boundary=16,w.storage=16):_.isMatrix3?(w.boundary=48,w.storage=48):_.isMatrix4?(w.boundary=64,w.storage=64):_.isTexture?Dt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Dt("WebGLRenderer: Unsupported uniform value type.",_),w}function g(_){let w=_.target;w.removeEventListener("dispose",g);let M=o.indexOf(w.__bindingPointIndex);o.splice(M,1),i.deleteBuffer(s[w.id]),delete s[w.id],delete r[w.id]}function f(){for(let _ in s)i.deleteBuffer(s[_]);o=[],s={},r={}}return{bind:l,update:c,dispose:f}}var Sw=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Wn=null;function Ew(){return Wn===null&&(Wn=new Xa(Sw,16,16,vs,sn),Wn.name="DFG_LUT",Wn.minFilter=Oe,Wn.magFilter=Oe,Wn.wrapS=zn,Wn.wrapT=zn,Wn.generateMipmaps=!1,Wn.needsUpdate=!0),Wn}var ac=class{constructor(t={}){let{canvas:e=sm(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:p=nn}=t;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=o;let v=p,g=new Set([Ml,wl,yl]),f=new Set([nn,Nn,hr,ur,xl,bl]),_=new Uint32Array(4),w=new Int32Array(4),M=null,E=null,A=[],T=[],F=null;this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Fn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let x=this,y=!1;this._outputColorSpace=dn;let P=0,N=0,R=null,D=-1,O=null,L=new Me,G=new Me,q=null,Z=new Ut(0),et=0,it=e.width,nt=e.height,_t=1,Bt=null,Lt=null,$=new Me(0,0,it,nt),J=new Me(0,0,it,nt),ft=!1,Tt=new sr,gt=!1,Wt=!1,le=new we,Vt=new H,jt=new Me,se={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},zt=!1;function xe(){return R===null?_t:1}let U=n;function be(C,V){return e.getContext(C,V)}try{let C={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"182"}`),e.addEventListener("webglcontextlost",kt,!1),e.addEventListener("webglcontextrestored",pe,!1),e.addEventListener("webglcontextcreationerror",ce,!1),U===null){let V="webgl2";if(U=be(V,C),U===null)throw be(V)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(C){throw Nt("WebGLRenderer: "+C.message),C}let Jt,re,St,I,b,z,K,Q,j,wt,at,xt,It,st,ct,Mt,At,lt,Ot,k,ut,ot,vt,rt;function tt(){Jt=new Lb(U),Jt.init(),ot=new _w(U,Jt),re=new Mb(U,Jt,t,ot),St=new gw(U,Jt),re.reversedDepthBuffer&&u&&St.buffers.depth.setReversed(!0),I=new Db(U),b=new ew,z=new vw(U,Jt,St,b,re,ot,I),K=new Eb(x),Q=new Ib(x),j=new kv(U),vt=new yb(U,j),wt=new Fb(U,j,I,vt),at=new Ub(U,wt,j,I),Ot=new Bb(U,re,z),Mt=new Sb(b),xt=new tw(x,K,Q,Jt,re,vt,Mt),It=new ww(x,b),st=new iw,ct=new cw(Jt),lt=new bb(x,K,Q,St,at,m,l),At=new fw(x,at,re),rt=new Mw(U,I,re,St),k=new wb(U,Jt,I),ut=new Nb(U,Jt,I),I.programs=xt.programs,x.capabilities=re,x.extensions=Jt,x.properties=b,x.renderLists=st,x.shadowMap=At,x.state=St,x.info=I}tt(),v!==nn&&(F=new kb(v,e.width,e.height,s,r));let ht=new _u(x,U);this.xr=ht,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let C=Jt.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){let C=Jt.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return _t},this.setPixelRatio=function(C){C!==void 0&&(_t=C,this.setSize(it,nt,!1))},this.getSize=function(C){return C.set(it,nt)},this.setSize=function(C,V,Y=!0){if(ht.isPresenting){Dt("WebGLRenderer: Can't change size while VR device is presenting.");return}it=C,nt=V,e.width=Math.floor(C*_t),e.height=Math.floor(V*_t),Y===!0&&(e.style.width=C+"px",e.style.height=V+"px"),F!==null&&F.setSize(e.width,e.height),this.setViewport(0,0,C,V)},this.getDrawingBufferSize=function(C){return C.set(it*_t,nt*_t).floor()},this.setDrawingBufferSize=function(C,V,Y){it=C,nt=V,_t=Y,e.width=Math.floor(C*Y),e.height=Math.floor(V*Y),this.setViewport(0,0,C,V)},this.setEffects=function(C){if(v===nn){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(C){for(let V=0;V<C.length;V++)if(C[V].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}F.setEffects(C||[])},this.getCurrentViewport=function(C){return C.copy(L)},this.getViewport=function(C){return C.copy($)},this.setViewport=function(C,V,Y,X){C.isVector4?$.set(C.x,C.y,C.z,C.w):$.set(C,V,Y,X),St.viewport(L.copy($).multiplyScalar(_t).round())},this.getScissor=function(C){return C.copy(J)},this.setScissor=function(C,V,Y,X){C.isVector4?J.set(C.x,C.y,C.z,C.w):J.set(C,V,Y,X),St.scissor(G.copy(J).multiplyScalar(_t).round())},this.getScissorTest=function(){return ft},this.setScissorTest=function(C){St.setScissorTest(ft=C)},this.setOpaqueSort=function(C){Bt=C},this.setTransparentSort=function(C){Lt=C},this.getClearColor=function(C){return C.copy(lt.getClearColor())},this.setClearColor=function(){lt.setClearColor(...arguments)},this.getClearAlpha=function(){return lt.getClearAlpha()},this.setClearAlpha=function(){lt.setClearAlpha(...arguments)},this.clear=function(C=!0,V=!0,Y=!0){let X=0;if(C){let W=!1;if(R!==null){let dt=R.texture.format;W=g.has(dt)}if(W){let dt=R.texture.type,bt=f.has(dt),mt=lt.getClearColor(),Et=lt.getClearAlpha(),Ct=mt.r,Ft=mt.g,Pt=mt.b;bt?(_[0]=Ct,_[1]=Ft,_[2]=Pt,_[3]=Et,U.clearBufferuiv(U.COLOR,0,_)):(w[0]=Ct,w[1]=Ft,w[2]=Pt,w[3]=Et,U.clearBufferiv(U.COLOR,0,w))}else X|=U.COLOR_BUFFER_BIT}V&&(X|=U.DEPTH_BUFFER_BIT),Y&&(X|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),U.clear(X)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",kt,!1),e.removeEventListener("webglcontextrestored",pe,!1),e.removeEventListener("webglcontextcreationerror",ce,!1),lt.dispose(),st.dispose(),ct.dispose(),b.dispose(),K.dispose(),Q.dispose(),at.dispose(),vt.dispose(),rt.dispose(),xt.dispose(),ht.dispose(),ht.removeEventListener("sessionstart",Jp),ht.removeEventListener("sessionend",Qp),ts.stop()};function kt(C){C.preventDefault(),Qh("WebGLRenderer: Context Lost."),y=!0}function pe(){Qh("WebGLRenderer: Context Restored."),y=!1;let C=I.autoReset,V=At.enabled,Y=At.autoUpdate,X=At.needsUpdate,W=At.type;tt(),I.autoReset=C,At.enabled=V,At.autoUpdate=Y,At.needsUpdate=X,At.type=W}function ce(C){Nt("WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function On(C){let V=C.target;V.removeEventListener("dispose",On),ti(V)}function ti(C){J0(C),b.remove(C)}function J0(C){let V=b.get(C).programs;V!==void 0&&(V.forEach(function(Y){xt.releaseProgram(Y)}),C.isShaderMaterial&&xt.releaseShaderCache(C))}this.renderBufferDirect=function(C,V,Y,X,W,dt){V===null&&(V=se);let bt=W.isMesh&&W.matrixWorld.determinant()<0,mt=tv(C,V,Y,X,W);St.setMaterial(X,bt);let Et=Y.index,Ct=1;if(X.wireframe===!0){if(Et=wt.getWireframeAttribute(Y),Et===void 0)return;Ct=2}let Ft=Y.drawRange,Pt=Y.attributes.position,Yt=Ft.start*Ct,ue=(Ft.start+Ft.count)*Ct;dt!==null&&(Yt=Math.max(Yt,dt.start*Ct),ue=Math.min(ue,(dt.start+dt.count)*Ct)),Et!==null?(Yt=Math.max(Yt,0),ue=Math.min(ue,Et.count)):Pt!=null&&(Yt=Math.max(Yt,0),ue=Math.min(ue,Pt.count));let Ee=ue-Yt;if(Ee<0||Ee===1/0)return;vt.setup(W,X,mt,Y,Et);let Ae,de=k;if(Et!==null&&(Ae=j.get(Et),de=ut,de.setIndex(Ae)),W.isMesh)X.wireframe===!0?(St.setLineWidth(X.wireframeLinewidth*xe()),de.setMode(U.LINES)):de.setMode(U.TRIANGLES);else if(W.isLine){let Rt=X.linewidth;Rt===void 0&&(Rt=1),St.setLineWidth(Rt*xe()),W.isLineSegments?de.setMode(U.LINES):W.isLineLoop?de.setMode(U.LINE_LOOP):de.setMode(U.LINE_STRIP)}else W.isPoints?de.setMode(U.POINTS):W.isSprite&&de.setMode(U.TRIANGLES);if(W.isBatchedMesh)if(W._multiDrawInstances!==null)tr("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),de.renderMultiDrawInstances(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount,W._multiDrawInstances);else if(Jt.get("WEBGL_multi_draw"))de.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{let Rt=W._multiDrawStarts,he=W._multiDrawCounts,ee=W._multiDrawCount,ln=Et?j.get(Et).bytesPerElement:1,ks=b.get(X).currentProgram.getUniforms();for(let cn=0;cn<ee;cn++)ks.setValue(U,"_gl_DrawID",cn),de.render(Rt[cn]/ln,he[cn])}else if(W.isInstancedMesh)de.renderInstances(Yt,Ee,W.count);else if(Y.isInstancedBufferGeometry){let Rt=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,he=Math.min(Y.instanceCount,Rt);de.renderInstances(Yt,Ee,he)}else de.render(Yt,Ee)};function Kp(C,V,Y){C.transparent===!0&&C.side===Hn&&C.forceSinglePass===!1?(C.side=Ve,C.needsUpdate=!0,fa(C,V,Y),C.side=ai,C.needsUpdate=!0,fa(C,V,Y),C.side=Hn):fa(C,V,Y)}this.compile=function(C,V,Y=null){Y===null&&(Y=C),E=ct.get(Y),E.init(V),T.push(E),Y.traverseVisible(function(W){W.isLight&&W.layers.test(V.layers)&&(E.pushLight(W),W.castShadow&&E.pushShadow(W))}),C!==Y&&C.traverseVisible(function(W){W.isLight&&W.layers.test(V.layers)&&(E.pushLight(W),W.castShadow&&E.pushShadow(W))}),E.setupLights();let X=new Set;return C.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;let dt=W.material;if(dt)if(Array.isArray(dt))for(let bt=0;bt<dt.length;bt++){let mt=dt[bt];Kp(mt,Y,W),X.add(mt)}else Kp(dt,Y,W),X.add(dt)}),E=T.pop(),X},this.compileAsync=function(C,V,Y=null){let X=this.compile(C,V,Y);return new Promise(W=>{function dt(){if(X.forEach(function(bt){b.get(bt).currentProgram.isReady()&&X.delete(bt)}),X.size===0){W(C);return}setTimeout(dt,10)}Jt.get("KHR_parallel_shader_compile")!==null?dt():setTimeout(dt,10)})};let th=null;function Q0(C){th&&th(C)}function Jp(){ts.stop()}function Qp(){ts.start()}let ts=new Rm;ts.setAnimationLoop(Q0),typeof self<"u"&&ts.setContext(self),this.setAnimationLoop=function(C){th=C,ht.setAnimationLoop(C),C===null?ts.stop():ts.start()},ht.addEventListener("sessionstart",Jp),ht.addEventListener("sessionend",Qp),this.render=function(C,V){if(V!==void 0&&V.isCamera!==!0){Nt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(y===!0)return;let Y=ht.enabled===!0&&ht.isPresenting===!0,X=F!==null&&(R===null||Y)&&F.begin(x,R);if(C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),V.parent===null&&V.matrixWorldAutoUpdate===!0&&V.updateMatrixWorld(),ht.enabled===!0&&ht.isPresenting===!0&&(F===null||F.isCompositing()===!1)&&(ht.cameraAutoUpdate===!0&&ht.updateCamera(V),V=ht.getCamera()),C.isScene===!0&&C.onBeforeRender(x,C,V,R),E=ct.get(C,T.length),E.init(V),T.push(E),le.multiplyMatrices(V.projectionMatrix,V.matrixWorldInverse),Tt.setFromProjectionMatrix(le,In,V.reversedDepth),Wt=this.localClippingEnabled,gt=Mt.init(this.clippingPlanes,Wt),M=st.get(C,A.length),M.init(),A.push(M),ht.enabled===!0&&ht.isPresenting===!0){let bt=x.xr.getDepthSensingMesh();bt!==null&&eh(bt,V,-1/0,x.sortObjects)}eh(C,V,0,x.sortObjects),M.finish(),x.sortObjects===!0&&M.sort(Bt,Lt),zt=ht.enabled===!1||ht.isPresenting===!1||ht.hasDepthSensing()===!1,zt&&lt.addToRenderList(M,C),this.info.render.frame++,gt===!0&&Mt.beginShadows();let W=E.state.shadowsArray;if(At.render(W,C,V),gt===!0&&Mt.endShadows(),this.info.autoReset===!0&&this.info.reset(),(X&&F.hasRenderPass())===!1){let bt=M.opaque,mt=M.transmissive;if(E.setupLights(),V.isArrayCamera){let Et=V.cameras;if(mt.length>0)for(let Ct=0,Ft=Et.length;Ct<Ft;Ct++){let Pt=Et[Ct];ef(bt,mt,C,Pt)}zt&&lt.render(C);for(let Ct=0,Ft=Et.length;Ct<Ft;Ct++){let Pt=Et[Ct];tf(M,C,Pt,Pt.viewport)}}else mt.length>0&&ef(bt,mt,C,V),zt&&lt.render(C),tf(M,C,V)}R!==null&&N===0&&(z.updateMultisampleRenderTarget(R),z.updateRenderTargetMipmap(R)),X&&F.end(x),C.isScene===!0&&C.onAfterRender(x,C,V),vt.resetDefaultState(),D=-1,O=null,T.pop(),T.length>0?(E=T[T.length-1],gt===!0&&Mt.setGlobalState(x.clippingPlanes,E.state.camera)):E=null,A.pop(),A.length>0?M=A[A.length-1]:M=null};function eh(C,V,Y,X){if(C.visible===!1)return;if(C.layers.test(V.layers)){if(C.isGroup)Y=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(V);else if(C.isLight)E.pushLight(C),C.castShadow&&E.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||Tt.intersectsSprite(C)){X&&jt.setFromMatrixPosition(C.matrixWorld).applyMatrix4(le);let bt=at.update(C),mt=C.material;mt.visible&&M.push(C,bt,mt,Y,jt.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(!C.frustumCulled||Tt.intersectsObject(C))){let bt=at.update(C),mt=C.material;if(X&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),jt.copy(C.boundingSphere.center)):(bt.boundingSphere===null&&bt.computeBoundingSphere(),jt.copy(bt.boundingSphere.center)),jt.applyMatrix4(C.matrixWorld).applyMatrix4(le)),Array.isArray(mt)){let Et=bt.groups;for(let Ct=0,Ft=Et.length;Ct<Ft;Ct++){let Pt=Et[Ct],Yt=mt[Pt.materialIndex];Yt&&Yt.visible&&M.push(C,bt,Yt,Y,jt.z,Pt)}}else mt.visible&&M.push(C,bt,mt,Y,jt.z,null)}}let dt=C.children;for(let bt=0,mt=dt.length;bt<mt;bt++)eh(dt[bt],V,Y,X)}function tf(C,V,Y,X){let{opaque:W,transmissive:dt,transparent:bt}=C;E.setupLightsView(Y),gt===!0&&Mt.setGlobalState(x.clippingPlanes,Y),X&&St.viewport(L.copy(X)),W.length>0&&pa(W,V,Y),dt.length>0&&pa(dt,V,Y),bt.length>0&&pa(bt,V,Y),St.buffers.depth.setTest(!0),St.buffers.depth.setMask(!0),St.buffers.color.setMask(!0),St.setPolygonOffset(!1)}function ef(C,V,Y,X){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[X.id]===void 0){let Yt=Jt.has("EXT_color_buffer_half_float")||Jt.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[X.id]=new ke(1,1,{generateMipmaps:!0,type:Yt?sn:nn,minFilter:Vi,samples:re.samples,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Zt.workingColorSpace})}let dt=E.state.transmissionRenderTarget[X.id],bt=X.viewport||L;dt.setSize(bt.z*x.transmissionResolutionScale,bt.w*x.transmissionResolutionScale);let mt=x.getRenderTarget(),Et=x.getActiveCubeFace(),Ct=x.getActiveMipmapLevel();x.setRenderTarget(dt),x.getClearColor(Z),et=x.getClearAlpha(),et<1&&x.setClearColor(16777215,.5),x.clear(),zt&&lt.render(Y);let Ft=x.toneMapping;x.toneMapping=Fn;let Pt=X.viewport;if(X.viewport!==void 0&&(X.viewport=void 0),E.setupLightsView(X),gt===!0&&Mt.setGlobalState(x.clippingPlanes,X),pa(C,Y,X),z.updateMultisampleRenderTarget(dt),z.updateRenderTargetMipmap(dt),Jt.has("WEBGL_multisampled_render_to_texture")===!1){let Yt=!1;for(let ue=0,Ee=V.length;ue<Ee;ue++){let Ae=V[ue],{object:de,geometry:Rt,material:he,group:ee}=Ae;if(he.side===Hn&&de.layers.test(X.layers)){let ln=he.side;he.side=Ve,he.needsUpdate=!0,nf(de,Y,X,Rt,he,ee),he.side=ln,he.needsUpdate=!0,Yt=!0}}Yt===!0&&(z.updateMultisampleRenderTarget(dt),z.updateRenderTargetMipmap(dt))}x.setRenderTarget(mt,Et,Ct),x.setClearColor(Z,et),Pt!==void 0&&(X.viewport=Pt),x.toneMapping=Ft}function pa(C,V,Y){let X=V.isScene===!0?V.overrideMaterial:null;for(let W=0,dt=C.length;W<dt;W++){let bt=C[W],{object:mt,geometry:Et,group:Ct}=bt,Ft=bt.material;Ft.allowOverride===!0&&X!==null&&(Ft=X),mt.layers.test(Y.layers)&&nf(mt,V,Y,Et,Ft,Ct)}}function nf(C,V,Y,X,W,dt){C.onBeforeRender(x,V,Y,X,W,dt),C.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),W.onBeforeRender(x,V,Y,X,C,dt),W.transparent===!0&&W.side===Hn&&W.forceSinglePass===!1?(W.side=Ve,W.needsUpdate=!0,x.renderBufferDirect(Y,V,X,W,C,dt),W.side=ai,W.needsUpdate=!0,x.renderBufferDirect(Y,V,X,W,C,dt),W.side=Hn):x.renderBufferDirect(Y,V,X,W,C,dt),C.onAfterRender(x,V,Y,X,W,dt)}function fa(C,V,Y){V.isScene!==!0&&(V=se);let X=b.get(C),W=E.state.lights,dt=E.state.shadowsArray,bt=W.state.version,mt=xt.getParameters(C,W.state,dt,V,Y),Et=xt.getProgramCacheKey(mt),Ct=X.programs;X.environment=C.isMeshStandardMaterial?V.environment:null,X.fog=V.fog,X.envMap=(C.isMeshStandardMaterial?Q:K).get(C.envMap||X.environment),X.envMapRotation=X.environment!==null&&C.envMap===null?V.environmentRotation:C.envMapRotation,Ct===void 0&&(C.addEventListener("dispose",On),Ct=new Map,X.programs=Ct);let Ft=Ct.get(Et);if(Ft!==void 0){if(X.currentProgram===Ft&&X.lightsStateVersion===bt)return rf(C,mt),Ft}else mt.uniforms=xt.getUniforms(C),C.onBeforeCompile(mt,x),Ft=xt.acquireProgram(mt,Et),Ct.set(Et,Ft),X.uniforms=mt.uniforms;let Pt=X.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(Pt.clippingPlanes=Mt.uniform),rf(C,mt),X.needsLights=nv(C),X.lightsStateVersion=bt,X.needsLights&&(Pt.ambientLightColor.value=W.state.ambient,Pt.lightProbe.value=W.state.probe,Pt.directionalLights.value=W.state.directional,Pt.directionalLightShadows.value=W.state.directionalShadow,Pt.spotLights.value=W.state.spot,Pt.spotLightShadows.value=W.state.spotShadow,Pt.rectAreaLights.value=W.state.rectArea,Pt.ltc_1.value=W.state.rectAreaLTC1,Pt.ltc_2.value=W.state.rectAreaLTC2,Pt.pointLights.value=W.state.point,Pt.pointLightShadows.value=W.state.pointShadow,Pt.hemisphereLights.value=W.state.hemi,Pt.directionalShadowMap.value=W.state.directionalShadowMap,Pt.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Pt.spotShadowMap.value=W.state.spotShadowMap,Pt.spotLightMatrix.value=W.state.spotLightMatrix,Pt.spotLightMap.value=W.state.spotLightMap,Pt.pointShadowMap.value=W.state.pointShadowMap,Pt.pointShadowMatrix.value=W.state.pointShadowMatrix),X.currentProgram=Ft,X.uniformsList=null,Ft}function sf(C){if(C.uniformsList===null){let V=C.currentProgram.getUniforms();C.uniformsList=pr.seqWithValue(V.seq,C.uniforms)}return C.uniformsList}function rf(C,V){let Y=b.get(C);Y.outputColorSpace=V.outputColorSpace,Y.batching=V.batching,Y.batchingColor=V.batchingColor,Y.instancing=V.instancing,Y.instancingColor=V.instancingColor,Y.instancingMorph=V.instancingMorph,Y.skinning=V.skinning,Y.morphTargets=V.morphTargets,Y.morphNormals=V.morphNormals,Y.morphColors=V.morphColors,Y.morphTargetsCount=V.morphTargetsCount,Y.numClippingPlanes=V.numClippingPlanes,Y.numIntersection=V.numClipIntersection,Y.vertexAlphas=V.vertexAlphas,Y.vertexTangents=V.vertexTangents,Y.toneMapping=V.toneMapping}function tv(C,V,Y,X,W){V.isScene!==!0&&(V=se),z.resetTextureUnits();let dt=V.fog,bt=X.isMeshStandardMaterial?V.environment:null,mt=R===null?x.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:cs,Et=(X.isMeshStandardMaterial?Q:K).get(X.envMap||bt),Ct=X.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,Ft=!!Y.attributes.tangent&&(!!X.normalMap||X.anisotropy>0),Pt=!!Y.morphAttributes.position,Yt=!!Y.morphAttributes.normal,ue=!!Y.morphAttributes.color,Ee=Fn;X.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(Ee=x.toneMapping);let Ae=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,de=Ae!==void 0?Ae.length:0,Rt=b.get(X),he=E.state.lights;if(gt===!0&&(Wt===!0||C!==O)){let Xe=C===O&&X.id===D;Mt.setState(X,C,Xe)}let ee=!1;X.version===Rt.__version?(Rt.needsLights&&Rt.lightsStateVersion!==he.state.version||Rt.outputColorSpace!==mt||W.isBatchedMesh&&Rt.batching===!1||!W.isBatchedMesh&&Rt.batching===!0||W.isBatchedMesh&&Rt.batchingColor===!0&&W.colorTexture===null||W.isBatchedMesh&&Rt.batchingColor===!1&&W.colorTexture!==null||W.isInstancedMesh&&Rt.instancing===!1||!W.isInstancedMesh&&Rt.instancing===!0||W.isSkinnedMesh&&Rt.skinning===!1||!W.isSkinnedMesh&&Rt.skinning===!0||W.isInstancedMesh&&Rt.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Rt.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Rt.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Rt.instancingMorph===!1&&W.morphTexture!==null||Rt.envMap!==Et||X.fog===!0&&Rt.fog!==dt||Rt.numClippingPlanes!==void 0&&(Rt.numClippingPlanes!==Mt.numPlanes||Rt.numIntersection!==Mt.numIntersection)||Rt.vertexAlphas!==Ct||Rt.vertexTangents!==Ft||Rt.morphTargets!==Pt||Rt.morphNormals!==Yt||Rt.morphColors!==ue||Rt.toneMapping!==Ee||Rt.morphTargetsCount!==de)&&(ee=!0):(ee=!0,Rt.__version=X.version);let ln=Rt.currentProgram;ee===!0&&(ln=fa(X,V,W));let ks=!1,cn=!1,Fr=!1,fe=ln.getUniforms(),Ke=Rt.uniforms;if(St.useProgram(ln.program)&&(ks=!0,cn=!0,Fr=!0),X.id!==D&&(D=X.id,cn=!0),ks||O!==C){St.buffers.depth.getReversed()&&C.reversedDepth!==!0&&(C._reversedDepth=!0,C.updateProjectionMatrix()),fe.setValue(U,"projectionMatrix",C.projectionMatrix),fe.setValue(U,"viewMatrix",C.matrixWorldInverse);let Je=fe.map.cameraPosition;Je!==void 0&&Je.setValue(U,Vt.setFromMatrixPosition(C.matrixWorld)),re.logarithmicDepthBuffer&&fe.setValue(U,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(X.isMeshPhongMaterial||X.isMeshToonMaterial||X.isMeshLambertMaterial||X.isMeshBasicMaterial||X.isMeshStandardMaterial||X.isShaderMaterial)&&fe.setValue(U,"isOrthographic",C.isOrthographicCamera===!0),O!==C&&(O=C,cn=!0,Fr=!0)}if(Rt.needsLights&&(he.state.directionalShadowMap.length>0&&fe.setValue(U,"directionalShadowMap",he.state.directionalShadowMap,z),he.state.spotShadowMap.length>0&&fe.setValue(U,"spotShadowMap",he.state.spotShadowMap,z),he.state.pointShadowMap.length>0&&fe.setValue(U,"pointShadowMap",he.state.pointShadowMap,z)),W.isSkinnedMesh){fe.setOptional(U,W,"bindMatrix"),fe.setOptional(U,W,"bindMatrixInverse");let Xe=W.skeleton;Xe&&(Xe.boneTexture===null&&Xe.computeBoneTexture(),fe.setValue(U,"boneTexture",Xe.boneTexture,z))}W.isBatchedMesh&&(fe.setOptional(U,W,"batchingTexture"),fe.setValue(U,"batchingTexture",W._matricesTexture,z),fe.setOptional(U,W,"batchingIdTexture"),fe.setValue(U,"batchingIdTexture",W._indirectTexture,z),fe.setOptional(U,W,"batchingColorTexture"),W._colorsTexture!==null&&fe.setValue(U,"batchingColorTexture",W._colorsTexture,z));let bn=Y.morphAttributes;if((bn.position!==void 0||bn.normal!==void 0||bn.color!==void 0)&&Ot.update(W,Y,ln),(cn||Rt.receiveShadow!==W.receiveShadow)&&(Rt.receiveShadow=W.receiveShadow,fe.setValue(U,"receiveShadow",W.receiveShadow)),X.isMeshGouraudMaterial&&X.envMap!==null&&(Ke.envMap.value=Et,Ke.flipEnvMap.value=Et.isCubeTexture&&Et.isRenderTargetTexture===!1?-1:1),X.isMeshStandardMaterial&&X.envMap===null&&V.environment!==null&&(Ke.envMapIntensity.value=V.environmentIntensity),Ke.dfgLUT!==void 0&&(Ke.dfgLUT.value=Ew()),cn&&(fe.setValue(U,"toneMappingExposure",x.toneMappingExposure),Rt.needsLights&&ev(Ke,Fr),dt&&X.fog===!0&&It.refreshFogUniforms(Ke,dt),It.refreshMaterialUniforms(Ke,X,_t,nt,E.state.transmissionRenderTarget[C.id]),pr.upload(U,sf(Rt),Ke,z)),X.isShaderMaterial&&X.uniformsNeedUpdate===!0&&(pr.upload(U,sf(Rt),Ke,z),X.uniformsNeedUpdate=!1),X.isSpriteMaterial&&fe.setValue(U,"center",W.center),fe.setValue(U,"modelViewMatrix",W.modelViewMatrix),fe.setValue(U,"normalMatrix",W.normalMatrix),fe.setValue(U,"modelMatrix",W.matrixWorld),X.isShaderMaterial||X.isRawShaderMaterial){let Xe=X.uniformsGroups;for(let Je=0,nh=Xe.length;Je<nh;Je++){let es=Xe[Je];rt.update(es,ln),rt.bind(es,ln)}}return ln}function ev(C,V){C.ambientLightColor.needsUpdate=V,C.lightProbe.needsUpdate=V,C.directionalLights.needsUpdate=V,C.directionalLightShadows.needsUpdate=V,C.pointLights.needsUpdate=V,C.pointLightShadows.needsUpdate=V,C.spotLights.needsUpdate=V,C.spotLightShadows.needsUpdate=V,C.rectAreaLights.needsUpdate=V,C.hemisphereLights.needsUpdate=V}function nv(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return N},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(C,V,Y){let X=b.get(C);X.__autoAllocateDepthBuffer=C.resolveDepthBuffer===!1,X.__autoAllocateDepthBuffer===!1&&(X.__useRenderToTexture=!1),b.get(C.texture).__webglTexture=V,b.get(C.depthTexture).__webglTexture=X.__autoAllocateDepthBuffer?void 0:Y,X.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(C,V){let Y=b.get(C);Y.__webglFramebuffer=V,Y.__useDefaultFramebuffer=V===void 0};let iv=U.createFramebuffer();this.setRenderTarget=function(C,V=0,Y=0){R=C,P=V,N=Y;let X=null,W=!1,dt=!1;if(C){let mt=b.get(C);if(mt.__useDefaultFramebuffer!==void 0){St.bindFramebuffer(U.FRAMEBUFFER,mt.__webglFramebuffer),L.copy(C.viewport),G.copy(C.scissor),q=C.scissorTest,St.viewport(L),St.scissor(G),St.setScissorTest(q),D=-1;return}else if(mt.__webglFramebuffer===void 0)z.setupRenderTarget(C);else if(mt.__hasExternalTextures)z.rebindTextures(C,b.get(C.texture).__webglTexture,b.get(C.depthTexture).__webglTexture);else if(C.depthBuffer){let Ft=C.depthTexture;if(mt.__boundDepthTexture!==Ft){if(Ft!==null&&b.has(Ft)&&(C.width!==Ft.image.width||C.height!==Ft.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");z.setupDepthRenderbuffer(C)}}let Et=C.texture;(Et.isData3DTexture||Et.isDataArrayTexture||Et.isCompressedArrayTexture)&&(dt=!0);let Ct=b.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(Ct[V])?X=Ct[V][Y]:X=Ct[V],W=!0):C.samples>0&&z.useMultisampledRTT(C)===!1?X=b.get(C).__webglMultisampledFramebuffer:Array.isArray(Ct)?X=Ct[Y]:X=Ct,L.copy(C.viewport),G.copy(C.scissor),q=C.scissorTest}else L.copy($).multiplyScalar(_t).floor(),G.copy(J).multiplyScalar(_t).floor(),q=ft;if(Y!==0&&(X=iv),St.bindFramebuffer(U.FRAMEBUFFER,X)&&St.drawBuffers(C,X),St.viewport(L),St.scissor(G),St.setScissorTest(q),W){let mt=b.get(C.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+V,mt.__webglTexture,Y)}else if(dt){let mt=V;for(let Et=0;Et<C.textures.length;Et++){let Ct=b.get(C.textures[Et]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Et,Ct.__webglTexture,Y,mt)}}else if(C!==null&&Y!==0){let mt=b.get(C.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,mt.__webglTexture,Y)}D=-1},this.readRenderTargetPixels=function(C,V,Y,X,W,dt,bt,mt=0){if(!(C&&C.isWebGLRenderTarget)){Nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Et=b.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&bt!==void 0&&(Et=Et[bt]),Et){St.bindFramebuffer(U.FRAMEBUFFER,Et);try{let Ct=C.textures[mt],Ft=Ct.format,Pt=Ct.type;if(!re.textureFormatReadable(Ft)){Nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!re.textureTypeReadable(Pt)){Nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}V>=0&&V<=C.width-X&&Y>=0&&Y<=C.height-W&&(C.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+mt),U.readPixels(V,Y,X,W,ot.convert(Ft),ot.convert(Pt),dt))}finally{let Ct=R!==null?b.get(R).__webglFramebuffer:null;St.bindFramebuffer(U.FRAMEBUFFER,Ct)}}},this.readRenderTargetPixelsAsync=async function(C,V,Y,X,W,dt,bt,mt=0){if(!(C&&C.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Et=b.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&bt!==void 0&&(Et=Et[bt]),Et)if(V>=0&&V<=C.width-X&&Y>=0&&Y<=C.height-W){St.bindFramebuffer(U.FRAMEBUFFER,Et);let Ct=C.textures[mt],Ft=Ct.format,Pt=Ct.type;if(!re.textureFormatReadable(Ft))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!re.textureTypeReadable(Pt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Yt=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Yt),U.bufferData(U.PIXEL_PACK_BUFFER,dt.byteLength,U.STREAM_READ),C.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+mt),U.readPixels(V,Y,X,W,ot.convert(Ft),ot.convert(Pt),0);let ue=R!==null?b.get(R).__webglFramebuffer:null;St.bindFramebuffer(U.FRAMEBUFFER,ue);let Ee=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await rm(U,Ee,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Yt),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,dt),U.deleteBuffer(Yt),U.deleteSync(Ee),dt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(C,V=null,Y=0){let X=Math.pow(2,-Y),W=Math.floor(C.image.width*X),dt=Math.floor(C.image.height*X),bt=V!==null?V.x:0,mt=V!==null?V.y:0;z.setTexture2D(C,0),U.copyTexSubImage2D(U.TEXTURE_2D,Y,0,0,bt,mt,W,dt),St.unbindTexture()};let sv=U.createFramebuffer(),rv=U.createFramebuffer();this.copyTextureToTexture=function(C,V,Y=null,X=null,W=0,dt=null){dt===null&&(W!==0?(tr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),dt=W,W=0):dt=0);let bt,mt,Et,Ct,Ft,Pt,Yt,ue,Ee,Ae=C.isCompressedTexture?C.mipmaps[dt]:C.image;if(Y!==null)bt=Y.max.x-Y.min.x,mt=Y.max.y-Y.min.y,Et=Y.isBox3?Y.max.z-Y.min.z:1,Ct=Y.min.x,Ft=Y.min.y,Pt=Y.isBox3?Y.min.z:0;else{let bn=Math.pow(2,-W);bt=Math.floor(Ae.width*bn),mt=Math.floor(Ae.height*bn),C.isDataArrayTexture?Et=Ae.depth:C.isData3DTexture?Et=Math.floor(Ae.depth*bn):Et=1,Ct=0,Ft=0,Pt=0}X!==null?(Yt=X.x,ue=X.y,Ee=X.z):(Yt=0,ue=0,Ee=0);let de=ot.convert(V.format),Rt=ot.convert(V.type),he;V.isData3DTexture?(z.setTexture3D(V,0),he=U.TEXTURE_3D):V.isDataArrayTexture||V.isCompressedArrayTexture?(z.setTexture2DArray(V,0),he=U.TEXTURE_2D_ARRAY):(z.setTexture2D(V,0),he=U.TEXTURE_2D),U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,V.flipY),U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,V.premultiplyAlpha),U.pixelStorei(U.UNPACK_ALIGNMENT,V.unpackAlignment);let ee=U.getParameter(U.UNPACK_ROW_LENGTH),ln=U.getParameter(U.UNPACK_IMAGE_HEIGHT),ks=U.getParameter(U.UNPACK_SKIP_PIXELS),cn=U.getParameter(U.UNPACK_SKIP_ROWS),Fr=U.getParameter(U.UNPACK_SKIP_IMAGES);U.pixelStorei(U.UNPACK_ROW_LENGTH,Ae.width),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Ae.height),U.pixelStorei(U.UNPACK_SKIP_PIXELS,Ct),U.pixelStorei(U.UNPACK_SKIP_ROWS,Ft),U.pixelStorei(U.UNPACK_SKIP_IMAGES,Pt);let fe=C.isDataArrayTexture||C.isData3DTexture,Ke=V.isDataArrayTexture||V.isData3DTexture;if(C.isDepthTexture){let bn=b.get(C),Xe=b.get(V),Je=b.get(bn.__renderTarget),nh=b.get(Xe.__renderTarget);St.bindFramebuffer(U.READ_FRAMEBUFFER,Je.__webglFramebuffer),St.bindFramebuffer(U.DRAW_FRAMEBUFFER,nh.__webglFramebuffer);for(let es=0;es<Et;es++)fe&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,b.get(C).__webglTexture,W,Pt+es),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,b.get(V).__webglTexture,dt,Ee+es)),U.blitFramebuffer(Ct,Ft,bt,mt,Yt,ue,bt,mt,U.DEPTH_BUFFER_BIT,U.NEAREST);St.bindFramebuffer(U.READ_FRAMEBUFFER,null),St.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(W!==0||C.isRenderTargetTexture||b.has(C)){let bn=b.get(C),Xe=b.get(V);St.bindFramebuffer(U.READ_FRAMEBUFFER,sv),St.bindFramebuffer(U.DRAW_FRAMEBUFFER,rv);for(let Je=0;Je<Et;Je++)fe?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,bn.__webglTexture,W,Pt+Je):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,bn.__webglTexture,W),Ke?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Xe.__webglTexture,dt,Ee+Je):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Xe.__webglTexture,dt),W!==0?U.blitFramebuffer(Ct,Ft,bt,mt,Yt,ue,bt,mt,U.COLOR_BUFFER_BIT,U.NEAREST):Ke?U.copyTexSubImage3D(he,dt,Yt,ue,Ee+Je,Ct,Ft,bt,mt):U.copyTexSubImage2D(he,dt,Yt,ue,Ct,Ft,bt,mt);St.bindFramebuffer(U.READ_FRAMEBUFFER,null),St.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else Ke?C.isDataTexture||C.isData3DTexture?U.texSubImage3D(he,dt,Yt,ue,Ee,bt,mt,Et,de,Rt,Ae.data):V.isCompressedArrayTexture?U.compressedTexSubImage3D(he,dt,Yt,ue,Ee,bt,mt,Et,de,Ae.data):U.texSubImage3D(he,dt,Yt,ue,Ee,bt,mt,Et,de,Rt,Ae):C.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,dt,Yt,ue,bt,mt,de,Rt,Ae.data):C.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,dt,Yt,ue,Ae.width,Ae.height,de,Ae.data):U.texSubImage2D(U.TEXTURE_2D,dt,Yt,ue,bt,mt,de,Rt,Ae);U.pixelStorei(U.UNPACK_ROW_LENGTH,ee),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,ln),U.pixelStorei(U.UNPACK_SKIP_PIXELS,ks),U.pixelStorei(U.UNPACK_SKIP_ROWS,cn),U.pixelStorei(U.UNPACK_SKIP_IMAGES,Fr),dt===0&&V.generateMipmaps&&U.generateMipmap(he),St.unbindTexture()},this.initRenderTarget=function(C){b.get(C).__webglFramebuffer===void 0&&z.setupRenderTarget(C)},this.initTexture=function(C){C.isCubeTexture?z.setTextureCube(C,0):C.isData3DTexture?z.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?z.setTexture2DArray(C,0):z.setTexture2D(C,0),St.unbindTexture()},this.resetState=function(){P=0,N=0,R=null,St.reset(),vt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return In}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=Zt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Zt._getUnpackColorSpace()}};var Dm={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var mn=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},Aw=new ki(-1,1,1,-1,0,1),bu=class extends Pe{constructor(){super(),this.setAttribute("position",new Qt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Qt([0,2,0,0,2,0],2))}},Cw=new bu,qi=class{constructor(t){this._mesh=new me(Cw,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,Aw)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var hc=class extends mn{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof Be?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=Hi.clone(t.uniforms),this.material=new Be({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new qi(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var To=class extends mn{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){let s=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},uc=class extends mn{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var dc=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let n=t.getSize(new $t);this._width=n.width,this._height=n.height,e=new ke(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:sn}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new hc(Dm),this.copyPass.material.blending=en,this.clock=new lo}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let e=this.renderer.getRenderTarget(),n=!1;for(let s=0,r=this.passes.length;s<r;s++){let o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),o.needsSwap){if(n){let a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}To!==void 0&&(o instanceof To?n=!0:o instanceof uc&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new $t);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var pc=class extends mn{constructor(t,e,n=null,s=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Ut}render(t,e,n){let s=t.autoClear;t.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),t.autoClear=s}};var Po={name:"BokehShader",defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#include <common>

		varying vec2 vUv;

		uniform sampler2D tColor;
		uniform sampler2D tDepth;

		uniform float maxblur; // max blur amount
		uniform float aperture; // aperture - bigger values for shallower depth of field

		uniform float nearClip;
		uniform float farClip;

		uniform float focus;
		uniform float aspect;

		#include <packing>

		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, nearClip, farClip );
			#else
			return orthographicDepthToViewZ( depth, nearClip, farClip );
			#endif
		}


		void main() {

			vec2 aspectcorrect = vec2( 1.0, aspect );

			float viewZ = getViewZ( getDepth( vUv ) );

			float factor = ( focus + viewZ ); // viewZ is <= 0, so this is a difference equation

			vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );

			vec2 dofblur9 = dofblur * 0.9;
			vec2 dofblur7 = dofblur * 0.7;
			vec2 dofblur4 = dofblur * 0.4;

			vec4 col = vec4( 0.0 );

			col += texture2D( tColor, vUv.xy );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );

			gl_FragColor = col / 41.0;
			gl_FragColor.a = 1.0;

		}`};var fc=class extends mn{constructor(t,e,n){super(),this.scene=t,this.camera=e;let s=n.focus!==void 0?n.focus:1,r=n.aperture!==void 0?n.aperture:.025,o=n.maxblur!==void 0?n.maxblur:1;this._renderTargetDepth=new ke(1,1,{minFilter:Te,magFilter:Te,type:sn}),this._renderTargetDepth.texture.name="BokehPass.depth",this._materialDepth=new ar,this._materialDepth.depthPacking=$h,this._materialDepth.blending=en;let a=Hi.clone(Po.uniforms);a.tDepth.value=this._renderTargetDepth.texture,a.focus.value=s,a.aspect.value=e.aspect,a.aperture.value=r,a.maxblur.value=o,a.nearClip.value=e.near,a.farClip.value=e.far,this.materialBokeh=new Be({defines:Object.assign({},Po.defines),uniforms:a,vertexShader:Po.vertexShader,fragmentShader:Po.fragmentShader}),this.uniforms=a,this._fsQuad=new qi(this.materialBokeh),this._oldClearColor=new Ut}render(t,e,n){this.scene.overrideMaterial=this._materialDepth,t.getClearColor(this._oldClearColor);let s=t.getClearAlpha(),r=t.autoClear;t.autoClear=!1,t.setClearColor(16777215),t.setClearAlpha(1),t.setRenderTarget(this._renderTargetDepth),t.clear(),t.render(this.scene,this.camera),this.uniforms.tColor.value=n.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),t.clear(),this._fsQuad.render(t)),this.scene.overrideMaterial=null,t.setClearColor(this._oldClearColor),t.setClearAlpha(s),t.autoClear=r}setSize(t,e){this.materialBokeh.uniforms.aspect.value=t/e,this._renderTargetDepth.setSize(t,e)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}};var Ro={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var mc=class extends mn{constructor(){super(),this.isOutputPass=!0,this.uniforms=Hi.clone(Ro.uniforms),this.material=new or({name:Ro.name,uniforms:this.uniforms,vertexShader:Ro.vertexShader,fragmentShader:Ro.fragmentShader}),this._fsQuad=new qi(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},Zt.getTransfer(this._outputColorSpace)===ne&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===ho?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===uo?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===po?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===fo?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===go?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===vo?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===mo&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Tw=Math.pow(2,.08333333333333333),B={};function Bm(i){let t=[];for(let e=0;e<i.numChimes;e++){let n=e/i.numChimes*Math.PI*2;t.push({radius:i.chimeRadius,halfLen:i.chimeBaseHalfLen+e*i.chimeHalfLenStep,mass:i.chimeBaseMass+e*i.chimeMassStep,pivotAngle:n,stringLen:i.chimeBaseStringLen+e*i.chimeStringLenStep})}return t}function Um(i){return{radius:i.clapperRadius,mass:i.clapperMass,stringLen:i.clapperStringLen}}function yu(i){let t=i.chimeSemitones,e=Math.min(t.length,i.numChimes),n={};for(let o=0;o<e;o++){let a=t[o];n[a]=(n[a]||0)+1}let s={},r=[];for(let o=0;o<e;o++){let a=t[o],l=0;if(n[a]>1){let c=s[a]||0;s[a]=c+1,l=(c%2===0?1:-1)*i.detuneAmount}r.push(i.baseFreq*Math.pow(Tw,a+l))}return r}function Om(){let i=new ac({antialias:!0});i.setSize(window.innerWidth,window.innerHeight),i.setPixelRatio(window.devicePixelRatio),i.shadowMap.enabled=!0,i.shadowMap.type=al,document.body.appendChild(i.domElement);let t=new Qr;t.background=new Ut(460050),t.fog=new Jr(10508336,20,72);let e=new We(50,window.innerWidth/window.innerHeight,.1,200);e.position.set(0,1.5,3),e.lookAt(0,1.25,0);let n=new ao(2101272,.55);t.add(n);let s=new oo(B.lightColor,B.lightIntensity);s.position.set(B.lightDirX,B.lightDirY,B.lightDirZ),s.castShadow=!0,s.shadow.mapSize.width=1024,s.shadow.mapSize.height=1024,s.shadow.camera.near=.1,s.shadow.camera.far=20,s.shadow.camera.left=-3,s.shadow.camera.right=3,s.shadow.camera.top=5,s.shadow.camera.bottom=-3,t.add(s);let r=new ro(3162208,1708040,.3);t.add(r);let o=new ps(40,40),a=new ui({color:3355443,roughness:1,metalness:0}),l=new me(o,a);l.rotation.x=-Math.PI/2,l.position.y=B.groundY,l.receiveShadow=!0,t.add(l);let c=new dc(i);if(c.addPass(new pc(t,e)),B.enableBokeh){let h=new fc(t,e,{focus:B.bokehFocus,aperture:.005,maxblur:.014});c.addPass(h)}return c.addPass(new mc),window.addEventListener("resize",()=>{e.aspect=window.innerWidth/window.innerHeight,e.updateProjectionMatrix(),i.setSize(window.innerWidth,window.innerHeight),c.setSize(window.innerWidth,window.innerHeight)}),{renderer:i,scene:t,camera:e,composer:c,key:s,ground:l}}var Yi=class i{constructor(t){t===void 0&&(t=[0,0,0,0,0,0,0,0,0]),this.elements=t}identity(){let t=this.elements;t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=0,t[8]=1}setZero(){let t=this.elements;t[0]=0,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=0,t[6]=0,t[7]=0,t[8]=0}setTrace(t){let e=this.elements;e[0]=t.x,e[4]=t.y,e[8]=t.z}getTrace(t){t===void 0&&(t=new S);let e=this.elements;return t.x=e[0],t.y=e[4],t.z=e[8],t}vmult(t,e){e===void 0&&(e=new S);let n=this.elements,s=t.x,r=t.y,o=t.z;return e.x=n[0]*s+n[1]*r+n[2]*o,e.y=n[3]*s+n[4]*r+n[5]*o,e.z=n[6]*s+n[7]*r+n[8]*o,e}smult(t){for(let e=0;e<this.elements.length;e++)this.elements[e]*=t}mmult(t,e){e===void 0&&(e=new i);let n=this.elements,s=t.elements,r=e.elements,o=n[0],a=n[1],l=n[2],c=n[3],h=n[4],d=n[5],u=n[6],p=n[7],m=n[8],v=s[0],g=s[1],f=s[2],_=s[3],w=s[4],M=s[5],E=s[6],A=s[7],T=s[8];return r[0]=o*v+a*_+l*E,r[1]=o*g+a*w+l*A,r[2]=o*f+a*M+l*T,r[3]=c*v+h*_+d*E,r[4]=c*g+h*w+d*A,r[5]=c*f+h*M+d*T,r[6]=u*v+p*_+m*E,r[7]=u*g+p*w+m*A,r[8]=u*f+p*M+m*T,e}scale(t,e){e===void 0&&(e=new i);let n=this.elements,s=e.elements;for(let r=0;r!==3;r++)s[3*r+0]=t.x*n[3*r+0],s[3*r+1]=t.y*n[3*r+1],s[3*r+2]=t.z*n[3*r+2];return e}solve(t,e){e===void 0&&(e=new S);let n=3,s=4,r=[],o,a;for(o=0;o<n*s;o++)r.push(0);for(o=0;o<3;o++)for(a=0;a<3;a++)r[o+s*a]=this.elements[o+3*a];r[3]=t.x,r[7]=t.y,r[11]=t.z;let l=3,c=l,h,d=4,u;do{if(o=c-l,r[o+s*o]===0){for(a=o+1;a<c;a++)if(r[o+s*a]!==0){h=d;do u=d-h,r[u+s*o]+=r[u+s*a];while(--h);break}}if(r[o+s*o]!==0)for(a=o+1;a<c;a++){let p=r[o+s*a]/r[o+s*o];h=d;do u=d-h,r[u+s*a]=u<=o?0:r[u+s*a]-r[u+s*o]*p;while(--h)}}while(--l);if(e.z=r[2*s+3]/r[2*s+2],e.y=(r[1*s+3]-r[1*s+2]*e.z)/r[1*s+1],e.x=(r[0*s+3]-r[0*s+2]*e.z-r[0*s+1]*e.y)/r[0*s+0],isNaN(e.x)||isNaN(e.y)||isNaN(e.z)||e.x===1/0||e.y===1/0||e.z===1/0)throw`Could not solve equation! Got x=[${e.toString()}], b=[${t.toString()}], A=[${this.toString()}]`;return e}e(t,e,n){if(n===void 0)return this.elements[e+3*t];this.elements[e+3*t]=n}copy(t){for(let e=0;e<t.elements.length;e++)this.elements[e]=t.elements[e];return this}toString(){let t="";for(let n=0;n<9;n++)t+=this.elements[n]+",";return t}reverse(t){t===void 0&&(t=new i);let e=3,n=6,s=Pw,r,o;for(r=0;r<3;r++)for(o=0;o<3;o++)s[r+n*o]=this.elements[r+3*o];s[3]=1,s[9]=0,s[15]=0,s[4]=0,s[10]=1,s[16]=0,s[5]=0,s[11]=0,s[17]=1;let a=3,l=a,c,h=n,d;do{if(r=l-a,s[r+n*r]===0){for(o=r+1;o<l;o++)if(s[r+n*o]!==0){c=h;do d=h-c,s[d+n*r]+=s[d+n*o];while(--c);break}}if(s[r+n*r]!==0)for(o=r+1;o<l;o++){let u=s[r+n*o]/s[r+n*r];c=h;do d=h-c,s[d+n*o]=d<=r?0:s[d+n*o]-s[d+n*r]*u;while(--c)}}while(--a);r=2;do{o=r-1;do{let u=s[r+n*o]/s[r+n*r];c=n;do d=n-c,s[d+n*o]=s[d+n*o]-s[d+n*r]*u;while(--c)}while(o--)}while(--r);r=2;do{let u=1/s[r+n*r];c=n;do d=n-c,s[d+n*r]=s[d+n*r]*u;while(--c)}while(r--);r=2;do{o=2;do{if(d=s[e+o+n*r],isNaN(d)||d===1/0)throw`Could not reverse! A=[${this.toString()}]`;t.e(r,o,d)}while(o--)}while(r--);return t}setRotationFromQuaternion(t){let e=t.x,n=t.y,s=t.z,r=t.w,o=e+e,a=n+n,l=s+s,c=e*o,h=e*a,d=e*l,u=n*a,p=n*l,m=s*l,v=r*o,g=r*a,f=r*l,_=this.elements;return _[0]=1-(u+m),_[1]=h-f,_[2]=d+g,_[3]=h+f,_[4]=1-(c+m),_[5]=p-v,_[6]=d-g,_[7]=p+v,_[8]=1-(c+u),this}transpose(t){t===void 0&&(t=new i);let e=this.elements,n=t.elements,s;return n[0]=e[0],n[4]=e[4],n[8]=e[8],s=e[1],n[1]=e[3],n[3]=s,s=e[2],n[2]=e[6],n[6]=s,s=e[5],n[5]=e[7],n[7]=s,t}},Pw=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],S=class i{constructor(t,e,n){t===void 0&&(t=0),e===void 0&&(e=0),n===void 0&&(n=0),this.x=t,this.y=e,this.z=n}cross(t,e){e===void 0&&(e=new i);let n=t.x,s=t.y,r=t.z,o=this.x,a=this.y,l=this.z;return e.x=a*r-l*s,e.y=l*n-o*r,e.z=o*s-a*n,e}set(t,e,n){return this.x=t,this.y=e,this.z=n,this}setZero(){this.x=this.y=this.z=0}vadd(t,e){if(e)e.x=t.x+this.x,e.y=t.y+this.y,e.z=t.z+this.z;else return new i(this.x+t.x,this.y+t.y,this.z+t.z)}vsub(t,e){if(e)e.x=this.x-t.x,e.y=this.y-t.y,e.z=this.z-t.z;else return new i(this.x-t.x,this.y-t.y,this.z-t.z)}crossmat(){return new Yi([0,-this.z,this.y,this.z,0,-this.x,-this.y,this.x,0])}normalize(){let t=this.x,e=this.y,n=this.z,s=Math.sqrt(t*t+e*e+n*n);if(s>0){let r=1/s;this.x*=r,this.y*=r,this.z*=r}else this.x=0,this.y=0,this.z=0;return s}unit(t){t===void 0&&(t=new i);let e=this.x,n=this.y,s=this.z,r=Math.sqrt(e*e+n*n+s*s);return r>0?(r=1/r,t.x=e*r,t.y=n*r,t.z=s*r):(t.x=1,t.y=0,t.z=0),t}length(){let t=this.x,e=this.y,n=this.z;return Math.sqrt(t*t+e*e+n*n)}lengthSquared(){return this.dot(this)}distanceTo(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z;return Math.sqrt((r-e)*(r-e)+(o-n)*(o-n)+(a-s)*(a-s))}distanceSquared(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z;return(r-e)*(r-e)+(o-n)*(o-n)+(a-s)*(a-s)}scale(t,e){e===void 0&&(e=new i);let n=this.x,s=this.y,r=this.z;return e.x=t*n,e.y=t*s,e.z=t*r,e}vmul(t,e){return e===void 0&&(e=new i),e.x=t.x*this.x,e.y=t.y*this.y,e.z=t.z*this.z,e}addScaledVector(t,e,n){return n===void 0&&(n=new i),n.x=this.x+t*e.x,n.y=this.y+t*e.y,n.z=this.z+t*e.z,n}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}isZero(){return this.x===0&&this.y===0&&this.z===0}negate(t){return t===void 0&&(t=new i),t.x=-this.x,t.y=-this.y,t.z=-this.z,t}tangents(t,e){let n=this.length();if(n>0){let s=Rw,r=1/n;s.set(this.x*r,this.y*r,this.z*r);let o=Iw;Math.abs(s.x)<.9?(o.set(1,0,0),s.cross(o,t)):(o.set(0,1,0),s.cross(o,t)),s.cross(t,e)}else t.set(1,0,0),e.set(0,1,0)}toString(){return`${this.x},${this.y},${this.z}`}toArray(){return[this.x,this.y,this.z]}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}lerp(t,e,n){let s=this.x,r=this.y,o=this.z;n.x=s+(t.x-s)*e,n.y=r+(t.y-r)*e,n.z=o+(t.z-o)*e}almostEquals(t,e){return e===void 0&&(e=1e-6),!(Math.abs(this.x-t.x)>e||Math.abs(this.y-t.y)>e||Math.abs(this.z-t.z)>e)}almostZero(t){return t===void 0&&(t=1e-6),!(Math.abs(this.x)>t||Math.abs(this.y)>t||Math.abs(this.z)>t)}isAntiparallelTo(t,e){return this.negate(km),km.almostEquals(t,e)}clone(){return new i(this.x,this.y,this.z)}};S.ZERO=new S(0,0,0);S.UNIT_X=new S(1,0,0);S.UNIT_Y=new S(0,1,0);S.UNIT_Z=new S(0,0,1);var Rw=new S,Iw=new S,km=new S,gn=class i{constructor(t){t===void 0&&(t={}),this.lowerBound=new S,this.upperBound=new S,t.lowerBound&&this.lowerBound.copy(t.lowerBound),t.upperBound&&this.upperBound.copy(t.upperBound)}setFromPoints(t,e,n,s){let r=this.lowerBound,o=this.upperBound,a=n;r.copy(t[0]),a&&a.vmult(r,r),o.copy(r);for(let l=1;l<t.length;l++){let c=t[l];a&&(a.vmult(c,zm),c=zm),c.x>o.x&&(o.x=c.x),c.x<r.x&&(r.x=c.x),c.y>o.y&&(o.y=c.y),c.y<r.y&&(r.y=c.y),c.z>o.z&&(o.z=c.z),c.z<r.z&&(r.z=c.z)}return e&&(e.vadd(r,r),e.vadd(o,o)),s&&(r.x-=s,r.y-=s,r.z-=s,o.x+=s,o.y+=s,o.z+=s),this}copy(t){return this.lowerBound.copy(t.lowerBound),this.upperBound.copy(t.upperBound),this}clone(){return new i().copy(this)}extend(t){this.lowerBound.x=Math.min(this.lowerBound.x,t.lowerBound.x),this.upperBound.x=Math.max(this.upperBound.x,t.upperBound.x),this.lowerBound.y=Math.min(this.lowerBound.y,t.lowerBound.y),this.upperBound.y=Math.max(this.upperBound.y,t.upperBound.y),this.lowerBound.z=Math.min(this.lowerBound.z,t.lowerBound.z),this.upperBound.z=Math.max(this.upperBound.z,t.upperBound.z)}overlaps(t){let e=this.lowerBound,n=this.upperBound,s=t.lowerBound,r=t.upperBound,o=s.x<=n.x&&n.x<=r.x||e.x<=r.x&&r.x<=n.x,a=s.y<=n.y&&n.y<=r.y||e.y<=r.y&&r.y<=n.y,l=s.z<=n.z&&n.z<=r.z||e.z<=r.z&&r.z<=n.z;return o&&a&&l}volume(){let t=this.lowerBound,e=this.upperBound;return(e.x-t.x)*(e.y-t.y)*(e.z-t.z)}contains(t){let e=this.lowerBound,n=this.upperBound,s=t.lowerBound,r=t.upperBound;return e.x<=s.x&&n.x>=r.x&&e.y<=s.y&&n.y>=r.y&&e.z<=s.z&&n.z>=r.z}getCorners(t,e,n,s,r,o,a,l){let c=this.lowerBound,h=this.upperBound;t.copy(c),e.set(h.x,c.y,c.z),n.set(h.x,h.y,c.z),s.set(c.x,h.y,h.z),r.set(h.x,c.y,h.z),o.set(c.x,h.y,c.z),a.set(c.x,c.y,h.z),l.copy(h)}toLocalFrame(t,e){let n=Vm,s=n[0],r=n[1],o=n[2],a=n[3],l=n[4],c=n[5],h=n[6],d=n[7];this.getCorners(s,r,o,a,l,c,h,d);for(let u=0;u!==8;u++){let p=n[u];t.pointToLocal(p,p)}return e.setFromPoints(n)}toWorldFrame(t,e){let n=Vm,s=n[0],r=n[1],o=n[2],a=n[3],l=n[4],c=n[5],h=n[6],d=n[7];this.getCorners(s,r,o,a,l,c,h,d);for(let u=0;u!==8;u++){let p=n[u];t.pointToWorld(p,p)}return e.setFromPoints(n)}overlapsRay(t){let{direction:e,from:n}=t,s=1/e.x,r=1/e.y,o=1/e.z,a=(this.lowerBound.x-n.x)*s,l=(this.upperBound.x-n.x)*s,c=(this.lowerBound.y-n.y)*r,h=(this.upperBound.y-n.y)*r,d=(this.lowerBound.z-n.z)*o,u=(this.upperBound.z-n.z)*o,p=Math.max(Math.max(Math.min(a,l),Math.min(c,h)),Math.min(d,u)),m=Math.min(Math.min(Math.max(a,l),Math.max(c,h)),Math.max(d,u));return!(m<0||p>m)}},zm=new S,Vm=[new S,new S,new S,new S,new S,new S,new S,new S],yc=class{constructor(){this.matrix=[]}get(t,e){let{index:n}=t,{index:s}=e;if(s>n){let r=s;s=n,n=r}return this.matrix[(n*(n+1)>>1)+s-1]}set(t,e,n){let{index:s}=t,{index:r}=e;if(r>s){let o=r;r=s,s=o}this.matrix[(s*(s+1)>>1)+r-1]=n?1:0}reset(){for(let t=0,e=this.matrix.length;t!==e;t++)this.matrix[t]=0}setNumObjects(t){this.matrix.length=t*(t-1)>>1}},wc=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;return n[t]===void 0&&(n[t]=[]),n[t].includes(e)||n[t].push(e),this}hasEventListener(t,e){if(this._listeners===void 0)return!1;let n=this._listeners;return!!(n[t]!==void 0&&n[t].includes(e))}hasAnyEventListener(t){return this._listeners===void 0?!1:this._listeners[t]!==void 0}removeEventListener(t,e){if(this._listeners===void 0)return this;let n=this._listeners;if(n[t]===void 0)return this;let s=n[t].indexOf(e);return s!==-1&&n[t].splice(s,1),this}dispatchEvent(t){if(this._listeners===void 0)return this;let n=this._listeners[t.type];if(n!==void 0){t.target=this;for(let s=0,r=n.length;s<r;s++)n[s].call(this,t)}return this}},je=class i{constructor(t,e,n,s){t===void 0&&(t=0),e===void 0&&(e=0),n===void 0&&(n=0),s===void 0&&(s=1),this.x=t,this.y=e,this.z=n,this.w=s}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}toString(){return`${this.x},${this.y},${this.z},${this.w}`}toArray(){return[this.x,this.y,this.z,this.w]}setFromAxisAngle(t,e){let n=Math.sin(e*.5);return this.x=t.x*n,this.y=t.y*n,this.z=t.z*n,this.w=Math.cos(e*.5),this}toAxisAngle(t){t===void 0&&(t=new S),this.normalize();let e=2*Math.acos(this.w),n=Math.sqrt(1-this.w*this.w);return n<.001?(t.x=this.x,t.y=this.y,t.z=this.z):(t.x=this.x/n,t.y=this.y/n,t.z=this.z/n),[t,e]}setFromVectors(t,e){if(t.isAntiparallelTo(e)){let n=Lw,s=Fw;t.tangents(n,s),this.setFromAxisAngle(n,Math.PI)}else{let n=t.cross(e);this.x=n.x,this.y=n.y,this.z=n.z,this.w=Math.sqrt(t.length()**2*e.length()**2)+t.dot(e),this.normalize()}return this}mult(t,e){e===void 0&&(e=new i);let n=this.x,s=this.y,r=this.z,o=this.w,a=t.x,l=t.y,c=t.z,h=t.w;return e.x=n*h+o*a+s*c-r*l,e.y=s*h+o*l+r*a-n*c,e.z=r*h+o*c+n*l-s*a,e.w=o*h-n*a-s*l-r*c,e}inverse(t){t===void 0&&(t=new i);let e=this.x,n=this.y,s=this.z,r=this.w;this.conjugate(t);let o=1/(e*e+n*n+s*s+r*r);return t.x*=o,t.y*=o,t.z*=o,t.w*=o,t}conjugate(t){return t===void 0&&(t=new i),t.x=-this.x,t.y=-this.y,t.z=-this.z,t.w=this.w,t}normalize(){let t=Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w);return t===0?(this.x=0,this.y=0,this.z=0,this.w=0):(t=1/t,this.x*=t,this.y*=t,this.z*=t,this.w*=t),this}normalizeFast(){let t=(3-(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w))/2;return t===0?(this.x=0,this.y=0,this.z=0,this.w=0):(this.x*=t,this.y*=t,this.z*=t,this.w*=t),this}vmult(t,e){e===void 0&&(e=new S);let n=t.x,s=t.y,r=t.z,o=this.x,a=this.y,l=this.z,c=this.w,h=c*n+a*r-l*s,d=c*s+l*n-o*r,u=c*r+o*s-a*n,p=-o*n-a*s-l*r;return e.x=h*c+p*-o+d*-l-u*-a,e.y=d*c+p*-a+u*-o-h*-l,e.z=u*c+p*-l+h*-a-d*-o,e}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w,this}toEuler(t,e){e===void 0&&(e="YZX");let n,s,r,o=this.x,a=this.y,l=this.z,c=this.w;switch(e){case"YZX":let h=o*a+l*c;if(h>.499&&(n=2*Math.atan2(o,c),s=Math.PI/2,r=0),h<-.499&&(n=-2*Math.atan2(o,c),s=-Math.PI/2,r=0),n===void 0){let d=o*o,u=a*a,p=l*l;n=Math.atan2(2*a*c-2*o*l,1-2*u-2*p),s=Math.asin(2*h),r=Math.atan2(2*o*c-2*a*l,1-2*d-2*p)}break;default:throw new Error(`Euler order ${e} not supported yet.`)}t.y=n,t.z=s,t.x=r}setFromEuler(t,e,n,s){s===void 0&&(s="XYZ");let r=Math.cos(t/2),o=Math.cos(e/2),a=Math.cos(n/2),l=Math.sin(t/2),c=Math.sin(e/2),h=Math.sin(n/2);return s==="XYZ"?(this.x=l*o*a+r*c*h,this.y=r*c*a-l*o*h,this.z=r*o*h+l*c*a,this.w=r*o*a-l*c*h):s==="YXZ"?(this.x=l*o*a+r*c*h,this.y=r*c*a-l*o*h,this.z=r*o*h-l*c*a,this.w=r*o*a+l*c*h):s==="ZXY"?(this.x=l*o*a-r*c*h,this.y=r*c*a+l*o*h,this.z=r*o*h+l*c*a,this.w=r*o*a-l*c*h):s==="ZYX"?(this.x=l*o*a-r*c*h,this.y=r*c*a+l*o*h,this.z=r*o*h-l*c*a,this.w=r*o*a+l*c*h):s==="YZX"?(this.x=l*o*a+r*c*h,this.y=r*c*a+l*o*h,this.z=r*o*h-l*c*a,this.w=r*o*a-l*c*h):s==="XZY"&&(this.x=l*o*a-r*c*h,this.y=r*c*a-l*o*h,this.z=r*o*h+l*c*a,this.w=r*o*a+l*c*h),this}clone(){return new i(this.x,this.y,this.z,this.w)}slerp(t,e,n){n===void 0&&(n=new i);let s=this.x,r=this.y,o=this.z,a=this.w,l=t.x,c=t.y,h=t.z,d=t.w,u,p,m,v,g;return p=s*l+r*c+o*h+a*d,p<0&&(p=-p,l=-l,c=-c,h=-h,d=-d),1-p>1e-6?(u=Math.acos(p),m=Math.sin(u),v=Math.sin((1-e)*u)/m,g=Math.sin(e*u)/m):(v=1-e,g=e),n.x=v*s+g*l,n.y=v*r+g*c,n.z=v*o+g*h,n.w=v*a+g*d,n}integrate(t,e,n,s){s===void 0&&(s=new i);let r=t.x*n.x,o=t.y*n.y,a=t.z*n.z,l=this.x,c=this.y,h=this.z,d=this.w,u=e*.5;return s.x+=u*(r*d+o*h-a*c),s.y+=u*(o*d+a*l-r*h),s.z+=u*(a*d+r*c-o*l),s.w+=u*(-r*l-o*c-a*h),s}},Lw=new S,Fw=new S,Nw={SPHERE:1,PLANE:2,BOX:4,COMPOUND:8,CONVEXPOLYHEDRON:16,HEIGHTFIELD:32,PARTICLE:64,CYLINDER:128,TRIMESH:256},yt=class i{constructor(t){t===void 0&&(t={}),this.id=i.idCounter++,this.type=t.type||0,this.boundingSphereRadius=0,this.collisionResponse=t.collisionResponse?t.collisionResponse:!0,this.collisionFilterGroup=t.collisionFilterGroup!==void 0?t.collisionFilterGroup:1,this.collisionFilterMask=t.collisionFilterMask!==void 0?t.collisionFilterMask:-1,this.material=t.material?t.material:null,this.body=null}updateBoundingSphereRadius(){throw`computeBoundingSphereRadius() not implemented for shape type ${this.type}`}volume(){throw`volume() not implemented for shape type ${this.type}`}calculateLocalInertia(t,e){throw`calculateLocalInertia() not implemented for shape type ${this.type}`}calculateWorldAABB(t,e,n,s){throw`calculateWorldAABB() not implemented for shape type ${this.type}`}};yt.idCounter=0;yt.types=Nw;var oe=class i{constructor(t){t===void 0&&(t={}),this.position=new S,this.quaternion=new je,t.position&&this.position.copy(t.position),t.quaternion&&this.quaternion.copy(t.quaternion)}pointToLocal(t,e){return i.pointToLocalFrame(this.position,this.quaternion,t,e)}pointToWorld(t,e){return i.pointToWorldFrame(this.position,this.quaternion,t,e)}vectorToWorldFrame(t,e){return e===void 0&&(e=new S),this.quaternion.vmult(t,e),e}static pointToLocalFrame(t,e,n,s){return s===void 0&&(s=new S),n.vsub(t,s),e.conjugate(Gm),Gm.vmult(s,s),s}static pointToWorldFrame(t,e,n,s){return s===void 0&&(s=new S),e.vmult(n,s),s.vadd(t,s),s}static vectorToWorldFrame(t,e,n){return n===void 0&&(n=new S),t.vmult(e,n),n}static vectorToLocalFrame(t,e,n,s){return s===void 0&&(s=new S),e.w*=-1,e.vmult(n,s),e.w*=-1,s}},Gm=new je,Mc=class i extends yt{constructor(t){t===void 0&&(t={});let{vertices:e=[],faces:n=[],normals:s=[],axes:r,boundingSphereRadius:o}=t;super({type:yt.types.CONVEXPOLYHEDRON}),this.vertices=e,this.faces=n,this.faceNormals=s,this.faceNormals.length===0&&this.computeNormals(),o?this.boundingSphereRadius=o:this.updateBoundingSphereRadius(),this.worldVertices=[],this.worldVerticesNeedsUpdate=!0,this.worldFaceNormals=[],this.worldFaceNormalsNeedsUpdate=!0,this.uniqueAxes=r?r.slice():null,this.uniqueEdges=[],this.computeEdges()}computeEdges(){let t=this.faces,e=this.vertices,n=this.uniqueEdges;n.length=0;let s=new S;for(let r=0;r!==t.length;r++){let o=t[r],a=o.length;for(let l=0;l!==a;l++){let c=(l+1)%a;e[o[l]].vsub(e[o[c]],s),s.normalize();let h=!1;for(let d=0;d!==n.length;d++)if(n[d].almostEquals(s)||n[d].almostEquals(s)){h=!0;break}h||n.push(s.clone())}}}computeNormals(){this.faceNormals.length=this.faces.length;for(let t=0;t<this.faces.length;t++){for(let s=0;s<this.faces[t].length;s++)if(!this.vertices[this.faces[t][s]])throw new Error(`Vertex ${this.faces[t][s]} not found!`);let e=this.faceNormals[t]||new S;this.getFaceNormal(t,e),e.negate(e),this.faceNormals[t]=e;let n=this.vertices[this.faces[t][0]];if(e.dot(n)<0){console.error(`.faceNormals[${t}] = Vec3(${e.toString()}) looks like it points into the shape? The vertices follow. Make sure they are ordered CCW around the normal, using the right hand rule.`);for(let s=0;s<this.faces[t].length;s++)console.warn(`.vertices[${this.faces[t][s]}] = Vec3(${this.vertices[this.faces[t][s]].toString()})`)}}}getFaceNormal(t,e){let n=this.faces[t],s=this.vertices[n[0]],r=this.vertices[n[1]],o=this.vertices[n[2]];i.computeNormal(s,r,o,e)}static computeNormal(t,e,n,s){let r=new S,o=new S;e.vsub(t,o),n.vsub(e,r),r.cross(o,s),s.isZero()||s.normalize()}clipAgainstHull(t,e,n,s,r,o,a,l,c){let h=new S,d=-1,u=-Number.MAX_VALUE;for(let m=0;m<n.faces.length;m++){h.copy(n.faceNormals[m]),r.vmult(h,h);let v=h.dot(o);v>u&&(u=v,d=m)}let p=[];for(let m=0;m<n.faces[d].length;m++){let v=n.vertices[n.faces[d][m]],g=new S;g.copy(v),r.vmult(g,g),s.vadd(g,g),p.push(g)}d>=0&&this.clipFaceAgainstHull(o,t,e,p,a,l,c)}findSeparatingAxis(t,e,n,s,r,o,a,l){let c=new S,h=new S,d=new S,u=new S,p=new S,m=new S,v=Number.MAX_VALUE,g=this;if(g.uniqueAxes)for(let f=0;f!==g.uniqueAxes.length;f++){n.vmult(g.uniqueAxes[f],c);let _=g.testSepAxis(c,t,e,n,s,r);if(_===!1)return!1;_<v&&(v=_,o.copy(c))}else{let f=a?a.length:g.faces.length;for(let _=0;_<f;_++){let w=a?a[_]:_;c.copy(g.faceNormals[w]),n.vmult(c,c);let M=g.testSepAxis(c,t,e,n,s,r);if(M===!1)return!1;M<v&&(v=M,o.copy(c))}}if(t.uniqueAxes)for(let f=0;f!==t.uniqueAxes.length;f++){r.vmult(t.uniqueAxes[f],h);let _=g.testSepAxis(h,t,e,n,s,r);if(_===!1)return!1;_<v&&(v=_,o.copy(h))}else{let f=l?l.length:t.faces.length;for(let _=0;_<f;_++){let w=l?l[_]:_;h.copy(t.faceNormals[w]),r.vmult(h,h);let M=g.testSepAxis(h,t,e,n,s,r);if(M===!1)return!1;M<v&&(v=M,o.copy(h))}}for(let f=0;f!==g.uniqueEdges.length;f++){n.vmult(g.uniqueEdges[f],u);for(let _=0;_!==t.uniqueEdges.length;_++)if(r.vmult(t.uniqueEdges[_],p),u.cross(p,m),!m.almostZero()){m.normalize();let w=g.testSepAxis(m,t,e,n,s,r);if(w===!1)return!1;w<v&&(v=w,o.copy(m))}}return s.vsub(e,d),d.dot(o)>0&&o.negate(o),!0}testSepAxis(t,e,n,s,r,o){let a=this;i.project(a,t,n,s,wu),i.project(e,t,r,o,Mu);let l=wu[0],c=wu[1],h=Mu[0],d=Mu[1];if(l<d||h<c)return!1;let u=l-d,p=h-c;return u<p?u:p}calculateLocalInertia(t,e){let n=new S,s=new S;this.computeLocalAABB(s,n);let r=n.x-s.x,o=n.y-s.y,a=n.z-s.z;e.x=1/12*t*(2*o*2*o+2*a*2*a),e.y=1/12*t*(2*r*2*r+2*a*2*a),e.z=1/12*t*(2*o*2*o+2*r*2*r)}getPlaneConstantOfFace(t){let e=this.faces[t],n=this.faceNormals[t],s=this.vertices[e[0]];return-n.dot(s)}clipFaceAgainstHull(t,e,n,s,r,o,a){let l=new S,c=new S,h=new S,d=new S,u=new S,p=new S,m=new S,v=new S,g=this,f=[],_=s,w=f,M=-1,E=Number.MAX_VALUE;for(let y=0;y<g.faces.length;y++){l.copy(g.faceNormals[y]),n.vmult(l,l);let P=l.dot(t);P<E&&(E=P,M=y)}if(M<0)return;let A=g.faces[M];A.connectedFaces=[];for(let y=0;y<g.faces.length;y++)for(let P=0;P<g.faces[y].length;P++)A.indexOf(g.faces[y][P])!==-1&&y!==M&&A.connectedFaces.indexOf(y)===-1&&A.connectedFaces.push(y);let T=A.length;for(let y=0;y<T;y++){let P=g.vertices[A[y]],N=g.vertices[A[(y+1)%T]];P.vsub(N,c),h.copy(c),n.vmult(h,h),e.vadd(h,h),d.copy(this.faceNormals[M]),n.vmult(d,d),e.vadd(d,d),h.cross(d,u),u.negate(u),p.copy(P),n.vmult(p,p),e.vadd(p,p);let R=A.connectedFaces[y];m.copy(this.faceNormals[R]);let D=this.getPlaneConstantOfFace(R);v.copy(m),n.vmult(v,v);let O=D-v.dot(e);for(this.clipFaceAgainstPlane(_,w,v,O);_.length;)_.shift();for(;w.length;)_.push(w.shift())}m.copy(this.faceNormals[M]);let F=this.getPlaneConstantOfFace(M);v.copy(m),n.vmult(v,v);let x=F-v.dot(e);for(let y=0;y<_.length;y++){let P=v.dot(_[y])+x;if(P<=r&&(console.log(`clamped: depth=${P} to minDist=${r}`),P=r),P<=o){let N=_[y];if(P<=1e-6){let R={point:N,normal:v,depth:P};a.push(R)}}}}clipFaceAgainstPlane(t,e,n,s){let r,o,a=t.length;if(a<2)return e;let l=t[t.length-1],c=t[0];r=n.dot(l)+s;for(let h=0;h<a;h++){if(c=t[h],o=n.dot(c)+s,r<0)if(o<0){let d=new S;d.copy(c),e.push(d)}else{let d=new S;l.lerp(c,r/(r-o),d),e.push(d)}else if(o<0){let d=new S;l.lerp(c,r/(r-o),d),e.push(d),e.push(c)}l=c,r=o}return e}computeWorldVertices(t,e){for(;this.worldVertices.length<this.vertices.length;)this.worldVertices.push(new S);let n=this.vertices,s=this.worldVertices;for(let r=0;r!==this.vertices.length;r++)e.vmult(n[r],s[r]),t.vadd(s[r],s[r]);this.worldVerticesNeedsUpdate=!1}computeLocalAABB(t,e){let n=this.vertices;t.set(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE),e.set(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE);for(let s=0;s<this.vertices.length;s++){let r=n[s];r.x<t.x?t.x=r.x:r.x>e.x&&(e.x=r.x),r.y<t.y?t.y=r.y:r.y>e.y&&(e.y=r.y),r.z<t.z?t.z=r.z:r.z>e.z&&(e.z=r.z)}}computeWorldFaceNormals(t){let e=this.faceNormals.length;for(;this.worldFaceNormals.length<e;)this.worldFaceNormals.push(new S);let n=this.faceNormals,s=this.worldFaceNormals;for(let r=0;r!==e;r++)t.vmult(n[r],s[r]);this.worldFaceNormalsNeedsUpdate=!1}updateBoundingSphereRadius(){let t=0,e=this.vertices;for(let n=0;n!==e.length;n++){let s=e[n].lengthSquared();s>t&&(t=s)}this.boundingSphereRadius=Math.sqrt(t)}calculateWorldAABB(t,e,n,s){let r=this.vertices,o,a,l,c,h,d,u=new S;for(let p=0;p<r.length;p++){u.copy(r[p]),e.vmult(u,u),t.vadd(u,u);let m=u;(o===void 0||m.x<o)&&(o=m.x),(c===void 0||m.x>c)&&(c=m.x),(a===void 0||m.y<a)&&(a=m.y),(h===void 0||m.y>h)&&(h=m.y),(l===void 0||m.z<l)&&(l=m.z),(d===void 0||m.z>d)&&(d=m.z)}n.set(o,a,l),s.set(c,h,d)}volume(){return 4*Math.PI*this.boundingSphereRadius/3}getAveragePointLocal(t){t===void 0&&(t=new S);let e=this.vertices;for(let n=0;n<e.length;n++)t.vadd(e[n],t);return t.scale(1/e.length,t),t}transformAllPoints(t,e){let n=this.vertices.length,s=this.vertices;if(e){for(let r=0;r<n;r++){let o=s[r];e.vmult(o,o)}for(let r=0;r<this.faceNormals.length;r++){let o=this.faceNormals[r];e.vmult(o,o)}}if(t)for(let r=0;r<n;r++){let o=s[r];o.vadd(t,o)}}pointIsInside(t){let e=this.vertices,n=this.faces,s=this.faceNormals,r=null,o=new S;this.getAveragePointLocal(o);for(let a=0;a<this.faces.length;a++){let l=s[a],c=e[n[a][0]],h=new S;t.vsub(c,h);let d=l.dot(h),u=new S;o.vsub(c,u);let p=l.dot(u);if(d<0&&p>0||d>0&&p<0)return!1}return r?1:-1}static project(t,e,n,s,r){let o=t.vertices.length,a=Bw,l=0,c=0,h=Uw,d=t.vertices;h.setZero(),oe.vectorToLocalFrame(n,s,e,a),oe.pointToLocalFrame(n,s,h,h);let u=h.dot(a);c=l=d[0].dot(a);for(let p=1;p<o;p++){let m=d[p].dot(a);m>l&&(l=m),m<c&&(c=m)}if(c-=u,l-=u,c>l){let p=c;c=l,l=p}r[0]=l,r[1]=c}},wu=[],Mu=[],Dw=new S,Bw=new S,Uw=new S,Tu=class i extends yt{constructor(t){super({type:yt.types.BOX}),this.halfExtents=t,this.convexPolyhedronRepresentation=null,this.updateConvexPolyhedronRepresentation(),this.updateBoundingSphereRadius()}updateConvexPolyhedronRepresentation(){let t=this.halfExtents.x,e=this.halfExtents.y,n=this.halfExtents.z,s=S,r=[new s(-t,-e,-n),new s(t,-e,-n),new s(t,e,-n),new s(-t,e,-n),new s(-t,-e,n),new s(t,-e,n),new s(t,e,n),new s(-t,e,n)],o=[[3,2,1,0],[4,5,6,7],[5,4,0,1],[2,3,7,6],[0,4,7,3],[1,2,6,5]],a=[new s(0,0,1),new s(0,1,0),new s(1,0,0)],l=new Mc({vertices:r,faces:o,axes:a});this.convexPolyhedronRepresentation=l,l.material=this.material}calculateLocalInertia(t,e){return e===void 0&&(e=new S),i.calculateInertia(this.halfExtents,t,e),e}static calculateInertia(t,e,n){let s=t;n.x=1/12*e*(2*s.y*2*s.y+2*s.z*2*s.z),n.y=1/12*e*(2*s.x*2*s.x+2*s.z*2*s.z),n.z=1/12*e*(2*s.y*2*s.y+2*s.x*2*s.x)}getSideNormals(t,e){let n=t,s=this.halfExtents;if(n[0].set(s.x,0,0),n[1].set(0,s.y,0),n[2].set(0,0,s.z),n[3].set(-s.x,0,0),n[4].set(0,-s.y,0),n[5].set(0,0,-s.z),e!==void 0)for(let r=0;r!==n.length;r++)e.vmult(n[r],n[r]);return n}volume(){return 8*this.halfExtents.x*this.halfExtents.y*this.halfExtents.z}updateBoundingSphereRadius(){this.boundingSphereRadius=this.halfExtents.length()}forEachWorldCorner(t,e,n){let s=this.halfExtents,r=[[s.x,s.y,s.z],[-s.x,s.y,s.z],[-s.x,-s.y,s.z],[-s.x,-s.y,-s.z],[s.x,-s.y,-s.z],[s.x,s.y,-s.z],[-s.x,s.y,-s.z],[s.x,-s.y,s.z]];for(let o=0;o<r.length;o++)Xi.set(r[o][0],r[o][1],r[o][2]),e.vmult(Xi,Xi),t.vadd(Xi,Xi),n(Xi.x,Xi.y,Xi.z)}calculateWorldAABB(t,e,n,s){let r=this.halfExtents;Xn[0].set(r.x,r.y,r.z),Xn[1].set(-r.x,r.y,r.z),Xn[2].set(-r.x,-r.y,r.z),Xn[3].set(-r.x,-r.y,-r.z),Xn[4].set(r.x,-r.y,-r.z),Xn[5].set(r.x,r.y,-r.z),Xn[6].set(-r.x,r.y,-r.z),Xn[7].set(r.x,-r.y,r.z);let o=Xn[0];e.vmult(o,o),t.vadd(o,o),s.copy(o),n.copy(o);for(let a=1;a<8;a++){let l=Xn[a];e.vmult(l,l),t.vadd(l,l);let c=l.x,h=l.y,d=l.z;c>s.x&&(s.x=c),h>s.y&&(s.y=h),d>s.z&&(s.z=d),c<n.x&&(n.x=c),h<n.y&&(n.y=h),d<n.z&&(n.z=d)}}},Xi=new S,Xn=[new S,new S,new S,new S,new S,new S,new S,new S],Uu={DYNAMIC:1,STATIC:2,KINEMATIC:4},Ou={AWAKE:0,SLEEPY:1,SLEEPING:2},Ht=class i extends wc{constructor(t){t===void 0&&(t={}),super(),this.id=i.idCounter++,this.index=-1,this.world=null,this.vlambda=new S,this.collisionFilterGroup=typeof t.collisionFilterGroup=="number"?t.collisionFilterGroup:1,this.collisionFilterMask=typeof t.collisionFilterMask=="number"?t.collisionFilterMask:-1,this.collisionResponse=typeof t.collisionResponse=="boolean"?t.collisionResponse:!0,this.position=new S,this.previousPosition=new S,this.interpolatedPosition=new S,this.initPosition=new S,t.position&&(this.position.copy(t.position),this.previousPosition.copy(t.position),this.interpolatedPosition.copy(t.position),this.initPosition.copy(t.position)),this.velocity=new S,t.velocity&&this.velocity.copy(t.velocity),this.initVelocity=new S,this.force=new S;let e=typeof t.mass=="number"?t.mass:0;this.mass=e,this.invMass=e>0?1/e:0,this.material=t.material||null,this.linearDamping=typeof t.linearDamping=="number"?t.linearDamping:.01,this.type=e<=0?i.STATIC:i.DYNAMIC,typeof t.type==typeof i.STATIC&&(this.type=t.type),this.allowSleep=typeof t.allowSleep<"u"?t.allowSleep:!0,this.sleepState=i.AWAKE,this.sleepSpeedLimit=typeof t.sleepSpeedLimit<"u"?t.sleepSpeedLimit:.1,this.sleepTimeLimit=typeof t.sleepTimeLimit<"u"?t.sleepTimeLimit:1,this.timeLastSleepy=0,this.wakeUpAfterNarrowphase=!1,this.torque=new S,this.quaternion=new je,this.initQuaternion=new je,this.previousQuaternion=new je,this.interpolatedQuaternion=new je,t.quaternion&&(this.quaternion.copy(t.quaternion),this.initQuaternion.copy(t.quaternion),this.previousQuaternion.copy(t.quaternion),this.interpolatedQuaternion.copy(t.quaternion)),this.angularVelocity=new S,t.angularVelocity&&this.angularVelocity.copy(t.angularVelocity),this.initAngularVelocity=new S,this.shapes=[],this.shapeOffsets=[],this.shapeOrientations=[],this.inertia=new S,this.invInertia=new S,this.invInertiaWorld=new Yi,this.invMassSolve=0,this.invInertiaSolve=new S,this.invInertiaWorldSolve=new Yi,this.fixedRotation=typeof t.fixedRotation<"u"?t.fixedRotation:!1,this.angularDamping=typeof t.angularDamping<"u"?t.angularDamping:.01,this.linearFactor=new S(1,1,1),t.linearFactor&&this.linearFactor.copy(t.linearFactor),this.angularFactor=new S(1,1,1),t.angularFactor&&this.angularFactor.copy(t.angularFactor),this.aabb=new gn,this.aabbNeedsUpdate=!0,this.boundingRadius=0,this.wlambda=new S,this.isTrigger=!!t.isTrigger,t.shape&&this.addShape(t.shape),this.updateMassProperties()}wakeUp(){let t=this.sleepState;this.sleepState=i.AWAKE,this.wakeUpAfterNarrowphase=!1,t===i.SLEEPING&&this.dispatchEvent(i.wakeupEvent)}sleep(){this.sleepState=i.SLEEPING,this.velocity.set(0,0,0),this.angularVelocity.set(0,0,0),this.wakeUpAfterNarrowphase=!1}sleepTick(t){if(this.allowSleep){let e=this.sleepState,n=this.velocity.lengthSquared()+this.angularVelocity.lengthSquared(),s=this.sleepSpeedLimit**2;e===i.AWAKE&&n<s?(this.sleepState=i.SLEEPY,this.timeLastSleepy=t,this.dispatchEvent(i.sleepyEvent)):e===i.SLEEPY&&n>s?this.wakeUp():e===i.SLEEPY&&t-this.timeLastSleepy>this.sleepTimeLimit&&(this.sleep(),this.dispatchEvent(i.sleepEvent))}}updateSolveMassProperties(){this.sleepState===i.SLEEPING||this.type===i.KINEMATIC?(this.invMassSolve=0,this.invInertiaSolve.setZero(),this.invInertiaWorldSolve.setZero()):(this.invMassSolve=this.invMass,this.invInertiaSolve.copy(this.invInertia),this.invInertiaWorldSolve.copy(this.invInertiaWorld))}pointToLocalFrame(t,e){return e===void 0&&(e=new S),t.vsub(this.position,e),this.quaternion.conjugate().vmult(e,e),e}vectorToLocalFrame(t,e){return e===void 0&&(e=new S),this.quaternion.conjugate().vmult(t,e),e}pointToWorldFrame(t,e){return e===void 0&&(e=new S),this.quaternion.vmult(t,e),e.vadd(this.position,e),e}vectorToWorldFrame(t,e){return e===void 0&&(e=new S),this.quaternion.vmult(t,e),e}addShape(t,e,n){let s=new S,r=new je;return e&&s.copy(e),n&&r.copy(n),this.shapes.push(t),this.shapeOffsets.push(s),this.shapeOrientations.push(r),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,t.body=this,this}removeShape(t){let e=this.shapes.indexOf(t);return e===-1?(console.warn("Shape does not belong to the body"),this):(this.shapes.splice(e,1),this.shapeOffsets.splice(e,1),this.shapeOrientations.splice(e,1),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,t.body=null,this)}updateBoundingRadius(){let t=this.shapes,e=this.shapeOffsets,n=t.length,s=0;for(let r=0;r!==n;r++){let o=t[r];o.updateBoundingSphereRadius();let a=e[r].length(),l=o.boundingSphereRadius;a+l>s&&(s=a+l)}this.boundingRadius=s}updateAABB(){let t=this.shapes,e=this.shapeOffsets,n=this.shapeOrientations,s=t.length,r=Ow,o=kw,a=this.quaternion,l=this.aabb,c=zw;for(let h=0;h!==s;h++){let d=t[h];a.vmult(e[h],r),r.vadd(this.position,r),a.mult(n[h],o),d.calculateWorldAABB(r,o,c.lowerBound,c.upperBound),h===0?l.copy(c):l.extend(c)}this.aabbNeedsUpdate=!1}updateInertiaWorld(t){let e=this.invInertia;if(!(e.x===e.y&&e.y===e.z&&!t)){let n=Vw,s=Gw;n.setRotationFromQuaternion(this.quaternion),n.transpose(s),n.scale(e,n),n.mmult(s,this.invInertiaWorld)}}applyForce(t,e){if(e===void 0&&(e=new S),this.type!==i.DYNAMIC)return;this.sleepState===i.SLEEPING&&this.wakeUp();let n=Ww;e.cross(t,n),this.force.vadd(t,this.force),this.torque.vadd(n,this.torque)}applyLocalForce(t,e){if(e===void 0&&(e=new S),this.type!==i.DYNAMIC)return;let n=qw,s=Xw;this.vectorToWorldFrame(t,n),this.vectorToWorldFrame(e,s),this.applyForce(n,s)}applyTorque(t){this.type===i.DYNAMIC&&(this.sleepState===i.SLEEPING&&this.wakeUp(),this.torque.vadd(t,this.torque))}applyImpulse(t,e){if(e===void 0&&(e=new S),this.type!==i.DYNAMIC)return;this.sleepState===i.SLEEPING&&this.wakeUp();let n=e,s=Yw;s.copy(t),s.scale(this.invMass,s),this.velocity.vadd(s,this.velocity);let r=jw;n.cross(t,r),this.invInertiaWorld.vmult(r,r),this.angularVelocity.vadd(r,this.angularVelocity)}applyLocalImpulse(t,e){if(e===void 0&&(e=new S),this.type!==i.DYNAMIC)return;let n=$w,s=Zw;this.vectorToWorldFrame(t,n),this.vectorToWorldFrame(e,s),this.applyImpulse(n,s)}updateMassProperties(){let t=Kw;this.invMass=this.mass>0?1/this.mass:0;let e=this.inertia,n=this.fixedRotation;this.updateAABB(),t.set((this.aabb.upperBound.x-this.aabb.lowerBound.x)/2,(this.aabb.upperBound.y-this.aabb.lowerBound.y)/2,(this.aabb.upperBound.z-this.aabb.lowerBound.z)/2),Tu.calculateInertia(t,this.mass,e),this.invInertia.set(e.x>0&&!n?1/e.x:0,e.y>0&&!n?1/e.y:0,e.z>0&&!n?1/e.z:0),this.updateInertiaWorld(!0)}getVelocityAtWorldPoint(t,e){let n=new S;return t.vsub(this.position,n),this.angularVelocity.cross(n,e),this.velocity.vadd(e,e),e}integrate(t,e,n){if(this.previousPosition.copy(this.position),this.previousQuaternion.copy(this.quaternion),!(this.type===i.DYNAMIC||this.type===i.KINEMATIC)||this.sleepState===i.SLEEPING)return;let s=this.velocity,r=this.angularVelocity,o=this.position,a=this.force,l=this.torque,c=this.quaternion,h=this.invMass,d=this.invInertiaWorld,u=this.linearFactor,p=h*t;s.x+=a.x*p*u.x,s.y+=a.y*p*u.y,s.z+=a.z*p*u.z;let m=d.elements,v=this.angularFactor,g=l.x*v.x,f=l.y*v.y,_=l.z*v.z;r.x+=t*(m[0]*g+m[1]*f+m[2]*_),r.y+=t*(m[3]*g+m[4]*f+m[5]*_),r.z+=t*(m[6]*g+m[7]*f+m[8]*_),o.x+=s.x*t,o.y+=s.y*t,o.z+=s.z*t,c.integrate(this.angularVelocity,t,this.angularFactor,c),e&&(n?c.normalizeFast():c.normalize()),this.aabbNeedsUpdate=!0,this.updateInertiaWorld()}};Ht.idCounter=0;Ht.COLLIDE_EVENT_NAME="collide";Ht.DYNAMIC=Uu.DYNAMIC;Ht.STATIC=Uu.STATIC;Ht.KINEMATIC=Uu.KINEMATIC;Ht.AWAKE=Ou.AWAKE;Ht.SLEEPY=Ou.SLEEPY;Ht.SLEEPING=Ou.SLEEPING;Ht.wakeupEvent={type:"wakeup"};Ht.sleepyEvent={type:"sleepy"};Ht.sleepEvent={type:"sleep"};var Ow=new S,kw=new je,zw=new gn,Vw=new Yi,Gw=new Yi,Hw=new Yi,Ww=new S,qw=new S,Xw=new S,Yw=new S,jw=new S,$w=new S,Zw=new S,Kw=new S,Pu=class{constructor(){this.world=null,this.useBoundingBoxes=!1,this.dirty=!0}collisionPairs(t,e,n){throw new Error("collisionPairs not implemented for this BroadPhase class!")}needBroadphaseCollision(t,e){return!((t.collisionFilterGroup&e.collisionFilterMask)===0||(e.collisionFilterGroup&t.collisionFilterMask)===0||((t.type&Ht.STATIC)!==0||t.sleepState===Ht.SLEEPING)&&((e.type&Ht.STATIC)!==0||e.sleepState===Ht.SLEEPING))}intersectionTest(t,e,n,s){this.useBoundingBoxes?this.doBoundingBoxBroadphase(t,e,n,s):this.doBoundingSphereBroadphase(t,e,n,s)}doBoundingSphereBroadphase(t,e,n,s){let r=Jw;e.position.vsub(t.position,r);let o=(t.boundingRadius+e.boundingRadius)**2;r.lengthSquared()<o&&(n.push(t),s.push(e))}doBoundingBoxBroadphase(t,e,n,s){t.aabbNeedsUpdate&&t.updateAABB(),e.aabbNeedsUpdate&&e.updateAABB(),t.aabb.overlaps(e.aabb)&&(n.push(t),s.push(e))}makePairsUnique(t,e){let n=Qw,s=tM,r=eM,o=t.length;for(let a=0;a!==o;a++)s[a]=t[a],r[a]=e[a];t.length=0,e.length=0;for(let a=0;a!==o;a++){let l=s[a].id,c=r[a].id,h=l<c?`${l},${c}`:`${c},${l}`;n[h]=a,n.keys.push(h)}for(let a=0;a!==n.keys.length;a++){let l=n.keys.pop(),c=n[l];t.push(s[c]),e.push(r[c]),delete n[l]}}setWorld(t){}static boundingSphereCheck(t,e){let n=new S;t.position.vsub(e.position,n);let s=t.shapes[0],r=e.shapes[0];return Math.pow(s.boundingSphereRadius+r.boundingSphereRadius,2)>n.lengthSquared()}aabbQuery(t,e,n){return console.warn(".aabbQuery is not implemented in this Broadphase subclass."),[]}},Jw=new S;new S;new je;new S;var Qw={keys:[]},tM=[],eM=[];new S;var w2=new S;new S;var Ru=class extends Pu{constructor(){super()}collisionPairs(t,e,n){let s=t.bodies,r=s.length,o,a;for(let l=0;l!==r;l++)for(let c=0;c!==l;c++)o=s[l],a=s[c],this.needBroadphaseCollision(o,a)&&this.intersectionTest(o,a,e,n)}aabbQuery(t,e,n){n===void 0&&(n=[]);for(let s=0;s<t.bodies.length;s++){let r=t.bodies[s];r.aabbNeedsUpdate&&r.updateAABB(),r.aabb.overlaps(e)&&n.push(r)}return n}},_r=class{constructor(){this.rayFromWorld=new S,this.rayToWorld=new S,this.hitNormalWorld=new S,this.hitPointWorld=new S,this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}reset(){this.rayFromWorld.setZero(),this.rayToWorld.setZero(),this.hitNormalWorld.setZero(),this.hitPointWorld.setZero(),this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}abort(){this.shouldStop=!0}set(t,e,n,s,r,o,a){this.rayFromWorld.copy(t),this.rayToWorld.copy(e),this.hitNormalWorld.copy(n),this.hitPointWorld.copy(s),this.shape=r,this.body=o,this.distance=a}},tg,eg,ng,ig,sg,rg,og,ku={CLOSEST:1,ANY:2,ALL:4};tg=yt.types.SPHERE;eg=yt.types.PLANE;ng=yt.types.BOX;ig=yt.types.CYLINDER;sg=yt.types.CONVEXPOLYHEDRON;rg=yt.types.HEIGHTFIELD;og=yt.types.TRIMESH;var Mn=class i{get[tg](){return this._intersectSphere}get[eg](){return this._intersectPlane}get[ng](){return this._intersectBox}get[ig](){return this._intersectConvex}get[sg](){return this._intersectConvex}get[rg](){return this._intersectHeightfield}get[og](){return this._intersectTrimesh}constructor(t,e){t===void 0&&(t=new S),e===void 0&&(e=new S),this.from=t.clone(),this.to=e.clone(),this.direction=new S,this.precision=1e-4,this.checkCollisionResponse=!0,this.skipBackfaces=!1,this.collisionFilterMask=-1,this.collisionFilterGroup=-1,this.mode=i.ANY,this.result=new _r,this.hasHit=!1,this.callback=n=>{}}intersectWorld(t,e){return this.mode=e.mode||i.ANY,this.result=e.result||new _r,this.skipBackfaces=!!e.skipBackfaces,this.collisionFilterMask=typeof e.collisionFilterMask<"u"?e.collisionFilterMask:-1,this.collisionFilterGroup=typeof e.collisionFilterGroup<"u"?e.collisionFilterGroup:-1,this.checkCollisionResponse=typeof e.checkCollisionResponse<"u"?e.checkCollisionResponse:!0,e.from&&this.from.copy(e.from),e.to&&this.to.copy(e.to),this.callback=e.callback||(()=>{}),this.hasHit=!1,this.result.reset(),this.updateDirection(),this.getAABB(Hm),Su.length=0,t.broadphase.aabbQuery(t,Hm,Su),this.intersectBodies(Su),this.hasHit}intersectBody(t,e){e&&(this.result=e,this.updateDirection());let n=this.checkCollisionResponse;if(n&&!t.collisionResponse||(this.collisionFilterGroup&t.collisionFilterMask)===0||(t.collisionFilterGroup&this.collisionFilterMask)===0)return;let s=nM,r=iM;for(let o=0,a=t.shapes.length;o<a;o++){let l=t.shapes[o];if(!(n&&!l.collisionResponse)&&(t.quaternion.mult(t.shapeOrientations[o],r),t.quaternion.vmult(t.shapeOffsets[o],s),s.vadd(t.position,s),this.intersectShape(l,r,s,t),this.result.shouldStop))break}}intersectBodies(t,e){e&&(this.result=e,this.updateDirection());for(let n=0,s=t.length;!this.result.shouldStop&&n<s;n++)this.intersectBody(t[n])}updateDirection(){this.to.vsub(this.from,this.direction),this.direction.normalize()}intersectShape(t,e,n,s){let r=this.from;if(xM(r,this.direction,n)>t.boundingSphereRadius)return;let a=this[t.type];a&&a.call(this,t,e,n,s,t)}_intersectBox(t,e,n,s,r){return this._intersectConvex(t.convexPolyhedronRepresentation,e,n,s,r)}_intersectPlane(t,e,n,s,r){let o=this.from,a=this.to,l=this.direction,c=new S(0,0,1);e.vmult(c,c);let h=new S;o.vsub(n,h);let d=h.dot(c);a.vsub(n,h);let u=h.dot(c);if(d*u>0||o.distanceTo(a)<d)return;let p=c.dot(l);if(Math.abs(p)<this.precision)return;let m=new S,v=new S,g=new S;o.vsub(n,m);let f=-c.dot(m)/p;l.scale(f,v),o.vadd(v,g),this.reportIntersection(c,g,r,s,-1)}getAABB(t){let{lowerBound:e,upperBound:n}=t,s=this.to,r=this.from;e.x=Math.min(s.x,r.x),e.y=Math.min(s.y,r.y),e.z=Math.min(s.z,r.z),n.x=Math.max(s.x,r.x),n.y=Math.max(s.y,r.y),n.z=Math.max(s.z,r.z)}_intersectHeightfield(t,e,n,s,r){t.data,t.elementSize;let o=sM;o.from.copy(this.from),o.to.copy(this.to),oe.pointToLocalFrame(n,e,o.from,o.from),oe.pointToLocalFrame(n,e,o.to,o.to),o.updateDirection();let a=rM,l,c,h,d;l=c=0,h=d=t.data.length-1;let u=new gn;o.getAABB(u),t.getIndexOfPosition(u.lowerBound.x,u.lowerBound.y,a,!0),l=Math.max(l,a[0]),c=Math.max(c,a[1]),t.getIndexOfPosition(u.upperBound.x,u.upperBound.y,a,!0),h=Math.min(h,a[0]+1),d=Math.min(d,a[1]+1);for(let p=l;p<h;p++)for(let m=c;m<d;m++){if(this.result.shouldStop)return;if(t.getAabbAtIndex(p,m,u),!!u.overlapsRay(o)){if(t.getConvexTrianglePillar(p,m,!1),oe.pointToWorldFrame(n,e,t.pillarOffset,gc),this._intersectConvex(t.pillarConvex,e,gc,s,r,Wm),this.result.shouldStop)return;t.getConvexTrianglePillar(p,m,!0),oe.pointToWorldFrame(n,e,t.pillarOffset,gc),this._intersectConvex(t.pillarConvex,e,gc,s,r,Wm)}}}_intersectSphere(t,e,n,s,r){let o=this.from,a=this.to,l=t.radius,c=(a.x-o.x)**2+(a.y-o.y)**2+(a.z-o.z)**2,h=2*((a.x-o.x)*(o.x-n.x)+(a.y-o.y)*(o.y-n.y)+(a.z-o.z)*(o.z-n.z)),d=(o.x-n.x)**2+(o.y-n.y)**2+(o.z-n.z)**2-l**2,u=h**2-4*c*d,p=oM,m=aM;if(!(u<0))if(u===0)o.lerp(a,u,p),p.vsub(n,m),m.normalize(),this.reportIntersection(m,p,r,s,-1);else{let v=(-h-Math.sqrt(u))/(2*c),g=(-h+Math.sqrt(u))/(2*c);if(v>=0&&v<=1&&(o.lerp(a,v,p),p.vsub(n,m),m.normalize(),this.reportIntersection(m,p,r,s,-1)),this.result.shouldStop)return;g>=0&&g<=1&&(o.lerp(a,g,p),p.vsub(n,m),m.normalize(),this.reportIntersection(m,p,r,s,-1))}}_intersectConvex(t,e,n,s,r,o){let a=lM,l=qm,c=o&&o.faceList||null,h=t.faces,d=t.vertices,u=t.faceNormals,p=this.direction,m=this.from,v=this.to,g=m.distanceTo(v),f=c?c.length:h.length,_=this.result;for(let w=0;!_.shouldStop&&w<f;w++){let M=c?c[w]:w,E=h[M],A=u[M],T=e,F=n;l.copy(d[E[0]]),T.vmult(l,l),l.vadd(F,l),l.vsub(m,l),T.vmult(A,a);let x=p.dot(a);if(Math.abs(x)<this.precision)continue;let y=a.dot(l)/x;if(!(y<0)){p.scale(y,rn),rn.vadd(m,rn),Bn.copy(d[E[0]]),T.vmult(Bn,Bn),F.vadd(Bn,Bn);for(let P=1;!_.shouldStop&&P<E.length-1;P++){Yn.copy(d[E[P]]),jn.copy(d[E[P+1]]),T.vmult(Yn,Yn),T.vmult(jn,jn),F.vadd(Yn,Yn),F.vadd(jn,jn);let N=rn.distanceTo(m);!(i.pointInTriangle(rn,Bn,Yn,jn)||i.pointInTriangle(rn,Yn,Bn,jn))||N>g||this.reportIntersection(a,rn,r,s,M)}}}}_intersectTrimesh(t,e,n,s,r,o){let a=uM,l=vM,c=_M,h=qm,d=dM,u=pM,p=fM,m=gM,v=mM,g=t.indices;t.vertices;let f=this.from,_=this.to,w=this.direction;c.position.copy(n),c.quaternion.copy(e),oe.vectorToLocalFrame(n,e,w,d),oe.pointToLocalFrame(n,e,f,u),oe.pointToLocalFrame(n,e,_,p),p.x*=t.scale.x,p.y*=t.scale.y,p.z*=t.scale.z,u.x*=t.scale.x,u.y*=t.scale.y,u.z*=t.scale.z,p.vsub(u,d),d.normalize();let M=u.distanceSquared(p);t.tree.rayQuery(this,c,l);for(let E=0,A=l.length;!this.result.shouldStop&&E!==A;E++){let T=l[E];t.getNormal(T,a),t.getVertex(g[T*3],Bn),Bn.vsub(u,h);let F=d.dot(a),x=a.dot(h)/F;if(x<0)continue;d.scale(x,rn),rn.vadd(u,rn),t.getVertex(g[T*3+1],Yn),t.getVertex(g[T*3+2],jn);let y=rn.distanceSquared(u);!(i.pointInTriangle(rn,Yn,Bn,jn)||i.pointInTriangle(rn,Bn,Yn,jn))||y>M||(oe.vectorToWorldFrame(e,a,v),oe.pointToWorldFrame(n,e,rn,m),this.reportIntersection(v,m,r,s,T))}l.length=0}reportIntersection(t,e,n,s,r){let o=this.from,a=this.to,l=o.distanceTo(e),c=this.result;if(!(this.skipBackfaces&&t.dot(this.direction)>0))switch(c.hitFaceIndex=typeof r<"u"?r:-1,this.mode){case i.ALL:this.hasHit=!0,c.set(o,a,t,e,n,s,l),c.hasHit=!0,this.callback(c);break;case i.CLOSEST:(l<c.distance||!c.hasHit)&&(this.hasHit=!0,c.hasHit=!0,c.set(o,a,t,e,n,s,l));break;case i.ANY:this.hasHit=!0,c.hasHit=!0,c.set(o,a,t,e,n,s,l),c.shouldStop=!0;break}}static pointInTriangle(t,e,n,s){s.vsub(e,Ms),n.vsub(e,Io),t.vsub(e,Eu);let r=Ms.dot(Ms),o=Ms.dot(Io),a=Ms.dot(Eu),l=Io.dot(Io),c=Io.dot(Eu),h,d;return(h=l*a-o*c)>=0&&(d=r*c-o*a)>=0&&h+d<r*l-o*o}};Mn.CLOSEST=ku.CLOSEST;Mn.ANY=ku.ANY;Mn.ALL=ku.ALL;var Hm=new gn,Su=[],Io=new S,Eu=new S,nM=new S,iM=new je,rn=new S,Bn=new S,Yn=new S,jn=new S;new S;new _r;var Wm={faceList:[0]},gc=new S,sM=new Mn,rM=[],oM=new S,aM=new S,lM=new S,cM=new S,hM=new S,qm=new S,uM=new S,dM=new S,pM=new S,fM=new S,mM=new S,gM=new S;new gn;var vM=[],_M=new oe,Ms=new S,vc=new S;function xM(i,t,e){e.vsub(i,Ms);let n=Ms.dot(t);return t.scale(n,vc),vc.vadd(i,vc),e.distanceTo(vc)}var Sc=class{static defaults(t,e){t===void 0&&(t={});for(let n in e)n in t||(t[n]=e[n]);return t}},Ec=class i{constructor(t,e,n){n===void 0&&(n={}),n=Sc.defaults(n,{collideConnected:!0,wakeUpBodies:!0}),this.equations=[],this.bodyA=t,this.bodyB=e,this.id=i.idCounter++,this.collideConnected=n.collideConnected,n.wakeUpBodies&&(t&&t.wakeUp(),e&&e.wakeUp())}update(){throw new Error("method update() not implmemented in this Constraint subclass!")}enable(){let t=this.equations;for(let e=0;e<t.length;e++)t[e].enabled=!0}disable(){let t=this.equations;for(let e=0;e<t.length;e++)t[e].enabled=!1}};Ec.idCounter=0;var Ac=class{constructor(){this.spatial=new S,this.rotational=new S}multiplyElement(t){return t.spatial.dot(this.spatial)+t.rotational.dot(this.rotational)}multiplyVectors(t,e){return t.dot(this.spatial)+e.dot(this.rotational)}},Do=class i{constructor(t,e,n,s){n===void 0&&(n=-1e6),s===void 0&&(s=1e6),this.id=i.idCounter++,this.minForce=n,this.maxForce=s,this.bi=t,this.bj=e,this.a=0,this.b=0,this.eps=0,this.jacobianElementA=new Ac,this.jacobianElementB=new Ac,this.enabled=!0,this.multiplier=0,this.setSpookParams(1e7,4,1/60)}setSpookParams(t,e,n){let s=e,r=t,o=n;this.a=4/(o*(1+4*s)),this.b=4*s/(1+4*s),this.eps=4/(o*o*r*(1+4*s))}computeB(t,e,n){let s=this.computeGW(),r=this.computeGq(),o=this.computeGiMf();return-r*t-s*e-o*n}computeGq(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,s=this.bj,r=n.position,o=s.position;return t.spatial.dot(r)+e.spatial.dot(o)}computeGW(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,s=this.bj,r=n.velocity,o=s.velocity,a=n.angularVelocity,l=s.angularVelocity;return t.multiplyVectors(r,a)+e.multiplyVectors(o,l)}computeGWlambda(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,s=this.bj,r=n.vlambda,o=s.vlambda,a=n.wlambda,l=s.wlambda;return t.multiplyVectors(r,a)+e.multiplyVectors(o,l)}computeGiMf(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,s=this.bj,r=n.force,o=n.torque,a=s.force,l=s.torque,c=n.invMassSolve,h=s.invMassSolve;return r.scale(c,Xm),a.scale(h,Ym),n.invInertiaWorldSolve.vmult(o,jm),s.invInertiaWorldSolve.vmult(l,$m),t.multiplyVectors(Xm,jm)+e.multiplyVectors(Ym,$m)}computeGiMGt(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,s=this.bj,r=n.invMassSolve,o=s.invMassSolve,a=n.invInertiaWorldSolve,l=s.invInertiaWorldSolve,c=r+o;return a.vmult(t.rotational,_c),c+=_c.dot(t.rotational),l.vmult(e.rotational,_c),c+=_c.dot(e.rotational),c}addToWlambda(t){let e=this.jacobianElementA,n=this.jacobianElementB,s=this.bi,r=this.bj,o=bM;s.vlambda.addScaledVector(s.invMassSolve*t,e.spatial,s.vlambda),r.vlambda.addScaledVector(r.invMassSolve*t,n.spatial,r.vlambda),s.invInertiaWorldSolve.vmult(e.rotational,o),s.wlambda.addScaledVector(t,o,s.wlambda),r.invInertiaWorldSolve.vmult(n.rotational,o),r.wlambda.addScaledVector(t,o,r.wlambda)}computeC(){return this.computeGiMGt()+this.eps}};Do.idCounter=0;var Xm=new S,Ym=new S,jm=new S,$m=new S,_c=new S,bM=new S,vr=class extends Do{constructor(t,e,n){n===void 0&&(n=1e6),super(t,e,0,n),this.restitution=0,this.ri=new S,this.rj=new S,this.ni=new S}computeB(t){let e=this.a,n=this.b,s=this.bi,r=this.bj,o=this.ri,a=this.rj,l=yM,c=wM,h=s.velocity,d=s.angularVelocity;s.force,s.torque;let u=r.velocity,p=r.angularVelocity;r.force,r.torque;let m=MM,v=this.jacobianElementA,g=this.jacobianElementB,f=this.ni;o.cross(f,l),a.cross(f,c),f.negate(v.spatial),l.negate(v.rotational),g.spatial.copy(f),g.rotational.copy(c),m.copy(r.position),m.vadd(a,m),m.vsub(s.position,m),m.vsub(o,m);let _=f.dot(m),w=this.restitution+1,M=w*u.dot(f)-w*h.dot(f)+p.dot(c)-d.dot(l),E=this.computeGiMf();return-_*e-M*n-t*E}getImpactVelocityAlongNormal(){let t=SM,e=EM,n=AM,s=CM,r=TM;return this.bi.position.vadd(this.ri,n),this.bj.position.vadd(this.rj,s),this.bi.getVelocityAtWorldPoint(n,t),this.bj.getVelocityAtWorldPoint(s,e),t.vsub(e,r),this.ni.dot(r)}},yM=new S,wM=new S,MM=new S,SM=new S,EM=new S,AM=new S,CM=new S,TM=new S,xr=class extends Ec{constructor(t,e,n,s,r){e===void 0&&(e=new S),s===void 0&&(s=new S),r===void 0&&(r=1e6),super(t,n),this.pivotA=e.clone(),this.pivotB=s.clone();let o=this.equationX=new vr(t,n),a=this.equationY=new vr(t,n),l=this.equationZ=new vr(t,n);this.equations.push(o,a,l),o.minForce=a.minForce=l.minForce=-r,o.maxForce=a.maxForce=l.maxForce=r,o.ni.set(1,0,0),a.ni.set(0,1,0),l.ni.set(0,0,1)}update(){let t=this.bodyA,e=this.bodyB,n=this.equationX,s=this.equationY,r=this.equationZ;t.quaternion.vmult(this.pivotA,n.ri),e.quaternion.vmult(this.pivotB,n.rj),s.ri.copy(n.ri),s.rj.copy(n.rj),r.ri.copy(n.ri),r.rj.copy(n.rj)}};var M2=new S,S2=new S;var E2=new S,A2=new S;new S;new S;var C2=new S,T2=new S;var P2=new S,R2=new S,Cc=class extends Do{constructor(t,e,n){super(t,e,-n,n),this.ri=new S,this.rj=new S,this.t=new S}computeB(t){this.a;let e=this.b;this.bi,this.bj;let n=this.ri,s=this.rj,r=PM,o=RM,a=this.t;n.cross(a,r),s.cross(a,o);let l=this.jacobianElementA,c=this.jacobianElementB;a.negate(l.spatial),r.negate(l.rotational),c.spatial.copy(a),c.rotational.copy(o);let h=this.computeGW(),d=this.computeGiMf();return-h*e-t*d}},PM=new S,RM=new S,Ss=class i{constructor(t,e,n){n=Sc.defaults(n,{friction:.3,restitution:.3,contactEquationStiffness:1e7,contactEquationRelaxation:3,frictionEquationStiffness:1e7,frictionEquationRelaxation:3}),this.id=i.idCounter++,this.materials=[t,e],this.friction=n.friction,this.restitution=n.restitution,this.contactEquationStiffness=n.contactEquationStiffness,this.contactEquationRelaxation=n.contactEquationRelaxation,this.frictionEquationStiffness=n.frictionEquationStiffness,this.frictionEquationRelaxation=n.frictionEquationRelaxation}};Ss.idCounter=0;var Es=class i{constructor(t){t===void 0&&(t={});let e="";typeof t=="string"&&(e=t,t={}),this.name=e,this.id=i.idCounter++,this.friction=typeof t.friction<"u"?t.friction:-1,this.restitution=typeof t.restitution<"u"?t.restitution:-1}};Es.idCounter=0;var I2=new S,L2=new S,F2=new S,N2=new S,D2=new S,B2=new S,U2=new S,O2=new S,k2=new S,z2=new S,V2=new S;var G2=new S,H2=new S;new S;new S;new S;var W2=new S,q2=new S,X2=new S;new Mn;new S;var Y2=new S,j2=new S,$2=[new S(1,0,0),new S(0,1,0),new S(0,0,1)],Z2=new S;var K2=new S,J2=new S,Q2=new S;var tI=new S,eI=new S,nI=new S,iI=new S;var sI=new S,rI=new S,oI=new S;var Tc=class extends yt{constructor(t){if(super({type:yt.types.SPHERE}),this.radius=t!==void 0?t:1,this.radius<0)throw new Error("The sphere radius cannot be negative.");this.updateBoundingSphereRadius()}calculateLocalInertia(t,e){e===void 0&&(e=new S);let n=2*t*this.radius*this.radius/5;return e.x=n,e.y=n,e.z=n,e}volume(){return 4*Math.PI*Math.pow(this.radius,3)/3}updateBoundingSphereRadius(){this.boundingSphereRadius=this.radius}calculateWorldAABB(t,e,n,s){let r=this.radius,o=["x","y","z"];for(let a=0;a<o.length;a++){let l=o[a];n[l]=t[l]-r,s[l]=t[l]+r}}};var aI=new S,lI=new S;var cI=new S,hI=new S,uI=new S,dI=new S,pI=new S,fI=new S,mI=new S,Bo=class extends Mc{constructor(t,e,n,s){if(t===void 0&&(t=1),e===void 0&&(e=1),n===void 0&&(n=1),s===void 0&&(s=8),t<0)throw new Error("The cylinder radiusTop cannot be negative.");if(e<0)throw new Error("The cylinder radiusBottom cannot be negative.");let r=s,o=[],a=[],l=[],c=[],h=[],d=Math.cos,u=Math.sin;o.push(new S(-e*u(0),-n*.5,e*d(0))),c.push(0),o.push(new S(-t*u(0),n*.5,t*d(0))),h.push(1);for(let m=0;m<r;m++){let v=2*Math.PI/r*(m+1),g=2*Math.PI/r*(m+.5);m<r-1?(o.push(new S(-e*u(v),-n*.5,e*d(v))),c.push(2*m+2),o.push(new S(-t*u(v),n*.5,t*d(v))),h.push(2*m+3),l.push([2*m,2*m+1,2*m+3,2*m+2])):l.push([2*m,2*m+1,1,0]),(r%2===1||m<r/2)&&a.push(new S(-u(g),0,d(g)))}l.push(c),a.push(new S(0,1,0));let p=[];for(let m=0;m<h.length;m++)p.push(h[h.length-m-1]);l.push(p),super({vertices:o,faces:l,axes:a}),this.type=yt.types.CYLINDER,this.radiusTop=t,this.radiusBottom=e,this.height=n,this.numSegments=s}};var gI=new S;var vI=new S,_I=new S,xI=new S,bI=new S,yI=new S,wI=new S,MI=new S,SI=new S,EI=new S;var AI=new S,CI=new gn;var TI=new S,PI=new gn,RI=new S,II=new S,LI=new S,FI=new S,NI=new S,DI=new S,BI=new S,UI=new gn,OI=new S,kI=new oe,zI=new gn,Iu=class{constructor(){this.equations=[]}solve(t,e){return 0}addEquation(t){t.enabled&&!t.bi.isTrigger&&!t.bj.isTrigger&&this.equations.push(t)}removeEquation(t){let e=this.equations,n=e.indexOf(t);n!==-1&&e.splice(n,1)}removeAllEquations(){this.equations.length=0}},Lu=class extends Iu{constructor(){super(),this.iterations=10,this.tolerance=1e-7}solve(t,e){let n=0,s=this.iterations,r=this.tolerance*this.tolerance,o=this.equations,a=o.length,l=e.bodies,c=l.length,h=t,d,u,p,m,v,g;if(a!==0)for(let M=0;M!==c;M++)l[M].updateSolveMassProperties();let f=LM,_=FM,w=IM;f.length=a,_.length=a,w.length=a;for(let M=0;M!==a;M++){let E=o[M];w[M]=0,_[M]=E.computeB(h),f[M]=1/E.computeC()}if(a!==0){for(let A=0;A!==c;A++){let T=l[A],F=T.vlambda,x=T.wlambda;F.set(0,0,0),x.set(0,0,0)}for(n=0;n!==s;n++){m=0;for(let A=0;A!==a;A++){let T=o[A];d=_[A],u=f[A],g=w[A],v=T.computeGWlambda(),p=u*(d-v-T.eps*g),g+p<T.minForce?p=T.minForce-g:g+p>T.maxForce&&(p=T.maxForce-g),w[A]+=p,m+=p>0?p:-p,T.addToWlambda(p)}if(m*m<r)break}for(let A=0;A!==c;A++){let T=l[A],F=T.velocity,x=T.angularVelocity;T.vlambda.vmul(T.linearFactor,T.vlambda),F.vadd(T.vlambda,F),T.wlambda.vmul(T.angularFactor,T.wlambda),x.vadd(T.wlambda,x)}let M=o.length,E=1/h;for(;M--;)o[M].multiplier=w[M]*E}return n}},IM=[],LM=[],FM=[];var VI=Ht.STATIC;var Fu=class{constructor(){this.objects=[],this.type=Object}release(){let t=arguments.length;for(let e=0;e!==t;e++)this.objects.push(e<0||arguments.length<=e?void 0:arguments[e]);return this}get(){return this.objects.length===0?this.constructObject():this.objects.pop()}constructObject(){throw new Error("constructObject() not implemented in this Pool subclass yet!")}resize(t){let e=this.objects;for(;e.length>t;)e.pop();for(;e.length<t;)e.push(this.constructObject());return this}},Nu=class extends Fu{constructor(){super(...arguments),this.type=S}constructObject(){return new S}},_e={sphereSphere:yt.types.SPHERE,spherePlane:yt.types.SPHERE|yt.types.PLANE,boxBox:yt.types.BOX|yt.types.BOX,sphereBox:yt.types.SPHERE|yt.types.BOX,planeBox:yt.types.PLANE|yt.types.BOX,convexConvex:yt.types.CONVEXPOLYHEDRON,sphereConvex:yt.types.SPHERE|yt.types.CONVEXPOLYHEDRON,planeConvex:yt.types.PLANE|yt.types.CONVEXPOLYHEDRON,boxConvex:yt.types.BOX|yt.types.CONVEXPOLYHEDRON,sphereHeightfield:yt.types.SPHERE|yt.types.HEIGHTFIELD,boxHeightfield:yt.types.BOX|yt.types.HEIGHTFIELD,convexHeightfield:yt.types.CONVEXPOLYHEDRON|yt.types.HEIGHTFIELD,sphereParticle:yt.types.PARTICLE|yt.types.SPHERE,planeParticle:yt.types.PLANE|yt.types.PARTICLE,boxParticle:yt.types.BOX|yt.types.PARTICLE,convexParticle:yt.types.PARTICLE|yt.types.CONVEXPOLYHEDRON,cylinderCylinder:yt.types.CYLINDER,sphereCylinder:yt.types.SPHERE|yt.types.CYLINDER,planeCylinder:yt.types.PLANE|yt.types.CYLINDER,boxCylinder:yt.types.BOX|yt.types.CYLINDER,convexCylinder:yt.types.CONVEXPOLYHEDRON|yt.types.CYLINDER,heightfieldCylinder:yt.types.HEIGHTFIELD|yt.types.CYLINDER,particleCylinder:yt.types.PARTICLE|yt.types.CYLINDER,sphereTrimesh:yt.types.SPHERE|yt.types.TRIMESH,planeTrimesh:yt.types.PLANE|yt.types.TRIMESH},Du=class{get[_e.sphereSphere](){return this.sphereSphere}get[_e.spherePlane](){return this.spherePlane}get[_e.boxBox](){return this.boxBox}get[_e.sphereBox](){return this.sphereBox}get[_e.planeBox](){return this.planeBox}get[_e.convexConvex](){return this.convexConvex}get[_e.sphereConvex](){return this.sphereConvex}get[_e.planeConvex](){return this.planeConvex}get[_e.boxConvex](){return this.boxConvex}get[_e.sphereHeightfield](){return this.sphereHeightfield}get[_e.boxHeightfield](){return this.boxHeightfield}get[_e.convexHeightfield](){return this.convexHeightfield}get[_e.sphereParticle](){return this.sphereParticle}get[_e.planeParticle](){return this.planeParticle}get[_e.boxParticle](){return this.boxParticle}get[_e.convexParticle](){return this.convexParticle}get[_e.cylinderCylinder](){return this.convexConvex}get[_e.sphereCylinder](){return this.sphereConvex}get[_e.planeCylinder](){return this.planeConvex}get[_e.boxCylinder](){return this.boxConvex}get[_e.convexCylinder](){return this.convexConvex}get[_e.heightfieldCylinder](){return this.heightfieldCylinder}get[_e.particleCylinder](){return this.particleCylinder}get[_e.sphereTrimesh](){return this.sphereTrimesh}get[_e.planeTrimesh](){return this.planeTrimesh}constructor(t){this.contactPointPool=[],this.frictionEquationPool=[],this.result=[],this.frictionResult=[],this.v3pool=new Nu,this.world=t,this.currentContactMaterial=t.defaultContactMaterial,this.enableFrictionReduction=!1}createContactEquation(t,e,n,s,r,o){let a;this.contactPointPool.length?(a=this.contactPointPool.pop(),a.bi=t,a.bj=e):a=new vr(t,e),a.enabled=t.collisionResponse&&e.collisionResponse&&n.collisionResponse&&s.collisionResponse;let l=this.currentContactMaterial;a.restitution=l.restitution,a.setSpookParams(l.contactEquationStiffness,l.contactEquationRelaxation,this.world.dt);let c=n.material||t.material,h=s.material||e.material;return c&&h&&c.restitution>=0&&h.restitution>=0&&(a.restitution=c.restitution*h.restitution),a.si=r||n,a.sj=o||s,a}createFrictionEquationsFromContact(t,e){let n=t.bi,s=t.bj,r=t.si,o=t.sj,a=this.world,l=this.currentContactMaterial,c=l.friction,h=r.material||n.material,d=o.material||s.material;if(h&&d&&h.friction>=0&&d.friction>=0&&(c=h.friction*d.friction),c>0){let u=c*(a.frictionGravity||a.gravity).length(),p=n.invMass+s.invMass;p>0&&(p=1/p);let m=this.frictionEquationPool,v=m.length?m.pop():new Cc(n,s,u*p),g=m.length?m.pop():new Cc(n,s,u*p);return v.bi=g.bi=n,v.bj=g.bj=s,v.minForce=g.minForce=-u*p,v.maxForce=g.maxForce=u*p,v.ri.copy(t.ri),v.rj.copy(t.rj),g.ri.copy(t.ri),g.rj.copy(t.rj),t.ni.tangents(v.t,g.t),v.setSpookParams(l.frictionEquationStiffness,l.frictionEquationRelaxation,a.dt),g.setSpookParams(l.frictionEquationStiffness,l.frictionEquationRelaxation,a.dt),v.enabled=g.enabled=t.enabled,e.push(v,g),!0}return!1}createFrictionFromAverage(t){let e=this.result[this.result.length-1];if(!this.createFrictionEquationsFromContact(e,this.frictionResult)||t===1)return;let n=this.frictionResult[this.frictionResult.length-2],s=this.frictionResult[this.frictionResult.length-1];ws.setZero(),mr.setZero(),gr.setZero();let r=e.bi;e.bj;for(let a=0;a!==t;a++)e=this.result[this.result.length-1-a],e.bi!==r?(ws.vadd(e.ni,ws),mr.vadd(e.ri,mr),gr.vadd(e.rj,gr)):(ws.vsub(e.ni,ws),mr.vadd(e.rj,mr),gr.vadd(e.ri,gr));let o=1/t;mr.scale(o,n.ri),gr.scale(o,n.rj),s.ri.copy(n.ri),s.rj.copy(n.rj),ws.normalize(),ws.tangents(n.t,s.t)}getContacts(t,e,n,s,r,o,a){this.contactPointPool=r,this.frictionEquationPool=a,this.result=s,this.frictionResult=o;let l=BM,c=UM,h=NM,d=DM;for(let u=0,p=t.length;u!==p;u++){let m=t[u],v=e[u],g=null;m.material&&v.material&&(g=n.getContactMaterial(m.material,v.material)||null);let f=m.type&Ht.KINEMATIC&&v.type&Ht.STATIC||m.type&Ht.STATIC&&v.type&Ht.KINEMATIC||m.type&Ht.KINEMATIC&&v.type&Ht.KINEMATIC;for(let _=0;_<m.shapes.length;_++){m.quaternion.mult(m.shapeOrientations[_],l),m.quaternion.vmult(m.shapeOffsets[_],h),h.vadd(m.position,h);let w=m.shapes[_];for(let M=0;M<v.shapes.length;M++){v.quaternion.mult(v.shapeOrientations[M],c),v.quaternion.vmult(v.shapeOffsets[M],d),d.vadd(v.position,d);let E=v.shapes[M];if(!(w.collisionFilterMask&E.collisionFilterGroup&&E.collisionFilterMask&w.collisionFilterGroup)||h.distanceTo(d)>w.boundingSphereRadius+E.boundingSphereRadius)continue;let A=null;w.material&&E.material&&(A=n.getContactMaterial(w.material,E.material)||null),this.currentContactMaterial=A||g||n.defaultContactMaterial;let T=w.type|E.type,F=this[T];if(F){let x=!1;w.type<E.type?x=F.call(this,w,E,h,d,l,c,m,v,w,E,f):x=F.call(this,E,w,d,h,c,l,v,m,w,E,f),x&&f&&(n.shapeOverlapKeeper.set(w.id,E.id),n.bodyOverlapKeeper.set(m.id,v.id))}}}}}sphereSphere(t,e,n,s,r,o,a,l,c,h,d){if(d)return n.distanceSquared(s)<(t.radius+e.radius)**2;let u=this.createContactEquation(a,l,t,e,c,h);s.vsub(n,u.ni),u.ni.normalize(),u.ri.copy(u.ni),u.rj.copy(u.ni),u.ri.scale(t.radius,u.ri),u.rj.scale(-e.radius,u.rj),u.ri.vadd(n,u.ri),u.ri.vsub(a.position,u.ri),u.rj.vadd(s,u.rj),u.rj.vsub(l.position,u.rj),this.result.push(u),this.createFrictionEquationsFromContact(u,this.frictionResult)}spherePlane(t,e,n,s,r,o,a,l,c,h,d){let u=this.createContactEquation(a,l,t,e,c,h);if(u.ni.set(0,0,1),o.vmult(u.ni,u.ni),u.ni.negate(u.ni),u.ni.normalize(),u.ni.scale(t.radius,u.ri),n.vsub(s,xc),u.ni.scale(u.ni.dot(xc),Zm),xc.vsub(Zm,u.rj),-xc.dot(u.ni)<=t.radius){if(d)return!0;let p=u.ri,m=u.rj;p.vadd(n,p),p.vsub(a.position,p),m.vadd(s,m),m.vsub(l.position,m),this.result.push(u),this.createFrictionEquationsFromContact(u,this.frictionResult)}}boxBox(t,e,n,s,r,o,a,l,c,h,d){return t.convexPolyhedronRepresentation.material=t.material,e.convexPolyhedronRepresentation.material=e.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexConvex(t.convexPolyhedronRepresentation,e.convexPolyhedronRepresentation,n,s,r,o,a,l,t,e,d)}sphereBox(t,e,n,s,r,o,a,l,c,h,d){let u=this.v3pool,p=cS;n.vsub(s,bc),e.getSideNormals(p,o);let m=t.radius,v=!1,g=uS,f=dS,_=pS,w=null,M=0,E=0,A=0,T=null;for(let L=0,G=p.length;L!==G&&v===!1;L++){let q=oS;q.copy(p[L]);let Z=q.length();q.normalize();let et=bc.dot(q);if(et<Z+m&&et>0){let it=aS,nt=lS;it.copy(p[(L+1)%3]),nt.copy(p[(L+2)%3]);let _t=it.length(),Bt=nt.length();it.normalize(),nt.normalize();let Lt=bc.dot(it),$=bc.dot(nt);if(Lt<_t&&Lt>-_t&&$<Bt&&$>-Bt){let J=Math.abs(et-Z-m);if((T===null||J<T)&&(T=J,E=Lt,A=$,w=Z,g.copy(q),f.copy(it),_.copy(nt),M++,d))return!0}}}if(M){v=!0;let L=this.createContactEquation(a,l,t,e,c,h);g.scale(-m,L.ri),L.ni.copy(g),L.ni.negate(L.ni),g.scale(w,g),f.scale(E,f),g.vadd(f,g),_.scale(A,_),g.vadd(_,L.rj),L.ri.vadd(n,L.ri),L.ri.vsub(a.position,L.ri),L.rj.vadd(s,L.rj),L.rj.vsub(l.position,L.rj),this.result.push(L),this.createFrictionEquationsFromContact(L,this.frictionResult)}let F=u.get(),x=hS;for(let L=0;L!==2&&!v;L++)for(let G=0;G!==2&&!v;G++)for(let q=0;q!==2&&!v;q++)if(F.set(0,0,0),L?F.vadd(p[0],F):F.vsub(p[0],F),G?F.vadd(p[1],F):F.vsub(p[1],F),q?F.vadd(p[2],F):F.vsub(p[2],F),s.vadd(F,x),x.vsub(n,x),x.lengthSquared()<m*m){if(d)return!0;v=!0;let Z=this.createContactEquation(a,l,t,e,c,h);Z.ri.copy(x),Z.ri.normalize(),Z.ni.copy(Z.ri),Z.ri.scale(m,Z.ri),Z.rj.copy(F),Z.ri.vadd(n,Z.ri),Z.ri.vsub(a.position,Z.ri),Z.rj.vadd(s,Z.rj),Z.rj.vsub(l.position,Z.rj),this.result.push(Z),this.createFrictionEquationsFromContact(Z,this.frictionResult)}u.release(F),F=null;let y=u.get(),P=u.get(),N=u.get(),R=u.get(),D=u.get(),O=p.length;for(let L=0;L!==O&&!v;L++)for(let G=0;G!==O&&!v;G++)if(L%3!==G%3){p[G].cross(p[L],y),y.normalize(),p[L].vadd(p[G],P),N.copy(n),N.vsub(P,N),N.vsub(s,N);let q=N.dot(y);y.scale(q,R);let Z=0;for(;Z===L%3||Z===G%3;)Z++;D.copy(n),D.vsub(R,D),D.vsub(P,D),D.vsub(s,D);let et=Math.abs(q),it=D.length();if(et<p[Z].length()&&it<m){if(d)return!0;v=!0;let nt=this.createContactEquation(a,l,t,e,c,h);P.vadd(R,nt.rj),nt.rj.copy(nt.rj),D.negate(nt.ni),nt.ni.normalize(),nt.ri.copy(nt.rj),nt.ri.vadd(s,nt.ri),nt.ri.vsub(n,nt.ri),nt.ri.normalize(),nt.ri.scale(m,nt.ri),nt.ri.vadd(n,nt.ri),nt.ri.vsub(a.position,nt.ri),nt.rj.vadd(s,nt.rj),nt.rj.vsub(l.position,nt.rj),this.result.push(nt),this.createFrictionEquationsFromContact(nt,this.frictionResult)}}u.release(y,P,N,R,D)}planeBox(t,e,n,s,r,o,a,l,c,h,d){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,e.convexPolyhedronRepresentation.id=e.id,this.planeConvex(t,e.convexPolyhedronRepresentation,n,s,r,o,a,l,t,e,d)}convexConvex(t,e,n,s,r,o,a,l,c,h,d,u,p){let m=TS;if(!(n.distanceTo(s)>t.boundingSphereRadius+e.boundingSphereRadius)&&t.findSeparatingAxis(e,n,r,s,o,m,u,p)){let v=[],g=PS;t.clipAgainstHull(n,r,e,s,o,m,-100,100,v);let f=0;for(let _=0;_!==v.length;_++){if(d)return!0;let w=this.createContactEquation(a,l,t,e,c,h),M=w.ri,E=w.rj;m.negate(w.ni),v[_].normal.negate(g),g.scale(v[_].depth,g),v[_].point.vadd(g,M),E.copy(v[_].point),M.vsub(n,M),E.vsub(s,E),M.vadd(n,M),M.vsub(a.position,M),E.vadd(s,E),E.vsub(l.position,E),this.result.push(w),f++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(w,this.frictionResult)}this.enableFrictionReduction&&f&&this.createFrictionFromAverage(f)}}sphereConvex(t,e,n,s,r,o,a,l,c,h,d){let u=this.v3pool;n.vsub(s,fS);let p=e.faceNormals,m=e.faces,v=e.vertices,g=t.radius,f=!1;for(let _=0;_!==v.length;_++){let w=v[_],M=_S;o.vmult(w,M),s.vadd(M,M);let E=vS;if(M.vsub(n,E),E.lengthSquared()<g*g){if(d)return!0;f=!0;let A=this.createContactEquation(a,l,t,e,c,h);A.ri.copy(E),A.ri.normalize(),A.ni.copy(A.ri),A.ri.scale(g,A.ri),M.vsub(s,A.rj),A.ri.vadd(n,A.ri),A.ri.vsub(a.position,A.ri),A.rj.vadd(s,A.rj),A.rj.vsub(l.position,A.rj),this.result.push(A),this.createFrictionEquationsFromContact(A,this.frictionResult);return}}for(let _=0,w=m.length;_!==w&&f===!1;_++){let M=p[_],E=m[_],A=xS;o.vmult(M,A);let T=bS;o.vmult(v[E[0]],T),T.vadd(s,T);let F=yS;A.scale(-g,F),n.vadd(F,F);let x=wS;F.vsub(T,x);let y=x.dot(A),P=MS;if(n.vsub(T,P),y<0&&P.dot(A)>0){let N=[];for(let R=0,D=E.length;R!==D;R++){let O=u.get();o.vmult(v[E[R]],O),s.vadd(O,O),N.push(O)}if(rS(N,A,n)){if(d)return!0;f=!0;let R=this.createContactEquation(a,l,t,e,c,h);A.scale(-g,R.ri),A.negate(R.ni);let D=u.get();A.scale(-y,D);let O=u.get();A.scale(-g,O),n.vsub(s,R.rj),R.rj.vadd(O,R.rj),R.rj.vadd(D,R.rj),R.rj.vadd(s,R.rj),R.rj.vsub(l.position,R.rj),R.ri.vadd(n,R.ri),R.ri.vsub(a.position,R.ri),u.release(D),u.release(O),this.result.push(R),this.createFrictionEquationsFromContact(R,this.frictionResult);for(let L=0,G=N.length;L!==G;L++)u.release(N[L]);return}else for(let R=0;R!==E.length;R++){let D=u.get(),O=u.get();o.vmult(v[E[(R+1)%E.length]],D),o.vmult(v[E[(R+2)%E.length]],O),s.vadd(D,D),s.vadd(O,O);let L=mS;O.vsub(D,L);let G=gS;L.unit(G);let q=u.get(),Z=u.get();n.vsub(D,Z);let et=Z.dot(G);G.scale(et,q),q.vadd(D,q);let it=u.get();if(q.vsub(n,it),et>0&&et*et<L.lengthSquared()&&it.lengthSquared()<g*g){if(d)return!0;let nt=this.createContactEquation(a,l,t,e,c,h);q.vsub(s,nt.rj),q.vsub(n,nt.ni),nt.ni.normalize(),nt.ni.scale(g,nt.ri),nt.rj.vadd(s,nt.rj),nt.rj.vsub(l.position,nt.rj),nt.ri.vadd(n,nt.ri),nt.ri.vsub(a.position,nt.ri),this.result.push(nt),this.createFrictionEquationsFromContact(nt,this.frictionResult);for(let _t=0,Bt=N.length;_t!==Bt;_t++)u.release(N[_t]);u.release(D),u.release(O),u.release(q),u.release(it),u.release(Z);return}u.release(D),u.release(O),u.release(q),u.release(it),u.release(Z)}for(let R=0,D=N.length;R!==D;R++)u.release(N[R])}}}planeConvex(t,e,n,s,r,o,a,l,c,h,d){let u=SS,p=ES;p.set(0,0,1),r.vmult(p,p);let m=0,v=AS;for(let g=0;g!==e.vertices.length;g++)if(u.copy(e.vertices[g]),o.vmult(u,u),s.vadd(u,u),u.vsub(n,v),p.dot(v)<=0){if(d)return!0;let _=this.createContactEquation(a,l,t,e,c,h),w=CS;p.scale(p.dot(v),w),u.vsub(w,w),w.vsub(n,_.ri),_.ni.copy(p),u.vsub(s,_.rj),_.ri.vadd(n,_.ri),_.ri.vsub(a.position,_.ri),_.rj.vadd(s,_.rj),_.rj.vsub(l.position,_.rj),this.result.push(_),m++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(_,this.frictionResult)}this.enableFrictionReduction&&m&&this.createFrictionFromAverage(m)}boxConvex(t,e,n,s,r,o,a,l,c,h,d){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexConvex(t.convexPolyhedronRepresentation,e,n,s,r,o,a,l,t,e,d)}sphereHeightfield(t,e,n,s,r,o,a,l,c,h,d){let u=e.data,p=t.radius,m=e.elementSize,v=VS,g=zS;oe.pointToLocalFrame(s,o,n,g);let f=Math.floor((g.x-p)/m)-1,_=Math.ceil((g.x+p)/m)+1,w=Math.floor((g.y-p)/m)-1,M=Math.ceil((g.y+p)/m)+1;if(_<0||M<0||f>u.length||w>u[0].length)return;f<0&&(f=0),_<0&&(_=0),w<0&&(w=0),M<0&&(M=0),f>=u.length&&(f=u.length-1),_>=u.length&&(_=u.length-1),M>=u[0].length&&(M=u[0].length-1),w>=u[0].length&&(w=u[0].length-1);let E=[];e.getRectMinMax(f,w,_,M,E);let A=E[0],T=E[1];if(g.z-p>T||g.z+p<A)return;let F=this.result;for(let x=f;x<_;x++)for(let y=w;y<M;y++){let P=F.length,N=!1;if(e.getConvexTrianglePillar(x,y,!1),oe.pointToWorldFrame(s,o,e.pillarOffset,v),n.distanceTo(v)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(N=this.sphereConvex(t,e.pillarConvex,n,v,r,o,a,l,t,e,d)),d&&N||(e.getConvexTrianglePillar(x,y,!0),oe.pointToWorldFrame(s,o,e.pillarOffset,v),n.distanceTo(v)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(N=this.sphereConvex(t,e.pillarConvex,n,v,r,o,a,l,t,e,d)),d&&N))return!0;if(F.length-P>2)return}}boxHeightfield(t,e,n,s,r,o,a,l,c,h,d){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexHeightfield(t.convexPolyhedronRepresentation,e,n,s,r,o,a,l,t,e,d)}convexHeightfield(t,e,n,s,r,o,a,l,c,h,d){let u=e.data,p=e.elementSize,m=t.boundingSphereRadius,v=OS,g=kS,f=US;oe.pointToLocalFrame(s,o,n,f);let _=Math.floor((f.x-m)/p)-1,w=Math.ceil((f.x+m)/p)+1,M=Math.floor((f.y-m)/p)-1,E=Math.ceil((f.y+m)/p)+1;if(w<0||E<0||_>u.length||M>u[0].length)return;_<0&&(_=0),w<0&&(w=0),M<0&&(M=0),E<0&&(E=0),_>=u.length&&(_=u.length-1),w>=u.length&&(w=u.length-1),E>=u[0].length&&(E=u[0].length-1),M>=u[0].length&&(M=u[0].length-1);let A=[];e.getRectMinMax(_,M,w,E,A);let T=A[0],F=A[1];if(!(f.z-m>F||f.z+m<T))for(let x=_;x<w;x++)for(let y=M;y<E;y++){let P=!1;if(e.getConvexTrianglePillar(x,y,!1),oe.pointToWorldFrame(s,o,e.pillarOffset,v),n.distanceTo(v)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(P=this.convexConvex(t,e.pillarConvex,n,v,r,o,a,l,null,null,d,g,null)),d&&P||(e.getConvexTrianglePillar(x,y,!0),oe.pointToWorldFrame(s,o,e.pillarOffset,v),n.distanceTo(v)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(P=this.convexConvex(t,e.pillarConvex,n,v,r,o,a,l,null,null,d,g,null)),d&&P))return!0}}sphereParticle(t,e,n,s,r,o,a,l,c,h,d){let u=FS;if(u.set(0,0,1),s.vsub(n,u),u.lengthSquared()<=t.radius*t.radius){if(d)return!0;let m=this.createContactEquation(l,a,e,t,c,h);u.normalize(),m.rj.copy(u),m.rj.scale(t.radius,m.rj),m.ni.copy(u),m.ni.negate(m.ni),m.ri.set(0,0,0),this.result.push(m),this.createFrictionEquationsFromContact(m,this.frictionResult)}}planeParticle(t,e,n,s,r,o,a,l,c,h,d){let u=RS;u.set(0,0,1),a.quaternion.vmult(u,u);let p=IS;if(s.vsub(a.position,p),u.dot(p)<=0){if(d)return!0;let v=this.createContactEquation(l,a,e,t,c,h);v.ni.copy(u),v.ni.negate(v.ni),v.ri.set(0,0,0);let g=LS;u.scale(u.dot(s),g),s.vsub(g,g),v.rj.copy(g),this.result.push(v),this.createFrictionEquationsFromContact(v,this.frictionResult)}}boxParticle(t,e,n,s,r,o,a,l,c,h,d){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexParticle(t.convexPolyhedronRepresentation,e,n,s,r,o,a,l,t,e,d)}convexParticle(t,e,n,s,r,o,a,l,c,h,d){let u=-1,p=DS,m=BS,v=null,g=NS;if(g.copy(s),g.vsub(n,g),r.conjugate(Km),Km.vmult(g,g),t.pointIsInside(g)){t.worldVerticesNeedsUpdate&&t.computeWorldVertices(n,r),t.worldFaceNormalsNeedsUpdate&&t.computeWorldFaceNormals(r);for(let f=0,_=t.faces.length;f!==_;f++){let w=[t.worldVertices[t.faces[f][0]]],M=t.worldFaceNormals[f];s.vsub(w[0],Jm);let E=-M.dot(Jm);if(v===null||Math.abs(E)<Math.abs(v)){if(d)return!0;v=E,u=f,p.copy(M)}}if(u!==-1){let f=this.createContactEquation(l,a,e,t,c,h);p.scale(v,m),m.vadd(s,m),m.vsub(n,m),f.rj.copy(m),p.negate(f.ni),f.ri.set(0,0,0);let _=f.ri,w=f.rj;_.vadd(s,_),_.vsub(l.position,_),w.vadd(n,w),w.vsub(a.position,w),this.result.push(f),this.createFrictionEquationsFromContact(f,this.frictionResult)}else console.warn("Point found inside convex, but did not find penetrating face!")}}heightfieldCylinder(t,e,n,s,r,o,a,l,c,h,d){return this.convexHeightfield(e,t,s,n,o,r,l,a,c,h,d)}particleCylinder(t,e,n,s,r,o,a,l,c,h,d){return this.convexParticle(e,t,s,n,o,r,l,a,c,h,d)}sphereTrimesh(t,e,n,s,r,o,a,l,c,h,d){let u=qM,p=XM,m=YM,v=jM,g=$M,f=ZM,_=tS,w=WM,M=GM,E=eS;oe.pointToLocalFrame(s,o,n,g);let A=t.radius;_.lowerBound.set(g.x-A,g.y-A,g.z-A),_.upperBound.set(g.x+A,g.y+A,g.z+A),e.getTrianglesInAABB(_,E);let T=HM,F=t.radius*t.radius;for(let R=0;R<E.length;R++)for(let D=0;D<3;D++)if(e.getVertex(e.indices[E[R]*3+D],T),T.vsub(g,M),M.lengthSquared()<=F){if(w.copy(T),oe.pointToWorldFrame(s,o,w,T),T.vsub(n,M),d)return!0;let O=this.createContactEquation(a,l,t,e,c,h);O.ni.copy(M),O.ni.normalize(),O.ri.copy(O.ni),O.ri.scale(t.radius,O.ri),O.ri.vadd(n,O.ri),O.ri.vsub(a.position,O.ri),O.rj.copy(T),O.rj.vsub(l.position,O.rj),this.result.push(O),this.createFrictionEquationsFromContact(O,this.frictionResult)}for(let R=0;R<E.length;R++)for(let D=0;D<3;D++){e.getVertex(e.indices[E[R]*3+D],u),e.getVertex(e.indices[E[R]*3+(D+1)%3],p),p.vsub(u,m),g.vsub(p,f);let O=f.dot(m);g.vsub(u,f);let L=f.dot(m);if(L>0&&O<0&&(g.vsub(u,f),v.copy(m),v.normalize(),L=f.dot(v),v.scale(L,f),f.vadd(u,f),f.distanceTo(g)<t.radius)){if(d)return!0;let q=this.createContactEquation(a,l,t,e,c,h);f.vsub(g,q.ni),q.ni.normalize(),q.ni.scale(t.radius,q.ri),q.ri.vadd(n,q.ri),q.ri.vsub(a.position,q.ri),oe.pointToWorldFrame(s,o,f,f),f.vsub(l.position,q.rj),oe.vectorToWorldFrame(o,q.ni,q.ni),oe.vectorToWorldFrame(o,q.ri,q.ri),this.result.push(q),this.createFrictionEquationsFromContact(q,this.frictionResult)}}let x=KM,y=JM,P=QM,N=VM;for(let R=0,D=E.length;R!==D;R++){e.getTriangleVertices(E[R],x,y,P),e.getNormal(E[R],N),g.vsub(x,f);let O=f.dot(N);if(N.scale(O,f),g.vsub(f,f),O=f.distanceTo(g),Mn.pointInTriangle(f,x,y,P)&&O<t.radius){if(d)return!0;let L=this.createContactEquation(a,l,t,e,c,h);f.vsub(g,L.ni),L.ni.normalize(),L.ni.scale(t.radius,L.ri),L.ri.vadd(n,L.ri),L.ri.vsub(a.position,L.ri),oe.pointToWorldFrame(s,o,f,f),f.vsub(l.position,L.rj),oe.vectorToWorldFrame(o,L.ni,L.ni),oe.vectorToWorldFrame(o,L.ri,L.ri),this.result.push(L),this.createFrictionEquationsFromContact(L,this.frictionResult)}}E.length=0}planeTrimesh(t,e,n,s,r,o,a,l,c,h,d){let u=new S,p=OM;p.set(0,0,1),r.vmult(p,p);for(let m=0;m<e.vertices.length/3;m++){e.getVertex(m,u);let v=new S;v.copy(u),oe.pointToWorldFrame(s,o,v,u);let g=kM;if(u.vsub(n,g),p.dot(g)<=0){if(d)return!0;let _=this.createContactEquation(a,l,t,e,c,h);_.ni.copy(p);let w=zM;p.scale(g.dot(p),w),u.vsub(w,w),_.ri.copy(w),_.ri.vsub(a.position,_.ri),_.rj.copy(u),_.rj.vsub(l.position,_.rj),this.result.push(_),this.createFrictionEquationsFromContact(_,this.frictionResult)}}}},ws=new S,mr=new S,gr=new S,NM=new S,DM=new S,BM=new je,UM=new je,OM=new S,kM=new S,zM=new S,VM=new S,GM=new S;new S;var HM=new S,WM=new S,qM=new S,XM=new S,YM=new S,jM=new S,$M=new S,ZM=new S,KM=new S,JM=new S,QM=new S,tS=new gn,eS=[],xc=new S,Zm=new S,nS=new S,iS=new S,sS=new S;function rS(i,t,e){let n=null,s=i.length;for(let r=0;r!==s;r++){let o=i[r],a=nS;i[(r+1)%s].vsub(o,a);let l=iS;a.cross(t,l);let c=sS;e.vsub(o,c);let h=l.dot(c);if(n===null||h>0&&n===!0||h<=0&&n===!1){n===null&&(n=h>0);continue}else return!1}return!0}var bc=new S,oS=new S,aS=new S,lS=new S,cS=[new S,new S,new S,new S,new S,new S],hS=new S,uS=new S,dS=new S,pS=new S,fS=new S,mS=new S,gS=new S,vS=new S,_S=new S,xS=new S,bS=new S,yS=new S,wS=new S,MS=new S;new S;new S;var SS=new S,ES=new S,AS=new S,CS=new S,TS=new S,PS=new S,RS=new S,IS=new S,LS=new S,FS=new S,Km=new je,NS=new S;new S;var DS=new S,Jm=new S,BS=new S,US=new S,OS=new S,kS=[0],zS=new S,VS=new S,Pc=class{constructor(){this.current=[],this.previous=[]}getKey(t,e){if(e<t){let n=e;e=t,t=n}return t<<16|e}set(t,e){let n=this.getKey(t,e),s=this.current,r=0;for(;n>s[r];)r++;if(n!==s[r]){for(let o=s.length-1;o>=r;o--)s[o+1]=s[o];s[r]=n}}tick(){let t=this.current;this.current=this.previous,this.previous=t,this.current.length=0}getDiff(t,e){let n=this.current,s=this.previous,r=n.length,o=s.length,a=0;for(let l=0;l<r;l++){let c=!1,h=n[l];for(;h>s[a];)a++;c=h===s[a],c||Qm(t,h)}a=0;for(let l=0;l<o;l++){let c=!1,h=s[l];for(;h>n[a];)a++;c=n[a]===h,c||Qm(e,h)}}};function Qm(i,t){i.push((t&4294901760)>>16,t&65535)}var Au=(i,t)=>i<t?`${i}-${t}`:`${t}-${i}`,Bu=class{constructor(){this.data={keys:[]}}get(t,e){let n=Au(t,e);return this.data[n]}set(t,e,n){let s=Au(t,e);this.get(t,e)||this.data.keys.push(s),this.data[s]=n}delete(t,e){let n=Au(t,e),s=this.data.keys.indexOf(n);s!==-1&&this.data.keys.splice(s,1),delete this.data[n]}reset(){let t=this.data,e=t.keys;for(;e.length>0;){let n=e.pop();delete t[n]}}},Rc=class extends wc{constructor(t){t===void 0&&(t={}),super(),this.dt=-1,this.allowSleep=!!t.allowSleep,this.contacts=[],this.frictionEquations=[],this.quatNormalizeSkip=t.quatNormalizeSkip!==void 0?t.quatNormalizeSkip:0,this.quatNormalizeFast=t.quatNormalizeFast!==void 0?t.quatNormalizeFast:!1,this.time=0,this.stepnumber=0,this.default_dt=1/60,this.nextId=0,this.gravity=new S,t.gravity&&this.gravity.copy(t.gravity),t.frictionGravity&&(this.frictionGravity=new S,this.frictionGravity.copy(t.frictionGravity)),this.broadphase=t.broadphase!==void 0?t.broadphase:new Ru,this.bodies=[],this.hasActiveBodies=!1,this.solver=t.solver!==void 0?t.solver:new Lu,this.constraints=[],this.narrowphase=new Du(this),this.collisionMatrix=new yc,this.collisionMatrixPrevious=new yc,this.bodyOverlapKeeper=new Pc,this.shapeOverlapKeeper=new Pc,this.contactmaterials=[],this.contactMaterialTable=new Bu,this.defaultMaterial=new Es("default"),this.defaultContactMaterial=new Ss(this.defaultMaterial,this.defaultMaterial,{friction:.3,restitution:0}),this.doProfiling=!1,this.profile={solve:0,makeContactConstraints:0,broadphase:0,integrate:0,narrowphase:0},this.accumulator=0,this.subsystems=[],this.addBodyEvent={type:"addBody",body:null},this.removeBodyEvent={type:"removeBody",body:null},this.idToBodyMap={},this.broadphase.setWorld(this)}getContactMaterial(t,e){return this.contactMaterialTable.get(t.id,e.id)}collisionMatrixTick(){let t=this.collisionMatrixPrevious;this.collisionMatrixPrevious=this.collisionMatrix,this.collisionMatrix=t,this.collisionMatrix.reset(),this.bodyOverlapKeeper.tick(),this.shapeOverlapKeeper.tick()}addConstraint(t){this.constraints.push(t)}removeConstraint(t){let e=this.constraints.indexOf(t);e!==-1&&this.constraints.splice(e,1)}rayTest(t,e,n){n instanceof _r?this.raycastClosest(t,e,{skipBackfaces:!0},n):this.raycastAll(t,e,{skipBackfaces:!0},n)}raycastAll(t,e,n,s){return n===void 0&&(n={}),n.mode=Mn.ALL,n.from=t,n.to=e,n.callback=s,Cu.intersectWorld(this,n)}raycastAny(t,e,n,s){return n===void 0&&(n={}),n.mode=Mn.ANY,n.from=t,n.to=e,n.result=s,Cu.intersectWorld(this,n)}raycastClosest(t,e,n,s){return n===void 0&&(n={}),n.mode=Mn.CLOSEST,n.from=t,n.to=e,n.result=s,Cu.intersectWorld(this,n)}addBody(t){this.bodies.includes(t)||(t.index=this.bodies.length,this.bodies.push(t),t.world=this,t.initPosition.copy(t.position),t.initVelocity.copy(t.velocity),t.timeLastSleepy=this.time,t instanceof Ht&&(t.initAngularVelocity.copy(t.angularVelocity),t.initQuaternion.copy(t.quaternion)),this.collisionMatrix.setNumObjects(this.bodies.length),this.addBodyEvent.body=t,this.idToBodyMap[t.id]=t,this.dispatchEvent(this.addBodyEvent))}removeBody(t){t.world=null;let e=this.bodies.length-1,n=this.bodies,s=n.indexOf(t);if(s!==-1){n.splice(s,1);for(let r=0;r!==n.length;r++)n[r].index=r;this.collisionMatrix.setNumObjects(e),this.removeBodyEvent.body=t,delete this.idToBodyMap[t.id],this.dispatchEvent(this.removeBodyEvent)}}getBodyById(t){return this.idToBodyMap[t]}getShapeById(t){let e=this.bodies;for(let n=0;n<e.length;n++){let s=e[n].shapes;for(let r=0;r<s.length;r++){let o=s[r];if(o.id===t)return o}}return null}addContactMaterial(t){this.contactmaterials.push(t),this.contactMaterialTable.set(t.materials[0].id,t.materials[1].id,t)}removeContactMaterial(t){let e=this.contactmaterials.indexOf(t);e!==-1&&(this.contactmaterials.splice(e,1),this.contactMaterialTable.delete(t.materials[0].id,t.materials[1].id))}fixedStep(t,e){t===void 0&&(t=1/60),e===void 0&&(e=10);let n=Fe.now()/1e3;if(!this.lastCallTime)this.step(t,void 0,e);else{let s=n-this.lastCallTime;this.step(t,s,e)}this.lastCallTime=n}step(t,e,n){if(n===void 0&&(n=10),e===void 0)this.internalStep(t),this.time+=t;else{this.accumulator+=e;let s=Fe.now(),r=0;for(;this.accumulator>=t&&r<n&&(this.internalStep(t),this.accumulator-=t,r++,!(Fe.now()-s>t*1e3)););this.accumulator=this.accumulator%t;let o=this.accumulator/t;for(let a=0;a!==this.bodies.length;a++){let l=this.bodies[a];l.previousPosition.lerp(l.position,o,l.interpolatedPosition),l.previousQuaternion.slerp(l.quaternion,o,l.interpolatedQuaternion),l.previousQuaternion.normalize()}this.time+=e}}internalStep(t){this.dt=t;let e=this.contacts,n=XS,s=YS,r=this.bodies.length,o=this.bodies,a=this.solver,l=this.gravity,c=this.doProfiling,h=this.profile,d=Ht.DYNAMIC,u=-1/0,p=this.constraints,m=qS;l.length();let v=l.x,g=l.y,f=l.z,_=0;for(c&&(u=Fe.now()),_=0;_!==r;_++){let R=o[_];if(R.type===d){let D=R.force,O=R.mass;D.x+=O*v,D.y+=O*g,D.z+=O*f}}for(let R=0,D=this.subsystems.length;R!==D;R++)this.subsystems[R].update();c&&(u=Fe.now()),n.length=0,s.length=0,this.broadphase.collisionPairs(this,n,s),c&&(h.broadphase=Fe.now()-u);let w=p.length;for(_=0;_!==w;_++){let R=p[_];if(!R.collideConnected)for(let D=n.length-1;D>=0;D-=1)(R.bodyA===n[D]&&R.bodyB===s[D]||R.bodyB===n[D]&&R.bodyA===s[D])&&(n.splice(D,1),s.splice(D,1))}this.collisionMatrixTick(),c&&(u=Fe.now());let M=WS,E=e.length;for(_=0;_!==E;_++)M.push(e[_]);e.length=0;let A=this.frictionEquations.length;for(_=0;_!==A;_++)m.push(this.frictionEquations[_]);for(this.frictionEquations.length=0,this.narrowphase.getContacts(n,s,this,e,M,this.frictionEquations,m),c&&(h.narrowphase=Fe.now()-u),c&&(u=Fe.now()),_=0;_<this.frictionEquations.length;_++)a.addEquation(this.frictionEquations[_]);let T=e.length;for(let R=0;R!==T;R++){let D=e[R],O=D.bi,L=D.bj,G=D.si,q=D.sj,Z;if(O.material&&L.material?Z=this.getContactMaterial(O.material,L.material)||this.defaultContactMaterial:Z=this.defaultContactMaterial,Z.friction,O.material&&L.material&&(O.material.friction>=0&&L.material.friction>=0&&O.material.friction*L.material.friction,O.material.restitution>=0&&L.material.restitution>=0&&(D.restitution=O.material.restitution*L.material.restitution)),a.addEquation(D),O.allowSleep&&O.type===Ht.DYNAMIC&&O.sleepState===Ht.SLEEPING&&L.sleepState===Ht.AWAKE&&L.type!==Ht.STATIC){let et=L.velocity.lengthSquared()+L.angularVelocity.lengthSquared(),it=L.sleepSpeedLimit**2;et>=it*2&&(O.wakeUpAfterNarrowphase=!0)}if(L.allowSleep&&L.type===Ht.DYNAMIC&&L.sleepState===Ht.SLEEPING&&O.sleepState===Ht.AWAKE&&O.type!==Ht.STATIC){let et=O.velocity.lengthSquared()+O.angularVelocity.lengthSquared(),it=O.sleepSpeedLimit**2;et>=it*2&&(L.wakeUpAfterNarrowphase=!0)}this.collisionMatrix.set(O,L,!0),this.collisionMatrixPrevious.get(O,L)||(Lo.body=L,Lo.contact=D,O.dispatchEvent(Lo),Lo.body=O,L.dispatchEvent(Lo)),this.bodyOverlapKeeper.set(O.id,L.id),this.shapeOverlapKeeper.set(G.id,q.id)}for(this.emitContactEvents(),c&&(h.makeContactConstraints=Fe.now()-u,u=Fe.now()),_=0;_!==r;_++){let R=o[_];R.wakeUpAfterNarrowphase&&(R.wakeUp(),R.wakeUpAfterNarrowphase=!1)}for(w=p.length,_=0;_!==w;_++){let R=p[_];R.update();for(let D=0,O=R.equations.length;D!==O;D++){let L=R.equations[D];a.addEquation(L)}}a.solve(t,this),c&&(h.solve=Fe.now()-u),a.removeAllEquations();let F=Math.pow;for(_=0;_!==r;_++){let R=o[_];if(R.type&d){let D=F(1-R.linearDamping,t),O=R.velocity;O.scale(D,O);let L=R.angularVelocity;if(L){let G=F(1-R.angularDamping,t);L.scale(G,L)}}}this.dispatchEvent(HS),c&&(u=Fe.now());let y=this.stepnumber%(this.quatNormalizeSkip+1)===0,P=this.quatNormalizeFast;for(_=0;_!==r;_++)o[_].integrate(t,y,P);this.clearForces(),this.broadphase.dirty=!0,c&&(h.integrate=Fe.now()-u),this.stepnumber+=1,this.dispatchEvent(GS);let N=!0;if(this.allowSleep)for(N=!1,_=0;_!==r;_++){let R=o[_];R.sleepTick(this.time),R.sleepState!==Ht.SLEEPING&&(N=!0)}this.hasActiveBodies=N}emitContactEvents(){let t=this.hasAnyEventListener("beginContact"),e=this.hasAnyEventListener("endContact");if((t||e)&&this.bodyOverlapKeeper.getDiff(pi,fi),t){for(let r=0,o=pi.length;r<o;r+=2)Fo.bodyA=this.getBodyById(pi[r]),Fo.bodyB=this.getBodyById(pi[r+1]),this.dispatchEvent(Fo);Fo.bodyA=Fo.bodyB=null}if(e){for(let r=0,o=fi.length;r<o;r+=2)No.bodyA=this.getBodyById(fi[r]),No.bodyB=this.getBodyById(fi[r+1]),this.dispatchEvent(No);No.bodyA=No.bodyB=null}pi.length=fi.length=0;let n=this.hasAnyEventListener("beginShapeContact"),s=this.hasAnyEventListener("endShapeContact");if((n||s)&&this.shapeOverlapKeeper.getDiff(pi,fi),n){for(let r=0,o=pi.length;r<o;r+=2){let a=this.getShapeById(pi[r]),l=this.getShapeById(pi[r+1]);mi.shapeA=a,mi.shapeB=l,a&&(mi.bodyA=a.body),l&&(mi.bodyB=l.body),this.dispatchEvent(mi)}mi.bodyA=mi.bodyB=mi.shapeA=mi.shapeB=null}if(s){for(let r=0,o=fi.length;r<o;r+=2){let a=this.getShapeById(fi[r]),l=this.getShapeById(fi[r+1]);gi.shapeA=a,gi.shapeB=l,a&&(gi.bodyA=a.body),l&&(gi.bodyB=l.body),this.dispatchEvent(gi)}gi.bodyA=gi.bodyB=gi.shapeA=gi.shapeB=null}}clearForces(){let t=this.bodies,e=t.length;for(let n=0;n!==e;n++){let s=t[n];s.force,s.torque,s.force.set(0,0,0),s.torque.set(0,0,0)}}};new gn;var Cu=new Mn,Fe=globalThis.performance||{};if(!Fe.now){let i=Date.now();Fe.timing&&Fe.timing.navigationStart&&(i=Fe.timing.navigationStart),Fe.now=()=>Date.now()-i}new S;var GS={type:"postStep"},HS={type:"preStep"},Lo={type:Ht.COLLIDE_EVENT_NAME,body:null,contact:null},WS=[],qS=[],XS=[],YS=[],pi=[],fi=[],Fo={type:"beginContact",bodyA:null,bodyB:null},No={type:"endContact",bodyA:null,bodyB:null},mi={type:"beginShapeContact",bodyA:null,bodyB:null,shapeA:null,shapeB:null},gi={type:"endShapeContact",bodyA:null,bodyB:null,shapeA:null,shapeB:null};var $S=1/30,ZS=64,KS=1,zu=2,ag=4;function lg(i,t,e={}){let{ringRadius:n=.18,ringMass:s=.3,anchorY:r=2.85,anchorStringLen:o=.85}=e,a=null,l=new Rc({gravity:new S(0,B.gravity,0)});l.solver.iterations=B.solverIterations,l.solver.tolerance=1e-4;let c=new Es("chime"),h=new Es("clapper"),d=new Ss(c,c,{friction:B.chimeFriction,restitution:B.chimeRestitution}),u=new Ss(c,h,{friction:B.clapperFriction,restitution:B.clapperRestitution});l.addContactMaterial(d),l.addContactMaterial(u);let p=new Ht({mass:0,position:new S(0,r,0)});l.addBody(p);let m=new Bo(n,n,.02,12),v=new Ht({mass:s,position:new S(0,r-o,0),angularDamping:B.ringDamping,linearDamping:.05,collisionFilterGroup:KS,collisionFilterMask:0});v.addShape(m),l.addBody(v),l.addConstraint(new xr(p,new S(0,0,0),v,new S(0,o,0)));let g=i.map((x,y)=>{let{radius:P,halfLen:N,mass:R,pivotAngle:D,stringLen:O}=x,L=N*2,G=new S(Math.cos(D)*n,0,Math.sin(D)*n),q=v.position,Z=q.x+G.x,et=q.y+G.y-O-N,it=q.z+G.z,nt=new Bo(P,P,L,8),_t=new Ht({mass:R,position:new S(Z,et,it),linearDamping:B.chimeDamping,angularDamping:B.chimeAngularDamping,material:c,collisionFilterGroup:zu,collisionFilterMask:zu|ag});_t.addShape(nt),l.addBody(_t);let Bt=new S(0,N+O,0);return l.addConstraint(new xr(v,G,_t,Bt)),_t.addEventListener("collide",Lt=>{if(!a)return;let $=Lt.contact,J=Math.abs($.getImpactVelocityAlongNormal());J>.01&&a(y,J)}),{body:_t,index:y,radius:P,halfLen:N,stringLen:O,pivotOnRing:G}}),f=new Tc(t.radius),_=v.position.y-t.stringLen,w=new Ht({mass:t.mass,position:new S(0,_,0),linearDamping:B.clapperDamping,angularDamping:.1,material:h,collisionFilterGroup:ag,collisionFilterMask:zu});w.addShape(f),l.addBody(w),l.addConstraint(new xr(v,new S(0,0,0),w,new S(0,t.stringLen,0)));let M={body:w,radius:t.radius,stringLen:t.stringLen},E=new S;function A(x,y){l.gravity.y=B.gravity,l.solver.iterations=B.solverIterations,d.friction=B.chimeFriction,d.restitution=B.chimeRestitution,u.friction=B.clapperFriction,u.restitution=B.clapperRestitution;let P=(y.x+B.windBiasX)/(1+Math.abs(B.windBiasX)),N=(y.z+B.windBiasZ)/(1+Math.abs(B.windBiasZ));E.set(Math.sign(P)*Math.pow(Math.abs(P),B.windForceCurveExp)*B.windAmplitudeX*B.windForceScale,0,Math.sign(N)*Math.pow(Math.abs(N),B.windForceCurveExp)*B.windAmplitudeZ*B.windForceScale),v.applyForce(E.scale(.3,new S));for(let R of g){let D=R.halfLen*10;v.applyForce(E),R.body.applyForce(E.scale(D,new S))}w.applyForce(E.scale(.5,new S)),l.step($S,x,ZS)}function T(x){a=x}function F(){for(;l.constraints.length;)l.removeConstraint(l.constraints[0]);for(;l.bodies.length;)l.removeBody(l.bodies[0])}return{step:A,setOnCollision:T,destroy:F,chimes:g,clapper:M,ring:{body:v},anchor:{position:p.position},world:l}}var Sn=new H,As=new Ye;function cg(i,t){let e=new Vn,n=new ui({color:B.chimeColor,metalness:.09,roughness:.05}),s=new ui({color:B.ringColor,metalness:.09,roughness:.05}),r=new ui({color:B.clapperColor,metalness:.09,roughness:.03}),o=new rr({color:B.stringColor,linewidth:B.stringWidth}),a=new Pe;a.setAttribute("position",new Qt([0,0,0,0,0,0],3));let l=new us(a,o);e.add(l);let c=new io(B.ringRadius,B.ringThickness,8,32),h=new me(c,s);h.castShadow=!0,h.rotation.x=Math.PI/2,e.add(h);let d=t.chimes.map(_=>{let w=_.halfLen*2,M=new ds(_.radius,_.radius,w,12,1,!0),E=new me(M,n);E.castShadow=!0,e.add(E);let A=new eo(_.radius,12),T=new me(A,n),F=new me(A,n);T.castShadow=!0,F.castShadow=!0,e.add(T,F);let x=new Pe;x.setAttribute("position",new Qt([0,0,0,0,0,0],3));let y=new us(x,o);return e.add(y),{mesh:E,topCap:T,botCap:F,stringLine:y}}),u=new fs(t.clapper.radius,12,8),p=new me(u,r);p.castShadow=!0,e.add(p);let m=new Pe;m.setAttribute("position",new Qt([0,0,0,0,0,0],3));let v=new us(m,o);e.add(v),i.add(e);function g(){n.color.set(B.chimeColor),s.color.set(B.ringColor),r.color.set(B.clapperColor),o.color.set(B.stringColor),o.linewidth=B.stringWidth;let _=t.ring.body,w=_.position,M=_.quaternion;h.position.set(w.x,w.y,w.z),As.set(M.x,M.y,M.z,M.w),h.quaternion.copy(As),h.quaternion.multiply(new Ye().setFromAxisAngle(new H(1,0,0),Math.PI/2));let E=t.anchor.position,A=l.geometry.attributes.position;A.array[0]=E.x,A.array[1]=E.y,A.array[2]=E.z,A.array[3]=w.x,A.array[4]=w.y,A.array[5]=w.z,A.needsUpdate=!0;for(let x=0;x<t.chimes.length;x++){let y=t.chimes[x],P=d[x],N=y.body.position,R=y.body.quaternion;P.mesh.position.set(N.x,N.y,N.z),P.mesh.quaternion.set(R.x,R.y,R.z,R.w),As.set(R.x,R.y,R.z,R.w),Sn.set(0,y.halfLen,0).applyQuaternion(As);let D=N.x+Sn.x,O=N.y+Sn.y,L=N.z+Sn.z;Sn.set(0,-y.halfLen,0).applyQuaternion(As);let G=N.x+Sn.x,q=N.y+Sn.y,Z=N.z+Sn.z;P.topCap.position.set(D,O,L),P.topCap.quaternion.copy(P.mesh.quaternion),P.topCap.quaternion.multiply(new Ye().setFromAxisAngle(new H(1,0,0),-Math.PI/2)),P.botCap.position.set(G,q,Z),P.botCap.quaternion.copy(P.mesh.quaternion),P.botCap.quaternion.multiply(new Ye().setFromAxisAngle(new H(1,0,0),Math.PI/2));let et=y.pivotOnRing;As.set(M.x,M.y,M.z,M.w),Sn.set(et.x,et.y,et.z).applyQuaternion(As);let it=w.x+Sn.x,nt=w.y+Sn.y,_t=w.z+Sn.z,Bt=P.stringLine.geometry.attributes.position;Bt.array[0]=it,Bt.array[1]=nt,Bt.array[2]=_t,Bt.array[3]=D,Bt.array[4]=O,Bt.array[5]=L,Bt.needsUpdate=!0}let T=t.clapper.body;p.position.set(T.position.x,T.position.y,T.position.z);let F=v.geometry.attributes.position;F.array[0]=w.x,F.array[1]=w.y,F.array[2]=w.z,F.array[3]=T.position.x,F.array[4]=T.position.y,F.array[5]=T.position.z,F.needsUpdate=!0}function f(){i.remove(e),e.traverse(_=>{_.geometry&&_.geometry.dispose()}),n.dispose(),s.dispose(),r.dispose(),o.dispose()}return{update:g,dispose:f}}function hg(i){let t=new Vn,e=new hi({color:B.windArrowColor}),n=new ds(.5,.5,1,8);n.translate(0,.5,0);let s=new me(n,e);t.add(s);let r=new no(.5,1,8);r.translate(0,.5,0);let o=new me(r,e);t.add(o),t.position.y=B.windArrowY,i.add(t);let a=new H,l=new H(0,1,0),c=new Ye;function h(u){if(!B.windArrowVisible){t.visible=!1;return}t.visible=!0;let p=B.windArrowWidth,m=p*3,v=m*2,g=Math.sqrt(u.x*u.x+u.z*u.z),f=g*B.windArrowLength,_=Math.max(f-v,0),w=f<v?f/v:1;g>.001&&(a.set(u.x,0,u.z).normalize(),c.setFromUnitVectors(l,a),t.quaternion.copy(c)),s.scale.set(p*w,_,p*w),o.position.set(0,_,0),o.scale.set(m*w,v*w,m*w),t.position.y=B.windArrowY,e.color.set(B.windArrowColor)}function d(){i.remove(t),n.dispose(),r.dispose(),e.dispose()}return{update:h,dispose:d}}var br=class{constructor(t=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let e=0;e<256;e++)this.p[e]=Math.floor(t.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(t,e){let n,s,r,o=.5*(Math.sqrt(3)-1),a=(t+e)*o,l=Math.floor(t+a),c=Math.floor(e+a),h=(3-Math.sqrt(3))/6,d=(l+c)*h,u=l-d,p=c-d,m=t-u,v=e-p,g,f;m>v?(g=1,f=0):(g=0,f=1);let _=m-g+h,w=v-f+h,M=m-1+2*h,E=v-1+2*h,A=l&255,T=c&255,F=this.perm[A+this.perm[T]]%12,x=this.perm[A+g+this.perm[T+f]]%12,y=this.perm[A+1+this.perm[T+1]]%12,P=.5-m*m-v*v;P<0?n=0:(P*=P,n=P*P*this._dot(this.grad3[F],m,v));let N=.5-_*_-w*w;N<0?s=0:(N*=N,s=N*N*this._dot(this.grad3[x],_,w));let R=.5-M*M-E*E;return R<0?r=0:(R*=R,r=R*R*this._dot(this.grad3[y],M,E)),70*(n+s+r)}noise3d(t,e,n){let s,r,o,a,c=(t+e+n)*.3333333333333333,h=Math.floor(t+c),d=Math.floor(e+c),u=Math.floor(n+c),p=1/6,m=(h+d+u)*p,v=h-m,g=d-m,f=u-m,_=t-v,w=e-g,M=n-f,E,A,T,F,x,y;_>=w?w>=M?(E=1,A=0,T=0,F=1,x=1,y=0):_>=M?(E=1,A=0,T=0,F=1,x=0,y=1):(E=0,A=0,T=1,F=1,x=0,y=1):w<M?(E=0,A=0,T=1,F=0,x=1,y=1):_<M?(E=0,A=1,T=0,F=0,x=1,y=1):(E=0,A=1,T=0,F=1,x=1,y=0);let P=_-E+p,N=w-A+p,R=M-T+p,D=_-F+2*p,O=w-x+2*p,L=M-y+2*p,G=_-1+3*p,q=w-1+3*p,Z=M-1+3*p,et=h&255,it=d&255,nt=u&255,_t=this.perm[et+this.perm[it+this.perm[nt]]]%12,Bt=this.perm[et+E+this.perm[it+A+this.perm[nt+T]]]%12,Lt=this.perm[et+F+this.perm[it+x+this.perm[nt+y]]]%12,$=this.perm[et+1+this.perm[it+1+this.perm[nt+1]]]%12,J=.6-_*_-w*w-M*M;J<0?s=0:(J*=J,s=J*J*this._dot3(this.grad3[_t],_,w,M));let ft=.6-P*P-N*N-R*R;ft<0?r=0:(ft*=ft,r=ft*ft*this._dot3(this.grad3[Bt],P,N,R));let Tt=.6-D*D-O*O-L*L;Tt<0?o=0:(Tt*=Tt,o=Tt*Tt*this._dot3(this.grad3[Lt],D,O,L));let gt=.6-G*G-q*q-Z*Z;return gt<0?a=0:(gt*=gt,a=gt*gt*this._dot3(this.grad3[$],G,q,Z)),32*(s+r+o+a)}noise4d(t,e,n,s){let r=this.grad4,o=this.simplex,a=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,h,d,u,p,m,v=(t+e+n+s)*l,g=Math.floor(t+v),f=Math.floor(e+v),_=Math.floor(n+v),w=Math.floor(s+v),M=(g+f+_+w)*c,E=g-M,A=f-M,T=_-M,F=w-M,x=t-E,y=e-A,P=n-T,N=s-F,R=x>y?32:0,D=x>P?16:0,O=y>P?8:0,L=x>N?4:0,G=y>N?2:0,q=P>N?1:0,Z=R+D+O+L+G+q,et=o[Z][0]>=3?1:0,it=o[Z][1]>=3?1:0,nt=o[Z][2]>=3?1:0,_t=o[Z][3]>=3?1:0,Bt=o[Z][0]>=2?1:0,Lt=o[Z][1]>=2?1:0,$=o[Z][2]>=2?1:0,J=o[Z][3]>=2?1:0,ft=o[Z][0]>=1?1:0,Tt=o[Z][1]>=1?1:0,gt=o[Z][2]>=1?1:0,Wt=o[Z][3]>=1?1:0,le=x-et+c,Vt=y-it+c,jt=P-nt+c,se=N-_t+c,zt=x-Bt+2*c,xe=y-Lt+2*c,U=P-$+2*c,be=N-J+2*c,Jt=x-ft+3*c,re=y-Tt+3*c,St=P-gt+3*c,I=N-Wt+3*c,b=x-1+4*c,z=y-1+4*c,K=P-1+4*c,Q=N-1+4*c,j=g&255,wt=f&255,at=_&255,xt=w&255,It=a[j+a[wt+a[at+a[xt]]]]%32,st=a[j+et+a[wt+it+a[at+nt+a[xt+_t]]]]%32,ct=a[j+Bt+a[wt+Lt+a[at+$+a[xt+J]]]]%32,Mt=a[j+ft+a[wt+Tt+a[at+gt+a[xt+Wt]]]]%32,At=a[j+1+a[wt+1+a[at+1+a[xt+1]]]]%32,lt=.6-x*x-y*y-P*P-N*N;lt<0?h=0:(lt*=lt,h=lt*lt*this._dot4(r[It],x,y,P,N));let Ot=.6-le*le-Vt*Vt-jt*jt-se*se;Ot<0?d=0:(Ot*=Ot,d=Ot*Ot*this._dot4(r[st],le,Vt,jt,se));let k=.6-zt*zt-xe*xe-U*U-be*be;k<0?u=0:(k*=k,u=k*k*this._dot4(r[ct],zt,xe,U,be));let ut=.6-Jt*Jt-re*re-St*St-I*I;ut<0?p=0:(ut*=ut,p=ut*ut*this._dot4(r[Mt],Jt,re,St,I));let ot=.6-b*b-z*z-K*K-Q*Q;return ot<0?m=0:(ot*=ot,m=ot*ot*this._dot4(r[At],b,z,K,Q)),27*(h+d+u+p+m)}_dot(t,e,n){return t[0]*e+t[1]*n}_dot3(t,e,n,s){return t[0]*e+t[1]*n+t[2]*s}_dot4(t,e,n,s,r){return t[0]*e+t[1]*n+t[2]*s+t[3]*r}};var Vu=class{constructor(t=3,e=.5,n=2,s=1){this.octaves=t,this.persistance=e,this.lacunarity=n,this.scale=s,this.noise=[];for(let r=0;r<t;r++)this.noise[r]={x:new br,y:new br,z:new br}}noise3d(t,e,n){let s=1/(2-Math.pow(this.persistance,this.octaves)),r=1,o=1,a;for(let l=0;l<this.octaves;l++){let c={x:this.noise[l].x.noise3d(t*o/this.scale,e*o/this.scale,n*o/this.scale),y:this.noise[l].y.noise3d(t*o/this.scale,e*o/this.scale,n*o/this.scale),z:this.noise[l].z.noise3d(t*o/this.scale,e*o/this.scale,n*o/this.scale)};c.x*=r*s,c.y*=r*s,c.z*=r*s,l==0?a=c:(a.x+=c.x,a.y+=c.y,a.z+=c.z),r*=this.persistance,o*=this.lacunarity}return a}};function ug(){let i={x:0,y:0,z:0,amplitude:{x:1,y:0,z:1},rate:.1,tint:0,tprev:0},t=new Vu(3,.5,2,1);function e(n){i.tint=i.tint+(n-i.tprev)*i.rate,i.tprev=n;let s=t.noise3d(0,0,i.tint);i.x=s.x*i.amplitude.x,i.y=s.y*i.amplitude.y,i.z=s.z*i.amplitude.z}return{state:i,update:e}}function dg(i){let t=new AudioContext,e=t.createGain();e.gain.value=B.masterGain,e.connect(t.destination);let n=[],s=[];function r(F){let x=yu(B);for(let y=0;y<F;y++){let P=y<x.length?x[y]:B.baseFreq,N=t.createOscillator();N.type="sine",N.frequency.value=P;let R=t.createGain();R.gain.value=0,N.connect(R),R.connect(e),N.start(),n.push(N),s.push(R)}}r(i);function o(F,x){if(F<0||F>=s.length)return;let y=Math.min(x*x,1)*B.maxGain;if(y<.001)return;let P=s[F].gain,N=t.currentTime;P.cancelScheduledValues(N),P.setValueAtTime(P.value,N),P.linearRampToValueAtTime(y,N+B.attack),P.exponentialRampToValueAtTime(1e-4,N+B.attack+B.decay),P.setValueAtTime(0,N+B.attack+B.decay+.001)}function a(){e.gain.setValueAtTime(B.masterGain,t.currentTime);let F=yu(B);for(let x=0;x<n.length;x++){let y=x<F.length?F[x]:B.baseFreq;n[x].frequency.setValueAtTime(y,t.currentTime)}}function l(F){for(let x of n)x.stop(),x.disconnect();for(let x of s)x.disconnect();n=[],s=[],r(F)}let c=t.sampleRate*4,h=t.createBuffer(1,c,t.sampleRate),d=h.getChannelData(0);for(let F=0;F<c;F++)d[F]=Math.random()*2-1;let u=t.createBufferSource();u.buffer=h,u.loop=!0;let p=t.createBiquadFilter();p.type="bandpass",p.frequency.value=B.windFilterMinFreq,p.Q.value=B.windFilterQ;let m=t.createDelay(.02);m.delayTime.value=.005;let v=t.createOscillator();v.type="sine",v.frequency.value=B.windFlangerRate;let g=t.createGain();g.gain.value=B.windFlangerDepth,v.connect(g),g.connect(m.delayTime),v.start();let f=t.createGain();f.gain.value=1-B.windFlangerMix;let _=t.createGain();_.gain.value=B.windFlangerMix;let w=t.createGain();w.gain.value=Math.max(Math.min(B.windFlangerFeedback,.95),-.95);let M=t.createGain(),E=t.createStereoPanner();E.pan.value=0;let A=t.createGain();A.gain.value=0,u.connect(p),p.connect(f),p.connect(m),m.connect(_),m.connect(w),f.connect(M),_.connect(M),w.connect(m),M.connect(E),E.connect(A),A.connect(e),u.start();function T(F){function x(nt,_t=0,Bt=1){return Math.max(_t,Math.min(Bt,nt))}function y(nt,_t=0,Bt=1,Lt=0,$=1,J=True,ft=False,Tt=False){let gt=(nt-_t)/(Bt-_t),Wt=Lt+gt*($-Lt);if(ft){let le=$-Lt;return((Wt-Lt)%le+le)%le+Lt}else if(Tt){let le=$-Lt,Vt=2*le,jt=((Wt-Lt)%Vt+Vt)%Vt;return jt<le?jt+Lt:Vt-jt+Lt}else return J?x(Wt,Math.min(Lt,$),Math.max(Lt,$)):Wt}function P(nt,_t){return Math.sign(nt)*Math.pow(Math.abs(nt),_t)}let N=Math.min(Math.max(P((F.x+B.windBiasX)/(1+Math.abs(B.windBiasX)),B.windForceCurveExp)*B.windAmplitudeX,-1),1),R=Math.min(Math.max(P((F.z+B.windBiasZ)/(1+Math.abs(B.windBiasZ)),B.windForceCurveExp)*B.windAmplitudeZ,-1),1),D=Math.sqrt(N*N+R*R)/Math.sqrt(2),O=Math.max(0,Math.min(D,1)),L=t.currentTime,G=B.windFilterMinFreq+O*(B.windFilterMaxFreq-B.windFilterMinFreq);p.frequency.setTargetAtTime(G,L,.05),p.Q.setTargetAtTime(B.windFilterQ,L,.05);let q=Math.max(0,Math.min(O/B.windGainFadeIn,1)),Z=B.windSoundMinGain+q*(B.windSoundGain-B.windSoundMinGain);A.gain.setTargetAtTime(Math.max(Z,0),L,.05);let et=Math.max(-1,Math.min(1,N));E.pan.setTargetAtTime(et,L,.05);let it=Math.min(Math.max(R+1,0)/2,1);g.gain.setTargetAtTime(it*B.windFlangerDepth,L,.05),v.frequency.setTargetAtTime(B.windFlangerRate,L,.05),f.gain.setTargetAtTime(1-B.windFlangerMix,L,.05),_.gain.setTargetAtTime(B.windFlangerMix,L,.05),w.gain.setTargetAtTime(B.windFlangerFeedback,L,.05)}return{strike:o,updateFromParams:a,rebuild:l,updateWind:T}}function ge(i){return i==null}function yp(i){return i!==null&&typeof i=="object"}function Zu(i){return i!==null&&typeof i=="object"}function JS(i,t){if(i.length!==t.length)return!1;for(let e=0;e<i.length;e++)if(i[e]!==t[e])return!1;return!0}function Ps(i,t){return Array.from(new Set([...Object.keys(i),...Object.keys(t)])).reduce((n,s)=>{let r=i[s],o=t[s];return Zu(r)&&Zu(o)?Object.assign(Object.assign({},n),{[s]:Ps(r,o)}):Object.assign(Object.assign({},n),{[s]:s in t?o:r})},{})}function wp(i){return yp(i)?"target"in i:!1}var QS={alreadydisposed:()=>"View has been already disposed",invalidparams:i=>`Invalid parameters for '${i.name}'`,nomatchingcontroller:i=>`No matching controller for '${i.key}'`,nomatchingview:i=>`No matching view for '${JSON.stringify(i.params)}'`,notbindable:()=>"Value is not bindable",notcompatible:i=>`Not compatible with  plugin '${i.id}'`,propertynotfound:i=>`Property '${i.name}' not found`,shouldneverhappen:()=>"This error should never happen"},Ue=class i{static alreadyDisposed(){return new i({type:"alreadydisposed"})}static notBindable(){return new i({type:"notbindable"})}static notCompatible(t,e){return new i({type:"notcompatible",context:{id:`${t}.${e}`}})}static propertyNotFound(t){return new i({type:"propertynotfound",context:{name:t}})}static shouldNeverHappen(){return new i({type:"shouldneverhappen"})}constructor(t){var e;this.message=(e=QS[t.type](t.context))!==null&&e!==void 0?e:"Unexpected error",this.name=this.constructor.name,this.stack=new Error(this.message).stack,this.type=t.type}toString(){return this.message}},Nc=class i{constructor(t,e){this.obj_=t,this.key=e}static isBindable(t){return!(t===null||typeof t!="object"&&typeof t!="function")}read(){return this.obj_[this.key]}write(t){this.obj_[this.key]=t}writeProperty(t,e){let n=this.read();if(!i.isBindable(n))throw Ue.notBindable();if(!(t in n))throw Ue.propertyNotFound(t);n[t]=e}},Ce=class{constructor(){this.observers_={}}on(t,e,n){var s;let r=this.observers_[t];return r||(r=this.observers_[t]=[]),r.push({handler:e,key:(s=n?.key)!==null&&s!==void 0?s:e}),this}off(t,e){let n=this.observers_[t];return n&&(this.observers_[t]=n.filter(s=>s.key!==e)),this}emit(t,e){let n=this.observers_[t];n&&n.forEach(s=>{s.handler(e)})}},Ku=class{constructor(t,e){var n;this.constraint_=e?.constraint,this.equals_=(n=e?.equals)!==null&&n!==void 0?n:((s,r)=>s===r),this.emitter=new Ce,this.rawValue_=t}get constraint(){return this.constraint_}get rawValue(){return this.rawValue_}set rawValue(t){this.setRawValue(t,{forceEmit:!1,last:!0})}setRawValue(t,e){let n=e??{forceEmit:!1,last:!0},s=this.constraint_?this.constraint_.constrain(t):t,r=this.rawValue_;this.equals_(r,s)&&!n.forceEmit||(this.emitter.emit("beforechange",{sender:this}),this.rawValue_=s,this.emitter.emit("change",{options:n,previousRawValue:r,rawValue:s,sender:this}))}},Ju=class{constructor(t){this.emitter=new Ce,this.value_=t}get rawValue(){return this.value_}set rawValue(t){this.setRawValue(t,{forceEmit:!1,last:!0})}setRawValue(t,e){let n=e??{forceEmit:!1,last:!0},s=this.value_;s===t&&!n.forceEmit||(this.emitter.emit("beforechange",{sender:this}),this.value_=t,this.emitter.emit("change",{options:n,previousRawValue:s,rawValue:this.value_,sender:this}))}},Qu=class{constructor(t){this.emitter=new Ce,this.onValueBeforeChange_=this.onValueBeforeChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.value_=t,this.value_.emitter.on("beforechange",this.onValueBeforeChange_),this.value_.emitter.on("change",this.onValueChange_)}get rawValue(){return this.value_.rawValue}onValueBeforeChange_(t){this.emitter.emit("beforechange",Object.assign(Object.assign({},t),{sender:this}))}onValueChange_(t){this.emitter.emit("change",Object.assign(Object.assign({},t),{sender:this}))}};function ye(i,t){let e=t?.constraint,n=t?.equals;return!e&&!n?new Ju(i):new Ku(i,t)}function t1(i){return[new Qu(i),(t,e)=>{i.setRawValue(t,e)}]}var Xt=class i{constructor(t){this.emitter=new Ce,this.valMap_=t;for(let e in this.valMap_)this.valMap_[e].emitter.on("change",()=>{this.emitter.emit("change",{key:e,sender:this})})}static createCore(t){return Object.keys(t).reduce((n,s)=>Object.assign(n,{[s]:ye(t[s])}),{})}static fromObject(t){let e=this.createCore(t);return new i(e)}get(t){return this.valMap_[t].rawValue}set(t,e){this.valMap_[t].rawValue=e}value(t){return this.valMap_[t]}},Rs=class{constructor(t){this.values=Xt.fromObject({max:t.max,min:t.min})}constrain(t){let e=this.values.get("max"),n=this.values.get("min");return Math.min(Math.max(t,n),e)}},td=class{constructor(t){this.values=Xt.fromObject({max:t.max,min:t.min})}constrain(t){let e=this.values.get("max"),n=this.values.get("min"),s=t;return ge(n)||(s=Math.max(s,n)),ge(e)||(s=Math.min(s,e)),s}},ed=class{constructor(t,e=0){this.step=t,this.origin=e}constrain(t){let e=this.origin%this.step,n=Math.round((t-e)/this.step);return e+n*this.step}},nd=class{constructor(t){this.text=t}evaluate(){return Number(this.text)}toString(){return this.text}},e1={"**":(i,t)=>Math.pow(i,t),"*":(i,t)=>i*t,"/":(i,t)=>i/t,"%":(i,t)=>i%t,"+":(i,t)=>i+t,"-":(i,t)=>i-t,"<<":(i,t)=>i<<t,">>":(i,t)=>i>>t,">>>":(i,t)=>i>>>t,"&":(i,t)=>i&t,"^":(i,t)=>i^t,"|":(i,t)=>i|t},id=class{constructor(t,e,n){this.left=e,this.operator=t,this.right=n}evaluate(){let t=e1[this.operator];if(!t)throw new Error(`unexpected binary operator: '${this.operator}`);return t(this.left.evaluate(),this.right.evaluate())}toString(){return["b(",this.left.toString(),this.operator,this.right.toString(),")"].join(" ")}},n1={"+":i=>i,"-":i=>-i,"~":i=>~i},sd=class{constructor(t,e){this.operator=t,this.expression=e}evaluate(){let t=n1[this.operator];if(!t)throw new Error(`unexpected unary operator: '${this.operator}`);return t(this.expression.evaluate())}toString(){return["u(",this.operator,this.expression.toString(),")"].join(" ")}};function Mp(i){return(t,e)=>{for(let n=0;n<i.length;n++){let s=i[n](t,e);if(s!=="")return s}return""}}function Vo(i,t){var e;let n=i.substr(t).match(/^\s+/);return(e=n&&n[0])!==null&&e!==void 0?e:""}function i1(i,t){let e=i.substr(t,1);return e.match(/^[1-9]$/)?e:""}function Go(i,t){var e;let n=i.substr(t).match(/^[0-9]+/);return(e=n&&n[0])!==null&&e!==void 0?e:""}function s1(i,t){let e=Go(i,t);if(e!=="")return e;let n=i.substr(t,1);if(t+=1,n!=="-"&&n!=="+")return"";let s=Go(i,t);return s===""?"":n+s}function Sp(i,t){let e=i.substr(t,1);if(t+=1,e.toLowerCase()!=="e")return"";let n=s1(i,t);return n===""?"":e+n}function Ug(i,t){let e=i.substr(t,1);if(e==="0")return e;let n=i1(i,t);return t+=n.length,n===""?"":n+Go(i,t)}function r1(i,t){let e=Ug(i,t);if(t+=e.length,e==="")return"";let n=i.substr(t,1);if(t+=n.length,n!==".")return"";let s=Go(i,t);return t+=s.length,e+n+s+Sp(i,t)}function o1(i,t){let e=i.substr(t,1);if(t+=e.length,e!==".")return"";let n=Go(i,t);return t+=n.length,n===""?"":e+n+Sp(i,t)}function a1(i,t){let e=Ug(i,t);return t+=e.length,e===""?"":e+Sp(i,t)}var l1=Mp([r1,o1,a1]);function c1(i,t){var e;let n=i.substr(t).match(/^[01]+/);return(e=n&&n[0])!==null&&e!==void 0?e:""}function h1(i,t){let e=i.substr(t,2);if(t+=e.length,e.toLowerCase()!=="0b")return"";let n=c1(i,t);return n===""?"":e+n}function u1(i,t){var e;let n=i.substr(t).match(/^[0-7]+/);return(e=n&&n[0])!==null&&e!==void 0?e:""}function d1(i,t){let e=i.substr(t,2);if(t+=e.length,e.toLowerCase()!=="0o")return"";let n=u1(i,t);return n===""?"":e+n}function p1(i,t){var e;let n=i.substr(t).match(/^[0-9a-f]+/i);return(e=n&&n[0])!==null&&e!==void 0?e:""}function f1(i,t){let e=i.substr(t,2);if(t+=e.length,e.toLowerCase()!=="0x")return"";let n=p1(i,t);return n===""?"":e+n}var m1=Mp([h1,d1,f1]),g1=Mp([m1,l1]);function v1(i,t){let e=g1(i,t);return t+=e.length,e===""?null:{evaluable:new nd(e),cursor:t}}function _1(i,t){let e=i.substr(t,1);if(t+=e.length,e!=="(")return null;let n=kg(i,t);if(!n)return null;t=n.cursor,t+=Vo(i,t).length;let s=i.substr(t,1);return t+=s.length,s!==")"?null:{evaluable:n.evaluable,cursor:t}}function x1(i,t){var e;return(e=v1(i,t))!==null&&e!==void 0?e:_1(i,t)}function Og(i,t){let e=x1(i,t);if(e)return e;let n=i.substr(t,1);if(t+=n.length,n!=="+"&&n!=="-"&&n!=="~")return null;let s=Og(i,t);return s?(t=s.cursor,{cursor:t,evaluable:new sd(n,s.evaluable)}):null}function b1(i,t,e){e+=Vo(t,e).length;let n=i.filter(s=>t.startsWith(s,e))[0];return n?(e+=n.length,e+=Vo(t,e).length,{cursor:e,operator:n}):null}function y1(i,t){return(e,n)=>{let s=i(e,n);if(!s)return null;n=s.cursor;let r=s.evaluable;for(;;){let o=b1(t,e,n);if(!o)break;n=o.cursor;let a=i(e,n);if(!a)return null;n=a.cursor,r=new id(o.operator,r,a.evaluable)}return r?{cursor:n,evaluable:r}:null}}var w1=[["**"],["*","/","%"],["+","-"],["<<",">>>",">>"],["&"],["^"],["|"]].reduce((i,t)=>y1(i,t),Og);function kg(i,t){return t+=Vo(i,t).length,w1(i,t)}function M1(i){let t=kg(i,0);return!t||t.cursor+Vo(i,t.cursor).length!==i.length?null:t.evaluable}function bi(i){var t;let e=M1(i);return(t=e?.evaluate())!==null&&t!==void 0?t:null}function zg(i){if(typeof i=="number")return i;if(typeof i=="string"){let t=bi(i);if(!ge(t))return t}return 0}function S1(i){return String(i)}function an(i){return t=>t.toFixed(Math.max(Math.min(i,20),0))}function ae(i,t,e,n,s){let r=(i-t)/(e-t);return n+r*(s-n)}function pg(i){return String(i.toFixed(10)).split(".")[1].replace(/0+$/,"").length}function Ne(i,t,e){return Math.min(Math.max(i,t),e)}function Vg(i,t){return(i%t+t)%t}function E1(i,t){return ge(i.step)?Math.max(pg(t),2):pg(i.step)}function Gg(i){var t;return(t=i.step)!==null&&t!==void 0?t:1}function Hg(i,t){var e;let n=Math.abs((e=i.step)!==null&&e!==void 0?e:t);return n===0?.1:Math.pow(10,Math.floor(Math.log10(n))-1)}function Wg(i,t){return ge(i.step)?null:new ed(i.step,t)}function qg(i){return!ge(i.max)&&!ge(i.min)?new Rs({max:i.max,min:i.min}):!ge(i.max)||!ge(i.min)?new td({max:i.max,min:i.min}):null}function Xg(i,t){var e,n,s;return{formatter:(e=i.format)!==null&&e!==void 0?e:an(E1(i,t)),keyScale:(n=i.keyScale)!==null&&n!==void 0?n:Gg(i),pointerScale:(s=i.pointerScale)!==null&&s!==void 0?s:Hg(i,t)}}function Yg(i){return{format:i.optional.function,keyScale:i.optional.number,max:i.optional.number,min:i.optional.number,pointerScale:i.optional.number,step:i.optional.number}}function Ep(i){return{constraint:i.constraint,textProps:Xt.fromObject(Xg(i.params,i.initialValue))}}var yi=class{constructor(t){this.controller=t}get element(){return this.controller.view.element}get disabled(){return this.controller.viewProps.get("disabled")}set disabled(t){this.controller.viewProps.set("disabled",t)}get hidden(){return this.controller.viewProps.get("hidden")}set hidden(t){this.controller.viewProps.set("hidden",t)}dispose(){this.controller.viewProps.set("disposed",!0)}importState(t){return this.controller.importState(t)}exportState(){return this.controller.exportState()}},Mr=class{constructor(t){this.target=t}},Is=class extends Mr{constructor(t,e,n){super(t),this.value=e,this.last=n??!0}},rd=class extends Mr{constructor(t,e){super(t),this.expanded=e}},od=class extends Mr{constructor(t,e){super(t),this.index=e}},ad=class extends Mr{constructor(t,e){super(t),this.native=e}},Ls=class extends yi{constructor(t){super(t),this.onValueChange_=this.onValueChange_.bind(this),this.emitter_=new Ce,this.controller.value.emitter.on("change",this.onValueChange_)}get label(){return this.controller.labelController.props.get("label")}set label(t){this.controller.labelController.props.set("label",t)}get key(){return this.controller.value.binding.target.key}get tag(){return this.controller.tag}set tag(t){this.controller.tag=t}on(t,e){let n=e.bind(this);return this.emitter_.on(t,s=>{n(s)},{key:e}),this}off(t,e){return this.emitter_.off(t,e),this}refresh(){this.controller.value.fetch()}onValueChange_(t){let e=this.controller.value;this.emitter_.emit("change",new Is(this,e.binding.target.read(),t.options.last))}},ld=class{constructor(t,e){this.onValueBeforeChange_=this.onValueBeforeChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.binding=e,this.value_=t,this.value_.emitter.on("beforechange",this.onValueBeforeChange_),this.value_.emitter.on("change",this.onValueChange_),this.emitter=new Ce}get rawValue(){return this.value_.rawValue}set rawValue(t){this.value_.rawValue=t}setRawValue(t,e){this.value_.setRawValue(t,e)}fetch(){this.value_.rawValue=this.binding.read()}push(){this.binding.write(this.value_.rawValue)}onValueBeforeChange_(t){this.emitter.emit("beforechange",Object.assign(Object.assign({},t),{sender:this}))}onValueChange_(t){this.push(),this.emitter.emit("change",Object.assign(Object.assign({},t),{sender:this}))}};function A1(i){if(!("binding"in i))return!1;let t=i.binding;return wp(t)&&"read"in t&&"write"in t}function C1(i,t){let n=Object.keys(t).reduce((s,r)=>{if(s===void 0)return;let o=t[r],a=o(i[r]);return a.succeeded?Object.assign(Object.assign({},s),{[r]:a.value}):void 0},{});return n}function T1(i,t){return i.reduce((e,n)=>{if(e===void 0)return;let s=t(n);if(!(!s.succeeded||s.value===void 0))return[...e,s.value]},[])}function P1(i){return i===null?!1:typeof i=="object"}function vi(i){return t=>e=>{if(!t&&e===void 0)return{succeeded:!1,value:void 0};if(t&&e===void 0)return{succeeded:!0,value:void 0};let n=i(e);return n!==void 0?{succeeded:!0,value:n}:{succeeded:!1,value:void 0}}}function fg(i){return{custom:t=>vi(t)(i),boolean:vi(t=>typeof t=="boolean"?t:void 0)(i),number:vi(t=>typeof t=="number"?t:void 0)(i),string:vi(t=>typeof t=="string"?t:void 0)(i),function:vi(t=>typeof t=="function"?t:void 0)(i),constant:t=>vi(e=>e===t?t:void 0)(i),raw:vi(t=>t)(i),object:t=>vi(e=>{if(P1(e))return C1(e,t)})(i),array:t=>vi(e=>{if(Array.isArray(e))return T1(e,t)})(i)}}var cd={optional:fg(!0),required:fg(!1)};function Se(i,t){let e=t(cd),n=cd.required.object(e)(i);return n.succeeded?n.value:void 0}function vn(i,t,e,n){if(t&&!t(i))return!1;let s=Se(i,e);return s?n(s):!1}function _n(i,t){var e;return Ps((e=i?.())!==null&&e!==void 0?e:{},t)}function Ts(i){return"value"in i}function jg(i){if(!yp(i)||!("binding"in i))return!1;let t=i.binding;return wp(t)}var $n="http://www.w3.org/2000/svg";function Dc(i){i.offsetHeight}function R1(i,t){let e=i.style.transition;i.style.transition="none",t(),i.style.transition=e}function Ap(i){return i.ontouchstart!==void 0}function I1(){return globalThis}function L1(){return I1().document}function F1(i){let t=i.ownerDocument.defaultView;return t&&"document"in t?i.getContext("2d",{willReadFrequently:!0}):null}var N1={check:'<path d="M2 8l4 4l8 -8"/>',dropdown:'<path d="M5 7h6l-3 3 z"/>',p2dpad:'<path d="M8 4v8"/><path d="M4 8h8"/><circle cx="12" cy="12" r="1.2"/>'};function $c(i,t){let e=i.createElementNS($n,"svg");return e.innerHTML=N1[t],e}function $g(i,t,e){i.insertBefore(t,i.children[e])}function Cp(i){i.parentElement&&i.parentElement.removeChild(i)}function Zg(i){for(;i.children.length>0;)i.removeChild(i.children[0])}function D1(i){for(;i.childNodes.length>0;)i.removeChild(i.childNodes[0])}function Kg(i){return i.relatedTarget?i.relatedTarget:"explicitOriginalTarget"in i?i.explicitOriginalTarget:null}function xi(i,t){i.emitter.on("change",e=>{t(e.rawValue)}),t(i.rawValue)}function Kn(i,t,e){xi(i.value(t),e)}var B1="tp";function te(i){return(e,n)=>[B1,"-",i,"v",e?`_${e}`:"",n?`-${n}`:""].join("")}var Uo=te("lbl");function U1(i,t){let e=i.createDocumentFragment();return t.split(`
`).map(s=>i.createTextNode(s)).forEach((s,r)=>{r>0&&e.appendChild(i.createElement("br")),e.appendChild(s)}),e}var Bc=class{constructor(t,e){this.element=t.createElement("div"),this.element.classList.add(Uo()),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("div");n.classList.add(Uo("l")),Kn(e.props,"label",r=>{ge(r)?this.element.classList.add(Uo(void 0,"nol")):(this.element.classList.remove(Uo(void 0,"nol")),D1(n),n.appendChild(U1(t,r)))}),this.element.appendChild(n),this.labelElement=n;let s=t.createElement("div");s.classList.add(Uo("v")),this.element.appendChild(s),this.valueElement=s}},Uc=class{constructor(t,e){this.props=e.props,this.valueController=e.valueController,this.viewProps=e.valueController.viewProps,this.view=new Bc(t,{props:e.props,viewProps:this.viewProps}),this.view.valueElement.appendChild(this.valueController.view.element)}importProps(t){return vn(t,null,e=>({label:e.optional.string}),e=>(this.props.set("label",e.label),!0))}exportProps(){return _n(null,{label:this.props.get("label")})}};function O1(){return["veryfirst","first","last","verylast"]}var mg=te(""),gg={veryfirst:"vfst",first:"fst",last:"lst",verylast:"vlst"},Sr=class{constructor(t){this.parent_=null,this.blade=t.blade,this.view=t.view,this.viewProps=t.viewProps;let e=this.view.element;this.blade.value("positions").emitter.on("change",()=>{O1().forEach(n=>{e.classList.remove(mg(void 0,gg[n]))}),this.blade.get("positions").forEach(n=>{e.classList.add(mg(void 0,gg[n]))})}),this.viewProps.handleDispose(()=>{Cp(e)})}get parent(){return this.parent_}set parent(t){this.parent_=t,this.viewProps.set("parent",this.parent_?this.parent_.viewProps:null)}importState(t){return vn(t,null,e=>({disabled:e.required.boolean,hidden:e.required.boolean}),e=>(this.viewProps.importState(e),!0))}exportState(){return _n(null,Object.assign({},this.viewProps.exportState()))}},wi=class extends Sr{constructor(t,e){if(e.value!==e.valueController.value)throw Ue.shouldNeverHappen();let n=e.valueController.viewProps,s=new Uc(t,{blade:e.blade,props:e.props,valueController:e.valueController});super(Object.assign(Object.assign({},e),{view:new Bc(t,{props:e.props,viewProps:n}),viewProps:n})),this.labelController=s,this.value=e.value,this.valueController=e.valueController,this.view.valueElement.appendChild(this.valueController.view.element)}importState(t){return vn(t,e=>{var n,s,r;return super.importState(e)&&this.labelController.importProps(e)&&((r=(s=(n=this.valueController).importProps)===null||s===void 0?void 0:s.call(n,t))!==null&&r!==void 0?r:!0)},e=>({value:e.optional.raw}),e=>(e.value&&(this.value.rawValue=e.value),!0))}exportState(){var t,e,n;return _n(()=>super.exportState(),Object.assign(Object.assign({value:this.value.rawValue},this.labelController.exportProps()),(n=(e=(t=this.valueController).exportProps)===null||e===void 0?void 0:e.call(t))!==null&&n!==void 0?n:{}))}};function vg(i){let t=Object.assign({},i);return delete t.value,t}var Oc=class extends wi{constructor(t,e){super(t,e),this.tag=e.tag}importState(t){return vn(t,e=>super.importState(vg(t)),e=>({tag:e.optional.string}),e=>(this.tag=e.tag,!0))}exportState(){return _n(()=>vg(super.exportState()),{binding:{key:this.value.binding.target.key,value:this.value.binding.target.read()},tag:this.tag})}};function k1(i){return Ts(i)&&jg(i.value)}var hd=class extends Oc{importState(t){return vn(t,e=>super.importState(e),e=>({binding:e.required.object({value:e.required.raw})}),e=>(this.value.binding.inject(e.binding.value),this.value.fetch(),!0))}};function z1(i){return Ts(i)&&A1(i.value)}function Jg(i,t){for(;i.length<t;)i.push(void 0)}function V1(i){let t=[];return Jg(t,i),t}function G1(i){let t=i.indexOf(void 0);return t<0?i:i.slice(0,t)}function H1(i,t){let e=[...G1(i),t];return e.length>i.length?e.splice(0,e.length-i.length):Jg(e,i.length),e}var ud=class{constructor(t){this.emitter=new Ce,this.onTick_=this.onTick_.bind(this),this.onValueBeforeChange_=this.onValueBeforeChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.binding=t.binding,this.value_=ye(V1(t.bufferSize)),this.value_.emitter.on("beforechange",this.onValueBeforeChange_),this.value_.emitter.on("change",this.onValueChange_),this.ticker=t.ticker,this.ticker.emitter.on("tick",this.onTick_),this.fetch()}get rawValue(){return this.value_.rawValue}set rawValue(t){this.value_.rawValue=t}setRawValue(t,e){this.value_.setRawValue(t,e)}fetch(){this.value_.rawValue=H1(this.value_.rawValue,this.binding.read())}onTick_(){this.fetch()}onValueBeforeChange_(t){this.emitter.emit("beforechange",Object.assign(Object.assign({},t),{sender:this}))}onValueChange_(t){this.emitter.emit("change",Object.assign(Object.assign({},t),{sender:this}))}};function W1(i){if(!("binding"in i))return!1;let t=i.binding;return wp(t)&&"read"in t&&!("write"in t)}var dd=class extends Oc{exportState(){return _n(()=>super.exportState(),{binding:{readonly:!0}})}};function q1(i){return Ts(i)&&W1(i.value)}var pd=class extends yi{get label(){return this.controller.labelController.props.get("label")}set label(t){this.controller.labelController.props.set("label",t)}get title(){var t;return(t=this.controller.buttonController.props.get("title"))!==null&&t!==void 0?t:""}set title(t){this.controller.buttonController.props.set("title",t)}on(t,e){let n=e.bind(this);return this.controller.buttonController.emitter.on(t,r=>{n(new ad(this,r.nativeEvent))}),this}off(t,e){return this.controller.buttonController.emitter.off(t,e),this}};function X1(i,t,e){e?i.classList.add(t):i.classList.remove(t)}function Cr(i,t){return e=>{X1(i,t,e)}}function Tp(i,t){xi(i,e=>{t.textContent=e??""})}var Gu=te("btn"),fd=class{constructor(t,e){this.element=t.createElement("div"),this.element.classList.add(Gu()),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("button");n.classList.add(Gu("b")),e.viewProps.bindDisabled(n),this.element.appendChild(n),this.buttonElement=n;let s=t.createElement("div");s.classList.add(Gu("t")),Tp(e.props.value("title"),s),this.buttonElement.appendChild(s)}},md=class{constructor(t,e){this.emitter=new Ce,this.onClick_=this.onClick_.bind(this),this.props=e.props,this.viewProps=e.viewProps,this.view=new fd(t,{props:this.props,viewProps:this.viewProps}),this.view.buttonElement.addEventListener("click",this.onClick_)}importProps(t){return vn(t,null,e=>({title:e.optional.string}),e=>(this.props.set("title",e.title),!0))}exportProps(){return _n(null,{title:this.props.get("title")})}onClick_(t){this.emitter.emit("click",{nativeEvent:t,sender:this})}},kc=class extends Sr{constructor(t,e){let n=new md(t,{props:e.buttonProps,viewProps:e.viewProps}),s=new Uc(t,{blade:e.blade,props:e.labelProps,valueController:n});super({blade:e.blade,view:s.view,viewProps:e.viewProps}),this.buttonController=n,this.labelController=s}importState(t){return vn(t,e=>super.importState(e)&&this.buttonController.importProps(e)&&this.labelController.importProps(e),()=>({}),()=>!0)}exportState(){return _n(()=>super.exportState(),Object.assign(Object.assign({},this.buttonController.exportProps()),this.labelController.exportProps()))}},zc=class{constructor(t){let[e,n]=t.split("-"),s=e.split(".");this.major=parseInt(s[0],10),this.minor=parseInt(s[1],10),this.patch=parseInt(s[2],10),this.prerelease=n??null}toString(){let t=[this.major,this.minor,this.patch].join(".");return this.prerelease!==null?[t,this.prerelease].join("-"):t}},Tr=new zc("2.0.5");function Ze(i){return Object.assign({core:Tr},i)}var Y1=Ze({id:"button",type:"blade",accept(i){let t=Se(i,e=>({title:e.required.string,view:e.required.constant("button"),label:e.optional.string}));return t?{params:t}:null},controller(i){return new kc(i.document,{blade:i.blade,buttonProps:Xt.fromObject({title:i.params.title}),labelProps:Xt.fromObject({label:i.params.label}),viewProps:i.viewProps})},api(i){return i.controller instanceof kc?new pd(i.controller):null}});function j1(i,t){return i.addBlade(Object.assign(Object.assign({},t),{view:"button"}))}function $1(i,t){return i.addBlade(Object.assign(Object.assign({},t),{view:"folder"}))}function Z1(i,t){return i.addBlade(Object.assign(Object.assign({},t),{view:"tab"}))}function K1(i){return yp(i)?"refresh"in i&&typeof i.refresh=="function":!1}function J1(i,t){if(!Nc.isBindable(i))throw Ue.notBindable();return new Nc(i,t)}var gd=class{constructor(t,e){this.onRackValueChange_=this.onRackValueChange_.bind(this),this.controller_=t,this.emitter_=new Ce,this.pool_=e,this.controller_.rack.emitter.on("valuechange",this.onRackValueChange_)}get children(){return this.controller_.rack.children.map(t=>this.pool_.createApi(t))}addBinding(t,e,n){let s=n??{},r=this.controller_.element.ownerDocument,o=this.pool_.createBinding(r,J1(t,e),s),a=this.pool_.createBindingApi(o);return this.add(a,s.index)}addFolder(t){return $1(this,t)}addButton(t){return j1(this,t)}addTab(t){return Z1(this,t)}add(t,e){let n=t.controller;return this.controller_.rack.add(n,e),t}remove(t){this.controller_.rack.remove(t.controller)}addBlade(t){let e=this.controller_.element.ownerDocument,n=this.pool_.createBlade(e,t),s=this.pool_.createApi(n);return this.add(s,t.index)}on(t,e){let n=e.bind(this);return this.emitter_.on(t,s=>{n(s)},{key:e}),this}off(t,e){return this.emitter_.off(t,e),this}refresh(){this.children.forEach(t=>{K1(t)&&t.refresh()})}onRackValueChange_(t){let e=t.bladeController,n=this.pool_.createApi(e),s=jg(e.value)?e.value.binding:null;this.emitter_.emit("change",new Is(n,s?s.target.read():e.value.rawValue,t.options.last))}},Ho=class extends yi{constructor(t,e){super(t),this.rackApi_=new gd(t.rackController,e)}refresh(){this.rackApi_.refresh()}},Wo=class extends Sr{constructor(t){super({blade:t.blade,view:t.view,viewProps:t.rackController.viewProps}),this.rackController=t.rackController}importState(t){return vn(t,e=>super.importState(e),e=>({children:e.required.array(e.required.raw)}),e=>this.rackController.rack.children.every((n,s)=>n.importState(e.children[s])))}exportState(){return _n(()=>super.exportState(),{children:this.rackController.rack.children.map(t=>t.exportState())})}};function vd(i){return"rackController"in i}var _d=class{constructor(t){this.emitter=new Ce,this.items_=[],this.cache_=new Set,this.onSubListAdd_=this.onSubListAdd_.bind(this),this.onSubListRemove_=this.onSubListRemove_.bind(this),this.extract_=t}get items(){return this.items_}allItems(){return Array.from(this.cache_)}find(t){for(let e of this.allItems())if(t(e))return e;return null}includes(t){return this.cache_.has(t)}add(t,e){if(this.includes(t))throw Ue.shouldNeverHappen();let n=e!==void 0?e:this.items_.length;this.items_.splice(n,0,t),this.cache_.add(t);let s=this.extract_(t);s&&(s.emitter.on("add",this.onSubListAdd_),s.emitter.on("remove",this.onSubListRemove_),s.allItems().forEach(r=>{this.cache_.add(r)})),this.emitter.emit("add",{index:n,item:t,root:this,target:this})}remove(t){let e=this.items_.indexOf(t);if(e<0)return;this.items_.splice(e,1),this.cache_.delete(t);let n=this.extract_(t);n&&(n.allItems().forEach(s=>{this.cache_.delete(s)}),n.emitter.off("add",this.onSubListAdd_),n.emitter.off("remove",this.onSubListRemove_)),this.emitter.emit("remove",{index:e,item:t,root:this,target:this})}onSubListAdd_(t){this.cache_.add(t.item),this.emitter.emit("add",{index:t.index,item:t.item,root:this,target:t.target})}onSubListRemove_(t){this.cache_.delete(t.item),this.emitter.emit("remove",{index:t.index,item:t.item,root:this,target:t.target})}};function Q1(i,t){for(let e=0;e<i.length;e++){let n=i[e];if(Ts(n)&&n.value===t)return n}return null}function tE(i){return vd(i)?i.rackController.rack.bcSet_:null}var xd=class{constructor(t){var e,n;this.emitter=new Ce,this.onBladePositionsChange_=this.onBladePositionsChange_.bind(this),this.onSetAdd_=this.onSetAdd_.bind(this),this.onSetRemove_=this.onSetRemove_.bind(this),this.onChildDispose_=this.onChildDispose_.bind(this),this.onChildPositionsChange_=this.onChildPositionsChange_.bind(this),this.onChildValueChange_=this.onChildValueChange_.bind(this),this.onChildViewPropsChange_=this.onChildViewPropsChange_.bind(this),this.onRackLayout_=this.onRackLayout_.bind(this),this.onRackValueChange_=this.onRackValueChange_.bind(this),this.blade_=(e=t.blade)!==null&&e!==void 0?e:null,(n=this.blade_)===null||n===void 0||n.value("positions").emitter.on("change",this.onBladePositionsChange_),this.viewProps=t.viewProps,this.bcSet_=new _d(tE),this.bcSet_.emitter.on("add",this.onSetAdd_),this.bcSet_.emitter.on("remove",this.onSetRemove_)}get children(){return this.bcSet_.items}add(t,e){var n;(n=t.parent)===null||n===void 0||n.remove(t),t.parent=this,this.bcSet_.add(t,e)}remove(t){t.parent=null,this.bcSet_.remove(t)}find(t){return this.bcSet_.allItems().filter(t)}onSetAdd_(t){this.updatePositions_();let e=t.target===t.root;if(this.emitter.emit("add",{bladeController:t.item,index:t.index,root:e,sender:this}),!e)return;let n=t.item;if(n.viewProps.emitter.on("change",this.onChildViewPropsChange_),n.blade.value("positions").emitter.on("change",this.onChildPositionsChange_),n.viewProps.handleDispose(this.onChildDispose_),Ts(n))n.value.emitter.on("change",this.onChildValueChange_);else if(vd(n)){let s=n.rackController.rack;if(s){let r=s.emitter;r.on("layout",this.onRackLayout_),r.on("valuechange",this.onRackValueChange_)}}}onSetRemove_(t){this.updatePositions_();let e=t.target===t.root;if(this.emitter.emit("remove",{bladeController:t.item,root:e,sender:this}),!e)return;let n=t.item;if(Ts(n))n.value.emitter.off("change",this.onChildValueChange_);else if(vd(n)){let s=n.rackController.rack;if(s){let r=s.emitter;r.off("layout",this.onRackLayout_),r.off("valuechange",this.onRackValueChange_)}}}updatePositions_(){let t=this.bcSet_.items.filter(s=>!s.viewProps.get("hidden")),e=t[0],n=t[t.length-1];this.bcSet_.items.forEach(s=>{let r=[];s===e&&(r.push("first"),(!this.blade_||this.blade_.get("positions").includes("veryfirst"))&&r.push("veryfirst")),s===n&&(r.push("last"),(!this.blade_||this.blade_.get("positions").includes("verylast"))&&r.push("verylast")),s.blade.set("positions",r)})}onChildPositionsChange_(){this.updatePositions_(),this.emitter.emit("layout",{sender:this})}onChildViewPropsChange_(t){this.updatePositions_(),this.emitter.emit("layout",{sender:this})}onChildDispose_(){this.bcSet_.items.filter(e=>e.viewProps.get("disposed")).forEach(e=>{this.bcSet_.remove(e)})}onChildValueChange_(t){let e=Q1(this.find(Ts),t.sender);if(!e)throw Ue.alreadyDisposed();this.emitter.emit("valuechange",{bladeController:e,options:t.options,sender:this})}onRackLayout_(t){this.updatePositions_(),this.emitter.emit("layout",{sender:this})}onRackValueChange_(t){this.emitter.emit("valuechange",{bladeController:t.bladeController,options:t.options,sender:this})}onBladePositionsChange_(){this.updatePositions_()}},qo=class{constructor(t){this.onRackAdd_=this.onRackAdd_.bind(this),this.onRackRemove_=this.onRackRemove_.bind(this),this.element=t.element,this.viewProps=t.viewProps;let e=new xd({blade:t.root?void 0:t.blade,viewProps:t.viewProps});e.emitter.on("add",this.onRackAdd_),e.emitter.on("remove",this.onRackRemove_),this.rack=e,this.viewProps.handleDispose(()=>{for(let n=this.rack.children.length-1;n>=0;n--)this.rack.children[n].viewProps.set("disposed",!0)})}onRackAdd_(t){t.root&&$g(this.element,t.bladeController.view.element,t.index)}onRackRemove_(t){t.root&&Cp(t.bladeController.view.element)}};function Pr(){return new Xt({positions:ye([],{equals:JS})})}var Xo=class i extends Xt{constructor(t){super(t)}static create(t){let e={completed:!0,expanded:t,expandedHeight:null,shouldFixHeight:!1,temporaryExpanded:null},n=Xt.createCore(e);return new i(n)}get styleExpanded(){var t;return(t=this.get("temporaryExpanded"))!==null&&t!==void 0?t:this.get("expanded")}get styleHeight(){if(!this.styleExpanded)return"0";let t=this.get("expandedHeight");return this.get("shouldFixHeight")&&!ge(t)?`${t}px`:"auto"}bindExpandedClass(t,e){let n=()=>{this.styleExpanded?t.classList.add(e):t.classList.remove(e)};Kn(this,"expanded",n),Kn(this,"temporaryExpanded",n)}cleanUpTransition(){this.set("shouldFixHeight",!1),this.set("expandedHeight",null),this.set("completed",!0)}};function eE(i,t){let e=0;return R1(t,()=>{i.set("expandedHeight",null),i.set("temporaryExpanded",!0),Dc(t),e=t.clientHeight,i.set("temporaryExpanded",null),Dc(t)}),e}function _g(i,t){t.style.height=i.styleHeight}function Pp(i,t){i.value("expanded").emitter.on("beforechange",()=>{if(i.set("completed",!1),ge(i.get("expandedHeight"))){let e=eE(i,t);e>0&&i.set("expandedHeight",e)}i.set("shouldFixHeight",!0),Dc(t)}),i.emitter.on("change",()=>{_g(i,t)}),_g(i,t),t.addEventListener("transitionend",e=>{e.propertyName==="height"&&i.cleanUpTransition()})}var Vc=class extends Ho{constructor(t,e){super(t,e),this.emitter_=new Ce,this.controller.foldable.value("expanded").emitter.on("change",n=>{this.emitter_.emit("fold",new rd(this,n.sender.rawValue))}),this.rackApi_.on("change",n=>{this.emitter_.emit("change",n)})}get expanded(){return this.controller.foldable.get("expanded")}set expanded(t){this.controller.foldable.set("expanded",t)}get title(){return this.controller.props.get("title")}set title(t){this.controller.props.set("title",t)}get children(){return this.rackApi_.children}addBinding(t,e,n){return this.rackApi_.addBinding(t,e,n)}addFolder(t){return this.rackApi_.addFolder(t)}addButton(t){return this.rackApi_.addButton(t)}addTab(t){return this.rackApi_.addTab(t)}add(t,e){return this.rackApi_.add(t,e)}remove(t){this.rackApi_.remove(t)}addBlade(t){return this.rackApi_.addBlade(t)}on(t,e){let n=e.bind(this);return this.emitter_.on(t,s=>{n(s)},{key:e}),this}off(t,e){return this.emitter_.off(t,e),this}},Qg=te("cnt"),bd=class{constructor(t,e){var n;this.className_=te((n=e.viewName)!==null&&n!==void 0?n:"fld"),this.element=t.createElement("div"),this.element.classList.add(this.className_(),Qg()),e.viewProps.bindClassModifiers(this.element),this.foldable_=e.foldable,this.foldable_.bindExpandedClass(this.element,this.className_(void 0,"expanded")),Kn(this.foldable_,"completed",Cr(this.element,this.className_(void 0,"cpl")));let s=t.createElement("button");s.classList.add(this.className_("b")),Kn(e.props,"title",c=>{ge(c)?this.element.classList.add(this.className_(void 0,"not")):this.element.classList.remove(this.className_(void 0,"not"))}),e.viewProps.bindDisabled(s),this.element.appendChild(s),this.buttonElement=s;let r=t.createElement("div");r.classList.add(this.className_("i")),this.element.appendChild(r);let o=t.createElement("div");o.classList.add(this.className_("t")),Tp(e.props.value("title"),o),this.buttonElement.appendChild(o),this.titleElement=o;let a=t.createElement("div");a.classList.add(this.className_("m")),this.buttonElement.appendChild(a);let l=t.createElement("div");l.classList.add(this.className_("c")),this.element.appendChild(l),this.containerElement=l}},Yo=class extends Wo{constructor(t,e){var n;let s=Xo.create((n=e.expanded)!==null&&n!==void 0?n:!0),r=new bd(t,{foldable:s,props:e.props,viewName:e.root?"rot":void 0,viewProps:e.viewProps});super(Object.assign(Object.assign({},e),{rackController:new qo({blade:e.blade,element:r.containerElement,root:e.root,viewProps:e.viewProps}),view:r})),this.onTitleClick_=this.onTitleClick_.bind(this),this.props=e.props,this.foldable=s,Pp(this.foldable,this.view.containerElement),this.rackController.rack.emitter.on("add",()=>{this.foldable.cleanUpTransition()}),this.rackController.rack.emitter.on("remove",()=>{this.foldable.cleanUpTransition()}),this.view.buttonElement.addEventListener("click",this.onTitleClick_)}get document(){return this.view.element.ownerDocument}importState(t){return vn(t,e=>super.importState(e),e=>({expanded:e.required.boolean,title:e.optional.string}),e=>(this.foldable.set("expanded",e.expanded),this.props.set("title",e.title),!0))}exportState(){return _n(()=>super.exportState(),{expanded:this.foldable.get("expanded"),title:this.props.get("title")})}onTitleClick_(){this.foldable.set("expanded",!this.foldable.get("expanded"))}},nE=Ze({id:"folder",type:"blade",accept(i){let t=Se(i,e=>({title:e.required.string,view:e.required.constant("folder"),expanded:e.optional.boolean}));return t?{params:t}:null},controller(i){return new Yo(i.document,{blade:i.blade,expanded:i.params.expanded,props:Xt.fromObject({title:i.params.title}),viewProps:i.viewProps})},api(i){return i.controller instanceof Yo?new Vc(i.controller,i.pool):null}}),iE=te("");function xg(i,t){return Cr(i,iE(void 0,t))}var Mi=class i extends Xt{constructor(t){var e;super(t),this.onDisabledChange_=this.onDisabledChange_.bind(this),this.onParentChange_=this.onParentChange_.bind(this),this.onParentGlobalDisabledChange_=this.onParentGlobalDisabledChange_.bind(this),[this.globalDisabled_,this.setGlobalDisabled_]=t1(ye(this.getGlobalDisabled_())),this.value("disabled").emitter.on("change",this.onDisabledChange_),this.value("parent").emitter.on("change",this.onParentChange_),(e=this.get("parent"))===null||e===void 0||e.globalDisabled.emitter.on("change",this.onParentGlobalDisabledChange_)}static create(t){var e,n,s;let r=t??{};return new i(Xt.createCore({disabled:(e=r.disabled)!==null&&e!==void 0?e:!1,disposed:!1,hidden:(n=r.hidden)!==null&&n!==void 0?n:!1,parent:(s=r.parent)!==null&&s!==void 0?s:null}))}get globalDisabled(){return this.globalDisabled_}bindClassModifiers(t){xi(this.globalDisabled_,xg(t,"disabled")),Kn(this,"hidden",xg(t,"hidden"))}bindDisabled(t){xi(this.globalDisabled_,e=>{t.disabled=e})}bindTabIndex(t){xi(this.globalDisabled_,e=>{t.tabIndex=e?-1:0})}handleDispose(t){this.value("disposed").emitter.on("change",e=>{e&&t()})}importState(t){this.set("disabled",t.disabled),this.set("hidden",t.hidden)}exportState(){return{disabled:this.get("disabled"),hidden:this.get("hidden")}}getGlobalDisabled_(){let t=this.get("parent");return(t?t.globalDisabled.rawValue:!1)||this.get("disabled")}updateGlobalDisabled_(){this.setGlobalDisabled_(this.getGlobalDisabled_())}onDisabledChange_(){this.updateGlobalDisabled_()}onParentGlobalDisabledChange_(){this.updateGlobalDisabled_()}onParentChange_(t){var e;let n=t.previousRawValue;n?.globalDisabled.emitter.off("change",this.onParentGlobalDisabledChange_),(e=this.get("parent"))===null||e===void 0||e.globalDisabled.emitter.on("change",this.onParentGlobalDisabledChange_),this.updateGlobalDisabled_()}},bg=te("tbp"),yd=class{constructor(t,e){this.element=t.createElement("div"),this.element.classList.add(bg()),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("div");n.classList.add(bg("c")),this.element.appendChild(n),this.containerElement=n}},Oo=te("tbi"),wd=class{constructor(t,e){this.element=t.createElement("div"),this.element.classList.add(Oo()),e.viewProps.bindClassModifiers(this.element),Kn(e.props,"selected",r=>{r?this.element.classList.add(Oo(void 0,"sel")):this.element.classList.remove(Oo(void 0,"sel"))});let n=t.createElement("button");n.classList.add(Oo("b")),e.viewProps.bindDisabled(n),this.element.appendChild(n),this.buttonElement=n;let s=t.createElement("div");s.classList.add(Oo("t")),Tp(e.props.value("title"),s),this.buttonElement.appendChild(s),this.titleElement=s}},Md=class{constructor(t,e){this.emitter=new Ce,this.onClick_=this.onClick_.bind(this),this.props=e.props,this.viewProps=e.viewProps,this.view=new wd(t,{props:e.props,viewProps:e.viewProps}),this.view.buttonElement.addEventListener("click",this.onClick_)}onClick_(){this.emitter.emit("click",{sender:this})}},jo=class extends Wo{constructor(t,e){let n=new yd(t,{viewProps:e.viewProps});super(Object.assign(Object.assign({},e),{rackController:new qo({blade:e.blade,element:n.containerElement,viewProps:e.viewProps}),view:n})),this.onItemClick_=this.onItemClick_.bind(this),this.ic_=new Md(t,{props:e.itemProps,viewProps:Mi.create()}),this.ic_.emitter.on("click",this.onItemClick_),this.props=e.props,Kn(this.props,"selected",s=>{this.itemController.props.set("selected",s),this.viewProps.set("hidden",!s)})}get itemController(){return this.ic_}importState(t){return vn(t,e=>super.importState(e),e=>({selected:e.required.boolean,title:e.required.string}),e=>(this.ic_.props.set("selected",e.selected),this.ic_.props.set("title",e.title),!0))}exportState(){return _n(()=>super.exportState(),{selected:this.ic_.props.get("selected"),title:this.ic_.props.get("title")})}onItemClick_(){this.props.set("selected",!0)}},Sd=class extends Ho{constructor(t,e){super(t,e),this.emitter_=new Ce,this.onSelect_=this.onSelect_.bind(this),this.pool_=e,this.rackApi_.on("change",n=>{this.emitter_.emit("change",n)}),this.controller.tab.selectedIndex.emitter.on("change",this.onSelect_)}get pages(){return this.rackApi_.children}addPage(t){let e=this.controller.view.element.ownerDocument,n=new jo(e,{blade:Pr(),itemProps:Xt.fromObject({selected:!1,title:t.title}),props:Xt.fromObject({selected:!1}),viewProps:Mi.create()}),s=this.pool_.createApi(n);return this.rackApi_.add(s,t.index)}removePage(t){this.rackApi_.remove(this.rackApi_.children[t])}on(t,e){let n=e.bind(this);return this.emitter_.on(t,s=>{n(s)},{key:e}),this}off(t,e){return this.emitter_.off(t,e),this}onSelect_(t){this.emitter_.emit("select",new od(this,t.rawValue))}},Ed=class extends Ho{get title(){var t;return(t=this.controller.itemController.props.get("title"))!==null&&t!==void 0?t:""}set title(t){this.controller.itemController.props.set("title",t)}get selected(){return this.controller.props.get("selected")}set selected(t){this.controller.props.set("selected",t)}get children(){return this.rackApi_.children}addButton(t){return this.rackApi_.addButton(t)}addFolder(t){return this.rackApi_.addFolder(t)}addTab(t){return this.rackApi_.addTab(t)}add(t,e){this.rackApi_.add(t,e)}remove(t){this.rackApi_.remove(t)}addBinding(t,e,n){return this.rackApi_.addBinding(t,e,n)}addBlade(t){return this.rackApi_.addBlade(t)}},yg=-1,Ad=class{constructor(){this.onItemSelectedChange_=this.onItemSelectedChange_.bind(this),this.empty=ye(!0),this.selectedIndex=ye(yg),this.items_=[]}add(t,e){let n=e??this.items_.length;this.items_.splice(n,0,t),t.emitter.on("change",this.onItemSelectedChange_),this.keepSelection_()}remove(t){let e=this.items_.indexOf(t);e<0||(this.items_.splice(e,1),t.emitter.off("change",this.onItemSelectedChange_),this.keepSelection_())}keepSelection_(){if(this.items_.length===0){this.selectedIndex.rawValue=yg,this.empty.rawValue=!0;return}let t=this.items_.findIndex(e=>e.rawValue);t<0?(this.items_.forEach((e,n)=>{e.rawValue=n===0}),this.selectedIndex.rawValue=0):(this.items_.forEach((e,n)=>{e.rawValue=n===t}),this.selectedIndex.rawValue=t),this.empty.rawValue=!1}onItemSelectedChange_(t){if(t.rawValue){let e=this.items_.findIndex(n=>n===t.sender);this.items_.forEach((n,s)=>{n.rawValue=s===e}),this.selectedIndex.rawValue=e}else this.keepSelection_()}},ko=te("tab"),Cd=class{constructor(t,e){this.element=t.createElement("div"),this.element.classList.add(ko(),Qg()),e.viewProps.bindClassModifiers(this.element),xi(e.empty,Cr(this.element,ko(void 0,"nop")));let n=t.createElement("div");n.classList.add(ko("t")),this.element.appendChild(n),this.itemsElement=n;let s=t.createElement("div");s.classList.add(ko("i")),this.element.appendChild(s);let r=t.createElement("div");r.classList.add(ko("c")),this.element.appendChild(r),this.contentsElement=r}},Gc=class extends Wo{constructor(t,e){let n=new Ad,s=new Cd(t,{empty:n.empty,viewProps:e.viewProps});super({blade:e.blade,rackController:new qo({blade:e.blade,element:s.contentsElement,viewProps:e.viewProps}),view:s}),this.onRackAdd_=this.onRackAdd_.bind(this),this.onRackRemove_=this.onRackRemove_.bind(this);let r=this.rackController.rack;r.emitter.on("add",this.onRackAdd_),r.emitter.on("remove",this.onRackRemove_),this.tab=n}add(t,e){this.rackController.rack.add(t,e)}remove(t){this.rackController.rack.remove(this.rackController.rack.children[t])}onRackAdd_(t){if(!t.root)return;let e=t.bladeController;$g(this.view.itemsElement,e.itemController.view.element,t.index),e.itemController.viewProps.set("parent",this.viewProps),this.tab.add(e.props.value("selected"))}onRackRemove_(t){if(!t.root)return;let e=t.bladeController;Cp(e.itemController.view.element),e.itemController.viewProps.set("parent",null),this.tab.remove(e.props.value("selected"))}},t0=Ze({id:"tab",type:"blade",accept(i){let t=Se(i,e=>({pages:e.required.array(e.required.object({title:e.required.string})),view:e.required.constant("tab")}));return!t||t.pages.length===0?null:{params:t}},controller(i){let t=new Gc(i.document,{blade:i.blade,viewProps:i.viewProps});return i.params.pages.forEach(e=>{let n=new jo(i.document,{blade:Pr(),itemProps:Xt.fromObject({selected:!1,title:e.title}),props:Xt.fromObject({selected:!1}),viewProps:Mi.create()});t.add(n)}),t},api(i){return i.controller instanceof Gc?new Sd(i.controller,i.pool):i.controller instanceof jo?new Ed(i.controller,i.pool):null}});function sE(i,t){let e=i.accept(t.params);if(!e)return null;let n=Se(t.params,s=>({disabled:s.optional.boolean,hidden:s.optional.boolean}));return i.controller({blade:Pr(),document:t.document,params:Object.assign(Object.assign({},e.params),{disabled:n?.disabled,hidden:n?.hidden}),viewProps:Mi.create({disabled:n?.disabled,hidden:n?.hidden})})}var $o=class extends Ls{get options(){return this.controller.valueController.props.get("options")}set options(t){this.controller.valueController.props.set("options",t)}},Td=class{constructor(){this.disabled=!1,this.emitter=new Ce}dispose(){}tick(){this.disabled||this.emitter.emit("tick",{sender:this})}},Pd=class{constructor(t,e){this.disabled_=!1,this.timerId_=null,this.onTick_=this.onTick_.bind(this),this.doc_=t,this.emitter=new Ce,this.interval_=e,this.setTimer_()}get disabled(){return this.disabled_}set disabled(t){this.disabled_=t,this.disabled_?this.clearTimer_():this.setTimer_()}dispose(){this.clearTimer_()}clearTimer_(){if(this.timerId_===null)return;let t=this.doc_.defaultView;t&&t.clearInterval(this.timerId_),this.timerId_=null}setTimer_(){if(this.clearTimer_(),this.interval_<=0)return;let t=this.doc_.defaultView;t&&(this.timerId_=t.setInterval(this.onTick_,this.interval_))}onTick_(){this.disabled_||this.emitter.emit("tick",{sender:this})}},Fs=class{constructor(t){this.constraints=t}constrain(t){return this.constraints.reduce((e,n)=>n.constrain(e),t)}};function Hc(i,t){if(i instanceof t)return i;if(i instanceof Fs){let e=i.constraints.reduce((n,s)=>n||(s instanceof t?s:null),null);if(e)return e}return null}var Ns=class{constructor(t){this.values=Xt.fromObject({options:t})}constrain(t){let e=this.values.get("options");return e.length===0||e.filter(s=>s.value===t).length>0?t:e[0].value}};function sa(i){var t;let e=cd;if(Array.isArray(i))return(t=Se({items:i},n=>({items:n.required.array(n.required.object({text:n.required.string,value:n.required.raw}))})))===null||t===void 0?void 0:t.items;if(typeof i=="object")return e.required.raw(i).value}function Rp(i){if(Array.isArray(i))return i;let t=[];return Object.keys(i).forEach(e=>{t.push({text:e,value:i[e]})}),t}function Ip(i){return ge(i)?null:new Ns(Rp(i))}var Hu=te("lst"),Rd=class{constructor(t,e){this.onValueChange_=this.onValueChange_.bind(this),this.props_=e.props,this.element=t.createElement("div"),this.element.classList.add(Hu()),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("select");n.classList.add(Hu("s")),e.viewProps.bindDisabled(n),this.element.appendChild(n),this.selectElement=n;let s=t.createElement("div");s.classList.add(Hu("m")),s.appendChild($c(t,"dropdown")),this.element.appendChild(s),e.value.emitter.on("change",this.onValueChange_),this.value_=e.value,Kn(this.props_,"options",r=>{Zg(this.selectElement),r.forEach(o=>{let a=t.createElement("option");a.textContent=o.text,this.selectElement.appendChild(a)}),this.update_()})}update_(){let t=this.props_.get("options").map(e=>e.value);this.selectElement.selectedIndex=t.indexOf(this.value_.rawValue)}onValueChange_(){this.update_()}},Jn=class{constructor(t,e){this.onSelectChange_=this.onSelectChange_.bind(this),this.props=e.props,this.value=e.value,this.viewProps=e.viewProps,this.view=new Rd(t,{props:this.props,value:this.value,viewProps:this.viewProps}),this.view.selectElement.addEventListener("change",this.onSelectChange_)}onSelectChange_(t){let e=t.currentTarget;this.value.rawValue=this.props.get("options")[e.selectedIndex].value}importProps(t){return vn(t,null,e=>({options:e.required.custom(sa)}),e=>(this.props.set("options",Rp(e.options)),!0))}exportProps(){return _n(null,{options:this.props.get("options")})}},wg=te("pop"),Id=class{constructor(t,e){this.element=t.createElement("div"),this.element.classList.add(wg()),e.viewProps.bindClassModifiers(this.element),xi(e.shows,Cr(this.element,wg(void 0,"v")))}},Wc=class{constructor(t,e){this.shows=ye(!1),this.viewProps=e.viewProps,this.view=new Id(t,{shows:this.shows,viewProps:this.viewProps})}},Mg=te("txt"),Ld=class{constructor(t,e){this.onChange_=this.onChange_.bind(this),this.element=t.createElement("div"),this.element.classList.add(Mg()),e.viewProps.bindClassModifiers(this.element),this.props_=e.props,this.props_.emitter.on("change",this.onChange_);let n=t.createElement("input");n.classList.add(Mg("i")),n.type="text",e.viewProps.bindDisabled(n),this.element.appendChild(n),this.inputElement=n,e.value.emitter.on("change",this.onChange_),this.value_=e.value,this.refresh()}refresh(){let t=this.props_.get("formatter");this.inputElement.value=t(this.value_.rawValue)}onChange_(){this.refresh()}},Ds=class{constructor(t,e){this.onInputChange_=this.onInputChange_.bind(this),this.parser_=e.parser,this.props=e.props,this.value=e.value,this.viewProps=e.viewProps,this.view=new Ld(t,{props:e.props,value:this.value,viewProps:this.viewProps}),this.view.inputElement.addEventListener("change",this.onInputChange_)}onInputChange_(t){let n=t.currentTarget.value,s=this.parser_(n);ge(s)||(this.value.rawValue=s),this.view.refresh()}};function rE(i){return String(i)}function e0(i){return i==="false"?!1:!!i}function Sg(i){return rE(i)}function oE(i){return t=>i.reduce((e,n)=>e!==null?e:n(t),null)}var aE=an(0);function qc(i){return aE(i)+"%"}function n0(i){return String(i)}function Fd(i){return i}function Rr({primary:i,secondary:t,forward:e,backward:n}){let s=!1;function r(o){s||(s=!0,o(),s=!1)}i.emitter.on("change",o=>{r(()=>{t.setRawValue(e(i.rawValue,t.rawValue),o.options)})}),t.emitter.on("change",o=>{r(()=>{i.setRawValue(n(i.rawValue,t.rawValue),o.options)}),r(()=>{t.setRawValue(e(i.rawValue,t.rawValue),o.options)})}),r(()=>{t.setRawValue(e(i.rawValue,t.rawValue),{forceEmit:!1,last:!0})})}function on(i,t){let e=i*(t.altKey?.1:1)*(t.shiftKey?10:1);return t.upKey?+e:t.downKey?-e:0}function Zo(i){return{altKey:i.altKey,downKey:i.key==="ArrowDown",shiftKey:i.shiftKey,upKey:i.key==="ArrowUp"}}function Si(i){return{altKey:i.altKey,downKey:i.key==="ArrowLeft",shiftKey:i.shiftKey,upKey:i.key==="ArrowRight"}}function lE(i){return i==="ArrowUp"||i==="ArrowDown"}function i0(i){return lE(i)||i==="ArrowLeft"||i==="ArrowRight"}function Wu(i,t){var e,n;let s=t.ownerDocument.defaultView,r=t.getBoundingClientRect();return{x:i.pageX-(((e=s&&s.scrollX)!==null&&e!==void 0?e:0)+r.left),y:i.pageY-(((n=s&&s.scrollY)!==null&&n!==void 0?n:0)+r.top)}}var Ei=class{constructor(t){this.lastTouch_=null,this.onDocumentMouseMove_=this.onDocumentMouseMove_.bind(this),this.onDocumentMouseUp_=this.onDocumentMouseUp_.bind(this),this.onMouseDown_=this.onMouseDown_.bind(this),this.onTouchEnd_=this.onTouchEnd_.bind(this),this.onTouchMove_=this.onTouchMove_.bind(this),this.onTouchStart_=this.onTouchStart_.bind(this),this.elem_=t,this.emitter=new Ce,t.addEventListener("touchstart",this.onTouchStart_,{passive:!1}),t.addEventListener("touchmove",this.onTouchMove_,{passive:!0}),t.addEventListener("touchend",this.onTouchEnd_),t.addEventListener("mousedown",this.onMouseDown_)}computePosition_(t){let e=this.elem_.getBoundingClientRect();return{bounds:{width:e.width,height:e.height},point:t?{x:t.x,y:t.y}:null}}onMouseDown_(t){var e;t.preventDefault(),(e=t.currentTarget)===null||e===void 0||e.focus();let n=this.elem_.ownerDocument;n.addEventListener("mousemove",this.onDocumentMouseMove_),n.addEventListener("mouseup",this.onDocumentMouseUp_),this.emitter.emit("down",{altKey:t.altKey,data:this.computePosition_(Wu(t,this.elem_)),sender:this,shiftKey:t.shiftKey})}onDocumentMouseMove_(t){this.emitter.emit("move",{altKey:t.altKey,data:this.computePosition_(Wu(t,this.elem_)),sender:this,shiftKey:t.shiftKey})}onDocumentMouseUp_(t){let e=this.elem_.ownerDocument;e.removeEventListener("mousemove",this.onDocumentMouseMove_),e.removeEventListener("mouseup",this.onDocumentMouseUp_),this.emitter.emit("up",{altKey:t.altKey,data:this.computePosition_(Wu(t,this.elem_)),sender:this,shiftKey:t.shiftKey})}onTouchStart_(t){t.preventDefault();let e=t.targetTouches.item(0),n=this.elem_.getBoundingClientRect();this.emitter.emit("down",{altKey:t.altKey,data:this.computePosition_(e?{x:e.clientX-n.left,y:e.clientY-n.top}:void 0),sender:this,shiftKey:t.shiftKey}),this.lastTouch_=e}onTouchMove_(t){let e=t.targetTouches.item(0),n=this.elem_.getBoundingClientRect();this.emitter.emit("move",{altKey:t.altKey,data:this.computePosition_(e?{x:e.clientX-n.left,y:e.clientY-n.top}:void 0),sender:this,shiftKey:t.shiftKey}),this.lastTouch_=e}onTouchEnd_(t){var e;let n=(e=t.targetTouches.item(0))!==null&&e!==void 0?e:this.lastTouch_,s=this.elem_.getBoundingClientRect();this.emitter.emit("up",{altKey:t.altKey,data:this.computePosition_(n?{x:n.clientX-s.left,y:n.clientY-s.top}:void 0),sender:this,shiftKey:t.shiftKey})}},En=te("txt"),Nd=class{constructor(t,e){this.onChange_=this.onChange_.bind(this),this.props_=e.props,this.props_.emitter.on("change",this.onChange_),this.element=t.createElement("div"),this.element.classList.add(En(),En(void 0,"num")),e.arrayPosition&&this.element.classList.add(En(void 0,e.arrayPosition)),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("input");n.classList.add(En("i")),n.type="text",e.viewProps.bindDisabled(n),this.element.appendChild(n),this.inputElement=n,this.onDraggingChange_=this.onDraggingChange_.bind(this),this.dragging_=e.dragging,this.dragging_.emitter.on("change",this.onDraggingChange_),this.element.classList.add(En()),this.inputElement.classList.add(En("i"));let s=t.createElement("div");s.classList.add(En("k")),this.element.appendChild(s),this.knobElement=s;let r=t.createElementNS($n,"svg");r.classList.add(En("g")),this.knobElement.appendChild(r);let o=t.createElementNS($n,"path");o.classList.add(En("gb")),r.appendChild(o),this.guideBodyElem_=o;let a=t.createElementNS($n,"path");a.classList.add(En("gh")),r.appendChild(a),this.guideHeadElem_=a;let l=t.createElement("div");l.classList.add(te("tt")()),this.knobElement.appendChild(l),this.tooltipElem_=l,e.value.emitter.on("change",this.onChange_),this.value=e.value,this.refresh()}onDraggingChange_(t){if(t.rawValue===null){this.element.classList.remove(En(void 0,"drg"));return}this.element.classList.add(En(void 0,"drg"));let e=t.rawValue/this.props_.get("pointerScale"),n=e+(e>0?-1:e<0?1:0),s=Ne(-n,-4,4);this.guideHeadElem_.setAttributeNS(null,"d",[`M ${n+s},0 L${n},4 L${n+s},8`,`M ${e},-1 L${e},9`].join(" ")),this.guideBodyElem_.setAttributeNS(null,"d",`M 0,4 L${e},4`);let r=this.props_.get("formatter");this.tooltipElem_.textContent=r(this.value.rawValue),this.tooltipElem_.style.left=`${e}px`}refresh(){let t=this.props_.get("formatter");this.inputElement.value=t(this.value.rawValue)}onChange_(){this.refresh()}},Bs=class{constructor(t,e){var n;this.originRawValue_=0,this.onInputChange_=this.onInputChange_.bind(this),this.onInputKeyDown_=this.onInputKeyDown_.bind(this),this.onInputKeyUp_=this.onInputKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.parser_=e.parser,this.props=e.props,this.sliderProps_=(n=e.sliderProps)!==null&&n!==void 0?n:null,this.value=e.value,this.viewProps=e.viewProps,this.dragging_=ye(null),this.view=new Nd(t,{arrayPosition:e.arrayPosition,dragging:this.dragging_,props:this.props,value:this.value,viewProps:this.viewProps}),this.view.inputElement.addEventListener("change",this.onInputChange_),this.view.inputElement.addEventListener("keydown",this.onInputKeyDown_),this.view.inputElement.addEventListener("keyup",this.onInputKeyUp_);let s=new Ei(this.view.knobElement);s.emitter.on("down",this.onPointerDown_),s.emitter.on("move",this.onPointerMove_),s.emitter.on("up",this.onPointerUp_)}constrainValue_(t){var e,n;let s=(e=this.sliderProps_)===null||e===void 0?void 0:e.get("min"),r=(n=this.sliderProps_)===null||n===void 0?void 0:n.get("max"),o=t;return s!==void 0&&(o=Math.max(o,s)),r!==void 0&&(o=Math.min(o,r)),o}onInputChange_(t){let n=t.currentTarget.value,s=this.parser_(n);ge(s)||(this.value.rawValue=this.constrainValue_(s)),this.view.refresh()}onInputKeyDown_(t){let e=on(this.props.get("keyScale"),Zo(t));e!==0&&this.value.setRawValue(this.constrainValue_(this.value.rawValue+e),{forceEmit:!1,last:!1})}onInputKeyUp_(t){on(this.props.get("keyScale"),Zo(t))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}onPointerDown_(){this.originRawValue_=this.value.rawValue,this.dragging_.rawValue=0}computeDraggingValue_(t){if(!t.point)return null;let e=t.point.x-t.bounds.width/2;return this.constrainValue_(this.originRawValue_+e*this.props.get("pointerScale"))}onPointerMove_(t){let e=this.computeDraggingValue_(t.data);e!==null&&(this.value.setRawValue(e,{forceEmit:!1,last:!1}),this.dragging_.rawValue=this.value.rawValue-this.originRawValue_)}onPointerUp_(t){let e=this.computeDraggingValue_(t.data);e!==null&&(this.value.setRawValue(e,{forceEmit:!0,last:!0}),this.dragging_.rawValue=null)}},qu=te("sld"),Dd=class{constructor(t,e){this.onChange_=this.onChange_.bind(this),this.props_=e.props,this.props_.emitter.on("change",this.onChange_),this.element=t.createElement("div"),this.element.classList.add(qu()),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("div");n.classList.add(qu("t")),e.viewProps.bindTabIndex(n),this.element.appendChild(n),this.trackElement=n;let s=t.createElement("div");s.classList.add(qu("k")),this.trackElement.appendChild(s),this.knobElement=s,e.value.emitter.on("change",this.onChange_),this.value=e.value,this.update_()}update_(){let t=Ne(ae(this.value.rawValue,this.props_.get("min"),this.props_.get("max"),0,100),0,100);this.knobElement.style.width=`${t}%`}onChange_(){this.update_()}},Bd=class{constructor(t,e){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDownOrMove_=this.onPointerDownOrMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=e.value,this.viewProps=e.viewProps,this.props=e.props,this.view=new Dd(t,{props:this.props,value:this.value,viewProps:this.viewProps}),this.ptHandler_=new Ei(this.view.trackElement),this.ptHandler_.emitter.on("down",this.onPointerDownOrMove_),this.ptHandler_.emitter.on("move",this.onPointerDownOrMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.trackElement.addEventListener("keydown",this.onKeyDown_),this.view.trackElement.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(t,e){t.point&&this.value.setRawValue(ae(Ne(t.point.x,0,t.bounds.width),0,t.bounds.width,this.props.get("min"),this.props.get("max")),e)}onPointerDownOrMove_(t){this.handlePointerEvent_(t.data,{forceEmit:!1,last:!1})}onPointerUp_(t){this.handlePointerEvent_(t.data,{forceEmit:!0,last:!0})}onKeyDown_(t){let e=on(this.props.get("keyScale"),Si(t));e!==0&&this.value.setRawValue(this.value.rawValue+e,{forceEmit:!1,last:!1})}onKeyUp_(t){on(this.props.get("keyScale"),Si(t))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}},Xu=te("sldtxt"),Ud=class{constructor(t,e){this.element=t.createElement("div"),this.element.classList.add(Xu());let n=t.createElement("div");n.classList.add(Xu("s")),this.sliderView_=e.sliderView,n.appendChild(this.sliderView_.element),this.element.appendChild(n);let s=t.createElement("div");s.classList.add(Xu("t")),this.textView_=e.textView,s.appendChild(this.textView_.element),this.element.appendChild(s)}},Er=class{constructor(t,e){this.value=e.value,this.viewProps=e.viewProps,this.sliderC_=new Bd(t,{props:e.sliderProps,value:e.value,viewProps:this.viewProps}),this.textC_=new Bs(t,{parser:e.parser,props:e.textProps,sliderProps:e.sliderProps,value:e.value,viewProps:e.viewProps}),this.view=new Ud(t,{sliderView:this.sliderC_.view,textView:this.textC_.view})}get sliderController(){return this.sliderC_}get textController(){return this.textC_}importProps(t){return vn(t,null,e=>({max:e.required.number,min:e.required.number}),e=>{let n=this.sliderC_.props;return n.set("max",e.max),n.set("min",e.min),!0})}exportProps(){let t=this.sliderC_.props;return _n(null,{max:t.get("max"),min:t.get("min")})}};function s0(i){return{sliderProps:new Xt({keyScale:i.keyScale,max:i.max,min:i.min}),textProps:new Xt({formatter:ye(i.formatter),keyScale:i.keyScale,pointerScale:ye(i.pointerScale)})}}var cE={containerUnitSize:"cnt-usz"};function r0(i){return`--${cE[i]}`}function Ko(i){return Yg(i)}function Ki(i){if(Zu(i))return Se(i,Ko)}function _i(i,t){if(!i)return;let e=[],n=Wg(i,t);n&&e.push(n);let s=qg(i);return s&&e.push(s),new Fs(e)}function hE(i){return i?i.major===Tr.major:!1}function o0(i){if(i==="inline"||i==="popup")return i}function ra(i,t){i.write(t)}var Ic=te("ckb"),Od=class{constructor(t,e){this.onValueChange_=this.onValueChange_.bind(this),this.element=t.createElement("div"),this.element.classList.add(Ic()),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("label");n.classList.add(Ic("l")),this.element.appendChild(n),this.labelElement=n;let s=t.createElement("input");s.classList.add(Ic("i")),s.type="checkbox",this.labelElement.appendChild(s),this.inputElement=s,e.viewProps.bindDisabled(this.inputElement);let r=t.createElement("div");r.classList.add(Ic("w")),this.labelElement.appendChild(r);let o=$c(t,"check");r.appendChild(o),e.value.emitter.on("change",this.onValueChange_),this.value=e.value,this.update_()}update_(){this.inputElement.checked=this.value.rawValue}onValueChange_(){this.update_()}},kd=class{constructor(t,e){this.onInputChange_=this.onInputChange_.bind(this),this.onLabelMouseDown_=this.onLabelMouseDown_.bind(this),this.value=e.value,this.viewProps=e.viewProps,this.view=new Od(t,{value:this.value,viewProps:this.viewProps}),this.view.inputElement.addEventListener("change",this.onInputChange_),this.view.labelElement.addEventListener("mousedown",this.onLabelMouseDown_)}onInputChange_(t){let e=t.currentTarget;this.value.rawValue=e.checked,t.preventDefault(),t.stopPropagation()}onLabelMouseDown_(t){t.preventDefault()}};function uE(i){let t=[],e=Ip(i.options);return e&&t.push(e),new Fs(t)}var dE=Ze({id:"input-bool",type:"input",accept:(i,t)=>{if(typeof i!="boolean")return null;let e=Se(t,n=>({options:n.optional.custom(sa),readonly:n.optional.constant(!1)}));return e?{initialValue:i,params:e}:null},binding:{reader:i=>e0,constraint:i=>uE(i.params),writer:i=>ra},controller:i=>{let t=i.document,e=i.value,n=i.constraint,s=n&&Hc(n,Ns);return s?new Jn(t,{props:new Xt({options:s.values.value("options")}),value:e,viewProps:i.viewProps}):new kd(t,{value:e,viewProps:i.viewProps})},api(i){return typeof i.controller.value.rawValue!="boolean"?null:i.controller.valueController instanceof Jn?new $o(i.controller):null}}),Cs=te("col"),zd=class{constructor(t,e){this.element=t.createElement("div"),this.element.classList.add(Cs()),e.foldable.bindExpandedClass(this.element,Cs(void 0,"expanded")),Kn(e.foldable,"completed",Cr(this.element,Cs(void 0,"cpl")));let n=t.createElement("div");n.classList.add(Cs("h")),this.element.appendChild(n);let s=t.createElement("div");s.classList.add(Cs("s")),n.appendChild(s),this.swatchElement=s;let r=t.createElement("div");if(r.classList.add(Cs("t")),n.appendChild(r),this.textElement=r,e.pickerLayout==="inline"){let o=t.createElement("div");o.classList.add(Cs("p")),this.element.appendChild(o),this.pickerElement=o}else this.pickerElement=null}};function pE(i,t,e){let n=Ne(i/255,0,1),s=Ne(t/255,0,1),r=Ne(e/255,0,1),o=Math.max(n,s,r),a=Math.min(n,s,r),l=o-a,c=0,h=0,d=(a+o)/2;return l!==0&&(h=l/(1-Math.abs(o+a-1)),n===o?c=(s-r)/l:s===o?c=2+(r-n)/l:c=4+(n-s)/l,c=c/6+(c<0?1:0)),[c*360,h*100,d*100]}function fE(i,t,e){let n=(i%360+360)%360,s=Ne(t/100,0,1),r=Ne(e/100,0,1),o=(1-Math.abs(2*r-1))*s,a=o*(1-Math.abs(n/60%2-1)),l=r-o/2,c,h,d;return n>=0&&n<60?[c,h,d]=[o,a,0]:n>=60&&n<120?[c,h,d]=[a,o,0]:n>=120&&n<180?[c,h,d]=[0,o,a]:n>=180&&n<240?[c,h,d]=[0,a,o]:n>=240&&n<300?[c,h,d]=[a,0,o]:[c,h,d]=[o,0,a],[(c+l)*255,(h+l)*255,(d+l)*255]}function mE(i,t,e){let n=Ne(i/255,0,1),s=Ne(t/255,0,1),r=Ne(e/255,0,1),o=Math.max(n,s,r),a=Math.min(n,s,r),l=o-a,c;l===0?c=0:o===n?c=60*(((s-r)/l%6+6)%6):o===s?c=60*((r-n)/l+2):c=60*((n-s)/l+4);let h=o===0?0:l/o,d=o;return[c,h*100,d*100]}function a0(i,t,e){let n=Vg(i,360),s=Ne(t/100,0,1),r=Ne(e/100,0,1),o=r*s,a=o*(1-Math.abs(n/60%2-1)),l=r-o,c,h,d;return n>=0&&n<60?[c,h,d]=[o,a,0]:n>=60&&n<120?[c,h,d]=[a,o,0]:n>=120&&n<180?[c,h,d]=[0,o,a]:n>=180&&n<240?[c,h,d]=[0,a,o]:n>=240&&n<300?[c,h,d]=[a,0,o]:[c,h,d]=[o,0,a],[(c+l)*255,(h+l)*255,(d+l)*255]}function gE(i,t,e){let n=e+t*(100-Math.abs(2*e-100))/200;return[i,n!==0?t*(100-Math.abs(2*e-100))/n:0,e+t*(100-Math.abs(2*e-100))/200]}function vE(i,t,e){let n=100-Math.abs(e*(200-t)/100-100);return[i,n!==0?t*e/n:0,e*(200-t)/200]}function Qn(i){return[i[0],i[1],i[2]]}function Zc(i,t){return[i[0],i[1],i[2],t]}var _E={hsl:{hsl:(i,t,e)=>[i,t,e],hsv:gE,rgb:fE},hsv:{hsl:vE,hsv:(i,t,e)=>[i,t,e],rgb:a0},rgb:{hsl:pE,hsv:mE,rgb:(i,t,e)=>[i,t,e]}};function Ar(i,t){return[t==="float"?1:i==="rgb"?255:360,t==="float"?1:i==="rgb"?255:100,t==="float"?1:i==="rgb"?255:100]}function xE(i,t){return i===t?t:Vg(i,t)}function l0(i,t,e){var n;let s=Ar(t,e);return[t==="rgb"?Ne(i[0],0,s[0]):xE(i[0],s[0]),Ne(i[1],0,s[1]),Ne(i[2],0,s[2]),Ne((n=i[3])!==null&&n!==void 0?n:1,0,1)]}function Eg(i,t,e,n){let s=Ar(t,e),r=Ar(t,n);return i.map((o,a)=>o/s[a]*r[a])}function c0(i,t,e){let n=Eg(i,t.mode,t.type,"int"),s=_E[t.mode][e.mode](...n);return Eg(s,e.mode,"int",e.type)}var ie=class i{static black(){return new i([0,0,0],"rgb")}constructor(t,e){this.type="int",this.mode=e,this.comps_=l0(t,e,this.type)}getComponents(t){return Zc(c0(Qn(this.comps_),{mode:this.mode,type:this.type},{mode:t??this.mode,type:this.type}),this.comps_[3])}toRgbaObject(){let t=this.getComponents("rgb");return{r:t[0],g:t[1],b:t[2],a:t[3]}}},ji=te("colp"),Vd=class{constructor(t,e){this.alphaViews_=null,this.element=t.createElement("div"),this.element.classList.add(ji()),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("div");n.classList.add(ji("hsv"));let s=t.createElement("div");s.classList.add(ji("sv")),this.svPaletteView_=e.svPaletteView,s.appendChild(this.svPaletteView_.element),n.appendChild(s);let r=t.createElement("div");r.classList.add(ji("h")),this.hPaletteView_=e.hPaletteView,r.appendChild(this.hPaletteView_.element),n.appendChild(r),this.element.appendChild(n);let o=t.createElement("div");if(o.classList.add(ji("rgb")),this.textsView_=e.textsView,o.appendChild(this.textsView_.element),this.element.appendChild(o),e.alphaViews){this.alphaViews_={palette:e.alphaViews.palette,text:e.alphaViews.text};let a=t.createElement("div");a.classList.add(ji("a"));let l=t.createElement("div");l.classList.add(ji("ap")),l.appendChild(this.alphaViews_.palette.element),a.appendChild(l);let c=t.createElement("div");c.classList.add(ji("at")),c.appendChild(this.alphaViews_.text.element),a.appendChild(c),this.element.appendChild(a)}}get allFocusableElements(){let t=[this.svPaletteView_.element,this.hPaletteView_.element,this.textsView_.modeSelectElement,...this.textsView_.inputViews.map(e=>e.inputElement)];return this.alphaViews_&&t.push(this.alphaViews_.palette.element,this.alphaViews_.text.inputElement),t}};function bE(i){return i==="int"?"int":i==="float"?"float":void 0}function Lp(i){return Se(i,t=>({color:t.optional.object({alpha:t.optional.boolean,type:t.optional.custom(bE)}),expanded:t.optional.boolean,picker:t.optional.custom(o0),readonly:t.optional.constant(!1)}))}function Us(i){return i?.1:1}function h0(i){var t;return(t=i.color)===null||t===void 0?void 0:t.type}var Jo=class{constructor(t,e){this.type="float",this.mode=e,this.comps_=l0(t,e,this.type)}getComponents(t){return Zc(c0(Qn(this.comps_),{mode:this.mode,type:this.type},{mode:t??this.mode,type:this.type}),this.comps_[3])}toRgbaObject(){let t=this.getComponents("rgb");return{r:t[0],g:t[1],b:t[2],a:t[3]}}},yE={int:(i,t)=>new ie(i,t),float:(i,t)=>new Jo(i,t)};function Fp(i,t,e){return yE[e](i,t)}function wE(i){return i.type==="float"}function ME(i){return i.type==="int"}function SE(i){let t=i.getComponents(),e=Ar(i.mode,"int");return new ie([Math.round(ae(t[0],0,1,0,e[0])),Math.round(ae(t[1],0,1,0,e[1])),Math.round(ae(t[2],0,1,0,e[2])),t[3]],i.mode)}function EE(i){let t=i.getComponents(),e=Ar(i.mode,"int");return new Jo([ae(t[0],0,e[0],0,1),ae(t[1],0,e[1],0,1),ae(t[2],0,e[2],0,1),t[3]],i.mode)}function $e(i,t){if(i.type===t)return i;if(ME(i)&&t==="float")return EE(i);if(wE(i)&&t==="int")return SE(i);throw Ue.shouldNeverHappen()}function AE(i,t){return i.alpha===t.alpha&&i.mode===t.mode&&i.notation===t.notation&&i.type===t.type}function An(i,t){let e=i.match(/^(.+)%$/);return Math.min(e?parseFloat(e[1])*.01*t:parseFloat(i),t)}var CE={deg:i=>i,grad:i=>i*360/400,rad:i=>i*360/(2*Math.PI),turn:i=>i*360};function u0(i){let t=i.match(/^([0-9.]+?)(deg|grad|rad|turn)$/);if(!t)return parseFloat(i);let e=parseFloat(t[1]),n=t[2];return CE[n](e)}function d0(i){let t=i.match(/^rgb\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!t)return null;let e=[An(t[1],255),An(t[2],255),An(t[3],255)];return isNaN(e[0])||isNaN(e[1])||isNaN(e[2])?null:e}function TE(i){let t=d0(i);return t?new ie(t,"rgb"):null}function p0(i){let t=i.match(/^rgba\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!t)return null;let e=[An(t[1],255),An(t[2],255),An(t[3],255),An(t[4],1)];return isNaN(e[0])||isNaN(e[1])||isNaN(e[2])||isNaN(e[3])?null:e}function PE(i){let t=p0(i);return t?new ie(t,"rgb"):null}function f0(i){let t=i.match(/^hsl\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!t)return null;let e=[u0(t[1]),An(t[2],100),An(t[3],100)];return isNaN(e[0])||isNaN(e[1])||isNaN(e[2])?null:e}function RE(i){let t=f0(i);return t?new ie(t,"hsl"):null}function m0(i){let t=i.match(/^hsla\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!t)return null;let e=[u0(t[1]),An(t[2],100),An(t[3],100),An(t[4],1)];return isNaN(e[0])||isNaN(e[1])||isNaN(e[2])||isNaN(e[3])?null:e}function IE(i){let t=m0(i);return t?new ie(t,"hsl"):null}function g0(i){let t=i.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);if(t)return[parseInt(t[1]+t[1],16),parseInt(t[2]+t[2],16),parseInt(t[3]+t[3],16)];let e=i.match(/^(?:#|0x)([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);return e?[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]:null}function LE(i){let t=g0(i);return t?new ie(t,"rgb"):null}function v0(i){let t=i.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);if(t)return[parseInt(t[1]+t[1],16),parseInt(t[2]+t[2],16),parseInt(t[3]+t[3],16),ae(parseInt(t[4]+t[4],16),0,255,0,1)];let e=i.match(/^(?:#|0x)?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);return e?[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16),ae(parseInt(e[4],16),0,255,0,1)]:null}function FE(i){let t=v0(i);return t?new ie(t,"rgb"):null}function _0(i){let t=i.match(/^\{\s*r\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*g\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*b\s*:\s*([0-9A-Fa-f.]+%?)\s*\}$/);if(!t)return null;let e=[parseFloat(t[1]),parseFloat(t[2]),parseFloat(t[3])];return isNaN(e[0])||isNaN(e[1])||isNaN(e[2])?null:e}function Ag(i){return t=>{let e=_0(t);return e?Fp(e,"rgb",i):null}}function x0(i){let t=i.match(/^\{\s*r\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*g\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*b\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*a\s*:\s*([0-9A-Fa-f.]+%?)\s*\}$/);if(!t)return null;let e=[parseFloat(t[1]),parseFloat(t[2]),parseFloat(t[3]),parseFloat(t[4])];return isNaN(e[0])||isNaN(e[1])||isNaN(e[2])||isNaN(e[3])?null:e}function Cg(i){return t=>{let e=x0(t);return e?Fp(e,"rgb",i):null}}var NE=[{parser:g0,result:{alpha:!1,mode:"rgb",notation:"hex"}},{parser:v0,result:{alpha:!0,mode:"rgb",notation:"hex"}},{parser:d0,result:{alpha:!1,mode:"rgb",notation:"func"}},{parser:p0,result:{alpha:!0,mode:"rgb",notation:"func"}},{parser:f0,result:{alpha:!1,mode:"hsl",notation:"func"}},{parser:m0,result:{alpha:!0,mode:"hsl",notation:"func"}},{parser:_0,result:{alpha:!1,mode:"rgb",notation:"object"}},{parser:x0,result:{alpha:!0,mode:"rgb",notation:"object"}}];function DE(i){return NE.reduce((t,{parser:e,result:n})=>t||(e(i)?n:null),null)}function BE(i,t="int"){let e=DE(i);return e?e.notation==="hex"&&t!=="float"?Object.assign(Object.assign({},e),{type:"int"}):e.notation==="func"?Object.assign(Object.assign({},e),{type:t}):null:null}function oa(i){let t=[LE,FE,TE,PE,RE,IE];i==="int"&&t.push(Ag("int"),Cg("int")),i==="float"&&t.push(Ag("float"),Cg("float"));let e=oE(t);return n=>{let s=e(n);return s?$e(s,i):null}}function UE(i){let t=oa("int");if(typeof i!="string")return ie.black();let e=t(i);return e??ie.black()}function b0(i){let t=Ne(Math.floor(i),0,255).toString(16);return t.length===1?`0${t}`:t}function Np(i,t="#"){let e=Qn(i.getComponents("rgb")).map(b0).join("");return`${t}${e}`}function Dp(i,t="#"){let e=i.getComponents("rgb"),n=[e[0],e[1],e[2],e[3]*255].map(b0).join("");return`${t}${n}`}function y0(i){let t=an(0),e=$e(i,"int");return`rgb(${Qn(e.getComponents("rgb")).map(s=>t(s)).join(", ")})`}function Lc(i){let t=an(2),e=an(0);return`rgba(${$e(i,"int").getComponents("rgb").map((r,o)=>(o===3?t:e)(r)).join(", ")})`}function OE(i){let t=[an(0),qc,qc],e=$e(i,"int");return`hsl(${Qn(e.getComponents("hsl")).map((s,r)=>t[r](s)).join(", ")})`}function kE(i){let t=[an(0),qc,qc,an(2)];return`hsla(${$e(i,"int").getComponents("hsl").map((s,r)=>t[r](s)).join(", ")})`}function w0(i,t){let e=an(t==="float"?2:0),n=["r","g","b"],s=$e(i,t);return`{${Qn(s.getComponents("rgb")).map((o,a)=>`${n[a]}: ${e(o)}`).join(", ")}}`}function zE(i){return t=>w0(t,i)}function M0(i,t){let e=an(2),n=an(t==="float"?2:0),s=["r","g","b","a"];return`{${$e(i,t).getComponents("rgb").map((a,l)=>{let c=l===3?e:n;return`${s[l]}: ${c(a)}`}).join(", ")}}`}function VE(i){return t=>M0(t,i)}var GE=[{format:{alpha:!1,mode:"rgb",notation:"hex",type:"int"},stringifier:Np},{format:{alpha:!0,mode:"rgb",notation:"hex",type:"int"},stringifier:Dp},{format:{alpha:!1,mode:"rgb",notation:"func",type:"int"},stringifier:y0},{format:{alpha:!0,mode:"rgb",notation:"func",type:"int"},stringifier:Lc},{format:{alpha:!1,mode:"hsl",notation:"func",type:"int"},stringifier:OE},{format:{alpha:!0,mode:"hsl",notation:"func",type:"int"},stringifier:kE},...["int","float"].reduce((i,t)=>[...i,{format:{alpha:!1,mode:"rgb",notation:"object",type:t},stringifier:zE(t)},{format:{alpha:!0,mode:"rgb",notation:"object",type:t},stringifier:VE(t)}],[])];function S0(i){return GE.reduce((t,e)=>t||(AE(e.format,i)?e.stringifier:null),null)}var zo=te("apl"),Gd=class{constructor(t,e){this.onValueChange_=this.onValueChange_.bind(this),this.value=e.value,this.value.emitter.on("change",this.onValueChange_),this.element=t.createElement("div"),this.element.classList.add(zo()),e.viewProps.bindClassModifiers(this.element),e.viewProps.bindTabIndex(this.element);let n=t.createElement("div");n.classList.add(zo("b")),this.element.appendChild(n);let s=t.createElement("div");s.classList.add(zo("c")),n.appendChild(s),this.colorElem_=s;let r=t.createElement("div");r.classList.add(zo("m")),this.element.appendChild(r),this.markerElem_=r;let o=t.createElement("div");o.classList.add(zo("p")),this.markerElem_.appendChild(o),this.previewElem_=o,this.update_()}update_(){let t=this.value.rawValue,e=t.getComponents("rgb"),n=new ie([e[0],e[1],e[2],0],"rgb"),s=new ie([e[0],e[1],e[2],255],"rgb"),r=["to right",Lc(n),Lc(s)];this.colorElem_.style.background=`linear-gradient(${r.join(",")})`,this.previewElem_.style.backgroundColor=Lc(t);let o=ae(e[3],0,1,0,100);this.markerElem_.style.left=`${o}%`}onValueChange_(){this.update_()}},Hd=class{constructor(t,e){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=e.value,this.viewProps=e.viewProps,this.view=new Gd(t,{value:this.value,viewProps:this.viewProps}),this.ptHandler_=new Ei(this.view.element),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.element.addEventListener("keydown",this.onKeyDown_),this.view.element.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(t,e){if(!t.point)return;let n=t.point.x/t.bounds.width,s=this.value.rawValue,[r,o,a]=s.getComponents("hsv");this.value.setRawValue(new ie([r,o,a,n],"hsv"),e)}onPointerDown_(t){this.handlePointerEvent_(t.data,{forceEmit:!1,last:!1})}onPointerMove_(t){this.handlePointerEvent_(t.data,{forceEmit:!1,last:!1})}onPointerUp_(t){this.handlePointerEvent_(t.data,{forceEmit:!0,last:!0})}onKeyDown_(t){let e=on(Us(!0),Si(t));if(e===0)return;let n=this.value.rawValue,[s,r,o,a]=n.getComponents("hsv");this.value.setRawValue(new ie([s,r,o,a+e],"hsv"),{forceEmit:!1,last:!1})}onKeyUp_(t){on(Us(!0),Si(t))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}},yr=te("coltxt");function HE(i){let t=i.createElement("select"),e=[{text:"RGB",value:"rgb"},{text:"HSL",value:"hsl"},{text:"HSV",value:"hsv"},{text:"HEX",value:"hex"}];return t.appendChild(e.reduce((n,s)=>{let r=i.createElement("option");return r.textContent=s.text,r.value=s.value,n.appendChild(r),n},i.createDocumentFragment())),t}var Wd=class{constructor(t,e){this.element=t.createElement("div"),this.element.classList.add(yr()),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("div");n.classList.add(yr("m")),this.modeElem_=HE(t),this.modeElem_.classList.add(yr("ms")),n.appendChild(this.modeSelectElement),e.viewProps.bindDisabled(this.modeElem_);let s=t.createElement("div");s.classList.add(yr("mm")),s.appendChild($c(t,"dropdown")),n.appendChild(s),this.element.appendChild(n);let r=t.createElement("div");r.classList.add(yr("w")),this.element.appendChild(r),this.inputsElem_=r,this.inputViews_=e.inputViews,this.applyInputViews_(),xi(e.mode,o=>{this.modeElem_.value=o})}get modeSelectElement(){return this.modeElem_}get inputViews(){return this.inputViews_}set inputViews(t){this.inputViews_=t,this.applyInputViews_()}applyInputViews_(){Zg(this.inputsElem_);let t=this.element.ownerDocument;this.inputViews_.forEach(e=>{let n=t.createElement("div");n.classList.add(yr("c")),n.appendChild(e.element),this.inputsElem_.appendChild(n)})}};function WE(i){return an(i==="float"?2:0)}function qE(i,t,e){let n=Ar(i,t)[e];return new Rs({min:0,max:n})}function XE(i,t,e){return new Bs(i,{arrayPosition:e===0?"fst":e===2?"lst":"mid",parser:t.parser,props:Xt.fromObject({formatter:WE(t.colorType),keyScale:Us(!1),pointerScale:t.colorType==="float"?.01:1}),value:ye(0,{constraint:qE(t.colorMode,t.colorType,e)}),viewProps:t.viewProps})}function YE(i,t){let e={colorMode:t.colorMode,colorType:t.colorType,parser:bi,viewProps:t.viewProps};return[0,1,2].map(n=>{let s=XE(i,e,n);return Rr({primary:t.value,secondary:s.value,forward(r){return $e(r,t.colorType).getComponents(t.colorMode)[n]},backward(r,o){let a=t.colorMode,c=$e(r,t.colorType).getComponents(a);c[n]=o;let h=Fp(Zc(Qn(c),c[3]),a,t.colorType);return $e(h,"int")}}),s})}function jE(i,t){let e=new Ds(i,{parser:oa("int"),props:Xt.fromObject({formatter:Np}),value:ye(ie.black()),viewProps:t.viewProps});return Rr({primary:t.value,secondary:e.value,forward:n=>new ie(Qn(n.getComponents()),n.mode),backward:(n,s)=>new ie(Zc(Qn(s.getComponents(n.mode)),n.getComponents()[3]),n.mode)}),[e]}function $E(i){return i!=="hex"}var qd=class{constructor(t,e){this.onModeSelectChange_=this.onModeSelectChange_.bind(this),this.colorType_=e.colorType,this.value=e.value,this.viewProps=e.viewProps,this.colorMode=ye(this.value.rawValue.mode),this.ccs_=this.createComponentControllers_(t),this.view=new Wd(t,{mode:this.colorMode,inputViews:[this.ccs_[0].view,this.ccs_[1].view,this.ccs_[2].view],viewProps:this.viewProps}),this.view.modeSelectElement.addEventListener("change",this.onModeSelectChange_)}createComponentControllers_(t){let e=this.colorMode.rawValue;return $E(e)?YE(t,{colorMode:e,colorType:this.colorType_,value:this.value,viewProps:this.viewProps}):jE(t,{value:this.value,viewProps:this.viewProps})}onModeSelectChange_(t){let e=t.currentTarget;this.colorMode.rawValue=e.value,this.ccs_=this.createComponentControllers_(this.view.element.ownerDocument),this.view.inputViews=this.ccs_.map(n=>n.view)}},Yu=te("hpl"),Xd=class{constructor(t,e){this.onValueChange_=this.onValueChange_.bind(this),this.value=e.value,this.value.emitter.on("change",this.onValueChange_),this.element=t.createElement("div"),this.element.classList.add(Yu()),e.viewProps.bindClassModifiers(this.element),e.viewProps.bindTabIndex(this.element);let n=t.createElement("div");n.classList.add(Yu("c")),this.element.appendChild(n);let s=t.createElement("div");s.classList.add(Yu("m")),this.element.appendChild(s),this.markerElem_=s,this.update_()}update_(){let t=this.value.rawValue,[e]=t.getComponents("hsv");this.markerElem_.style.backgroundColor=y0(new ie([e,100,100],"hsv"));let n=ae(e,0,360,0,100);this.markerElem_.style.left=`${n}%`}onValueChange_(){this.update_()}},Yd=class{constructor(t,e){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=e.value,this.viewProps=e.viewProps,this.view=new Xd(t,{value:this.value,viewProps:this.viewProps}),this.ptHandler_=new Ei(this.view.element),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.element.addEventListener("keydown",this.onKeyDown_),this.view.element.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(t,e){if(!t.point)return;let n=ae(Ne(t.point.x,0,t.bounds.width),0,t.bounds.width,0,360),s=this.value.rawValue,[,r,o,a]=s.getComponents("hsv");this.value.setRawValue(new ie([n,r,o,a],"hsv"),e)}onPointerDown_(t){this.handlePointerEvent_(t.data,{forceEmit:!1,last:!1})}onPointerMove_(t){this.handlePointerEvent_(t.data,{forceEmit:!1,last:!1})}onPointerUp_(t){this.handlePointerEvent_(t.data,{forceEmit:!0,last:!0})}onKeyDown_(t){let e=on(Us(!1),Si(t));if(e===0)return;let n=this.value.rawValue,[s,r,o,a]=n.getComponents("hsv");this.value.setRawValue(new ie([s+e,r,o,a],"hsv"),{forceEmit:!1,last:!1})}onKeyUp_(t){on(Us(!1),Si(t))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}},ju=te("svp"),Tg=64,jd=class{constructor(t,e){this.onValueChange_=this.onValueChange_.bind(this),this.value=e.value,this.value.emitter.on("change",this.onValueChange_),this.element=t.createElement("div"),this.element.classList.add(ju()),e.viewProps.bindClassModifiers(this.element),e.viewProps.bindTabIndex(this.element);let n=t.createElement("canvas");n.height=Tg,n.width=Tg,n.classList.add(ju("c")),this.element.appendChild(n),this.canvasElement=n;let s=t.createElement("div");s.classList.add(ju("m")),this.element.appendChild(s),this.markerElem_=s,this.update_()}update_(){let t=F1(this.canvasElement);if(!t)return;let n=this.value.rawValue.getComponents("hsv"),s=this.canvasElement.width,r=this.canvasElement.height,o=t.getImageData(0,0,s,r),a=o.data;for(let h=0;h<r;h++)for(let d=0;d<s;d++){let u=ae(d,0,s,0,100),p=ae(h,0,r,100,0),m=a0(n[0],u,p),v=(h*s+d)*4;a[v]=m[0],a[v+1]=m[1],a[v+2]=m[2],a[v+3]=255}t.putImageData(o,0,0);let l=ae(n[1],0,100,0,100);this.markerElem_.style.left=`${l}%`;let c=ae(n[2],0,100,100,0);this.markerElem_.style.top=`${c}%`}onValueChange_(){this.update_()}},$d=class{constructor(t,e){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=e.value,this.viewProps=e.viewProps,this.view=new jd(t,{value:this.value,viewProps:this.viewProps}),this.ptHandler_=new Ei(this.view.element),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.element.addEventListener("keydown",this.onKeyDown_),this.view.element.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(t,e){if(!t.point)return;let n=ae(t.point.x,0,t.bounds.width,0,100),s=ae(t.point.y,0,t.bounds.height,100,0),[r,,,o]=this.value.rawValue.getComponents("hsv");this.value.setRawValue(new ie([r,n,s,o],"hsv"),e)}onPointerDown_(t){this.handlePointerEvent_(t.data,{forceEmit:!1,last:!1})}onPointerMove_(t){this.handlePointerEvent_(t.data,{forceEmit:!1,last:!1})}onPointerUp_(t){this.handlePointerEvent_(t.data,{forceEmit:!0,last:!0})}onKeyDown_(t){i0(t.key)&&t.preventDefault();let[e,n,s,r]=this.value.rawValue.getComponents("hsv"),o=Us(!1),a=on(o,Si(t)),l=on(o,Zo(t));a===0&&l===0||this.value.setRawValue(new ie([e,n+a,s+l,r],"hsv"),{forceEmit:!1,last:!1})}onKeyUp_(t){let e=Us(!1),n=on(e,Si(t)),s=on(e,Zo(t));n===0&&s===0||this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}},Zd=class{constructor(t,e){this.value=e.value,this.viewProps=e.viewProps,this.hPaletteC_=new Yd(t,{value:this.value,viewProps:this.viewProps}),this.svPaletteC_=new $d(t,{value:this.value,viewProps:this.viewProps}),this.alphaIcs_=e.supportsAlpha?{palette:new Hd(t,{value:this.value,viewProps:this.viewProps}),text:new Bs(t,{parser:bi,props:Xt.fromObject({pointerScale:.01,keyScale:.1,formatter:an(2)}),value:ye(0,{constraint:new Rs({min:0,max:1})}),viewProps:this.viewProps})}:null,this.alphaIcs_&&Rr({primary:this.value,secondary:this.alphaIcs_.text.value,forward:n=>n.getComponents()[3],backward:(n,s)=>{let r=n.getComponents();return r[3]=s,new ie(r,n.mode)}}),this.textsC_=new qd(t,{colorType:e.colorType,value:this.value,viewProps:this.viewProps}),this.view=new Vd(t,{alphaViews:this.alphaIcs_?{palette:this.alphaIcs_.palette.view,text:this.alphaIcs_.text.view}:null,hPaletteView:this.hPaletteC_.view,supportsAlpha:e.supportsAlpha,svPaletteView:this.svPaletteC_.view,textsView:this.textsC_.view,viewProps:this.viewProps})}get textsController(){return this.textsC_}},$u=te("colsw"),Kd=class{constructor(t,e){this.onValueChange_=this.onValueChange_.bind(this),e.value.emitter.on("change",this.onValueChange_),this.value=e.value,this.element=t.createElement("div"),this.element.classList.add($u()),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("div");n.classList.add($u("sw")),this.element.appendChild(n),this.swatchElem_=n;let s=t.createElement("button");s.classList.add($u("b")),e.viewProps.bindDisabled(s),this.element.appendChild(s),this.buttonElement=s,this.update_()}update_(){let t=this.value.rawValue;this.swatchElem_.style.backgroundColor=Dp(t)}onValueChange_(){this.update_()}},Jd=class{constructor(t,e){this.value=e.value,this.viewProps=e.viewProps,this.view=new Kd(t,{value:this.value,viewProps:this.viewProps})}},Qo=class{constructor(t,e){this.onButtonBlur_=this.onButtonBlur_.bind(this),this.onButtonClick_=this.onButtonClick_.bind(this),this.onPopupChildBlur_=this.onPopupChildBlur_.bind(this),this.onPopupChildKeydown_=this.onPopupChildKeydown_.bind(this),this.value=e.value,this.viewProps=e.viewProps,this.foldable_=Xo.create(e.expanded),this.swatchC_=new Jd(t,{value:this.value,viewProps:this.viewProps});let n=this.swatchC_.view.buttonElement;n.addEventListener("blur",this.onButtonBlur_),n.addEventListener("click",this.onButtonClick_),this.textC_=new Ds(t,{parser:e.parser,props:Xt.fromObject({formatter:e.formatter}),value:this.value,viewProps:this.viewProps}),this.view=new zd(t,{foldable:this.foldable_,pickerLayout:e.pickerLayout}),this.view.swatchElement.appendChild(this.swatchC_.view.element),this.view.textElement.appendChild(this.textC_.view.element),this.popC_=e.pickerLayout==="popup"?new Wc(t,{viewProps:this.viewProps}):null;let s=new Zd(t,{colorType:e.colorType,supportsAlpha:e.supportsAlpha,value:this.value,viewProps:this.viewProps});s.view.allFocusableElements.forEach(r=>{r.addEventListener("blur",this.onPopupChildBlur_),r.addEventListener("keydown",this.onPopupChildKeydown_)}),this.pickerC_=s,this.popC_?(this.view.element.appendChild(this.popC_.view.element),this.popC_.view.element.appendChild(s.view.element),Rr({primary:this.foldable_.value("expanded"),secondary:this.popC_.shows,forward:r=>r,backward:(r,o)=>o})):this.view.pickerElement&&(this.view.pickerElement.appendChild(this.pickerC_.view.element),Pp(this.foldable_,this.view.pickerElement))}get textController(){return this.textC_}onButtonBlur_(t){if(!this.popC_)return;let e=this.view.element,n=t.relatedTarget;(!n||!e.contains(n))&&(this.popC_.shows.rawValue=!1)}onButtonClick_(){this.foldable_.set("expanded",!this.foldable_.get("expanded")),this.foldable_.get("expanded")&&this.pickerC_.view.allFocusableElements[0].focus()}onPopupChildBlur_(t){if(!this.popC_)return;let e=this.popC_.view.element,n=Kg(t);n&&e.contains(n)||n&&n===this.swatchC_.view.buttonElement&&!Ap(e.ownerDocument)||(this.popC_.shows.rawValue=!1)}onPopupChildKeydown_(t){this.popC_?t.key==="Escape"&&(this.popC_.shows.rawValue=!1):this.view.pickerElement&&t.key==="Escape"&&this.swatchC_.view.buttonElement.focus()}};function ZE(i){return Qn(i.getComponents("rgb")).reduce((t,e)=>t<<8|Math.floor(e)&255,0)}function KE(i){return i.getComponents("rgb").reduce((t,e,n)=>{let s=Math.floor(n===3?e*255:e)&255;return t<<8|s},0)>>>0}function JE(i){return new ie([i>>16&255,i>>8&255,i&255],"rgb")}function QE(i){return new ie([i>>24&255,i>>16&255,i>>8&255,ae(i&255,0,255,0,1)],"rgb")}function tA(i){return typeof i!="number"?ie.black():JE(i)}function eA(i){return typeof i!="number"?ie.black():QE(i)}function Fc(i,t){return typeof i!="object"||ge(i)?!1:t in i&&typeof i[t]=="number"}function E0(i){return Fc(i,"r")&&Fc(i,"g")&&Fc(i,"b")}function A0(i){return E0(i)&&Fc(i,"a")}function C0(i){return E0(i)}function Bp(i,t){if(i.mode!==t.mode||i.type!==t.type)return!1;let e=i.getComponents(),n=t.getComponents();for(let s=0;s<e.length;s++)if(e[s]!==n[s])return!1;return!0}function Pg(i){return"a"in i?[i.r,i.g,i.b,i.a]:[i.r,i.g,i.b]}function nA(i){let t=S0(i);return t?(e,n)=>{ra(e,t(n))}:null}function iA(i){let t=i?KE:ZE;return(e,n)=>{ra(e,t(n))}}function sA(i,t,e){let s=$e(t,e).toRgbaObject();i.writeProperty("r",s.r),i.writeProperty("g",s.g),i.writeProperty("b",s.b),i.writeProperty("a",s.a)}function rA(i,t,e){let s=$e(t,e).toRgbaObject();i.writeProperty("r",s.r),i.writeProperty("g",s.g),i.writeProperty("b",s.b)}function oA(i,t){return(e,n)=>{i?sA(e,n,t):rA(e,n,t)}}function aA(i){var t;return!!(!((t=i?.color)===null||t===void 0)&&t.alpha)}function lA(i){return i?t=>Dp(t,"0x"):t=>Np(t,"0x")}function cA(i){return"color"in i||i.view==="color"}var hA=Ze({id:"input-color-number",type:"input",accept:(i,t)=>{if(typeof i!="number"||!cA(t))return null;let e=Lp(t);return e?{initialValue:i,params:Object.assign(Object.assign({},e),{supportsAlpha:aA(t)})}:null},binding:{reader:i=>i.params.supportsAlpha?eA:tA,equals:Bp,writer:i=>iA(i.params.supportsAlpha)},controller:i=>{var t,e;return new Qo(i.document,{colorType:"int",expanded:(t=i.params.expanded)!==null&&t!==void 0?t:!1,formatter:lA(i.params.supportsAlpha),parser:oa("int"),pickerLayout:(e=i.params.picker)!==null&&e!==void 0?e:"popup",supportsAlpha:i.params.supportsAlpha,value:i.value,viewProps:i.viewProps})}});function uA(i,t){if(!C0(i))return $e(ie.black(),t);if(t==="int"){let e=Pg(i);return new ie(e,"rgb")}if(t==="float"){let e=Pg(i);return new Jo(e,"rgb")}return $e(ie.black(),"int")}function dA(i){return A0(i)}function pA(i){return t=>{let e=uA(t,i);return $e(e,"int")}}function fA(i,t){return e=>i?M0(e,t):w0(e,t)}var mA=Ze({id:"input-color-object",type:"input",accept:(i,t)=>{var e;if(!C0(i))return null;let n=Lp(t);return n?{initialValue:i,params:Object.assign(Object.assign({},n),{colorType:(e=h0(t))!==null&&e!==void 0?e:"int"})}:null},binding:{reader:i=>pA(i.params.colorType),equals:Bp,writer:i=>oA(dA(i.initialValue),i.params.colorType)},controller:i=>{var t,e;let n=A0(i.initialValue);return new Qo(i.document,{colorType:i.params.colorType,expanded:(t=i.params.expanded)!==null&&t!==void 0?t:!1,formatter:fA(n,i.params.colorType),parser:oa("int"),pickerLayout:(e=i.params.picker)!==null&&e!==void 0?e:"popup",supportsAlpha:n,value:i.value,viewProps:i.viewProps})}}),gA=Ze({id:"input-color-string",type:"input",accept:(i,t)=>{if(typeof i!="string"||t.view==="text")return null;let e=BE(i,h0(t));if(!e)return null;let n=S0(e);if(!n)return null;let s=Lp(t);return s?{initialValue:i,params:Object.assign(Object.assign({},s),{format:e,stringifier:n})}:null},binding:{reader:()=>UE,equals:Bp,writer:i=>{let t=nA(i.params.format);if(!t)throw Ue.notBindable();return t}},controller:i=>{var t,e;return new Qo(i.document,{colorType:i.params.format.type,expanded:(t=i.params.expanded)!==null&&t!==void 0?t:!1,formatter:i.params.stringifier,parser:oa("int"),pickerLayout:(e=i.params.picker)!==null&&e!==void 0?e:"popup",supportsAlpha:i.params.format.alpha,value:i.value,viewProps:i.viewProps})}}),ta=class{constructor(t){this.components=t.components,this.asm_=t.assembly}constrain(t){let e=this.asm_.toComponents(t).map((n,s)=>{var r,o;return(o=(r=this.components[s])===null||r===void 0?void 0:r.constrain(n))!==null&&o!==void 0?o:n});return this.asm_.fromComponents(e)}},Rg=te("pndtxt"),Qd=class{constructor(t,e){this.textViews=e.textViews,this.element=t.createElement("div"),this.element.classList.add(Rg()),this.textViews.forEach(n=>{let s=t.createElement("div");s.classList.add(Rg("a")),s.appendChild(n.element),this.element.appendChild(s)})}};function vA(i,t,e){return new Bs(i,{arrayPosition:e===0?"fst":e===t.axes.length-1?"lst":"mid",parser:t.parser,props:t.axes[e].textProps,value:ye(0,{constraint:t.axes[e].constraint}),viewProps:t.viewProps})}var ea=class{constructor(t,e){this.value=e.value,this.viewProps=e.viewProps,this.acs_=e.axes.map((n,s)=>vA(t,e,s)),this.acs_.forEach((n,s)=>{Rr({primary:this.value,secondary:n.value,forward:r=>e.assembly.toComponents(r)[s],backward:(r,o)=>{let a=e.assembly.toComponents(r);return a[s]=o,e.assembly.fromComponents(a)}})}),this.view=new Qd(t,{textViews:this.acs_.map(n=>n.view)})}get textControllers(){return this.acs_}},tp=class extends Ls{get max(){return this.controller.valueController.sliderController.props.get("max")}set max(t){this.controller.valueController.sliderController.props.set("max",t)}get min(){return this.controller.valueController.sliderController.props.get("min")}set min(t){this.controller.valueController.sliderController.props.set("min",t)}};function _A(i,t){let e=[],n=Wg(i,t);n&&e.push(n);let s=qg(i);s&&e.push(s);let r=Ip(i.options);return r&&e.push(r),new Fs(e)}var xA=Ze({id:"input-number",type:"input",accept:(i,t)=>{if(typeof i!="number")return null;let e=Se(t,n=>Object.assign(Object.assign({},Yg(n)),{options:n.optional.custom(sa),readonly:n.optional.constant(!1)}));return e?{initialValue:i,params:e}:null},binding:{reader:i=>zg,constraint:i=>_A(i.params,i.initialValue),writer:i=>ra},controller:i=>{let t=i.value,e=i.constraint,n=e&&Hc(e,Ns);if(n)return new Jn(i.document,{props:new Xt({options:n.values.value("options")}),value:t,viewProps:i.viewProps});let s=Xg(i.params,t.rawValue),r=e&&Hc(e,Rs);return r?new Er(i.document,Object.assign(Object.assign({},s0(Object.assign(Object.assign({},s),{keyScale:ye(s.keyScale),max:r.values.value("max"),min:r.values.value("min")}))),{parser:bi,value:t,viewProps:i.viewProps})):new Bs(i.document,{parser:bi,props:Xt.fromObject(s),value:t,viewProps:i.viewProps})},api(i){return typeof i.controller.value.rawValue!="number"?null:i.controller.valueController instanceof Er?new tp(i.controller):i.controller.valueController instanceof Jn?new $o(i.controller):null}}),Zn=class{constructor(t=0,e=0){this.x=t,this.y=e}getComponents(){return[this.x,this.y]}static isObject(t){if(ge(t))return!1;let e=t.x,n=t.y;return!(typeof e!="number"||typeof n!="number")}static equals(t,e){return t.x===e.x&&t.y===e.y}toObject(){return{x:this.x,y:this.y}}},T0={toComponents:i=>i.getComponents(),fromComponents:i=>new Zn(...i)},wr=te("p2d"),ep=class{constructor(t,e){this.element=t.createElement("div"),this.element.classList.add(wr()),e.viewProps.bindClassModifiers(this.element),xi(e.expanded,Cr(this.element,wr(void 0,"expanded")));let n=t.createElement("div");n.classList.add(wr("h")),this.element.appendChild(n);let s=t.createElement("button");s.classList.add(wr("b")),s.appendChild($c(t,"p2dpad")),e.viewProps.bindDisabled(s),n.appendChild(s),this.buttonElement=s;let r=t.createElement("div");if(r.classList.add(wr("t")),n.appendChild(r),this.textElement=r,e.pickerLayout==="inline"){let o=t.createElement("div");o.classList.add(wr("p")),this.element.appendChild(o),this.pickerElement=o}else this.pickerElement=null}},$i=te("p2dp"),np=class{constructor(t,e){this.onFoldableChange_=this.onFoldableChange_.bind(this),this.onPropsChange_=this.onPropsChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.props_=e.props,this.props_.emitter.on("change",this.onPropsChange_),this.element=t.createElement("div"),this.element.classList.add($i()),e.layout==="popup"&&this.element.classList.add($i(void 0,"p")),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("div");n.classList.add($i("p")),e.viewProps.bindTabIndex(n),this.element.appendChild(n),this.padElement=n;let s=t.createElementNS($n,"svg");s.classList.add($i("g")),this.padElement.appendChild(s),this.svgElem_=s;let r=t.createElementNS($n,"line");r.classList.add($i("ax")),r.setAttributeNS(null,"x1","0"),r.setAttributeNS(null,"y1","50%"),r.setAttributeNS(null,"x2","100%"),r.setAttributeNS(null,"y2","50%"),this.svgElem_.appendChild(r);let o=t.createElementNS($n,"line");o.classList.add($i("ax")),o.setAttributeNS(null,"x1","50%"),o.setAttributeNS(null,"y1","0"),o.setAttributeNS(null,"x2","50%"),o.setAttributeNS(null,"y2","100%"),this.svgElem_.appendChild(o);let a=t.createElementNS($n,"line");a.classList.add($i("l")),a.setAttributeNS(null,"x1","50%"),a.setAttributeNS(null,"y1","50%"),this.svgElem_.appendChild(a),this.lineElem_=a;let l=t.createElement("div");l.classList.add($i("m")),this.padElement.appendChild(l),this.markerElem_=l,e.value.emitter.on("change",this.onValueChange_),this.value=e.value,this.update_()}get allFocusableElements(){return[this.padElement]}update_(){let[t,e]=this.value.rawValue.getComponents(),n=this.props_.get("max"),s=ae(t,-n,+n,0,100),r=ae(e,-n,+n,0,100),o=this.props_.get("invertsY")?100-r:r;this.lineElem_.setAttributeNS(null,"x2",`${s}%`),this.lineElem_.setAttributeNS(null,"y2",`${o}%`),this.markerElem_.style.left=`${s}%`,this.markerElem_.style.top=`${o}%`}onValueChange_(){this.update_()}onPropsChange_(){this.update_()}onFoldableChange_(){this.update_()}};function Ig(i,t,e){return[on(t[0],Si(i)),on(t[1],Zo(i))*(e?1:-1)]}var ip=class{constructor(t,e){this.onPadKeyDown_=this.onPadKeyDown_.bind(this),this.onPadKeyUp_=this.onPadKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.props=e.props,this.value=e.value,this.viewProps=e.viewProps,this.view=new np(t,{layout:e.layout,props:this.props,value:this.value,viewProps:this.viewProps}),this.ptHandler_=new Ei(this.view.padElement),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.padElement.addEventListener("keydown",this.onPadKeyDown_),this.view.padElement.addEventListener("keyup",this.onPadKeyUp_)}handlePointerEvent_(t,e){if(!t.point)return;let n=this.props.get("max"),s=ae(t.point.x,0,t.bounds.width,-n,+n),r=ae(this.props.get("invertsY")?t.bounds.height-t.point.y:t.point.y,0,t.bounds.height,-n,+n);this.value.setRawValue(new Zn(s,r),e)}onPointerDown_(t){this.handlePointerEvent_(t.data,{forceEmit:!1,last:!1})}onPointerMove_(t){this.handlePointerEvent_(t.data,{forceEmit:!1,last:!1})}onPointerUp_(t){this.handlePointerEvent_(t.data,{forceEmit:!0,last:!0})}onPadKeyDown_(t){i0(t.key)&&t.preventDefault();let[e,n]=Ig(t,[this.props.get("xKeyScale"),this.props.get("yKeyScale")],this.props.get("invertsY"));e===0&&n===0||this.value.setRawValue(new Zn(this.value.rawValue.x+e,this.value.rawValue.y+n),{forceEmit:!1,last:!1})}onPadKeyUp_(t){let[e,n]=Ig(t,[this.props.get("xKeyScale"),this.props.get("yKeyScale")],this.props.get("invertsY"));e===0&&n===0||this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}},sp=class{constructor(t,e){var n,s;this.onPopupChildBlur_=this.onPopupChildBlur_.bind(this),this.onPopupChildKeydown_=this.onPopupChildKeydown_.bind(this),this.onPadButtonBlur_=this.onPadButtonBlur_.bind(this),this.onPadButtonClick_=this.onPadButtonClick_.bind(this),this.value=e.value,this.viewProps=e.viewProps,this.foldable_=Xo.create(e.expanded),this.popC_=e.pickerLayout==="popup"?new Wc(t,{viewProps:this.viewProps}):null;let r=new ip(t,{layout:e.pickerLayout,props:new Xt({invertsY:ye(e.invertsY),max:ye(e.max),xKeyScale:e.axes[0].textProps.value("keyScale"),yKeyScale:e.axes[1].textProps.value("keyScale")}),value:this.value,viewProps:this.viewProps});r.view.allFocusableElements.forEach(o=>{o.addEventListener("blur",this.onPopupChildBlur_),o.addEventListener("keydown",this.onPopupChildKeydown_)}),this.pickerC_=r,this.textC_=new ea(t,{assembly:T0,axes:e.axes,parser:e.parser,value:this.value,viewProps:this.viewProps}),this.view=new ep(t,{expanded:this.foldable_.value("expanded"),pickerLayout:e.pickerLayout,viewProps:this.viewProps}),this.view.textElement.appendChild(this.textC_.view.element),(n=this.view.buttonElement)===null||n===void 0||n.addEventListener("blur",this.onPadButtonBlur_),(s=this.view.buttonElement)===null||s===void 0||s.addEventListener("click",this.onPadButtonClick_),this.popC_?(this.view.element.appendChild(this.popC_.view.element),this.popC_.view.element.appendChild(this.pickerC_.view.element),Rr({primary:this.foldable_.value("expanded"),secondary:this.popC_.shows,forward:o=>o,backward:(o,a)=>a})):this.view.pickerElement&&(this.view.pickerElement.appendChild(this.pickerC_.view.element),Pp(this.foldable_,this.view.pickerElement))}get textController(){return this.textC_}onPadButtonBlur_(t){if(!this.popC_)return;let e=this.view.element,n=t.relatedTarget;(!n||!e.contains(n))&&(this.popC_.shows.rawValue=!1)}onPadButtonClick_(){this.foldable_.set("expanded",!this.foldable_.get("expanded")),this.foldable_.get("expanded")&&this.pickerC_.view.allFocusableElements[0].focus()}onPopupChildBlur_(t){if(!this.popC_)return;let e=this.popC_.view.element,n=Kg(t);n&&e.contains(n)||n&&n===this.view.buttonElement&&!Ap(e.ownerDocument)||(this.popC_.shows.rawValue=!1)}onPopupChildKeydown_(t){this.popC_?t.key==="Escape"&&(this.popC_.shows.rawValue=!1):this.view.pickerElement&&t.key==="Escape"&&this.view.buttonElement.focus()}};function bA(i){return Zn.isObject(i)?new Zn(i.x,i.y):new Zn}function yA(i,t){i.writeProperty("x",t.x),i.writeProperty("y",t.y)}function wA(i,t){return new ta({assembly:T0,components:[_i(Object.assign(Object.assign({},i),i.x),t.x),_i(Object.assign(Object.assign({},i),i.y),t.y)]})}function Lg(i,t){var e,n;if(!ge(i.min)||!ge(i.max))return Math.max(Math.abs((e=i.min)!==null&&e!==void 0?e:0),Math.abs((n=i.max)!==null&&n!==void 0?n:0));let s=Gg(i);return Math.max(Math.abs(s)*10,Math.abs(t)*10)}function MA(i,t){var e,n;let s=Lg(Ps(i,(e=i.x)!==null&&e!==void 0?e:{}),t.x),r=Lg(Ps(i,(n=i.y)!==null&&n!==void 0?n:{}),t.y);return Math.max(s,r)}function SA(i){if(!("y"in i))return!1;let t=i.y;return t&&"inverted"in t?!!t.inverted:!1}var EA=Ze({id:"input-point2d",type:"input",accept:(i,t)=>{if(!Zn.isObject(i))return null;let e=Se(t,n=>Object.assign(Object.assign({},Ko(n)),{expanded:n.optional.boolean,picker:n.optional.custom(o0),readonly:n.optional.constant(!1),x:n.optional.custom(Ki),y:n.optional.object(Object.assign(Object.assign({},Ko(n)),{inverted:n.optional.boolean}))}));return e?{initialValue:i,params:e}:null},binding:{reader:()=>bA,constraint:i=>wA(i.params,i.initialValue),equals:Zn.equals,writer:()=>yA},controller:i=>{var t,e;let n=i.document,s=i.value,r=i.constraint,o=[i.params.x,i.params.y];return new sp(n,{axes:s.rawValue.getComponents().map((a,l)=>{var c;return Ep({constraint:r.components[l],initialValue:a,params:Ps(i.params,(c=o[l])!==null&&c!==void 0?c:{})})}),expanded:(t=i.params.expanded)!==null&&t!==void 0?t:!1,invertsY:SA(i.params),max:MA(i.params,s.rawValue),parser:bi,pickerLayout:(e=i.params.picker)!==null&&e!==void 0?e:"popup",value:s,viewProps:i.viewProps})}}),Ji=class{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}getComponents(){return[this.x,this.y,this.z]}static isObject(t){if(ge(t))return!1;let e=t.x,n=t.y,s=t.z;return!(typeof e!="number"||typeof n!="number"||typeof s!="number")}static equals(t,e){return t.x===e.x&&t.y===e.y&&t.z===e.z}toObject(){return{x:this.x,y:this.y,z:this.z}}},P0={toComponents:i=>i.getComponents(),fromComponents:i=>new Ji(...i)};function AA(i){return Ji.isObject(i)?new Ji(i.x,i.y,i.z):new Ji}function CA(i,t){i.writeProperty("x",t.x),i.writeProperty("y",t.y),i.writeProperty("z",t.z)}function TA(i,t){return new ta({assembly:P0,components:[_i(Object.assign(Object.assign({},i),i.x),t.x),_i(Object.assign(Object.assign({},i),i.y),t.y),_i(Object.assign(Object.assign({},i),i.z),t.z)]})}var PA=Ze({id:"input-point3d",type:"input",accept:(i,t)=>{if(!Ji.isObject(i))return null;let e=Se(t,n=>Object.assign(Object.assign({},Ko(n)),{readonly:n.optional.constant(!1),x:n.optional.custom(Ki),y:n.optional.custom(Ki),z:n.optional.custom(Ki)}));return e?{initialValue:i,params:e}:null},binding:{reader:i=>AA,constraint:i=>TA(i.params,i.initialValue),equals:Ji.equals,writer:i=>CA},controller:i=>{let t=i.value,e=i.constraint,n=[i.params.x,i.params.y,i.params.z];return new ea(i.document,{assembly:P0,axes:t.rawValue.getComponents().map((s,r)=>{var o;return Ep({constraint:e.components[r],initialValue:s,params:Ps(i.params,(o=n[r])!==null&&o!==void 0?o:{})})}),parser:bi,value:t,viewProps:i.viewProps})}}),Qi=class{constructor(t=0,e=0,n=0,s=0){this.x=t,this.y=e,this.z=n,this.w=s}getComponents(){return[this.x,this.y,this.z,this.w]}static isObject(t){if(ge(t))return!1;let e=t.x,n=t.y,s=t.z,r=t.w;return!(typeof e!="number"||typeof n!="number"||typeof s!="number"||typeof r!="number")}static equals(t,e){return t.x===e.x&&t.y===e.y&&t.z===e.z&&t.w===e.w}toObject(){return{x:this.x,y:this.y,z:this.z,w:this.w}}},R0={toComponents:i=>i.getComponents(),fromComponents:i=>new Qi(...i)};function RA(i){return Qi.isObject(i)?new Qi(i.x,i.y,i.z,i.w):new Qi}function IA(i,t){i.writeProperty("x",t.x),i.writeProperty("y",t.y),i.writeProperty("z",t.z),i.writeProperty("w",t.w)}function LA(i,t){return new ta({assembly:R0,components:[_i(Object.assign(Object.assign({},i),i.x),t.x),_i(Object.assign(Object.assign({},i),i.y),t.y),_i(Object.assign(Object.assign({},i),i.z),t.z),_i(Object.assign(Object.assign({},i),i.w),t.w)]})}var FA=Ze({id:"input-point4d",type:"input",accept:(i,t)=>{if(!Qi.isObject(i))return null;let e=Se(t,n=>Object.assign(Object.assign({},Ko(n)),{readonly:n.optional.constant(!1),w:n.optional.custom(Ki),x:n.optional.custom(Ki),y:n.optional.custom(Ki),z:n.optional.custom(Ki)}));return e?{initialValue:i,params:e}:null},binding:{reader:i=>RA,constraint:i=>LA(i.params,i.initialValue),equals:Qi.equals,writer:i=>IA},controller:i=>{let t=i.value,e=i.constraint,n=[i.params.x,i.params.y,i.params.z,i.params.w];return new ea(i.document,{assembly:R0,axes:t.rawValue.getComponents().map((s,r)=>{var o;return Ep({constraint:e.components[r],initialValue:s,params:Ps(i.params,(o=n[r])!==null&&o!==void 0?o:{})})}),parser:bi,value:t,viewProps:i.viewProps})}});function NA(i){let t=[],e=Ip(i.options);return e&&t.push(e),new Fs(t)}var DA=Ze({id:"input-string",type:"input",accept:(i,t)=>{if(typeof i!="string")return null;let e=Se(t,n=>({readonly:n.optional.constant(!1),options:n.optional.custom(sa)}));return e?{initialValue:i,params:e}:null},binding:{reader:i=>n0,constraint:i=>NA(i.params),writer:i=>ra},controller:i=>{let t=i.document,e=i.value,n=i.constraint,s=n&&Hc(n,Ns);return s?new Jn(t,{props:new Xt({options:s.values.value("options")}),value:e,viewProps:i.viewProps}):new Ds(t,{parser:r=>r,props:Xt.fromObject({formatter:Fd}),value:e,viewProps:i.viewProps})},api(i){return typeof i.controller.value.rawValue!="string"?null:i.controller.valueController instanceof Jn?new $o(i.controller):null}}),aa={monitor:{defaultInterval:200,defaultRows:3}},Fg=te("mll"),rp=class{constructor(t,e){this.onValueUpdate_=this.onValueUpdate_.bind(this),this.formatter_=e.formatter,this.element=t.createElement("div"),this.element.classList.add(Fg()),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("textarea");n.classList.add(Fg("i")),n.style.height=`calc(var(${r0("containerUnitSize")}) * ${e.rows})`,n.readOnly=!0,e.viewProps.bindDisabled(n),this.element.appendChild(n),this.textareaElem_=n,e.value.emitter.on("change",this.onValueUpdate_),this.value=e.value,this.update_()}update_(){let t=this.textareaElem_,e=t.scrollTop===t.scrollHeight-t.clientHeight,n=[];this.value.rawValue.forEach(s=>{s!==void 0&&n.push(this.formatter_(s))}),t.textContent=n.join(`
`),e&&(t.scrollTop=t.scrollHeight)}onValueUpdate_(){this.update_()}},na=class{constructor(t,e){this.value=e.value,this.viewProps=e.viewProps,this.view=new rp(t,{formatter:e.formatter,rows:e.rows,value:this.value,viewProps:this.viewProps})}},Ng=te("sgl"),op=class{constructor(t,e){this.onValueUpdate_=this.onValueUpdate_.bind(this),this.formatter_=e.formatter,this.element=t.createElement("div"),this.element.classList.add(Ng()),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("input");n.classList.add(Ng("i")),n.readOnly=!0,n.type="text",e.viewProps.bindDisabled(n),this.element.appendChild(n),this.inputElement=n,e.value.emitter.on("change",this.onValueUpdate_),this.value=e.value,this.update_()}update_(){let t=this.value.rawValue,e=t[t.length-1];this.inputElement.value=e!==void 0?this.formatter_(e):""}onValueUpdate_(){this.update_()}},ia=class{constructor(t,e){this.value=e.value,this.viewProps=e.viewProps,this.view=new op(t,{formatter:e.formatter,value:this.value,viewProps:this.viewProps})}},BA=Ze({id:"monitor-bool",type:"monitor",accept:(i,t)=>{if(typeof i!="boolean")return null;let e=Se(t,n=>({readonly:n.required.constant(!0),rows:n.optional.number}));return e?{initialValue:i,params:e}:null},binding:{reader:i=>e0},controller:i=>{var t;return i.value.rawValue.length===1?new ia(i.document,{formatter:Sg,value:i.value,viewProps:i.viewProps}):new na(i.document,{formatter:Sg,rows:(t=i.params.rows)!==null&&t!==void 0?t:aa.monitor.defaultRows,value:i.value,viewProps:i.viewProps})}}),ap=class extends Ls{get max(){return this.controller.valueController.props.get("max")}set max(t){this.controller.valueController.props.set("max",t)}get min(){return this.controller.valueController.props.get("min")}set min(t){this.controller.valueController.props.set("min",t)}},Zi=te("grl"),lp=class{constructor(t,e){this.onCursorChange_=this.onCursorChange_.bind(this),this.onValueUpdate_=this.onValueUpdate_.bind(this),this.element=t.createElement("div"),this.element.classList.add(Zi()),e.viewProps.bindClassModifiers(this.element),this.formatter_=e.formatter,this.props_=e.props,this.cursor_=e.cursor,this.cursor_.emitter.on("change",this.onCursorChange_);let n=t.createElementNS($n,"svg");n.classList.add(Zi("g")),n.style.height=`calc(var(${r0("containerUnitSize")}) * ${e.rows})`,this.element.appendChild(n),this.svgElem_=n;let s=t.createElementNS($n,"polyline");this.svgElem_.appendChild(s),this.lineElem_=s;let r=t.createElement("div");r.classList.add(Zi("t"),te("tt")()),this.element.appendChild(r),this.tooltipElem_=r,e.value.emitter.on("change",this.onValueUpdate_),this.value=e.value,this.update_()}get graphElement(){return this.svgElem_}update_(){let{clientWidth:t,clientHeight:e}=this.element,n=this.value.rawValue.length-1,s=this.props_.get("min"),r=this.props_.get("max"),o=[];this.value.rawValue.forEach((d,u)=>{if(d===void 0)return;let p=ae(u,0,n,0,t),m=ae(d,s,r,e,0);o.push([p,m].join(","))}),this.lineElem_.setAttributeNS(null,"points",o.join(" "));let a=this.tooltipElem_,l=this.value.rawValue[this.cursor_.rawValue];if(l===void 0){a.classList.remove(Zi("t","a"));return}let c=ae(this.cursor_.rawValue,0,n,0,t),h=ae(l,s,r,e,0);a.style.left=`${c}px`,a.style.top=`${h}px`,a.textContent=`${this.formatter_(l)}`,a.classList.contains(Zi("t","a"))||(a.classList.add(Zi("t","a"),Zi("t","in")),Dc(a),a.classList.remove(Zi("t","in")))}onValueUpdate_(){this.update_()}onCursorChange_(){this.update_()}},Xc=class{constructor(t,e){if(this.onGraphMouseMove_=this.onGraphMouseMove_.bind(this),this.onGraphMouseLeave_=this.onGraphMouseLeave_.bind(this),this.onGraphPointerDown_=this.onGraphPointerDown_.bind(this),this.onGraphPointerMove_=this.onGraphPointerMove_.bind(this),this.onGraphPointerUp_=this.onGraphPointerUp_.bind(this),this.props=e.props,this.value=e.value,this.viewProps=e.viewProps,this.cursor_=ye(-1),this.view=new lp(t,{cursor:this.cursor_,formatter:e.formatter,rows:e.rows,props:this.props,value:this.value,viewProps:this.viewProps}),!Ap(t))this.view.element.addEventListener("mousemove",this.onGraphMouseMove_),this.view.element.addEventListener("mouseleave",this.onGraphMouseLeave_);else{let n=new Ei(this.view.element);n.emitter.on("down",this.onGraphPointerDown_),n.emitter.on("move",this.onGraphPointerMove_),n.emitter.on("up",this.onGraphPointerUp_)}}importProps(t){return vn(t,null,e=>({max:e.required.number,min:e.required.number}),e=>(this.props.set("max",e.max),this.props.set("min",e.min),!0))}exportProps(){return _n(null,{max:this.props.get("max"),min:this.props.get("min")})}onGraphMouseLeave_(){this.cursor_.rawValue=-1}onGraphMouseMove_(t){let{clientWidth:e}=this.view.element;this.cursor_.rawValue=Math.floor(ae(t.offsetX,0,e,0,this.value.rawValue.length))}onGraphPointerDown_(t){this.onGraphPointerMove_(t)}onGraphPointerMove_(t){if(!t.data.point){this.cursor_.rawValue=-1;return}this.cursor_.rawValue=Math.floor(ae(t.data.point.x,0,t.data.bounds.width,0,this.value.rawValue.length))}onGraphPointerUp_(){this.cursor_.rawValue=-1}};function cp(i){return ge(i.format)?an(2):i.format}function UA(i){var t;return i.value.rawValue.length===1?new ia(i.document,{formatter:cp(i.params),value:i.value,viewProps:i.viewProps}):new na(i.document,{formatter:cp(i.params),rows:(t=i.params.rows)!==null&&t!==void 0?t:aa.monitor.defaultRows,value:i.value,viewProps:i.viewProps})}function OA(i){var t,e,n;return new Xc(i.document,{formatter:cp(i.params),rows:(t=i.params.rows)!==null&&t!==void 0?t:aa.monitor.defaultRows,props:Xt.fromObject({max:(e=i.params.max)!==null&&e!==void 0?e:100,min:(n=i.params.min)!==null&&n!==void 0?n:0}),value:i.value,viewProps:i.viewProps})}function Dg(i){return i.view==="graph"}var kA=Ze({id:"monitor-number",type:"monitor",accept:(i,t)=>{if(typeof i!="number")return null;let e=Se(t,n=>({format:n.optional.function,max:n.optional.number,min:n.optional.number,readonly:n.required.constant(!0),rows:n.optional.number,view:n.optional.string}));return e?{initialValue:i,params:e}:null},binding:{defaultBufferSize:i=>Dg(i)?64:1,reader:i=>zg},controller:i=>Dg(i.params)?OA(i):UA(i),api:i=>i.controller.valueController instanceof Xc?new ap(i.controller):null}),zA=Ze({id:"monitor-string",type:"monitor",accept:(i,t)=>{if(typeof i!="string")return null;let e=Se(t,n=>({multiline:n.optional.boolean,readonly:n.required.constant(!0),rows:n.optional.number}));return e?{initialValue:i,params:e}:null},binding:{reader:i=>n0},controller:i=>{var t;let e=i.value;return e.rawValue.length>1||i.params.multiline?new na(i.document,{formatter:Fd,rows:(t=i.params.rows)!==null&&t!==void 0?t:aa.monitor.defaultRows,value:e,viewProps:i.viewProps}):new ia(i.document,{formatter:Fd,value:e,viewProps:i.viewProps})}}),hp=class{constructor(){this.map_=new Map}get(t){var e;return(e=this.map_.get(t))!==null&&e!==void 0?e:null}has(t){return this.map_.has(t)}add(t,e){return this.map_.set(t,e),t.viewProps.handleDispose(()=>{this.map_.delete(t)}),e}},up=class{constructor(t){this.target=t.target,this.reader_=t.reader,this.writer_=t.writer}read(){return this.reader_(this.target.read())}write(t){this.writer_(this.target,t)}inject(t){this.write(this.reader_(t))}};function VA(i,t){var e;let n=i.accept(t.target.read(),t.params);if(ge(n))return null;let s={target:t.target,initialValue:n.initialValue,params:n.params},r=Se(t.params,d=>({disabled:d.optional.boolean,hidden:d.optional.boolean,label:d.optional.string,tag:d.optional.string})),o=i.binding.reader(s),a=i.binding.constraint?i.binding.constraint(s):void 0,l=new up({reader:o,target:t.target,writer:i.binding.writer(s)}),c=new ld(ye(o(n.initialValue),{constraint:a,equals:i.binding.equals}),l),h=i.controller({constraint:a,document:t.document,initialValue:n.initialValue,params:n.params,value:c,viewProps:Mi.create({disabled:r?.disabled,hidden:r?.hidden})});return new hd(t.document,{blade:Pr(),props:Xt.fromObject({label:"label"in t.params?(e=r?.label)!==null&&e!==void 0?e:null:t.target.key}),tag:r?.tag,value:c,valueController:h})}var dp=class{constructor(t){this.target=t.target,this.reader_=t.reader}read(){return this.reader_(this.target.read())}};function GA(i,t){return t===0?new Td:new Pd(i,t??aa.monitor.defaultInterval)}function HA(i,t){var e,n,s;let r=i.accept(t.target.read(),t.params);if(ge(r))return null;let o={target:t.target,initialValue:r.initialValue,params:r.params},a=Se(t.params,u=>({bufferSize:u.optional.number,disabled:u.optional.boolean,hidden:u.optional.boolean,interval:u.optional.number,label:u.optional.string})),l=i.binding.reader(o),c=(n=(e=a?.bufferSize)!==null&&e!==void 0?e:i.binding.defaultBufferSize&&i.binding.defaultBufferSize(r.params))!==null&&n!==void 0?n:1,h=new ud({binding:new dp({reader:l,target:t.target}),bufferSize:c,ticker:GA(t.document,a?.interval)}),d=i.controller({document:t.document,params:r.params,value:h,viewProps:Mi.create({disabled:a?.disabled,hidden:a?.hidden})});return d.viewProps.bindDisabled(h.ticker),d.viewProps.handleDispose(()=>{h.ticker.dispose()}),new dd(t.document,{blade:Pr(),props:Xt.fromObject({label:"label"in t.params?(s=a?.label)!==null&&s!==void 0?s:null:t.target.key}),value:h,valueController:d})}var pp=class{constructor(t){this.pluginsMap_={blades:[],inputs:[],monitors:[]},this.apiCache_=t}getAll(){return[...this.pluginsMap_.blades,...this.pluginsMap_.inputs,...this.pluginsMap_.monitors]}register(t,e){if(!hE(e.core))throw Ue.notCompatible(t,e.id);e.type==="blade"?this.pluginsMap_.blades.unshift(e):e.type==="input"?this.pluginsMap_.inputs.unshift(e):e.type==="monitor"&&this.pluginsMap_.monitors.unshift(e)}createInput_(t,e,n){return this.pluginsMap_.inputs.reduce((s,r)=>s??VA(r,{document:t,target:e,params:n}),null)}createMonitor_(t,e,n){return this.pluginsMap_.monitors.reduce((s,r)=>s??HA(r,{document:t,params:n,target:e}),null)}createBinding(t,e,n){let s=e.read();if(ge(s))throw new Ue({context:{key:e.key},type:"nomatchingcontroller"});let r=this.createInput_(t,e,n);if(r)return r;let o=this.createMonitor_(t,e,n);if(o)return o;throw new Ue({context:{key:e.key},type:"nomatchingcontroller"})}createBlade(t,e){let n=this.pluginsMap_.blades.reduce((s,r)=>s??sE(r,{document:t,params:e}),null);if(!n)throw new Ue({type:"nomatchingview",context:{params:e}});return n}createInputBindingApi_(t){let e=this.pluginsMap_.inputs.reduce((n,s)=>{var r,o;return n||((o=(r=s.api)===null||r===void 0?void 0:r.call(s,{controller:t}))!==null&&o!==void 0?o:null)},null);return this.apiCache_.add(t,e??new Ls(t))}createMonitorBindingApi_(t){let e=this.pluginsMap_.monitors.reduce((n,s)=>{var r,o;return n||((o=(r=s.api)===null||r===void 0?void 0:r.call(s,{controller:t}))!==null&&o!==void 0?o:null)},null);return this.apiCache_.add(t,e??new Ls(t))}createBindingApi(t){if(this.apiCache_.has(t))return this.apiCache_.get(t);if(z1(t))return this.createInputBindingApi_(t);if(q1(t))return this.createMonitorBindingApi_(t);throw Ue.shouldNeverHappen()}createApi(t){if(this.apiCache_.has(t))return this.apiCache_.get(t);if(k1(t))return this.createBindingApi(t);let e=this.pluginsMap_.blades.reduce((n,s)=>n??s.api({controller:t,pool:this}),null);if(!e)throw Ue.shouldNeverHappen();return this.apiCache_.add(t,e)}},WA=new hp;function qA(){let i=new pp(WA);return[EA,PA,FA,DA,xA,gA,mA,hA,dE,BA,zA,kA,Y1,nE,t0].forEach(t=>{i.register("core",t)}),i}var fp=class extends yi{constructor(t){super(t),this.emitter_=new Ce,this.controller.value.emitter.on("change",e=>{this.emitter_.emit("change",new Is(this,e.rawValue))})}get label(){return this.controller.labelController.props.get("label")}set label(t){this.controller.labelController.props.set("label",t)}get options(){return this.controller.valueController.props.get("options")}set options(t){this.controller.valueController.props.set("options",t)}get value(){return this.controller.value.rawValue}set value(t){this.controller.value.rawValue=t}on(t,e){let n=e.bind(this);return this.emitter_.on(t,s=>{n(s)},{key:e}),this}off(t,e){return this.emitter_.off(t,e),this}},mp=class extends yi{},gp=class extends yi{constructor(t){super(t),this.emitter_=new Ce,this.controller.value.emitter.on("change",e=>{this.emitter_.emit("change",new Is(this,e.rawValue))})}get label(){return this.controller.labelController.props.get("label")}set label(t){this.controller.labelController.props.set("label",t)}get max(){return this.controller.valueController.sliderController.props.get("max")}set max(t){this.controller.valueController.sliderController.props.set("max",t)}get min(){return this.controller.valueController.sliderController.props.get("min")}set min(t){this.controller.valueController.sliderController.props.set("min",t)}get value(){return this.controller.value.rawValue}set value(t){this.controller.value.rawValue=t}on(t,e){let n=e.bind(this);return this.emitter_.on(t,s=>{n(s)},{key:e}),this}off(t,e){return this.emitter_.off(t,e),this}},vp=class extends yi{constructor(t){super(t),this.emitter_=new Ce,this.controller.value.emitter.on("change",e=>{this.emitter_.emit("change",new Is(this,e.rawValue))})}get label(){return this.controller.labelController.props.get("label")}set label(t){this.controller.labelController.props.set("label",t)}get formatter(){return this.controller.valueController.props.get("formatter")}set formatter(t){this.controller.valueController.props.set("formatter",t)}get value(){return this.controller.value.rawValue}set value(t){this.controller.value.rawValue=t}on(t,e){let n=e.bind(this);return this.emitter_.on(t,s=>{n(s)},{key:e}),this}off(t,e){return this.emitter_.off(t,e),this}},XA=(function(){return{id:"list",type:"blade",core:Tr,accept(i){let t=Se(i,e=>({options:e.required.custom(sa),value:e.required.raw,view:e.required.constant("list"),label:e.optional.string}));return t?{params:t}:null},controller(i){let t=new Ns(Rp(i.params.options)),e=ye(i.params.value,{constraint:t}),n=new Jn(i.document,{props:new Xt({options:t.values.value("options")}),value:e,viewProps:i.viewProps});return new wi(i.document,{blade:i.blade,props:Xt.fromObject({label:i.params.label}),value:e,valueController:n})},api(i){return!(i.controller instanceof wi)||!(i.controller.valueController instanceof Jn)?null:new fp(i.controller)}}})(),_p=class extends Vc{constructor(t,e){super(t,e)}get element(){return this.controller.view.element}},xp=class extends Yo{constructor(t,e){super(t,{expanded:e.expanded,blade:e.blade,props:e.props,root:!0,viewProps:e.viewProps})}},Bg=te("spr"),bp=class{constructor(t,e){this.element=t.createElement("div"),this.element.classList.add(Bg()),e.viewProps.bindClassModifiers(this.element);let n=t.createElement("hr");n.classList.add(Bg("r")),this.element.appendChild(n)}},Yc=class extends Sr{constructor(t,e){super(Object.assign(Object.assign({},e),{view:new bp(t,{viewProps:e.viewProps})}))}},YA={id:"separator",type:"blade",core:Tr,accept(i){let t=Se(i,e=>({view:e.required.constant("separator")}));return t?{params:t}:null},controller(i){return new Yc(i.document,{blade:i.blade,viewProps:i.viewProps})},api(i){return i.controller instanceof Yc?new mp(i.controller):null}},jA={id:"slider",type:"blade",core:Tr,accept(i){let t=Se(i,e=>({max:e.required.number,min:e.required.number,view:e.required.constant("slider"),format:e.optional.function,label:e.optional.string,value:e.optional.number}));return t?{params:t}:null},controller(i){var t,e;let n=(t=i.params.value)!==null&&t!==void 0?t:0,s=new Rs({max:i.params.max,min:i.params.min}),r=ye(n,{constraint:s}),o=new Er(i.document,Object.assign(Object.assign({},s0({formatter:(e=i.params.format)!==null&&e!==void 0?e:S1,keyScale:ye(1),max:s.values.value("max"),min:s.values.value("min"),pointerScale:Hg(i.params,n)})),{parser:bi,value:r,viewProps:i.viewProps}));return new wi(i.document,{blade:i.blade,props:Xt.fromObject({label:i.params.label}),value:r,valueController:o})},api(i){return!(i.controller instanceof wi)||!(i.controller.valueController instanceof Er)?null:new gp(i.controller)}},$A=(function(){return{id:"text",type:"blade",core:Tr,accept(i){let t=Se(i,e=>({parse:e.required.function,value:e.required.raw,view:e.required.constant("text"),format:e.optional.function,label:e.optional.string}));return t?{params:t}:null},controller(i){var t;let e=ye(i.params.value),n=new Ds(i.document,{parser:i.params.parse,props:Xt.fromObject({formatter:(t=i.params.format)!==null&&t!==void 0?t:(s=>String(s))}),value:e,viewProps:i.viewProps});return new wi(i.document,{blade:i.blade,props:Xt.fromObject({label:i.params.label}),value:e,valueController:n})},api(i){return!(i.controller instanceof wi)||!(i.controller.valueController instanceof Ds)?null:new vp(i.controller)}}})();function ZA(i){let t=i.createElement("div");return t.classList.add(te("dfw")()),i.body&&i.body.appendChild(t),t}function KA(i,t,e){if(i.querySelector(`style[data-tp-style=${t}]`))return;let n=i.createElement("style");n.dataset.tpStyle=t,n.textContent=e,i.head.appendChild(n)}var jc=class extends _p{constructor(t){var e,n;let s=t??{},r=(e=s.document)!==null&&e!==void 0?e:L1(),o=qA(),a=new xp(r,{expanded:s.expanded,blade:Pr(),props:Xt.fromObject({title:s.title}),viewProps:Mi.create()});super(a,o),this.pool_=o,this.containerElem_=(n=s.container)!==null&&n!==void 0?n:ZA(r),this.containerElem_.appendChild(this.element),this.doc_=r,this.usesDefaultWrapper_=!s.container,this.setUpDefaultPlugins_()}get document(){if(!this.doc_)throw Ue.alreadyDisposed();return this.doc_}dispose(){let t=this.containerElem_;if(!t)throw Ue.alreadyDisposed();if(this.usesDefaultWrapper_){let e=t.parentElement;e&&e.removeChild(t)}this.containerElem_=null,this.doc_=null,super.dispose()}registerPlugin(t){t.css&&KA(this.document,`plugin-${t.id}`,t.css),("plugin"in t?[t.plugin]:"plugins"in t?t.plugins:[]).forEach(n=>{this.pool_.register(t.id,n)})}setUpDefaultPlugins_(){this.registerPlugin({id:"default",css:'.tp-tbiv_b,.tp-coltxtv_ms,.tp-colswv_b,.tp-ckbv_i,.tp-sglv_i,.tp-mllv_i,.tp-grlv_g,.tp-txtv_i,.tp-p2dpv_p,.tp-colswv_sw,.tp-rotv_b,.tp-fldv_b,.tp-p2dv_b,.tp-btnv_b,.tp-lstv_s{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:rgba(0,0,0,0);border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-p2dv_b,.tp-btnv_b,.tp-lstv_s{background-color:var(--btn-bg);border-radius:var(--bld-br);color:var(--btn-fg);cursor:pointer;display:block;font-weight:bold;height:var(--cnt-usz);line-height:var(--cnt-usz);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-p2dv_b:hover,.tp-btnv_b:hover,.tp-lstv_s:hover{background-color:var(--btn-bg-h)}.tp-p2dv_b:focus,.tp-btnv_b:focus,.tp-lstv_s:focus{background-color:var(--btn-bg-f)}.tp-p2dv_b:active,.tp-btnv_b:active,.tp-lstv_s:active{background-color:var(--btn-bg-a)}.tp-p2dv_b:disabled,.tp-btnv_b:disabled,.tp-lstv_s:disabled{opacity:.5}.tp-rotv_c>.tp-cntv.tp-v-lst,.tp-tbpv_c>.tp-cntv.tp-v-lst,.tp-fldv_c>.tp-cntv.tp-v-lst{margin-bottom:calc(-1*var(--cnt-vp))}.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-tbpv_c>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_c{border-bottom-left-radius:0}.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-tbpv_c>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_b{border-bottom-left-radius:0}.tp-rotv_c>*:not(.tp-v-fst),.tp-tbpv_c>*:not(.tp-v-fst),.tp-fldv_c>*:not(.tp-v-fst){margin-top:var(--cnt-usp)}.tp-rotv_c>.tp-sprv:not(.tp-v-fst),.tp-tbpv_c>.tp-sprv:not(.tp-v-fst),.tp-fldv_c>.tp-sprv:not(.tp-v-fst),.tp-rotv_c>.tp-cntv:not(.tp-v-fst),.tp-tbpv_c>.tp-cntv:not(.tp-v-fst),.tp-fldv_c>.tp-cntv:not(.tp-v-fst){margin-top:var(--cnt-vp)}.tp-rotv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-tbpv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-fldv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-rotv_c>.tp-cntv+*:not(.tp-v-hidden),.tp-tbpv_c>.tp-cntv+*:not(.tp-v-hidden),.tp-fldv_c>.tp-cntv+*:not(.tp-v-hidden){margin-top:var(--cnt-vp)}.tp-rotv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-tbpv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-fldv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-rotv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-tbpv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-fldv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv{margin-top:0}.tp-tbpv_c>.tp-cntv,.tp-fldv_c>.tp-cntv{margin-left:4px}.tp-tbpv_c>.tp-fldv>.tp-fldv_b,.tp-fldv_c>.tp-fldv>.tp-fldv_b{border-top-left-radius:var(--bld-br);border-bottom-left-radius:var(--bld-br)}.tp-tbpv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_b,.tp-fldv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_b{border-bottom-left-radius:0}.tp-tbpv_c .tp-fldv>.tp-fldv_c,.tp-fldv_c .tp-fldv>.tp-fldv_c{border-bottom-left-radius:var(--bld-br)}.tp-tbpv_c>.tp-cntv+.tp-fldv>.tp-fldv_b,.tp-fldv_c>.tp-cntv+.tp-fldv>.tp-fldv_b{border-top-left-radius:0}.tp-tbpv_c>.tp-cntv+.tp-tabv>.tp-tabv_t,.tp-fldv_c>.tp-cntv+.tp-tabv>.tp-tabv_t{border-top-left-radius:0}.tp-tbpv_c>.tp-tabv>.tp-tabv_t,.tp-fldv_c>.tp-tabv>.tp-tabv_t{border-top-left-radius:var(--bld-br)}.tp-tbpv_c .tp-tabv>.tp-tabv_c,.tp-fldv_c .tp-tabv>.tp-tabv_c{border-bottom-left-radius:var(--bld-br)}.tp-rotv_b,.tp-fldv_b{background-color:var(--cnt-bg);color:var(--cnt-fg);cursor:pointer;display:block;height:calc(var(--cnt-usz) + 4px);line-height:calc(var(--cnt-usz) + 4px);overflow:hidden;padding-left:var(--cnt-hp);padding-right:calc(4px + var(--cnt-usz) + var(--cnt-hp));position:relative;text-align:left;text-overflow:ellipsis;white-space:nowrap;width:100%;transition:border-radius .2s ease-in-out .2s}.tp-rotv_b:hover,.tp-fldv_b:hover{background-color:var(--cnt-bg-h)}.tp-rotv_b:focus,.tp-fldv_b:focus{background-color:var(--cnt-bg-f)}.tp-rotv_b:active,.tp-fldv_b:active{background-color:var(--cnt-bg-a)}.tp-rotv_b:disabled,.tp-fldv_b:disabled{opacity:.5}.tp-rotv_m,.tp-fldv_m{background:linear-gradient(to left, var(--cnt-fg), var(--cnt-fg) 2px, transparent 2px, transparent 4px, var(--cnt-fg) 4px);border-radius:2px;bottom:0;content:"";display:block;height:6px;right:calc(var(--cnt-hp) + (var(--cnt-usz) + 4px - 6px)/2 - 2px);margin:auto;opacity:.5;position:absolute;top:0;transform:rotate(90deg);transition:transform .2s ease-in-out;width:6px}.tp-rotv.tp-rotv-expanded .tp-rotv_m,.tp-fldv.tp-fldv-expanded>.tp-fldv_b>.tp-fldv_m{transform:none}.tp-rotv_c,.tp-fldv_c{box-sizing:border-box;height:0;opacity:0;overflow:hidden;padding-bottom:0;padding-top:0;position:relative;transition:height .2s ease-in-out,opacity .2s linear,padding .2s ease-in-out}.tp-rotv.tp-rotv-cpl:not(.tp-rotv-expanded) .tp-rotv_c,.tp-fldv.tp-fldv-cpl:not(.tp-fldv-expanded)>.tp-fldv_c{display:none}.tp-rotv.tp-rotv-expanded .tp-rotv_c,.tp-fldv.tp-fldv-expanded>.tp-fldv_c{opacity:1;padding-bottom:var(--cnt-vp);padding-top:var(--cnt-vp);transform:none;overflow:visible;transition:height .2s ease-in-out,opacity .2s linear .2s,padding .2s ease-in-out}.tp-txtv_i,.tp-p2dpv_p,.tp-colswv_sw{background-color:var(--in-bg);border-radius:var(--bld-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--cnt-usz);line-height:var(--cnt-usz);min-width:0;width:100%}.tp-txtv_i:hover,.tp-p2dpv_p:hover,.tp-colswv_sw:hover{background-color:var(--in-bg-h)}.tp-txtv_i:focus,.tp-p2dpv_p:focus,.tp-colswv_sw:focus{background-color:var(--in-bg-f)}.tp-txtv_i:active,.tp-p2dpv_p:active,.tp-colswv_sw:active{background-color:var(--in-bg-a)}.tp-txtv_i:disabled,.tp-p2dpv_p:disabled,.tp-colswv_sw:disabled{opacity:.5}.tp-lstv,.tp-coltxtv_m{position:relative}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-lstv_m,.tp-coltxtv_mm{bottom:0;margin:auto;pointer-events:none;position:absolute;right:2px;top:0}.tp-lstv_m svg,.tp-coltxtv_mm svg{bottom:0;height:16px;margin:auto;position:absolute;right:0;top:0;width:16px}.tp-lstv_m svg path,.tp-coltxtv_mm svg path{fill:currentColor}.tp-sglv_i,.tp-mllv_i,.tp-grlv_g{background-color:var(--mo-bg);border-radius:var(--bld-br);box-sizing:border-box;color:var(--mo-fg);height:var(--cnt-usz);scrollbar-color:currentColor rgba(0,0,0,0);scrollbar-width:thin;width:100%}.tp-sglv_i::-webkit-scrollbar,.tp-mllv_i::-webkit-scrollbar,.tp-grlv_g::-webkit-scrollbar{height:8px;width:8px}.tp-sglv_i::-webkit-scrollbar-corner,.tp-mllv_i::-webkit-scrollbar-corner,.tp-grlv_g::-webkit-scrollbar-corner{background-color:rgba(0,0,0,0)}.tp-sglv_i::-webkit-scrollbar-thumb,.tp-mllv_i::-webkit-scrollbar-thumb,.tp-grlv_g::-webkit-scrollbar-thumb{background-clip:padding-box;background-color:currentColor;border:rgba(0,0,0,0) solid 2px;border-radius:4px}.tp-pndtxtv,.tp-coltxtv_w{display:flex}.tp-pndtxtv_a,.tp-coltxtv_c{width:100%}.tp-pndtxtv_a+.tp-pndtxtv_a,.tp-coltxtv_c+.tp-pndtxtv_a,.tp-pndtxtv_a+.tp-coltxtv_c,.tp-coltxtv_c+.tp-coltxtv_c{margin-left:2px}.tp-rotv{--bs-bg: var(--tp-base-background-color, hsl(230, 7%, 17%));--bs-br: var(--tp-base-border-radius, 6px);--bs-ff: var(--tp-base-font-family, Roboto Mono, Source Code Pro, Menlo, Courier, monospace);--bs-sh: var(--tp-base-shadow-color, rgba(0, 0, 0, 0.2));--bld-br: var(--tp-blade-border-radius, 2px);--bld-hp: var(--tp-blade-horizontal-padding, 4px);--bld-vw: var(--tp-blade-value-width, 160px);--btn-bg: var(--tp-button-background-color, hsl(230, 7%, 70%));--btn-bg-a: var(--tp-button-background-color-active, #d6d7db);--btn-bg-f: var(--tp-button-background-color-focus, #c8cad0);--btn-bg-h: var(--tp-button-background-color-hover, #bbbcc4);--btn-fg: var(--tp-button-foreground-color, hsl(230, 7%, 17%));--cnt-bg: var(--tp-container-background-color, rgba(187, 188, 196, 0.1));--cnt-bg-a: var(--tp-container-background-color-active, rgba(187, 188, 196, 0.25));--cnt-bg-f: var(--tp-container-background-color-focus, rgba(187, 188, 196, 0.2));--cnt-bg-h: var(--tp-container-background-color-hover, rgba(187, 188, 196, 0.15));--cnt-fg: var(--tp-container-foreground-color, hsl(230, 7%, 75%));--cnt-hp: var(--tp-container-horizontal-padding, 4px);--cnt-vp: var(--tp-container-vertical-padding, 4px);--cnt-usp: var(--tp-container-unit-spacing, 4px);--cnt-usz: var(--tp-container-unit-size, 20px);--in-bg: var(--tp-input-background-color, rgba(187, 188, 196, 0.1));--in-bg-a: var(--tp-input-background-color-active, rgba(187, 188, 196, 0.25));--in-bg-f: var(--tp-input-background-color-focus, rgba(187, 188, 196, 0.2));--in-bg-h: var(--tp-input-background-color-hover, rgba(187, 188, 196, 0.15));--in-fg: var(--tp-input-foreground-color, hsl(230, 7%, 75%));--lbl-fg: var(--tp-label-foreground-color, rgba(187, 188, 196, 0.7));--mo-bg: var(--tp-monitor-background-color, rgba(0, 0, 0, 0.2));--mo-fg: var(--tp-monitor-foreground-color, rgba(187, 188, 196, 0.7));--grv-fg: var(--tp-groove-foreground-color, rgba(187, 188, 196, 0.1))}.tp-btnv_b{width:100%}.tp-btnv_t{text-align:center}.tp-ckbv_l{display:block;position:relative}.tp-ckbv_i{left:0;opacity:0;position:absolute;top:0}.tp-ckbv_w{background-color:var(--in-bg);border-radius:var(--bld-br);cursor:pointer;display:block;height:var(--cnt-usz);position:relative;width:var(--cnt-usz)}.tp-ckbv_w svg{display:block;height:16px;inset:0;margin:auto;opacity:0;position:absolute;width:16px}.tp-ckbv_w svg path{fill:none;stroke:var(--in-fg);stroke-width:2}.tp-ckbv_i:hover+.tp-ckbv_w{background-color:var(--in-bg-h)}.tp-ckbv_i:focus+.tp-ckbv_w{background-color:var(--in-bg-f)}.tp-ckbv_i:active+.tp-ckbv_w{background-color:var(--in-bg-a)}.tp-ckbv_i:checked+.tp-ckbv_w svg{opacity:1}.tp-ckbv.tp-v-disabled .tp-ckbv_w{opacity:.5}.tp-colv{position:relative}.tp-colv_h{display:flex}.tp-colv_s{flex-grow:0;flex-shrink:0;width:var(--cnt-usz)}.tp-colv_t{flex:1;margin-left:4px}.tp-colv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-colv.tp-colv-expanded.tp-colv-cpl .tp-colv_p{overflow:visible}.tp-colv.tp-colv-expanded .tp-colv_p{margin-top:var(--cnt-usp);opacity:1}.tp-colv .tp-popv{left:calc(-1*var(--cnt-hp));right:calc(-1*var(--cnt-hp));top:var(--cnt-usz)}.tp-colpv_h,.tp-colpv_ap{margin-left:6px;margin-right:6px}.tp-colpv_h{margin-top:var(--cnt-usp)}.tp-colpv_rgb{display:flex;margin-top:var(--cnt-usp);width:100%}.tp-colpv_a{display:flex;margin-top:var(--cnt-vp);padding-top:calc(var(--cnt-vp) + 2px);position:relative}.tp-colpv_a::before{background-color:var(--grv-fg);content:"";height:2px;left:calc(-1*var(--cnt-hp));position:absolute;right:calc(-1*var(--cnt-hp));top:0}.tp-colpv.tp-v-disabled .tp-colpv_a::before{opacity:.5}.tp-colpv_ap{align-items:center;display:flex;flex:3}.tp-colpv_at{flex:1;margin-left:4px}.tp-svpv{border-radius:var(--bld-br);outline:none;overflow:hidden;position:relative}.tp-svpv.tp-v-disabled{opacity:.5}.tp-svpv_c{cursor:crosshair;display:block;height:calc(var(--cnt-usz)*4);width:100%}.tp-svpv_m{border-radius:100%;border:rgba(255,255,255,.75) solid 2px;box-sizing:border-box;filter:drop-shadow(0 0 1px rgba(0, 0, 0, 0.3));height:12px;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;width:12px}.tp-svpv:focus .tp-svpv_m{border-color:#fff}.tp-hplv{cursor:pointer;height:var(--cnt-usz);outline:none;position:relative}.tp-hplv.tp-v-disabled{opacity:.5}.tp-hplv_c{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAABCAYAAABubagXAAAAQ0lEQVQoU2P8z8Dwn0GCgQEDi2OK/RBgYHjBgIpfovFh8j8YBIgzFGQxuqEgPhaDOT5gOhPkdCxOZeBg+IDFZZiGAgCaSSMYtcRHLgAAAABJRU5ErkJggg==);background-position:left top;background-repeat:no-repeat;background-size:100% 100%;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;position:absolute;top:50%;width:100%}.tp-hplv_m{border-radius:var(--bld-br);border:rgba(255,255,255,.75) solid 2px;box-shadow:0 0 2px rgba(0,0,0,.1);box-sizing:border-box;height:12px;left:50%;margin-left:-6px;margin-top:-6px;position:absolute;top:50%;width:12px}.tp-hplv:focus .tp-hplv_m{border-color:#fff}.tp-aplv{cursor:pointer;height:var(--cnt-usz);outline:none;position:relative;width:100%}.tp-aplv.tp-v-disabled{opacity:.5}.tp-aplv_b{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:4px 4px;background-position:0 0,2px 2px;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;overflow:hidden;position:absolute;top:50%;width:100%}.tp-aplv_c{inset:0;position:absolute}.tp-aplv_m{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:12px 12px;background-position:0 0,6px 6px;border-radius:var(--bld-br);box-shadow:0 0 2px rgba(0,0,0,.1);height:12px;left:50%;margin-left:-6px;margin-top:-6px;overflow:hidden;position:absolute;top:50%;width:12px}.tp-aplv_p{border-radius:var(--bld-br);border:rgba(255,255,255,.75) solid 2px;box-sizing:border-box;inset:0;position:absolute}.tp-aplv:focus .tp-aplv_p{border-color:#fff}.tp-colswv{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:10px 10px;background-position:0 0,5px 5px;border-radius:var(--bld-br);overflow:hidden}.tp-colswv.tp-v-disabled{opacity:.5}.tp-colswv_sw{border-radius:0}.tp-colswv_b{cursor:pointer;display:block;height:var(--cnt-usz);left:0;position:absolute;top:0;width:var(--cnt-usz)}.tp-colswv_b:focus::after{border:rgba(255,255,255,.75) solid 2px;border-radius:var(--bld-br);content:"";display:block;inset:0;position:absolute}.tp-coltxtv{display:flex;width:100%}.tp-coltxtv_m{margin-right:4px}.tp-coltxtv_ms{border-radius:var(--bld-br);color:var(--lbl-fg);cursor:pointer;height:var(--cnt-usz);line-height:var(--cnt-usz);padding:0 18px 0 4px}.tp-coltxtv_ms:hover{background-color:var(--in-bg-h)}.tp-coltxtv_ms:focus{background-color:var(--in-bg-f)}.tp-coltxtv_ms:active{background-color:var(--in-bg-a)}.tp-coltxtv_mm{color:var(--lbl-fg)}.tp-coltxtv.tp-v-disabled .tp-coltxtv_mm{opacity:.5}.tp-coltxtv_w{flex:1}.tp-dfwv{position:absolute;top:8px;right:8px;width:256px}.tp-fldv{position:relative}.tp-fldv_t{padding-left:4px}.tp-fldv_b:disabled .tp-fldv_m{display:none}.tp-fldv_c{padding-left:4px}.tp-fldv_i{bottom:0;color:var(--cnt-bg);left:0;overflow:hidden;position:absolute;top:calc(var(--cnt-usz) + 4px);width:max(var(--bs-br),4px)}.tp-fldv_i::before{background-color:currentColor;bottom:0;content:"";left:0;position:absolute;top:0;width:4px}.tp-fldv_b:hover+.tp-fldv_i{color:var(--cnt-bg-h)}.tp-fldv_b:focus+.tp-fldv_i{color:var(--cnt-bg-f)}.tp-fldv_b:active+.tp-fldv_i{color:var(--cnt-bg-a)}.tp-fldv.tp-v-disabled>.tp-fldv_i{opacity:.5}.tp-grlv{position:relative}.tp-grlv_g{display:block;height:calc(var(--cnt-usz)*3)}.tp-grlv_g polyline{fill:none;stroke:var(--mo-fg);stroke-linejoin:round}.tp-grlv_t{margin-top:-4px;transition:left .05s,top .05s;visibility:hidden}.tp-grlv_t.tp-grlv_t-a{visibility:visible}.tp-grlv_t.tp-grlv_t-in{transition:none}.tp-grlv.tp-v-disabled .tp-grlv_g{opacity:.5}.tp-grlv .tp-ttv{background-color:var(--mo-fg)}.tp-grlv .tp-ttv::before{border-top-color:var(--mo-fg)}.tp-lblv{align-items:center;display:flex;line-height:1.3;padding-left:var(--cnt-hp);padding-right:var(--cnt-hp)}.tp-lblv.tp-lblv-nol{display:block}.tp-lblv_l{color:var(--lbl-fg);flex:1;-webkit-hyphens:auto;hyphens:auto;overflow:hidden;padding-left:4px;padding-right:16px}.tp-lblv.tp-v-disabled .tp-lblv_l{opacity:.5}.tp-lblv.tp-lblv-nol .tp-lblv_l{display:none}.tp-lblv_v{align-self:flex-start;flex-grow:0;flex-shrink:0;width:var(--bld-vw)}.tp-lblv.tp-lblv-nol .tp-lblv_v{width:100%}.tp-lstv_s{padding:0 20px 0 var(--bld-hp);width:100%}.tp-lstv_m{color:var(--btn-fg)}.tp-sglv_i{padding-left:var(--bld-hp);padding-right:var(--bld-hp)}.tp-sglv.tp-v-disabled .tp-sglv_i{opacity:.5}.tp-mllv_i{display:block;height:calc(var(--cnt-usz)*3);line-height:var(--cnt-usz);padding-left:var(--bld-hp);padding-right:var(--bld-hp);resize:none;white-space:pre}.tp-mllv.tp-v-disabled .tp-mllv_i{opacity:.5}.tp-p2dv{position:relative}.tp-p2dv_h{display:flex}.tp-p2dv_b{height:var(--cnt-usz);margin-right:4px;position:relative;width:var(--cnt-usz)}.tp-p2dv_b svg{display:block;height:16px;left:50%;margin-left:-8px;margin-top:-8px;position:absolute;top:50%;width:16px}.tp-p2dv_b svg path{stroke:currentColor;stroke-width:2}.tp-p2dv_b svg circle{fill:currentColor}.tp-p2dv_t{flex:1}.tp-p2dv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-p2dv.tp-p2dv-expanded .tp-p2dv_p{margin-top:var(--cnt-usp);opacity:1}.tp-p2dv .tp-popv{left:calc(-1*var(--cnt-hp));right:calc(-1*var(--cnt-hp));top:var(--cnt-usz)}.tp-p2dpv{padding-left:calc(var(--cnt-usz) + 4px)}.tp-p2dpv_p{cursor:crosshair;height:0;overflow:hidden;padding-bottom:100%;position:relative}.tp-p2dpv.tp-v-disabled .tp-p2dpv_p{opacity:.5}.tp-p2dpv_g{display:block;height:100%;left:0;pointer-events:none;position:absolute;top:0;width:100%}.tp-p2dpv_ax{opacity:.1;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_l{opacity:.5;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_m{border:var(--in-fg) solid 1px;border-radius:50%;box-sizing:border-box;height:4px;margin-left:-2px;margin-top:-2px;position:absolute;width:4px}.tp-p2dpv_p:focus .tp-p2dpv_m{background-color:var(--in-fg);border-width:0}.tp-popv{background-color:var(--bs-bg);border-radius:var(--bs-br);box-shadow:0 2px 4px var(--bs-sh);display:none;max-width:var(--bld-vw);padding:var(--cnt-vp) var(--cnt-hp);position:absolute;visibility:hidden;z-index:1000}.tp-popv.tp-popv-v{display:block;visibility:visible}.tp-sldv.tp-v-disabled{opacity:.5}.tp-sldv_t{box-sizing:border-box;cursor:pointer;height:var(--cnt-usz);margin:0 6px;outline:none;position:relative}.tp-sldv_t::before{background-color:var(--in-bg);border-radius:1px;content:"";display:block;height:2px;inset:0;margin:auto;position:absolute}.tp-sldv_k{height:100%;left:0;position:absolute;top:0}.tp-sldv_k::before{background-color:var(--in-fg);border-radius:1px;content:"";display:block;height:2px;inset:0;margin-bottom:auto;margin-top:auto;position:absolute}.tp-sldv_k::after{background-color:var(--btn-bg);border-radius:var(--bld-br);bottom:0;content:"";display:block;height:12px;margin-bottom:auto;margin-top:auto;position:absolute;right:-6px;top:0;width:12px}.tp-sldv_t:hover .tp-sldv_k::after{background-color:var(--btn-bg-h)}.tp-sldv_t:focus .tp-sldv_k::after{background-color:var(--btn-bg-f)}.tp-sldv_t:active .tp-sldv_k::after{background-color:var(--btn-bg-a)}.tp-sldtxtv{display:flex}.tp-sldtxtv_s{flex:2}.tp-sldtxtv_t{flex:1;margin-left:4px}.tp-tabv{position:relative}.tp-tabv_t{align-items:flex-end;color:var(--cnt-bg);display:flex;overflow:hidden;position:relative}.tp-tabv_t:hover{color:var(--cnt-bg-h)}.tp-tabv_t:has(*:focus){color:var(--cnt-bg-f)}.tp-tabv_t:has(*:active){color:var(--cnt-bg-a)}.tp-tabv_t::before{background-color:currentColor;bottom:0;content:"";height:2px;left:0;pointer-events:none;position:absolute;right:0}.tp-tabv.tp-v-disabled .tp-tabv_t::before{opacity:.5}.tp-tabv.tp-tabv-nop .tp-tabv_t{height:calc(var(--cnt-usz) + 4px);position:relative}.tp-tabv.tp-tabv-nop .tp-tabv_t::before{background-color:var(--cnt-bg);bottom:0;content:"";height:2px;left:0;position:absolute;right:0}.tp-tabv_i{bottom:0;color:var(--cnt-bg);left:0;overflow:hidden;position:absolute;top:calc(var(--cnt-usz) + 4px);width:max(var(--bs-br),4px)}.tp-tabv_i::before{background-color:currentColor;bottom:0;content:"";left:0;position:absolute;top:0;width:4px}.tp-tabv_t:hover+.tp-tabv_i{color:var(--cnt-bg-h)}.tp-tabv_t:has(*:focus)+.tp-tabv_i{color:var(--cnt-bg-f)}.tp-tabv_t:has(*:active)+.tp-tabv_i{color:var(--cnt-bg-a)}.tp-tabv.tp-v-disabled>.tp-tabv_i{opacity:.5}.tp-tbiv{flex:1;min-width:0;position:relative}.tp-tbiv+.tp-tbiv{margin-left:2px}.tp-tbiv+.tp-tbiv.tp-v-disabled::before{opacity:.5}.tp-tbiv_b{display:block;padding-left:calc(var(--cnt-hp) + 4px);padding-right:calc(var(--cnt-hp) + 4px);position:relative;width:100%}.tp-tbiv_b:disabled{opacity:.5}.tp-tbiv_b::before{background-color:var(--cnt-bg);content:"";inset:0 0 2px;pointer-events:none;position:absolute}.tp-tbiv_b:hover::before{background-color:var(--cnt-bg-h)}.tp-tbiv_b:focus::before{background-color:var(--cnt-bg-f)}.tp-tbiv_b:active::before{background-color:var(--cnt-bg-a)}.tp-tbiv_t{color:var(--cnt-fg);height:calc(var(--cnt-usz) + 4px);line-height:calc(var(--cnt-usz) + 4px);opacity:.5;overflow:hidden;position:relative;text-overflow:ellipsis}.tp-tbiv.tp-tbiv-sel .tp-tbiv_t{opacity:1}.tp-tbpv_c{padding-bottom:var(--cnt-vp);padding-left:4px;padding-top:var(--cnt-vp)}.tp-txtv{position:relative}.tp-txtv_i{padding-left:var(--bld-hp);padding-right:var(--bld-hp)}.tp-txtv.tp-txtv-fst .tp-txtv_i{border-bottom-right-radius:0;border-top-right-radius:0}.tp-txtv.tp-txtv-mid .tp-txtv_i{border-radius:0}.tp-txtv.tp-txtv-lst .tp-txtv_i{border-bottom-left-radius:0;border-top-left-radius:0}.tp-txtv.tp-txtv-num .tp-txtv_i{text-align:right}.tp-txtv.tp-txtv-drg .tp-txtv_i{opacity:.3}.tp-txtv_k{cursor:pointer;height:100%;left:calc(var(--bld-hp) - 5px);position:absolute;top:0;width:12px}.tp-txtv_k::before{background-color:var(--in-fg);border-radius:1px;bottom:0;content:"";height:calc(var(--cnt-usz) - 4px);left:50%;margin-bottom:auto;margin-left:-1px;margin-top:auto;opacity:.1;position:absolute;top:0;transition:border-radius .1s,height .1s,transform .1s,width .1s;width:2px}.tp-txtv_k:hover::before,.tp-txtv.tp-txtv-drg .tp-txtv_k::before{opacity:1}.tp-txtv.tp-txtv-drg .tp-txtv_k::before{border-radius:50%;height:4px;transform:translateX(-1px);width:4px}.tp-txtv_g{bottom:0;display:block;height:8px;left:50%;margin:auto;overflow:visible;pointer-events:none;position:absolute;top:0;visibility:hidden;width:100%}.tp-txtv.tp-txtv-drg .tp-txtv_g{visibility:visible}.tp-txtv_gb{fill:none;stroke:var(--in-fg);stroke-dasharray:1}.tp-txtv_gh{fill:none;stroke:var(--in-fg)}.tp-txtv .tp-ttv{margin-left:6px;visibility:hidden}.tp-txtv.tp-txtv-drg .tp-ttv{visibility:visible}.tp-ttv{background-color:var(--in-fg);border-radius:var(--bld-br);color:var(--bs-bg);padding:2px 4px;pointer-events:none;position:absolute;transform:translate(-50%, -100%)}.tp-ttv::before{border-color:var(--in-fg) rgba(0,0,0,0) rgba(0,0,0,0) rgba(0,0,0,0);border-style:solid;border-width:2px;box-sizing:border-box;content:"";font-size:.9em;height:4px;left:50%;margin-left:-2px;position:absolute;top:100%;width:4px}.tp-rotv{background-color:var(--bs-bg);border-radius:var(--bs-br);box-shadow:0 2px 4px var(--bs-sh);font-family:var(--bs-ff);font-size:11px;font-weight:500;line-height:1;text-align:left}.tp-rotv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br);border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br);padding-left:calc(4px + var(--cnt-usz) + var(--cnt-hp));text-align:center}.tp-rotv.tp-rotv-expanded .tp-rotv_b{border-bottom-left-radius:0;border-bottom-right-radius:0;transition-delay:0s;transition-duration:0s}.tp-rotv.tp-rotv-not>.tp-rotv_b{display:none}.tp-rotv_b:disabled .tp-rotv_m{display:none}.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_c{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_i{border-bottom-left-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst.tp-fldv-expanded>.tp-fldv_b{transition-delay:0s;transition-duration:0s}.tp-rotv_c .tp-fldv.tp-v-vlst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-right-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst{margin-top:calc(-1*var(--cnt-vp))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst>.tp-fldv_b{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_c{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_i{border-bottom-left-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst{margin-top:calc(-1*var(--cnt-vp))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst>.tp-tabv_t{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv.tp-v-disabled,.tp-rotv .tp-v-disabled{pointer-events:none}.tp-rotv.tp-v-hidden,.tp-rotv .tp-v-hidden{display:none}.tp-sprv_r{background-color:var(--grv-fg);border-width:0;display:block;height:2px;margin:0;width:100%}.tp-sprv.tp-v-disabled .tp-sprv_r{opacity:.5}',plugins:[XA,YA,jA,t0,$A]})}},KI=new zc("4.0.5");function la(i,t,e,n){return n<=1?t+i*(e-t):t+(e-t)*(Math.pow(n,i)-1)/(n-1)}function ca(i,t,e,n){return n<=1?(i-t)/(e-t):Math.log(1+(i-t)/(e-t)*(n-1))/Math.log(n)}var Up=[];function I0(i,t,e,n){let{min:s,max:r,step:o,label:a}=n,l={value:t[e]};Up.push({key:e,proxy:l,fromParam:h=>h});let c=i.addBinding(l,"value",{label:a||e,min:s,max:r,step:o,format:h=>Number(h).toFixed(4)});return c.on("change",h=>{t[e]=h.value}),c}function Cn(i,t,e,n){let{min:s,max:r,base:o=10,label:a}=n,l={value:ca(t[e],s,r,o)};Up.push({key:e,proxy:l,fromParam:h=>ca(h,s,r,o)});let c=i.addBinding(l,"value",{label:a||e,min:0,max:1,step:.001,format:h=>la(h,s,r,o).toFixed(4)});return c.on("change",h=>{t[e]=la(h.value,s,r,o)}),c}function L0({onRebuild:i,onAudioUpdate:t,onAnyChange:e}){let n=document.createElement("div");n.id="tp-container",Object.assign(n.style,{position:"fixed",top:"10px",right:"10px",zIndex:"20",maxHeight:"calc(100vh-20px)",overflowY:"auto"}),document.body.appendChild(n);let s=new jc({container:n,title:"Windchime"}),r=s.addTab({pages:[{title:"Physics"},{title:"Geometry"},{title:"Audio"},{title:"Visual"}]});s.on("change",()=>{e&&e()});let o=null;function a(){clearTimeout(o),o=setTimeout(i,300)}let l=r.pages[0],c=l.addFolder({title:"World"});c.addBinding(B,"gravity",{min:-20,max:0,step:.1}),c.addBinding(B,"solverIterations",{min:1,max:50,step:1});let h=l.addFolder({title:"Wind"});Cn(h,B,"windForceScale",{min:.001,max:.3,base:10}),Cn(h,B,"windForceCurveExp",{min:.01,max:10,base:10}),Cn(h,B,"windAmplitudeX",{label:"amplitudeX",min:0,max:1,base:10}),Cn(h,B,"windAmplitudeZ",{label:"amplitudeZ",min:0,max:1,base:10}),I0(h,B,"windBiasX",{label:"biasX",min:-1,max:1,step:.01}),I0(h,B,"windBiasZ",{label:"biasZ",min:-1,max:1,step:.01}),Cn(h,B,"windRate",{label:"rate",min:.001,max:5,base:10});let d=l.addFolder({title:"Damping"});d.addBinding(B,"ringDamping",{min:0,max:1,step:.01}),d.addBinding(B,"chimeDamping",{min:0,max:1,step:.01}),d.addBinding(B,"chimeAngularDamping",{min:0,max:1,step:.01}),d.addBinding(B,"clapperDamping",{min:0,max:1,step:.01});let u=l.addFolder({title:"Contact Materials"});Cn(u,B,"chimeFriction",{min:.001,max:1,base:5}),Cn(u,B,"chimeRestitution",{min:.01,max:1,base:3}),Cn(u,B,"clapperFriction",{min:.001,max:1,base:5}),Cn(u,B,"clapperRestitution",{min:.01,max:1,base:3});let p=r.pages[1],m=p.addFolder({title:"Ring"});m.addBinding(B,"anchorY",{min:.5,max:5,step:.05}),m.addBinding(B,"anchorStringLen",{min:.1,max:2,step:.01}),m.addBinding(B,"ringRadius",{min:.05,max:.5,step:.01}),m.addBinding(B,"ringThickness",{min:.002,max:.1,step:.001}),m.addBinding(B,"ringMass",{min:.05,max:2,step:.01});let v=p.addFolder({title:"Chimes"});v.addBinding(B,"numChimes",{min:1,max:12,step:1}),v.addBinding(B,"chimeRadius",{min:.005,max:.1,step:.001}),v.addBinding(B,"chimeBaseHalfLen",{min:.05,max:.8,step:.01}),v.addBinding(B,"chimeHalfLenStep",{min:-.1,max:.2,step:.005}),v.addBinding(B,"chimeBaseMass",{min:.005,max:.2,step:.005}),v.addBinding(B,"chimeMassStep",{min:-.05,max:.1,step:.005}),v.addBinding(B,"chimeBaseStringLen",{min:.1,max:1.5,step:.01}),v.addBinding(B,"chimeStringLenStep",{min:-.15,max:.15,step:.005});let g=p.addFolder({title:"Clapper"});g.addBinding(B,"clapperRadius",{min:.02,max:.2,step:.005}),g.addBinding(B,"clapperMass",{min:.02,max:.5,step:.01}),g.addBinding(B,"clapperStringLen",{min:.2,max:2,step:.01});let f=p.addFolder({title:"Wind Arrow"});f.addBinding(B,"windArrowVisible",{label:"visible"}),f.addBinding(B,"windArrowY",{label:"Y position",min:-3,max:1,step:.05}),f.addBinding(B,"windArrowLength",{label:"length",min:.05,max:8,step:.05}),f.addBinding(B,"windArrowWidth",{label:"width",min:.002,max:.1,step:.001}),f.addBinding(B,"windArrowColor",{label:"color"}),m.on("change",a),v.on("change",a),g.on("change",a);let _=r.pages[2],w=_.addFolder({title:"Tuning"});w.addBinding(B,"baseFreq",{min:100,max:2e3,step:1}),w.addBinding(B,"detuneAmount",{min:0,max:1,step:.01}),w.on("change",()=>{t&&t()});let M=_.addFolder({title:"Chime Pitches"});function E(){for(M.dispose(),M=_.addFolder({title:"Chime Pitches"});B.chimeSemitones.length<B.numChimes;)B.chimeSemitones.push(0);B.chimeSemitones.length=B.numChimes;for(let L=0;L<B.numChimes;L++)M.addBinding(B.chimeSemitones,String(L),{label:`Chime ${L+1}`,min:0,max:36,step:1});M.on("change",()=>{t&&t()})}E();let A=_.addFolder({title:"Wind Sound"});A.addBinding(B,"windSoundGain",{label:"gain",min:0,max:2,step:.01}),A.addBinding(B,"windSoundMinGain",{label:"minGain",min:0,max:.5,step:.005}),A.addBinding(B,"windGainFadeIn",{label:"fadeIn",min:0,max:1,step:.01}),Cn(A,B,"windFilterMinFreq",{label:"filterMin",min:50,max:800,base:2}),Cn(A,B,"windFilterMaxFreq",{label:"filterMax",min:100,max:16e3,base:2}),A.addBinding(B,"windFilterQ",{label:"filterQ",min:.5,max:15,step:.1}),A.addBinding(B,"windFlangerDepth",{label:"flangerDepth",min:0,max:.5,step:5e-4}),Cn(A,B,"windFlangerRate",{label:"flangerRate",min:.005,max:2,base:2}),A.addBinding(B,"windFlangerMix",{label:"flangerMix",min:0,max:.5,step:.01}),A.addBinding(B,"windFlangerFeedback",{label:"flangerFeedback",min:-.95,max:.95,step:.01});let T=_.addFolder({title:"Envelope"});T.addBinding(B,"attack",{min:.001,max:.1,step:.001}),T.addBinding(B,"decay",{min:.1,max:10,step:.1}),T.addBinding(B,"maxGain",{min:0,max:1,step:.01}),T.addBinding(B,"masterGain",{min:0,max:1,step:.01}),T.on("change",()=>{t&&t()});let F=r.pages[3],x=F.addFolder({title:"Appearance"});x.addBinding(B,"chimeColor",{label:"Chimes"}),x.addBinding(B,"ringColor",{label:"Ring"}),x.addBinding(B,"clapperColor",{label:"Clapper"}),x.addBinding(B,"stringColor",{label:"Strings"}),x.addBinding(B,"stringWidth",{label:"String Width",min:1,max:5,step:.5});let y=F.addFolder({title:"Lighting"});y.addBinding(B,"lightColor",{label:"Color"}),y.addBinding(B,"lightIntensity",{label:"Intensity",min:0,max:5,step:.05}),y.addBinding(B,"lightDirX",{label:"Dir X",min:-10,max:10,step:.1}),y.addBinding(B,"lightDirY",{label:"Dir Y",min:-10,max:10,step:.1}),y.addBinding(B,"lightDirZ",{label:"Dir Z",min:-10,max:10,step:.1}),F.addFolder({title:"Ground"}).addBinding(B,"groundY",{label:"Height",min:-5,max:2,step:.05});let N=F.addFolder({title:"Sky"});N.addBinding(B,"backgroundColor");let R=["Gradient 1","Gradient 2","Gradient 3","Gradient 4"];for(let L=0;L<4;L++){let G=N.addFolder({title:R[L]});G.addBinding(B.skyGradients[L][0],"color",{label:"Bottom"}),G.addBinding(B.skyGradients[L][1],"color",{label:"Mid"}),G.addBinding(B.skyGradients[L][2],"color",{label:"Top"})}let D=F.addFolder({title:"Rendering"});D.addBinding(B,"enableBokeh"),D.addBinding(B,"bokehFocus",{min:.5,max:10,step:.1});function O(){for(let L of Up)L.proxy.value=L.fromParam(B[L.key]);s.refresh()}return{pane:s,buildPitchSliders:E,refreshFromParams:O}}var JA={radius:20,widthSegments:64,heightSegments:32,floorColor:3355443,gradients:[[{stop:0,color:16737843},{stop:.25,color:13395626},{stop:.55,color:3372936},{stop:1,color:657966}],[{stop:0,color:13395609},{stop:.3,color:5588155},{stop:.6,color:2237030},{stop:1,color:723760}],[{stop:0,color:3368584},{stop:.3,color:2245802},{stop:.6,color:1644885},{stop:1,color:526368}]]},Ir=new Ut,F0=new Ut;function Op(i,t){if(t<=i[0].stop)return Ir.set(i[0].color);if(t>=i[i.length-1].stop)return Ir.set(i[i.length-1].color);for(let e=0;e<i.length-1;e++){let n=i[e],s=i[e+1];if(t>=n.stop&&t<=s.stop){let r=(t-n.stop)/(s.stop-n.stop);return Ir.set(n.color),F0.set(s.color),Ir.lerp(F0,r),Ir}}return Ir.set(i[0].color)}function QA(i,t,e){let n=i.length;if(n===1)return Op(i[0],e);let s=t*(n-1),r=Math.floor(s),o=Math.min(r+1,n-1),a=s-r,l=Op(i[r],e).clone(),c=Op(i[o],e);return l.lerp(c,a)}function N0(i,t={}){let{radius:e,widthSegments:n,heightSegments:s,floorColor:r,gradients:o}={...JA,...t},a=new fs(e,n,s,0,Math.PI*2,0,Math.PI),l=a.attributes.position,c=new Float32Array(l.count*3);for(let u=0;u<l.count;u++){let p=l.getX(u),m=l.getY(u),v=l.getZ(u),g=Math.abs(Math.atan2(v,p))/Math.PI,f=Math.asin(Math.min(m/e,1))/(Math.PI/2),_=QA(o,g,f);c[u*3]=_.r,c[u*3+1]=_.g,c[u*3+2]=_.b}a.setAttribute("color",new Qt(c,3));let h=new hi({vertexColors:!0,side:Ve,depthWrite:!1}),d=new me(a,h);return i.add(d),{update(u,p){},dispose(){i.remove(d),a.dispose(),h.dispose()}}}var D0=[{key:"gravity",enc:"lin",bits:8,min:-20,max:0,def:-9.81},{key:"solverIterations",enc:"int",bits:6,min:1,max:50,def:10},{key:"ringDamping",enc:"lin",bits:7,min:0,max:1,def:.6},{key:"chimeDamping",enc:"lin",bits:7,min:0,max:1,def:.05},{key:"chimeAngularDamping",enc:"lin",bits:7,min:0,max:1,def:.15},{key:"clapperDamping",enc:"lin",bits:7,min:0,max:1,def:.03},{key:"chimeFriction",enc:"log",bits:8,min:.001,max:1,base:5,def:.1},{key:"chimeRestitution",enc:"log",bits:8,min:.01,max:1,base:3,def:.35},{key:"clapperFriction",enc:"log",bits:8,min:.001,max:1,base:5,def:.1},{key:"clapperRestitution",enc:"log",bits:8,min:.01,max:1,base:3,def:.4},{key:"windForceScale",enc:"log",bits:8,min:.001,max:.5,base:10,def:.125},{key:"windForceCurveExp",enc:"log",bits:8,min:1,max:4,base:10,def:2},{key:"windAmplitudeX",enc:"log",bits:8,min:0,max:1,base:10,def:1},{key:"windAmplitudeZ",enc:"log",bits:8,min:0,max:1,base:10,def:1},{key:"windBiasX",enc:"lin",bits:8,min:-1,max:1,def:.25},{key:"windBiasZ",enc:"lin",bits:8,min:-1,max:1,def:-.1},{key:"windRate",enc:"log",bits:8,min:.001,max:5,base:10,def:.1},{key:"anchorY",enc:"lin",bits:7,min:.05,max:5,def:1.85},{key:"anchorStringLen",enc:"lin",bits:8,min:.01,max:4,def:1.35},{key:"ringRadius",enc:"lin",bits:6,min:.05,max:1.5,def:.2},{key:"ringThickness",enc:"lin",bits:7,min:.002,max:.2,def:.02},{key:"ringMass",enc:"lin",bits:8,min:.05,max:3,def:.3},{key:"numChimes",enc:"int",bits:4,min:1,max:12,def:6},{key:"chimeRadius",enc:"lin",bits:7,min:.005,max:.1,def:.024},{key:"chimeBaseHalfLen",enc:"lin",bits:7,min:.05,max:.8,def:.25},{key:"chimeHalfLenStep",enc:"lin",bits:6,min:-.1,max:.2,def:.06},{key:"chimeBaseMass",enc:"lin",bits:6,min:.005,max:.2,def:.03},{key:"chimeMassStep",enc:"lin",bits:5,min:-.05,max:.1,def:.01},{key:"chimeBaseStringLen",enc:"lin",bits:8,min:.1,max:1.5,def:.55},{key:"chimeStringLenStep",enc:"lin",bits:6,min:-.15,max:.15,def:-.03},{key:"clapperRadius",enc:"lin",bits:6,min:.02,max:.5,def:.09},{key:"clapperMass",enc:"lin",bits:6,min:.02,max:2.5,def:.12},{key:"clapperStringLen",enc:"lin",bits:8,min:.02,max:4,def:.8},{key:"windArrowVisible",enc:"bool",bits:1,def:!0},{key:"windArrowY",enc:"lin",bits:7,min:-3,max:1,def:-1.3},{key:"windArrowLength",enc:"lin",bits:8,min:.05,max:8,def:1.3},{key:"windArrowWidth",enc:"lin",bits:7,min:.002,max:.1,def:.01875},{key:"windArrowColor",enc:"color",bits:24,def:"#88ccff"},{key:"baseFreq",enc:"lin",bits:11,min:100,max:2e3,def:440},{key:"detuneAmount",enc:"lin",bits:7,min:0,max:1,def:.1},{key:"attack",enc:"lin",bits:7,min:.001,max:.1,def:.003},{key:"decay",enc:"lin",bits:7,min:.1,max:10,def:2.3},{key:"maxGain",enc:"lin",bits:7,min:0,max:1,def:.25},{key:"masterGain",enc:"lin",bits:7,min:0,max:1,def:.7},{key:"windSoundGain",enc:"lin",bits:8,min:0,max:2,def:.3},{key:"windSoundMinGain",enc:"lin",bits:7,min:0,max:.5,def:.05},{key:"windGainFadeIn",enc:"lin",bits:7,min:0,max:1,def:.66},{key:"windFilterMinFreq",enc:"log",bits:8,min:50,max:800,base:2,def:600},{key:"windFilterMaxFreq",enc:"log",bits:8,min:100,max:16e3,base:2,def:12e3},{key:"windFilterQ",enc:"lin",bits:8,min:.5,max:15,def:1.5},{key:"windFlangerDepth",enc:"lin",bits:8,min:0,max:.5,def:.003},{key:"windFlangerRate",enc:"log",bits:8,min:.005,max:2,base:2,def:.25},{key:"windFlangerMix",enc:"lin",bits:6,min:0,max:.5,def:0},{key:"windFlangerFeedback",enc:"lin",bits:8,min:-.95,max:.95,def:.6},{key:"enableBokeh",enc:"bool",bits:1,def:!1},{key:"bokehFocus",enc:"lin",bits:7,min:.5,max:10,def:3},{key:"backgroundColor",enc:"color",bits:24,def:"#001020"},{key:"chimeSemitones",enc:"semitones",bits:6,maxItems:12,def:[0,3,7,0,3,7,10,12,15,19]},{key:"skyGradient0",enc:"gradient",bits:72,def:["#001020","#004080","#88ccff"]},{key:"skyGradient1",enc:"gradient",bits:72,def:["#202020","#400040","#ff88ff"]},{key:"skyGradient2",enc:"gradient",bits:72,def:["#201000","#403000","#ffcc88"]},{key:"skyGradient3",enc:"gradient",bits:72,def:["#102020","#304040","#88ff88"]}],tC=[...D0,{key:"chimeColor",enc:"color",bits:24,def:"#c0c0c0"},{key:"ringColor",enc:"color",bits:24,def:"#c0c0c0"},{key:"clapperColor",enc:"color",bits:24,def:"#dddbd0"},{key:"stringColor",enc:"color",bits:24,def:"#776644"},{key:"stringWidth",enc:"lin",bits:6,min:1,max:5,def:1},{key:"lightColor",enc:"color",bits:24,def:"#ff6a25"},{key:"lightIntensity",enc:"lin",bits:8,min:0,max:5,def:1.65},{key:"lightDirX",enc:"lin",bits:8,min:-10,max:10,def:-2.5},{key:"lightDirY",enc:"lin",bits:8,min:-10,max:10,def:1.8},{key:"lightDirZ",enc:"lin",bits:8,min:-10,max:10,def:3.5},{key:"groundY",enc:"lin",bits:8,min:-15,max:5,def:-2}],Kc={1:D0,2:tC};var zp=class{constructor(){this.bytes=[],this.cur=0,this.pos=0}write(t,e){for(let n=e-1;n>=0;n--)this.cur=this.cur<<1|t>>>n&1,++this.pos===8&&(this.bytes.push(this.cur),this.cur=0,this.pos=0)}finish(){return this.pos>0&&this.bytes.push(this.cur<<8-this.pos),new Uint8Array(this.bytes)}},Vp=class{constructor(t){this.bytes=t,this.bytePos=0,this.bitPos=0}read(t){let e=0;for(let n=0;n<t;n++){let s=this.bytes[this.bytePos]>>>7-this.bitPos&1;e=e<<1|s,++this.bitPos===8&&(this.bytePos++,this.bitPos=0)}return e}};function B0(i){let t=65535;for(let e=0;e<i.length;e++){t^=i[e]<<8;for(let n=0;n<8;n++)t=t&32768?t<<1^4129:t<<1,t&=65535}return t}var ha="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";function eC(i){let t="";for(let e=0;e<i.length;e+=3){let n=i[e],s=e+1<i.length?i[e+1]:0,r=e+2<i.length?i[e+2]:0;t+=ha[n>>>2],t+=ha[(n&3)<<4|s>>>4],e+1<i.length&&(t+=ha[(s&15)<<2|r>>>6]),e+2<i.length&&(t+=ha[r&63])}return t}function nC(i){let t=new Uint8Array(128);for(let r=0;r<64;r++)t[ha.charCodeAt(r)]=r;let e=Math.floor(i.length*3/4),n=new Uint8Array(e),s=0;for(let r=0;r<i.length;){let o=t[i.charCodeAt(r++)],a=r<i.length?t[i.charCodeAt(r++)]:0,l=r<i.length?t[i.charCodeAt(r++)]:0,c=r<i.length?t[i.charCodeAt(r++)]:0;s<e&&(n[s++]=o<<2|a>>>4),s<e&&(n[s++]=(a&15)<<4|l>>>2),s<e&&(n[s++]=(l&3)<<6|c)}return n}function ua(i){return parseInt(i.slice(1),16)}function Gp(i){return"#"+i.toString(16).padStart(6,"0")}function iC(i,t,e,n){let s=(1<<n)-1,r=(i-t)/(e-t);return Math.max(0,Math.min(s,Math.round(r*s)))}function sC(i,t,e,n){let s=(1<<n)-1;return t+i/s*(e-t)}function rC(i,t,e,n,s){let r=(1<<s)-1,o=ca(i,t,e,n);return Math.max(0,Math.min(r,Math.round(o*r)))}function oC(i,t,e,n,s){let r=(1<<s)-1;return la(i/r,t,e,n)}function U0(i,t){if(t.enc==="gradient"){let e=parseInt(t.key.replace("skyGradient",""));return i.skyGradients[e].map(n=>n.color)}return i[t.key]}function Hp(i,t){switch(t.enc){case"lin":return iC(i,t.min,t.max,t.bits);case"int":{let e=Math.round(i)-t.min;return Math.max(0,Math.min((1<<t.bits)-1,e))}case"log":return rC(i,t.min,t.max,t.base,t.bits);case"bool":return i?1:0;case"color":return ua(i);case"semitones":return i.map(e=>Math.max(0,Math.min((1<<t.bits)-1,e)));case"gradient":return i.map(ua);default:throw new Error("Unknown encoding: "+t.enc)}}function aC(i,t){switch(t.enc){case"lin":return sC(i,t.min,t.max,t.bits);case"int":return i+t.min;case"log":return oC(i,t.min,t.max,t.base,t.bits);case"bool":return i===1;case"color":return Gp(i);case"semitones":return i;case"gradient":return i.map(Gp);default:throw new Error("Unknown encoding: "+t.enc)}}function lC(i,t,e){let n=U0(i,t);if(t.enc==="semitones"){let o=t.def.slice(0,e),a=n.slice(0,e);if(a.length!==o.length)return!1;for(let l=0;l<o.length;l++)if(a[l]!==o[l])return!1;return!0}if(t.enc==="gradient"){let o=n;for(let a=0;a<3;a++)if(ua(o[a])!==ua(t.def[a]))return!1;return!0}let s=Hp(n,t),r=Hp(t.def,t);return s===r}function O0(i){let t=Kc[2],e=i.numChimes,n=t.map(l=>lC(i,l,e)),s=new zp;s.write(2,8);for(let l=0;l<t.length;l++)s.write(n[l]?0:1,1);for(let l=0;l<t.length;l++){if(n[l])continue;let c=t[l],h=U0(i,c);if(c.enc==="semitones"){let d=h.slice(0,e);for(let u=0;u<e;u++){let p=Math.max(0,Math.min((1<<c.bits)-1,d[u]||0));s.write(p,c.bits)}}else if(c.enc==="gradient"){let d=h;for(let u=0;u<3;u++)s.write(ua(d[u]),24)}else s.write(Hp(h,c),c.bits)}let r=s.finish(),o=B0(r),a=new Uint8Array(2+r.length);return a[0]=o>>>8&255,a[1]=o&255,a.set(r,2),eC(a)}function k0(i){let t;try{t=nC(i)}catch{return{error:"Invalid base64"}}if(t.length<4)return{error:"Too short"};let e=t[0]<<8|t[1],n=t.subarray(2),s=B0(n);if(e!==s)return{error:"Checksum mismatch"};let r=new Vp(n),o=r.read(8),a=Kc[o];if(!a)return{error:"Unknown version "+o};let l=[];for(let u=0;u<a.length;u++)l.push(r.read(1)===1);let c=a.find(u=>u.key==="numChimes"),h=c?c.def:6,d={};for(let u=0;u<a.length;u++){let p=a[u];if(!l[u])p.enc==="semitones"?d[p.key]=p.def.slice(0,h):p.enc==="gradient"?d[p.key]=[...p.def]:d[p.key]=p.def;else if(p.enc==="semitones"){let m=[];for(let v=0;v<h;v++)m.push(r.read(p.bits));d[p.key]=m}else if(p.enc==="gradient"){let m=[];for(let v=0;v<3;v++)m.push(Gp(r.read(24)));d[p.key]=m}else{let m=r.read(p.bits);d[p.key]=aC(m,p)}p.key==="numChimes"&&(h=d.numChimes)}return{values:d}}function Jc(){let i=2,t=[];for(let r=1;r<=i;r++)t.push(...Kc[r]);if(!t)return{error:"Unknown preset format version "+version};let e=t.find(r=>r.key==="numChimes"),n=e?e.def:6,s={};for(let r=0;r<t.length;r++){let o=t[r];o.enc==="semitones"?s[o.key]=o.def.slice(0,n):o.enc==="gradient"?s[o.key]=[...o.def]:s[o.key]=o.def,o.key==="numChimes"&&(n=s.numChimes)}return{values:s}}function da(i,t){i.values!=null&&(i=i.values);for(let[e,n]of Object.entries(i))if(e==="chimeSemitones")t.chimeSemitones=t.chimeSemitones||[],n.forEach(s=>t.chimeSemitones.push(s));else if(e.startsWith("skyGradient")){t.skyGradients=t.skyGradients||[];let s=parseInt(e.replace("skyGradient",""));t.skyGradients[s]=t.skyGradients[s]||[];for(let r=0;r<3;r++)t.skyGradients[s][r]={color:n[r],stop:.5*r}}else t[e]=n}var qp="windchime-params",Lr=null,z0=null;function cC(){return Lr||(Lr=document.createElement("div"),Lr.id="preset-toast",document.body.appendChild(Lr),Lr)}function Wp(i,t=2500){let e=cC();e.textContent=i,e.classList.add("visible"),clearTimeout(z0),z0=setTimeout(()=>e.classList.remove("visible"),t)}var xn=null;function hC(){if(xn)return xn;xn=document.createElement("div"),xn.id="share-modal",xn.innerHTML=`
    <div class="share-backdrop"></div>
    <div class="share-card">
      <div class="share-title">Share Preset</div>
      <input class="share-url" readonly />
      <button class="share-copy">Copy</button>
    </div>
  `,document.body.appendChild(xn);let i=xn.querySelector(".share-backdrop"),t=xn.querySelector(".share-url"),e=xn.querySelector(".share-copy");return i.addEventListener("click",()=>V0()),document.addEventListener("keydown",n=>{n.key==="Escape"&&xn.classList.contains("visible")&&V0()}),e.addEventListener("click",()=>{navigator.clipboard.writeText(t.value).then(()=>{e.textContent="Copied!",setTimeout(()=>{e.textContent="Copy"},1500)})}),xn}function uC(i){let t=hC(),e=t.querySelector(".share-url");e.value=i,t.classList.add("visible"),requestAnimationFrame(()=>{e.select()})}function V0(){xn&&xn.classList.remove("visible")}function dC(){let i=document.createElement("button");i.id="share-fab",i.setAttribute("aria-label","Share preset"),i.innerHTML='<svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>',i.addEventListener("click",()=>{let t=O0(B),e=window.location.origin+window.location.pathname+"#"+t;uC(e)}),document.body.appendChild(i)}function pC(i){let t=document.createElement("button");t.id="reset-fab",t.setAttribute("aria-label","Reset to defaults"),t.innerHTML='<svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.96 7.96 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',t.addEventListener("click",()=>{localStorage.removeItem(qp),da(Jc(),B),Wp("Reset to defaults"),i()}),document.body.appendChild(t)}var G0=null;function q0(){let i={};for(let t of Object.keys(B)){let e=B[t];Array.isArray(e)?i[t]=JSON.parse(JSON.stringify(e)):i[t]=e}try{localStorage.setItem(qp,JSON.stringify(i))}catch{}}function X0(){clearTimeout(G0),G0=setTimeout(q0,800)}function H0(){try{let i=localStorage.getItem(qp);return i?JSON.parse(i):null}catch{return null}}function W0(i){for(let t of Object.keys(i))if(t in B)if(t==="skyGradients")for(let e=0;e<i.skyGradients.length&&e<B.skyGradients.length;e++)for(let n=0;n<i.skyGradients[e].length&&n<B.skyGradients[e].length;n++)i.skyGradients[e][n].color!==void 0&&(B.skyGradients[e][n].color=i.skyGradients[e][n].color),i.skyGradients[e][n].offset!==void 0&&(B.skyGradients[e][n].offset=i.skyGradients[e][n].offset);else t==="chimeSemitones"?(B.chimeSemitones.length=0,i.chimeSemitones.forEach(e=>B.chimeSemitones.push(e))):B[t]=i[t]}function Y0({onLoad:i}){let t=window.location.hash.slice(1);if(t){let e=k0(t);if(e.values)da(e.values,B),history.replaceState(null,"",window.location.pathname+window.location.search),q0(),Wp("Preset loaded from URL"),i();else{Wp("Invalid preset link: "+e.error);let n=H0();n&&(W0(n),i())}}else{let e=H0();e&&(W0(e),i())}dC(),pC(i)}da(Jc(),B);var{renderer:A3,scene:$p,camera:j0,composer:fC,key:Xp,ground:mC}=Om(),gC=N0($p),Ai=ug(),vC=hg($p),Os=null,Qc=null,Un=null;function Zp(){Qc&&Qc.dispose(),Os&&Os.destroy();let i=Bm(B),t=Um(B);Os=lg(i,t,{ringRadius:B.ringRadius,ringMass:B.ringMass,anchorY:B.anchorY,anchorStringLen:B.anchorStringLen}),Qc=cg($p,Os),Un&&(Un.rebuild(B.numChimes),Os.setOnCollision(Un.strike))}Zp();var jp=L0({onRebuild:()=>{Zp(),jp.buildPitchSliders()},onAudioUpdate:()=>{Un&&Un.updateFromParams()},onAnyChange:()=>{X0()}});Y0({onLoad:()=>{jp.refreshFromParams(),Zp(),jp.buildPitchSliders(),Un&&Un.updateFromParams()}});var Yp=0,$0=performance.now()/1e3;function K0(){requestAnimationFrame(K0);let i=performance.now()/1e3,t=i-$0;$0=i,t>.1&&(t=.1),Ai.state.amplitude.x=B.windAmplitudeX,Ai.state.amplitude.z=B.windAmplitudeZ,Ai.state.rate=B.windRate,Ai.update(i),vC.update(Ai.state),Os.step(t,Ai.state),Un&&Un.updateWind(Ai.state),Qc.update(),gC.update(Ai.state,t),Xp.color.set(B.lightColor),Xp.intensity=B.lightIntensity,Xp.position.set(B.lightDirX,B.lightDirY,B.lightDirZ),mC.position.y=B.groundY;let e=Ai.state.x*.06;Yp+=(e-Yp)*Math.min(t*.55,1),j0.position.x=Yp,j0.lookAt(0,-.5,0),fC.render()}K0();var Z0=document.getElementById("unmute");Z0.addEventListener("click",()=>{Un=dg(B.numChimes),Os.setOnCollision(Un.strike),Z0.classList.add("faded")},{once:!0});
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)

tweakpane/dist/tweakpane.js:
  (*! Tweakpane 4.0.5 (c) 2016 cocopon, licensed under the MIT license. *)
*/
