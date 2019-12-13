const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

// Automatically allow cross-origin requests
app.use(cors({origin: true}));
// build multiple CRUD interfaces:

app.post('/', (req, res) => {
  let {title, post_id} = req.body;
  let push_token = [];
  let message = {
    tokens: push_token,
    notification: {
      title: 'new post',
      body: title,
    },
    data: {
      post_id: post_id,
    },
  };
  admin
    .database()
    .ref('/devices_token')
    .once('value', snapshot => {
      snapshot.forEach(function(data) {
        let val = data.val();

        push_token.push(val.fcmToken);
      });
    })
    .then(() => {
      console.log(message);
      admin
        .messaging()
        .sendMulticast(message)
        .then(response => {
          // Response is a message ID string.
          console.log('Successfully sent message:', response);
        })
        .catch(error => {
          console.log('Error sending message:', error);
        });
    });
});
// Expose Express API as a single Cloud Function:
exports.sendNotification = functions.https.onRequest(app);
