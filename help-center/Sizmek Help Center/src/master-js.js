//storage declarations
var storage = window["localStorage"];
var sessionStorage = window["sessionStorage"];

//help center cache version number
var helpCenterVer;

//default language
var currentLang = "en-us";

//current page URL
var currPageURL = window.location.href;

//unknown??
var cookieFilter = false;


//tags that are specifically reserved for product docs
var hcTags = ["overview", "howto", "video", "faq", "troubleshooting", "reference", "onboarding", "sizmekcertified"];

//tags that are specifically reserved for support KB docs
var kbTags = ["topic", "article", "issue"];

//uffa var phpURL = "https://uffa.sizmek.com/uffa/ProxyAPI.php?";

//scroll to top functionality in TOC
function scrollUp() {

    $("html, body").animate({
        scrollTop: 0
    }, '500');

    $("#backToTop").animate({
        opacity: 0,
        height: "0px"
    }, 100);
}

$(function() {
    //load menu site-map article - we should move HC version label to this article for single request
    $.get('/api/v2/help_center/en-us/articles/' + siteMap).done(function(data) {
        var menuObject = JSON.parse(data.article.body);


        //check string exist in current URL
        function isInURL(str) {
            if (currPageURL.indexOf(str) > -1) return true;
            else return false;
        }

        //load current helpcenter cache version number
        $.getJSON("/api/v2/help_center/" + currentLang + "/articles/" + unSupportedBrowser).done(function(gate) {
            if (document.all && !document.addEventListener) {

                //show unsupported browser message for IE 8 or older versions
                if (window.location.href.indexOf(unSupportedBrowser) == -1) window.location.replace("/hc/" + currentLang + "/articles/" + unSupportedBrowser);
                else {
                    $(".user-nav, .sub-nav, .search, .in-this-articles, .article-subscribe, .notification, .article-footer, .submit-a-request, .article-comments, .breadcrumbs, .hamburger").hide();
                    $("body").css("font-family", "arial");
                    $("main").show();
                    $("html").show();
                    return false
                }
            } else {
                //load highlight pack and select

                //load UFFA & ck editor scripts if article or section page
                //load papaparse for back up tool page
                //load TOC script if article page
                //load message board JS for message board section or articles\
            }


            var lbl = gate.article.label_names;

            if (lbl.length > 0)
                for (x = 0; x < lbl.length; x++)
                    if (lbl[x].toLowerCase().indexOf("hcversion") > -1) {
                        helpCenterVer = lbl[x];
                    }


            //if first load for this cache version, clear all storages to avoid size exceed
            if (storage.getItem(HelpCenter.user.email + helpCenterVer + currentLang) === null) {
                storage.clear();
                sessionStorage.clear();
            }

            //flag current cache version as visited
            storage.setItem(HelpCenter.user.email + helpCenterVer + currentLang, 1);

            //return URL parameters
            var getUrlParameter = function getUrlParameter(sParam) {
                var sPageURL = decodeURIComponent(window.location.search.substring(1)),
                    sURLVariables = sPageURL.split('&'),
                    sParameterName,
                    i;

                for (i = 0; i < sURLVariables.length; i++) {
                    sParameterName = sURLVariables[i].split('=');

                    if (sParameterName[0] === sParam) {
                        return sParameterName[1] === undefined ? true : sParameterName[1];
                    }
                }
            };

            //handle platform redirects based on URL
            if (isInURL(".com/dsp")) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=dsp";
            else if (isInURL(".com/newdsp")) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=newdsp";
            else if (isInURL(".com/dmp")) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=dmp";
            else if (isInURL(".com/mdx2.0")) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=mdx_2_0";
            else if (isInURL(".com/showall")) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=showall";
            else if (isInURL(".com/mdxnxt")) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=mdx_nxt";
            else if (isInURL(".com/supportkb")) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=support_kb";
            else if (isInURL(".com/status")) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "/categories/201680143";

            //unknown??
            if (isInURL("/error_preview")) {
                hideSideNav();
                setTimeout(function() {
                    storage.setItem("treesettings", "1"), window.location.href = "/hc/" + currentLang;
                }, 3E3)
            }

            //unknown??
            debugFlag = storage.getItem("debug") ? false : true;

            //init vars
            var helpCenterMaintenance = false;
            var treesettings = HelpCenter.user.email + "-TreeSettings";
            var navSectionAPI = "/api/v2/help_center/" + currentLang + "/sections.json?per_page=100&sort_by=created_at&sort_order=asc";
            var firstParentRun, navcatid, fullcatid, navsectionid, getnavSectionName, getnavSectionId, loadedCategoryID, sectionApiURL, currSectionId, treelist, appView;
            var NavCatArrayready = 0;
            var NavArtArrayready = 0;
            var navsecArray = [];
            //redundant??
            //var onpageLoad = 1;
            var currentUser = HelpCenter.user.role;
            var userEmail = HelpCenter.user.email;
            var usersName = HelpCenter.user.name;
            var isSectionPage = isInURL("/sections/");
            var isSupportKb = false;
            var isDmp = false;
            var categoryClass = '';
            var artTags;

            //default theme style
            $("body").addClass("mdxcss");

            //relocate breadcrumbs inside blue header line
            $(".breadcrumbs").detach().appendTo(".header-breadcrumbs");

            //if platform specified, set to platform cookie and load platform view
            if (getUrlParameter("platform") !== null && getUrlParameter("platform") !== undefined) storage.setItem("global-filterSetting", getUrlParameter("platform"));

            //set GA dimensions
            ga("set", "dimension1", currentUser);
            ga("set", "dimension2", userEmail);
            ga("set", "dimension3", usersName);

            //redirect to home for any of below pages
            //help center admin category 200768493
            //important messages section 201341126
            //help center maintenance article 205990016
            //url with #notice anchor
            //unuless current user is agent or manager
            if (currentUser !== "manager" && currentUser !== "agent" && (currPageURL.match(/(\/200768493|\/201341126)/) || (currPageURL.match(/(\/205990016|\/206321873)/) || currPageURL.indexOf(unSupportedBrowser) > -1 && !isInURL("#notice")))) {
                window.location.replace("/hc/" + currentLang + "/");
            } else if ((!isInURL("/articles/") || !isInURL("209729503") || !isInURL("type=Files")) && self == top) {
                //otherwise display the document
                $("html").css("display", "block");
                $("main").css("display", "block");
            }

            //hide all content except maintenamce message during maintenance unless manager
            if (helpCenterMaintenance && currentUser !== "manager")
                if (!isInURL("205990016")) window.location.replace("/hc/" + currentLang + "/articles/205990016#notice");
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
                    return false
                }

            //possible redundant codes??
            //$(".notification-ipm").hide();
            //$("main").css("min-height", "600px");

            //uffa var submitCheck = false;

            //search related vars
            var maxResultsAPI = 100,
                preFilterCount = 0,
                searchResultCount = 0,
                searchResultTotal = 0,
                searchComplete = 0,
                searchDone = 0,
                searchQuery;

            //known reserved content type tags
            var contentTypes = [
                ["@section", "section-title", "SECTION"],
                ["@topic", "topic-title", "TOPIC"],
                ["@article", "article-title", "ARTICLE"],
                ["@issue", "issue-title", "ISSUE"],
                ["@sub", "sub-title", "SUBPAGE"],
                ["@overview", "overview-title", "OVERVIEW"],
                ["@howto", "howto-title", "HOW TO"],
                ["@sizmekcertified", "sizmekcertified-title", "SIZMEK CERTIFIED"],
                ["@onboarding", "onboarding-title", "CLIENT ONBOARDING"],
                ["@faq", "faq-title", "FAQ"],
                ["@tips", "tips-title", "TIPS & TRICKS"],
                ["@troubleshooting", "troubleshooting-title", "TROUBLESHOOTING"],
                ["@reference", "reference-title", "REFERENCE"],
                ["@glossary", "glossary-title", "GLOSSARY"],
                ["@video", "video-title", "VIDEO"],
                ["@new", "new-title", "WHATS NEW"],
                ["@supportkb", "kb-title", "SUPPORT KB"],
                ["@mdx2", "mdx2-title", "MDX 2.0"],
                ["@mdxnxt", "mdxnxt-title", "SAS"],
                ["@hc-admin", "hc-admin-title", "HC ADMIN"]
            ];

            //list of support KB category IDs, used to limit search
            var kbCategories = "200404775,115001253423,115001244206,115001244186,115001253403,115001244166,115001253383,115001253363,115001244146,115001244126,115001244106,115001253343,115001253323,115001244086,115001244066";

            //table of content scroll top button
            var scrtop = (isInURL("/articles/")) ? $(".article-updated").offset().top : 0;

            //adjust TOC position upon scroll
            $(window).on("scroll", function(event) {

                var useFixedSidebar = $(document).scrollTop() > scrtop;

                $(".tocify").toggleClass("fixedSidebar", useFixedSidebar);

                if (useFixedSidebar == true) {

                    ($("zd-hc-navbar").css("margin-top") == "0px") ? $(".fixedSidebar").css('top', '130px'): $(".fixedSidebar").css('top', '82px');

                    $(".quickNavMenu").css("max-height", window.innerHeight - 110 + "px");

                    if ($("#backToTop").css("opacity") == 0) $("#backToTop").animate({
                        opacity: 1,
                        height: "46px"
                    }, 100)

                } else {

                    $(".quickNavMenu").css("max-height", window.innerHeight - 340 + "px");

                    $("#backToTop").animate({
                        opacity: 0,
                        height: "0px"
                    }, 100)
                }

                //resize side bar nav depending on top ZD top bar visibility
                $("#sideNavigation").css("height", "calc(100% - " + (84 + parseInt($("zd-hc-navbar").css("margin-top"))) + "px)");

                //adjust table fixed header position if ZD top bar visible
                (parseInt($("zd-hc-navbar").css("margin-top"), 10) < 0) ? $("table.stickyHeader").css("top", "16px"): $("table.stickyHeader").css("top", "64px");

            });

            //hide table of content if it overlap article contents
            $(window).on("resize", function() {

                var $articleRect = $('.article-body');
                var $tocRect = $('.tocify');

                $("#sidefoot").css("width", $("#sideNavigation").width() + 2 + "px");
                $(".quickNavMenu").css("max-height", window.innerHeight - 110 + "px");

                if (isInURL("/articles/") && $tocRect.length) {

                    var articleBox = $articleRect[0],
                        articleRect = articleBox.getBoundingClientRect(),
                        tocBox = $tocRect[0];
                    //var tocBox.style.setProperty('display', 'block');

                    tocRect = tocBox.getBoundingClientRect();

                    var isOverlap = !(articleRect.right < tocRect.left ||
                        articleRect.left > tocRect.right ||
                        articleRect.bottom < tocRect.top ||
                        articleRect.top > tocRect.bottom)

                    isOverlap && tocBox.style.setProperty('display', 'none')
                }
            });

            /* fix continous DOM modification of article-body element
            setInterval(function() {

                //resize side bar nav depending on top ZD top bar visibility
                $("#sideNavigation").css("height", "calc(100% - " + (84 + parseInt($("zd-hc-navbar").css("margin-top"))) + "px)");

                //adjust table fixed header position if ZD top bar visible
                (parseInt($("zd-hc-navbar").css("margin-top"), 10) < 0) ? $("table.stickyHeader").css("top", "16px"): $("table.stickyHeader").css("top", "64px");

                $(window).scroll();

            }, 100);
            */
            $(window).scroll();

            //if comment is disabled, hide all comments
            if ($(".comment-form").length == 0) $(".article-comments").hide();

            //if only one h2 element, hide table of content and set content width full
            if ($(".article-body h2").length < 2) $(".in-this-articles").hide(), $(".main-column").css("width", "97%");

            //possible redundant codes??
            //$("#contactLink").hide();
            //$("#statusLink").hide();

            //possible redundant codes??
            //if (currentUser !== "manager") $("#adminHC").remove();

            if (currentUser == "end_user" || currentUser == "anonymous") {
                $("#internal_only, #internal_only.note, .internal_only").remove();
                $('#nav-list .addtlResources > ul > li').eq(3).remove();

                //possible redundant codes??
                //$("#accountLink").hide();
                //$("#contactLink").show();

            }


            /* Updated to community portal
            else {

                //adjust idea portal link for internal users
                $("#suggestionLink").attr("href", "https://sizmekmdxinternal.ideas.aha.io/portal_session/new");

                //below does not work, need to call it when menu populated??
                $("#sideSuggestionLink").find("a").attr("href", "https://sizmekmdxinternal.ideas.aha.io/portal_session/new");
            } */


            //for anonymouse user, hide additional resources link, show sign-in for more message
            if (currentUser == "anonymous") {

                //login link, should this be MDX or SAS?? and should we set it to return to current page??
                var loginURL = "https://platform.mediamind.com/Eyeblaster.ACM.Web/Login/ZDLogin.aspx?brand_id=12005&locale_id=1&return_to=https%3A%2F%2Fsupport.sizmek.com%2Fhc%2F" + currentLang + "%2F";

                //remove additional resources menu
                $('#nav-list .addtlResources').remove();

                //possible redundant codes??
                //$(".tabGettingStarted .sub-menu").append('<li><a href="' + loginURL + '" style="color:#000 !important">Please <strong class="loginC">sign in</strong> to view more articles</a></li>');
                //$(".tabCampaignManagement .sub-menu").append('<li><a href="' + loginURL + '" style="color:#000 !important">Please <strong class="loginC">sign in</strong> to view more articles</a></li>')
            }

            //search input field default text
            $("#query").attr("placeholder", "Enter a question, keyword or topic...");


            //possible redundant codes??
            //if (inInURL("/community/")) $(".sub-nav").wrapInner("<div class='sub-nav-inner'></div>");


            //clean the breadcrumb tags, possible redundant codes??
            /*
            $(".breadcrumbs").find("li").each(function() {
                var exHTML = $(this).html();
                $(this).html(exHTML.trim().replace(/@[\w-\(|\)]+\s/ig, ""))
            });
            $("head").find("title").each(function() {
                var exHTML =
                    $(this).html();
                $(this).html(exHTML.trim().replace(/@[\w-\(|\)]+\s/ig, ""))
            });
            $(".page-header").find("h1").each(function() {
                var exHTML = $(this).html();
                $(this).html(exHTML.trim().replace(/@[\w-\(|\)]+\s/ig, ""))
            });
            $(".article-header").find("h1").each(function() {
                cleanThis($(this))
            });

            //clean solution suggestion title
            if (isInURL("/hc/" + currentLang + "/requests/new") > -1) {
                var cleanSuggestions = setInterval(function() {
                    $(".searchbox-suggestions").find("a").each(function() {
                        cleanThis($(this))
                    })
                }, 100);
            }

            if ($(".notification-text").length) cleanThis($(".notification-text"));

            $(".breadcrumbs").find("li").each(function() {
                this.title = cleanTextOnly(this.title)
            });
            */

            //handle sub article hierarchy padding and remove content tags from title
            function cleanWrap() {
                $(".wrapper").find("a").each(function() {
                    if ($(".hero-unit").length == 0 && (/@sub/i.test($(this).html()) || /sub-title/i.test($(this).html()) || /@issue/i.test($(this).html()) || /issue-title/i.test($(this).html()))) {
                        if (isSectionPage || (isInURL("/categories/") && !isInURL("115001253343"))) {
                            if ($(this).parent("li").hasClass("treelist"));
                            else $(this).css("margin-left", "40px");
                            if ($("#switchTag").val() !== "support_kb") $(this).css("margin-left", "50px");
                        }
                        cleanThis($(this))
                    }
                })
            }

            //
            function cleanThis(elem) {
                for (var indx = 0; indx < contentTypes.length; ++indx) {
                    var reg = new RegExp(contentTypes[indx][0] + " ", "ig");
                    elem.html(elem.html().replace(reg, "<span class='" + contentTypes[indx][1] + "'>" + contentTypes[indx][2] + "</span>"))
                }
                //possible redundant codes??
                //var newHTML = "";
                //if (elem.html().match("/|@getting-started|@ad-delivery|@data|@creative|@publishers|@certified|@your-resources|/ig")) elem.html(elem.html().trim().replace(/@[\w-\(|\)]+\s/ig, ""))
            }

            function cleanThisInnerHTML(elem) {
                for (var indx = 0; indx < contentTypes.length; ++indx) {
                    var reg = new RegExp(contentTypes[indx][0] + " ", "ig");
                    elem.innerHTML = elem.innerHTML.replace(reg, "<span class='" + contentTypes[indx][1] + "'>" + contentTypes[indx][2] + "</span>")
                }
                //possible redundant codes??
                //var newHTML = "";
                //if (elem.innerHTML.match("/|@getting-started|@ad-delivery|@data|@creative|@publishers|@certified|@your-resources|/ig")) elem.innerHTML = elem.innerHTML.trim().replace(/@[\w-\(|\)]+\s/ig, "")
            }

            //add support kb and show all menu for support users and managers
            if ($.inArray("support_kb", HelpCenter.user.tags) > -1 || $.inArray("view_support_content", HelpCenter.user.tags) > -1 || currentUser == "manager") {
                $("#switchTag").append($("<option>", {
                    value: "showall",
                    text: "SHOW ALL"
                }));
                $("#switchTag").append($("<option>", {
                    value: "support_kb",
                    text: "SUPPORT KB"
                }))
            }

            //platform selector handlers
            $("body").on("focusout", ".k-select", function() {
                $(this).find("ul").slideUp("fast"), $(this).removeAttr('style');
            });

            $('body').on("click", ".k-select > ul > li", function() {
                var selected = $(this).clone().children("span").remove().end().html(),
                    value = $(this).find("span").text();
                $(this).parent('ul').find('li').show(), $(this).hide();
                $(this).parent().parent().find("span").first().html(selected);
                if ($(this).parent().parent().next("#switchTag").length == 1) {
                    storage.setItem("manualPlatTrigger", 1);
                }
                $(this).parent().parent().next("select.k-selected").val(value).trigger("change");
            });

            $('body').on("click", ".k-select", function() {
                if ($(this).find("ul").is(":visible")) {
                    $(this).find("ul").slideUp("fast"), $(this).removeAttr('style');
                } else {
                    $('.k-select ul').slideUp("fast"), $(this).find("ul").slideDown("fast"), $(this).css('border-radius', '3px 3px 0 0');
                    if ($(this).next("select").is(".plat-status,.select-template-dropdown,.update-template-dropdown,.plat-segment"))
                        $(this).css('background-image', 'url(//theme.zdassets.com/theme_assets/539845/03dd478487f9953b3e1b7f33423c5beef050c8f3.png)');
                    else
                        $(this).css('background-image', 'url(//theme.zdassets.com/theme_assets/539845/8945cb0bea0bf2bb8175cabd4019a3ef7bade132.png)');
                }
            });

            //hides all menu items
            function hideSidenavElem() {
                $("#nav-list > li.dsp").hide();
                $("#nav-list > li.newdsp").hide();
                $("#nav-list > li.dmp").hide();
                $("#nav-list > li.mdx").hide();
                $("#nav-list > li.mdx2").hide();
                $("#nav-list > li.supportkb").hide();
                $("#nav-list > li.addtlResources").hide();
                $("#nav-list > .platformTitle").hide();
            }

            hideSidenavElem();

            //add aqua line above main
            $("main").prepend('<div class="nav-border"></div>');

            //possible redundant codes??
            //$("#filterContent").fadeIn();

            //handle platform dropdown change event
            $(".switchTag").on("change", function() {

                cleanWrap();

                var toggleCSS = true;

                //if platform changed in search result page, re-search using new platform
                if (isInURL("/search?") && $(".search-results-list-temp li").length !== 0 && $(".search-results-list li").length == 0 && $("#query").val() !== "") {
                    storage.setItem("global-filterSetting", $(".switchTag").val());
                    $("form[role='search']").submit();
                    return
                }

                //handle selected platform value
                $("#switchTag option:selected").each(function() {

                    //previous platform value
                    var prevPlat = storage.getItem("global-filterSetting");

                    //possible redundant codes??
                    //var docRef = document.referrer.toLowerCase();

                    if ($(this).val() == "api") {

                        //open API portal in new window for API platform
                        window.open("https://developers.sizmek.com/hc/" + currentLang, "_blank");

                        //reset platform dropdown to previous value instead of API portal
                        updateKSelect(prevPlat), $("#switchTag").val(prevPlat);

                    } else if (storage.getItem("manualPlatTrigger") !== null && storage.getItem("manualPlatTrigger") == 1) {

                        //if platform change initiated by user manually
                        toggleCSS = false;

                        //set selected platform val to storage
                        storage.removeItem("manualPlatTrigger"), storage.setItem("global-filterSetting", $(this).attr("value"));

                        //if not search page, redirect to the newly selected platform homepage
                        if (!cookieFilter && !isInURL("/search?")) window.location = "/hc/";

                        //if search result page, reload current page
                        else if (isInURL("/search?")) location.reload();

                        //cookie filter is always false... redundant var?
                        else cookieFilter = false;

                    } else if (isInURL("/articles/")) {
                        //possible redundant codes??
                        //var artPlatform = "";

                        //get current article ID from the URL
                        var currArticleId = currPageURL.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];

                        //load the current article data from API
                        $.get("/api/v2/help_center/" + currentLang + "/articles/" + currArticleId + ".json").done(function(res) {

                            //store article labels
                            artTags = res.article.label_names;
                            currSectionID = res.article.section_id;
                            $.get("/api/v2/help_center/" + currentLang + "/sections/" + currSectionID + ".json").done(function(resData) {
                                getNavCatId = resData.section.category_id;
                                addSectionToList(currSectionID);
                            })
                            //check platform value in storage and switch platform to designated platform of the article
                            switchPlatform(artTags, prevPlat);

                        }).fail(function() {

                            //if article API fail to load, stay as platform in the storage
                            switchPlatform("", prevPlat);

                        });

                    } else if (isInURL("/categories/")) {

                        //possible redundant codes??
                        //var catPlatform = "";

                        //for category page view, store current category ID
                        var catID = currPageURL.split("categories/")[1].split("#")[0].split("-")[0].split("?")[0];
                        getNavCatId = catID;
                        addSectionToList();
                        //load the current category data from API
                        $.get("/api/v2/help_center/" + currentLang + "/categories/" + catID + ".json").done(function(res) {

                            //get category description to retrieve platform value
                            var catTags = res.category.description;

                            //don't we need to parse it??
                            switchPlatformCat(catTags, prevPlat);
                        });

                    } else if (isInURL("/sections/")) {

                        //get current section ID from the URL
                        var sectID = currPageURL.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];

                        //load the current section data from API
                        $.get("/api/v2/help_center/" + currentLang + "/sections/" + sectID + ".json").done(function(res) {

                            //get section description to retrieve platform value
                            var secTags = res.section.description;
                            getNavCatId = res.section.category_id;
                            addSectionToList(res.section.id);
                            //don't we need to parse it??
                            switchPlatformCat(secTags, prevPlat);
                        });

                    } else if (prevPlat === null) {

                        //if no platform value in storage, default to user platform from user tags
                        if ($.inArray("mdx_nxt", HelpCenter.user.tags) > -1) $(".switchTag").val("mdx_nxt");
                        if ($.inArray("mdx_2.0", HelpCenter.user.tags) > -1) $(".switchTag").val("mdx_2_0");
                        if ($.inArray("rocketfuel_user", HelpCenter.user.tags) > -1) $(".switchTag").val("dsp");

                        //set the default platform to storage
                        storage.setItem("global-filterSetting", $("#switchTag").val());

                        //update menu and entity visibilities
                        toggleSidenavElem();
                        togglePlatVis();

                    } else {

                        //set the stored platform value
                        $(".switchTag").val(prevPlat);

                        //update menu and entity visibilities
                        toggleSidenavElem();
                        togglePlatVis();
                    }

                    function togglePlatVis() {

                        //for platform dropdown in search result page filter area
                        $("#platformFilter").val($("#switchTag").val());

                        //for dsp, new dsp and dmp, show search all result
                        if (($("#switchTag").val() == "dsp" || $("#switchTag").val() == "newdsp" || $("#switchTag").val() == "dmp") && toggleCSS) {
                            $(".search-results-list-temp").find("li").each(function() {
                                $(this).show();
                            });
                        }

                        //for show-all platform filter
                        if ($("#switchTag").val() == "showall" && toggleCSS == true) {

                            $("#mdx_2_0").show();

                            //redundant?
                            //$("#search-header").show();

                            $("#support_kb").hide();

                            //display using default skin
                            $("body").addClass("mdxcss");
                            $("body").removeClass("support_kb");

                            //show everything
                            $(".section-tree").find("section").each(function() {
                                $(this).show()
                            });

                            $(".article-list").find("li").each(function() {
                                $(this).show()
                            });

                            $(".search-results-list-temp").find("li").each(function() {
                                $(this).show()
                            });
                        }

                        if ($("#switchTag").val() == "mdx_2_0" && toggleCSS == true) {

                            //$("#search-header").show();
                            //$("#mdx_2_0").hide();
                            //$("#support_kb").hide();

                            //display using default skin
                            $("body").addClass("mdxcss");
                            $("body").removeClass("support_kb");

                            //possible redundant codes??
                            //$("#five").show();

                            toggleVis("mdx_2_0");
                        }

                        if ($("#switchTag").val() == "mdx_nxt" && toggleCSS == true) {

                            //$("#mdx_2_0").show();
                            //$("#search-header").show();
                            //$("#support_kb").hide();

                            $("body").addClass("mdxcss");
                            $("body").removeClass("support_kb");

                            //possible redundant codes??
                            //$("#five").show();

                            //unknown??
                            if (!$('#201188756').length) $('.addtlResources > .group-list').append('<li class="section" id="201188756"> <a class="sectionDrop" href="/hc/en-us/categories/201188756">Training Videos</a></li>');

                            toggleVis("mdx_nxt");
                        }

                        if ($("#switchTag").val() == "support_kb" && toggleCSS) {

                            //possible redundant codes??
                            /*
                            if (isSectionPage) {
                                $("#show-data").css("display", "none");
                                $(".pagination").css("display", "none");
                                $("body.support_kb").find("p.bodytext").css("display", "none");
                            }

                            $("#support_kb").show();

                            $("#mdx_2_0").hide();
                            $("#search-header").hide();
                            */

                            $("body").removeClass("mdxcss");
                            $("body").addClass("support_kb");

                            $(".section-tree").find("section").each(function() {
                                $(this).show()
                            });

                            $(".article-list").find("li").each(function() {
                                $(this).show()
                            })

                        } else {
                            //possible redundant codes??
                            /*

                            if (isSectionPage) {
                                $("body.support_kb").find("p.bodytext").css("display", "none");
                                $("#show-data").css("display", "none");
                                $("#sectionloader").css("display", "none");

                                $(".article-list:first").css("display", "block");
                                $(".pagination").css("display", "block");
                            }
                            */
                            $("aside").css("display", "block");
                        }

                        if (typeof $(".section-tree") !== "undefined") {

                            var sectionsArr = $(".section-tree > section");

                            if ($("#switchTag").val() !== "support_kb" && $(".header").html().indexOf("Message Board") < 0) {

                                //set article list per section to be minimum required height across rows
                                for (var indx = 0; indx < sectionsArr.length; indx = indx + 2) {
                                    var oddElem = sectionsArr[indx];
                                    var evenElem = sectionsArr[indx + 1];
                                    var oddHeight = $(oddElem).find("li").length * 45;
                                    var evenHeight = $(evenElem).find("li").length * 45;
                                    if (oddHeight >= evenHeight) {
                                        $(oddElem).children("ul").css("height", oddHeight + "px");
                                        $(evenElem).children("ul").css("height", oddHeight + "px")
                                    } else {
                                        $(oddElem).children("ul").css("height", evenHeight + "px");
                                        $(evenElem).children("ul").css("height", evenHeight + "px")
                                    }
                                }

                            } else {

                                //set height to auto for KB view or message board section
                                for (var indx = 0; indx < sectionsArr.length; indx = indx + 2) {
                                    var oddElem = sectionsArr[indx];
                                    var evenElem = sectionsArr[indx + 1];
                                    $(oddElem).children("ul").css("height", "auto");
                                    $(evenElem).children("ul").css("height", "auto")
                                }
                            }

                            //change default ZD text with custom see-all-articles text
                            $(".section-tree").find("section").each(function() {
                                if (!isInURL("/categories/201680143")) $(this).find(".see-all-articles").text("See all articles")
                            })
                        }

                        //display or hide tree branch background based on article title labels
                        $(".article-list").find("li").each(function() {
                            if (($(this).html().indexOf("issue-title") > -1 || $(this).html().indexOf("article-title") > -1 || $(this).html().indexOf("topic-title") > -1 || $(this).html().indexOf("section-title") > -1 || $(this).html().indexOf("reference-title") > -1 || $(this).html().indexOf("faq-title") > -1) && $("#switchTag").val() == "support_kb") $(this).addClass("treeline");
                            else if ($(this).html().indexOf("sub-title") > -1 || $(this).html().indexOf("issue-title") > -1) $(this).addClass("treeline");
                            else $(this).removeClass("treeline");
                        });

                        //platform_id becomes category ID.. what is purpose of below??
                        var platforms = JSON.parse(localStorage.getItem("platforms"));
                        var platform_url = currPageURL.split("/");
                        var platform_id = platform_url[platform_url.length - 1].split("-", 1).toString();

                        if ($(".section-tree").children(".section:visible").length == 0 && $(".article-list").children("li:visible").length == 0 && $("#switchTag").val() !== "support_kb" && !isInURL("/categories/201680143") && jQuery.inArray(platform_id, platforms) < 0) {

                            var platform = "";
                            var selectedPlatform = $("#switchTag").val();
                            var currPlat = selectedPlatform == "mdx_2_0" ? "mdx2" : selectedPlatform;

                            if (isInURL("/sections/")) {

                                var currSectionID = currPageURL.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];

                                $.ajax({

                                    url: "/api/v2/help_center/sections/" + currSectionID + "/articles",
                                    type: "GET"

                                }).done(function(data) {

                                    var noArticle = true;

                                    for (var i = 0, len = data.articles.length; i < len && noArticle; i++) {

                                        var labels = data.articles[i].label_names;

                                        //at least one article in current section has current platform label
                                        if (labels.includes(currPlat)) noArticle = false;

                                        //otherwise set the article platform label as current platform
                                        if (platform == "") platform = (labels.includes("mdxnxt") || labels.includes("mdx_nxt")) ? "mdx_nxt" : labels.includes("mdx2") ? "mdx_2_0" : labels.includes("newdsp") ? "newdsp" : labels.includes("dsp") ? "dsp" : labels.includes("dmp") ? "dmp" : "";

                                    }

                                    //if no article reload current page with appropriate platform
                                    if (noArticle) window.location.href = (currPageURL + "?platform=" + platform);

                                })
                            }
                        }

                        //do we want to concatenate title in the category page??
                        if ($("#switchTag").val() !== "support_kb" && isInURL("/categories/")) $(".article-list").find(".aTitle").each(function() {

                            var htmlParts = $(this).html().split(">");

                            if ($.trim(htmlParts[htmlParts.length - 1]).length > 55) htmlParts[htmlParts.length - 1] = $.trim(htmlParts[htmlParts.length - 1]).substr(0, 55) + "...";

                            $(this).html(htmlParts.join(">"));

                        });

                        //possible redundant codes??
                        /*
                        var checkEmptyResult = setInterval(function() {
                            if ($(".search-results-list > li:visible").length < 4) {
                                clearInterval(checkEmptyResult);
                                $(".search-results-list").hide();
                                $(".search-results-list-temp").show();
                            } else if ($(".search-results-list > li:visible").length > 1) clearInterval(checkEmptyResult)
                        }, 100);

                        if ($(".tabYourResources li").length >= 1 && currentUser == "end_user" || HelpCenter.user.email == "professionalservices@sizmek.com") $(".tabYourResources").show();
                        else $(".tabYourResources").hide();
                        */

                        $(".search-results-list-temp").show();
                    }

                    //switch platform based on the article labels
                    function switchPlatform(tags, prevPlat) {

                        var tagPlatform = "";

                        //go through each tags for known platform labels
                        for (var x = 0, found = 0; x < tags.length && found == 0; x++) {

                            var tag = tags[x].replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();

                            if (prevPlat == "mdx_2_0" && tag == "mdx2") {

                                tagPlatform = "mdx_2_0"
                                break;

                            } else if (prevPlat == "mdx_nxt" && tag == "mdxnxt") {

                                tagPlatform = "mdx_nxt"
                                break;

                            } else {

                                switch (tag) {

                                    case "dmp":
                                        tagPlatform = "dmp";
                                        found = 0;
                                        break;

                                    case "newdsp":
                                        tagPlatform = "newdsp";
                                        found = 0;
                                        break;

                                    case "dsp":
                                        tagPlatform = "dsp";
                                        found = 0;
                                        break;

                                    case "mdx2":
                                        tagPlatform = "mdx_2_0";
                                        found = 0;
                                        break;

                                    case "mdxnxt":
                                        tagPlatform = "mdx_nxt";
                                        found = 0;
                                        break;
                                }
                            }
                        }
                        changeSwitchTag(tagPlatform, prevPlat);
                    }

                    //auto toggle platform based on platform label of the currently viewing article
                    function switchPlatformCat(tags, prevPlat) {

                        var tagPlatform = "";
                        var tagsArr = tags.split(" ");

                        for (var x = 0, found = 0; x < tagsArr.length && found == 0; x++) {

                            var tag = tagsArr[x].replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();

                            if (prevPlat == "mdx_2_0" && tag == "mdx2") {

                                tagPlatform = "mdx_2_0";
                                break;

                            } else if (prevPlat == "mdx_nxt" && tag == "mdxnxt") {

                                tagPlatform = "mdx_nxt";
                                break;

                            } else {
                                switch (tag) {

                                    case "dmp":
                                        tagPlatform = "dmp";
                                        found = 0;
                                        break;

                                    case "newdsp":
                                        tagPlatform = "newdsp";
                                        found = 0;
                                        break;

                                    case "dsp":
                                        tagPlatform = "dsp";
                                        found = 0;
                                        break;

                                    case "mdx2":
                                        tagPlatform = "mdx_2_0";
                                        found = 0;
                                        break;

                                    case "mdxnxt":
                                        tagPlatform = "mdx_nxt";
                                        found = 0;
                                        break;
                                }
                            }
                        }

                        changeSwitchTag(tagPlatform, prevPlat);
                    }

                    //compare article platform vs
                    function changeSwitchTag(platform, prevPlat) {

                        if (platform == "") {

                            if (prevPlat === null) {

                                //if no platform label and no storage platform, default to user label
                                if ($.inArray("mdx_nxt", HelpCenter.user.tags) > -1) $(".switchTag").val("mdx_nxt");
                                if ($.inArray("mdx_2.0", HelpCenter.user.tags) > -1) $(".switchTag").val("mdx_2_0");

                            } else {

                                //if no platform label, use storage platform
                                $("#switchTag").val(prevPlat);
                            }

                        } else {

                            //if platform label exist, set it to storage and set platform dropdown per label
                            storage.setItem("global-filterSetting", platform);
                            $("#switchTag").val(platform);

                        }

                        //update menu based on new platform
                        toggleSidenavElem();
                    }

                    //update sidebar menu based on platform
                    function toggleSidenavElem() {

                        updateKSelect($("#switchTag").val());

                        var currentProduct = {};
                        var stringifiedElements = '<li class="firstLi"></li>';
                        var loginURL = "https://platform.mediamind.com/Eyeblaster.ACM.Web/Login/ZDLogin.aspx?brand_id=12005&locale_id=1&return_to=https%3A%2F%2Fsupport.sizmek.com%2Fhc%2F" + currentLang + "%2F";

                        switch ($("#switchTag").val()) {

                            case "mdx_2_0":
                                $("body").addClass("mdxcss");
                                currentProduct = menuObject.mdx2;
                                categoryClass = 'category mdx-nav mdx2';
                                break;

                            case "mdx_nxt":
                                $("body").addClass("mdxcss");
                                currentProduct = menuObject.sas;
                                categoryClass = 'category mdx-nav mdx';
                                break;

                            case "dsp":
                                $("body").addClass("mdxcss");
                                if (currentUser != "anonymous") {
                                    currentProduct = menuObject.dsp;
                                    categoryClass = 'category dsp';
                                } else {
                                    $("#nav-list").html('<li class="firstLi"></li><li class="dsp"><a class="categoryDrop" href="' + loginURL + '">PLEASE SIGN IN</a></li><li></li>')
                                }
                                break;

                            case "dmp":
                                $("body").addClass("mdxcss");
                                if (currentUser != "anonymous") {
                                    currentProduct = menuObject.dmp;
                                    isDmp = true;
                                } else {
                                    $("#nav-list").html('<li class="firstLi"></li><li class="dmp"><a class="categoryDrop" href="' + loginURL + '">PLEASE SIGN IN</a></li><li></li>')
                                }
                                break;

                            case "newdsp":
                                $("body").addClass("mdxcss");
                                if (currentUser != "anonymous") {
                                    currentProduct = menuObject.newDsp;
                                    categoryClass = 'category newdsp';
                                } else {
                                    $("#nav-list").html('<li class="firstLi"></li><li class="newdsp"><a class="categoryDrop" href="' + loginURL + '">PLEASE SIGN IN</a></li><li></li>')
                                }
                                break;

                            case "support_kb":
                                $("body").removeClass("mdxcss").addClass("support_kb");
                                currentProduct = menuObject.supportKb;
                                categoryClass = 'category supportkb';
                                isSupportKb = true;
                                break;

                            case "showall":
                                var isShowall = true;
                                break;
                        }

                        //for anonymous users, show sign-in for more message
                        if (currentUser == "anonymous") {

                            $(".tabGettingStarted .sub-menu").append('<li><a href="' + loginURL + '" style="color:#000 !important">Please <strong class="loginC">sign in</strong> to view more articles</a></li>');
                            $(".tabCampaignManagement .sub-menu").append('<li><a href="' + loginURL + '" style="color:#000 !important">Please <strong class="loginC">sign in</strong> to view more articles</a></li>')

                            if ($("#switchTag").val() == "mdx_2_0" || $("#switchTag").val() == "mdx_nxt") {

                                //generate menu
                                populateCurrentProduct();
                            }

                        } else {

                            if (isShowall) {

                                $.each(menuObject, function(index) {
                                    if (index != "products") {
                                        currentProduct = $.makeArray($(this));
                                        if (index === "supportKb") {
                                            isSupportKb = true;
                                        }
                                        stringifiedElements += '<span class="platformTitle" style="display: flex;">' + formatTitle(index) + '</span>';
                                        categoryClass = intantiateCategoryClass(index);
                                        populateCurrentProduct();
                                    }
                                });

                                isShowall = false;

                                var addResources = menuObject.mdx2[menuObject.mdx2.length - 1];

                                currentProduct = [];
                                currentProduct.push(addResources);

                                stringifiedElements += '<span class="platformTitle" style="display: flex;">ADDITIONAL RESOURCES</span>';

                                //generate menu
                                populateCurrentProduct();

                            } else {

                                //generate menu
                                populateCurrentProduct();
                            }
                        }

                        function intantiateCategoryClass(title) {
                            if (title === "mdx2") return "category mdx-nav mdx2";
                            if (title === "sas") return "category mdx-nav mdx";
                            if (title === "newDsp") return "category newdsp";
                            if (title === "dsp") return "category dsp";
                            if (title === "dmp") isDmp = true;
                            if (title === "supportKb") return "category supportkb";
                        }

                        function formatTitle(product) {
                            if (product === "mdx2") return "MDX 2.0";
                            if (product === "sas") return "SIZMEK ADVERTISING SUITE";
                            if (product === "newDsp") return "NEW DSP";
                            if (product === "dsp") return "DSP";
                            if (product === "dmp") return "DMP";
                            if (product === "supportKb") return "SUPPORT KB";
                        }

                        //generate menu based on current platform
                        function populateCurrentProduct() {

                            var additionalResources = currentProduct.pop();

                            for (var i = 0; i < currentProduct.length; i++) {

                                if (currentProduct[i].v) {

                                    if (currentProduct[i].type === "text") {

                                        stringifiedElements += '<li class="mdx2">' + '<i class="fa fa-angle-right" id="icon-category"></i>' + '<a class="categoryDrop">' + currentProduct[i].title + '</a>' + '<ul style="overflow: hidden; display: none;">';

                                        for (var x = 0; x < currentProduct[i].children.length; x++) {

                                            if (currentProduct[i].children[x].v) {

                                                if (currentProduct[i].children[x].type === "category") stringifiedElements += initializeCategory(currentProduct[i].children[x]);
                                                else if (currentProduct[i].children[x].type === "section") stringifiedElements += initializeSection(currentProduct[i].children[x]);
                                                else if (currentProduct[i].children[x].type === "custom") stringifiedElements += '<li class="section" id="' + currentProduct[i].children[x].id + '">' + '<a class="sectionDrop english" href="' + currentProduct[i].children[x].url + '">' + currentProduct[i].children[x].title + '</a>' + '</li>';

                                            }
                                        }

                                        stringifiedElements += '</ul></li>';

                                    } else if (currentProduct[i].type === "category") {

                                        stringifiedElements += initializeCategory(currentProduct[i]);

                                    } else if (currentProduct[i].type === "section") {

                                        stringifiedElements += initializeSection(currentProduct[i]);
                                    }
                                }
                            }

                            //add additional resources menu
                            if (currentUser !== "anonymous" && !isShowall && additionalResources) {

                                stringifiedElements += '<li class="addtlResources">' + '<i class="fa fa-angle-right"></i>' + '<a class="categoryDrop">' + additionalResources.title + '</a>' + '<ul class="group-list" style="overflow: hidden;display:none;">';

                                for (var index = 0; index < additionalResources.children.length; index++) {
                                    if (additionalResources.children[index].v)
                                        var target = '';
                                    if (additionalResources.children[index].checkItem) {
                                        target = ' target="_blank"';
                                    }
                                    stringifiedElements += '<li class="section" id="' + additionalResources.children[index].id + '">' +
                                        '<a class="sectionDrop" href="' + additionalResources.children[index].url + '" ' + target + ' title="' + additionalResources.children[index].title + '">' + additionalResources.children[index].title + '</a></li>'
                                }
                            }

                            stringifiedElements += '</ul>';
                        }

                        if (currentUser !== "anonymous" || $("#switchTag").val() == "mdx_2_0" || $("#switchTag").val() == "mdx_nxt") {
                            $('#nav-list').html(stringifiedElements + '<li class="last-list"></li>');
                            stringifiedDOM = stringifiedElements;
                        }

                        //message board category
                        if (isInURL("categories/201680143")) {
                            formatSideBar();
                        }

                        togglePlatVis();

                        var gaPlatform = $("#switchTag").val();

                        //send platform to google analytics
                        ga("set", "dimension4", gaPlatform);

                        //google analytics
                        ga('send', 'pageview');
                    }

                    function initializeCategory(category) {
                        var articleTitle = isSupportKb ? category.title.replace('KB » ', '') : category.title;
                        return '<li class="' + categoryClass + '" id="' + category.id + '">' + '<i class="fa fa-angle-right" id="icon-category"></i>' + '<a class="categoryDrop">' + articleTitle + '</a>' + '<ul class="group-list"></ul>' + '</li>';
                    }

                    function initializeSection(section) {
                        var sectionClass = isDmp ? 'dmp section superCat' : 'section';
                        return '<li class="' + sectionClass + '" id="' + section.id + '">' + '<i id="icon-section" class="fa fa-angle-right"> </i>' + '<a class="sectionDrop">' + cleanTextOnly(section.title) + '</a>' + '<ul class="sub-group-list" style="overflow: hidden; display:none;"></ul>' + '</li>';
                    }
                });

                //syntax highlight codes
                function highlight_codes() {
                    if (isInURL("/articles/")) {
                        $("ul.toc-indentation").remove();
                        $(".panelContent p").each(function() {
                            if ($(this).text() == "") $(this).remove()
                        });
                        $("pre").each(function() {
                            if ($(this).children("code").length == 0) {
                                $(this).contents().wrapAll("<code />");
                            }
                        });
                    }
                    hljs.initHighlightingOnLoad();
                    $('pre code').each(function(i, block) {
                        hljs.highlightBlock(block);
                    });
                }
                highlight_codes();

            }).change();


            function preg_quote(str) {
                return (str + "").replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}=!<>\|:])/g, "\\$1")
            }

            function highlight(data, search) {
                return data.replace(new RegExp("(" + preg_quote(search) + ")", "gi"), "<span class='highlighter'>$1</span>")
            }

            //search related vars
            var searchURL,
                gotCategories = 0,
                gotSections = 0,
                gotCategoryList = 0,
                categoryArray = [],
                sectionArray = [],
                searchPlat = filterPlat = alterPlat = "",
                searchVar = currPageURL.split("#page="),
                searchPrefix = searchVar[0] + "#page=";

            //set search API page index
            var searchCurrPage = searchVar[1] === undefined ? 1 : searchVar[1];

            //possible redundant codes??
            /*
            $(".search-result").find(".search-result-meta").each(function() {
                $(this).html($(this).html().split("</time> in ")[1])
            });
            */

            //count results for current platform
            function checkResultCount() {

                //for support KB, show all results
                if ($("#switchTag").val() == "support_kb") $(".search-results-list-temp").find("li.search-result").each(function() {
                    $(this).show();
                });

                else {
                    //for non support-kb platform
                    var showPlat = $("#switchTag").val() == "mdx_2_0" ? "mdx2-title" : "mdxnxt-title";
                    var hidePlat = showPlat == "mdx2-title" ? "mdxnxt-title" : "mdx2-title";

                    if ($("#switchTag").val() == "showall" || $("#switchTag").val() == "dsp" || $("#switchTag").val() == "newdsp" || $("#switchTag").val() == "dmp")
                        //for all platforms other than mdx and sas platform, show
                        showPlat = "<a";

                    $(".search-results-list-temp").find("li.search-result").each(function() {
                        //hide each result
                        $(this).hide();

                        //unless match current platform
                        if ($(this).html().indexOf(showPlat) > -1) $(this).show();
                    })
                }


                //show total count only after searching complete
                if (searchDone == 1) {

                    switch (searchResultTotal) {

                        case 0:
                            $(".search-results-column > .search-results-subheading").text("Search Result");
                            $(".searchStatus").text("No result found for current filter");
                            break;

                        case 1:
                            $(".search-results-column > .search-results-subheading").text("Search Result");
                            $(".searchStatus").text("One result found for current filter");
                            break;

                        default:
                            $(".search-results-column > .search-results-subheading").text("Search Results");
                            $(".searchStatus").text(searchResultTotal + " results found for current filter")
                    }

                    if ($("#filterContentTypes input:checked").length > 0) {

                        var resultCount = $(".search-result:visible").length;

                        if (resultCount > 1) $(".searchStatus").text($(".search-result:visible").length + " results found for current filter");

                        else {
                            resultCount = resultCount == 1 ? "One" : "No";
                            $(".searchStatus").text(resultCount + " result found for current filter");
                        }

                        $($("#filterContentTypes input:checked")[0]).prop("disabled", false);

                    } else $("#filterContentTypes input").prop("disabled", false);
                }

                //render search result
                $(".search-results-column").find("p").text($(".search-results-column").find("p").text().replace(/@[\w-()]+\s/ig, ""))
            }

            //search related functionalities
            //needs code comments??
            if (isInURL("/search?")) {

                var searchSections = function() {
                    if (storage.getItem(HelpCenter.user.email + "-allSections" + helpCenterVer + currentLang) === null)
                        $.get(sectionApiURL).done(function(data) {
                            sectionApiURL = data.next_page;
                            var newArray = $.map(data.sections, function(section, i) {
                                return {
                                    "id": section.id,
                                    "name": section.name,
                                    "category": section.category_id,
                                    "url": section.html_url
                                }
                            });
                            sectionArray = $.merge(newArray, sectionArray);
                            if (sectionApiURL !== null) {
                                sectionApiURL += "&per_page=100";
                                searchSections()
                            } else {
                                storage.setItem(HelpCenter.user.email + "-allSections" + helpCenterVer + currentLang, JSON.stringify(sectionArray));
                                gotSections = 1
                            }
                        });
                    else {
                        sectionArray = JSON.parse(storage.getItem(HelpCenter.user.email + "-allSections" + helpCenterVer + currentLang));
                        gotSections = 1
                    }
                };

                var searchCategories = function() {

                    if (storage.getItem(HelpCenter.user.email + "-allCategories" + helpCenterVer + currentLang) === null)
                        $.get(categoryApiURL).done(function(data) {
                            categoryApiURL = data.next_page;
                            var newArray = $.map(data.categories, function(category, i) {
                                return {
                                    "id": category.id,
                                    "name": category.name,
                                    "url": category.html_url,
                                    "desc": category.description
                                }
                            });
                            categoryArray = $.merge(newArray, categoryArray);
                            if (categoryApiURL !== null) {
                                categoryApiURL += "&per_page=100";
                                searchCategories();
                            } else {
                                storage.setItem(HelpCenter.user.email + "-allCategories" + helpCenterVer + currentLang, JSON.stringify(categoryArray));
                                gotCategories = 1;
                            }
                        });

                    else {
                        categoryArray = JSON.parse(storage.getItem(HelpCenter.user.email + "-allCategories" + helpCenterVer + currentLang));
                        gotCategories = 1;
                    }
                };

                $(".search-filter").show();

                var searchResultReady = setInterval(function() {

                    if ($("#results").length) {

                        if (HelpCenter.user.role == "anonymous") $("#results").prepend("<div class='signInResults'>Please <a href='https://platform.mediamind.com/Eyeblaster.ACM.Web/Login/ZDLogin.aspx?brand_id=12005&locale_id=1&return_to=" + encodeURIComponent(currPageURL) + "'>sign in</a> to view all results.</div>");

                        clearInterval(searchResultReady);
                    }
                }, 200);

                $(".search-results-list").hide();

                var categoryApiURL = "/api/v2/help_center/" + currentLang + "/categories.json?per_page=100";

                searchCategories();

                var sectionApiURL = "/api/v2/help_center/" + currentLang + "/sections.json?per_page=100";

                searchSections();

                var checkRdy = setInterval(function() {

                    if (gotSections && gotCategories) {

                        clearInterval(checkRdy);

                        var tempCategories = [];
                        var searchCatIds = [];
                        var tempPlatforms = ["mdx2", "mdxnxt", "dsp", "newdsp", "dmp"];

                        if ($("#query").val().length > 1) {

                            if ($("#switchTag").val() == "mdx_2_0") filterPlat = "mdx2";
                            if ($("#switchTag").val() == "mdx_nxt") filterPlat = "mdxnxt";
                            if ($("#switchTag").val() == "dsp") filterPlat = "dsp";
                            if ($("#switchTag").val() == "newdsp") filterPlat = "newdsp";

                            searchPlat = "&label_names=" + filterPlat;

                            /*
                            if ($("#switchTag").val() == "support_kb") {
                                searchPlat = "&category=" + kbCategories;
                                filterPlat = "supportkb";
                            } else if ($("#switchTag").val() == "dmp") {
                                searchPlat = "&category=360000026612";
                                filterPlat = "dmp";
                            }
                            */

                            if ($("#switchTag").val() == "support_kb") filterPlat = "supportkb";
                            else if ($("#switchTag").val() == "dmp") filterPlat = "dmp";

                            var findPlat = tempPlatforms.indexOf(filterPlat);

                            if (findPlat !== -1) tempPlatforms.splice(findPlat, 1);
                        }

                        $.each(categoryArray, function(i, category) {

                            //if (category.desc.indexOf(filterPlat) > -1) tempCategories.push([category.name, category.id]);

                            //else if (category.desc.indexOf("@supportkb") < 0 && category.desc.indexOf("@other") < 0 && filterPlat !== "supportkb") {
                            var filtFound = false;

                            for (var i = 0; i < tempPlatforms.length; i++) {
                                if (category.desc.indexOf(tempPlatforms[i]) != -1) filtFound = true;
                            }

                            if (category.desc.indexOf(filterPlat) > -1 || !filtFound) {

                                tempCategories.push([category.name, category.id]);

                                if (category.id != 200768493 && category.id != 201680143) searchCatIds.push(category.id);

                            } else if (category.desc.indexOf("@supportkb") < 0 && category.desc.indexOf("@other") < 0 && filterPlat !== "supportkb") {

                                var regv = new RegExp(tempPlatforms.join("|"), 'g');

                                if (!category.desc.match(regv)) tempCategories.push([category.name, category.id])
                            }
                        });

                        tempCategories.sort();

                        var searchCat = "&category=" + searchCatIds;
                        var options = "";

                        for (var i = 0; i < tempCategories.length; i++)
                            if ($("#categoryFilter option[value='" + tempCategories[i][0] + "']").length == 0) options += '<option value="' + tempCategories[i][1] + '">' + tempCategories[i][0] + "</option>";

                        $("#categoryFilter").append(options);

                        searchQuery = $("#query").val().trim();

                        var hashCount = (searchQuery.match(/#/g) || []).length;

                        if (searchQuery.substr(0, 1) == "#") searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery.replace(" ", "+")) + "&locale=" + currentLang + searchCat + searchPlat + "&label_names=" + searchQuery.replace("#", "Tags:") + "&per_page=8&page=" + searchCurrPage;
                        else searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "&locale=" + currentLang + searchCat + searchPlat + "&per_page=8&page=" + searchCurrPage;

                        if ($("#switchTag").val() == "support_kb") hcTags = kbTags;
                        if ($("#switchTag").val() == "showall") $.extend(true, hcTags, kbTags);

                        var iter = hcTags.length;
                        var appendThis = tagText = "";

                        $.each(hcTags, function(i, hctag) {

                            var labelFilter, findTag;

                            labelFilter = "&label_names=" + hctag;

                            findTag = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "&locale=" + currentLang + labelFilter + "&per_page=1";

                            $.get(findTag).done(function(data) {

                                iter--;

                                if (data.count > 0) {
                                    for (var indx = 0; indx < contentTypes.length; ++indx)
                                        if ("@" + hctag == contentTypes[indx][0]) tagText = contentTypes[indx][2];

                                    appendThis += "<li class='ctTag'><input id='" + tagText + "' class='checkbox-custom' name='" + tagText + "' val='" + hctag + "' type='checkbox'><label for='" + tagText + "' class='checkbox-custom-label'>" + tagText + "</label></li>"
                                }

                                if (iter == 0) {

                                    $("#filterContentTypes").append("<li><h4>Content Type</h4></li>" + appendThis);

                                    var backupURL = searchURL;

                                    $("#filterContentTypes").find("input").on("change",
                                        function() {
                                            var checked = $(this).prop("checked");
                                            var cType = $(this).attr("id");
                                            if (checked) {
                                                $(this).parent().siblings(".ctTag").children("label").css({
                                                    "opacity": "0.4",
                                                    "cursor": "default"
                                                }).siblings("input").prop("disabled", true);
                                                $(this).prop("disabled", true)
                                            } else $(this).parent().siblings(".ctTag").children("label").css({
                                                "opacity": "1",
                                                "cursor": "pointer"
                                            }).siblings("input").prop("disabled", true);
                                            ga("send", "event", "Search Filter", "Click", $(this).attr("id"));
                                            searchDone = 0;
                                            var searchPlatform = "";
                                            var searchCat = "";
                                            if ($("#query").val().length > 1) {
                                                if ($("#switchTag").val() == "mdx_2_0") searchPlatform = "mdx2";
                                                if ($("#switchTag").val() == "mdx_nxt") searchPlatform = "mdxnxt";
                                                //if ($("#switchTag").val() == "support_kb" && $("#categoryFilter").val() == "") searchCat = "&category=" + kbCategories
                                                if ($("#categoryFilter").val() == "" && $("#switchTag").val() == "support_kb") searchCat = "&category=" + kbCategories;
                                            }
                                            if (checked && $("#categoryFilter").val() == "") {
                                                //searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "+-%22Revision%20ver.%22&locale=" + currentLang + "&per_page=100&label_names=" + $(this).attr("val") + searchCat + "&page=" + searchCurrPage;
                                                searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "&locale=" + currentLang + "&per_page=100&label_names=" + $(this).attr("val") + searchCat + "&page=" + searchCurrPage;
                                                searchArticles(searchURL, false);
                                            } else if (!checked && $("#categoryFilter").val() !== "") {
                                                //searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "+-%22Revision%20ver.%22&locale=" + currentLang + "&category=" + $("#categoryFilter").val() + "&per_page=8&label_names=" + searchPlatform + "&page=" + searchCurrPage;
                                                searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "&locale=" + currentLang + "&category=" + $("#categoryFilter").val() + "&per_page=8&label_names=" + filterPlat + "&page=" + searchCurrPage;
                                                searchArticles(searchURL, true);
                                            } else if (checked && $("#categoryFilter").val() !== "") {
                                                //searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "+-%22Revision%20ver.%22&locale=" + currentLang + "&category=" + $("#categoryFilter").val() + "&per_page=100&label_names=" + $(this).attr("val") + "&page=" + searchCurrPage;
                                                searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "&locale=" + currentLang + "&category=" + $("#categoryFilter").val() + "&per_page=100&label_names=" + $(this).attr("val") + "&page=" + searchCurrPage;
                                                searchArticles(searchURL, false);
                                            } else {
                                                searchURL = backupURL;
                                                searchArticles(searchURL, true);
                                            }

                                        });
                                }
                            });

                        });
                        searchDone = 0;
                        searchArticles(searchURL);
                    }
                }, 100)

                //search again upon hash change / pagination click
                window.onhashchange = function() {
                    pageNo = document.location.hash.split("#page=")[1];
                    searchURL = searchURL + "&page=" + pageNo;
                    searchArticles(searchURL);
                };
            }

            //pagination click handler
            function reSearch(pageNo) {

                $(".simplePag").pagination("selectPage", pageNo);
                $(".loaderSpin").pagination("selectPage", pageNo);

                document.location.hash = "#page=" + pageNo;
            }

            function searchArticles(searchURL, pp) {

                //current pagination index
                var currLoc = window.location.href.split("#page=");

                //show or hide pagination
                var pagShow = pp == undefined ? true : pp;

                //show loader
                $(".search-results-list-temp").html("<li class='loaderSpin'><img src='" + gSZMKspingreyGIFURL + "' style=border:0px'></li>");

                //perform search
                $.get(searchURL).done(function(data) {

                    searchResultTotal = data.count;
                    searchURL = data.next_page;

                    var results = $.map(data.results, function(result, i) {
                        return {
                            "title": result.title,
                            "url": result.html_url,
                            "section": result.section_id,
                            "body": result.body,
                            "vote": result.vote_sum,
                            "labels": result.label_names
                        }
                    });

                    $.each(results, function(i, result) {

                        var ctypeList = "";

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

                        //look for one of known content type filters in the article labels
                        $.each(result["labels"], function(ind, lab) {
                            var ctypeVar = contentTypes.filter(function(ctype) {
                                return ctype[0].slice(1) == lab;
                            })[0];
                            ctypeList += ctypeVar !== undefined ? '<span class="' + ctypeVar[1] + '"><b>' + ctypeVar[2] + "</b></span>" : "";
                        });

                        var cleanHTML = "";
                        var regx = /(<([^>]+)>)/ig;
                        var rawHTML = result["body"];
                        var searchKey = preg_quote(searchQuery);
                        var regNew = new RegExp(searchKey, "i");

                        if (rawHTML) cleanHTML = rawHTML.replace(regx, "");

                        var resultIndex = cleanHTML.search(regNew);

                        if (resultIndex > 60) cleanHTML = "..." + highlight(cleanHTML.substring(resultIndex - 60, resultIndex + 70), searchKey) + "...";
                        else cleanHTML = highlight(cleanHTML.substring(0, 130), searchKey) + "...";

                        var titleLink = String(ctypeList) + '<a href="' + result["url"] + '" class="search-result-link">' + result["title"] + "</a>";
                        var videoSpan = '<span class="video-title"><b>VIDEO</b></span>';

                        if (titleLink.split(videoSpan).length > 1) titleLink = titleLink.split(videoSpan)[0] + titleLink.split(videoSpan)[1] + "&nbsp;&nbsp;" + videoSpan;

                        var newHTML = titleLink;

                        if (parseInt(result["vote"]) >= 1) newHTML += ' <span class="search-result-votes">' + result["vote"] + "</span>";

                        newHTML += '<div class="search-result-meta"><a href="' + categoryURL + '" class="categoryLink">' + categoryName + "</a>  > ";
                        newHTML += '<a href="' + sectionURL + '">' + sectionName + "</a></div>";
                        newHTML += '<div class="search-result-description">' + cleanHTML + "</div>";

                        //add the search result item
                        var realHTML = $("<li>").html(newHTML);

                        realHTML.addClass("search-result");
                        realHTML.attr("id", "search-result-" + i);
                        realHTML.appendTo(".search-results-list-temp");

                        $(".loaderSpin").appendTo($(".search-results-list-temp"));
                    });

                    //show hashtags for support users
                    if (jQuery.inArray("view_support_content", HelpCenter.user.tags) !== -1) {

                        for (var x = 0; x < results.length; x++) $("#search-result-" + x).append("<div class='tagList-" + x + "'></div>");

                        for (var x = 0; x < results.length; x++) {

                            for (var y = 0; y < results[x].labels.length; y++) {
                                if (results[x].labels[y].substr(0, 5) == "Tags:") {
                                    $(".tagList-" + x).append("<a class='hashTags " + results[x].labels[y].toLowerCase().substr(5) + "'><div class='cssCircle plusSign'>&#43;</div><div class='tagName'>#" + results[x].labels[y].substr(5) + "</div></a>");
                                }
                            }
                        }
                    }

                    //show search result pagination
                    if (pagShow) {

                        $(".simplePag, .loaderSpin").show();

                        $(".simplePag").pagination({

                            items: searchResultTotal,
                            itemsOnPage: 8,
                            hrefTextPrefix: currLoc[0] + "#page=",
                            currentPage: currLoc[1],
                            displayedPages: 0,
                            edges: 0,
                            onPageClick: function(page, event) {
                                if (event !== undefined) {
                                    event.preventDefault();
                                    $(".simplePag, .loaderSpin").pagination("disable");
                                    if (event.originalEvent !== undefined) reSearch(page)
                                }
                            },
                            cssStyle: "light-theme"
                        });

                        $(".loaderSpin").pagination({

                            items: searchResultTotal,
                            itemsOnPage: 8,
                            hrefTextPrefix: currLoc[0] + "#page=",
                            currentPage: currLoc[1],
                            onPageClick: function(page, event) {
                                if (event !== undefined) {
                                    event.preventDefault();
                                    $(".simplePag, .loaderSpin").pagination("disable");
                                    if (event.originalEvent !== undefined) reSearch(page)
                                }
                            },
                            cssStyle: "light-theme"
                        })

                    } else $(".simplePag, .loaderSpin").hide();

                    preFilterCount = 0;
                    searchDone = 1;

                    cleanWrap();
                    checkResultCount();
                })
            }

            //toggle visibility according to passed platform
            function toggleVis(plat) {

                var showPlat = plat == "mdx_2_0" ? "mdx2-title" : "mdxnxt-title";
                var hidePlat = showPlat == "mdx2-title" ? "mdxnxt-title" : "mdx2-title";
                var hidePlatTag = hidePlat == "mdxnxt-title" ? "@mdxnxt" : "@mdx2";

                //handle label-less section platform filtering (e.g. release-notes)
                $(".releaseTag").each(function() {
                    if (($(this).text().indexOf("@mdx2") > -1 || $(this).html().indexOf("mdx2-title") > -1) && !isInURL("/categories/201680143")) {

                        $(this).html('<span class="mdx2-title">MDX 2.0</span>');
                        if (showPlat == "mdxnxt-title") $(this).parent().parent().hide()

                    } else if (($(this).text().indexOf("@mdxnxt") > -1 || $(this).html().indexOf("mdxnxt-title") > -1) && !isInURL("/categories/201680143")) {

                        $(this).html('<span class="mdxnxt-title">SAS</span>');
                        if (showPlat == "mdx2-title") $(this).parent().parent().hide()

                    }
                });

                //count visible articles under each section and hide if none
                $(".section-tree").find("section").each(function() {

                    var visibleCount = 0;

                    $(this).find("li").each(function() {

                        $(this).hide();

                        if ($(this).html().indexOf(showPlat) > -1) {
                            $(this).show();
                            visibleCount += 1;

                        } else if ($(this).html().indexOf(hidePlat) < 0) {
                            $(this).show();
                            visibleCount += 1;
                        }
                    });

                    //hide sections without any article unless message board section
                    if (visibleCount == 0 && !isInURL("/categories/201680143")) {
                        $(this).hide();

                        $(this).appendTo($(this).parent());
                    }
                });

                $(".article-list:first").find("li").each(function() {

                    $(this).hide();

                    if ($(this).html().indexOf(showPlat) > -1) $(this).show();
                    else if ($(this).html().indexOf(hidePlat) < 0) $(this).show();
                });
            }

            //handle category filtering
            $("#categoryFilter").on("change", function() {

                var selectVal = $(this).val(),
                    searchDone = 0;

                if ($("#filterContentTypes input:checked").length > 0) {
                    searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "+-%22Revision%20ver.%22&locale=" + currentLang + searchPlat + "&per_page=100&category=" + selectVal + "&label_names=" + $($("#filterContentTypes input:checked")[0]).attr("val") + "&page=" + searchCurrPage;

                    //hide pagination for content filtered result
                    searchArticles(searchURL, false);
                } else {
                    if ($("#switchTag").val() == "support_kb" && selectVal == "") selectVal = kbCategories;
                    searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "+-%22Revision%20ver.%22&locale=" + currentLang + searchPlat + "&per_page=8&category=" + selectVal + "&page=" + searchCurrPage;
                    searchArticles(searchURL);
                }
            });


            function loadArticleData() {

                //show main content, needed for KCS custom image upload window
                $("main").show();

                if ($(".article-body").length) {

                    //if support KB or label contains glossary, include H3 in table of content
                    if ($(".article-header").text().toLowerCase().indexOf("glossary") > -1 || $(".article-header").find('.TOC_Advanced-title').length || $("#switchTag").val() == "support_kb")
                        $(".quickNavMenu").tocify({
                            context: ".article-body",
                            selectors: "h2,h3"
                        });
                    else
                        $(".quickNavMenu").tocify({
                            context: ".article-body",
                            selectors: "h2"
                        });

                    //add scroll-to-top button to TOC
                    $(".quickNavMenu").append('<ul id="backToTop" class="tocify-header nav nav-list"><li class="topLink"><a href="javascript:void(0);" onclick="scrollUp();" style="padding-top: 17px;">\u2191 &nbsp; Back to Top</a></li></ul>')
                }

                //sticky table header
                function fixedHeaderReset() {

                    $("table.stickyHeader").each(function() {

                        var shTable = $(this);
                        var fixedTableHeader;

                        $(this).removeClass("stickyHeader");

                        function init() {
                            shTable.wrap('<div class="sh-container" />');
                            fixedTableHeader = shTable.clone(true);
                            fixedTableHeader.find("tbody").remove().end().addClass("stickyHeader").insertBefore(shTable);
                            resizeFixed();
                        }

                        function resizeFixed() {
                            fixedTableHeader.find("th").each(function(index) {
                                $(this).css("width", shTable.find("th").eq(index).outerWidth() + "px")
                            });
                        }

                        function scrollFixed() {
                            var offset = $(this).scrollTop();
                            var tableOffsetTop = shTable.offset().top;
                            var tableOffsetBottom = tableOffsetTop + shTable.height() - shTable.find("thead").height();
                            if (offset < tableOffsetTop || offset > tableOffsetBottom) {
                                fixedTableHeader.hide();
                            } else if (offset >= tableOffsetTop && offset <= tableOffsetBottom && fixedTableHeader.is(":hidden")) {
                                fixedTableHeader.show();
                            }
                        }

                        $(window).resize(resizeFixed);
                        $(window).scroll(scrollFixed);

                        init();
                    })
                }

                fixedHeaderReset();

                //highlight last platform UI location path yellow
                try {
                    $(".steps > ul").children("li").each(function() {
                        var splitPath = $(this).html().split("&gt;");
                        splitPath[splitPath.length - 1] = "<span style='color:#FAF000'>" + splitPath[splitPath.length - 1] + "</span>";
                        $(this).html(splitPath.join("&gt;"))
                    })
                } catch (e) {}

                //possible redundant strikead related codes??
                /*
                try {
                    $(".steps-StrikeAd > ul").children("li").each(function() {
                        var splitPathStrikeAd = $(this).html().split("&gt;");
                        splitPathStrikeAd[splitPathStrikeAd.length - 1] = "<span style='color:#FAF000'>" + splitPathStrikeAd[splitPathStrikeAd.length - 1] + "</span>";
                        $(this).html(splitPathStrikeAd.join("&gt;"))
                    })
                } catch (e) {}
                */

                //BIG moved to KB??
            }

            function postAddSectionToList(originalSectionID) {
                getnavSecId = originalSectionID;

                selectSecId = $("#" + getnavSecId).children("ul.sub-group-list");

                if (selectSecId.length === 0) {

                    setTimeout(function() {
                        selectSecId = $("#" + getnavSecId).children("ul.sub-group-list");
                    }, 200);
                }
                instantiateTree();
            }

            loadArticleData();

            $(".pubCertUploadSpec").hide();

            $("#ctlForm").submit(function(ef) {
                ef.preventDefault();
                $.ajax({
                    url: $(this).attr("action"),
                    type: "POST",
                    dataType: "html",
                    data: $(this).serialize(),
                    error: function(jqXHR, textStatus, errorMessage) {
                        $(".pubCertForm").css("display", "none");
                        $(".pubCertInfo").css("display", "block")
                    },
                    success: function(data) {
                        $(".pubCertForm").css("display", "none");
                        $(".pubCertInfo").css("display", "block")
                    }
                })
            });

            if (HelpCenter.user.email !== null)
                if (currentUser == "manager") $(".language-selector").show();

            function commentBox() {
                if (currentUser == "agent")
                    if ($("#comment_form").length > 0)
                        if ($(".sub-nav-inner ol.breadcrumbs").find("li[title*='Message Board']").length > 0);
                        else $("#comment_form").hide()
            }
            commentBox();

            if (isSectionPage && $("#switchTag").val() == "support_kb") {

                var iconize = function() {
                    var lists = $("#show-data > li");
                    $(lists).has("div:contains('article')").prepend('<i style="font-size:15px;color:#00D1C6;padding-right:5px;cursor:pointer;margin-left:-18px;" class="fa fa-plus" ></i>').wrap('<div class="icon"></div>');
                    $(lists).has("div:contains('topic')").wrap('<div class="maintopic"></div>');
                    if ($("div.icon + div.icon").length) $("div.icon + div.icon").prev().find("i").css({
                        "filter": "grayscale(100%)",
                        "opacity": "0.5"
                    });
                    if ($("div.icon + div.maintopic").length) $("div.icon + div.maintopic").prev().find("i").css({
                        "filter": "grayscale(100%)",
                        "opacity": "0.5"
                    });
                    if ($("#show-data div.icon:last-child + div").length > -1) $("#show-data div.icon:last-child").find("i").css({
                        "filter": "grayscale(100%)",
                        "opacity": "0.5"
                    });
                    $("#show-data li").find("i").click(function() {
                        if ($(this).hasClass("fa-minus")) {
                            $(this).attr("class", "fa fa-plus");
                            var next = $(this).parent("li.treeline").closest("div.icon").nextUntil("div");
                            next.slideUp()
                        } else {
                            $(this).attr("class", "fa fa-minus");
                            var next = $(this).parent("li.treeline").closest("div.icon").nextUntil("div");
                            next.slideDown()
                        }
                    })
                };

                var viewsectiontree = function() {
                    $.each(treesectionArray, function(i, data) {
                        checkdraft = data["draft"];
                        if (!checkdraft)
                            if (treesectionArray.length) {
                                var contentHTML = "<div style='display:none'>" + data["label_names"] + "</div><a href=" + data["url"] + ">" + data["name"] + "</a>";
                                var list = $("<li></li>").addClass("treeline").html(contentHTML);
                                showData.css("display", "none").append(list)
                            }
                    })
                };

                var loadsectiontree = function() {
                    $("#sectionloader").css("display", "block");
                    if (sessionStorage.getItem(HelpCenter.user.email + "-Tree-" + currSectionId + helpCenterVer + currentLang) === null) $.get(sectionApiURL).done(function(data) {
                        sectionApiURL = data.next_page;
                        checkpage = data["page"];
                        var newArray = $.map(data.articles, function(result, i) {
                            return {
                                "id": result.id,
                                "name": result.name,
                                "url": result.html_url,
                                "position": result.position,
                                "draft": result.draft,
                                "body": result.body,
                                "label_names": result.label_names,
                                "title": result.title
                            }
                        });
                        treesectionArray = $.merge(treesectionArray, newArray);
                        if (sectionApiURL !== null) loadsectiontree();
                        else {
                            sessionStorage.setItem(HelpCenter.user.email + "-Tree-" + currSectionId + helpCenterVer + currentLang, JSON.stringify(treesectionArray));
                            viewsectiontree();
                            cleanWrap(treelist);
                            iconize();
                            expand()
                        }
                    });
                    else {
                        treesectionArray = JSON.parse(sessionStorage.getItem(HelpCenter.user.email + "-Tree-" + currSectionId + helpCenterVer + currentLang));
                        viewsectiontree();
                        cleanWrap(treelist);
                        iconize();
                        expand()
                    }
                };

                $("ul.article-list").after(" <ul id='show-data' class='article-list'></ul>");
                $("ul#show-data").append("<ul id='sectionloader' style='display:none' ><img src='" + gSZMKspingreyGIFURL + "' style='border:0px; padding:30px 0px'></ul>");
                $("body.support_kb").find("ul.article-list:first").hide();

                var currSectionId = currPageURL.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];
                var sectionApiURL = "/api/v2/help_center/" + currentLang + "/sections/" + currSectionId + "/articles.json?sort_by=position&sort_order=asc";
                var showData = $("#show-data");
                var treelist = $("body.support_kb").find("#treelist");
                var treesectionArray = [];

                loadsectiontree();

                $("#show-data").prepend('<p class="bodytext" style="display:none;">[<a id="anchor-expand" class="jump2">&nbsp;&nbsp;&nbsp;Expand All</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<a class="jump" id="anchor-collapse">Collapse All</a>&nbsp;&nbsp;&nbsp;]</li>');
                $("#anchor-expand").click(function() {
                    $("div.icon li.treeline").find("i").attr("class", "fa fa-minus");
                    $("body.support_kb").find("ul#show-data li.treeline").prev("div.icon").nextUntil("div").slideDown("slow", "swing", function() {})
                });
                $("#anchor-collapse").click(function() {
                    $("div.icon li.treeline").find("i").attr("class", "fa fa-plus");
                    $("body.support_kb").find("ul#show-data li.treeline").prev("div.icon").nextUntil("div").slideUp(1E3, function() {})
                })
            }

            function breadcrumbsDropdown() {

                if (!isSectionPage) {
                    $("ol.breadcrumbs").find("li:eq(2)").append('<div id="bread-dropdown" class="dropdown"></div>');
                    $("ol.breadcrumbs").find("li:eq(2)").find("a.breadcrumbsShow").attr("href", "#");
                    $("#bread-dropdown").prepend('<i class="fa fa-angle-down dropbtn" ></i>');
                    $(".dropbtn").prepend('<div id="bread-drop" class="dropdown-content"></div>');
                }

                $(".sub-nav a:eq(2)").addClass("breadcrumbsHidden");

                $(document).click(function() {
                    if ($(".sub-nav a:eq(2)").hasClass("breadcrumbsShow")) {
                        $(".sub-nav a:eq(2)").removeClass("breadcrumbsShow").addClass("breadcrumbsHidden");
                        $("ol.breadcrumbs li:eq(2)").find("#bread-drop").hide();
                    }
                });

                $(".sub-nav a:eq(2)").click(function() {
                    if ($(this).hasClass("breadcrumbsHidden")) {
                        $(this).removeClass("breadcrumbsHidden").addClass("breadcrumbsShow");
                        $("ol.breadcrumbs li:eq(2)").find("#bread-drop").show();
                    } else if ($(this).hasClass("breadcrumbsShow")) {
                        $(this).removeClass("breadcrumbsShow").addClass("breadcrumbsHidden");
                        $("ol.breadcrumbs li:eq(2)").find("#bread-drop").hide();
                    }
                    event.stopPropagation();
                });

                $(".sub-nav").find("i").click(function() {
                    if ($(".sub-nav a:eq(2)").hasClass("breadcrumbsHidden")) {
                        $(".sub-nav a:eq(2)").removeClass("breadcrumbsHidden").addClass("breadcrumbsShow");
                        $("ol.breadcrumbs li:eq(2)").find("#bread-drop").show();
                    } else if ($(".sub-nav a:eq(2)").hasClass("breadcrumbsShow")) {
                        $(".sub-nav a:eq(2)").removeClass("breadcrumbsShow").addClass("breadcrumbsHidden");
                        $("ol.breadcrumbs li:eq(2)").find("#bread-drop").hide();
                    }
                    event.stopPropagation();
                });

                $("ol.breadcrumbs li:eq(2)").click(function() {
                    $("ol.breadcrumbs li:eq(2)").find("#bread-drop").toggleClass("show");
                });

                window.onclick = function(event) {
                    if (!event.target.matches(".dropbtn")) {
                        var dropdowns = document.getElementsByClassName("dropdown-content");
                        var i;
                        for (i = 0; i < dropdowns.length; i++) {
                            var openDropdown = dropdowns[i];
                            if (openDropdown.classList.contains("show")) openDropdown.classList.remove("show");
                        }
                    }
                }
            }

            breadcrumbsDropdown();

            function resetNav() {
                $("#sideNavigation").css("display", "none");
                $("body").find("main").css("width", "calc(100%)");
            }

            function uiresize() {
                var w = $("body").width() - $("#sideNavigation").width();
                $("main").css("width", w - 52 + "px");
            }(function() {
                try {
                    $("#sideNavigation").resizable({
                        resize: function(event, ui) {
                            uiresize();
                            var w = $("#sideNavigation").width();
                            $("#sidefoot").css("width", w + 2 + "px")
                        },
                        handles: "e"
                    })
                } catch (err) {
                    setTimeout(arguments.callee, 200);
                }
            })();

            var nav = $("#sideNavigation");
            var header = $(".header");
            var header2 = $(".header").height();
            var footer = $(".footer").height();
            var pos = nav.position();
            var maxScroll = $(document).height() - window.innerHeight;
            var footerh = window.innerHeight - footer;
            var headerh = window.innerHeight - header2;
            var mid_header = headerh / 2;
            var mid_footer = footerh / 2;
            var mid_full = window.innerHeight / 2;

            $("#sideNavigation").scroll(function() {
                $(".ui-resizable-e").css("top", $("#sideNavigation").scrollTop() + "px")
            });

            $("#nav-list > li  > ul > li > a").each(function() {
                $(this).attr("title", $(this).text());
            });

            $("#nav-list").on("click", "i", function() {
                if ($(this).hasClass("fa-angle-down")) {
                    $(this).attr("class", "fa fa-angle-right");
                    $(this).removeClass("fa-angle-down");
                    if ($(this).parent("li.treelist").length);
                    else $(this).next("a").nextUntil("li").slideUp()
                } else {
                    $(this).attr("class", "fa fa-angle-down");
                    $(this).removeClass("fa-angle-right");
                    if ($(this).parent("li.treelist").length);
                    else $(this).next("a").nextUntil("li").slideDown()
                }
            });

            $("#nav-list").on("click", "a.categoryDrop", function() {
                if ($(this).parent().find("i").eq(0).hasClass("fa-angle-down")) {
                    $(this).parent().find("i").eq(0).attr("class", "fa fa-angle-right");
                    if ($(this).parent("li.treelist").length) {
                        var slide = $(this).nextUntil("div");
                        slide.slideUp();
                    } else $(this).nextUntil("li").slideUp()
                } else {
                    $(this).parent().find("i").eq(0).attr("class", "fa fa-angle-down");
                    if ($(this).parent("li.treelist").length) {
                        var slide = $(this).nextUntil("div");
                        slide.slideDown();
                    } else $(this).nextUntil("li").slideDown()
                }
            });

            $("#nav-list").on("click", "a.sectionDrop", function() {
                if ($(this).parent().find("i").eq(0).hasClass("fa-angle-down")) {
                    $(this).parent().find("i").eq(0).attr("class", "fa fa-angle-right");
                    if ($(this).parent("li.treelist").length) {
                        var slide = $(this).nextUntil("div");
                        slide.slideUp();
                    } else $(this).nextUntil("li").slideUp()
                } else {
                    $(this).parent().find("i").eq(0).attr("class", "fa fa-angle-down");
                    if ($(this).parent("li.treelist").length) {
                        var slide = $(this).nextUntil("div");
                        slide.slideDown();
                    } else $(this).nextUntil("li").slideDown()
                }
            });

            //test
            if (currPageURL.indexOf("/articles/") > -1) {
                $('.confluence-information-macro.confluence-information-macro-note').removeAttr('class').addClass('note');
                $('.confluence-information-macro.confluence-information-macro-warning').removeAttr('class').addClass('important');
                currArticleId = currPageURL.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];
                if ($("#sideNavigation").length) {

                    if ($(".sub-group-list li[id=" + currArticleId + "]").length) {

                        $(".sub-group-list li a").css({
                            "color": "#accfff",
                            "font-weight": "normal"
                        });

                        $(".sub-group-list li[id=" + currArticleId + "]").find("a").css({
                            "color": "#FFF",
                            "font-weight": "bold"
                        });

                        dataloaded = 1

                    } else if (NavCatArrayready) {

                        for (var i = 0; i < navsecArray.length; i++) {

                            if (navsecArray[i].id === originalSectionID) {
                                getNavCatId = navsecArray[i].category;
                                (function() {
                                    selectCatId = $("#nav-list #" + getNavCatId);
                                    if (selectCatId.length > 0) {

                                        selectCatId = $("#nav-list #" + getNavCatId);
                                    } else {

                                        setTimeout(arguments.callee, 200);
                                    }
                                }())

                                addSectionToList(originalSectionID);

                                break;
                            }
                        }
                    }
                }

            } else if (isSectionPage) {

                var originalSectionID = currPageURL.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];

                if ($("#sideNavigation").length) {

                    if ($(".group-list li[id=" + originalSectionID + "]").length) {

                        $(this).parent("ul.group-list").css({
                            "display": "block",
                            "overflow": "hidden"
                        });

                        $(this).parent().parent().parent().parent().find("a").eq(0).click();

                        $(this).find("ul.sub-group-list").css({
                            "display": "block",
                            "overflow": "hidden"
                        });

                        $(".group-list li[id=" + originalSectionID + "]").find("a").css({
                            "color": "#FFF",
                            "font-weight": "bold"
                        }).click()

                    } else if (NavCatArrayready) {

                        $.each(navsecArray, function(i, section) {
                            if (section["id"] == originalSectionID) {
                                getNavCatId = section["category"];
                                selectCatId = $("#" + getNavCatId);
                                addSectionToList();
                                openSection = function() {
                                    if (selectCatId.length) {
                                        $("#nav-list").find(selectCatId).children("ul").css("display", "block");
                                        getnavSecId = originalSectionID;
                                        selectSecId = $("#" + getnavSecId).find(".sub-group-list");
                                        $("#nav-list li[id=" + originalSectionID + "]").children("a").css({
                                            "color": "#FFF",
                                            "font-weight": "bold"
                                        });
                                        if (!originalSectionID) {
                                            instantiateTree();
                                        }
                                        if (selectCatId.parent("#nav-list").length == 1) {} else {
                                            selectCatId.parent().parent().children("ul").css("display", "block");
                                        }
                                    } else setTimeout(arguments.callee, 200);
                                }
                            }
                        });
                    }
                }
            }
            //end test

            function sectionListStorage() {
                if (storage.getItem(HelpCenter.user.email + "-allSections" + helpCenterVer + currentLang) === null) {
                    $.get(navSectionAPI).done(function(data) {
                        navSectionAPI = data.next_page;
                        var navnewArray = $.map(data.sections, function(section, i) {
                            return {
                                "id": section.id,
                                "name": section.name,
                                "category": section.category_id,
                                "url": section.html_url,
                                "description": section.description,
                                "position": section.position
                            }
                        });

                        navsecArray = $.merge(navnewArray, navsecArray);

                        if (navSectionAPI !== null) {
                            navSectionAPI += "&per_page=100";
                            sectionListStorage();
                        } else {
                            navsecArray.sort(function(a, b) {
                                return a.position - b.position
                            });
                            storage.setItem(HelpCenter.user.email + "-allSections" + helpCenterVer + currentLang, JSON.stringify(navsecArray));
                            NavCatArrayready = 1;
                        }
                        if (currentUser === "anonymous") {
                            navsecArray = removeDuplicates(navsecArray, 'id');
                        }
                    });

                } else {
                    navsecArray = JSON.parse(storage.getItem(HelpCenter.user.email + "-allSections" + helpCenterVer + currentLang));
                    if (currentUser === "anonymous") {
                        navsecArray = removeDuplicates(navsecArray, 'id');
                    }
                    NavCatArrayready = 1;
                }
            }

            //remove duplicate object
            function removeDuplicates(myArr, prop) {
                return myArr.filter(function(obj, pos, arr) {
                    return arr.map(function(mapObj) {
                        return mapObj[prop]
                    }).indexOf(obj[prop]) === pos;
                });
            }

            sectionListStorage();
            var secloadstatus = 0;

            function addSectionToList(sectionID) {
                var plat = $("#switchTag").val();

                selectCatId = $("#nav-list #" + getNavCatId);

                if (plat == "mdx_2_0") var hidePlat = "@mdxnxt";
                else var hidePlat = "@mdx2";

                $("#nav-list").find(selectCatId).find(".group-list").empty();
                $("#nav-list").find(selectCatId).find(".group-list").hide();

                var chkinit = 0,
                    chkcomplete = 0,
                    sArr = [];

                if (currentUser !== "anonymous") {

                    $(selectCatId).find("i.fa").addClass("fa-circle-o-notch fa-spin faLoader");

                    $("a.categoryDrop").prop("disabled", true);
                    $("i#icon-category").prop("disabled", true);
                }
                $.each(navsecArray, function(i, section) {
                    var descriptionValid = true;
                    if (section.description) {
                        if (section.description.indexOf("hidden") > 0 - 1 && section["description"].indexOf(hidePlat) > -1) {
                            descriptionValid = false;
                        }
                    }
                    if (descriptionValid && section["category"] == getNavCatId) {
                        chkinit++;

                        $.getJSON("/api/v2/help_center/articles/search.json?section=" + section["id"]).done(function(articles) {
                            var isSectionValid = false;
                            var selectedPlatform = $("#switchTag").val(),
                                currPlat = selectedPlatform,
                                otherPlat = "";

                            if (selectedPlatform == "mdx_2_0") {
                                currPlat = "mdx2";
                                otherPlat = "mdx_nxt";
                            } else {
                                otherPlat = "mdx2";
                            }

                            for (var i = 0, len = articles.results.length; i < len; i++) {
                                var currentLabels = articles.results[i].label_names;
                                if (currPlat === "mdx_nxt") {
                                    if ((currentLabels.includes(currPlat) || currentLabels.includes("mdxnxt")) || !currentLabels.includes(otherPlat)) {
                                        isSectionValid = true;
                                        break;
                                    }
                                } else {
                                    if (currentLabels.includes(currPlat) || !(currentLabels.includes("mdxnxt")) || currentLabels.includes(otherPlat)) {
                                        isSectionValid = true;
                                        break;
                                    }
                                }
                            }

                            if (isSectionValid) {
                                var title = cleanTextOnly(cleanTextOnly(section["name"]));
                                sArr.push(['<li class="section" id="' + section["id"] + '"><i id="icon-section" class="fa fa-angle-right"> </i> <a title="' + title + '" class="sectionDrop">' + cleanTextOnly(section["name"]) + '</a><ul class="sub-group-list" style="overflow: hidden; display:none;"></ul></li>', section.position])
                            }

                            chkcomplete++;
                            if (chkinit == chkcomplete) {
                                sArr.sort(function(a, b) {
                                    return a[1] - b[1]
                                });
                                $.each(sArr, function(i, v) {
                                    $("#nav-list").find(selectCatId).find(".group-list").append(v[0]);
                                })
                                $("#nav-list").find(selectCatId).find(".group-list").slideDown();

                                $(selectCatId).find("i.fa").removeClass("fa-circle-o-notch fa-spin faLoader");

                                $("a.categoryDrop").prop("disabled", false);
                                $("i#icon-category").prop("disabled", false);

                                postAddSectionToList(sectionID);
                                if (isSectionPage) {
                                    openSection();
                                }
                            }
                        })
                    }
                });
                if (isInURL("/categories")) {
                    openCategory();
                }
                secloadstatus = 0;
            }

            $("#nav-list").on("click", "i#icon-category", function() {
                if (secloadstatus == 0)
                    if ($(this).nextAll("ul").eq(0).find("li").length == 0) {
                        secloadstatus = 1;
                        if ($(this).parent("li").hasClass("category")) {
                            getNavCatId = $(this).parent("li.category").attr("id");
                            selectCatId = $("#" + getNavCatId);
                            addSectionToList();
                        }
                    } else secloadstatus = 0;
            });

            $("#nav-list").on("click", "a.categoryDrop", function() {
                if (secloadstatus == 0)
                    if ($(this).nextAll("ul").eq(0).find("li").length == 0) {
                        secloadstatus = 1;
                        if ($(this).parent("li").hasClass("category")) {
                            getNavCatId = $(this).parent("li.category").attr("id");
                            selectCatId = $("#" + getNavCatId);
                            addSectionToList()
                        }
                    } else secloadstatus = 0;
            });

            var artloadstatus = 0;

            $("#nav-list").on("click", "i#icon-section", function() {
                if ($(this).nextAll("ul").eq(0).find("li").length == 0) {
                    if ($(this).parent("li").hasClass("section")) {
                        getnavSecId = $(this).parent("li.section").attr("id");
                        selectSecId = $("#" + getnavSecId).find(".sub-group-list");
                        if ($("#nav-list").find(selectSecId).length) {
                            if (artloadstatus == 0) {
                                if ($(selectSecId).find("loader").length) {} else {
                                    $("#" + getnavSecId).find("i.fa").addClass("fa-circle-o-notch fa-spin faLoader");
                                }
                                $("a.sectionDrop").prop("disabled", true);
                                $("i#icon-section").prop("disabled", true);
                                artloadstatus = 1;
                                instantiateTree();
                            }
                            $("#nav-list").find(selectSecId).attr("id", getnavSecId);
                        }
                    }
                }
                waitLoadContent($(this));
            });

            $("#nav-list").on("click", "a.sectionDrop", function() {
                if ($(this).nextAll("ul").eq(0).find("li").length == 0)
                    if ($(this).parent("li").hasClass("section")) {
                        getnavSecId = $(this).parent("li.section").attr("id");
                        selectSecId = $("#" + getnavSecId).find(".sub-group-list");
                        if ($("#nav-list").find(selectSecId).length) {
                            if (artloadstatus == 0) {
                                if ($(selectSecId).find("loader").length) {} else {
                                    $("#" + getnavSecId).find("i.fa").addClass("fa-circle-o-notch fa-spin faLoader");
                                }
                                $("a.sectionDrop").prop("disabled", true);
                                $("i#icon-section").prop("disabled", true);
                                artloadstatus = 1;
                                instantiateTree()
                            }
                            $("#nav-list").find(selectSecId).attr("id", getnavSecId)
                        }
                    }
                waitLoadContent($(this));
            });

            function waitLoadContent(element) {
                var currArticleID = "";

                if (isInURL("/articles/")) currArticleID = currPageURL.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];

                if (currArticleID == "" || currArticleID !== null && $(this).parent().find(".p-" + currArticleID).length == 0) {

                    var self = element;

                    if (NavArtArrayready == 0) {
                        self.parent = element.parent();
                        self.wait = setInterval(function() {
                            if (NavArtArrayready == 1) {
                                self.parent.find("li.loc i").removeClass("fa-angle-right").addClass("fa-angle-down");
                                self.parent.find("li.loc-1 i").click();
                                clearInterval(self.wait)
                            }
                        }, 20)

                    } else if (artloadstatus == 1) {
                        self.parent = element.parent();
                        self.wait = setInterval(function() {
                            if (artloadstatus == 0) {
                                self.parent.find("li.loc i").removeClass("fa-angle-right").addClass("fa-angle-down");
                                self.parent.find("li.loc-1 i").click();
                                clearInterval(self.wait)
                            }
                        }, 20)

                    } else {
                        element.parent().find("li.loc i").removeClass("fa-angle-right").addClass("fa-angle-down");
                        element.parent().find("li.loc-1 i").click()
                    }
                }
            }

            function getLeastLoc(locs) {

                var locArray = [],
                    ret;

                locs.each(function() {
                    var className = $(this).attr("class");
                    if ((x = className.toLowerCase().indexOf("loc-")) > -1) {
                        var loc = "";
                        for (; x < className.length && className[x] != " "; x++) loc += className[x];
                        locArray.push(loc.replace(/^\D+/g, ""))
                    }
                });

                if (locArray.length > 0) ret = Math.min.apply(null, locArray);
                else ret = "";

                return ret
            }

            var dataloaded = 1;

            window.onpopstate = function(event) {
                var state = JSON.stringify(event.state);
                if (state === null);
                else var state2 = JSON.parse(state)
            };

            checkHelpTopicAvail();

            function checkHelpTopicAvail() {

                if (sessionStorage.getItem('hasHT') == null) {
                    $.get("/api/v2/help_center/" + currentLang + "/categories/" + gSZMKHelpTopicCatID + "/sections.json").done(function(res) {
                        if (res.sections.length > 0) {
                            sessionStorage.setItem('hasHT', 1);
                        } else {
                            sessionStorage.setItem('hasHT', 0);
                            $("li.category#" + gSZMKHelpTopicCatID).remove();
                        }
                    });

                } else {
                    var hasHelpTopics = sessionStorage.getItem('hasHT');
                    if (hasHelpTopics == 0) {
                        $("li.category#" + gSZMKHelpTopicCatID).remove();
                    }
                }
            }

            var attachmentsArray;

            function attachments() {

                attachmentsArray = [];
                attachmentsAPI = "/api/v2/help_center/" + currentLang + "/articles/" + getnavArticleId + "/attachments/block.json";

                function loadAttachments() {
                    if (sessionStorage.getItem(HelpCenter.user.email + "-Attachments-" + getnavArticleId + helpCenterVer + currentLang) === null) $.get(attachmentsAPI).done(function(data) {
                        var newArray = $.map(data.article_attachments, function(result, i) {
                            return {
                                "display_file_name": result.display_file_name,
                                "file_name": result.file_name,
                                "content_url": result.content_url,
                                "size": result.size
                            }
                        });
                        attachmentsArray = $.merge(attachmentsArray, newArray);
                        sessionStorage.setItem(HelpCenter.user.email + "-Attachments-" + getnavArticleId + helpCenterVer + currentLang, JSON.stringify(attachmentsArray));
                        placeAttachments();
                    });
                    else {
                        attachmentsArray = JSON.parse(sessionStorage.getItem(HelpCenter.user.email + "-Attachments-" + getnavArticleId + helpCenterVer + currentLang));
                        placeAttachments();
                    }
                }

                loadAttachments();
            }

            function placeAttachments() {

                $.each(attachmentsArray,
                    function(i, data) {
                        if (attachmentsArray.length) {
                            var formatBytes = function(bytes) {
                                if (bytes < 1024) return bytes + " Bytes";
                                else if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
                                else if (bytes < 1073741824) return (bytes / 1048576).toFixed(0) + " MB";
                                else return (bytes / 1073741824).toFixed(0) + " GB"
                            };
                            var hold = document.createElement("href");
                            var hold = document.createElement("target");
                            var hold = document.createElement("a");
                            var size = document.createElement("span");
                            var value = data["size"];
                            var temp = document.createTextNode(data["file_name"]);
                            var tempsize = document.createTextNode(" (" + formatBytes(value) + ")");
                            hold.target = "_blank";
                            hold.href = data["content_url"];
                            hold.appendChild(temp);
                            size.appendChild(tempsize);
                            var list = document.createElement("li");
                            list.className = "treelist";
                            list.appendChild(hold);
                            list.appendChild(size);
                            $(".article-attachments > .attachments").prepend(list);
                        }
                    })
            }

            function highlightTitle() {
                if (window.location.href.indexOf("articles/") > 0) {

                    var currArticleId = window.location.href.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];

                    if ($("#nav-list li#" + currArticleId).parent(".sub-group-list").parent().attr('id') == currSectionId) {

                        if ($("#nav-list li#" + currArticleId).length === 0) {
                            $("#nav-list li#" + getnavSecId).children('i')
                        }

                        if ($("#nav-list li#" + currArticleId).length > 0) {
                            var allNextLoc = $("#nav-list li#" + currArticleId).nextAll("li.loc"),
                                allPrevLoc = $("#nav-list li#" + currArticleId).prevAll("li.loc.has-arrow"),
                                currArticleLoc = parseInt($("#nav-list li#" + currArticleId).attr("class").replace("treelist loc ", "").split(" ", 1).toString().replace("loc-", "").toString()),
                                parentId1 = $("li#" + currArticleId).prevAll("li.loc.loc-" + (currArticleLoc - 1) + ".has-arrow").first().attr("id");

                            parentId2 = $("li#" + currArticleId).prevAll("li.loc.loc-" + (currArticleLoc - 2) + ".has-arrow").first().attr("id");
                            parentId3 = $("li#" + currArticleId).prevAll("li.loc.loc-" + (currArticleLoc - 3) + ".has-arrow").first().attr("id");

                            allNextLoc.each(function() {
                                $(this).find(">i").removeClass("fa-angle-right");
                                $(this).find(">i").click();
                            });

                            allPrevLoc.each(function() {
                                $(this).attr("id") != parentId1 && $(this).attr("id") != parentId2 && $(this).attr("id") != parentId3 && ($(this).find(">i").removeClass("fa-angle-right"), $(this).find(">i").click())
                            });

                            $("li#" + currArticleId).find('i').addClass("fa fa-angle-right").click();

                            var menu = $("#" + currArticleId).closest("#nav-list > li").find("ul");

                            $("#" + currArticleId).closest("#nav-list > li").find("i").eq(0).removeClass("fa-angle-right").addClass("fa-angle-down");
                            $("#" + currArticleId).closest(".category").find("i").eq(0).removeClass("fa-angle-right").addClass("fa-angle-down");
                            $("#" + currArticleId).closest(".section").find("i").eq(0).removeClass("fa-angle-right").addClass("fa-angle-down");
                            $(".sub-group-list .icon li[id=" + currArticleId + "]").length || $("#nav-list li[id=" + currArticleId + "]").css({
                                display: "block",
                                overflow: "hidden"
                            });

                            $("#nav-list li[id=" + currArticleId + "]").find("a").css({
                                color: "#FFF",
                                "font-weight": "bold"
                            });

                            $("#nav-list li[id=" + currArticleId + "]").find("i").removeClass("fa-angle-right");
                            $("li[id=" + currArticleId + "]").parent("ul.sub-group-list").css({
                                display: "block",
                                overflow: "hidden"
                            });

                            $("li[id=" + currArticleId + "]").parent("ul.sub-group-list").parent(".group-list").css({
                                display: "block",
                                overflow: "hidden"
                            });

                            $("li[id=" + currArticleId + "]").parent(".icon").parent("ul.sub-group-list").css({
                                display: "block",
                                overflow: "hidden"
                            });

                            $("li[id=" + currArticleId + "]").parent(".maintopic").parent("ul.sub-group-list").css({
                                display: "block",
                                overflow: "hidden"
                            });

                            setTimeout(function() {
                                $("#" + currArticleId).closest("#nav-list > li").css("background-color", "rgb(0, 25, 55)");
                                $("#" + currArticleId).closest("#nav-list > li").find("a").eq(0).css("color", "white");
                                $(menu[0]).slideDown();
                            }, 250)

                            $(".fa-angle-down").removeClass("fa-angle-right");

                            dataloaded = 1;
                        }
                    }
                }
            }

            function formatSideBar() {

                if (HelpCenter.user.role == "anonymous" && ($("#switchTag").val() == "mdx_2_0" || $("#switchTag").val() == "mdx_nxt")) {

                    var menucat = [],
                        navseccat = [],
                        currentPlatform;

                    if ($("#switchTag").val() == "mdx_2_0") {
                        currentPlatform = menuObject.mdx2;
                    } else if ($("#switchTag").val() == "mdx_nxt") {
                        currentPlatform = menuObject.sas;
                    } else if ($("#switchTag").val() == "newdsp") {
                        currentPlatform = menuObject.newDsp;
                    } else if ($("#switchTag").val() == "dsp") {
                        currentPlatform = menuObject.dsp;
                    } else if ($("#switchTag").val() == "dmp") {
                        currentPlatform = menuObject.dmp;
                    }

                    currentPlatform.forEach(function(data) {

                        if (data.type == "category") {
                            menucat.push(data.id);
                        }

                        if (data.children) {
                            for (var i = 0, len = data.children.length; i < len; i++) {
                                if (data.children[i].type == "category") {
                                    menucat.push(data.children[i].id);
                                }
                            }
                        }

                    }), $.each(navsecArray, function(i, section) {

                        navseccat.push(section["category"]);

                    }), $.each(menucat, function(i, val) {

                        if ($.inArray(parseInt(val), navseccat) == -1) {
                            $('#' + val).remove();
                        }
                    })

                    $("#nav-list").children('li').each(function() {
                        if ($(this).find('li').length < 1 && !($(this).hasClass("firstLi") || $(this).hasClass('last-list'))) {
                            $(this).remove();
                        }
                    })

                    if (!navseccat.length) {

                        sectionListStorage();

                        (function() {
                            if (navsecArray.length > 0) {
                                $.each(navsecArray, function(i, section) {
                                    navseccat.push(section.category);
                                });
                                $('.firstLi').remove();
                                $("#nav-list").prepend(stringifiedDOM);
                                $("#nav-list").children('li').each(function() {
                                    $(this).children('ul').children("li").each(function() {
                                        var currentCatID = parseInt($(this).attr('id'));
                                        if (!navseccat.includes(currentCatID)) {
                                            $(this).remove();
                                        }
                                    })
                                })
                                $("#nav-list").children('li').each(function() {
                                    if ($(this).find('li').length < 1 && !($(this).hasClass("firstLi") || $(this).hasClass('last-list'))) {
                                        $(this).remove();
                                    }
                                })
                            } else {
                                setTimeout(arguments.callee, 100);
                            }
                        })()

                    }
                }
            }

            formatSideBar();

            function instantiateTree() {
                var navsectionArray = [];
                selectSecId = $("#" + getnavSecId).find(".sub-group-list");
                currSectionId = getnavSecId;
                treelist = $(".treelist");
                navsectionApiURL = "/api/v2/help_center/" + currentLang + "/sections/" + currSectionId + "/articles.json?sort_by=position&sort_order=asc";
                if (currSectionId !== 201949563 && currSectionId !== undefined) loadnavsectiontree();

                function loadnavsectiontree() {
                    if (sessionStorage.getItem(HelpCenter.user.email + "-Tree-" + currSectionId + helpCenterVer + currentLang) === null) {

                        $.get(navsectionApiURL).done(function(data) {
                            navsectionApiURL = data.next_page;
                            checkpage = data["page"];
                            var newArray = $.map(data.articles, function(result, i) {
                                return {
                                    "id": result.id,
                                    "name": result.name,
                                    "url": result.html_url,
                                    "position": result.position,
                                    "draft": result.draft,
                                    "label_names": result.label_names,
                                    "title": result.title,
                                    "updated_at": result.updated_at
                                }
                            });
                            navsectionArray = $.merge(navsectionArray, newArray);
                            if (navsectionApiURL !== null) loadnavsectiontree();
                            else {
                                sessionStorage.setItem(HelpCenter.user.email + "-Tree-" + currSectionId + helpCenterVer + currentLang, JSON.stringify(navsectionArray));
                                CreateArticleList();
                                cleanWrap(treelist);
                                addIcons();
                                AddListToggle();
                                groupArticleList();
                                $("#" + currSectionId).find("i.fa").removeClass("fa-circle-o-notch fa-spin faLoader");
                                NavArtArrayready = 1;
                                artloadstatus = 0;
                                highlightTitle();
                                $("a.sectionDrop").prop("disabled", false);
                                $("i#icon-section").prop("disabled", false);
                            }
                        });
                    } else {
                        navsectionArray = JSON.parse(sessionStorage.getItem(HelpCenter.user.email + "-Tree-" + currSectionId + helpCenterVer + currentLang));

                        CreateArticleList();
                        cleanWrap(treelist);
                        addIcons();
                        AddListToggle();
                        groupArticleList();

                        $("#" + currSectionId).find("i.fa").removeClass("fa-circle-o-notch fa-spin faLoader");

                        NavArtArrayready = 1;
                        artloadstatus = 0;

                        highlightTitle();

                        $("a.sectionDrop").prop("disabled", false);
                        $("i#icon-section").prop("disabled", false);
                    }
                }

                function addtosidenav() {

                    $.each(navsectionArray, function(i, data) {
                        checkdraft = data["draft"];
                        if (!checkdraft)
                            if (navsectionArray.length) {
                                var hold = document.createElement("href");
                                var hold = document.createElement("id");
                                var hold = document.createElement("a");
                                var temp = document.createTextNode(cleanTextOnly(data["name"]));
                                if (data["name"].length > 35) hold.title = cleanTextOnly(data["name"]);
                                hold.className = "nav-line";
                                hold.id = data["id"];
                                hold.href = data["url"];
                                hold.appendChild(temp);
                                var list = document.createElement("id");
                                var list = document.createElement("li");
                                list.className = "treelist";
                                list.id = data["id"];
                                list.appendChild(hold);
                                selectSecId.append(list)
                            }
                    })
                }

                //redundant vars Pix and Ar??
                //var Pix, Ar;
                //var articleParentID;
                var locParent;

                function CreateArticleList() {

                    selectSecId.children("li").remove();

                    function extractLocLevel(labels) {

                        var locLevel = 1;

                        if (labels.length > 0)
                            for (var hasLoc = 0, x = 0; x < labels.length && hasLoc == 0; x++)
                                if (labels[x].toLowerCase().indexOf("loc") > -1) {
                                    hasLoc = 1;
                                    if (labels[x].toLowerCase().indexOf("loc_parent") < 0) {
                                        locLevel = parseInt(labels[x].replace(/\D+/g, ""));
                                        locParent = 0;
                                    } else {
                                        locParent = 1;
                                    }
                                }

                        return [locLevel, locParent];
                    }
                    var parentIDArr = [];

                    if (navsectionArray.length > 0) parentIDArr.push(navsectionArray[0].id);

                    $('#' + currSectionId).find("ul").first().hide();

                    $.each(navsectionArray, function(idx, value) {

                        if (checkdraft = value.draft, !checkdraft && navsectionArray.length && value.label_names.indexOf("hidden") === -1) {

                            var margin = 20;

                            //redundant vars Pix and Ar??
                            //Pix = 13, Ar = value.label_names;
                            var a, v = value.label_names,
                                labelArray = v.toString().split(",");

                            var doesLabelMatch = checkProductInLabels(labelArray);

                            if (!doesLabelMatch) {
                                return true;
                            }

                            a = "";

                            var parentID;
                            var locResult = extractLocLevel(labelArray);
                            var currentArtLevel = locResult[0];
                            var currentArtP = locResult[1];
                            var currentID = value.id;

                            if (idx <= navsectionArray.length - 2) {

                                var nextLabels = navsectionArray[idx + 1].label_names;
                                var nextArtLabels = nextLabels.toString().split(",");
                                var locResultNext = extractLocLevel(nextArtLabels);
                                var nextArtLevel = locResultNext[0];
                                var nextArtP = locResultNext[1];

                                if (currentArtLevel == nextArtLevel) {
                                    if (currentArtLevel == 1) {
                                        parentIDArr = [];
                                        parentIDArr.push(currentID);
                                        parentID = parentIDArr[parentIDArr.length - 1];
                                        a = "active"
                                    }
                                    parentID = parentIDArr[parentIDArr.length - 1];

                                } else if (nextArtLevel > currentArtLevel) {
                                    if (currentArtLevel == 1) {
                                        parentIDArr = [];
                                        parentID = currentID;
                                        parentIDArr.push(currentID);
                                    }
                                    parentID = parentIDArr[parentIDArr.length - 1];
                                    parentIDArr.push(currentID);

                                } else if (nextArtLevel < currentArtLevel) {
                                    parentID = parentIDArr[parentIDArr.length - 1];
                                    if (nextArtLevel == 1) {
                                        parentID = parentIDArr[parentIDArr.length - 1];
                                        parentIDArr = []
                                    }

                                    var k = currentArtLevel - nextArtLevel;

                                    while (k != 0) {
                                        parentIDArr.pop();
                                        k--;
                                    }
                                }

                            } else {

                                if (currentArtLevel == 1) {
                                    parentIDArr = [];
                                    parentIDArr.push(currentID);
                                    parentID = parentIDArr[parentIDArr.length - 1]
                                }

                                parentID = parentIDArr[parentIDArr.length - 1];
                            }

                            if ($('#nav-list #' + parentID).hasClass('loc-' + currentArtLevel)) {

                                currentArtLevel = 1;

                                typeof InstallTrigger !== 'undefined' ? $('#' + parentID).attr("style", "margin-left:22px !important") : $('#' + parentID).attr("style", "margin-left:18px !important");

                            } else if ($('#nav-list #' + parentID).length > 0) {
                                currentArtLevel = parseInt($('#nav-list #' + parentID).attr("class").replace("treelist loc ", "").split(" ", 1).toString().replace("loc-", "").toString()) + 1;
                            }

                            value.name = value.name.replace("loc_" + currentArtLevel, "");

                            var cn = "treelist loc loc-" + currentArtLevel + " p-" + parentID + " " + a;
                            var anchorElem = document.createElement("a");
                            var txtNode = document.createTextNode(value.name);

                            anchorElem.className = "nav-line", anchorElem.id = value.id, anchorElem.href = value.url, anchorElem.title = value.name, anchorElem.appendChild(txtNode);

                            if (currentArtP) {
                                anchorElem.href = "javascript:void(0); ";
                                $(anchorElem).click(function() {
                                    this.previousSibling.click();
                                });
                            }

                            var listElem = document.createElement("li")

                            listElem.className = cn, listElem.id = value.id, listElem.appendChild(anchorElem);
                            selectSecId.append(listElem);
                        }

                        if (navsectionArray.length > 0) $('#' + currSectionId).find("ul").first().slideDown();
                    })
                }

                function checkProductInLabels(labelArray) {

                    var currentProduct = $("#switchTag").val();

                    if (currentProduct == "mdx_2_0") {
                        if ($.inArray("mdx2", labelArray) > -1) return true;
                        else {
                            if ($.inArray("mdxnxt", labelArray) > -1) return false;
                        }
                    }

                    if (currentProduct == "mdx_nxt") {
                        if ($.inArray("mdxnxt", labelArray) > -1) return true;
                        else {
                            if ($.inArray("mdx2", labelArray) > -1) return false;
                        }
                    }

                    return true;
                }

                function AddListToggle() {

                    $(".loc i").on("click", function() {

                        try {
                            var next = parseInt($(this).parent().attr("class").replace("treelist loc ", "").split(" ", 1).toString().replace("loc-", "").toString()) + 1,
                                from = next - 1,
                                far = from - 1,
                                verydar = far - 1
                        } catch (e$2) {}

                        if ($(this).hasClass("fa-angle-right")) {
                            $(this).removeClass("fa-angle-right").addClass("fa-angle-down");
                            $(this).parent().nextUntil(".loc-" + from + ".has-arrow").each(function() {
                                if ($(this).hasClass("loc-" + next)) $(this).slideDown()
                            })

                        } else if ($(this).hasClass("fa-angle-down")) {
                            $(this).removeClass("fa-angle-down").addClass("fa-angle-right");
                            $(this).parent().nextUntil(".loc-" + from).each(function() {
                                if ($(this).hasClass("loc-" + far) || $(this).hasClass("loc-" + verydar)) return false;
                                else {
                                    $(this).slideUp();
                                    if ($(this).hasClass("has-arrow")) $(this).find("i").removeClass("fa-angle-down").addClass("fa-angle-right")
                                }
                            })
                        }
                    })
                }

                function groupArticleList() {

                    var e = selectSecId.find("li");

                    $(e).has("span:contains('TOPIC')").wrap('<div class="maintopic"></div>'), $(e).find(".article-title").text("A"), $(e).find(".topic-title").text("T"), $(e).find(".issue-title").text("I"), $(e).find("i").addClass("fa fa-angle-down"), $("div.icon + div.icon").length && $("div.icon + div.icon").prev().find("i").remove(), $("div.icon + div.maintopic").length && $("div.icon + div.maintopic").prev().find("i").remove(), $("ul.sub-group-list div.icon:last-child + div").length > -1 && $("ul.sub-group-list div.icon:last-child").find("i").remove(),
                        $("div.icon li > a").removeClass(), $("li.treelist + div.icon").length && $("li.treelist + div.icon").prev().find("a").removeClass(), $(".sub-group-list li.treelist:last").length && $(".sub-group-list li.treelist:last").find("a").removeClass(), $(e).find("i").click(function() {
                            if ($(this).hasClass("fa-angle-down")) $(this).attr("class", "fa fa-angle-right"), (e = $(this).parent("li").closest("div.icon").nextUntil("div")).slideUp();
                            else {
                                $(this).attr("class", "fa fa-angle-down");
                                var e = $(this).parent("li").closest("div.icon").nextUntil("div");
                                e.slideDown()
                            }
                        }), $("#nav-list").find("ul.sub-group-list li").prev("div.icon").nextUntil("div").length && ($(selectSecId).find("li").prev("div.icon").nextUntil("div").css("display", "none"), $("#nav-list li:contains('ISSUE') + div.maintopic").prev().find("i").css("display", "none"), $(selectSecId).css("display", "block"), $(selectSecId).find("i").attr("class", "fa fa-angle-right"))
                }
            }

            var currCatId;

            if (isInURL("/categories") && !isInURL(200209199) && !isInURL(201269943) && !isInURL(200768493) && !isInURL(201680143) === -1 && !isInURL(201188756)) {

                currCatId = currPageURL.split("categories/")[1].split("#")[0].split("-")[0].split("?")[0];

                (function() {
                    if ($("#sideNavigation").length) {
                        getNavCatId = currCatId;
                        selectCatId = $("#" + currCatId);

                        if ($(".category[id=" + currCatId + "]").length) {
                            addSectionToList();
                        } else {
                            setTimeout(arguments.callee, 200);
                        }

                    } else {
                        setTimeout(arguments.callee, 200);
                    }
                })()
            }

            function openCategory() {
                var categoryListItem = $("#" + getNavCatId);
                if (categoryListItem.length) {
                    categoryListItem.parent().css('display', 'block');
                    categoryListItem.find('.categoryDrop').css({
                        "color": "#FFF",
                        "font-weight": "bold"
                    });
                } else {
                    setTimeout(openCategory, 100);
                }
            }



            function openSection() {
                selectCatId = $("#" + getNavCatId);
                if (selectCatId.length) {
                    selectCatId.parent().show();
                    if (!selectCatId.children("ul").children('li').length) {
                        selectCatId.children("#icon-category").click();
                    }
                    getnavSecId = originalSectionID;
                    selectSecId = $("#" + getnavSecId).find(".sub-group-list");
                    $("#nav-list li[id=" + originalSectionID + "]").children("a").css({
                        "color": "#FFF",
                        "font-weight": "bold"
                    });
                    if (!originalSectionID) {
                        instantiateTree();
                    }
                    if (selectCatId.parent("#nav-list").length == 1) {} else {
                        selectCatId.parent().parent().children("ul").css("display", "block");
                    }
                } else {
                    setTimeout(arguments.callee, 200);
                }
            }

            function populateTickets() {

                var relatedTickets, tcount = 0;
                var html = "";
                var ArtId = currPageURL.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];

                $.getJSON("/api/v2/search.json?per_page=30&query=type:ticket+tags:usekb_" + ArtId, function(data) {

                    relatedTickets = data.results;

                    $.each(relatedTickets, function(index, value) {
                        var updatedate = new Date(value.updated_at);
                        html += "<tr>";
                        html += "<td>" + value.id + "</td>";
                        html += "<td>" + value.subject + "</td>";
                        html += "<td>" + updatedate.toLocaleDateString() + "</td>";
                        html += "<td>" + value.group_id.toString().replace("21321019", "Tier1").replace("21321029", "Tier2").replace("21387695", "Tier3").replace("21575859", "Tier4") + "</td>";
                        html += "<td>" + value.status + "</td>";
                        html += "</tr>"
                    });

                    $("#relatedTicketsTable").find("tbody").append(html);

                    tcount = data.count;

                }).done(function() {

                    $(".status-new").text("NEW");
                    $(".status-open").text("OPEN");
                    $(".status-hold").text("ON-HOLD");
                    $(".status-pending").text("PENDING");
                    $(".status-closed").text("CLOSED");
                    $(".status-solved").text("SOLVED");

                    if (tcount > 0 && (appView == false || appView == undefined)) {

                        $("#caseExamples, #relatedTicketsTable, #relatedTicketsTable-header, #relatedTicketsTable-footer").show();
                        styleTicketTable();
                    }
                })
            }

            if ($(".header").html().indexOf("Message Board") < 0 && currentUser !== "end_user" && currentUser !== "anonymous" && isInURL("/articles/") && !isInURL("209729503")) {

                if ($("body:contains('Case Examples')").length == 0) $('<h2 id="caseExamples">Case Examples</h2><table></table>').insertBefore("body .article-attachments:last");
                if ($("h2:contains('Case Examples')").next("p").length > 0) $("h2:contains('Case Examples')").next("p").remove();
                if ($("h2:contains('Case Examples')").next("br").length > 0) $("h2:contains('Case Examples')").next("br").remove();

                $("h2:contains('Case Examples')").next("table").replaceWith('<table id="relatedTicketsTable"><thead><tr><th data-column-id="id" data-header-css-class="id-column" data-formatter="id" data-type="numeric" data-identifier="true">ID</th><th data-column-id="subject" data-header-css-class="subject-column">SUBJECT</th><th data-column-id="updated" data-header-css-class="updated-column">UPDATED</th><th data-column-id="tier" data-header-css-class="tier-column">TIER</th><th data-column-id="status" data-header-css-class="status-column" data-formatter="status">STATUS</th></tr></thead><tbody></tbody></table>');
                $("#relatedTicketsTable").removeClass("bordered");
                $("#caseExamples, #relatedTicketsTable, #relatedTicketsTable-header, #relatedTicketsTable-footer").hide();

                populateTickets();
            }

            if (isInURL("/categories/") && (isInURL("200209199") || isInURL("200768493") || isInURL("201680143") || isInURL("201188756"))) {

                var categoryID = window.location.href.split("categories/")[1].split("#")[0].split("-")[0].split("?")[0];

                highlightCurrAddResPage(categoryID);

            } else if (isInURL("/categories/201131993") || isInURL("/categories/201269943")) {

                highlightCurrAddResPage("certifiedLinkItem");

            } else {

                $(".addtlResources ul").slideUp();
            }

            $("<div class ='cover'></div>").insertAfter("#sideNavigation");

            //menu state from previous session
            storage.getItem("treesettings") == null || storage.getItem("treesettings") == 1 ? openSideNav() : hideSideNav();

            if (currentUser !== "anonymous") changeDisplayUsername();

            //menu show and hide button
            $(".hamburger").click(function() {
                $(this).hasClass("is-active") == true ? hideSideNav() : openSideNav()
            });

            //control show and hide of sidebar menu
            function openSideNav() {

                storage.setItem("treesettings", "1");

                $("#sideNavigation").css("width", "300px");
                $(".footer-inner").css("padding-left", "300px");
                $("body").find("main").css("width", "calc(100% - 300px)");
                $("body").find("#sideNavigation").css("margin-left", "0");
                $("body.support_kb").find("main").css("width", "calc(100% - 300px)");
                $(".sidenav-header").removeClass("sidenav-header-closed");
                $(".sidenav-header").addClass("sidenav-header-open");
                $(".side-nav-menu").removeClass("closed-menu");
                $(".side-nav-menu").addClass("open-menu");
                $(".subscriptionContainer").css("padding", "0 20px");
                $(".container").css("padding-left", "20px"), $(".hamburger").addClass("is-active");

                if ($(".tocify").is(":visible")) $(".main-column").css("max-width", "790px");
                else $(".main-column").css("max-width", "868px");
            }

            function hideSideNav() {

                storage.setItem("treesettings", "0");

                $("body").find("#sideNavigation").css("margin-left", "-300px").css("width", "300px");
                $("body.mdxcss").find("#sideNavigation").css("margin-left", "-300px");
                $("body.support_kb").find("#sideNavigation").css("margin-left", "-300px");
                $(".footer-inner").css("padding-left", "20px");
                $("main").css("width", "100%");
                $(".sidenav-header").removeClass("sidenav-header-open");
                $(".sidenav-header").addClass("sidenav-header-closed");
                $(".side-nav-menu").removeClass("open-menu");
                $(".side-nav-menu").addClass("closed-menu");
                $(".main-column").css("max-width", "868px");
                $(".subscriptionContainer").css("padding", "0");
                $(".container").css("padding-left", "0px");
                $(".hamburger").removeClass("is-active");
            }

            KSelect();

            //for anonymous user, display signin for more message
            if (HelpCenter.user.role == "anonymous") {
                $(".hero-unit, .sub-nav, .section-description").after('<div class="signinmore"><span>Please <a class="signin"><u>SIGN IN</u></a> to see more content.</span></div>');
                $(".signin").attr("href", loginURL);
            }

        });
    });

    //static function definitions from master JS to reduce the filesize.
    function expand() {

        $("#sectionloader").css("display", "block");

        if ($("body.support_kb").find("ul#show-data").length && $("#sectionloader").length) {
            $("body.support_kb").find(".article-list:first").css("display", "none");
            $("body.support_kb").find("ul#show-data").css({
                "display": "none",
                "padding-top": "0"
            });
            $("body.support_kb").find("#sectionloader").css("display", "block")
        }

        if ($("body.support_kb").find("ul#show-data li.treeline").prev("div.icon").nextUntil("div").length) {
            $("body.support_kb").find("ul#show-data li.treeline").prev("div.icon").nextUntil("div").slideUp(1E3, function() {
                $("ul#show-data").find("i").attr("class", "fa fa-plus");
                $("body.support_kb").find("ul#sectionloader").css("display", "none");
                $("body.support_kb").find("ul#show-data").css("display", "block");
                $("body.support_kb").find("p.bodytext").css("display", "block");
                $($(this)).find("a").addClass("subtopic")
            });
        } else {
            $("body.support_kb").find("#sectionloader").css("display", "none");
            $("body.support_kb").find("ul#show-data").css("display", "block")
        }
    }

    //related tickets table
    function styleTicketTable() {

        $("#relatedTicketsTable").bootgrid({
            caseSensitive: false,
            sorting: true,
            columnSelection: true,
            selection: false,
            multiSelect: false,
            rowSelect: false,
            keepSelection: false,
            pagination: 10,
            rowCount: [10, 25, 50, 75, -1],
            searchSettings: {
                characters: 1
            },
            labels: {
                noResults: "No related tickets yet",
                search: "Search",
                all: "Show all",
                infos: "{{ctx.start}} to {{ctx.end}} of {{ctx.total}}",
                loading: "Loading...",
                refresh: "Refresh"
            },
            formatters: {
                "id": function(column, row) {
                    return '<a href="https://sizmek.zendesk.com/agent/tickets/' + row[column.id] + '" target="_blank">' + row[column.id] + "</a>"
                },
                "status": function(column, row) {
                    return '<span class="status-icon status-' + row[column.id] + '">' + row[column.id] + "</span>"
                }
            }
        })
    }

    function toTitleCase(str) {

        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        })
    }

    function cleanTextOnly(txt) {

        txt = txt.trim().replace(/@[\w-\(|\)]+\s/ig, "");
        return txt;
    }

    function changeDisplayUsername() {

        var uname = HelpCenter.user.name;
        var display = "";
        var res = uname.split(" ");

        for (var x = 0; x < res.length; x++) var display = display + res[x][0];
        $("#user-name").text(display)
    }

    function updateKSelect(selected) {

        $("#switchTag").prev(".k-select").find(">ul").empty();
        $("#switchTag option").each(function() {
            var option = $(this).text();
            var value = $(this).val();
            if (selected == value) {
                $(this).parent().prev(".k-select").find("span").first().html(option);
                $(this).parent().prev(".k-select").find("ul").append('<li style="display:none">' + option + "<span>" + value + "</span></li>")
            } else $(this).parent().prev(".k-select").find("ul").append("<li>" + option + "<span>" + value + "</span></li>")
        })
    }

    function KSelect() {

        $(".wrapper .select-picker").each(function() {
            $(this).hide().addClass("k-selected").removeClass("select-picker");
            var selected = $(this).val();
            $(this).before('<div class="k-select" tabindex="-1"><span></span><ul></ul></div>');
            $(this).find("option").each(function() {
                var option = $(this).text();
                var value = $(this).val();
                if (selected == value) {
                    $(this).parent().prev(".k-select").find("span").first().html(option);
                    $(this).parent().prev(".k-select").find("ul").append('<li style="display:none">' + option + "<span>" + value + "</span></li>")
                } else $(this).parent().prev(".k-select").find("ul").append("<li>" + option + "<span>" + value + "</span></li>")
            })
        })
    };

    function addIcons() {

        $("li.loc").each(function(i, obj) {

            try {
                var c = $(this).attr("class"),
                    n = $(this).next("li.loc").attr("class"),
                    s = c.toString().split(" "),
                    g = n.toString().split(" "),
                    nn = g[2].replace(/ /g, ".").replace(/\D/g, ""),
                    cc = s[2].replace(/ /g, ".").replace(/\D/g, "")
            } catch (e$3) {}

            if (parseInt(nn) > parseInt(cc)) {
                if ($(this).find("i").length == 0) {
                    $(this).prepend('<i class="fa fa-angle-right" style="margin-left:7px"></i>');
                    $(this).addClass("has-arrow")
                }
            } else;
        })
    }

    //what is this for??
    var superCategories = $('.category.dsp > a , #nav-list > li > a');

    if (superCategories.length > 0) {

        $('body').on('click', '.cssCircle.plusSign', function(event) {
            event.stopPropagation();
            var appendTag = $(this).parent().find(".tagName").text();
            var textQuery = $("#query");
            textQuery.val($("#query").val() + " " + appendTag);
            textQuery.focus();
            window.location.href = "/hc/en-us/search?utf8=%E2%9C%93&query=" + encodeURIComponent(textQuery.val()) + "&commit=Search"
        });


        $('body').on('click', '.cssCircle.plusSign', function(event) {
            event.stopPropagation();
            var appendTag = $(this).parent().find(".tagName").text();
            var textQuery = $("#query");
            textQuery.val($("#query").val() + " " + appendTag);
            textQuery.focus();
            window.location.href = "/hc/en-us/search?utf8=%E2%9C%93&query=" + encodeURIComponent(textQuery.val()) + "&commit=Search"
        });

        $('body').on('click', 'a.hashTags', function() {
            var currTag = $(this).find('.tagName:first').text();
            $("#query").val(currTag);
            $("#query").focus();
            window.location.href = "/hc/en-us/search?utf8=%E2%9C%93&query=" + encodeURIComponent(currTag) + "&commit=Search";
        });

        $('body').on('mouseover', 'a.hashTags', function() {
            var currTag = $(this).find(".tagName:first").text().toLowerCase().substr(1);
            $(".hashTags." + currTag).css({
                "background-color": "#448df7",
                "color": "#fff",
                "border-color": "#448df7"
            });
        });
        $('body').on('mouseout', 'a.hashTags', function() {
            var currTag = $(this).find(".tagName:first").text().toLowerCase().substr(1);
            $(".hashTags." + currTag).css({
                "background-color": "",
                "color": "",
                "border-color": ""
            });
        });

        $("body").on("click", ".expand-control-text", function() {
            var expand_content = $(this).closest(".expand-container").find(".expand-content");
            if (expand_content.css("display") == "none") {
                $(this).addClass("arrowDown");
                expand_content.slideDown();
            } else {
                $(this).removeClass("arrowDown");
                expand_content.slideUp();
            }
        });

        $(".category-tree section.section").slideUp();
        $("section.category").find("a:first").attr("href", "#");
        $("section.category").find("a:first").attr("coll", "false");
        $("section.category").find("a:first").unbind("click");

        $("section.category").find("a:first").click(function(e) {
            e.preventDefault()
            if ($(this).attr("coll") == "false") {
                $(this).parent().parent().find("section.section").slideDown();
                $(this).attr("coll", "true");
                return false
            } else {
                $(this).parent().parent().find("section.section").slideUp();
                $(this).attr("coll", "false");
                return false
            }
            return false;
        });

        $(".nav li").each(function(i) {
            $(this).hover(function() {
                $(this).find("span").slice(0,
                    1).addClass("active");
                $(this).find("a").slice(0, 1).addClass("active")
            }, function() {
                $(this).find("span").slice(0, 1).removeClass("active");
                $(this).find("a").slice(0, 1).removeClass("active")
            })
        });

        $(".incident-item-cont table:not([class*='msgboard'])").addClass("msgboard");

        if ($(".header").html().indexOf("Message Board") > -1) $(".article-body table:not([class*='msgboard']").addClass("msgboard");
    }

    //documentation team scripts
    $("a.submit-a-request").text("Contact Support");

    $("#training_video").click(function(e) {
        e.preventDefault();
        $("#training_video").load(this.href).dialog("open")
    });

    $("a.expandingblocktemplate").unbind("click");
    $("a.jump:first").on("click", function() {
        $("div.expandingblock").slideDown()
    });
    $("a.jump:last").on("click", function() {
        $("div.expandingblock").slideUp()
    });
    $("a.expandingblocktemplate").unbind("click");
    $("a.expandingblocktemplate").on("click", function(e) {
        e.preventDefault();
        if ($(this).parent().next().attr("visible") == "true") {
            $(this).parent().next().slideUp();
            $(this).parent().next().attr("visible", "false")
        } else {
            $(this).parent().next().slideDown();
            $(this).parent().next().attr("visible", "true")
        }
        return false
    });

    $(".expandingblock").slideUp();
    $(".expandable, .expandable-procedure").on("click", function() {
        var $this = $(this);
        if ($this.next(".expandingblock").css("display") == "none") {
            $(this).addClass("arrowDown");
            $this.next(".expandingblock").slideDown()
        } else {
            $(this).removeClass("arrowDown");
            $this.next(".expandingblock").slideUp()
        }
    });

    $(".hp-expandingblock").slideUp();
    $(".sub-catblock").slideUp();
    $(".expandable-hp").on("click", function() {
        var $this = $(this);
        if ($this.next(".hp-expandingblock").css("display") == "none") {
            $(this).addClass("arrowDown");
            $this.next(".hp-expandingblock").slideDown()
        } else {
            $(this).removeClass("arrowDown");
            $this.next(".hp-expandingblock").slideUp()
        }
    });
    //redundant??
    /*
    $(".share a").click(function(e) {
        e.preventDefault();
        window.open(this.href, "", "height = 500, width = 500")
    });
    $(".share-label").on("click", function(e) {
        e.stopPropagation();
        var isSelected = this.getAttribute("aria-selected") == "true";
        this.setAttribute("aria-selected", !isSelected);
        $(".share-label").not(this).attr("aria-selected", "false")
    });
    $(document).on("click",
        function() {
            $(".share-label").attr("aria-selected", "false")
        });
    */
    $(".answer-body textarea").one("focus", function() {
        $(".answer-form-controls").show()
    });
    $(".comment-container textarea").one("focus", function() {
        $(".comment-form-controls").show()
    });
    $(".fancybox").fancybox();
    $(".fancybox-media").fancybox({
        openEffect: "none",
        closeEffect: "none",
        helpers: {
            media: {}
        }
    });


    //track video events in analytics
    if ($("video").length > 0) {

        var thisVideo;

        function trackEventGA(ev) {
            ga("send", "event", "Videos", ev, currPageURL)
        }

        $("video").each(function() {
            thisVideo = this;
            thisVideo.addEventListener("play", trackEventGA("play"), false);
            thisVideo.addEventListener("pause", trackEventGA("pause"), false);
            thisVideo.addEventListener("ended", trackEventGA("end"), false)
        });

    }


    //redundant??
    /*
    $(".language-picker").on("change", function() {
        window.location.href = $(this).val();
    });
    */


    //sidebar menu realted
    //--------------------------------------------------------

    $("#nav-list > .mdxcat > .fa").click(function() {
        if ($(this).hasClass("fa-angle-down") == true) $(this).parent().css("background-color", "#00234e");
        else $(this).parent().css("background-color", "#001937")
    });
    $("#nav-list > .mdxcat > .categoryDrop").click(function() {
        if ($(this).prev(".fa").hasClass("fa-angle-down") == true) $(this).parent().css("background-color", "#00244d"), $(this).removeAttr("style");
        else $(this).parent().css("background-color", "rgb(0, 25, 55)"), $(this).css("color", "#fff")
    });
    $("#nav-list > .addtlResources > .categoryDrop").click(function() {
        if ($(this).prev(".fa").hasClass("fa-angle-down") == true) {
            $(this).parent().css("background-color", "#00244d"), $(this).removeAttr("style");
        } else {
            $(this).parent().css("background-color", "rgb(0, 25, 55)"), $(this).css("color", "#fff");
        }
    });

    $(".category.dsp > a , #nav-list > li > a").click(function() {
        if ($(this).parent().find("> i ").hasClass("fa-angle-right") == true) {
            $(this).parent().css("background-color", "#001937");
            $(this).css("color", "white")
        } else {
            $(this).parent().css("background-color", "#00244d");
            $(this).removeAttr("style")
        }
    });
    //--------------------------------------------------------

    //show site during help center administration
    if (window.self !== window.top) {
        if (document.referrer.indexOf("/theming/theme/") > -1) {

            $("html").css("display", "block");
            $("main").css("display", "block");
        }
    }

    //highlight current page under additional resources menu for consistency
    function highlightCurrAddResPage(linkID) {
        (function() {
            var additionalResources = $(".addtlResources");
            if (additionalResources.length > 0) {
                $(".addtlResources ul").slideDown();
                $(".addtlResources #" + linkID).find("a").addClass("currPage");
                additionalResources.css("background-color", "#001937");
                additionalResources.find("a").eq(0).css("color", "white");
            } else {
                setTimeout(arguments.callee, 100);
            }
        })()
    }

    //set Sizmek certified menu link based on current platform
    function setCertifiedLink() {
        if ($("#switchTag").val() == "dsp") $("#certifiedLink").attr("href", "/hc/en-us/articles/360001069612");
        else if ($("#switchTag").val() == "mdx_nxt") $("#certifiedLink").attr("href", "/hc/en-us/categories/201269943");
        else $("#certifiedLink").attr("href", "/hc/en-us/categories/201131993");
    }
    setCertifiedLink();

    //analytics tracking - capture where ticket submit occurs (indicates these article may need improvements)
    $('a.submit-a-request, .article-more-questions a').on('click', function(e) {
        ga('send', 'event', 'Open a ticket', 'Ticket requested from ', window.location.pathname);
    });

    //redundant codes??
    /*
    function showsearch() {
        function addStyleString(str) {
            var node = document.createElement("style");
            node.innerHTML = str;
            node.id = "showsearchinput";
            document.body.appendChild(node);
            $("#query").focus();
            var node1 = document.createElement("div");
            node1.className = "modal-backdrop  in";
            document.body.appendChild(node1);
        }
        if (vck == 1) {
            addStyleString(".sub-nav .search { position:fixed!important;z-index:9999999!important;top: 40vh!important;left: 35vw!important;padding: 10px!important;background:#003471;border-radius:10px;width:500px!important;}.sub-nav .search input[type=search] {margin-top:0px!important;}");
        }
    }
    */

    //redundant codes??
    //old accordion menu related
    /*
    var accordion_head = $(".accordion > li > a");
    var accordion_body = $(".accordion li > .sub-menu");
    accordion_head.on("click", function(event) {
        event.preventDefault();
        if ($(this).attr("class") != "active") {
            accordion_body.slideUp("normal");
            $(this).next().stop(true, true).slideToggle("fast");
            accordion_head.removeClass("active");
            $(this).addClass("active");
            $(".accordion").children("li").children("ul").each(function() {
                $("li", this).css("border-bottom", "none");
                $("li:visible:last", this).css("border-bottom", "1px solid #BACAE4");
                $("li:visible:first", this).children("a").addClass("accordionFirst");
                $("li:visible:last", this).children("a").addClass("accordionLast")
            });
            $($(".accordion .active").parent().children("ul").children("li:not([class])")[0]).children("a").css("padding-top",
                "25px")
        } else {
            accordion_body.slideUp("normal");
            accordion_head.removeClass("active")
        }
    });

    //11
    function isElemInView(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();
        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    //* 25
    var apiURL = "/api/v2/help_center/" + currentLang + "/categories.json?per_page=100";
    if ($(".hero-unit").length == 1) {
        var getCategories = function() {
            $.get(apiURL).done(function(data) {
                apiURL = data.next_page;
                var categories = $.map(data.categories, function(category, i) {
                    return {
                        "name": category.name,
                        "url": category.html_url,
                        "desc": category.description
                    }
                });
                $.each(categories, function(i, category) {
                    var newHTML = '<a href="' + category["url"] + '"><span style="display:none">' + category["desc"] + "</span>" + category["name"] + "</a>";
                    var realHTML = $("<li>").html(newHTML);
                    var exHTML = $("<li>").html(newHTML).html();
                    if (category["desc"] !== "") {
                        if (category["desc"].indexOf("@") > -1)
                            if (category["desc"].split("@")[1].split(" ")[0].indexOf("--") > -1) {
                                var superCat = category["desc"].split("@")[1].split(" ")[0].split("--")[0].replace(/-/g, " ");
                                var superCatClass =
                                    "tab" + toTitleCase(superCat).replace(/ /g, "");
                                var superSubCat = category["desc"].split("@")[1].split(" ")[0].split("--")[1].replace(/-/g, " ");
                                var superSubCatClass = "tab" + toTitleCase(superSubCat).replace(/[- )(]/g, "");
                                if ($("." + superCatClass + " ." + superSubCatClass).length) realHTML.appendTo("." + superSubCatClass + " .sub-sub-menu");
                                else {
                                    var currHTML = $("." + superCatClass + " .sub-menu").html();
                                    $("." + superCatClass + " " + ".sub-menu").html(currHTML + '<li class="' + superSubCatClass + '"><a href="#" class="superSubAccor" onclick="event.preventDefault()"><b>' +
                                        superSubCat + '</b></a><ul class="sub-sub-menu"></ul></li>');
                                    realHTML.appendTo("." + superSubCatClass + " .sub-sub-menu")
                                }
                            } else {
                                if (category["desc"].indexOf("@your-resources") > -1) realHTML.appendTo(".tabYourResources .sub-menu");
                                if (category["desc"].indexOf("@getting-started") > -1) realHTML.appendTo(".tabGettingStarted .sub-menu");
                                if (category["desc"].indexOf("@campaign-management") > -1) realHTML.appendTo(".tabCampaignManagement .sub-menu");
                                if (category["desc"].indexOf("@data") > -1) realHTML.appendTo(".tabData .sub-menu");
                                if (category["desc"].indexOf("@creative") > -1) realHTML.appendTo(".tabCreative .sub-menu");
                                if (category["desc"].indexOf("@publishers") > -1) realHTML.appendTo(".tabPublishers .sub-menu");
                                if (category["desc"].indexOf("@certified") > -1) realHTML.appendTo(".tabCertified .sub-menu")
                            }
                    } else if (exHTML.indexOf(">@") >= 0)
                        if (exHTML.split(">@")[1].split(" ")[0].indexOf("--") >= 0) {
                            var superCat = exHTML.split(">@")[1].split(" ")[0].split("--")[0].replace(/-/g, " ");
                            var superCatClass = "tab" + toTitleCase(superCat).replace(/ /g,
                                "");
                            var superSubCat = exHTML.split(">@")[1].split(" ")[0].split("--")[1].replace(/-/g, " ");
                            var superSubCatClass = "tab" + toTitleCase(superSubCat).replace(/[- )(]/g, "");
                            if ($("." + superCatClass + " ." + superSubCatClass).length) realHTML.appendTo("." + superSubCatClass + " .sub-sub-menu");
                            else {
                                var currHTML = $("." + superCatClass + " .sub-menu").html();
                                $("." + superCatClass + " " + ".sub-menu").html(currHTML + '<li class="' + superSubCatClass + '"><a href="#" class="superSubAccor" onclick="event.preventDefault()"><b>' + superSubCat +
                                    '</b></a><ul class="sub-sub-menu"></ul></li>');
                                realHTML.appendTo("." + superSubCatClass + " .sub-sub-menu")
                            }
                        } else {
                            if (exHTML.indexOf("@your-resources") > -1) realHTML.appendTo(".tabYourResources .sub-menu");
                            if (exHTML.indexOf("@getting-started") > -1) realHTML.appendTo(".tabGettingStarted .sub-menu");
                            if (exHTML.indexOf("@campaign-management") > -1) realHTML.appendTo(".tabCampaignManagement .sub-menu");
                            if (exHTML.indexOf("@data") > -1) realHTML.appendTo(".tabData .sub-menu");
                            if (exHTML.indexOf("@creative") > -1) realHTML.appendTo(".tabCreative .sub-menu");
                            if (exHTML.indexOf("@publishers") > -1) realHTML.appendTo(".tabPublishers .sub-menu");
                            if (exHTML.indexOf("@certified") > -1) realHTML.appendTo(".tabCertified .sub-menu")
                        }
                });
                if (apiURL !== null) {
                    apiURL += "&per_page=100";
                    getCategories()
                } else if ($(".hero-unit").length > 0) $(".switchTag").change()
            })
        };
        getCategories()
    }*/

});
