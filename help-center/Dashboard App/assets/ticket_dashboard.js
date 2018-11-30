var tickets_dashboard = {
    tiketsPerPage: 10,
    tabs: [],
    tabs: {
        "global": {},
        "followed": {},
        "cced": {},
        "belonging": {},
        "escalated": {},
        "handoff": {},
        "qualityreview": {
            dropdowns: {
                qr_teamrv: {},
                qr_reviewed: {}
            }
        },
        "kbcontribute": {
            dropdowns: {
                kb_my: {}
            }
        },
        "teamhandled": {
            dropdowns: {},
            counts: 30
        },
        "involved": {
            dropdowns: {
                cat_interations: {},
                cat_discrepancy: {},
                cat_adserving: {},
                cat_platformfunc: {},
                cat_advtags: {},
                cat_analytics: {},
                cat_creative: {},
                cat_trading: {},
                cat_cus_sol: {},
                cat_peer39: {},
                cat_api: {},
                cat_bill: {},
                cat_sem: {},
                cat_search: {},
                cat_strike: {},
                cat_admin: {},
                cat_others: {}
            }
        },
        "CS": {
            APAC: {
                dropdowns: {}
            },
            EMEA: {
                dropdowns: {}
            },
            NAM: {
                dropdowns: {}
            },
            LATAM: {
                dropdowns: {}
            },
            Reseller: {
                dropdowns: {}
            }
        }
    },
    currentUser: {},
    tabel_tmp: '<table class="table table-hover table-striped"><thead><tr><th data-column-id="status" data-formatter="status">Status</th><th data-column-id="id" data-type="numeric" data-formatter="link" >ID</th><th data-column-id="subject" data-formatter="link" >Subject</th><th data-column-id="actionBy"></th><th data-column-id="groups">Groups</th></tr></thead><tbody></tbody></table>',
    tabel_tmp_RV: '<table class="table table-hover table-striped"><thead><tr><th data-column-id="QBlink" data-formatter="linkQB">See Detail</th><th data-column-id="id" data-type="numeric" data-formatter="link" data-order="desc">Ticket ID</th><th data-column-id="ratee" data-formatter="mailToName">Ratee Name</th><th data-column-id="rating" data-type="numeric" data-formatter="rating">Rating</th><th data-column-id="rater">Rater Name</th><th data-column-id="revieweder" data-formatter="mailToName">Reviewer</th><th data-column-id="reviewed" data-formatter="check">Reviewed</th><th data-column-id="remarks" data-formatter="remarks">Remarks</th></tr></thead><tbody></tbody></table>',
    tabel_tmp_cat: '<table class="table table-hover table-striped"><thead><tr><th data-column-id="status" data-formatter="status"></th><th data-column-id="id" data-formatter="link" data-type="numeric" >ID</th><th data-column-id="subject" data-formatter="link" >Subject</th><th data-column-id="restime" data-formatter="subtime" data-type="numeric" >Resolution Time (day)</th><th data-column-id="highInterations" data-formatter="check">High Interations</th></tr></thead><tbody></tbody></table>',
    tabel_tmp_tmhd: '<table class="table table-hover table-striped"><thead><tr><th data-column-id="date" data-formatter="date">Date (event)</th><th data-column-id="status" data-formatter="status"></th><th data-column-id="id" data-formatter="link">ID</th><th  data-column-id="subject" data-formatter="link" >Subject</th><th data-column-id="spent" data-type="numeric">Total Spent(min)</th></tr></thead><tbody></tbody></table>',
    tabel_tmp_CS: '<table class="table table-hover table-striped"><thead><tr><th data-column-id="status" data-formatter="status">Status</th><th data-column-id="id" data-type="numeric" data-formatter="link" >ID</th><th data-column-id="subject" data-formatter="link" >Subject</th><th data-column-id="Requester" data-formatter="name">Requester</th><th data-column-id="Agency" data-formatter="name">Agency</th><th data-column-id="Created">Created Days</th><th data-column-id="StatusUpdated">Hold/Pending/Opened Days</th><th data-column-id="groups">Tier</th></tr></thead><tbody></tbody></table>',
}

function initTabs() {
    $('.nav-tabs a').on('shown.bs.tab', function(event) {
        if ($(this).parent().hasClass('disabled')) {
            $(event.relatedTarget).tab('show')
            return
        }
        var tab = $(event.target).attr("href").replace("#", "");
        tickets_dashboard.tabs.active = tab;
        activeTab()
    });

    $(".dropdown .dropdown-menu a").on("click", function(event) {
        $(this).off('shown.bs.tab')
        var tab = $(event.target).attr("href").replace("#", "");
        tickets_dashboard.tabs.active = tab;
        activeTab()
    });
}

function activeTab() { //1. check if content table created. if not go 2 & 3; 2. fetch content table, 3. call request and fetch data in table
    tab = tickets_dashboard.tabs.active;
    var dataTable = "table#grid-data-" + tab,
        pane = $('#' + tab);

    if (pane.find(dataTable).length === 0) {
        $('.nav-tabs li').addClass("disabled"); //before loaded data, disble the tabs to avoid quickly click mess data/table 
        $('.tab-content').append('<img class="loading" src="spinner.gif" style="position:fixed;top:40%;left:40%" />');
        if (tab.indexOf("qr_") != -1)
            pane.append(tickets_dashboard.tabel_tmp_RV)
        else if (tab.indexOf("cat_") != -1 || tab.indexOf("kb_") != -1)
            pane.append(tickets_dashboard.tabel_tmp_cat)
        else if (tab.indexOf('tmhd_') != -1)
            pane.append(tickets_dashboard.tabel_tmp_tmhd)
        else if ((tickets_dashboard.groups.CS_Dashboard || tickets_dashboard.groups.CS_Dashboard_Team_Member) && tab != "global") {
            pane.append(tickets_dashboard.tabel_tmp_CS)
        } else
            pane.append(tickets_dashboard.tabel_tmp);

        pane.find('table').attr("id", "grid-data-" + tab);
    }

    $('.nav-tabs a[href="#' + tab + '"]').tab('show')

    if (tab == "escalated")
        flagEscStatus();
    if (tab == "global")
        flagIncidents();

    if (tab.indexOf("qr_") == -1) {
        if (tab == "followed") {
            getData('/api/v2/users/' + tickets_dashboard.currentUser.id + '.json').then(function(res) {
                var sMany = res.results.user_fields.following_tickets;
                if (!sMany)
                    showGrid({
                        counts: 0,
                        results: []
                    })
                else {
                    var url = "/api/v2/tickets/show_many.json?ids=" + sMany + '&include=groups,users';
                    DoRequest(url).then(function(data) {
                        //showGrid(data) 
                        var _count = 0;
                        $.each(data.results, function(i, tkt) {
                            checkLastStatusChage(tkt)
                            var intervalGetStatus = setInterval(function() {
                                if (tkt.LastStatusChange) {
                                    clearInterval(intervalGetStatus)
                                    _count += 1;
                                    if (_count == data.results.length)
                                        showGrid({
                                            counts: data.counts,
                                            results: data.results
                                        })
                                }
                            }, 100)
                        })

                    });
                }
            })
        } else
            getData().then(function(data) {
                if (tab.indexOf("cat_") > -1) {
                    if (data.counts > 0) {
                        var sMany = '',
                            counts = data.counts > 100 ? 100 : data.counts;
                        for (var i = 0; i < counts; i++) {
                            sMany += data.results[i].id + ((i == data.counts - 1) ? '' : ',')
                        }
                        var url = "/api/v2/tickets/show_many.json?ids=" + sMany;
                        DoRequest(url).then(function(res) {
                            var arr = []
                            $.each(res.results, function(i, tkt) {
                                if ($.inArray("highlight_high_iterations", tkt.tags) > -1)
                                    arr.push(tkt.id)
                            })
                            data.highIterationTickets = arr;
                            showGrid(data)
                        })
                    } else
                        showGrid(data)
                } else if (tab == "handoff" || tab == "escalated") {
                    for (var i = j = 0; i < (data.counts > 99 ? 99 : data.counts); i++) {
                        if (data.results[i].id == data.highlights[j].id)
                            data.results[i].by = getCommenter(data.highlights[j]), j++;
                        else
                            data.results[i].by = "";
                    }
                    showGrid(data)
                } else if (tab.indexOf('tmhd_') != -1) {
                    var tmhd = [],
                        obj = [],
                        uID = tab.replace('tmhd_', ''),
                        jdx = 0,
                        counts = data.counts < tickets_dashboard.tabs.teamhandled.counts ? data.counts : tickets_dashboard.tabs.teamhandled.counts;
                    tickets_dashboard.tabs.teamhandled.dropdowns[tab].tmhd = [];
                    $.each(data.results, function(i, tkt) {
                        var url = "/api/v2/tickets/" + tkt.id + "/audits.json";
                        DoRequest(url).then(function(res) {
                            $.each(res.results, function(idx, itm) {
                                if (itm.author_id == uID) {
                                    var flt = getObjects(itm.events, "field_name", "22079405")
                                    if (flt.length > 0) {
                                        flt[0].date = itm.created_at;
                                        flt[0].d_date = itm.created_at.substr(0, 10)
                                        flt[0].d_hour = itm.created_at.substr(11, 8)
                                        flt[0].id = tkt.id;
                                        flt[0].subject = tkt.subject;
                                        flt[0].status = tkt.status;
                                        flt[0].spent = (flt[0].value - flt[0].previous_value) / 60
                                        obj.push(flt[0])
                                    }
                                }
                            })
                            jdx++;
                            if (jdx == counts) {
                                var results = obj.sort((a, b) => {
                                    return new Date(b.date) - new Date(a.date);
                                });
                                var tkt_id, t_spentspent, jj;
                                $.each(results, function(ii, key) {
                                    if (ii == 0) {
                                        tkt_id = key.id, t_spent = Number(key.spent), jj = ii, tkt_date = key.d_date;
                                    } else if (key.d_date == tkt_date) {
                                        key.d_date = "";
                                        if (key.id == tkt_id) {
                                            key.id = "", t_spent += Number(key.spent);
                                        } else {
                                            results[jj].spent = t_spent;
                                            tkt_id = key.id, tkt_subject = key.subject, t_spent = Number(key.spent), jj = ii;
                                        }
                                    } else {
                                        results[jj].spent = t_spent;
                                        tkt_id = key.id, tkt_subject = key.subject, t_spent = Number(key.spent), jj = ii, tkt_date = key.d_date;

                                    }
                                    if (ii == results.length - 1) {
                                        tickets_dashboard.tabs.teamhandled.dropdowns[tab].tmhd.results = results.filter(function(elem) {
                                            return elem.id != ""
                                        })
                                        tickets_dashboard.tabs.teamhandled.dropdowns[tab].tmhd.counts = tickets_dashboard.tabs.teamhandled.dropdowns[tab].tmhd.results.length


                                        showGrid(tickets_dashboard.tabs.teamhandled.dropdowns[tab].tmhd);
                                    }
                                })
                            }
                        })
                    })
                } else if ((tickets_dashboard.groups.CS_Dashboard || tickets_dashboard.groups.CS_Dashboard_Team_Member) && tab != "global") { //tab.indexOf("cs_") > -1
                    //console.log(11, data.counts)
                    if (data.counts == 0)
                        showGrid({
                            counts: data.counts,
                            results: []
                        })
                    else {
                        var _count = 0;
                        //getCSTktsAgency(data.results);
                        $.each(data.results, function(i, tkt) {
                            checkLastStatusChage(tkt)
                            var intervalGetStatus = setInterval(function() {
                                if (tkt.LastStatusChange) {
                                    clearInterval(intervalGetStatus)
                                    _count += 1;
                                    //console.log(99, _count, data.results.length)
                                    if (_count == data.results.length) {
                                        //console.log(66, data.counts, data.results)
                                        showGrid({
                                            counts: data.counts,
                                            results: data.results
                                        })
                                    }
                                }
                            }, 100)
                        })
                    }
                } else
                    showGrid(data)
            })
    } else {
        DoQualityReview()
    }
}

