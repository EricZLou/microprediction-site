const base_url = "https://www.microprediction.org/transactions/";

var write_key;
var resp;
var max_visible = 0;

function OnLoadTransactions() {
  write_key = localStorage.getItem('write_key');
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

function LoadTransactions() {
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
      transact_div = CreateTransactDiv(resp[idx][1]);
      transactions_div.appendChild(transact_div);
    }
  }
  max_visible = max_visible + 20;
}

function CreateTransactDiv(item) {
  transact_div = document.createElement("div");
  transact_div.id = "confirm-transact-card";

  amount_div = TextDiv(item["amount"], true, 5, null, true);
  stream_div = TextDiv(item["stream"].slice(0, -5), null, null, null, true);
  delay_div = TextDiv(item["delay"], null, null, null, true);
  time_div = TextDiv(item["settlement_time"].slice(0, 16), null, null, null, true);

  transact_div.appendChild(
    JoinDivs([
      amount_div,
      TextDiv(" from "),
      stream_div
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
      TextDiv("Time: "),
      time_div
    ])
  );

  return transact_div;
}