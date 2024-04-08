getURL(
    '../html/fragments/header.html',
    function (data) {
        let el = document.createElement("body");
        el.innerHTML = data;

        let header = el.querySelector('.header');
        if (!header) return;

        document.querySelector("header").outerHTML = header.outerHTML;
    }
);