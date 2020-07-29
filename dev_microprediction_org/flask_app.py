from flask import Flask, jsonify, redirect, request, render_template
from flask_cors import CORS
import muid, json, datetime
from rediz.client import Rediz
import plotly
import plotly.graph_objs as go
import pandas as pd

from constants import API_URL, BASE_URL

app = Flask(__name__,static_folder="static")
CORS(app)



# --------------------------------------------------------------------------
#            Redirect / --> /dashboard.html
# --------------------------------------------------------------------------

@app.route('/', strict_slashes=False)
def home_reroute():
    return render_template('dashboard.html')

# --------------------------------------------------------------------------
#            Redirect / --> api for all routes and API calls
# --------------------------------------------------------------------------

@app.route('/<path:url>', strict_slashes=False)
def reroute(url):
    return redirect(API_URL + url, code=302)




# --------------------------------------------------------------------------
#            Config
# --------------------------------------------------------------------------

# Whereas the Microprediction client can load conventions from config.microprediction.org, that will be too slow here
# so we hardwire the conventions. However this must be kept in sync. TODO: Load both from common config file.
MICRO_CONVENTIONS = {"base_url":BASE_URL,
                   "num_predictions":225,
                   "delays":[70,310,910,3555],
                   "min_balance":-1,
                   "min_len":12}

# Hosted on redis labs
REDIS_CONFIG = {"password":"REthunD3r1",
                "host":"redis-19020.c9156.us-east-1-mz.ec2.cloud.rlrcp.com",
                "port":"19020"}

OTHER_REDIZ_CONFIG = { "delay_grace":30,# promises expiry after delivery
                 "lagged_len":10000,
                 "max_ttl":100*60*60,   # Survive long weekend
                 "obscurity":"gc-",
                 "windows":[0.01,0.1],
                }

REDIZ_CONFIG = MICRO_CONVENTIONS
REDIZ_CONFIG.update(REDIS_CONFIG)
REDIZ_CONFIG.update(OTHER_REDIZ_CONFIG)


#------- EXPERIMENTAL -- PLOTLY ... will move this to plots.microprediction.org -------------

@app.route('/bar')
def bar():
    name = request.args.get('name')
    data  = lagged_bar(name)
    return render_template('bar.html',plot=data) #this has changed

def lagged_bar(name):
    rdz = Rediz(**REDIZ_CONFIG)
    try:
        lagged_values = rdz.get_lagged_values(name=name)
        lagged_times  = rdz.get_lagged_times(name=name)
        lagged_dt     = [ datetime.datetime.fromtimestamp(t).strftime('%c') for t in lagged_times ]
        df = pd.DataFrame({'t': reversed(lagged_dt), 'v': reversed(lagged_values)}) # creating a sample dataframe
        data = [
            go.Bar(
                x=df['t'],
                y=df['v']
            )
        ]
        graphJSON = json.dumps(data, cls=plotly.utils.PlotlyJSONEncoder)
    except:
        df = pd.DataFrame({'t': [], 'v': []}) # creating a sample dataframe
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
    return render_template('histogram.html',plot=data) #this has changed

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
    return render_template('bar.html',plot=data) #this has changed