function calcTime(city, offset) {

    // create Date object for current location
    d = new Date();

    // convert to msec
    // add local time zone offset 
    // get UTC time in msec
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    // create new Date object for different city
    // using supplied offset
    nd = new Date(utc + (3600000 * offset));

    // return time as a string
    return "The local time in " + city + " is " + nd.toLocaleString();

}

function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

function DoQualityReview() {
    if (isTicketExpired() || isTicketEmpty()) {
        do_QB_DBConnect(get_QR_data);
    } else {
        var t = getKey("userticket")

        get_QR_data(t, ShowQRGrid);
    }
};

function caseStatus(status) {
    return '<i class="ticket_status_label ' + status + '">' + status.substr(0, 1) + '</i>'
}

function getCommenter(hl) {
    var rtVal = ""
    $.each(hl.internal_comments, function(k, v) {
        if (tickets_dashboard.currentUser.TierTeam[v.commenter_id]) {
            rtVal = tickets_dashboard.currentUser.TierTeam[v.commenter_id]
            return;
        }
    })


    if (rtVal == "" && tab == "handoff") {
        var nTier = isNaN(tickets_dashboard.currentUser.Tier[0].substr(5, 1)) ? tickets_dashboard.currentUser.Tier[0].toLowerCase() : Number(tickets_dashboard.currentUser.Tier[0].substr(5, 1));
        rtVal = "Tier " + (nTier == 1 ? 2 : 1);
    } else if (rtVal == "" && tab == "escalated") {

        if (!tickets_dashboard.tabs.escalated.recheck) {
            tickets_dashboard.tabs.escalated.recheck = {
                count: 0
            };
        }
        tickets_dashboard.tabs.escalated.recheck.count++
            var url = "/api/v2/tickets/" + hl.id + "/comments.json";
        DoRequest(url).then(function(res) {
            $.each(res.results, function(idx, cmt) {
                if (cmt.body.indexOf("Escalation Summary") > -1 && tickets_dashboard.currentUser.TierTeam[cmt.author_id]) {
                    tickets_dashboard.tabs.escalated.recheck[hl.id] = tickets_dashboard.currentUser.TierTeam[cmt.author_id];
                    return false;
                }
                if (idx == res.results.length - 1)
                    tickets_dashboard.tabs.escalated.recheck[hl.id] = ""
            })
        })
    }
    return rtVal;
}

function flagEscStatus() {
    var query = '%22escalation+summary%22+tags%3A%22escalated_to_r_d+escalatedto_tier2+escalatedto_tier3%22+tags%3A%22escalated_to_r_d+escalatedto_tier2+escalatedto_tier4%22+order_by%3Acreated_at+sort%3Adesc+status%3Cclosed',
        url = "/api/v2/search/incremental?per_page=100&type=ticket&query=" + query;

    tickets_dashboard.tabs.escalated.toRnD = [], delete tickets_dashboard.tabs.escalated["recheck"];
    DoRequest(url).then(function(res) {
        $.each(res.results, function(i, tkt) {
            tickets_dashboard.tabs.escalated.toRnD.push(tkt.id);
            if (i == res.results.length - 1)
                tickets_dashboard.tabs.escalated.flagRnD = 1;
        })
    })
}

function flagIncidents() {
    var url = "/api/v2/problems.json?include=incidents",
        sMany = "";
    $.extend(tickets_dashboard.tabs["global"], {
        hasIncidents: [],
        complete: 0,
        links: {}
    });
    DoRequest(url).then(function(res) {
        $.each(res.results, function(i, tkt) {
            if (tkt.has_incidents) {
                tickets_dashboard.tabs.global.hasIncidents.push(tkt.id);
                tickets_dashboard.tabs.global.links[tkt.id] = [];
                sMany += tkt.id + ',';
            }

            if (i == res.results.length - 1) {
                if (sMany == "") return false;
                sMany = sMany.substring(0, sMany.lastIndexOf(','))
                url = "/api/v2/tickets/show_many.json?ids=" + sMany + '&include=incident_counts';
                DoRequest(url).then(function(ret) {
                    $.each(ret.results, function(idx, itm) {
                        tickets_dashboard.tabs.global.links[itm.id].count = itm.incident_count;
                        if (idx == ret.results.length - 1) {
                            tickets_dashboard.tabs.global.complete = 1;
                        }
                    })
                })
            }

        })
    })
}

function loadIncidents(tktid) {
    if (typeof tickets_dashboard.tabs.global.links[tktid].items == "undefined") {
        var url = "/api/v2/tickets/" + tktid + "/incidents.json",
            sMany = "";
        DoRequest(url).then(function(res) {
            $.each(res.results, function(i, tkt) {

                sMany += tkt.id + ','
                if (i == res.results.length - 1) {
                    sMany = sMany.substring(0, sMany.lastIndexOf(','))
                    tickets_dashboard.tabs.global.links[tktid].items = sMany;
                    showIncLinks(tktid);
                }
            })
        })
    } else
        showIncLinks(tktid);
}

function showIncLinks(tktid) {
    $("#grid-data-" + tab + " td>span.id[data-ticket-id=" + tktid + "]").parent().siblings()[3].innerHTML = ''
    $.each(tickets_dashboard.tabs.global.links[tktid].items.split(','), function(i, itm) {
        var span = $("<span class='incidents' style='border: 1px solid #ddd;background-color: #eee; padding: 4px 12px; height: 28px;color: #d02020; font-weight: 600;  border-top-right-radius: 4px;  border-bottom-right-radius: 4px; '>#" + itm + "</span> ").on("click", function(e) {
            client.invoke('routeTo', 'ticket', itm)
        })
        $($("#grid-data-" + tab + " td>span.id[data-ticket-id=" + tktid + "]").parent().siblings()[3]).append(span)
    })
}

function getGroup(id) {
    var rtGrp = ""
    $.each(tickets_dashboard.currentUser.groups, function(key, val) {
        if (id == val.id) {
            rtGrp = val.name;
            return;
        }
    })
    return rtGrp;
}

function insertReLoadBtn() {
    if ($('#' + tab + ' .actions .btn-default[title="Refresh"]').length === 0) {
        btnReLoad = $('<button class="btn btn-default" type="button" title="Refresh"><span class="icon fa fa-refresh"></span></button>').on('click', function() {
            $("#grid-data-" + tab).bootgrid('destroy');
            $('.nav-tabs a[href*="#' + tab + '"] span').remove()
            $('.tab-pane').append('<img class="loading" src="spinner.gif" style="position:fixed;top:40%;left:40%" />');
            activeTab()

        })
        btnReLoad.insertBefore($('#' + tab + ' .actions .dropdown.btn-group')[0]);
    }
}

