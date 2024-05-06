
initFindForm();
function initFindForm(){
    var findForm = document.forms['find-places'];

    const queryBuilder = Backendless.DataQueryBuilder.create();
    queryBuilder.addProperties('category');
    Backendless.Data.of("Places").find(queryBuilder)
        .then(data=>{
            if (!data || data.length === 0){
                return;
            }
            for (const category of data) {
                var newOption = document.createElement('option');

                newOption.value = category['category'];
                newOption.text =  category['category'];
                findForm['category'].appendChild(newOption);
            }
        })
        .catch(alert);

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

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

}
