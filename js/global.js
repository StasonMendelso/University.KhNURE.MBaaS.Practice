const ROOT_DIRECTORY = "/web/users";
const APP_ID = 'D6BB7AB9-473E-1462-FF54-292662C3A500';
const API_KEY = 'E3BA72F7-CBF3-401C-8B0C-B352D52FE4E3';
const REST_API_KEY = `5F4C8D91-4877-4EDE-85D7-9E5D416FA99E`;
const DOMAIN = `https://eu.backendlessappcontent.com`;

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
document.addEventListener('globalScriptLoaded', sendGeolocationIfNeeded);
initApp();

async function initApp() {


    Backendless.serverURL = 'https://eu-api.backendless.com';
    await Backendless.initApp(APP_ID, API_KEY);

    await setCurrentUserIfLoggedOnServer()
}

async function setCurrentUserIfLoggedOnServer() {
    let key = "Backendless_D6BB7AB9-473E-1462-FF54-292662C3A500";
    let userTokenLs = JSON.parse(localStorage.getItem(key))[`user-token`];
    if (userTokenLs) {
        if (await Backendless.UserService.isValidLogin()) {
            Backendless.UserService.getCurrentUser(true).then(() => {
                refreshHeader();
                Backendless.UserService.currentUser['user-token'] = userTokenLs;
                document.dispatchEvent(new Event('globalScriptLoaded'));
            });
        } else {
            localStorage.removeItem(key);
        }
    }
}

function sendGeolocationIfNeeded() {
    Backendless.UserService.getCurrentUser(true).then(
        currentUser => {
            if (currentUser['track_geolocation']) {

                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            const latitude = position.coords.latitude;
                            const longitude = position.coords.longitude;

                            var point = new Backendless.Data.Point();
                            point.setLongitude(longitude)
                                .setLatitude(latitude);
                            currentUser['last_coordinates'] = point;
                            Backendless.UserService.update(currentUser)
                                .then(data => {
                                    console.log("sended geolocation");
                                })
                                .catch(console.log);
                        },
                        function (error) {
                            switch (error.code) {
                                case error.PERMISSION_DENIED:
                                    alert("User denied the request for Geolocation.");
                                    break;
                                case error.POSITION_UNAVAILABLE:
                                    console.error("Location information is unavailable.");
                                    break;
                                case error.TIMEOUT:
                                    console.error("The request to get user location timed out.");
                                    break;
                                default:
                                    console.error("An unknown error occurred.");
                                    break;
                            }
                        }
                    );
                } else {
                    console.error("Geolocation is not supported by this browser.");
                }
            }
        }
    )

}

setInterval(sendGeolocationIfNeeded, 60 * 1000)