const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// app.use(express.static('public'));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/chess', {
  useNewUrlParser: true
});

app.listen(3000, () => console.log('Server listening on port 3000!'));

const pieceSchema = new mongoose.Schema({
		playerNum: Number,
		turnNum: Number,
		scores: {w: Number, b: Number},
		board: [[String, String, String, String, String,  String, String, String], 
		[String, String, String, String, String, String, String, String],
		[String,    String,    String,    String,    String,    String,    String,    String   ], 
		[String,    String,    String,    String,    String,    String,    String,    String   ], 
		[String,    String,    String,    String,    String,    String,    String,    String   ], 
		[String,    String,    String,    String,    String,    String,    String,    String   ], 
		[String, String, String, String, String, String, String, String],
		[String, String, String, String, String,  String, String, String]],
		yourTeam: String,
});

const Board = mongoose.model('Board', pieceSchema);

app.post('/api/pieces', async (req, res) => {
	try {
		let rooms = await Board.find();
		var foundRoom = 0;
		for (room in rooms)
		{
			if (rooms[room].playerNum == 1)
			{
				foundRoom = 1;
				rooms[room].playerNum += 1;
				res.send(rooms[room]);
			}
		}
		if (!foundRoom)
		{
			const turn = new Board({
				roomNum: rooms.size,
				playerNum: req.body.playerNum,
				turnNum: req.body.turnNum,
				scores: {w: req.body.scores.w, b: req.body.scores.b},
				board: [[req.body.board[0][0], req.body.board[0][1], req.body.board[0][2], req.body.board[0][3], req.body.board[0][4],  req.body.board[0][5], req.body.board[0][6], req.body.board[0][7]], 
				[req.body.board[1][0], req.body.board[1][1], req.body.board[1][2], req.body.board[1][3], req.body.board[1][4], req.body.board[1][5], req.body.board[1][6], req.body.board[1][7]],
				[req.body.board[2][0],req.body.board[2][1],req.body.board[2][2],req.body.board[2][3],req.body.board[2][4],req.body.board[2][5],req.body.board[2][6],req.body.board[2][7]   ], 
				[req.body.board[3][0],req.body.board[3][1],req.body.board[3][2],req.body.board[3][3],req.body.board[3][4],req.body.board[3][5],req.body.board[3][6],req.body.board[3][7]   ], 
				[req.body.board[4][0],req.body.board[4][1],req.body.board[4][2],req.body.board[4][3],req.body.board[4][4],req.body.board[4][5],req.body.board[4][6],req.body.board[4][7]   ], 
				[req.body.board[5][0],req.body.board[5][1],req.body.board[5][2],req.body.board[5][3],req.body.board[5][4],req.body.board[5][5],req.body.board[5][6],req.body.board[5][7]   ], 
				[req.body.board[6][0], req.body.board[6][1], req.body.board[6][2], req.body.board[6][3], req.body.board[6][4], req.body.board[6][5], req.body.board[6][6], req.body.board[6][7]],
				[req.body.board[7][0], req.body.board[7][1], req.body.board[7][2], req.body.board[7][3], req.body.board[7][4],  req.body.board[7][5], req.body.board[7][6], req.body.board[7][7]]],
				yourTeam: req.body.yourTeam,
				});
			try {
				await turn.save();
				res.send(turn);
			} catch (error) {
				console.log(error);
				res.sendStatus(500);
			}
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

app.get('/api/pieces', async (req, res) => {
	try 
	{
		let rooms = await Board.find();
		var foundRoom = 0;
		for (room in rooms)
		{
			if (rooms[room].roomNum == req.body.roomNum)
			{
				res.send(rooms[room]);
			}
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

app.put('/api/pieces/:idNum', async (req, res) => {
	try {
		let item = await Item.findOne({
      _id: req.params.idNum
		});
		item.title = req.body.title;
		item.description = req.body.description;
		await item.save();
    res.send(item);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
