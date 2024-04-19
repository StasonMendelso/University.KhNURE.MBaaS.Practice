if (!Backendless.UserService.currentUser) {
    document.addEventListener("globalScriptLoaded", (event) => {
        loadFiles(`/${Backendless.UserService.currentUser.email}`);
    })
} else {
    loadFiles(`/${Backendless.UserService.currentUser.email}`);
}

function loadFiles(path) {
    document.querySelector(".files__current__path span").innerText = path;
    Backendless.Files.listing(ROOT_DIRECTORY + path)
        .then(render)
        .catch(function (error) {
            console.log(error);
        });
}


function isRootDirectory() {
    return document.querySelector(".files__current__path span").innerText === "/" + Backendless.UserService.currentUser.email;
}

function render(filesAndDirectoryArray) {

    document.querySelectorAll(".file__row, .directory__row").forEach(element => element.remove());
    if (isRootDirectory()) {
        document.querySelector(".back-directory__row").classList.remove('enabled');
    } else {
        document.querySelector(".back-directory__row").classList.add('enabled');
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

    console.log(filesAndDirectoryArray);

    let directoryRowHtml = '<div class = "files__row directory__row">\
                            <span class = "file__name directory__name">directory</span>\
                            <div class = "file__actions">\
                                <span class = "file__delete-button file__action">Видалити</span>\
                            </div>\
                        </div>';
    let fileRowHtml = '<div class = "files__row file__row">\
                            <span class = "file__name">file.extension</span>\
                            <div class = "file__actions">\
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
            divElement.querySelector(".directory__name").innerText = element.name;
        } else {
            divElement.innerHTML = fileRowHtml;
            divElement = divElement.firstChild;
            divElement.querySelector(".file__name").innerText = element.name;
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

            let url = `https://markedtreatment.backendless.app/api/files/web/users${currentPath}/${fileName}`;

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
                    downloadLink.download = fileName; // Specify the desired file name

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
            let currentPath = document.querySelector(".files__current__path span").innerText;

            Backendless.Files.remove(ROOT_DIRECTORY + currentPath + "/" + name)
                .then(data => loadFiles(currentPath))
                .catch(error => alert(error));
        }));

}

document.querySelector(".add-directory__button").addEventListener("click", (event) => {
    dirDialog.querySelector("form[name='directoryAdd']").addEventListener("submit", (event) => {
        let value = dirDialog.querySelector("input[name='directoryName']").value;
        if (value) {
            let currentPath = document.querySelector(".files__current__path span").innerText;

            Backendless.Files.createDirectory(ROOT_DIRECTORY + currentPath + "/" + value)
                .then(data => loadFiles(currentPath))
                .catch(error => alert(error));

        }
    });
    dirDialog.showModal();

})
var cancelButton = document.getElementById("cancel");
var dirDialog = document.getElementById("dirDialog");

cancelButton.addEventListener("click", function () {
    dirDialog.close();
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
document.querySelector(".upload-file__button").addEventListener("click",event=>{
    const files = fileInput.files;
    if (files.length > 0) {
        document.querySelector(".upload-file__button").setAttribute("disabled", "");
        let currentPath = document.querySelector(".files__current__path span").innerText;
        Backendless.Files.upload(files[0], ROOT_DIRECTORY + currentPath + "/" + files[0].name, true )
            .then( function( fileURL ) {
                fileInput.value = "";
                loadFiles(currentPath);
            })
            .catch( function( error ) {
                document.querySelector(".upload-file__button").removeAttribute("disabled");
            });
    } else {
        document.querySelector(".upload-file__button").removeAttribute("disabled");
    }
});