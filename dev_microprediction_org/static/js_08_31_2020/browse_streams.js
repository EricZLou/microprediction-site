const base_url = home_url;

let full_div;

async function LoadStreams(delays) {
  const url = base_url + "budgets/";
  const dict = await get(url);
  const sponsors_url = base_url + "sponsors/";
  const stream_to_animal = await get(sponsors_url);
  const prizes_url = base_url + "prizes/";
  const prizes_list = await get(prizes_url);
  let animal_and_type_to_amount = {}
  for (prize of prizes_list) {
    const animal = await get(base_url + "animal/"+prize["sponsor"]+"/");
    animal_and_type_to_amount[[animal,prize["type"]]] = prize["amount"];
  }

  full_div = document.getElementById("stream-search");

  let all_streams = [];
  let reg_streams = [];
  let z1_streams = [];
  let z2_streams = [];
  let z3_streams = [];

  for (let key in dict) {
    key = key.slice(0,-5)   // remove ".json"
    let idx = key.lastIndexOf("~");
    if (idx === -1) {
      reg_streams.push(key);
      continue;
    }
    if (!(delays.map(String)).includes(key.substr(idx + 1)))
      continue;
    if ("z1~" === key.slice(0,3))
      z1_streams.push(key);
    else if ("z2~" === key.slice(0,3))
      z2_streams.push(key);
    else if ("z3~" === key.slice(0,3))
      z3_streams.push(key);
  }

  for (let stream of reg_streams)
    all_streams.push(stream);
  for (let stream of z1_streams)
    all_streams.push(stream);
  for (let stream of z2_streams)
    all_streams.push(stream);
  for (let stream of z3_streams)
    all_streams.push(stream);


  for (let stream of all_streams) {
    let all_divs = [TextDiv(stream)];
    let type = "regular";
    if (stream.includes("z1~"))
      type = "monovariate";
    else if (stream.includes("z2~"))
      type = "bivariate";
    else if (stream.includes("z3~"))
      type = "trivariate";
    if ([stream_to_animal[stream+".json"], type] in animal_and_type_to_amount) {
      let money_div = document.createElement("button");
      money_div.classList.add("mini-button");
      money_div.classList.add("bg-green");
      // money_div.innerText = "$"+animal_and_type_to_amount[[stream_to_animal[stream+".json"], type]];  
      money_div.innerText = "$$$";  
      all_divs.push(TextDiv(" "));
      all_divs.push(money_div);
    }
    full_div.appendChild(JoinDivs(all_divs, true, "Stream Search", "inline", 0));
  }
}