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
					fetchedclips[clipname] = clip;
					fetchNext(remainingclips, fetchedclips).then(ok);
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
		//this.sources[i].loop = true;
	}
	
	get endTime() {
		if(!this.available) {
			return this.start_time + this.clip.duration;
		} else {
			return 0;
		}
	}
	
	scheduleClip(clip, start_time) {
		console.info(`Scheduling clip ${clip} at time ${start_time}...`);
		/*if(this.source.buffer != null) {
			this.source.buffer = null;
		}
		this.source*/
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


function startAudio()
{
	// create an AudioContext to use the web audio api
	const AudioContext = window.AudioContext || window.webkitAudioContext;	// for legacy browsers
	const audioContext = new AudioContext();
	window._audioContext = audioContext;
	audiocontext = audioContext;
	
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
	}
	
	return fetchPlaylist(audioContext, ["clip1.mp3", "clip2.mp3", "clip3.mp3", "clip4.mp3"]).then((clips)=>{
		console.info("Done loading samples...", clips);
		window._clips = clips;
		audioclips = clips;
		
		schedulePlayback(clips);
	});
}

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
