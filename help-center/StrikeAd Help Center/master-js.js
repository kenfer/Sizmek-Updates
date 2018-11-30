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
                    cleanWrap();
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

    if (window.location.href.indexOf("/sections/") > -1) {
        $('ul.article-list').addClass('sectionfix');
    }
/*
    if (window.location.href.indexOf("/requests") > -1) {
        $('main').css('display', 'none');
        window.location = "https://strikead.sizmek.com/hc/en-us";
    }*/
    if (window.location.href.indexOf("/sections/") > -1) {
        if ($('.article-list > li').find('span.sub-title')) {
            $('.article-list > li').has('span.sub-title').addClass('treeline');
            $('.article-list > li').find('a').has('span.sub-title').css('margin-left', '50px');
        }
    }
  
   if (window.location.href.indexOf("/requests/") > -1) {
        $(".request-breadcrumbs a").css("color", "blue");
     		$(".request-breadcrumbs a:visited").css("color", "blue");
    		$(".request-container").css("margin-top", "3%");
    		$(".request-title").css("margin-top", "4%");
    		$(".comment-wrapper").prepend('<img src="//p4.zdassets.com/hc/theme_assets/539845/115000001503/guest.png" style="width:75px;height:75px;">');
    		$(".comment-info").css("float", "right");
    		$(".comment-info").css("margin-right", "79%");
    		$("main").css("margin-right", "210px");
    		$(".request-sidebar").css("width", "200px");
    		$(".request-sidebar").css("position", "relative");
    		$(".request-sidebar").css("left", "1000px");
    		$(".request-sidebar").css("bottom", "75px");
     		$(".request-container").css("position", "relative");
     		$(".request-container").css("bottom", "515px");
     		
    }
  
  if (window.location.href.indexOf("/requests/new") > -1) {
     		$("main").css("margin-right", "0");
    }
  
});