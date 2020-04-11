const base_url = "https://www.microprediction.com/";

var resp;
var stream;

var space_div = document.createElement("div");
space_div.id = "space";

function OnLoadStreamDashboard() {
	stream = GetUrlVars()["stream"];

  LoadDashboardName();
  
  // stream is NOT a delayed stream
  if (!stream.includes("::") && !stream.includes("~")) {
	  LoadCurrentValue();
	  LoadBarGraph();
	  LoadLagged();
  }

	LoadLeaderboard();
	LoadCDF();
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

async function LoadBarGraph() {
	// var graphs = plot;
	// Plotly.plot("dashboard-bargraph", graphs, {});
	;
}

async function LoadLagged() {
	var url = base_url + "lagged/" + stream + ".json";
	const request = new Request(url, {method: 'GET'});

	var value = await Fetch(request);

	lagged_div = document.getElementById("dashboard-lagged");

	var title_div = document.createElement("div");
	title_div.id = "dashboard-title";
	title_div.innerHTML = "Lagged Values";
	leaderboard_div.appendChild(title_div);

	for (group of value) {
		leaderboard_div.appendChild(
			JoinDivs([
				TextDiv(group[0]),
				TextDiv(": "),
				TextDiv(group[1])
			])
		)
	}
	console.log(value);
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
	table.id = "dashboard-leaderboard-table";
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
	leaderboard_div.appendChild(space_div);
}

async function LoadCDF() {
	;
}