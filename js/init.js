routes = {
    '/': fetchContent('views/init.html', function (data) {
        return getElementFromBody(data, '#init-content');
    }),
    '/register': fetchContent('views/register.html', function (data) {
        return getElementFromBody(data, '#register-content');
    })
};

let contentDiv = document.getElementById('content');
contentDiv.innerHTML = getContentByRoute(window.location.pathname);
function getContentByRoute(path){
    let content = routes[path];
    if (!content){
        return "<span>Щось пішло не так, спробуйте пізніше :(</span>";
    }
    return content.innerHTML;
}
let onNavItemClick = (pathName) => {
    window.history.pushState(
        {},
        pathName,
        window.location.origin + pathName
    );
    contentDiv.innerHTML = getContentByRoute(pathName);
}

window.onpopstate = () => {
    contentDiv.innerHTML = getContentByRoute(window.location.pathname);
}