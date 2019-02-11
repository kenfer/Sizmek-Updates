// Menu Management
// Author: Jomar Q. Edaño
// Ver 1.01
// Most of the css here are under messageBoardStyle.css
$(document).ready(function() {
    var addNew = '<li class="addNew"><a class="addNewButton">+ ADD</a></li>';
    menuObj = {},
        menuCopy = "",
        currentItems = [],
        $mainWrapper = $('#main-wrap'),
        dropdownValue = '',
        editChildren = [],
        lastModifiedParent = '',
        articles = [],
        sections = [],
        sectionsFirstIndex = 0,
        sectionsLastIndex = 0,
        articlesChangeLOC = [],
        articleUpdate = false,
        oldIndex = 0,
        newIndex = 0,
        sectionsToHide = [],
        sectionsToShow = [],
        articlesToHide = [],
        articlesToShow = [];

    if (jQuery.inArray("view_support_content", HelpCenter.user.tags) !== -1) {
        $("#user-menu").append("<a id='menuAdmin' role='menuitem' href='/hc/en-us/articles/" + menuManagementPage + "'>Menu Management</a>");
    }

    //Main flow
    if (window.location.href.indexOf(menuManagementPage) > -1) { //if on menu admin page
        $('form').remove();
        $('.incident-wrapper').remove();
        $mainWrapper = $('#main-wrap');
        $mainWrapper.append('<button id="save-changes" type="button" class="btn btn-primary" disabled>Save</button>');
        instantiateMenuObject();
        //when product drop down is change
        $('body').on('change', '#products', function() {
            updateItems();
            disableSelect();
        });

        //when collapse icon is click
        $('body').on('click', '.menuManagement .fa.fa-angle-right, .menuManagement .fa.fa-angle-down', function() {
            var $currentLI = $(this).parent();
            var currentUL = $currentLI.children('ul');
            $currentLI.css('background-color', 'white');
            if (currentUL.children().length) {
                if (currentUL.is(':visible')) {
                    currentUL.slideUp().css('display', 'none');
                    changeITagClass(true);
                } else {
                    currentUL.slideDown().css('display', 'block');
                    changeITagClass(false);
                }
            } else if ($currentLI.children('.type').val() === 'category') { //if list type is category
                populateSections($currentLI);
                disableSelect();
                changeITagClass(false);
                currentUL.slideDown('fast').css('display', 'block');
            } else if ($currentLI.children('.type').val() === 'section') {
                populateArticle($currentLI);
                changeITagClass(false);
                currentUL.slideDown('fast').css('display', 'block');
            } else if ($currentLI.children('.type').val() === 'article') {
                changeITagClass(false);
                var label = $currentLI.next('.label').text();
                if ($currentLI.parent().children('li.article').css('display') === 'block') {
                    $currentLI.parent().children('li.article').slideDown().css('display', 'none');
                } else {
                    $currentLI.parent().children('li.article').slideDown().css('display', 'block');
                }
            }

            function changeITagClass(isRight) {
                isRight ? $currentLI.children('i.fa-angle-down').toggleClass("fa-angle-right").toggleClass("fa-angle-down") : $currentLI.children('i.fa-angle-right').toggleClass("fa-angle-right").toggleClass("fa-angle-down");
            }
        });
        $('body').on('click', 'a.addNewButton', function() {
            addDropdownButton($(this));
            addInput('text', $(this).parent())
            $(this).remove();
        });
        $('body').on('click', 'a.add-child-button', function() {
            addDropdownButton($(this));
            addInput('category', $(this).parent());
            $(this).parent().children('.saveButton').attr('class', 'save-child-button');
            $(this).parent().children('.cancelButton').attr('class', 'cancel-child-button');
            $(this).parent().children('.type')[0][0].remove();
            $(this).remove();
        });

        function addDropdownButton(currentElement) {
            var elements = '' + '<select class="type" style="background-color: #ffffff;">' + '<option value="text">Text</option>' + '<option value="category">Category</option>' + '<option value=section>Section</option>' + '<option value="custom">Custom</option>' + '</select>' + '<select class="visibility" style="background-color: #ffffff;">' + '<option value="1">Visible to everyone</option>' + '<option value="2">Agents and Manager</option>' + '<option value="3">Signed-in users</option>' + '<option value="4">User Segment:</option>' + '</select>' + '<a class="saveButton" style="display:inline;" title="Save"><i class="fa fa-check" style="font-size: 20px;"></i></a>' + '<a class="cancelButton" title="Cancel"><i class="fa fa-times" style="font-size: 20px;"></i></a>';
            currentElement.parent().append(elements);
        }

        $('body').on('click', 'a.cancelButton', function() {

            $(this).parent().append('<a class="addNewButton">+ ADD</a>');
            $(this).parent().children('input, a.save-child-button,a.saveButton,a.cancelButton, select, .select2').remove();
        });
        $('body').on('click', 'a.cancel-child-button', function() {
            $(this).parent().append('<a class="add-child-button">+ ADD</a>');
            $(this).parent().children('input, a.save-child-button,a.cancel-child-button, select, .select2').remove();
        });
        $('body').on('change', 'li.addNew select.type', function() {
            addInput($(this).find(':selected').val(), $(this).parent());
        });
        $('body').on('click', '.menuManagement .saveButton', function() {
            var $parentList = $(this).parent();
            if (confirm("Save " + $parentList.children('.type').val() + " ?")) {
                var newParent = iniatializeNewObject($parentList, currentItems.length - 1);
                currentItems.splice(currentItems.length - 1, 0, newParent);
                $parentList.append('<a class="addNewButton">+ ADD</a>');
                $parentList.children('input,a.saveButton,a.cancelButton, select, .select2').remove();
                $('<li id="' + newParent.id + '"><i class="fas fa-grip-vertical ui-sortable-handle"></i><i class="fa fa-angle-right" style="font-size: 16px;"></i><div class="item-name"><a class="categoryDrop " target="_blank">' + newParent.title + '</a></div><select class="type" id="64fe707b-54cf-4ecc-ab4c-82e14651007a" disabled="disabled"><option value="text">Text</option><option value="category">Category</option><option value="section">Section</option><option value="custom">Custom</option></select><a class="parent-visibility" title="Hide"><i class="fa fa-eye" style="font-size: 20px;"></i></a><a class="editButton" title="Edit"><i class="fas fa-pen" style="font-size: 20px;"></i></a><a class="deleteButton" title="Delete"><i class="fa fa-trash" style="font-size: 20px;"></i></a><a class="editSaveButton" title="Save"><i class="fa fa-check" style="font-size: 20px;"></i></a><a class="editCancelButton" title="Cancel"><i class="fa fa-times" style="font-size: 20px;"></i></a><ul style="display:none;"><li class="addNew"><a class="add-child-button">+ ADD</a></li></ul></li>').insertBefore($("#mainUL").children().last());
                $('#' + newParent.id).children('select').val(newParent.type);
                $('#' + newParent.id).children('i, a').css({ 'pointer-events': 'none' })
                document.getElementById(newParent.id).title = "Save First To Perform Actions"
                instantiateCurrentObject();
                updateSaveButton();
            }
        });
        $('body').on('click', '.menuManagement .save-child-button', function() {
            var $parentItem = $(this).parent();
            if (confirm("Save " + $parentItem.children('select.type').val() + "?")) {
                var childIndex = $parentItem.parent().parent().index();
                var newChild = iniatializeNewObject($parentItem, currentItems[childIndex - 1].children.length);
                currentItems[childIndex - 1].children.push(newChild);
                lastModifiedParent = $parentItem.parent().parent().attr('id');
                $parentItem.append('<a class="add-child-button">+ ADD</a>');
                $parentItem.children('input, a.save-child-button,a.cancel-child-button, select, .select2').remove();
                $('<li id="' + newChild.id + '"><i class="fas fa-grip-vertical ui-sortable-handle"></i><i class="fa fa-angle-right" style="font-size: 16px;"></i><div class="item-name"><a class="categoryDrop link-zendesk" href="/hc/admin/categories/200363119/edit" target="_blank">' + newChild.title + '</a></div><select class="type" disabled="disabled"><option value="category">Category</option><option value="text">Text</option><option value="section">Section</option><option value="custom">Custom</option></select><a class="child-visibility" title="Hide"><i class="fa fa-eye" style="font-size: 20px;"></i></a><a class="edit-child-button" title="Edit"><i class="fas fa-pen" style="font-size: 20px;"></i></a><a class="delete-child-button" title="Delete"><i class="fa fa-trash" style="font-size: 20px;"></i></a><a class="edit-save-child" title="Save"><i class="fa fa-check" style="font-size: 20px;"></i></a><a class="cancel-edit-child" title="Cancel"><i class="fa fa-times" style="font-size: 20px;"></i></a></li>').insertBefore($parentItem.parent().children().last())
                $('#' + newChild.id).children('select').val(newChild.type);
                $('#' + newChild.id).find('i, a').css({ 'pointer-events': 'none' })
                document.getElementById(newChild.id).title = "Save First To Perform Actions"
                instantiateCurrentObject();
                updateSaveButton();
            }
        });
        $('body').on('click', '.menuManagement .editButton', function() {
            var $editParent = $(this).parent();
            $editParent.children('.item-name, .fa').css('display', 'none');
            $editParent.children('.type').toggleClass('currentSelect');
            $editParent.children('select').removeAttr('disabled').css('background-color', '#ffffff');
            dropdownValue = $editParent.children('select.type').val();
            addInput($editParent.children('select.type').find(':selected').text().toLowerCase(), $editParent);
            $editParent.children('a.editButton, a.deleteButton').css('display', 'none');
            $editParent.children('a.editSaveButton, a.editCancelButton').css('display', 'inline');
        });
        //when type dropdown is change
        $('body').on('change', '.menuManagement .currentSelect', function() {
            addInput($(this).find(':selected').text().toLowerCase(), $(this).parent());
        });
        //when save button is click after editing
        $('body').on('click', '.menuManagement .editSaveButton', function() {
            if (confirm("Edit " + $(this).parent().children('select.type').val() + " ?")) {
                var currentItemsLength = currentItems.length;
                var isNotFound = true;
                var newObject = {};
                var $parent = $(this).parent();
                var id = $parent.attr('id');
                for (var i = 0; isNotFound && i < currentItemsLength; i++) {
                    if (currentItems[i].id == id) {
                        editChildren = currentItems[i].children;
                        newObject = iniatializeNewObject($parent, i);
                        currentItems[i] = newObject;
                        instantiateCurrentObject();
                        updateSaveButton();
                        cancelEdit($parent);
                        $parent.attr({ id: newObject.id, title: 'Save First To Perform Actions' })
                        $parent.children('select').attr('id', newObject.id).val(newObject.type)
                        $parent.children('.item-name').children('a').text(newObject.title);
                        $parent.children('i, a').css({ "pointer-events": "none" });
                        isNotFound = false;
                    }
                }
                $(this).parent().children('select').attr('disabled', 'disabled');
            }
        });
        //cancel button while editing is click
        $('body').on('click', '.menuManagement .editCancelButton', function() {
            cancelEdit($(this).parent());
        })

        function cancelEdit(list) {
            var $currentParent = list;

            $currentParent.children('.select2').remove();
            $currentParent.children('select.type').toggleClass('currentSelect');
            $currentParent.children('input, #sectionDropdown, #categoryDropdown').remove();
            $currentParent.children('.item-name, .fa').css('display', 'block');
            $currentParent.children('select.type').val(dropdownValue);
            $currentParent.children('select').css('background-color', '#e0e0e0').attr('disabled', 'disabled');
            $currentParent.children('.editSaveButton, .editCancelButton').css('display', 'none');
            $currentParent.children('.editButton, .deleteButton').css('display', 'inline');
        }
        //delete button is clicked
        $('body').on('click', '.menuManagement .deleteButton', function() {
                if (confirm("Delete " + $(this).parent().children('.type').val() + "?")) {
                    var itemID = $(this).parent().attr('id');
                    var isnotRemove = true;
                    for (var i = 0; i < currentItems.length && isnotRemove; i++) {
                        if (itemID == currentItems[i].id) {
                            currentItems.splice(i, 1);
                            instantiateCurrentObject();
                            updateSaveButton();
                            $('#mainUL #' + itemID).remove();
                            isnotRemove = false;
                        }
                    }
                }
            })
            //delete button in a child item is click
        $('body').on('click', '.delete-child-button', function() {
            var $parentItem = $(this).parent();
            if (confirm("Delete " + $parentItem.children('select.type').val() + "?")) {
                deleteChild($(this).parent());
                lastModifiedParent = $parentItem.parent().parent().attr('id');
                instantiateCurrentObject();
                updateSaveButton();
                $(this).parent().remove();
            }
        });
        //edit button in a child item is click
        $('body').on('click', '.edit-child-button', function() {
            var $editParent = $(this).parent();
            var index = $editParent.parent().parent().index() - 1;

            $editParent.css('height', '40px');
            currentItems[index].children[$editParent.index() - 1].checkItem = true;
            $editParent.children('label.toggle-text').css('display', 'inline').show();
            $editParent.children('.item-name, .fa').css('display', 'none');
            $editParent.children('.type').toggleClass('currentSelect');

            $('input[type="checkbox"]').click(function() {
                if ($(this).prop("checked") == true) {
                    currentItems[index].children[$editParent.index() - 1].checkItem = true;
                    updateSaveButton();
                } else if ($(this).prop("checked") == false) {
                    currentItems[index].children[$editParent.index() - 1].checkItem = false;
                    updateSaveButton();
                }
            });

            $editParent.children('select').removeAttr('disabled').css('background-color', '#ffffff');
            dropdownValue = $editParent.children('select.type').val();
            addInput($editParent.children('select.type').find(':selected').text().toLowerCase(), $editParent);
            $editParent.children('.edit-save-child, .cancel-edit-child').css('display', 'inline');
            $editParent.children('.edit-child-button, .delete-child-button').css('display', 'none');

        });


        //when cancel button is click while editing a child item
        $('body').on('click', '.cancel-edit-child', function() {
            cancelEditChild($(this).parent());
        });
        //when save button is click while editing a child item
        $('body').on('click', '.edit-save-child', function() {
            var $parentItem = $(this).parent();
            if (confirm("Edit " + $parentItem.children('select.type').val() + "?")) {
                var childIndex = $parentItem.parent().parent().index();
                var childPosition = deleteChild($parentItem);
                var newChild = iniatializeNewObject($parentItem, childPosition);
                currentItems[childIndex - 1].children.splice(childPosition, 0, newChild);
                lastModifiedParent = $parentItem.parent().parent().attr('id');
                cancelEditChild($parentItem);
                instantiateCurrentObject();
                updateSaveButton();
                $parentItem.attr({ id: newChild.id, title: 'Save First To Perform Actions' })
                $parentItem.children('select').attr('id', newChild.id).val(newChild.type)
                $parentItem.children('.item-name').children('a').text(newChild.title);
                $parentItem.children('i, a').css({ "pointer-events": "none" });
            }
        });

        function cancelEditChild(list) {
            var $currentParent = list;
            $currentParent.children('.select2, p').remove();
            $currentParent.children('input[type="checkbox"]').toggle();
            $currentParent.children('select.type').toggleClass('currentSelect');
            $currentParent.children('input:not(.open-tab), #sectionDropdown, #categoryDropdown').remove();
            $currentParent.children('.item-name, .fa').css('display', 'block');
            $currentParent.children('select.type').val(dropdownValue);
            $currentParent.children('select').attr('disabled', 'disabled').css('background-color', '#e0e0e0');;
            $currentParent.children('label,.edit-save-child, .cancel-edit-child').css('display', 'none');
            $currentParent.children('.edit-child-button, .delete-child-button').css('display', 'inline');

        }
        $('body').on('click', '#save-changes', function() {
            var numOfArrays = 7;
            doneRequest = 0;
            $mainWrapper.css({ "opacity": ".4" });
            $('main').append('<div id="loader" ><img class="image-loader" src="' + gSZMKspingreyGIFURL + '"/><label>Please wait...</label></div>')
            hideSections();
            showSections();
            hideArticles();
            showArticles();
            if (JSON.stringify(menuObj) !== menuCopy) {
                postData();
                numOfArrays++;
            }
            changePosition();
            changeLOC();
            updateSectionPosition();
            instantiateCurrentObject();
            $(this).prop("disabled", "disabled");
            setTimeout(function() {
                (function() {
                    if (numOfArrays >= doneRequest) {
                        $mainWrapper.css({ "opacity": "1" });
                        $('#loader').remove();
                    } else {
                        setTimeout(arguments.callee, 100);
                    }
                })()
            }, 1000)
        });
        //triggered when any of the tags is clicked.
        $('body').on('click', '.enabled', function() {
                $(this).attr('disabled', 'disabled');
                var id = $(this).parent().attr('id');
                var labelClass = $(this).attr('class').split(' ')[0];
                var noTag = true;
                var promisesToPost = [];
                var promisesToDelete = [];
                getLabels(id).done(function(data) {
                    for (var i = 0; i < data.labels.length; i++) {
                        var name = data.labels[i].name;
                        if (name.includes(labelClass)) {
                            name = name.replace(/tags:/g, "");
                            var promiseToDelete = $.ajax({
                                url: '/api/v2/help_center/en-us/articles/' + id + '/labels/' + data.labels[i].id + '.json',
                                type: 'DELETE'
                            });
                            promisesToDelete.push(promiseToDelete);
                            var promiseToPost = $.ajax({
                                url: '/api/v2/help_center/articles/' + id + '/labels.json',
                                type: 'POST',
                                data: {
                                    "label": {
                                        "name": "DT:" + name
                                    }
                                }
                            });
                            promisesToPost.push(promiseToPost);
                        }
                    }
                    // $.when.apply(null, promisesToDelete).done(function() {
                    //     $.when.apply(null, promisesToPost)
                    // })
                })
                $(this).removeClass('enabled').addClass('disabled');
                if ($('#products').val().toLowerCase() == labelClass.toLowerCase()) {
                    $(this).parent().find('.article ').addClass('lineTrough');
                    if ($(this).parent().children('.article-visibility').children('i').hasClass('fa-eye')) {
                        $(this).parent().children('.article-visibility').children('i').toggleClass('fa-eye').toggleClass('fa-eye-slash');
                    }
                }
                $(this).removeAttr('disabled');
            })
            //when enabled platform tag is clicked in the article.
        $('body').on('click', '.disabled', function() {
                $(this).attr('disabled', 'disabled');
                var articleID = $(this).parent().attr('id');
                var labelClass = 'DT:' + $(this).attr('class').split(' ')[0];
                var platform = $(this).attr('class').split(' ')[0];
                getLabels(articleID).done(function(data) {
                    for (var i = 0; i < data.labels.length; i++) {
                        if (data.labels[i].name == labelClass) {
                            var name = data.labels[i].name;
                            deleteLabel(articleID, data.labels[i].id).done(function() {
                                createTag(articleID, platform, false);
                            })
                        }
                    }
                })
                $(this).removeClass('disabled').addClass('enabled');
                $(this).parent().find('.article ').removeClass('lineTrough');
                if ($(this).parent().children('.article-visibility').children('i').hasClass('fa-eye-slash')) {
                    $(this).parent().children('.article-visibility').children('i').toggleClass('fa-eye').toggleClass('fa-eye-slash');
                }
                $(this).removeAttr('disabled');
            })
            //when eye or eye-slash icon is click
        $("body").on("click", ".parent-visibility", function() {
            $(this).attr('disabled', 'disabled');
            var visibility = $(this).children('i.fa').hasClass('fa-eye') ? 0 : 1;
            currentItems[($(this).parent().index() - 1)].v = visibility;
            $(this).children('i.fa').toggleClass('fa-eye-slash').toggleClass('fa-eye');
            updateSaveButton();
        });



        $("body").on("click", ".child-visibility", function() {
            $(this).attr('disabled', 'disabled');
            var visibility = $(this).children('i.fa').hasClass('fa-eye') ? 0 : 1;
            var parentIndex = $(this).parent().parent().parent().index() - 1;
            currentItems[parentIndex].children[($(this).parent().index() - 1)].v = visibility;
            lastModifiedParent = currentItems[parentIndex].id;
            $(this).children('i.fa').toggleClass('fa-eye-slash').toggleClass('fa-eye');
            updateSaveButton();
        });
        $("body").on("checked", ".child-")





        //trigger when eye or eye-slash icon in section item is click
        $("body").on("click", ".section-visibility", function() {
                var $currentItem = $(this);
                var $parent = $(this).parent();
                var itemID = $parent.attr('id');
                $currentItem.addClass('unclickable');
                if ($(this).children('.fa').hasClass('fa-eye')) {
                    var index = sectionsToShow.indexOf(itemID);
                    if (index > -1) {
                        sectionsToShow.splice(index, 1);
                    } else if (!sectionsToHide.includes(itemID)) {
                        sectionsToHide.push(itemID);
                    }
                    $parent.find('.categoryDrop').addClass('lineTrough');
                } else {
                    var index = sectionsToHide.indexOf(itemID);
                    if (index > -1) {
                        sectionsToHide.splice(index, 1);
                    } else if (!sectionsToShow.includes(itemID)) {
                        sectionsToShow.push(itemID);
                    }
                    $parent.find('.categoryDrop').removeClass('lineTrough')
                }
                $currentItem.removeClass('unclickable')
                    .children('.fa')
                    .toggleClass('fa-eye-slash')
                    .toggleClass('fa-eye');
                updateSaveButton();
            })
            //trigger when eye or eye-slash icon in article item is click
        $("body").on("click", ".article-visibility", function() {
            var itemID = $(this).parent().attr('id');
            if ($(this).children('.fa').hasClass('fa-eye')) {
                var index = articlesToShow.indexOf(itemID);
                if (index > -1) {
                    articlesToShow.splice(index, 1);
                } else if (!articlesToHide.includes(itemID)) {
                    articlesToHide.push(itemID);
                }
                $(this).parent().find('.article ').addClass('lineTrough');
            } else {
                var index = articlesToHide.indexOf(itemID);
                if (index > -1) {
                    articlesToHide.splice(index, 1);
                } else if (!articlesToShow.includes(itemID)) {
                    articlesToShow.push(itemID);
                }
                $(this).parent().find('.article ').removeClass('lineTrough');
            }
            $(this).children('i.fa').toggleClass('fa-eye-slash').toggleClass('fa-eye');
            var articleList = $(this).parent();
            var sectionList = articleList.parent('.articles').parent();
            if (articleList.parent().find('.fa-eye').length < 1) {
                sectionList.find('.fa-eye').toggleClass('fa-eye-slash').toggleClass('fa-eye');
                sectionList.find('.categoryDrop').addClass('lineTrough');
            } else if (sectionList.find(".lineTrough").length < 0) {
                articleList.parent('ul.articles').prev('.section-visibility').children('.fa').removeClass('fa-eye-slash');
                sectionList.find('.categoryDrop').removeClass('lineTrough');
                (!articleList.parent('.articles').prev('.section-visibility').children('.fa').hasClass("fa-eye")) && (articleList.parent('.articles').prev('.section-visibility').children('.fa').addClass('fa-eye'));
            }
            updateSaveButton();
        })
    }

    //use to get labels
    function getLabels(id) {
        return $.get('/api/v2/help_center/en-us/articles/' + id + '/labels.json');
    }

    //use to delete label
    function deleteLabel(articleID, labelID) {
        return $.ajax({
            url: '/api/v2/help_center/en-us/articles/' + articleID + '/labels/' + labelID + '.json',
            type: 'DELETE'
        });
    }

    function createTag(articleID, tag, disable) {
        var updatedTag = tag;
        if (disable) {
            var updatedTag = "DT:" + tag;
        }
        return $.ajax({
            url: '/api/v2/help_center/articles/' + articleID + '/labels.json',
            type: 'POST',
            data: {
                "label": {
                    "name": updatedTag
                }
            }
        });
    }
    //delete the child in the current items element
    function deleteChild($parentList) {
        var id = $parentList.attr('id');
        var children = currentItems[$parentList.parent().parent().index() - 1].children;
        for (var index = 0; index < children.length; index++) {
            if (id == children[index].id) {
                currentItems[$parentList.parent().parent().index() - 1].children.splice(index, 1);
                return index;
            }
        }
    }
    //append list in page
    function instantiateMenuObject() {
        $.get('/api/v2/help_center/en-us/articles/' + siteMap).done(function(data) {
            menuCopy = data.article.body;
            menuObj = JSON.parse(strip_html_tags(data.article.body));
            $('article').css('display', 'none'); //remove existing data from page
            $mainWrapper.children('ul, li').remove();
            if (!$('#products').is(':visible')) {
                appendProductOptions();
            }
            instantiateCurrentProduct();
            populateItems();
            disableSelect();
            $('#' + lastModifiedParent).children('i').click();
            $mainWrapper.children("ul").prepend(addNew);
        });
    }

    function disableSelect() {
        $('.type, .visibility').attr('disabled', 'disabled');
    }
    //instantiates the product list
    function instantiateCurrentProduct() {
        var product = $("select#products option:selected").val();
        product === "mdx2" ? currentItems = menuObj.mdx2 : product === "sas" ? currentItems = menuObj.sas : product === "newDsp" ? currentItems = menuObj.newDsp : product === "dsp" ? currentItems = menuObj.dsp : product === "dmp" ? currentItems = menuObj.dmp : product === "supportKb" && (currentItems = menuObj.supportKb)
    }
    //initialize menu obj with the value of the current item
    function instantiateCurrentObject() {
        var product = $("select#products option:selected").val();
        "mdx2" === product ? menuObj.mdx2 = currentItems : "sas" === product ? menuObj.sas = currentItems : "newDsp" === product ? menuObj.newDsp = currentItems : "dsp" === product ? menuObj.dsp = currentItems : "dmp" === product ? menuObj.dmp = currentItems : "supportKb" === product && (menuObj.supportKb = currentItems);
    }
    //appends list of menu items to the page
    function populateItems() {
        var product = $("select#products option:selected").val();
        var currentItemsLength = currentItems.length;
        $mainWrapper.append('<ul class="menuManagement" id="mainUL"></ul>');
        for (var i = 0; i < currentItemsLength; i++) {
            //populating drop-downs
            if (currentItems[i] != null) {
                $('.menuManagement').append(constructItem(currentItems[i]));
                if (currentItems[i].children !== undefined) {
                    var list = '';
                    for (var x = 0; x < currentItems[i].children.length; x++) {
                        list += constructItem(currentItems[i].children[x], true);
                    }
                    $('#children-' + currentItems[i].id).append('<li class="addNew"><a class="add-child-button">+ ADD</a></li>' + list).css('display', 'none');
                }
            }

        }
        $("#mainUL").nestedSortable({
            items: " > li:not(.addNew)",
            placeholder: "ui-state-highlight",
            listType: 'ul',
            disableParentChange: true,
            protectRoot: true,
            handle: '.fa-grip-vertical',
            update: function(event, ui) {
                var index = currentItems.findIndex(function(item) {
                    return item.id == ui.item[0].id
                });
                move(currentItems, index, $('#mainUL #' + ui.item[0].id).index() - 1);
                updateSaveButton();
            }
        });
        $('ul.sublist').nestedSortable({ //this sortable is use for categories
            disableParentChange: true,
            protectRoot: true,
            items: ' > li:not(.addNew)',
            placeholder: 'ui-state-highlight',
            listType: 'ul',
            handle: '.fa-grip-vertical',
            update: function(event, ui) { //when sorting is done
                var domIndex = $('#mainUL #' + ui.item[0].id).parent().parent().index() - 1;
                var index = currentItems[domIndex].children.findIndex(function(item) {
                    return item.id == ui.item[0].id
                });
                move(currentItems[domIndex].children, index, ($('#mainUL #' + ui.item[0].id).index() - 1));
                lastModifiedParent = $('#mainUL #' + ui.item[0].id).parent().parent().attr('id');
                updateSaveButton();
            }
        });

        $('.menuManagement .fa-grip-vertical').on('mousedown', function(e) {
            e.preventDefault();
            $(this).addClass('mouseDown')
        }).on('mouseup', function() {
            $(this).removeClass('mouseDown');
        })
    }

    function updateSaveButton() {
        if (hasChanges()) {
            $('#save-changes').removeAttr('disabled');
            window.addEventListener('beforeunload', windowHandler);
        } else {
            $('#save-changes').prop('disabled', 'disabled');
            window.removeEventListener('beforeunload', windowHandler);
        }
    }

    function windowHandler() {
        return '';
    }
    //this function is use to move element of array
    function move(arr, old_index, new_index) {
        while (old_index < 0) {
            old_index += arr.length;
        }
        while (new_index < 0) {
            new_index += arr.length;
        }
        if (new_index >= arr.length) {
            var k = new_index - arr.length;
            while ((k--) + 1) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    }

    //this function return a string HTML Element that will be use in menu
    function constructItem(item, isChild) {
        var collapseIcon = "";
        var reference = "";
        var checkBOx = "";
        var childrenListClass = "sublist";
        var linkToZendesk = item.type != 'text' ? "link-zendesk" : "";
        var visibilityHandlerClass = isChild ? "child-visibility" : "parent-visibility";
        var vTitle = 'Show';
        var eye = 'fa-eye-slash';
        var select = '<select class="type" id="' + item.id + '">' + '<option value="text">Text</option>' + '<option value="category">Category</option>' + '<option value="section">Section</option>' + '<option value="custom">Custom</option>' + '</select>';

        if (item.v) {
            eye = 'fa-eye';
            vTitle = 'Hide';
        }
        if (item.type == 'category') {
            select = '<select class="type" id="' + item.id + '"><option value="category">Category</option><option value="text">Text</option><option value="section">Section</option><option value="custom">Custom</option></select>';
            childrenListClass = "sections";
        } else if (item.type == 'section') {
            select = '<select class="type" id="' + item.id + '"><option value="section">Section</option><option value="text">Text</option><option value="category">Category</option><option value="custom">Custom</option></select>';
            childrenListClass = "articles";
        } else if (item.type == 'custom') {
            select = '<select class="type" id="' + item.id + '"><option value="custom">Custom</option><option value="text">Text</option><option value="category">Category</option><option value="section">Section</option></select>';
        }

        var children = '<a class="' + visibilityHandlerClass + '" title="' + vTitle + '"><i class="fa ' + eye + '" style="font-size: 20px;"></i></a><a class="edit-child-button" title="Edit"><i class="fas fa-pen" style="font-size: 20px;"></i></a><a class="delete-child-button" title="Delete"><i class="fa fa-trash" style="font-size: 20px;"></i></a>' + '<a class="edit-save-child" title="Save"><i class="fa fa-check" style="font-size: 20px;"></i></a>' + '<a class="cancel-edit-child" title="Cancel"><i class="fa fa-times" style="font-size: 20px;"></i></a><ul class="' + childrenListClass + '" id="children-' + item.id + '"></ul>'

        if (!isChild) {
            children = '<a class="' + visibilityHandlerClass + '" title="' + vTitle + '"><i class="fa ' + eye + '" style="font-size: 20px;"></i></a><a class="editButton" title="Edit"><i class="fas fa-pen" style="font-size: 20px;"></i></a>' + '<a class="deleteButton" title="Delete"><i class="fa fa-trash" style="font-size: 20px;"></i></a>' + '<a class="editSaveButton" title="Save"><i class="fa fa-check" style="font-size: 20px;"></i></a>' + '<a class="editCancelButton" title="Cancel"><i class="fa fa-times" style="font-size: 20px;"></i></a><ul class="' + childrenListClass + '" id="children-' + item.id + '"></ul></li>';
        }

        if (item.type === "custom") {
            reference = 'href=' + item.url;
            checkBOx = '<label class="toggle-text" style="display:none;"><input label="New Tab" class="open-tab" type="checkbox" ><span>OPEN NEW TAB</span></label>'
            if (item.checkItem) {
                var newTab = ' target="_blank"'
                checkBOx = '<label class="toggle-text" style="display:none;"><input label="New Tab" class="open-tab" type="checkbox" checked><span >OPEN NEW TAB</span></label>'
            } else if (item.checkItem) {
                var newTab = '>'
            }
        } else {
            collapseIcon = '<i class="fa fa-angle-right" style="font-size: 16px;"></i>';
            if (item.type != 'text') {
                if (item.type == 'category')
                    reference = 'href="/hc/admin/categories/' + item.id + '/edit"';
                else
                    reference = 'href="/hc/admin/' + item.type + 's/' + item.id + '/edit"';
            }
        }

        return '<li id="' + item.id + '"><i class="fas fa-grip-vertical"></i>' + collapseIcon + '<div class="item-name"><a class="categoryDrop ' + linkToZendesk + '" ' + reference + newTab + '>' + item.title + '</a></div>' + checkBOx + select + children;
    }

    //add either dropdown or text field base on selected type
    function addInput(type, parent) {
        console.log(type);
        var localCategories = JSON.parse(storage.getItem(HelpCenter.user.email + "-allCategories" + helpCenterVer + currentLang));
        var localCategoriesLength = localCategories.length;
        $('.menuManagement .select2').remove();
        if (type == "text") {
            var textInput = '<input type="text" placeholder="Text..">';
            $('.menuManagement #categoryDropdown').remove();
            $('.menuManagement #sectionDropdown').remove();
            $('.menuManagement input').remove();
            $(textInput).insertAfter(parent.find('.editCancelButton'));
            $(textInput).insertAfter(parent.find('.cancelButton'));
            $(textInput).insertAfter(parent.find('.cancel-child-button'));
            $(textInput).insertAfter(parent.find('.cancel-edit-child'));
            //parent.append('<input type="text" placeholder="Text..">');
            parent.children('input[type="text"]').val(parent.children('.item-name').children('a.categoryDrop').text());
        } else if (type === "category") {
            var categoriesDrop = '<select id="categoryDropdown">';
            for (var i = 0; i < localCategoriesLength; i++) {
                categoriesDrop += '<option value="' + localCategories[i].id + '">' + localCategories[i].name + '</option>';
            }
            categoriesDrop += '</select>';
            parent.children('input').remove();
            $('.menuManagement #sectionDropdown').remove();
            $(categoriesDrop).insertAfter(parent.find('.editCancelButton'));
            $(categoriesDrop).insertAfter(parent.find('.cancelButton'));
            $(categoriesDrop).insertAfter(parent.find('.cancel-child-button'));
            $(categoriesDrop).insertAfter(parent.find('.cancel-edit-child'));
            $('.menuManagement #categoryDropdown').val(parent.attr('id')).select2({
                placeholder: "Select a category"
            });
        } else if (type === "section") {
            var localSections = JSON.parse(storage.getItem(HelpCenter.user.email + "-allSections" + helpCenterVer + currentLang));
            var localSectionsLength = localSections.length;
            var stringedElements = '<select id="sectionDropdown">';

            for (var ndx = 0; ndx < localCategoriesLength; ndx++) {
                var sectionOptions = '';
                for (var index = 0; index < localSectionsLength; index++) {
                    if (localCategories[ndx].id === localSections[index].category) {
                        sectionOptions += '<option class="' + localCategories[ndx].id + '" value="' + localSections[index].id + '">' + localSections[index].name + '</option>';
                    }
                }
                if (sectionOptions) {
                    stringedElements += '<optgroup class="' + localCategories[ndx].id + '" label="' + localCategories[ndx].name + '">' + sectionOptions + '</optgroup>';
                }
            }

            stringedElements += '</select>';
            parent.children('input').remove();
            $('.menuManagement #categoryDropdown').remove();
            $(stringedElements).insertAfter(parent.find('.editCancelButton'));
            $(stringedElements).insertAfter(parent.find('.cancelButton'));
            $(stringedElements).insertAfter(parent.find('.cancel-child-button'));
            $(stringedElements).insertAfter(parent.find('.cancel-edit-child'));
            $('.menuManagement #sectionDropdown').val(parent.attr('id')).select2({
                placeholder: "Select a section"
            });
            $('#sectionDropdown').children('option').wrap('<span/>')
        } else if (type === "custom") {
            var customInput = '<input type="text" placeholder="Text..."><input type="url" placeholder="URL...">';
            parent.children('input[type="text"]').remove();
            $('.menuManagement #categoryDropdown').remove();
            $('.menuManagement #sectionDropdown').remove();
            $(customInput).insertAfter(parent.find('.editCancelButton'));
            $(customInput).insertAfter(parent.find('.cancelButton'));
            $(customInput).insertAfter(parent.find('.cancel-child-button'));
            $(customInput).insertAfter(parent.find('.cancel-edit-child'));
            //parent.append('<input type="text" placeholder="Text..."><input type="url" placeholder="URL...">');
            parent.children('input[type="text"]').val(parent.find('.categoryDrop').text());
            parent.children('input[type="url"]').val(parent.find('.categoryDrop').attr('href'));
        }
    }
    //remove the current list in main ul and replace with a new one
    function updateItems() {
        $('#save-changes').attr('disabled', 'disabled');
        $mainWrapper.children('ul, li').remove();
        instantiateCurrentProduct();
        populateItems();
        $mainWrapper.children('ul').prepend(addNew);
    }
    //update the article body
    function postData() {
        $.ajax({
            url: "/api/v2/help_center/articles/" + siteMap + "/translations/en-us.json",
            type: 'PUT',
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
                "translation": {
                    "body": JSON.stringify(menuObj)
                }
            })

        }).done(function() {
            doneRequest++;
            updateItems();
            instantiateMenuObject();
        });
    }

    //create a new item
    function iniatializeNewObject(parent, position) {
        var selectedType = parent.children('select.type').val();
        var title = parent.children('input[type="text"]').val();
        var categoryTitle = parent.children('select#categoryDropdown');
        var sectionTitle = parent.children('select#sectionDropdown');
        var id = uuidv4();
        if (categoryTitle.is(':visible')) {
            title = categoryTitle.find(":selected").text();
            id = parseInt(categoryTitle.find(":selected").val());
        }
        if (sectionTitle.is(':visible')) {
            title = sectionTitle.find(":selected").text();
            id = parseInt(sectionTitle.find(":selected").val());
        }
        var newItem = {
            title: title,
            id: id,
            position: position,
            type: selectedType,
            v: 1
        }
        if (selectedType === "text") {
            newItem.children = editChildren;
        }
        if (selectedType === "custom") {
            newItem.url = parent.children('input[type="url"]').val();
        }
        return newItem;
    }

    //get the correct platforom base on the selected platfrom in menu admin.
    function getCurrentPlatform(platform) {
        return platform == "mdx2" ? platform : platform == "sas" ? "mdxnxt" : platform == "newDsp" ? "newdsp" : platform == "dsp" ? platform : platform == "dmp" ? platform : platform = "supportKb" ? platform : platform;
    }

    //populate child elements under a category type
    function populateSections(parentDOM) {
        var stringDOM = '';
        var isFirstDrag = true;
        var categoryID = parseInt(parentDOM.children('select.type').attr('id'));
        parentDOM.children('i.fa-angle-down, i.fa-angle-right, .categoryDrop').css({
            'cursor': 'wait'
        })
        $.get("/api/v2/help_center/en-us/categories/" + categoryID + "/sections").done(function(response) {
            sections = response.sections;
            sections.forEach(function(section) {
                stringDOM += '<li id="' + section.id + '"><i class="fas fa-grip-vertical"></i><i class="fa fa-angle-right" style="font-size: 16px;"></i><div class="item-name"><a class="categoryDrop link-zendesk" href="/hc/admin/sections/' + section.id + '/edit" target="_blank">' + section.name + '</a></div><select class="type" id="select-' + section.id + '">' + '<option value="section">Section</option>' + '<option value="text">Text</option>' + '<option value="category">Category</option>' + '<option value="custom">Custom</option></select>' + '</li>';
            })
            parentDOM.children('ul').append(stringDOM);
            for (var ndx = 0; ndx < sections.length; ndx++) {
                (function(x) {
                    var eye = "fa-eye-slash";
                    var hidden = true;
                    var title = "Show To All Shared Platform";
                    $.get('/api/v2/help_center/en-us/sections/' + sections[x].id + '/articles').done(function(data) {
                        var platform = getCurrentPlatform($("#products").val());
                        var validDescription = true;
                        if (sections[x].description) {
                            if (sections[x].description.includes("hidden")) {
                                validDescription = false;
                            }
                        }
                        if (data.count > 0 && validDescription) {
                            data.articles.forEach(function(article) {
                                var labelList = article.label_names;
                                var hasLabel = labelList.includes(platform);
                                if (platform == "supportKb" || !labelList.length) {
                                    hasLabel = true;
                                }
                                if (!(labelList.includes("mdx2") || labelList.includes("mdx_nxt") || labelList.includes("mdxnxt") || labelList.includes("newdsp") || labelList.includes("dsp") || labelList.includes("dmp"))) {
                                    hasLabel = true;
                                }
                                if (hasLabel && !(article.draft) && !(labelList.includes("hidden"))) {
                                    eye = "fa-eye";
                                    hidden = false;
                                    title = "Hide To All Shared Platform";
                                }
                            })
                        }

                        parentDOM.find("#" + sections[x].id).append('<a class="section-visibility"><i class="fa ' + eye + '" style="font-size: 20px;" title="' + title + '"></i></a>');
                        hidden && (parentDOM.find("#" + sections[x].id).children(".item-name").children(".categoryDrop").addClass("lineTrough"));
                        var isAllDraft = allDraft(data.articles);
                        (!data.count || isAllDraft) && (parentDOM.find("#" + sections[x].id).find('.section-visibility').css({
                            'pointer-events': 'none'
                        }))
                        if (x === sections.length - 1) {
                            parentDOM.children('i.fa-angle-down, i.fa-angle-right, .categoryDrop').css({
                                'cursor': 'pointer'
                            })
                        }
                    })
                })(ndx)
            }
            parentDOM.children('ul').nestedSortable({
                disableParentChange: true,
                protectRoot: true,
                items: '> li',
                placeholder: 'ui-state-highlight',
                listType: 'ul',
                handle: '.fa-grip-vertical',
                relocate: function(event, ui) {
                    var domIndex = $('#mainUL #' + ui.item[0].id).index();
                    var index = sections.findIndex(function(item) {
                        return item.id == ui.item[0].id
                    });
                    if (isFirstDrag) {
                        sectionsFirstIndex = oldIndex;
                        sectionsLastIndex = index;
                        isFirstDrag = false;
                    }
                    if (sectionsFirstIndex > sectionsLastIndex) {
                        sectionsFirstIndex = sectionsFirstIndex + sectionsLastIndex;
                        sectionsLastIndex = sectionsFirstIndex - sectionsLastIndex;
                        sectionsFirstIndex = sectionsFirstIndex - sectionsLastIndex;
                    }
                    if (index < domIndex) {
                        if (index < sectionsFirstIndex) {
                            sectionsFirstIndex = index;
                        }
                        if (domIndex > sectionsLastIndex) {
                            sectionsLastIndex = domIndex;
                        }
                    } else if (domIndex < index) {
                        if (domIndex < sectionsFirstIndex) {
                            sectionsFirstIndex = domIndex;
                        }
                        if (index > sectionsLastIndex) {
                            sectionsLastIndex = index;
                        }
                    }
                    move(sections, index, domIndex);
                    updateSaveButton();
                }
            })
        })
    }

    function updateSectionPosition() {
        if (sectionsFirstIndex !== sectionsLastIndex) {
            var promisesToUpdate = [];
            for (var i = sectionsFirstIndex; i <= sectionsLastIndex; i++) {
                var requestToUpdate = $.ajax({
                    url: "/api/v2/help_center/sections/" + sections[i].id,
                    type: "PUT",
                    data: {
                        "section": {
                            "position": i
                        }
                    }
                });
                promisesToUpdate.push(requestToUpdate);
            }
            $.when.apply(null, promisesToUpdate).done(function() {
                $('#save-changes').attr('disabled', 'disabled');
                doneRequest++;
            });
        }
    }

    function allDraft(articles) {
        for (var i = 0; i < articles.length; i++) {
            if (!articles[i].draft) {
                return false;
            }
        }
        return true;
    }
    //append all articles of the pass section
    function populateArticle(parentELement) {
        var loc4 = loc3 = loc2 = loc1 = parentELement.attr('id');
        var url = '/api/v2/help_center/en-us/sections/' + parentELement.attr('id') + '/articles';
        parentELement.children('i.fa-angle-down, i.fa-angle-right, .categoryDrop').css({
            'cursor': 'wait'
        })
        if (!parentELement.children('ul.articles').length) {
            parentELement.append('<ul class="articles"></ul>')
        }
        articles = [];
        getArticle();

        function getArticle() {
            var notMoved = true;
            $.get(url).done(function(data) {
                url = data.next_page;
                for (var i = 0; i < data.articles.length; i++) {
                    if (!data.articles[i].draft) {
                        articles.push(data.articles[i].id);
                        var labelList = data.articles[i].label_names.map(function(data) {
                            return data.toUpperCase();
                        })
                        var eye = "fa-eye";
                        var title = "Hide";
                        var lineTrough = "";
                        var articlePlatfromTag = getPlatformTags(data.articles[i].label_names);
                        var labels = data.articles[i].label_names;
                        for (var ndx = 0; ndx < labels.length; ndx++) {
                            if (labels[ndx] === 'hidden') {
                                eye = "fa-eye-slash";
                                title = "Show";
                                lineTrough = "lineTrough";
                            }
                        }
                        var stringifiedElements = '<li id="' + data.articles[i].id + '" class="menu-admin-article"><i class="fas fa-grip-vertical"></i></i><div class="item-name"><a class="article ' + lineTrough + ' link-zendesk" href="' + zendeskEditorURL + '/articles/' + data.articles[i].id + '" target="_blank">' + data.articles[i].name + '</a></div>' + articlePlatfromTag + '<select class="type" disabled><option value="article">Article</option><option value="text">Text</option><option value="category">Category</option><option value="section">Section</option><option value="custom">Custom</option></select><a class="article-visibility" title="' + title + '"><i class="fa ' + eye + '" style="font-size: 20px;"></i></a><ul style="display:none;"></ul></li>';
                        if (!labelList.includes('LOC_1') && !labelList.includes('LOC_2') && !labelList.includes('LOC_3') && !labelList.includes('LOC_4') && !labelList.includes('LOC_5')) {
                            parentELement.children('ul').addClass('LOC_1').append(stringifiedElements);
                            loc1 = data.articles[i].id, loc2 = 0, loc3 = 0, loc4 = 0;
                        } else if (labelList.includes('LOC_2')) {
                            loc2 = data.articles[i].id, loc3 = 0, loc4 = 0;
                            $('#mainUL #' + loc1).children('ul').addClass('LOC_2').append(stringifiedElements);
                            if ($('#mainUL #' + loc1).children('i.fa-angle-right').length === 0 && $('#mainUL #' + loc1).children('i.fa-angle-down').length === 0) {
                                $('<i class="fa fa-angle-right" style="font-size: 16px;"></i>').insertAfter($('#mainUL #' + loc1).children('i.fa-grip-vertical')),
                                    $('#mainUL #' + loc1).children('a.article').css('padding-left', '0px');
                            }
                        } else if (labelList.includes('LOC_3')) {
                            loc3 = data.articles[i].id, loc4 = 0;
                            var loc3ParentID = loc2;
                            if (!loc3ParentID) {
                                loc3ParentID = loc1;
                            }
                            $('#mainUL #' + loc3ParentID).children('ul').addClass('LOC_3').append(stringifiedElements);
                            if ($('#mainUL #' + loc3ParentID).children('i.fa-angle-right').length === 0 && $('#mainUL #' + loc1).children('i.fa-angle-down').length === 0) {
                                $('<i class="fa fa-angle-right" style="font-size: 16px;"></i>').insertAfter($('#mainUL #' + loc3ParentID).children('i.fa-grip-vertical')),
                                    $('#mainUL #' + loc3ParentID).children('a.article').css('padding-left', '0px');
                            }
                        } else if (labelList.includes('LOC_4')) {
                            var loc4ParentID = loc3;
                            if (!loc4ParentID) {
                                loc4ParentID = loc2;
                            }
                            if (!loc4ParentID) {
                                loc4ParentID = loc1;
                            }
                            $('#mainUL #' + loc4ParentID).children('ul').addClass('LOC_4').append(stringifiedElements);
                            if ($('#mainUL #' + loc4ParentID).children('i.fa-angle-right').length === 0 && $('#mainUL #' + loc1).children('i.fa-angle-down').length === 0) {
                                $('<i class="fa fa-angle-right" style="font-size: 16px;"></i>').insertAfter($('#mainUL #' + loc4ParentID).children('i.fa-grip-vertical')),
                                    $('#mainUL #' + loc4ParentID).children('a.article').css('padding-left', '0px')
                            };
                        }
                    }
                }
                if (url === null) {
                    parentELement.children('.fa-angle-right, .fa-angle-down, .categoryDrop').css({
                        'cursor': 'pointer'
                    });
                    var oldLOC = '';
                    $('ul.articles').nestedSortable({
                        forcePlaceholderSize: true,
                        expandOnHover: 150,
                        items: 'li',
                        placeholder: 'ui-state-highlight',
                        maxLevels: 5,
                        listType: 'ul',
                        opacity: 1,
                        isTree: true,
                        handle: '.fa-grip-vertical',
                        isAllowed: function(placeholder, placeholderParent, currentItem) {
                            if (placeholder.parents('ul.articles').length) {
                                return true;
                            } else {
                                return false;
                            }
                        },
                        start: function(event, ui) {
                            var startID = ui.item[0].id;
                            oldLOC = getNewLOC(startID);
                        },
                        //this function is trigger after menu item is drag into another place
                        relocate: function(event, ui) {
                            var id = ui.item[0].id,
                                moveArtOldIndex = getIndex(id),
                                moveArtNewIndex = getNewIndex(id);
                            if (notMoved) {
                                if (oldIndex < newIndex) {
                                    oldIndex = moveArtOldIndex,
                                        newIndex = moveArtNewIndex;
                                } else {
                                    oldIndex = moveArtNewIndex,
                                        newIndex = moveArtOldIndex;
                                }
                                notMoved = false;
                            }
                            if (moveArtOldIndex < moveArtNewIndex) {
                                oldIndex = oldIndex < moveArtOldIndex ? oldIndex : moveArtOldIndex;
                                newIndex = newIndex > moveArtNewIndex ? newIndex : moveArtNewIndex;
                            } else {
                                oldIndex = oldIndex < moveArtNewIndex ? oldIndex : moveArtNewIndex;
                                newIndex = newIndex > moveArtOldIndex ? newIndex : moveArtOldIndex;
                            }
                            move(articles, moveArtOldIndex, moveArtNewIndex);
                            var newLOC = getNewLOC(id);
                            if (oldLOC != newLOC) {
                                pushObject({
                                    id: id,
                                    loc: newLOC
                                });
                            }
                            addLabels();
                            updateSaveButton();
                            articleUpdate = true;
                        }
                    })
                } else {
                    getArticle();
                }
            });
        }
    }

    function getPlatformTags(tags) {
        var tagsLength = tags.length;
        var articleTags = '';
        for (var index = 0; index < tagsLength; index++) {
            if (!(tags[index].includes('DT')) && (tags[index].includes('mdx2') || tags[index].includes('kbmdx'))) {
                if (tags[index].includes('kbmdx')) {
                    articleTags += '<span class="kbmdx enabled">MDX 2.0</span>'
                } else {
                    articleTags += '<span class="mdx2 enabled">MDX 2.0</span>'
                }
            } else if (tags[index].includes('DT') && (tags[index].includes('mdx2') || tags[index].includes('kbmdx'))) {
                if (tags[index].includes('kbmdx')) {
                    articleTags += '<span class="kbmdx disabled">MDX 2.0</span>'
                } else {
                    articleTags += '<span class="mdx2 disabled">MDX 2.0</span>'
                }
            }
            if ((tags[index].includes('mdxnxt') || tags[index].includes('kbmdxnxt') || tags[index].includes('kbsas')) && !(tags[index].includes('DT'))) {
                if (tags[index].includes('mdxnxt')) {
                    articleTags += '<span class="mdxnxt enabled">SAS</span>'
                } else if (tags[index].includes('kbmdxnxt')) {
                    articleTags += '<span class="kbmdxnxt enabled">SAS</span>'
                } else if (tags[index].includes('kbsas')) {
                    articleTags += '<span class="kbsas enabled">SAS</span>'
                }
            } else if (tags[index].includes('DT') && (tags[index].includes('mdxnxt') || tags[index].includes('kbmdxnxt') || tags[index].includes('kbsas'))) {
                if (tags[index].includes('mdxnxt')) {
                    articleTags += '<span class="mdxnxt disabled">SAS</span>'
                } else if (tags[index].includes('kbmdxnxt')) {
                    articleTags += '<span class="kbmdxnxt disabled">SAS</span>'
                } else if (tags[index].includes('kbsas')) {
                    articleTags += '<span class="kbsas disabled">SAS</span>'
                }
            }
            if (tags[index] == 'newdsp' && !(tags[index].includes('DT'))) {
                articleTags += '<span class="newdsp enabled">NEW DSP</span>'
            } else if (tags[index] == 'newdsp' && tags[index].includes('DT')) {
                articleTags += '<span class="newdsp disabled">NEW DSP</span>'
            }
            if (tags[index] == 'dsp' && !(tags[index].includes('DT'))) {
                articleTags += '<span class="dsp enabled">DSP</span>'
            } else if (tags[index] == 'dsp' && tags[index].includes('DT')) {
                articleTags += '<span class="dsp disabled">DSP</span>'
            }
            if (tags[index].includes('dmp') && !(tags[index].includes('DT'))) {
                articleTags += '<span class="dmp enabled">DMP</span>'
            } else if (tags[index].includes('dmp') && tags[index].includes('DT')) {
                articleTags += '<span class="dmp disabled">DMP</span>'
            }
        }
        return articleTags;
    }

    //get the index of the current article
    function getIndex(id) {
        var articlesLength = articles.length;
        for (var i = 0; i < articlesLength; i++) {
            if (articles[i] == id) {
                return i;
            }
        }
    }
    //get the index of list base on DOM
    function getNewIndex(id) {
        var parentULs = $("#mainUL #" + id).parentsUntil('ul.articles', 'ul');
        var newIndex = 0;
        var prevElement = $("#mainUL #" + id).prevAll('li.menu-admin-article');
        for (var index = 0; index < prevElement.length; index++) {
            newIndex += $(prevElement[index]).find('li').addBack().length;
        }
        for (var i = 0; i < parentULs.length; i++) {
            newIndex += $(parentULs[i]).parent().prevAll('li.menu-admin-article').addBack().length;
            prevElement = $(parentULs[i]).parent().prevAll('li.menu-admin-article');
            for (var index = 0; index < prevElement.length; index++) {
                newIndex += $(prevElement[index]).find('li').length;
            }
        }
        return newIndex;
    }

    //this function identify the new LOC of article
    function getNewLOC(articleID) {
        var parentULUntilMain = $("#mainUL #" + articleID).parentsUntil('ul.articles', 'ul');
        return parentULUntilMain.length < 1 ? "" : "LOC_" + (parentULUntilMain.length + 1);
    }

    //use to generate a unique id for text item only
    function uuidv4() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, function(a) {
            return (a ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> a / 4).toString(16);
        });
    }
    //appending the select tag with product options
    function appendProductOptions() {
        var products = '<select id="products">';
        for (var index = 0; index < menuObj.products.length; index++) {
            products += '<option value="' + menuObj.products[index].value + '">' + menuObj.products[index].text + '</option>';
        }
        $mainWrapper.append(products + '</select>');
        var platform = identifyCurrentPlatform(storage.getItem('global-filterSetting'));
        $('#products').val(platform);
    }
    //get the value for the menu admin product base on the left hand menu
    function identifyCurrentPlatform(menuPlatform) {
        return menuPlatform === "mdx_2_0" ? "mdx2" : menuPlatform === "mdx_nxt" ? "sas" : menuPlatform == "newdsp" ? "newDsp" : menuPlatform === "dsp" ? "dsp" : menuPlatform === "dmp" ? "dmp" : menuPlatform === "support_kb" ? "supportKb" : "mdx2";
    }
    //add moved article to articlesChangeLOC array 
    function pushObject(obj) {
        var notInArray = true;
        for (var i = 0; i < articlesChangeLOC.length; i++) {
            if (articlesChangeLOC[i].id === obj.id) {
                notInArray = false;
                articlesChangeLOC[i].loc = obj.loc;
            }
        }
        notInArray && (articlesChangeLOC.push({
            id: obj.id,
            loc: obj.loc
        }));
    }

    //update the articles position using the api
    function changePosition() {
        var index = oldIndex,
            length = newIndex,
            promises = [];
        oldIndex < newIndex ? (index = oldIndex, length = newIndex) : (index = newIndex, length = oldIndex);
        if (length != index) {
            for (; index <= length; index++) {
                (function(x) {
                    var postRequest = $.ajax({
                        url: '/api/v2/help_center/articles/' + articles[x] + '.json',
                        type: 'PUT',
                        dataType: "json",
                        contentType: "application/json",
                        data: JSON.stringify({
                            "article": {
                                "position": index
                            }
                        })
                    });
                    promises.push(postRequest);
                })(index)
            }
            $.when.apply(null, promises).done(function() {
                doneRequest++;
            })
        }
    }

    //add label to articles that is the heirarchy change
    function addLabels() {
        var numArticles = articlesChangeLOC.length;
        for (var i = 0; i < numArticles; i++) {
            (function(index) {
                if (undefined === articlesChangeLOC[index].labels) {
                    $.get('/api/v2/help_center/articles/' + articlesChangeLOC[index].id + '/labels.json').done(function(data) {
                        articlesChangeLOC[index].labels = data.labels;
                    })
                }
            })(i)
        }
    }

    //update the level of content of the article which is move in different hsierarchy using api
    function changeLOC() {
        var promises = [],
            promisesToDelete = [];
        var numArticles = articlesChangeLOC.length;
        for (var i = 0; i < numArticles; i++) {
            (function(index) {
                if (articlesChangeLOC[index].labels != undefined) {
                    var labels = articlesChangeLOC[index].labels;
                    for (var n = 0; n < labels.length; n++) {
                        (function(innerNdx) {
                            if (labels[innerNdx].name.includes('LOC')) {
                                var requestToDelete = $.ajax({
                                    url: '/api/v2/help_center/articles/' + articlesChangeLOC[index].id + '/labels/' + labels[innerNdx].id + '.json',
                                    type: 'DELETE'
                                });
                                promisesToDelete.push(requestToDelete);
                            }
                        })(n)
                    }
                }
                if (articlesChangeLOC[i].loc != '') {
                    var request = $.ajax({
                        url: '/api/v2/help_center/articles/' + articlesChangeLOC[index].id + '/labels.json',
                        type: 'POST',
                        data: {
                            "label": {
                                "name": articlesChangeLOC[i].loc
                            }
                        }
                    });
                    promises.push(request);
                }
            })(i)
        }
        $.when.apply(null, promisesToDelete).done(function() {
            $.when.apply(null, promises).done(function() {
                $('#save-changes').attr('disabled', 'disabled');
                doneRequest++;
            })
        })
    }

    //check if there is any changes
    function hasChanges() {
        if (articlesToShow.length) return true;
        if (articlesToHide.length) return true;
        if (sectionsToShow.length) return true;
        if (sectionsToHide.length) return true;
        if (JSON.stringify(menuObj) !== menuCopy) return true;
        if (sections.length) return true;
        if (articles.length) return true;
        if (articlesChangeLOC.length) return true;
        return false;
    }

    function showArticles() {
        if (!articlesToShow.length) doneRequest++;
        for (var i = 0, len = articlesToShow.length; i < len; i++) {
            (function(ndx) {
                $.get('/api/v2/help_center/articles/' + articlesToShow[ndx] + '/labels.json').done(function(data) {
                    var articleLabels = data.labels;
                    for (var x = 0, labelLen = articleLabels.length; x < labelLen; x++) {
                        (function(index) {
                            if (articleLabels[x].name == "hidden") {
                                $.ajax({
                                    url: '/api/v2/help_center/en-us/articles/' + articlesToShow[ndx] + '/labels/' + articleLabels[x].id + '.json',
                                    type: 'DELETE'
                                }).done(function() {
                                    if (ndx + 1 >= articlesToShow.length) {
                                        doneRequest++;
                                    }
                                })
                            }
                        })(x)
                    }
                })
            })(i)
        }
    }

    function hideArticles() {
        if (!articlesToHide.length) doneRequest++;
        articlesToHide.forEach(function(id, index) {
            $.ajax({
                url: '/api/v2/help_center/articles/' + id + '/labels.json',
                type: 'POST',
                data: {
                    "label": {
                        "name": "hidden"
                    }
                }
            }).done(function() {
                if (index + 1 >= articlesToHide.length) {
                    doneRequest++
                }
            })
        })
    }

    function showSections() {
        if (!sectionsToShow.length) doneRequest++;
        for (var i = 0, len = sectionsToShow.length; i < len; i++) {
            (function(index) {
                $.get('/api/v2/help_center/sections/' + sectionsToShow[index]).done(function(section) {
                    var description = section.section.description.replace(/hidden/g, "");
                    description = description.trim();
                    $.ajax({
                        url: "/api/v2/help_center/sections/" + sectionsToShow[index],
                        type: "PUT",
                        data: {
                            "section": {
                                "description": description
                            }
                        }
                    }).done(function() {
                        if (index + 1 >= sectionsToShow.length) {
                            doneRequest++
                        }
                    })
                })
            })(i)
        }
    }

    function hideSections() {
        if (!sectionsToHide.length) doneRequest++;
        for (var i = 0, len = sectionsToHide.length; i < len; i++) {
            (function(index) {
                $.get('/api/v2/help_center/sections/' + sectionsToHide[index]).done(function(section) {
                    var description = section.section.description == "" ? "hidden" : section.section.description + " hidden";
                    $.ajax({
                        url: "/api/v2/help_center/sections/" + sectionsToHide[index],
                        type: "PUT",
                        data: {
                            "section": {
                                "description": description
                            }
                        }
                    }).done(function() {
                        if (index + 1 >= sectionsToHide.length) {
                            doneRequest++
                        }
                    })
                })
            })(i)
        }
    }
});