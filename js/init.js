const rootRoute = "/University.KhNURE.MBaaS.Practice";


let homePage = "<span>Вітаємо на початковій сторінці Social Network!</span>";
routes = {
    '/': homePage,
    '/register': fetchContent('views/register.html', function (data) {
        return getElementFromBody(data, '#register-content');
    })
};

let contentDiv = document.getElementById('content');
console.log(window.location.pathname);
contentDiv.innerHTML = getContentByRouteOrDefault(window.location.pathname);

function getContentByRouteOrDefault(path){
    let content = routes[path];
    if (!content){
        return homePage;
    }
    return content;
}
function getContentByRoute(path){
    let content = routes[path];
    console.log(content);
    if (!content){
        return "<span>Щось пішло не так, спробуйте пізніше :(</span>";
    }
    return content.innerHTML;
}
let onNavItemClick = (pathName) => {
    console.log(window.location.origin);
    console.log(pathName);
    window.history.pushState(
        {},
        pathName,
        window.location.origin + rootRoute + pathName
    );
    contentDiv.innerHTML = getContentByRoute(pathName);
}
window.onpopstate = () => {
    contentDiv.innerHTML = getContentByRoute(window.location.pathname);
}