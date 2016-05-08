from octopus.core import app, initialise, add_configuration

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("-d", "--debug", action="store_true", help="pycharm debug support enable")
    parser.add_argument("-c", "--config", help="additional configuration to load (e.g. for testing)")
    args = parser.parse_args()

    if args.config:
        add_configuration(app, args.config)

    pycharm_debug = app.config.get('DEBUG_PYCHARM', False)
    if args.debug:
        pycharm_debug = True

    if pycharm_debug:
        app.config['DEBUG'] = False
        import pydevd
        pydevd.settrace(app.config.get('DEBUG_SERVER_HOST', 'localhost'), port=app.config.get('DEBUG_SERVER_PORT', 51234), stdoutToServer=True, stderrToServer=True)
        print "STARTED IN REMOTE DEBUG MODE"

    initialise()

# most of the imports should be done here, after initialise()
from flask import render_template, redirect, url_for
from octopus.lib.webapp import custom_static
from flask_login import login_required

@app.route("/")
def index():
    return render_template("index.html")

# this allows us to override the standard static file handling with our own dynamic version
@app.route("/static/<path:filename>")
def static(filename):
    return custom_static(filename)

@app.route("/fonts/<path:filename>")
def fonts(filename):
    return redirect(url_for("static", filename=u"fonts/{x}".format(x=filename)))

# this allows us to serve our standard javascript config
from octopus.modules.clientjs.configjs import blueprint as configjs
app.register_blueprint(configjs)

from octopus.modules.crud.api import blueprint as crud
app.register_blueprint(crud, url_prefix="/api/v1")

from octopus.modules.es.query import blueprint as query
app.register_blueprint(query, url_prefix="/account_query")
app.register_blueprint(query, url_prefix="/query")

from octopus.modules.es.searchapi import blueprint as search
app.register_blueprint(search, url_prefix="/search/v1")

# adding account management, which enables the login functionality
from octopus.modules.account.account import blueprint as account
app.register_blueprint(account, url_prefix="/account")

# adding account management, which enables the login functionality
from service.views.admin import blueprint as admin
app.register_blueprint(admin, url_prefix="/admin")

@app.route("/search")
@login_required
def search():
    return render_template("/reports/search.html")

@app.errorhandler(404)
def page_not_found(e):
    return render_template('errors/404.html'), 404


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=app.config['DEBUG'], port=app.config['PORT'], threaded=False)

