$(function () {
    $('[data-toggle="tooltip"]').tooltip();
    chrome.topSites.get(function (topSites) {
        $.each(topSites.slice(0, 8), function () {
            var link = $("<a />", {
                href: this.url,
                title: this.title,
                "data-toggle": 'tooltip',
                "target": '_blank'
            }).html('<div class="site-name"><span>' + extractDomain(this.url) + '</span></div>');

            $('#top-sites').append(
                $('<div/>').addClass('col-sm-3').append(
                    $('<div/>').addClass('site-block').append(link)
                )
            );
        })
    });
});

function extractDomain(url) {
    var domain;
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }
    domain = domain.split(':')[0];

    return domain;
}
