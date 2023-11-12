let audiocontext, audioclips, audiobuffers, audiostarted = false;

// fetchAudio() returns a Promise
// it uses fetch() to load an audio file
// it uses decodeAudioData to decode it into an AudioBuffer
// decoded AudioBuffer is buf argument for Promise.then((buf) => {})
// play.onclick() creates a single-use AudioBufferSourceNode
async function fetchAudio(context, name) {
  try {
    let rsvp = await fetch(`./${name}`);
    return context.decodeAudioData(await rsvp.arrayBuffer()); // returns a Promise, buffer is arg for .then((arg) => {})
  } catch (err) {
    console.log(
      `Unable to fetch the audio file: ${name} Error: ${err.message}`,
    );
  }
}

function fetchPlaylist(context, playlist) {
	var fetchedclips = {};
	function fetchNext(playlist, fetchedclips) {
		return new Promise((ok, fail) => {
			if(playlist.length <= 0) {
				ok(fetchedclips);
			} else {
				var clipname = playlist[0];
				var remainingclips = playlist.slice(1);
				return fetchAudio(context, clipname).then((clip)=>{
					clip.filename = clipname;
					fetchedclips[clipname] = clip;
					fetchNext(remainingclips, fetchedclips).then((resultclips) => { ok(resultclips); });	
				});
			}
		});
	}
	return fetchNext(playlist, fetchedclips);
}

class Channel {
	constructor(mixer) {
		const actx = mixer.context;
		const chan = this;

		this.mixer = mixer;
		this.context = mixer.context;
		this.gain = actx.createGain();
		this.gain.connect(actx.destination);

		this.source = null;

		this.param = this.gain.gain;
		this.param.value = 0;

		this.start_time = 0;
		this.clip = null;
		this.playing = false;
		this.available = true;
	}

	initSource() {
		// because of how the web audio api works, we can't re-use BufferSource, so each time
		// we want to schedule playback on the channel, we need to dispose of the previous one,
		// construct a new one and hook it up to the gain node.
		const chan = this;
		if(this.source != null) {
			this.source.disconnect(this.gain);
		}
		this.source = this.context.createBufferSource();
		this.source.connect(this.gain);
		this.source.addEventListener("ended", (evt)=>{
			chan.playing = false;
			chan.available = true;

			chan.mixer.scheduleNextClip();
		});
	}

	get endTime() {
		if(!this.available) {
			return this.start_time + ((this.clip != null) ? this.clip.duration : 0.0);
		} else {
			return 0;
		}
	}

	get clipName() {
		if(this.clip != null)
			return this.clip.filename;
		else
			return "null";
	}
	
	get clipTime() {
		const t = this.context.currentTime - this.start_time;
		if(t < 0)
			return 0;
		return t;
	}

	get channelGain() {
		return this.param.value;
	}

	get channelState() {
		if(this.clipTime <= 0) {
			return "pending";
		} else {
			if(this.available) {
				return "stopped";
			} else {
				return "playing";
			}
		}
	}

	scheduleClip(clip, start_time) {
		console.info(`Scheduling clip ${clip} at time ${start_time}...`);
		this.initSource();

		this.clip = clip;
		this.start_time = start_time;
		this.available = false;
		this.playing = true;
		this.source.buffer = clip;
		this.source.start(start_time);
		// set up envelope
		this.param.cancelScheduledValues(start_time);
		this.param.setValueAtTime(0, start_time);
		this.param.linearRampToValueAtTime(1, start_time + this.mixer.overlap);
		this.param.linearRampToValueAtTime(1, start_time + clip.duration - this.mixer.overlap);
		this.param.linearRampToValueAtTime(0, start_time + clip.duration);
	}
};

class XFadeRandomizer {
	constructor(context, playlist, overlap) {
		const actx = context;
		this.context = context;
		this.overlap = overlap;
		this.playlist = playlist;
		this.channels = [];

		for(let i of [0,1])
		{
			this.channels[i] = new Channel(this);
		}
	}

