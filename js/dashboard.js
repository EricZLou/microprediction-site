const base_url = "https://www.microprediction.org/"
const home_url = base_url+"home/";


var write_key;
var resp;
var all_active_streams;
var all_confirms;

function LoadAll() {
  LoadOverview();
  LoadActiveStreams();
  LoadConfirms();
  LoadErrors();
  LoadWarnings();
  LoadPerformance();
  LoadTransactions();
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
        localStorage.setItem('write_key',write_key);
        document.getElementById("box-log-out").style.display = "inline";
        let name = "home/" + write_key;
        document.getElementById("box-href").href = name;
        document.getElementById("box-info-loaded-from").style.display = "inline-block";
        for (var card of document.getElementsByClassName("shadow-card")) {
          card.style.display = "block";
        }
        resp = json;
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
      console.log("Error Caught");
      console.log(error);
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

async function OnLoadDashboard() {
  var text_box = document.getElementById("box-input-write-key");
  text_box.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("box-button-write-key").click();
    }
  });
  write_key = localStorage.getItem('write_key');
  var url = home_url+write_key+"/";
  const request = new Request(url, {method: 'GET'});
  if (write_key) {
    await FetchActiveStreams();
    await FetchConfirms();
    await FetchAndLoadData(request);
  }
}

async function LoadDashboard() {
  write_key = document.getElementById("box-input-write-key").value;
  if (write_key !== "") {
    var url = home_url+write_key+"/";
    const request = new Request(url, {method: 'GET'});
    await FetchActiveStreams();
    await FetchConfirms();
    if (localStorage.getItem('write_key'))
      await FetchAndLoadData(request, refresh=true);
    else
      await FetchAndLoadData(request);
  }
}

function LogOut() {
  document.getElementById("box-log-out").style.display = "none";
  for (var card of document.getElementsByClassName("shadow-card")) {
    card.style.display = "none";
  }
  document.getElementById("box-input-write-key").value = "";
  document.getElementById("box-info-loaded-from").style.display = "none";
  localStorage.removeItem("write_key");
  location.reload();
}


// HELPER FUNCTION
function CreateCardWithTitle(title) {
  let card = document.createElement("div");
  card.className = "shadow-card";
  var title_div = document.createElement("div");
  title_div.id = "dashboard-title";
  title_div.innerHTML = title;
  card.appendChild(title_div);
  return card;
}


function LoadOverview() {
  let card = CreateCardWithTitle("Overview");
  card.appendChild(TextDiv(resp["code"], null, null, null, bold=true));
  card.appendChild(
    JoinDivs([
      TextDiv("Memorable ID: ", pos_neg_color=false, null, exact_color="#7e2857", bold=true),
      TextDiv(resp["animal"])
    ])
  );
  card.appendChild(
    JoinDivs([
      TextDiv("Balance: ", pos_neg_color=false, null, exact_color="#7e2857", bold=true),
      TextDiv(resp["balance::"+write_key+".json"], pos_neg_color=true, round_digit=4)
    ])
  );
  card.appendChild(
    JoinDivs([
      TextDiv("Distance to Bankruptcy: ", pos_neg_color=false, null, exact_color="#7e2857", bold=true),
      TextDiv(resp["distance_to_bankruptcy"], pos_neg_color=false, round_digit=2)
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
    if (item["operation"] === "set") {
      if (prev_action === "set" && prev_name === item["examples"][0]["name"]) {        
        continue;
      }
      card.appendChild(
        JoinDivs([
          TextDiv("SET ", pos_neg_color=false, null, exact_color="#f9c809", bold=true),
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
          TextDiv("SUBMIT ", pos_neg_color=false, null, exact_color="#7e2857", bold=true),
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
          TextDiv("TOUCH ", pos_neg_color=false, null, exact_color="#339B26", bold=true),
          TextDiv(item["name"].slice(0,-5))
        ], true, title)
      );
      prev_action = "touch";
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
  for (var item of errors) {
    card.appendChild(TextDiv(item));
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
  for (var item of warnings) {
    card.appendChild(TextDiv(item));
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
        TextDiv(performance[key], pos_neg_color=true, round_digit=4, null, bold=true),
        TextDiv(": ", null, null, null, bold=true),
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
    card.appendChild(
      JoinDivs([
        TextDiv(data["amount"], pos_neg_color=true, round_digit=4, null, bold=true),
        TextDiv(": ", null, null, null, bold=true),
        TextDiv(data["stream"].slice(0,-5))
      ], true, title)
    );
  }
  if (transactions.length === 0) {
    card.appendChild(TextDiv("No Transactions"));
  }
  $("#dashboard-transactions").replaceWith(card);
}
