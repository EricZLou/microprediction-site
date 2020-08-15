const base_url = home_url;
const repos_kwarg = "?with_repos=True";
let leaderboard_dict = {};
let nav_divs = [];

async function LoadLeaderboardNav() {

  let nav = document.getElementById("leaderboards-sidenav");

  const prizes_url = base_url + "prizes/";
  const prizes_dict = await get(prizes_url);
  const overall_url = base_url + "overall/";

  leaderboard_dict[overall_url] = [];
  for (let url in prizes_dict)
    leaderboard_dict[url] = prizes_dict[url];

  // TODO: don't forget to use leaderboard_dict[x][1]
  let divs_urls = [];
  for (let url in leaderboard_dict) {
    let nav_div = document.createElement("div");
    nav_divs.push(nav_div);
    if (url === "/overall/") {
      nav_div.innerText = "Overall Leaderboard";
      nav_div.classList.add("active-sidenav");
    }
    else
      nav_div.innerText = url.substring(url.indexOf(".org/")+5);
    nav.appendChild(nav_div);
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
    // repo_div.href = repo;
    repo_div.onclick = function() {
      window.open(repo);
    };
    repo_div.innerText = "Code";
    divs.push(TextDiv(" "));
    divs.push(repo_div);
  }
  new_cell.appendChild(JoinDivs(divs));
  new_cell = row.insertCell(-1);
  new_cell.appendChild(TextDiv(points, true, 3));
}

async function LoadLeaderboard(url) {
  let dict = await get(url + repos_kwarg);
  let leaderboard_div = document.getElementById("leaderboard");
  leaderboard_div.innerHTML = "";

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
    let points = dict[name][0];
    let repo = dict[name][1];
    let new_row = table.insertRow(-1);
    PopulateRow(new_row, place, name, points, repo);
    place = place + 1;
  }

  leaderboard_div.appendChild(table);
}