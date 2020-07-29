const base_url = home_url;

var full_div;

async function LoadStreams(delays) {
  var url = base_url + "budgets/";
  const request = new Request(url, {method: 'GET'});

  var dict = await Fetch(request);
  full_div = document.getElementById("stream-search");

  var all_streams = [];
  var reg_streams = [];
  var z1_streams = [];
  var z2_streams = [];
  var z3_streams = [];

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
  for (stream of reg_streams)
    all_streams.push(stream);
  for (stream of z1_streams)
    all_streams.push(stream);
  for (stream of z2_streams)
    all_streams.push(stream);
  for (stream of z3_streams)
    all_streams.push(stream);
  for (stream of all_streams) {
    full_div.appendChild(
      JoinDivs([TextDiv(stream)], true, "Stream Search")
    );
  }

}