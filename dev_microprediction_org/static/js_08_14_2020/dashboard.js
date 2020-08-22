const base_url = home_url;


let write_key;
let resp;
let all_active_streams;
let all_confirms;
let repo;
let announcements = [];
let announcement_idx = 0;


function LoadAll() {
  let button = document.getElementById("dropdown-button");
  let dropdown = document.getElementsByClassName("dropdown-content")[0];
  button.onclick = function() {
    dropdown.classList.toggle("show");
  }
  let pairs = JSON.parse(localStorage.getItem('microprediction_keys'));
  for (let pair of pairs) {
    let drop = document.createElement("a");
    drop.href = "";
    drop.innerText = pair[1];
    drop.onclick = function() {
      localStorage.setItem('microprediction_key_current', JSON.stringify(pair));
      document.getElementById('box-input-write-key').value = pair[0];
      LoadDashboard();
    }
    drop.style.display = "block";
    dropdown.appendChild(drop);
  }
  if (pairs.length > 1) {
    let log_out_all = document.createElement("a");
    log_out_all.href = "";
    log_out_all.innerText = "Log Out All";
    log_out_all.classList.add("log-out");
    log_out_all.onclick = function() {
      localStorage.removeItem('microprediction_key_current');
      localStorage.removeItem('microprediction_keys');
      location.reload();
    };
    log_out_all.style.display = "block";
    dropdown.appendChild(log_out_all);
  }

  LoadOverview();
  LoadActiveStreams();
  LoadConfirms();
  LoadErrors();
  LoadWarnings();
  LoadPerformance();
  LoadTransactions();
}

// 'microprediction_keys' is a list of pairs, each pair is [key, animal]

function AddLocalStorage() {
  let pair = [write_key, resp["animal"]];
  localStorage.setItem('microprediction_key_current', JSON.stringify(pair));
  let pairs = JSON.parse(localStorage.getItem('microprediction_keys'));
  if (!pairs) {
    pairs = [];
  }
  let includes = false;
  for (let p of pairs) {
    if (p[0] === pair[0] && p[1] === pair[1])
      includes = true;
  }
  if (!includes) {
    pairs.push(pair);
    localStorage.setItem('microprediction_keys', JSON.stringify(pairs));
  }
}

function LogOut() {
  RemoveLocalStorage();
}

function RemoveLocalStorage() {
  let pairs = JSON.parse(localStorage.getItem('microprediction_keys'));
  let current = JSON.parse(localStorage.getItem('microprediction_key_current'));
  console.log(pairs.length);
  if (pairs.length === 1) {
    RemoveAllLocalStorage();
    return;
  }
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i][0] === current[0] && pairs[i][1] === current[1]) {
      pairs.splice(i, 1);
      localStorage.setItem('microprediction_keys', JSON.stringify(pairs));
      localStorage.setItem('microprediction_key_current', JSON.stringify(pairs[0]));
      document.getElementById('box-input-write-key').value = pairs[0][0];
      LoadDashboard();
      return;
    }
  }
}

function RemoveAllLocalStorage() {
  localStorage.removeItem('microprediction_key_current');
  localStorage.removeItem('microprediction_keys');
  location.reload();
}

function FetchAndLoadData(request, refresh) {
  return fetch(request)
    .then(response => {
      if (response.status !== 200) {
        throw "Response status is not 200: " + response.status;
      } else {
        return response.json();
      }
    })
    .then(json => {
      if (json["animal"] !== null) {
        document.getElementById("introduction").style.display = "none";
        resp = json;
    
        AddLocalStorage();

        document.getElementsByClassName("dropdown-container")[0].style.display = "inline-flex";
        let name = "home/" + write_key;
        document.getElementById("box-href").href = name;
        document.getElementById("box-info-loaded-from").style.display = "inline-block";
        for (var card of document.getElementsByClassName("shadow-card")) {
          card.style.display = "block";
        }
        LoadAll();

        if (refresh) location.reload();

      } else {
        document.getElementById("box-bad-key").innerHTML = "Invalid";
        setTimeout(function(){
          document.getElementById("box-bad-key").innerHTML = '';
        }, 2000);
      }
    })
    .catch(error => {
      document.getElementById("box-bad-key").innerHTML = "Invalid";
      setTimeout(function(){
        document.getElementById("box-bad-key").innerHTML = '';
      }, 2000);
    })
}

