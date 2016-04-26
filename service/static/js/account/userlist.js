jQuery(document).ready(function($) {

    $.extend(octopus, {
        account: {
            newBasicAccount : function(params) {
                var schema = {
                    id : {type : "single", path : "id", coerce: String },
                    created_date : {type : "single", path : "created_date", coerce: String},
                    last_updated : {type : "single", path : "last_updated", coerce: String},

                    email : { type : "single", path : "email", coerce : String},
                    name : { type : "single", path : "name", coerce : String, default_value: "Unknown Name"},
                    org_role : { type : "single", path : "org_role", coerce : String, default_value: "Unknown Role"},
                    organisation : { type : "single", path : "organisation", coerce : String, default_value: "Unknown Organisation"},
                    role : {type: "list", path: "role", coerce: String}
                };

                var BasicAccount = function() {
                    this.data = {};
                    this.schema = {};
                    this.allow_off_schema = false;
                };

                var proto = $.extend(octopus.dataobj.DataObjPrototype, octopus.account.BasicAccountPrototype);
                BasicAccount.prototype = proto;

                var dobj = new BasicAccount();
                dobj.schema = schema;
                if (params) {
                    if (params.raw) {
                        dobj.data = params.raw;
                    }
                }
                return dobj;
            },
            BasicAccountPrototype : {

            }
        }
    });

    function userDisplay(options, record) {
        var acc = octopus.account.newBasicAccount({raw: record});

        // outer container for display (fitting with the tabular style of the facetview)
        var result = "<tr><td>";

        result += "<div class='user-result'>";
        result += "<div class='row'>";

        // left-hand container for metadata
        result += "<div class='col-md-10'>";
        result += "<strong>" + escapeHtml(acc.get_field("email")) + "</strong><br>";
        result += escapeHtml(acc.get_field("name")) + ", " + escapeHtml(acc.get_field("org_role")) + " at " + escapeHtml(acc.get_field("organisation")) + "<br>";
        result += "System roles: " + acc.get_field("role").join(", ");
        result += "</div>";

        // right-hand container for links out
        result += "<div class='col-md-2'>";
        result += '<a href="/account/' + escapeHtml(acc.get_field("email")) + '" class="btn btn-info pull-right" style="margin-top: 15px"><span class="glyphicon glyphicon-pencil"></span>&nbsp;&nbsp;Edit User</a>';

        // close right-hand container
        result += "</div>";

        // close off the overall container
        result += "</div></div></td></tr>";

        return result;
    }

    $('#userfacetview').facetview({
        // basic settings
        debug: false,
        sharesave_link: false,

        render_result_record : userDisplay,

        // search configuration
        search_url : octopus.config.account_list_endpoint,
        page_size : 25,
        facets : [
            // {"field" : "role", "display" : "User Role"}
        ],
        search_sortby : [
            {"display" : "Email", "field" : "email.exact"},
            {"display" : "Name", "field" : "name.exact"},
            {"display" : "Organisation", "field" : "organisation.exact"}
        ],
        searchbox_fieldselect : [
            {'display':'Email','field':'email'},
            {"display" : "Name", "field" : "name"},
            {"display" : "Organisation", "field" : "organisation"},
            {"display" : "Role at Organisation", "field" : "org_role"},
            {"display" : "System role", "field" : "role"}
        ]
    });

});
