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
function JoinDivs(divs, hover, card) {
  var parent = document.createElement("div");
  if (hover) {
    parent.id = "div-hover";
  }
  last = divs[divs.length-1];
  for (var child of divs) {
    child.style.display = "inline";
    parent.appendChild(child);
    child.setAttribute("name",last.textContent);
  }
  parent.setAttribute("name",last.textContent);
  parent.onclick = e => {
    name = e.target.getAttribute("name");
    console.log(name);
    var loc;
    if (card === "Active Streams" || card === "Performance") {
      loc = "stream_dashboard.html?stream="+name;
    } else if (card === "Confirmations") {
      loc = "confirmations.html";
    } else if (card === "Transactions") {
      loc = "transactions.html";
    } else if (card === "Errors") {
      ;
    } else if (card === "Warnings") {
      ;
    } else {
      throw "ERROR";
    }
    window.location = loc;
  }
  return parent;
}

function GetUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
}

function Fetch(request) {
  var value;

  return new Promise(function(resolve, reject) {
    fetch(request)
      .then(response => {
        if (response.status !== 200) {
          throw "Response status is not 200: " + response.status;
        } else {
          return response.json();
        }
      })
      .then(json => {
        value = json;
      })
      .catch(error => {
        console.log("Erorr Caught");
        console.log(error);
      })
    .then(() => {
      if (!value) {
        value = "null";
      }
      resolve(value)
    })
  });
}