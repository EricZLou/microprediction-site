function RenderList(MIN_LEN) {


// Each of these is a subsection in the FAQ.
// Modify the return value of this function to change the subsections.

// Notice that you can embed HTML and CSS in these strings. 
// NOTE: Only use single quotes within the strings.


const Welcome = [
  [
    "When I publish, does my data become public?",
    "Yes"
  ],
  [
    "When I publish, what gets created?",
    "History, timestamps, community forecasts at different horizons, community z-scores, predictions of community z-scores, plots and other artifacts useful for nowcasting, anomaly detection, alerting, outlier classification, filtering and so forth, all easily accessed by html requests or Python client."
  ],
  [
    "When I publish, I really get all that?",
    "Yep"
  ],
  [
    "Do I have to use Python?",
    "No. You can use the API directly. \
    <ol> \
        <li> Send a PUT request to /live/YOUR_STREAM_NAME with a scalar value in the data payload. </li> \
        <li> Make GET requests (e.g. /cdf/YOUR_STREAM_NAME) to retrieve the predicted distribution. </li> \
    </ol> \
    See the <a href='api'>API page</a>."
  ],
]



const Why = [
  [
    "My people have Ph.D.'s in math, why do I need this?",
    "It is expensive, time consuming and ultimately impossible for any individual to survey the vast space of modeling techniques and potentially relevant data for any given problem. Here you can tap into a diverse group of people, data and methodologies."
  ],
  [
    "Why don't I use vendor X instead to \"micropredict\"?",
    "Perhaps you should. Some are very good. This API provides an easy way to benchmark them. See next answer."
  ],
  [
    "I already have a good predictive model. Why do I need this?",
    "Try this: \
    <ol> \
      <li> Publish your model residuals (prediction errors), or </li> \
      <li> Publish transformed data, and also use your existing model to <a href='crawling.html'>crawl</a>. </li> \
    </ol> \
    The first option may be slightly easier. See the <a href='publishing.html'>instructions</a>. Either way, before long this site will provide you with ongoing performance analysis of your model and accurate distributional description of your residuals. It may be that your model is great, and you will have proof! On the other hand the following is also possible: \
    <ol> \
      <li> Sooner or later your residuals will correlate to a data source you don't know about. </li> \
      <li> You'll be able to combine the information here with you model to make a better one. </li> \
      <li> The algorithm you include here might also predict something else well. </li> \
    </ol> \
    It is quicker to benchmark an existing prediction methdology than to wax philosophical on the matter."
  ],
  [
    "Are the predictions here better than elsewhere?",
    "We make no such claim. But we can certainly make an argument that <em>asymptotically</em> the predictions are likely to be worth the time you take to publish. Every week people are adding more self-navigating, self-updating time series models into the mix."
  ],
]



const Guidelines = [
  [
    "On what frequency should I publish my data?",
    "At time of writing, predictions get quarantined for 70 seconds; 15 minutes plus 10 seconds; 3 hours plus 10 seconds; and for 3555 seconds (just short of an hour). See <a href='https://config.microprediction.org/config.json'>config.json</a>. For the purpose of discussion, we shall presume that you are most interested in the 15 minute horizon. Then there are two main cases: \
    <ol> \
      <li> <em>Absolute levels</em>. Say you want people to predict the absolute level of a quantity <em>roughly</em> 15 minutes ahead. You are better off publishing once every 16 or 20 minutes to avoid race conditions. This gives the algorithms a minute or so to absorb the most recent data point.</li> \
      <li> <em>Changes</em> to near-martingales. On the other hand if you want people to predict a quantity that is approximately a martingale (like a stock price) or a differenced quantity inherently very hard to predict (some types of model residuals) then you might want to publish the <em>difference</em> of that value sampled every 15 minutes instead - just shy of the 910 second quarantine time. The rationale here is that most algorithms will not need to update their predictions very much. They can make their prediction of the difference a few minutes prior to the 15 minute cutoff without unduly hurting their chances.</li> \
      <li> <em>Longer term</em> forecasts. If you publish one data point a day, then you will <em>probably</em> receive quite a few day-ahead forecasts, even though rewards will be based on any prediction that has been quarantined for only an hour. </li> \
    </ol>"
  ],
  [
    "Should I standardize my data?",
    "Yes this helps though not absolutely mandatory. Ideally the spread of forecasts for the next data point should be on the order of unity, as compared with, say 10000 or 0.0001."
  ],
  [
    "Should I transform my data?",
    "That can help. In general you should think about using the prediction API the same way you think about time series forecasting pre-processing. Differencing and transformations may be helpful. You want to attract the best algorithms and not just those that specialize in finding edge cases to exploit."
  ],
]



const Predicting = [
  [
    "Can I retrieve moments, such as the mean prediction?",
    "The CDF provides a slightly noisy estimate. A better, more precise answer is on the way."
  ],
  [
    "Can I use this for anomaly / outlier detection?",
    "Yes because z-streams directly tell you how surprising each data point is."
  ],
  [
    "Can I ask for joint distributions?",
    "Yes. This is an advanced use case requiring a truly rare MUID (length " + MIN_LEN + "+1, see <a href='https://config.microprediction.org/config.json'>config.json</a>). You can use the Copula API (or MicroWriter.cset method) to simultaneously set the value of multiple streams. \
    This triggers prediction of: \
    <ol> \
        <li> Margins</li> \
        <li> Implied z-scores for each margin</li> \
        <li> Pairs and triples of Z-scores projected from R^2 or R^3 back into one dimension using a Morton space filling Z-curve.</li> \
        <li> Implied z-scores of the projected Z-scores.</li> \
    </ol> \
    If z-scores of z-curve projections of implied z-scores sounds a bit elaborate, it may well be. It is certainly an experimental feature. However it encourages a separation of concerns in attacking an extremely difficult problem - the construction of accurate multi-dimensional joint distributions. You can read about <a href='https://en.wikipedia.org/wiki/Z-order_curve' target='_blank'>Z-order curves</a> at Wikipedia. The use of space filling curves as a means of indirectly describing Copulas is not entirely standard, but that doesn't make it a terrible idea. Suffice to say for now that the standard deviation of the projection relates closely to the correlations of the variables in question. We may provide a longer technical discussion in due course."
  ],
  [
    "Over what horizon will my data be predicted?",
    "You data will be predicted roughly 1 minute, 5 minutes, 15 minutes and 1 hours ahead. See the current <a href='https://config.microprediction.org/config.json'>delays parameter</a> for a precise number of seconds. Chances are only one of those horizons may be of interest."
  ],
  [
    "Can I predict my own stream?",
    "Absolutely."
  ],
  [
    "Who contributes algorithms?",
    "Absolutely <em>anyone</em> can -- even algorithms can create algorithms."
  ],
  [
    "What prevents someone from creating thousands of spurious algorithms?",
    "They would need to mine a lot of MUIDs."
  ],
]



const Misc = [
  [
    "Are there house algorithms?",
    "Yes we spend some time assembling some of the best open source prediction packages and ensuring the crawlers make use of them. That way you get good predictions. However the true power will come from the contribution of others."
  ],
  [
    "Can I offer prizemoney?",
    "info@microprediction.org"
  ],
  [
    "Are others offering prizemoney?",
    "Micropredictions, LLC will be offering compensation for various types of contribution to this project on behalf of Intech Investments. Incentives are provided for the creation of high performing prediction algorithms."
  ],
  [
    "Where can I suggest ideas for new streams?",
    "Maybe add to the vague ideas <a href='https://github.com/microprediction/microprediction/projects/3'>project panel</a> but if you can't locate the data don't expect someone else to."
  ],
]



return {
  "Welcome": Welcome,
  "Why you should publish data": Why,
  "Guidelines for publishing streams": Guidelines,
  "Predicting your stream": Predicting,
  "Miscellaneous": Misc,
}


}


function RenderFAQ(min_len) {
  CATEGORIES = RenderList(min_len);
  LoadFAQ(CATEGORIES);
}
