const ROOT_DIRECTORY = "/web/users";
function getElementFromBody(htmlPage, querySelector) {
    let el = document.createElement("body");
    el.innerHTML = htmlPage;

    return el.querySelector(querySelector);
}


function fetchContentAndHandle(url, success, error) {
    if (!window.XMLHttpRequest) return;
    let request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status !== 200) {
                if (error && typeof error === 'function') {
                    error(request.responseText, request);
                }
                return;
            }
            if (success && typeof success === 'function') {
                success(request.responseText);
            }
        }
    };
    request.open('GET', url, false);
    request.send();
};

function fetchContent(url, extractor, error) {
    let result;
    if (!window.XMLHttpRequest) return;
    let request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status !== 200) {
                if (error && typeof error === 'function') {
                    error(request.responseText, request);
                }
                return;
            }
            if (extractor && typeof extractor === 'function') {
                result = extractor(request.responseText);
            }
        }
    };
    request.open('GET', url, false);
    request.send();
    return result;

};
initApp();
async function initApp(){
    const APP_ID = 'D6BB7AB9-473E-1462-FF54-292662C3A500';
    const API_KEY = 'E3BA72F7-CBF3-401C-8B0C-B352D52FE4E3';

    Backendless.serverURL = 'https://eu-api.backendless.com';
    await Backendless.initApp(APP_ID, API_KEY);

    await setCurrentUserIfLoggedOnServer()
}



async function setCurrentUserIfLoggedOnServer() {
    let key = "Backendless_D6BB7AB9-473E-1462-FF54-292662C3A500";
    let userTokenLs = JSON.parse(localStorage.getItem(key))[`user-token`];
    if (userTokenLs) {
        if (await Backendless.UserService.isValidLogin()) {
            Backendless.UserService.getCurrentUser(true).then(()=>{
                refreshHeader();
                document.dispatchEvent(new Event('globalScriptLoaded'));
            });
        } else {
            localStorage.removeItem(key);
        }
    }
}
