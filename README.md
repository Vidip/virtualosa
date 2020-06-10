# virtualosa
Virtual Cloud Optical Spectrum Analyzer

Production Url: https://flaskosanalyzer.herokuapp.com/

Demo Video: https://drive.google.com/file/d/1KyP25wWSMq0csyY2vKs1Y0XgO_9_fORj/view?usp=sharing

Technologies Used: Python (Flask), Javascript, Jquery, Canvas Js, HTML, CSS.

Steps to Run the Project

1. pip3 install -r requirements.txt (This will install all the required packages)
2. python3 app.py

API to get command output: /postcommand/<Command>
  
  For Example: https://flaskosanalyzer.herokuapp.com/postcommand/IDN
 
Screenshots:

![Single Trace](tracegraph.png)

Echo Example: In Command Box just input ECHO 'any string'

Example: ECHO hello world

On Click of Start Button, it refreshes the data every second.

![Start](on_start.png)


