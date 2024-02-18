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
        if (xhr.readyState === 4 && xhr.status === 500) {
            callback(2);
        }
    };

    xhr.send(JSON.stringify(data));

}

function setLoginCookie(username, password, expirationDays) {

    var d = new Date();
    d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = "username=" + username + ";" + expires + ";path=/";
    document.cookie = "password=" + password + ";" + expires + ";path=/";

}

usernameInput.addEventListener('keydown', function (event) {

    if (event.key === 'Enter') {

        passwordInput.focus();

    }

});

function attemptToLogin(username, password) {

    if (username != null) {

        errorMessage.innerHTML = "<b style='color: green;'>Authenticating...</b>";
        sendData("/attempt-login", {"username": username.toLowerCase(), "password": password}, function(answer){

            if (answer === 0) {
                setLoginCookie(username.toLowerCase(), password, 28);
                window.location.href = "/";
            } else if (answer == 1) {
                errorMessage.innerHTML = "<b style='color: red;'>Username or password incorrect</b>";
            } else if (answer == 2) {
                errorMessage.innerHTML = "<b style='color: red;'>Error on serverside</b>";
            }

        });

    }

}

document.getElementById('login-button').addEventListener('click', async function(e) {
    e.preventDefault();
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    const token = grecaptcha.getResponse();
    
    fetch('/verify-captcha', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, token })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // CAPTCHA verification successful, proceed with login
            attemptToLogin(username, password);
        } else {
            // CAPTCHA verification failed, handle accordingly
            errorMessage.innerHTML = "<b style='color: red;'>Solve the Captcha to proceed.</b>";
        }
    })
    .catch(error => {
        console.error('Error verifying captcha:', error);
    });
});