function showGrid(data, bSelection, bKeepSelection) {
    if (tab == "escalated") {
        if ((Object.keys(tickets_dashboard.tabs.escalated.recheck).length < tickets_dashboard.tabs.escalated.recheck.count + 1) && tickets_dashboard.tabs.escalated.flagRnD) {
            setTimeout(function() {
                showGrid(data)
            }, 300);
            return;
        }
        $("#grid-data-" + tab + " th[data-column-id='groups']").attr('data-formatter', "check")
    } else if (tab == "global") {
        if (!tickets_dashboard.tabs.global.complete) {
            setTimeout(function() {
                showGrid(data)
            }, 300);
            return;
        }
        $("#grid-data-" + tab + " th[data-column-id='actionBy']").html("Incidents").addClass('incdNo').css('width', '60px!important');
        $("#grid-data-" + tab + " th[data-column-id='groups']").html("Incident Tickets").addClass('incTkt');
    } else if (tab.indexOf("kb_") > -1)
        $("#grid-data-" + tab + " th[data-column-id='highInterations']").html('')

    var _tkts = "";
    var grid = $("#grid-data-" + tab).on("initialize.rs.jquery.bootgrid", function() {
        $('.nav-tabs a[href*="#' + tab + '"]').append('<span class="counter"> (' + data.counts + ')</span>')

        $('.nav-tabs li').removeClass("disabled");
        $('.loading').remove();

        for (var i = 0; i < (data.counts > 99 ? 99 : data.counts); i++) {
            if (tab.indexOf("cat_") == -1 && tab.indexOf("kb_") == -1) {
                if (tab.indexOf('tmhd_') != -1) {
                    if (i == 0)
                        nSpent = Number(data.results[i].spent), nDays = 7;
                    else if (data.results[i].d_date == "") {
                        nSpent += Number(data.results[i].spent);
                    } else {
                        $("#grid-data-" + tab).append("<tr height='150'><td>Subtotal</td><td></td><td></td><td></td><td>" + nSpent + "</td></tr>");
                        nSpent = data.results[i].spent;
                        nDays -= 1;
                        if (nDays == 0) break;
                    }
                    $("#grid-data-" + tab).append("<tr><td>" + data.results[i].d_date + "</td><td>" + data.results[i].status + "</td><td>" + data.results[i].id + "</td><td>" + data.results[i].subject + "</td><td>" + data.results[i].spent + "</td></tr>");
                    if (i == data.results - 1)
                        $("#grid-data-" + tab).append("<tr ><td>Subtotal</td><td></td><td></td><td>" + nSpent + "</td></tr>");
                } else if (tab == "handoff")
                    $("#grid-data-" + tab).append("<tr><td>" + data.results[i].status + "</td><td>" + data.results[i].id + "</td><td>" + data.results[i].subject + "</td><td>" + data.results[i].by + "</td><td>" + getGroup(data.results[i].group_id) + "</td></tr>");
                else if (tab == "escalated")
                    $("#grid-data-" + tab).append("<tr><td>" + data.results[i].status + "</td><td>" + data.results[i].id + "</td><td>" + data.results[i].subject + "</td><td>" +
                        (data.results[i].by == "" ? (tickets_dashboard.tabs.escalated.recheck[data.results[i].id] ? tickets_dashboard.tabs.escalated.recheck[data.results[i].id] : "") : data.results[i].by) + "</td><td>" + ($.inArray(data.results[i].id, tickets_dashboard.tabs.escalated.toRnD) > -1 ? "checked" : "") + "</td></tr>");
                else if (tab == "global")
                    $("#grid-data-" + tab).append("<tr><td>" + data.results[i].status + "</td><td>" + data.results[i].id + "</td><td>" + data.results[i].subject + "</td><td>" + ($.inArray(data.results[i].id, tickets_dashboard.tabs.global.hasIncidents) > -1 ? tickets_dashboard.tabs.global.links[data.results[i].id].count : "") + "</td><td></td></tr>");
                else if ((tickets_dashboard.groups.CS_Dashboard || tickets_dashboard.groups.CS_Dashboard_Team_Member) && tab != "global") { //************* CSM_dashboard ***********
                    $("#grid-data-" + tab).append("<tr><td>" + data.results[i].status + "</td><td>" + data.results[i].id + "</td><td>" + data.results[i].subject + "</td><td>" + data.results.users[data.results[i].requester_id] + "</td><td>" + data.results[i].agency + "</td><td>" + getTicketTime(data.results[i], data.results[i].created_at) + "</td><td>" + data.results[i].LastStatusChange + "</td><td>" + data.results.groups[data.results[i].group_id] + "</td></tr>");
                    _tkts += data.results[i].id;
                    if (i < data.counts - 1)
                        _tkts += ","
                } else
                    $("#grid-data-" + tab).append("<tr><td>" + data.results[i].status + "</td><td>" + data.results[i].id + "</td><td>" + data.results[i].subject + "</td><td></td><td>" + getGroup(data.results[i].group_id) + "</td></tr>");
            } else {
                $("#grid-data-" + tab).append("<tr><td>" + data.results[i].status + "</td><td>" + data.results[i].id + "</td><td>" + data.results[i].subject + "</td><td>" + getTicketTime(data.results[i]) + "</td><td>" + ($.inArray(data.results[i].id, data.highIterationTickets) > -1 ? "highlight" : "") + "</td></tr>")
            }
        }
    })
    grid.bootgrid({
            rowCount: [tickets_dashboard.tiketsPerPage, tickets_dashboard.tiketsPerPage + 10, -1],
            caseSensitive: false,
            formatters: {
                "link": function(column, row) {
                    return "<span class=\"" + column.id + "\" data-ticket-id=\"" + row.id + "\">" + ((column.id == "id" && row[column.id] != "") ? "#" : "") + row[column.id] + "</span>";
                },
                "check": function(col, row) {
                    return '<i class="material-icons" style="font-size:18px;color:#f9af02">' + row[col.id] + '</i>'
                },
                "status": function(column, row) {
                    return "<span class=\"pop ticket_status_label compact " + row[column.id] + "\">" + row[column.id].substr(0, 1) + "</span>"
                },
                "date": function(column, row) {
                    if (row.date == "Subtotal")
                        return '<p class="subTotal">' + row.date + '</p>'
                    else
                        return row.date
                }
            }
        })
        .on("loaded.rs.jquery.bootgrid", function(evt) {
            grid.find("span").on("click", function(e) {
                if ($(this).parent().hasClass('sortable'))
                    return;
                //url = client._origin + $(this).data("ticket-id")
                tktID = $(this).data("ticket-id")
                client.invoke('routeTo', 'ticket', tktID)
            });
            if (tab == "global") {
                $.each(grid.bootgrid("getCurrentRows"), function(k, row) {
                    if (row.actionBy != "") {
                        loadIncidents(row.id)
                    }
                })
            } else if (tab == "escalated") {
                $("#grid-data-" + tab + " th[data-column-id='actionBy']>a>span.text").html("Escalated By");
                $("#grid-data-" + tab + " th[data-column-id='groups']>a>span.text").html("Escalated to R&D");
            } else if (tab == "handoff")
                $("#grid-data-" + tab + " th[data-column-id='actionBy']>a>span.text").html("Handed Off By");

            insertReLoadBtn();
            if (tab.indexOf('tmhd') > -1) {
                $('.subTotal').parents().filter("tr").children().css({
                    "border-top": "1px dashed #c2c2c2",
                    "border-bottom": "2px solid #ddd",
                    "font-weight": "600"
                });


                if ($('#' + tab + ' .tabTitleDiv').length == 0) {
                    $('#' + tab + ' .actionBar').append("<div class='tabTitleDiv'><h1>Team Handled Tickets</h1>" + tickets_dashboard.tabs.teamhandled.dropdowns[tab].query.replace("commenter:", "").split(" ")[0] + "'s Handled Tickets</div>");
                }
            }
            if ($('#global .tabTitleDiv').length == 0)
                $("#global .actionBar").append("<div class='tabTitleDiv'><h1>Global Issues</h1>Open global impact tickets. Global notification were sent for these issues.</div>");
            if ($('#followed .tabTitleDiv').length == 0)
                $("#followed .actionBar").append("<div class='tabTitleDiv'><h1>Following Tickets</h1>Tickets you are following. Use the KB app to follow or unfollow tickets.</div>");
            if ($('#cced .tabTitleDiv').length == 0)
                $("#cced .actionBar").append("<div class='tabTitleDiv'><h1>CC'd Tickets</h1>Tickets you are CC'd. People may add you to CC list or you may add yourself.</div>");
            if ($('#belonging .tabTitleDiv').length == 0)
                $("#belonging .actionBar").append("<div class='tabTitleDiv'><h1>Handled Tickets</h1>Tickets you have handled. Any tickets with your comment will appear here.</div>");
            if ($('#escalated .tabTitleDiv').length == 0)
                $("#escalated .actionBar").append("<div class='tabTitleDiv'><h1>Escalated Tickets</h1>Tickets escalated from your tier will show here. Filter users using the search.</div>");
            if ($('#handoff .tabTitleDiv').length == 0)
                $("#handoff .actionBar").append("<div class='tabTitleDiv'><h1>Handoff Tickets</h1>Tickets handed off within your tier group will appear here until resolved.</div>");
            if ($('#cat_adserving .tabTitleDiv').length == 0)
                $("#cat_adserving .actionBar").append("<div class='tabTitleDiv'><h1>Ad Serving Tickets</h1>Resolution time and high iteration ticket monitoring for Ad Serving domain.</div>");
            if ($('#cat_admin .tabTitleDiv').length == 0)
                $("#cat_admin .actionBar").append("<div class='tabTitleDiv'><h1>Admin Tickets</h1>Resolution time and high iteration ticket monitoring for Admin domain.</div>");
            if ($('#cat_analytics .tabTitleDiv').length == 0)
                $("#cat_analytics .actionBar").append("<div class='tabTitleDiv'><h1>Analytics Tickets</h1>Resolution time and high iteration ticket monitoring for Analytics domain.</div>");
            if ($('#cat_platformfunc .tabTitleDiv').length == 0)
                $("#cat_platformfunc .actionBar").append("<div class='tabTitleDiv'><h1>Platform Functionality Tickets</h1>Resolution time and high iteration ticket monitoring for Platform Functionality domain.</div>");
            if ($('#cat_discrepancy .tabTitleDiv').length == 0)
                $("#cat_discrepancy .actionBar").append("<div class='tabTitleDiv'><h1>Discrepancy Tickets</h1>Resolution time and high iteration ticket monitoring for Discrepancy domain.</div>");
            if ($('#cat_advtags .tabTitleDiv').length == 0)
                $("#cat_advtags .actionBar").append("<div class='tabTitleDiv'><h1>Advertiser Level Tags Tickets</h1>Resolution time and high iteration ticket monitoring for Advertiser Level Tags domain.</div>");
            if ($('#cat_creative .tabTitleDiv').length == 0)
                $("#cat_creative .actionBar").append("<div class='tabTitleDiv'><h1>Creative Tickets</h1>Resolution time and high iteration ticket monitoring for Creative domain.</div>");
            if ($('#cat_trading .tabTitleDiv').length == 0)
                $("#cat_trading .actionBar").append("<div class='tabTitleDiv'><h1>Trading Tickets</h1>Resolution time and high iteration ticket monitoring for Trading domain.</div>");
            if ($('#cat_cus_sol .tabTitleDiv').length == 0)
                $("#cat_cus_sol .actionBar").append("<div class='tabTitleDiv'><h1>Custom Solutions Tickets</h1>Resolution time and high iteration ticket monitoring for Custom Solutions domain.</div>");
            if ($('#cat_peer39 .tabTitleDiv').length == 0)
                $("#cat_peer39 .actionBar").append("<div class='tabTitleDiv'><h1>Peer39 Tickets</h1>Resolution time and high iteration ticket monitoring for Peer39 domain.</div>");
            if ($('#cat_api .tabTitleDiv').length == 0)
                $("#cat_api .actionBar").append("<div class='tabTitleDiv'><h1>API Tickets</h1>Resolution time and high iteration ticket monitoring for API domain.</div>");
            if ($('#cat_bill .tabTitleDiv').length == 0)
                $("#cat_bill .actionBar").append("<div class='tabTitleDiv'><h1>Billing Tickets</h1>Resolution time and high iteration ticket monitoring for Billing domain.</div>");
            if ($('#cat_sem .tabTitleDiv').length == 0)
                $("#cat_sem .actionBar").append("<div class='tabTitleDiv'><h1>SEM Connect Tickets</h1>Resolution time and high iteration ticket monitoring for SEM Connect domain.</div>");
            if ($('#cat_search .tabTitleDiv').length == 0)
                $("#cat_search .actionBar").append("<div class='tabTitleDiv'><h1>Search Connect Tickets</h1>Resolution time and high iteration ticket monitoring for Search Connect domain.</div>");
            if ($('#cat_strike .tabTitleDiv').length == 0)
                $("#cat_strike .actionBar").append("<div class='tabTitleDiv'><h1>StrikeAd Connect Tickets</h1>Resolution time and high iteration ticket monitoring for StrikeAd domain.</div>");

            if (tab.indexOf('cs_') > -1) {
                if ($('#' + tab + ' .tabTitleDiv').length == 0) {
                    var _txtCat = $('.nav.nav-tabs>li.active li.active').text().split('(')[0];
                    if (tab.indexOf('cs_team_') > -1) {
                        $('#' + tab + " .actionBar").append("<div class='tabTitleDiv'><h1 class=\"csTeamName\">" + _txtCat + "</h1>Tickets requested from <span class=\"csTeamName\">" + _txtCat.replace("Unresolved Tickets", "") + "</span>. <button class=\"c-btn c-btn--primary btn batchHandOff \" data-tkts=\"" + _tkts + "\">CC Me</button></div>");
                        $('#' + tab + ' .batchHandOff').on("click", function(event) {
                            _tkts = $('#' + tab + ' .batchHandOff').data("tkts");
                            bRemoveCC = $('#' + tab + ' .batchHandOff').hasClass('UnCC');
                            if (bRemoveCC) {
                                $('#' + tab + ' .batchHandOff').removeClass('UnCC').html('CC Me');
                                delCCsTkts(_tkts) //.then(function(res){console.log(77, res); })
                            } else {
                                $('#' + tab + ' .batchHandOff').addClass('UnCC').html('Remove me from CC');
                                addCCsTkts(_tkts) //.then(function(res){console.log(33, res); })
                            }
                        })
                    } else
                        $('#' + tab + " .actionBar").append("<div class='tabTitleDiv'><h1>" + _txtCat + "</h1>Tickets requested from " + _txtCat.replace("Unresolved Tickets", "") + " team.</div>")
                }
            }
        })
}