function FetchActiveStreams() {
  var url = base_url+"active/"+write_key;
  request = new Request(url, {method: 'GET'});
  return fetch(request)
    .then(response => {return response.json();})
    .then(json => {all_active_streams = json;})
}

function FetchConfirms() {
  var url = base_url+"confirms/"+write_key+"/";
  request = new Request(url, {method: 'GET'});
  return fetch(request)
    .then(response => {return response.json();})
    .then(json => {all_confirms = json;})
}

async function FetchRepository() {
  var url = base_url+"repository/"+write_key;
  repo = await get(url);
}

// called immediately when the page loads
async function OnLoadDashboard() {
  var text_box = document.getElementById("box-input-write-key");
  text_box.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("box-button-write-key").click();
    }
  });
  pair = JSON.parse(localStorage.getItem('microprediction_key_current'));
  if (pair) {
    write_key = pair[0];
    var url = base_url+"home/"+write_key+"/";
    const request = new Request(url, {method: 'GET'});
    await FetchActiveStreams();
    await FetchConfirms();
    await FetchRepository();
    await FetchAndLoadData(request);
  }
  else {
    // load some welcome text!
    document.getElementById("introduction").style.display = "inline-block";
  }
  await LoadAnnouncements();
}

// called when the user enters a write key in the text box
async function LoadDashboard() {
  write_key = document.getElementById("box-input-write-key").value;
  if (write_key !== "") {
    var url = base_url+"home/"+write_key+"/";
    const request = new Request(url, {method: 'GET'});
    await FetchActiveStreams();
    await FetchConfirms();
    // refresh the page if the page is already displaying a valid write key
    if (localStorage.getItem('microprediction_key_current'))
      await FetchAndLoadData(request, refresh=true);
    else
      await FetchAndLoadData(request);
  }
}

// Store all of them the first time the page is loaded
async function LoadAnnouncements() {
  const url = base_url + "announcements/";
  announcements = await get(url);
  if (announcements.length === 0)
    return;
  ShowAnnouncement(announcement_idx);   // default set to 0
  if (announcements.length > 1)
    document.getElementById("right-arrow").style.visibility = "visible";
}

function ShowAnnouncement() {
  let ann_div = document.getElementById("announcements-text");
  const message = announcements[announcement_idx][0];
  const link = announcements[announcement_idx][1];
  ann_div.innerHTML = "ANNOUNCEMENT: <a href="+link+" target='_blank'>(Read More)</a> " + message;
}

function AnnouncementPrev() {
  if (announcement_idx === 1) {
    document.getElementById("left-arrow").style.visibility = "hidden";
  }
  document.getElementById("right-arrow").style.visibility = "visible";
  announcement_idx--;
  ShowAnnouncement();
}

function AnnouncementNext() {
  if (announcement_idx === announcements.length - 2) {
    document.getElementById("right-arrow").style.visibility = "hidden";
  }
  document.getElementById("left-arrow").style.visibility = "visible";
  announcement_idx++;
  ShowAnnouncement();
}

// HELPER FUNCTION
function CreateCardWithTitle(title) {
  let card = document.createElement("div");
  card.className = "shadow-card";
  var title_div = document.createElement("div");
  title_div.classList.add("dashboard-title");
  title_div.innerHTML = title;
  card.appendChild(title_div);
  return card;
}


function LoadOverview() {
  let card = CreateCardWithTitle("Overview");
  let divs = [BoldDiv(resp["code"])];
  if (repo) {
    let repo_div = document.createElement("button");
    repo_div.classList.add("mini-button");
    repo_div.classList.add("bg-red-hover");
    repo_div.onclick = function() {
      window.open(repo);
    };
    repo_div.innerText = "Code";
    divs.push(TextDiv(" "));
    divs.push(repo_div);
  }
  card.appendChild(JoinDivs(divs));
  card.appendChild(
    JoinDivs([
      BoldDiv("Memorable ID: ", "color:var(--theme-purple);"),
      TextDiv(resp["animal"])
    ])
  );
  card.appendChild(
    JoinDivs([
      BoldDiv("Balance: ", "color:var(--theme-purple);"),
      TextDiv(resp["balance::"+write_key+".json"], null, {"pos_neg_color":true, "round":4})
    ])
  );
  card.appendChild(
    JoinDivs([
      BoldDiv("Distance to Bankruptcy: ", "color:var(--theme-purple);"),
      TextDiv(resp["distance_to_bankruptcy"], null, {"round":2})
    ])
  );
  $("#dashboard-overview").replaceWith(card);
}

