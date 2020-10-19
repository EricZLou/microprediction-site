from flask import Flask, jsonify, redirect, request, render_template
from flask_cors import CORS
import muid, json, datetime
from rediz.client import Rediz
import plotly
import plotly.graph_objs as go
import pandas as pd

from constants import API_URL, BASE_URL
from redis_config import REDIS_CONFIG

app = Flask(__name__,static_folder="static")
CORS(app)


# --------------------------------------------------------------------------
#            Redirect / --> /dashboard.html
# --------------------------------------------------------------------------

@app.route('/', strict_slashes=False)
def home_reroute():
    return render_template('dashboard/dashboard.html')

# --------------------------------------------------------------------------
#            Redirect / --> api for all routes and API calls
# --------------------------------------------------------------------------

@app.route('/<path:url>', strict_slashes=False)
def reroute(url):
    # Hack because the API for `overall` ends in a `/`. So, flask does not
    # capture any of the `?with_repos=True` part.
    with_repos = request.args.get('with_repos')
    if with_repos:
        return redirect(API_URL + url + "?with_repos=True", code=302)
    return redirect(API_URL + url, code=302)

# --------------------------------------------------------------------------
#            Fast HTML routes
# --------------------------------------------------------------------------

COM = "https://www.microprediction.com/"

@app.route('/api')
def api():
    return redirect(API_URL, code=302)
@app.route('/github')
def github():
    return redirect("https://github.com/microprediction/microprediction", code=302)
@app.route('/contact')
def contact():
    return redirect(COM + "contact-us", code=302)
@app.route('/faq')
def faq():
    return redirect(COM + "knowledge-center", code=302)
@app.route('/muids')
def muids():
    return redirect(COM + "private-keys", code=302)
@app.route('/competitions')
def competitions():
    return redirect(COM + "competitions", code=302)
@app.route('/get-predictions')
def get_predictions():
    return redirect(COM + "get-predictions", code=302)
@app.route('/make-predictions')
def make_predictions():
    return redirect(COM + "make-predictions", code=302)
@app.route('/python-1')
def lesson_python_1():
    return redirect(COM + "python-1", code=302)
@app.route('/python-4')
def lesson_python_4():
    return redirect(COM + "python-4", code=302)
@app.route('/welcome-3')
def welcome_3():
    return redirect(COM + "welcome-3", code=302)

# --------------------------------------------------------------------------
#            Config
# --------------------------------------------------------------------------

# Whereas the Microprediction client can load conventions from config.microprediction.org, 
# that will be too slow here, so we hardwire the conventions. However this must be kept in
# sync. 
# TODO: Load both from common config file.
MICRO_CONVENTIONS = {"base_url":BASE_URL,
                   "num_predictions":225,
                   "delays":[70,310,910,3555],
                   "min_balance":-1,
                   "min_len":12}

OTHER_REDIZ_CONFIG = { "delay_grace":30,# promises expiry after delivery
                 "lagged_len":10000,
                 "max_ttl":100*60*60,   # Survive long weekend
                 "obscurity":"gc-",
                 "windows":[0.01,0.1],
                }

REDIZ_CONFIG = MICRO_CONVENTIONS
REDIZ_CONFIG.update(REDIS_CONFIG)
REDIZ_CONFIG.update(OTHER_REDIZ_CONFIG)




# --------------------------------------------------------------------------
#            EXPERIMENTAL -- PLOTLY ... will move this to plots.microprediction.org
# --------------------------------------------------------------------------

@app.route('/bar')
def bar():
    name = request.args.get('name')
    data  = lagged_bar(name)
    return render_template('plots/bar.html',plot=data) #this has changed

