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

  xhr.onreadystatechange = function () {
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

const sendDataPromise = (url, data) => {
    return new Promise((resolve, reject) => {
        sendData(url, data, (answer) => {
            resolve(answer);
        });
    });
};

const checkAuth = async (username, password) => {
    try {
        const answer = await sendDataPromise("/attempt-login", {"username": username, "password": password});

        if (answer === 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        return false;
    }
};

const attemptToLogin = async (username, password) => {
    if (true) {
        sendData(
            "/attempt-login",
            { username: username.toLowerCase(), password: password },
            function (answer) {
                if (answer === 0) {

                    const avatar_dropdown = document.createElement('select');
                    avatar_dropdown.id = "avatar-dropdown";

                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = username;
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    avatar_dropdown.appendChild(defaultOption);

                    const user_options = ['Profile', 'Logout', 'Terms of service', 'About'];

                    user_options.forEach(user_option => {
                      const option = document.createElement('option');
                      option.value = user_option.toLowerCase();
                      option.textContent = user_option;
                      avatar_dropdown.appendChild(option);
                    });

                    avatar_dropdown.addEventListener('change', function() {
                        const selectedOption = avatar_dropdown.options[avatar_dropdown.selectedIndex].value;
                        if (selectedOption !== '') {
                            if (selectedOption === 'profile') {
                                window.location.href = "/users/" + username.toLowerCase();
                            } else if (selectedOption === 'logout') {
                                document.cookie = `username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                                document.cookie = `password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                                window.location.href = "/"
                            } else if (selectedOption === 'terms of service') {
                                window.location.href = "/tos.txt"
                            } else if (selectedOption === 'about') {
                                window.location.href = "/about/about.html"
                            }
                        }
                    });

                    login_container = document.getElementById('login-button-container');

                    login_container.appendChild(avatar_dropdown);
                    return true;

                } else if (answer == 1) {

                    const login_button = document.createElement('button');
                    const signup_button = document.createElement('button');
                    login_button.id = "login-button";
                    signup_button.id = "signup-button";

                    login_button.innerHTML = "Log in";
                    signup_button.innerHTML = "Sign up";

                    login_container = document.getElementById('login-button-container');
                    login_container.appendChild(login_button);
                    login_container.appendChild(signup_button);

                    login_button.onclick = function() {
                        window.location.href = '/login';
                    }

                    signup_button.onclick = function() {
                        window.location.href = '/signup';
                    }
                    return false;

                } else if (answer == 2) {

                    const login_button = document.createElement('button');
                    const signup_button = document.createElement('button');
                    login_button.id = "login-button";
                    signup_button.id = "signup-button";

                    login_button.innerHTML = "Log in";
                    signup_button.innerHTML = "Sign up";

                    login_container = document.getElementById('login-button-container');
                    login_container.appendChild(login_button);
                    login_container.appendChild(signup_button);

                    login_button.onclick = function() {
                        window.location.href = '/login';
                    }

                    signup_button.onclick = function() {
                        window.location.href = '/signup';
                    }
                    return false;

                }
          },
        );
    }
}

if (getLoginCookie()) {
    const username = getLoginCookie()[0];
    const password = getLoginCookie()[1];
    if (attemptToLogin(username, password)) {
        if (window.location.pathname === "/users/" + username.toLowerCase()) {
            const follow_button = document.getElementById("follow-button");
            follow_button.remove();
        } else if (window.location.pathname.includes("/users/")) {
            const create_post_button = document.getElementById("create-post-button");
            create_post_button.remove();
    
            const edit_bio_button = document.getElementById("edit-bio");
            edit_bio_button.remove();
            
            const edit_profile_pic_button = document.getElementById("edit-profile-pic");
            edit_profile_pic_button.remove();  
        }
    }

} else {
    const login_button = document.createElement('button');
    const signup_button = document.createElement('button');
    login_button.id = "login-button";
    signup_button.id = "signup-button";

    login_button.innerHTML = "Log in";
    signup_button.innerHTML = "Sign up";

    login_container = document.getElementById('login-button-container');
    login_container.appendChild(login_button);
    login_container.appendChild(signup_button);

    login_button.onclick = function() {
        window.location.href = '/login';
    }

    signup_button.onclick = function() {
        window.location.href = '/signup';
    }

    if (window.location.pathname.includes("/users/")) {
        const create_post_button = document.getElementById("create-post-button");
        create_post_button.remove();
    
        const follow_button = document.getElementById("follow-button");
        follow_button.remove();
  
        const edit_bio_button = document.getElementById("edit-bio");
        edit_bio_button.remove();  
        
        const edit_profile_pic_button = document.getElementById("edit-profile-pic");
        edit_profile_pic_button.remove();  
    }

}