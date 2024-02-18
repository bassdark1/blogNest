const currentPath = window.location.pathname;
const post_id = currentPath.substring(6);

const getPost = (id_num) => {
    return fetch("/get-a-post/" + id_num)
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

getPost(post_id)
    .then(post => {

        document.title = `Post: ${post[0]["username"]} - BlogNest`;

        username_div = document.getElementById("username");
        username_div.innerHTML = `Written by: ${post[0]["username"]}`;
        username_div.href = `/users/${post[0]["username"]}`;

        date_div = document.getElementById("date");
        date_div.innerHTML = post[0]["postdate"];
        
        postcontent_div = document.getElementById("postcontent");
        postcontent_div.innerHTML = post[0]["postcontent"];
        
    })
    .catch(error => {
        console.error('Error:', error);
    });


