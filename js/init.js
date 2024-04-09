routes = {
    '/': fetchContent('views/init.html', function (data) {
        return getElementFromBody(data, '#init-content');
    }),
    '/register': fetchContent('views/register.html', function (data) {
        return getElementFromBody(data, '#register-content');
    })
};
const SCRIPT_TAG_REGEX = /<script\b[^>]*>/;

const CONTENT_DIV = document.getElementById('content');
setContentAndJsScripts(window.location.pathname);
function getContentByRoute(path){
    let content = routes[path];
    if (!content){
        let htmlSpanElement = document.createElement("span");
        htmlSpanElement.textContent = "Щось пішло не так, спробуйте пізніше :(";
        return htmlSpanElement;
    }
    return content;
}
let onNavItemClick = (pathName) => {
    window.history.pushState(
        {},
        pathName,
        window.location.origin + pathName
    );
    setContentAndJsScripts(pathName);
}

window.onpopstate = () => {
    setContentAndJsScripts(window.location.pathname);
}
function setContentAndJsScripts(path){
    let content = getContentByRoute(path);
    CONTENT_DIV.innerHTML = content.innerHTML;

    if (content.innerHTML.match(SCRIPT_TAG_REGEX)){
        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = content.innerHTML;
        let scripts = tempDiv.querySelectorAll("script");
        for (let script of scripts){
            const newScript = document.createElement('script');
            newScript.src = script.src;
            if (CONTENT_DIV.querySelector(`script[src='${script.src}']`)){
                continue;
            }
            CONTENT_DIV.appendChild(newScript);
        }

    }
}