from flask import Blueprint, render_template, request, session
import sys
import requests

command = Blueprint("command",__name__,static_folder="static",template_folder="templates")

#api to post commands and get output
@command.route('/postcommand/<Command>')
def commands(Command):
    commands_pair = {}
    response = Command
    switcher = {
            0:	"START",
            1:	"STOP",
            2:	"IDN",
            3:	"LIM",
            4:	"ECHO",
            5:  "PING",
            6: 	"SINGLE",
            7:  "STATE",
            8:  "TRACE"
    }
    if response in switcher.values() or 'ECHO' in response or 'LIM' in response:
        newcommands = session['listofcommands']
        newcommands.append(response)
        session['listofcommands'] = newcommands
        if 'ECHO' in response:
            response = response.split(" ",1)
            res = requests.get('https://flaskosa.herokuapp.com/cmd/'+str(response[0])+"/"+str(response[1]))
            res = str(res.content)
            res = res.split("ECHO:")
        elif 'LIM,' in response:
            min_max = response.split(",",1)[1]
            max_value = min_max.split(",")[1]
            min_value = min_max.split(",")[0]
            response = "LIM/["+str(min_value)+","+str(max_value)+"]"
            res = requests.get('https://flaskosa.herokuapp.com/cmd/'+response)
            res = str(res.content)
            res = res.split("READY>")
            res[1] = "limits updated"
        else:
            res = requests.get('https://flaskosa.herokuapp.com/cmd/'+str(response))
            res = str(res.content)
            res = res.split("READY>")
        commands_pair = {'result':str(res[1])}
        commands_pair['listofcommands'] = newcommands
    else:
        commands_pair['listofcommands'] = ['No Commands Yet']
    return commands_pair