	getRandomClip() {
		const clips = this.playlist;
		const keys = Object.keys(clips);
		const idx = Math.floor(Math.random(keys.length));
		return clips[keys[idx]];
	}

	getAvailableChannel() {
		for(let ch of this.channels) {
			if(ch.available) {
				return ch;
			}
		}
		return null;
	}

	scheduleNextClip() {
		const next_clip = this.getRandomClip();
		var next_start_time = this.context.currentTime;
		for(let ch of this.channels) {
			if(!ch.available) {
				const ch_end_time = ch.endTime;
				if(ch_end_time - this.overlap > next_start_time) {
					next_start_time = ch_end_time - this.overlap;
				}
			}
		}
		const next_ch = this.getAvailableChannel();
		if(next_ch == null) {
			console.warn("No available channels!");
			return false;
		}
		next_ch.scheduleClip(next_clip, next_start_time);
		return true;
	}
}

// update the visual feedback of the channels' playback states
function startAnimation(xfade) {
	var animateHandle = null;

	function updateValue(selector, value) {
		const elem = document.querySelector(selector);
		if(elem == null) {
			console.warn(`Element not found: ${selector}`);
			return;
		}
		if (elem.hasAttribute("value") && elem.getAttribute("value") != String(value)) {
			elem.setAttribute(value);
		}
		else {
			if (elem.textContent != String(value)) {
				elem.replaceChildren(document.createTextNode(String(value));
				elem.setAttribute("data-value", value);
			}
		}
	}

	function animate(frametime)
	{
		for(let i of [0,1]) {
			updateValue(`#channel${i+1}_time`, xfade.channels[i].clipTime);
			updateValue(`#channel${i+1}_state`, xfade.channels[i].channelState);
			updateValue(`#channel${i+1}_clip`, xfade.channels[i].clipName);
			updateValue(`#channel${i+1}_gain`, Math.round(xfade.channels[i].channelGain * 100.0));
		}
		animateHandle = window.requestAnimationFrame(animate);
	}

	animateHandle = window.requestAnimationFrame(animate);
}

// create audiocontext on user input (to work with anti-autoplay restriction)
// also loads the clips in the playlist, and then creates the xfade mixer and
// schedules the clips and envelopes, finally kicks of the update animation loop
function startAudio()
{
	// create an AudioContext to use the web audio api
	const AudioContext = window.AudioContext || window.webkitAudioContext;	// for legacy browsers
	const audioContext = new AudioContext();
	window._audioContext = audioContext;
	audiocontext = audioContext;

	// this will create and initialize the xfader with two channels and start them
	// ping-pong playing once the clips are all ready
	function schedulePlayback(clips)
	{
		// create our buffer sources and stuff
		console.info("schedulePlayback() called...");

		const xfade = new XFadeRandomizer(audioContext, clips, 2.0);
		window._xfade = xfade;
		while(xfade.scheduleNextClip())
		{
			console.info("Scheduled clip...");
		}
		console.info("Done scheduling clips...");
		return xfade;
	}

	// this loads the clips asynchronously and then calls the above 
	// function when they are ready
	return fetchPlaylist(audioContext, ["clip1.mp3", "clip2.mp3", "clip3.mp3", "clip4.mp3"]).then((clips)=>{
		console.info("Done loading samples...", clips);
		window._clips = clips;
		audioclips = clips;

		const xfade = schedulePlayback(clips);
		startAnimation(xfade);
	});
}

// misc non-audio-related icon graphics as svg symbols injected into the document
// so we may use them in the UI elements we construct for the xfader etc.
var iconsDefsElem = null;
function setupIcons()
{
	if(iconsDefsElem != null)
	{
		return iconsDefsElem;
	}
	else
	{
		const iconsvgelem = document.createElementNS("svg", "http://www.w3.org/2000/svg");
		iconsvgelem.style.display = "none";
		const icondefselem = document.createElement("defs");
		iconsvgelem.appendChild(icondefselem);
		icondefselem.innerHTML = ```
			<symbol id="av_volume_off_materialiconsround" height="24" viewBox="0 0 24 24" width="24"><path d="M3.63 3.63c-.39.39-.39 1.02 0 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/></symbol>
			<symbol id="av_volume_down_materialiconsround" height="24" viewBox="0 0 24 24" width="24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L9 9H6c-.55 0-1 .45-1 1z"/></symbol>
			<symbol id="av_volume_mute_materialiconsround" height="24" viewBox="0 0 24 24" width="24"><path d="M7 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L11 9H8c-.55 0-1 .45-1 1z"/></symbol>
			<symbol id="av_volume_up_materialiconsround" height="24" viewBox="0 0 24 24" width="24"><path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z"/></symbol>
		```;
		document.body.appendChild(iconsvgelem);
		iconsDefsElem = icondefselem;
		return iconssvgelem;
	}
}

// create a DOM element which references one the svg symbol icons defined by the above function
function createIconElement(name, size=24)
{
	if(iconsDefsElem == null)
	{
		setupIcons();
	}
	
	/*
	<svg viewbox="0 0 24 24" width="96px" height="96px" xmlns="http://www.w3.org/2000/svg">
	<use href="#av_volume_off_materialiconsround" x="0" y="0"/>
	</svg>
	*/
	
	const iconsvgelem = document.createElementNS("svg", "http://www.w3.org/2000/svg");
	iconsvgelem.setAttribute("viewbox", "0 0 24 24");
	iconsvgelem.setAttribute("width", `${size}px`);
	iconsvgelem.setAttribute("height", `${size}px`);
	const iconuseelem = document.createElement("use");
	iconsvgelem.appendChild(iconuseelem);
	iconuseelem.setAttribute("href", `#${name}`);
	iconuseelem.setAttribute("x", "0");
	iconuseelem.setAttribute("y", "0");
	return iconsvgelem;
}

// 
function setupAudio()
{
	const pausedOverlay = document.createElement("div");
	pausedOverlay.setAttribute("class", "pausedOverlay show");
	pausedOverlay.style.transition = "all 1s ease-in-out";
	pausedOverlay.style.position = "fixed";
	pausedOverlay.style.margin = "0";
	pausedOverlay.style.padding = "0";
	pausedOverlay.style.left = "0px";
	pausedOverlay.style.top = "0px";
	pausedOverlay.style.width = "100vw";
	pausedOverlay.style.height = "100vh";
	pausedOverlay.style.placeItems = "center";
	pausedOverlay.style.placeContents = "center";
	pausedOverlay.style.placeSelf = "center";
	pausedOverlay.style.display = "grid";
	pausedOverlay.style.transition = "all 1s ease-in";
	pausedOverlay.style.overflow = "hidden";
	pausedOverlay.style.backgroundColor = "#bbb4";
	pausedOverlay.style.transform = "translateY(0vh)";
	pausedOverlay.innerHTML = "&lt; Click to play... &gt;";
	
	//const styleElem = document.createElement("style");

	document.body.appendChild(pausedOverlay);

	//const pausedOverlay = document.querySelector(".pausedOverlay");
	pausedOverlay.addEventListener("click", (evt)=>{
		if(pausedOverlay.classList.contains("show")) {
			startAudio().then(()=>{
				pausedOverlay.innerHTML = "&lt; Loaded! &gt;";
				console.info("Audio running and loaded, calling scheduleAudio()");
				pausedOverlay.style.transform = "translateY(-100vh)";
			});
			pausedOverlay.innerHTML = 
			'<svg viewbox="0 0 24 24" width="96px" height="96px" xmlns="http://www.w3.org/2000/svg">' + 
	'<use href="#av_volume_down_materialiconsround" x="0" y="0"/>' + 
	'</svg>';

		} else {
			pausedOverlay.innerHTML = 	
			'<svg viewbox="0 0 24 24" width="96px" height="96px" xmlns="http://www.w3.org/2000/svg">' + 
	'<use href="#av_volume_off_materialiconsround" x="0" y="0"/>' + 
	'</svg>';
			pausedOverlay.style.transform = "translateY(0vh)";
		}
		pausedOverlay.classList.toggle("show");
	});
}
