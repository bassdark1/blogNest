function sendData(request, data, callback) {

    var xhr = new XMLHttpRequest();
    xhr.open("POST", request);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.responseText);
            callback(0);
        }
        if (xhr.readyState === 4 && xhr.status === 400) {
            callback(1);
        }
        if (xhr.readyState === 4 && xhr.status === 500) {
            callback(2);
        }
    };

    xhr.send(JSON.stringify(data));

}


const create_post_container = document.getElementById('create-post-container');
const create_post_input = document.createElement('div');
const post_button = document.createElement('button');
const error_message = document.createElement('div')
const description_text = document.createElement('p')
const create_post_description = document.createElement('div');

create_post_description.id = "create-post-input-title";
description_text.id = "description-text"
create_post_input.id = "create-post-input-content";
post_button.id = "post-button";
error_message.id = "error-message";

description_text.innerHTML = "Post title:";
post_button.innerHTML = "Post";
create_post_description.contentEditable = "True";
create_post_input.contentEditable = "True";

create_post_container.appendChild(create_post_input);
create_post_container.appendChild(description_text);
create_post_container.appendChild(create_post_description);
create_post_container.appendChild(post_button);
document.body.appendChild(error_message);

function attemptCreatePost(content, description, username) {

    if (content != "" && description != "") {
        error_message.innerHTML = "<b style='color: green;'>Creating post...</b>";
        sendData("/attempt-create-post", {"content": content, "description": description, "username": username}, function(answer){
            if (answer === 0) {
                error_message.innerHTML = "<b style='color: green;'>Post successful</b>";
                window.location.href = "/";
            } else if (answer == 1) {
                error_message.innerHTML = "<b style='color: red;'>Login to post</b>";
            } else if (answer == 2) {
                error_message.innerHTML = "<b style='color: red;'>Error: Max length for post: 65535, Max length for description: 127</b>";
            }
        });
    } else {
        error_message.innerHTML = "<b style='color: red;'>Post can't be empty</b>";
    }

}

function isLoggedIn() {
    var avatarDropdownExists = document.getElementById("avatar-dropdown");

    if (avatarDropdownExists) {
        return true;
    } else {
        return false;
    }
}

function createPost() {
    if (isLoggedIn()) {
        const username = getLoginCookie()[0]; 
        attemptCreatePost(create_post_input.innerHTML, create_post_description.innerHTML, username.toLowerCase());
    } else {
        error_message.innerHTML = "<b style='color: red;'>Login to post</b>";
    }
}

post_button.onclick = function() {
    createPost();
}

// function updateFont() {
//     const fontSize = document.getElementById('fontSize').value;
//     const fontFamily = document.getElementById('fontFamily').value;
//     const fontColor = document.getElementById('fontColor').value;

//     const selection = window.getSelection();

//     if (selection.rangeCount > 0) {
//         const range = selection.getRangeAt(0);
//         const span = document.createElement('span');
//         span.style.fontSize = `${fontSize}px`;
//         span.style.fontFamily = fontFamily;
//         span.style.color = fontColor;
//         if (range.collapsed) {
//             range.insertNode(span);
//             range.setStartAfter(span);
//             range.collapse(true);
//             selection.removeAllRanges();
//             selection.addRange(range);
//         } else {
//             range.surroundContents(span);
//             selection.removeAllRanges();
//         }
//     } else {
//         const span = document.createElement('span');
//         span.style.fontSize = `${fontSize}px`;
//         span.style.fontFamily = fontFamily;
//         span.style.color = fontColor;

//         const selectionNode = document.getSelection().anchorNode;
//         const selectionOffset = document.getSelection().anchorOffset;

//         const range = document.createRange();
//         range.setStart(selectionNode, selectionOffset);
//         range.setEnd(selectionNode, selectionOffset);

//         range.insertNode(span);
//         range.setStartAfter(span);
//         range.collapse(true);
//         selection.removeAllRanges();
//         selection.addRange(range);
//     }

//     document.getElementById('fontSize').value = fontSize;
//     document.getElementById('fontFamily').value = fontFamily;
//     document.getElementById('fontColor').value = fontColor;
// }

// document.getElementById('fontSize').addEventListener('input', updateFont);
// document.getElementById('fontFamily').addEventListener('input', updateFont);
// document.getElementById('fontColor').addEventListener('input', updateFont);
