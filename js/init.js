routes = {
    '/': () => fetchContent('views/init.html', function (data) {
        return getElementFromBody(data, '#init-content');
    }),
    '/register': () => fetchContent('views/register.html', function (data) {
        return getElementFromBody(data, '#register-content');
    }),
    '/login': () => fetchContent('views/login.html', function (data) {
        return getElementFromBody(data, '#login-content');
    }),
    '/logout': () => {
        Backendless.UserService.logout()
            .then(() => {
                refreshHeader();
                historyPush("/login");
            })
            .catch();

        return routes[`/login`]();
    },
    '/reset': () => fetchContent('views/resetPassword.html', function (data) {
        return getElementFromBody(data, '#reset-password-content');
    }),
};
const SCRIPT_TAG_REGEX = /<script\b[^>]*>/;

const CONTENT_DIV = document.getElementById('content');
setContentAndJsScripts(window.location.pathname);

function getContentByRoute(path) {
    let content = routes[path];
    let htmlSpanElement = document.createElement("span");
    htmlSpanElement.textContent = "Щось пішло не так, спробуйте пізніше :(";
    if (!content) {
        return htmlSpanElement;
    }

    return content() ?? htmlSpanElement;
}

let onNavItemClick = (pathName) => {
    historyPush(pathName);
    setContentAndJsScripts(pathName);
}
function historyPush(path) {
    window.history.pushState(
        {},
        path,
        window.location.origin + path
    );
}
window.onpopstate = () => {
    setContentAndJsScripts(window.location.pathname);
}

function setContentAndJsScripts(path) {
    let content = getContentByRoute(path);
    CONTENT_DIV.innerHTML = content.innerHTML;

    if (content.innerHTML.match(SCRIPT_TAG_REGEX)) {
        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = content.innerHTML;
        let scripts = tempDiv.querySelectorAll("script");
        for (let script of scripts) {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            if (CONTENT_DIV.querySelector(`script[src='${script.src}']`)) {
                continue;
            }
            CONTENT_DIV.appendChild(newScript);
        }

    }
}