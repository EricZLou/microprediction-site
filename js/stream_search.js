const base_url = "https://www.microprediction.com/";

var full_div;

async function LoadStreams() {
  var url = base_url + "budgets/";
  const request = new Request(url, {method: 'GET'});

  var dict = await Fetch(request);
  full_div = document.getElementById("stream-search");
 
  var all_streams = [];

  for (let key in dict) {
    if (key.slice(-11, -5) === "~10810" || key.slice(-7, -5) === "~1" || key.slice(-7, -5) === "~5") 
      continue;
    all_streams.push(key.slice(0,-5));
  }
  for (stream of all_streams) {
    full_div.appendChild(
      JoinDivs([TextDiv(stream)], true, "Stream Search")
    );
  }

}