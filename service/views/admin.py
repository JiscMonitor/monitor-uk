"""
Admin area view
"""
from flask import Blueprint, render_template

from octopus.core import app
from octopus.lib.webapp import ssl_required
from flask.ext.login import login_required
from octopus.modules.account.decorators import restrict_to_role

blueprint = Blueprint('admin', __name__)

# restrict everything in admin to logged in users with the "admin" role
@blueprint.before_request
def restrict():
    """
    Restrict all requests on this view to users with the role "admin"
    :return:
    """
    return restrict_to_role('admin')

@blueprint.route('/', methods=['GET'])
@login_required
@ssl_required
def index():
    """
    Show the admin area index page
    :return:
    """
    return render_template("admin/index.html")