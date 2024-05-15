var myFriendsList = document.querySelector(".myFriends__list");


Backendless.UserService.getCurrentUser()
    .then(currentUser => {
        Backendless.Data.of("Users").findById(currentUser.objectId, {
            relations: ["friends"]
        })
            .then(data => {
                console.log(data);
                let friends = data['friends'];
                for (let friend of friends) {
                    console.log(friend);
                    addFriend(friend);
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

function addFriend(friend) {
    let div = document.createElement('div');
    div.innerHTML = friendHTML;
    div.querySelector(".friend-email").innerText = friend.email;
    div.querySelector(".friend-username").innerText = friend.username;
    var element = div.querySelector("[data-field-id]");
    element.setAttribute('data-field-id', friend.objectId);

    myFriendsList.appendChild(div.firstChild);
}