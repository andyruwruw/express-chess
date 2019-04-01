const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

//app.use(express.static('../public'));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/chess', {
  useNewUrlParser: true
});

const matchmaker = require("./Express-Chess/server/matchmaker.js");
app.use("/api/queue", matchmaker);

const selected = require("./Express-Chess/server/selected.js");
app.use("/api/selected", selected);

const multiplayer = require("./Express-Chess/server/multiplayer.js");
app.use("/api/match", multiplayer);

const chat = require("./Express-Chess/server/chat.js");
app.use("/api/chat", chat);

const active = require("./Express-Chess/server/active.js");
app.use("/api/active", active);

app.listen(3000, () => console.log('Server listening on port 3000!'));

/*
var port = process.env.PORT || 3000;

app.listen(port, function () {
console.log("Server listening on port  " + port+ "!");
});
*/

