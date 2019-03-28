const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('../public'));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/chess', {
  useNewUrlParser: true
});

const matchmaker = require("./matchmaker.js");
app.use("/api/queue", matchmaker);

const selected = require("./selected.js");
app.use("/api/selected", selected);

const multiplayer = require("./multiplayer.js");
app.use("/api/match", multiplayer);

const chat = require("./chat.js");
app.use("/api/chat", chat);

app.listen(3000, () => console.log('Server listening on port 3000!'));