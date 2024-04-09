fetchContentAndHandle(
    'views/header.html',
    function (data) {
            let header = getElementFromBody(data, '.header');
            if (!header) return;

        document.querySelector("header").outerHTML = header.outerHTML;
    }
);

