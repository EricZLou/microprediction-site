const base_url = home_url;
const repos_kwarg = "?with_repos=True";
let nav_divs = [];

async function LoadLeaderboardNav() {

  let nav = document.getElementById("leaderboards-sidenav");

  const prizes_url = base_url + "prizes/";
  const overall_url = base_url + "overall/";
  const prizes_list = [overall_url].concat(await get(prizes_url));

  let hash_to_animal = {};
  for (let info of prizes_list) {
    let url;
    let nav_div;
    if (info === overall_url) {
      url = overall_url;
      nav_div = JoinDivs([
        BoldDiv("Overall Leaderboard")
      ]);
      nav_div.classList.add("active-sidenav");
    }
    else {
      url = base_url + info["type"] + "/" + info["sponsor"];
      let money_div = document.createElement("button");
      money_div.classList.add("mini-button");
      money_div.classList.add("bg-green-hover");
      money_div.innerText = "$"+info["amount"];
      const hash = info["sponsor"];
      if (!(hash in hash_to_animal))
        hash_to_animal[hash] = await get("/animal/"+hash+"/");
      nav_div = JoinDivs([
        BoldDiv(hash_to_animal[hash] + ": " + info["type"], "inline-block:break-all"),
        TextDiv(" "),
        money_div
      ]);
    }
    nav_div.classList.add("sidenav-row");
    nav.appendChild(nav_div);
    nav_divs.push(nav_div);
    nav_div.onclick = function() { 
      LoadLeaderboard(url);
      nav_div.classList.add("active-sidenav");
      for (let t_div of nav_divs) {
        if (t_div !== nav_div) 
          t_div.classList.remove("active-sidenav");
      }
    };

  }

  LoadLeaderboard(base_url + "overall/");
}

function PopulateRow(row, place, name, points, repo) {
  let new_cell = row.insertCell(-1);
  new_cell.appendChild(TextDiv(place));
  new_cell = row.insertCell(-1);
  let divs = [];
  // Use "Carryover" instead of "null"
  if (name === "null")
    divs.push(TextDiv("Carryover"));
  else
    divs.push(TextDiv(name));
  if (repo) {
    let repo_div = document.createElement("button");
    repo_div.classList.add("mini-button");
    repo_div.classList.add("bg-red-hover");
    repo_div.onclick = function() {
      window.open(repo);
    };
    repo_div.innerText = "Code";
    divs.push(TextDiv(" "));
    divs.push(repo_div);
  }
  new_cell.appendChild(JoinDivs(divs));
  new_cell = row.insertCell(-1);
  new_cell.appendChild(TextDiv(points, null, {"pos_neg_color":true, "round":3}));
}

async function LoadLeaderboard(url) {
  let dict = await get(url + repos_kwarg);
  let leaderboard_div = document.getElementById("leaderboard");
  leaderboard_div.innerHTML = "";

  // Empty leaderboard
  if (Object.keys(dict).length === 0) {
    leaderboard_div.appendChild(
      BoldDiv("No leaderboard available.")
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
    let points = dict[name][0];
    let repo = dict[name][1];
    let new_row = table.insertRow(-1);
    PopulateRow(new_row, place, name, points, repo);
    place = place + 1;
  }

  leaderboard_div.appendChild(table);
}