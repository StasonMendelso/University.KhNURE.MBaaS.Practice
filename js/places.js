var findForm = document.forms['find-places'];

initFindForm();

function initFindForm() {

    const queryBuilder = Backendless.DataQueryBuilder.create();
    queryBuilder.addProperties('category');
    Backendless.Data.of("Places").find(queryBuilder)
        .then(data => {
            if (!data || data.length === 0) {
                return;
            }
            let categorySet = new Set();
            for (const category of data) {
                categorySet.add(category.category);
            }
            console.log(categorySet);
            for(let category of categorySet){
                var newOption = document.createElement('option');

                newOption.value = category;
                newOption.text = category;
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

var placeList = document.querySelector(".places__list");
var queryBuilder = Backendless.DataQueryBuilder.create();
queryBuilder.addAllProperties();
queryBuilder.addProperty("authorId.objectId as authorId");
queryBuilder.setRelated(["savedBy", "hashtags", "likedBy"]);

Backendless.Data.of("Places").find(queryBuilder)
    .then(renderList)
    .catch(alert);


findForm.addEventListener("submit", event => {
    event.preventDefault();

    let whereClause = null;
    let queryBuilder = Backendless.DataQueryBuilder.create();
    queryBuilder.addAllProperties();
    queryBuilder.addProperty("authorId.objectId as authorId");
    queryBuilder.setRelated(["savedBy", "hashtags", "likedBy"]);
    let nameValue = findForm['name'].value;
    let category = findForm['category'].value;
    let radius = findForm['radius'].value;
    if (nameValue === '') {
        addClause("name LIKE '%'");
    } else {
        addClause(`name LIKE '%${nameValue}%'`);
    }
    if (category !== '') {
        addClause(`category = '${category}'`);
    }
    if (radius > 0) {
        let latitudeValue = findForm['latitude'].value;
        let longitudeValue = findForm['longitude'].value;
        addClause(`distanceOnSphere(coordinates, 'POINT(${longitudeValue} ${latitudeValue})') <= ${radius}`);
    }

    console.log(whereClause);
    queryBuilder.setWhereClause(whereClause);

    Backendless.Data.of("Places").find(queryBuilder)
        .then(renderList)
        .catch(alert);

    function addClause(clause) {
        if (whereClause) {
            whereClause = whereClause + " AND " + clause;
        } else {
            whereClause = clause;
        }
    }
})