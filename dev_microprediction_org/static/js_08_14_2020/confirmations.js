const base_url = home_url + "confirms/";

let resp;
let num_visible = 0;
const NUM_TO_SHOW = 50;

// The first time the page is loaded. 
// Get the entire confirmation json --> Call `LoadConfirmations`.
async function OnLoadConfirmations() {
  const write_key = JSON.parse(localStorage.getItem('microprediction_key_current'))[0];
  const url = base_url+write_key+"/";
  resp = await get(url);
  LoadConfirmations();
  document.getElementById("box-href").href = "confirms/" + write_key + "/";
  document.getElementById("box-info-loaded-from").style.display = "inline-block";
}

// Called by `OnLoadConfirmations` and also called on `Load More` button click.
function LoadConfirmations() {
  let confirmations_div = document.getElementById("confirmations");
  // Create `NUM_TO_SHOW`-more confirmation divs
  for (const confirm of resp.slice(num_visible, num_visible + NUM_TO_SHOW)) {
    // No more confirmations to show.
    if (num_visible === resp.length - 1) {
      document.getElementById("see-more-button").style.display = "none";
      document.getElementById("see-more-text").style.display = "inline";
      break;
    }
    num_visible++;
    let confirm_div = CreateConfirmDiv(JSON.parse(confirm));
    confirmations_div.appendChild(confirm_div);
  }
  let hr = document.createElement("hr");
  confirmations_div.appendChild(hr);
}

// Logic for creating a generic confirmation div. 
function CreateConfirmDiv(item) {
  let confirm_div = document.createElement("div");
  confirm_div.id = "confirm-transact-card";

  let time_div = document.createElement("div");
  time_div.id = "confirm-time";
  time_div.innerText = item["time"].slice(0,-7);
  confirm_div.appendChild(time_div);

  ////////////////////
  // SET OPERATION
  ////////////////////
  if (item["operation"] === "set") {
    confirm_div.appendChild(
      JoinDivs([
        BoldDiv("SET ", "color:var(--theme-purple);"),
        BoldDiv(item["examples"][0]["name"].slice(0,-5)),
        TextDiv(" to "),
        BoldDiv(item["examples"][0]["value"], null, {"round":8})
      ])
    );
    confirm_div.appendChild(TextDiv("Percentiles:"));
    let percentile_div = document.createElement("div");
    percentile_div.id = "confirm-values";
    for (let key in item["examples"][0]["percentiles"]) {
      percentile_div.appendChild(
        JoinDivs([
          TextDiv(key),
          TextDiv(": "),
          TextDiv(item["examples"][0]["percentiles"][key], null, {"round":5})
        ])
      );
    }
    percentile_div.appendChild(TextDiv("."));
    confirm_div.appendChild(percentile_div);

  ////////////////////
  // SUBMIT OPERATION
  ////////////////////
  } else if (item["operation"] === "submit") {
    confirm_div.appendChild(
      JoinDivs([
        BoldDiv("SUBMIT ", "color:var(--theme-green);"),
        BoldDiv(item["name"].slice(0,-5)),
        TextDiv(" with "),
        BoldDiv(item["delays"]),
        TextDiv(" delay")
      ])
    );
    confirm_div.appendChild(TextDiv("Sample values:"));
    let values_div = document.createElement("div");
    values_div.id = "confirm-values";
    for (let value of item["some_values"]) {
      values_div.appendChild(
        TextDiv(value, null, {"round":5})
      );
    }
    confirm_div.appendChild(values_div);

  ////////////////////
  // TOUCH OPERATION
  ////////////////////
  } else if (item["operation"] === "touch") {
    confirm_div.appendChild(
      JoinDivs([
        BoldDiv("TOUCH ", "color:var('--theme-red');"),
        BoldDiv(item["name"].slice(0,-5))
      ])
    );
    let random_div = document.createElement("div");
    random_div.id = "confirm-values";
    for (var i = 0; i < 7; i++)
      random_div.appendChild(TextDiv("."));
    confirm_div.appendChild(random_div);

  ////////////////////
  // CANCEL OPERATION
  ////////////////////
  } else if (item["operation"] === "cancel") {
    confirm_div.appendChild(
      JoinDivs([
        BoldDiv("CANCEL ", "color:black;"),
        BoldDiv(item["name"]),
        TextDiv(" with "),
        BoldDiv(item["delays"]),
        TextDiv(" delays")
      ])
    );
    confirm_div.appendChild(
      JoinDivs([
        TextDiv("Success: "),
        BoldDiv(item["success"])
      ])
    );
    confirm_div.appendChild(
      JoinDivs([
        TextDiv("Participant: "),
        BoldDiv(item["participant"])
      ])
    );
    confirm_div.appendChild(
      TextDiv(item["explanation"])
    );
    let random_div = document.createElement("div");
    random_div.id = "confirm-values";
    for (var i = 0; i < 3; i++)
      random_div.appendChild(TextDiv("."));
    confirm_div.appendChild(random_div);

  ////////////////////
  // WITHDRAW OPERATION
  ////////////////////
  } else if (item["operation"] === "withdraw") {
    confirm_div.appendChild(
      JoinDivs([
        BoldDiv("WITHDRAW ", "color:black;"),
        BoldDiv(item["name"]),
        TextDiv(" with "),
        BoldDiv(item["delays"]),
        TextDiv(" delays")
      ])
    );
    confirm_div.appendChild(
      JoinDivs([
        TextDiv("Success: "),
        BoldDiv(item["success"])
      ])
    );
    confirm_div.appendChild(
      JoinDivs([
        TextDiv("Code: "),
        BoldDiv(item["code"])
      ])
    );
    let random_div = document.createElement("div");
    random_div.id = "confirm-values";
    for (var i = 0; i < 4; i++) 
      random_div.appendChild(TextDiv("."));
    confirm_div.appendChild(random_div);

  ////////////////////
  // BANKRUPTCY OPERATION
  ////////////////////
  } else if (item["operation"] === "bankruptcy") {
    confirm_div.appendChild(
      JoinDivs([
        BoldDiv("BANKRUPT ON ", "color:black;"),
        BoldDiv(item["name"])
      ])
    );
    confirm_div.appendChild(
      JoinDivs([
        TextDiv("Code: "),
        BoldDiv(item["code"])
      ])
    );
    let random_div = document.createElement("div");
    random_div.id = "confirm-values";
    for (var i = 0; i < 5; i++) 
      random_div.appendChild(TextDiv("."));
    confirm_div.appendChild(random_div);

  ////////////////////
  // UNKNOWN OPERATION
  ////////////////////
  } else {
    confirm_div.appendChild(TextDiv("unknown action"));
  }

  return confirm_div;
}