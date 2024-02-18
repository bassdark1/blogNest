const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto"); // to encrypt passwords
const moment = require('moment');

const knex = require("knex")({
  client: "postgres",
  connection: process.env.DATABASE_URL,
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("/home/runner/public/index.html");
});

const checkIfUserExists = async (username) => {
  try {
    const user = await knex("users").where("username", username).first();

    return !!user; // True if user exists, false otherwise
  } catch (error) {
    throw error;
  }
};


function hashPassword(password) {
  // generate hash and salt
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return {
    salt,
    hash,
  };
}
function hashPasswordWithSalt(password, salt) {
  // hash password with already generated salt
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}


app.post("/attempt-signup", async (req, res) => {
  let username = req.body["username"];
  let password = req.body["password"];

  try {
    const userExists = await checkIfUserExists(username);
    if (userExists) {
      return res.status(400).send("User already exists!");
    }

    const { salt, hash } = hashPassword(password);

    const query = `
      INSERT INTO users (Username, PasswordHash, PasswordSalt, ProfileColor, bio, DateCreated, FollowerCount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await knex.raw(query, [username, hash, salt, `rgb(${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)})`, "This is a bio.", Date(), 0]);
    return res.status(200).send('User created successfu!');
  } catch (error) {
    console.error("Error checking user existence:", error);
    return res.status(500).send("Error checking user existence!");
  }
});


app.post("/attempt-login", async (req, res) => {
    const { username, password } = req.body;

    try {
        
        const user = await knex("users").where("username", username).first();

        if (!user) {
          return res.status(400).send("User does not exist!");
        }
    
        const passwordHash = user["passwordhash"];
        const passwordSalt = user["passwordsalt"];
    
        const hashedPassword = hashPasswordWithSalt(password, passwordSalt);

        if (passwordHash === hashedPassword) {
            return res.status(200).send("User login successful!");
        } else {
            return res.status(400).send("Password incorrect");
        }
      
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).send("Error logging in!");
    }
});

app.post("/attempt-create-post", async (req, res) => {
    try {
        const { content, description, username } = req.body;
        const dateTime = new Date().toISOString();
        const insertResult = await knex('posts').insert({
            postcontent: content,
            postdescription: description,
            username: username,
            postdate: dateTime
        });

        return res.status(200).send('Post created successful!');
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).send("Error posting!");
    }
});

app.post("/attempt-edit-bio", async (req, res) => {
    try {
        const { new_bio, username } = req.body;
        const query = `
            UPDATE users
            SET bio = ?
            WHERE username = ?
        `;
        await knex.raw(query, [new_bio, username]);
        return res.status(200).send('Bio updated successful!');
    } catch (error) {
        console.error("Error updating bio:", error);
        return res.status(500).send("Error updating bio!");
    }
});

app.post("/attempt-edit-profile-pic", async (req, res) => {
    try {
        const { new_color, username } = req.body;
        const query = `
            UPDATE users
            SET profilecolor = ?
            WHERE username = ?
        `;
        await knex.raw(query, [new_color, username]);
        return res.status(200).send('Profile picture updated successful!');
    } catch (error) {
        console.error("Error updating profile picture:", error);
        return res.status(500).send("Error updating profile picture!");
    }
});

app.post("/delete-post", async (req, res) => {
    try {
        const delete_post_id = req.body.delete_post_id;
        
        if (!delete_post_id) {
            return res.status(400).send("Post ID is required.");
        }
        
        const deletedRows = await knex('posts')
            .where('idnum', delete_post_id)
            .del();

        if (deletedRows) {
            res.status(200).send("Post deleted successfully.");
        } else {
            res.status(404).send("Post not found.");
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send("Error deleting post.");
    }
});

app.get("/user-info/:parameter", async (req, res) => {
    const username = req.params.parameter;

    try {
        const userExists = await checkIfUserExists(username);
        if (!userExists) {
            return res.status(404).send("User does not exist!");
        }

        knex("users")
            .where('username', username)
            .first()
            .then(row => {
                
                const jsonData = JSON.parse(JSON.stringify(row));
                const userInfo = {
                    "username": jsonData["username"], 
                    "profilecolor": jsonData["profilecolor"], 
                    "bio": jsonData["bio"], 
                    "datecreated": jsonData["datecreated"],
                    "followercount": jsonData["followercount"]
                }; 
                return res.json(userInfo);
                
            })
            .catch(err => {
                console.error(err);
            });
        
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal Server Error")
    }
    
});

app.get("/get-posts", async (req, res) => {

    try {
        const posts = await knex.select("*").from("posts");
        let allPosts = [];
        posts.forEach(post => {
            const currentTime = moment();
            const postTime = moment(post["postdate"]);

            const diffInMinutes = currentTime.diff(postTime, 'minutes');
            const diffInHours = currentTime.diff(postTime, 'hours');
            const diffInDays = currentTime.diff(postTime, 'days');

            if (diffInMinutes < 60) {
                post["postdate"] = `${diffInMinutes} minutes ago`;
            } else if (diffInHours < 24) {
                post["postdate"] = `${diffInHours} hours ago`;
            } else {
                post["postdate"] = `${diffInDays} days ago`;
            }

            allPosts.push(post);
        });
        return res.json(allPosts);
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal Server Error")
    }
});

app.get("/get-a-post/:parameter", async (req, res) => {
    const id_num = req.params.parameter;

    try {
        const post = await knex.select("*").from("posts").where("idnum", id_num);

        const currentTime = moment();
        const postTime = moment(post[0]["postdate"]);

        const diffInMinutes = currentTime.diff(postTime, 'minutes');
        const diffInHours = currentTime.diff(postTime, 'hours');
        const diffInDays = currentTime.diff(postTime, 'days');

        if (diffInMinutes < 60) {
            post[0]["postdate"] = `${diffInMinutes} minutes ago`;
        } else if (diffInHours < 24) {
            post[0]["postdate"] = `${diffInHours} hours ago`;
        } else {
            post[0]["postdate"] = `${diffInDays} days ago`;
        }

        return res.json(post);
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal Server Error")
    }

});

app.get("/get-posts-by-username/:parameter", async (req, res) => {
    const username = req.params.parameter;
    try {
        const posts = await knex.select("*").from("posts").where("username", username);

        let allPosts = [];
        posts.forEach(post => {
            const currentTime = moment();
            const postTime = moment(post["postdate"]);

            const diffInMinutes = currentTime.diff(postTime, 'minutes');
            const diffInHours = currentTime.diff(postTime, 'hours');
            const diffInDays = currentTime.diff(postTime, 'days');

            if (diffInMinutes < 60) {
                post["postdate"] = `${diffInMinutes} minutes ago`;
            } else if (diffInHours < 24) {
                post["postdate"] = `${diffInHours} hours ago`;
            } else {
                post["postdate"] = `${diffInDays} days ago`;
            }

            allPosts.push(post);
        });
        return res.json(allPosts);
    
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal Server Error")
    }
});

app.get("/random-post/:parameter", async (req, res) => {
   try {
        const random_posts = await knex.select("*").from("posts").orderByRaw("RANDOM()"); 
        if (random_posts.length === 0) {
            return res.status(404).send("No posts found.");
        }

        let posts = [];
       
        random_posts.forEach(random_post => {
            const currentTime = moment();
            const postTime = moment(random_post["postdate"]);
            
            const diffInMinutes = currentTime.diff(postTime, 'minutes');
            const diffInHours = currentTime.diff(postTime, 'hours');
            const diffInDays = currentTime.diff(postTime, 'days');
            
            if (diffInMinutes < 60) {
               random_post["postdate"] = `${diffInMinutes} minutes ago`;
            } else if (diffInHours < 24) {
               random_post["postdate"] = `${diffInHours} hours ago`;
            } else {
               random_post["postdate"] = `${diffInDays} days ago`;
            }
            posts.push(random_post);
        });
        
        return res.json(posts);
        
        } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
        }
});

async function followUser(followerUsername, followingUsername) {
    try {
        await knex.transaction(async (trx) => {
            await trx.raw(`
                WITH new_follow AS (
                    INSERT INTO followers (follower_username, following_username)
                    VALUES (?, ?)
                    ON CONFLICT DO NOTHING
                    RETURNING *
                )
                UPDATE users
                SET followercount = followercount + 1
                WHERE username IN (SELECT following_username FROM new_follow);
            `, [followerUsername, followingUsername]);
        });
        return true;
    } catch (error) {
        console.error("Error following user:", error);
        throw error;
    }
}

async function checkIfUserFollows(followerUsername, followingUsername) {
    try {
        const result = await knex.raw(`
            SELECT COUNT(*) AS follow_count
            FROM followers
            WHERE follower_username = ?
            AND following_username = ?;
        `, [followerUsername, followingUsername]);

        return result.rows[0].follow_count > 0;
    } catch (error) {
        console.error("Error checking if user follows:", error);
        throw error;
    }
}

async function unfollowUser(followerUsername, followingUsername) {
    try {
        await knex.transaction(async (trx) => {
            await trx.raw(`
                DELETE FROM followers
                WHERE follower_username = ?
                AND following_username = ?;
            `, [followerUsername, followingUsername]);

            await trx.raw(`
                UPDATE users
                SET followercount = GREATEST(followercount - 1, 0)
                WHERE username = ?;
            `, [followingUsername]);
        });
        return true;
    } catch (error) {
        console.error("Error unfollowing user:", error);
        throw error;
    }
}

app.post("/follow-user", async (req, res) => {
    const { followerUsername, followingUsername } = req.body;

    try {
        const userExists = await checkIfUserExists(followingUsername);
        if (!userExists) {
            return res.status(404).send("User to follow does not exist!");
        }

        const alreadyFollowing = await checkIfUserFollows(followerUsername, followingUsername);
        if (alreadyFollowing) {
            return res.status(400).send("You are already following this user!");
        }

        await followUser(followerUsername, followingUsername);
        res.status(200).send("User followed successfully.");
    } catch (error) {
        console.error("Error following user:", error);
        res.status(500).send("Error following user.");
    }
});

app.get("/check-if-follows/:followerUsername/:followingUsername", async (req, res) => {
    const { followerUsername, followingUsername } = req.params;

    try {
        const userExists = await checkIfUserExists(followingUsername);
        if (!userExists) {
            return res.status(404).send("User to follow does not exist!");
        }

        const isFollowing = await checkIfUserFollows(followerUsername, followingUsername);
        res.status(200).json({ isFollowing });
    } catch (error) {
        console.error("Error checking if user follows:", error);
        res.status(500).send("Error checking if user follows.");
    }
});

app.post("/unfollow-user", async (req, res) => {
    const { followerUsername, followingUsername } = req.body;

    try {
        const userExists = await checkIfUserExists(followingUsername);
        if (!userExists) {
            return res.status(404).send("User to unfollow does not exist!");
        }

        const isFollowing = await checkIfUserFollows(followerUsername, followingUsername);
        if (!isFollowing) {
            return res.status(400).send("You are not following this user!");
        }

        await unfollowUser(followerUsername, followingUsername);
        res.status(200).send("User unfollowed successfully.");
    } catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(500).send("Error unfollowing user.");
    }
});

app.post('/verify-captcha', async (req, res) => {
    const { username, password, token } = req.body;
    const secretKey = "6Ld8z3YpAAAAAOgLil7tYYqVXi8-J5WkWwCois7F";

    try {
        const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            // CAPTCHA verification successful
            res.json({ success: true });
        } else {
            // CAPTCHA verification failed
            res.json({ success: false, error: 'Captcha verification failed' });
        }
    } catch (error) {
        console.error('Error verifying captcha:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


app.use(async (req, res, next) => {
    const requestedPath = req.path;

    try {
        if (requestedPath.substring(1, 7) === "users/") {
            const username = requestedPath.substring(7);
            const userExists = await checkIfUserExists(username);
            if (userExists) {
                res.status(200).sendFile(path.resolve("public/users/profile.html"));
            }
        } else if (requestedPath.substring(1, 6) === "post/") {
            const postId = requestedPath.substring(6);
            if (!(!isNaN(postId) && parseInt(postId) == parseFloat(postId))) {
                res.status(404).sendFile(path.resolve("public/404.html"));
            } else {
                const postExists = await knex("posts").where("idnum", postId).first();
                if (postExists) {
                    res.status(200).sendFile(path.resolve("public/post/post.html"));
                } else {
                    res.status(404).sendFile(path.resolve("public/404.html"));
                }
            }
        } else {
            res.status(404).sendFile(path.resolve("public/404.html"));
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Internal Server Error');
    }
});


////// Start everything
app.listen(3000, () => {
  console.log("Listening!");
});