def lagged_bar(name):
    rdz = Rediz(**REDIZ_CONFIG)
    try:
        lagged_values = rdz.get_lagged_values(name=name)
        lagged_times  = rdz.get_lagged_times(name=name)
        lagged_dt     = [ datetime.datetime.fromtimestamp(t).strftime('%c') for t in lagged_times ]
        df = pd.DataFrame({'t': reversed(lagged_dt), 'v': reversed(lagged_values)})
    except:
        df = pd.DataFrame({'t': [], 'v': []})
    data = [
        go.Bar(
            x=df['t'],
            y=df['v']
        )
    ]
    graphJSON = json.dumps(data, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON

@app.route('/histogram')
def histogram():
    name = request.args.get('name')
    data = lagged_histogram(name)
    return render_template('plots/histogram.html',plot=data) #this has changed

def lagged_histogram(name):
    rdz = Rediz(**REDIZ_CONFIG)
    lagged_values = rdz.get_lagged_values(name=name)
    data = [ go.Histogram(x=lagged_values) ]
    graphJSON = json.dumps(data, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON

@app.route('/cumulative')
def cumulative():
    name  = request.args.get('name')
    delay = request.args.get('delay')
    data  = cdf_bar(name=name,delay=delay)
    return render_template('plots/bar.html',plot=data) #this has changed

def cdf_bar(name,delay=None):
    rdz = Rediz(**REDIZ_CONFIG)
    try:
        cdf = rdz.get_cdf(name=name,delay=int(delay or rdz.delays[0]))
        df = pd.DataFrame({'x': cdf['x'], 'y': cdf['y']})
    except:
        df = pd.DataFrame({'x': [], 'y': []})
    data = [
        go.Line(
            x=df['x'],
            y=df['y']
        ) ]
    graphJSON = json.dumps(data, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON




# --------------------------------------------------------------------------
#            Constants that some HTML pages need
# --------------------------------------------------------------------------

MIN_BALANCE = REDIZ_CONFIG["min_balance"]
DELAYS = REDIZ_CONFIG["delays"]
MIN_LEN = int(REDIZ_CONFIG["min_len"])
NUM_PREDICTIONS = REDIZ_CONFIG["num_predictions"]




# --------------------------------------------------------------------------
#            MAIN CONTENT PAGES (organized like so)
#
#            1. h1_publish_data        (header dropdown)
#            2. h2_submit_predictions  (header dropdown)
#            3. h3_data_streams        (header dropdown)
#            4. h4_learn_more          (header dropdown)
#            5. BOARDS                 (leaderboards + dashboards)
#            6. CONTESTS
#            7. HEADERS
#            8. OTHERS                 (in progress pages)
# --------------------------------------------------------------------------


# --------------------------------------------
#            H1 PUBLISH DATA
# --------------------------------------------

@app.route('/publishing.html')
def publishing():
    return render_template('h1_publish_data/publishing.html', 
        min_len=str(MIN_LEN))


# --------------------------------------------
#            H2 SUBMIT PREDICTIONS
# --------------------------------------------

@app.route('/predicting.html')
def predicting():
    return render_template('h2_submit_predictions/predicting.html', 
        num_predictions=str(NUM_PREDICTIONS))

@app.route('/crawling.html')
def crawling():
    return render_template('h2_submit_predictions/crawling.html', 
        num_predictions=str(NUM_PREDICTIONS))


# --------------------------------------------
#            H3 DATA STREAMS
# --------------------------------------------

@app.route('/gallery.html')
def gallery():
    return render_template('h3_data_streams/gallery.html')

@app.route('/browse_streams.html')
def browse_streams():
    return render_template('h3_data_streams/browse_streams.html', 
        delays=DELAYS)


# --------------------------------------------
#            H4 LEARN MORE
# --------------------------------------------

@app.route('/about.html')
def about():
    return render_template('h4_learn_more/about.html')

@app.route('/contribute.html')
def contribute():
    return render_template('h4_learn_more/contribute.html')

@app.route('/features.html')
def features():
    return render_template('h4_learn_more/features.html')


# --------------------------------------------
#            BOARDS
# --------------------------------------------

@app.route('/leaderboard.html')
def leaderboard():
    return render_template('leaderboard.html')

@app.route('/dashboard.html')
def dashboard():
    return redirect("/")

@app.route('/stream_dashboard.html')
def stream_dashboard():
    stream = request.args.get('stream')+".json"
    delay = request.args.get('horizon')
    if delay:
        plot = cdf_bar(name=stream,delay=delay)
    else:
        plot = lagged_bar(stream)
    return render_template('dashboard/stream_dashboard.html', 
        plot=plot, all_delays=DELAYS)

@app.route('/confirmations.html')
def confirmations():
    return render_template('dashboard/confirmations.html')

@app.route('/transactions.html')
def transactions():
    return render_template('dashboard/transactions.html')


# --------------------------------------------
#            CONTESTS
# --------------------------------------------

@app.route('/july.html')
def july():
    return render_template('contests/july.html')


# --------------------------------------------
#            HEADERS
# --------------------------------------------

@app.route('/header_small.html')
def header_small():
    return render_template('header_footer/header_small.html')

@app.route('/header_big.html')
def header_big():
    return render_template('header_footer/header_big.html')

@app.route('/footer.html')
def footer():
    return render_template('header_footer/footer.html')


# --------------------------------------------
#            OTHERS
# --------------------------------------------

@app.route('/terms.html')
def terms():
    return render_template('terms.html')

@app.route('/status.html')
def status():
    return render_template('status.html')
