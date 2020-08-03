function RenderList(MIN_LEN, NUM_PREDICTIONS) {


// Each of these is a subsection in the FAQ.
// Modify the return value of this function to change the subsections.

// Notice that you can embed HTML and CSS in these strings. 
// NOTE: Only use single quotes within the strings.


const Welcome = [
  [
    "Is there prizemoney?",
    "Yes. See the footer!"
  ],
  [
    "Is this like the Netflix Prize, or Kaggle, or DrivenData?",
    "No, <a href='https://www.linkedin.com/pulse/dorothy-youre-kaggle-anymore-peter-cotton-phd/'>you're not in Kaggle anymore</a>. Anchor at your peril!",
  ],
  [
    "Do I have to use Python?",
    "No. You can use the API directly. See the <a href='api'>API page</a> or read the <a href='https://github.com/microprediction/microprediction/blob/master/microprediction/writer.py'>MicroWriter</a> code to infer how to send scenarios."
  ],
  [
    "Do you have client libraries in other languages?",
    "Not yet. Write one and you'll certainly be in the running for a contributor prize. See the footer!"
  ],
  [
    "Is the site used for prediction of singlular events like a binary outcome of an election?",
    "No. This is intended for fast moving, repeated predictions that drive intelligent applications, control, alerting, monitoring and optimization of various sorts. See <a href='/about.html'>about</a>."
  ],
]


const DistributionalPredictions = [
  [
    "When I submit a prediction, what exactly do I supply?",
    "You submit " + NUM_PREDICTIONS + " floating point numbers."
  ],
  [
    "How are predictions judged?",
    "You receive a positive or negative score based on how many of your " + NUM_PREDICTIONS + " numbers end up being close to the subsequently revealed truth. The reward also depends on how close other people's guesses are."
  ],
  [
    "Why aren't predictions a single number?",
    "Point estimates are are inherently difficult to interpret and combine. See this <a href='https://www.linkedin.com/pulse/where-badminton-player-move-next-how-should-we-same-peter-cotton-phd/'>article</a> for further discussion."
  ],
  [
    "Over what horizon do I make predictions?",
    "You can supply a delay parameter chosen from your writer or crawler's .DELAYS property (or <a href='https://config.microprediction.org/config.json'>config.json</a>). Approximately: 1m, 5m, 15m and 1hr."
  ],
  [
    "How do I know how many data points ahead I am predicting?",
    "You don't know. However in many cases data is supplied semi-regularly so it is statistically fairly obvious. See <a href='https://www.linkedin.com/pulse/short-introduction-z-streams-peter-cotton-phd/'>An Introduction to Z-Streams</a>"
  ],
]


const Crawling = [
  [
    "Is there a Hello World crawler?",
    "You may wish to start with deriving from SimpleCrawler as described in this <a href='https://www.linkedin.com/pulse/benchmarking-automl-vendors-open-source-time-series-peter-cotton-phd/'>article</a>. That includes links to an example crawler you can modify. A SimpleCrawler will only visit a curated set of regular univariate streams, and is thus a good way to get your feet wet."
  ],
  [
    "Where should I run my crawler?",
    "You can run it locally if you wish. For other suggestions see <a href='https://www.linkedin.com/pulse/you-love-your-algorithm-set-free-peter-cotton-phd/'>If You Love Your Algorithm, Set it Free</a> article."
  ],
]


const BivariateAndTrivariatePrediction = [
  [
    "Can I predict joint outcomes?",
    "For a walkthrough of bivariate and trivariate prediction see <a href='https://www.linkedin.com/pulse/helicopulas-peter-cotton-phd/'>Helicopulas</a> article and <a href='https://www.linkedin.com/pulse/call-contributions-copula-contest-where-carefully-can-cotton-phd/'>cryptocurrency</a> copula articles.</a>"
  ],
]


const Registration = [
  [
    "Where do I register?",
    "You don't have to. Just run a crawler and it will create an identify (write key) for you on the fly."
  ],
  [
    "Can my algorithms solicit their own predictions?",
    "Absolutely. Why not publish your model residuals? You achieve <em>at least</em> ongoing performance analysis of your model, and also an accurate distributional description of your residuals. Perhaps also: \
    <ol> \
      <li> Sooner or later your residuals will correlate to a data source you don't know about.</li> \
      <li> You'll be able to combine the information with you existing model to make a better one.</li> \
    </ol>"
  ],
]


const Misc = [
  [
    "What prevents me from creating thousands of algorithms?",
    "Their associated write_key balances will go bankrupt. Activity like this is also likely to violate the community norms and terms of service."
  ],
  [
    "Where can I suggest ideas for new algorithms?",
    "Add to the <a href='https://github.com/microprediction/microprediction/projects/4'>project panel</a>."
  ],
]


return {
  "Welcome": Welcome,
  "Distributional predictions": DistributionalPredictions,
  "Crawling": Crawling,
  "Bivariate and Trivariate prediction, Z-Streams and all that": 
    BivariateAndTrivariatePrediction,
  "Registration, write keys and MUIDs": Registration,
  "Miscellaneous": Misc,
}


}


function RenderFAQ(min_len, num_predictions) {
  CATEGORIES = RenderList(min_len, num_predictions);
  LoadFAQ(CATEGORIES);
}
