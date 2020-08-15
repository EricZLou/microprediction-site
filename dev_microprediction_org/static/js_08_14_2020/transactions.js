const base_url = home_url + "transactions/";

let resp;
let num_visible = 0;
const NUM_TO_SHOW = 20;
var muid_dict = {};

// The first time the page is loaded. 
// Get the entire transaction json --> Call `LoadTransactions`.
async function OnLoadTransactions() {
  const write_key = JSON.parse(localStorage.getItem('microprediction_key_current'))[0];
  const url = base_url+write_key+"/";
  resp = await get(url);
  await LoadTransactions();
  document.getElementById("box-href").href = "transactions/" + write_key + "/";
  document.getElementById("box-info-loaded-from").style.display = "inline-block";  
}

// Called by `OnLoadTransactions` and also called on `Load More` button click.
async function LoadTransactions() {
  let transactions_div = document.getElementById("transactions");
  // Create `NUM_TO_SHOW`-more transaction divs
  for (const transaction of resp.slice(num_visible, num_visible + NUM_TO_SHOW)) {
    // No more transactions to show.
    if (num_visible === resp.length - 1) {
      document.getElementById("see-more-button").style.display = "none";
      document.getElementById("see-more-text").style.display = "inline";
      break;
    }
    num_visible++;
    let transaction_div = await CreateTransactDiv(transaction[1]);
    transactions_div.appendChild(transaction_div);
  }
  let hr = document.createElement("hr");
  transactions_div.appendChild(hr);
}

async function GetReadableMUID(hex) {
  if (hex in muid_dict) {
    return muid_dict[hex];
  }
  var url = "https://www.muid.org/readable/" + hex;
  let readable_hex = await get(url);
  readable_hex = readable_hex.substring(0, 13) + "...";
  muid_dict[hex] = readable_hex;
  return readable_hex;
}

async function CreateTransactDiv(item) {
  let transact_div = document.createElement("div");
  transact_div.id = "confirm-transact-card";

  // NORMAL TRANSACTION
  if (!("type" in item)) {
    let amount_div = TextDiv(item["amount"], true, 5, null, true);
    let stream_div = TextDiv(item["stream"].slice(0, -5), null, null, null, true);
    let delay_div = TextDiv(item["delay"], null, null, null, true);
    let time_div = TextDiv(item["settlement_time"].slice(0, 16), null, null, null, true);
    let submissions_close_div = TextDiv(item["submissions_close"], null, null, CssVar('--theme-purple'), true);
    let submissions_total_div = TextDiv(item["submissions_count"], null, null, CssVar('--theme-purple'), true);
    let readable_muid = await GetReadableMUID(item["stream_owner_code"]);
    let stream_owner_div = TextDiv(readable_muid, null, null, null, true);

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
        TextDiv(" / ", null, null, CssVar('--theme-purple'), true),
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
    let amount_div = TextDiv("-"+item["amount"], true, null, null, true);
    let stream_div = TextDiv(item["name"].slice(0, -5), null, null, null, true);
    let time_div = TextDiv(item["settlement_time"].slice(0, 16), null, null, null, true);
    let message_div = TextDiv(item["message"]);

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
    // TODO: Figure out these values.
    let amount_given_div = TextDiv(item["given"], true, null, null, true);
    // let amount_received_div = TextDiv(item["received"], true, null, null, true);
    let max_given_div = TextDiv(item["max_to_give"], false, 2, null, true);
    let max_received_div = TextDiv(item["max_to_receive"], false, 2, null, true);
    let source_div = TextDiv(item["source"]);
    let recipient_div = TextDiv(item["recipient"]);
    let time_div = TextDiv(item["settlement_time"].slice(0, 16), null, null, null, true);

    transact_div.appendChild(
      JoinDivs([
        TextDiv("Gave ", null, null, "#7e2857", true),
        amount_given_div
        // TextDiv(" and received ", null, null, "#7e2857", true),
        // amount_received_div
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