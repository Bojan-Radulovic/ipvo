# Filename - app.py

# Import flask and datetime module for showing date and time
from flask import Flask
import datetime

x = datetime.datetime.now()

# Initializing flask app
application = Flask(__name__)  # Change 'app' to 'application'

# Route for seeing a data
@application.route('/app-flask/data')
def get_time():
    # Returning an api for showing in reactjs
    return {
        'Name': "Marko",
        "Age": "22",
        "Date": x,
        "programming": "python"
    }

# Running app
if __name__ == '__main__':
    application.run(debug=True, host='0.0.0.0')
