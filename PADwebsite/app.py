from flask import Flask, render_template
import os

app = Flask(__name__)
app.secret_key = 'ASG$%^@#R?!@#'
app.config['UPLOAD_FOLDER'] = './database/'
