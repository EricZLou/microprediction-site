const base_url = home_url;

async function LoadLeaderboard() {
  var url = base_url + "overall/";
  const request = new Request(url, {method: 'GET'});

  var dict = await Fetch(request);

  leaderboard_div = document.getElementById("leaderboard");

  if (Object.keys(dict).length === 0) {
    leaderboard_div.appendChild(
      TextDiv("No leaderboard available.", null, null, null, true)
    );
    leaderboard_div.appendChild(space_div);
    return;
  }

  let table = document.createElement("TABLE");
  table.classList.add("default-table");
  let new_row = table.insertRow(-1);
  for (head of ["Rank", "MUID", "Points"]) {
    let header_cell = document.createElement("TH");
    header_cell.innerHTML = head;
    new_row.appendChild(header_cell);
  }
  let place = 1;
  for (name in dict) {
    let new_row = table.insertRow(-1);

    let new_cell = new_row.insertCell(-1);
    new_cell.appendChild(TextDiv(place));
    new_cell = new_row.insertCell(-1);
    new_cell.appendChild(TextDiv(name));
    new_cell = new_row.insertCell(-1);
    new_cell.appendChild(TextDiv(dict[name], true, 3));

    place = place + 1;
  }
  leaderboard_div.appendChild(table);
}
