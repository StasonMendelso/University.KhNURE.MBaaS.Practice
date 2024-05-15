routes = {
    '/': {
        authorize: false,
        content: () => fetchContent('/views/init.html', function (data) {
            return getElementFromBody(data, '#init-content');
        })
    },
    '/register': {
        authorize: false,
        content: () => fetchContent('/views/register.html', function (data) {
            return getElementFromBody(data, '#register-content');
        })
    },
    '/login': {
        authorize: false,
        content: () => fetchContent('/views/login.html', function (data) {
            return getElementFromBody(data, '#login-content');
        })
    },
    '/logout': {
        authorize: false,
        content: () => {
            Backendless.UserService.logout()
                .then(() => {
                    refreshHeader();
                    historyPush("/login");
                })
                .catch();

            return routes[`/login`].content();
        }
    },
    '/reset': {
        authorize: false,
        content: () => fetchContent('/views/resetPassword.html', function (data) {
            return getElementFromBody(data, '#reset-password-content');
        })
    },
    '/profile': {
        authorize: true,
        content: () => fetchContent('/views/profile.html', function (data) {
            return getElementFromBody(data, '#profile-content');
        })
    },
    '/profile/edit': {
        authorize: true,
        content: () => fetchContent('/views/profile_edit.html', function (data) {
            return getElementFromBody(data, '#profile-edit-content');
        })
    },
    '/files': {
        authorize: true,
        content: () => fetchContent('/views/files.html', function (data) {
            return getElementFromBody(data, '#files-content');
        })
    },
    '/places': {
        authorize: true,
        content: () => fetchContent('/views/places/places.html', function (data) {
            return getElementFromBody(data, '#places-find-content');
        })
    },
    '/places-show': {
        authorize: true,
        content: () => fetchContent('/views/places/place.html', function (data) {
            return getElementFromBody(data, '#place-content');
        })
    },
    '/places-add': {
        authorize: true,
        content: () => fetchContent('/views/places/add.html', function (data) {
            return getElementFromBody(data, '#places-add-content');
        })
    },
    '/places-saved': {
        authorize: true,
        content: () => fetchContent('/views/places/saved.html', function (data) {
            return getElementFromBody(data, '#places-saved-content');
        })
    },
    '/friends': {
        authorize: true,
        content: () => fetchContent('/views/friends/myFriends.html', function (data) {
            return getElementFromBody(data, '#myFriends-content');
        })
    },
    '/friends-add': {
        authorize: true,
        content: () => fetchContent('/views/friends/addFriend.html', function (data) {
            return getElementFromBody(data, '#addFriend-content');
        })
    },
    '/invitations': {
        authorize: true,
        content: () => fetchContent('/views/friends/friendsInvitations.html', function (data) {
            return getElementFromBody(data, '#friendsInvitations-content');
        })
    },
};
const SCRIPT_TAG_REGEX = /<script\b[^>]*>/;

const CONTENT_DIV = document.getElementById('content');

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

setContentAndJsScripts(window.location.pathname);
function onNavItemClick(pathName){
    historyPush(pathName);
    setContentAndJsScripts(pathName);
}
function getContentByRoute(path) {
    let htmlSpanElement = document.createElement("span");
    htmlSpanElement.textContent = "Щось пішло не так, спробуйте пізніше :(";
    let route = routes[path];
    if (!route){
        return htmlSpanElement;
    }
    if (route.authorize && path !== "/login") {
        // if (!Backendless.UserService.currentUser){
        //     onNavItemClick("/login");
        //     return;
        // }
        // if (!Backendless.UserService.isValidLogin()){
        //     onNavItemClick("/login");
        //     return;
        // }
    }
    let content = route.content;

    if (!content) {
        return htmlSpanElement;
    }

    return content() ?? htmlSpanElement;
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
