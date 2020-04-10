const base_url = "https://www.microprediction.com/";

var resp;
var stream;

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
}

function OnLoadStreamDashboard() {
	var url = base_url;
  const request = new Request(url, {method: 'GET'});

  LoadDashboardName();
  // load current value
  // load bargraph
  // load lagged
  // load leaderboard
  ;
}

function LoadDashboardName() {
	stream = getUrlVars()["stream"];
	document.getElementById("box-title").innerText = stream;
}