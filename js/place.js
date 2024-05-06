var urlParams = new URLSearchParams(window.location.search);
var placeObjectId = urlParams.get('objectId');
var queryBuilder = Backendless.DataQueryBuilder.create();
queryBuilder.addAllProperties();
queryBuilder.addProperty("authorId.objectId as authorId");
queryBuilder.setRelated(["savedBy", "hashtags", "likedBy"]);

if (placeObjectId) {
    Backendless.Data.of("Places").findById(placeObjectId, queryBuilder)
        .then(place => {
            if (!place) {
                alert("Nothing was found for passed objectId. Check the value of objectId!");
                return;
            }
            var element = document.querySelector(".place__item");
            renderPlaceItem(element,place);
            let coordinates = place['coordinates'];

            var map;

            async function initMap() {
                // The location of Uluru
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
                    title: "Uluru",
                });
            }

            initMap();
        })

} else {
    alert("Pass objectId for getting info about certain place in query param!");
}








