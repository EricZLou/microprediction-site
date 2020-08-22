const home_url = "/";
const my_styles = [
  "pos_neg_color",
  "round"
]


function Round(item, round_digit) {
  return Number((Number(item)).toFixed(round_digit));
}

function CssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

async function get(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// `added_styles` is a dict that has elements in `my_styles` as keys
function GenDiv(div, text, css_text, added_styles) {
  div.id = "body-text";
  div.innerText = text;
  if (css_text)
    if (!(typeof(css_text) === "string")) {
      console.log("Forgot to put `null` in GenDiv");
      throw "Forgot to put `null` in GenDiv.";
    }
    div.style.cssText += ';' + css_text;
  if (!added_styles)
    return div;

  // check that all added styles are valid
  for (style in added_styles) {
    if (!(my_styles.includes(style)))
      throw style + " is not a valid additional style."
  }

  if ("round" in added_styles) {
    div.innerText = Round(text, added_styles["round"]);
  }
  if ("pos_neg_color" in added_styles) {
    if (Number(text) < 0) {
      div.style.color = "red";
    } else {
      div.style.color = "green";
      div.innerText = "+" + div.innerText;
    }
  }
  return div;
}

function TextDiv(text, css_text, added_styles) {
  var div = document.createElement("div");
  return GenDiv(div, text, css_text, added_styles);
}

function BoldDiv(text, css_text, added_styles) {
  var div = document.createElement("div");
  div.style.fontWeight = "bold";
  return GenDiv(div, text, css_text, added_styles);
}

function JoinDivs(divs, hover, card, display="inline", idx) {
  var parent = document.createElement("div");
  if (hover) {
    parent.id = "div-hover";
  }
  let desired;
  if (!(idx === null)) {
    desired = divs[idx];
  }
  else {
    desired = divs[divs.length-1];
  }
  for (var child of divs) {
    child.style.display = display;
    parent.appendChild(child);
    child.setAttribute("name",desired.textContent);
  }
  if (!hover && !card)
    return parent;
  parent.setAttribute("name",desired.textContent);
  parent.onclick = e => {
    name = e.target.getAttribute("name");
    var loc = "";
    if (card === "Active Streams" || card === "Performance" || card === "Stream Search") {
      var horizon_idx = name.indexOf("::");
      if (horizon_idx === -1) {
        loc = "stream_dashboard.html?stream="+name;
      } else {
        loc = "stream_dashboard.html?stream="+name.slice(horizon_idx+2)+"&horizon="+name.slice(0, horizon_idx);
      }
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
    if (loc)
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

function UnixToHMS(unix) {
  var date = new Date(unix * 1000);
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hours = "0" + date.getHours();
  var minutes = "0" + date.getMinutes();
  var seconds = "0" + date.getSeconds();
  return month+"/"+day + " " + hours.substr(-2) + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
}

window.onclick = function(event) {
  if (!event.target.matches('#dropdown-button')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}