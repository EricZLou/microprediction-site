const base_url = home_url;

async function LoadLeaderboard() {
  const url = base_url + "overall/";
  const dict = await get(url);

  let leaderboard_div = document.getElementById("leaderboard");

  // Empty leaderboard
  if (Object.keys(dict).length === 0) {
    leaderboard_div.appendChild(
      TextDiv("No leaderboard available.", null, null, null, true)
    );
    return;
  }

  // Construct the table row by row
  let table = document.createElement("TABLE");
  table.classList.add("default-table");
  table.classList.add("leaderboard-table");
  let new_row = table.insertRow(-1);

  // Header row
  for (let head of ["Rank", "MUID", "Points"]) {
    let header_cell = document.createElement("TH");
    header_cell.innerHTML = head;
    new_row.appendChild(header_cell);
  }
  let place = 1;

  // All subsequent rows
  for (let name in dict) {
    let new_row = table.insertRow(-1);
    let new_cell = new_row.insertCell(-1);
    new_cell.appendChild(TextDiv(place));
    new_cell = new_row.insertCell(-1);
    // Use "Carryover" instead of "null"
    if (name === "null")
      new_cell.appendChild(TextDiv("Carryover"));
    else
      new_cell.appendChild(TextDiv(name));
    new_cell = new_row.insertCell(-1);
    new_cell.appendChild(TextDiv(dict[name], true, 3));
    place = place + 1;
  }

  leaderboard_div.appendChild(table);
}
