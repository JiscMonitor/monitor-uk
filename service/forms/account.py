"""
Forms used to provide the user account UI
"""

from octopus.modules.account.forms import BasicUserForm, BasicUserFormXwalk, BasicUserFormContext
from octopus.modules.form.context import FormContext, Renderer
from wtforms.fields import StringField, HiddenField, PasswordField
from wtforms import Form, validators

###########################################################

class MonitorUKUserForm(BasicUserForm):
    """
    Defines the central user form for all users to complete
    """
    name = StringField("Name", [validators.DataRequired()])

    organisation = StringField("Organisation", [validators.DataRequired()])

    org_role = StringField("Role at Organisation", [validators.DataRequired()])

    lantern_email = StringField("Lantern Email Address", [validators.Optional()], description="If you are using <a href='https://lantern.cottagelabs.com'>Lantern</a> for enhancing your records, enter the email you use to log in to Lantern here.")

    lantern_api_key = StringField("Lantern API Key", [validators.Optional()], description="If you are using <a href='https://lantern.cottagelabs.com'>Lantern</a> for enhancing your records, enter your Lantern API key here.")

    request_api_key = HiddenField("request_api_key", default="true")

class MonitorUKUserAdminForm(MonitorUKUserForm):
    """
    Defines an extension to the central user form to add fields also editable by administrators
    """
    user_roles = StringField("System Roles", [validators.Optional()])

    password = PasswordField("Your Admin Password", [validators.DataRequired()])

###########################################################

class MonitorUKUserFormXwalk(BasicUserFormXwalk):
    """
    Crosswalk for converting between the user form and the user account objects (in both directions)
    """

    @classmethod
    def obj2form(cls, acc):
        """
        Convert a user account object to a dictionary suitable for use with the form

        :param acc: user Account object
        :return: dictionary of form data
        """
        data = BasicUserFormXwalk.obj2form(acc)

        data["name"] = acc.name
        data["organisation"] = acc.organisation
        data["org_role"] = acc.org_role
        data["lantern_email"] = acc.lantern_email
        data["lantern_api_key"] = acc.lantern_api_key

        return data

    @classmethod
    def form2obj(cls, form, acc=None):
        """
        Convert a form object to a user account object.  If a user account object is already supplied,
        enhance that object

        :param form:
        :param acc:
        :return:
        """
        acc = BasicUserFormXwalk.form2obj(form, acc)

        if getattr(form, "name", None):
            acc.name = form.name.data
        if getattr(form, "organisation", None):
            acc.organisation = form.organisation.data
        if getattr(form, "org_role", None):
            acc.org_role = form.org_role.data
        if getattr(form, "lantern_email", None):
            acc.lantern_email = form.lantern_email.data
        if getattr(form, "lantern_api_key", None):
            acc.lantern_api_key = form.lantern_api_key.data

        # if a new API key has been requested, set it
        if form.request_api_key.data == "true":
            acc.generate_api_key()

        return acc

