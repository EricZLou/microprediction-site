var w = window.innerWidth;
var h = window.innerHeight;

function resize_fn() {
	console.log(w);
	console.log(h);
	if (w <= 1200) {
		console.log('load the small header footer');
	} else {
		console.log('load the big header footer');
	}
}
