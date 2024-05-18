var hashtagInputHtml = `<div class="hashtag__input__group">\
                                        <span>#</span>\
                                        <input id="hashtag" type="text" name="hashtag" class="input__field hashtag__input__field">\
                                        <button type="button" class="button hashtag-delete__button">Видалити</button>\
                                    </div>`;
var hashtagInputGroup = document.querySelector(".hashtag__group");
document.querySelector(".hashtag-add__button").addEventListener("click", event => {
    let tempContainer = document.createElement('div');
    tempContainer.innerHTML = hashtagInputHtml;
    tempContainer.firstElementChild.querySelector(".hashtag-delete__button").addEventListener('click', event => {
        event.target.parentNode.remove();
    });
    hashtagInputGroup.appendChild(tempContainer.firstElementChild);
});

var queryBuilder = Backendless.DataQueryBuilder.create()
queryBuilder.setProperties(['category']);
Backendless.Data.of("Places").find(queryBuilder)
    .then(categories => {
        var categoryDatalist = document.querySelector("#categories");
        let categoriesSet = new Set();
        for (const category of categories) {
            categoriesSet.add(category.category);
        }
        categoriesSet.forEach(element => {
            var option = document.createElement("option");
            option.value = element;
            categoryDatalist.appendChild(option);
        })
    })
    .catch(alert);

var addForm = document.forms['add-place'];

addForm.addEventListener('submit', event => {
    event.preventDefault();
    console.log(addForm.elements);

    let errorsDiv = addForm.querySelector(".errors__place-adding");
    errorsDiv.classList.remove("active");
    errorsDiv.childNodes.forEach(node => {
        node.remove()
    });

    let submitButton = addForm.querySelector(".submit__button");
    submitButton.disabled = true;

    var coordinates = new Backendless.Data.Point();
    coordinates.setLongitude(parseFloat(addForm['longitude'].value));
    coordinates.setLatitude(parseFloat(addForm['latitude'].value));
    var place = {
        name: addForm['name'].value,
        coordinates: coordinates,
        description: addForm['description'].value,
        category: addForm['category'].value,
    }


    Backendless.Data.of("Places").save(place)
        .then(place => {
            let promises = [];
            Backendless.Data.of("Places").setRelation({objectId: place.objectId}, "authorId", [{objectId: Backendless.UserService.currentUser.objectId}])
                .then(data=>{
                    if (addForm['hashtag'] instanceof NodeList) {
                        for (let aHashtag of addForm['hashtag']) {
                            addHashtag(aHashtag.value, promises, place);
                        }
                    } else if (addForm['hashtag'] instanceof Object) {
                        addHashtag(addForm['hashtag'].value, promises, place);
                    }
                    Promise.all(promises)
                        .then(data=>{
                            if (addForm['image'].files.length > 0) {
                                let files = addForm['image'].files;
                                let name = place['name'];
                                var file = files[0];
                                file = new File([file], name, {
                                    type: file.type,
                                    lastModified: file.lastModified,
                                });
                                Backendless.Files.upload(file, ROOT_PLACES_DIRECTORY, false)
                                    .then(function (fileReference) {
                                        console.log(fileReference);
                                        console.log("setting relation file");
                                        Backendless.Data.of("Places").save({objectId: place['objectId'], imageLink: fileReference.fileURL})
                                            .then(data=>{
                                                console.log(data);
                                               placeAdded(place);
                                            })
                                            .catch(function (error) {
                                                console.log("error during adding imageLink to table - " + error.message);
                                            });
                                    })
                                    .catch(function (error) {
                                        console.log("error during uploading a file - " + error.message);
                                    });
                            }else{
                                placeAdded(place);
                            }
                        })
                });
        })
        .catch(gotError);

    function placeAdded(place) {
        console.log("added");
        console.log(place);
        window.location.href = `/places-show?objectId=${place.objectId}`;
    }

    function gotError(err) {
        let spanElement = document.createElement("span");
        spanElement.innerText = err;
        errorsDiv.appendChild(spanElement);
        errorsDiv.classList.add("active");
        submitButton.disabled = false;
    }

    function addHashtag(hashtag, promises, place) {
        console.log(hashtag);
        let queryBuilder =Backendless.DataQueryBuilder.create();
        queryBuilder.setWhereClause(`name = '${hashtag}'`);
        promises.push(Backendless.Data.of("Hashtags").find(queryBuilder)
            .then(data => {
                if (data.length === 0) {
                    promises.push(Backendless.Data.of("Hashtags").save({name: hashtag})
                        .then(data => {
                            Backendless.Data.of("Places").addRelation({objectId: place['objectId']}, "hashtags", [{objectId: data.objectId}]);
                        })
                        .catch(error=>{
                            console.log("error during saving new hashtag")
                        }));
                } else {
                    Backendless.Data.of("Places").addRelation({objectId: place['objectId']}, "hashtags", [{objectId: data[0].objectId}]);
                }
            })
            .catch(error=>{
                console.log("error during finding hashtag")
            }));
    }
})
initAddForm()
function initAddForm(){
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                addForm['longitude'].value = longitude;
                addForm['latitude'].value = latitude;
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