const for_you_button = document.getElementById("for-you-button")
for_you_button.onclick = () => {
    window.location.href = '/recommended/';
}

const recent_button = document.getElementById("recent-button")
recent_button.onclick = () => {
    window.location.href = '/';
}

const following_button = document.getElementById("following-post-button");

following_button.onclick = () => {
    window.location.href = '/following_post'
}