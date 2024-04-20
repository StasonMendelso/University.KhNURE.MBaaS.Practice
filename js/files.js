if (!Backendless.UserService.currentUser) {
    document.addEventListener("globalScriptLoaded", (event) => {
        loadFiles(`/${Backendless.UserService.currentUser.email}`);
    })
} else {
    loadFiles(`/${Backendless.UserService.currentUser.email}`);
}

var sharedFileDialog = document.getElementById("shareDialog");
var sharedFileCancelButton = sharedFileDialog.querySelector("button[type='reset']");
var fileNameForSharingTemp;
var fileUrlForSharingTemp;

function loadFiles(path) {
    document.querySelector(".files__current__path span").innerText = path;
    if (path.includes("/shared-with-me")) {
        let queryBuilder = Backendless.DataQueryBuilder.create();
        queryBuilder.setRelated(['userId', 'fileId']);
        queryBuilder.setWhereClause(`userId.objectId='${Backendless.UserService.currentUser.objectId}'`);
        Backendless.Data.of("SharedFiles").find(queryBuilder)
            .then(sharedFiles => {
                console.log(sharedFiles);
                let files = sharedFiles.filter(element => element.fileId.length>0)
                    .map(element => element.fileId[0].fileReference)
                    .map(fileReference => {
                        return {
                            name: fileReference.split('/files' + ROOT_DIRECTORY)[1].replace('%40', '@'),
                            publicUrl: fileReference,
                            size: 1,
                        };
                    })

                console.log(files);
                render(files)
            })
            .catch(console.log);

    } else {
        Backendless.Files.listing(ROOT_DIRECTORY + path)
            .then(render)
            .catch(function (error) {
                console.log(error);
            });
    }

}


function isRootDirectory() {
    return document.querySelector(".files__current__path span").innerText === "/" + Backendless.UserService.currentUser.email;
}

function isSharedWithMeDirectory() {
    return document.querySelector(".files__current__path span").innerText === "/" + Backendless.UserService.currentUser.email + "/shared-with-me";
}