function delCCsTkts(sMany) {
    var url = "/api/v2/tickets/show_many.json?ids=" + sMany;
    DoRequest(url).then(function(data) {
        $.each(data.results, function(i, tkt) {
            var index = tkt.collaborator_ids.indexOf(tickets_dashboard.currentUser.id);
            if (index !== -1) tkt.collaborator_ids.splice(index, 1);
            var settings = {
                url: "/api/v2/tickets/" + tkt.id + ".json",
                data: {
                    "ticket": {
                        "collaborator_ids": tkt.collaborator_ids
                    }
                },
                type: 'PUT',
                dataType: 'json'
            };

            return client.request(settings).then(function(data) {
                    return data;
                },

                function(response) {
                    console.error(response.responseText);
                });
        })
    })
};

function addCCsTkts(ids) {
    var me = [],
        ticketJSON, url = '/api/v2/tickets/update_many.json?ids=' + ids; // removeCC ? '/api/v2/tickets/'+tkt+'.json': 
    me.push(tickets_dashboard.currentUser.id);
    ticketJSON = {
        "ticket": {
            "additional_collaborators": me
        }
    }

    var settings = {
        url: url,
        data: ticketJSON,
        type: 'PUT',
        dataType: 'json'
    };

    return client.request(settings).then(function(data) {
            return data;
        },

        function(response) {
            console.error(response.responseText);
        });
}

function getTierTeam() {
    var supportTiers = {
        "tier 1 apac": 27176803,
        "tier 1 emea": 27236946,
        "tier 1 nam": 27236626,
        "tier 2 apac": 26631066,
        "tier 2 emea": 27176783,
        "tier 2 nam": 27236666,
        "tier 3": 360000262152
    }
    var nTier = isNaN(tickets_dashboard.currentUser.Tier[0].substr(5, 1)) ? tickets_dashboard.currentUser.Tier[0].toLowerCase() : Number(tickets_dashboard.currentUser.Tier[0].substr(5, 1));

    if (!isNaN(nTier)) {
        if (tickets_dashboard.currentUser["Tier " + nTier])
            return;
        else {
            tickets_dashboard.currentUser.TierTeam = {}
            $.each(tickets_dashboard.currentUser.Team, function(k, v) {
                tickets_dashboard.currentUser.TierTeam[v.id] = (v.name)
            })
            if (nTier == 3) return;

            for (var i = 0; i < 3; i++) {
                var idx = 3 * (nTier - 1) + i,
                    keys = Object.keys(supportTiers);
                if (keys[idx] != tickets_dashboard.currentUser.Tier[0].toLowerCase() && supportTiers[keys[idx]] != tickets_dashboard.currentUser.Tier[1]) {
                    var url = "/api/v2/groups/" + supportTiers[keys[idx]] + "/users.json";

                    DoRequest(url).then(function(users) {
                        $.each(users.results, function(i, user) {
                            tickets_dashboard.currentUser.TierTeam[user.id] = user.name;
                        })
                    })
                }
            }
        }
    }
}

function getData(url) {
    if (!url) {
        var tab = tickets_dashboard.tabs.active;

        if (tickets_dashboard.tabs[tab]) {
            url = "/api/v2/search/incremental?per_page=100&type=ticket&query=" + tickets_dashboard.tabs[tab].query + "+order_by%3Astatus+sort%3Aasc"
            if (tab != "followed")
                url += "%20status<closed";
            if (tab == "escalated" || tab == "handoff") {
                url += "&include=highlights";
                getTierTeam();
            }
        } else if (tickets_dashboard.tabs["involved"]["dropdowns"][tab]) {
            url = client._origin + "/api/v2/search/incremental?per_page=100&type=ticket&query=" + tickets_dashboard.tabs["involved"]["dropdowns"][tab].query + "+order_by%3Astatus+sort%3Aasc%20status<closed";
        } else if (tickets_dashboard.tabs["kbcontribute"]["dropdowns"][tab]) {
            url = client._origin + '/api/v2/search/incremental?per_page=100&type=ticket&query=group:documentation "' + tickets_dashboard.tabs["kbcontribute"]["dropdowns"][tab].query + '"+order_by%3Astatus+sort%3Aasc%20status<closed';
        } else if (tickets_dashboard.tabs["teamhandled"]["dropdowns"][tab]) {
            url = "/api/v2/search/incremental?per_page=" + tickets_dashboard.tabs.teamhandled.counts + "&type=ticket&query=" + tickets_dashboard.tabs.teamhandled.dropdowns[tab].query + "+order_by%3Acommented+sort%3Adesc"
        } else if (tab.indexOf("cs_") > -1) {
            var mkt = tickets_dashboard.tabs.curRegion;
            if (tab.indexOf("cs_team") > -1) {
                var today = new Date(),
                    priorDate = today.setDate(today.getDate() - 30),
                    searchDate = new Date(priorDate).toISOString()

                url = "/api/v2/search/incremental?per_page=50&type=ticket&query=" + tickets_dashboard.tabs.CS[mkt].dropdowns[tab].query + "+ -group:\"documentation\" +created>=" + searchDate + " +status<closed+order_by%3Astatus+sort%3Adesc";
            } else
                url = "/api/v2/search/incremental?per_page=100&type=ticket&query=" + tickets_dashboard.tabs.CS[mkt].dropdowns[tab].query + "+ -group:\"documentation\" +status<=hold+order_by%3Astatus+sort%3Adesc";
        }
    }
    return DoRequest(url)
}

