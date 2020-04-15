const base_url = "https://www.microprediction.com/home/";

var write_key;
var resp;

function FetchAndLoadData(request) {
  fetch(request)
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
        for (var card of document.getElementsByClassName("dashboard-card")) {
          card.style.display = "block";
        }
        resp = json;
        LoadOverview();
        LoadActiveStreams();
        LoadConfirms();
        LoadErrors();
        LoadWarnings();
        LoadPerformance();
        LoadTransactions();
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

function OnLoadDashboard() {
  var text_box = document.getElementById("box-input-write-key");
  text_box.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("box-button-write-key").click();
    }
  });
  write_key = localStorage.getItem('write_key');
  var url = base_url+write_key+"/";
  const request = new Request(url, {method: 'GET'});
  if (write_key) {
    FetchAndLoadData(request);
  }
}

function LoadDashboard() {
  write_key = document.getElementById("box-input-write-key").value;
  if (write_key !== "") {
    var url = base_url+write_key+"/";
    const request = new Request(url, {method: 'GET'});
    FetchAndLoadData(request);
  }
}

function LogOut() {
  document.getElementById("box-log-out").style.display = "none";
  for (var card of document.getElementsByClassName("dashboard-card")) {
    card.style.display = "none";
  }
  document.getElementById("box-input-write-key").value = "";
  localStorage.removeItem("write_key");
}


// HELPER FUNCTION
function CreateCardWithTitle(title) {
  var card = document.createElement("div");
  card.className = "dashboard-card";
  var title_div = document.createElement("div");
  title_div.id = "dashboard-title";
  title_div.innerHTML = title;
  card.appendChild(title_div);
  return card;
}


function LoadOverview() {
  card = CreateCardWithTitle("Overview");
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
  title = "Active Streams";
  card = CreateCardWithTitle(title);
  var streams = resp["/active/"+write_key];
  for (var item of streams) {
    card.appendChild(JoinDivs([TextDiv(item.slice(0,-5))], true, title));
  }
  if (streams.length === 0) {
    card.appendChild(TextDiv("No Active Streams"));
  }
  $("#dashboard-active-streams").replaceWith(card);
}

function LoadConfirms() {
  title = "Confirmations";
  card = CreateCardWithTitle(title);
  var confirms = resp["confirms::"+write_key+".json"];
  for (var item of confirms) {
    var item = JSON.parse(item);
    if (item["operation"] === "set") {
      card.appendChild(
        JoinDivs([
          TextDiv("SET ", pos_neg_color=false, null, exact_color="#f9c809", bold=true),
          TextDiv(item["examples"][0]["name"].slice(0,-5))
        ], true, title)
      );
    } else if (item["operation"] === "submit") {
      card.appendChild(
        JoinDivs([
          TextDiv("SUBMIT ", pos_neg_color=false, null, exact_color="#7e2857", bold=true),
          TextDiv(item["name"].slice(0,-5))
        ], true, title)
      );
    } else {
      card.appendChild(TextDiv("unknown action"));
    }
  }
  if (confirms.length === 0) {
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
