from flask import Flask, render_template, request, session
import requests
import json
import os
from flask_cors import CORS
from command import command

app = Flask(__name__)
CORS(app)
app.secret_key = "osalayer"
#route for the get command output and change limits
app.register_blueprint(command,url_prefix="")


class OSA:
	#this is the main route to load the main page
	@app.route('/')
	def main():
		main_dictionary ={}
		if 'listofcommands' in session:
			main_dictionary['listofcommands'] = session['listofcommands']
		else:
			session['listofcommands'] = []
			main_dictionary['listofcommands'] = []
		return render_template('dashboard.html',dat=main_dictionary)
	
#this route is to start and real time acquisition starts 
	@app.route('/start')
	def startosa():
		session['counter'] = 0
		start_dict = {}
		newcommands = session['listofcommands']
		newcommands.append('START')
		session['listofcommands'] = newcommands
		try:
			response = requests.get('https://flaskosa.herokuapp.com/cmd/START')
			if 'RUN:OK' in str(response.content):
				session['startresponse'] = "OK"
				start_dict['response'] = "OK"
			else:
				start_dict = "fail"
		except:
			e = sys.exc_info()[0]
			start_dict['response'] = "fail"
			print(e)
		start_dict['listofcommands'] = newcommands
		return start_dict

#this route is to make an operation of single trace
	@app.route('/single')
	def single():
		single_dictionary = {}
		newcommands = session['listofcommands']
		newcommands.append('SINGLE')
		session['listofcommands'] = newcommands
		single_dictionary['listofcommands'] = newcommands
		try:
			single_response = requests.get('https://flaskosa.herokuapp.com/cmd/SINGLE')
			if 'SINGLE:OK' in str(single_response.content):
				single_dictionary['response'] = "OK"
				session['startresponse'] = 'OK'
			else:
				single_dictionary['response'] = "fail"
		except:
			e = sys.exc_info()[0]
			single_dictionary['response'] = "fail"
			print(e)
		return single_dictionary
		
#this route is to get trace 
	@app.route('/gettrace')
	def gettrace():
		trace_data = {}
		if session['startresponse'] == 'OK':
			newcommands = session['listofcommands']
			newcommands.append('TRACE')
			session['listofcommands'] = newcommands
			trace_data['status'] = 'success'
			new_response = requests.get('https://flaskosa.herokuapp.com/cmd/TRACE')
			trace_data['ydata'] = new_response.json()['ydata']
			xdat = new_response.json()['xdata']
			#formulae to convert the value to THz unit
			trace_data['xdata'] = list(map(lambda x: 0.000299792458/x,xdat))
			trace_data['count'] = len(new_response.json()['ydata'])
			trace_data['listofcommands'] = newcommands
		else:
			trace_data['status'] = 'fail'
		return trace_data

#this route is to stop the real time acquisition
	@app.route('/stop')
	def stoposa():
		new_dict = {}
		try:
			response = requests.get('https://flaskosa.herokuapp.com/cmd/STOP')
			if 'OK' in str(response.content):
				new_dict['response'] = 'OK'
			else:
				new_dict['response'] = 'fail'
		except:
			e = sys.exc_info()[0]
			new_dict['response'] = "fail"
		newcommands = session['listofcommands']
		newcommands.append('STOP')
		session['listofcommands'] = newcommands
		new_dict['listofcommands'] = newcommands
		return new_dict


if __name__ == "__main__":
	port = int(os.environ.get("PORT", 5000))
	app.run(debug=True,host="0.0.0.0",port=port)