def cdf_bar(name,delay=None):
    rdz = Rediz(**REDIZ_CONFIG)
    try:
        cdf = rdz.get_cdf(name=name,delay=int(delay or rdz.delays[0]))
        df = pd.DataFrame({'x': cdf['x'], 'y': cdf['y']}) # creating a sample dataframe
        data = [
            go.Line(
                x=df['x'],
                y=df['y']
            ) ]
        graphJSON = json.dumps(data, cls=plotly.utils.PlotlyJSONEncoder)
    except:
        # hardcoded dummy values
        df = pd.DataFrame({'x': [], 'y': []}) # creating a sample dataframe
        data = [
            go.scatter.Line(
                x=df['x'],
                y=df['y']
            ) ]
        graphJSON = json.dumps(data, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON


# ----------   Functionality that might be moved to rediz library -----

MIN_BALANCE = REDIZ_CONFIG["min_balance"]
DELAYS = REDIZ_CONFIG["delays"]
MIN_LEN = int(REDIZ_CONFIG["min_len"])
NUM_PREDICTIONS = REDIZ_CONFIG["num_predictions"]

def bankruptcy(write_key_len):
    rdz = Rediz(**REDIZ_CONFIG)
    return rdz.bankruptcy(write_key_len)

def key_len(key):
    return muid.difficulty(key)

def length_based_budget(write_key_len):
    return abs(bankruptcy(write_key_len)/bankruptcy(write_key_len))


# -------- CONFIG SERVING -----

# DEPRECATED ... robots use config.microprediction.org instead
@app.route('/config.json')
def config():
    public = ('num_predictions','delays','min_len','min_balance')
    public_config = dict([ (k,v) for k,v in REDIZ_CONFIG.items() if k in public ] )
    print('should not be hitting this API config.microprediction is preferred',flush=True)
    return jsonify(public_config)

# ---------- CONTENT PAGES ...------------------

@app.route('/contact.html')
def contact():
    return render_template('contact.html')

@app.route('/terms.html')
def terms():
    return render_template('terms.html')

@app.route('/july.html')
def july():
    return render_template('july.html')

@app.route('/status.html')
def status():
    return render_template('status.html')

@app.route('/about.html')
def about():
    return render_template('about.html')

@app.route('/announcements.html')
def announcements():
    return render_template('annoucements.html')

@app.route('/gallery.html')
def gallery():
    return render_template('gallery.html')

@app.route('/publishing.html')
def publishing():
    return render_template('publishing.html',min_len=str(MIN_LEN))

@app.route('/publishing_faq.html')
def publishing_faq():
    return render_template('publishing_faq.html',min_len=str(MIN_LEN))

@app.route('/predicting.html')
def predicting():
    return render_template('predicting.html',num_predictions=str(NUM_PREDICTIONS))

@app.route('/predicting_faq.html')
def predicting_faq():
    return render_template('predicting_faq.html',min_len=str(MIN_LEN),num_predictions=str(NUM_PREDICTIONS))

@app.route('/crawling.html')
def crawling():
    return render_template('crawling.html',num_predictions=str(NUM_PREDICTIONS))

@app.route('/muids.html')
def muids():
    return render_template('muids.html' ,min_len=str(MIN_LEN))

@app.route('/plotting.html')
def plotting():
    return render_template('plotting.html')

@app.route('/downloading.html')
def downloading():
    return render_template('downloading.html')

@app.route('/contribute.html')
def contribute():
    return render_template('contribute.html')

@app.route('/leaderboard.html')
def leaderboard():
    return render_template('leaderboard.html')

@app.route('/stream_search.html')
def stream_search():
    return render_template('stream_search.html', delays=DELAYS)


# ---------- DASHBOARD PAGES -------------

@app.route('/dashboard.html')
def dashboard():
    # return render_template('dashboard.html')
    return redirect("/")

@app.route('/stream_dashboard.html')
def stream_dashboard():
    stream = request.args.get('stream')+".json"
    delay = request.args.get('horizon')
    if delay:
        plot = cdf_bar(name=stream,delay=delay)
    else:
        plot = lagged_bar(stream)
    return render_template('stream_dashboard.html', plot=plot, all_delays=DELAYS)

@app.route('/confirmations.html')
def confirmations():
    return render_template('confirmations.html')

@app.route('/transactions.html')
def transactions():
    return render_template('transactions.html')


# ----------- CONTEST PAGES -------------

@app.route('/contests.html')
def contests():
    return render_template('contests.html')

@app.route('/intech.html')
def intech():
    return render_template('intech.html')


# ---------- EXTRA ITEMS -----------

@app.route('/header.html')
def header():
    return render_template('header.html')

@app.route('/header_test.html')
def header_test():
    return render_template('header_test.html')

@app.route('/header_small.html')
def header_small():
    return render_template('header_small.html')

@app.route('/header_big.html')
def header_big():
    return render_template('header_big.html')

@app.route('/footer.html')
def footer():
    return render_template('footer.html')



@app.route('/donate.sh')
def donate():
    return redirect("https://raw.githubusercontent.com/microprediction/microprediction/master/donations/donate.sh", code=302)

@app.route('/donating.sh')
def donating():
    return redirect("https://raw.githubusercontent.com/microprediction/muid/master/examples/one_liner.sh", code=302)

@app.route('/miner.sh')
def miner():
    return redirect("https://raw.githubusercontent.com/microprediction/muid/master/examples/mine_from_venv.sh", code=302)

@app.route('/mine.sh')
def mine():
    return redirect("https://raw.githubusercontent.com/microprediction/muid/master/examples/one_liner.sh", code=302)

@app.route('/splash.html')
def splash():
    return render_template('splash.html')

@app.route('/collider/welcome.html')
def welcome():
    return render_template('welcome.html',**request.args)


