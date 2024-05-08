var urlParams = new URLSearchParams(window.location.search);
var placeObjectId = urlParams.get('objectId');
var queryBuilder = Backendless.DataQueryBuilder.create();
queryBuilder.addAllProperties();
queryBuilder.addProperty("authorId.objectId as authorId");
queryBuilder.setRelated(["savedBy", "hashtags", "likedBy"]);
Backendless.UserService.getCurrentUser();
var coordinates;
if (placeObjectId) {
    Backendless.Data.of("Places").findById(placeObjectId, queryBuilder)
        .then(place => {
            if (!place) {
                alert("Nothing was found for passed objectId. Check the value of objectId!");
                document.querySelector("#content").innerHTML = "";
                return;
            }
            coordinates = place['coordinates'];
            var element = document.querySelector(".place__item");
            renderPlaceItem(element,place);
            //google map
            (g => {
                var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document,
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

            var map;

            async function initMap() {

                const position = {lat: coordinates.lat, lng: coordinates.lng};
                const {Map} = await google.maps.importLibrary("maps");
                const {AdvancedMarkerElement} = await google.maps.importLibrary("marker");

                map = new Map(document.getElementById("map"), {
                    zoom: 4,
                    center: position,
                    mapId: "DEMO_MAP_ID",
                });

                const marker = new AdvancedMarkerElement({
                    map: map,
                    position: position,
                    title: place.name,
                });
            }
            initMap();
        })
        .catch(error=>{
            console.error(error);
            document.querySelector("#content").innerHTML = "<span>Нічого не знайдено за вказаним ідентифікатором.</span>";
        });

} else {
    alert("Pass objectId for getting info about certain place in query param!");
}






