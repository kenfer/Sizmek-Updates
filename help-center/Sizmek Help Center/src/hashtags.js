// Hashtag Feature
// Author: Lawrence C. Bonilla
// Ver 1.02
// Most of the css here are under messageBoardStyle.css
$(document).ready(function() {
	var currentUser = HelpCenter.user.role;
	var articleURL = window.location.href.split("--")[0];
	var hashtagAdminURL = "https://support.sizmek.com/hc/en-us/articles/360004850231-Hashtag-Management";
	var labelList = [];
	
	if (jQuery.inArray("view_support_content", HelpCenter.user.tags) !== -1) {
		$("#user-menu").append("<a id='hashAdmin' role='menuitem' href='" + hashtagAdminURL + "'>Hashtag Management</a>");
	}

	if (window.location.href.indexOf("/articles/") > -1 && currentUser != "end_user" && currentUser != "anonymous") {
		var currArticleID = window.location.href.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0],
			currCategoryID,
			currSectionID;
		console.log("test");
		console.log(HelpCenter.user.tags);
		if (jQuery.inArray("view_support_content", HelpCenter.user.tags) !== -1) {
			$.get('/api/v2/help_center/articles/' + currArticleID + '.json', function(data) {
				currSectionID = data.article.section_id;
				$.get('/api/v2/help_center/sections/' + currSectionID + '.json', function(data2) {
					currCategoryID = data2.section.category_id;
					hashTag(currCategoryID, currSectionID);
				});
			});

			$('.article-wrapper').prepend('<div class="incident-wrapper"></div>');
			$('.incident-wrapper').prepend('<div class="article-hashtags"></div>');

			$('body').on('click', '#hashBtn', function() {
				var hashWord,
					hashtagList = [];

				$('#hashTxt').toggle('fast');
				$("#hashTxt").focus();
				hashWord = $('#hashTxt').val().replace(/\s/g, '');
				if (hashWord != '') {
					hashtagList.push(hashWord);
					$('#hashTxt').val('');
				}
				for (var x = 0; x < hashtagList.length; x++) {
					$.ajax({
						url: '/api/v2/help_center/articles/' + currArticleID + '/labels.json',
						type: 'POST',
						data: {
							"label": {
								"name": "Tags:" + hashtagList[x]
							}
						},
						success: function() {
							$(".tagList").remove();
							$(".tagList").html(hashTag(currCategoryID, currSectionID));
							$("#hashTxt").css("display", "inline-block").focus();
						}
					})
				}
			});

			// When pressing enter it triggers the hashBtn function
			// $('#hashBtn').trigger('click');
			// Javascript Keycode for 'Enter' is 13
			$('body').keypress(function(e) {
				var key = e.which;
				if (key === 13 && $('#hashTxt').css('display') === 'inline-block') {
					$('#hashBtn').trigger('click');
					return false;
				}
			});

			$('body').on('click', '.cssCircle.minusSign', function(e) {
				e.stopPropagation();
				var delTag = $(this).find('span.hide').text();
				$("#query").val("");
				$.ajax({
					url: '/api/v2/help_center/articles/' + currArticleID + '/labels/' + delTag + '.json',
					type: 'DELETE',
					success: function() {
						$(".tagList").remove();
						$(".tagList").html(hashTag(currCategoryID, currSectionID));
					}
				})
			});

			$('body').on('click', 'a.hashTags', function() {
				var currTag = $(this).find('.tagName:first').text();
				$("#query").val(currTag);
				$("#query").focus();
				window.location.href = "https://support.sizmek.com/hc/en-us/search?utf8=%E2%9C%93&query=" + encodeURIComponent(currTag) + "&commit=Search";
			});
			// Starts Hashtag Admin Features
			if (window.location.href == hashtagAdminURL) {
				console.log('window.location.href == hashtagAdminURL');
				removeUnnecessaries();
				setUpHTML();
				$('<div class="hashtagHeader"></div>').insertAfter(".article-info");
				$('<div class="hashtagList body"></div>').insertAfter(".hashtagHeader");
				//$("<div><input id='searchTag' type='text' placeholder='Im a search hashtag, and I have bugs...' style='width: 300px;'></div>").insertBefore(".user-nav");
				$('.hashtagHeader').append("<div class='searchContainer' style='float: right;'><input id='sortTagBtn' type='button' value='Sort tags by...'></div>");
				$('.searchContainer').append("<div class='sortOptions' style='display: none;'></div>");
				getHashtags();

				$("body").on("change", "#hashtag-select", function () {
					console.log($(this).val());
				});

				$("body").on("click", ".h3Tag", displayArticle);

				$('body').keypress(function(e) {
					var key = e.which;
					if (key === 13 && $('#searchTag').is(":focus") == true && $('#searchTag').val() != "") {
						var scrollToView = $('.tag-' + $('#searchTag').val()),
							container = $("html,body");
						container.animate({
							scrollTop: (scrollToView.offset().top)
						}, 500);

						$("body").on("click", ".h3Tag", displayArticle);
						return false;
					}
				});
			}
		} // end view_support_content tag
	}

	function hashTag(currCategoryID, currSectionID) {
		var hashtagList = [];
		$('.article-hashtags').append('<div class="tagList"><a id="hashBtn" style="font-weight: bold;">+</a><input list="recoHashtag" type="text" id="hashTxt" placeholder="Enter a term, keyword or tag..." style="display: none; margin: 0px 7px;"><datalist id="recoHashtag"></datalist></div>');
		$('.article-body.markdown p').append('<div class="hidden-tags hide"><ul></ul></div>');

		$.get('/api/v2/help_center/articles/' + currArticleID + '/labels.json', function(data) {
		
			var hashNum = 1;
			var storage = window["localStorage"];
			var currArticleId = window.location.href.split("?currArticleId=")[1];


			//if UFFA review preview page, override article labels with ones from reviewed article
			if (window.location.href.indexOf("/208223316") > -1 && storage.getItem(HelpCenter.user.email + '-previewLabels' + currArticleId) !== null) {

				var tempar = storage.getItem(HelpCenter.user.email + '-previewLabels' + currArticleId).split(",");

				data.labels = [];

				$.each(tempar, function(i, el) {
					data.labels.push({
						"name": el
					});
				});
			}

			for (var x = 0; x < data.labels.length; x++) {
				if (data.labels[x].name.substr(0, 5) == "Tags:") {
					$('<a class="hashTags" id="hash-' + hashNum + '"><div class="cssCircle minusSign" style="display: none; background: #ff0000;">&#8211;<span class="hide">' + data.labels[x].id + '</span></div><div class="tagName">#' + data.labels[x].name.substr(5) + '</div><span class="hide">' + currCategoryID + '</span></a>').insertAfter('#recoHashtag');
					$('.hidden-tags ul').append('<li>' + data.labels[x].name + '</li>');
					hashNum++;
					hashtagList.push(data.labels[x].name.substr(5).toLowerCase());
				}
			}
		});
		hashComboList(hashtagList);
	} // end of hashTag function

	// The recommend tags to be listed are based on which category and latest date updated articles			
	function hashComboList(hashtagList) {
		// The articles to be grabbed along with their labels are from the 1st page of the json		
		$.get('/api/v2/help_center/categories/' + currCategoryID + '/articles.json?sort_by=updated_at&sort_order=desc', function(data2) {
			var tempList = [];
			for (var x = 0; x < data2.articles.length; x++) {
				for (var y = 0; y < data2.articles[x].label_names.length; y++) {
					if (data2.articles[x].label_names[y].substr(0, 5) == "Tags:") {
						tempList.push(data2.articles[x].label_names[y].substr(5).toLowerCase());
					}
				}
			}

			// List the recommendations tags that are not yet on the article yet
			var tempList = tempList.filter(function(n) {
				return !this.has(n)
			}, new Set(hashtagList));

			// Removes the identical values in the list 
			var updateList = [];
			$.each(tempList, function(i, el) {
				if ($.inArray(el, updateList) == -1) updateList.push(el);
			});

			for (var x = 0; x < updateList.length; x++) {
				$('#recoHashtag').append('<option value="' + updateList[x] + '"/>')
			}
		});
	} // end of hashComboList function

	function displayArticle() {
		var revealArticles = $(this).next(".expandingBlock"),
			listArticles = [];
		if (revealArticles.css("display") == "none") {
			revealArticles.slideDown("fast");
			revealArticles.css("display", "block");
		} else {
			revealArticles.slideUp("fast");
			setTimeout(function() {
				revealArticles.css("display", "none");
			}, 500);
		}
	}

	function removeUnnecessaries() {
		$('.incident-wrapper, article').hide();
	}

	function setUpHTML(){
		$('#main-wrap').append('<section class="hashtag-management"><div class="hashtag-count"></div><div class="hashtag-sorting"><label for="hashtag-select">Sort By: </label><select id="hashtag-select"><option value="1">Alphabet</option><option value="2">Number of Tags</option><option value="3">Latest Update</option></select></div><div><ul class="hashtag-list"></ul></div><div id="add-hashtag-modal" class="modal"><div class="modal-content"><div class="hashtag-modal-header"> <h4>Add hashtag</h4><span class="hashtag-close-modal">&times;</span></div><div class="hashtag-modal-body"> <form> <div> <label>Hashtag</label> <input id="add-hashtag-input" spellcheck="false"> <p></p></div></form> </div><div class="hashtag-modal-footer"> <button id="cancel-add-hashtag"><span>Cancel</span></button> <button id="save-hashtag-button" ><span>OK</span></button> </div></div></div><div id="edit-hashtag-modal" class="modal"> <div class="modal-content"> <div class="hashtag-modal-header"> <h4>Edit hashtag</h4><span class="hashtag-close-modal">&times;</span> </div><div class="hashtag-modal-body"> <form> <div> <label>Hashtag</label> <input id="edit-hashtag-input" spellcheck="false"> <p></p></div></form> </div><div class="hashtag-modal-footer"> <button id="cancel-edit-hashtag"><span>Cancel</span></button> <button id="edit-hashtag-button"><span>OK</span></button> </div></div></div><div id="delete-hashtag-modal" class="modal"> <div class="modal-content"> <div class="hashtag-modal-header"> <h4>Delete hashtag</h4><span class="hashtag-close-modal">&times;</span> </div><div class="hashtag-modal-body"> <form> <h4>Do you want to delete this hashtag?</h4> </form> </div><div class="hashtag-modal-footer"> <button id="cancel-delete-hashtag"><span>Cancel</span></button> <button id="delete-hashtag-button"><span>OK</span></button> </div></div></div></section>');
	}
	// Functions starting here go in a specific order to perform properly
	// 1st
	function getHashtags() {
		$.get("/api/v2/help_center/articles/labels").done(function(data) {
			labelList = data.labels;
			var hashtags = new HashtagCollection();
			setTimeout(function() {
				labelList.forEach(function(label) {
					if (label.name.substr(0, 5) === "Tags:" && label.name !== "Tags:") {
						hashtags.add(label);
					}
				})
				var hashtagView = new HashtagView(hashtags);
				hashtagView.render();
				hashtagView.initEvents();
			}, 2000)

		});
	}

	// 2nd
	function getArticles(hashtag) {
		hashtag = hashtag.replace(/'/g, "");
		if (hashtag !== "") {
			$.get("/api/v2/help_center/articles/search.json?label_names=Tags:" + hashtag, function(data) {
				var articles = data.results,
					articleCount = $('.expanding').find('.tag-' + hashtag);
				articleCount.text(articleCount.text() + " (" + data.count + ")");
				for (var x = 0; x < articles.length; x++) {
					$(".expandingBlock ul.list-" + hashtag).append("<li id='tagNum-" + x + "' style='background: #FAFAFA; overflow: auto;'><div class='tagData' style='float: left;'><a href='" + articles[x].html_url + "'>" + articles[x].name + "</a><span class='hide'>" + articles[x].id + "</span></div></li>");
					getSectCat(articles[x].id, articles[x].section_id, hashtag, x);
				}
			});
		}
	}

	// 3rd
	// directChild is the location of a specific li element
	function getSectCat(articleID, sectionID, hashtag, index) {
		$.get("/api/v2/help_center/sections/" + sectionID + ".json", function(data) {
			var directChild = ".expandingBlock ul.list-" + hashtag + " li#tagNum-" + index;
			$(directChild + " .tagData").append("<div class='sectCatName' style='font-size: 11px; margin-top: 7px;'><a href='" + data.section.html_url + "'>" + data.section.name + "</a></div>");
			$.get("/api/v2/help_center/categories/" + data.section.category_id + ".json", function(data2) {
				$(directChild + " .sectCatName").prepend("<a href='" + data2.category.html_url + "'>" + data2.category.name + "</a> > ");
				getArticleTags(directChild, articleID, index);
			});
		});
	}

	// 4th
	function getArticleTags(directChild, currArticle, index) {
		$('<div class="tagList" style="float: right;"><a id="hashBtn-' + index + '" style="font-weight: bold; font-size: 11px; display: inline-block;">+</a><input list="recoHashtag" type="text" id="hashTxt-' + index + '" placeholder="Enter a term, keyword or tag..." style="display: none; margin: 0px 7px; font-size: 11px; width: 200px;"><datalist id="recoHashtag"></datalist></div>').insertAfter(directChild + " .tagData");
		setTimeout(function() {
			$.get('/api/v2/help_center/articles/' + currArticle + '/labels.json', function(data) {
				var hashNum = 1;
				for (var x = 0; x < data.labels.length; x++) {
					if (data.labels[x].name.substr(0, 5) == "Tags:") {
						$(directChild + " .tagList").append('<a class="hashTags" id="hash-' + hashNum + '" style="font-size: 11px;"><div class="cssCircle minusSignDiff" style="display: none; background: #ff0000;">&#8211;<span class="hide">' + data.labels[x].id + '</span></div><div class="cssCircle editTag" style="display: none; background: #1a75ff;">*<span class="hide">' + data.labels[x].id + '</span></div><div class="tagName">#' + data.labels[x].name.substr(5) + '</div></a>');
						//$('.hidden-tags ul').append('<li>' + data.labels[x].name + '</li>');
						hashNum++;
					}
				}
			});
		}, 500);
	}
	// end of order of functions

	/**
	 * Hold the article presentation logic
	 * @param {ArticleCollection} articleCollection - where we manage our articles
	 * @constructor
	 */
	var ArticlesView = function(articleCollection) {
		this.articleCollection = articleCollection;
	};

	/**
	 * Init DOM events
	 */
	ArticlesView.prototype.initEvents = function() {

	}

	/**
	 * Represent a collection of Article objects
	 *
	 * @constructor
	 */
	var ArticleCollection = function() {
		// Here we store the Article objects
		this.articles = [];
	};

	/**
	 * Add a Article
	 *
	 * @param {Article} article
	 */
	ArticleCollection.prototype.add = function(article) {
		this.articles.push(article);
	};

	/**
	 * Add a collection of Article
	 *
	 * @param {ArticlleCollection} articles
	 */
	ArticleCollection.prototype.addArticles = function(articles) {
		this.articles = this.articles.concat(articles);
	};

	/**
	 * Get all Article
	 *
	 * @returns {Array}
	 */
	ArticleCollection.prototype.getAll = function() {
		return this.articles;
	};



	/**
	 * Hold the hashtag presentation logic
	 *
	 * @param {HashtagCollection} hashtagCollection - where we manage our hashtag
	 * @constructor
	 */
	var HashtagView = function(hashtagCollection) {
		this.hashtagCollection = hashtagCollection;
	};

	/**
	 * Init DOM events
	 */
	HashtagView.prototype.initEvents = function() {
		// Handle hashtag dropdown
		$('.hashtag').on('click', function() {
			var currentHashtag = $(this);
			currentHashtag.attr('disabled', 'disabled');
			var currentList = $(this).parent();
			var hashtagName = $(this).attr('data-name');
			if (currentList.find('table').is(":visible")) {
				currentList.find('div').slideUp();
				currentList.children('i').addClass("fa-caret-right").removeClass("fa-caret-down");
			} else if (currentList.find('table').length) {
				currentList.find('div').slideDown();
				currentList.children('i').removeClass("fa-caret-right").addClass("fa-caret-down");
			} else {
				$.get('/api/v2/help_center/articles/search.json?label_names=Tags:' + hashtagName).done(function(data) {
					var articles = data.results;
					var html = "<table><tr><th>Article Title</th><th>Tags</th></tr>";
					articles.forEach(function(data) {
						var hasHashtag = false;
						var hashtags = "";
						data.label_names.forEach(function(label) {
							if (label.substr(0, 5) === "Tags:") {
								hasHashtag = true;
								hashtags += '<div class="hashtag-container"><a class="article-label"><i class="fa fa-ellipsis-v hashtag-actions" aria-hidden="true"></i><span>#' + label.substr(5) + '</span></a></div>';
							}
						})
						if (hasHashtag) {
							html += '<tr id="' + data.id + '"><td><a href="/hc/en-us/articles/' + data.id + '">' + data.name + '</a></td><td><a class="add-hashtag-button"><i class="fa fa-plus" aria-hidden="true">New</i></a>' + hashtags + '</td></tr>';
						}
					})
					html += '</table';
					currentList.children('i').removeClass("fa-caret-right").addClass("fa-caret-down");
					currentList.children('div').append(html).slideDown();
					currentHashtag.removeAttr('disabled');
					// Get the modal
					var modal = document.getElementById('add-hashtag-modal');
					//get the <span> element that closes the modal
					var span = document.getElementsByClassName('hashtag-close-modal')[0];
					//get the <button> element that closes the modal
					var cancelAddHashtag = document.getElementById('cancel-add-hashtag');
					//get the <button> element that save the new hashtag
					var saveHashtagButton = document.getElementById('save-hashtag-button');
					var parentArticleID;
					//Handle add hashtag button
					$('.add-hashtag-button').on('click', function() {
						modal.style.display = "block";
						parentArticleID = $(this).closest('tr').attr('id');
					})

					// When the user clicks on <span> (x), close the modal
					span.onclick = function() {
						modal.style.display = "none";
					}

					//when user click the cancel button in delete-modal close the modal
					$('.hashtag-close-modal, #cancel-delete-hashtag').on('click', function() {
						document.getElementById('delete-hashtag-modal').style.display = "none";
					})

					//when user click the cancel button in edit-modal close the modal
					$('.hashtag-close-modal, #cancel-edit-hashtag').on('click', function() {
						document.getElementById('edit-hashtag-modal').style.display = "none";
					})

					// When the user clicks the cancel button, close the modal
					cancelAddHashtag.onclick = function() {
						modal.style.display = "none";
					}

					// When the user clicks the ok button, create new hashtag via api
					saveHashtagButton.onclick = function() {
						var newHashtag = document.getElementById('add-hashtag-input').value;
						createHashtag(parentArticleID, newHashtag).done(function(){
							document.getElementById('add-hashtag-modal').style.display = "none";
							$('.add-hashtag-button').parent().append('<a class="article-label"><i class="fa fa-ellipsis-v hashtag-actions" aria-hidden="true"></i><span>#' + newHashtag + '</span></a>');
						})
					}

					// When the user clicks anywhere outside of the modal, close it
					window.onclick = function(event) {
						if (event.target == modal) {
							modal.style.display = "none";
						}
						if (event.target == document.getElementById('delete-hashtag-modal')) {
							document.getElementById('delete-hashtag-modal').style.display = "none";
						}
						if (event.target == document.getElementById('edit-hashtag-modal')) {
							document.getElementById('edit-hashtag-modal').style.display = "none";
						}
					}

					//when user click the vertical-ellipsis icon display hashtag options
					$('.hashtag-actions').on('click', function() {
						var $currentHashtag = $(this);
						var currentArticleID = $currentHashtag.closest('tr').attr('id');
						var hashTagName = $currentHashtag.parent().text().substr(1); 
						if ($(this).parent().parent().find('.hastag-actions-container').is(':visible')){
							$(this).parent().parent().find('.hastag-actions-container').remove();
							$(this).css({
								"color": "#ffffff",
								"background": "#4986e7"
							});
						} else {
							$('.hastag-actions-container').remove();
							$('.hashtag-actions').css({
								"color": "#ffffff",
								"background": "#4986e7"
							});
							$(this).css({
								"color": "#2e64f8",
								"background": "#ffffff"
							});
							$(this).parent().parent().append('<div class="hastag-actions-container" role="menu"><button id="edit-hashtag-option">Edit</button><br><button id="delete-hashtag-option" >Delete</button><div>');

							//when the use click the delete option in hashtag close options then show delete modal
							$('#delete-hashtag-option').on('click', function() {
								$currentHashtag.css({
									"color": "#ffffff",
									"background": "#4986e7"
								});
								$('.hastag-actions-container').remove();
								$('#delete-hashtag-modal').css("display", "block");
							})

							// When the user clicks ok button in delete modal, save delete hashtag via api
							$('#delete-hashtag-button').on('click', function() {
								var hashTagID;
								$.get('/api/v2/help_center/articles/' + currentArticleID + '/labels.json').done(function(data) {
									for (var i = 0, len = data.labels.length; i < len; i++) {
										if (hashTagName === data.labels[i].name.substr(5)) {
											hashTagID = data.labels[i].id;
											break;
										}
									}
									deleteHashtag(hashTagID, currentArticleID).done(function() {
										document.getElementById('delete-hashtag-modal').style.display = "none";
										$currentHashtag.parent().remove();
									})
								})
							})

							//when user click the edit option in hashtag options dropdown
							$('#edit-hashtag-option').on('click', function() {
								$currentHashtag.css({
									"color": "#ffffff",
									"background": "#4986e7"
								});
								$('.hastag-actions-container').remove();
								var editModal = document.getElementById('edit-hashtag-modal');
								editModal.style.display = "block";
								$(editModal).find('input').val(hashTagName);
							})

							//when user click the ok button in edit-modal save hashtag via api and add dom
							$('#edit-hashtag-button').on('click', function() {
								var editModal = document.getElementById('edit-hashtag-modal');
								var hashTag = $(editModal).find('input').val();
								var hashTagID;
								$.ajax({
									url: '/api/v2/help_center/articles/' + currentArticleID + '/labels.json',
									type: 'POST',
									data: {
										"label": {
											"name": "Tags:" + hashTag
										}
									}
								}).done(function() {
									$.get('/api/v2/help_center/articles/' + currentArticleID + '/labels.json').done(function(data) {
										for (var i = 0, len = data.labels.length; i < len; i++) {
											if (hashTagName === data.labels[i].name.substr(5)) {
												hashTagID = data.labels[i].id;
												break;
											}
										}
										deleteHashtag(hashTagID, currentArticleID).done(function() {
											document.getElementById('edit-hashtag-modal').style.display = "none";
											$currentHashtag.parent().find('span').text(hashTag);
										})
									})
								})
							})
						}
					})
					//When user hover hashtag options icon
					$('.hashtag-actions').mouseenter(function() {
						$(this).css({
							"color": "#2e64f8",
							"background": "#ffffff"
						}).mouseleave(function() {
							if (!$(this).parent().parent().find('.hastag-actions-container').is(':visible')) {
								$(this).css({
									"color": "#ffffff",
									"background": "#4986e7"
								});
							}
						})
					})
				})
			}
		});
	};

	/**
	 * Add a Hashtag in article using API
	 *
	 * @param {int} articleID - ID of article where hashtag to be added
	 * @param {String} hashtagName - name of the hashtag to be added
	 */
	function createHashtag(articleID, hashtagName) {
		return $.ajax({
			url: '/api/v2/help_center/articles/' + articleID + '/labels.json',
			type: 'POST',
			data: {
				"label": {
					"name": "Tags:" + hashtagName
				}
			}
		})
	}

	function deleteHashtag(tagID, articleID) {
		return $.ajax({
			url: '/api/v2/help_center/articles/' + articleID + '/labels/' + tagID + '.json',
			type: "DELETE"
		})
	}



	HashtagView.prototype.render = function() {
		var hashtagList = [];
		var hashtagSet = [];
		var html = "";
		this.hashtagCollection.hashtags.forEach(function(item) {
			hashtagList.push(item.name.substr(5).toLowerCase());
			if ($.inArray(item, hashtagSet) == -1) hashtagSet.push(item.name.substr(5));
		})
		hashtagSet.sort();
		labelList.forEach(function (labelTag) {
		})
		hashtagSet.forEach(function(hashtag) {
			var counter = 0;

			html += '<li id="' + hashtag + '"><i class="fa fa-caret-right" aria-hidden="true"></i><a data-name="' + hashtag + '" class="hashtag">#' + hashtag + '</a><span class="label label-inverse">' + counter + '</span><div></div></li>';
		});
		$('.hashtag-count').append('<label>Hashtag Count: ' + hashtagList.length + '</label>');
		$('.hashtag-list').append(html);
	}



	/**
	 * Represent a collection of Hashtag objects
	 *
	 * @constructor
	 */
	var HashtagCollection = function() {
		// Here we store the Hashtag objectss
		this.hashtags = [];
	};
	/**
	 * Add a Hashtag
	 *
	 * @param {Object} hashtag
	 */
	HashtagCollection.prototype.add = function(hashtag) {
		this.hashtags.push(hashtag);
	};
	HashtagCollection.prototype.addHashtags = function(hashtags) {
		this.hashtags = this.hashtags.concat(hashtags);
	}
})