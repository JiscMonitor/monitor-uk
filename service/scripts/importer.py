# -*- coding: UTF-8 -*-

from octopus.core import app
from octopus.lib import dataobj, http

from octopus.modules.sheets import sheets, commasep
from service import models, api

import argparse

IN_SPEC = {
    "ignore_empty_rows" : True,
    "defaults" : {
        "on_coerce_failure" : "raise"
    },
    "columns" : [
        {
            "col_name" : "Date of initial application by author",
            "normalised_name" : "initial_application_date",
            "coerce" : ["bigenddate"]
        },
        {
            "col_name" : "Submitted by",
            "normalised_name" : "submitted_by",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "University department",
            "normalised_name" : "department",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "PubMed Central (PMC) ID",
            "normalised_name" : "pmcid",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "PubMed ID",
            "normalised_name" : "pmid",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "DOI",
            "normalised_name" : "doi",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Affiliated author",
            "normalised_name" : "author",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Publisher",
            "normalised_name" : "publisher",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Journal",
            "normalised_name" : "journal",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "ISSN",
            "normalised_name" : "issn",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Type of publication",
            "normalised_name" : "publication_type",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Article title",
            "normalised_name" : "title",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Date of publication",
            "normalised_name" : "publication_date",
            "coerce" : ["bigenddate"],
            "on_coerce_failure" : "ignore"
        },
        {
            "col_name" : "Fund that APC is paid from (1)",
            "normalised_name" : "fund_1",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Fund that APC is paid from (2)",
            "normalised_name" : "fund_2",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Fund that APC is paid from (3)",
            "normalised_name" : "fund_3",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Funder of research (1)",
            "normalised_name" : "funder_1",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Funder of research (2)",
            "normalised_name" : "funder_2",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Funder of research (3)",
            "normalised_name" : "funder_3",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Grant ID (1)",
            "normalised_name" : "grant_1",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Grant ID (2)",
            "normalised_name" : "grant_2",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Grant ID (3)",
            "normalised_name" : "grant_3",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Date of APC payment",
            "normalised_name" : "date_apc_paid",
            "coerce" : ["bigenddate"],
            "on_coerce_failure" : "ignore"
        },
        {
            "col_name" : "APC paid (actual currency) including VAT if charged",
            "normalised_name" : "apc_paid_inc_vat",
            "coerce" : ["float"],
            "ignore_values" : ["-"]
        },
        {
            "col_name" : "APC paid (actual currency) excluding VAT",
            "normalised_name" : "apc_paid_ex_vat",
            "coerce" : ["float"]
        },
        {
            "col_name" : "VAT (actual currency)",
            "normalised_name" : "vat",
            "coerce" : ["float"]
        },
        {
            "col_name" : "Currency of APC",
            "normalised_name" : "currency",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "APC paid (£) including VAT if charged",
            "normalised_name" : "apc_paid_inc_vat_gbp",
            "coerce" : ["float"],
            "ignore_values" : ["-", "£-"],
            "on_coerce_failure" : "ignore"
        },
        {
            "col_name" : "APC paid (£) excluding VAT",
            "normalised_name" : "apc_paid_ex_vat_gbp",
            "coerce" : ["float"]
        },
        {
            "col_name" : "VAT (£)",
            "normalised_name" : "vat_gbp",
            "coerce" : ["float"]
        },
        {
            "col_name" : "Additional publication costs (£)",
            "normalised_name" : "additional_costs_gbp",
            "coerce" : ["float"],
            "ignore_values" : ["None"],
            "on_coerce_failure" : "ignore"
        },
        {
            "col_name" : "Discounts, memberships & pre-payment agreements",
            "normalised_name" : "discounts",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Amount of APC charged to COAF grant (include VAT if charged) in £",
            "normalised_name" : "coaf",
            "coerce" : ["float"]
        },
        {
            "col_name" : "Amount of APC charged to RCUK OA fund (include VAT if charged) in £",
            "normalised_name" : "rcuk",
            "coerce" : ["float"]
        },
        {
            "col_name" : "Licence",
            "normalised_name" : "license",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Correct license applied",
            "normalised_name" : "correct_license",
            "coerce" : ["bool"]
        },
        {
            "col_name" : "Problem-free open access publication",
            "normalised_name" : "problem_free",
            "coerce" : ["unicode"]
        },
        {
            "col_name" : "Notes",
            "normalised_name" : "notes",
            "coerce" : ["unicode"]
        }
    ]
}

