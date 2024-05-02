fetchContentAndHandle(
    'views/header.html',
    function (data) {
        let header = getElementFromBody(data, '.header');
        if (!header) return;

        document.querySelector("header").outerHTML = header.outerHTML;
    }
);

function refreshHeader() {
    if (Backendless.UserService.currentUser) {
        //todo check if valid on server
        document.querySelector(".menu__log__item").classList.add("logged");
    } else {
        document.querySelector(".menu__log__item").classList.remove("logged");
    }
}

var placesSubmenu = document.querySelector(".places__submenu");
document.addEventListener("click", event => {
    if (event.target.getAttribute("data-submenu-name") === "places") {
        placesSubmenu.classList.add("active");
        placesSubmenu.classList.remove("disabled");
    } else if (!event.target.closest("header")) {
        placesSubmenu.classList.add("disabled");
        placesSubmenu.classList.remove("active");
    }
});