function LoadActiveStreams() {
  let title = "Active Streams";
  let card_some = CreateCardWithTitle(title);
  let card_all = CreateCardWithTitle(title);
  let streams = resp["/active/"+write_key];
  for (let item of streams) {
    card_some.appendChild(JoinDivs([TextDiv(item.slice(0,-5))], true, title));
  }

  if (streams.length === 0) {
    card_some.appendChild(TextDiv("No Active Streams"));
  } else if (streams.length < 10) {
    ;
  } else {
    if (all_active_streams.length > 10) {
      // create show line
      let show_more = document.createElement("div");
      show_more.id = "body-text";
      show_more.innerHTML = "Show More";
      show_more.style.textAlign = "center";
      show_more.style.fontWeight = "bold";
      let show_less = show_more.cloneNode(true);
      show_less.innerHTML = "Show Less";
      let show_more_line = document.createElement("div");
      show_more_line.id = "div-hover";
      show_more_line.appendChild(show_more);
      let show_less_line = document.createElement("div");
      show_less_line.id = "div-hover";
      show_less_line.appendChild(show_less);
      
      for (let item of all_active_streams) {
        card_all.appendChild(JoinDivs([TextDiv(item.slice(0,-5))], true, title));
      }
      card_some.appendChild(show_more_line);
      card_all.appendChild(show_less_line);

      show_more_line.onclick = e => {
        card_some.style.display = "none";
        card_all.style.display = "block";
      }
      show_less_line.onclick = e => {
        card_some.style.display = "block";
        card_all.style.display = "none";
      }      
    }
  }
  document.getElementById("dashboard-active-streams").appendChild(card_some);
  document.getElementById("dashboard-active-streams").appendChild(card_all);
  card_some.style.display = "block";
  card_all.style.display = "none";
}

function LoadConfirms() {
  title = "Confirmations";
  card = CreateCardWithTitle(title);
  var prev_action = "";
  var prev_name = "";
  let idx = 0;
  for (var item of all_confirms) {
    if (idx === 20) break;
    var item = JSON.parse(item);
    if (!("operation" in item)) {
      if ("type" in item && item["type"] === "cancel") {
        item["operation"] = "cancel";
      }
      else {
        card.appendChild(TextDiv("unknown action"));
      }
    }
    if (item["operation"] === "set") {
      if (prev_action === "set" && prev_name === item["examples"][0]["name"]) {        
        continue;
      }
      card.appendChild(
        JoinDivs([
          BoldDiv("SET ", "color:var(--theme-purple);"),
          TextDiv(item["examples"][0]["name"].slice(0,-5))
        ], true, title)
      );
      prev_action = "set";
      prev_name = item["examples"][0]["name"];
    } else if (item["operation"] === "submit") {
      if (prev_action === "submit" && prev_name === item["name"]) {        
        continue;
      }
      card.appendChild(
        JoinDivs([
          BoldDiv("SUBMIT ", "color: var(--theme-green);"),
          TextDiv(item["name"].slice(0,-5))
        ], true, title)
      );
      prev_action = "submit";
      prev_name = item["name"];
    } else if (item["operation"] === "touch") {
      if (prev_action === "touch" && prev_name === item["name"]) {        
        continue;
      }
      card.appendChild(
        JoinDivs([
          BoldDiv("TOUCH ", "color:var(--theme-red);"),
          TextDiv(item["name"].slice(0,-5))
        ], true, title)
      );
      prev_action = "touch";
      prev_name = item["name"];
    } else if (item["operation"] === "cancel") {
      if (prev_action === "cancel" && prev_name === item["name"]) {        
        continue;
      }
      card.appendChild(
        JoinDivs([
          BoldDiv("CANCEL ", "color:black;"),
          TextDiv(item["name"])
        ], true, title)
      );
      prev_action = "cancel";
      prev_name = item["name"];
    } else if (item["operation"] === "withdraw") {
      if (prev_action === "withdraw" && prev_name === item["name"]) {        
        continue;
      }
      card.appendChild(
        JoinDivs([
          BoldDiv("WITHDRAW ", "color:black;"),
          TextDiv(item["name"])
        ], true, title)
      );
      prev_action = "withdraw";
      prev_name = item["name"];
    } else if (item["operation"] === "bankruptcy") {
      if (prev_action === "bankrupt" && prev_name === item["name"]) {        
        continue;
      }
      card.appendChild(
        JoinDivs([
          BoldDiv("BANKRUPT ", "color:black;"),
          TextDiv(item["name"])
        ], true, title)
      );
      prev_action = "bankrupt";
      prev_name = item["name"];
    } else {
      card.appendChild(TextDiv("unknown action"));
    }
    idx++;
  }
  if (all_confirms.length === 0) {
    card.appendChild(TextDiv("No Actions Yet"));
  }

  $("#dashboard-confirms").replaceWith(card);
}

