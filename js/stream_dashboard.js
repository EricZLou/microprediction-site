const base_url = "https://www.microprediction.com/";

var resp;
var stream;

var space_div = document.createElement("div");
space_div.id = "space";

async function OnLoadStreamDashboard(plot) {
	stream = GetUrlVars()["stream"];

  LoadDashboardName();
	await LoadLeaderboard();
  
  if (stream.includes("~")) {
  	var first = stream.indexOf("~") + 1;
  	var last = stream.lastIndexOf("~");
  	var mid = stream.indexOf("~",first);
  	if (mid === last) {
	  	document.getElementById("box-button-stream-parent").style.display = "inline";
	  	document.getElementById("box-button-stream-parent").onclick = function() {
	  		window.location = "stream_dashboard.html?stream="+stream.slice(first,last);
	  	};  		
  	}
  } else if (stream.includes("::")) {
  	var i = stream.indexOf("::") + 2;
  	document.getElementById("box-button-stream-parent").style.display = "inline";
  	document.getElementById("box-button-stream-parent").onclick = function() {
  		window.location = "stream_dashboard.html?stream="+stream.slice(i);
  	}
  }

  LoadCurrentValue();
  LoadLagged();
	LoadCDF();
	if (!stream.includes("~") && !stream.includes("::")) {
		LoadBarGraph(plot);
	}
}

function LoadDashboardName() {
	document.getElementById("box-title").innerText = stream;
}

async function LoadCurrentValue() {
	var url = base_url + "live/" + stream + ".json";
  const request = new Request(url, {method: 'GET'});

  var value = await Fetch(request);

  document.getElementById("box-current-value").style.display = "block";
  document.getElementById("box-current-value-value").innerText = value;
}

async function LoadBarGraph(plot) {
	var graphs = plot;
	Plotly.plot("dashboard-bargraph", graphs, {});
}

async function LoadLeaderboard() {
	var url = base_url + "leaderboards/" + stream + ".json";
	const request = new Request(url, {method: 'GET'});

	var dict = await Fetch(request);

	leaderboard_div = document.getElementById("dashboard-leaderboard");

	var title_div = document.createElement("div");
	title_div.id = "dashboard-title";
	title_div.innerHTML = "Leaderboard";
	leaderboard_div.appendChild(title_div);

	if (Object.keys(dict).length === 0) {
		leaderboard_div.appendChild(
			TextDiv("No leaderboard available.", null, null, null, true)
		);
		leaderboard_div.appendChild(space_div);
		return;
	}

	let table = document.createElement("TABLE");
	table.id = "dashboard-table";
	let new_row = table.insertRow(-1);
	for (head of ["Rank", "MUID", "Points"]) {
		let header_cell = document.createElement("TH");
		header_cell.innerHTML = head;
		new_row.appendChild(header_cell);
	}
	let place = 1;
	for (name in dict) {
		let new_row = table.insertRow(-1);

		let new_cell = new_row.insertCell(-1);
		new_cell.appendChild(TextDiv(place));
		new_cell = new_row.insertCell(-1);
		new_cell.appendChild(TextDiv(name));
		new_cell = new_row.insertCell(-1);
		new_cell.appendChild(TextDiv(dict[name], true, 3));

		place = place + 1;
	}
	leaderboard_div.appendChild(table);
}

async function LoadLagged() {
	var url = base_url + "lagged/" + stream + ".json";
	const request = new Request(url, {method: 'GET'});

	var lagged_values = await Fetch(request);

	lagged_div = document.getElementById("dashboard-lagged");
	lagged_div.appendChild(space_div);

	var title_div = document.createElement("div");
	title_div.id = "dashboard-title";
	title_div.innerHTML = "Lagged Values";
	lagged_div.appendChild(title_div);

	if (lagged_values === "null" || lagged_values.length === 0) {
		lagged_div.appendChild(
			TextDiv("No lagged values available.", null, null, null, true)
		);
		lagged_div.appendChild(space_div);
		return;
	}

	let table_container = document.createElement("div");
	table_container.id = "dashboard-table-container";
	let table = document.createElement("TABLE");
	table.id = "dashboard-table";
	let new_row = table.insertRow(-1);
	for (head of ["Timestamp", "Value"]) {
		let header_cell = document.createElement("TH");
		header_cell.innerHTML = head;
		new_row.appendChild(header_cell);
	}
	var i = 0;
	for (group of lagged_values) {
		if (i > 50) {
			break;
		}
		let new_row = table.insertRow(-1);
		let new_cell = new_row.insertCell(-1);
		new_cell.appendChild(TextDiv(group[0]));
		new_cell = new_row.insertCell(-1);
		new_cell.appendChild(TextDiv(group[1]));
		i = i + 1;
	}
	table_container.appendChild(table);
	lagged_div.appendChild(table_container);
	lagged_div.appendChild(space_div);
}

async function LoadCDF() {
	var url = base_url + "cdf/" + stream + ".json";
	const request = new Request(url, {method: 'GET'});

	var cdf_values = await Fetch(request);

	cdf_div = document.getElementById("dashboard-cdf");
	cdf_div.appendChild(space_div);

	var title_div = document.createElement("div");
	title_div.id = "dashboard-title";
	title_div.innerHTML = "CDF";
	cdf_div.appendChild(title_div);

	if (cdf_values === "null" || !cdf_values["x"] || cdf_values["x"].length === 0) {
		cdf_div.appendChild(
			TextDiv("No CDF available.", null, null, null, true)
		);
		cdf_div.appendChild(space_div);
		return;
	}

	let table_container = document.createElement("div");
	table_container.id = "dashboard-table-container";
	let table = document.createElement("TABLE");
	table.id = "dashboard-table";
	let new_row = table.insertRow(-1);
	for (head of ["x", "y"]) {
		let header_cell = document.createElement("TH");
		header_cell.innerHTML = head;
		new_row.appendChild(header_cell);
	}
	for (idx in cdf_values["x"]) {
		let new_row = table.insertRow(-1);
		let new_cell = new_row.insertCell(-1);
		new_cell.appendChild(TextDiv(cdf_values["x"][idx]));
		new_cell = new_row.insertCell(-1);
		new_cell.appendChild(TextDiv(cdf_values["y"][idx]));
	}
	table_container.appendChild(table);
	cdf_div.appendChild(table_container);
	cdf_div.appendChild(space_div);
}