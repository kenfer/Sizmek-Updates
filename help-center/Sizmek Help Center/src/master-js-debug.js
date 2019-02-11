console.log("debug");
var storage = window["localStorage"];
var sessionStorage = window["sessionStorage"];
var helpCenterVer, getnavSecId;
var phpURL = "https://uffa.sizmek.com/uffa/ProxyAPI.php?";
var cookieFilter = false;
var currentLang = "en-us";
var currPageURL = window.location.href;
$(function() {
    $.getJSON("/api/v2/help_center/" + currentLang + "/articles/206321873.json").done(function(gate) {
        var lbl = gate.article.label_names;
        if (lbl.length > 0)
            for (x = 0; x < lbl.length; x++)
                if (lbl[x].toLowerCase().indexOf("hcversion") > -1) {
                    helpCenterVer = lbl[x];
                }
        debugFlag = storage.getItem("debug") ? false : true;
        if (storage.getItem(HelpCenter.user.email + helpCenterVer + currentLang) === null) {
            storage.clear();
            sessionStorage.clear();
        }
        storage.setItem(HelpCenter.user.email + helpCenterVer + currentLang, 1);
        if (currPageURL.indexOf("support.sizmek.com/dsp") > -1) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=dsp";
        else if (currPageURL.indexOf("support.sizmek.com/newdsp") > -1) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=newdsp";
        else if (currPageURL.indexOf("support.sizmek.com/dmp") > -1) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=dmp";
        else if (currPageURL.indexOf("support.sizmek.com/mdx2.0") > -1) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=mdx_2_0";
        else if (currPageURL.indexOf("support.sizmek.com/showall") > -1) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=showall";
        else if (currPageURL.indexOf("support.sizmek.com/mdxnxt") > -1) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=mdx_nxt";
        else if (currPageURL.indexOf("support.sizmek.com/supportkb") > -1) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "?platform=support_kb";
        else if (currPageURL.indexOf("support.sizmek.com/status") > -1) $("main,#sideNavigation").remove(), window.location.href = "/hc/" + currentLang + "/categories/201680143";
        if (currPageURL.indexOf("/error_preview") > -1) {
            hideSideNav();
            setTimeout(function() {
                storage.setItem("treesettings", "1"), window.location.href = "/hc/" + currentLang;
            }, 3E3)
        }
        if ((currPageURL.indexOf("/articles/") == -1 || currPageURL.indexOf("209729503") == -1 || currPageURL.indexOf("type=Files") == -1) && self == top) {
            $("html").css("display", "block");
            $("main").css("display", "block");
        }
        var helpCenterMaintenance = false;
        $("body").addClass("mdxcss");
        $(".breadcrumbs").detach().appendTo(".header-breadcrumbs");
        if (getUrlParameter("platform") !== null && getUrlParameter("platform") !== undefined) storage.setItem("global-filterSetting", getUrlParameter("platform"));
        var treesettings = HelpCenter.user.email + "-TreeSettings";
        var navSectionAPI = "/api/v2/help_center/" + currentLang + "/sections.json?per_page=100&sort_by=created_at&sort_order=asc";
        var firstParentRun, navcatid, fullcatid, navsectionid, getnavSectionName, getnavSectionId, loadedCategoryID, sectionApiURL, currSectionId, treelist, appView;
        var NavCatArrayready = 0;
        var NavArtArrayready = 0;
        var onpageLoad = 1;
        var navsecArray = [];
        var currentUser = HelpCenter.user.role;
        var userEmail = HelpCenter.user.email;
        var usersName = HelpCenter.user.name;
        var isSectionPage = currPageURL.indexOf("/sections/") > -1;
        ga("set", "dimension1", currentUser);
        ga("set", "dimension2", userEmail);
        ga("set", "dimension3", usersName);

        if (helpCenterMaintenance && currentUser !== "manager")
            if (currPageURL.indexOf("205990016") == -1) window.location.replace("/hc/" + currentLang + "/articles/205990016");
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
        $(".notification-ipm").hide();
        $("main").css("min-height", "600px");
        var submitCheck = false;
        var maxResultsAPI = 100,
            preFilterCount = 0,
            searchResultCount = 0,
            searchResultTotal = 0,
            searchComplete = 0,
            searchDone = 0,
            searchQuery, resultCategoryArray = [],
            resultContentTypes = [];
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
        var hcTags = ["overview", "howto", "video", "faq", "troubleshooting", "reference", "onboarding", "sizmekcertified"];
        var kbTags = ["topic", "article", "issue"];
        var kbCategories = "200404775,115001253423,115001244206,115001244186,115001253403,115001244166,115001253383,115001253363,115001244146,115001244126,115001244106,115001253343,115001253323,115001244086,115001244066";
        var scrtop = (isInURL("/articles/")) ? $(".article-updated").offset().top : 0;
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
        });
        $(window).on("resize", function() {
            $("#sidefoot").css("width", $("#sideNavigation").width() + 2 + "px");
            $(".quickNavMenu").css("max-height", window.innerHeight - 110 + "px")
        });
        setInterval(function() {
            $(window).scroll()
        }, 500);
        if ($(".comment-form").length == 0) $(".article-comments").hide();
        if ($(".article-body h2").length < 2) {
            $(".in-this-articles").hide();
            $(".main-column").css("width", "97%")
        }
        $("#contactLink").hide();
        $("#statusLink").hide();
        if (currentUser !== "manager") $("#adminHC").remove();
        if (currentUser == "end_user" || currentUser == "anonymous") {
            $("#internal_only, #internal_only.note").remove();
            $(".internal_only").remove();
            $("#internal_only").hide();
            $(".internal_only").hide();
            $("#accountLink").hide();
            $("#contactLink").show();
            $('#nav-list .addtlResources > ul > li').eq(3).remove();
        } else $("#suggestionLink").find("a").attr("href", "https://sizmekmdxinternal.ideas.aha.io/portal_session/new"),
            $("#suggestionLink,#sideSuggestionLink").attr("href", "https://sizmekmdxinternal.ideas.aha.io/portal_session/new");
        if (currentUser == "anonymous") {
            $('#nav-list .addtlResources').remove();
            var loginURL = "https://platform.mediamind.com/Eyeblaster.ACM.Web/Login/ZDLogin.aspx?brand_id=12005&locale_id=1&return_to=https%3A%2F%2Fsupport.sizmek.com%2Fhc%2F" + currentLang + "%2F";
            $(".tabGettingStarted .sub-menu").append('<li><a href="' + loginURL + '" style="color:#000 !important">Please <strong class="loginC">sign in</strong> to view more articles</a></li>');
            $(".tabCampaignManagement .sub-menu").append('<li><a href="' +
                loginURL + '" style="color:#000 !important">Please <strong class="loginC">sign in</strong> to view more articles</a></li>')
        }
        $("#query").attr("placeholder", "Enter a question, keyword or topic...");
        if (currPageURL.indexOf("/community/") > -1) $(".sub-nav").wrapInner("<div class='sub-nav-inner'></div>");
        //25
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


        function cleanWrap() {
            $(".wrapper").find("a").each(function() {
                if ($(".hero-unit").length == 0 && (/@sub/i.test($(this).html()) || /sub-title/i.test($(this).html()) || /@issue/i.test($(this).html()) || /issue-title/i.test($(this).html())))
                    if (isSectionPage) {
                        if ($(this).parent("li").hasClass("treelist"));
                        else $(this).css("margin-left", "40px");
                        if ($("#switchTag").val() !== "support_kb") $(this).css("margin-left", "50px")
                    } else if (currPageURL.indexOf("/categories/") > -1 && currPageURL.indexOf("115001253343") < 0) {
                    if ($(this).parent("li").hasClass("treelist"));
                    else $(this).css("margin-left", "40px");
                    if ($("#switchTag").val() !== "support_kb") $(this).css("margin-left", "50px")
                } else;
                cleanThis($(this))
            })
        }

        function cleanThis(elem) {
            for (var indx = 0; indx < contentTypes.length; ++indx) {
                var reg = new RegExp(contentTypes[indx][0] + " ", "ig");
                elem.html(elem.html().replace(reg, "<span class='" + contentTypes[indx][1] + "'>" + contentTypes[indx][2] + "</span>"))
            }
            var newHTML = "";
            if (elem.html().match("/|@getting-started|@ad-delivery|@data|@creative|@publishers|@certified|@your-resources|/ig")) elem.html(elem.html().trim().replace(/@[\w-\(|\)]+\s/ig, ""))
        }

        function cleanThisInnerHTML(elem) {
            for (var indx = 0; indx < contentTypes.length; ++indx) {
                var reg = new RegExp(contentTypes[indx][0] + " ", "ig");
                elem.innerHTML = elem.innerHTML.replace(reg, "<span class='" + contentTypes[indx][1] + "'>" + contentTypes[indx][2] + "</span>")
            }
            var newHTML = "";
            if (elem.innerHTML.match("/|@getting-started|@ad-delivery|@data|@creative|@publishers|@certified|@your-resources|/ig")) elem.innerHTML = elem.innerHTML.trim().replace(/@[\w-\(|\)]+\s/ig, "")
        }
        if (currPageURL.indexOf("/hc/" + currentLang + "/requests/new") > -1) var cleanSuggestions = setInterval(function() {
            $(".searchbox-suggestions").find("a").each(function() {
                cleanThis($(this))
            })
        }, 100);
        if ($(".notification-text").length) cleanThis($(".notification-text"));
        $(".breadcrumbs").find("li").each(function() {
            this.title = cleanTextOnly(this.title)
        });
        $(".search-result").find(".search-result-meta").each(function() {
            $(this).html($(this).html().split("</time> in ")[1])
        });
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
        $("body").on("focusout", ".k-select", function() {
            $(this).find("ul").slideUp("fast"), $(this).removeAttr('style')
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
                $(this).find("ul").slideUp("fast"), $(this).removeAttr('style')
            } else {
                $('.k-select ul').slideUp("fast"), $(this).find("ul").slideDown("fast"), $(this).css('border-radius', '3px 3px 0 0');
                if ($(this).next("select").is(".plat-status,.select-template-dropdown,.update-template-dropdown,.plat-segment")) {
                    $(this).css('background-image', 'url(//theme.zdassets.com/theme_assets/539845/03dd478487f9953b3e1b7f33423c5beef050c8f3.png)')
                } else {
                    $(this).css('background-image', 'url(//theme.zdassets.com/theme_assets/539845/8945cb0bea0bf2bb8175cabd4019a3ef7bade132.png)')
                }
            }
        });

        function hideSidenavElem() {
            $("#nav-list > li.dsp").hide();
            $("#nav-list > li.newdsp").hide();
            $("#nav-list > li.dmp").hide();
            $("#nav-list > li.mdx").hide();
            $("#nav-list > li.mdx2").hide();
            $("#nav-list > li.supportkb").hide();
            $("#nav-list > .platformTitle").hide();
        }
        hideSidenavElem();

        $("main").prepend('<div class="nav-border"></div>');
        $("#filterContent").fadeIn();

        $(".switchTag").on("change", function() {

            var toggleCSS = true;
            if (currPageURL.indexOf("/search?") > -1 && $(".search-results-list-temp li").length !== 0 && $(".search-results-list li").length == 0 && $("#query").val() !== "") {
                storage.setItem("global-filterSetting", $(".switchTag").val());
                $("form[role='search']").submit();
                return
            }
            cleanWrap();
            $("#switchTag option:selected").each(function() {
                var prevPlat = storage.getItem("global-filterSetting");
                var docRef = document.referrer.toLowerCase();

                if ($(this).val() == "api") {
                    window.open("https://developers.sizmek.com/hc/" + currentLang, "_blank");
                    updateKSelect(prevPlat);
                    $("#switchTag").val(prevPlat);
                } else if (storage.getItem("manualPlatTrigger") !== null && storage.getItem("manualPlatTrigger") == 1) {
                    toggleCSS = false;
                    storage.removeItem("manualPlatTrigger");
                    storage.setItem("global-filterSetting", $(this).attr("value"));
                    if (!cookieFilter && !isInURL("/search?")) window.location = "https://support.sizmek.com/hc/";
                    else if (isInURL("/search?")) location.reload();
                    else cookieFilter = false;
                } else if (isInURL("/articles/")) {
                    var artPlatform = "";
                    var currArticleId = currPageURL.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];

                    $.get("/api/v2/help_center/" + currentLang + "/articles/" + currArticleId + ".json").done(function(res) {
                        var artTags = res.article.label_names;
                        switchPlatform(artTags, prevPlat);
                    }).fail(function() {
                        switchPlatform("", prevPlat);
                    });
                } else if (isInURL("/categories/")) {
                    var catPlatform = "";
                    var catID = currPageURL.split("categories/")[1].split("#")[0].split("-")[0].split("?")[0];
                    $.get("/api/v2/help_center/" + currentLang + "/categories/" + catID + ".json").done(function(res) {
                        var catTags = res.category.description;
                        switchPlatformCat(catTags, prevPlat);
                    });
                } else if (isInURL("/sections/")) {
                    var sectID = currPageURL.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];
                    $.get("/api/v2/help_center/" + currentLang + "/sections/" + sectID + ".json").done(function(res) {
                        var catTags = res.section.description;
                        switchPlatformCat(catTags, prevPlat);
                    });
                } else if (prevPlat === null) {
                    if ($.inArray("mdx_nxt", HelpCenter.user.tags) > -1) $(".switchTag").val("mdx_nxt");
                    if ($.inArray("mdx_2.0", HelpCenter.user.tags) > -1) $(".switchTag").val("mdx_2_0");
                    if ($.inArray("rocketfuel_user", HelpCenter.user.tags) > -1) $(".switchTag").val("dsp");
                    storage.setItem("global-filterSetting", $("#switchTag").val());
                    toggleSidenavElem();
                    togglePlatVis();
                } else {
                    $(".switchTag").val(prevPlat);
                    toggleSidenavElem();
                    togglePlatVis();

                }

                function togglePlatVis() {
                    $("#platformFilter").val($("#switchTag").val());

                    if (($("#switchTag").val() == "dsp" || $("#switchTag").val() == "newdsp" || $("#switchTag").val() == "dmp") && toggleCSS) {
                        $(".search-results-list-temp").find("li").each(function() {
                            $(this).show();
                        });
                    }
                    if ($("#switchTag").val() == "showall" && toggleCSS == true) {
                        $("#mdx_2_0").show();
                        $("#support_kb").hide();
                        $("#search-header").show();
                        $("body").addClass("mdxcss");
                        $("body").removeClass("support_kb");
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
                        $("#mdx_2_0").show();
                        $("#support_kb").hide();
                        $("#search-header").show();
                        $("body").addClass("mdxcss");
                        $("body").removeClass("support_kb");
                        $("#five").show();
                        toggleVis("mdx_2_0")
                    }
                    if ($("#switchTag").val() == "mdx_nxt" && toggleCSS == true) {
                        $("#mdx_2_0").show();
                        $("#support_kb").hide();
                        $("#search-header").show();
                        $("body").addClass("mdxcss");
                        $("body").removeClass("support_kb");
                        $("#five").hide();
                        if (!$('#201188756').length) $('.addtlResources > .group-list').append('<li class="section" id="201188756"> <a class="sectionDrop" href="/hc/en-us/categories/201188756">Training Videos</a></li>');
                        toggleVis("mdx_nxt");
                    }
                    if ($("#switchTag").val() == "support_kb" && toggleCSS) {
                        if (isSectionPage) {
                            $("#show-data").css("display", "none");
                            $("body.support_kb").find("p.bodytext").css("display", "none");
                            $(".pagination").css("display", "none");
                        }
                        $("#mdx_2_0").hide();
                        $("#search-header").hide();
                        $("#support_kb").show();
                        $("body").removeClass("mdxcss");
                        $("body").addClass("support_kb");
                        $(".section-tree").find("section").each(function() {
                            $(this).show()
                        });
                        $(".article-list").find("li").each(function() {
                            $(this).show()
                        })
                    } else {
                        if (isSectionPage) {
                            $("body.support_kb").find("p.bodytext").css("display", "none");
                            $("#show-data").css("display", "none");
                            $(".article-list:first").css("display", "block");
                            $("#sectionloader").css("display", "none");
                            $(".pagination").css("display", "block");
                        }
                        $("aside").css("display", "block")
                    }
                    if (typeof $(".section-tree") !== "undefined") {
                        if ($("#switchTag").val() !== "support_kb" && $(".header").html().indexOf("Message Board") < 0) {
                            var sectionsArr = $(".section-tree > section");
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
                            var sectionsArr = $(".section-tree > section");
                            for (var indx = 0; indx < sectionsArr.length; indx = indx + 2) {
                                var oddElem = sectionsArr[indx];
                                var evenElem = sectionsArr[indx + 1];
                                $(oddElem).children("ul").css("height", "auto");
                                $(evenElem).children("ul").css("height", "auto")
                            }
                        }
                        $(".section-tree").find("section").each(function() {
                            if (currPageURL.indexOf("/categories/201680143") ==
                                -1) $(this).find(".see-all-articles").text("See all articles")
                        })
                    }

                    $(".article-list").find("li").each(function() {
                        if (($(this).html().indexOf("issue-title") > -1 || $(this).html().indexOf("article-title") > -1 || $(this).html().indexOf("topic-title") > -1 || $(this).html().indexOf("section-title") > -1 || $(this).html().indexOf("reference-title") > -1 || $(this).html().indexOf("faq-title") > -1) && $("#switchTag").val() == "support_kb") $(this).addClass("treeline");
                        else if ($(this).html().indexOf("sub-title") > -1 || $(this).html().indexOf("issue-title") > -1) $(this).addClass("treeline");
                        else $(this).removeClass("treeline")
                    });
                    var platforms = JSON.parse(localStorage.getItem("platforms"));
                    var platform_url = currPageURL.split("/");
                    var platform_id = platform_url[platform_url.length - 1].split("-", 1).toString();
                    if ($(".section-tree").children(".section:visible").length == 0 && $(".article-list").children("li:visible").length == 0 && $("#switchTag").val() !== "support_kb" && currPageURL.indexOf("/categories/201680143") < 0 && jQuery.inArray(platform_id, platforms) < 0) {
                        var currPlat = $("#switchTag").val() ==
                            "mdx_2_0" ? "MDX 2.0" : "Sizmek Advertising Suite";
                        var altPlat = currPlat == "MDX 2.0" ? "Sizmek Advertising Suite" : "MDX 2.0";
                        $(".currPlat").text(currPlat);
                        $(".altPlat").text(altPlat);
                        $(".noContent").show();
                        $("#sectionloader").css("display", "none");
                        if ($(".noContent").css("opacity") > 0) setTimeout(function() {
                            window.location = "https://support.sizmek.com/hc/"
                        }, 1500)
                    } else $(".noContent").hide();
                    if ($("#switchTag").val() !== "support_kb" && currPageURL.indexOf("/categories/") > -1) $(".article-list").find("a").each(function() {
                        var htmlParts =
                            $(this).html().split(">");
                        if (htmlParts[htmlParts.length - 1].length > 72) htmlParts[htmlParts.length - 1] = htmlParts[htmlParts.length - 1].substr(0, 72) + "...";
                        $(this).html(htmlParts.join(">"))
                    });
                    var checkEmptyResult = setInterval(function() {
                        if ($(".search-results-list > li:visible").length < 4) {
                            clearInterval(checkEmptyResult);
                            $(".search-results-list").hide();
                            $(".search-results-list-temp").show()
                        } else if ($(".search-results-list > li:visible").length > 1) clearInterval(checkEmptyResult)
                    }, 100);
                    if ($(".tabYourResources li").length >=
                        1 && currentUser == "end_user" || HelpCenter.user.email == "professionalservices@sizmek.com") $(".tabYourResources").show();
                    else $(".tabYourResources").hide();
                }

                function switchPlatform(tags, prevPlat) {
                    var tagPlatform = "";
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

                function switchPlatformCat(tags, prevPlat) {
                    var tagPlatform = "";
                    var tagsArr = tags.split(" ");
                    for (var x = 0, found = 0; x < tagsArr.length && found == 0; x++) {
                        var tag = tagsArr[x].replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();
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

                function changeSwitchTag(platform, prevPlat) {
                    if (platform == "") {
                        if (prevPlat === null) {
                            if ($.inArray("mdx_nxt", HelpCenter.user.tags) > -1) $(".switchTag").val("mdx_nxt");
                            if ($.inArray("mdx_2.0", HelpCenter.user.tags) > -1) $(".switchTag").val("mdx_2_0");
                        } else {
                            $("#switchTag").val(prevPlat);
                        }
                    } else {
                        storage.setItem("global-filterSetting", platform);
                        $("#switchTag").val(platform);
                    }
                    toggleSidenavElem();
                }

                function toggleSidenavElem() {
                    updateKSelect($("#switchTag").val());
                    switch ($("#switchTag").val()) {
                        case "mdx_2_0":
                            $("body").addClass("mdxcss");
                            $("#nav-list > li.dsp").remove();
                            $("#nav-list > li.newdsp").remove();
                            $("#nav-list > li.dmp").remove();
                            $("#nav-list > li.mdx").remove();
                            $("#nav-list > li.supportkb").hide();
                            if (currentLang == "en-us") $("#nav-list > li.mdx2").show(), $("#nav-list > li.mdx2-ja").hide();
                            else $("#nav-list > li.mdx2").hide(), $("#nav-list > li.mdx2-ja").show();
                            $("#nav-list .platformTitle").remove();
                            break;
                        case "mdx_nxt":
                            $("body").addClass("mdxcss");
                            $("#nav-list > li.dsp").remove();
                            $("#nav-list > li.newdsp").remove();
                            $("#nav-list > li.dmp").remove();
                            $("#nav-list > li.mdx2").remove();
                            $("#nav-list > li.supportkb").hide();
                            if (currentLang == "en-us") $("#nav-list > li.mdx").show(), $("#nav-list > li.sas-ja").hide();
                            else $("#nav-list > li.mdx").hide(), $("#nav-list > li.sas-ja").show();
                            $(".platformTitle").remove();
                            break;
                        case "dsp":
                            $("body").addClass("mdxcss");
                            if (currentUser != "anonymous") {
                                $("#nav-list > li.mdx2").remove();
                                $("#nav-list > li.mdx").remove();
                                $("#nav-list > li.newdsp").remove();
                                $("#nav-list > li.dmp").remove();
                                $("#nav-list > li.dsp").show();
                                $("#nav-list > li.supportkb").hide();
                                $(".platformTitle").hide();
                                $("body").addClass("mdxcss");
                            } else {
                                $("#nav-list").html('<li class="firstLi"></li><li class="mdx2"><a data-auth-action="signin" href="' + $('.headerRight a').attr("href") + '" class="categoryDrop">PlEASE SIGN IN</a></li><li></li>')
                            }
                            break;
                        case "dmp":
                            $("body").addClass("mdxcss");
                            if (currentUser != "anonymous") {
                                $("#nav-list > li.mdx").remove();
                                $("#nav-list > li.mdx2").remove();
                                $("#nav-list > li.dsp").remove();
                                $("#nav-list > li.newdsp").remove();
                                $("#nav-list > li.dmp").show();
                                $("#nav-list > li.supportkb").hide();
                                $(".platformTitle").hide();
                                $("body").addClass("mdxcss");
                            } else {
                                $("#nav-list").html('<li class="firstLi"></li><li class="mdx2"><a data-auth-action="signin" href="' + $('.headerRight a').attr("href") + '" class="categoryDrop">PlEASE SIGN IN</a></li><li></li>')
                            }
                            break;
                        case "newdsp":
                            $("body").addClass("mdxcss");
                            if (currentUser != "anonymous") {
                                $("#nav-list > li.mdx").remove();
                                $("#nav-list > li.mdx2").remove();
                                $("#nav-list > li.dsp").remove();
                                $("#nav-list > li.newdsp").show();
                                $("#nav-list > li.dmp").remove();
                                $("#nav-list > li.supportkb").hide();
                                $(".platformTitle").hide();
                                $("body").addClass("mdxcss");
                            } else {
                                $("#nav-list").html('<li class="firstLi"></li><li class="mdx2"><a data-auth-action="signin" href="' + $('.headerRight a').attr("href") + '" class="categoryDrop">PlEASE SIGN IN</a></li><li></li>')
                            }
                            break;
                        case "support_kb":
                            $("body").removeClass("mdxcss").addClass("support_kb");
                            $("#nav-list > li.dsp").hide();
                            $("#nav-list > li.newdsp").hide();
                            $("#nav-list > li.dmp").hide();
                            $("#nav-list > li.mdx").hide();
                            $("#nav-list > li.mdx2").hide();
                            $("#nav-list > li.supportkb").show();
                            $("#nav-list > .platformTitle").hide();
                            break;
                        case "showall":
                            $("#nav-list > li.dsp").show();
                            $("#nav-list > li.newdsp").show();
                            $("#nav-list > li.dmp").show();
                            $("#nav-list > li.mdx").show();
                            $("#nav-list > li.mdx2").show();
                            $("#nav-list > li.supportkb").show();
                            $("#nav-list > .platformTitle").show();
                            if (currentLang == "en-us") $("#nav-list > li.mdx").show(), $("#nav-list > li.sas-ja").hide(), $("#nav-list > li.mdx2").show(), $("#nav-list > li.mdx2-ja").hide();
                            else $("#nav-list > li.mdx").hide(), $("#nav-list > li.sas-ja").show(), $("#nav-list > li.mdx2").hide(), $("#nav-list > li.mdx2-ja").show();

                    }
                    var gaPlatform = $("#switchTag").val();
                    ga("set", "dimension4", gaPlatform);
                    togglePlatVis();
                }
            });

            function highlight_codes() {
                if (currPageURL.indexOf("/articles/") > -1) {
                    $("ul[class='toc-indentation'").remove();
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
        var searchURL, gotCategories = 0,
            gotSections = 0,
            gotCategoryList = 0,
            categoryArray = [],
            sectionArray = [],
            searchPlat = filterPlat = alterPlat = "",
            searchVar = currPageURL.split("#page="),
            searchPrefix = searchVar[0] + "#page=";
        var searchCurrPage = searchVar[1] === undefined ? 1 : searchVar[1];

        function checkResultCount() {
            if ($("#switchTag").val() == "support_kb") $(".search-results-list-temp").find("li.search-result").each(function() {
                $(this).show()
            });
            else {
                var showPlat = $("#switchTag").val() == "mdx_2_0" ? "mdx2-title" : "mdxnxt-title";
                var hidePlat = showPlat == "mdx2-title" ? "mdxnxt-title" : "mdx2-title";
                if ($("#switchTag").val() == "showall" || $("#switchTag").val() == "support_kb" || $("#switchTag").val() == "dsp" || $("#switchTag").val() == "newdsp" || $("#switchTag").val() == "dmp") showPlat = "<a";
                $(".search-results-list-temp").find("li.search-result").each(function() {
                    $(this).hide();
                    if ($(this).html().indexOf(showPlat) > -1) $(this).show()
                })
            }
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
                    if (resultCount > 1) $(".searchStatus").text($(".search-result:visible").length +
                        " results found for current filter");
                    else {
                        resultCount = resultCount == 1 ? "One" : "No";
                        $(".searchStatus").text(resultCount + " result found for current filter")
                    }
                    $($("#filterContentTypes input:checked")[0]).prop("disabled", false)
                } else $("#filterContentTypes input").prop("disabled", false)
            }
            $(".search-results-column").find("p").text($(".search-results-column").find("p").text().replace(/@[\w-()]+\s/ig, ""))
        }
        if (currPageURL.indexOf("/search?") > -1) {
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
                        categoryArray =
                            $.merge(newArray, categoryArray);
                        if (categoryApiURL !== null) {
                            categoryApiURL += "&per_page=100";
                            searchCategories()
                        } else {
                            storage.setItem(HelpCenter.user.email + "-allCategories" + helpCenterVer + currentLang, JSON.stringify(categoryArray));
                            gotCategories = 1
                        }
                    });
                else {
                    categoryArray = JSON.parse(storage.getItem(HelpCenter.user.email + "-allCategories" + helpCenterVer + currentLang));
                    gotCategories = 1
                }
            };
            $(".search-filter").show();
            var searchResultReady = setInterval(function() {
                if ($("#results").length) {
                    if (HelpCenter.user.role == "anonymous")
                        $("#results").prepend("<div class='signInResults'>Please <a href='https://platform.mediamind.com/Eyeblaster.ACM.Web/Login/ZDLogin.aspx?brand_id=12005&locale_id=1&return_to=" + encodeURIComponent(currPageURL) + "'>sign in</a> to view all results.</div>");
                    clearInterval(searchResultReady)
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
                    var tempPlatforms = ["mdx2", "mdxnxt", "dsp", "newdsp", "dmp"];
                    if ($("#query").val().length > 1) {
                        if ($("#switchTag").val() == "mdx_2_0") filterPlat = "mdx2";
                        if ($("#switchTag").val() == "mdx_nxt") filterPlat = "mdxnxt";
                        if ($("#switchTag").val() == "dsp") filterPlat = "dsp";
                        if ($("#switchTag").val() == "newdsp") filterPlat = "newdsp";
                        searchPlat = "&label_names=" + filterPlat;
                        if ($("#switchTag").val() == "support_kb") {
                            searchPlat = "&category=" + kbCategories;
                            filterPlat = "supportkb";
                        } else if ($("#switchTag").val() == "dmp") {
                            searchPlat = "&category=360000026612";
                            filterPlat = "dmp";
                        }
                        var findPlat = tempPlatforms.indexOf(filterPlat);
                        if (findPlat !== -1) tempPlatforms.splice(findPlat, 1);
                    }
                    $.each(categoryArray, function(i, category) {
                        if (category.desc.indexOf(filterPlat) > -1) tempCategories.push([category.name, category.id]);
                        else if (category.desc.indexOf("@supportkb") < 0 && category.desc.indexOf("@other") < 0 && filterPlat !== "supportkb") {
                            var regv = new RegExp(tempPlatforms.join("|"), 'g');
                            if (!category.desc.match(regv)) tempCategories.push([category.name, category.id])
                        }
                    });
                    tempCategories.sort();
                    var options = "";
                    for (var i = 0; i < tempCategories.length; i++)
                        if ($("#categoryFilter option[value='" + tempCategories[i][0] + "']").length == 0) options += '<option value="' + tempCategories[i][1] + '">' + tempCategories[i][0] + "</option>";
                    $("#categoryFilter").append(options);
                    searchQuery = $("#query").val().trim();
                    var hashCount = (searchQuery.match(/#/g) || []).length
                    if (searchQuery.substr(0, 1) == "#") {
                        searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery.replace(" ", "+")) +
                            "+-%22Revision%20ver.%22&locale=" + currentLang + searchPlat + "&label_names=" + searchQuery.replace("#", "Tags:") + "&per_page=8&page=" + searchCurrPage;
                    } else {
                        searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) +
                            "+-%22Revision%20ver.%22&locale=" + currentLang + searchPlat + "&per_page=8&page=" + searchCurrPage;
                    }
                    if ($("#switchTag").val() == "support_kb") hcTags = kbTags;
                    if ($("#switchTag").val() == "showall") $.extend(true, hcTags, kbTags);
                    var iter = hcTags.length;
                    var appendThis = tagText = "";
                    $.each(hcTags, function(i, hctag) {
                        var labelFilter, findTag;
                        labelFilter = "&label_names=" + hctag;
                        findTag = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "+-%22Revision%20ver.%22&locale=" + currentLang + labelFilter + "&per_page=1";
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
                                        var searchCat =
                                            "";
                                        if ($("#query").val().length > 1) {
                                            if ($("#switchTag").val() == "mdx_2_0") searchPlatform = "mdx2";
                                            if ($("#switchTag").val() == "mdx_nxt") searchPlatform = "mdxnxt";
                                            if ($("#switchTag").val() == "support_kb" && $("#categoryFilter").val() == "") searchCat = "&category=" + kbCategories
                                        }
                                        if (checked && $("#categoryFilter").val() == "") {
                                            searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "+-%22Revision%20ver.%22&locale=" + currentLang + "&per_page=100&label_names=" + $(this).attr("val") + searchCat + "&page=" +
                                                searchCurrPage;
                                            searchArticles(searchURL, false);
                                        } else if (!checked && $("#categoryFilter").val() !== "") {
                                            searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "+-%22Revision%20ver.%22&locale=" + currentLang + "&category=" + $("#categoryFilter").val() + "&per_page=8&label_names=" + searchPlatform + "&page=" + searchCurrPage;
                                            searchArticles(searchURL, true);
                                        } else if (checked && $("#categoryFilter").val() !== "") {
                                            searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) +
                                                "+-%22Revision%20ver.%22&locale=" + currentLang + "&category=" + $("#categoryFilter").val() + "&per_page=100&label_names=" + $(this).attr("val") + "&page=" + searchCurrPage;
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

            window.onhashchange = function() {
                pageNo = document.location.hash.split("#page=")[1];
                searchURL = searchURL + "&page=" + pageNo;
                searchArticles(searchURL)
            };
        }

        function reSearch(pageNo) {
            $(".simplePag").pagination("selectPage", pageNo);
            $(".loaderSpin").pagination("selectPage", pageNo);
            document.location.hash = "#page=" + pageNo
        }

        function searchArticles(searchURL, pp) {
            var currLoc = window.location.href.split("#page=");
            var pagShow = pp == undefined ? true : pp;
            $(".search-results-list-temp").html('<li class="loaderSpin"><img src="/hc/theme_assets/539845/200023575/spingrey.gif" style="border:0px"></li>');
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
                        return section.id == result["section"]
                    })[0]["name"];
                    var sectionURL = sectionArray.filter(function(section) {
                        return section.id == result["section"]
                    })[0]["url"];
                    var categoryID = sectionArray.filter(function(section) {
                        return section.id == result["section"]
                    })[0]["category"];
                    var categoryName = categoryArray.filter(function(category) {
                        return category.id == categoryID
                    })[0]["name"];
                    var categoryURL = categoryArray.filter(function(category) {
                        return category.id == categoryID
                    })[0]["url"];
                    $.each(result["labels"], function(ind, lab) {
                        var ctypeVar = contentTypes.filter(function(ctype) {
                            return ctype[0].slice(1) == lab
                        })[0];
                        ctypeList += ctypeVar !== undefined ? '<span class="' + ctypeVar[1] + '"><b>' + ctypeVar[2] + "</b></span>" : ""
                    });
                    var regx = /(<([^>]+)>)/ig;
                    var rawHTML = result["body"];
                    var searchKey = preg_quote(searchQuery);
                    var cleanHTML = "";
                    var regNew = new RegExp(searchKey, "i");
                    if (rawHTML) cleanHTML = rawHTML.replace(regx, "");
                    var resultIndex = cleanHTML.search(regNew);
                    if (resultIndex > 60) cleanHTML = "..." + highlight(cleanHTML.substring(resultIndex - 60, resultIndex + 70), searchKey) + "...";
                    else cleanHTML = highlight(cleanHTML.substring(0, 130), searchKey) + "...";
                    var titleLink = String(ctypeList) + '<a href="' + result["url"] + '" class="search-result-link">' +
                        result["title"] + "</a>";
                    var videoSpan = '<span class="video-title"><b>VIDEO</b></span>';
                    if (titleLink.split(videoSpan).length > 1) titleLink = titleLink.split(videoSpan)[0] + titleLink.split(videoSpan)[1] + "&nbsp;&nbsp;" + videoSpan;
                    var newHTML = titleLink;
                    if (parseInt(result["vote"]) >= 1) newHTML += ' <span class="search-result-votes">' + result["vote"] + "</span>";
                    newHTML += '<div class="search-result-meta"><a href="' + categoryURL + '" class="categoryLink">' + categoryName + "</a>";
                    newHTML += " > ";
                    newHTML += '<a href="' + sectionURL + '">' + sectionName + "</a></div>";
                    newHTML += '<div class="search-result-description">' + cleanHTML + "</div>";
                    var realHTML = $("<li>").html(newHTML);
                    realHTML.addClass("search-result");
                    realHTML.attr("id", "search-result-" + i);
                    realHTML.appendTo(".search-results-list-temp");
                    $(".loaderSpin").appendTo($(".search-results-list-temp"));
                });

                if (jQuery.inArray("view_support_content", HelpCenter.user.tags) !== -1) {
                    for (var x = 0; x < results.length; x++) {
                        $("#search-result-" + x).append("<div class='tagList-" + x + "'></div>");
                    }

                    for (var x = 0; x < results.length; x++) {
                        for (var y = 0; y < results[x].labels.length; y++) {
                            if (results[x].labels[y].substr(0, 5) == "Tags:") {
                                $(".tagList-" + x).append("<a class='hashTags " + results[x].labels[y].toLowerCase().substr(5) + "' style='font-size: 12px;margin-left: 0px !important; margin-bottom: 0px !important; margin-top: 10px !important;' ><div class='cssCircle plusSign' style='display: none; background: #1a75ff;'>&#43;</div><div class='tagName'>#" + results[x].labels[y].substr(5) + "</div></a>");
                            }
                        }
                    }
                }

                if (pagShow) {
                    $(".simplePag, .loaderSpin").show();
                    $(".simplePag").pagination({
                        items: searchResultTotal,
                        itemsOnPage: 8,
                        hrefTextPrefix: currLoc[0] + "#page=",
                        currentPage: currLoc[1],
                        displayedPages: 0,
                        edges: 0,
                        onPageClick: function(page,
                            event) {
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
                checkResultCount()
            })
        }

        function toggleVis(plat) {
            var showPlat = plat == "mdx_2_0" ? "mdx2-title" : "mdxnxt-title";
            var hidePlat = showPlat == "mdx2-title" ? "mdxnxt-title" : "mdx2-title";
            var hidePlatTag = hidePlat == "mdxnxt-title" ? "@mdxnxt" : "@mdx2";
            $(".releaseTag").each(function() {
                if (($(this).text().indexOf("@mdx2") > -1 || $(this).html().indexOf("mdx2-title") > -1) && currPageURL.indexOf("/categories/201680143") == -1) {
                    $(this).html('<span class="mdx2-title">MDX 2.0</span>');
                    if (showPlat == "mdxnxt-title") $(this).parent().parent().hide()
                } else if (($(this).text().indexOf("@mdxnxt") > -1 || $(this).html().indexOf("mdxnxt-title") > -1) && currPageURL.indexOf("/categories/201680143") == -1) {
                    $(this).html('<span class="mdxnxt-title">SAS</span>');
                    if (showPlat == "mdx2-title") $(this).parent().parent().hide()
                }
            });
            $(".section-tree").find("section").each(function() {
                var visibleCount = 0;
                $(this).find("li").each(function() {
                    $(this).hide();
                    if ($(this).html().indexOf(showPlat) > -1) {
                        $(this).show();
                        visibleCount += 1
                    } else if ($(this).html().indexOf(hidePlat) < 0) {
                        $(this).show();
                        visibleCount += 1
                    }
                });
                if (visibleCount == 0 && currPageURL.indexOf("/categories/201680143") == -1) {
                    $(this).hide();
                    $(this).appendTo($(this).parent())
                }
            });
            $(".article-list:first").find("li").each(function() {
                $(this).hide();
                if ($(this).html().indexOf(showPlat) > -1) $(this).show();
                else if ($(this).html().indexOf(hidePlat) < 0) $(this).show()
            });
        }

        $("#categoryFilter").on("change", function() {
            var selectVal = $(this).val();
            searchDone = 0;
            if ($("#filterContentTypes input:checked").length > 0) {
                searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "+-%22Revision%20ver.%22&locale=" + currentLang + searchPlat + "&per_page=100&category=" + selectVal + "&label_names=" + $($("#filterContentTypes input:checked")[0]).attr("val") + "&page=" + searchCurrPage;
                searchArticles(searchURL, false)
            } else {
                if ($("#switchTag").val() ==
                    "support_kb" && selectVal == "") selectVal = kbCategories;
                searchURL = "/api/v2/help_center/articles/search.json?query=" + encodeURIComponent(searchQuery) + "+-%22Revision%20ver.%22&locale=" + currentLang + searchPlat + "&per_page=8&category=" + selectVal + "&page=" + searchCurrPage;
                searchArticles(searchURL)
            }
        });

        function loadArticleData() {
            if ($(".article-body").length) {
                if ($(".article-header").text().toLowerCase().indexOf("glossary") >
                    -1 || $("#switchTag").val() == "support_kb") $(".quickNavMenu").tocify({
                    context: ".article-body",
                    selectors: "h2,h3"
                });
                else $(".quickNavMenu").tocify({
                    context: ".article-body",
                    selectors: "h2"
                });
                $(".quickNavMenu").append('<ul id="backToTop" class="tocify-header nav nav-list"><li class="topLink"><a href="javascript:void(0);" onclick="scrollUp();" style="padding-top: 17px;">\u2191 &nbsp; Back to Top</a></li></ul>')
            }
            $("main").show();

            function fixedHeaderReset() {
                if ($("zd-hc-navbar").css("margin-top") < 0) $("table.stickyHeader").css("top", "64px");
                else $("table.stickyHeader").css("top", "16px");
                $("table.stickyHeader").each(function() {
                    var shTable = $(this);
                    $(this).removeClass("stickyHeader");
                    var fixedTableHeader;

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
            try {
                $(".steps > ul").children("li").each(function() {
                    var splitPath = $(this).html().split("&gt;");
                    splitPath[splitPath.length - 1] = "<span style='color:#faf000'>" + splitPath[splitPath.length - 1] + "</span>";
                    $(this).html(splitPath.join("&gt;"))
                })
            } catch (e) {}
            try {
                $(".steps-StrikeAd > ul").children("li").each(function() {
                    var splitPathStrikeAd = $(this).html().split("&gt;");
                    splitPathStrikeAd[splitPathStrikeAd.length - 1] = "<span style='color:#FAF000'>" +
                        splitPathStrikeAd[splitPathStrikeAd.length - 1] + "</span>";
                    $(this).html(splitPathStrikeAd.join("&gt;"))
                })
            } catch (e$0) {}

            function removePageElems(appViewer) {
                if (appViewer) {
                    $(".article-body").hide().parentsUntil("body").andSelf().siblings().hide();
                    $(".main-column").css("margin", "0px");
                    $(".article-body").css("padding", "0px");
                    $(".article-wrapper").css("margin", "0px");
                    $(".article-wrapper").css("padding-left", "10px");
                    $("#sideNavigation").hide();
                    $("#sidefoot").hide();
                    $("main").css("width", "100%")
                } else $(".article-body").show().parentsUntil("body").andSelf().siblings().hide();
                $("h2").css("padding", "0px");
                $("h2").css("margin-top", "0px");
                $("h2").css("border-bottom", "none");
                $(".article-sidebar").remove();
                $(".wrapper").css("min-height", "initial");
                $("main").css("min-height", "initial");
                $("html").css("height", "auto");
                $("html").css("display", "block")
            }
            if (currPageURL.indexOf("/articles/") > -1 || isSectionPage) {
                var populateRecentTickets = function(dropdownObj) {
                    var recentTickets = "/api/v2/tickets/recent.json?per_page=30";
                    dropdownObj.find("option").remove();
                    var options = dropdownObj;
                    options.append($("<option />").val("-").text("Select your ticket"));
                    $.get(recentTickets).done(function(data) {
                        $.each(data.tickets, function() {
                            if (this.id !== undefined) options.append($("<option />").val(this.id).text(this.id + " | " + this.subject))
                        })
                    })
                };
                var ticketID, fromAppPlatform, fromAppCategory, fromAppSection, fromAppParent, fromAppArticle, fromAppTags, checkAccess, firstAppLoad = false;
                appView = window.ZAFClient.init(function(context) {
                    if (appView) {
                        $("#suggestEdit .loaderBG").addClass("inAppLoader");
                        $(".ticketSelector").hide();
                        $("#suggestEdit").css({
                            boxShadow: "none"
                        });
                        appView.trigger("iframeLoaded");
                        appView.on("addReviewUI", function(reviewVer) {
                            if (reviewVer.reviewType == "review_a_new_article") newArticle = true;
                            else newArticle = false;
                            if (newArticle || reviewVer.highestVer == reviewVer.currVer) $("#backBtn, #approveBtn, #updateBtn, #rejectBtn").fadeIn();
                            else $("#backBtn, #restoreBtn").fadeIn();
                            $("#backBtn").click(function() {
                                appView.trigger("backBtn")
                            });
                            $("#rejectBtn").click(function() {
                                $("#suggestEditLabel").text("Reject All Changes?");
                                $("#suggestEdit .modal-body-container").hide();
                                $("#backBtn, #approveBtn, #updateBtn, #rejectBtn, .modal-body").hide();
                                $("#rejectReasonWrap, #cancelRejectBtn, #confirmRejectBtn").show()
                                $("#confirmRejectBtn, #cancelRejectBtn").appendTo("#rejectReasonWrap").css("float", "initial").css("margin-left", "20px")
                            });
                            $("#updateBtn").click(function() {
                                if (checkChanged())
                                    if ($("#categorySelect>option:selected").index() == 0 || $("#sectionSelect>option:selected").index() == 0) appView.trigger("errorMsg", {
                                        msg: "<strong>Missing values!</strong><br/>Please select the article category and section."
                                    });
                                    else $.getJSON("/api/v2/users/me/session.json", function(data) {
                                        currUserID = data.session.user_id;
                                        $("#suggestEdit").find("input, textarea, button, select").attr("disabled", "disabled");
                                        $("#updateBtn").text("PLEASE WAIT...");
                                        $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                            checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                            var createArticleAPI = "/api/v2/help_center/sections/201949563/articles.json";
                                            var nextVer = parseInt(reviewVer.highestVer) + 1;
                                            var newTitle;
                                            if (!newArticle) newTitle = "Article ID " + currArticleId + " - Revision ver." + reviewVer.majorVer +
                                                "." + nextVer;
                                            else newTitle = "New Article : " + $("#articleTitle").val() + " - Revision ver." + reviewVer.majorVer + "." + nextVer;
                                            var addArticleJSON = {
                                                "article": {
                                                    "title": newTitle,
                                                    "comments_disabled": true,
                                                    "locale": "en-us",
                                                    "label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ",").split(","),
                                                    "body": decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"))
                                                }
                                            };
                                            $.ajax(createArticleAPI, {
                                                type: "POST",
                                                dataType: "json",
                                                contentType: "application/json",
                                                processData: false,
                                                data: JSON.stringify(addArticleJSON),
                                                success: function(data) {
                                                    var commentStr;
                                                    var ticketTags;
                                                    commentStr = "Following values has been revised:\n";
                                                    if (originalArticleTitle !== $("#articleTitle").val()) commentStr += "\nPrevious Title: " + originalArticleTitle + "\nUpdated Title: " + $("#articleTitle").val() + "\n";
                                                    if (originalPlatform !== $("#platformSelect option:selected").val()) commentStr += "\nPrevious Platform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + "\nUpdated Platform: " + $("#platformSelect option:selected").text() + "\n";
                                                    if (originalCategoryName !==
                                                        $("#categorySelect option:selected").attr("name")) commentStr += "\nPrevious Category: " + originalCategoryName + "\nUpdated Category: " + $("#categorySelect option:selected").attr("name") + "\n";
                                                    if (originalSectionName !== $("#sectionSelect option:selected").attr("name")) commentStr += "\nPrevious Section: " + originalSectionName + "\nUpdated Section: " + $("#sectionSelect option:selected").attr("name") + "\n";
                                                    if (originalParent !== $("#parentSelect option:selected").attr("name") && $("#platformSelect>option:selected").index() ==
                                                        3) commentStr += "\nPrevious Parent: " + originalParent + "\nUpdated Parent: " + $("#parentSelect option:selected").attr("name") + "\n";
                                                    if (originalTags !== $("#searchKeywords").val().replace(/[\s,]+/g, ",")) commentStr += "\nPrevious Tags: " + originalTags + "\nUpdated Tags: " + $("#searchKeywords").val().replace(/[\s,]+/g, ",") + "\n";
                                                    if (CKEDITOR.instances.ckEditor.checkDirty()) commentStr += "\n\nArticle Content: Changed";
                                                    else commentStr += "\n\nArticle Content: Same as version " + reviewVer.majorVer + "." + reviewVer.currVer;
                                                    commentStr +=
                                                        "\n\nRevision Version: " + reviewVer.majorVer + "." + nextVer + " \nState: Updated \nReference No. " + data.article.id;
                                                    ticketTags = reviewVer.ticketTags;
                                                    var versionJSON = {
                                                        "ticket": {
                                                            "comment": {
                                                                "body": commentStr,
                                                                "author_id": currUserID
                                                            },
                                                            "tags": ticketTags.split(","),
                                                            "custom_fields": [{
                                                                "id": 24296553,
                                                                "value": $("#articleTitle").val()
                                                            }, {
                                                                "id": 24296523,
                                                                "value": $("#platformSelect option:selected").attr("name")
                                                            }, {
                                                                "id": 24340796,
                                                                "value": $("#categorySelect option:selected").attr("name")
                                                            }, {
                                                                "id": 24296543,
                                                                "value": $("#sectionSelect option:selected").attr("name")
                                                            }, {
                                                                "id": 24303693,
                                                                "value": $("#parentSelect option:selected").attr("name")
                                                            }, {
                                                                "id": 24340816,
                                                                "value": $("#searchKeywords").val().replace(/[\s,]+/g, ",")
                                                            }],
                                                            "ticket_id": reviewVer.ticketID,
                                                            "security_token": checkAccess,
                                                            "action": "update"
                                                        }
                                                    };
                                                    var tickAPI = phpURL + helpCenterVer;
                                                    submitCheck = false;
                                                    $("#suggestEdit .loaderBG").fadeIn();
                                                    $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                                    $("#suggestEdit .submitStatus").text("Submitting updated version...");
                                                    $.ajax(tickAPI, {
                                                        method: "POST",
                                                        data: JSON.stringify(versionJSON)
                                                    }).done(function(resData, textStatus, xhr) {
                                                        submitCheck = true;
                                                        $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                        $("#suggestEdit .submitStatus").text("Version updated successfully.")
                                                    }).fail(function(xhr, textStatus, errorThrown) {
                                                        $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                            var showIP = data.ip;
                                                            $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                            $("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " +
                                                                showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                            $("#suggestEdit .backSubmit").click(function() {
                                                                $("#suggestEdit .loaderBG").fadeOut();
                                                                $("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
                                                                CKEDITOR.instances.ckEditor.setReadOnly(false);
                                                                $("#updateBtn").text("UPDATE VERSION")
                                                            })
                                                        })
                                                    }).complete(function() {
                                                        if (submitCheck) {
                                                            $("#suggestEdit .loaderBG").fadeOut();
                                                            appView.trigger("updateVersionDone")
                                                        }
                                                    })
                                                },
                                                error: function() {
                                                    appView.trigger("errorMsg", {
                                                        msg: "<strong>Sorry!</strong><br/>There was a problem submitting your version changes. Please try again later."
                                                    })
                                                }
                                            })
                                        })
                                    });
                                else appView.trigger("errorMsg", {
                                    msg: "<strong>No changes found!</strong><br/>There are no changes to save as a new version."
                                })
                            });
                            $("#restoreBtn").click(function() {
                                CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).acceptAll();
                                $("#suggestEdit").find("input, textarea, select").css("background-color", "initial");
                                $("#restoreBtn").hide();
                                $("#previewBtn, #publishBtn").show()
                            });
                            $("#approveBtn").click(function() {
                                CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).acceptAll();
                                $("#suggestEdit").find("input, textarea, select").css("background-color", "initial");
                                $("#updateBtn, #rejectBtn, #approveBtn").hide();
                                $("#previewBtn, #publishBtn").show()
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
                                    var reg = new RegExp(contentTypes[indx][0] + " ", "ig");
                                    titleUpdated = titleUpdated.replace(reg, "<span class='" + contentTypes[indx][1] + "'>" + contentTypes[indx][2] + "</span>")
                                }
                                var newHTML = "";
                                var videoSpan = '<span class="video-title">VIDEO</span>';
                                if (titleUpdated.split(videoSpan).length > 1) {
                                    for (var indy = 0; indy < titleUpdated.split(videoSpan).length; ++indy) newHTML += titleUpdated.split(videoSpan)[indy];
                                    titleUpdated = newHTML + " " + videoSpan
                                }
                                if (titleUpdated.match("/|@getting-started|@ad-delivery|@data|@creative|@publishers|@certified|@your-resources|/ig")) titleUpdated = titleUpdated.trim().replace(/@[\w-()]+\s/ig, "");
                                storage.setItem(HelpCenter.user.email + "-previewPlatform" + currArticleId, platformFilter);
                                storage.setItem(HelpCenter.user.email + "-previewTitle" + currArticleId, titleUpdated);
                                storage.setItem(HelpCenter.user.email + "-previewPage" + currArticleId, CKEDITOR.instances.ckEditor.getData());
                                var params = "width=" + screen.width;
                                params += ", height=" + screen.height;
                                params += ", top=0, left=0";
                                params += ", fullscreen=yes";
                                var previewWin = window.open("/hc/en-us/articles/208223316?currArticleId=" + currArticleId, "Preview Window", params);
                                if (window.focus) previewWin.focus()
                            });
                            $("#publishBtn").click(function() {
                                $("#suggestEditLabel").text("Publish Approved Article?");
                                $("#suggestEdit .modal-body-container").hide();
                                $("#backBtn, #approveBtn, #updateBtn, #rejectBtn, #previewBtn, #publishBtn, .modal-body").hide();
                                $("#publishWrap, #cancelPublishBtn, #confirmPublishBtn").show();
                                $("#cancelPublishBtn, #confirmPublishBtn").appendTo("#publishWrap").css("float", "initial").css("margin-left", "20px")
                            });
                            $("#cancelRejectBtn").click(function() {
                                $("#suggestEditLabel").text("Review Suggested Changes");
                                $("#suggestEdit .modal-body-container").show();
                                $("#backBtn, #approveBtn, #updateBtn, #rejectBtn, .modal-body").show();
                                $("#rejectReasonWrap, #cancelRejectBtn, #confirmRejectBtn").hide()
                            });
                            $("#cancelPublishBtn").click(function() {
                                $("#suggestEditLabel").text("Review Suggested Changes");
                                $("#suggestEdit .modal-body-container").show();
                                $("#backBtn, #previewBtn, #publishBtn, .modal-body").show();
                                $("#publishWrap, #cancelPublishBtn, #confirmPublishBtn").hide();
                                $("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
                                CKEDITOR.instances.ckEditor.setReadOnly(false)
                            });
                            $("#confirmRejectBtn").click(function() {
                                if ($("#reasonText").val() != "") appView.trigger("addComment", {
                                    thisComment: $("#reasonText").val()
                                });
                                else appView.trigger("errorMsg", {
                                    msg: "<strong>Comment missing!</strong><br/>Please explain why the changes are being rejected for the contributor."
                                })
                            });
                            $("#confirmPublishBtn").click(function() {
                                $.getJSON("/api/v2/users/me/session.json", function(data) {
                                    currUserID = data.session.user_id;
                                    $.getJSON("/api/v2/help_center/sections/201249236.json",
                                        function(data) {
                                            checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                            $("#suggestEdit").find("input, textarea, button, select").attr("disabled", "disabled");
                                            $("#confirmPublishBtn").text("PUBLISHING...");
                                            var ar_pos;
                                            if ($("#platformSelect option:selected").val() == "supportkb") ar_pos = parseInt($("#parentSelect option:selected").val()) + 1;
                                            else ar_pos = 0;

                                            function publishArticle() {
                                                if (!newArticle) {
                                                    var updateArticleAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";
                                                    var updateArticleJSON;
                                                    if ($("#sectionSelect option:selected").val() == "201265859") updateArticleJSON = {
                                                        "article": {
                                                            "section_id": $("#sectionSelect option:selected").val(),
                                                            "author_id": "357520165",
                                                            "position": ar_pos,
                                                            "label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ",").split(",")
                                                        }
                                                    };
                                                    else updateArticleJSON = {
                                                        "article": {
                                                            "section_id": $("#sectionSelect option:selected").val(),
                                                            "position": ar_pos,
                                                            "label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ",").split(",")
                                                        }
                                                    };
                                                    $.ajax(updateArticleAPI, {
                                                        type: "PUT",
                                                        dataType: "json",
                                                        contentType: "application/json",
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
                                                                type: "PUT",
                                                                dataType: "json",
                                                                contentType: "application/json",
                                                                processData: false,
                                                                data: JSON.stringify(updateTranslationJSON),
                                                                success: function(data) {
                                                                    appView.trigger("articleUpdated", {
                                                                        thisComment: $("#publishComment").val()
                                                                    })
                                                                },
                                                                error: function(err) {
                                                                    appView.trigger("errorMsg", {
                                                                        msg: "<strong>Error!</strong><br/>Could not publish article. Please check permissions."
                                                                    })
                                                                }
                                                            })
                                                        },
                                                        error: function(err) {
                                                            appView.trigger("errorMsg", {
                                                                msg: "<strong>Error!</strong><br/>Could not publish article. Please check permissions."
                                                            })
                                                        }
                                                    })
                                                } else {
                                                    var newArticleAPI = "/api/v2/help_center/sections/" + $("#sectionSelect option:selected").val() + "/articles.json";
                                                    var ar_title = $("#articleTitle").val();
                                                    var ar_label_names = $("#searchKeywords").val().replace(/[\s,]+/g, ",").split(",");
                                                    var ar_body = decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"));
                                                    var newArticleJSON;
                                                    if (isNaN(ar_pos)) ar_pos = 1;
                                                    if ($("#sectionSelect option:selected").val() == "201265859") newArticleJSON = {
                                                        "article": {
                                                            "title": ar_title,
                                                            "author_id": "357520165",
                                                            "comments_disabled": true,
                                                            "locale": "en-us",
                                                            "label_names": ar_label_names,
                                                            "position": ar_pos,
                                                            "body": ar_body
                                                        }
                                                    }
                                                    else newArticleJSON = {
                                                        "article": {
                                                            "title": ar_title,
                                                            "comments_disabled": true,
                                                            "locale": "en-us",
                                                            "label_names": ar_label_names,
                                                            "position": ar_pos,
                                                            "body": ar_body
                                                        }
                                                    };
                                                    $.ajax(newArticleAPI, {
                                                        type: "POST",
                                                        dataType: "json",
                                                        contentType: "application/json",
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
                                                            var updateLatestTicket = phpURL + helpCenterVer;
                                                            submitCheck = false;
                                                            $("#suggestEdit .loaderBG").fadeIn();
                                                            $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                                            $("#suggestEdit .submitStatus").text("Publishing updated article...");
                                                            $.ajax(updateLatestTicket, {
                                                                method: "POST",
                                                                data: JSON.stringify(updateCustomFields)
                                                            }).done(function(resData, textStatus, xhr) {
                                                                submitCheck = true;
                                                                $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                                $("#suggestEdit .submitStatus").text("Article published successfully.")
                                                            }).fail(function(xhr, textStatus, errorThrown) {
                                                                $.getJSON("https://jsonip.com/?callback=?",
                                                                    function(data) {
                                                                        var showIP = data.ip;
                                                                        $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                                        $("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                                        $("#suggestEdit .backSubmit").click(function() {
                                                                            $("#suggestEdit .loaderBG").fadeOut();
                                                                            $("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
                                                                            CKEDITOR.instances.ckEditor.setReadOnly(false);
                                                                            $("#confirmPublishBtn").text("CONFIRM PUBLISH")
                                                                        })
                                                                    })
                                                            }).complete(function() {
                                                                if (submitCheck) {
                                                                    $("#suggestEdit .loaderBG").fadeOut();
                                                                    appView.trigger("articleAdded", {
                                                                        thisComment: $("#publishComment").val(),
                                                                        thisURL: data.article.html_url
                                                                    })
                                                                }
                                                            })
                                                        },
                                                        error: function(err) {
                                                            appView.trigger("errorMsg", {
                                                                msg: "<strong>Error!</strong><br/>Could not publish article. Please check permissions."
                                                            })
                                                        }
                                                    })
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
                                                    type: "POST",
                                                    dataType: "json",
                                                    contentType: "application/json",
                                                    processData: false,
                                                    data: JSON.stringify(sectionSubJSON),
                                                    success: function(data) {
                                                        publishArticle()
                                                    },
                                                    error: function(err) {
                                                        appView.trigger("errorMsg", {
                                                            msg: "<strong>Error!</strong><br/>Could not subscribe GlobalNotifications user to the Message Board section."
                                                        })
                                                    }
                                                })
                                            } else publishArticle()
                                        })
                                })
                            })
                        });
                        appView.on("connectionEstablished", function(data) {
                            ticketID = data.ticketID;
                            currArticleId = data.articleID;
                            if (data.reviewType == "review_a_new_article") newArticle = true;
                            else newArticle = false;
                            removePageElems(appView);
                            appView.trigger("showIframe");
                            $("#suggestEdit").modal("show");
                            $(".modal-backdrop").removeClass("modal-backdrop");
                            $("#suggestEdit").css("position", "initial");
                            $("#suggestEdit").css("margin-left", "0px");
                            $("#suggestEdit").css("width", $("#suggestEdit .modal-body-container").width() - 10);
                            $("#suggestEdit").css("height", $("#suggestEdit .modal-body-container").height());
                            $("#suggestEdit").css("display", "block");
                            $("#suggestEdit").css("opacity", "1");
                            $("#suggestEdit").css("overflow-y", "hidden");
                            $(".modal-header").hide();
                            $("main").css("margin-top", "0px");
                            $("html").css("overflow-y", "hidden");
                            $(".modal-body").css("overflow-y", "hidden");
                            $("#categorySelect, #sectionSelect, #articleTitle, #searchKeywords, #parentSelect").css("width", "315px");
                            $("#otherDetails").find("li")[0].style.width = "549px";
                            $("#submitSuggestionBtn").hide();
                            $("#cancelSuggestionBtn").hide();
                            $("#related-article-tickets").hide();
                            $("#suggestEdit .modal-body-right").css("border", "1px solid #DDDDDB");
                            $(".loaderBG").css("width", $("#suggestEdit .modal-content").width());
                            $(".loaderBG").css("height", $("#suggestEdit .modal-content").height());
                            if (newArticle) $("#suggestEditLabel").text("Review New Article Submission");
                            else $("#suggestEditLabel").text("Review Suggested Changes");
                            fromAppPlatform = data.platformName;
                            fromAppCategory = data.categoryId;
                            fromAppSection = data.sectionId;
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
                            if ($("#platformSelect>option:selected").index() == 3) {
                                $(".kbonly").show();
                                $(".cke_contents").css("height", "180px")
                            } else {
                                $(".kbonly").hide();
                                $(".cke_contents").css("height", "230px")
                            }
                            appView.trigger("reviewEditorReady")
                            $(".close").hide()
                        })
                    }
                });
                var catArray = [];
                var secArray = [];
                var artArray = [];
                var currArticleId, articleURL, currUserID, customAPI, redirectAPI;
                if (currPageURL.indexOf("/articles/") > -1) {
                    currArticleId = currPageURL.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];
                    articleURL = currPageURL.split("--")[0];
                    redirectAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";
                    customAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";
                    var getArticleAPI = "/api/v2/help_center/en-us/articles/" + currArticleId + ".json";
                } else if (isSectionPage) {
                    currSectionId = currPageURL.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];
                    articleURL = currPageURL.split("--")[0];
                    redirectAPI = "/api/v2/help_center/sections/201249236.json";
                    customAPI = "/api/v2/help_center/articles/search.json?section=" + currSectionId
                }
                if (currPageURL.indexOf("/articles/") > -1 && currArticleId == "209729503" && currPageURL.indexOf("type=Files") > -1) removePageElems();
                else if (HelpCenter.user.email !== null && (currPageURL.indexOf("/articles/") > -1 || isSectionPage))
                    if (currentUser == "manager" || currentUser == "agent") {
                        var resetSuggestionModal = function() {
                            $("#platformSelect").val(originalPlatform);
                            $("#categorySelect").find("option:gt(0)").remove();
                            $("#sectionSelect").find("option:gt(0)").remove();
                            $("#typeSelect").val(originalType);
                            $("#parentSelect").empty();
                            $("#parentSelect").append('<option value="None">None</option>');
                            if ($("#platformSelect>option:selected").index() == 3) {
                                $(".kbonly").show();
                                $(".cke_contents").css("height", "180px")
                            } else {
                                $(".kbonly").hide();
                                $(".cke_contents").css("height", "230px")
                            }
                            firstParentRun = keyTimer = firstTypeRun = true;
                            $("#articleTitle").val(originalArticleTitle).change();
                            $("#searchKeywords").val(originalTags);
                            resetCategoryDropdown(catArray, secArray, originalCategoryID, originalSectionID, originalPlatform);
                            resetCKeditor()
                        };
                        var checkChanged = function() {
                            return CKEDITOR.instances.ckEditor.checkDirty() || $("#platformSelect option:selected").val() != originalPlatform || $("#categorySelect option:selected").val() != originalCategoryID || $("#sectionSelect option:selected").val() != originalSectionID || $("#parentSelect option:selected").attr("name") != originalParent && typeof $("#parentSelect option:selected").attr("name") !==
                                "undefined" || $("#articleTitle").val() != originalArticleTitle || $("#searchKeywords").val() != originalTags || $("#typeSelect").val() != originalType && $("#platformSelect>option:selected").index() == 3
                        };
                        var showError = function(msg) {
                            $(".errorMessage").text(msg);
                            $(".errorMessage").fadeIn();
                            setTimeout(function() {
                                $(".errorMessage").fadeOut(500)
                            }, 4E3)
                        };
                        var resetSectionDropdown = function(secArray, currSectionId, currCategoryId) {
                            $.each(secArray, function(i, section) {
                                if (section["category"] == currCategoryId) {
                                    $("#sectionSelect").append('<option name="' +
                                        section["name"] + '" value="' + section["id"] + '">' + cleanTextOnly(section["name"]) + "</option>");
                                    $("#bread-drop").prepend('<a id="section-' + section["id"] + '" href="/hc/en-us/sections/' + section["id"] + '">' + cleanTextOnly(section["name"]) + "</a>")
                                }
                            });
                            var checkSectionId = $("#section-" + currSectionId);
                            $("#bread-drop").find(checkSectionId).css({
                                "background-color": "#ebf8fe",
                                "border-left": "3px solid #0072c6"
                            });
                            if (appView && firstAppLoad) {
                                originalSectionID = currSectionId = fromAppSection;
                                firstAppLoad = false
                            }
                            $("#sectionSelect").val(currSectionId).change();
                        };
                        var resetCategoryDropdown = function(catArray, secArray, currCategoryId, currSectionId, currPlatform) {
                            $.each(catArray, function(i, category) {
                                if (currPlatform == "mdx2" && category["desc"].indexOf("@mdx2") > -1 || currPlatform == "mdxnxt" && category["desc"].indexOf("@mdxnxt") > -1 || currPlatform == "supportkb" && category["desc"].indexOf("@supportkb") > -1 || currPlatform == "strikead" && category["desc"].indexOf("@strikead") > -1 || currPlatform ==
                                    "unspecified" && (category["desc"].indexOf("@mdx2") == -1 && category["desc"].indexOf("@mdxnxt") == -1 && category["desc"].indexOf("@supportkb") == -1 && category["desc"].indexOf("@strikead") == -1)) $("#categorySelect").append('<option name="' + category["name"] + '" value="' + category["id"] + '">' + cleanTextOnly(category["name"]) + "</option>")
                            });
                            if (appView && firstAppLoad) originalCategoryID = currCategoryId = fromAppCategory;
                            if (currCategoryId > 0) {
                                $("#categorySelect").val(currCategoryId);
                                resetSectionDropdown(secArray, currSectionId, currCategoryId)
                            }
                        };
                        var resetCKeditor = function(tracking) {
                            CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).rejectAll();
                            CKEDITOR.instances.ckEditor.destroy(true);
                            if ($("#ckEditor").length) CKEDITOR.replace("ckEditor", {
                                filebrowserBrowseUrl: "/hc/en-us/articles/209729503?ver=23&type=Files&articleId=" + currArticleId,
                                filebrowserWindowWidth: "100%",
                                filebrowserWindowHeight: "100%",
                                customConfig: "https://services.serving-sys.com/HostingServices/custdev/ckeditor/config.js",
                                on: {
                                    instanceReady: function(evt) {
                                        setTimeout(function() {
                                            $(".cke_wysiwyg_frame").contents().find(".expandingblock").css("display", "block")
                                            if (!tracking) CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).toggleTracking(false, false);
                                        }, 100);
                                    }
                                }
                            })
                        };
                        CKEDITOR.on("instanceReady", function(evt) {
                            if (!appView) $(".use-article, .suggest-edit, .flag-article, .add-article, .request-article").fadeIn()
                        });
                        $.fn.modal.Constructor.prototype.enforceFocus = function() {
                            var $modalElement = this.$element;
                            $(document).on("focusin.modal", function(e) {
                                var $parent = $(e.target.parentNode);
                                if ($modalElement[0] !== e.target && !$modalElement.has(e.target).length && !$parent.hasClass("cke_dialog_ui_input_select") &&
                                    !$parent.hasClass("cke_dialog_ui_input_text")) $modalElement.focus()
                            })
                        };
                        catArray = [];
                        secArray = [];
                        var originalHTML, originalArticleID, originalArticleTitle, originalTags, originalType, originalParent, originalPosition, originalSectionID, originalSectionName, originalCategoryID, originalCategoryName, originalPlatform, newArticle, tempTitle, tempTags, tempHTML;
                        $('<div id="useArticle" class="internal_only side-modal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG" style="display: none;"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">&times;</button><h1 id="suggestEditLabel" class="modal-title">Use this article to resolve your ticket</h1></div><div class="modal-body"><ul id="articleLocation"><li>Ticket <select id="ticketSelect"><option value="-" name="-">Select your ticket</option></select></li></ul><input type="checkbox" id="suggestArticle"><span class="suggestArticleLabel">Also suggest this article to the ticket owner as the solution</span></div><div class="modal-footer"><span class="errorMessage"></span><button id="useTicketButton" class="btn btn-primary" name="CONTINUE" type="button">UPDATE TICKET</button><button id="cancelUseBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div><div id="requestArticle" class="internal_only side-modal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG requestLoader"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">&times;</button><h1 id="requestArticleLabel" class="modal-title">Request a New Article</h1></div><div class="modal-body"><p>What would you like to see in the new article?</p><p><textarea id="requestArticleDetail" rows="4" cols="50"></textarea></p><div class="ticketSelector">Also update following ticket for UFFA <select class="ticketSelectorSM"><option value="-">Select a ticket if you wish to update</option></select></div></div><div class="modal-footer"><span class="errorMessage"></span><button id="confirmRequestBtn" class="btn btn-primary" name="CONTINUE" type="button">REQUEST ARTICLE</button><button id="cancelRequestBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div><div id="flagArticle" class="internal_only side-modal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG flagLoader"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">&times;</button><h1 id="flagArticleLabel" class="modal-title">Thank you for helping us improve our Help Center!</h1></div><div class="modal-body"><p>How should the article be flagged?</p><select id="flagReason"><option value="-">Please select a reason</option><option value="article_flagged_reason_inaccurate_information">Inaccurate Information</option><option value="article_flagged_reason_insufficient_information">Insufficient Information</option><option value="article_flagged_reason_outdated_information">Outdated Information</option><option value="article_flagged_reason_broken_link">Broken Link</option><option value="article_flagged_reason_broken_image_or_video">Broken Image or Video</option><option value="article_flagged_reason_missing_attachment">Missing Attachment</option><option value="article_flagged_reason_other">Other</option></select><p>Please share some more details about your report:</p><p><textarea id="detailedReason" rows="4" cols="50"></textarea></p><div class="ticketSelector">Also update following ticket for UFFA <select class="ticketSelectorSM"><option value="-">Select a ticket if you wish to update</option></select></div></div><div class="modal-footer"><span class="errorMessage"></span><button id="confirmFlagBtn" class="btn btn-primary" name="CONTINUE" type="button">FLAG ARTICLE</button><button id="cancelFlagBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div><div id="suggestEdit" class="internal_only side-modal" tabindex="-1"> <div class="modal-dialog"> <div class="modal-content"> <div class="loaderBG"> <img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"> <h3 class="submitStatus"> </h3> </div> <div class="modal-header"> <button class="close" name="x" type="button" data-dismiss="modal">&times;</button> <h1 id="suggestEditLabel" class="modal-title">Suggest changes to this article </h1> </div> <div id="rejectReasonWrap"> <p>Additional comments for rejecting changes: </p> <textarea id="reasonText"> </textarea> </div> <div id="publishWrap"> <p>Additional comments: </p> <textarea id="publishComment"> </textarea> </div> <div class="modal-body-container"> <div class="modal-body"> <textarea id="ckEditor"> </textarea> </div> <div class="modal-body modal-body-right"> <ul id="articleLocation"> <li>Platform <select id="platformSelect"> <option value="unspecified" name="NO SPECIFIC">NO SPECIFIC</option> <option value="mdx2" name="MDX 2.0">MDX 2.0</option> <option value="mdxnxt" name="MDX-NXT">MDX-NXT</option> <option value="supportkb" name="SUPPORT KB">SUPPORT KB</option> <option value="strikead" name="STRIKE AD">STRIKE AD</option> </select> </li> <li>Category <select id="categorySelect"> <option value="-">Select a category </option> </select> </li> <li>Section <select id="sectionSelect"> <option value="-">Select a section </option> </select> </li> </ul> <hr /> <ul id="articleDetails" class="kbonly"> <li>Type <select id="typeSelect" disabled> <option value="-">None </option> <option value="topic">Topic </option> <option value="article">Article </option> <option value="issue">Issue </option> <option value="reference">Reference </option> <option value="@howto">How to </option> </select> </li> <li class="parentDrop">Parent <select id="parentSelect"> <option value="None">Not available for selected article type </option> </select> </li> </ul> <hr class="kbonly" /> <ul id="otherDetails"> <li> Title <input type="text" id="articleTitle"> </li> <li>Tags <input type="text" id="searchKeywords"> </li> </ul> <div class="ticketSelector">Also update following ticket for UFFA <select id="ticketSelector"> <option value="-" name="-">Select a ticket if you wish to update </option> </select> </div> <hr/> <div id="related-article-tickets"> Related Tickets <table> <thead> <tr> <td>ID</td> <td>Updated</td> </tr> </thead> <tbody></tbody> </table> </div> <div class="modal-side-options"> <span class="errorMessage"> </span> <button id="submitSuggestionBtn" class="btn btn-primary" name="CONTINUE" type="button">SUBMIT SUGGESTION </button> <button id="cancelSuggestionBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL </button> <button id="backBtn" class="btn btn-default" type="button">BACK </button> <button id="publishBtn" class="btn btn-primary" type="button">PUBLISH </button> <button id="previewBtn" class="btn btn-info" type="button">PREVIEW IN FULLSCREEN </button> <button id="approveBtn" class="btn btn-success" type="button">PREVIEW </button> <button id="updateBtn" class="btn btn-warning" type="button">UPDATE VERSION </button> <button id="rejectBtn" class="btn btn-danger" type="button">REJECT </button> <button id="restoreBtn" class="btn btn-info" type="button">RESTORE THIS VERSION </button> <button id="cancelRejectBtn" class="btn btn-default" type="button">CANCEL </button> <button id="confirmRejectBtn" class="btn btn-primary" type="button">CONFIRM REJECT </button> <button id="confirmPublishBtn" class="btn btn-primary" type="button">CONFIRM PUBLISH </button> <button id="cancelPublishBtn" class="btn btn-default" type="button">CANCEL </button> </div> </div> </div> </div> </div></div>').insertAfter("#main-wrap");
                        if (currPageURL.indexOf("/articles/") > -1) {
                            $(".main-column").prepend('<a class="use-article click" role="button" data-toggle="modal" data-target="#useArticle" data-backdrop="static" data-keyboard="false">USE</a>');
                            $(".main-column").prepend('<a class="suggest-edit click" role="button" data-toggle="modal" data-target="#suggestEdit" data-backdrop="static" data-keyboard="false">FIX</a>');
                            $(".main-column").prepend('<a class="flag-article click" role="button" data-toggle="modal" data-target="#flagArticle" data-backdrop="static" data-keyboard="false">FLAG</a>');
                            $(".main-column").prepend('<a class="add-article click" role="button" data-toggle="modal" data-target="#suggestEdit" data-backdrop="static" data-keyboard="false">ADD</a>');
                            $(".main-column").prepend('<a class="request-article click" role="button" data-toggle="modal" data-target="#requestArticle" data-backdrop="static" data-keyboard="false">REQUEST</a>');
                        } else if (isSectionPage) {
                            $('<div id="suggestEdit" class="internal_only side-modal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">&times;</button><h1 id="suggestEditLabel" class="modal-title">Submit an Article</h1></div><div id="rejectReasonWrap"><p>Additional comments for rejecting changes:</p><textarea id="reasonText"></textarea></div><div id="publishWrap"><p>Additional comments:</p><textarea id="publishComment"></textarea></div><div class="modal-body"><ul id="articleLocation"><li>Platform  <select id="platformSelect"><option value="unspecified" name="NO SPECIFIC">NO SPECIFIC</option><option value="mdx2" name="MDX 2.0">MDX 2.0</option><option value="mdxnxt" name="MDX-NXT">MDX-NXT</option><option value="supportkb" name="SUPPORT KB">SUPPORT KB</option><option value="strikead" name="STRIKE AD">STRIKE AD</option></select></li><li>Category <select id="categorySelect"><option value="-">Select a category</option></select></li><li>Section <select id="sectionSelect"><option value="-">Select a section</option></select></li></ul><hr /><ul id="articleDetails" class="kbonly"><li>Type <select id="typeSelect" disabled><option value="-">None</option><option value="topic">Topic</option><option value="article">Article</option><option value="issue">Issue</option><option value="reference">Reference</option><option value="@howto">How to</option></select></li><li class="parentDrop">Parent <select id="parentSelect"><option value="None">Not available for selected article type</option></select></li></ul><hr class="kbonly" /><ul id="otherDetails"><li> Title <input type="text" id="articleTitle"></li><li>Tags <input type="text" id="searchKeywords"></li></ul><hr /><textarea id="ckEditor"></textarea><div class="ticketSelector">Also update following ticket for UFFA <select id="ticketSelector"><option value="-" name="-">Select a ticket if you wish to update</option></select></div></div><div class="modal-footer"><span class="errorMessage"></span><button id="submitSuggestionBtn" class="btn btn-primary" name="CONTINUE" type="button">SUBMIT SUGGESTION</button><button id="cancelSuggestionBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button><button id="backBtn" class="btn btn-default" type="button">BACK</button><button id="publishBtn" class="btn btn-primary" type="button">PUBLISH</button><button id="previewBtn" class="btn btn-info" type="button">PREVIEW IN FULLSCREEN</button><button id="approveBtn" class="btn btn-success" type="button">PREVIEW</button><button id="updateBtn" class="btn btn-warning" type="button">UPDATE VERSION</button><button id="rejectBtn" class="btn btn-danger" type="button">REJECT</button><button id="restoreBtn" class="btn btn-info" type="button">RESTORE THIS VERSION</button><button id="cancelRejectBtn" class="btn btn-default" type="button">CANCEL</button><button id="confirmRejectBtn" class="btn btn-primary" type="button">CONFIRM REJECT</button><button id="confirmPublishBtn" class="btn btn-primary" type="button">CONFIRM PUBLISH</button><button id="cancelPublishBtn" class="btn btn-default" type="button">CANCEL</button></div></div></div></div>').insertAfter(".sub-nav");
                            $("span .section-subscribe").prepend('<a class="add-article click" role="button" data-toggle="modal" data-target="#suggestEdit" data-backdrop="static" data-keyboard="false" style="margin-top:1px">ADD</a>')
                        }
                        $(".use-article").click(function() {
                            populateRecentTickets($("#ticketSelect"))
                        });
                        $("#suggestArticle").change(function() {
                            if ($(this).is(":checked")) {
                                var returnVal = confirm("This will update the ticket with a public comment suggesting this article as a solution but the status will not change. You will need to ensure all required ticket fields are entered and set the ticket to Pending or Solved.\n\nDo you wish to continue?");
                                $(this).attr("checked", returnVal)
                            }
                        });
                        $(".flag-article, .request-article").click(function() {
                            $("#flagArticle .loaderBG").css("width", $("#flagArticle .modal-content").width());
                            $("#flagArticle .loaderBG").css("height", $("#flagArticle .modal-content").height());
                            populateRecentTickets($(".ticketSelectorSM"))
                        });

                        $(".add-article").on("click", function() {
                            populateRelatedTickets();
                            populateRecentTickets($("#ticketSelector"));
                            $("#suggestEdit").find("h1").text("Submit an Article");
                            originalArticleTitle = "";
                            $("#articleTitle").val("");
                            originalTags = "";
                            $("#searchKeywords").val("");
                            originalHTML = "";
                            $("#submitSuggestionBtn").text("Submit Article");
                            $("#ckEditor").val("");
                            resetCKeditor(false);
                            newArticle = true
                        });
                        $('.suggest-edit').on('click', function() {
                            populateRecentTickets($("#ticketSelector"));
                            populateRelatedTickets();
                            $(".loaderBG").css("width", $("#suggestEdit .modal-content").width());
                            $(".loaderBG").css("height", $("#suggestEdit .modal-content").height());
                            $('#suggestEdit').find('h1').text('Suggest changes to this article');
                            originalHTML = [];
                            originalArticleTitle = tempTitle;
                            originalTags = tempTags;
                            originalHTML = tempHTML;
                            $("#articleTitle").val(originalArticleTitle).change();
                            $("#searchKeywords").val(originalTags);
                            $("#ckEditor").val(originalHTML);
                            resetCKeditor();
                            $("#submitSuggestionBtn").text("Submit Suggestion");
                            $('#suggestEdit .cke_contents').css("min-height", $("#suggestEdit .modal-body").height() - 118 + "px");
                            newArticle = false;
                        });

                        function populateRelatedTickets() {
                            var ticket_article = currPageURL.split("/");
                            ticket_article = ticket_article[ticket_article.length - 1].split("-", 1).toString();
                            $.get("/api/v2/search.json?query=custom_field_24296573:" + ticket_article, function(tickets) {
                                $('#related-article-tickets tbody').html("");
                                for (var x = 0; x < tickets.count; x++) {
                                    var id = tickets.results[x].id,
                                        subject = tickets.results[x].subject,
                                        status = tickets.results[x].status,
                                        requester_id = tickets.results[x].requester_id,
                                        stat_icon = '<span class="ticket_status_label status-' + status + '" title="' + status + '">' + status.substring(0, 1) + '</span>';

                                    if (tickets.results[x].updated_at != "") {
                                        var updated = new Date(tickets.results[x].updated_at);
                                    } else {
                                        var updated = new Date(tickets.results[x].updated_at);
                                    }
                                    $('#related-article-tickets table tbody').append('<tr class="related-tickets-item"><td><a href="/agent/tickets/' + id + '" target="_blank">' + stat_icon + '&nbsp;#' + id + '</a></td><td>' + updated.toDateString() + '</td></tr>');
                                }
                            });
                        }
                        $('body').on("click", '.click', function() {
                            var target = $(this).attr("data-target");
                            $(target).addClass("slide-in"), $('html').addClass('stop-scrolling')
                        });
                        $('body').on("click", '.side-modal #cancelRequestBtn, .side-modal .close, .side-modal #cancelRejectBtn, .side-modal #cancelPublishBtn, .side-modal #cancelFlagBtn, .side-modal #cancelUseBtn, .side-modal #cancelSuggestionBtn', function() {
                            $(this).closest(".side-modal").removeClass("slide-in"), $('html').removeClass('stop-scrolling')
                        });
                        $(document).keydown(function(e) {
                            if (e.keyCode == 27) {
                                $(".side-modal").find(".close").click();
                            }
                        });
                        $(".modal").on("shown", function() {
                            $("html")[0].className = "stop-scrolling"
                        });
                        $(".modal").on("hidden", function() {
                            $("html")[0].className =
                                ""
                        });
                        $("#platformSelect").on("change", function() {
                            $("#categorySelect").find("option:gt(0)").remove();
                            $("#sectionSelect").find("option:gt(0)").remove();
                            $("#parentSelect").find("option:gt(0)").remove();
                            if ($("#platformSelect>option:selected").index() == 3) {
                                $(".kbonly").show();
                                $(".cke_contents").css("height", "180px")
                            } else {
                                $(".kbonly").hide();
                                $(".cke_contents").css("height", "230px")
                            }
                            resetCategoryDropdown(catArray, secArray, 0, 0, $("#platformSelect").val())
                        });
                        $("#categorySelect").on("change", function() {
                            $("#sectionSelect").find("option:gt(0)").remove();
                            resetSectionDropdown(secArray, 0, $("#categorySelect").val())
                        });
                        var firstParentRun = true;
                        if (appView) firstParentRun = false;
                        $("#sectionSelect").on("change", function() {
                            $("#parentSelect").empty();
                            if ($("#sectionSelect").val() !== "-") {
                                var populateArticles = function() {
                                    if (storage.getItem(HelpCenter.user.email + "-section" + $("#sectionSelect").val() + "Articles" + helpCenterVer + currentLang) === null) $.get(articlesBySection).done(function(data) {
                                        articlesBySection = data.next_page;
                                        var newArray = $.map(data.articles, function(article,
                                            i) {
                                            return {
                                                "id": article.id,
                                                "name": article.name,
                                                "position": article.position
                                            }
                                        });
                                        artArray = $.merge(newArray, artArray);
                                        if (articlesBySection !== null) {
                                            articlesBySection += "&per_page=100";
                                            populateArticles()
                                        } else {
                                            storage.setItem(HelpCenter.user.email + "-" + $("#sectionSelect").val() + "Articles" + helpCenterVer + currentLang, JSON.stringify(artArray));
                                            doneArticles = 1
                                        }
                                    });
                                    else {
                                        artArray = JSON.parse(storage.getItem(HelpCenter.user.email + "-section" + $("#sectionSelect").val() + "Articles" + helpCenterVer + currentLang));
                                        doneArticles = 1
                                    }
                                };
                                $("#parentSelect").append('<option value="None" disabled>Loading...</option>');
                                artArray = [];
                                var doneArticles = 0;
                                var articlesBySection = "/api/v2/help_center/" + currentLang + "/sections/" + $("#sectionSelect").val() + "/articles.json?per_page=100";
                                if (onpageLoad == 1) populateArticles();
                                var articleRdy = setInterval(function() {
                                        if (doneArticles) {
                                            clearInterval(articleRdy);
                                            var newPosition = -1;
                                            $("#parentSelect").empty();
                                            $.each(artArray, function(i, article) {
                                                if (article["name"].toLowerCase().indexOf("@issue ") == -1 && article["name"].toLowerCase().indexOf("@sub ") == -1) {
                                                    $("#parentSelect").append('<option name="' + article["name"] + '" value="' + article["position"] + '">' + cleanTextOnly(article["name"]) + "</option>");
                                                    if (originalPosition !== 0) {
                                                        if (newPosition == -1 && article["position"] <= originalPosition) newPosition = article["position"];
                                                        if (article["position"] >= newPosition && article["position"] <= originalPosition) {
                                                            newPosition = article["position"];
                                                            if (firstParentRun) originalParent = article["name"]
                                                        }
                                                    }
                                                }
                                            });
                                            if (originalPosition == 0) {
                                                $("#parentSelect").prepend('<option value="None" name="None">Please select a parent article</option>');
                                                originalParent = "None"
                                            }
                                            if (firstParentRun) $("#parentSelect").prop("selectedIndex", $("#parentSelect [name='" + originalParent + "']").index());
                                            if (appView) {
                                                $("#parentSelect").prop("selectedIndex", $("#parentSelect [name='" + fromAppParent + "']").index());
                                                originalParent = $("#parentSelect option:selected").attr("name")
                                            }
                                            firstParentRun = false;
                                            $(".loaderBG").fadeOut(2E3);
                                            $("#suggestEdit,#requestArticle,#flagArticle").find("input, textarea, button, select").attr("disabled", false);
                                            if (appView) CKEDITOR.instances.ckEditor.setReadOnly(false)
                                        }
                                    },
                                    100)
                            } else $("#parentSelect").append('<option value="None" disabled>Please select a section first</option>')
                        });
                        var keyTimer, firstTypeRun = true;
                        $("#articleTitle").on("change keyup paste", function() {
                            keyTimer && clearTimeout(keyTimer);
                            keyTimer = setTimeout(function() {
                                $.each(kbTags, function(k, v) {
                                    if ($("#searchKeywords").val().toLowerCase().indexOf(v) > -1) $("#typeSelect").val(v)
                                });
                                if (firstTypeRun) {
                                    originalType = $("#typeSelect").val();
                                    firstTypeRun = false
                                }
                            }, 100)
                        });
                        CKEDITOR.on("instanceReady", function(evt) {
                            var oldMaxHandler = $(".cke_button__maximize")[0].onclick;
                            $(".cke_button__maximize")[0].onclick = function() {
                                oldMaxHandler();
                                if (CKEDITOR.instances.ckEditor.getCommand("maximize").state == 1) {
                                    $("html").css("display", "block");
                                    $("main").css("display", "block");
                                    $("#navbar-container").hide();
                                    if (appView) appView.trigger("resizeFrame")
                                } else if (!appView) $("#navbar-container").show()
                            };
                            CKEDITOR.on("dialogDefinition", function(ev) {
                                var dialogName = ev.data.name;
                                var dialogDefinition = ev.data.definition;
                                if (dialogName == "image") {
                                    dialogDefinition.removeContents("Link");
                                    dialogDefinition.removeContents("advanced")
                                }
                            })
                        });
                        $("#useTicketButton").click(function(e) {
                            var ticketSelectVal = $("#ticketSelect").find(":selected").val();
                            if (ticketSelectVal == "-") showError("Please select a ticket to update");
                            else {
                                var uffaTag = "uffa_use,new_uffa_use,usekb_" + currArticleId;
                                var uffaUseId = ticketSelectVal;
                                $.getJSON("/api/v2/users/me/session.json",
                                    function(data) {
                                        currUserID = data.session.user_id;
                                        $("#useArticle").find("input, textarea, button, select").attr("disabled", "disabled");
                                        $("#useTicketButton").text("PLEASE WAIT...");
                                        $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                            checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                            var tickAPI = phpURL + helpCenterVer;
                                            var ticketJSON = {
                                                "ticket": {
                                                    "ticket_id": uffaUseId,
                                                    "tags": uffaTag.split(","),
                                                    "author_id": currUserID,
                                                    "article_url": articleURL,
                                                    "custom_fields": [{
                                                        "id": 22079425,
                                                        "value": "uffa_use"
                                                    }, {
                                                        "id": 22031439,
                                                        "value": articleURL
                                                    }],
                                                    "suggest_article": $("#suggestArticle").is(":checked"),
                                                    "security_token": checkAccess,
                                                    "action": "use"
                                                }
                                            };
                                            submitCheck = false;
                                            $("#useArticle .loaderBG").css("width", $("#useArticle .modal-content").width());
                                            $("#useArticle .loaderBG").css("height", $("#useArticle .modal-content").height());
                                            $("#useArticle .submitStatus").css("margin-left", "100px");
                                            $("#useArticle .submitStatus").css("margin-top", "28px");
                                            $("#useArticle .loaderAnimation").css("position", "absolute");
                                            $("#useArticle .loaderAnimation").css("top", "-70px");
                                            $("#useArticle .loaderAnimation").css("left", "50px");
                                            $("#useArticle .loaderBG").fadeIn();
                                            $("#useArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                            $("#useArticle .submitStatus").html("Updating the ticket...");
                                            $.ajax(tickAPI, {
                                                method: "POST",
                                                data: JSON.stringify(ticketJSON)
                                            }).done(function(res, textStatus, xhr) {
                                                submitCheck = true;
                                                $("#useArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                $("#useArticle .submitStatus").html("Thank you! Your report has been received.")
                                            }).fail(function(xhr, textStatus, errorThrown) {
                                                $("#useArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                    var showIP = data.ip;
                                                    $(".submitStatus").css("margin-left", "200px");
                                                    $("#useArticle .submitStatus").html("<span style='color:red'>Connection to server could not be established. &nbsp; <button class='btn btn-default backSubmit' type='button'>BACK</button>");
                                                    $("#useArticle .backSubmit").click(function() {
                                                        $("#useArticle .loaderBG").fadeOut();
                                                        $("#useArticle").find("input, textarea, button, select").attr("disabled", false);
                                                        $("#useTicketButton").text("UPDATE TICKET")
                                                    })
                                                })
                                            }).complete(function() {
                                                if (submitCheck) setTimeout(function() {
                                                    $("#useArticle .loaderBG").fadeOut(),
                                                        $("#useArticle").find("input, textarea, button, select").attr("disabled", false),
                                                        $("#useTicketButton").text("UPDATE TICKET"),
                                                        $('html').removeClass('stop-scrolling'),
                                                        $("#useArticle").removeClass("slide-in");
                                                    $('#useArticle').modal('hide');
                                                }, 4E3)
                                            })
                                        })
                                    })
                            }
                        });
                        $("#confirmFlagBtn").click(function(e) {
                            var reasonText = $("#flagReason option:selected").text();
                            var reasonTag = $("#flagReason").val();
                            var descriptionText = $("#detailedReason").val();
                            var ticketTags;
                            var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();
                            if (reasonTag == "-") showError("Please select a reason from the list");
                            else if (descriptionText == "") showError("Please provide some details about this report");
                            else $.getJSON("/api/v2/users/me/session.json", function(data) {
                                currUserID = data.session.user_id;
                                $("#flagArticle").find("input, textarea, button, select").attr("disabled", "disabled");
                                $("#confirmFlagBtn").text("PLEASE WAIT...");
                                if (getPlatformName == "SUPPORT KB") {
                                    ticketTags = "contribute_flag_kb,review_a_flagged_article";
                                } else ticketTags = "contribute_flag_doc,review_a_flagged_article";
                                ticketTags += ",category_id_" + originalCategoryID;
                                $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                    checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                    $.getJSON("/api/v2/help_center/articles/" + currArticleId + ".json", function(articleData) {
                                        var tickAPI = phpURL + helpCenterVer;
                                        var ticketJSON = {
                                            "ticket": {
                                                "subject": articleData.article.title,
                                                "comment": descriptionText + "\n\nFlagged Article: [" + cleanTextOnly(articleData.article.title) + "](" + articleURL + ")\n\nFlagged for: " + $("#flagReason option:selected").text(),
                                                "requester_id": currUserID,
                                                "group_id": 21387715,
                                                "tags": ticketTags.split(","),
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
                                                    "value": $("#platformSelect option:selected").attr("name")
                                                }, {
                                                    "id": 24296533,
                                                    "value": originalSectionName
                                                }, {
                                                    "id": 24296543,
                                                    "value": $("#sectionSelect option:selected").attr("name")
                                                }, {
                                                    "id": 360008168871,
                                                    "value": String(originalSectionID)
                                                }, {
                                                    "id": 360008168891,
                                                    "value": String($("#sectionSelect option:selected").attr("value"))
                                                }, {
                                                    "id": 22209215,
                                                    "value": "pending_champions_review"
                                                }],
                                                "security_token": checkAccess,
                                                "action": "flag"
                                            }
                                        };
                                        submitCheck = false;
                                        $("#flagArticle .loaderBG").css("width", $("#flagArticle .modal-content").width());
                                        $("#flagArticle .loaderBG").css("height", $("#flagArticle .modal-content").height());
                                        $("#flagArticle .loaderBG").fadeIn();
                                        $("#flagArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                        $("#flagArticle .submitStatus").html("<br><br>Submitting your contribution...");

                                        $.ajax(tickAPI, {
                                            method: "POST",
                                            data: JSON.stringify(ticketJSON)
                                        }).done(function(res, textStatus, xhr) {
                                            submitCheck = true;
                                            $("#flagArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                            $("#flagArticle .submitStatus").html("<br><br>Thank you! Your report has been received.")
                                        }).fail(function(xhr,
                                            textStatus, errorThrown) {
                                            $("#flagArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                            $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                var showIP = data.ip;
                                                $("#flagArticle .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                $("#flagArticle .backSubmit").click(function() {
                                                    $("#flagArticle .loaderBG").fadeOut();
                                                    $("#flagArticle").find("input, textarea, button, select").attr("disabled", false);
                                                    $("#confirmFlagBtn").text("FLAG ARTICLE")
                                                })
                                            })
                                        }).complete(function() {
                                            if (submitCheck) {
                                                var ticketSelectVal = $("#flagArticle .ticketSelectorSM").find(":selected").val();
                                                if (ticketSelectVal !== "-") {
                                                    var uffaTag = "new_uffa_flag,flagkb_" + currArticleId;
                                                    var uffaFlagId = ticketSelectVal;
                                                    var tickAPI = phpURL + helpCenterVer;
                                                    var ticketJSON = {
                                                        "ticket": {
                                                            "ticket_id": uffaFlagId,
                                                            "tags": uffaTag.split(","),
                                                            "author_id": currUserID,
                                                            "article_url": articleURL,
                                                            "custom_fields": [{
                                                                "id": 22079425,
                                                                "value": "uffa_flag"
                                                            }, {
                                                                "id": 22031439,
                                                                "value": articleURL
                                                            }],
                                                            "suggest_article": false,
                                                            "security_token": checkAccess,
                                                            "action": "use"
                                                        }
                                                    };
                                                    $.ajax(tickAPI, {
                                                        method: "POST",
                                                        data: JSON.stringify(ticketJSON)
                                                    }).done(function(res, textStatus, xhr) {}).fail(function(xhr, textStatus, errorThrown) {}).complete(function() {
                                                        setTimeout(function() {
                                                            $("#flagArticle .loaderBG").fadeOut(),
                                                                $("#flagArticle").find("input, textarea, button, select").attr("disabled", false),
                                                                $("#confirmFlagBtn").text("FLAG ARTICLE"),
                                                                $("#detailedReason").val(""),
                                                                $("#flagReason").val($("#flagReason option:first").val()),
                                                                $('html').removeClass('stop-scrolling'),
                                                                $("#flagArticle").removeClass("slide-in"),
                                                                $('#flagArticle').modal('hide');
                                                        }, 4E3)
                                                    })
                                                } else setTimeout(function() {
                                                    $("#flagArticle .loaderBG").fadeOut(),
                                                        $("#flagArticle").find("input, textarea, button, select").attr("disabled", false),
                                                        $("#confirmFlagBtn").text("FLAG ARTICLE"),
                                                        $("#detailedReason").val(""),
                                                        $("#flagReason").val($("#flagReason option:first").val()),
                                                        $('html').removeClass('stop-scrolling'),
                                                        $("#flagArticle").removeClass("slide-in"),
                                                        $('#flagArticle').modal('hide');
                                                }, 4E3)
                                            }
                                        })
                                    })
                                })
                            })
                        });
                        $("#confirmRequestBtn").click(function(e) {
                            var descriptionText = $("#requestArticleDetail").val();
                            var ticketTags;
                            var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();
                            if (descriptionText == "") showError("What would you like to see in the new article?");
                            else $.getJSON("/api/v2/users/me/session.json", function(data) {
                                currUserID = data.session.user_id;
                                $("#requestArticle").find("input, textarea, button, select").attr("disabled", "disabled");
                                $("#confirmRequestBtn").text("PLEASE WAIT...");
                                if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_request_kb,review_a_requested_article";
                                else ticketTags = "contribute_request_doc,review_a_requested_article";
                                ticketTags += ",category_id_" + originalCategoryID;
                                $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                    checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                    $.getJSON("/api/v2/help_center/articles/" + currArticleId + ".json", function(articleData) {
                                        var tickAPI = phpURL + helpCenterVer;
                                        var ticketJSON = {
                                            "ticket": {
                                                "subject": "New article request has been received",
                                                "comment": "New article has been requested after viewing the following article:\n\n[" + cleanTextOnly(articleData.article.title) + "](" + articleURL + ")\n\nRequest detail:\n\n" + descriptionText,
                                                "requester_id": currUserID,
                                                "group_id": 21387715,
                                                "tags": ticketTags.split(","),
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
                                                    "value": $("#platformSelect option:selected").attr("name")
                                                }, {
                                                    "id": 24296533,
                                                    "value": originalSectionName
                                                }, {
                                                    "id": 24296543,
                                                    "value": $("#sectionSelect option:selected").attr("name")
                                                }, {
                                                    "id": 360008168871,
                                                    "value": String(originalSectionID)
                                                }, {
                                                    "id": 360008168891,
                                                    "value": String($("#sectionSelect option:selected").attr("value"))
                                                }, {
                                                    "id": 22209215,
                                                    "value": "pending_champions_review"
                                                }],
                                                "security_token": checkAccess,
                                                "action": "request"
                                            }
                                        };
                                        submitCheck = false;
                                        $("#requestArticle .loaderBG").css("width", $("#requestArticle .modal-content").width());
                                        $("#requestArticle .loaderBG").css("height", $("#requestArticle .modal-content").height());
                                        $("#requestArticle .loaderBG").fadeIn();
                                        $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                        $("#requestArticle .submitStatus").html("<br><br>Submitting your article request...");
                                        $.ajax(tickAPI, {
                                            method: "POST",
                                            data: JSON.stringify(ticketJSON)
                                        }).done(function(res, textStatus, xhr) {
                                            submitCheck = true;
                                            $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                            $("#requestArticle .submitStatus").html("<br><br>Thank you! Your request has been received.")
                                        }).fail(function(xhr, textStatus, errorThrown) {
                                            $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                            $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                var showIP = data.ip;
                                                $("#requestArticle .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                $("#requestArticle .backSubmit").click(function() {
                                                    $("#requestArticle .loaderBG").fadeOut();
                                                    $("#requestArticle").find("input, textarea, button, select").attr("disabled", false);
                                                    $("#confirmRequestBtn").text("REQUEST ARTICLE")
                                                })
                                            })
                                        }).complete(function() {
                                            if (submitCheck) {
                                                var ticketSelectVal = $("#requestArticle .ticketSelectorSM").find(":selected").val();
                                                if (ticketSelectVal !== "-") {
                                                    var uffaTag = "new_uffa_request,new_uffa_add,requestkb_pending";
                                                    var uffaRequestId = ticketSelectVal;
                                                    var tickAPI = phpURL + helpCenterVer;
                                                    var ticketJSON = {
                                                        "ticket": {
                                                            "ticket_id": uffaRequestId,
                                                            "tags": uffaTag.split(","),
                                                            "author_id": currUserID,
                                                            "article_url": articleURL,
                                                            "custom_fields": [{
                                                                "id": 22079425,
                                                                "value": "uffa_add"
                                                            }, {
                                                                "id": 22031439,
                                                                "value": "New article requested"
                                                            }],
                                                            "suggest_article": false,
                                                            "security_token": checkAccess,
                                                            "action": "use"
                                                        }
                                                    };
                                                    $.ajax(tickAPI, {
                                                        method: "POST",
                                                        data: JSON.stringify(ticketJSON)
                                                    }).done(function(res, textStatus, xhr) {}).fail(function(xhr, textStatus, errorThrown) {}).complete(function() {
                                                        setTimeout(function() {
                                                            $("#requestArticle .loaderBG").fadeOut(),
                                                                $("#requestArticle").find("input, textarea, button, select").attr("disabled", false),
                                                                $("#confirmRequestBtn").text("REQUEST ARTICLE"),
                                                                $("#requestArticleDetail").val(""),
                                                                $('html').removeClass('stop-scrolling'),
                                                                $("#requestArticle").removeClass("slide-in"),
                                                                $('#requestArticle').modal('hide');
                                                        }, 4E3)
                                                    })
                                                } else setTimeout(function() {
                                                    $("#requestArticle .loaderBG").fadeOut(),
                                                        $("#requestArticle").find("input, textarea, button, select").attr("disabled", false),
                                                        $("#confirmRequestBtn").text("REQUEST ARTICLE"),
                                                        $("#requestArticleDetail").val(""),
                                                        $('html').removeClass('stop-scrolling'),
                                                        $("#requestArticle").removeClass("slide-in"),
                                                        $('#requestArticle').modal('hide');
                                                }, 4E3)
                                            }
                                        })
                                    })
                                })
                            })
                        });
                        $("#submitSuggestionBtn").click(function() {
                            if (checkChanged())
                                if ($("#categorySelect>option:selected").index() == 0 || $("#sectionSelect>option:selected").index() == 0) showError("Please select the article category and section");
                                else $.getJSON("/api/v2/users/me/session.json", function(data) {
                                    currUserID = data.session.user_id;
                                    $("#suggestEdit").find("input, textarea, button, select").attr("disabled", "disabled");
                                    $("#submitSuggestionBtn").text("PLEASE WAIT...");
                                    highestVerArray = [];
                                    var getHighestVerAPI;
                                    if (!newArticle) getHighestVerAPI = "/api/v2/help_center/articles/search.json?query=Article" + encodeURIComponent(" " + currArticleId) + "&section=201949563&per_page=100";
                                    else getHighestVerAPI = '/api/v2/help_center/articles/search.json?query="New Article : ' +
                                        encodeURIComponent($("#articleTitle").val()) + '"&section=201949563&per_page=100';

                                    function handleErrorSubmit() {
                                        alert("Sorry, there was a problem submitting your suggestions. Please try again later."),
                                            $("#suggestEdit").find("input, textarea, button, select").attr("disabled", false),
                                            $("#submitSuggestionBtn").text("SUBMIT SUGGESTION");
                                        resetSuggestionModal();
                                        $('html').removeClass('stop-scrolling'), $("#suggestEdit").removeClass("slide-in");
                                        $('#suggestEdit').modal('hide');
                                    }

                                    function checkVersions() {
                                        $.get(getHighestVerAPI).done(function(data) {
                                            getHighestVerAPI = data.next_page;
                                            var highestMajorVer = 1;
                                            var results = $.map(data.results, function(result, i) {
                                                return {
                                                    "title": result.title
                                                }
                                            });
                                            $.each(results, function(i, result) {
                                                var thisVer = parseInt(result["title"].split("Revision ver.")[1].split(".")[0]);
                                                if (thisVer >= highestMajorVer) highestMajorVer = thisVer + 1
                                            });
                                            if (getHighestVerAPI !== null) {
                                                getHighestVerAPI += "&per_page=100";
                                                checkVersions()
                                            } else $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                                checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                                $.getJSON(redirectAPI,
                                                    function(articleData) {
                                                        var createArticleAPI = "/api/v2/help_center/sections/201949563/articles.json";
                                                        var updateTicketID;
                                                        if (currPageURL.indexOf("/articles/") > -1) {
                                                            var ar_title = "Article ID " + currArticleId + " - Revision ver." + highestMajorVer + ".0";
                                                            var ar_label_names = originalTags.split(",");
                                                            var ar_body = articleData.article.body
                                                        } else if (isSectionPage) {
                                                            ar_title = "New Article : " + $("#articleTitle").val() + " - Revision ver." + highestMajorVer + ".0";
                                                            ar_label_names = $("#searchKeywords").val().replace(/[\s,]+/g,
                                                                ",").split(",");
                                                            ar_body = decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"))
                                                        }
                                                        if (newArticle) {
                                                            ar_title = "New Article : " + $("#articleTitle").val() + " - Revision ver." + highestMajorVer + ".0";
                                                            ar_label_names = $("#searchKeywords").val().replace(/[\s,]+/g, ",").split(",");
                                                            ar_body = decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"))
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
                                                            type: "POST",
                                                            dataType: "json",
                                                            contentType: "application/json",
                                                            processData: false,
                                                            data: JSON.stringify(addOriginalArticleJSON),
                                                            success: function(original) {
                                                                if (!newArticle) {
                                                                    var addArticleJSON = {
                                                                        "article": {
                                                                            "title": "Article ID " + currArticleId + " - Revision ver." + highestMajorVer + ".1",
                                                                            "comments_disabled": true,
                                                                            "locale": "en-us",
                                                                            "label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ",").split(","),
                                                                            "body": decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g,
                                                                                "%25$1"))
                                                                        }
                                                                    };
                                                                    $.ajax(createArticleAPI, {
                                                                        type: "POST",
                                                                        dataType: "json",
                                                                        contentType: "application/json",
                                                                        processData: false,
                                                                        data: JSON.stringify(addArticleJSON),
                                                                        success: function(edited) {
                                                                            processTicket(articleData, original, edited)
                                                                        },
                                                                        error: function() {
                                                                            handleErrorSubmit()
                                                                        }
                                                                    })
                                                                } else {
                                                                    var edited = original;
                                                                    originalArticleTitle = $("#articleTitle").val();
                                                                    originalTags = $("#searchKeywords").val();
                                                                    processTicket(articleData, original, edited)
                                                                }
                                                            },
                                                            error: function() {
                                                                handleErrorSubmit()
                                                            }
                                                        });

                                                        function processTicket(articleData, original, edited) {
                                                            var tickAPI = phpURL + helpCenterVer;
                                                            var ticketTags;
                                                            var submitTitle, submitDesc, contributionType;
                                                            var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();
                                                            if (newArticle) {
                                                                currArticleId = "";
                                                                articleURL = "";
                                                                getPlatformName = $("#platformSelect option:selected").attr("name");
                                                                originalCategoryName = $("#categorySelect option:selected").attr("name");
                                                                originalSectionName = $("#sectionSelect option:selected").attr("name");
                                                                originalParent = $("#parentSelect option:selected").attr("name");
                                                                submitTitle = "New Article Received: " + $("#articleTitle").val();
                                                                submitDesc = "A new article has been received for the following location. " + "\n\nPlatform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + " \nCategory: " + cleanTextOnly(originalCategoryName) + " \nSection: " + cleanTextOnly(originalSectionName) + " \n\nRevision Version: " + highestMajorVer + ".0" + " \nState: New Draft \nReference No. " + original.article.id + "\n\n<pending-review>";
                                                                contributionType = "review_a_new_article";
                                                                if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_add_kb,review_a_new_article";
                                                                else ticketTags = "contribute_add_doc,review_a_new_article";
                                                                ticketTags += ",category_id_" + originalCategoryID;
                                                            } else {
                                                                submitTitle = "Article Edited: " + cleanTextOnly(articleData.article.title);
                                                                submitDesc = "New suggestions has been received to update following article. " + "\n\nPlatform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + " \nCategory: " + cleanTextOnly(originalCategoryName) + " \nSection: " + cleanTextOnly(originalSectionName) + " \n\nOriginal Article: [" + cleanTextOnly(originalArticleTitle) + "](" + articleURL + ") \n\nRevision Version: " +
                                                                    highestMajorVer + ".0" + " \nState: Original \nReference No. " + original.article.id;
                                                                contributionType = "review_an_existing_article_edit";
                                                                if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_fix_kb,review_an_existing_article_edit";
                                                                else ticketTags = "contribute_fix_doc,review_an_existing_article_edit";
                                                                ticketTags += ",category_id_" + originalCategoryID;
                                                            }
                                                            var ticketOriginalJSON = {
                                                                "ticket": {
                                                                    "subject": submitTitle,
                                                                    "comment": submitDesc,
                                                                    "requester_id": currUserID,
                                                                    "group_id": 21387715,
                                                                    "tags": ticketTags.split(","),
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
                                                                        "value": $("#platformSelect option:selected").attr("name")
                                                                    }, {
                                                                        "id": 24340786,
                                                                        "value": originalCategoryName
                                                                    }, {
                                                                        "id": 24340796,
                                                                        "value": $("#categorySelect option:selected").attr("name")
                                                                    }, {
                                                                        "id": 360008081912,
                                                                        "value": String(originalCategoryID)
                                                                    }, {
                                                                        "id": 360008081932,
                                                                        "value": String($("#categorySelect option:selected").attr("value"))
                                                                    }, {
                                                                        "id": 24296533,
                                                                        "value": originalSectionName
                                                                    }, {
                                                                        "id": 24296543,
                                                                        "value": $("#sectionSelect option:selected").attr("name")
                                                                    }, {
                                                                        "id": 360008168871,
                                                                        "value": String(originalSectionID)
                                                                    }, {
                                                                        "id": 360008168891,
                                                                        "value": String($("#sectionSelect option:selected").attr("value"))
                                                                    }, {
                                                                        "id": 24303683,
                                                                        "value": originalParent
                                                                    }, {
                                                                        "id": 24303693,
                                                                        "value": $("#parentSelect option:selected").attr("name")
                                                                    }, {
                                                                        "id": 24296563,
                                                                        "value": originalTags
                                                                    }, {
                                                                        "id": 24340816,
                                                                        "value": $("#searchKeywords").val().replace(/[\s,]+/g, ",")
                                                                    }],
                                                                    "security_token": checkAccess,
                                                                    "action": "add"
                                                                }
                                                            };
                                                            submitCheck = false;
                                                            $("#suggestEdit .loaderBG").css("width", $("#suggestEdit .modal-content").width());
                                                            $("#suggestEdit .loaderBG").css("height", $("#suggestEdit .modal-content").height());
                                                            $("#suggestEdit .loaderBG").fadeIn();
                                                            $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                                            $("#suggestEdit .submitStatus").text("Connecting to server, please wait...");
                                                            $.ajax(tickAPI, {
                                                                method: "POST",
                                                                data: JSON.stringify(ticketOriginalJSON)
                                                            }).done(function(getRes, textStatus, xhr) {
                                                                submitCheck = true;
                                                                $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                                $("#suggestEdit .submitStatus").text("Connection established.");
                                                                updateTicketID = $.parseJSON(getRes).ticket.id
                                                            }).fail(function(xhr, textStatus, errorThrown) {
                                                                $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                                $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                                    var showIP = data.ip;
                                                                    $("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                                    $("#suggestEdit .backSubmit").click(function() {
                                                                        $("#suggestEdit .loaderBG").fadeOut();
                                                                        $("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
                                                                        $("#submitSuggestionBtn").text("SUBMIT SUGGESTION")
                                                                    })
                                                                })
                                                            }).complete(function() {
                                                                if (!newArticle && submitCheck) {
                                                                    var commentStr;
                                                                    commentStr = "Following values has been revised:\n";
                                                                    if (originalArticleTitle !== $("#articleTitle").val()) commentStr += "\nPrevious Title: " + originalArticleTitle + "\nUpdated Title: " + $("#articleTitle").val() + "\n";
                                                                    if (originalPlatform !== $("#platformSelect option:selected").val()) commentStr += "\nPrevious Platform: " +
                                                                        $("#platformSelect option[value='" + originalPlatform + "']").text() + "\nUpdated Platform: " + $("#platformSelect option:selected").text() + "\n";
                                                                    if (originalCategoryName !== $("#categorySelect option:selected").attr("name")) commentStr += "\nPrevious Category: " + originalCategoryName + "\nUpdated Category: " + $("#categorySelect option:selected").attr("name") + "\n";
                                                                    if (originalSectionName !== $("#sectionSelect option:selected").attr("name")) commentStr += "\nPrevious Section: " + originalSectionName + "\nUpdated Section: " + $("#sectionSelect option:selected").attr("name") +
                                                                        "\n";
                                                                    if (originalParent !== $("#parentSelect option:selected").attr("name") && $("#platformSelect>option:selected").index() == 3) commentStr += "\nPrevious Parent: " + originalParent + "\nUpdated Parent: " + $("#parentSelect option:selected").attr("name") + "\n";
                                                                    if (originalTags !== $("#searchKeywords").val().replace(/[\s,]+/g, ",")) commentStr += "\nPrevious Tags: " + originalTags + "\nUpdated Tags: " + $("#searchKeywords").val().replace(/[\s,]+/g, ",") + "\n";
                                                                    if (CKEDITOR.instances.ckEditor.checkDirty()) commentStr += "\n\nArticle Content: Changed";
                                                                    else commentStr += "\n\nArticle Content: Same as version " + highestMajorVer + ".0";
                                                                    commentStr += "\n\nRevision Version: " + highestMajorVer + ".1" + " \nState: Updated \nReference No. " + edited.article.id + "\n\n<pending-review>";
                                                                    var versionJSON = {
                                                                        "ticket": {
                                                                            "comment": {
                                                                                "body": commentStr,
                                                                                "author_id": currUserID
                                                                            },
                                                                            "tags": ticketTags.split(","),
                                                                            "ticket_id": updateTicketID,
                                                                            "security_token": checkAccess,
                                                                            "action": "update"
                                                                        }
                                                                    };
                                                                    var updateLatestTicket = phpURL + helpCenterVer;
                                                                    submitCheck = false;
                                                                    $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                                                    $("#suggestEdit .submitStatus").text("Submitting your suggestions...");
                                                                    $.ajax(updateLatestTicket, {
                                                                        method: "POST",
                                                                        data: JSON.stringify(versionJSON)
                                                                    }).done(function(res, textStatus, xhr) {
                                                                        submitCheck = true;
                                                                        $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                                        $("#suggestEdit .submitStatus").text("Thank you! Your suggestions has been received.")
                                                                    }).fail(function(xhr, textStatus, errorThrown) {
                                                                        $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                                        $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                                            var showIP = data.ip;
                                                                            $("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                                            $("#suggestEdit .backSubmit").click(function() {
                                                                                $("#suggestEdit .loaderBG").fadeOut();
                                                                                $("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
                                                                                $("#submitSuggestionBtn").text("SUBMIT SUGGESTION")
                                                                            })
                                                                        })
                                                                    }).complete(function() {
                                                                        if (submitCheck) {
                                                                            var ticketSelectVal = $("#ticketSelector").find(":selected").val();
                                                                            if (ticketSelectVal !== "-") {
                                                                                var uffaTag = "new_uffa_fix,fixkb_" + currArticleId;
                                                                                var uffaFixId = ticketSelectVal;
                                                                                var tickAPI = phpURL + helpCenterVer;
                                                                                var ticketJSON = {
                                                                                    "ticket": {
                                                                                        "ticket_id": uffaFixId,
                                                                                        "tags": uffaTag.split(","),
                                                                                        "author_id": currUserID,
                                                                                        "article_url": articleURL,
                                                                                        "custom_fields": [{
                                                                                            "id": 22079425,
                                                                                            "value": "uffa_fix"
                                                                                        }, {
                                                                                            "id": 22031439,
                                                                                            "value": articleURL
                                                                                        }],
                                                                                        "suggest_article": false,
                                                                                        "security_token": checkAccess,
                                                                                        "action": "use"
                                                                                    }
                                                                                };
                                                                                $.ajax(tickAPI, {
                                                                                    method: "POST",
                                                                                    data: JSON.stringify(ticketJSON)
                                                                                }).done(function(res, textStatus, xhr) {}).fail(function(xhr, textStatus, errorThrown) {}).complete(function() {
                                                                                    setTimeout(function() {
                                                                                        $("#suggestEdit .loaderBG").fadeOut(), $("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
                                                                                        resetSuggestionModal();
                                                                                        $('html').removeClass('stop-scrolling'), $("#suggestEdit").removeClass("slide-in");
                                                                                    }, 4E3)
                                                                                })
                                                                            } else setTimeout(function() {
                                                                                $("#suggestEdit .loaderBG").fadeOut(),
                                                                                    $("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
                                                                                resetSuggestionModal();
                                                                                $('html').removeClass('stop-scrolling'),
                                                                                    $("#suggestEdit").removeClass("slide-in"),
                                                                                    $('#suggestEdit').modal('hide');
                                                                            }, 4E3)
                                                                        }
                                                                    })
                                                                } else if (submitCheck) {
                                                                    $("#suggestEdit .submitStatus").text("Thank you! Your article will be published after a review.");
                                                                    var ticketSelectVal = $("#ticketSelector").find(":selected").val();
                                                                    if (ticketSelectVal !== "-") {
                                                                        var uffaTag = "new_uffa_add,addkb_pending";
                                                                        var uffaAddId = ticketSelectVal;
                                                                        var tickAPI = phpURL + helpCenterVer;
                                                                        var ticketJSON = {
                                                                            "ticket": {
                                                                                "ticket_id": uffaAddId,
                                                                                "tags": uffaTag.split(","),
                                                                                "author_id": currUserID,
                                                                                "article_url": articleURL,
                                                                                "custom_fields": [{
                                                                                    "id": 22079425,
                                                                                    "value": "uffa_add"
                                                                                }, {
                                                                                    "id": 22031439,
                                                                                    "value": "Pending new article"
                                                                                }],
                                                                                "suggest_article": false,
                                                                                "security_token": checkAccess,
                                                                                "action": "use"
                                                                            }
                                                                        };
                                                                        $.ajax(tickAPI, {
                                                                            method: "POST",
                                                                            data: JSON.stringify(ticketJSON)
                                                                        }).done(function(res, textStatus, xhr) {}).fail(function(xhr, textStatus, errorThrown) {}).complete(function() {
                                                                            setTimeout(function() {
                                                                                $("#suggestEdit .loaderBG").fadeOut(), $("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
                                                                                resetSuggestionModal();
                                                                                $('html').removeClass('stop-scrolling'), $("#suggestEdit").removeClass("slide-in");
                                                                            }, 4E3)
                                                                        })
                                                                    } else setTimeout(function() {
                                                                        $("#suggestEdit .loaderBG").fadeOut(), $("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
                                                                        resetSuggestionModal();
                                                                        $('html').removeClass('stop-scrolling'), $("#suggestEdit").removeClass("slide-in"), $('#suggestEdit').modal('hide');
                                                                    }, 4E3)
                                                                }
                                                            })
                                                        }
                                                    })
                                            })
                                        })
                                    }
                                    checkVersions()
                                });
                            else showError("There are no changes to submit")
                        });
                        $("#flagArticle").on("hide.bs.modal", function(e) {
                            if ($("#flagReason").prop("selectedIndex") != 0 || $("#detailedReason").val() != "")
                                if (confirm("All changes will be lost. Are you sure you want to cancel?")) {
                                    $("#flagReason").val($("#flagReason option:first").val());
                                    $("#detailedReason").val("");
                                    return true
                                } else {
                                    e.preventDefault();
                                    e.stopImmediatePropagation();
                                    return false
                                }
                        });
                        $("#suggestEdit").on("hide.bs.modal", function(e) {
                            if (checkChanged())
                                if (confirm("All unsaved changes will be lost. Are you sure you want to cancel?")) {
                                    resetSuggestionModal();
                                    return true
                                } else {
                                    e.preventDefault();
                                    e.stopImmediatePropagation();
                                    return false
                                }
                        })
                    }

                function get_customAPI() {
                    $.getJSON(customAPI, function(data) {
                        originalHTML = [];
                        if (currPageURL.indexOf("/articles/") > -1) {
                            $.each(data, function(key, val) {
                                $.each(val, function(articleKey, articleVal) {
                                    if (articleKey == "body") originalHTML = tempHTML = articleVal;
                                    if (articleKey == "title") originalArticleTitle = tempTitle = articleVal;
                                    if (articleKey == "label_names") originalTags = tempTags = articleVal.toString().replace(/[\s,]+/g, ",");
                                    if (articleKey == "section_id") originalSectionID = articleVal;
                                    if (articleKey == "position") originalPosition = articleVal
                                })
                            });
                            (function() {
                                if ($("#sideNavigation").length)
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
                                            selectCatId = $("#" + getNavCatId);
                                            addSectionToList(originalSectionID);
                                            break;
                                        }
                                    }
                                } else {
                                    setTimeout(arguments.callee, 200)
                                }
                            })()
                        } else if (isSectionPage)
                            if (data.count > 0) {
                                var sample = data.results[0];
                                originalHTML = tempHTML = sample.body;
                                originalArticleTitle = tempTitle = sample.title;
                                originalTags = tempTags = sample.label_names.toString().replace(/[\s,]+/g, ",");
                                originalSectionID = sample.section_id;
                                originalPosition = 0;
                                (function() {
                                    if ($("#sideNavigation").length)
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
                                        } else if (NavCatArrayready) $.each(navsecArray, function(i, section) {
                                        if (section["id"] == originalSectionID) {
                                            getNavCatId = section["category"];
                                            selectCatId = $("#" + getNavCatId);
                                            addSectionToList();
                                            $("#nav-list").find(selectCatId).find("a").eq(0).click();
                                            getnavSecId = originalSectionID;
                                            selectSecId = $("#" + getnavSecId).find(".sub-group-list");
                                            $("#nav-list li[id=" + originalSectionID + "]").find("a").css({
                                                "color": "#FFF",
                                                "font-weight": "bold"
                                            }).click();
                                            if (selectCatId.parent("#nav-list").length == 1) {} else {
                                                selectCatId.parent().parent().find("a").eq(0).click();
                                            }

                                        }
                                    });
                                    else setTimeout(arguments.callee, 200)
                                })()
                            } else {
                                originalArticleTitle = originalTags = originalHTML = "";
                                currArticleId = 0;
                                originalSectionID = currSectionId
                            }
                        $("#articleTitle").val(originalArticleTitle).change();
                        $("#searchKeywords").val(originalTags);
                        $("#ckEditor").val(originalHTML);
                        if ($("#ckEditor").length) CKEDITOR.replace("ckEditor", {
                            filebrowserBrowseUrl: "/hc/en-us/articles/209729503?ver=23&type=Files&articleId=" + currArticleId,
                            filebrowserWindowWidth: "100%",
                            filebrowserWindowHeight: "100%",
                            customConfig: "https://services.serving-sys.com/HostingServices/custdev/ckeditor/config.js",
                            on: {
                                instanceReady: function(evt) {
                                    $(".cke_wysiwyg_frame").contents().find(".expandingblock").css("display", "block")
                                }
                            }
                        });
                        var doneCategories = 0;
                        var doneSections = 0;
                        var categoryAPI = "/api/v2/help_center/" + currentLang + "/categories.json?per_page=100";
                        $(".submitStatus").html("");
                        $("#suggestEdit,#requestArticle,#flagArticle").find("input, textarea, button, select").attr("disabled", "disabled");

                        function populateCategories() {
                            if (storage.getItem(HelpCenter.user.email + "-allCategories" + helpCenterVer + currentLang) === null) $.get(categoryAPI).done(function(data) {
                                categoryAPI = data.next_page;
                                var newArray = $.map(data.categories, function(category, i) {
                                    return {
                                        "id": category.id,
                                        "name": category.name,
                                        "desc": category.description
                                    }
                                });
                                catArray =
                                    $.merge(newArray, catArray);
                                if (categoryAPI !== null) {
                                    categoryAPI += "&per_page=100";
                                    populateCategories()
                                } else {
                                    storage.setItem(HelpCenter.user.email + "-allCategories" + helpCenterVer + currentLang, JSON.stringify(catArray));
                                    doneCategories = 1
                                }
                            });
                            else {
                                catArray = JSON.parse(storage.getItem(HelpCenter.user.email + "-allCategories" + helpCenterVer + currentLang));
                                doneCategories = 1
                            }
                        }
                        populateCategories();
                        var sectionAPI = "/api/v2/help_center/" + currentLang + "/sections.json?per_page=100";

                        function populateSections() {
                            if (storage.getItem(HelpCenter.user.email + "-allSections" + helpCenterVer + currentLang) === null)
                                populateSections()
                            else {
                                secArray = JSON.parse(storage.getItem(HelpCenter.user.email + "-allSections" + helpCenterVer + currentLang));
                                doneSections = 1
                            }
                        }
                        populateSections();
                        var populateRdy = setInterval(function() {
                            if (doneSections && doneCategories) {
                                clearInterval(populateRdy);
                                if (!appView) {
                                    var sectionMatch = $.grep(secArray, function(e) {
                                        return e.id == originalSectionID
                                    });
                                    originalSectionName = sectionMatch[0].name;
                                    originalCategoryID = sectionMatch[0].category;
                                    var categoryMatch = $.grep(catArray, function(e) {
                                        return e.id == originalCategoryID
                                    });
                                    originalCategoryName = categoryMatch[0].name;
                                    var catDesc = categoryMatch[0].desc;
                                    if (catDesc.indexOf("@mdx2") > -1) {
                                        originalPlatform = "mdx2";
                                        $("#platformSelect").val("mdx2")
                                    } else if (catDesc.indexOf("@mdxnxt") > -1) {
                                        originalPlatform = "mdxnxt";
                                        $("#platformSelect").val("mdxnxt")
                                    } else if (catDesc.indexOf("@supportkb") > -1) {
                                        originalPlatform = "supportkb";
                                        $("#platformSelect").val("supportkb")
                                    } else if (catDesc.indexOf("@strikead") > -1) {
                                        originalPlatform = "strikead";
                                        $("#platformSelect").val("strikead")
                                    } else {
                                        originalPlatform = "unspecified";
                                        $("#platformSelect").val("unspecified")
                                    }
                                } else {
                                    originalPlatform = $("#platformSelect [name='" + fromAppPlatform + "']").val();
                                    originalCategoryName = $('#categorySelect option[value="' + fromAppCategory + '"').text();
                                    originalSectionName = $('#sectionSelect option[value="' + fromAppSection + '"').text();
                                    originalParent = fromAppParent;
                                    originalArticleTitle = fromAppArticle;
                                    originalTags = fromAppTags !== null ? fromAppTags : "";
                                    $("#articleTitle").val(fromAppArticle).change();
                                    $("#searchKeywords").val(fromAppTags);
                                    $("#platformSelect").val(originalPlatform)
                                }
                                if ($("#platformSelect>option:selected").index() == 3) {
                                    $(".kbonly").show();
                                    $(".cke_contents").css("height", "180px")
                                } else {
                                    $(".kbonly").hide();
                                    $(".cke_contents").css("height", "230px")
                                }
                                if (currentUser != "anonymous" && currentUser != "end_user") {
                                    resetCategoryDropdown(catArray, secArray, originalCategoryID, originalSectionID, originalPlatform)
                                }
                            }
                        }, 100)
                    });
                }
                get_customAPI();
            }
        }

        function postAddSectionToList(originalSectionID) {
            getnavSecId = originalSectionID;
            selectSecId = $("#" + getnavSecId).find(".sub-group-list");
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

        try {
            if (isSectionPage && (currentUser == "manager" || currentUser == "agent"))
                if ($(".subscriptionContainer").length > 0 && $("span .section-subscribe").length > 0) {
                    var showError = function(msg) {
                        $(".errorMessage").text(msg);
                        $(".errorMessage").fadeIn();
                        setTimeout(function() {
                            $(".errorMessage").fadeOut(500)
                        }, 4E3)
                    };
                    $('<div id="requestArticle" class="internal_only side-modal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG requestLoader"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">&times</button><h1 id="requestArticleLabel" class="modal-title">Request a New Article</h1></div><div class="modal-body"><p>What would you like to see in the new article?</p><p><textarea id="requestArticleDetail" rows="4" cols="50"></textarea></p></div><div class="modal-footer"><span class="errorMessage"></span><button id="confirmRequestBtn" class="btn btn-primary" name="CONTINUE" type="button">REQUEST ARTICLE</button><button id="cancelRequestBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div>').insertAfter(".subscriptionContainer");
                    $("span .section-subscribe").prepend('<button class="request-article click" role="button" data-toggle="modal" data-target="#requestArticle" data-backdrop="static" data-keyboard="false">Request Article</button>');
                    $(".request-article").css("margin-top", "1px");
                    var currSectionId = currPageURL.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];
                    var sectionURL = currPageURL.split("--")[0];
                    $("#confirmRequestBtn").click(function(e) {
                        var descriptionText = $("#requestArticleDetail").val();
                        var ticketTags;
                        var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();
                        if (descriptionText == "") showError("What would you like to see in the new article?");
                        else $.getJSON("/api/v2/users/me/session.json", function(data) {
                            currUserID = data.session.user_id;
                            $("#requestArticle").find("input, textarea, button, select").attr("disabled", "disabled");
                            $("#confirmRequestBtn").text("PLEASE WAIT...");
                            if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_request_kb,review_a_requested_article";
                            else ticketTags = "contribute_request_doc,review_a_requested_article";
                            $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                $.getJSON("/api/v2/help_center/sections/" + currSectionId + ".json", function(sectionData) {
                                    var tickAPI = phpURL + helpCenterVer;
                                    var ticketJSON = {
                                        "ticket": {
                                            "subject": "New article request has been received",
                                            "comment": "New article has been requested after viewing the following section:\n\n[" + cleanTextOnly(sectionData.section.name) +
                                                "](" + sectionURL + ")\n\nRequest detail:\n\n" + descriptionText,
                                            "requester_id": currUserID,
                                            "group_id": 21387715,
                                            "tags": ticketTags.split(","),
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
                                                "value": $("#platformSelect option:selected").attr("name")
                                            }, {
                                                "id": 24296533,
                                                "value": originalSectionName
                                            }, {
                                                "id": 24296543,
                                                "value": $("#sectionSelect option:selected").attr("name")
                                            }, {
                                                "id": 22209215,
                                                "value": "pending_champions_review"
                                            }],
                                            "security_token": checkAccess,
                                            "action": "request"
                                        }
                                    };
                                    submitCheck = false;
                                    $("#requestArticle .loaderBG").fadeIn();
                                    $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                    $("#requestArticle .submitStatus").html("<br><br>Submitting your article request...");
                                    $.ajax(tickAPI, {
                                        method: "POST",
                                        data: JSON.stringify(ticketJSON)
                                    }).done(function(res,
                                        textStatus, xhr) {
                                        submitCheck = true;
                                        $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                        $("#requestArticle .submitStatus").html("<br><br>Thank you! Your request has been received.")
                                    }).fail(function(xhr, textStatus, errorThrown) {
                                        $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                            var showIP = data.ip;
                                            $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                            $("#requestArticle .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " +
                                                showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                            $("#requestArticle .backSubmit").click(function() {
                                                $("#requestArticle .loaderBG").fadeOut();
                                                $("#requestArticle").find("input, textarea, button, select").attr("disabled", false);
                                                $("#confirmRequestBtn").text("REQUEST ARTICLE")
                                            })
                                        })
                                    }).complete(function() {
                                        if (submitCheck) setTimeout(function() {
                                            $("#requestArticle .loaderBG").fadeOut();
                                            $("#requestArticle").find("input, textarea, button, select").attr("disabled", false);
                                            $("#confirmRequestBtn").text("REQUEST ARTICLE");
                                            $("#requestArticleDetail").val("");
                                            $("#requestArticle").modal("hide")
                                        }, 4E3)
                                    })
                                })
                            })
                        })
                    })
                }
        } catch (e) {}
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
            $("ul#show-data").append("<ul id='sectionloader' style='display:none' ><img src='/hc/theme_assets/539845/200023575/spingrey.gif' style='border:0px; padding:30px 0px'></ul>");
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
            if (isSectionPage);
            else {
                $("ol.breadcrumbs").find("li:eq(2)").append('<div id="bread-dropdown" class="dropdown"></div>');
                $("ol.breadcrumbs").find("li:eq(2)").find("a.breadcrumbsShow").attr("href", "#");
                $("#bread-dropdown").prepend('<i class="fa fa-angle-down dropbtn" ></i>');
                $(".dropbtn").prepend('<div id="bread-drop" class="dropdown-content"></div>')
            }
            $(".sub-nav a:eq(2)").addClass("breadcrumbsHidden");
            $(document).click(function() {
                if ($(".sub-nav a:eq(2)").hasClass("breadcrumbsShow")) {
                    $(".sub-nav a:eq(2)").removeClass("breadcrumbsShow").addClass("breadcrumbsHidden");
                    $("ol.breadcrumbs li:eq(2)").find("#bread-drop").hide()
                }
            });
            $(".sub-nav a:eq(2)").click(function() {
                if ($(this).hasClass("breadcrumbsHidden")) {
                    $(this).removeClass("breadcrumbsHidden").addClass("breadcrumbsShow");
                    $("ol.breadcrumbs li:eq(2)").find("#bread-drop").show()
                } else if ($(this).hasClass("breadcrumbsShow")) {
                    $(this).removeClass("breadcrumbsShow").addClass("breadcrumbsHidden");
                    $("ol.breadcrumbs li:eq(2)").find("#bread-drop").hide()
                }
                event.stopPropagation()
            });
            $(".sub-nav").find("i").click(function() {
                if ($(".sub-nav a:eq(2)").hasClass("breadcrumbsHidden")) {
                    $(".sub-nav a:eq(2)").removeClass("breadcrumbsHidden").addClass("breadcrumbsShow");
                    $("ol.breadcrumbs li:eq(2)").find("#bread-drop").show()
                } else if ($(".sub-nav a:eq(2)").hasClass("breadcrumbsShow")) {
                    $(".sub-nav a:eq(2)").removeClass("breadcrumbsShow").addClass("breadcrumbsHidden");
                    $("ol.breadcrumbs li:eq(2)").find("#bread-drop").hide()
                }
                event.stopPropagation()
            });
            $("ol.breadcrumbs li:eq(2)").click(function() {
                $("ol.breadcrumbs li:eq(2)").find("#bread-drop").toggleClass("show")
            });
            window.onclick = function(event) {
                if (!event.target.matches(".dropbtn")) {
                    var dropdowns = document.getElementsByClassName("dropdown-content");
                    var i;
                    for (i = 0; i < dropdowns.length; i++) {
                        var openDropdown = dropdowns[i];
                        if (openDropdown.classList.contains("show")) openDropdown.classList.remove("show")
                    }
                }
            }
        }
        breadcrumbsDropdown();

        function resetNav() {
            $("#sideNavigation").css("display", "none");
            $("body").find("main").css("width", "calc(100%)")
        }

        function uiresize() {
            var w = $("body").width() - $("#sideNavigation").width();
            $("main").css("width", w - 52 + "px")
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
                setTimeout(arguments.callee, 200)
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
        })
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

        function sectionListStorage() {
            if (storage.getItem(HelpCenter.user.email + "-allSections" + helpCenterVer + currentLang) === null) $.get(navSectionAPI).done(function(data) {
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
            });
            else {
                navsecArray = JSON.parse(storage.getItem(HelpCenter.user.email + "-allSections" + helpCenterVer + currentLang));
                NavCatArrayready = 1;
            }
        }
        sectionListStorage();
        var secloadstatus = 0;

        function addSectionToList(sectionID) {
            //called when hardcoded categories are clicked first time
            var plat = $("#switchTag").val();
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
                if (section["category"] == getNavCatId && section["description"].indexOf(hidePlat) == -1) {
                    chkinit++;
                    $.getJSON("https://support.sizmek.com/api/v2/help_center/articles/search.json?per_page=1&section=" + section["id"]).done(function(articles) {
                        if (articles.count > 0) {
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
                            postAddSectionToList(sectionID)
                        }
                    })
                }
            });
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

        /*
        if ($("#switchTag").val() !== "support_kb" && $("#switchTag").val() !== "showall") {
            var menucat = [],
                navseccat = [];
            $(".category").each(function() {
                menucat.push($(this).attr('id'));
            }), $.each(navsecArray, function(i, section) {
                navseccat.push(section["category"]);
            }), $.each(menucat, function(i, val) {
                if ($.inArray(parseInt(val), navseccat) == -1) $('#' + val).remove();
            })
            $("#nav-list > li > .categoryDrop").each(function() {
                if ($(this).next("ul").find("li").length <= 0) $(this).parent().remove();
            })
        }
        */

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
            if (currPageURL.indexOf("/articles/") > -1) currArticleID = currPageURL.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];
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
                $.get("/api/v2/help_center/" + currentLang + "/categories/360000029551/sections.json").done(function(res) {
                    if (res.sections.length > 0) {
                        sessionStorage.setItem('hasHT', 1);
                    } else {
                        sessionStorage.setItem('hasHT', 0);
                        $("li.category#360000029551").remove();
                    }
                });
            } else {
                var hasHelpTopics = sessionStorage.getItem('hasHT');
                if (hasHelpTopics == 0) {
                    $("li.category#360000029551").remove();
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
                    placeAttachments()
                });
                else {
                    attachmentsArray = JSON.parse(sessionStorage.getItem(HelpCenter.user.email + "-Attachments-" + getnavArticleId + helpCenterVer + currentLang));
                    placeAttachments()
                }
            }
            loadAttachments()
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
                        $(".article-attachments > .attachments").prepend(list)
                    }
                })
        }

        function highlightTitle() {
            if (window.location.href.indexOf("articles/") > 0) {
                var currArticleId = window.location.href.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];
                if ($("#nav-list li[id=" + currArticleId + "]").length === 0) {
                    $("#nav-list li#" + getnavSecId).children('i')
                }
                if ($("#nav-list li[id=" + currArticleId + "]").length > 0) {
                    var allNextLoc = $("#nav-list li#" + currArticleId).nextAll("li.loc"),
                        allPrevLoc = $("#nav-list li#" + currArticleId).prevAll("li.loc.has-arrow"),
                        currArticleLoc = parseInt($("#nav-list li#" + currArticleId).attr("class").replace("treelist loc ", "").split(" ", 1).toString().replace("loc-", "").toString()),
                        parentId1 = $("li#" + currArticleId).prevAll("li.loc.loc-" + (currArticleLoc - 1) + ".has-arrow").first().attr("id");
                    parentId2 = $("li#" + currArticleId).prevAll("li.loc.loc-" + (currArticleLoc - 2) + ".has-arrow").first().attr("id");
                    parentId3 = $("li#" + currArticleId).prevAll("li.loc.loc-" + (currArticleLoc - 3) + ".has-arrow").first().attr("id");
                    allNextLoc.each(function() {
                        $(this).find(">i").removeClass("fa-angle-right");
                        $(this).find(">i").click()
                    });
                    allPrevLoc.each(function() {
                        $(this).attr("id") != parentId1 && $(this).attr("id") != parentId2 && $(this).attr("id") != parentId3 && ($(this).find(">i").removeClass("fa-angle-right"), $(this).find(">i").click())
                    });
                    $("li#" + currArticleId).find('i').addClass("fa fa-angle-right").click();
                    $("#" + currArticleId).closest("#nav-list > li").css("background-color", "rgb(0, 25, 55)");
                    $("#" + currArticleId).closest("#nav-list > li").find("a").eq(0).css("color", "white");
                    $("#" + currArticleId).closest("#nav-list > li").find("ul").show();
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
                    $("i.fa-angle-down").removeClass("fa-angle-right");
                    dataloaded = 1;
                }
            }
        }

        function instantiateTree() {
            var navsectionArray = [];
            currSectionId = getnavSecId;
            treelist = $(".treelist");
            navsectionApiURL = "/api/v2/help_center/" + currentLang + "/sections/" + currSectionId + "/articles.json?sort_by=position&sort_order=asc";
            if (currSectionId !== 201949563 && currSectionId !== undefined) loadnavsectiontree();

            function loadnavsectiontree() {
                if (sessionStorage.getItem(HelpCenter.user.email + "-Tree-" + currSectionId + helpCenterVer + currentLang) === null) $.get(navsectionApiURL).done(function(data) {
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
                else {
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
            var Pix, Ar, articleParentID;

            function CreateArticleList() {

                function extractLocLevel(labels) {
                    var locLevel = 1;
                    if (labels.length > 0)
                        for (var hasLoc = 0, x = 0; x < labels.length && hasLoc == 0; x++)
                            if (labels[x].toLowerCase().indexOf("loc") > -1 && labels[x].toLowerCase().indexOf("loc_parent") < 0) {
                                locLevel = parseInt(labels[x].replace(/\D+/g, ""));
                                hasLoc = 1
                            }
                    return locLevel
                }
                var parentIDArr = [];
                if (navsectionArray.length > 0) parentIDArr.push(navsectionArray[0].id);
                $('#' + currSectionId).find("ul").first().hide();
                $.each(navsectionArray, function(idx, value) {
                    if (checkdraft = value.draft, !checkdraft && navsectionArray.length) {
                        var margin = 20;
                        Pix = 13, Ar = value.label_names, v = value.label_names, labelArray =
                            v.toString().split(",");

                        var doesLabelMatch = checkProductInLabels(labelArray);
                        if (!doesLabelMatch) {
                            return true;
                        }

                        a = "";
                        var parentID;
                        var currentArtLevel = extractLocLevel(labelArray);
                        var currentID = value.id;
                        if (idx <= navsectionArray.length - 2) {
                            var nextLabels = navsectionArray[idx + 1].label_names;
                            var nextArtLabels = nextLabels.toString().split(",");
                            var nextArtLevel = extractLocLevel(nextArtLabels);
                            if (currentArtLevel == nextArtLevel) {
                                if (currentArtLevel == 1) {
                                    parentIDArr = [];
                                    parentIDArr.push(currentID);
                                    parentID = parentIDArr[parentIDArr.length - 1];
                                    a = "active"
                                }
                                parentID = parentIDArr[parentIDArr.length - 1]
                            } else if (nextArtLevel > currentArtLevel) {
                                if (currentArtLevel == 1) {
                                    parentIDArr = [];
                                    parentID = currentID;
                                    parentIDArr.push(currentID)
                                }
                                parentID =
                                    parentIDArr[parentIDArr.length - 1];
                                parentIDArr.push(currentID)
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
                            parentID = parentIDArr[parentIDArr.length - 1]
                        }
                        if ($('#' + parentID).hasClass('loc-' + currentArtLevel)) {
                            currentArtLevel = 1;
                            $('#' + parentID).attr("style", "margin-left:11px !important");
                        } else if ($('#' + parentID).length > 0) {
                            currentArtLevel = parseInt($('#' + parentID).attr("class").replace("treelist loc ", "").split(" ", 1).toString().replace("loc-", "").toString()) + 1
                        }
                        value.name = value.name.replace("loc_" + currentArtLevel, "");
                        var cn = "treelist loc loc-" + currentArtLevel + " p-" + parentID + " " + a;
                        var anchorElem = document.createElement("a");
                        var txtNode = document.createTextNode(value.name);
                        anchorElem.className = "nav-line", anchorElem.id = value.id, anchorElem.href = value.url, anchorElem.title = value.name, anchorElem.appendChild(txtNode);
                        var listElem = document.createElement("li")
                        listElem.className = cn, listElem.id = value.id, listElem.appendChild(anchorElem);
                        selectSecId.append(listElem);

                    }
                    if (navsectionArray.length > 0) {
                        $('#' + currSectionId).find("ul").first().slideDown();
                    }
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
                    } catch (e$2) {
                        //console.log(e$2)
                    }
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
                var e = $("ul.sub-group-list > li");
                $(e).has("span:contains('TOPIC')").wrap('<div class="maintopic"></div>'), $(e).find(".article-title").text("A"), $(e).find(".topic-title").text("T"), $(e).find(".issue-title").text("I"), $(e).find("i").addClass("fa fa-angle-down"), $("div.icon + div.icon").length && $("div.icon + div.icon").prev().find("i").remove(), $("div.icon + div.maintopic").length && $("div.icon + div.maintopic").prev().find("i").remove(), $("ul.sub-group-list div.icon:last-child + div").length > -1 && $("ul.sub-group-list div.icon:last-child").find("i").remove(),
                    $("div.icon li > a").removeClass(), $("li.treelist + div.icon").length && $("li.treelist + div.icon").prev().find("a").removeClass(), $(".sub-group-list li.treelist:last").length && $(".sub-group-list li.treelist:last").find("a").removeClass(), $("ul.sub-group-list > li").find("i").click(function() {
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
        if (currPageURL.indexOf("/categories") > -1) {
            currCatId = currPageURL.split("categories/")[1].split("#")[0].split("-")[0].split("?")[0];
            (function() {
                if ($("#sideNavigation").length) {
                    getNavCatId = currCatId;
                    selectCatId = $("#" + currCatId);
                    if ($(".category[id=" + currCatId + "]").length)(function() {
                        if ($(".category[id=" + currCatId + "]").find("ul.group-list > li").length) {
                            $(".category[id=" + currCatId + "]").find("i").eq(0).attr("class", "fa fa-angle-down");
                            $(this).find("ul.group-list").css({
                                "display": "block",
                                "overflow": "hidden"
                            });
                            $(".category[id=" + currCatId + "]").find("a").eq(0).css({
                                "color": "#FFF",
                                "font-weight": "bold"
                            });
                            $(".category[id=" + currCatId + "]").parent().parent().find("a").eq(0).click();
                        } else {
                            addSectionToList();
                            setTimeout(arguments.callee, 200);
                        }
                    })();
                } else setTimeout(arguments.callee, 200);
            })()
        }

        function populateTickets() {
            var relatedTickets, tcount = 0;
            var html = "";
            var ArtId = currPageURL.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];
            $.getJSON("/api/v2/search.json?query=type:ticket+tags:usekb_" + ArtId, function(data) {
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
                if (tcount > 0 && appView == undefined) {
                    $("#caseExamples, #relatedTicketsTable, #relatedTicketsTable-header, #relatedTicketsTable-footer").show();
                    styleTicketTable();
                }

            })
        }

        function isInURL(str) {
            if (currPageURL.indexOf(str) > -1) return true;
            else return false;
        }

        if (isInURL("/categories/") && (isInURL("200209199") || isInURL("200768493") || isInURL("201680143") || isInURL("201188756"))) {
            var str = currPageURL;
            var stridx = str.indexOf("/categories/");
            var categorystr = str.substr(stridx + 12);
            var res = categorystr.split("-");
            var categoryID = res[0];
            highlightCurrAddResPage(categoryID);
        } else if (isInURL("/categories/201131993") || isInURL("/categories/201269943")) {
            highlightCurrAddResPage("certifiedLinkItem");
        } else {
            $(".addtlResources ul").slideUp();
        }
        if ($(".header").html().indexOf("Message Board") < 0 && currentUser !== "end_user" && currentUser !== "anonymous" && currPageURL.indexOf("/articles/") > -1 && currPageURL.indexOf("209729503") == -1) {
            if ($("body:contains('Case Examples')").length == 0) $('<h2 id="caseExamples">Case Examples</h2><table></table>').insertBefore("body .article-attachments:last");
            if ($("h2:contains('Case Examples')").next("p").length > 0) $("h2:contains('Case Examples')").next("p").remove();
            if ($("h2:contains('Case Examples')").next("br").length > 0) $("h2:contains('Case Examples')").next("br").remove();
            $("h2:contains('Case Examples')").next("table").replaceWith('<table id="relatedTicketsTable"><thead><tr><th data-column-id="id" data-header-css-class="id-column" data-formatter="id" data-type="numeric" data-identifier="true">ID</th><th data-column-id="subject" data-header-css-class="subject-column">SUBJECT</th><th data-column-id="updated" data-header-css-class="updated-column">UPDATED</th><th data-column-id="tier" data-header-css-class="tier-column">TIER</th><th data-column-id="status" data-header-css-class="status-column" data-formatter="status">STATUS</th></tr></thead><tbody></tbody></table>');
            $("#relatedTicketsTable").removeClass("bordered");
            $("#caseExamples, #relatedTicketsTable, #relatedTicketsTable-header, #relatedTicketsTable-footer").hide();
            populateTickets();
        }
        $("<div class ='cover'></div>").insertAfter("#sideNavigation");

        storage.getItem("treesettings") == null || storage.getItem("treesettings") == 1 ? openSideNav() : hideSideNav();
        if (currentUser !== "anonymous") changeDisplayUsername();
        $(".hamburger").click(function() {
            $(this).hasClass("is-active") == true ? hideSideNav() : openSideNav()
        });

        function openSideNav() {
            $("#sideNavigation").css("width", "300px"), storage.setItem("treesettings", "1"),
                $(".footer-inner").css("padding-left", "300px"), $("body").find("main").css("width", "calc(100% - 300px)"),
                $("body").find("#sideNavigation").css("margin-left", "0"), $("body.support_kb").find("main").css("width", "calc(100% - 300px)"),
                $(".sidenav-header").removeClass("sidenav-header-closed"),
                $(".sidenav-header").addClass("sidenav-header-open"), $(".side-nav-menu").removeClass("closed-menu"),
                $(".side-nav-menu").addClass("open-menu"), $(".subscriptionContainer").css("padding", "0 20px"), $(".container").css("padding-left", "20px"), $(".hamburger").addClass("is-active");
            if ($(".tocify").is(":visible")) $(".main-column").css("max-width", "790px");
            else $(".main-column").css("max-width", "868px");
        }

        function hideSideNav() {
            $("body").find("#sideNavigation").css("margin-left", "-300px").css("width", "300px"), storage.setItem("treesettings", "0"),
                $("body.mdxcss").find("#sideNavigation").css("margin-left", "-300px"), $("body.support_kb").find("#sideNavigation").css("margin-left", "-300px"),
                $(".footer-inner").css("padding-left", "20px"), $("main").css("width", "100%"), $(".sidenav-header").removeClass("sidenav-header-open"),
                $(".sidenav-header").addClass("sidenav-header-closed"), $(".side-nav-menu").removeClass("open-menu"),
                $(".side-nav-menu").addClass("closed-menu"), $(".main-column").css("max-width", "868px"), $(".subscriptionContainer").css("padding", "0"),
                $(".container").css("padding-left", "0px"), $(".hamburger").removeClass("is-active");
        }

        KSelect();

        if (HelpCenter.user.role == "anonymous") {
            $(".hero-unit, .sub-nav, .section-description").after('<div class="signinmore"><span>Please <a class="signin"><u>SIGN IN</u></a> to see more content.</span></div>');
            $(".signin").attr("href", loginURL);
        }

    });
});