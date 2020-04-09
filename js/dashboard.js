const base_url = "https://www.microprediction.com/home/"

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
        console.log("no");
        for (var card of document.getElementsByClassName("dashboard-card")) {
          card.style.display = "block";
          console.log("here");
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
      console.log("Erorr Caught");
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

// HELPER FUNCTION
function TextDiv(item, pos_neg_color=false, round_digit, exact_color, bold) {
  var div = document.createElement("div");
  div.id = "body-text";
  if (!round_digit) {
    div.innerHTML = item;
  } else {
    var value = parseFloat(item);
    div.innerHTML = Math.round((Math.pow(10,round_digit) * value)) / Math.pow(10,round_digit);
  }
  if (pos_neg_color) {
    if (parseFloat(item) < 0) {
      div.style.color = "red";
    } else {
      div.style.color = "green";
      div.innerHTML = "+" + div.innerHTML;
    }
  } else if (exact_color) {
    div.style.color = exact_color;
  }
  if (bold) {
    div.style.fontWeight = "bold";
  }
  return div;
}

// HELPER FUNCTION
function JoinDivs(divs) {
  var parent = document.createElement("div");
  for (var child of divs) {
    child.style.display = "inline";
    parent.appendChild(child);
  }
  return parent;
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
  card = CreateCardWithTitle("Active Streams");
  var streams = resp["/active/"+write_key];
  for (var item of streams) {
    card.appendChild(TextDiv(item));
  }
  if (streams.length === 0) {
    card.appendChild(TextDiv("No Active Streams"));
  }
  $("#dashboard-active-streams").replaceWith(card);
}

function LoadConfirms() {
  card = CreateCardWithTitle("Confirmations");
  var confirms = resp["confirms::"+write_key+".json"];
  for (var item of confirms) {
    var item = JSON.parse(item);
    if (item["operation"] === "set") {
      card.appendChild(
        JoinDivs([
          TextDiv("SET ", pos_neg_color=false, null, exact_color="#f9c809", bold=true),
          TextDiv(item["examples"][0]["name"])
        ])
      );
    } else if (item["operation"] === "submit") {
      card.appendChild(
        JoinDivs([
          TextDiv("SUBMIT ", pos_neg_color=false, null, exact_color="#7e2857", bold=true),
          TextDiv(item["name"])
        ])
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
  card = CreateCardWithTitle("Errors");
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
  card = CreateCardWithTitle("Warnings");
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
  card = CreateCardWithTitle("Performance");
  var performance = resp["performance::"+write_key+".json"];
  for (var key in performance) {
    card.appendChild(
      JoinDivs([
        TextDiv(performance[key], pos_neg_color=true, round_digit=4, null, bold=true),
        TextDiv(": ", null, null, null, bold=true),
        TextDiv(key)
      ])
    );
  }
  if (performance.length === 0) {
    card.appendChild(TextDiv("Predict Data First"));
  }
  $("#dashboard-performance").replaceWith(card);
}

function LoadTransactions() {
  card = CreateCardWithTitle("Transactions");
  var transactions = resp["transactions::"+write_key+".json"];
  for (var transaction of transactions) {
    var data = transaction[1];
    card.appendChild(
      JoinDivs([
        TextDiv(data["amount"], pos_neg_color=true, round_digit=4, null, bold=true),
        TextDiv(": ", null, null, null, bold=true),
        TextDiv(data["stream"])
      ])
    );
  }
  if (transactions.length === 0) {
    card.appendChild(TextDiv("No Transactions"));
  }
  $("#dashboard-transactions").replaceWith(card);
}
