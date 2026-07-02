from flask import render_template, request, flash, redirect, url_for, session
from app import app
import random
import os
from os.path import join

def save(filename, contents):
  fh = open(filename, 'w')
  fh.write(contents)
  fh.close()

@app.route('/pad', methods=["GET", "POST"])
def index():
    if request.method == 'GET':
        return render_template("index.html")
    else:
        # Upload File
        if request.form['submit'] == 'file':
            form_data = request.form.to_dict()
            if 'peak' not in request.files or request.files['peak'].filename == '':
                return render_template("index.html", msg={'file': "Peak file can not be empty."})
            if 'downregulated_genes' in request.files and 'upregulated_genes' in request.files:
                downregulated_genes = request.files['downregulated_genes']
                upregulated_genes = request.files['upregulated_genes']
                peak = request.files['peak']
                if downregulated_genes.filename == '' or upregulated_genes.filename == '':
                    return render_template("index.html", msg={'file': "Upload file can not be empty."})
                uid = random.randint(0, 100000)
                session['uid'] = uid
                downregulated_genes.save(join(app.config['UPLOAD_FOLDER'], "{}-{}".format('downregulated_genes', uid)))
                upregulated_genes.save(join(app.config['UPLOAD_FOLDER'], "{}-{}".format('upregulated_genes', uid)))
                peak.save(join(app.config['UPLOAD_FOLDER'], "{}-{}".format('peak', uid)))
                return redirect(url_for("index", _anchor="inputdata"))
            elif 'downregulated_genes_text' in form_data and 'upregulated_genes_text' in form_data:
                downregulated_genes = form_data['downregulated_genes_text']
                print(downregulated_genes)
                upregulated_genes = form_data['upregulated_genes_text']
                peak = request.files['peak']
                if downregulated_genes == "" or upregulated_genes == "":
                    return render_template("index.html", msg={'file': "Upload text data can not be empty."})
                uid = random.randint(0, 100000)
                session['uid'] = uid
                save(join(app.config['UPLOAD_FOLDER'],"{}-{}".format('downregulated_genes', uid)), downregulated_genes)
                save(join(app.config['UPLOAD_FOLDER'],"{}-{}".format('upregulated_genes', uid)), upregulated_genes)
                peak.save(join(app.config['UPLOAD_FOLDER'], "{}-{}".format('peak', uid)))
                return redirect(url_for("index", _anchor="inputdata"))
            elif ('downregulated_genes' in form_data and 'upregulated_genes' in request.files) or ('downregulated_genes' in request.files and 'upregulated_genes' in form_data):
                return render_template("index.html", msg={'file': "Please upload data in the same format (file or text)"})
            else:
                return render_template("index.html", msg={'file': "Upload file or text could not be empty"})
        else:
            form_data = request.form.to_dict()
            distance = form_data['distance']
            email = form_data['email']
            user_ip = request.remote_addr
            email_info_path = './User_info/user_ip_info.txt'
            with open(email_info_path,'a+') as f:
                f.write(email+'\t'+user_ip+'\n')
            f.close()
            if 'species' not in form_data or distance == '':
                return render_template("index.html", msg={'input': "input can not be empty."})
            if 'uid' not in session.keys():
                return render_template("index.html", msg={'input': "Please Upload Data first"})
            species = form_data['species']
            uid = session['uid']
            color = form_data['color'] if 'color' in form_data else "1E3758EB8A7A"
            title = form_data['title']
            up_genes = join(app.config['UPLOAD_FOLDER'], "{}-{}".format('upregulated_genes', uid))
            down_genes = join(app.config['UPLOAD_FOLDER'], "{}-{}".format('downregulated_genes', uid))
            peak = join(app.config['UPLOAD_FOLDER'], "{}-{}".format('peak', uid))
            if title:
                execStr = "python3 PAD.py -s {} -u {} -d {} -p {} -dst {} -uid {} -color {} -title {}".format(species, up_genes, down_genes, peak, distance, uid, color, title)
            else:
                execStr = "python3 PAD.py -s {} -u {} -d {} -p {} -dst {} -uid {} -color {}".format(species, up_genes, down_genes, peak, distance, uid, color)
            os.system(execStr)
            session.pop('uid')
            return render_template("index.html", msg={'uid': uid}, _anchor="result")



@app.route('/pad/example')
def example():
    return render_template("example.html")


@app.route('/pad/docs')
def docs():
    return render_template("docs.html")
