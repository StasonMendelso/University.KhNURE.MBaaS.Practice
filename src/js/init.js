var getURL = function (url, success, error) {
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
                success(request.responseText, request);
            }
        }
    };
    request.open('GET', url);
    request.send();
};

const APP_ID = 'D6BB7AB9-473E-1462-FF54-292662C3A500';
const API_KEY = 'E3BA72F7-CBF3-401C-8B0C-B352D52FE4E3';
const BACKENDLESS_INITIALIZED_APP_KEY = "BackendlessInitializedApp";


    Backendless.serverURL = 'https://eu-api.backendless.com';
    Backendless.initApp(APP_ID, API_KEY);
