/*
 * jQuery v1.9.1 included
 */
$(document).ready(function() {

    if (window.location.href.indexOf("/articles/") == -1 || window.location.href.indexOf("209729503") == -1 || window.location.href.indexOf("type=Files") == -1) {
        $("html").css("display", "block");
        $("main").css("display", "block");
    }

    //turn on or off help center maintenance mode -- JK
    var helpCenterMaintenance = false;

    //global local storage versioning, use this to force user to refresh their browser stored categories and sections
    var storage = window['localStorage'];
    var helpCenterVer = 'v1.0';

    var sessionStorage = window['sessionStorage'];

    var currentUser = HelpCenter.user.role;
    var isSectionPage = window.location.href.indexOf("/sections/") > -1;

    //pass user role to google analytics
    /* ga('set', 'dimension1', currentUser); */

    if (HelpCenter.user.locale === undefined) currentLang = "en-us";
    else currentLang = HelpCenter.user.locale;

    //inbental global switch
    var inbenta = true;
    if (HelpCenter.user.locale == "ja") inbenta = false;

    //unsupported browsers: IE8 -- JK
    function isIE() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }
    if (isIE() == 8) {
        if (window.location.href.indexOf("206321873") == -1) window.location.replace("https://support.sizmek.com/hc/" + currentLang + "/articles/206321873");
        else {
            $(".user-nav").hide();
            $(".search").hide();
            $(".in-this-articles").hide();
            $(".article-subscribe").hide();
            $(".notification").hide();
            $(".article-footer").hide();
            $(".article-comments").hide();
            $(".breadcrumbs").hide();
            $('body').css("font-family", "arial");
            $("main").show();
            return false;
        }
    }

    /*   //enable inbenta?
    if (inbenta) {
        $(".search-filter").hide();
        $(".search-results-column").hide();
        $(".searchbox").css("height", "0px");
        $(".searchbox").css("overflow", "hidden");
        $(".searchbox").css("margin", "0");

        $(".searchbox").css("display", "none");
        $(".request_description").css("padding-top", "25px");



        //DON'T USE INBENTA IN PRODUCTION SITES WHEN LANGUAGE IS NOT ENGLISH
        window.stopInbenta = false;
        if (window.location.href.indexOf('.inbenta.com') == -1 && window.location.href.indexOf('/hc/en-us') == -1) {
            window.stopInbenta = true;
        }

        //CHECK WHETHER WE ARE IN THE CONTACT PAGE OR NOT
        window.isContactPage = true;
        if (window.location.href.indexOf('.inbenta.com') == -1 && window.location.href.indexOf('/requests/new') == -1) {
            window.isContactPage = false;
        }

        if (!window.stopInbenta) {
            if (isIE() < 9) {
                var shivS = document.createElement('script');
                var respondS = document.createElement('script');
                shivS.type = respondS.type = 'text/javascript';
                shivS.src = "https://sizmek.inbenta.com/assets/js/html5shiv.js";
                respondS.src = "https://sizmek.inbenta.com/assets/js/respond.min.js";
                $(".footer").append(shivS);
                $(".footer").append(respondS);
            }
            var inbentaS = document.createElement('script');
            inbentaS.type = 'text/javascript';

            if (window.isContactPage) {
                inbentaS.src = "https://sizmek.inbenta.com/assets/js/inbenta.js?isContactPage=yes&1467417935&" + helpCenterVer;
                $(".footer").append(inbentaS);
            } else {
                inbentaS.src = "https://sizmek.inbenta.com/assets/js/inbenta.js?1467417935&" + helpCenterVer;
            }
            $(".footer").append(inbentaS);
            $('head').append('<link rel="stylesheet" href="https://sizmek.inbenta.com/assets/css/inbenta.css?' + helpCenterVer + '" type="text/css" />');
        }
    }
 */
    //if in maintenance, move all traffic to maintenance notice article -- JK
    if (helpCenterMaintenance && currentUser !== "manager") {
        if (window.location.href.indexOf("205990016") == -1) window.location.replace("https://support.sizmek.com/hc/" + currentLang + "/articles/205990016");
        else {
            $(".user-nav").hide();
            $(".search").hide();
            $(".in-this-articles").hide();
            $(".article-subscribe").hide();
            $(".notification").hide();
            $(".article-footer").hide();
            $(".article-comments").hide();
            $(".breadcrumbs").hide();
            $("main").show();
            return false;
        }
    }
    //remove new template announcement -- JK -- TEMP
    $(".notification-ipm").hide();
    $('main').css('min-height', '600px');

    var submitCheck = false;
    var categoryReady = 0;
    //set max API search result in increments of 20
    var maxResultsAPI = 100;
    var preFilterCount = 0;
    var searchResultCount = 0;
    var searchComplete = 0;
    var searchDone = 0;
    var searchQuery;
    var resultCategoryArray = [];
    var resultContentTypes = [];
    //content type definitions = tag, classname, display name -- JK
    var contentTypes = [
        ["@section", "section-title", "SECTION"],
        ["@topic", "topic-title", "TOPIC"],
        ["@article", "article-title", "ARTICLE"],
        ["@issue", "issue-title", "ISSUE"],
        ["@sub", "sub-title", "SUBPAGE"],
        ["@overview", "overview-title", "OVERVIEW"],
        ["@howto", "howto-title", "HOW TO"],
        ["@usecase", "usecase-title", "USE CASE"],
        ["@sizmekcertified", "certified-title", "SIZMEK CERTIFIED"],
        ["@onboarding", "onboarding-title", "CLIENT ONBOARDING"],
        ["@faq", "faq-title", "FAQ"],
        ["@tips", "tips-title", "TIPS & TRICKS"],
        ["@troubleshooting", "troubleshoot-title", "TROUBLESHOOTING"],
        ["@bestpractices", "bestpractices-title", "BEST PRACTICES"],
        ["@knownissues", "knownissues-title", "KNOWN ISSUES"],
        ["@reference", "reference-title", "REFERENCE"],
        ["@glossary", "glossary-title", "GLOSSARY"],
        ["@video", "video-title", "VIDEO"],
        ["@new", "new-title", "WHATS NEW"],
        ["@supportkb", "kb-title", "SUPPORT KB"],
        ["@mdx2", "mdx2-title", "MDX 2.0"],
        ["@mdxnxt", "mdxnxt-title", "MDX NXT"],
        ["@hc-admin", "hcadmin-title", "HC ADMIN"]

    ];
    var kbTags = ["@topic", "@article", "@reference", "@howto", "@sub", "@issue"];

    //make TOC stick on scroll -- JK
    $(window).on('scroll', function(event) {
        var useFixedSidebar = $(document).scrollTop() > 245; //145
        $('.tocify').toggleClass('fixedSidebar', useFixedSidebar);
        if (useFixedSidebar == true) $(".quickNavMenu").css('max-height', window.innerHeight - 110 + "px");
        else $(".quickNavMenu").css('max-height', window.innerHeight - 340 + "px");
    });
    $(window).on('resize', function() {
        $(".quickNavMenu").css('max-height', window.innerHeight - 110 + "px");
    });

    setInterval(function() {
        $(window).scroll();
    }, 500);

    //lets hide Comment title if comment disabled -- JK
    if ($(".comment-form").length == 0) {
        $(".article-comments").hide()
    }
    //hide in-this-article if article has only one header -- JK
    if ($('.article-body h2').length < 2) {
        $(".in-this-articles").hide();
        $(".main-column").css("width", "97%");
    }
    //remove internal only contents for external users and manage homepage links
    $("#contactLink").hide();
    $("#statusLink").hide();
    if (currentUser !== "manager") $("#adminHC").remove();
    if (currentUser == "end_user" || currentUser == "anonymous") {
        $("#internal_only, #internal_only.note").remove();
        $(".internal_only").remove();
        $("#internal_only").hide();
        $(".internal_only").hide();
        $('#accountLink').hide();
        $("#contactLink").show();
    } else $("#suggestionLink").find("a").attr("href", "https://sizmekmdxinternal.ideas.aha.io/portal_session/new");

    if (currentUser == "anonymous") {
        var loginURL = "https://platform.mediamind.com/Eyeblaster.ACM.Web/Login/ZDLogin.aspx?brand_id=12005&locale_id=1&return_to=https%3A%2F%2Fsupport.sizmek.com%2Fhc%2F" + currentLang + "%2F";
        $(".tabGettingStarted .sub-menu").append('<li><a href="' + loginURL + '" style="color:#000 !important">Please <strong class="loginC">sign in</strong> to view more articles</a></li>');
        $(".tabCampaignManagement .sub-menu").append('<li><a href="' + loginURL + '" style="color:#000 !important">Please <strong class="loginC">sign in</strong> to view more articles</a></li>');
        $(".tabFAQs .sub-menu").append('<li><a href="' + loginURL + '" style="color:#000 !important">Please <strong class="loginC">sign in</strong> to view more articles</a></li>');
    }

    //default search input field -- JK
    $('#query').attr('placeholder', 'Enter a question, keyword or topic...');
    //community page theme - missing templates workaround -- JK
    if (window.location.href.indexOf("/community/") > -1) {
        $(".sub-nav").wrapInner("<div class='sub-nav-inner'></div>");
    }
    //added for homepage accordion menu -- JK
    var accordion_head = $('.accordion > li > a');
    var accordion_body = $('.accordion li > .sub-menu');
    accordion_head.on('click', function(event) {
        event.preventDefault();
        if ($(this).attr('class') != 'active') {
            accordion_body.slideUp('normal');
            $(this).next().stop(true, true).slideToggle('fast');
            accordion_head.removeClass('active');
            $(this).addClass('active');
            $(".accordion").children("li").children("ul").each(function() {
                $('li', this).css('border-bottom', 'none');
                $('li:visible:last', this).css('border-bottom', '1px solid #BACAE4');
                $('li:visible:first', this).children("a").addClass('accordionFirst');
                $('li:visible:last', this).children("a").addClass('accordionLast');
            });
            $($(".accordion .active").parent().children("ul").children("li:not([class])")[0]).children("a").css("padding-top", "25px")
        } else {
            accordion_body.slideUp('normal');
            accordion_head.removeClass('active');
        }
    });
    //function to capitalize first letter of each word -- JK
    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
    //get full category lists using API due to placeholder pagination limit -- JK
    var apiURL = "/api/v2/help_center/" + currentLang + "/categories.json?per_page=100";

    //if we are at home page, generate accordion menu from categories
    if ($('.hero-unit').length == 1) {
        function getCategories() {
            $.get(apiURL).done(function(data) {
                apiURL = data.next_page;
                var categories = $.map(data.categories, function(category, i) {
                    return {
                        "name": category.name,
                        "url": category.html_url
                    };
                });
                $.each(categories, function(i, category) {

                    var newHTML = '<a href="' + category["url"] + '">' + category["name"] + '</a>';
                    var realHTML = $('<li>').html(newHTML);
                    var exHTML = $('<li>').html(newHTML).html();
                    realHTML.appendTo(".tabAPI .sub-menu");
                    if (exHTML.indexOf(">@") >= 0) {
                        if (exHTML.split(">@")[1].split(" ")[0].indexOf("--") >= 0) {
                            //has sub-super-category -- JK
                            var superCat = exHTML.split(">@")[1].split(" ")[0].split("--")[0].replace(/-/g, " ");
                            var superCatClass = "tab" + toTitleCase(superCat).replace(/ /g, "");
                            var superSubCat = exHTML.split(">@")[1].split(" ")[0].split("--")[1].replace(/-/g, " ");
                            var superSubCatClass = "tab" + toTitleCase(superSubCat).replace(/[- )(]/g, '');
                            if ($("." + superCatClass + " ." + superSubCatClass).length) {
                                //sub category exists, move immediately -- JK
                                realHTML.appendTo("." + superSubCatClass + " .sub-sub-menu");
                            } else {
                                //create sub category, then move -- JK
                                var currHTML = $("." + superCatClass + " .sub-menu").html();
                                $("." + superCatClass + " " + ".sub-menu").html(currHTML + '<li class="' + superSubCatClass + '"><a href="#" class="superSubAccor" onclick="event.preventDefault()"><b>' + superSubCat + '</b></a><ul class="sub-sub-menu"></ul></li>');
                                realHTML.appendTo("." + superSubCatClass + " .sub-sub-menu");
                            }
                        } else {
                            //no sub-super-category, move immediately -- JK
                            if (exHTML.indexOf("@your-resources") > -1) realHTML.appendTo(".tabYourResources .sub-menu");
                            if (exHTML.indexOf("@getting-started") > -1) realHTML.appendTo(".tabGettingStarted .sub-menu");
                            if (exHTML.indexOf("@campaign-management") > -1) realHTML.appendTo(".tabCampaignManagement .sub-menu");
                            if (exHTML.indexOf("@faqs") > -1) realHTML.appendTo(".tabFAQs .sub-menu");
                            if (exHTML.indexOf("@creative") > -1) realHTML.appendTo(".tabCreative .sub-menu");
                            if (exHTML.indexOf("@publishers") > -1) realHTML.appendTo(".tabPublishers .sub-menu");
                            if (exHTML.indexOf("@certified") > -1) realHTML.appendTo(".tabCertified .sub-menu");
                        }
                    }
                });
                if (apiURL !== null) {
                    apiURL += "&per_page=100";
                    getCategories();
                } else categoryReady = 1;
            });
        }
        getCategories();
    }

    //remove title tags from breadcrumbs -- JK
    $('.breadcrumbs').find('li').each(function() {
        var exHTML = $(this).html();
        $(this).html(exHTML.trim().replace(/\@[\w-\(|\)]+\s/ig, ""));
    });
    //remove title tags from the page title -- JK
    $('head').find('title').each(function() {
        var exHTML = $(this).html();
        $(this).html(exHTML.trim().replace(/\@[\w-\(|\)]+\s/ig, ""));
    });
    //replace title tags in page header h1 -- JK
    $('.page-header').find('h1').each(function() {
        var exHTML = $(this).html();
        $(this).html(exHTML.trim().replace(/\@[\w-\(|\)]+\s/ig, ""));
    });
    //replace title tags in article header h1 -- JK
    $('.article-header').find('h1').each(function() {
        cleanThis($(this));
    });

    function cleanWrap() {
        $('.wrapper').find('a').each(function() {
            //indent issue tag pages for section view unless is admin Page Templates section -- JK
            if ($('.hero-unit').length == 0 && ((/@sub/i.test($(this).html())) || (/sub-title/i.test($(this).html())) || (/@issue/i.test($(this).html())) || (/issue-title/i.test($(this).html())))) {
                if (isSectionPage) {
                    $(this).css('margin-left', '50px');
                    //if ($("#switchTag").val() !== "support_kb") $(this).css('margin-left', '50px');
                } else if (window.location.href.indexOf("/categories/") > -1) {
                    $(this).css('margin-left', '50px');
                    // if ($("#switchTag").val() !== "support_kb") $(this).css('margin-left', '50px');
                } else {
                    $(this).css('margin-left', '0px');
                }
            }

            cleanThis($(this));
        })


        $('.article-list').find('li').each(function() {
            if ($(this).html().indexOf("sub-title") > -1) {
                $(this).addClass("treeline");
            }
        });
    }
    cleanWrap();

    //title tags replace function -- JK
    function cleanTextOnly(txt) {
        txt = txt.trim().replace(/\@[\w-\(|\)]+\s/ig, ""); //.trim().replace(/\@[\w-]+\s/ig, "");
        return txt;
    }

    function cleanThis(elem) {
        for (var indx = 0; indx < contentTypes.length; ++indx) {
            var reg = new RegExp(contentTypes[indx][0] + ' ', 'ig');
            elem.html(elem.html().replace(reg, "<span class='" + contentTypes[indx][1] + "'>" + contentTypes[indx][2] + "</span>"));
        }
        var newHTML = '';
        var videoSpan = '<span class="video-title">VIDEO</span>';
        if (elem.html().split(videoSpan).length > 1) {
            for (var indy = 0; indy < elem.html().split(videoSpan).length; ++indy) {
                newHTML += elem.html().split(videoSpan)[indy];
            }
            elem.html(newHTML + " " + videoSpan);
        }
        if (elem.html().match('/|@getting-started|@campaign-management|@faqs|@creative|@publishers|@certified|@your-resources|@mdx2|/ig'))
            elem.html(elem.html().trim().replace(/\@[\w-\(|\)]+\s/ig, "")); //.trim().replace(/\@[\w-]+\s/ig, "")
    }
    if (window.location.href.indexOf("/hc/" + currentLang + "/requests/new") > -1) {
        var cleanSuggestions = setInterval(function() {
            $('.searchbox-suggestions').find('a').each(function() {
                cleanThis($(this));
            })
        }, 100);
    }
    //clean notification area as well
    if ($(".notification-text").length) {
        cleanThis($(".notification-text"));
    }

    $(".breadcrumbs").find("li").each(function() {
        this.title = cleanTextOnly(this.title)
    });

    //INBENTA----comment out below START
    if (!inbenta) {
        $('.search-result').find('.search-result-meta').each(function() {
            $(this).html($(this).html().split("</time> in ")[1]);
        });
    }
    //INBENTA---END

    //for HC reporting 
    var currPage = 0;
    var per_page = 5;

    if (window.location.href.indexOf("/articles/206321933") > -1) {
        currPage = 1;
    }
    if ($('.hero-unit').length == 1) {
        currPage = 2;
        per_page = 8;
    }
    //if we are at homepage or article report page and have correct roles
    if (currPage > 0 && currentUser == "manager") {

        var getContentManagersURL = "/api/v2/users.json?role[]=agent&role[]=manager&role[]=admin&per_page=100";
        var cmArray = [];
        var gotCMs = 0;

        function searchCMs() {
            if (storage.getItem(HelpCenter.user.email + '-allCMs' + helpCenterVer + currentLang) === null) {
                $.get(getContentManagersURL).done(function(data) {
                    getContentManagersURL = data.next_page;
                    var cmNewArray = $.map(data.users, function(user, i) {
                        return {
                            "id": user.id,
                            "name": user.name
                        };
                    });
                    cmArray = $.merge(cmNewArray, cmArray);
                    if (getContentManagersURL !== null) {
                        getContentManagersURL += "&per_page=100";
                        searchCMs();
                    } else {
                        storage.setItem(HelpCenter.user.email + '-allCMs' + helpCenterVer + currentLang, JSON.stringify(cmArray));
                        gotCMs = 1;
                    }
                });
            } else {
                cmArray = JSON.parse(storage.getItem(HelpCenter.user.email + '-allCMs' + helpCenterVer + currentLang));
                gotCMs = 1;
            }
        }
        searchCMs();

        var checkCMsRdy = setInterval(function() {
            if (gotCMs) {
                clearInterval(checkCMsRdy);

                $.get("/api/v2/help_center/" + currentLang + "/articles.json?sort_by=created_at&sort_order=desc&per_page=" + per_page).done(function(data) {
                    var createdArticleList = $.map(data.articles, function(article, i) {
                        return {
                            "id": article.id,
                            "url": article.html_url,
                            "title": article.title,
                            "author_id": article.author_id,
                            "updated_at": article.updated_at,
                            "created_at": article.created_at,
                            "section_id": article.section_id
                        };
                    });
                    var tbody = (currPage == 1) ? $('#createdArticles tbody') : $('#newKB');
                    var props = (currPage == 1) ? ["title", "section_id", "created_at"] : ["title", "author_id"];
                    var propVal;
                    $.each(createdArticleList, function(i, article) {
                        var tr = (currPage == 1) ? $('<tr>') : $('<li>');
                        $.each(props, function(i, prop) {
                            if (prop == "updated_at" || prop == "created_at") {
                                propVal = new Date(article[prop]);
                                propVal = propVal.toUTCString();
                            } else if (prop == "title") {
                                if (article[prop].length > 60) article[prop] = article[prop].split(" ").splice(0, 6).join(" ") + "...";
                                propVal = "<a href='" + article["url"] + "' target='_self'>" + article[prop] + "</a>";
                            } else if (prop == "section_id") {
                                propVal = "<a href='/hc/" + currentLang + "/sections/" + article[prop] + "' target='_self'>" + article[prop] + "</a>";
                            } else if (prop == "author_id") {
                                propVal = article[prop];
                                var userName = cmArray.filter(function(user) {
                                    return user.id == propVal;
                                });
                                if (typeof userName[0] !== "undefined") userName = userName[0]["name"].split(" ")[0];
                                else userName = "Product";
                                propVal = " by <span class='username'>" + userName + "</span>"
                            } else {
                                propVal = article[prop];
                            }
                            if (currPage == 1) $('<td>').html(propVal).appendTo(tr);
                            else $('<span>').html(propVal).appendTo(tr);
                        });
                        tbody.append(tr);
                    });
                    cleanWrap();
                });
                $.get("/api/v2/help_center/" + currentLang + "/articles.json?sort_by=updated_at&sort_order=desc&per_page=" + per_page).done(function(data) {
                    var latestArticleList = $.map(data.articles, function(article, i) {
                        return {
                            "id": article.id,
                            "url": article.html_url,
                            "title": article.title,
                            "author_id": article.author_id,
                            "updated_at": article.updated_at,
                            "created_at": article.created_at,
                            "section_id": article.section_id
                        };
                    });
                    var tbody = (currPage == 1) ? $('#latestArticles tbody') : $('#recentKB');
                    var props = (currPage == 1) ? ["title", "section_id", "updated_at"] : ["title", "author_id"];
                    var propVal;
                    $.each(latestArticleList, function(i, article) {
                        var tr = (currPage == 1) ? $('<tr>') : $('<li>');
                        $.each(props, function(i, prop) {
                            if (prop == "updated_at" || prop == "created_at") {
                                propVal = new Date(article[prop]);
                                propVal = propVal.toUTCString();
                            } else if (prop == "title") {
                                if (article[prop].length > 60) article[prop] = article[prop].split(" ").splice(0, 6).join(" ") + "...";
                                propVal = "<a href='" + article["url"] + "' target='_self'>" + article[prop] + "</a>";
                            } else if (prop == "section_id") {
                                propVal = "<a href='/hc/" + currentLang + "/sections/" + article[prop] + "' target='_self'>" + article[prop] + "</a>";
                            } else if (prop == "author_id") {
                                propVal = article[prop];
                                var userName = cmArray.filter(function(user) {
                                    return user.id == propVal;
                                });
                                if (typeof userName[0] !== "undefined") userName = userName[0]["name"].split(" ")[0];
                                else userName = "Product";
                                propVal = " by <span class='username'>" + userName + "</span>"
                            } else {
                                propVal = article[prop];
                            }
                            if (currPage == 1) $('<td>').html(propVal).appendTo(tr);
                            else $('<span>').html(propVal).appendTo(tr);
                        });
                        tbody.append(tr);
                    });
                    cleanWrap();
                });
                $.get("/api/v2/help_center/" + currentLang + "/articles.json?sort_by=updated_at&sort_order=asc&per_page=" + per_page).done(function(data) {
                    var lastUpdatedArticleList = $.map(data.articles, function(article, i) {
                        return {
                            "id": article.id,
                            "url": article.html_url,
                            "title": article.title,
                            "author_id": article.author_id,
                            "updated_at": article.updated_at,
                            "created_at": article.created_at,
                            "section_id": article.section_id
                        };
                    });
                    try {
                        var tbody = $('#oldArticles tbody');
                        var props = ["title", "section_id", "updated_at"];
                        var daysDiff, propVal;
                        var addedCount = 0;
                        $.each(lastUpdatedArticleList, function(i, article) {
                            var tr = $('<tr>');
                            $.each(props, function(i, prop) {
                                if (prop == "updated_at" || prop == "created_at") {
                                    var articleDate = new Date(article[prop]);
                                    var nowDate = new Date((new Date).getTime());
                                    var dateDiff = new Date(nowDate - articleDate);
                                    daysDiff = dateDiff / 1000 / 60 / 60 / 24;
                                    propVal = articleDate.toUTCString();
                                } else if (prop == "title") {
                                    propVal = "<a href='" + article["url"] + "' target='_self'>" + article[prop] + "</a>";
                                } else if (prop == "section_id") {
                                    propVal = "<a href='/hc/" + currentLang + "/sections/" + article[prop] + "' target='_self'>" + article[prop] + "</a>";
                                } else {
                                    propVal = article[prop];
                                }
                                $('<td>').html(propVal).appendTo(tr);
                            });
                            if (daysDiff >= 90) {
                                addedCount += 1;
                                tbody.append(tr);
                            }
                        });
                        cleanWrap();
                        if (addedCount == 0) tbody.append("<tr><td colspan='3'>Great! All articles were updated within past 90 days.</td></tr>");
                    } catch (e) {}
                });
            }
        }, 100);
    }
    //end reporting

    /*   //added for UFFA Start - this needs code clean up -- JK
      function inIframe() {
          try {
              return window.self !== window.top;
          } catch (e) {
              return true;
          }
      }
      if (inIframe()) {
          //HC loaded within iframe
          var URL = window.location.href;
          var searchResult = false;
          var communityPage = false;
          try {
              searchResult = ((document.getElementsByTagName("h1")[0].className).indexOf("search-results") > -1);
          } catch (e) {}
          try {
              communityPage = ((document.getElementsByTagName("h4")[0].className).indexOf("community-heading") > -1);
          } catch (e) {}
          window.onunload = function() {
              try {
                  parent.postMessage("pageUnload", "https://strikead.zendesk.com");
              } catch (e) {}
          };
          var urlFrag = URL.split("/");
          var lastFrag = urlFrag[urlFrag.length - 1];
          if (communityPage == false && searchResult == false && (URL.indexOf("return_to=") == -1) && lastFrag != currentLang) {
              try {
                  var newTitle = document.getElementsByTagName("h1")[0].innerHTML.replace(/(\r\n|\n|\r)/gm, "");
                  while (newTitle.charAt(0) === ' ') newTitle = newTitle.substr(1);
                  parent.postMessage(newTitle, "https://strikead.zendesk.com");
              } catch (e) {}
          }
          try {
              document.getElementsByClassName("toolbar")[0].style.paddingTop = "0px";
          } catch (e) {}
          try {
              document.getElementsByClassName("container")[0].style.margin = "0px";
          } catch (e) {}
          try {
              document.getElementsByTagName("nav")[1].style.paddingTop = "0px";
          } catch (e) {}
          try {
              document.getElementsByTagName("nav")[1].style.marginBottom = "0px";
          } catch (e) {}
          try {
              document.getElementsByTagName("aside")[0].style.marginTop = "95px";
          } catch (e) {}
          setTimeout(function() {
              try {
                  if (document.getElementById("manager-widget").style.width != "73px") {
                      document.getElementById("manager-widget").contentDocument.getElementById("toggle").click();
                  }
              } catch (e) {}
          }, 1000);
          try {
              parent.postMessage("iframeLoad", "https://strikead.zendesk.com");
          } catch (e) {}
      }
      //added for UFFA End -- JK */


    //temporary custom search filtering solution until ZD search functionality improves -- JK
    function preg_quote(str) {
        return (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
    }

    function highlight(data, search) {
        return data.replace(new RegExp("(" + preg_quote(search) + ")", 'gi'), "<span class='highlighter'>$1</span>");
    }
    var gotCategories = 0;
    var gotSections = 0;
    var gotArticles = 0;
    var categoryArray = [];
    var sectionArray = [];


    //INBENTA----comment out below START
    /* function checkResultCount() {
         if (searchDone == 1 && $(".search-results-list li").length == 0) {
             $("#filterContentTypes").find("input").each(function() {
                 filterThis($(this));
             });
             searchResultCount = $(".search-results-list-temp > li:visible").length;
             if (searchResultCount == 0) {
                 $(".search-results-column > .search-results-subheading").text("Search Result");
                 $(".searchStatus").text("No result found for current filter");
             } else {
                 if (searchResultCount == 1) {
                     $(".search-results-column > .search-results-subheading").text("Search Result");
                     $(".searchStatus").text("One result found for current filter");
                 } else {
                     $(".search-results-column > .search-results-subheading").text("Search Results");
                     $(".searchStatus").text(searchResultCount + " results found for current filter");
                 }
             }
         } else {
             if ($(".search-results-list li").length == 0 && $(".search-results-column > p").text().length == 0) {
                 $(".search-results-column > .search-results-subheading").text("Filtering results...");
                 $(".searchStatus").html('Filtering results <img src="/hc/theme_assets/539845/200023575/loading.GIF">');
             } else {
                 if (searchDone == 1) {
                     //remove default search  result
                     $(".search-results-list").hide();
                     $(".search-results-list").empty();
                     //show our new result
                     $(".search-results-list-temp").show();
                     $("#filterContentTypes").find("input").each(function() {
                         filterThis($(this));
                     });
                     if (preFilterCount == 0) {
                         $(".search-results-column > .search-results-subheading").text("Search Result");
                         $(".searchStatus").text("No result found for '" + searchQuery + "'");
                     } else {
                         if (preFilterCount == 1) {
                             $(".search-results-column > .search-results-subheading").text("Search Result");
                             $(".searchStatus").text("One result found for '" + searchQuery + "'");
                         } else {
                             $(".search-results-column > .search-results-subheading").text("Search Results");
                             $(".searchStatus").text(preFilterCount + " results for '" + searchQuery + "'");
                         }
                     }
                 }
             }
         }
         $(".search-results-column").find("p").text($(".search-results-column").find("p").text().replace(/\@[\w-]+\s/ig, ""))
     }*/
    //INBENTA----END


    if (window.location.href.indexOf("/search?") > -1) {

        var searchResultReady = setInterval(function() {
            if ($('#results').length) {
                if (HelpCenter.user.role == "anonymous") {
                    $("#results").prepend("<div class='signInResults'>Please <a href='https://platform.mediamind.com/Eyeblaster.ACM.Web/Login/ZDLogin.aspx?brand_id=12005&locale_id=1&return_to=" + encodeURIComponent(window.location.href) + "'>sign in</a> to view all results.</div>");
                };
                clearInterval(searchResultReady);
            }
        }, 200);

        var chkPowered = setInterval(function() {
            if ($(".inbenta-powered").parent().css("display") == "block") {
                $(".inbenta-powered").parent().hide();
                $(".inbenta-interface .inbenta-rating").css("background-color", "#FFF");
            } else clearInterval(chkPowered);
        }, 10);

        var categoryApiURL = "/api/v2/help_center/" + currentLang + "/categories.json?per_page=100";

        function searchCategories() {
            if (storage.getItem(HelpCenter.user.email + '-allCategories' + helpCenterVer + currentLang) === null) {
                $.get(categoryApiURL).done(function(data) {
                    categoryApiURL = data.next_page;
                    var newArray = $.map(data.categories, function(category, i) {
                        return {
                            "id": category.id,
                            "name": category.name,
                            "url": category.html_url
                        };
                    });
                    categoryArray = $.merge(newArray, categoryArray);
                    if (categoryApiURL !== null) {
                        categoryApiURL += "&per_page=100";
                        searchCategories();
                    } else {
                        storage.setItem(HelpCenter.user.email + '-allCategories' + helpCenterVer + currentLang, JSON.stringify(categoryArray));
                        gotCategories = 1;
                    }
                });
            } else {
                categoryArray = JSON.parse(storage.getItem(HelpCenter.user.email + '-allCategories' + helpCenterVer + currentLang));
                gotCategories = 1;
            }
        }
        searchCategories();
        var sectionApiURL = "/api/v2/help_center/" + currentLang + "/sections.json?per_page=100"

        function searchSections() {
            if (storage.getItem(HelpCenter.user.email + '-allSections' + helpCenterVer + currentLang) === null) {
                $.get(sectionApiURL).done(function(data) {
                    sectionApiURL = data.next_page;
                    var newArray = $.map(data.sections, function(section, i) {
                        return {
                            "id": section.id,
                            "name": section.name,
                            "category": section.category_id,
                            "url": section.html_url
                        };
                    });
                    sectionArray = $.merge(newArray, sectionArray);
                    if (sectionApiURL !== null) {
                        sectionApiURL += "&per_page=100";
                        searchSections();
                    } else {
                        storage.setItem(HelpCenter.user.email + '-allSections' + helpCenterVer + currentLang, JSON.stringify(sectionArray));
                        gotSections = 1;
                    }
                });
            } else {
                sectionArray = JSON.parse(storage.getItem(HelpCenter.user.email + '-allSections' + helpCenterVer + currentLang));
                gotSections = 1;
            }
        }
        searchSections();
        var checkRdy = setInterval(function() {
            if (gotSections && gotCategories) {
                clearInterval(checkRdy);
                searchDone = 0;
                /*
                if ($("#query").val().length > 1) {
                    if ($("#switchTag").val() == "mdx_2_0") $("#query").val("@mdx2 " + $("#query").val());
                    if ($("#switchTag").val() == "mdx_nxt") $("#query").val("@mdxnxt " + $("#query").val());
                    if ($("#switchTag").val() == "support_kb") $("#query").val("@topic @article @issue " + $("#query").val());
                }
                */
                $("#query").val($("#query").val().trim())
                searchQuery = $("#query").val();
                var searchURL;
                if ($("#query").val().trim().replace(/\@[\w-]+\s/ig, "") == "") searchURL = "/api/v2/help_center/articles/search.json?query='" + encodeURIComponent(searchQuery) + "'&locale=" + currentLang + "&per_page=20";
                else searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "&locale=" + currentLang + "&per_page=20";
                $("#query").val($("#query").val().trim().replace(/\@[\w-]+\s/ig, ""));
                searchQuery = searchQuery.replace(/\@[\w-]+\s/ig, "");

                function searchArticles() {
                    $.get(searchURL).done(function(data) {
                        searchURL = data.next_page;
                        var results = $.map(data.results, function(result, i) {
                            return {
                                "title": result.title,
                                "url": result.html_url,
                                "section": result.section_id,
                                "body": result.body,
                                "vote": result.vote_sum
                            };
                        });
                        $.each(results, function(i, result) {
                            var sectionName = sectionArray.filter(function(section) {
                                return section.id == result["section"];
                            })[0]["name"];
                            var sectionURL = sectionArray.filter(function(section) {
                                return section.id == result["section"];
                            })[0]["url"];
                            var categoryID = sectionArray.filter(function(section) {
                                return section.id == result["section"];
                            })[0]["category"];
                            var categoryName = categoryArray.filter(function(category) {
                                return category.id == categoryID;
                            })[0]["name"];
                            var categoryURL = categoryArray.filter(function(category) {
                                return category.id == categoryID;
                            })[0]["url"];
                            var regx = /(<([^>]+)>)/ig;
                            var rawHTML = result["body"];
                            var searchKey = preg_quote(searchQuery);
                            var cleanHTML = "";
                            var regNew = new RegExp(searchKey, "i");
                            tagFreeCategoryName = categoryName.replace(/\@[\w-]+\s/ig, "");
                            if ($.inArray(tagFreeCategoryName, resultCategoryArray) == -1) resultCategoryArray.push(tagFreeCategoryName);
                            if (rawHTML) cleanHTML = rawHTML.replace(regx, "");
                            var resultIndex = cleanHTML.search(regNew);
                            if (resultIndex > 60) cleanHTML = "..." + highlight(cleanHTML.substring(resultIndex - 60, resultIndex + 70), searchKey) + "...";
                            else cleanHTML = highlight(cleanHTML.substring(0, 130), searchKey) + "...";
                            var newHTML = '<a href="' + result["url"] + '" class="search-result-link">' + result["title"] + '</a>';
                            if (parseInt(result["vote"]) >= 1) newHTML += ' <span class="search-result-votes">' + result["vote"] + '</span>';
                            newHTML += '<div class="search-result-meta"><a href="' + categoryURL + '" class="categoryLink">' + categoryName + '</a>';
                            newHTML += ' > ';
                            newHTML += '<a href="' + sectionURL + '">' + sectionName + '</a></div>';
                            newHTML += '<div class="search-result-description">' + cleanHTML + '</div>';
                            var realHTML = $('<li>').html(newHTML);
                            realHTML.addClass("search-result");
                            realHTML.appendTo(".search-results-list-temp");
                        });


                        //INBENTA----comment out below START
                        //populate category filter dropdown based on new result
                        if (!inbenta) {
                            resultCategoryArray.sort();
                            var options = '';
                            for (var i = 0; i < resultCategoryArray.length; i++) {
                                if ($("#categoryFilter option[value='" + resultCategoryArray[i] + "']").length == 0) options += '<option value="' + resultCategoryArray[i] + '">' + resultCategoryArray[i] + '</option>';
                            }
                            $('#categoryFilter').append(options);
                        }
                        //INBENTA----END


                        if (searchURL !== null && gotArticles < (maxResultsAPI / 20 - 1)) {
                            searchURL += "&per_page=20";
                            gotArticles++;
                            cleanWrap();

                            //INBENTA----comment out below START
                            if (!inbenta) checkResultCount();
                            //INBENTA----END


                            searchArticles();
                        } else {
                            $(".loaderSpin").remove();
                            preFilterCount = 0;
                            searchDone = 1;
                            cleanWrap();


                            //INBENTA----comment out below START
                            if (!inbenta) checkResultCount();
                            //INBENTA----END


                        }
                    });
                }
                searchArticles();
            }
        }, 100);
    }


    //INBENTA----comment out below START
    if (!inbenta) {
        var showResult = setInterval(function() {
            if (gotArticles == 5) {
                clearInterval(showResult);
                checkResultCount();
            }
        }, 100);
    }
    //INBENTA----END


    //end of custom search -- JK
    function filterThis(elem) {
        preFilterCount = $(".search-results-list-temp li").size();
        var checked = elem.prop("checked");
        var cType = elem.attr('id');
        if (elem.prop("checked")) {
            $(".search-results-list-temp").find(".search-result-link").each(function() {
                if ($(this).html().indexOf(cType) > -1) {
                    if ($(".search-results-list li").length == 0) $(this).closest("li").show();
                }
                if (cType == "noType" && ($(this).html().indexOf("<span") == -1 || ($(this).html().split("</span>").length <= 2 && ($(this).html().indexOf("kb-title") > -1 || $(this).html().indexOf("mdx2-title") > -1 || $(this).html().indexOf("mdxnxt-title") > -1)))) {
                    //hide if only content tag and no type tag
                    if ($(".search-results-list li").length == 0) $(this).closest("li").show();
                }
                //if category filter is not all category
                if ($("#categoryFilter").val() !== "allCategories" && $(this).parent().html().indexOf($("#categoryFilter").val()) == -1) {
                    $(this).closest("li").hide();
                }
                if ($("#switchTag").val() == "mdx_2_0" && ($(this).parent().html().indexOf('mdxnxt-title') > -1 || $(this).parent().html().indexOf('kb-title') > -1)) {
                    $(this).closest("li").hide();
                    preFilterCount--;
                }
                if ($("#switchTag").val() == "mdx_nxt" && ($(this).parent().html().indexOf('mdx2-title') > -1 || $(this).parent().html().indexOf('kb-title') > -1)) {
                    $(this).closest("li").hide();
                    preFilterCount--;
                }
                if ($("#switchTag").val() == "support_kb" && $(this).parent().html().indexOf('kb-title') == -1) {
                    $(this).closest("li").hide();
                    preFilterCount--;
                }
            });
        } else {
            $(".search-results-list-temp").find(".search-result-link").each(function() {
                if ($(this).html().indexOf(cType) > -1) {
                    $(this).closest("li").hide();
                }
                if (cType == "noType" && ($(this).html().indexOf("<span") == -1 || ($(this).html().split("</span>").length <= 2 && ($(this).html().indexOf("kb-title") > -1 || $(this).html().indexOf("mdx2-title") > -1 || $(this).html().indexOf("mdxnxt-title") > -1)))) {
                    $(this).closest("li").hide();
                }
            });
        }
    }


    //INBENTA----comment out below START
    if (!inbenta) {
        $("#filterContentTypes").find("input").on("change", function() {
            //remove default search  result
            $(".search-results-list").hide();
            $(".search-results-list").empty();
            //show our new result
            $(".search-results-list-temp").show();
            var elem = $(this);
            checkResultCount();
        });
    }
    $("#categoryFilter").on("change", function() {
        //remove default search  result
        $(".search-results-list").hide();
        $(".search-results-list").empty();
        //show our new result
        $(".search-results-list-temp").show();
        var selectVal = $(this).val();
        //select all checkboxes for filter content type
        $("#filterContentTypes").find("input").each(function() {
            $(this).prop('checked', true);
        });
        if ($(this).val() == "allCategories") {
            $(".switchTag").change();
        }
        checkResultCount();
    });
    //INBENTA----END

    //documentation team codes -------------------------------- START
    $('#training_video').click(function(e) {
        e.preventDefault();
        $('#training_video').load(this.href).dialog('open');
    });
    $("a.expandingblocktemplate").unbind('click');
    $("a.jump:first").on("click", function() {
        $("div.expandingblock").slideDown();
    });
    $("a.jump:last").on("click", function() {
        $("div.expandingblock").slideUp();
    });
    $("a.expandingblocktemplate").unbind('click');
    $("a.expandingblocktemplate").on("click", function(e) {
        e.preventDefault();
        if ($(this).parent().next().attr("visible") == "true") {
            $(this).parent().next().slideUp();
            $(this).parent().next().attr("visible", "false");
        } else {
            $(this).parent().next().slideDown();
            $(this).parent().next().attr("visible", "true");
        }
        return false;
    });
    // START collapsing categories
    $(".category-tree section.section").slideUp();
    $("section.category").find("a:first").attr("href", "#");
    $("section.category").find("a:first").attr("coll", "false");
    $("section.category").find("a:first").unbind('click');
    $("section.category").find("a:first").click(function(e) {
        if ($(this).attr("coll") == "false") {
            $(this).parent().parent().find("section.section").slideDown();
            $(this).attr("coll", "true");
            return false;
        } else {
            $(this).parent().parent().find("section.section").slideUp();
            $(this).attr("coll", "false");
            return false;
        }
        return false;
        e.preventDefault();
    });
    // END collapsing categories
    //Preserves the mouse-over on top-level menu elements when hovering over children
    $(".nav li").each(function(i) {
        $(this).hover(function() {
            //$(this).siblings("span").css("background","none");
            $(this).find("span").slice(0, 1).addClass("active");
            $(this).find("a").slice(0, 1).addClass("active");
        }, function() {
            $(this).find("span").slice(0, 1).removeClass("active");
            $(this).find("a").slice(0, 1).removeClass("active");
        });
    });
    // START collapsing content in articles
    $(".expandingblock").slideUp();
    // section click handlers
    $(".expandable").on("click", function() {
        var $this = $(this);
        if ($this.next(".expandingblock").css("display") == "none") {
            $(this).addClass('arrowDown');
            $this.next(".expandingblock").slideDown();
        } else {
            $(this).removeClass('arrowDown');
            $this.next(".expandingblock").slideUp();
        }
        setTimeout(fixedHeaderReset(), 1000);
    });
    // end collapsing content in articles
    $(".expandable-procedure").on("click", function() {
        var $this = $(this);
        if ($this.next(".expandingblock").css("display") == "none") {
            $(this).addClass('arrowDown');
            $this.next(".expandingblock").slideDown();
        } else {
            $(this).removeClass('arrowDown');
            $this.next(".expandingblock").slideUp();
        }
        setTimeout(fixedHeaderReset(), 1000);
    });
    $(".hp-expandingblock").slideUp();
    $(".sub-catblock").slideUp();
    $(".expandable-hp").on("click", function() {
        var $this = $(this);
        if ($this.next(".hp-expandingblock").css("display") == "none") {
            $(this).addClass('arrowDown');
            $this.next(".hp-expandingblock").slideDown();
        } else {
            $(this).removeClass('arrowDown');
            $this.next(".hp-expandingblock").slideUp();
        }
        setTimeout(fixedHeaderReset(), 1000);
    });
    // social share popups
    $(".share a").click(function(e) {
        e.preventDefault();
        window.open(this.href, "", "height = 500, width = 500");
    });
    // toggle the share dropdown in communities
    $(".share-label").on("click", function(e) {
        e.stopPropagation();
        var isSelected = this.getAttribute("aria-selected") == "true";
        this.setAttribute("aria-selected", !isSelected);
        $(".share-label").not(this).attr("aria-selected", "false");
    });
    $(document).on("click", function() {
        $(".share-label").attr("aria-selected", "false");
    });
    // show form controls when the textarea receives focus
    $(".answer-body textarea").one("focus", function() {
        $(".answer-form-controls").show();
    });
    $(".comment-container textarea").one("focus", function() {
        $(".comment-form-controls").show();
    });
    $("a.submit-a-request").text("Contact Support");
    $('.fancybox').fancybox();
    $('.fancybox-media').fancybox({
        openEffect: 'none',
        closeEffect: 'none',
        helpers: {
            media: {}
        }
    });
    //documentation team codes -------------------------------- END
    //setup scrolling table of contents -- JK
    if ($(".article-body").length) {
        if ($(".article-header").text().toLowerCase().indexOf("glossary") > -1 || ($("#switchTag").val() == "support_kb")) {
            $(".quickNavMenu").tocify({
                context: ".article-body",
                selectors: "h2,h3"
            });
        } else {
            $(".quickNavMenu").tocify({
                context: ".article-body",
                selectors: "h2"
            });
        }
    }
    $("main").show();

    //script to make table header row stick during scroll
    function fixedHeaderReset() {
        //added for new zendesk top toolbar hovering over fixed header
        if ($("zd-hc-navbar").css("margin-top") < 0) $("div.stickyHeader").css("top", "0px");
        else $("div.stickyHeader").css("top", "45px");

        var tables = $('table.stickyHeader');
        tables.each(function(i) {
            var table = tables[i];
            var tableClone = $(table).clone(true).empty().removeClass('stickyHeader');
            var theadClone = $(table).find('thead').clone(true);
            var stickyHeader = $('<div></div>').addClass('stickyHeader hide').attr('aria-hidden', 'true');
            stickyHeader.append(tableClone).find('table').append(theadClone);
            $(table).after(stickyHeader);
            var tableHeight = $(table).height();
            var tableWidth = $(table).width() + Number($(table).css('padding-left').replace(/px/ig, "")) + Number($(table).css('padding-right').replace(/px/ig, "")) + Number($(table).css('border-left-width').replace(/px/ig, "")) + Number($(table).css('border-right-width').replace(/px/ig, ""));
            var headerCells = $(table).find('thead th');
            var headerCellHeight = $(headerCells[0]).height();
            var no_fixed_support = false;
            if (stickyHeader.css('position') == "absolute") {
                no_fixed_support = true;
            }
            var stickyHeaderCells = stickyHeader.find('th');
            stickyHeader.css('width', tableWidth);
            var cellWidths = [];
            for (var i = 0, l = headerCells.length; i < l; i++) {
                cellWidths[i] = $(headerCells[i]).outerWidth();
            }
            for (var i = 0, l = headerCells.length; i < l; i++) {
                $(stickyHeaderCells[i]).css('width', cellWidths[i]);
            }
            var cutoffTop = $(table).offset().top;
            var cutoffBottom = tableHeight + cutoffTop - headerCellHeight;
            $(window).scroll(function() {
                var currentPosition = $(window).scrollTop();
                if (currentPosition > cutoffTop && currentPosition < cutoffBottom) {
                    stickyHeader.removeClass('hide');
                    if (no_fixed_support) {
                        stickyHeader.css('top', currentPosition + 'px');
                    }
                } else {
                    stickyHeader.addClass('hide');
                }
            });
        });
    }
    //setTimeout(fixedHeaderReset(), 2000);
    setInterval(function() {
        fixedHeaderReset();
    }, 500);

    //search enhancement suggestion from Tamir -- JK
    $("form[role='search']").submit(function(ev) {
        ev.preventDefault();
        var originQuery = $("#query").val();
        /*
        $("#query").attr('style', 'color:#FFFFFF !important');
        if ($("#query").val().length > 1) {
            if ($("#switchTag").val() == "mdx_2_0") $("#query").val("@mdx2 " + $("#query").val());
            if ($("#switchTag").val() == "mdx_nxt") $("#query").val("@mdxnxt " + $("#query").val());
            if ($("#switchTag").val() == "support_kb") $("#query").val("@topic @article @issue " + $("#query").val());
        }
        */
        this.submit();
        /*
        setTimeout(function() {
            $("#query").attr('style', 'color:#000000 !important');
            $('#query').val(originQuery);
        }, 1);
        */
    });
    if ($('#query').length > 0) $("#query").val($("#query").val().trim().replace(/\@[\w-]+\s/ig, ""));

    //highlight last left node per Deb's request -- JK
    try {
        $(".steps > ul").children("li").each(function() {
            var splitPath = $(this).html().split("&gt;");
            splitPath[splitPath.length - 1] = "<span style='color:#faf000'>" + splitPath[splitPath.length - 1] + "</span>";
            $(this).html(splitPath.join("&gt;"));
        })
    } catch (e) {}
    try {
        $(".steps-StrikeAd > ul").children("li").each(function() {
            var splitPathStrikeAd = $(this).html().split("&gt;");
            splitPathStrikeAd[splitPathStrikeAd.length - 1] = "<span style='color:#FAF000'>" + splitPathStrikeAd[splitPathStrikeAd.length - 1] + "</span>";
            $(this).html(splitPathStrikeAd.join("&gt;"));
        })
    } catch (e) {}

    //
    // HC contribution
    //
    function removePageElems(appViewer) {
        if (appViewer) {
            $('.article-body').hide().parentsUntil('body').andSelf().siblings().hide();
            $(".main-column").css("margin", "0px");
            $(".article-body").css("padding", "0px");
            $(".article-wrapper").css("margin", "0px");
            $(".article-wrapper").css("padding-left", "10px");
        } else {
            $('.article-body').show().parentsUntil('body').andSelf().siblings().hide();
        }

        $('h2').css('padding', '0px');
        $('h2').css('margin-top', '0px');
        $('h2').css('border-bottom', 'none');
        $(".article-sidebar").remove();
        $('.wrapper').css('min-height', 'initial');
        $('main').css('min-height', 'initial');
        $("html").css('height', 'auto');
        $("html").css("display", "block");
    }

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


    /*** Publisher Certification Form from Smartsheet
         Added By: Adina Shabi
         April 4, 2016
    ***/
    $(".pubCertUploadSpec").hide();
    /**$("#ctlForm input[type=checkbox]").click(function() {
        if ($(this).attr("data-type") == "Instream") {
            $(".pubCertUploadSpec").show();
        }
    });**/

    $("#ctlForm").submit(function(ef) {
        ef.preventDefault();
        $.ajax({
            url: $(this).attr('action'),
            type: 'POST', // form submit method get/post
            dataType: 'html', // request type html/json/xml
            data: $(this).serialize(), // serialize form data 
            error: function(jqXHR, textStatus, errorMessage) {
                $(".pubCertForm").css("display", "none");
                $(".pubCertInfo").css("display", "block");
            },
            success: function(data) {
                $(".pubCertForm").css("display", "none");
                $(".pubCertInfo").css("display", "block");
            }
        });
    });

    if (HelpCenter.user.email !== null)
        if (currentUser == "manager") $(".language-selector").show();

        /*  function updateAccordion() {
             if (currentUser !== "anonymous") {
                 if (HelpCenter.user.locale == "ja") {
                     $(".logo span").text("ヘルプセンター");
                     $(".accordion #one > a").html("使い始める<span></span");
                     $(".accordion #two > a").html("設定<span></span");
                     $(".accordion #three > a").html("クリエイティブ<span></span");
                     $(".accordion #four > a").html("データ<span></span");
                     $(".accordion #five > a").html("出版社<span></span");
                     $("#releaseLink img").attr("src", "/hc/theme_assets/539845/200023575/release-link-new_ja.png");
                     $("#suggestionLink img").attr("src", "/hc/theme_assets/539845/200023575/ideas-link-new_ja.png?v2");
                     $("#sizmekCert img").attr("src", "/hc/theme_assets/539845/200023575/sizmek-certified-link-newer_ja.png?v2");
                     $("#sizmekCert-MDXNXT img").attr("src", "/hc/theme_assets/539845/200023575/sizmek-certified-link-newer_ja.png?v2");
                     $("#recordedWebinars img").attr("src", "/hc/theme_assets/539845/200023575/recorded-webinars2_ja.png");
                 } else {
                     $(".logo span").text("Help Center");
                     $(".accordion #one > a").html("GETTING STARTED<span></span");

                     if ($("#switchTag").val() == "mdx_2_0") $(".accordion #two > a").html("AD DELIVERY<span></span");
                     else $(".accordion #two > a").html("CAMPAIGN MANAGEMENT<span></span");

                     $(".accordion #three > a").html("CREATIVE<span></span");
                     $(".accordion #four > a").html("DATA<span></span");
                     $(".accordion #five > a").html("PUBLISHERS<span></span");
                     $("#releaseLink img").attr("src", "/hc/theme_assets/539845/200023575/release-link-new.png");
                     $("#suggestionLink img").attr("src", "/hc/theme_assets/539845/200023575/ideas-link-new.png");
                     $("#sizmekCert img").attr("src", "/hc/theme_assets/539845/200023575/sizmek-certified-link-newer.png");
                     $("#recordedWebinars img").attr("src", "/hc/theme_assets/539845/200023575/recorded-webinars2.png");
                 }
             }
         }
         updateAccordion(); */

    hljs.initHighlightingOnLoad();

    var thisVideo;
    var aURL = window.location.href;
    //var aID = window.location.href.split("/articles/")[1].split("--")[0];

    if ($("video").length > 0) {

        $("video").each(function() {
            thisVideo = this;
        })

        thisVideo.addEventListener("play", trackEventGA("play"), false);
        thisVideo.addEventListener("pause", trackEventGA("pause"), false);
        thisVideo.addEventListener("ended", trackEventGA("end"), false);
    }

    function trackEventGA(ev) {
        ga('send', 'event', 'Videos', ev, aURL);
    }


    //Remove comments for non end-users
    if (currentUser == "agent") {
        if ($('#comment_form').length > 0) {
            if ($(".sub-nav-inner ol.breadcrumbs").find("li[title*='Message Board']").length > 0) {} else {
                $("#comment_form").hide();
            }
        }
    }


    //Request New Article On Section Pages
    try {
        if (isSectionPage) {

            if ($('.subscriptionContainer').length > 0 && $('span .section-subscribe').length > 0) {

                //error message
                function showError(msg) {
                    $(".errorMessage").text(msg);
                    $(".errorMessage").fadeIn();
                    setTimeout(function() {
                        $(".errorMessage").fadeOut(500);
                    }, 4000);
                }

                //Modal for article request on sections
                $('<div id="requestArticle" class="internal_only modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG requestLoader"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">x</button><h1 id="requestArticleLabel" class="modal-title">Request a New Article</h1></div><div class="modal-body"><p>What would you like to see in the new article?</p><p><textarea id="requestArticleDetail" rows="4" cols="50"></textarea></p></div><div class="modal-footer"><span class="errorMessage"></span><button id="confirmRequestBtn" class="btn btn-primary" name="CONTINUE" type="button">REQUEST ARTICLE</button><button id="cancelRequestBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div>').insertAfter('.subscriptionContainer');
                $("span .section-subscribe").prepend('<button class="request-article" role="button" data-toggle="modal" data-target="#requestArticle" data-backdrop="static" data-keyboard="false">Request Article</button>');

                //fix button positioning
                $('.request-article').css('margin-top', '1px');

                var currSectionId = window.location.href.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];
                var sectionURL = window.location.href.split("--")[0];
                //section page request button process
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
                                $.getJSON("/api/v2/help_center/sections/" + currSectionId + ".json", function(sectionData) {
                                    var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + helpCenterVer;
                                    var ticketJSON = {
                                        "ticket": {
                                            "subject": "New article request has been received",
                                            "comment": "New article has been requested after viewing the following section:\n\n[" + cleanTextOnly(sectionData.section.name) + "](" + sectionURL + ")\n\nRequest detail:\n\n" + descriptionText,
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
                                                "value": currSectionId
                                            }, {
                                                "id": 24340826,
                                                "value": sectionURL
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
                                        $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                            var showIP = data.ip;
                                            $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
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
            }
        }
    } catch (e) {}

    if (window.location.href.indexOf("/sections/") > -1) {
        $('ul.article-list').addClass('sectionfix');
    }

    if (window.location.href.indexOf("/requests") > -1) {
        $('main').css('display', 'none');
        window.location = "https://strikead.sizmek.com/hc/en-us";
    }
    if (window.location.href.indexOf("/sections/") > -1) {
        if ($('.article-list > li').find('span.sub-title')) {
            $('.article-list > li').has('span.sub-title').addClass('treeline');
            $('.article-list > li').find('a').has('span.sub-title').css('margin-left', '50px');
        }
    }
});