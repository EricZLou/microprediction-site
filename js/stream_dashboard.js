const base_url = "https://www.microprediction.com/";

var resp;
var stream;

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

  document.getElementById("box-current-value-value").innerText = value;
}

async function LoadBarGraph() {
	;
}

async function LoadLagged() {
	;
}

async function LoadLeaderboard() {
	;
}

async function LoadCDF() {
	;
}