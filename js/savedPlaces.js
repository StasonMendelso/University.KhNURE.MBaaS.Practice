var userId = Backendless.UserService.currentUser.objectId;
var placeList = document.querySelector(".places__list");
var queryBuilder = Backendless.DataQueryBuilder.create();
queryBuilder.addAllProperties();
queryBuilder.addProperty("authorId.objectId as authorId");
queryBuilder.setRelated(["savedBy", "hashtags", "likedBy"]);

Backendless.Data.of("Places").find(queryBuilder)
    .then(places => {
        places = places.filter(place => {
            for (let user of place['savedBy']){
                if (user.objectId === userId){
                    return true;
                }
            }
            return false;
        });
        renderList(places);
    })
    .catch(alert);