const ROOT_USERS_DIRECTORY = "/web/users";
const ROOT_PLACES_DIRECTORY = "/web/places";
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


function renderList(places) {
    const placeHTML = '<div class = "places__list-item" data-place-id>\
                                    <div class = "place__image">\
                                        <img src = "/assets/img/place_image_not_found.jpg" data-field-name="image">\
                                    </div>\
                                    <div class = "place__information">\
                                        <div class = "place__header">\
                                            <div class = "place__main-info">\
                                                <div class="place__main-info-left">\
                                                    <a href="" class = "place__name" data-field-name="name">Name</a>\
                                                    <p class = "place__category" data-field-name="category">Category</p>\
                                                    <div class = "place__hashtags" data-field-name="hashtags">\
                                                      \
                                                    </div>\
                                                </div>\
                                                <div class="place__main-info-right">\
                                                    <div>\
                                                        <span class = "place__longitude-name" >Довжина:</span>\
                                                        <span class = "place__longitude-value" data-field-name="longitude">23.5456</span>\
                                                    </div>\
                                                    <div>\
                                                        <span class = "place__latitude-name">Широта:</span>\
                                                        <span class = "place__latitude-value" data-field-name="latitude">36.5456</span>\
                                                    </div>\
                                                </div>\
                                            </div>\
                                            <div class = "place__actions">\
                                                <button class = "button" name="remove-btn">Видалити</button>\
                                            </div>\
                                        </div>\
                                        <div class = "place__body">\
                                            <div class = "place__description" data-field-name="description">Description</div>\
                                        </div>\
                                        <div class = "place__footer">\
                                            <div class = "place__likes__container">\
                                                <button class="button" name="like-btn">Like</button>\
                                                <span>Likes:</span>\
                                                <span data-field-name="likes">0</span>\
                                            </div>\
                                            <div class = "place__saved__container">\
                                                <span>Saved</span>\
                                                <input type = "checkbox" name = "place-saved" data-field-name="saved">\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>';

    placeList.innerHTML = '';
    for (let place of places) {
        let placeDiv = document.createElement("div");
        placeDiv.innerHTML = placeHTML;
        renderPlaceItem(placeDiv, place);
        placeList.appendChild(placeDiv);
    }
}

function renderPlaceItem(element, place) {
    var placeObjectId = place['objectId'];
    var userObjectId = Backendless.UserService.currentUser.objectId;
    const hashtagHtml = '<span class = "place__hashtag">hashtag</span>';
    console.log(place);
    element.querySelector("[data-field-name='name']").innerText = place['name'];
    element.querySelector("[data-field-name='name']").href = `/places-show?objectId=${placeObjectId}`;
    element.querySelector("[data-field-name='category']").innerText = place['category'];
    element.querySelector("[data-field-name='description']").innerText = place['description'];
    element.querySelector("[data-field-name='longitude']").innerText = place['coordinates'].lng;
    element.querySelector("[data-field-name='latitude']").innerText = place['coordinates'].lat;
    element.querySelector("[data-field-name='likes']").innerText = place['likedBy'].length;

    let removeBtn = element.querySelector("button[name='remove-btn']");

    if (place['authorId'] === userObjectId) {
        removeBtn.disabled = false;
    } else {
        removeBtn.disabled = true;
    }
    let saved = false;
    for (let savedBy of place['savedBy']) {
        if (savedBy['objectId'] === userObjectId) {
            saved = true;
            break;
        }
    }
    var savedCheckbox = element.querySelector("[data-field-name='saved']");
    savedCheckbox.checked = saved;

    for (const hashtag of place['hashtags']) {
        let divParent = document.createElement("div");
        divParent.innerHTML = hashtagHtml;
        let span = divParent.firstElementChild;
        span.innerText = '#' + hashtag['name'];
        element.querySelector("[data-field-name='hashtags']").appendChild(span);
    }
    element.querySelector("[data-place-id]").setAttribute("data-place-id", placeObjectId);
    //listeners
    let likeBtn = element.querySelector("button[name='like-btn']");
    for (let user of place['likedBy']) {
        if (userObjectId === user.objectId) {
            likeBtn.innerText = 'Unlike';
            break;
        }
    }
    likeBtn.addEventListener("click", event => {
        var queryBuilder = Backendless.DataQueryBuilder.create();
        queryBuilder.setRelated(["likedBy"]);

        Backendless.Data.of("Places").findById(placeObjectId, queryBuilder)
            .then(freshPlace => {
                for (let user of freshPlace['likedBy']) {
                    if (userObjectId === user.objectId) {
                        Backendless.Data.of("Places").deleteRelation({objectId: placeObjectId}, "likedBy", [{objectId: userObjectId}])
                            .then(data => {
                                likeBtn.innerText = 'Like';
                                element.querySelector("[data-field-name='likes']").innerText = freshPlace['likedBy'].length - 1;
                            })
                            .catch(alert);
                        return;
                    }
                }
                Backendless.Data.of("Places").addRelation({objectId: placeObjectId}, "likedBy", [{objectId: userObjectId}])
                    .then(data => {
                        likeBtn.innerText = 'Unlike';
                        element.querySelector("[data-field-name='likes']").innerText = freshPlace['likedBy'].length + 1;
                    })
                    .catch(alert);
            })
            .catch(alert);
    });

    savedCheckbox.addEventListener('change', event => {
        if (savedCheckbox.checked) {
            Backendless.Data.of("Places").addRelation({objectId: placeObjectId}, "savedBy", [{objectId: userObjectId}])
                .then()
                .catch(alert);
        } else {
            Backendless.Data.of("Places").deleteRelation({objectId: placeObjectId}, "savedBy", [{objectId: userObjectId}])
                .then()
                .catch(alert);
        }
    });

    removeBtn.addEventListener('click', event => {
        if (place['authorId'] !== userObjectId) {
            alert("You can't delete!");
            return;
        }
        Backendless.Data.of("Places").remove(placeObjectId)
            .then(data => {
                if (window.location.pathname === "/places-show") {
                    alert("Місце було видалено");
                    window.location.pathname = "/places";
                } else {
                    window.location.reload();
                }
            })
            .catch(alert);

        if (place['imageLink']) {
            var splitted = place['imageLink'].split('/');
            Backendless.Files.remove(ROOT_PLACES_DIRECTORY + "/" + splitted[splitted.length - 1])
                .then()
                .catch(alert);
        }
    });
    //image
    if (place['imageLink']) {
        var headers = new Headers();
        headers.append('user-token', Backendless.UserService.currentUser['user-token']);

        var options = {
            method: 'GET',
            headers: headers
        };
        let url = place['imageLink'];
        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                const img = element.querySelector("[data-field-name='image']");
                img.src = blobUrl;
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }

}