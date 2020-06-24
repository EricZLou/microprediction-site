const base_url = home_url;


var write_key;
var resp;
var all_active_streams;
var all_confirms;


function LoadAll() {
  let button = document.getElementById("dropbtn2");
  let dropdown = document.getElementById("dropdown");
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
      pairs.splice(i, i+1);
      localStorage.setItem('microprediction_keys', JSON.stringify(pairs));
      localStorage.setItem('microprediction_key_current', JSON.stringify(pairs[0]));
      document.getElementById('box-input-write-key').value = pairs[0][0];
      LoadDashboard();
      break;
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
        resp = json;

        AddLocalStorage();

        document.getElementsByClassName("dropdown2")[0].style.display = "inline-flex";
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
    write_key = pair[0]
    var url = base_url+"home/"+write_key+"/";
    const request = new Request(url, {method: 'GET'});
    await FetchActiveStreams();
    await FetchConfirms();
    await FetchAndLoadData(request);
  }
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
