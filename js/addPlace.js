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

const queryBuilder = Backendless.DataQueryBuilder.create()
queryBuilder.setProperties(['category']);
Backendless.Data.of("Places").find(queryBuilder)
    .then(categories =>{
        var categoryDatalist = document.querySelector("#categories");
        for (const category of categories) {
            var option = document.createElement("option");
            option.value = category;
            categoryDatalist.appendChild(option);
        }
    })
    .catch(alert);

var addForm = document.forms['add-place'];

addForm.addEventListener('submit', event=>{
    event.preventDefault();
    console.log(addForm.elements);
})