function LoadErrors() {
  title = "Errors";
  card = CreateCardWithTitle(title);
  var errors = resp["errors::"+write_key+".json"];
  let idx = 1;
  let colors = ["#f9c809", "#7e2857"];
  for (var item of errors) {
    item = JSON.parse(item);
    var divs = [];
    for (let key in item) {
      divs.push(
        JoinDivs([
          Boldiv(key, "color:"+colors[idx%2]),
          TextDiv(": "),
          TextDiv(item[key])
        ])
      );
    }
    card.appendChild(
      JoinDivs(divs, true, "Errors", "block") 
    );
    idx++;
  }
  if (errors.length === 0) {
    card.appendChild(TextDiv("No Errors"));
  }
  $("#dashboard-errors").replaceWith(card);
}

function LoadWarnings() {
  title = "Warnings";
  card = CreateCardWithTitle(title);
  var warnings = resp["warnings::"+write_key+".json"];
  let idx = 1;
  let colors = ["#f9c809", "#7e2857"];
  for (var item of warnings) {
    item = JSON.parse(item);
    var divs = [];
    for (let key in item) {
      divs.push(
        JoinDivs([
          BoldDiv(key, "color:"+colors[idx%2]),
          TextDiv(": "),
          TextDiv(item[key])
        ])
      );
    }
    card.appendChild(
      JoinDivs(divs, true, "Errors", "block") 
    );
    idx++;
  }
  if (warnings.length === 0) {
    card.appendChild(TextDiv("No Warnings"));
  }
  $("#dashboard-warnings").replaceWith(card);
}

function LoadPerformance() {
  title = "Performance";
  card = CreateCardWithTitle(title);
  var performance = resp["performance::"+write_key+".json"];
  for (var key in performance) {
    card.appendChild(
      JoinDivs([
        BoldDiv(performance[key], null, {"pos_neg_color":true, "round":4}),
        BoldDiv(": "),
        TextDiv(key.slice(0,-5))
      ], true, title)
    );
  }
  if (performance.length === 0) {
    card.appendChild(TextDiv("Predict Data First"));
  }
  $("#dashboard-performance").replaceWith(card);
}

function LoadTransactions() {
  title = "Transactions";
  card = CreateCardWithTitle(title);
  var transactions = resp["transactions::"+write_key+".json"];
  for (var transaction of transactions) {
    var data = transaction[1];
    let amt;
    let text;
    if (!("type" in data)) {
      amt = data["amount"];
      text = data["stream"].slice(0,-5);
    }
    else if (data["type"] === "create") {
      amt = "-" + data["amount"];
      text = "CREATE " + data["stream"].slice(0,-5);
    }
    else if (data["type"] === "transfer") {
      amt = parseFloat(data["received"]) - parseFloat(data["given"]);
      text = "TRANSFER";
    }
    else {
      amt = 0;
      text = "Unknown";
    }

    card.appendChild(
      JoinDivs([
        BoldDiv(amt, null, {"pos_neg_color":true, "round":4}),
        BoldDiv(": "),
        TextDiv(text)
      ], true, title)
    );

  }
  if (transactions.length === 0) {
    card.appendChild(TextDiv("No Transactions"));
  }
  $("#dashboard-transactions").replaceWith(card);
}
