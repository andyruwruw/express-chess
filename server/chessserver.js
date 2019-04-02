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

const matchmaker = require("./matchmaker.js");
app.use("/api/queue", matchmaker);

const selected = require("./selected.js");
app.use("/api/selected", selected);

const multiplayer = require("./multiplayer.js");
app.use("/api/match", multiplayer);

const chat = require("./chat.js");
app.use("/api/chat", chat);

const active = require("./active.js");
app.use("/api/active", active);


/*
async function deleteInactive()
{
  try {
    let trackers = await axios.get("./active.js");
    for (var i = 0; i < trackers.length; i++)
    {
      if (trackers[i].body.server = false)
      {
        await axios.put("./active.js" + trackers[i].body._id, {
          player1: trackers[i].body.player1,
          player2: trakcers[i].body.player2,
          playerNum: trackers[i].body.playerNum,
          server: true,
          inactive: 10,
        });
      }
      else
      {
        if (trackers[i].body.inactive < 0)
        {
          await axios.delete("./active.js" + trackers[i].body._id);
          await axios.delete("./chat.js" + trackers[i].body._id);
          await axios.delete("./multiplayer.js" + trackers[i].body._id);
          await axios.delete("./selected.js" + trackers[i].body._id);
        }      
        else
        {
          await axios.put("./active.js" + trackers[i].body._id, {
            player1: trackers[i].body.player1,
            player2: trakcers[i].body.player2,
            playerNum: trackers[i].body.playerNum,
            server: true,
            inactive: trackers[i].body.inactive - 1,
          });
        }  
      }
    }
  } catch (error) {
    console.log(error);
  }
}


setInterval(deleteInactive, 10000);
*/


app.listen(3000, () => console.log('Server listening on port 3000!'));

/*
var port = process.env.PORT || 3000;

app.listen(port, function () {
console.log("Server listening on port  " + port+ "!");
});
*/

