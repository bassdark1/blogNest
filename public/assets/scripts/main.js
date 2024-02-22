const getPosts = () => {
    return fetch("/get-posts")
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
    const feedElement = document.getElementById("feed");

    allPosts.forEach(post => {
        console.log(post)
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
    });
}

renderPosts();

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

const loading_screen = () => {
    const content = document.getElementsByClassName("content");
    const feedElement = document.getElementById("feed");

    const loading_screen_div = document.createElement("div");
    loading_screen_div.id = "loading-screen";
    feedElement.appendChild(loading_screen_div);

    const loading_screen_link = document.createElement("p");
    loading_screen_link.id = "loading-p"
    loading_screen_div.appendChild(loading_screen_link);
    loading_screen_link.innerHTML = "cbukavcui"

    const loading_screen_description = document.createElement("p");
    loading_screen_description.id = "loading-description";
    loading_screen_div.appendChild(loading_screen_description);
    loading_screen_description.innerHTML = "cbukavcui";

    const loading_screen_date = document.createElement("p");
    loading_screen_date.id = "loading-date";
    loading_screen_div.appendChild(loading_screen_date);
    loading_screen_date.innerHTML = "cbukavcui";

    const checkContent = () => {
        if (content.length == 0) {
            loading_screen_div.style.display = "block";
        } else {
            loading_screen_div.style.display = 'none';
            return;
        }

        requestAnimationFrame(checkContent);
    };

    checkContent();
};
for (let counter = 0; counter < 10; counter++) {
    loading_screen();
}

const search_bar = document.getElementById("search-bar");

