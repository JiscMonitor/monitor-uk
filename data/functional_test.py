from octopus.core import app

from service.scripts.importer import do_import
from service import models

ACCOUNT = "monitor@oneoverzero.com"

acc = models.MonitorUKAccount()
acc.email = ACCOUNT
acc.set_password("password")
acc.name = "Test Account"
acc.organisation = "Test University"
acc.org_role = "Tester"
acc.role = app.config.get("ACCOUNT_DEFAULT_ROLES")
acc.lantern_email = app.config.get("TEST_ACCOUNT_EMAIL_LANTERN")
acc.lantern_api_key = app.config.get("TEST_API_KEY_LANTERN")
acc.generate_api_key()
acc.save(blocking=True)

do_import("Durham-APC-2015_2.csv", "Durham University", ACCOUNT)
do_import("QUB-APC-2015.csv", "Queen's University Belfast", ACCOUNT)
do_import("Manchester-RCUK-Aug-Apr2016.csv", "University of Manchester", ACCOUNT)
do_import("Birmingham-APC-2015.csv", "University of Birmingham", ACCOUNT)
do_import("Bristol-APC-July2015.csv", "University of Bristol", ACCOUNT)
do_import("Cambridge-APC-2015.csv", "University of Cambridge", ACCOUNT)
do_import("Cardiff-APC-2015.csv", "Cardiff University", ACCOUNT)
do_import("City-APC-2015.csv", "City University London", ACCOUNT)
do_import("Cranfield-APC-2015.csv", "Cranfield University", ACCOUNT)
do_import("Durham-APC-2015.csv", "Durham University", ACCOUNT)
do_import("Edinburgh-APC-2015.csv", "University of Edinburgh", ACCOUNT)
do_import("Huddersfield-APC-2015.csv", "University of Huddersfield", ACCOUNT)
do_import("Imperial-APC-2015.csv", "Imperial College London", ACCOUNT)
do_import("Liverpool-APC-2015.csv", "University of Liverpool", ACCOUNT)
do_import("Loughborough-APC-2014-15.csv", "Loughborough University", ACCOUNT)
do_import("LSHTM-APC-2015.csv", "LSHTM", ACCOUNT)
do_import("Manchester-APC-2015.csv", "University of Manchester", ACCOUNT)
do_import("Oxford-APC-2015.csv", "University of Oxford", ACCOUNT)
do_import("Plymouth-APC-2015.csv", "Plymouth University", ACCOUNT)
do_import("Portsmouth-APC-2015.csv", "University of Portsmouth", ACCOUNT)
do_import("QueenMary-APC-2015.csv", "Queen Mary University of London", ACCOUNT)
do_import("RHUL-APC-2015.csv", "Royal Holloway", ACCOUNT)
do_import("Sheffield-APC-2015.csv", "University of Sheffield", ACCOUNT)
do_import("Southampton-APC-2015.csv", "University of Southampton", ACCOUNT)
do_import("Strathclyde-APC-2014-15.csv", "University of Strathclyde", ACCOUNT)
do_import("Surrey-APC-2015.csv", "University of Surrey", ACCOUNT)
do_import("Sussex-APC-2015.csv", "University of Sussex", ACCOUNT)
do_import("Swansea-APC-2015.csv", "Swansea University", ACCOUNT)
do_import("UCL-APC-2015.csv", "University College London", ACCOUNT)
do_import("Warwick-APC-2015.csv", "University of Warwick", ACCOUNT)