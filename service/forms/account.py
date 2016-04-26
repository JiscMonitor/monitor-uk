from octopus.modules.account.factory import AccountFactory
from octopus.modules.account.forms import BasicUserForm, BasicUserFormXwalk, BasicUserFormContext
from octopus.modules.form.context import FormContext, Renderer
from octopus.modules.account import exceptions
from flask.ext.login import current_user
from wtforms.fields import StringField, HiddenField, PasswordField
from wtforms import Form, validators

###########################################################

class MonitorUKUserFormXwalk(BasicUserFormXwalk):

    @classmethod
    def obj2form(cls, acc):
        data = BasicUserFormXwalk.obj2form(acc)

        data["name"] = acc.name
        data["organisation"] = acc.organisation
        data["org_role"] = acc.org_role

        return data

    @classmethod
    def form2obj(cls, form, acc=None):
        acc = BasicUserFormXwalk.form2obj(form, acc)

        if getattr(form, "name", None):
            acc.name = form.name.data
        if getattr(form, "organisation", None):
            acc.organisation = form.organisation.data
        if getattr(form, "org_role", None):
            acc.org_role = form.org_role.data

        # if a new API key has been requested, set it
        if form.request_api_key.data == "true":
            acc.generate_api_key()

        return acc

class MonitorUKUserForm(BasicUserForm):
    name = StringField("Name", [validators.DataRequired()])

    organisation = StringField("Organisation", [validators.DataRequired()])

    org_role = StringField("Role at Organisation", [validators.DataRequired()])

    request_api_key = HiddenField("request_api_key", default="true")


class MonitorUKUserFormContext(BasicUserFormContext):
    def set_template(self):
        self.template = "account/user.html"

    def make_renderer(self):
        self.renderer = MonitorUKUserFormRenderer()

    def blank_form(self):
        self.form = MonitorUKUserForm()

    def data2form(self):
        self.form = MonitorUKUserForm(formdata=self.form_data)

    def source2form(self):
        data = MonitorUKUserFormXwalk.obj2form(self.source)
        self.form = MonitorUKUserForm(data=data)

    def form2target(self):
        self.target = MonitorUKUserFormXwalk.form2obj(self.form, self.source)

    def finalise(self):
        super(MonitorUKUserFormContext, self).finalise()
        self.target.save(blocking=True)

    def render_template(self, template=None, **kwargs):
        return super(MonitorUKUserFormContext, self).render_template(template=template, account=self.source, **kwargs)

    def pre_validate(self):
        # if this is a request to renew the API key, we don't do anything else with the form data
        if self.form.request_api_key.data == "true":
            password = self.form.password.data
            self.source2form()
            self.form.password.data = password

class MonitorUKUserFormRenderer(Renderer):
    def __init__(self):
        super(MonitorUKUserFormRenderer, self).__init__()

        self.FIELD_GROUPS = {
            "details" : {
                "helper" : "bs3_horizontal",
                "wrappers" : ["first_error", "container"],
                "label_width" : 4,
                "control_width" : 8,
                "fields" : [
                    {
                        "email" : {
                            "attributes" : {"placeholder" : "Your email address"}
                        }
                    },
                    {
                        "name" : {
                            "attributes" : {"placeholder" : "Your name"}
                        }
                    },
                    {
                        "organisation" : {
                            "attributes" : {"placeholder" : "The organisation you work for"}
                        }
                    },
                    {
                        "org_role" : {
                            "attributes" : {"placeholder" : "Your role at your organisation"}
                        }
                    },
                    {
                        "new_password" : {
                            "attributes" : {"placeholder" : "Leave blank if not changing password"}
                        }
                    },
                    {
                        "confirm_new_password" : {
                            "attributes" : {"placeholder" : "Leave blank if not changing password"}
                        }
                    },
                    {
                        "password" : {
                            "attributes" : {"placeholder" : "Enter password to make changes"}
                        }
                    }
                ]
            },
            "api_key" : {
                "helper" : "bs3_horizontal",
                "wrappers" : ["first_error", "container"],
                "label_width" : 4,
                "control_width" : 8,
                "fields" : [
                    {
                        "request_api_key" : {
                            "attributes" : {}
                        },
                    },
                    {
                        "password" : {
                            "attributes" : {"placeholder" : "Enter your password to make changes"}
                        }
                    }
                ]
            }
        }

###################################################