function DoRequest(url, bRetAll) {
    var settings = {
        url: url,
        type: "GET",
        contentType: 'application/json'
    };

    return client.request(settings).then(function(data) {
            if (bRetAll)
                return data;
            else {
                if (Object.keys(data).indexOf("groups") > -1) {
                    data[Object.keys(data)[0]].groups = []
                    $.each(data["groups"], function(idx, val) {
                        data[Object.keys(data)[0]].groups[val.id] = val.name
                    })
                }
                if (Object.keys(data).indexOf("users") > -1) {
                    data[Object.keys(data)[0]].users = [];
                    $.each(data["users"], function(_idx, _val) {
                        data[Object.keys(data)[0]].users[_val.id] = _val.name
                    })
                }
                return {
                    counts: data.count,
                    results: data[Object.keys(data)[0]],
                    highlights: (data.highlights && data.highlights.results) ? data.highlights.results : -1
                };
            }
        },
        function(response) {
            console.error(response.responseText);
        });
}

function CSuser() {
    tickets_dashboard.groups = [];
    tickets_dashboard.currentUser.regions = ["APAC", "EMEA", "NAM", "LATAM", "Reseller"]
    var retV, idx;
    $.each(tickets_dashboard.currentUser.groups, function(key, val) {
        groupName = val.name.toUpperCase()
        if (groupName.indexOf('CS DASHBOARD') > -1) {
            tickets_dashboard.groups[val.name.replace(/ /g, '_')] = val.id;
            retV = val.name;
            return false;
        } else if (groupName == 'SUPPORT MANAGEMENT') {
            tickets_dashboard.groups["CS_Dashboard"] = 360000093891;
            retV = "CS Dashboard"
        } else if (groupName == "TIER 3 LEADERS") {
            tickets_dashboard.groups = [];
            retV = false;
            return false;
        }
    })
    if (retV) {
        $(".nav-tabs>li").not(":contains('My Handled')").not(":contains('Following')").not(":contains('Global')").not(":contains('My CC')").not(":contains('Quality')").remove();
        $(".nav-tabs>li a[href*=qr_teamrv]").remove();
        if (tickets_dashboard.groups.CS_Dashboard) {
            $.each(tickets_dashboard.currentUser.regions, function(_key, _val) {
                $(".nav-tabs").append('<li class="dropdown CS_dashboard ' + _val + '"><a class="dropdown-toggle CS" data-toggle="dropdown">' + _val + ' CS Dashboard <span class="caret"></span></a><ul class="dropdown-menu"><a href=""></ul></li>');
            })
        } else if (tickets_dashboard.groups.CS_Dashboard_Team_Member) {
            $(".nav-tabs").append('<li class="dropdown CS_dashboard Team_Tickets"><a class="dropdown-toggle CS" data-toggle="dropdown"> Team Tickets <span class="caret"></span></a><ul class="dropdown-menu"><a href=""></ul></li>');
            tickets_dashboard.tabs.CS = {
                TEAM: {
                    dropdowns: {}
                }
            };
        }
    }
    return retV
}

function CSteamMenu(xml) {
    var rec = {};
    for (var i = count = 0; i < xml.length; i++) {
        if (xml[i].children[0].textContent == "" || xml[i].children[1].textContent == "") { //
            continue;
        }
        rec[count] = {}
        for (var x = 0; x < 2; x++) {
            if (xml[i].children[x].tagName == "update_id") {
                continue;
            }
            rec[count][xml[i].children[x].tagName] = xml[i].children[x].textContent;
            if (rec[count].email_address == tickets_dashboard.currentUser.email) {
                tickets_dashboard.currentUser.CS_TeamName = rec[count].managing_team_name;
            }
        }
        count += 1;
    }
    mkt = "TEAM"
    tickets_dashboard.currentUser.CS_team = []
    $.each(rec, function(idx, obj) {
        if (obj.managing_team_name == tickets_dashboard.currentUser.CS_TeamName) {
            var nm = obj.email_address.split('@')[0],
                _nm = nm.replace(/\./g, '_'),
                _anchor = "cs_team_" + _nm; //_nm =nm.replace(/\./g,' ');
            tickets_dashboard.currentUser.CS_team.push(obj.email_address)

            if (!tickets_dashboard.tabs.CS[mkt].dropdowns[_anchor]) {
                tickets_dashboard.tabs.CS[mkt].dropdowns[_anchor] = {
                    "query": "requester:" + obj.email_address
                };
                $('.tab-content').append('<div id="' + _anchor + '" class="tab-pane fade"></div>')
                $("li.CS_dashboard.Team_Tickets>ul.dropdown-menu").append('<li><a href="#' + _anchor + '">' + nm.replace(/\./g, ' ') + '</a></li>')
                $('a[href="#' + _anchor + '"]').on("click", function(event) {
                    $(this).off('shown.bs.tab')
                    var tab = $(event.target).attr("href").replace("#", "");
                    tickets_dashboard.tabs.active = tab;
                    tickets_dashboard.tabs.curRegion = mkt;
                    activeTab()
                })
            }
        }
    })
}

function getCSdata(ticket, bChkRegions, callback) {
    var requestKey = 'request:QB_CS',
        target_dbid = 'bhxqi55ba',
        query = "{'35'.EX.'1'}";
    var settings = {
        url: 'https://sizmek.quickbase.com/db/' + target_dbid,
        data: {
            act: 'API_DoQuery',
            apptoken: 'd7bv4bmdbbbmxe2fs7m8d8jpktk',
            ticket: ticket,
            clist: '29.7',
            query: query
        },
        type: 'GET',
        dataType: 'xml'
    };
    client.on(requestKey + '.done', function(evt) {
        var xmlobj = $.parseXML(evt.responseArgs[1].responseText),
            xml = xmlobj.getElementsByTagName("record");

        if (bChkRegions) {
            for (var i = 0; i < xml.length; i++) {
                record = {};
                for (var x = 0; x < xml[i].children.length; x++)
                    record[xml[i].children[x].tagName] = xml[i].children[x].textContent;

                var _cs = 'cs_' + record.managing_team_name.replace(/ /g, "_"),
                    mkt;
                $.each(record.managing_team_name.split(' '), function(k, v) {
                    var idx = tickets_dashboard.currentUser.regions.indexOf(v);
                    if (idx > -1) {
                        mkt = tickets_dashboard.currentUser.regions[idx]
                        if (!tickets_dashboard.tabs.CS[mkt].dropdowns[_cs])
                            tickets_dashboard.tabs.CS[mkt].dropdowns[_cs] = (record.email_address == "") ? "" : {
                                "query": "requester:" + record.email_address
                            };
                        else if (record.email_address != "")
                            tickets_dashboard.tabs.CS[mkt].dropdowns[_cs].query += " requester:" + record.email_address
                        return true;
                    }
                })
            }
        }
        if (typeof callback == "function")
            callback.call(this, xml)
    });
    client.on(requestKey + '.fail', function(evt) {});
    client.postMessage(requestKey, settings);
}

function CSmenu() {
    $.each(tickets_dashboard.currentUser.regions, function(key, val) {
        $.each(tickets_dashboard.tabs.CS[val].dropdowns, function(k, v) {
            var _cs = k;
            $('.tab-content').append('<div id="' + _cs + '" class="tab-pane fade"></div>')
            $("li.CS_dashboard." + val + ">ul.dropdown-menu").append('<li><a href="#' + _cs + '">' + k.replace("cs_", '').replace(/_/g, " ") + ' Unresolved Tickets</a></li>')
            $('a[href="#' + _cs + '"]').on("click", function(event) {
                $(this).off('shown.bs.tab')
                var tab = $(event.target).attr("href").replace("#", "");
                tickets_dashboard.tabs.active = tab, tickets_dashboard.tabs.curRegion = val;
                activeTab()
            })
        });
    })
}

