$(document).ready(function(){var p,e,a=HelpCenter.user.role;window.localStorage,window.sessionStorage,window.location.href.split("--")[0];if(-1<window.location.href.indexOf("/articles/")&&"end_user"!=a&&"anonymous"!=a){var d=["January","February","March","April","May","June","July","August","September","October","November","December"],u=window.location.href.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];$("#sideNavigation").prepend('<div id="article-verification"><div class="av-trusted" id="av-header" v-toggle="av-closed"><i class="fa fa-check"></i><span class="av-status">TRUSTED</span><div class="v-toggle"><span class="fa fa-angle-down"></span></div></div><div class="av-body"><div class="av-body-item"><div class="av-title"><i class="fa fa-user"></i><span>LAST VERIFIED BY</span></div><strong class="av-detail" id="av-last-verifier">YOU</strong></div><div class="av-body-item"><div class="av-title"><i class="fa fa-calendar-check-o"></i><span>LAST VERIFIED ON</span></div><strong class="av-detail" id="av-last-vdate">February 12, 2018</strong></div><div class="av-body-item"><div class="av-title"><i class="fa fa-calendar"></i><span>VERIFICATION INTERVAL</span></div><div class="av-interval-error"><span>PLEASE SELECT AN INTERVAL</span></div><select class="select-picker" id="av-interval-select" name=""><option value="0">NO INTERVAL CHOSEN</option><option value="1">Every month</option><option value="2">Every 2 months</option><option value="3">Every 3 months</option><option value="4">Every 4 months</option><option value="6">Every 6 months</option><option value="12">Every 12 months</option></select></div><div class="av-body-item av-related-tickets"><div class="av-title"><i class="fa fa-ticket"></i><span>TICKETS</span><span class="av-verify-error" style="display:none">RESOLVE TICKETS FIRST</span></div><strong class="av-detail noTickets">NO TICKETS</strong><table><thead><tr><th>TICKET ID</th><th>DATE</th></tr></thead><tbody id="av-open-related-tickets"></tbody></table></div><div class="verify-article"><div class="av-alert"><span>Please resolve tickets.</span></div><button type="button" id="av-verify-article" name="button"><span>VERIFY ARTICLE</span></button></div></div></div> '),$("#article-verification").hide(),$("#filterContent").css("border-top","1px solid #183e6c"),$("#article-verification #av-header").click(function(){"av-closed"==$(this).attr("v-toggle")?($(this).attr("v-toggle","av-open"),$(this).find(".v-toggle .fa").removeClass("fa-angle-down").addClass("fa-angle-up"),$(".av-body").slideDown("fast")):($(this).attr("v-toggle","av-closed"),$(this).find(".v-toggle .fa").addClass("fa-angle-down").removeClass("fa-angle-up"),$(".av-body").slideUp("fast"))});window.location.href.split("/");e=(e=window.location.href.split("/"))[e.length-1].split("-",1).toString(),$.get("/api/v2/search.json?query=custom_field_24296573:"+e).done(function(v){$.get("/api/v2/help_center/articles/"+u+"/labels.json").done(function(e){for(var a=0,t=0,s=0,i=0;i<v.count;i++)if("open"==v.results[i].status||"new"==v.results[i].status){$(".av-related-tickets .noTickets").hide(),a++;var n=v.results[i].id,r=(v.results[i].subject,v.results[i].status),d=(v.results[i].requester_id,new Date(v.results[i].updated_at)),l='<span class="ticket_status_label ticket-status ticket-status-'+r+'" title="'+r+'">'+r.charAt(0).toLowerCase()+"</span>",o='<tr class="related-tickets-item"><td><a href="/agent/tickets/'+n+'" target="_blank">'+l+"&nbsp;#"+n+"</a></td><td>"+d.toDateString()+"</td></tr>";$("#av-open-related-tickets").append(o),-1<v.results[i].tags.indexOf("review_a_flagged_article")&&t++,-1<v.results[i].tags.indexOf("article_flagged_reason_outdated_information")&&s++}0<a?(g(2),$(".av-related-tickets").find("table").show()):($(".av-related-tickets").find("table").hide(),g(1)),0<t&&g(5),0<s&&g(6);for(var i=0,c=0;i<e.labels.length&&0==c;i++)0==e.labels[i].name.indexOf("!av::details::")&&(c=1,p=e.labels[i].name.split("::"));1==c?($("#av-last-verifier").text(p[4]),$("#av-interval-select").val(parseInt(p[3])),b($("#av-interval-select").val()),function(e,a){var t=parseInt(a),s=new Date,i=new Date(e),n=new Date(e);n.setMonth(n.getMonth()+t);var r=l(i,n),d=l(s,n);function l(e,a){var t=Math.round((a-e)/864e5);return t}0<(m=d)?d>=Math.round(.1*r)?(g(1),$("#av-header .av-status").text("TRUSTED")):(g(4),$("#av-header").find(".av-status").text("WARNING 10%")):(g(6),$("#av-header .av-status").text("EXCEEDED"),$(".av-verify").show(),checkOutdatedTicket())}(p[2],p[3]),h(p[2]),1):($("#av-last-verifier").text("NONE"),$("#av-last-vdate").text("NONE"),g(3),0),y(f),function(e){function o(e){var a=e.indexOf(":"),t=e.indexOf("-");return-1<a?-1<t?a<t?":":" -":":":" -"}function c(e){var a=e.indexOf(":"),t=e.indexOf("-");return-1<a?-1<t?a<t?":<br><br>":"- ":":<br><br>":"- "}-1<HelpCenter.user.tags.indexOf("view_support_content")?$("#article-verification").show():($("#article-verification").hide(),"support_kb"!=$("switchTag").val()?$(".sub-nav , #sideNavigation ").css("border-top","3px solid #00e8c6"):$(".main , #sideNavigation ").css("border-top","3px solid #00e8c6")),$(".article-header").append('<span class="currArticle hide">'+u+"</span>"),$.get("/api/v2/help_center/articles/"+u+".json",function(e){for(var a=0;a<e.article.label_names.length;a++)if(-1<e.article.label_names[a].indexOf("Type:Maintenance")||-1<e.article.label_names[a].indexOf("Type:Incident")){$.get("/api/v2/help_center/articles/"+u+".json",function(e){e.article.section_id;for(var a=e.article.created_at,t=e.article.body,s=new Date(a),i=["#7EDE96","#3498DB","#FFD24D","#DC7633","#E74C3C"],n=0;n<e.article.label_names.length;n++){if(-1<e.article.label_names[n].indexOf("Severity:"))var r=e.article.label_names[n].replace("Severity:","");if(-1<e.article.label_names[n].indexOf("Status:"))var d=e.article.label_names[n].replace("Status:","");if(-1<e.article.label_names[n].indexOf("Type:"))var l=e.article.label_names[n].replace("Type:","")}"Incident"==l?($(".article-header h1").css("color",i[r-1]),$(".article-header h1").attr("id","incident-title-"+r)):$(".article-header h1").css("color","rgb(52, 152, 219)"),$(".incident-wrapper").append($(".main-column")),$('<div class="incident-list-cont show"></div>').insertAfter(".article-info"),$(".incident-list-cont").append("<div class='incident-list'></div>"),$(".incident-list").append("<div class='incident-list-item'></div>"),$(".incident-list-item").append("<div class='incident-item-body'><h5>"+d+"</h5></div><div class='edit_update'><a>Edit</a></div>"),$($(".article-body.markdown")).insertBefore(".edit_update"),$(".article-body.markdown").append('<br><small class="small">'+s.toDateString()+" "+s.toLocaleTimeString()+'</small><span class="hide span-body">'+t+"</span>"),$(".incident-list-cont.show").append('<a id="back-incident-list" class="plain-button" href="https://support.sizmek.com/hc/en-us/categories/201680143-Message-Board"><br><span style="font-family:arial">←</span> Incidents</a></div></div>'),$(".incident-list").html('<div class="incident-list-item"><div class="incident-item-body"><h5>'+d+'</h5></div><div class="article-body markdown">'+t+'<br><small class="small">Posted on '+s.toDateString()+" "+s.toLocaleTimeString()+'</small><span class="hide">'+t+"<span></div></div>")&&$.get("/api/v2/help_center/articles/"+u+"/comments.json",function(e){for(var a=e.comments.length-1;0<=a;a--){e.comments[a].id;var t=e.comments[a].updated_at,s=new Date(t),i=e.comments[a].body,n=i.split(o(i),1),i=i.substr(i.indexOf(c(i))+1);$(".incident-list").prepend('<div class="incident-list-item"><div class="incident-item-body"><h5>'+n+'</h5></div><div class="incident-item-cont">'+i+'<br><small class="small">Posted on '+s.toDateString()+" "+s.toLocaleTimeString()+'</small><span class="hide span-body">'+i+"</span></div></div>")}})}),$("footer.article-footer").remove(),$("form.comment-form").remove(),$(".article-comments").remove();break}}),$("body").on("click","#delete-incident-btn",function(e){if(confirm("Delete this incident?")){var a=$(this).find("span.hide").text();$.ajax({url:"/api/v2/help_center/articles/"+a+".json",type:"DELETE"}),setTimeout(function(){window.location.href="https://support.sizmek.com/hc/en-us/categories/201680143-Message-Board"},500)}}),$("body").on("click",".close-modal",function(e){if($(this).closest(".modal").remove(),"hidden"!==$("html").css("overflow"))return!1;$("html").css("overflow","scroll")}),$("body").on("change","#send-time",function(){$(this).is(":checked")?($("#update-incident-modal .maintenance-start input, #update-incident-modal .maintenance-start select").removeAttr("disabled"),$("#update-incident-modal .maintenance-end input, #update-incident-modal .maintenance-end select").removeAttr("disabled")):($("#update-incident-modal .maintenance-start input, #update-incident-modal .maintenance-start select").attr("disabled","disabled"),$("#update-incident-modal .maintenance-end input, #update-incident-modal .maintenance-end select").attr("disabled","disabled"))}),$("body").on("click","#update-incident-modal .close-modal",function(e){if($(this).closest(".modal").remove(),"hidden"!==$("html").css("overflow"))return!1;$("html").css("overflow","scroll")}),$("body").on("click","#update-incident-message-modal #update-body-message",function(e){$(this).attr("disabled","disabled");var a=$(".article-header .hide").text();if($("#update-incident-message-modal .maintenance-start").is(":visible"))var t=$('#update-incident-message-modal .maintenance-start input[type="date"]').val()+" "+$("#update-incident-message-modal .maintenance-start select").val(),s=$('#update-incident-message-modal .maintenance-end input[type="date"]').val()+" "+$("#update-incident-message-modal .maintenance-end select").val(),i=$("#update-incident-message-modal #update-incident-body").val(),n="<strong>Maintenance Start: "+t+"</strong><br><strong>Maintenance End: "+s+"</strong><br><br>"+i;else var n=$("#update-incident-message-modal #update-incident-body").val();$.ajax({url:"/api/v2/help_center/articles/"+a+"/translations/en-us.json",type:"PUT",data:{translation:{body:n}},success:function(){$("#update-incident-message-modal").remove(),location.reload()}})}),$("body").on("click","#update-incident-message-modal #update-update-message",function(){$(this).attr("disabled","disabled");var e=$(this).children("span.span-update_id").text(),a=$(this).children("span.span-update_status").text();if($(".incident-nav-header").children("span.hide").text(),$("#update-incident-message-modal .maintenance-start").is(":visible"))var t=$('#update-incident-message-modal .maintenance-start input[type="date"]').val()+" "+$("#update-incident-message-modal .maintenance-start select").val(),s=$('#update-incident-message-modal .maintenance-end input[type="date"]').val()+" "+$("#update-incident-message-modal .maintenance-end select").val(),i=$("#update-incident-message-modal #update-incident-body").val(),n="<strong>Maintenance Start: "+t+"</strong><br><strong>Maintenance End: "+s+"</strong><br><br>"+i;else var n=$("#update-incident-message-modal #update-incident-body").val();$.ajax({url:"/api/v2/help_center/articles/"+u+"/comments/"+e+".json",type:"PUT",data:{comment:{body:a+" - "+n}},success:function(){$("#update-incident-message-modal").remove(),location.reload()}})})}()})});var f=0,m=0;function o(){var o=0;$("#av-verify-article").prop("disabled",!0),$.get("/api/v2/search.json?query=custom_field_24296573:"+u).done(function(e){if($("#av-verify-article").prop("disabled",!1),0<e.count){var a=0;$(".av-related-tickets table tbody").empty();for(var t=0;t<e.count;t++)if("open"==e.results[t].status||"new"==e.results[t].status){a++,$(".av-related-tickets .noTickets").hide();var s=e.results[t].id,i=(e.results[t].subject,e.results[t].status),n=(e.results[t].requester_id,new Date(e.results[t].updated_at)),r='<tr class="related-tickets-item"><td><a href="/agent/tickets/'+s+'" target="_blank">'+('<span class="ticket_status_label ticket-status ticket-status-'+i+'" title="'+i+'">'+i.charAt(0).toLowerCase()+"</span>")+"&nbsp;#"+s+"</a></td><td>"+n.toDateString()+"</td></tr>";$("#av-open-related-tickets").append(r);var d=e.results[t].tags;-1<d.indexOf("article_flagged_reason_outdated_information")&&l(6),-1<d.indexOf("review_a_flagged_article")&&l(5)}0<a?(l(2),$(".av-related-tickets table").show()):(l(1),$(".av-verify-error").hide(),$(".av-related-tickets .noTickets").show(),$(".av-related-tickets table").hide())}else l(1),$(".av-related-tickets table").hide(),$(".av-related-tickets noTickets").show(),$(".av-verify-error").hide();function l(e){(0==o||o<e||e==o)&&(o=e)}y(o)})}function h(e){var a=new Date(e),t=new Date,s=new Date;s.setHours(15),s.setDate(s.getDate()-1);var i=d[a.getMonth()],n=a.getFullYear(),r=a.getDate();a.setHours(0,0,0,0)==t.setHours(0,0,0,0)?$("#av-last-vdate").text("TODAY"):a.setHours(0,0,0,0)==s.setHours(0,0,0,0)?$("#av-last-vdate").text("YESTERDAY"):$("#av-last-vdate").text(i+" "+r+", "+n)}function l(e){var a='{"label":{"name":"!av::details::'+e.date+"::"+e.interval+"::"+e.verifier+'"}}',t=JSON.parse(a);$.ajax({url:"/api/v2/help_center/articles/"+u+"/labels.json",method:"POST",data:t,success:function(){!function(e){var a=parseInt(e.interval),t=new Date(e.date);t.setMonth(t.getMonth()+a);var s=t.getFullYear(),i=function(e){var a=e;e<10&&(a="0"+e);return a}(t.getMonth()+1),n=function(e){var a=e;e<10&&(a="0"+e);return a}(t.getDate()),r={label:{name:"!av::YYYY::"+s}},d={label:{name:"!av::MM::"+i}},l={label:{name:"!av::DD::"+n}};$.ajax({url:"/api/v2/help_center/articles/"+u+"/labels.json",method:"POST",data:r,error:function(){c()},success:function(){$.ajax({url:"/api/v2/help_center/articles/"+u+"/labels.json",method:"POST",data:d,error:function(){c()},success:function(){$.ajax({url:"/api/v2/help_center/articles/"+u+"/labels.json",method:"POST",data:l,error:function(){c()},success:function(){$("#sideNavigation ").css("border-top","3px solid #00e8c6"),$(".nav-border").css("border-top","3px solid #00e8c6"),$("#av-header").removeClass().addClass("av-success"),$("#av-header").find(".av-status").text("TRUSTED"),$("#av-header").find("i").removeClass().addClass("fa fa-check"),$("#av-last-verifier").text(e.verifier),$("#av-interval-select").val(e.interval),b(e.interval),h(e.date),$("#av-verify-article").prop("disabled",!1),$("#av-verify-article").find("span").text("VERIFY ARTICLE"),$("#av-verify-article").find("i").hide(),$("#av-verify-article").removeClass("av-danger"),o()}})}})}})}(e)},error:function(){c()}})}function b(t){$(".k-selected").prev(".k-select").find(">ul").empty(),$(".k-selected option").each(function(){var e=$(this).text(),a=$(this).val();t==a?($(this).parent().prev(".k-select").find("span").first().html(e),$(this).parent().prev(".k-select").find("ul").append('<li style="display:none">'+e+"<span>"+a+"</span></li>")):$(this).parent().prev(".k-select").find("ul").append("<li>"+e+"<span>"+a+"</span></li>")})}function g(e){(0==f||f<e||e==f)&&(f=e)}function y(e){switch(e){case 1:$("#av-header").removeClass().addClass("av-success"),$("#av-header").find("i").removeClass().addClass("fa fa-check"),$("#av-header").find(".av-status").text("TRUSTED"),$("#sideNavigation ").css("border-top","3px solid #00e8c6"),$(".nav-border").css("border-top","3px solid #00e8c6");break;case 2:$("#av-header").find(".av-status").text("PENDING APPROVAL"),$("#av-header").find("i").removeClass().addClass("fa fa-warning"),$("#av-header").removeClass().addClass("av-warning"),$("#sideNavigation ").css("border-top","3px solid #e0b21e"),$(".nav-border").css("border-top","3px solid #e0b21e");break;case 3:$("#av-header").find(".av-status").text("PENDING VERIFICATION"),$("#av-header").find("i").removeClass().addClass("fa fa-warning"),$("#av-header").removeClass().addClass("av-default"),$("#sideNavigation ").css("border-top","3px solid #b4b4b4"),$(".nav-border").css("border-top","3px solid #b4b4b4");break;case 4:$("#av-header").find(".av-status").text(m+" DAYS UNTIL VERIFICATION"),$("#av-header").find("i").removeClass().addClass("fa fa-warning"),$("#av-header").removeClass().addClass("av-warning"),$("#sideNavigation ").css("border-top","3px solid #e0b21e"),$(".nav-border").css("border-top","3px solid #e0b21e");break;case 5:$("#av-header").find(".av-status").text("FLAGGED"),$("#av-header").find("i").removeClass().addClass("fa fa-warning"),$("#av-header").removeClass().addClass("av-danger"),$("#sideNavigation ").css("border-top","3px solid #df2828"),$(".nav-border").css("border-top","3px solid #df2828");break;case 6:$(".av-related-tickets table").show(),$("#av-header").find(".av-status").text("OUT OF DATE"),$("#av-header").find("i").removeClass().addClass("fa fa-warning"),$("#av-header").removeClass().addClass("av-danger"),$("#sideNavigation ").css("border-top","3px solid #df2828"),$(".nav-border").css("border-top","3px solid #df2828")}}function c(){$("#av-verify-article").prop("disabled",!1),$("#av-verify-article").find("span").text("FAILED - RETRY?"),$("#av-verify-article").addClass("av-danger")}$("#av-verify-article").on("click",function(){0!=$("#av-interval-select").val()||"0"!=$("#av-interval-select").val()?($(".av-interval-error").hide(),$(this).find("span").text("LOADING..."),$(this).prop("disabled",!0),$(this).find("i").show(),$.get("/api/v2/search.json?query=custom_field_24296573:"+u).done(function(e){for(var a=0,t=0;t<e.count;t++)"new"!=e.results[t].status&&"open"!=e.results[t].status||-1<e.results[t].tags.indexOf("review_a_flagged_article")&&a++;if(0==a){var s=(new Date).toISOString(),i=HelpCenter.user.name,d={date:s,interval:$("#av-interval-select").val(),verifier:i};$.get("/api/v2/help_center/articles/"+u+"/labels.json").done(function(e){if(0<e.labels.length){for(var a=[],t=0;t<e.labels.length;t++)if(0==e.labels[t].name.indexOf("!av::")){var s=e.labels[t].id;a.push(s)}0<a.length?(i=a,n=d,r=0,function e(){i[r],$.ajax({url:"/api/v2/help_center/articles/"+u+"/labels/"+i[r]+".json",method:"DELETE",error:function(){},success:function(){++r>=i.length?l(n):e()}})}()):l(d),$(".av-related-tickets").find(".av-verify-error").hide()}else l(d),$(".av-related-tickets").find(".av-verify-error").hide();var i,n,r})}else $(".av-related-tickets").find(".av-verify-error").fadeOut("fast"),$(".av-related-tickets").find(".av-verify-error").fadeIn("slow"),$("#av-verify-article").prop("disabled",!1),$("#av-verify-article").find("span").show(),$("#av-verify-article").find("i").hide(),$("#av-verify-article").find("span").text("VERIFY ARTICLE"),o()})):($(".av-interval-error").fadeOut(),$(".av-interval-error").fadeIn())})}});