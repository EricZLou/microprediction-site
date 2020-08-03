function RenderList(MIN_LEN) {


// Each of these is a subsection in the FAQ.
// Modify the return value of this function to change the subsections.

// Notice that you can embed HTML and CSS in these strings. 
// NOTE: Only use single quotes within the strings.


const General = [
  [
    "Where might this lead?",
    "See the <a href='about.html'>why page</a> for futher discussion."
  ],
  [
    "Can I stand up my own version inside a company?",
    "info@microprediction.org"
  ],
  [
    "Will it be maintained?",
    "Yes. Micropredictions, LLC is supporting the open source code development."
  ],
  [
    "How reliable is the underlying hosted database technology?",
    "The typically quoted number is 99.99% uptime. We make no warranties. See <a href='/terms.html'>terms and conditions</a> of use."
  ],
  [
    "Is there some way I can help without doing stats?",
    "Yes you can help us find MUIDs. Email us at info@microprediction.org if you have some spare CPU capacity. Alternatively you can directly support someone else's stream if you know them by using the transfer functionality. See the microprediction package on PyPI and github, or the API."
  ],
  [
    "What are the Z-streams?",
    "Every time a data feed value arrives, an implied z-score is computed based on the existing predictions from yourself and other algorithms. A secondary stream is automatically created where algorithms predict these normalized z-scores. Read <a href='https://www.linkedin.com/pulse/short-introduction-z-streams-peter-cotton-phd/'>An Introduction to Z-Streams</a>."
  ],
]



const MUID = [
  [
    "I don't understand MUIDs.",
    "See <a href='muids.html'>guide to MUIDs</a>. They are just randomly generated numbers that happen to be very lucky, in the sense that the hex digest of their SHA-256 hash looks like a cute animal name. If that doesn't make sense then: \
    <ol> \
      <li> We suggest this <a href='https://vimeo.com/397352413'>video</a> introduction.</li> \
      <li> Or ... if you know what a <a href='http://www.muid.org/hash/fb74baf628d43892020d803614f91f29'>hash</a> is just read the MUID <a href='https://muid.readthedocs.io/en/latest/'>README</a>.</li> \
    </ol> \
    We insist on write_keys being MUIDs to add a bit of mass and discourage abuse, as noted above."
  ],
  [
    "I have an important use but don't want to wait for a MUID.",
    "We have a stockpile of MUIDs for worthwhile purposes. Email us info@microprediction.org"
  ],
  [
    "Can I help you generate MUIDs so they can support civic or worthwhile prediction?",
    "What a great idea! Email us at info@microprediction.org if you have some spare CPU capacity."
  ],
]


return {
  "General": General,
  "MUIDs": MUID,
}


}


function RenderFAQ(min_len) {
  CATEGORIES = RenderList(min_len);
  LoadFAQ(CATEGORIES);
}
