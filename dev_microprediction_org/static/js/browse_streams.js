const base_url = home_url;

let full_div;

async function LoadStreams(delays) {
  const url = base_url + "budgets/";
  const dict = await get(url);
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
    full_div.appendChild(
      JoinDivs([TextDiv(stream)], true, "Stream Search")
    );
  }

}