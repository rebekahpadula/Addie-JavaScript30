const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
	// gets access to webcam
	navigator.mediaDevices.getUserMedia({ video: true, audio: false })
		.then(localMediaStream => {
			console.log(localMediaStream);
			// converts video into something video player can understand
			video.src = window.URL.createObjectURL(localMediaStream);
			video.play();
		})
		// throws error in case someones settings does not allow you to access their webcam
		.catch(err => {
			console.error(`Oh no!`, err);
		});
}

function paintToCanvas() {
	// get size of webcam image, set the canvas equal to it
	const width = video.videoWidth;
	const height = video.videoHeight;
	canvas.width = width;
	canvas.height = height;
	// draw the image to the canvas!take
	setInterval(() => {
		ctx.drawImage(video, 0, 0, width, height);
		// take the pixels out
		let pixels = ctx.getImageData(0, 0, width, height);
		// mess with them
		pixels = redEffect(pixels);
		// but them back
		ctx.putImageData(pixels, 0, 0);
	}, 16);
}

function takePhoto() {
	// play the sound
	snap.currentTime = 0;
	snap.play();
	// take the data out of the canvas
	const data = canvas.toDataURL('image/jpeg');
	console.log(data);
	const link = document.createElement('a');
	link.href = data;
	link.setAttribute('download', 'awesome');
	link.innerHTML = `<img src="${data}" alt="awesome"/>`;
	strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
	for(let i = 0; i < pixels.data.length; i+= 4) {
		pixels.data[i] = pixels.data[i] + 100; // red
		pixels.data[i + 1] = pixels.data[i + 1] - 50; // green [i + 1]
		pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // blue
	}
	return pixels;
}

function rgbSplit(pixels) {
	for(let i = 0; i < pixels.data.length; i+= 4) {
		pixels.data[i - 150] = pixels.data[i]; // red
		pixels.data[i + 500] = pixels.data[i + 1]; // green [i + 1]
		pixels.data[i + 550] = pixels.data[i + 2]; // blue
	}
	return pixels;
}

function greenScreen(pixels) {
	const levels = {};
	document.querySelector('.rgb input').forEach((input) => {
		levels[input.name] = input.value;
	});

	for(i = 0; i < pixels.data.length; i = i + 4) {
		red = pixels.data[i + 0];
		green = pixels.data[i + 1];
		blue = pixels.data[i + 2];
		alpha = pixels.data[i + 3];

		if(red >= levels.rmin
			&& green >= levels.gmin
			&& blue >= levels.bmin
			&& red <= levels.rmax
			&& green <= levels.gmax
			&& blue <= levels.bmax) {
			pixels.data[i + 3] = 0;
		}
	}
	return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);