function getTier() {
    tickets_dashboard.groups = [], sTier = "", nTierID = -1;
    var groupFilters = ["support", "tier 3 engineer", "tier 1 apac", "tier 2 apac", "tier 1 nam", "tier 2 nam", "tier 1 emea", "tier 2 emea", "tier 1 leaders", "tier 2 leaders", "tier 3 leaders", "support management"];

    $.each(tickets_dashboard.currentUser.groups, function(key, val) {
        var idx = $.inArray(val.name.toLowerCase(), groupFilters)

        if (idx > -1) {
            tickets_dashboard.groups.push([val.name, val.id])
            //nTier = (idx>0 && idx<=6)?groupFilters[idx].substr(0, 6):nTier =groupFilters[idx]

            if (idx > 0 && idx < groupFilters.length) {
                if (groupFilters[idx] == "tier 3 leaders" || groupFilters[idx].indexOf("management") > 0 || (sTier.toLowerCase().indexOf("management") == -1 && groupFilters[idx].indexOf("leaders") > 0) || sTier == "") {
                    sTier = val.name, nTierID = val.id;
                }
            }
        }
    })

    tickets_dashboard.currentUser.Tier = [sTier, nTierID]
    if (sTier.toLowerCase().indexOf('leaders') > -1) {
        tier = sTier.substr(0, 6);
        $.each(tickets_dashboard.groups, function(k, v) {
            if (v[0].indexOf(tier) != -1 && v[0] != sTier) {
                tickets_dashboard.currentUser.Tier.push(v[0], v[1]);
                sTier = v[0], nTierID = v[1]
                return false;
            }
        })
    }

    tickets_dashboard.currentUser.Domain = ["Ad Serving", "Admin", "Analytics", "Platform Functionality", "Discrepancy", "Advertiser Level Tags", "Creative", "Trading", "Custom Solutions", "Peer39", "API", "Billing", "SEM Connect", "Search Connect", "StrikeAd"]
    $.each(tickets_dashboard.currentUser.Domain, function(k, v) {
        var _kb = 'kb_' + v.replace(/ /g, "_")
        tickets_dashboard.tabs.kbcontribute.dropdowns[_kb] = {
            "query": v
        };
        $('.tab-content').append('<div id="' + _kb + '" class="tab-pane fade"></div>')
        $(".kbcontribute>ul.dropdown-menu").append('<li><a href="#' + _kb + '">' + v + '</a></li>')
        $('a[href="#' + _kb + '"]').on("click", function(event) {
            $(this).off('shown.bs.tab')
            var tab = $(event.target).attr("href").replace("#", "");
            tickets_dashboard.tabs.active = tab;
            activeTab()
        })
    });
    tickets_dashboard.tabs.kbcontribute.dropdowns.kb_my.query = tickets_dashboard.currentUser.name;
    tickets_dashboard.currentUser.Team = [];

    url = "/api/v2/groups/" + nTierID + "/users.json";
    DoRequest(url).then(function(users) {
        $.each(users.results, function(i, user) {
            var itm = {}
            itm["name"] = user.name, itm["id"] = user.id, itm["email"] = user.email;
            tickets_dashboard.currentUser.Team.push(itm);
            tickets_dashboard.tabs.teamhandled.dropdowns['tmhd_' + user.id] = {
                "query": "commenter:" + user.name
            };
            //tickets_dashboard.tabs.teamhandled
            $('.tab-content').append('<div id="tmhd_' + user.id + '" class="tab-pane fade"></div>')
            $(".teamhandled>ul.dropdown-menu").append('<li><a href="#tmhd_' + user.id + '">' + user.name + '</a></li>')
            $('a[href="#tmhd_' + user.id + '"]').on("click", function(event) {
                $(this).off('shown.bs.tab')
                var tab = $(event.target).attr("href").replace("#", "");
                tickets_dashboard.tabs.active = tab;
                activeTab()
            })
        })
        $('.teamhandled:not(.team) a[href*=tmhd_' + tickets_dashboard.currentUser.id + ']').parent().show()
    })

    if (tickets_dashboard.currentUser.id == 334160899) {
        nTierID = 21321029;
        url = "/api/v2/groups/" + nTierID + "/users.json";

        DoRequest(url).then(function(users) {
            $.each(users.results, function(i, user) {
                if (!tickets_dashboard.tabs.teamhandled.dropdowns['tmhd_' + user.id]) {
                    tickets_dashboard.tabs.teamhandled.dropdowns['tmhd_' + user.id] = {
                        "query": "commenter:" + user.name
                    };
                    $('.tab-content').append('<div id="tmhd_' + user.id + '" class="tab-pane fade"></div>')
                    $(".teamhandled>ul.dropdown-menu").append('<li><a href="#tmhd_' + user.id + '">' + user.name + '</a></li>')
                    $('a[href="#tmhd_' + user.id + '"]').on("click", function(event) {
                        $(this).off('shown.bs.tab')
                        var tab = $(event.target).attr("href").replace("#", "");
                        tickets_dashboard.tabs.active = tab;
                        activeTab()
                    })
                }
            })
            $('.teamhandled:not(.team) a[href*=tmhd_' + tickets_dashboard.currentUser.id + ']').parent().show()
        })
    }



    var uTier = tickets_dashboard.currentUser.Tier[0].toLowerCase();
    if (uTier.indexOf("leaders") != -1 || uTier.indexOf("support management") != -1) { //QR is only for leaders and support management  /**/
        $('.nav-tabs .qualityreview').addClass("team")
        $('.nav-tabs .teamhandled').addClass("team")
    }

}

String.prototype.capitalize = function() {
    return this.replace(/(^|\s)([a-z])/g, function(m, p1, p2) {
        return p1 + p2.toUpperCase();
    });
};

function ShowQRGrid(data) { //QR grid
    var str = '',
        lnk = '#';
    var grid = $("#grid-data-" + tab).on("initialize.rs.jquery.bootgrid", function() {
        if ($("#grid-data-" + tab + " >tbody >tr").length == 0 && data.counts > 0) { //table initialise, set placement to get right pagination
            //$('.nav-tabs a[href="#' + tab + '"]').append(' (' + data.counts + ')');
            $('.nav-tabs a[href*="#' + tab + '"]').append('<span class="counter"> (' + data.counts + ')</span>')
            for (var i = 0; i < data.counts; i++) {
                $("#grid-data-" + tab).append("<tr><td>" + data.results[i].commentid + "</td><td>" + data.results[i].ticket_id + "</td><td>" + data.results[i].ratee_email + "</td><td>" + data.results[i].rating + "</td><td>" + ($('.nav-tabs .qualityreview').hasClass('team') ? data.results[i].rater_name : "") + "</td><td>" + data.results[i].reviewer + "</td><td>" + ((data.results[i].reviewed == "1") ? 'check' : '') + "</td><td>" + data.results[i].remarks + "</td></tr>");
            }
        } else {}
    })
    grid.bootgrid({
        rowCount: [tickets_dashboard.tiketsPerPage, tickets_dashboard.tiketsPerPage + 10, -1],
        caseSensitive: false,
        formatters: {
            "link": function(column, row) {
                url = "//sizmek.zendesk.com/agent/tickets/" + row.id;
                return "<span class=\"" + column.id + "\" data-ticket-id=\"" + row.id + "\">" + row[column.id] + "</span>";
            },
            "linkQB": function(column, row) {
                var sQB = '<a class="material-icons" target="_blank" href="https://sizmek.quickbase.com/db/bk6ag4284?a=dbpage&pageName=rating_review.html&_fid_7=' + row.QBlink + '&_fid_6=' + row.id + '&_fid_8=' + row.ratee + '">explore</a>'
                return sQB
            },
            "rating": function(column, row) {
                var sRT = ""
                for (var i = 1; i <= row.rating; i++)
                    sRT += '<i class="material-icons" style="font-size:24px;color:green">stars</i>'
                return sRT
            },
            "check": function(col, row) {
                return '<i class="material-icons" style="font-size:18px;color:green">' + row[col.id] + '</i>'
            },
            "mailToName": function(col, row) {
                return row[col.id].split('@')[0].replace('.', ' '); //.capitalize();
            },
            "remarks": function(col, row) {
                return '<p title="' + row.remarks + '">' + row.remarks + '</p>'

            }
        }
    }).on("loaded.rs.jquery.bootgrid", function() {
        $('.nav-tabs li').removeClass("disabled");
        $('.loading').remove();
        if (!$('.nav-tabs .qualityreview').hasClass('team')) {
            $('th[data-column-id="rater"]').html("").css('width', '0px!important');
        }


        grid.find("span").on("click", function(e) {
            url = client._origin + "/agent/" + $(this).data("ticket-id")
            tktID = $(this).data("ticket-id");
            client.invoke('routeTo', 'ticket', tktID);
        })
        insertReLoadBtn();
        if ($('#qr_reviewed .tabTitleDiv').length == 0)
            $("#qr_reviewed .actionBar").append("<div class='tabTitleDiv'><h1>Reviewed Tickets</h1>Tickets you reviewed. Click on See Details for more information.</div>");
        if ($('#qr_teamrv .tabTitleDiv').length == 0)
            $("#qr_teamrv .actionBar").append("<div class='tabTitleDiv'><h1>Team Reviews</h1>Reviews of tickets from your team members by other people.</div>");
    })
}

