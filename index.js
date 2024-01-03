const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const path = require('path');
const crypto = require('crypto'); // to encrypt passwords

console.log("\033[0;33mDone importing");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.listen(3000, () => {
    console.log('\033[0;32mListening!');
})
console.log("\033[0;33mDone creating the app/server");

app.get('/', (req, res) => {
    res.sendFile('/home/runner/public/index.html');
});

const usersDirectory = '/home/runner/blognest-v0/data/usr';

const checkIfUserExists = (username) => {
  return new Promise((resolve, reject) => {
    fs.readdir(usersDirectory, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const userFile = username + '.json';
      const userExists = files.includes(userFile);
      resolve(userExists);
    });
  });
};

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex'); // Generate a random salt
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex'); // Generate hash using PBKDF2

  return {
    salt,
    hash
  };
}


app.post('/attempt-signup', async (req, res) => {
    let username = req.body["username"];
    let password = req.body["password"];

  try {
    const userExists = await checkIfUserExists(username);
    if (userExists) {
      return res.status(400).send('User already exists!');
    }

    fs.writeFile(path.join(usersDirectory, username + '.json'), `{"username": "${username}", "passwordHash": "${hashPassword(password).hash}", "passwordSalt": "${hashPassword(password).salt}"}`, (err) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).send('Error creating user!');
      }
      console.log('User created successfully!');
      return res.status(200).send('User created successfully!');
    });
  } catch (error) {
    console.error('Error checking user existence:', error);
    return res.status(500).send('Error checking user existence!');
  }
});

// app.get('/attempt-login', async (req, res) => {

//     const username = req.query.username;
    
// });