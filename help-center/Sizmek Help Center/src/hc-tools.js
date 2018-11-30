/**
 * This script contains functions to handle help center back up and restore tools.
 *
 * Author: Sizmek Support Team - John Kim (john.kim@sizmek.com)
 */

$(document).ready(function() {

    //replaces commonly-used Windows 1252 encoded chars that do not exist in ASCII
    //or ISO-8859-1 with ISO-8859-1 cognates. AKA Microsoft Word characters
    var replaceWordChars = function(text) {
            var s = text;
            s = s.replace(/[\u2018\u2019\u201A]/g, "\'");
            s = s.replace(/[\u201C\u201D\u201E]/g, "\"");
            s = s.replace(/\u2026/g, "...");
            s = s.replace(/[\u2013\u2014]/g, "-");
            s = s.replace(/\u02C6/g, "^");
            s = s.replace(/\u2039/g, "<");
            s = s.replace(/\u203A/g, ">");
            s = s.replace(/â€˜/g, "\'");
            s = s.replace(/â€™/g, "\'");
            s = s.replace(/â€œ/g, "\"");
            s = s.replace(/â€/g, "\"");
            return s;
        }
        //scroll logs to bottom as it record 
    $("textarea").change(function() {
        if ($(this).attr("id").indexOf("Log") > -1) $(this).scrollTop($(this)[0].scrollHeight - $(this).height());
    });

    function updateStatusBG(elem, state) {
        switch (state) {
            case "good":
                elem.css('border-top', '1px solid #8DDE6C');
                elem.css('background-color', '#EDFFE5');
                break;
            case "error":
                elem.css('border-top', '1px solid #FFB9A4');
                elem.css('background-color', '#FFEEE7');
                break;
            default:
                elem.css('border-top', '1px solid #A4F1FF');
                elem.css('background-color', '#F5FFFD');
                break;
        }
    }

    //help center back ups and restore tools
    $('#nxtArticles').click(function() {
        var nxtJSON = "/api/v2/help_center/articles/search.json?query=NXT,@NXT,MDX-NXT&per_page=20"
        var nxtBackupDone = 0;
        var nxtData;
        updateStatusBG($("#nxtArticlesStatus"), "ready");
        $("#nxtArticlesStatus").text("Processing... please wait.");

        function nxtBackup() {
            $.get(nxtJSON).done(function(data) {
                if (typeof nxtData == "undefined") nxtData = data.results;
                else nxtData = nxtData.concat(data.results);
                nxtData.forEach(function(article) {
                    article.name = replaceWordChars(article.name);
                    if (article.description) article.body = replaceWordChars(article.body);
                });
                var percDone = Math.floor(data.page / data.page_count * 100) + "%";
                $("#nxtBackupStatus").text("Processing... " + percDone + " complete.");
                nxtJSON = data.next_page;
                if (nxtJSON !== null) {
                    nxtJSON += "&per_page=20";
                    nxtBackup();
                } else nxtBackupDone = 1;
            });
        }
        nxtBackup();
        var nxtBackupCheck = setInterval(function() {
            if (nxtBackupDone) {
                clearInterval(nxtBackupCheck);
                if (nxtData == '') return;
                JSONToCSV("nxtArticles", nxtData, true);
            }
        }, 100);
    });

    //help center back ups and restore tools
    $('#categoryBackup').click(function() {
        var categoryJSON = "/api/v2/help_center/categories.json?per_page=20"
        var categoryDone = 0;
        var categoryData;
        updateStatusBG($("#categoryBackupStatus"), "ready");
        $("#categoryBackupStatus").text("Processing... please wait.");

        function categoryBackup() {
            $.get(categoryJSON).done(function(data) {
                if (typeof categoryData == "undefined") categoryData = data.categories;
                else categoryData = categoryData.concat(data.categories);
                categoryData.forEach(function(category) {
                    category.name = replaceWordChars(category.name);
                    if (category.description) category.description = replaceWordChars(category.description);
                });
                var percDone = Math.floor(data.page / data.page_count * 100) + "%";
                $("#categoryBackupStatus").text("Processing... " + percDone + " complete.");
                categoryJSON = data.next_page;
                if (categoryJSON !== null) {
                    categoryJSON += "&per_page=20";
                    categoryBackup();
                } else categoryDone = 1;
            });
        }
        categoryBackup();
        var categoryBackupCheck = setInterval(function() {
            if (categoryDone) {
                clearInterval(categoryBackupCheck);
                if (categoryData == '') return;
                JSONToCSV("category", categoryData, true);
            }
        }, 100);
    });

    $('#sectionBackup').click(function() {
        var sectionJSON = "/api/v2/help_center/sections.json?per_page=20"
        var sectionDone = 0;
        var sectionData;
        updateStatusBG($("#sectionBackupStatus"), "ready");
        $("#sectionBackupStatus").text("Processing... please wait.");

        function sectionBackup() {
            $.get(sectionJSON).done(function(data) {
                if (typeof sectionData == "undefined") sectionData = data.sections;
                else sectionData = sectionData.concat(data.sections);
                sectionData.forEach(function(section) {
                    section.name = replaceWordChars(section.name);
                    if (section.description) section.description = replaceWordChars(section.description);
                });
                var percDone = Math.floor(data.page / data.page_count * 100) + "%";
                $("#sectionBackupStatus").text("Processing... " + percDone + " complete.");
                sectionJSON = data.next_page;
                if (sectionJSON !== null) {
                    sectionJSON += "&per_page=20";
                    sectionBackup();
                } else sectionDone = 1;
            });
        }
        sectionBackup();
        var sectionBackupCheck = setInterval(function() {
            if (sectionDone) {
                clearInterval(sectionBackupCheck);
                if (sectionData == '') return;
                JSONToCSV("section", sectionData, true);
            }
        }, 100);
    });

    $('#articleBackup').click(function() {
        var articleJSON = "/api/v2/help_center/articles.json?per_page=20"
        var articleDone = 0;
        var articleData;
        updateStatusBG($("#articleBackupStatus"), "ready");
        $("#articleBackupStatus").text("Processing... please wait.");

        function articleBackup() {
            $.get(articleJSON).done(function(data) {
                if (typeof articleData == "undefined") articleData = data.articles;
                else articleData = articleData.concat(data.articles);
                articleData.forEach(function(article) {
                    article.name = replaceWordChars(article.name);
                    article.title = replaceWordChars(article.title);
                    if (article.body) article.body = replaceWordChars(article.body);
                });
                var percDone = Math.floor(data.page / data.page_count * 100) + "%";
                $("#articleBackupStatus").text("Processing... " + percDone + " complete.");
                articleJSON = data.next_page;
                if (articleJSON !== null) {
                    articleJSON += "&per_page=20";
                    articleBackup();
                } else articleDone = 1;
            });
        }
        articleBackup();
        var articleBackupCheck = setInterval(function() {
            if (articleDone) {
                clearInterval(articleBackupCheck);
                if (articleData == '') return;
                JSONToCSV("article", articleData, true);
            }
        }, 100);
    });

    function JSONToCSV(obj, JSONData, ShowLabel) {
        $("#" + obj + "BackupStatus").text("Your download will commence shortly.");
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        var CSV = '';
        var htmlFields = [];
        if (ShowLabel) {
            var row = "";
            var iterate = 0;
            for (var index in arrData[0]) {
                if (index == "body" || index == "name" || index == "title" || index == "description") htmlFields.push(iterate);
                row += index + ',';
                iterate++;
            }
            row = row.slice(0, -1);
            CSV += row + '\r\n';
        }
        for (var i = 0; i < arrData.length; i++) {
            var row = "";
            var iterate = 0;
            for (var index in arrData[i]) {
                if ($.inArray(iterate, htmlFields) > -1) row += '"' + encodeURIComponent(arrData[i][index]) + '",';
                else row += '"' + arrData[i][index] + '",';
                iterate++;
            }
            row.slice(0, row.length - 1);
            CSV += row + '\r\n';
        }
        if (CSV == '') {
            updateStatusBG($("#" + obj + "BackupStatus"), "error");
            $("#" + obj + "BackupStatus").text("Backup failed. Process interrupted.");
            return;
        }
        var link = document.createElement("a");
        link.id = "csvDownloadLink";
        document.body.appendChild(link);
        var csv = CSV;
        blob = new Blob([csv], {
            type: 'text/csv'
        });
        var csvUrl = window.webkitURL.createObjectURL(blob);
        var dt = new Date();
        var time = dt.getFullYear() + "_" + dt.getMonth() + "_" + dt.getDate() + "_" + dt.getHours() + "_" + dt.getMinutes() + "_" + dt.getSeconds();
        var fileName = "backup_" + obj + "_" + time + ".csv";
        $("#csvDownloadLink").attr({
            'download': fileName,
            'href': csvUrl
        });
        $('#csvDownloadLink')[0].click();
        document.body.removeChild(link);
        updateStatusBG($("#" + obj + "BackupStatus"), "good");
        $("#" + obj + "BackupStatus").text("Backup completed successfully.");
    }

    //restore categories, sections and articles from CSV 
    var stepped = 0;
    var chunks = 0;
    var rows = 0;
    var successAPI = 0;
    var errorAPI = 0;
    var start, end, parser, currObj, currStatus;

    function buildConfig() {
        return {
            delimiter: "",
            newline: "\r\n",
            header: true,
            dynamicTyping: false,
            preview: 0,
            encoding: "",
            worker: false,
            comments: "",
            step: stepFn,
            complete: completeFn,
            error: errorFn,
            download: false,
            fastMode: false,
            skipEmptyLines: false,
            chunk: undefined,
            beforeFirstChunk: undefined,
            withCredentials: undefined
        };
    }

    function stepFn(results, parserHandle) {
        var apiURL;
        stepped++;
        rows += results.data.length;
        parser = parserHandle;
        parser.pause();
        //process category backups 
        if (currObj == "category") {
            apiURL = "/api/v2/help_center/categories.json";
            var catJSON = {
                "category": {
                    "position": results.data[0].position,
                    "locale": results.data[0].locale,
                    "name": decodeURIComponent(results.data[0].name),
                    "description": decodeURIComponent(results.data[0].description)
                }
            };
            //do not process help center admin category 
            if (decodeURIComponent(results.data[0].name).indexOf("@hc-admin") == -1) {
                $.ajax({
                    url: apiURL,
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json',
                    processData: false,
                    data: JSON.stringify(catJSON),
                    success: function(data) {
                        successAPI++;
                        updateStatusBG(currStatus, "ready");
                        currStatus.text("New category (ID:" + data.category.id + ") created successfully.");
                        $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "New category (ID:" + data.category.id + ") created successfully." + "\n").trigger('change');
                        //update description with mapping ID
                        var updateJSON = {
                            "category": {
                                "description": data.category.description + " MAP-ID:" + results.data[0].id
                            }
                        }
                        $.ajax({
                            url: '/api/v2/help_center/categories/' + data.category.id + '.json',
                            type: 'PUT',
                            dataType: 'json',
                            contentType: 'application/json',
                            processData: false,
                            data: JSON.stringify(updateJSON),
                            success: function(data) {
                                updateStatusBG(currStatus, "ready");
                                currStatus.text("Old category (ID:" + results.data[0].id + ") mapped to new category (ID:" + data.category.id + ").");
                                $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "Old category (ID:" + results.data[0].id + ") mapped to new category (ID:" + data.category.id + ")." + "\n").trigger('change');
                                parser.resume();
                            },
                            error: function() {
                                updateStatusBG(currStatus, "error");
                                currStatus.text("Failed to update the new category description with mapping ID for old category (ID:" + results.data[0].id + ").");
                                $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "Failed to update the new category description with mapping ID for old category (ID:" + results.data[0].id + ")." + "\n").trigger('change');
                                parser.resume();
                            }
                        });
                    },
                    error: function() {
                        errorAPI++;
                        updateStatusBG(currStatus, "error");
                        currStatus.text("Failed to create a new category for backup category (ID:" + results.data[0].id + ").");
                        $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "Failed to create a new category for backup category (ID:" + results.data[0].id + ")." + "\n").trigger('change');
                        parser.resume();
                    }
                });
            } else {
                //skip this hc admin category 
                updateStatusBG(currStatus, "ready");
                currStatus.text("Skipping category (ID:" + results.data[0].id + ") since this is the Help Center Admin category.");
                $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "Skipping category (ID:" + results.data[0].id + ") since this is the Help Center Admin category." + "\n").trigger('change');
                parser.resume();
            }
        } else if (currObj == "section") {
            var mapCategoryJSON = "/api/v2/help_center/categories.json?per_page=100"
            var mapCategoryDone = 0;
            var mapCategoryArray;
            var mappedID = 0;

            function mapCategory() {
                $.get(mapCategoryJSON).done(function(data) {
                    if (typeof mapCategoryArray == "undefined") mapCategoryArray = data.categories;
                    else mapCategoryArray = mapCategoryArray.concat(data.categories);
                    mapCategoryJSON = data.next_page;
                    if (mapCategoryJSON !== null) {
                        mapCategoryJSON += "&per_page=100";
                        mapCategory();
                    } else mapCategoryDone = 1;
                });
            }
            mapCategory();
            var mapCategoryCheck = setInterval(function() {
                if (mapCategoryDone) {
                    clearInterval(mapCategoryCheck);
                    if (mapCategoryArray == '') return;
                    //find out HC Admin category ID and mapped ID
                    var isHCadmin = false;
                    mapCategoryArray.forEach(function(category) {
                        if (category.description.indexOf("MAP-ID:" + results.data[0].category_id) > -1) mappedID = category.id;
                    });
                    //add section under mappedID
                    apiURL = "/api/v2/help_center/categories/" + mappedID + "/sections.json";
                    var sectionJSON = {
                        "section": {
                            "position": results.data[0].position,
                            "locale": results.data[0].locale,
                            "name": decodeURIComponent(results.data[0].name),
                            "description": decodeURIComponent(results.data[0].description)
                        }
                    };
                    //do not process help center admin category sections 
                    if (mappedID > 0) {
                        $.ajax({
                            url: apiURL,
                            type: 'POST',
                            dataType: 'json',
                            contentType: 'application/json',
                            processData: false,
                            data: JSON.stringify(sectionJSON),
                            success: function(data) {
                                successAPI++;
                                updateStatusBG(currStatus, "ready");
                                currStatus.text("New section (ID:" + data.section.id + ") created successfully.");
                                $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "New section (ID:" + data.section.id + ") created successfully." + "\n").trigger('change');
                                //update description with mapping ID
                                var updateJSON = {
                                    "section": {
                                        "description": data.section.description + " MAP-ID:" + results.data[0].id
                                    }
                                }
                                $.ajax({
                                    url: '/api/v2/help_center/sections/' + data.section.id + '.json',
                                    type: 'PUT',
                                    dataType: 'json',
                                    contentType: 'application/json',
                                    processData: false,
                                    data: JSON.stringify(updateJSON),
                                    success: function(data) {
                                        updateStatusBG(currStatus, "ready");
                                        currStatus.text("Old section (ID:" + results.data[0].id + ") mapped to new section (ID:" + data.section.id + ").");
                                        $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "Old section (ID:" + results.data[0].id + ") mapped to new section (ID:" + data.section.id + ")." + "\n").trigger('change');
                                        parser.resume();
                                    },
                                    error: function() {
                                        updateStatusBG(currStatus, "error");
                                        currStatus.text("Failed to update the new section description with mapping ID for backup section (ID:" + results.data[0].id + ").");
                                        $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "Failed to update the new section description with mapping ID for backup section (ID:" + results.data[0].id + ")." + "\n").trigger('change');
                                        parser.resume();
                                    }
                                });
                            },
                            error: function() {
                                errorAPI++;
                                updateStatusBG(currStatus, "error");
                                currStatus.text("Failed to create a new section for backup section (ID:" + results.data[0].id + ").");
                                $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "Failed to create a new section for backup section (ID:" + results.data[0].id + ")." + "\n").trigger('change');
                                parser.resume();
                            }
                        });
                    } else {
                        //skip this hc admin category section 
                        updateStatusBG(currStatus, "ready");
                        currStatus.text("Skipping section (ID:" + results.data[0].id + ") since it belongs to Help Center Admin category.");
                        $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "Skipping section (ID:" + results.data[0].id + ") since it belongs to Help Center Admin category." + "\n").trigger('change');
                        parser.resume();
                    }
                }
            }, 100);
        } else if (currObj == "article") {
            var mapSectionJSON = "/api/v2/help_center/sections.json?per_page=100"
            var mapSectionDone = 0;
            var mapSectionArray;
            var mappedID = 0;

            function mapSection() {
                $.get(mapSectionJSON).done(function(data) {
                    if (typeof mapSectionArray == "undefined") mapSectionArray = data.sections;
                    else mapSectionArray = mapSectionArray.concat(data.sections);
                    mapSectionJSON = data.next_page;
                    if (mapSectionJSON !== null) {
                        mapSectionJSON += "&per_page=100";
                        mapSection();
                    } else mapSectionDone = 1;
                });
            }
            mapSection();
            var mapSectionCheck = setInterval(function() {
                if (mapSectionDone) {
                    clearInterval(mapSectionCheck);
                    if (mapSectionArray == '') return;
                    //find out HC Admin category ID and mapped ID
                    var isHCadmin = false;
                    mapSectionArray.forEach(function(section) {
                        if (section.description.indexOf("MAP-ID:" + results.data[0].section_id) > -1) mappedID = section.id;
                    });
                    //add section under mappedID
                    apiURL = "/api/v2/help_center/sections/" + mappedID + "/articles.json";
                    var articleJSON = {
                        "article": {
                            "title": decodeURIComponent(results.data[0].title),
                            "comments_disabled": results.data[0].comments_disabled,
                            "draft": results.data[0].draft,
                            "promoted": results.data[0].promoted,
                            "position": results.data[0].position,
                            "locale": results.data[0].locale,
                            "label_names": results.data[0].label_names.split(','),
                            "body": decodeURIComponent(results.data[0].body)
                        }
                    };
                    //do not process help center admin category sections
                    if (mappedID > 0) {
                        $.ajax({
                            url: apiURL,
                            type: 'POST',
                            dataType: 'json',
                            contentType: 'application/json',
                            processData: false,
                            data: JSON.stringify(articleJSON),
                            success: function(data) {
                                successAPI++;
                                updateStatusBG(currStatus, "ready");
                                currStatus.text("New article (ID:" + data.article.id + ") created successfully.");
                                $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "New article (ID:" + data.article.id + ") created successfully." + "\n").trigger('change');
                                parser.resume();
                            },
                            error: function() {
                                errorAPI++;
                                updateStatusBG(currStatus, "error");
                                currStatus.text("Failed to create a new article for backup article (ID:" + results.data[0].id + ").");
                                $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "Failed to create a new article for backup article (ID:" + results.data[0].id + ")." + "\n").trigger('change');
                                parser.resume();
                            }
                        });
                    } else {
                        //skip this hc admin category article 
                        updateStatusBG(currStatus, "ready");
                        currStatus.text("Skipping article (ID:" + results.data[0].id + ") since it belongs to Help Center Admin category.");
                        $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "Skipping article (ID:" + results.data[0].id + ") since it belongs to Help Center Admin category." + "\n").trigger('change');
                        parser.resume();
                    }
                }
            }, 100);
        }
    }

    function errorFn(error, file) {
        updateStatusBG(currStatus, "error");
        currStatus.text("ERROR : " + error);
    }

    function completeFn() {
        end = performance.now();
        updateStatusBG(currStatus, "good");
        currStatus.text(successAPI + "/" + errorAPI + " restored in " + Math.floor(end - start) + " seconds.");
        //reset restore buttons -- JK
        $(".article-body button").attr("disabled", false);
        $(".article-body button").each(function() {
            $(this).text($(this).attr("name"));
        })
    }

    function restoreFromBackup(backupObj, btn) {
        successAPI = 0;
        errorAPI = 0;
        stepped = 0;
        chunks = 0;
        rows = 0;
        currStatus = $("#restore" + backupObj + "Status");
        currObj = backupObj;
        $("#" + currObj + "Log").val("").trigger('change');
        //disable additinal requests until current restore complete 
        $(".article-body button").attr("disabled", true);
        $(".article-body button").text("PROCESSING RESTORE");
        var files = $('#' + backupObj + 'CSVupload')[0].files;
        var config = buildConfig();
        if (files.length > 0) {
            start = performance.now();
            $('#' + backupObj + 'CSVupload').parse({
                config: config,
                before: function(file, inputElem) {
                    updateStatusBG(currStatus, "ready");
                    currStatus.text("Restoring from back up file: " + file.name);
                    $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + "Restoring from back up file: " + file.name + "\n").trigger('change');
                    if (file.name.indexOf(backupObj.toLowerCase()) == -1) {
                        return {
                            action: "abort",
                            reason: "Backup file name does not match " + backupObj.toLowerCase() + " type."
                        }
                    }
                },
                error: function(err, file, inputElem, reason) {
                    updateStatusBG(currStatus, "error");
                    currStatus.text(reason);
                    //reset restore buttons -- JK
                    $(".article-body button").attr("disabled", false);
                    $(".article-body button").each(function() {
                        $(this).text($(this).attr("name"));
                    })
                },
                complete: function() {
                    updateStatusBG(currStatus, "good");
                    currStatus.text(toTitleCase(backupObj) + " restoration completed successfully.");
                    $("#" + currObj + "Log").val($("#" + currObj + "Log").val() + successAPI + "/" + rows + " " + backupObj + " items restored successfully." + "\n").trigger('change');
                }
            });
        } else {
            updateStatusBG($(currStatus), "error");
            currStatus.text("Please select the back up file to restore.");
            //reset restore buttons 
            $(".article-body button").attr("disabled", false);
            $(".article-body button").each(function() {
                $(this).text($(this).attr("name"));
            })
        }
    }
    $('#restoreCategoryBtn').click(function() {
        restoreFromBackup("category", $(this));
    });
    $('#restoreSectionBtn').click(function() {
        restoreFromBackup("section", $(this));
    });
    $('#restoreArticleBtn').click(function() {
        restoreFromBackup("article", $(this));
    });
    $($(".article-body input")).on('change', function() {
        if ($(this).attr("id").indexOf("CSVupload") > -1) {
            var obj = $(this).attr("id").split("CSVupload");
            updateStatusBG($("#restore" + obj[0] + "Status"), "ready");
            $("#restore" + obj[0] + "Status").text(toTitleCase(obj[0]) + " restore not started.");
        }
    });
    //end of help center content administration
});