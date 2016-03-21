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
    def form2obj(cls, form, acc=None):
        acc = BasicUserFormXwalk.form2obj(form, acc)

        # if a new API key has been requested, set it
        if form.request_api_key.data == "true":
            acc.generate_api_key()

        return acc

class MonitorUKUserForm(BasicUserForm):
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
        # if the email is not set, we need to set it, as this may be an API key reset request
        if self.form.email.data is None or self.form.email.data == "":
            self.form.email.data = self.source.email

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
                            "attributes" : {}
                        }
                    },
                    {
                        "new_password" : {
                            "attributes" : {}
                        }
                    },
                    {
                        "confirm_new_password" : {
                            "attributes" : {}
                        }
                    },
                    {
                        "password" : {
                            "attributes" : {}
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
                            "attributes" : {}
                        }
                    }
                ]
            }
        }

###################################################