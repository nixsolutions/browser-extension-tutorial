$(function () {
    $('a[href="#bookmarks-popup"]').on('click', updateBookmarks);

    $('a[href="#favorite"]').on('click', function () {
        $('#favorite').empty();
        dumpMostVisited();
    });

    $('a[href="#history"]').on('click', function () {
        $('#history-content').empty();
        dumpHistory();
    });

    $('.tab-pane').on('click', '.site-link', function () {
        chrome.tabs.create({url: $(this).attr('href')});
    });

    $('#bookmarks-popup').on('click', '.addlink', showAddBookmarkDialog);
    $('#bookmarks-popup').on('click', '.deletelink', showDeleteBookmarkDialog);
    $('#clear-history button').on('click', showClearHistoryDialog);

    $('#add-bookmark-btn').on('click', addBookmarkDialogHandler);
    $('#delete-btn').on('click', deleteDialogHandler);
    $('.modal').on('hide.bs.modal', closeDialogHandler);

    $('a[href="#bookmarks-popup"]').trigger('click');
});

function getOneWeekAgoTime() {
    var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    return (new Date).getTime() - microsecondsPerWeek;
}

function dumpMostVisited() {
    chrome.topSites.get(function (topSites) {
        var listEl = $('<ul>');

        dumpLinks(topSites, listEl);

        $('#favorite').append($('<div class="links-block"/>').append(listEl));
    });
}

function dumpHistory() {
    chrome.history.search({
        'text': '',
        'startTime': getOneWeekAgoTime()
    }, function (histories) {
        var listEl = $('<ul>');
        dumpLinks(histories, listEl);

        $('#history-content').append($('<div class="links-block"/>').append(listEl));
    });
}

function dumpLinks(links, listEl) {
    $.each(links, function () {
        if (this.url && this.title) {
            listEl.append(
                $('<li>').append('<a class="site-link" href="' + this.url + '">' + this.title + '</a>')
            )
        }
    })
}

function dumpBookmarks() {
    chrome.bookmarks.getTree(
        function (bookmarkTreeNodes) {
            $('#bookmarks-popup').append(dumpTreeNodes(bookmarkTreeNodes));
        }
    );
}

function dumpTreeNodes(bookmarkNodes) {
    var list = $('<ul>');
    var i;
    for (i = 0; i < bookmarkNodes.length; i++) {
        list.append(dumpNode(bookmarkNodes[i]));
    }
    return list;
}

function dumpNode(bookmarkNode) {
    if (bookmarkNode.title) {
        var anchor = $('<a>').attr('href', bookmarkNode.url).text(bookmarkNode.title);

        anchor.click(function () {
            chrome.tabs.create({url: bookmarkNode.url});
        });

        var div = $('<div>');
        var controlLink = $('<a>').data('id', bookmarkNode.id);

        if (bookmarkNode.children) {
            div.text(bookmarkNode.title);
            controlLink.addClass('btn btn-info btn-xs addlink').text('Add');
        } else {
            div.append(anchor);
            controlLink.addClass('btn btn-danger btn-xs deletelink').text('Delete');
        }

        div.append(
            $('<span class="control">').append(controlLink)
        );
    }

    var li = $(bookmarkNode.title ? '<li>' : '<div>').append(div);
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        li.append(dumpTreeNodes(bookmarkNode.children));
    }
    return li;
}

function updateBookmarks()
{
    $('#bookmarks-popup').empty();
    window.dumpBookmarks();
}

function showAddBookmarkDialog() {
    var bookmarkId = $(this).data('id');

    $('#bookmark-parent-id').val(bookmarkId);
    $('#adddialog').modal('show');
}

function showClearHistoryDialog() {
    $('#deletedialog .modal-title').text('Clear Browsing Data');
    $('#deletedialog').modal('show');
}

function showDeleteBookmarkDialog() {
    var bookmarkId = $(this).data('id');
    $('#bookmark-delete-id').val(bookmarkId);
    $('#deletedialog .modal-title').text('Delete Bookmark');
    $('#deletedialog').modal('show');
}

function closeDialogHandler() {
    $(this).find('input').each(function () {
        $(this).val('')
    });
}

function addBookmarkDialogHandler() {
    chrome.bookmarks.create({
        parentId: $('#bookmark-parent-id').val(),
        title: $('#bookmark-name').val(), url: $('#bookmark-url').val()
    });

    updateBookmarks();
    $('#adddialog').modal('hide');
}

function deleteDialogHandler() {
    var bookmarkId = $('#bookmark-delete-id').val();
    if (bookmarkId) {
        removeBookmark(bookmarkId);
    } else {
        clearHistory();
    }
    $('#deletedialog').modal('hide');
}

function removeBookmark(bookmarkId) {
    chrome.bookmarks.remove(String(bookmarkId));
    updateBookmarks();
}

function clearHistory() {
    chrome.history.deleteAll(function () {
        $('#history-content').empty();
    })
}
