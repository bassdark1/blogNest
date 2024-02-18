const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('login-button');

usernameInput.value = "";
passwordInput.value = "";

const errorMessage = document.getElementById('error-message');

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
    };

    xhr.send(JSON.stringify(data));

}

usernameInput.addEventListener('keydown', function (event) {

    if (event.key === 'Enter') {

        passwordInput.focus();

    }

});

function attemptToLogin(username, password) {

    if (username != null) {

        errorMessage.innerHTML = "<b style='color: green;'>Authenticating...</b>";
        sendData("/attempt-login", {"username": username, "password": password}, function(answer){

            if (answer === 0) {
                errorMessage.innerHTML = "<b style='color: green;'>Login successful - <a href='/' style='color: lightblue !important'>home page</a></b>";
            } else if (answer == 1) {
                errorMessage.innerHTML = "<b style='color: red;'>Username or password incorrect</b>";
            }

        });

    }

}

passwordInput.addEventListener('keydown', function(event) {

    if (event.key === 'Enter') {

        attemptToLogin(usernameInput.value, passwordInput.value);

    }

});

loginButton.addEventListener('click', function() {

    attemptToLogin(usernameInput.value, passwordInput.value);

});