class MonitorUKUserFormContext(BasicUserFormContext):
    """
    Form context definition for the main user form

    This defines the behaviours of the user account form from initial seeding from the account object, through
    to rendering, and reading the data back to the updated account object.
    """
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
    """
    Renderer definition for the user form.

    Specifies the fields, the orders of those fields, and any additional rendering-related settings
    """
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
                        "lantern_email" : {
                            "attributes" : {"placeholder" : "Your user account email for Lantern"}
                        }
                    },
                    {
                        "lantern_api_key" : {
                            "attributes" : {"placeholder" : "Your account API key for Lantern"}
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

##################################################

class MonitorUKUserAdminFormXwalk(MonitorUKUserFormXwalk):
    """
    Crosswalk for converting between the user form and the user account objects (in both directions)
    within the context of an administrator interaction
    """

    @classmethod
    def obj2form(cls, acc):
        """
        Convert a user account object to a dictionary suitable for use with the admin form

        :param acc: user Account object
        :return: dictionary of form data
        """
        data = MonitorUKUserFormXwalk.obj2form(acc)
        data["user_roles"] = ", ".join(acc.role)
        return data

    @classmethod
    def form2obj(cls, form, acc=None):
        """
        Convert an admin form object to a user account object.  If a user account object is already supplied,
        enhance that object

        :param form:
        :param acc:
        :return:
        """
        acc = MonitorUKUserFormXwalk.form2obj(form, acc)

        if getattr(form, "user_roles", None):
            acc.role = [r.strip() for r in form.user_roles.data.split(",")]

        return acc

class MonitorUKUserAdminFormContext(BasicUserFormContext):
    """
    Form context definition for the admin user form

    This defines the behaviours of the admin account form from initial seeding from the account object, through
    to rendering, and reading the data back to the updated account object.
    """

    def set_template(self):
        self.template = "account/user.html"

    def make_renderer(self):
        self.renderer = MonitorUKUserAdminFormRenderer()

    def blank_form(self):
        self.form = MonitorUKUserAdminForm()

    def data2form(self):
        self.form = MonitorUKUserAdminForm(formdata=self.form_data)

    def source2form(self):
        data = MonitorUKUserAdminFormXwalk.obj2form(self.source)
        self.form = MonitorUKUserAdminForm(data=data)

    def form2target(self):
        self.target = MonitorUKUserAdminFormXwalk.form2obj(self.form, self.source)

    def finalise(self):
        super(MonitorUKUserAdminFormContext, self).finalise()
        self.target.save(blocking=True)

    def render_template(self, template=None, **kwargs):
        return super(MonitorUKUserAdminFormContext, self).render_template(template=template, account=self.source, **kwargs)

    def pre_validate(self):
        # if this is a request to renew the API key, we don't do anything else with the form data
        if self.form.request_api_key.data == "true":
            password = self.form.password.data
            self.source2form()
            self.form.password.data = password


class MonitorUKUserAdminFormRenderer(Renderer):
    """
    Renderer definition for the user admin form.

    Specifies the fields, the orders of those fields, and any additional rendering-related settings
    """
    def __init__(self):
        super(MonitorUKUserAdminFormRenderer, self).__init__()

        self.FIELD_GROUPS = {
            "details" : {
                "helper" : "bs3_horizontal",
                "wrappers" : ["first_error", "container"],
                "label_width" : 4,
                "control_width" : 8,
                "fields" : [
                    {
                        "email" : {
                            "attributes" : {"placeholder" : "User's email address"}
                        }
                    },
                    {
                        "name" : {
                            "attributes" : {"placeholder" : "User's name"}
                        }
                    },
                    {
                        "organisation" : {
                            "attributes" : {"placeholder" : "The organisation the user works for"}
                        }
                    },
                    {
                        "org_role" : {
                            "attributes" : {"placeholder" : "User's role at their organisation"}
                        }
                    },
                    {
                        "lantern_email" : {
                            "attributes" : {"placeholder" : "Your user account email for Lantern"}
                        }
                    },
                    {
                        "lantern_api_key" : {
                            "attributes" : {"placeholder" : "Your account API key for Lantern"}
                        }
                    },
                    {
                        "user_roles" : {
                            "attributes" : {"placeholder" : "User's system roles (comma separated)"}
                        }
                    },
                    {
                        "password" : {
                            "attributes" : {"placeholder" : "Your admin password"}
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


class MonitorUKActivateForm(Form):
    """
    Defines the user activation form, with minimal information on it
    """
    name = StringField("Name", [validators.DataRequired()])

    organisation = StringField("Organisation", [validators.DataRequired()])

    org_role = StringField("Role at Organisation", [validators.DataRequired()])

    new_password = PasswordField('New Password', [
        validators.DataRequired(),
        validators.EqualTo('confirm_new_password', message='Passwords must match')
    ])

    confirm_new_password = PasswordField('Repeat Password', [validators.DataRequired()])

class MonitorUKActivateFormContext(FormContext):
    """
    Form context definition for the activation form

    This defines the behaviours of the activation form
    """
    def set_template(self):
        self.template = "account/activate.html"

    def make_renderer(self):
        self.renderer = MonitorUKActivateFormRenderer()

    def blank_form(self):
        self.form = MonitorUKActivateForm()

    def data2form(self):
        self.form = MonitorUKActivateForm(formdata=self.form_data)

    def source2form(self):
        self.form = MonitorUKActivateForm()

    def finalise(self):
        super(MonitorUKActivateFormContext, self).finalise()

        password = self.form.new_password.data
        self.source.set_password(password)
        self.source.name = self.form.name.data
        self.source.organisation = self.form.organisation.data
        self.source.org_role = self.form.org_role.data
        self.source.remove_activation_token()
        self.source.save(blocking=True)

    def render_template(self, template=None, **kwargs):
        return super(MonitorUKActivateFormContext, self).render_template(template=template, account=self.source, **kwargs)

class MonitorUKActivateFormRenderer(Renderer):
    """
    Renderer definition for the account activation form

    Specifies the fields, the orders of those fields, and any additional rendering-related settings
    """
    def __init__(self):
        super(MonitorUKActivateFormRenderer, self).__init__()

        self.FIELD_GROUPS = {
            "activate" : {
                "helper" : "bs3_horizontal",
                "wrappers" : ["first_error", "container"],
                "label_width" : 4,
                "control_width" : 8,
                "fields" : [
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
                            "attributes" : {"placeholder" : "Your desired password"}
                        }
                    },
                    {
                        "confirm_new_password" : {
                            "attributes" : {"placeholder" : "Repeat your desired password"}
                        }
                    }
                ]
            }
        }