def do_import(path, org, email):

    # first sort out a user account
    acc = models.MonitorUKAccount.pull_by_email(email)
    if acc is None:
        acc = models.MonitorUKAccount()
        acc.organisation = org
        acc.email = email
        acc.role = app.config.get("ACCOUNT_DEFAULT_ROLES")
        acc.save(blocking=True)

    csv = commasep.CsvReader(path=path)
    obr = sheets.ObjectByRow(reader=csv, spec=IN_SPEC)
    for obj in obr.dicts():
        do = dataobj.DataObj(raw=obj, struct=obr.dataobj_struct(), expose_data=True)

        apc = {
            "rioxxterms:publication_date" : do.publication_date,
            "dc:identifier" : [],
            "rioxxterms:type" : do.publication_type,
            "dc:title" : do.title,
            "rioxxterms:author" : [{"name" : do.author}],
            "dcterms:publisher" : {"name" : do.publisher},
            "dc:source" : {
                "name" : do.journal,
                "identifier" : []
            },
            "rioxxterms:project" : [],
            "jm:apc" : [
                {
                    "date_applied" : do.initial_application_date,
                    "submitted_by" : {
                        "name" : do.submitted_by
                    },
                    "organisation_name" : org,
                    "organisation_department" : do.department,
                    "date_paid" : do.date_apc_paid,
                    "amount" : do.apc_paid_ex_vat,
                    "vat" : do.vat,
                    "currency" : do.currency,
                    "amount_gbp" : do.apc_paid_ex_vat_gbp,
                    "vat_gbp" : do.vat_gbp,
                    "additional_costs" : do.additional_costs_gbp,
                    "discounts" : [],
                    "fund" : [],
                    "publication_process_feedback" : [],
                    "notes" : []
                }
            ],
            "ali:license_ref" : [],
            "jm:license_received" : [
                {"received" : do.correct_license}
            ]
        }

        if do.pmcid is not None:
            apc["dc:identifier"].append({"type" : "pmcid", "id" : do.pmcid})
        if do.pmid is not None:
            apc["dc:identifier"].append({"type" : "pmid", "id" : do.pmid})
        if do.doi is not None:
            apc["dc:identifier"].append({"type" : "doi", "id" : do.doi})
        if do.issn is not None:
            apc["dc:source"]["identifier"].append({"type" : "issn", "id" : do.issn})

        if do.funder_1 is not None or do.grant_1 is not None:
            apc["rioxxterms:project"].append({
                "funder_name" : do.funder_1,
                "grant_number" : do.grant_1
            })
        if do.funder_2 is not None or do.grant_2 is not None:
            apc["rioxxterms:project"].append({
                "funder_name" : do.funder_2,
                "grant_number" : do.grant_2
            })
        if do.funder_3 is not None or do.grant_3 is not None:
            apc["rioxxterms:project"].append({
                "funder_name" : do.funder_3,
                "grant_number" : do.grant_3
            })

        if do.discounts is not None:
            apc["jm:apc"][0]["discounts"].append(do.discounts)

        if do.fund_1 is not None:
            obj = {"name" : do.fund_1}
            if do.fund_1.lower() == "rcuk":
                obj.update({"amount" : do.rcuk, "currency" : "GBP", "amount_gbp" : do.rcuk})
            elif do.fund_1.lower() == "coaf":
                obj.update({"amount" : do.coaf, "currency" : "GBP", "amount_gbp" : do.coaf})
            apc["jm:apc"][0]["fund"].append(obj)

        if do.fund_2 is not None:
            obj = {"name" : do.fund_2}
            if do.fund_2.lower() == "rcuk":
                obj.update({"amount" : do.rcuk, "currency" : "GBP", "amount_gbp" : do.rcuk})
            elif do.fund_2.lower() == "coaf":
                obj.update({"amount" : do.coaf, "currency" : "GBP", "amount_gbp" : do.coaf})
            apc["jm:apc"][0]["fund"].append(obj)

        if do.fund_3 is not None:
            obj = {"name" : do.fund_3}
            if do.fund_3.lower() == "rcuk":
                obj.update({"amount" : do.rcuk, "currency" : "GBP", "amount_gbp" : do.rcuk})
            elif do.fund_3.lower() == "coaf":
                obj.update({"amount" : do.coaf, "currency" : "GBP", "amount_gbp" : do.coaf})
            apc["jm:apc"][0]["fund"].append(obj)

        if do.problem_free is not None:
            apc["jm:apc"][0]["publication_process_feedback"].append("Probelm free open access publication: " + do.problem_free)

        if do.notes is not None:
            apc["jm:apc"][0]["notes"].append(do.notes)

        if do.license is not None:
            apc["ali:license_ref"].append({"type" : do.license})

        api.RequestApi.update(apc, acc)

        """
        papc = models.PublicAPC()
        papc.record = apc
        papc.save()
        """

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--path", help="path to input CSV")
    parser.add_argument("-o", "--org", help="Organisation name")
    parser.add_argument("-e", "--email", help="email of account to use for import (will be created if not exists)")
    args = parser.parse_args()

    do_import(args.path, args.org, args.email)



