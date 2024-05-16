var findForm = document.forms['find-friends'];

initFindForm();
var map;
var markers = [];
var youMarker;

async function initFindForm() {
    let curPosition = {lat: 40, lng: 40};
    //google map
    (g => {
        var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__",
            m = document,
            b = window;
        b = b[c] || (b[c] = {});
        var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams,
            u = () => h || (h = new Promise(async (f, n) => {
                await (a = m.createElement("script"));
                e.set("libraries", [...r] + "");
                for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]);
                e.set("callback", c + ".maps." + q);
                a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
                d[q] = f;
                a.onerror = () => h = n(Error(p + " could not load."));
                a.nonce = m.querySelector("script[nonce]")?.nonce || "";
                m.head.append(a)
            }));
        d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n))
    })
    ({key: "AIzaSyBBRX3pVXWVpmxtAgmTV-X2wF6I3X3dtwc", v: "weekly"});
    var {Map} = await google.maps.importLibrary("maps");
    map = new Map(document.getElementById("map"), {
        zoom: 12,
        center: curPosition,
        mapId: "DEMO_MAP_ID",
    });
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                curPosition = {lat: latitude, lng: longitude};
                map.setCenter(curPosition);
                findForm['longitude'].value = longitude;
                findForm['latitude'].value = latitude;
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


    async function initMap() {
        var {InfoWindow} = await google.maps.importLibrary("maps");
        var {AdvancedMarkerElement, PinElement} = await google.maps.importLibrary("marker");

        Backendless.UserService.getCurrentUser()
            .then(user=>{
                const coordinates = user['last_coordinates']
                const position = {lat: coordinates.lat, lng: coordinates.lng};
                map.setCenter(position);
                findForm['longitude'].value = position.lng;
                findForm['latitude'].value = position.lat;
                const pinBackground = new PinElement({
                    background: "#529aff",
                });
                const infoWindow = new InfoWindow();
                youMarker = new AdvancedMarkerElement({
                    map: map,
                    position: position,
                    title: 'YOU',
                    gmpClickable: true,
                    content: pinBackground.element,
                });
                youMarker.addListener("click", ({ domEvent, latLng }) => {
                    const { target } = domEvent;

                    infoWindow.close();
                    infoWindow.setContent(youMarker.title);
                    infoWindow.open(youMarker.map, youMarker);
                });
            });
    }

    initMap();
}

async function renderFriendOnMap(friends) {
    var {InfoWindow} = await google.maps.importLibrary("maps");
    var {AdvancedMarkerElement} = await google.maps.importLibrary("marker");
    const infoWindow = new InfoWindow();
    markers.forEach(marker => {
        marker.setMap(null);
    });
    markers = [];
    for (let friend of friends) {
        let coordinates = friend['last_coordinates'];
        const position = {lat: coordinates.lat, lng: coordinates.lng};
        let marker = new AdvancedMarkerElement({
            map: map,
            position: position,
            title: friend['username'],
            gmpClickable: true,
        });
        marker.addListener("click", ({ domEvent, latLng }) => {
            const { target } = domEvent;

            infoWindow.close();
            infoWindow.setContent(marker.title);
            infoWindow.open(marker.map, marker);
        });
        markers.push(marker);
    }
}

findForm.addEventListener("submit", event => {
    event.preventDefault();
    var currentUser = Backendless.UserService.currentUser;
    let whereClause = null;
    let queryBuilder = Backendless.DataQueryBuilder.create();
    queryBuilder.addAllProperties();
    queryBuilder.setRelated(["friends"]);
    let radius = findForm['radius'].value;
    let latitudeValue = findForm['latitude'].value;
    let longitudeValue = findForm['longitude'].value;
    let position = {lat: parseFloat(latitudeValue),lng: parseFloat(longitudeValue)};
    youMarker.position = position;
    map.setCenter(position);
    addClause(`distanceOnSphere(last_coordinates, 'POINT(${longitudeValue} ${latitudeValue})') <= ${radius}`);

    addClause(`'${currentUser.objectId}' in (friends)`);
    addClause(`track_geolocation = true`);

    console.log(whereClause);
    queryBuilder.setWhereClause(whereClause);

    Backendless.Data.of("Users").find(queryBuilder)
        .then(renderFriendOnMap)
        .catch(alert);

    function addClause(clause) {
        if (whereClause) {
            whereClause = whereClause + " AND " + clause;
        } else {
            whereClause = clause;
        }
    }
})