function render(filesAndDirectoryArray) {

    document.querySelectorAll(".file__row, .directory__row").forEach(element => element.remove());
    if (isRootDirectory()) {
        document.querySelector(".back-directory__row").classList.remove('enabled');
    } else {
        document.querySelector(".back-directory__row").classList.add('enabled');
    }
    if (isSharedWithMeDirectory()) {
        document.querySelector(".directory__actions").classList.add('disabled');
    } else {
        document.querySelector(".directory__actions").classList.remove('disabled');
    }

    filesAndDirectoryArray.sort((a, b) => {
        if (a.size && b.size) {
            return 0;
        }
        if (a.size) {
            return -1;
        }
        return 1;
    });


    let directoryRowHtml = '<div class = "files__row directory__row">\
                            <span class = "file__name directory__name">directory</span>\
                            <div class = "file__actions">\
                                <span class = "file__delete-button file__action">Видалити</span>\
                            </div>\
                        </div>';
    let fileRowHtml = '<div class = "files__row file__row">\
                            <span class = "file__name" data-file-public-url>file.extension</span>\
                            <div class = "file__actions">\
                                <span class = "file__share-button file__action">Поділитися</span>\
                                <span class = "file__download-button file__action">Завантажити</span>\
                                <span class = "file__delete-button file__action">Видалити</span>\
                            </div>\
                        </div>';
    filesAndDirectoryArray.forEach(element => {
        let divElement = document.createElement("div");

        document.querySelector(".back-directory__row").insertAdjacentElement("afterend", divElement);
        if (!element.size) {
            divElement.innerHTML = directoryRowHtml;
            divElement = divElement.firstChild;
            if (element.name === "shared-with-me") {
                divElement.querySelector(".file__delete-button").remove();
            }
            divElement.querySelector(".directory__name").innerText = element.name;
        } else {
            divElement.innerHTML = fileRowHtml;
            divElement = divElement.firstChild;
            divElement.querySelector(".file__name").innerText = element.name;
            divElement.querySelector(".file__name").setAttribute('data-file-public-url', element.publicUrl);
            if (isSharedWithMeDirectory()) {
                divElement.querySelector(".file__delete-button").remove();
                divElement.querySelector(".file__share-button").remove();
            }
        }

    });

    document.querySelector(".files__rows").addEventListener("dblclick", (event) => {
        event.stopImmediatePropagation();
        if (event.target.closest(".directory__name")) {
            let currentPath = document.querySelector(".files__current__path span").innerText;
            if (event.target.innerText === ". . .") {
                let lastSlashIndex = currentPath.lastIndexOf('/');

                let upperPath = lastSlashIndex !== -1 ? currentPath.substring(0, lastSlashIndex) : url;
                loadFiles(upperPath);
                return;
            }

            loadFiles(currentPath + "/" + event.target.innerText);
        }
    })
    document.querySelectorAll(".file__download-button")
        .forEach(element => element.addEventListener("click", event => {
            event.stopImmediatePropagation();
            let fileName = element.parentNode.parentNode.querySelector(".file__name").innerText;
            let currentPath = document.querySelector(".files__current__path span").innerText;
            let url;
            if (isSharedWithMeDirectory()){
                url = `https://markedtreatment.backendless.app/api/files/web/users/${fileName}`;
            }else{
                url = `https://markedtreatment.backendless.app/api/files/web/users${currentPath}/${fileName}`;
            }


            const headers = new Headers();
            headers.append('user-token', Backendless.UserService.currentUser['user-token']);

            const options = {
                method: 'GET',
                headers: headers
            };

            fetch(url, options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.blob();
                })
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);

                    const downloadLink = document.createElement('a');
                    downloadLink.href = blobUrl;
                    downloadLink.download = fileName;

                    document.body.appendChild(downloadLink);
                    downloadLink.click();

                    URL.revokeObjectURL(blobUrl);
                    document.body.removeChild(downloadLink);
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });


        }));
    document.querySelectorAll(".file__delete-button")
        .forEach(element => element.addEventListener("dblclick", event => {
            let name = element.parentNode.parentNode.querySelector(".file__name").innerText;
            let publicUrl = element.parentNode.parentNode.querySelector(".file__name").getAttribute("data-file-public-url").split('/files')[1];
            let currentPath = document.querySelector(".files__current__path span").innerText;

            Backendless.Files.remove(ROOT_DIRECTORY + currentPath + "/" + name)
                .then(data => {
                    var queryBuilder = Backendless.DataQueryBuilder.create();
                    queryBuilder.setWhereClause(`fileReference LIKE '%${publicUrl}'`);
                    Backendless.Data.of("Files").find(queryBuilder)
                        .then(function (object) {
                            Backendless.Data.of("Files").remove(object[0].objectId)
                                .then(function (timestamp) {
                                    console.log("File instance has been deleted");
                                })
                                .catch(function (error) {
                                    alert("an error has occurred with removing" + error.message);
                                });
                        })
                        .catch(function (error) {
                            alert("an error has occurred " + error.message);
                        });
                    loadFiles(currentPath);
                })
                .catch(error => alert(error));
        }));

    document.querySelectorAll(".file__share-button")
        .forEach(element => element.addEventListener("click", (event) => {
            fileNameForSharingTemp = element.parentNode.parentNode.querySelector(".file__name").innerText;
            fileUrlForSharingTemp = element.parentNode.parentNode.querySelector(".file__name").getAttribute("data-file-public-url").split('/files')[1];
            var emailsShared = sharedFileDialog.querySelector(".emails-shared");
            emailsShared.innerHTML = "";

            var queryBuilder = Backendless.DataQueryBuilder.create();
            queryBuilder.setWhereClause(`fileReference LIKE '%${fileUrlForSharingTemp}'`);
            Backendless.Data.of("Files").find(queryBuilder)
                .then(function (objects) {
                    queryBuilder = Backendless.DataQueryBuilder.create();
                    queryBuilder.setWhereClause(`fileId = '${objects[0].objectId}'`);
                    queryBuilder.setRelationsDepth(1);
                    Backendless.Data.of("SharedFiles").find(queryBuilder)
                        .then(function (objects) {
                            objects.forEach(element => {
                                emailsShared.insertAdjacentHTML('afterbegin', `<p>${element.userId[0].email}</p>`);
                            })
                        })
                        .catch(function (error) {
                            alert("an error has occurred " + error.message);
                        });

                })
                .catch(function (error) {
                    alert("an error has occurred " + error.message);
                });

            sharedFileDialog.showModal();

        }));

}

