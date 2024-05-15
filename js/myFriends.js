var myFriendsList = document.querySelector(".myFriends__list");


Backendless.UserService.getCurrentUser()
    .then(currentUser => {
        Backendless.Data.of("Users").findById(currentUser.objectId, {
            relations: ["friends"]
        })
            .then(currentUser => {
                console.log(currentUser);
                let friends = currentUser['friends'];
                for (let friend of friends) {
                    console.log(friend);
                    addFriend(friend, currentUser);
                }
            })
            .catch(alert);
    })
var friendHTML = `<div class="friend">
                            <div class="friend__info">
                                <span class="friend-email">test@gmail.com</span>
                                <span class="friend-username">Username</span>
                            </div>
                            <div class="friend__actions">
                                <button class="button friend__delete__button" data-field-id="2hft">Видалити</button>
                            </div>
                        </div>`;

function addFriend(friend, currentUser) {
    let div = document.createElement('div');
    div.innerHTML = friendHTML;
    div.querySelector(".friend-email").innerText = friend.email;
    div.querySelector(".friend-username").innerText = friend.username;
    var element = div.querySelector("[data-field-id]");
    element.setAttribute('data-field-id', friend.objectId);

    var removeButton = div.querySelector(".friend__delete__button");
    removeButton.addEventListener('click', event => {
        Backendless.Data.of("Users").deleteRelation({objectId: currentUser.objectId}, 'friends', [{objectId: friend.objectId}])
            .then(data => {
                Backendless.Data.of("Users").deleteRelation({objectId: friend.objectId}, 'friends', [{objectId: currentUser.objectId}])
                    .then(data => {
                        removeButton.parentElement.parentElement.remove();
                    })
                    .catch(alert);
            })
            .catch(alert);
    });

    myFriendsList.appendChild(div.firstChild);
}