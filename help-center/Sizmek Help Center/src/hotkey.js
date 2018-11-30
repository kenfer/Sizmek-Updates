//KEYBOARD SHORTCUT 
//AUTHOR: Ian Haigh & Lawrence Bonilla
//VER 1.1
$(document).ready(function(){
	
	function openSideNav() {
        $("#sideNavigation").css("width", "300px"), storage.setItem("treesettings", "1"),
            $(".footer-inner").css("padding-left", "300px"), $("body").find("main").css("width", "calc(100% - 300px)"),
            $("body").find("#sideNavigation").css("margin-left", "0"), $("body.support_kb").find("main").css("width", "calc(100% - 300px)"),
            $(".accordion").css("max-width", "785px"), $(".sidenav-header").removeClass("sidenav-header-closed"),
            $(".sidenav-header").addClass("sidenav-header-open"), $(".side-nav-menu").removeClass("closed-menu"),
            $(".side-nav-menu").addClass("open-menu"), $(".subscriptionContainer").css("padding", "0 20px"), $(".container").css("padding-left", "20px"), $(".hamburger").addClass("is-active");
        if ($(".tocify").is(":visible")) $(".main-column").css("max-width", "790px");
        else $(".main-column").css("max-width", "868px");
    }

    function hideSideNav() {
        $("body").find("#sideNavigation").css("margin-left", "-300px").css("width", "300px"), storage.setItem("treesettings", "0"),
            $("body.mdxcss").find("#sideNavigation").css("margin-left", "-300px"), $("body.support_kb").find("#sideNavigation").css("margin-left", "-300px"),
            $(".footer-inner").css("padding-left", "20px"), $("main").css("width", "100%"), $(".accordion").css("max-width", "870px"), $(".sidenav-header").removeClass("sidenav-header-open"),
            $(".sidenav-header").addClass("sidenav-header-closed"), $(".side-nav-menu").removeClass("open-menu"),
            $(".side-nav-menu").addClass("closed-menu"), $(".main-column").css("max-width", "868px"), $(".subscriptionContainer").css("padding", "0"),
            $(".container").css("padding-left", "0px"), $(".hamburger").removeClass("is-active");
    }
	
	if (jQuery.inArray("view_support_content", HelpCenter.user.tags) !== -1){
	
	$("#user-menu").append("<a id='kbs' role='menuitem' onclick='showkbs();'>Keyboard Shortcuts</a>");
    $("main").append("<style>kbd{margin:2px;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif;border-radius: 3px;box-shadow: 0 0 0 #fff, 0 1px 0 #ccc;background-image: linear-gradient(#f5f5f5, #eee);display: inline-block;font-size: 11px;font-weight: 400;line-height: 11px;text-align: center;padding: 4px 5px;margin-right: 3px;background-color: #eee;min-width: 12px;border: 1px solid #CCC;}</style>");
    $("main").append("<div class='keyboard-shortucts' style='padding:15px;overflow:hidden;width:300px;background: #fff;display: none;position: fixed;right: 65vh;border-radius: 6px;top: 20vh;box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);'>Keyboard Shortcuts<hr style='margin:5px 0px;'><kbd>Esc</kbd>&nbsp; Collapse<br><kbd>~</kbd>&nbsp; Toggle on/off Side Nav<br><kbd>&#9664;</kbd><kbd>&#9654;</kbd> Previous & Next &nbsp;<br><kbd>Ctrl</kbd><kbd>/</kbd> Search&nbsp;<br><kbd>Ctrl</kbd><kbd>Alt</kbd><kbd>1</kbd>&nbsp;Use Article<br style='padding-top:5px;'><kbd>Ctrl</kbd><kbd>Alt</kbd><kbd>2</kbd>&nbsp;Fix Article<br style='padding-top:5px;'><kbd>Ctrl</kbd><kbd>Alt</kbd><kbd>3</kbd>&nbsp;Flag Article<br><kbd>Ctrl</kbd><kbd>Alt</kbd><kbd>4</kbd>&nbsp;Add Article<br><kbd>Ctrl</kbd><kbd>Alt</kbd><kbd>5</kbd>&nbsp;Request Article<br></div>");
    $("main").append("<script>function showkbs(){$('.keyboard-shortucts').css('display','block');}</script>");
    document.onkeydown = KeyPress;
    var vck = 0;
	var skey=0;
    function KeyPress(l) {
        var evtobj = window.event ? event : l;
        if (evtobj.keyCode == 191 && evtobj.ctrlKey && vck === 0) {
            var k = isElemInView($("#query"));
            if (k) {
                $("#query").focus();
                $('html, body').animate({
                    scrollTop: ($('body').offset().top)
                }, 500);

            } else {
                vck = 1;
				slock=1;
                showsearch()
            }
        }
		if(evtobj.keyCode == 192 && skey===0 && vck===0)
			{
				openSideNav();
				skey=1;
			}else 
		if(evtobj.keyCode == 192 && skey===1 && vck===0)
			{
				skey=0;
				hideSideNav();
			}
        if(evtobj.keyCode == 37 && vck===0)
            {
                var hrefp = $('.prev').attr('href');
                if(hrefp){
                 window.location.href = hrefp;
                }
            }
        if(evtobj.keyCode == 39 && vck===0)
            {
                var hrefn = $('.next').attr('href');
                if(hrefn){
                 window.location.href = hrefn;
                }
                 
            }
        if (evtobj.keyCode == 27) {
            vck = 0;
            $("#showsearchinput").remove();
            $(".modal-backdrop").remove();
            $(".keyboard-shortucts").css("display","none");
			$("#query").blur(); 
        }
		 if(evtobj.keyCode && evtobj.altKey && evtobj.ctrlKey){
            console.log(evtobj.keyCode);
    switch(evtobj.keyCode){
    	case 49:
        $(".use-article").trigger("click");
    	break;
    	case 50:
    	$(".suggest-edit").trigger("click");
    	break;
    	case 51:
    	$(".flag-article").trigger("click");
    	break;
    	case 52:
    	$(".add-article").trigger("click");
    	break;
    	case 53:
    	$(".request-article").trigger("click");
    	break;
    }
    }
    }
	

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

    function isElemInView(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();
        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }
    $(window).scroll(function() {
        var ScrollTop = parseInt($(window).scrollTop());
        if (ScrollTop < 100) {
            vck = 0;
            $("#showsearchinput").remove();
            $(".modal-backdrop").remove();
        }
    });
	}
});

//if (jQuery.inArray("view_support_content", HelpCenter.user.tags) !== -1) if they have this to tag enable feature
//roles available to agent, manager