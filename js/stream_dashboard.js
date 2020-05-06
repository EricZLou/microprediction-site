const base_url = "https://www.microprediction.com/";

var stream;
var horizon;
var json_name;

var space_div = document.createElement("div");
space_div.id = "space";

async function OnLoadStreamDashboard(plot_cdf, plot_bar) {
  stream = GetUrlVars()["stream"];
  horizon = GetUrlVars()["horizon"];

  if (horizon && !["70", "310", "910"].includes(horizon)) {
    horizon = "70";
  }

  if (!horizon) {
    json_name = stream + ".json";
  } else {
    json_name = horizon + "::" + stream + ".json";
  }

  LoadDashboardName();
  await LoadLeaderboard();
  LoadHorizon();
  LoadButtonStream();
  LoadCurrentValue();
  LoadLagged();
  if (horizon) {
    LoadCDF(plot_cdf);
  } else {
    LoadBarGraph(plot_bar);
  }
}

function LoadDashboardName() {
  document.getElementById("box-stream-name").innerText = stream;
}

async function LoadCurrentValue() {
  var url = base_url + "live/" + json_name;
  const request = new Request(url, {method: 'GET'});

  var value = await Fetch(request);

  if (value !== "null") {
    document.getElementById("box-current-value").style.display = "block";
    document.getElementById("box-current-value-value").innerText = Round(parseFloat(value), 5);
  }
}

function LoadHorizon() {
  if (!horizon) {
    return;
  }
  document.getElementById("box-horizon").style.display = "inline";
  var horizon_button = document.getElementById("horizon-" + horizon);
  horizon_button.style.backgroundColor = "#8f3566";
  horizon_button.style.color = "#f9c809";
  horizon_button.style.fontWeight = "bold";

  document.getElementById("horizon-70").onclick = function() {
    window.location = "stream_dashboard.html?stream="+stream+"&horizon=70";
  }
  document.getElementById("horizon-310").onclick = function() {
    window.location = "stream_dashboard.html?stream="+stream+"&horizon=310";
  }
  document.getElementById("horizon-910").onclick = function() {
    window.location = "stream_dashboard.html?stream="+stream+"&horizon=910";
  }
}

function LoadButtonStream() {
  if (horizon) {
    let button = document.getElementById("box-button-left");
    button.innerHTML = "Go to Stream &rarr;";
    button.style.display = "inline";
    button.onclick = function() {
      window.location = "stream_dashboard.html?stream="+stream;
    }
  } else if (stream.includes("z1") || stream.includes("z2") || stream.includes("z3")) {
    let l_button = document.getElementById("box-button-left");
    l_button.innerHTML = "&larr; Go to Competitions";
    l_button.style.display = "inline";
    l_button.onclick = function() {
      window.location = "stream_dashboard.html?stream="+stream+"&horizon=70";
    }
    if (stream.includes("z1")) {
      let r_button = document.getElementById("box-button-right");
      r_button.innerHTML = "Go to Parent &rarr;";
      r_button.style.display = "inline";
      var first = stream.indexOf("~") + 1;
      var last = stream.lastIndexOf("~");
      r_button.onclick = function() {
        window.location = "stream_dashboard.html?stream="+stream.slice(first, last);
      }      
    }
    else {
      let button_div = document.getElementsByClassName("dropdown2")[0];
      let streams = [];
      let search_idx = 3;
      while (stream.indexOf('~', search_idx) !== -1) {
        streams.push(stream.slice(search_idx, stream.indexOf('~', search_idx)));
        search_idx = stream.indexOf('~', search_idx) + 1;
      }
      let button = document.getElementById("dropbtn2")
      button.innerHTML = "Go to Parent &rarr;";
      button_div.style.display = "inline-flex";
      button.onclick = function() {
        document.getElementById("dropdown").classList.toggle("show");
      }
      for (let i in streams) {
        document.getElementById("dropdown_"+i).href = "stream_dashboard.html?stream="+streams[i];
        document.getElementById("dropdown_"+i).innerText = streams[i];
        document.getElementById("dropdown_"+i).style.display = "block";
      }
    }
  } else {
    let l_button = document.getElementById("box-button-left");
    l_button.innerHTML = "&larr; Go to Competitions";
    l_button.style.display = "inline";
    l_button.onclick = function() {
      window.location = "stream_dashboard.html?stream="+stream+"&horizon=70";
    }
    let button_div = document.getElementsByClassName("dropdown2")[0];
    let button = document.getElementById("dropbtn2");
    button.innerHTML = " &larr; Go to Z1";
    button_div.style.display = "inline-flex";
    button.onclick = function() {
      document.getElementById("dropdown").classList.toggle("show");
    }
    let times = [70, 310, 910]
    let time_words = ["1 min", "5 min", "15 min"]
    for (let i in times) {
      document.getElementById("dropdown_"+i).href = "stream_dashboard.html?stream=z1~"+stream.slice(first, last)+"~"+times[i];
      document.getElementById("dropdown_"+i).innerText = time_words[i];
      document.getElementById("dropdown_"+i).style.display = "block";
    }
  }
}

window.onclick = function(event) {
  if (!event.target.matches('#dropbtn2')) {
    var dropdowns = document.getElementsByClassName("dropdown-content2");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

async function LoadLeaderboard() {
  var url = base_url + "leaderboards/" + json_name;
  const request = new Request(url, {method: 'GET'});

  var dict = await Fetch(request);

  leaderboard_div = document.getElementById("dashboard-leaderboard");

  if (Object.keys(dict).length === 0) {
    leaderboard_div.appendChild(
      TextDiv("No leaderboard available.", null, null, null, true)
    );
    leaderboard_div.appendChild(space_div);
    return;
  }

  let table = document.createElement("TABLE");
  table.classList.add("default-table");
  table.classList.add("default-table-small");
  table.classList.add("leaderboard-table");
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
  var url = base_url + "lagged/" + stream + ".json";;
  const request = new Request(url, {method: 'GET'});

  var lagged_values = await Fetch(request);

  lagged_div = document.getElementById("dashboard-lagged");
  lagged_div = document.getElementById("dashboard-lagged");

  if (lagged_values === "null" || lagged_values.length === 0) {
    lagged_div.appendChild(
      TextDiv("No lagged values available.", null, null, null, true)
    );
    lagged_div.appendChild(space_div);
    return;
  }

  let table = document.createElement("TABLE");
  table.classList.add("default-table");
  table.classList.add("default-table-small");
  table.style.flex = "1";
  let new_row = table.insertRow(-1);
  let headers = [];
  if (stream.includes("z1") || stream.includes("z2") || stream.includes("z3")) {
    headers = ["Timestamp", "Z-Score"];
  } else {
    headers = ["Timestamp", "Data"];
  }
  for (head of headers) {
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
    new_cell.appendChild(TextDiv(UnixToHMS(group[0])));
    new_cell = new_row.insertCell(-1);
    new_cell.appendChild(TextDiv(Round(parseFloat(group[1]), 5)));
    i = i + 1;
  }
  lagged_div.appendChild(table);
}

async function LoadBarGraph(plot) {
  document.getElementById("dashboard-bargraph-container").style.display = "block";
  var graphs = plot;
  Plotly.plot("dashboard-bargraph", graphs, {}, {responsive:true});
}

async function LoadCDF(plot) {
  document.getElementById("dashboard-cdf-container").style.display = "inline-block";
  var graphs = plot;
  Plotly.plot("dashboard-cdf", graphs, {}, {responsive:true});
}
