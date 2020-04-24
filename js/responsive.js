function resize_fn() {
	var w = window.innerWidth;
	var h = window.innerHeight;
	if (w <= 1200) {
		document.getElementById("body-title").innerText = "small";
	} else {
		document.getElementById("body-title").innerText = "big"
	}
}