function initQuery() {

    if (tickets_dashboard.currentUser.Tier === undefined) {
        //nTier = tickets_dashboard.tabs.CS.market;
    } else
        var nTier = isNaN(tickets_dashboard.currentUser.Tier[0].substr(5, 1)) ? tickets_dashboard.currentUser.Tier[0].toLowerCase() : Number(tickets_dashboard.currentUser.Tier[0].substr(5, 1));
    var curName = encodeURIComponent(tickets_dashboard.currentUser.name.replace(/ /g, "+"));
    $.each(tickets_dashboard.tabs, function(tab, obj) {

        switch (tab) {
            case "global":
                //obj.query = 'ticket_type:problem form:"Global Issue - FOR SUPPORT USE ONLY" status<solved';
                obj.query = 'ticket_type:problem';
                break;
            case "followed":
                obj.query = "tags:follow_" + tickets_dashboard.currentUser.email.replace('@', '_').replace(/\./g, "_");
                break;
            case "cced":
                obj.query = "cc:" + tickets_dashboard.currentUser.email;
                break;
            case "belonging":
                obj.query = "commenter:" + curName;
                break;
            case "escalated": //Tier escalated   //??don't know escalated list for support management??
                obj.query = 'escalation%20summary+'
                if (nTier == 1)
                    obj.query += 'tags:"escalatedto_tier2"+tags:"escalatedto_tier3" tags:"escalatedto_tier4"';
                else if (nTier == 2)
                    obj.query += 'tags:"escalatedto_tier2+escalatedto_tier3"+tags:"escalatedto_tier2+escalatedto_tier4"';
                else //if (nTier==3)
                    obj.query += 'tags:"escalatedto_tier3 escalatedto_tier4"';
                break;
            case "handoff": // need tier handoff, dont need specific person
                obj.query = '"hand+off+summary"+'
                break;
            case "qualityreview": //quality review   new process ; checkbox show reviewed,  
                if (isTicketExpired() || isTicketEmpty()) {
                    do_QB_DBConnect();
                };
                break;
            case "kbcontribute":
                obj.query = "group:documentation"; //+tickets_dashboard.currentUser.name;
                break;
            case "involved":
                $.each(obj.dropdowns, function(itm, o) {
                    o.highIterationTickets = [];
                    itm = itm.replace("cat_", "")
                    switch (itm) {
                        case "admin":
                            o.query = "tags:\"domain_admin\"+group:\"Tier " + nTier + "\"";
                            break;
                        case "discrepancy":
                            o.query = "tags:\"domain_discrepancy\"+group:\"Tier " + nTier + "\""
                            break;
                        case "adserving":
                            o.query = "tags:\"domain_ad_serving\"+group:\"Tier " + nTier + "\""
                            break;
                        case "platformfunc":
                            o.query = "tags:\"domain_platform_functionality\"+group:\"Tier " + nTier + "\""
                            break;
                        case "creative":
                            //o.query = tickets_dashboard.currentUser.name+"+domain:\"Admin\"+group:\"Tier "+nTier+"\""
                            o.query = "tags:\"domain_creative\"+group:\"Tier " + nTier + "\""
                            break;
                        case "advtags":
                            o.query = "tags:\"domain_advertiser_level_tags\"+group:\"Tier " + nTier + "\""
                            break;
                        case "analytics":
                            o.query = "tags:\"domain_analytics\"+group:\"Tier " + nTier + "\""
                            break;
                        case "trading":
                            o.query = "tags:\"domain_trading\"+group:\"Tier " + nTier + "\"";
                            break;
                        case "cus_sol":
                            o.query = "tags:\"domain_custom_solutions \"+group:\"Tier " + nTier + "\""
                            break;
                        case "peer39":
                            o.query = "tags:\"domain_peer39\"+group:\"Tier " + nTier + "\""
                            break;
                        case "api":
                            //o.query = tickets_dashboard.currentUser.name+"+domain:\"Platform Functionality\"+group:\"Tier "+nTier+"\""
                            o.query = "tags:\"domain_api\"+group:\"Tier " + nTier + "\""
                            break;
                        case "bill":
                            o.query = "tags:\"domain_billing\"+group:\"Tier " + nTier + "\""
                            break;
                        case "sem":
                            o.query = "tags:\"domain_sem_connect\"+group:\"Tier " + nTier + "\""
                            break;
                        case "search":
                            o.query = "tags:\"domain_search_connect\"+group:\"Tier " + nTier + "\""
                            break;
                        case "strike":
                            //o.query = tickets_dashboard.currentUser.name+"+domain:\"Analytics\"+group:\"Tier "+nTier+"\""
                            o.query = "tags:\"domain_strikead\"+group:\"Tier " + nTier + "\""
                            break;

                            /*case "others":
                              o.query = "-tags:\"domain_discrepancy\"-tags:\"domain_ad_serving\"-tags:\"domain_platform_functionality\"-tags:\"domain_advertiser_level_tags\"-tags:\"domain_analytics\"-tags:\"domain_creative\"+group:\"Tier "+nTier+"\"";
                              break;*/
                    }
                })
                break;
        }

    })
}

function setKey(key, val) {
    localStorage.setItem(key, val);
}

function getKey(key) {
    var retV = localStorage.getItem(key)
    return retV;
}

function isTicketExpired() {
    var t = getKey("ticket_time");

    var tTime = parseInt(t, 10);
    var current = new Date().getTime();
    var diff = Math.abs(current - tTime) / 3600000;
    return (diff > 24 || (t == null || t === undefined));
}

function isTicketEmpty() {
    var t = getKey("userticket")
    return (t == null || t === undefined);
}


function get_QR_data(ticket, callback) {
    var requestKey = 'request:QB2',
        query = "";

    if (tickets_dashboard.tabs.active == "qr_teamrv") {
        if ($('.nav-tabs .qualityreview').hasClass('team')) {
            $.each(tickets_dashboard.currentUser.Team, function(k, val) {
                (k === tickets_dashboard.currentUser.Team.length - 1) ? query += "{'8'.EX.'" + val.email + "'}": query += "{'8'.EX.'" + val.email + "'}OR"
            })
        } else
            query = "{'8'.EX.'" + tickets_dashboard.currentUser.email + "'}";
    } else
        query = "{'11'.EX.'" + tickets_dashboard.currentUser.name + "'}OR{'34'.EX.'" + tickets_dashboard.currentUser.name + "'}";

    var settings = {
        url: 'https://sizmek.quickbase.com/db/bk6ag4284',
        data: {
            act: 'API_DoQuery',
            apptoken: 'd7bv4bmdbbbmxe2fs7m8d8jpktk',
            ticket: ticket,
            includeRids: 1,
            // field_id=8 -> Ratee Email ; Rater Name: field_id=11; Reviewed By: field_id=17;
            query: query //"{'8'.EX.'"+tickets_dashboard.currentUser.name+"'}OR{'11'.EX.'"+tickets_dashboard.currentUser.name+"'}OR{'17'.EX.'"+tickets_dashboard.currentUser.name+"'}"
        },
        type: 'GET',
        dataType: 'xml'
    };
    client.on(requestKey + '.done', function(evt) {
        var data = [],
            xmlobj = $.parseXML(evt.responseArgs[1].responseText),
            xml = xmlobj.getElementsByTagName("record");

        for (var i = 0; i < xml.length; i++) {
            record = {};
            for (var x = 0; x < xml[i].children.length; x++) {
                record[xml[i].children[x].tagName] = xml[i].children[x].textContent;
                record["rid"] = xml[i].getAttribute("rid");

            }
            data.push(record);

            //setKey("QR_tickets",JSON.stringify({results: data, counts:data.length}));
        }
        if (typeof callback == "function")
            callback.call(this, {
                results: data,
                counts: data.length
            })

    });
    client.on(requestKey + '.fail', function(evt) {});
    client.postMessage(requestKey, settings);
}

var client = ZAFClient.init();

client.on('app.registered', function(e) {
    init();
});

function getCurrentUser() {
    return client.get('currentUser').then(function(data) {
        return data['currentUser'];
    });
}

function GetAppData() {
    client.metadata().then(function(metadata) {
        return metadata.installationId
    })
}

function QBhandler(res) {
    var data = $.parseXML(res.responseArgs[1].responseText);
    var ticket = data.getElementsByTagName("ticket")[0].childNodes[0].nodeValue;
    setKey("userticket", ticket);
    setKey("ticket_time", new Date().getTime());
}

function do_QB_DBConnect(callback) {
    var requestKey = 'request:QB1';
    var settings = {
        url: client._origin + "/proxy/to/https://sizmek.quickbase.com/db/main",
        type: "GET",
        data: {
            act: 'API_Authenticate',
            apptoken: 'd7bv4bmdbbbmxe2fs7m8d8jpktk',
            username: 'support.monitoring@sizmek.com',
            password: 'Sizmek123',
            hours: '24'
        },
        contentType: 'application/xml'
    };
    client.on(requestKey + '.done', function(res) {
        var data = $.parseXML(res.responseArgs[1].responseText);
        var ticket = data.getElementsByTagName("ticket")[0].childNodes[0].nodeValue;
        setKey("userticket", ticket);
        setKey("ticket_time", new Date().getTime());
        if (typeof callback == "function")
            callback.call(ticket, this, arguments)
    });
    client.on(requestKey + '.fail', function(evt) {
        QBhandler.apply(this, evt.responseArgs);
    });
    client.postMessage(requestKey, settings);
}

function initCSDashBoard(csUser) {
    var t = getKey("userticket")
    if (csUser == "CS DASHBOARD" || csUser == "SUPPORT MANAGEMENT")
        getCSdata(t, 1, CSmenu)
    else
        getCSdata(t, 0, CSteamMenu)
}

function init() {
    initTabs();
    getCurrentUser().then(function(currentUser) {
        tickets_dashboard.currentUser = currentUser;
        var csUser = CSuser();
        if (csUser) {
            csUser = csUser.toUpperCase();
            if (isTicketExpired() || isTicketEmpty())
                do_QB_DBConnect(function() {
                    initCSDashBoard(csUser)
                });
            else {
                initCSDashBoard(csUser)
            }
        } else
            getTier();
        initQuery();
        $('.nav-tabs a:first').tab('show');
    });
}


