from service.scripts.importer import do_import
from service import tasks

import time

do_import("Durham-APC-2015_2.csv", "Durham University", "durham@example.com")
do_import("QUB-APC-2015.csv", "Queen's University Belfast", "qub@example.com")
do_import("Manchester-RCUK-Aug-Apr2016.csv", "University of Manchester", "manchester@example.com")
do_import("Birmingham-APC-2015.csv", "University of Birmingham", "birmingham@example.com")
do_import("Bristol-APC-July2015.csv", "University of Bristol", "bristol@example.com")
do_import("Cambridge-APC-2015.csv", "University of Cambridge", "cambridge@example.com")
do_import("Cardiff-APC-2015.csv", "Cardiff University", "cardiff@example.com")
do_import("City-APC-2015.csv", "City University London", "city@example.com")
do_import("Cranfield-APC-2015.csv", "Cranfield University", "cranfield@example.com")
do_import("Durham-APC-2015.csv", "Durham University", "durham@example.com")
do_import("Edinburgh-APC-2015.csv", "University of Edinburgh", "edinburgh@example.com")
do_import("Huddersfield-APC-2015.csv", "University of Huddersfield", "huddersfield@example.com")
do_import("Imperial-APC-2015.csv", "Imperial College London", "imperial@example.com")
do_import("Liverpool-APC-2015.csv", "University of Liverpool", "liverpool@example.com")
do_import("Loughborough-APC-2014-15.csv", "Loughborough University", "loughborough@example.com")
do_import("LSHTM-APC-2015.csv", "LSHTM", "lshtm@example.com")
do_import("Manchester-APC-2015.csv", "University of Manchester", "manchester@example.com")
do_import("Oxford-APC-2015.csv", "University of Oxford", "oxford@example.com")
do_import("Plymouth-APC-2015.csv", "Plymouth University", "plymouth@example.com")
do_import("Portsmouth-APC-2015.csv", "University of Portsmouth", "portsmouth@example.com")
do_import("QueenMary-APC-2015.csv", "Queen Mary University of London", "queenmary@example.com")
do_import("RHUL-APC-2015.csv", "Royal Holloway", "rhul@example.com")
do_import("Sheffield-APC-2015.csv", "University of Sheffield", "sheffield@example.com")
do_import("Southampton-APC-2015.csv", "University of Southampton", "soton@example.com")
do_import("Strathclyde-APC-2014-15.csv", "University of Strathclyde", "strathclyde@example.com")
do_import("Surrey-APC-2015.csv", "University of Surrey", "surrey@example.com")
do_import("Sussex-APC-2015.csv", "University of Sussex", "sussex@example.com")
do_import("Swansea-APC-2015.csv", "Swansea University", "swansea@example.com")
do_import("UCL-APC-2015.csv", "University College London", "ucl@example.com")
do_import("Warwick-APC-2015.csv", "University of Warwick", "warwick@example.com")

time.sleep(10)

tasks.process_requests()