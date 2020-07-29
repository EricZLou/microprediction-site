import os
import sys


def run():
	path = os.path.join(os.getcwd(), "dev_microprediction_org")
	os.environ["FLASK_APP"] = os.path.join(path, "flask_app.py")
	os.environ["FLASK_ENV"] = "development"
	os.system(f"{sys.executable} -m flask run")

if __name__ == "__main__":
	run()