from flask import Flask, request, url_for, redirect, render_template

import joblib

import pandas as pd

import sqlite3



app = Flask(__name__)



model = None

try:

    model = joblib.load(open("model.sav", "rb"))

except Exception as e:

    print(f"Warning: Could not load model.sav - {e}")





@app.route('/')

def hello_world():

    return render_template("home.html")



@app.route('/logon')

def logon():

	return render_template('signup.html')



@app.route('/login')

def login():

	return render_template('signin.html')



@app.route("/signup")

def signup():



    username = request.args.get('user','')

    name = request.args.get('name','')

    email = request.args.get('email','')

    number = request.args.get('mobile','')

    password = request.args.get('password','')

    con = sqlite3.connect('signup.db')

    cur = con.cursor()

    cur.execute("insert into `info` (`user`,`email`, `password`,`mobile`,`name`) VALUES (?, ?, ?, ?, ?)",(username,email,password,number,name))

    con.commit()

    con.close()

    return render_template("signin.html")



@app.route("/signin")

def signin():



    mail1 = request.args.get('user','')

    password1 = request.args.get('password','')

    con = sqlite3.connect('signup.db')

    cur = con.cursor()

    cur.execute("select `user`, `password` from info where `user` = ? AND `password` = ?",(mail1,password1,))

    data = cur.fetchone()



    if data == None:

        return render_template("signin.html")    



    elif mail1 == 'admin' and password1 == 'admin':

        return render_template("index.html")



    elif mail1 == str(data[0]) and password1 == str(data[1]):

        return render_template("index.html")

    else:

        return render_template("signup.html")



@app.route('/predict',methods=['POST','GET'])

def predict():

    text1 = request.form['1']

    text2 = request.form['2']

    text3 = request.form['3']

    text4 = request.form['4']

    text5 = request.form['5']

    text6 = request.form['6']

    text7 = request.form['7']

    text8 = request.form['8']

  

    if model is None:

        return render_template('result.html', pred='Error: Model not loaded. Please ensure model.sav is available.')

    row_df = pd.DataFrame([pd.Series([text3,text4,text5,text6,text7,text8])])

    print(row_df)

    prediction=model.predict_proba(row_df)

    output='{0:.{1}f}'.format(prediction[0][1], 2)

    output = str(float(output)*100)+'%'

    if output>str(0.5):

        return render_template('result.html',pred=f'You have chance of having Heart Disease.\nProbability of having Disease is {output}')

    else:

        return render_template('result.html',pred=f'You are safe.\n Probability of having Disease is {output}')



@app.route('/about')

def about():

	return render_template('about.html')



@app.route('/index')

def index():

	return render_template('index.html')





if __name__ == '__main__':

    app.run(debug=True)
