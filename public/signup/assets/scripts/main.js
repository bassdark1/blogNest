const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const passwordConfirmInput = document.getElementById('passwordConfirmInput');
const signupButton = document.getElementById('signup-button');

usernameInput.value = "";
passwordInput.value = "";
passwordConfirmInput.value = "";

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
        } if (xhr.readyState === 4 && xhr.status === 500) {
            callback(2);
        }
    };

    xhr.send(JSON.stringify(data));

}

usernameInput.addEventListener('keydown', function (event) {

    if (event.key === 'Enter') {

        passwordInput.focus();

    }

});

passwordInput.addEventListener('keydown', function (event) {

    if (event.key === 'Enter') {

        passwordConfirmInput.focus();

    }

});

function attemptToCreateAccount(username, password, passwordConfirm) {

    if (password !== passwordConfirm) {

        errorMessage.innerHTML = "<b style='color: red;'>Passwords do not match</b>";

    } else if (password.length < 8) {

        errorMessage.innerHTML = "<b style='color: red;'>Password must be at least 8 characters</b>";

    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {

        errorMessage.innerHTML = "<b style='color: red;'>Username can only contain letters, numbers and underscores</b>";

    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])/.test(password)) {
        errorMessage.innerHTML = "<b style='color: red;'>Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character</b>";
    } else {

        errorMessage.innerHTML = "<b style='color: green;'>Checking if username is taken...</b>";
        sendData("/attempt-signup", {"username": username.toLowerCase(), "password": password}, function(answer){

            if (answer === 0) {
                errorMessage.innerHTML = "<b style='color: green;'>Account has been created - <a href='/login' style='color: lightblue !important'>login page</a></b>";

                window.location.href = "/login";
            } else if (answer == 1) {
                errorMessage.innerHTML = "<b style='color: red;'>Username is taken</b>";
            } else if (answer == 2) {
                errorMessage.innerHTML = "<b style='color: red;'>An error occured on serverside.</b>";
            }

        });

    }

}

document.getElementById('signup-button').addEventListener('click', async function(e) {
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
            attemptToCreateAccount(usernameInput.value, passwordInput.value, passwordConfirmInput.value);
        } else {
            // CAPTCHA verification failed, handle accordingly
            errorMessage.innerHTML = "<b style='color: red;'>Solve the Captcha to proceed.</b>";
        }
    })
    .catch(error => {
        console.error('Error verifying captcha:', error);
    });
});
