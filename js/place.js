var urlParams = new URLSearchParams(window.location.search);
var placeObjectId = urlParams.get('objectId');
if (placeObjectId) {
    Backendless.Data.of("Places").findById(placeObjectId)
        .then(data => {
            if (!data) {
                alert("Nothing was found for passed objectId. Check the value of objectId!");
                return;
            }


            var map;

            async function initMap() {
                // The location of Uluru
                const position = {lat: 49.344, lng: 30.031};
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
        .catch(alert);

} else {
    alert("Pass objectId for getting info about certain place in query param!");
}