function checkLastStatusChage(tkt) {
    var url = "/api/v2/tickets/" + tkt.id + "/audits.json",
        status = tkt.status;
    DoRequest(url).then(function(res) {
        for (var jdx = res.results.length; jdx > 0; jdx--) {
            var itm = res.results[jdx - 1]
            for (var i = 0; i < itm.events.length; i++) {
                v = itm.events[i];
                if (v.field_name == "21606409") {
                    tkt.agency = v.value;
                }
                if (tkt.status == "pending" || tkt.status == "hold") {
                    if (v.field_name == "status" && v.type.toLowerCase() == "change" && (v.value == "hold" || v.value == "pending")) {
                        var tStart = new Date(itm.created_at),
                            tEnd = new Date(Date.now()); // status hold / pending time
                        var diff = tEnd - tStart,
                            rVal = (diff / (1000 * 60 * 60 * 24)).toFixed(1);
                        rVal = (rVal == 0) ? 0.1 : rVal;
                        tkt.LastStatusChange = rVal;
                        if (tkt.agency && tkt.LastStatusChange)
                            break;
                    }
                } else if (tkt.status == "open" || tkt.status == "new")
                    tkt.LastStatusChange = getTicketTime(tkt, tkt.updated_at);
                else //+ "solved" & closed
                    tkt.LastStatusChange = " "

                if (i == itm.events.length - 1 && !tkt.agency)
                    tkt.agency = ""
            }
        }
    })
};


function queryTeamMember() {}



function getTicketTime(tkt, startDate, endDate) {

    var endDate = (endDate) ? new Date(endDate) : (tkt.status == "solved" || tkt.status == "closed") ? new Date(tkt.updated_at) : new Date(Date.now());

    /*if (tkt.status == "solved" || tkt.status == "closed")
        endDate = new Date(tkt.updated_at.replace("T", " ").replace("Z", " "))*/
    var startDate = (startDate) ? startDate : tkt.created_at;
    startDate = new Date(startDate);
    var diff = endDate - startDate,
        retV = (diff / (1000 * 60 * 60 * 24)).toFixed(1); // hour (diff / (1000 * 60 * 60)).toFixed(0); //hours --diff / (1000 * 60 * 60)   //(diff / (1000 * 60 * 60*24)).toFixed(0); --days
    retV = (retV == 0) ? 0.1 : retV;
    return retV;
}

function graphData(query) {

    url = client._origin + "/api/v2/search/incremental?per_page=100&type=ticket&query=" + query + "+order_by%3Acreated_at+sort%3Adesc";

    var settings = {
        url: url,
        type: "GET",
        contentType: 'application/json'
    };

    return client.request(settings).then(function(data) {
            return data.count;
        },
        function(response) {
            console.error(response.responseText);
        });
}

var domains = [
    "domain_admin",
    "domain_discrepancy",
    "domain_ad_serving",
    "domain_platform_functionality",
    "domain_creative",
    "domain_advertiser_level_tags",
    "domain_analytics",
    "domain_trading",
    "domain_custom_solutions",
    "domain_peer39",
    "domain_api",
    "domain_billing",
    "domain_sem_connect",
    "domain_search_connect",
    "domain_strikead"
]

function nearestHalfHour(mOffset) {
    mOffset = typeof mOffset !== 'undefined' ? mOffset : 0;
    var hOffset = Math.floor(mOffset / 60);
    mOffset = mOffset % 60;
    var now = new Date();
    var hour = now.getHours() - hOffset;
    var minutes = now.getMinutes() - mOffset;

    var ampm = "AM";
    if (minutes < 15) {
        minutes = "00";
    } else if (minutes < 45) {
        minutes = "30";
    } else {
        minutes = "00";
        ++hour;
    }
    if (hour > 23) {
        hour = 12;
    } else if (hour > 12) {
        hour = hour - 12;
        ampm = "PM";
    } else if (hour == 12) {
        ampm = "PM";
    } else if (hour == 0) {
        hour = 12;
    }
    return (hour + ":" + minutes + " " + ampm);
}

function getISO(diff, dom) {
    diff = typeof diff !== 'undefined' ? diff : 0;
    dom = typeof dom !== 'undefined' ? dom : 0;
    var dnow = new Date();
    var isoDate1 = new Date(dnow.getTime() - (1000 * 60 * diff) - dnow.getTimezoneOffset() * 60000).toISOString();
    var isoDate2 = new Date(dnow.getTime() - (1000 * 60 * (diff - 30)) - dnow.getTimezoneOffset() * 60000).toISOString();
    //console.log('created>' + isoDate1 + ' created<' + isoDate2 + ' tag:' + domains[dom]);
    return 'created>' + isoDate1 + ' created<' + isoDate2 + ' tag:' + domains[dom];
}

var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1;
if (month < 10) month = "0" + month;
var day = dateObj.getUTCDate();
if (day < 10) day = "0" + day;
var year = dateObj.getUTCFullYear();

var caldate = "" + day + month + year;
$("#cal").attr("href", "https://my.setmore.com/calendar#monthly/rea191ef6ffe015deb9f22929568147dc343bdc98/" + caldate);

var ctx = document.getElementById("myChart");
var ctx2 = document.getElementById("myChart2");

var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [nearestHalfHour(240), nearestHalfHour(210), nearestHalfHour(180), nearestHalfHour(150), nearestHalfHour(120), nearestHalfHour(90), nearestHalfHour(60), nearestHalfHour(30), nearestHalfHour()],
        datasets: [{
            label: 'Admin',
            data: [graphData(getISO(240, 0)), graphData(getISO(210, 0)) + 5, graphData(getISO(180, 0)), graphData(getISO(150, 0)), graphData(getISO(120, 0)), graphData(getISO(90, 0)), graphData(getISO(60, 0)), graphData(getISO(30, 0)), graphData(getISO(0, 0))],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1
        }, {
            label: 'Discrepancy',
            data: [graphData(getISO(240, 1)), graphData(getISO(210, 1)), graphData(getISO(180, 1)), graphData(getISO(150, 1)), graphData(getISO(120, 1)), graphData(getISO(90, 1)), graphData(getISO(60, 1)), graphData(getISO(30, 1)), graphData(getISO(0, 1))],
            backgroundColor: 'rgba(60, 180, 210, 0.2)',
            borderColor: 'rgba(60, 180, 210,1)',
            borderWidth: 1
        }, {
            label: 'Tier 1 Total',
            data: [20, 10, 30, 50, 35, 40, 22, 15, 32],
            backgroundColor: 'rgba(255, 255, 255, 0)',
            borderColor: 'rgba(7,105,214,0.8)',
            pointBackgroundColor: 'rgba(7,105,214,0.8)',
            borderWidth: 0.5,
            lineTension: 0.1,
            pointRadius: 1.5,
            type: 'line'
        }, {
            label: 'Tier 2 Total',
            data: [10, 5, 10, 15, 6, 12, 3, 15, 11],
            backgroundColor: 'rgba(255, 255, 255, 0)',
            borderColor: 'rgba(207,30,220,0.8)',
            pointBackgroundColor: 'rgba(207,30,220,0.8)',
            borderWidth: 0.5,
            lineTension: 0.1,
            pointRadius: 1.5,
            type: 'line'
        }, {
            label: 'Tier 3 Total',
            data: [5, 7, 11, 2, 14, 12, 15, 5, 7],
            backgroundColor: 'rgba(255, 255, 255, 0)',
            borderColor: 'rgba(37,150,70,0.8)',
            pointBackgroundColor: 'rgba(37,150,70,0.8)',
            borderWidth: 0.5,
            lineTension: 0.1,
            pointRadius: 1.5,
            type: 'line'
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

var myChart2 = new Chart(ctx2, {
    type: 'radar',
    data: {
        labels: ["Ad Serving", "Analytics", "Platform", "API", "Billing", "Creative"],
        datasets: [{
            label: "Queue",
            fill: true,
            backgroundColor: "rgba(240,50,30,0.1)",
            borderColor: "rgba(240,50,30,0.8)",
            pointBackgroundColor: "rgba(240,50,30,0.8)",
            borderWidth: 1,
            pointBorderColor: "#fff",
            data: [44, 15, 3, 24, 41, 5, 15]
        }, {
            label: "NAM",
            fill: true,
            backgroundColor: "rgba(150,55,225,0.1)",
            borderColor: "rgba(150,55,225,0.8)",
            pointBackgroundColor: "rgba(150,55,225,0.8)",
            borderWidth: 1,
            pointBorderColor: "#fff",
            data: [13, 25, 51, 44, 32, 27]
        }, {
            label: "EMEA",
            fill: true,
            backgroundColor: "rgba(60,180,210,0.1)",
            borderColor: "rgba(60,180,210,1)",
            pointBorderColor: "#fff",
            pointBackgroundColor: "rgba(60,180,210,1)",
            borderWidth: 1,
            pointBorderColor: "#fff",
            data: [65, 40, 25, 25, 12, 31]
        }, {
            label: "APAC",
            fill: true,
            backgroundColor: "rgba(60,225,50,0.1)",
            borderColor: "rgba(60,225,50,1)",
            pointBorderColor: "#fff",
            pointBackgroundColor: "rgba(60,225,50,1)",
            borderWidth: 1,
            pointBorderColor: "#fff",
            data: [25.48, 54.16, 55, 32, 11, 5]
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Current Shift Knowledge'
        }
    }
});