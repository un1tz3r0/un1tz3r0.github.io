let audiocontext, audioclips, audiobuffers, audiostarted = false;

// fetchAudio() returns a Promise
// it uses fetch() to load an audio file
// it uses decodeAudioData to decode it into an AudioBuffer
// decoded AudioBuffer is buf argument for Promise.then((buf) => {})
// play.onclick() creates a single-use AudioBufferSourceNode
async function fetchAudio(name) {
  try {
    let rsvp = await fetch(`${name}.mp3`);
    return audioContext.decodeAudioData(await rsvp.arrayBuffer()); // returns a Promise, buffer is arg for .then((arg) => {})
  } catch (err) {
    console.log(
      `Unable to fetch the audio file: ${name} Error: ${err.message}`,
    );
  }
}

/*
function fetchnamedclip(clipname, dest) {
	return fetchAudio(clipname).then((buf) => {
		console.info(`Loaded clip ${clipname}.`
		clips[clipname] = buf;
	});
}
*/

function fetchPlaylist(playlist) {
	var fetchedclips = {};
	function fetchNext(playlist) {
		return new Promise((ok, fail) => {
			if(playlist.length <= 0) {
				return ok(fetchedclips);
			} else {
				var clipname = playlist[0];
				var remainingclips = playlist.slice(1);
				return fetchAudio(clipname).then((clip)=>{
					fetchedclips[clipname] = clip;
					return fetchNext(remainingclips);
				});
			}
		});
	}
	return fetchNext(playlist);
}


class Channel {
	constructor(mixer) {
		const actx = mixer.context;
		this.mixer = mixer;
		this.context = mixer.context;
		this.gain = actx.createGain();
		this.gain.connect(actx.destination);

		this.source = actx.createBufferSource();
		this.source.connect(this.gain);
		//this.sources[i].loop = true;

		this.param = actx.createParameterNode();
		this.param.connect(this.gain.gain);
		this.param.value = 0;

		this.start_time = 0;
		this.clip = null;
		this.playing = false;
		this.available = true;

		this.source.addEventListener("ended", (evt)=>{
			this.playing = false;
			this.available = true;

			this.mixer.scheduleNextClip();
		}
	}

	get endTime() {
		if(!this.available) {
			return this.start_time + this.clip.duration;
		} else {
			return this.start_time;
		}
	}

	scheduleClip(clip, start_time) {
		this.clip = clip;
		this.start_time = start_time;
		this.available = false;
		this.playing = true;
		this.source.buffer = clip;
		this.source.start(start_time);
		// set up envelope
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
			this.channels = new Channel(this);
		}
	}
	
	getRandomClip() {
		const clips = this.playlist;
		const keys = Object.keys(clips);
		const idx = Math.floor(Math.random() * keys.length);
		return clips[keys[idx]];
	}

	getAvailableChannel() {
		for(let ch of this.channels) {
			if(!ch.available) {
				return ch;
			}
		}
		return null;
	}

	scheduleNextClip() {
		const next_clip = this.getRandomClip();
		const next_start_time = -1;
		for(let ch of this.channels) {
			if(!ch.available) {
				const ch_end_time = ch.endTime;
				if(ch_end_time - this.overlap < next_start_time) {
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


function startAudio()
{
	// create an AudioContext to use the web audio api
	const AudioContext = window.AudioContext || window.webkitAudioContext;	// for legacy browsers
	const audioContext = new AudioContext();
	window._audioContext = audioContext;
	audiocontext = audioContext;
	
	function schedulePlayback()
	{
		// create our buffer sources and stuff
		console.info("schedulePlayback() called...");

		const xfade = new XFadeRandomizer(audioContext, clips, 2.0);
		window._xfade = xfade;
		while(xfade.scheduleNextClip())
		{
			console.info("Scheduled next clip...");
		}
		console.info("Done scheduling clips...");
	}
	
	return fetchPlaylist(["clip1.mp3", "clip2.mp3", "clip3.mp3", "clip4.mp3"]).then((clips)=>{
		console.info("Done loading samples...", clips);
		window._clips = clips;
		audioclips = clips;
		
		schedulePlayback(clips);
	});
}

function setupAudio()
{
	const pausedOverlay = document.createElement("div");
	pausedOverlay.setAttribute("class", "show");
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
	pausedOverlay.innerHTML = "&lt; Click to play... &gt;";

	//const styleElem = document.createElement("style");

	document.body.appendChild(pausedOverlay);

	//const pausedOverlay = document.querySelector(".pausedOverlay");
	pausedOverlay.addEventListener("click", (evt)=>{
		if(pausedOverlay.classList.includes("show")) {
			startAudio().then(()=>{
				pausedOverlay.innerHTML = "&lt; Loaded! &gt;";
				console.info("Audio running and loaded, calling scheduleAudio()");
			});
			pausedOverlay.innerHTML = "&lt; Loading... &gt;";
		} else {
			pausedOverlay.innerHTML = "&lt; Click to play... &gt;";
			pausedOverlay.style.top = "0vh";
		}
		pausedOverlay.classList.toggle("show");
	});
}