// Hashtag Feature
// Author: Lawrence C. Bonilla
// Ver 1.02
// Most of the css here are under messageBoardStyle.css
$(document).ready(function() {
    var currentUser = HelpCenter.user.role;
    var articleURL = window.location.href.split("--")[0];
    var hashtagAdminURL = "https://support.sizmek.com/hc/en-us/articles/360004850231-Hashtag-Management";
    var allHashtag = [],
        currentArticleID,
        hashtagsArticles = [],
        hashTagName,
        hashTagCounter = 0;
    if (jQuery.inArray("view_support_content", HelpCenter.user.tags) !== -1) {
        $("#user-menu").append("<a id='hashAdmin' role='menuitem' href='" + hashtagAdminURL + "'>Hashtag Management</a>");
    }

    if (window.location.href.indexOf("/articles/") > -1 && currentUser != "end_user" && currentUser != "anonymous") {
        var currArticleID = window.location.href.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0],
            currCategoryID,
            currSectionID;
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
                removeUnnecessaries();
                setUpHTML();
                $('<div class="hashtagHeader"></div>').insertAfter(".article-info");
                $('<div class="hashtagList body"></div>').insertAfter(".hashtagHeader");
                $('.hashtagHeader').append("<div class='searchContainer' style='float: right;'><input id='sortTagBtn' type='button' value='Sort tags by...'></div>");
                $('.searchContainer').append("<div class='sortOptions' style='display: none;'></div>");
                getHashtags();
                document.getElementById('hashtag-select').addEventListener("change", function() {
                    sortHashtag(this.value);
                })

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

    //function used in sorting hashtag alphabetically
    function compare(a, b) {
        if (a.name.substr(5).toLowerCase() < b.name.substr(5).toLowerCase())
            return -1;
        if (a.name.substr(5).toLowerCase() > b.name.substr(5).toLowerCase())
            return 1;
        return 0;
    }

    //function used in sorting hashtag alphabetically if count is already pulled
    function compare2(a, b) {
        if (a.hashtag.name.substr(5).toLowerCase() < b.hashtag.name.substr(5).toLowerCase())
            return -1;
        if (a.hashtag.name.substr(5).toLowerCase() > b.hashtag.name.substr(5).toLowerCase())
            return 1;
        return 0;
    }

    //sort the hashtag according to the selectd sorting option
    function sortHashtag(value) {
        if (hashtagsArticles.length) {
            var hashtagList = hashtagsArticles.slice(0);
        } else {
            var hashtagList = allHashtag.slice(0);
        }
        if (value == 1) {
            updateDOM();
            addHashtagEventListener();
        } else if (value == 2) {
            if (hashtagsArticles.length){
                hashtagList.sort(compare2);
            }else{
                hashtagList.sort(compare);
            }
            updateDOM();
            addHashtagEventListener();
        } else if (value == 3) {
            if (hashtagsArticles.length) {
                hashtagList = hashtagsArticles.slice(0);
                hashtagList.sort(function(a, b) {
                    return a.articlesCount - b.articlesCount;
                });
                hashtagList.reverse();
                updateDOM();
                addHashtagEventListener();
            } else {
                getHashtagArticles(true);
            }
        }

        //update the Hashtag list according to the selected sorting option
        function updateDOM() {
            var ul = document.getElementsByClassName("hashtag-list");
            var html = '';
            var hasCount = false;
            ul[0].innerHTML = "";
                hashtagList.forEach(function(label) {
                    if (hashtagsArticles.length) {
                        var cleanHashTag = label.hashtag.name.substr(5);
                    }else{
                        var cleanHashTag = label.name.substr(5);
                    }
                    var count = 0;
                    if (label.articlesCount) {
                        count = label.articlesCount;
                        hasCount = true;
                    }
                    html += '<li id="' + cleanHashTag + '"><i class="fa fa-caret-right" aria-hidden="true"></i><a data-name="' + cleanHashTag + '" class="hashtag">#' + cleanHashTag + '</a><a><span class="label label-inverse">' + count + '</span></a><div></div></li>';
                })
            $('#number-hashtags').text(allHashtag.length);
            $('.hashtag-list').append(html);
            if (hasCount) {
                $('.hashtag-list .label').css('display', 'inline-block');
            }
        }
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
        $('.incident-wrapper, article, #query').hide();
    }

    function setUpHTML() {
        $('#main-wrap').append('<section class="hashtag-management"> <div class="hashtag-count-container"> <div class="hashtag-count-icon"><i class="fa fa-tags" aria-hidden="true"></i></div><div class="hashtag-count"> <div><label id="number-hashtags"></label></div><div><label class="hashtag-label">Number of Hashtags</label></div></div></div><div class="hashtag-num-articles"><button id="show-hashtag-articles">Show Count<i class="fa fa-spinner"></i></button></div><div class="hashtag-sorting"> <select id="hashtag-select"> <option value="1">Latest Update</option> <option value="2">Alphabet</option> <option value="3">Number of Tags</option> </select> </div><div class="main-hashtagList-container"> <ul class="hashtag-list"></ul> </div><div id="add-hashtag-modal" class="modal"> <div class="modal-content"> <div class="hashtag-modal-header"> <h4>Add hashtag</h4><span class="hashtag-close-modal">&times;</span> </div><div class="hashtag-modal-body"> <form> <div> <label>Hashtag</label> <input id="add-hashtag-input" spellcheck="false"> <p></p></div></form> </div><div class="hashtag-modal-footer"> <button id="cancel-add-hashtag"> <span>Cancel</span></button> <button id="save-hashtag-button"><span>OK</span></button> </div></div></div><div id="edit-hashtag-modal" class="modal"> <div class="modal-content"> <div class="hashtag-modal-header"> <h4>Edit hashtag</h4><span class="hashtag-close-modal">&times;</span> </div><div class="hashtag-modal-body"> <form> <div> <label>Hashtag</label> <input id="edit-hashtag-input" spellcheck="false"> <p></p></div></form> </div><div class="hashtag-modal-footer"> <button id="cancel-edit-hashtag"><span>Cancel</span></button> <button id="edit-hashtag-button"><span>OK</span></button> </div></div></div><div id="delete-hashtag-modal" class="modal"> <div class="modal-content"> <div class="hashtag-modal-header"> <h4>Delete hashtag</h4><span class="hashtag-close-modal">&times;</span> </div><div class="hashtag-modal-body"> <form> <h4>Do you want to delete this hashtag?</h4> </form> </div><div class="hashtag-modal-footer"> <button id="cancel-delete-hashtag"><span>Cancel</span></button> <button id="delete-hashtag-button"><span>OK</span></button> </div></div></div></section>');
    }

    // Functions starting here go in a specific order to perform properly
    // 1st
    function getHashtags() {
        $.get("/api/v2/help_center/articles/labels").done(function(data) {
            var counter = 0;
            var html = '';
            data.labels.forEach(function(label) {
                var hashTag = label.name;
                if (hashTag.substr(0, 5) === "Tags:" && hashTag !== "Tags:") {
                    allHashtag.push(label);
                    counter++;
                    var cleanHashTag = hashTag.substr(5);
                    html += '<li id="' + cleanHashTag + '"><i class="fa fa-caret-right" aria-hidden="true"></i><a data-name="' + cleanHashTag + '" class="hashtag">#' + cleanHashTag + '</a><a><span class="label label-inverse">0</span></a><div></div></li>';
                }
            })
            $('#number-hashtags').text(counter);
            $('.hashtag-list').append(html);
            allHashtaglen = allHashtag.length;
            addHashtagEventListener();
            //when user click the show count button
            $('#show-hashtag-articles').on('click', function() {
                var spinner = $(this).children('i');
                spinner.css('display', 'inline-block').toggleClass('fa-spin');
                $('#hashtag-select').parent().css('margin-right', '-110px')
                $(this).css('pointer-events', 'none');
                if (hashtagsArticles.length) {
                    $('.hashtag-list .label-inverse').css('display', 'inline-block');
                    $(this).css('pointer-events', 'auto');
                    spinner.hide();
                } else {
                    getHashtagArticles(false);
                }
            })
        });
    }

    function getHashtagArticles(isSort){
        var hashtag_name = allHashtag[hashTagCounter].name;
        $.ajax({
            url:"/api/v2/help_center/articles/search.json?label_names="+ hashtag_name + "&per_page=100",
            async:true,
            dataType:'jsonp'
        }).done(function(data){
            var allArticles = data.results;
            var nextPage = data.next_page;
            var accurateCount = 0;
            if(data.count < 100){
                if(data.count === 1){
                    accurateCount = 1;
                    $('#'+hashtag_name.substr(5)).find('.label-inverse').text('1').css('display','inline-block');
                }else{
                    allArticles.forEach(function(article){
                        if(article.label_names.includes(hashtag_name))accurateCount++;
                    })
                    $('#'+hashtag_name.substr(5)).find('.label-inverse').text(accurateCount).css('display','inline-block');
                }
                callBack();
            }else if(nextPage){
                getNextPage();
                function getNextPage(){
                    $.ajax({
                        url:nextPage,
                        async:true,
                        dataType:'jsonp'
                    }).done(function(nextPageData){
                        nextPage = nextPageData.next_page;
                        allArticles = allArticles.concat(nextPageData.results);
                        if(nextPage){
                            getNextPage();
                        }else{
                            allArticles.forEach(function(article){
                                if(article.label_names.includes(hashtag_name))accurateCount++;
                            })
                            $('#'+hashtag_name.substr(5)).find('.label-inverse').text(accurateCount).css('display','inline-block');
                            callBack();
                        }
                    })
                }
            }
            

            function callBack(){
                hashtagsArticles.push({"hashtag":allHashtag[hashTagCounter], "articlesCount":accurateCount, "hashtagData":allArticles})
                hashTagCounter++;
                if(hashTagCounter < allHashtaglen){
                    getHashtagArticles();
                }else{
                    if(isSort){
                        sortHashtag(3);
                    }
                    $('#show-hashtag-articles').children('i').hide();
                    $('#hashtag-select').parent().css('margin-right', '-140px')
                }
            }
            
        })
    }
    function addHashtagEventListener() {
        // Handle hashtag dropdown
        $('.hashtag').on('click', function() {
            var currentHashtag = $(this);
            var currentList = currentHashtag.parent();
            var hashtagName = currentHashtag.attr('data-name');
            if (currentList.find('table').is(":visible")) {
                currentList.find('div').slideUp();
                currentList.children('i').addClass("fa-caret-right").removeClass("fa-caret-down");
            } else if (currentList.find('table').length) {
                currentList.find('div').slideDown();
                currentList.children('i').removeClass("fa-caret-right").addClass("fa-caret-down");
            } else {
                currentHashtag.css('pointer-events', 'none');
                $.get('/api/v2/help_center/articles/search.json?label_names=Tags:' + hashtagName +'&per_page=100').done(function(data) {
                    var articles = data.results;
                    var html = "<table><tr><th>Article Title</th><th></th><th>Tags</th></tr>";
                    articles.forEach(function(data) {
                        if(data.label_names.includes('Tags:'+hashtagName)){
                            var hasHashtag = false;
                            var hashtags = "";
                            data.label_names.forEach(function(label) {
                                if (label.substr(0, 5) === "Tags:") {
                                    hasHashtag = true;
                                    hashtags += '<div class="hashtag-container"><a class="article-label"><i class="fa fa-pencil edit-hashtag-option" aria-hidden="true"></i><span>#' + label.substr(5) + '</span><i class="fa fa-trash delete-hashtag-option" aria-hidden="true"></i></a></div>';
                                }
                            })
                            if (hasHashtag) {
                                html += '<tr id="' + data.id + '"><td><a href="/hc/en-us/articles/' + data.id + '">' + data.name + '</a></td><td><a class="add-hashtag-button"><i class="fa fa-plus" aria-hidden="true">New</i></a></td><td>' + hashtags + '</td></tr>';
                            }
                        }
                    })
                    html += '</table';
                    currentList.children('i').removeClass("fa-caret-right").addClass("fa-caret-down");
                    currentList.children('div').append(html).slideDown();
                    currentHashtag.css('pointer-events', 'auto');
                    var hashtagDOM;// Get the modal
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
                        createHashtag(parentArticleID, newHashtag).done(function() {
                            document.getElementById('add-hashtag-modal').style.display = "none";
                            setTimeout(function() {
                                location.reload();
                            }, 100)
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

                    //when the use click the delete option in hashtag close options then show delete modal
                    $('.delete-hashtag-option').on('click', function() {
                        $('#delete-hashtag-modal').css("display", "block");
                        currentArticleID = $(this).closest('tr').attr('id');
                        hashTagName = $(this).parent().children('span').text().substr(1);
                        hashtagDOM = $(this).parent();
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
                            deleteHashtag(currentArticleID, hashTagID).done(function() {
                                document.getElementById('delete-hashtag-modal').style.display = "none";
                                hashtagDOM.remove();
                            })
                        })
                    })

                    //when user click the edit option in hashtag options dropdown
                    $('.edit-hashtag-option').on('click', function() {
                        hashTagName = $(this).parent().children('span').text().substr(1);
                        var editModal = document.getElementById('edit-hashtag-modal');
                        editModal.style.display = "block";
                        currentArticleID = $(this).closest('tr').attr('id');
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
                                deleteHashtag(currentArticleID, hashTagID).done(function() {
                                    document.getElementById('edit-hashtag-modal').style.display = "none";
                                    location.reload();
                                })
                            })
                        })
                    })

                })
            }
        });
    }

    //add hashtag using api
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

    //delete hashtag using api
    function deleteHashtag(articleID, tagID) {
        return $.ajax({
            url: '/api/v2/help_center/articles/' + articleID + '/labels/' + tagID + '.json',
            type: "DELETE"
        })
    }
})