sharedFileDialog.querySelector("form[name='shareFile']").addEventListener("submit", (event) => {
    event.stopImmediatePropagation();
    event.preventDefault();

    let email = sharedFileDialog.querySelector("input[name='sharedWithEmail']").value;

    if (email) {
        let errorsDiv = sharedFileDialog.querySelector(".errors");

        function gotError(err) {
            setError(err.message);
        }

        function setError(errorText) {
            errorsDiv.innerHTML = "";
            let spanElement = document.createElement("span");
            spanElement.innerText = errorText;
            errorsDiv.appendChild(spanElement);
            errorsDiv.classList.add("active");
        }

        let queryBuilder = Backendless.DataQueryBuilder.create()
            .setWhereClause(`email = '${email}'`);

        Backendless.Data.of(Backendless.User).find(queryBuilder)
            .then(function (users) {
                if (users.length > 0) {
                    //add share
                    Backendless.Data.of("SharedFiles").save()
                        .then(savedObject => {
                            Backendless.Data.of("SharedFiles").setRelation(savedObject, "userId", [users[0]]);
                            var queryBuilder = Backendless.DataQueryBuilder.create();
                            queryBuilder.setWhereClause(`fileReference LIKE '%${fileUrlForSharingTemp}'`);
                            Backendless.Data.of("Files").find(queryBuilder)
                                .then(function (files) {
                                    Backendless.Data.of("SharedFiles").setRelation(savedObject, "fileId", [files[0]])
                                })
                        })
                        .catch(gotError)
                    sharedFileDialog.close();
                } else {
                    setError('Користувача не знайдено');
                }
            })
            .catch(gotError);
    }
});


var dirDialog = document.getElementById("dirDialog");
var dirCancelButton = dirDialog.querySelector("button[type='reset']");
document.querySelector(".add-directory__button").addEventListener("click", (event) => {
    dirDialog.querySelector("form[name='directoryAdd']").addEventListener("submit", (event) => {
        let value = dirDialog.querySelector("input[name='directoryName']").value;
        if (value) {
            let currentPath = document.querySelector(".files__current__path span").innerText;

            Backendless.Files.createDirectory(ROOT_DIRECTORY + currentPath + "/" + value)
                .then(data => {
                    loadFiles(currentPath)
                })
                .catch(error => alert(error));

        }
    });
    dirDialog.showModal();

})
dirCancelButton.addEventListener("click", function () {
    dirDialog.close();
});

sharedFileCancelButton.addEventListener("click", function () {
    sharedFileDialog.close();
});


var fileInput = document.querySelector("input[name='file-to-upload']");

fileInput.addEventListener("input", event => {
    const files = fileInput.files;
    if (files.length > 0) {
        document.querySelector(".upload-file__button").removeAttribute("disabled");
    } else {
        document.querySelector(".upload-file__button").setAttribute("disabled", "");
    }
});
document.querySelector(".upload-file__button").addEventListener("click", event => {
    const files = fileInput.files;
    if (files.length > 0) {
        document.querySelector(".upload-file__button").setAttribute("disabled", "");
        let currentPath = document.querySelector(".files__current__path span").innerText;
        Backendless.Files.upload(files[0], ROOT_DIRECTORY + currentPath + "/" + files[0].name, true)
            .then(function (fileReference) {
                fileInput.value = "";
                var file = {
                    fileReference: fileReference.fileURL,
                }
                console.log(file);
                Backendless.Data.of("Files").save(file)
                    .then(function (savedObject) {
                        console.log("new File instance has been saved");
                        Backendless.Data.of("Files").setRelation({objectId: savedObject.objectId}, "fileOwnerId", [{objectId: Backendless.UserService.currentUser.objectId}])
                            .then(function (count) {
                                console.log("relation has been set");
                            })
                            .catch(function (error) {
                                console.log("server reported an error - " + error.message);
                            });
                    })
                    .catch(function (error) {
                        alert("an error has occurred " + error.message);
                    });
                loadFiles(currentPath);
            })
            .catch(function (error) {
                document.querySelector(".upload-file__button").removeAttribute("disabled");
            });
    } else {
        document.querySelector(".upload-file__button").removeAttribute("disabled");
    }
});