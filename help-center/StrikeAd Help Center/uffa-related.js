

    if ((window.location.href.indexOf("/articles/") > -1) || isSectionPage) {

        var ticketID, fromAppPlatform, fromAppCategory, fromAppSection, fromAppParent, fromAppArticle, fromAppTags, checkAccess, firstAppLoad = false;

        //app to iframe comm
        var appView = window.ZAFClient.init(function(context) {
            if (appView) {
                $("#suggestEdit .loaderBG").addClass("inAppLoader");

                $('#suggestEdit').css({
                    boxShadow: 'none'
                })

                appView.postMessage('iframeLoaded');

                appView.on('addReviewUI', function(reviewVer) {
                    if (reviewVer.reviewType == "review_a_new_article") newArticle = true;
                    else newArticle = false;

                    if (newArticle || (reviewVer.highestVer == reviewVer.currVer)) {
                        $("#backBtn, #approveBtn, #updateBtn, #rejectBtn").fadeIn();
                    } else {
                        $("#backBtn, #restoreBtn").fadeIn();
                    }

                    $("#backBtn").click(function() {
                        appView.postMessage('backBtn');
                    });

                    $("#rejectBtn").click(function() {
                        $("#suggestEditLabel").text("Reject All Changes?");
                        $("#backBtn, #approveBtn, #updateBtn, #rejectBtn, .modal-body").hide();
                        $("#rejectReasonWrap, #cancelRejectBtn, #confirmRejectBtn").show();
                    });

                    $("#updateBtn").click(function() {
                        if (checkChanged()) {
                            if ($("#categorySelect>option:selected").index() == 0 || $("#sectionSelect>option:selected").index() == 0) {
                                appView.postMessage('errorMsg', {
                                    msg: "<strong>Missing values!</strong><br/>Please select the article category and section."
                                });
                            } else {
                                //submit changes    
                                $.getJSON("/api/v2/users/me/session.json", function(data) {

                                    currUserID = data.session.user_id;

                                    $('#suggestEdit').find('input, textarea, button, select').attr('disabled', 'disabled');
                                    $("#updateBtn").text("PLEASE WAIT...");

                                    $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                        checkAccess = data.section.description.substr(1, data.section.description.length - 2);

                                        var createArticleAPI = "/api/v2/help_center/sections/201949563/articles.json";
                                        var nextVer = parseInt(reviewVer.highestVer) + 1;
                                        var newTitle;

                                        if (!newArticle) newTitle = "Article ID " + currArticleId + " - Revision ver." + reviewVer.majorVer + "." + nextVer;
                                        else newTitle = "New Article : " + $("#articleTitle").val() + " - Revision ver." + reviewVer.majorVer + "." + nextVer;

                                        var addArticleJSON = {
                                            "article": {
                                                "title": newTitle,
                                                "comments_disabled": true,
                                                "locale": "en-us",
                                                "label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(","),
                                                "body": decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"))
                                            }
                                        };
                                        $.ajax(createArticleAPI, {
                                            type: 'POST',
                                            dataType: 'json',
                                            contentType: 'application/json',
                                            processData: false,
                                            data: JSON.stringify(addArticleJSON),
                                            success: function(data) {
                                                //updated version article created - now update ticket
                                                var commentStr;
                                                var ticketTags;

                                                commentStr = "Following values has been revised:\n";

                                                if (originalArticleTitle !== $("#articleTitle").val())
                                                    commentStr += "\nPrevious Title: " + originalArticleTitle + "\nUpdated Title: " + $("#articleTitle").val() + "\n";
                                                if (originalPlatform !== $("#platformSelect option:selected").val())
                                                    commentStr += "\nPrevious Platform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + "\nUpdated Platform: " + $("#platformSelect option:selected").text() + "\n";
                                                if (originalCategoryName !== $("#categorySelect option:selected").attr('name'))
                                                    commentStr += "\nPrevious Category: " + originalCategoryName + "\nUpdated Category: " + $("#categorySelect option:selected").attr('name') + "\n";
                                                if (originalSectionName !== $("#sectionSelect option:selected").attr('name'))
                                                    commentStr += "\nPrevious Section: " + originalSectionName + "\nUpdated Section: " + $("#sectionSelect option:selected").attr('name') + "\n";
                                                if (originalParent !== $("#parentSelect option:selected").attr('name') && $("#platformSelect>option:selected").index() == 3)
                                                    commentStr += "\nPrevious Parent: " + originalParent + "\nUpdated Parent: " + $("#parentSelect option:selected").attr('name') + "\n";
                                                if (originalTags !== $("#searchKeywords").val().replace(/[\s,]+/g, ','))
                                                    commentStr += "\nPrevious Tags: " + originalTags + "\nUpdated Tags: " + $("#searchKeywords").val().replace(/[\s,]+/g, ',') + "\n";

                                                if (CKEDITOR.instances.ckEditor.checkDirty())
                                                    commentStr += "\n\nArticle Content: Changed";
                                                else commentStr += "\n\nArticle Content: Same as version " + reviewVer.majorVer + "." + reviewVer.currVer;

                                                commentStr += "\n\nRevision Version: " + reviewVer.majorVer + "." + nextVer + " \nState: Updated \nReference No. " + data.article.id;

                                                ticketTags = reviewVer.ticketTags;

                                                var versionJSON = {
                                                    "ticket": {
                                                        "comment": {
                                                            "body": commentStr,
                                                            "author_id": currUserID
                                                        },
                                                        "tags": ticketTags.split(','),
                                                        "custom_fields": [{
                                                            "id": 24296553,
                                                            "value": $("#articleTitle").val()
                                                        }, {
                                                            "id": 24296523,
                                                            "value": $("#platformSelect option:selected").attr('name')
                                                        }, {
                                                            "id": 24340796,
                                                            "value": $("#categorySelect option:selected").attr('name')
                                                        }, {
                                                            "id": 24296543,
                                                            "value": $("#sectionSelect option:selected").attr('name')
                                                        }, {
                                                            "id": 24303693,
                                                            "value": $("#parentSelect option:selected").attr('name')
                                                        }, {
                                                            "id": 24340816,
                                                            "value": $("#searchKeywords").val().replace(/[\s,]+/g, ',')
                                                        }],
                                                        "ticket_id": reviewVer.ticketID,
                                                        "security_token": checkAccess,
                                                        "action": "update"
                                                    }
                                                };

                                                var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + helpCenterVer;

                                                //version updates
                                                submitCheck = false;
                                                $("#suggestEdit .loaderBG").fadeIn();
                                                $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                                $("#suggestEdit .submitStatus").text("Submitting updated version...");

                                                $.ajax(tickAPI, {
                                                    method: 'POST',
                                                    data: JSON.stringify(versionJSON)
                                                }).done(function(resData, textStatus, xhr) {
                                                    //success
                                                    submitCheck = true;
                                                    $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                    $("#suggestEdit .submitStatus").text("Version updated successfully.");
                                                }).fail(function(xhr, textStatus, errorThrown) {
                                                    //connection failed
                                                    $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                        var showIP = data.ip;
                                                        $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                        $("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                        $("#suggestEdit .backSubmit").click(function() {
                                                            $("#suggestEdit .loaderBG").fadeOut();
                                                            $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                            CKEDITOR.instances.ckEditor.setReadOnly(false);
                                                            $("#updateBtn").text("UPDATE VERSION");

                                                        });
                                                    });
                                                }).complete(function() {
                                                    //handle complete
                                                    if (submitCheck) {
                                                        $("#suggestEdit .loaderBG").fadeOut();
                                                        appView.postMessage('updateVersionDone');
                                                    }
                                                });

                                            },
                                            error: function() {
                                                appView.postMessage('errorMsg', {
                                                    msg: "<strong>Sorry!</strong><br/>There was a problem submitting your version changes. Please try again later."
                                                });
                                            }
                                        });
                                    });
                                });
                            }
                        } else {
                            appView.postMessage('errorMsg', {
                                msg: "<strong>No changes found!</strong><br/>There are no changes to save as a new version."
                            });
                        }

                    });
                    $("#restoreBtn").click(function() {
                        CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).acceptAll();
                        $('#suggestEdit').find('input, textarea, select').css('background-color', 'initial');
                        $("#restoreBtn").hide();
                        $("#previewBtn, #publishBtn").show();
                    });
                    $("#approveBtn").click(function() {
                        CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).acceptAll();
                        $('#suggestEdit').find('input, textarea, select').css('background-color', 'initial');
                        $("#updateBtn, #rejectBtn, #approveBtn").hide();
                        $("#previewBtn, #publishBtn").show();
                    });
                    $("#previewBtn").click(function() {
                        var platformFilter, titleUpdated = $("#articleTitle").val();
                        switch ($("#platformSelect option:selected").val()) {
                            case "mdx2":
                                platformFilter = "mdx_2_0";
                                break;
                            case "mdxnxt":
                                platformFilter = "mdx_nxt";
                                break;
                            case "supportkb":
                                platformFilter = "support_kb";
                                break;
                            default:
                                platformFilter = "mdx_2_0";
                        }

                        for (var indx = 0; indx < contentTypes.length; ++indx) {
                            var reg = new RegExp(contentTypes[indx][0] + ' ', 'ig');
                            titleUpdated = titleUpdated.replace(reg, "<span class='" + contentTypes[indx][1] + "'>" + contentTypes[indx][2] + "</span>");
                        }
                        var newHTML = '';
                        var videoSpan = '<span class="video-title">VIDEO</span>';
                        if (titleUpdated.split(videoSpan).length > 1) {
                            for (var indy = 0; indy < titleUpdated.split(videoSpan).length; ++indy) {
                                newHTML += titleUpdated.split(videoSpan)[indy];
                            }
                            titleUpdated = newHTML + " " + videoSpan;
                        }
                        if (titleUpdated.match('/|@getting-started|@campaign-management|@faqs|@creative|@publishers|@certified|@your-resources|/ig'))
                            titleUpdated = titleUpdated.trim().replace(/\@[\w-]+\s/ig, "");

                        storage.setItem(HelpCenter.user.email + '-previewPlatform' + currArticleId, platformFilter);
                        storage.setItem(HelpCenter.user.email + '-previewTitle' + currArticleId, titleUpdated);
                        storage.setItem(HelpCenter.user.email + '-previewPage' + currArticleId, CKEDITOR.instances.ckEditor.getData());

                        var params = 'width=' + screen.width;
                        params += ', height=' + screen.height;
                        params += ', top=0, left=0'
                        params += ', fullscreen=yes';

                        var previewWin = window.open("https://support.sizmek.com/hc/en-us/articles/208223316?currArticleId=" + currArticleId, 'Preview Window', params);
                        if (window.focus) {
                            previewWin.focus();
                        }
                    });
                    $("#publishBtn").click(function() {
                        $("#suggestEditLabel").text("Publish Approved Article?");
                        $("#backBtn, #approveBtn, #updateBtn, #rejectBtn, #previewBtn, #publishBtn, .modal-body").hide();
                        $("#publishWrap, #cancelPublishBtn, #confirmPublishBtn").show();
                    });
                    $("#cancelRejectBtn").click(function() {
                        $("#suggestEditLabel").text("Review Suggested Changes");
                        $("#backBtn, #approveBtn, #updateBtn, #rejectBtn, .modal-body").show();
                        $("#rejectReasonWrap, #cancelRejectBtn, #confirmRejectBtn").hide();
                    });
                    $("#cancelPublishBtn").click(function() {
                        $("#suggestEditLabel").text("Review Suggested Changes");
                        $("#backBtn, #previewBtn, #publishBtn, .modal-body").show();
                        $("#publishWrap, #cancelPublishBtn, #confirmPublishBtn").hide();
                        $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                        CKEDITOR.instances.ckEditor.setReadOnly(false);
                    });
                    $("#confirmRejectBtn").click(function() {
                        if ($("#reasonText").val() != "") {
                            appView.postMessage('addComment', {
                                thisComment: $("#reasonText").val()
                            });
                        } else {
                            appView.postMessage('errorMsg', {
                                msg: "<strong>Comment missing!</strong><br/>Please explain why the changes are being rejected for the contributor."
                            });
                        }
                    });
                    $("#confirmPublishBtn").click(function() {
                        $.getJSON("/api/v2/users/me/session.json", function(data) {

                            currUserID = data.session.user_id;

                            $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                checkAccess = data.section.description.substr(1, data.section.description.length - 2);

                                $('#suggestEdit').find('input, textarea, button, select').attr('disabled', 'disabled');
                                $("#confirmPublishBtn").text("PUBLISHING...");

                                var ar_pos;
                                if ($("#platformSelect option:selected").val() == "supportkb") ar_pos = parseInt($("#parentSelect option:selected").val()) + 1;
                                else ar_pos = 0;

                                //if section ID = message board NXT, subscribe GlobalNotifications user (ID: 1627768706) and publish as Sizmek Support user (ID: 357520165) for section 201265859

                                function publishArticle() {
                                    if (!newArticle) {
                                        var updateArticleAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";
                                        var updateArticleJSON;

                                        if ($("#sectionSelect option:selected").val() == "201265859") { //201265859
                                            updateArticleJSON = {
                                                "article": {
                                                    "section_id": $("#sectionSelect option:selected").val(),
                                                    "author_id": "357520165",
                                                    "position": ar_pos,
                                                    "label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(",")
                                                }
                                            };
                                        } else {
                                            updateArticleJSON = {
                                                "article": {
                                                    "section_id": $("#sectionSelect option:selected").val(),
                                                    "position": ar_pos,
                                                    "label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(",")
                                                }
                                            };
                                        }

                                        $.ajax(updateArticleAPI, {
                                            type: 'PUT',
                                            dataType: 'json',
                                            contentType: 'application/json',
                                            processData: false,
                                            data: JSON.stringify(updateArticleJSON),
                                            success: function(data) {
                                                var updateTranslationAPI = "/api/v2/help_center/articles/" + currArticleId + "/translations/en-us.json";
                                                var updateTranslationJSON = {
                                                    "translation": {
                                                        "title": $("#articleTitle").val(),
                                                        "body": decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"))
                                                    }
                                                };
                                                $.ajax(updateTranslationAPI, {
                                                    type: 'PUT',
                                                    dataType: 'json',
                                                    contentType: 'application/json',
                                                    processData: false,
                                                    data: JSON.stringify(updateTranslationJSON),
                                                    success: function(data) {
                                                        appView.postMessage('articleUpdated', {
                                                            thisComment: $("#publishComment").val()
                                                        });
                                                    },
                                                    error: function(err) {
                                                        appView.postMessage('errorMsg', {
                                                            msg: "<strong>Error!</strong><br/>Could not publish article. Please check permissions."
                                                        });
                                                    }
                                                });
                                            },
                                            error: function(err) {
                                                appView.postMessage('errorMsg', {
                                                    msg: "<strong>Error!</strong><br/>Could not publish article. Please check permissions."
                                                });
                                            }
                                        });


                                    } else {
                                        //publish newly submitted and reviewed article
                                        var newArticleAPI = "/api/v2/help_center/sections/" + $("#sectionSelect option:selected").val() + "/articles.json";

                                        var ar_title = $("#articleTitle").val();
                                        var ar_label_names = $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(",");
                                        var ar_body = decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"));
                                        var newArticleJSON;

                                        if ($("#sectionSelect option:selected").val() == "201265859") { //201265859
                                            newArticleJSON = {
                                                "article": {
                                                    "title": ar_title,
                                                    "author_id": "357520165",
                                                    "comments_disabled": true,
                                                    "locale": "en-us",
                                                    "label_names": ar_label_names,
                                                    "position": ar_pos,
                                                    "body": ar_body
                                                }
                                            };
                                        } else {
                                            newArticleJSON = {
                                                "article": {
                                                    "title": ar_title,
                                                    "comments_disabled": true,
                                                    "locale": "en-us",
                                                    "label_names": ar_label_names,
                                                    "position": ar_pos,
                                                    "body": ar_body
                                                }
                                            };
                                        }

                                        $.ajax(newArticleAPI, {
                                            type: 'POST',
                                            dataType: 'json',
                                            contentType: 'application/json',
                                            processData: false,
                                            data: JSON.stringify(newArticleJSON),
                                            success: function(data) {
                                                var updateCustomFields = {
                                                    "ticket": {
                                                        "custom_fields": [{
                                                            "id": 24296573,
                                                            "value": data.article.id
                                                        }, {
                                                            "id": 24340826,
                                                            "value": data.article.html_url
                                                        }],
                                                        "ticket_id": reviewVer.ticketID,
                                                        "security_token": checkAccess,
                                                        "action": "customfields"
                                                    }
                                                };

                                                var updateLatestTicket = "https://zendesk.sizmek.com/ProxyAPI.php?" + helpCenterVer;

                                                //publish changes
                                                submitCheck = false;
                                                $("#suggestEdit .loaderBG").fadeIn();
                                                $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                                $("#suggestEdit .submitStatus").text("Publishing updated article...");

                                                $.ajax(updateLatestTicket, {
                                                    method: 'POST',
                                                    data: JSON.stringify(updateCustomFields)
                                                }).done(function(resData, textStatus, xhr) {
                                                    //success
                                                    submitCheck = true;
                                                    $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                    $("#suggestEdit .submitStatus").text("Article published successfully.");
                                                }).fail(function(xhr, textStatus, errorThrown) {
                                                    //connection failed
                                                    $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                        var showIP = data.ip;
                                                        $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                        $("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                        $("#suggestEdit .backSubmit").click(function() {
                                                            $("#suggestEdit .loaderBG").fadeOut();
                                                            $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                            CKEDITOR.instances.ckEditor.setReadOnly(false);
                                                            $("#confirmPublishBtn").text("CONFIRM PUBLISH");
                                                        });
                                                    });
                                                }).complete(function() {
                                                    //handle complete
                                                    if (submitCheck) {
                                                        $("#suggestEdit .loaderBG").fadeOut();
                                                        appView.postMessage('articleAdded', {
                                                            thisComment: $("#publishComment").val(),
                                                            thisURL: data.article.html_url
                                                        });
                                                    }
                                                });

                                            },
                                            error: function(err) {
                                                appView.postMessage('errorMsg', {
                                                    msg: "<strong>Error!</strong><br/>Could not publish article. Please check permissions."
                                                });
                                            }
                                        });
                                    }
                                }

                                if ($("#sectionSelect option:selected").val() == "201265859") {
                                    var subscriptionAPI = "/api/v2/help_center/sections/" + $("#sectionSelect option:selected").val() + "/subscriptions.json";

                                    var sectionSubJSON = {
                                        "subscription": {
                                            "user_id": "1627768706",
                                            "source_locale": "en-us",
                                            "include_comments": true,
                                            "content_id": "201265859"
                                        }
                                    };

                                    $.ajax(subscriptionAPI, {
                                        type: 'POST',
                                        dataType: 'json',
                                        contentType: 'application/json',
                                        processData: false,
                                        data: JSON.stringify(sectionSubJSON),
                                        success: function(data) {
                                            publishArticle();
                                        },
                                        error: function(err) {
                                            appView.postMessage('errorMsg', {
                                                msg: "<strong>Error!</strong><br/>Could not subscribe GlobalNotifications user to the Message Board section."
                                            });
                                        }
                                    });
                                } else {
                                    publishArticle();
                                }
                            });
                        });
                    });
                });

                appView.on('connectionEstablished', function(data) {

                    ticketID = data.ticketID;
                    currArticleId = data.articleID;

                    if (data.reviewType == "review_a_new_article") newArticle = true;
                    else newArticle = false;

                    removePageElems(appView);
                    appView.postMessage('showIframe');

                    $('#suggestEdit').modal('show');
                    $('.modal-backdrop').removeClass("modal-backdrop");
                    $("#suggestEdit").css("position", "initial");
                    $("#suggestEdit").css("margin-left", "0px");
                    $("#suggestEdit").css("width", "1025px");
                    $("#suggestEdit").css("height", "580px");
                    $("#categorySelect").css("width", "305px");
                    $("#sectionSelect").css("width", "351px");
                    $("#articleTitle").css("width", "504px");
                    $("#searchKeywords").css("width", "351px");
                    $("#parentSelect").css("width", "729px");
                    $("#otherDetails").find("li")[0].style.width = "549px";
                    $("#submitSuggestionBtn").hide();
                    $("#cancelSuggestionBtn").hide();

                    if (newArticle) $("#suggestEditLabel").text("Review New Article Submission");
                    else $("#suggestEditLabel").text("Review Suggested Changes");

                    fromAppPlatform = data.platformName;
                    fromAppCategory = data.categoryName;
                    fromAppSection = data.sectionName;
                    fromAppParent = data.parentName;
                    fromAppArticle = data.articleName;
                    fromAppTags = data.tagsName;
                    firstAppLoad = true;

                    if (data.platformChanged) $("#platformSelect").css("background-color", "#E5FFCD");
                    if (data.categoryChanged) $("#categorySelect").css("background-color", "#E5FFCD");
                    if (data.sectionChanged) $("#sectionSelect").css("background-color", "#E5FFCD");
                    if (data.parentChanged) $("#parentSelect").css("background-color", "#E5FFCD");
                    if (data.articleChanged) $("#articleTitle").css("background-color", "#E5FFCD");
                    if (data.tagsChanged) $("#searchKeywords").css("background-color", "#E5FFCD");

                    var editorSize = setInterval(function() {
                        $(".cke_contents").css("height", "230px");
                        $(".cke_resizer").hide();
                        if ($(".cke_contents").height() >= 229 && $(".cke_contents").height() < 232) {
                            clearInterval(editorSize);

                            if ($("#platformSelect>option:selected").index() == 3) {
                                $(".kbonly").show();
                                $(".cke_contents").css("height", "180px");
                            } else {
                                $(".kbonly").hide();
                                $(".cke_contents").css("height", "230px");
                            }
                            appView.postMessage('reviewEditorReady');
                        }
                    }, 100);

                    $(".close").hide();
                });
            }
        });

        var catArray = [];
        var secArray = [];
        var artArray = [];

        var currArticleId,
            articleURL,
            currUserID,
            customAPI,
            redirectAPI;

        if (window.location.href.indexOf("/articles/") > -1) {
            currArticleId = window.location.href.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];
            articleURL = window.location.href.split("--")[0];
            redirectAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";
            customAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";
        } else if (isSectionPage) {
            currArticleId = window.location.href.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];
            articleURL = window.location.href.split("--")[0];
            redirectAPI = "/api/v2/help_center/sections/201249236.json";
            customAPI = "/api/v2/help_center/articles/search.json?section=" + currArticleId;
        }

        if ((window.location.href.indexOf("/articles/") > -1) && currArticleId == "209729503" && window.location.href.indexOf("type=Files") > -1) {
            //image upload article
            removePageElems();

        } else if ((HelpCenter.user.email !== null) && ((window.location.href.indexOf("/articles/") > -1) || isSectionPage))
            if (currentUser == "manager" || currentUser == "agent" || HelpCenter.user.email.toLowerCase() == "maxremix@gmail.com") {

                //fix bootstrap + editor input conflict
                $.fn.modal.Constructor.prototype.enforceFocus = function() {
                    var $modalElement = this.$element;
                    $(document).on('focusin.modal', function(e) {
                        var $parent = $(e.target.parentNode);
                        if ($modalElement[0] !== e.target && !$modalElement.has(e.target).length && !$parent.hasClass('cke_dialog_ui_input_select') && !$parent.hasClass('cke_dialog_ui_input_text')) {
                            $modalElement.focus();
                        }
                    })
                };

                catArray = [];
                secArray = [];

                var originalHTML,
                    originalArticleID,
                    originalArticleTitle,
                    originalTags,
                    originalType,
                    originalParent,
                    originalPosition,
                    originalSectionID,
                    originalSectionName,
                    originalCategoryID,
                    originalCategoryName,
                    originalPlatform,
                    newArticle,
                    tempTitle,
                    tempTags,
                    tempHTML;

                //modal HTML
                $('<div id="requestArticle" class="internal_only modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG requestLoader"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">x</button><h1 id="requestArticleLabel" class="modal-title">Request a New Article</h1></div><div class="modal-body"><p>What would you like to see in the new article?</p><p><textarea id="requestArticleDetail" rows="4" cols="50"></textarea></p></div><div class="modal-footer"><span class="errorMessage"></span><button id="confirmRequestBtn" class="btn btn-primary" name="CONTINUE" type="button">REQUEST ARTICLE</button><button id="cancelRequestBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div><div id="flagArticle" class="internal_only modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG flagLoader"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">x</button><h1 id="flagArticleLabel" class="modal-title">Thank you for helping us improve our Help Center!</h1></div><div class="modal-body"><p>How should the article be flagged?</p><select id="flagReason"><option value="-">Please select a reason</option><option value="article_flagged_reason_inaccurate_information">Inaccurate Information</option><option value="article_flagged_reason_insufficient_information">Insufficient Information</option><option value="article_flagged_reason_outdated_information">Outdated Information</option><option value="article_flagged_reason_broken_link">Broken Link</option><option value="article_flagged_reason_broken_image_or_video">Broken Image or Video</option><option value="article_flagged_reason_missing_attachment">Missing Attachment</option><option value="article_flagged_reason_other">Other</option></select><p>Please share some more details about your report:</p><p><textarea id="detailedReason" rows="4" cols="50"></textarea></p></div><div class="modal-footer"><span class="errorMessage"></span><button id="confirmFlagBtn" class="btn btn-primary" name="CONTINUE" type="button">FLAG ARTICLE</button><button id="cancelFlagBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div><div id="suggestEdit" class="internal_only modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">x</button><h1 id="suggestEditLabel" class="modal-title">Suggest changes to this article</h1></div><div id="rejectReasonWrap"><p>Additional comments for rejecting changes:</p><textarea id="reasonText"></textarea></div><div id="publishWrap"><p>Additional comments:</p><textarea id="publishComment"></textarea></div><div class="modal-body"><ul id="articleLocation"><li>Platform  <select id="platformSelect"><option value="unspecified" name="NO SPECIFIC">NO SPECIFIC</option><option value="mdx2" name="MDX 2.0">MDX 2.0</option><option value="mdxnxt" name="MDX-NXT">MDX-NXT</option><option value="supportkb" name="SUPPORT KB">SUPPORT KB</option><option value="strikead" name="STRIKE AD">STRIKE AD</option></select></li><li>Category <select id="categorySelect"><option value="-">Select a category</option></select></li><li>Section <select id="sectionSelect"><option value="-">Select a section</option></select></li></ul><hr /><ul id="articleDetails" class="kbonly"><li>Type <select id="typeSelect" disabled><option value="-">None</option><option value="@topic">Topic</option><option value="@article">Article</option><option value="@sub">Subpage</option><option value="@issue">Issue</option><option value="@reference">Reference</option><option value="@howto">How to</option></select></li><li class="parentDrop">Parent <select id="parentSelect"><option value="None">Not available for selected article type</option></select></li></ul><hr class="kbonly" /><ul id="otherDetails"><li> Title <input type="text" id="articleTitle"></li><li>Tags <input type="text" id="searchKeywords"></li></ul><hr /><textarea id="ckEditor"></textarea></div><div class="modal-footer"><span class="errorMessage"></span><button id="submitSuggestionBtn" class="btn btn-primary" name="CONTINUE" type="button">SUBMIT SUGGESTION</button><button id="cancelSuggestionBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button><button id="backBtn" class="btn btn-default" type="button">BACK</button><button id="publishBtn" class="btn btn-primary" type="button">PUBLISH</button><button id="previewBtn" class="btn btn-info" type="button">PREVIEW IN FULLSCREEN</button><button id="approveBtn" class="btn btn-success" type="button">PREVIEW</button><button id="updateBtn" class="btn btn-warning" type="button">UPDATE VERSION</button><button id="rejectBtn" class="btn btn-danger" type="button">REJECT</button><button id="restoreBtn" class="btn btn-info" type="button">RESTORE THIS VERSION</button><button id="cancelRejectBtn" class="btn btn-default" type="button">CANCEL</button><button id="confirmRejectBtn" class="btn btn-primary" type="button">CONFIRM REJECT</button><button id="confirmPublishBtn" class="btn btn-primary" type="button">CONFIRM PUBLISH</button><button id="cancelPublishBtn" class="btn btn-default" type="button">CANCEL</button></div></div></div></div>').insertAfter('#main-wrap');

                if (window.location.href.indexOf("/articles/") > -1) {
                    $(".main-column").prepend('<a class="suggest-edit" role="button" data-toggle="modal" data-target="#suggestEdit" data-backdrop="static" data-keyboard="false">Suggest Edit</a>');
                    $(".main-column").prepend('<a class="flag-article" role="button" data-toggle="modal" data-target="#flagArticle" data-backdrop="static" data-keyboard="false">Flag Article</a>');
                    $(".main-column").prepend('<a class="request-article" role="button" data-toggle="modal" data-target="#requestArticle" data-backdrop="static" data-keyboard="false">Request Article</a>');
                } else if (isSectionPage) {
                    $('<div id="suggestEdit" class="internal_only modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">x</button><h1 id="suggestEditLabel" class="modal-title">Suggest changes to this article</h1></div><div id="rejectReasonWrap"><p>Additional comments for rejecting changes:</p><textarea id="reasonText"></textarea></div><div id="publishWrap"><p>Additional comments:</p><textarea id="publishComment"></textarea></div><div class="modal-body"><ul id="articleLocation"><li>Platform  <select id="platformSelect"><option value="unspecified" name="NO SPECIFIC">NO SPECIFIC</option><option value="mdx2" name="MDX 2.0">MDX 2.0</option><option value="mdxnxt" name="MDX-NXT">MDX-NXT</option><option value="supportkb" name="SUPPORT KB">SUPPORT KB</option><option value="strikead" name="STRIKE AD">STRIKE AD</option></select></li><li>Category <select id="categorySelect"><option value="-">Select a category</option></select></li><li>Section <select id="sectionSelect"><option value="-">Select a section</option></select></li></ul><hr /><ul id="articleDetails" class="kbonly"><li>Type <select id="typeSelect" disabled><option value="-">None</option><option value="@topic">Topic</option><option value="@article">Article</option><option value="@sub">Subpage</option><option value="@issue">Issue</option><option value="@reference">Reference</option><option value="@howto">How to</option></select></li><li class="parentDrop">Parent <select id="parentSelect"><option value="None">Not available for selected article type</option></select></li></ul><hr class="kbonly" /><ul id="otherDetails"><li> Title <input type="text" id="articleTitle"></li><li>Tags <input type="text" id="searchKeywords"></li></ul><hr /><textarea id="ckEditor"></textarea></div><div class="modal-footer"><span class="errorMessage"></span><button id="submitSuggestionBtn" class="btn btn-primary" name="CONTINUE" type="button">SUBMIT SUGGESTION</button><button id="cancelSuggestionBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button><button id="backBtn" class="btn btn-default" type="button">BACK</button><button id="publishBtn" class="btn btn-primary" type="button">PUBLISH</button><button id="previewBtn" class="btn btn-info" type="button">PREVIEW IN FULLSCREEN</button><button id="approveBtn" class="btn btn-success" type="button">PREVIEW</button><button id="updateBtn" class="btn btn-warning" type="button">UPDATE VERSION</button><button id="rejectBtn" class="btn btn-danger" type="button">REJECT</button><button id="restoreBtn" class="btn btn-info" type="button">RESTORE THIS VERSION</button><button id="cancelRejectBtn" class="btn btn-default" type="button">CANCEL</button><button id="confirmRejectBtn" class="btn btn-primary" type="button">CONFIRM REJECT</button><button id="confirmPublishBtn" class="btn btn-primary" type="button">CONFIRM PUBLISH</button><button id="cancelPublishBtn" class="btn btn-default" type="button">CANCEL</button></div></div></div></div>').insertAfter('.sub-nav');
                }

                //reset ckEditor
                function resetCKeditor() {
                    CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).rejectAll();
                    CKEDITOR.instances.ckEditor.destroy(true);
                    if ($("#ckEditor").length) CKEDITOR.replace('ckEditor', {
                        filebrowserBrowseUrl: '/hc/en-us/articles/209729503?ver=23&type=Files&articleId=' + currArticleId, //currArticleId = new article temp
                        filebrowserWindowWidth: '100%',
                        filebrowserWindowHeight: '100%',
                        customConfig: 'https://services.serving-sys.com/HostingServices/custdev/ckeditor/config.js',
                        on: {
                            instanceReady: function(evt) {
                                //expand clickable content
                                $(".cke_wysiwyg_frame").contents().find(".expandingblock").css("display", "block");
                            }
                        }
                    });
                }

                //submit an article button
                var trayReady = setInterval(function() {
                    if ($("zd-hc-app-tray").length) {
                        clearInterval(trayReady);
                        $("zd-hc-app-tray").prepend('<span class="submitAnArticle" data-toggle="modal" data-target="#suggestEdit" data-backdrop="static" data-keyboard="false">Submit an Article</span>');

                        $(".submitAnArticle").on('click', function() {
                            $('#suggestEdit').find('h1').text('Submit an Article');

                            //set original to be none for new article submit
                            originalArticleTitle = "";
                            $("#articleTitle").val("");
                            originalTags = "";
                            $("#searchKeywords").val("");
                            originalHTML = "";
                            $("#submitSuggestionBtn").text("Submit Article");
                            $("#ckEditor").val("");
                            resetCKeditor();
                            newArticle = true;
                        });
                    }
                }, 500);

                $('.suggest-edit').on('click', function() {
                    $('#suggestEdit').find('h1').text('Suggest changes to this article');
                    originalHTML = [];
                    originalArticleTitle = tempTitle;
                    originalTags = tempTags;
                    originalHTML = tempHTML;

                    $("#articleTitle").val(originalArticleTitle).change();
                    $("#searchKeywords").val(originalTags);
                    $("#ckEditor").val(originalHTML);
                    $("#submitSuggestionBtn").text("Submit Suggestion");

                    resetCKeditor();
                    newArticle = false;
                });

                $(".modal").on("shown", function() {
                    $("html")[0].className = "stop-scrolling";
                })

                $(".modal").on("hidden", function() {
                    $("html")[0].className = "";
                })

                function resetCategoryDropdown(catArray, secArray, currCategoryId, currSectionId, currPlatform) {

                    $.each(catArray, function(i, category) {
                        if (currPlatform == "mdx2" && category["name"].indexOf("@mdx2") > -1 ||
                            currPlatform == "mdxnxt" && category["name"].indexOf("@mdxnxt") > -1 ||
                            currPlatform == "supportkb" && category["name"].indexOf("@supportkb") > -1 ||
                            currPlatform == "strikead" && category["name"].indexOf("@strikead") > -1 ||
                            currPlatform == "unspecified" && (
                                category["name"].indexOf("@mdx2") == -1 &&
                                category["name"].indexOf("@mdxnxt") == -1 &&
                                category["name"].indexOf("@supportkb") == -1 &&
                                category["name"].indexOf("@strikead") == -1
                            )) {
                            $("#categorySelect").append('<option name="' + category["name"] + '" value="' + category["id"] + '">' + cleanTextOnly(category["name"]) + '</option>');
                        }
                    });

                    if (appView && firstAppLoad) {
                        originalCategoryID = currCategoryId = $("#categorySelect [name='" + fromAppCategory + "']").val();
                    }

                    if (currCategoryId > 0) {
                        $("#categorySelect").val(currCategoryId);
                        resetSectionDropdown(secArray, currSectionId, currCategoryId);
                    }
                }

                function resetSectionDropdown(secArray, currSectionId, currCategoryId) {
                    $.each(secArray, function(i, section) {
                        if (section["category"] == currCategoryId) $("#sectionSelect").append('<option name="' + section["name"] + '" value="' + section["id"] + '">' + cleanTextOnly(section["name"]) + '</option>');
                    });

                    if (appView && firstAppLoad) {
                        originalSectionID = currSectionId = $("#sectionSelect [name='" + fromAppSection + "']").val();
                        firstAppLoad = false;
                    }

                    $("#sectionSelect").val(currSectionId).change();
                }

                $("#platformSelect").on("change", function() {
                    $("#categorySelect").find("option:gt(0)").remove();
                    $("#sectionSelect").find("option:gt(0)").remove();
                    $("#parentSelect").find("option:gt(0)").remove();

                    if ($("#platformSelect>option:selected").index() == 3) {
                        $(".kbonly").show();
                        $(".cke_contents").css("height", "180px");
                    } else {
                        $(".kbonly").hide();
                        $(".cke_contents").css("height", "230px");
                    }

                    resetCategoryDropdown(catArray, secArray, 0, 0, $("#platformSelect").val());
                });

                $("#categorySelect").on("change", function() {
                    $("#sectionSelect").find("option:gt(0)").remove();
                    resetSectionDropdown(secArray, 0, $("#categorySelect").val());
                });

                var firstParentRun = true;
                if (appView) firstParentRun = false;

                $("#sectionSelect").on("change", function() {
                    $('#parentSelect').empty();

                    if ($("#sectionSelect").val() !== "-") {
                        $("#parentSelect").append('<option value="None" disabled>Loading...</option>');

                        artArray = [];
                        var doneArticles = 0;
                        var articlesBySection = "/api/v2/help_center/" + HelpCenter.user.locale + "/sections/" + $("#sectionSelect").val() + "/articles.json?per_page=100";

                        function populateArticles() {
                            if (storage.getItem(HelpCenter.user.email + '-section' + $("#sectionSelect").val() + 'Articles' + helpCenterVer + currentLang) === null) {
                                $.get(articlesBySection).done(function(data) {
                                    articlesBySection = data.next_page;
                                    var newArray = $.map(data.articles, function(article, i) {
                                        return {
                                            "id": article.id,
                                            "name": article.name,
                                            "position": article.position
                                        };
                                    });
                                    artArray = $.merge(newArray, artArray);
                                    if (articlesBySection !== null) {
                                        articlesBySection += "&per_page=100";
                                        populateArticles();
                                    } else {
                                        storage.setItem(HelpCenter.user.email + '-' + $("#sectionSelect").val() + 'Articles' + helpCenterVer + currentLang, JSON.stringify(artArray));
                                        doneArticles = 1;
                                    }
                                });
                            } else {
                                artArray = JSON.parse(storage.getItem(HelpCenter.user.email + '-section' + $("#sectionSelect").val() + 'Articles' + helpCenterVer + currentLang));
                                doneArticles = 1;
                            }
                        }
                        populateArticles();

                        var articleRdy = setInterval(function() {
                            if (doneArticles) {
                                clearInterval(articleRdy);

                                var newPosition = -1;
                                $('#parentSelect').empty();

                                $.each(artArray, function(i, article) {
                                    if (article["name"].toLowerCase().indexOf("@issue ") == -1 && article["name"].toLowerCase().indexOf("@sub ") == -1) {
                                        $("#parentSelect").append('<option name="' + article["name"] + '" value="' + article["position"] + '">' + cleanTextOnly(article["name"]) + '</option>');
                                        if (originalPosition !== 0) {
                                            if (newPosition == -1 && article["position"] <= originalPosition) newPosition = article["position"];
                                            if (article["position"] >= newPosition && article["position"] <= originalPosition) {
                                                newPosition = article["position"];
                                                if (firstParentRun) originalParent = article["name"];
                                            }
                                        }
                                    }
                                });

                                if (originalPosition == 0) {
                                    $("#parentSelect").prepend('<option value="None" name="None">Please select a parent article</option>');
                                    originalParent = "None";
                                }

                                if (firstParentRun) $("#parentSelect").prop("selectedIndex", $("#parentSelect [name='" + originalParent + "']").index());

                                if (appView) {
                                    $("#parentSelect").prop("selectedIndex", $("#parentSelect [name='" + fromAppParent + "']").index());
                                    originalParent = $("#parentSelect option:selected").attr('name');
                                }

                                firstParentRun = false;

                                $(".loaderBG").fadeOut(2000);
                                $('#suggestEdit,#requestArticle,#flagArticle').find('input, textarea, button, select').attr('disabled', false);
                                if (appView) CKEDITOR.instances.ckEditor.setReadOnly(false);
                            }
                        }, 100);
                    } else $("#parentSelect").append('<option value="None" disabled>Please select a section first</option>');
                });

                var keyTimer, firstTypeRun = true;

                $("#articleTitle").on("change keyup paste", function() {
                    keyTimer && clearTimeout(keyTimer);
                    keyTimer = setTimeout(function() {
                        $.each(kbTags, function(k, v) {
                            if ($("#articleTitle").val().toLowerCase().indexOf(v + " ") > -1) {
                                $("#typeSelect").val(v);
                            }
                        })
                        if (firstTypeRun) {
                            originalType = $("#typeSelect").val();
                            firstTypeRun = false;
                        }
                    }, 100);
                })

                $.getJSON(customAPI, function(data) {
                    originalHTML = [];

                    if (window.location.href.indexOf("/articles/") > -1) {
                        $.each(data, function(key, val) {
                            $.each(val, function(articleKey, articleVal) {
                                if (articleKey == "body") originalHTML = tempHTML = articleVal;
                                if (articleKey == "title") originalArticleTitle = tempTitle = articleVal;
                                if (articleKey == "label_names") originalTags = tempTags = articleVal.toString().replace(/[\s,]+/g, ',');
                                if (articleKey == "section_id") originalSectionID = articleVal;
                                if (articleKey == "position") originalPosition = articleVal;
                            });

                        });
                    } else if (isSectionPage) {
                        var sample = (data.results[0]);
                        originalHTML = tempHTML = (sample.body);
                        originalArticleTitle = tempTitle = (sample.title);
                        originalTags = tempTags = (sample.label_names).toString().replace(/[\s,]+/g, ',');
                        originalSectionID = (sample.section_id);
                        originalPosition = 0;
                    }



                    $("#articleTitle").val(originalArticleTitle).change();
                    $("#searchKeywords").val(originalTags);
                    $("#ckEditor").val(originalHTML);

                    if ($("#ckEditor").length) CKEDITOR.replace('ckEditor', {
                        filebrowserBrowseUrl: '/hc/en-us/articles/209729503?ver=23&type=Files&articleId=' + currArticleId,
                        filebrowserWindowWidth: '100%',
                        filebrowserWindowHeight: '100%',
                        customConfig: 'https://services.serving-sys.com/HostingServices/custdev/ckeditor/config.js',
                        on: {
                            instanceReady: function(evt) {
                                //expand clickable content
                                $(".cke_wysiwyg_frame").contents().find(".expandingblock").css("display", "block");
                            }
                        }
                    });

                    //populate category and sections
                    var doneCategories = 0;
                    var doneSections = 0;
                    var categoryAPI = "/api/v2/help_center/" + HelpCenter.user.locale + "/categories.json?per_page=100";

                    $(".submitStatus").html("");
                    $('#suggestEdit,#requestArticle,#flagArticle').find('input, textarea, button, select').attr('disabled', 'disabled');

                    function populateCategories() {
                        if (storage.getItem(HelpCenter.user.email + '-allCategories' + helpCenterVer + currentLang) === null) {
                            $.get(categoryAPI).done(function(data) {
                                categoryAPI = data.next_page;
                                var newArray = $.map(data.categories, function(category, i) {
                                    return {
                                        "id": category.id,
                                        "name": category.name
                                    };
                                });
                                catArray = $.merge(newArray, catArray);
                                if (categoryAPI !== null) {
                                    categoryAPI += "&per_page=100";
                                    populateCategories();
                                } else {
                                    storage.setItem(HelpCenter.user.email + '-allCategories' + helpCenterVer + currentLang, JSON.stringify(catArray));
                                    doneCategories = 1;
                                }
                            });
                        } else {
                            catArray = JSON.parse(storage.getItem(HelpCenter.user.email + '-allCategories' + helpCenterVer + currentLang));
                            doneCategories = 1;
                        }
                    }
                    populateCategories();

                    var sectionAPI = "/api/v2/help_center/" + HelpCenter.user.locale + "/sections.json?per_page=100";

                    function populateSections() {
                        if (storage.getItem(HelpCenter.user.email + '-allSections' + helpCenterVer + currentLang) === null) {
                            $.get(sectionAPI).done(function(data) {
                                sectionAPI = data.next_page;
                                var newArray = $.map(data.sections, function(section, i) {
                                    return {
                                        "id": section.id,
                                        "name": section.name,
                                        "category": section.category_id
                                    };
                                });
                                secArray = $.merge(newArray, secArray);

                                if (sectionAPI !== null) {
                                    sectionAPI += "&per_page=100";
                                    populateSections();
                                } else {
                                    storage.setItem(HelpCenter.user.email + '-allSections' + helpCenterVer + currentLang, JSON.stringify(secArray));
                                    doneSections = 1;
                                }
                            });
                        } else {
                            secArray = JSON.parse(storage.getItem(HelpCenter.user.email + '-allSections' + helpCenterVer + currentLang));
                            doneSections = 1;
                        }
                    }
                    populateSections();

                    var populateRdy = setInterval(function() {
                        if (doneSections && doneCategories) {
                            clearInterval(populateRdy);

                            if (!appView) {
                                var sectionMatch = $.grep(secArray, function(e) {
                                    return e.id == originalSectionID;
                                });
                                originalSectionName = sectionMatch[0].name;
                                originalCategoryID = sectionMatch[0].category;
                                var categoryMatch = $.grep(catArray, function(e) {
                                    return e.id == originalCategoryID;
                                });
                                originalCategoryName = categoryMatch[0].name;

                                if (originalArticleTitle.indexOf("@mdx2") > -1 || originalSectionName.indexOf("@mdx2") > -1 || originalCategoryName.indexOf("@mdx2") > -1) {
                                    originalPlatform = "mdx2";
                                    $("#platformSelect").val("mdx2");
                                } else if (originalArticleTitle.indexOf("@mdxnxt") > -1 || originalSectionName.indexOf("@mdxnxt") > -1 || originalCategoryName.indexOf("@mdxnxt") > -1) {
                                    originalPlatform = "mdxnxt";
                                    $("#platformSelect").val("mdxnxt");
                                } else if (originalArticleTitle.indexOf("@supportkb") > -1 || originalSectionName.indexOf("@supportkb") > -1 || originalCategoryName.indexOf("@supportkb") > -1) {
                                    originalPlatform = "supportkb";
                                    $("#platformSelect").val("supportkb");
                                } else if (originalArticleTitle.indexOf("@strikead") > -1 || originalSectionName.indexOf("@strikead") > -1 || originalCategoryName.indexOf("@strikead") > -1) {
                                    originalPlatform = "strikead";
                                    $("#platformSelect").val("strikead");
                                } else {
                                    originalPlatform = "unspecified";
                                    $("#platformSelect").val("unspecified");
                                }
                            } else {
                                originalPlatform = $("#platformSelect [name='" + fromAppPlatform + "']").val();

                                originalCategoryName = fromAppCategory;
                                originalSectionName = fromAppSection;
                                originalParent = fromAppParent;
                                originalArticleTitle = fromAppArticle;
                                originalTags = (fromAppTags !== null) ? fromAppTags : "";

                                $("#articleTitle").val(fromAppArticle).change();
                                $("#searchKeywords").val(fromAppTags);
                                $("#platformSelect").val(originalPlatform);
                            }

                            if ($("#platformSelect>option:selected").index() == 3) {
                                $(".kbonly").show();
                                $(".cke_contents").css("height", "180px");
                            } else {
                                $(".kbonly").hide();
                                $(".cke_contents").css("height", "230px");
                            }

                            resetCategoryDropdown(catArray, secArray, originalCategoryID, originalSectionID, originalPlatform);
                        }
                    }, 100);
                });

                CKEDITOR.on('instanceReady', function(evt) {
                    var oldMaxHandler = $(".cke_button__maximize")[0].onclick;
                    $(".cke_button__maximize")[0].onclick = function() {
                        oldMaxHandler();
                        if (CKEDITOR.instances.ckEditor.getCommand("maximize").state == 1) {
                            $("html").css("display", "block");
                            $("main").css("display", "block");
                            $("#navbar-container").hide();
                            if (appView) appView.postMessage('resizeFrame');
                        } else {
                            if (!appView) $("#navbar-container").show();
                        }
                    }
                    CKEDITOR.on('dialogDefinition', function(ev) {
                        var dialogName = ev.data.name;
                        var dialogDefinition = ev.data.definition;

                        if (dialogName == 'image') {
                            dialogDefinition.removeContents('Link');
                            dialogDefinition.removeContents('advanced');
                        }
                    });
                });

                function showError(msg) {
                    $(".errorMessage").text(msg);
                    $(".errorMessage").fadeIn();
                    setTimeout(function() {
                        $(".errorMessage").fadeOut(500);
                    }, 4000);
                }

                $("#confirmFlagBtn").click(function(e) {
                    var reasonText = $("#flagReason option:selected").text();
                    var reasonTag = $("#flagReason").val();
                    var descriptionText = $("#detailedReason").val();
                    var ticketTags;
                    var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();

                    if (reasonTag == "-") {
                        showError("Please select a reason from the list");
                    } else if (descriptionText == "") {
                        showError("Please provide some details about this report");
                    } else {
                        $.getJSON("/api/v2/users/me/session.json", function(data) {

                            currUserID = data.session.user_id;

                            $('#flagArticle').find('input, textarea, button, select').attr('disabled', 'disabled');
                            $("#confirmFlagBtn").text("PLEASE WAIT...");

                            if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_flag_kb,review_a_flagged_article";
                            else ticketTags = "contribute_flag_doc,review_a_flagged_article";

                            $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                $.getJSON("/api/v2/help_center/articles/" + currArticleId + ".json", function(articleData) {
                                    var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + helpCenterVer;
                                    var ticketJSON = {
                                        "ticket": {
                                            "subject": articleData.article.title,
                                            "comment": descriptionText + "\n\nFlagged Article: [" + cleanTextOnly(articleData.article.title) + "](" + articleURL + ")\n\nFlagged for: " + $("#flagReason option:selected").text(),
                                            "requester_id": currUserID,
                                            //"assignee_id": 351709585, 
                                            "group_id": 21387715,
                                            "tags": ticketTags.split(','),
                                            "ticket_form_id": 16155,
                                            "custom_fields": [{
                                                "id": 22155349,
                                                "value": "review_a_flagged_article"
                                            }, {
                                                "id": 24296573,
                                                "value": currArticleId
                                            }, {
                                                "id": 24340826,
                                                "value": articleURL
                                            }, {
                                                "id": 24296583,
                                                "value": reasonTag
                                            }, {
                                                "id": 24340776,
                                                "value": $("#platformSelect option[value='" + originalPlatform + "']").text()
                                            }, {
                                                "id": 24296523,
                                                "value": $("#platformSelect option:selected").attr('name')
                                            }, {
                                                "id": 24296533,
                                                "value": originalSectionName
                                            }, {
                                                "id": 24296543,
                                                "value": $("#sectionSelect option:selected").attr('name')
                                            }, {
                                                "id": 22209215,
                                                "value": "pending_champions_review"
                                            }],
                                            "security_token": checkAccess,
                                            "action": "flag"
                                        }
                                    };

                                    //flag article
                                    submitCheck = false;
                                    $("#flagArticle .loaderBG").fadeIn();
                                    $("#flagArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                    $("#flagArticle .submitStatus").html("<br><br>Submitting your contribution...");

                                    $.ajax(tickAPI, {
                                        method: 'POST',
                                        data: JSON.stringify(ticketJSON)
                                    }).done(function(res, textStatus, xhr) {
                                        //success
                                        submitCheck = true;
                                        $("#flagArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                        $("#flagArticle .submitStatus").html("<br><br>Thank you! Your report has been received.");
                                    }).fail(function(xhr, textStatus, errorThrown) {
                                        //connection failed
                                        $("#flagArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                        $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                            var showIP = data.ip;
                                            $("#flagArticle .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                            $("#flagArticle .backSubmit").click(function() {
                                                $("#flagArticle .loaderBG").fadeOut();
                                                $('#flagArticle').find('input, textarea, button, select').attr('disabled', false);
                                                $("#confirmFlagBtn").text("FLAG ARTICLE");
                                            });
                                        });
                                    }).complete(function() {
                                        //handle complete
                                        if (submitCheck) {
                                            setTimeout(function() {
                                                $("#flagArticle .loaderBG").fadeOut();
                                                $('#flagArticle').find('input, textarea, button, select').attr('disabled', false);
                                                $("#confirmFlagBtn").text("FLAG ARTICLE");
                                                $("#detailedReason").val("");
                                                $("#flagReason").val($("#flagReason option:first").val());
                                                $('#flagArticle').modal('hide');
                                            }, 4000);
                                        }
                                    });
                                });
                            });
                        });
                    }
                });

                //request button process
                $("#confirmRequestBtn").click(function(e) {
                    var descriptionText = $("#requestArticleDetail").val();
                    var ticketTags;
                    var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();

                    if (descriptionText == "") {
                        showError("What would you like to see in the new article?");
                    } else {
                        $.getJSON("/api/v2/users/me/session.json", function(data) {

                            currUserID = data.session.user_id;

                            $('#requestArticle').find('input, textarea, button, select').attr('disabled', 'disabled');
                            $("#confirmRequestBtn").text("PLEASE WAIT...");

                            if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_request_kb,review_a_requested_article";
                            else ticketTags = "contribute_request_doc,review_a_requested_article";

                            $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                $.getJSON("/api/v2/help_center/articles/" + currArticleId + ".json", function(articleData) {
                                    var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + helpCenterVer;
                                    var ticketJSON = {
                                        "ticket": {
                                            "subject": "New article request has been received",
                                            "comment": "New article has been requested after viewing the following article:\n\n[" + cleanTextOnly(articleData.article.title) + "](" + articleURL + ")\n\nRequest detail:\n\n" + descriptionText,
                                            "requester_id": currUserID,
                                            //"assignee_id": 351709585, 
                                            "group_id": 21387715,
                                            "tags": ticketTags.split(','),
                                            "ticket_form_id": 16155,
                                            "custom_fields": [{
                                                "id": 22155349,
                                                "value": "review_a_requested_article"
                                            }, {
                                                "id": 24296573,
                                                "value": currArticleId
                                            }, {
                                                "id": 24340826,
                                                "value": articleURL
                                            }, {
                                                "id": 24340776,
                                                "value": $("#platformSelect option[value='" + originalPlatform + "']").text()
                                            }, {
                                                "id": 24296523,
                                                "value": $("#platformSelect option:selected").attr('name')
                                            }, {
                                                "id": 24296533,
                                                "value": originalSectionName
                                            }, {
                                                "id": 24296543,
                                                "value": $("#sectionSelect option:selected").attr('name')
                                            }, {
                                                "id": 22209215,
                                                "value": "pending_champions_review"
                                            }],
                                            "security_token": checkAccess,
                                            "action": "request"
                                        }
                                    };

                                    //request article
                                    submitCheck = false;
                                    $("#requestArticle .loaderBG").fadeIn();
                                    $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                    $("#requestArticle .submitStatus").html("<br><br>Submitting your article request...");

                                    $.ajax(tickAPI, {
                                        method: 'POST',
                                        data: JSON.stringify(ticketJSON)
                                    }).done(function(res, textStatus, xhr) {
                                        //success
                                        submitCheck = true;
                                        $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                        $("#requestArticle .submitStatus").html("<br><br>Thank you! Your request has been received.");
                                    }).fail(function(xhr, textStatus, errorThrown) {
                                        //connection failed
                                        $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                        $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                            var showIP = data.ip;
                                            $("#requestArticle .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                            $("#requestArticle .backSubmit").click(function() {
                                                $("#requestArticle .loaderBG").fadeOut();
                                                $('#requestArticle').find('input, textarea, button, select').attr('disabled', false);
                                                $("#confirmRequestBtn").text("REQUEST ARTICLE");
                                            });
                                        });
                                    }).complete(function() {
                                        //handle complete
                                        if (submitCheck) {
                                            setTimeout(function() {
                                                $("#requestArticle .loaderBG").fadeOut();
                                                $('#requestArticle').find('input, textarea, button, select').attr('disabled', false);
                                                $("#confirmRequestBtn").text("REQUEST ARTICLE");
                                                $("#requestArticleDetail").val("");
                                                $('#requestArticle').modal('hide');
                                            }, 4000);
                                        }
                                    });
                                });
                            });
                        });
                    }
                });


                function checkChanged() {
                    //console.log("check diryty: ", $("#parentSelect option:selected").attr('name') + " vs " + originalParent);
                    return (CKEDITOR.instances.ckEditor.checkDirty() ||
                        $("#platformSelect option:selected").val() != originalPlatform ||
                        $("#categorySelect option:selected").val() != originalCategoryID ||
                        $("#sectionSelect option:selected").val() != originalSectionID ||
                        ($("#parentSelect option:selected").attr('name') != originalParent && typeof $("#parentSelect option:selected").attr('name') !== "undefined") ||
                        $("#articleTitle").val() != originalArticleTitle ||
                        $("#searchKeywords").val() != originalTags ||
                        ($("#typeSelect").val() != originalType && $("#platformSelect>option:selected").index() == 3));
                }

                function resetSuggestionModal() {
                    $("#platformSelect").val(originalPlatform);
                    $("#categorySelect").find("option:gt(0)").remove();
                    $("#sectionSelect").find("option:gt(0)").remove();
                    $("#typeSelect").val(originalType);

                    $("#parentSelect").empty();
                    $("#parentSelect").append('<option value="None">None</option>');
                    /*
                    $('#parentSelect option').filter(function() {
                        return ($(this).attr('name') == $("#parentSelect option:selected").attr('name'));
                    }).prop('selected', true);
                    */

                    if ($("#platformSelect>option:selected").index() == 3) {
                        $(".kbonly").show();
                        $(".cke_contents").css("height", "180px");
                    } else {
                        $(".kbonly").hide();
                        $(".cke_contents").css("height", "230px");
                    }

                    firstParentRun = keyTimer = firstTypeRun = true;

                    $("#articleTitle").val(originalArticleTitle).change();
                    $("#searchKeywords").val(originalTags);

                    resetCategoryDropdown(catArray, secArray, originalCategoryID, originalSectionID, originalPlatform);

                    resetCKeditor();
                }

                $("#submitSuggestionBtn").click(function() {
                    if (checkChanged()) {
                        if ($("#categorySelect>option:selected").index() == 0 || $("#sectionSelect>option:selected").index() == 0) {
                            showError("Please select the article category and section");
                        } else {
                            //submit changes    
                            $.getJSON("/api/v2/users/me/session.json", function(data) {

                                currUserID = data.session.user_id;

                                $('#suggestEdit').find('input, textarea, button, select').attr('disabled', 'disabled');
                                $("#submitSuggestionBtn").text("PLEASE WAIT...");

                                highestVerArray = [];

                                var getHighestVerAPI;

                                if (!newArticle) getHighestVerAPI = '/api/v2/help_center/articles/search.json?query=Article' + encodeURIComponent(' ' + currArticleId) + '&section=201949563&per_page=100';
                                else getHighestVerAPI = '/api/v2/help_center/articles/search.json?query="New Article : ' + encodeURIComponent($("#articleTitle").val()) + '"&section=201949563&per_page=100';

                                function handleErrorSubmit() {
                                    alert("Sorry, there was a problem submitting your suggestions. Please try again later.");
                                    $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                    $("#submitSuggestionBtn").text("SUBMIT SUGGESTION");
                                    resetSuggestionModal();
                                    $('#suggestEdit').modal('hide');
                                }

                                function checkVersions() {
                                    $.get(getHighestVerAPI).done(function(data) {
                                        getHighestVerAPI = data.next_page;

                                        var highestMajorVer = 1;
                                        var results = $.map(data.results, function(result, i) {
                                            return {
                                                "title": result.title
                                            };
                                        });

                                        $.each(results, function(i, result) {
                                            var thisVer = parseInt(result["title"].split("Revision ver.")[1].split(".")[0]);
                                            if (thisVer >= highestMajorVer) highestMajorVer = thisVer + 1;
                                        });

                                        if (getHighestVerAPI !== null) {
                                            getHighestVerAPI += "&per_page=100";
                                            checkVersions();
                                        } else {
                                            $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                                checkAccess = data.section.description.substr(1, data.section.description.length - 2);

                                                $.getJSON(redirectAPI, function(articleData) {
                                                    var createArticleAPI = "/api/v2/help_center/sections/201949563/articles.json";
                                                    var updateTicketID;



                                                    if (window.location.href.indexOf("/articles/") > -1) {
                                                        var ar_title = "Article ID " + currArticleId + " - Revision ver." + highestMajorVer + ".0";
                                                        var ar_label_names = originalTags.split(",");
                                                        var ar_body = articleData.article.body;
                                                    } else if (isSectionPage) {
                                                        ar_title = "New Article : " + $("#articleTitle").val() + " - Revision ver." + highestMajorVer + ".0";
                                                        ar_label_names = $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(",");
                                                        ar_body = decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"));
                                                    }

                                                    if (newArticle) {
                                                        ar_title = "New Article : " + $("#articleTitle").val() + " - Revision ver." + highestMajorVer + ".0";
                                                        ar_label_names = $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(",");
                                                        ar_body = decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"));
                                                    }

                                                    var addOriginalArticleJSON = {
                                                        "article": {
                                                            "title": ar_title,
                                                            "comments_disabled": true,
                                                            "locale": "en-us",
                                                            "label_names": ar_label_names,
                                                            "body": ar_body
                                                        }
                                                    };
                                                    $.ajax(createArticleAPI, {
                                                        type: 'POST',
                                                        dataType: 'json',
                                                        contentType: 'application/json',
                                                        processData: false,
                                                        data: JSON.stringify(addOriginalArticleJSON),
                                                        success: function(original) {
                                                            if (!newArticle) {
                                                                var addArticleJSON = {
                                                                    "article": {
                                                                        "title": "Article ID " + currArticleId + " - Revision ver." + highestMajorVer + ".1",
                                                                        "comments_disabled": true,
                                                                        "locale": "en-us",
                                                                        "label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(","),
                                                                        "body": decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"))
                                                                    }
                                                                };

                                                                $.ajax(createArticleAPI, {
                                                                    type: 'POST',
                                                                    dataType: 'json',
                                                                    contentType: 'application/json',
                                                                    processData: false,
                                                                    data: JSON.stringify(addArticleJSON),
                                                                    success: function(edited) {
                                                                        processTicket(articleData, original, edited);
                                                                    },
                                                                    error: function() {
                                                                        handleErrorSubmit()
                                                                    }
                                                                });
                                                            } else {
                                                                var edited = original;
                                                                originalArticleTitle = $("#articleTitle").val();
                                                                originalTags = $("#searchKeywords").val();
                                                                processTicket(articleData, original, edited);
                                                            }
                                                        },
                                                        error: function() {
                                                            handleErrorSubmit();
                                                        }
                                                    });

                                                    function processTicket(articleData, original, edited) {

                                                        var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + helpCenterVer;
                                                        var ticketTags;

                                                        var submitTitle, submitDesc, contributionType;
                                                        var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();

                                                        if (newArticle) {
                                                            currArticleId = "";
                                                            articleURL = "";
                                                            getPlatformName = $("#platformSelect option:selected").attr('name');
                                                            originalCategoryName = $("#categorySelect option:selected").attr('name');
                                                            originalSectionName = $("#sectionSelect option:selected").attr('name');
                                                            originalParent = $("#parentSelect option:selected").attr('name');
                                                            submitTitle = "New Article Received: " + $("#articleTitle").val();
                                                            submitDesc = "A new article has been received for the following location. " + "\n\nPlatform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + " \nCategory: " + cleanTextOnly(originalCategoryName) + " \nSection: " + cleanTextOnly(originalSectionName) + " \n\nRevision Version: " + highestMajorVer + ".0" + " \nState: New Draft \nReference No. " + original.article.id + "\n\n<pending-review>";
                                                            contributionType = "review_a_new_article";
                                                            if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_add_kb,review_a_new_article";
                                                            else ticketTags = "contribute_add_doc,review_a_new_article";
                                                        } else {
                                                            submitTitle = "Article Edited: " + cleanTextOnly(articleData.article.title);
                                                            submitDesc = "New suggestions has been received to update following article. " + "\n\nPlatform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + " \nCategory: " + cleanTextOnly(originalCategoryName) + " \nSection: " + cleanTextOnly(originalSectionName) + " \n\nOriginal Article: [" + cleanTextOnly(originalArticleTitle) + "](" + articleURL + ") \n\nRevision Version: " + highestMajorVer + ".0" + " \nState: Original \nReference No. " + original.article.id;
                                                            contributionType = "review_an_existing_article_edit";
                                                            if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_fix_kb,review_an_existing_article_edit";
                                                            else ticketTags = "contribute_fix_doc,review_an_existing_article_edit";
                                                        }

                                                        var ticketOriginalJSON = {
                                                            "ticket": {
                                                                "subject": submitTitle,
                                                                "comment": submitDesc,
                                                                "requester_id": currUserID,
                                                                //"assignee_id": 351709585, 
                                                                "group_id": 21387715,
                                                                "tags": ticketTags.split(','),
                                                                "ticket_form_id": 16155,
                                                                "custom_fields": [{
                                                                    "id": 22155349,
                                                                    "value": contributionType
                                                                }, {
                                                                    "id": 24296573,
                                                                    "value": currArticleId
                                                                }, {
                                                                    "id": 24340826,
                                                                    "value": articleURL
                                                                }, {
                                                                    "id": 24340806,
                                                                    "value": originalArticleTitle
                                                                }, {
                                                                    "id": 24296553,
                                                                    "value": $("#articleTitle").val()
                                                                }, {
                                                                    "id": 24340776,
                                                                    "value": getPlatformName
                                                                }, {
                                                                    "id": 24296523,
                                                                    "value": $("#platformSelect option:selected").attr('name')
                                                                }, {
                                                                    "id": 24340786,
                                                                    "value": originalCategoryName
                                                                }, {
                                                                    "id": 24340796,
                                                                    "value": $("#categorySelect option:selected").attr('name')
                                                                }, {
                                                                    "id": 24296533,
                                                                    "value": originalSectionName
                                                                }, {
                                                                    "id": 24296543,
                                                                    "value": $("#sectionSelect option:selected").attr('name')
                                                                }, {
                                                                    "id": 24303683,
                                                                    "value": originalParent
                                                                }, {
                                                                    "id": 24303693,
                                                                    "value": $("#parentSelect option:selected").attr('name')
                                                                }, {
                                                                    "id": 24296563,
                                                                    "value": originalTags
                                                                }, {
                                                                    "id": 24340816,
                                                                    "value": $("#searchKeywords").val().replace(/[\s,]+/g, ',')
                                                                }],
                                                                "security_token": checkAccess,
                                                                "action": "add"
                                                            }
                                                        };

                                                        //request article
                                                        submitCheck = false;
                                                        $("#suggestEdit .loaderBG").fadeIn();
                                                        $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                                        $("#suggestEdit .submitStatus").text("Connecting to server, please wait...");

                                                        $.ajax(tickAPI, {
                                                            method: 'POST',
                                                            data: JSON.stringify(ticketOriginalJSON)
                                                        }).done(function(getRes, textStatus, xhr) {
                                                            //success
                                                            submitCheck = true;
                                                            $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                            $("#suggestEdit .submitStatus").text("Connection established.");
                                                            updateTicketID = $.parseJSON(getRes).ticket.id;
                                                        }).fail(function(xhr, textStatus, errorThrown) {
                                                            //connection failed
                                                            $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                            $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                                var showIP = data.ip;
                                                                $("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                                $("#suggestEdit .backSubmit").click(function() {
                                                                    $("#suggestEdit .loaderBG").fadeOut();
                                                                    $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                                    $("#submitSuggestionBtn").text("SUBMIT SUGGESTION");
                                                                });
                                                            });
                                                        }).complete(function() {
                                                            //handle complete
                                                            if (!newArticle & submitCheck) {
                                                                var commentStr;

                                                                commentStr = "Following values has been revised:\n";

                                                                if (originalArticleTitle !== $("#articleTitle").val())
                                                                    commentStr += "\nPrevious Title: " + originalArticleTitle + "\nUpdated Title: " + $("#articleTitle").val() + "\n";
                                                                if (originalPlatform !== $("#platformSelect option:selected").val())
                                                                    commentStr += "\nPrevious Platform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + "\nUpdated Platform: " + $("#platformSelect option:selected").text() + "\n";
                                                                if (originalCategoryName !== $("#categorySelect option:selected").attr('name'))
                                                                    commentStr += "\nPrevious Category: " + originalCategoryName + "\nUpdated Category: " + $("#categorySelect option:selected").attr('name') + "\n";
                                                                if (originalSectionName !== $("#sectionSelect option:selected").attr('name'))
                                                                    commentStr += "\nPrevious Section: " + originalSectionName + "\nUpdated Section: " + $("#sectionSelect option:selected").attr('name') + "\n";
                                                                if (originalParent !== $("#parentSelect option:selected").attr('name') && $("#platformSelect>option:selected").index() == 3)
                                                                    commentStr += "\nPrevious Parent: " + originalParent + "\nUpdated Parent: " + $("#parentSelect option:selected").attr('name') + "\n";
                                                                if (originalTags !== $("#searchKeywords").val().replace(/[\s,]+/g, ','))
                                                                    commentStr += "\nPrevious Tags: " + originalTags + "\nUpdated Tags: " + $("#searchKeywords").val().replace(/[\s,]+/g, ',') + "\n";

                                                                if (CKEDITOR.instances.ckEditor.checkDirty())
                                                                    commentStr += "\n\nArticle Content: Changed";
                                                                else commentStr += "\n\nArticle Content: Same as version " + highestMajorVer + ".0";

                                                                commentStr += "\n\nRevision Version: " + highestMajorVer + ".1" + " \nState: Updated \nReference No. " + edited.article.id + "\n\n<pending-review>";

                                                                var versionJSON = {
                                                                    "ticket": {
                                                                        "comment": {
                                                                            "body": commentStr,
                                                                            "author_id": currUserID
                                                                        },
                                                                        "tags": ticketTags.split(','),
                                                                        "ticket_id": updateTicketID,
                                                                        "security_token": checkAccess,
                                                                        "action": "update"
                                                                    }
                                                                };

                                                                var updateLatestTicket = "https://zendesk.sizmek.com/ProxyAPI.php?" + helpCenterVer;

                                                                submitCheck = false;
                                                                $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                                                $("#suggestEdit .submitStatus").text("Submitting your suggestions...");

                                                                $.ajax(updateLatestTicket, {
                                                                    method: 'POST',
                                                                    data: JSON.stringify(versionJSON)
                                                                }).done(function(res, textStatus, xhr) {
                                                                    //success
                                                                    //console.log(HelpCenter.user.name.replace(/(\w+).*/, "$1"))
                                                                    submitCheck = true;
                                                                    $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                                    $("#suggestEdit .submitStatus").text("Thank you! Your suggestions has been received.");
                                                                }).fail(function(xhr, textStatus, errorThrown) {
                                                                    //connection failed
                                                                    $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                                    $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                                        var showIP = data.ip;
                                                                        $("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                                        $("#suggestEdit .backSubmit").click(function() {
                                                                            $("#suggestEdit .loaderBG").fadeOut();
                                                                            $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                                            $("#submitSuggestionBtn").text("SUBMIT SUGGESTION");
                                                                        });
                                                                    });
                                                                }).complete(function() {
                                                                    //handle complete
                                                                    if (submitCheck) {
                                                                        setTimeout(function() {
                                                                            $("#suggestEdit .loaderBG").fadeOut();
                                                                            $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                                            resetSuggestionModal();
                                                                            $('#suggestEdit').modal('hide');
                                                                        }, 4000);
                                                                    }
                                                                });
                                                            } else {
                                                                //handle complete
                                                                if (submitCheck) {
                                                                    $("#suggestEdit .submitStatus").text("Thank you! Your article will be published after a review.");
                                                                    setTimeout(function() {
                                                                        $("#suggestEdit .loaderBG").fadeOut();
                                                                        $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                                        resetSuggestionModal();
                                                                        $('#suggestEdit').modal('hide');
                                                                    }, 4000);
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            });
                                        }
                                    });
                                }
                                checkVersions();
                            });
                        }
                    } else {
                        showError("There are no changes to submit");
                    }
                });

                $("#flagArticle").on("hide.bs.modal", function(e) {
                    if ($("#flagReason").prop('selectedIndex') != 0 || $("#detailedReason").val() != "") {
                        if (confirm('All changes will be lost. Are you sure you want to cancel?')) {
                            $("#flagReason").val($("#flagReason option:first").val());
                            $("#detailedReason").val("");
                            return true;
                        } else {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            return false;
                        }
                    }
                });

                $("#suggestEdit").on("hide.bs.modal", function(e) {
                    if (checkChanged()) {
                        if (confirm('All unsaved changes will be lost. Are you sure you want to cancel?')) {
                            resetSuggestionModal();
                            return true;
                        } else {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            return false;
                        }
                    }
                });
            }
    }