const base_url = home_url + "transactions/";

var write_key;
var resp;
var max_visible = 0;
var muid_dict = {};

async function OnLoadTransactions() {
  write_key = JSON.parse(localStorage.getItem('microprediction_key_current'))[0];
  var url = base_url+write_key+"/";
  const request = new Request(url, {method: 'GET'});

  fetch(request)
  .then(response => {
    if (response.status !== 200) {
      throw "Response status is not 200: " + response.status;
    } else {
      return response.json();
    }
  })
  .then(json => {
    resp = json;
    LoadTransactions();
    let name = "transactions/" + write_key + "/";
    document.getElementById("box-href").href = name;
    document.getElementById("box-info-loaded-from").style.display = "inline-block";
  })
  .catch(error => {
    console.log("Error Caught");
    console.log(error);
  })
}

async function LoadTransactions() {
  transactions_div = document.getElementById("transactions");
  for (var idx in resp) {
    if (Number(idx) === resp.length - 1) {
      document.getElementById("see-more-button").style.display = "none";
      document.getElementById("see-more-text").style.display = "inline";
    }
    if (idx >= max_visible) {
      if (idx >= max_visible + 20) {
        break;
      }
      console.log(resp[idx][1]);
      transact_div = await CreateTransactDiv(resp[idx][1]);
      transactions_div.appendChild(transact_div);
    }
  }
  max_visible = max_visible + 20;
}

async function GetReadableMUID(hex) {
  if (hex in muid_dict) {
    return muid_dict[hex];
  }

  var url = "https://www.muid.org/readable/" + hex;
  const request = new Request(url, {method: 'GET'});

  let readable_hex = await Fetch(request);
  readable_hex = readable_hex.substring(0, 13) + "...";
  muid_dict[hex] = readable_hex;
  return readable_hex;
}

async function CreateTransactDiv(item) {
  transact_div = document.createElement("div");
  transact_div.id = "confirm-transact-card";

  // NORMAL TRANSACTION
  if (!("type" in item)) {
    amount_div = TextDiv(item["amount"], true, 5, null, true);
    stream_div = TextDiv(item["stream"].slice(0, -5), null, null, null, true);
    delay_div = TextDiv(item["delay"], null, null, null, true);
    time_div = TextDiv(item["settlement_time"].slice(0, 16), null, null, null, true);
    submissions_close_div = TextDiv(item["submissions_close"], null, null, "#706398", true);
    submissions_total_div = TextDiv(item["submissions_count"], null, null, "#706398", true);
    let readable_muid = await GetReadableMUID(item["stream_owner_code"]);
    stream_owner_div = TextDiv(readable_muid, null, null, null, true);

    transact_div.appendChild(
      JoinDivs([
        amount_div,
        TextDiv(" from "),
        stream_div
      ])
    );
    transact_div.appendChild(
      JoinDivs([
        TextDiv("Awarded for "),
        submissions_close_div,
        TextDiv(" / ", null, null, "#706398", true),
        submissions_total_div,
        TextDiv(" submissions")
      ])
    );
    transact_div.appendChild(
      JoinDivs([
        TextDiv("Time: "),
        time_div
      ])
    );
    transact_div.appendChild(
      JoinDivs([
        TextDiv("Delay: "),
        delay_div
      ])
    );
    transact_div.appendChild(
      JoinDivs([
        TextDiv("Stream Owner: "),
        stream_owner_div  
      ])
    );
  }
  // CREATE A STREAM TRANSACTION
  else if (item["type"] === "create") {
    amount_div = TextDiv("-"+item["amount"], true, null, null, true);
    stream_div = TextDiv(item["name"].slice(0, -5), null, null, null, true);
    time_div = TextDiv(item["settlement_time"].slice(0, 16), null, null, null, true);
    message_div = TextDiv(item["message"]);

    transact_div.appendChild(
      JoinDivs([
        TextDiv("Charged ", null, null, null, true),
        amount_div,
        TextDiv(" from "),
        stream_div
      ])
    );
    transact_div.appendChild(
      JoinDivs([
        TextDiv("Time: "),
        time_div
      ])
    );
    transact_div.appendChild(
      message_div
    );
  }
  // TRANSFER KEYS TRANSACTION
  else {
    amount_given_div = TextDiv("-"+item["given"], true, null, null, true);
    amount_received_div = TextDiv(item["received"], true, null, null, true);
    max_given_div = TextDiv(item["max_to_give"], false, 2, null, true);
    max_received_div = TextDiv(item["max_to_receive"], false, 2, null, true);
    source_div = TextDiv(item["source"]);
    recipient_div = TextDiv(item["recipient"]);
    time_div = TextDiv(item["settlement_time"].slice(0, 16), null, null, null, true);

    transact_div.appendChild(
      JoinDivs([
        TextDiv("Gave ", null, null, "#7e2857", true),
        amount_given_div,
        TextDiv(" and received ", null, null, "#7e2857", true),
        amount_received_div
      ])
    );
    transact_div.appendChild(
      JoinDivs([
        TextDiv("Source: "),
        source_div
      ])
    );
    transact_div.appendChild(
      JoinDivs([
        TextDiv("Recipient: "),
        recipient_div
      ])
    );
    transact_div.appendChild(
      JoinDivs([
        TextDiv("Time: "),
        time_div
      ])
    );
    transact_div.appendChild(
      JoinDivs([
        TextDiv("Max to Give: "),
        max_given_div
      ])
    );
    transact_div.appendChild(
      JoinDivs([
        TextDiv("Max to Receive: "),
        max_received_div
      ])
    );
  }

  return transact_div;
}