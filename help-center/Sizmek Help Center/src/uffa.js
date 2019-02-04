/**
 * This script enable support KCS tools related functionalities.
 * Author: Sizmek Support Team 
 */

$(function() {

	//proxy to handle ZD api requests
	var phpURL = "https://uffa.sizmek.com/uffa/ProxyAPI.php?";

	var currPageURL = window.location.href;
	var isSectionPage = currPageURL.indexOf("/sections/") > -1;

	//track submit status
	var submitCheck = false;

	var catArray = [];
	var secArray = [];
	var artArray = [];

	var helpCenterVer, appView, currArticleId, articleURL, currUserID, customAPI, redirectAPI;
	var currentUser = HelpCenter.user.role;


	function cleanTextOnly(txt) {

		txt = txt.trim().replace(/@[\w-\(|\)]+\s/ig, "");
		return txt;
	}

	//load current helpcenter cache version number
	$.getJSON("/api/v2/help_center/" + currentLang + "/articles/206321873.json").done(function(gate) {

		var lbl = gate.article.label_names;

		if (lbl.length > 0)
			for (x = 0; x < lbl.length; x++)
				if (lbl[x].toLowerCase().indexOf("hcversion") > -1) {
					helpCenterVer = lbl[x];
				}

		//for UFFA app view, adjust layout
		function removePageElems(appViewer) {

			if (appViewer) {
				$("main").css("width", "100%");
				$(".main-column").css("margin", "0px");
				$(".article-body").css("padding", "0px");
				$(".article-wrapper").css("margin", "0px");
				$(".article-wrapper").css("padding-left", "10px");
				$("#sideNavigation").hide();
				$("#sidefoot").hide();

				$(".article-body").hide().parentsUntil("body").andSelf().siblings().hide();

			} else $(".article-body").show().parentsUntil("body").andSelf().siblings().hide();

			$("h2").css("padding", "0px");
			$("h2").css("margin-top", "0px");
			$("h2").css("border-bottom", "none");
			$("main").css("min-height", "initial");
			$("html").css("height", "auto");
			$("html").css("display", "block");
			$(".wrapper").css("min-height", "initial");

			$(".article-sidebar").remove();
		}

		if (currPageURL.indexOf("/articles/") > -1 || isSectionPage) {

			//populate recently viewed tickets
			var populateRecentTickets = function(dropdownObj) {

				var recentTickets = "/api/v2/tickets/recent.json?per_page=30";

				dropdownObj.find("option").remove();
				dropdownObj.append($("<option />").val("-").text("Select your ticket"));

				$.get(recentTickets).done(function(data) {
					$.each(data.tickets, function() {
						if (this.id !== undefined) dropdownObj.append($("<option />").val(this.id).text(this.id + " | " + this.subject));
					})
				})
			};

			var ticketID, fromAppPlatform, fromAppCategory, fromAppSection, fromAppParent, fromAppArticle, fromAppTags, checkAccess, firstAppLoad = false;

			appView = window.ZAFClient.init(function(context) {

				if (appView) {

					//when viewing thru review app
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
							appView.trigger("backBtn");
						});

						$("#rejectBtn").click(function() {
							$("#suggestEditLabel").text("Reject All Changes?");
							$("#suggestEdit .modal-body-container").hide();
							$("#backBtn, #approveBtn, #updateBtn, #rejectBtn, .modal-body").hide();
							$("#rejectReasonWrap, #cancelRejectBtn, #confirmRejectBtn").show();
							$("#confirmRejectBtn, #cancelRejectBtn").appendTo("#rejectReasonWrap").css("float", "initial").css("margin-left", "20px");
						});

						$("#restoreBtn").click(function() {
							CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).acceptAll();
							$("#suggestEdit").find("input, textarea, select").css("background-color", "initial");
							$("#restoreBtn").hide();
							$("#previewBtn, #publishBtn").show();
						});

						$("#approveBtn").click(function() {
							CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).acceptAll();
							$("#suggestEdit").find("input, textarea, select").css("background-color", "initial");
							$("#updateBtn, #rejectBtn, #approveBtn").hide();
							$("#previewBtn, #publishBtn").show();
						});

						$("#publishBtn").click(function() {
							$("#suggestEditLabel").text("Publish Approved Article?");
							$("#suggestEdit .modal-body-container").hide();
							$("#backBtn, #approveBtn, #updateBtn, #rejectBtn, #previewBtn, #publishBtn, .modal-body").hide();
							$("#publishWrap, #cancelPublishBtn, #confirmPublishBtn").show();
							$("#cancelPublishBtn, #confirmPublishBtn").appendTo("#publishWrap").css("float", "initial").css("margin-left", "20px");
						});

						$("#cancelRejectBtn").click(function() {
							$("#suggestEditLabel").text("Review Suggested Changes");
							$("#suggestEdit .modal-body-container").show();
							$("#backBtn, #approveBtn, #updateBtn, #rejectBtn, .modal-body").show();
							$("#rejectReasonWrap, #cancelRejectBtn, #confirmRejectBtn").hide();
						});

						$("#cancelPublishBtn").click(function() {
							$("#suggestEditLabel").text("Review Suggested Changes");
							$("#suggestEdit .modal-body-container").show();
							$("#backBtn, #previewBtn, #publishBtn, .modal-body").show();
							$("#publishWrap, #cancelPublishBtn, #confirmPublishBtn").hide();
							$("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
							CKEDITOR.instances.ckEditor.setReadOnly(false);
						});

						$("#confirmRejectBtn").click(function() {
							if ($("#reasonText").val() != "")
								appView.trigger("addComment", {
									thisComment: $("#reasonText").val()
								});
							else appView.trigger("errorMsg", {
								msg: "<strong>Comment missing!</strong><br/>Please explain why the changes are being rejected for the contributor."
							})
						});

						$("#updateBtn").click(function() {

							if (checkChanged()) {

								//check category and section selected
								if ($("#categorySelect>option:selected").index() == 0 || $("#sectionSelect>option:selected").index() == 0) {

									appView.trigger("errorMsg", {
										msg: "<strong>Missing values!</strong><br/>Please select the article category and section."
									});

								} else {

									$.getJSON("/api/v2/users/me/session.json", function(data) {

										currUserID = data.session.user_id;

										$("#suggestEdit").find("input, textarea, button, select").attr("disabled", "disabled");

										$("#updateBtn").text("PLEASE WAIT...");

										$.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {

											checkAccess = data.section.description.substr(1, data.section.description.length - 2);

											//revision articles section 201949563
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
													"label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ",").split(","),
													"body": CKEDITOR.instances.ckEditor.getData()
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
								}
							} else appView.trigger("errorMsg", {
								msg: "<strong>No changes found!</strong><br/>There are no changes to save as a new version."
							})
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
							storage.setItem(HelpCenter.user.email + "-previewLabels" + currArticleId, $("#searchKeywords").val());

							var params = "width=" + screen.width;
							params += ", height=" + screen.height;
							params += ", top=0, left=0";
							params += ", fullscreen=yes";
							var previewWin = window.open("/hc/en-us/articles/208223316?currArticleId=" + currArticleId, "Preview Window", params);
							if (window.focus) previewWin.focus()
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
																"body": CKEDITOR.instances.ckEditor.getData()
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
												var ar_body = CKEDITOR.instances.ckEditor.getData()
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
										} else publishArticle();
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
						$("#suggestEdit").css("display", "block");
						$("#suggestEdit").css("opacity", "1");
						$("#suggestEdit").css("overflow-y", "hidden");
						$("#suggestEdit").css("width", $("#suggestEdit .modal-body-container").width() - 10);
						$("#suggestEdit").css("height", $("#suggestEdit .modal-body-container").height());
						$(".modal-header").hide();
						$("main").css("margin-top", "0px");
						$("html").css("overflow-y", "hidden");
						$(".modal-body").css("overflow-y", "hidden");
						$("#categorySelect, #sectionSelect, #articleTitle, #searchKeywords, #parentSelect").css("width", "315px");
						$("#otherDetails").find("li")[0].style.width = "549px";

						//hide irrelevant buttons for kb ticket review
						$("#submitSuggestionBtn, #assignSelf, #publishImmediate, #cancelSuggestionBtn, #related-article-tickets").hide();
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

						appView.trigger("reviewEditorReady");
						$(".close").hide();
					})
				}
			});

			if (currPageURL.indexOf("/articles/") > -1) {

				currArticleId = currPageURL.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];
				articleURL = currPageURL.split("--")[0];

				redirectAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";
				customAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";

				//redundant??
				//var getArticleAPI = "/api/v2/help_center/en-us/articles/" + currArticleId + ".json";

			} else if (isSectionPage) {

				currSectionId = currPageURL.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];
				articleURL = currPageURL.split("--")[0];

				redirectAPI = "/api/v2/help_center/sections/201249236.json";
				customAPI = "/api/v2/help_center/articles/search.json?section=" + currSectionId
			}

			//custom file upload page for CK editor
			if (currArticleId == "209729503" && currPageURL.indexOf("type=Files") > -1) removePageElems();

			else if (HelpCenter.user.email !== null && (currPageURL.indexOf("/articles/") > -1 || isSectionPage))

				if (currentUser == "manager" || currentUser == "agent") {



					$("#flagArticle").on("hide.bs.modal", function(e) {
						if ($("#flagReason").prop("selectedIndex") != 0 || $("#detailedReason").val() != "")
							if (confirm("All changes will be lost. Are you sure you want to cancel?")) {
								$("#flagReason").val($("#flagReason option:first").val());
								$("#detailedReason").val("");
								return true;
							} else {
								e.preventDefault();
								e.stopImmediatePropagation();
								return false;
							}
					});

					$("#suggestEdit").on("hide.bs.modal", function(e) {
						if (checkChanged())
							if (confirm("All unsaved changes will be lost. Are you sure you want to cancel?")) {
								resetSuggestionModal();
								return true;
							} else {
								e.preventDefault();
								e.stopImmediatePropagation();
								return false;
							}
					});


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
												"comment": "New article has been requested after viewing the following section:\n\n[" + cleanTextOnly(sectionData.section.name) + "](" + sectionURL + ")\n\nRequest detail:\n\n" + descriptionText,
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
												$("#requestArticle .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
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


					var resetSectionDropdown = function(secArray, currSectionId, currCategoryId) {

						var checkSectionId = $("#section-" + currSectionId);

						$.each(secArray, function(i, section) {

							if (section["category"] == currCategoryId) {

								$("#sectionSelect").append('<option name="' + section["name"] + '" value="' + section["id"] + '">' + cleanTextOnly(section["name"]) + "</option>");
								$("#bread-drop").prepend('<a id="section-' + section["id"] + '" href="/hc/en-us/sections/' + section["id"] + '">' + cleanTextOnly(section["name"]) + "</a>")
							}
						});

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
						$('#assignSelf input').prop("checked", false);
						$('#publishImmediate input').prop("checked", false);
						resetCategoryDropdown(catArray, secArray, originalCategoryID, originalSectionID, originalPlatform);
						resetCKeditor(true)
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
										$("#suggestEdit .cke_contents").css("height", $("#suggestEdit .modal-body-right").height() + "px");
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

					//need to clean up, break to variables and reuse
					$('<div id="useArticle" class="internal_only side-modal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG" style="display: none;"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">&times;</button><h1 id="suggestEditLabel" class="modal-title">Use this article to resolve your ticket</h1></div><div class="modal-body"><ul id="articleLocation"><li>Ticket <select id="ticketSelect"><option value="-" name="-">Select your ticket</option></select></li></ul><input type="checkbox" id="suggestArticle"><span class="suggestArticleLabel">Also suggest this article to the ticket owner as the solution</span></div><div class="modal-footer"><span class="errorMessage"></span><button id="useTicketButton" class="btn btn-primary" type="button">UPDATE TICKET</button><button id="cancelUseBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div><div id="requestArticle" class="internal_only side-modal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG requestLoader"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">&times;</button><h1 id="requestArticleLabel" class="modal-title">Request a New Article</h1></div><div class="modal-body"><p>What would you like to see in the new article?</p><p><textarea id="requestArticleDetail" rows="4" cols="50"></textarea></p><div class="ticketSelector">Also update following ticket for UFFA <select class="ticketSelectorSM"><option value="-">Select a ticket if you wish to update</option></select></div><hr/><div id="assignSelf"><label><input type="checkbox" value="">Assign to Me <div class="tooltip">?<span class="tooltiptext">Check this to assign the contribution review ticket to you - if you wish to review it and work on it further.</span> </div></label></div></div><div class="modal-footer"><span class="errorMessage"></span><button id="confirmRequestBtn" class="btn btn-primary" type="button">REQUEST ARTICLE</button><button id="cancelRequestBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div><div id="flagArticle" class="internal_only side-modal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG flagLoader"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">&times;</button><h1 id="flagArticleLabel" class="modal-title">Thank you for helping us improve our Help Center!</h1></div><div class="modal-body"><p>How should the article be flagged?</p><select id="flagReason"><option value="-">Please select a reason</option><option value="article_flagged_reason_inaccurate_information">Inaccurate Information</option><option value="article_flagged_reason_insufficient_information">Insufficient Information</option><option value="article_flagged_reason_outdated_information">Outdated Information</option><option value="article_flagged_reason_broken_link">Broken Link</option><option value="article_flagged_reason_broken_image_or_video">Broken Image or Video</option><option value="article_flagged_reason_missing_attachment">Missing Attachment</option><option value="article_flagged_reason_other">Other</option></select><p>Please share some more details about your report:</p><p><textarea id="detailedReason" rows="4" cols="50"></textarea></p><div class="ticketSelector">Also update following ticket for UFFA <select class="ticketSelectorSM"><option value="-">Select a ticket if you wish to update</option></select></div><hr/><div id="assignSelf"><label><input type="checkbox" value="">Assign to Me <div class="tooltip">?<span class="tooltiptext">Check this to assign the contribution review ticket to you - if you wish to review it and work on it further.</span> </div></label></div></div><div class="modal-footer"><span class="errorMessage"></span><button id="confirmFlagBtn" class="btn btn-primary" type="button">FLAG ARTICLE</button><button id="cancelFlagBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div> <div id="suggestEdit" class="internal_only side-modal" tabindex="-1"> <div class="modal-dialog"> <div class="modal-content"> <div class="loaderBG"> <img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"> <h3 class="submitStatus"> </h3> </div> <div class="modal-header"> <button class="close" name="x" type="button" data-dismiss="modal">&times;</button> <h1 id="suggestEditLabel" class="modal-title">Suggest changes to this article </h1> </div> <div id="rejectReasonWrap"> <p>Additional comments for rejecting changes: </p> <textarea id="reasonText"> </textarea> </div> <div id="publishWrap"> <p>Additional comments: </p> <textarea id="publishComment"> </textarea> </div> <div class="modal-body-container"> <div class="modal-body"> <textarea id="ckEditor"> </textarea> </div> <div class="modal-body modal-body-right"> <ul id="articleLocation"> <li>Platform <select id="platformSelect"> <option value="unspecified" name="NO SPECIFIC">NO SPECIFIC</option> <option value="mdx2" name="MDX 2.0">MDX 2.0</option> <option value="mdxnxt" name="MDX-NXT">MDX-NXT</option> <option value="supportkb" name="SUPPORT KB">SUPPORT KB</option> <option value="strikead" name="STRIKE AD">STRIKE AD</option> </select> </li> <li>Category <select id="categorySelect"> <option value="-">Select a category </option> </select> </li> <li>Section <select id="sectionSelect"> <option value="-">Select a section </option> </select> </li> </ul> <hr /> <ul id="articleDetails" class="kbonly"> <li>Type <select id="typeSelect" disabled> <option value="-">None </option> <option value="topic">Topic </option> <option value="article">Article </option> <option value="issue">Issue </option> <option value="reference">Reference </option> <option value="@howto">How to </option> </select> </li> <li class="parentDrop">Parent <select id="parentSelect"> <option value="None">Not available for selected article type </option> </select> </li> </ul> <hr class="kbonly" /> <ul id="otherDetails"> <li>Title <input type="text" id="articleTitle"> </li> <li>Tags <input type="text" id="searchKeywords"> </li> </ul> <div class="ticketSelector">Also update following ticket for UFFA <select id="ticketSelector"> <option value="-" name="-">Select a ticket if you wish to update </option> </select> </div> <hr/> <div id="related-article-tickets"> Related Tickets <table> <thead> <tr> <td>ID</td> <td>Updated</td> </tr> </thead> <tbody></tbody> </table> </div> <div id="assignSelf"><hr/><label><input type="checkbox" value="">Assign to Me <div class="tooltip">?<span class="tooltiptext">Check this to assign the contribution review ticket to you - if you wish to review it and work on it further.</span> </div></label></div> <div id="publishImmediate"><label><input type="checkbox" value="">Publish Immediately <div class="tooltip">?<span class="tooltiptext">Check this to publish the changes immediately. A contribution ticket will still be created for the reviews.</span> </div></label></div><hr/><div class="modal-side-options"> <span class="errorMessage"> </span> <button id="submitSuggestionBtn" class="btn btn-primary" type="button">SUBMIT</button> <button id="cancelSuggestionBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL </button> <button id="backBtn" class="btn btn-default" type="button">BACK </button> <button id="publishBtn" class="btn btn-primary" type="button">PUBLISH </button> <button id="previewBtn" class="btn btn-info" type="button">PREVIEW IN FULLSCREEN </button> <button id="approveBtn" class="btn btn-success" type="button">PREVIEW </button> <button id="updateBtn" class="btn btn-warning" type="button">UPDATE VERSION </button> <button id="rejectBtn" class="btn btn-danger" type="button">REJECT </button> <button id="restoreBtn" class="btn btn-info" type="button">RESTORE THIS VERSION </button> <button id="cancelRejectBtn" class="btn btn-default" type="button">CANCEL</button> <button id="confirmRejectBtn" class="btn btn-primary" type="button">CONFIRM REJECT </button> <button id="confirmPublishBtn" class="btn btn-primary" type="button">CONFIRM PUBLISH </button> <button id="cancelPublishBtn" class="btn btn-default" type="button">CANCEL </button></div></div></div></div></div></div></div>').insertAfter("#main-wrap");

					if (currPageURL.indexOf("/articles/") > -1) {

						$(".main-column").prepend('<a class="use-article click" role="button" data-toggle="modal" data-target="#useArticle" data-backdrop="static" data-keyboard="false">USE</a>');
						$(".main-column").prepend('<a class="suggest-edit click" role="button" data-toggle="modal" data-target="#suggestEdit" data-backdrop="static" data-keyboard="false">FIX</a>');
						$(".main-column").prepend('<a class="flag-article click" role="button" data-toggle="modal" data-target="#flagArticle" data-backdrop="static" data-keyboard="false">FLAG</a>');
						$(".main-column").prepend('<a class="add-article click" role="button" data-toggle="modal" data-target="#suggestEdit" data-backdrop="static" data-keyboard="false">ADD</a>');
						$(".main-column").prepend('<a class="request-article click" role="button" data-toggle="modal" data-target="#requestArticle" data-backdrop="static" data-keyboard="false">REQUEST</a>');

					} else if (isSectionPage) {

						$('<div id="suggestEdit" class="internal_only side-modal" tabindex="-1"> <div class="modal-dialog"> <div class="modal-content"> <div class="loaderBG"> <img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"> <h3 class="submitStatus"> </h3> </div> <div class="modal-header"> <button class="close" name="x" type="button" data-dismiss="modal">&times;</button> <h1 id="suggestEditLabel" class="modal-title">Suggest changes to this article </h1> </div> <div id="rejectReasonWrap"> <p>Additional comments for rejecting changes: </p> <textarea id="reasonText"> </textarea> </div> <div id="publishWrap"> <p>Additional comments: </p> <textarea id="publishComment"> </textarea> </div> <div class="modal-body-container"> <div class="modal-body"> <textarea id="ckEditor"> </textarea> </div> <div class="modal-body modal-body-right"> <ul id="articleLocation"> <li>Platform <select id="platformSelect"> <option value="unspecified" name="NO SPECIFIC">NO SPECIFIC</option> <option value="mdx2" name="MDX 2.0">MDX 2.0</option> <option value="mdxnxt" name="MDX-NXT">MDX-NXT</option> <option value="supportkb" name="SUPPORT KB">SUPPORT KB</option> <option value="strikead" name="STRIKE AD">STRIKE AD</option> </select> </li> <li>Category <select id="categorySelect"> <option value="-">Select a category </option> </select> </li> <li>Section <select id="sectionSelect"> <option value="-">Select a section </option> </select> </li> </ul> <hr /> <ul id="articleDetails" class="kbonly"> <li>Type <select id="typeSelect" disabled> <option value="-">None </option> <option value="topic">Topic </option> <option value="article">Article </option> <option value="issue">Issue </option> <option value="reference">Reference </option> <option value="@howto">How to </option> </select> </li> <li class="parentDrop">Parent <select id="parentSelect"> <option value="None">Not available for selected article type </option> </select> </li> </ul> <hr class="kbonly" /> <ul id="otherDetails"> <li> Title <input type="text" id="articleTitle"> </li> <li>Tags <input type="text" id="searchKeywords"> </li> </ul> <div class="ticketSelector">Also update following ticket for UFFA <select id="ticketSelector"> <option value="-" name="-">Select a ticket if you wish to update </option> </select> </div> <hr/> <div id="related-article-tickets"> Related Tickets <table> <thead> <tr> <td>ID</td> <td>Updated</td> </tr> </thead> <tbody></tbody> </table> </div> <hr/> <div id="assignSelf"><label><input type="checkbox" value="">Assign to Me <div class="tooltip">?<span class="tooltiptext">Check this to assign the contribution review ticket to you - if you wish to review it and work on it further.</span> </div></label> <div id="publishImmediate"><label><input type="checkbox" value="">Publish Immediately <div class="tooltip">?<span class="tooltiptext">Check this to publish the changes immediately. A contribution ticket will still be created for the reviews.</span> </div></label></div> <hr/> <div class="modal-side-options"> <span class="errorMessage"> </span> <button id="submitSuggestionBtn" class="btn btn-primary" type="button">SUBMIT</button> <button id="cancelSuggestionBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL </button> <button id="backBtn" class="btn btn-default" type="button">BACK </button> <button id="publishBtn" class="btn btn-primary" type="button">PUBLISH </button> <button id="previewBtn" class="btn btn-info" type="button">PREVIEW IN FULLSCREEN </button> <button id="approveBtn" class="btn btn-success" type="button">PREVIEW </button> <button id="updateBtn" class="btn btn-warning" type="button">UPDATE VERSION </button> <button id="rejectBtn" class="btn btn-danger" type="button">REJECT </button> <button id="restoreBtn" class="btn btn-info" type="button">RESTORE THIS VERSION </button> <button id="cancelRejectBtn" class="btn btn-default" type="button">CANCEL</button> <button id="confirmRejectBtn" class="btn btn-primary" type="button">CONFIRM REJECT </button> <button id="confirmPublishBtn" class="btn btn-primary" type="button">CONFIRM PUBLISH </button> <button id="cancelPublishBtn" class="btn btn-default" type="button">CANCEL </button></div></div></div> </div></div></div>').insertAfter(".sub-nav");
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

						$(".loaderBG").css("width", $("#suggestEdit .modal-content").width());
						$(".loaderBG").css("height", $("#suggestEdit .modal-content").height());
						$("#suggestEdit").find("h1").text("Submit an Article");

						originalArticleTitle = "";
						$("#articleTitle").val("");
						originalTags = "";
						$("#searchKeywords").val("");
						originalHTML = "";
						$("#submitSuggestionBtn").text("SUBMIT");
						$("#ckEditor").val("");

						resetCKeditor(false);

						newArticle = true;
					});

					$('.suggest-edit').on('click', function() {

						populateRelatedTickets();

						populateRecentTickets($("#ticketSelector"));

						$(".loaderBG").css("width", $("#suggestEdit .modal-content").width());
						$(".loaderBG").css("height", $("#suggestEdit .modal-content").height());
						$('#suggestEdit').find('h1').text('Suggest changes to this article');
						$("#submitSuggestionBtn").text("SUBMIT");

						originalHTML = [];
						originalArticleTitle = tempTitle;
						originalTags = tempTags;
						originalHTML = tempHTML;

						$("#articleTitle").val(originalArticleTitle).change();
						$("#searchKeywords").val(originalTags);
						$("#ckEditor").val(originalHTML);

						resetCKeditor(true);

						newArticle = false;
					});

					if (currPageURL.indexOf("/articles/") > -1) {

						currArticleId = currPageURL.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];

						customAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";

						//redundant??
						//var getArticleAPI = "/api/v2/help_center/en-us/articles/" + currArticleId + ".json";
					} else if (isSectionPage) {

						customAPI = "/api/v2/help_center/articles/search.json?section=" + currSectionId;
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

							} else if (isSectionPage) {

								if (data.count > 0) {

									var sample = data.results[0];

									originalHTML = tempHTML = sample.body;
									originalArticleTitle = tempTitle = sample.title;
									originalTags = tempTags = sample.label_names.toString().replace(/[\s,]+/g, ",");
									originalSectionID = sample.section_id;
									originalPosition = 0;

								} else {

									originalArticleTitle = originalTags = originalHTML = "";
									currArticleId = 0;
									originalSectionID = currSectionId;
								}
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
									catArray = $.merge(newArray, catArray);
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
									populateSections();
								else {
									secArray = JSON.parse(storage.getItem(HelpCenter.user.email + "-allSections" + helpCenterVer + currentLang));
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
										var catDesc = categoryMatch[0].desc;
										if (catDesc.indexOf("@mdx2") > -1) {
											originalPlatform = "mdx2";
											$("#platformSelect").val("mdx2");
										} else if (catDesc.indexOf("@mdxnxt") > -1) {
											originalPlatform = "mdxnxt";
											$("#platformSelect").val("mdxnxt");
										} else if (catDesc.indexOf("@supportkb") > -1) {
											originalPlatform = "supportkb";
											$("#platformSelect").val("supportkb");
										} else if (catDesc.indexOf("@strikead") > -1) {
											originalPlatform = "strikead";
											$("#platformSelect").val("strikead");
										} else {
											originalPlatform = "unspecified";
											$("#platformSelect").val("unspecified");
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
										$("#platformSelect").val(originalPlatform);
									}
									if ($("#platformSelect>option:selected").index() == 3) {
										$(".kbonly").show();
										$(".cke_contents").css("height", "180px");
									} else {
										$(".kbonly").hide();
										$(".cke_contents").css("height", "230px");
									}
									if (currentUser != "anonymous" && currentUser != "end_user") {
										resetCategoryDropdown(catArray, secArray, originalCategoryID, originalSectionID, originalPlatform);
									}
								}
							}, 100)
						});
					}

					get_customAPI();



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
						$(target).addClass("slide-in"), $('html').addClass('stop-scrolling');
					});
					$('body').on("click", '.side-modal #cancelRequestBtn, .side-modal .close, .side-modal #cancelRejectBtn, .side-modal #cancelPublishBtn, .side-modal #cancelFlagBtn, .side-modal #cancelUseBtn, .side-modal #cancelSuggestionBtn', function() {
						$('#assignSelf input').prop("checked", false);
						$('#publishImmediate input').prop("checked", false);
						$(this).closest(".side-modal").removeClass("slide-in"), $('html').removeClass('stop-scrolling')
					});
					$(document).keydown(function(e) {
						if (e.keyCode == 27) $(".side-modal").find(".close").click();
					});
					$(".modal").on("shown", function() {
						$("html")[0].className = "stop-scrolling";
					});
					$(".modal").on("hidden", function() {
						$("html")[0].className = "";
					});
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
									var newArray = $.map(data.articles, function(article, i) {
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

							//redundant??
							//if (onpageLoad == 1) 
							populateArticles();
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
										if (appView) {
											CKEDITOR.instances.ckEditor.setReadOnly(false);
											$("#suggestEdit .cke_contents").css('min-height', '645px');
										}
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
						var ticketTags, ticketAssignee = '';
						var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();
						if (reasonTag == "-") showError("Please select a reason from the list");
						else if (descriptionText == "") showError("Please provide some details about this report");
						else $.getJSON("/api/v2/users/me/session.json", function(data) {
							currUserID = data.session.user_id;

							$("#flagArticle").find("input, textarea, button, select").attr("disabled", "disabled");
							$("#confirmFlagBtn").text("PLEASE WAIT...");

							if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_flag_kb,review_a_flagged_article";
							else ticketTags = "contribute_flag_doc,review_a_flagged_article";

							//assign to self check
							if ($('#assignSelf input').is(":checked")) ticketAssignee = currUserID;

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
											"assignee_id": ticketAssignee,
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
															$('#assignSelf input').prop("checked", false),
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
					//request a new article
					$("#confirmRequestBtn").click(function(e) {

						var ticketTags, ticketAssignee = '';
						var descriptionText = $("#requestArticleDetail").val();
						var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();

						if (descriptionText == "") showError("What would you like to see in the new article?");
						else $.getJSON("/api/v2/users/me/session.json", function(data) {

							currUserID = data.session.user_id;

							//disable elements during submit
							$("#requestArticle").find("input, textarea, button, select").attr("disabled", "disabled");
							$("#confirmRequestBtn").text("PLEASE WAIT...");

							//add ticket tags for ZD trigger alerts
							if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_request_kb,review_a_requested_article";
							else ticketTags = "contribute_request_doc,review_a_requested_article";

							ticketTags += ",category_id_" + originalCategoryID;

							//assign to self check
							if ($('#assignSelf input').is(":checked")) ticketAssignee = currUserID;

							$.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
								checkAccess = data.section.description.substr(1, data.section.description.length - 2);
								$.getJSON("/api/v2/help_center/articles/" + currArticleId + ".json", function(articleData) {
									var tickAPI = phpURL + helpCenterVer;
									var ticketJSON = {
										"ticket": {
											"subject": "New article request has been received",
											"comment": "New article has been requested after viewing the following article:\n\n[" + cleanTextOnly(articleData.article.title) + "](" + articleURL + ")\n\nRequest detail:\n\n" + descriptionText,
											"requester_id": currUserID,
											"assignee_id": ticketAssignee,
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

									//display loader
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
					//submit suggestions or new article
					$("#submitSuggestionBtn").click(function() {
						if (checkChanged())
							if ($("#categorySelect>option:selected").index() == 0 || $("#sectionSelect>option:selected").index() == 0)
								showError("Please select the article category and section");
							else $.getJSON("/api/v2/users/me/session.json", function(data) {
								currUserID = data.session.user_id;

								//disable elements during submit
								$("#suggestEdit").find("input, textarea, button, select").attr("disabled", "disabled");
								$("#submitSuggestionBtn").text("PLEASE WAIT...");

								var getHighestVerAPI;
								highestVerArray = [];

								if (!newArticle)
									getHighestVerAPI = "/api/v2/help_center/articles/search.json?query=Article" + encodeURIComponent(" " + currArticleId) + "&section=201949563&per_page=100";
								else
									getHighestVerAPI = '/api/v2/help_center/articles/search.json?query="New Article : ' + encodeURIComponent($("#articleTitle").val()) + '"&section=201949563&per_page=100';

								function handleErrorSubmit() {
									//show error and enable elements and reset button texts
									alert("Sorry, there was a problem submitting your suggestions. Please try again later."),
										$("#suggestEdit").find("input, textarea, button, select").attr("disabled", false),
										$("#submitSuggestionBtn").text("SUBMIT");

									//reset KCS form fields, repopulate dropdowns
									resetSuggestionModal();

									//enable scroll and hide KCS slider
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
											checkVersions();
										} else
											$.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {

												checkAccess = data.section.description.substr(1, data.section.description.length - 2);

												$.getJSON(redirectAPI, function(articleData) {
													//revision articles section
													var createArticleAPI = "/api/v2/help_center/sections/201949563/articles.json";
													var updateTicketID, ar_title, ar_label_names, ar_body;

													//existing article update
													if (currPageURL.indexOf("/articles/") > -1) {
														ar_title = "Article ID " + currArticleId + " - Revision ver." + highestMajorVer + ".0";
														ar_label_names = originalTags.split(",");
														ar_body = articleData.article.body
													}

													//new article submit
													if (newArticle || isSectionPage) {
														ar_title = "New Article : " + $("#articleTitle").val() + " - Revision ver." + highestMajorVer + ".0";
														ar_label_names = $("#searchKeywords").val().replace(/[\s,]+/g, ",").split(",");
														ar_body = CKEDITOR.instances.ckEditor.getData()
													}

													//for existing article edits, back up original version
													var addOriginalArticleJSON = {
														"article": {
															"title": ar_title,
															"comments_disabled": true,
															"locale": "en-us",
															"label_names": ar_label_names,
															"body": ar_body
														}
													};

													//create draft article in the revisions section
													$.ajax(createArticleAPI, {
														type: "POST",
														dataType: "json",
														contentType: "application/json",
														processData: false,
														data: JSON.stringify(addOriginalArticleJSON),
														success: function(original) {

															if (!newArticle) {
																//create another draft with changes for editing existing an article
																var addArticleJSON = {
																	"article": {
																		"title": "Article ID " + currArticleId + " - Revision ver." + highestMajorVer + ".1",
																		"comments_disabled": true,
																		"locale": "en-us",
																		"label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ",").split(","),
																		"body": CKEDITOR.instances.ckEditor.getData()
																	}
																};
																$.ajax(createArticleAPI, {
																	type: "POST",
																	dataType: "json",
																	contentType: "application/json",
																	processData: false,
																	data: JSON.stringify(addArticleJSON),
																	success: function(edited) {
																		//create the kb review ticket
																		processTicket(articleData, original, edited)
																	},
																	error: function() {
																		handleErrorSubmit()
																	}
																})
															} else {
																//no need for second article for new article submits
																var edited = original;
																originalArticleTitle = $("#articleTitle").val();
																originalTags = $("#searchKeywords").val();

																//create the kb review ticket
																processTicket(articleData, original, edited)
															}
														},
														error: function() {
															handleErrorSubmit()
														}
													});

													//create kb review ticket
													function processTicket(articleData, original, edited) {
														var tickAPI = phpURL + helpCenterVer;
														var ticketTags, submitTitle, submitDesc, contributionType, ticketAssignee = '';
														var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();

														if (newArticle) {
															//set params for NEW article submit
															currArticleId = "";
															articleURL = "";
															getPlatformName = $("#platformSelect option:selected").attr("name");
															originalCategoryName = $("#categorySelect option:selected").attr("name");
															originalSectionName = $("#sectionSelect option:selected").attr("name");
															originalParent = $("#parentSelect option:selected").attr("name");
															submitTitle = "New Article Received: " + $("#articleTitle").val();
															submitDesc = "A new article has been received for the following location. " + "\n\nPlatform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + " \nCategory: " + cleanTextOnly(originalCategoryName) + " \nSection: " + cleanTextOnly(originalSectionName) + " \n\nRevision Version: " + highestMajorVer + ".0" + " \nState: New Draft \nReference No. " + original.article.id + "\n\n<pending-review>";
															contributionType = "review_a_new_article";

															//set ticket tags for ZD trigger
															if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_add_kb,review_a_new_article";
															else ticketTags = "contribute_add_doc,review_a_new_article";
															ticketTags += ",category_id_" + originalCategoryID;
														} else {
															//set params for EXISTING article edits
															submitTitle = "Article Edited: " + cleanTextOnly(articleData.article.title);
															submitDesc = "New suggestions has been received to update following article. " + "\n\nPlatform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + " \nCategory: " + cleanTextOnly(originalCategoryName) + " \nSection: " + cleanTextOnly(originalSectionName) + " \n\nOriginal Article: [" + cleanTextOnly(originalArticleTitle) + "](" + articleURL + ") \n\nRevision Version: " + highestMajorVer + ".0" + " \nState: Original \nReference No. " + original.article.id;
															contributionType = "review_an_existing_article_edit";

															//set ticket tags for ZD trigger
															if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_fix_kb,review_an_existing_article_edit";
															else ticketTags = "contribute_fix_doc,review_an_existing_article_edit";
															ticketTags += ",category_id_" + originalCategoryID;
														}

														//assign to self check - auto assign based on category should not apply for assigned tickets
														if ($("#assignSelf input").is(":checked")) {
															ticketAssignee = currUserID;
															ticketTags += ",assign_self";
														}

														//create ticket under Documentation group (21387715) & Help Center Contribution Review form (16155)
														var ticketOriginalJSON = {
															"ticket": {
																"subject": submitTitle,
																"comment": submitDesc,
																"requester_id": currUserID,
																"group_id": 21387715,
																"assignee_id": ticketAssignee,
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
																	$("#submitSuggestionBtn").text("SUBMIT");
																})
															})
														}).complete(function() {

															//update the ticket again for existing article for edited version details
															if (!newArticle && submitCheck) {

																var commentStr = "Following values has been revised:\n";
																if (originalArticleTitle !== $("#articleTitle").val()) commentStr += "\nPrevious Title: " + originalArticleTitle + "\nUpdated Title: " + $("#articleTitle").val() + "\n";
																if (originalPlatform !== $("#platformSelect option:selected").val()) commentStr += "\nPrevious Platform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + "\nUpdated Platform: " + $("#platformSelect option:selected").text() + "\n";
																if (originalCategoryName !== $("#categorySelect option:selected").attr("name")) commentStr += "\nPrevious Category: " + originalCategoryName + "\nUpdated Category: " + $("#categorySelect option:selected").attr("name") + "\n";
																if (originalSectionName !== $("#sectionSelect option:selected").attr("name")) commentStr += "\nPrevious Section: " + originalSectionName + "\nUpdated Section: " + $("#sectionSelect option:selected").attr("name") + "\n";
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
																			$("#submitSuggestionBtn").text("SUBMIT");
																		})
																	})
																}).complete(function() {
																	if (submitCheck) {

																		//update the related ticket UFFA fields
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
																				//updated UFFA fields of a related ticket
																			})

																		}

																		//if publish immediate, update original article
																		if ($('#publishImmediate input').is(":checked")) {
																			//accept all changes in editor
																			CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).acceptAll();

																			$("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
																			$("#suggestEdit .submitStatus").text("Publishing your changes...");

																			//publish the changes by updating the existing article with updated values
																			var updateArticleAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";
																			var updateArticleJSON;
																			var ar_pos;

																			if ($("#platformSelect option:selected").val() == "supportkb") ar_pos = parseInt($("#parentSelect option:selected").val()) + 1;
																			else ar_pos = 0;
																			if (isNaN(ar_pos)) ar_pos = 1;

																			updateArticleJSON = {
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
																							"body": CKEDITOR.instances.ckEditor.getData()
																						}
																					};
																					$.ajax(updateTranslationAPI, {
																						type: "PUT",
																						dataType: "json",
																						contentType: "application/json",
																						processData: false,
																						data: JSON.stringify(updateTranslationJSON),
																						success: function(data) {

																							var commentStr = "Changes has been published immediately.";
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
																							$.ajax(updateLatestTicket, {
																								method: "POST",
																								data: JSON.stringify(versionJSON)
																							}).done(function(res, textStatus, xhr) {
																								//done updating article
																							}).fail(function(xhr, textStatus, errorThrown) {
																								$("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
																								$.getJSON("https://jsonip.com/?callback=?", function(data) {
																									var showIP = data.ip;
																									$("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
																									$("#suggestEdit .backSubmit").click(function() {
																										$("#suggestEdit .loaderBG").fadeOut();
																										$("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
																										$("#submitSuggestionBtn").text("SUBMIT");
																									})
																								})
																							}).complete(function() {
																								$("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
																								$("#suggestEdit .submitStatus").text("All done! Reloading the page...")

																								//article changes published and ticket updated
																								setTimeout(function() {
																									//publish immediate not selected, close modal
																									$("#suggestEdit .loaderBG").fadeOut();
																									$("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
																									resetSuggestionModal();
																									$('html').removeClass('stop-scrolling');
																									$("#suggestEdit").removeClass("slide-in");
																									$('#suggestEdit').modal('hide');
																									location.reload();
																								}, 4E3);
																							});
																						},
																						error: function(err) {}
																					})
																				},
																				error: function(err) {}
																			})

																		} else setTimeout(function() {
																			//publish immediate not selected, close modal
																			$("#suggestEdit .loaderBG").fadeOut();
																			$("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
																			resetSuggestionModal();
																			$('html').removeClass('stop-scrolling');
																			$("#suggestEdit").removeClass("slide-in");
																			$('#suggestEdit').modal('hide');
																		}, 4E3);
																	}
																})

															} else if (submitCheck) {
																//new article, no need second update
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
																		//done updating related ticket with UFFA field changes
																	})
																}

																//if publish immediate, publish the new article
																if ($('#publishImmediate input').is(":checked")) {
																	//accept all changes in editor
																	CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).acceptAll();

																	$("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
																	$("#suggestEdit .submitStatus").text("Publishing your new article...");

																	//publish the changes by updating the existing article with updated values
																	var newArticleAPI = "/api/v2/help_center/sections/" + $("#sectionSelect option:selected").val() + "/articles.json";
																	var ar_title = $("#articleTitle").val();
																	var ar_label_names = $("#searchKeywords").val().replace(/[\s,]+/g, ",").split(",");
																	var ar_body = CKEDITOR.instances.ckEditor.getData();
																	var newArticleJSON;
																	var ar_pos;

																	if ($("#platformSelect option:selected").val() == "supportkb") ar_pos = parseInt($("#parentSelect option:selected").val()) + 1;
																	else ar_pos = 0;
																	if (isNaN(ar_pos)) ar_pos = 1;

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

																	$.ajax(newArticleAPI, {
																		type: "POST",
																		dataType: "json",
																		contentType: "application/json",
																		processData: false,
																		data: JSON.stringify(newArticleJSON),
																		success: function(data) {

																			var commentStr = "New article have been published immediately.\n\nClick [HERE](" + "https://support.sizmek.com/hc/en-us/articles/" + data.article.id + ") to view the article.";
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
																			$.ajax(updateLatestTicket, {
																				method: "POST",
																				data: JSON.stringify(versionJSON)
																			}).done(function(res, textStatus, xhr) {
																				//done updating article
																			}).fail(function(xhr, textStatus, errorThrown) {
																				$("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
																				$.getJSON("https://jsonip.com/?callback=?", function(data) {
																					var showIP = data.ip;
																					$("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
																					$("#suggestEdit .backSubmit").click(function() {
																						$("#suggestEdit .loaderBG").fadeOut();
																						$("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
																						$("#submitSuggestionBtn").text("SUBMIT");
																					})
																				})
																			}).complete(function() {
																				$("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
																				$("#suggestEdit .submitStatus").text("All done! Loading your new article...")

																				//article changes published and ticket updated
																				setTimeout(function() {
																					//publish immediate not selected, close modal
																					$("#suggestEdit .loaderBG").fadeOut();
																					$("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
																					resetSuggestionModal();
																					$('html').removeClass('stop-scrolling');
																					$("#suggestEdit").removeClass("slide-in");
																					$('#suggestEdit').modal('hide');
																					window.location.href = "https://support.sizmek.com/hc/en-us/articles/" + data.article.id;
																				}, 4E3);
																			});
																		},
																		error: function(err) {
																			//error
																		}
																	})

																} else setTimeout(function() {
																	//publish immediate not selected, close modal
																	$("#suggestEdit .loaderBG").fadeOut();
																	$("#suggestEdit").find("input, textarea, button, select").attr("disabled", false);
																	resetSuggestionModal();
																	$('html').removeClass('stop-scrolling');
																	$("#suggestEdit").removeClass("slide-in");
																	$('#suggestEdit').modal('hide');
																}, 4E3);


															}
														})
													}
												})
											})
									})
								}
								checkVersions();
							});
						else showError("There are no changes to submit");
					});
				}
		}
	})
})