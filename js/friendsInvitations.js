var friendsInvitationsList = document.querySelector(".friendsInvitations__list");


Backendless.UserService.getCurrentUser()
    .then(currentUser => {
        Backendless.Data.of("Users").findById(currentUser.objectId, {
            relations: ["friends_invitations"]
        })
            .then(data => {
                console.log(data);
                let friends_invitations = data['friends_invitations'];
                for (let friend_invitation of friends_invitations) {
                    console.log(friend_invitation);
                    addFriendInvitation(friend_invitation, currentUser);
                }
            })
            .catch(alert);
    })
var friendInvitationHTML = `<div class="friend-invitation">
                            <div class="friend-invitation__info">
                                <span class="friend-invitation-email">test@gmail.com</span>
                                <span class="friend-invitation-username">Username</span>
                            </div>
                            <div class="friend-invitation__actions">
                                <button class="button friend-invitation__accept__button" data-field-id="2hft">Прийняти</button>
                                <button class="button friend-invitation__decline__button" data-field-id="2hft">Відхилити</button>
                            </div>
                        </div>`;

function addFriendInvitation(friend, currentUser) {
    let div = document.createElement('div');
    div.innerHTML = friendInvitationHTML;
    div.querySelector(".friend-invitation-email").innerText = friend.email;
    div.querySelector(".friend-invitation-username").innerText = friend.username;
    var elements = div.querySelectorAll("[data-field-id]");
    elements[0].setAttribute('data-field-id', friend.objectId);
    elements[1].setAttribute('data-field-id', friend.objectId);


    var acceptButton = div.querySelector(".friend-invitation__accept__button");
    acceptButton.addEventListener('click', event => {
        Backendless.Data.of("Users").deleteRelation({objectId: currentUser.objectId}, 'friends_invitations', [{objectId: friend.objectId}])
            .then(data => {
                Backendless.Data.of("Users").addRelation({objectId: currentUser.objectId}, 'friends', [{objectId: friend.objectId}])
                    .then(data => {
                        alert("Додано!");
                        acceptButton.parentElement.parentElement.remove();
                    })
                    .catch(alert);
            })
            .catch(alert);
        Backendless.Data.of("Users").deleteRelation({objectId: friend.objectId}, 'friends_invitations', [{objectId: currentUser.objectId}])
            .then(data => {
                Backendless.Data.of("Users").addRelation({objectId: friend.objectId}, 'friends', [{objectId: currentUser.objectId}])
                    .then(data => {
                    })
                    .catch(alert);
            })
            .catch(alert);
    });
    var declineButton = div.querySelector(".friend-invitation__decline__button");
    declineButton.addEventListener('click', event => {
        Backendless.Data.of("Users").deleteRelation({objectId: currentUser.objectId}, 'friends_invitations', [{objectId: friend.objectId}])
            .then(data => {
                alert("Відхилено!");
                declineButton.parentElement.parentElement.remove();
            })
            .catch(alert);
    });
    friendsInvitationsList.appendChild(div.firstChild);
}