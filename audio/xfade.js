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
	}
	
	return fetchPlaylist(["clip1.mp3", "clip2.mp3", "clip3.mp3", "clip4.mp3"]).then((clips)=>{
		console.info("Done loading samples...", clips);
		window._clips = clips;
		audioclips = clips;
		
		schedulePlayback();
	});
}

document.addEventListener("domcontentloaded", (evt)=>{
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
				scheduleAudio();
			});
			pausedOverlay.innerHTML = "&lt; Loading... &gt;";
			pausedOverlay.style.top = "-100vh";
		} else {
			pausedOverlay.innerHTML = "&lt; Click to play... &gt;";
			pausedOverlay.style.top = "0vh";
		}
		pausedOverlay.classList.toggle("show");
	});
});
