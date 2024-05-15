var addFriendsList = document.querySelector(".addFriends__list");


Backendless.UserService.getCurrentUser()
    .then(currentUser => {
        Backendless.Data.of("Users").find({
            relations: ["friends_invitations"]
        })
            .then(data => {
                console.log(data);
                let users = data;
                for (let user of users) {
                    console.log(user);
                    if (user.objectId === currentUser.objectId){
                        continue;
                    }
                    addUser(user, currentUser);
                }
            })
            .catch(alert);
    })
var userHTML = `<div class="user">
                            <div class="user__info">
                                <span class="user-email">test@gmail.com</span>
                                <span class="user-username">Username</span>
                            </div>
                            <div class="user__actions">
                                <button class="button friend__add__button" data-field-id="2hft">Додати</button>
                            </div>
                        </div>`;

function addUser(user, currentUser) {
    let div = document.createElement('div');
    div.innerHTML = userHTML;
    div.querySelector(".user-email").innerText = user.email;
    div.querySelector(".user-username").innerText = user.username;
    var element = div.querySelector("[data-field-id]");
    element.setAttribute('data-field-id', user.objectId);
    for (let friendInvitation of user['friends_invitations']){
        if (currentUser.objectId === friendInvitation.objectId){
            element.setAttribute('disabled',null);
            element.innerText = 'На розгляді';
        }
    }

    addFriendsList.appendChild(div.firstChild);
}