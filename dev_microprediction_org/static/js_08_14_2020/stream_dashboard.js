const base_url = home_url;

let stream;
let horizon;
let json_name;
let delays;

var space_div = document.createElement("div");
space_div.id = "space";


async function OnLoadStreamDashboard(plot_x, all_delays) {
  delays = all_delays.map(String);
  stream = GetUrlVars()["stream"];
  horizon = GetUrlVars()["horizon"];

  if (horizon && !delays.includes(horizon)) {
    horizon = delays[0];
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
    LoadGraph(plot_x, "CDF");
  } else {
    LoadGraph(plot_x, "Data Values");
  }
}

// Stream name without horizon like "70::"
function LoadDashboardName() {
  document.getElementById("box-stream-name").innerText = stream;
}

// Only loads if on a non-horizon page
async function LoadCurrentValue() {
  const url = base_url + "live/" + json_name;
  const value = await get(url);
  // Only show current value if it is not a z-stream
  if (value !== null) {
    document.getElementById("box-current-value").style.display = "block";
    document.getElementById("box-current-value-value").innerText = Round(parseFloat(value), 5);
  }
}

// Group of 4 buttons, one for each horizon "70::", "310::", ...
function LoadHorizon() {
  if (!horizon) {
    return;
  }
  document.getElementById("box-horizon").style.display = "inline";
  var button_group = document.getElementsByClassName("box-horizon-button-group")[0];
  for (let delay of delays) {
    let btn = document.createElement("button");
    btn.innerText = delay + " sec";
    btn.onclick = function() {
      window.location = "stream_dashboard.html?stream="+stream+"&horizon="+delay;
    }
    // current button
    if (delay === horizon) {
      btn.classList.add("current");
    }
    button_group.appendChild(btn);
  }
}

// Choice of navigation buttons to go to previous and/or next page
function LoadButtonStream() {

  // IF THERE IS A HORIZON AKA "70::", ONLY HAVE A "GO TO STREAM" BUTTON
  if (horizon) {
    let button = document.getElementById("box-button-left");
    button.innerHTML = "Go to Stream &rarr;";
    button.style.display = "inline";
    button.onclick = function() {
      window.location = "stream_dashboard.html?stream="+stream;
    }

  // OTHERWISE, IF IT IS A Z STREAM, HAVE A "GO TO COMPETITIONS" BUTTON AND A "GO TO PARENT" NAV
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
      const first = stream.indexOf("~") + 1;
      const last = stream.lastIndexOf("~");
      r_button.onclick = function() {
        window.location = "stream_dashboard.html?stream="+stream.slice(first, last);
      }
    }
    else {
      let button_div = document.getElementsByClassName("dropdown-container")[0];
      let streams = [];
      let search_idx = 3;
      while (stream.indexOf('~', search_idx) !== -1) {
        streams.push(stream.slice(search_idx, stream.indexOf('~', search_idx)));
        search_idx = stream.indexOf('~', search_idx) + 1;
      }
      let button = document.getElementById("dropdown-button");
      let button_content = document.getElementsByClassName("dropdown-content")[0];
      button.innerHTML = "Go to Parent &rarr;";
      button_div.style.display = "inline-flex";
      for (let stream of streams) {
        let a = document.createElement("a");
        a.href = "stream_dashboard.html?stream="+stream;
        a.innerText = stream;
        a.style.display = "block";
        button_content.appendChild(a);
      }
      button.onclick = function() {
        document.getElementsByClassName("dropdown-content")[0].classList.toggle("show");
      }
    }

  // ELSE, IT IS JUST A NORMAL STREAM AKA "BART_DELAYS.JSON"
  // SHOW A "GO TO COMPETITIONS" AND A "GO TO Z1" DROPDOWN
  } else {
    let l_button = document.getElementById("box-button-left");
    l_button.innerHTML = "&larr; Go to Competitions";
    l_button.style.display = "inline";
    l_button.onclick = function() {
      window.location = "stream_dashboard.html?stream="+stream+"&horizon=70";
    }
    let button_div = document.getElementsByClassName("dropdown-container")[0];
    let button = document.getElementById("dropdown-button");
    let button_content = document.getElementsByClassName("dropdown-content")[0];
    button.innerHTML = " &larr; Go to Z1";
    button_div.style.display = "inline-flex";
    let new_delays = [delays[0], delays[delays.length-1]];
    for (let delay of new_delays) {
      let a = document.createElement("a");
      a.href = "stream_dashboard.html?stream=z1~"+stream+"~"+delay;
      a.innerText = delay + " sec";
      a.style.display = "block";
      button_content.appendChild(a);
    }
    button.onclick = function() {
      document.getElementsByClassName("dropdown-content")[0].classList.toggle("show");
    }
  }
}

async function LoadLeaderboard() {
  const url = base_url + "leaderboards/" + json_name;
  const dict = await get(url);
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
    if (name === "null")
      new_cell.appendChild(TextDiv("Carryover"));
    else
      new_cell.appendChild(TextDiv(name));
    new_cell = new_row.insertCell(-1);
    new_cell.appendChild(TextDiv(dict[name], true, 3));
    place = place + 1;
  }
  leaderboard_div.appendChild(table);
}

async function LoadLagged() {
  const url = base_url + "lagged/" + stream + ".json";;
  const lagged_values = await get(url);

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
  for (let head of headers) {
    let header_cell = document.createElement("TH");
    header_cell.innerHTML = head;
    new_row.appendChild(header_cell);
  }
  let i = 0;
  for (let group of lagged_values) {
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

async function LoadGraph(plot, title) {
  document.getElementsByClassName("graph-name")[0].innerText = title;
  document.getElementById("dashboard-graph-container").style.display = "block";
  Plotly.plot("dashboard-graph", plot, {}, {responsive:true});
}
