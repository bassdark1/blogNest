const currentPath = window.location.pathname;
const username = currentPath.substring(7);
const user_info_container = document.getElementById('user-info-container');

const getUserInfo = (username) => {
    return fetch(`/user-info/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            const userInfo = {
                "username": data.username,
                "profilecolor": data.profilecolor,
                "bio": data.bio,
                "datecreated": data.datecreated,
                "followercount": data.followercount
            };
            return userInfo;
        })
        .catch(error => {
            console.error('Error fetching or processing data:', error);
        });
};

function checkCookieExists(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(";");

    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) == " ") {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
          return true;
        }
    }
    return false;
}

function getLoginCookie() {

    if (!checkCookieExists("username")) {return false;}

    var usernameCookieName = "username=";
    var passwordCookieName = "password=";
    var decodedCookie = decodeURIComponent(
        document.cookie
          .replace(usernameCookieName, "")
          .replace(passwordCookieName, ""),
    );
    var cookieArray = decodedCookie.split(";");

    return [cookieArray[0], cookieArray[1].substring(1)];
}

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

getUserInfo(username)
    .then(userInfo => {
        document.title = `${username} - BlogNest`;

        const username_title = document.getElementById("username-title");
        username_title.innerHTML = username;

        const profile_pic = document.getElementById("profile-pic");
        profile_pic.style.backgroundColor = userInfo["profilecolor"];

        const bio_text = document.getElementById("bio-text");
        bio_text.innerHTML = userInfo["bio"];

        const account_creation_date = document.getElementById("account-creation-date");
        account_creation_date.innerHTML = `Date joined: ${userInfo["datecreated"].substring(4,15)}`;

        const follower_count = document.getElementById("follower-count");
        follower_count.innerHTML = `Followers: ${userInfo["followercount"]}`;

    })
    .catch(error => {
        console.error('Error:', error);
    });


const error_message = document.getElementById("error-message");

const edit_bio_button = document.getElementById("edit-bio");
edit_bio_button.onclick = () => {
    const bio_text = document.getElementById("bio-text");
    bio_text.contentEditable = true;
    bio_text.style.border = "1px solid";

    const save_button_bio = document.createElement('button');
    save_button_bio.id = "save-button-bio";
    save_button_bio.innerHTML = "Save";

    const bio_container = document.getElementById("bio-container");
    bio_container.appendChild(save_button_bio);

    edit_bio_button.style.display = "none";
    
    save_button_bio.onclick = () => {
        const new_bio = bio_text.innerHTML;
        bio_text.contentEditable = false;
        bio_text.style.border = "none";
        save_button_bio.remove();
        edit_bio_button.style.display = "block";
        sendData("/attempt-edit-bio", {"new_bio": new_bio, "username": username}, function(answer) {
            error_message.innerHTML = "<b style='color: green;'>Updating bio...</b>";
            if (answer === 0) {
                error_message.innerHTML = "<b style='color: green;'></b>";
            } else if (answer === 1) {
                error_message.innerHTML = "<b style='color: red;'>Error reload and try again</b>";
            } else if (answer === 2) {
                error_message.innerHTML = "<b style='color: red;'>Something went wrong - Max length for bio is 255 characters</b>";
            }
        });
    }
    
}


var colorInput = document.createElement("input");
colorInput.type = "color";
colorInput.style.display = "none";
document.getElementById("profile-pic-container").appendChild(colorInput);

const edit_profile_pic_button = document.getElementById("edit-profile-pic");
edit_profile_pic_button.onclick = () => {
    const profile_pic = document.getElementById("profile-pic");

    const save_button_pic = document.createElement('button');
    save_button_pic.id = "save-button-pic";
    save_button_pic.innerHTML = "Save";

    const profile_pic_container = document.getElementById("profile-pic-container");
    profile_pic_container.appendChild(save_button_pic);
    colorInput.click();

    edit_profile_pic_button.style.display = "none";
    
    save_button_pic.onclick = () => {
        const new_color = colorInput.value;
        profile_pic.style.backgroundColor = new_color;
        edit_profile_pic_button.style.display = "block";
        save_button_pic.remove();
        sendData("/attempt-edit-profile-pic", {"new_color": new_color, "username": username}, function(answer) {
            error_message.innerHTML = "<b style='color: green;'>Updating profile picture...</b>";
            if (answer === 0) {
                error_message.innerHTML = "<b style='color: green;'></b>";
            } else if (answer === 1) {
                error_message.innerHTML = "<b style='color: red;'>Error reload and try again</b>";
            } else if (answer === 2) {
                error_message.innerHTML = "<b style='color: red;'>Error on serverside</b>";
            }
        });
    }
}

const getPosts = () => {
    return fetch("/get-posts-by-username/" + username)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
    .catch(error => {
        console.error('Error fetching or proccessing posts:', error);
    });;
}

async function renderPosts() {
    let allPosts = await getPosts();
    allPosts = allPosts.reverse();
    const feedElement = document.getElementById("posts-container");

    allPosts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("content");
        feedElement.appendChild(postElement);
        
        const blog_link = document.createElement("a");
        blog_link.classList.add("blog-link");
        blog_link.innerHTML = post["username"];
        postElement.appendChild(blog_link);

        blog_link.href = `/post/${post["idnum"]}`;

        const blog_description = document.createElement("p");
        blog_description.classList.add("blog-description");
        blog_description.innerHTML = post["postdescription"]
        postElement.appendChild(blog_description);

        const blog_date = document.createElement("p");
        blog_date.classList.add("blog-date");
        blog_date.innerHTML = post["postdate"]
        postElement.appendChild(blog_date);
        
        if (getLoginCookie()) {
            const logged_in_user = getLoginCookie()[0];
            const logged_in_user_password = getLoginCookie()[1];

            if (checkAuth(logged_in_user, logged_in_user_password) && (logged_in_user.toLowerCase() === username)) {
                const deleteButton = document.createElement("button");
                deleteButton.classList.add("delete-post-button");
                deleteButton.innerHTML = "Delete";
                postElement.appendChild(deleteButton);

                deleteButton.onclick = () => {
                    if (window.confirm("Are you sure you want to delete this post?")) {
                        const delete_post_id = post["idnum"];
                        sendData("/delete-post", { "delete_post_id": delete_post_id }, function (answer) {
                            if (answer === 0) {
                                postElement.remove();
                                location.reload();
                            } else {
                                console.log("There has been an error");
                            }
                        });
                    }
                }
            } 
        }
    });
}

renderPosts();

async function followsUser(followerUsername, followingUsername) {
    try {
        const response = await fetch(`/check-if-follows/${followerUsername}/${followingUsername}`);
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        console.log(data.isFollowing);
        return data.isFollowing;
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        return false;
    }
}


async function followButtonToDisplay() {
    const follow_button = document.getElementById("follow-button");
    const follows = await followsUser(getLoginCookie()[0], username);
    if (follows) {
        follow_button.innerHTML = "Unfollow";
        follow_button.style.color = "#168cff";
        follow_button.style.backgroundColor = "#ffffff";
        follow_button.onclick = () => {
            sendData("/unfollow-user", { "followerUsername": getLoginCookie()[0], "followingUsername": username }, function (answer) {
                if (answer === 0) {
                    location.reload();
                } else {
                    console.log("There has been an error");
                    location.reload()
                }
            });
        }
    } else {
        follow_button.innerHTML = "Follow";
        follow_button.style.backgroundColor = "#168cff";
        follow_button.style.color = "#ffffff";
        follow_button.onclick = () => {
            sendData("/follow-user", { "followerUsername": getLoginCookie()[0], "followingUsername": username }, function (answer) {
                if (answer === 0) {
                    location.reload();
                } else {
                    console.log("There has been an error");
                    location.reload()
                }
            });
        }
    }
}

followButtonToDisplay();

