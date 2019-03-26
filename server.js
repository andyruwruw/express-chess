const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('public'));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/chess', {
  useNewUrlParser: true
});

app.listen(3000, () => console.log('Server listening on port 3000!'));

// ----------------------------------MATCH MAKING----------------------------------

const matchMakingSchema = new mongoose.Schema({
	roomNum: Number,
	playerNum: Number,
});

const Match = mongoose.model('Match', matchMakingSchema);

app.get('/api/queue', async (req, res) => {	// GET AVAILABLE MATCHES
	try {
		let rooms = await Match.find();
		for (room in rooms)
		{
			if (rooms[room].playerNum >= 2)
			{
				rooms.splice(room, 1);
			}
		}
		if (rooms.length > 0)
		{
			res.send(rooms);
		}
		else
		{
			res.send('No Rooms');
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

app.put('/api/queue/:idNum', async (req, res) => { // EDIT A ROOM TO SET A GAME
	try {
		let room = await Match.findOne({
      _id: req.params.idNum
		});
		room.playerNum = req.body.playerNum;
		await room.save();
    res.send(room);
  } catch (error) {
    console.log(error);
    res.sendStatus('Failed to Join Room');
  }
});


app.post('/api/queue', async (req, res) => { // IF NO MATCH FOUND, POST ONE
	const room = new Match({
		roomNum: req.body.roomNum,
		playerNum: req.body.playerNum,
	});
	try {
		await room.save();
		res.send(room);
	} catch (error) {
		console.log(error);
		res.send('Failure to Save Match');
	}
});

app.get('/api/queue/:idNum', async (req, res) => { // Check your room for new players
	try {
		let room = await Match.findOne({
      _id: req.params.idNum
		});
		if (room.playerNum > 1)
		{
			res.send(room);
		}
		else
		{
			res.send(room);
		}
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.delete('/api/queue/:idNum', async (req, res) => { // Delete after game found
	try {
    await Match.deleteOne({
      _id: req.params.idNum
		});
    res.sendStatus('Match Maker Deleted');
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// ----------------------------------PLAYING GAME----------------------------------

const boardSchema = new mongoose.Schema({
		room: {num: Number, turnNum: Number, currTeam: String, scores: {w: Number, b: Number}},
		board: [[String, String, String, String, String,  String, String, String], 
		[String, String, String, String, String, String, String, String],
		[String,    String,    String,    String,    String,    String,    String,    String   ], 
		[String,    String,    String,    String,    String,    String,    String,    String   ], 
		[String,    String,    String,    String,    String,    String,    String,    String   ], 
		[String,    String,    String,    String,    String,    String,    String,    String   ], 
		[String, String, String, String, String, String, String, String],
		[String, String, String, String, String,  String, String, String]],
		action: {selection: {row: Number, col: Number}, move: {row: Number, col: Number}}
});

const Board = mongoose.model('Board', boardSchema);

app.post('/api/match', async (req, res) => {   // Create a new Game
	const match = new Board({
		room: {num: req.body.room.num, turnNum: req.body.room.turnNum, currTeam: req.body.room.currTeam, scores: {w: req.body.room.scores.w, b: req.body.room.scores.b}},
		board: 
		[[req.body.board[0][0], req.body.board[0][1], req.body.board[0][2], req.body.board[0][3], req.body.board[0][4],  req.body.board[0][5], req.body.board[0][6], req.body.board[0][7]], 
		[req.body.board[1][0], req.body.board[1][1], req.body.board[1][2], req.body.board[1][3], req.body.board[1][4],  req.body.board[1][5], req.body.board[1][6], req.body.board[1][7]], 
		[req.body.board[2][0], req.body.board[2][1], req.body.board[2][2], req.body.board[2][3], req.body.board[2][4],  req.body.board[2][5], req.body.board[2][6], req.body.board[2][7]], 
		[req.body.board[3][0], req.body.board[3][1], req.body.board[3][2], req.body.board[3][3], req.body.board[3][4],  req.body.board[3][5], req.body.board[3][6], req.body.board[3][7]], 
		[req.body.board[4][0], req.body.board[4][1], req.body.board[4][2], req.body.board[4][3], req.body.board[4][4],  req.body.board[4][5], req.body.board[4][6], req.body.board[4][7]], 
		[req.body.board[5][0], req.body.board[5][1], req.body.board[5][2], req.body.board[5][3], req.body.board[5][4],  req.body.board[5][5], req.body.board[5][6], req.body.board[5][7]], 
		[req.body.board[6][0], req.body.board[6][1], req.body.board[6][2], req.body.board[6][3], req.body.board[6][4],  req.body.board[6][5], req.body.board[6][6], req.body.board[6][7]], 
		[req.body.board[7][0], req.body.board[7][1], req.body.board[7][2], req.body.board[7][3], req.body.board[7][4],  req.body.board[7][5], req.body.board[7][6], req.body.board[7][7]]],
		action: {selection: {row: req.body.action.selection.row, col: req.body.action.selection.col}, move: {row: req.body.action.move.row, col: req.body.action.move.col}}
	});
	try {
		await match.save();
		res.send(match);
	} catch (error) {
		console.log(error);
		res.send("Failed to create game.");
	}
});

app.put('/api/match/:idNum', async (req, res) => { // Player Updates their Move
	try {
		let match = await Board.findOne({
      _id: req.params.idNum
		});
		var currTurn = match.room.turnNum;
		match = validMove(match, req.body.action);
		match.board = newQueen(match.board);
		match.action.selection.row = -1;
		match.action.selection.col = -1;
		match.action.move.row = -1;
		match.action.move.col = -1;
		if (match.room.turnNum > currTurn)
		{
			await match.save();
    	res.send(match);
		}
		else
		{
			res.send(match);
		}
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.get('/api/match/:idNum', async (req, res) => { 	// Check for Updates
	try {
		let match = await Board.findOne({
      _id: req.params.idNum
		});
		res.send(match);
	} catch (error) {
		res.send('Cannot Find Match')
	}
});

// ----------------------------------In Game Chat----------------------------------

const chatSchema = new mongoose.Schema({
	chats: []
});

const Chat = mongoose.model('Chat', chatSchema);

app.post('/api/chat', async (req, res) => {   // Create a new Chat
const chat = new Chat({
	chats: [],
});
try {
	await chat.save();
	res.send(chat);
} catch (error) {
	res.send("Failed to create chat.");
}
});

app.put('/api/chat/:idNum', async (req, res) => { // Player Send a message
	try {
		let chat = await Chat.findOne({
      _id: req.params.idNum
		});
		chat.chats.push({text: req.body.text, username: req.body.username});
		await chat.save();
		res.send(chat);
  } catch (error) {
    res.send('Failed to Send Chat')
  }
});

app.get('/api/chat/:idNum', async (req, res) => { 	// Check for Chat Updates
	try {
		let chat = await Chat.findOne({
      _id: req.params.idNum
		});
		res.send(chat);
	} catch (error) {
		res.send('Cannot Find Chat')
	}
});


// ----------------------------------Game Logic----------------------------------

function validMove(match, action)
{
	var wasValidMove = 0;
	const PIECE_WORTH = {p: 1, n: 3, b: 3, r: 5, q: 9};
	if (match.board[action.selection.row - 1][action.selection.col - 1].charAt(1) == 'k')
	{
		if (kingAction(action.selection, action.move, match.board))
		{
			wasValidMove = 1;
		}
	}
	else if (match.board[action.selection.row - 1][action.selection.col - 1].charAt(1) == 'q')
	{
		if (queenAction(action.selection, action.move, match.board))
		{
			wasValidMove = 1;
		}
	}
	else if (match.board[action.selection.row - 1][action.selection.col - 1].charAt(1) == 'b')
	{
		if (bishopAction(action.selection, action.move, match.board))
		{
			wasValidMove = 1;
		}
	}
	else if (match.board[action.selection.row - 1][action.selection.col - 1].charAt(1) == 'r')
	{
		if (rookAction(action.selection, action.move, match.board))
		{
			wasValidMove = 1;
		}
	}
	else if (match.board[action.selection.row - 1][action.selection.col - 1].charAt(1) == 'n')
	{
		if (knightAction(action.selection, action.move, match.board))
		{
			wasValidMove = 1;
		}
	}
	else if (match.board[action.selection.row - 1][action.selection.col - 1].charAt(1) == 'p')
	{
		if (pawnAction(action.selection, action.move, match.board))
		{
			wasValidMove = 1;
		}
	}

	if (wasValidMove)
	{
		if (match.board[action.selection.row - 1][action.selection.col - 1] != "")
		{
			if (match.room.turnNum % 2 == 0)
			{
				match.room.scores.w += PIECE_WORTH[(match.board[action.move.row - 1][action.move.col - 1]).charAt(1)];
			}
			else
			{
				match.room.scores.b += PIECE_WORTH[(match.board[action.move.row - 1][action.move.col - 1]).charAt(1)];
			}
		}
		match.board[action.move.row - 1][action.move.col - 1] = match.board[action.selection.row - 1][action.selection.col - 1];
		match.board[action.selection.row - 1][action.selection.col - 1] = "";
		match.room.turnNum += 1;
		return match;
	}
	else
	{
		return match;
	}
};

function kingAction(position, actionBlock, board)
{
	if ((Math.abs(actionBlock.row - position.row) <= 1) &&
	(Math.abs(actionBlock.col - position.col) <= 1) &&
	 isClearPath(position, actionBlock, board) &&
	 isSafe(1, actionBlock, board))
	{
		if (board[actionBlock.row - 1][actionBlock.col - 1] == "")
		{
			board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
			board[position.row - 1][position.col - 1] = "";
			if (isSafe(0, actionBlock, board))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		else if ((board[actionBlock.row - 1][actionBlock.col - 1]).charAt(0) != PLAYER_INFO.color)
		{
			board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
			board[position.row - 1][position.col - 1] = "";
			if (isSafe(0, actionBlock, board))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
	}
};

function queenAction(position, actionBlock, board)
{
	if (((actionBlock.charAt(0) == position.charAt(0) || actionBlock.charAt(2) == position.charAt(2)) || 
	(Math.abs(actionBlock.row - position.row) == Math.abs(actionBlock.col - position.col))) &&
	 isClearPath(position, actionBlock, board) &&
	 isSafe(0, actionBlock, board))
	{
		if (board[actionBlock.row - 1][actionBlock.col - 1] == "")
		{
			board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
			board[position.row - 1][position.col - 1] = "";
			if (isSafe(0, actionBlock, board))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		else if ((board[actionBlock.row - 1][actionBlock.col - 1]).charAt(0) != PLAYER_INFO.color)
		{
			board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
			board[position.row - 1][position.col - 1] = "";
			if (isSafe(0, actionBlock, board))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
	}
};

function rookAction(position, actionBlock, board)
{
	if ((actionBlock.charAt(0) == position.charAt(0) || actionBlock.charAt(2) == position.charAt(2)) &&
	 isClearPath(position, actionBlock, board) &&
	 isSafe(0, actionBlock, board))
	{
		if (board[actionBlock.row - 1][actionBlock.col - 1] == "")
		{
			board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
			board[position.row - 1][position.col - 1] = "";
			if (isSafe(0, actionBlock, board))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		else if ((board[actionBlock.row - 1][actionBlock.col - 1]).charAt(0) != PLAYER_INFO.color)
		{
			board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
			board[position.row - 1][position.col - 1] = "";
			if (isSafe(0, actionBlock, board))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
	}
};

function bishopAction(position, actionBlock, board)
{
	if ((Math.abs(parseInt(actionBlock.charAt(0)) - position.row) == Math.abs(actionBlock.col - position.col)) &&
	 isClearPath(position, actionBlock, board) &&
	 isSafe(0, actionBlock, board))
	{
		if (board[actionBlock.row - 1][actionBlock.col - 1] == "")
		{
			board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
			board[position.row - 1][position.col - 1] = "";
			if (isSafe(0, actionBlock, board))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		else if ((board[actionBlock.row - 1][actionBlock.col - 1]).charAt(0) != PLAYER_INFO.color)
		{
			board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
			board[position.row - 1][position.col - 1] = "";
			if (isSafe(0, actionBlock, board))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
	}
};

function knightAction(position, actionBlock, board)
{
	if ((((Math.abs(actionBlock.row - position.row) == 2) &&
	(Math.abs(actionBlock.col - position.col) == 1)) ||
	((Math.abs(actionBlock.row - position.row) == 1) &&
	(Math.abs(actionBlock.col - position.col) == 2))) &&
	isSafe(0, actionBlock, board))
	{
		
		if (board[actionBlock.row - 1][actionBlock.col - 1] == "")
		{
			board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
			board[position.row - 1][position.col - 1] = "";
			if (isSafe(0, actionBlock, board))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		else if ((board[actionBlock.row - 1][actionBlock.col - 1]).charAt(0) != PLAYER_INFO.color)
		{
			board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
			board[position.row - 1][position.col - 1] = "";
			if (isSafe(0, actionBlock, board))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
	}
};

function pawnAction(position, actionBlock, board)
{
	colorDirection = 1;
	if ((board[position.row - 1][position.col - 1]).charAt(0) == 'b')
	{
		colorDirection = -1;
	}

	if ((actionBlock.row - position.row == colorDirection) && 
	(Math.abs(actionBlock.col - position.col) == 0) &&
	board[actionBlock.row - 1][actionBlock.col - 1] == "" &&
	isSafe(0, actionBlock, board))
	{
		board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
		board[position.row - 1][position.col - 1] = "";
		if (isSafe(0, actionBlock, board))
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	else if ((actionBlock.row - position.row == colorDirection) && 
	(Math.abs(actionBlock.col - position.col) == 1) &&
	((board[actionBlock.row - 1][actionBlock.col - 1]) != "") &&
	isSafe(0, actionBlock, board))
	{
		if ((board[actionBlock.row - 1][actionBlock.col - 1]).charAt(0) != (board[position.row - 1][position.col - 1]).charAt(0))
		{
			board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
			board[position.row - 1][position.col - 1] = "";
			if (isSafe(0, actionBlock, board))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
	}
};

function newQueen(board)
{
	for (var i = 0; i < 8; i++)
	{
		var piece = board[7][j];
		if (piece.charAt(1) == 'p' && piece.charAt(0) == 'w')
		{
			board[7][j] = "wq";
		}
		var piece = board[0][j];
		if (piece.charAt(1) == 'p' && piece.charAt(0) == 'b')
		{
			board[7][j] = "bq";
		}
	}
	return board;
};

function isClearPath(position, actionBlock, board)
{
	distanceY = actionBlock.row - position.row;
	distanceX = actionBlock.col - position.col;
	negativeX = 1;
	negativeY = 1;

	if (distanceX < 0)
	{
		negativeX = -1;
	}
	if (distanceY < 0)
	{
		negativeY = -1;
	}
	
	if (distanceX == 0 || distanceY == 0)
	{
		if (distanceX == 0)
		{
			for (var i = 1; i <= Math.abs(distanceY); i++)
			{
				if (i == Math.abs(distanceY) && (board[actionBlock.row - 1][actionBlock.col - 1]) != "")
				{
					if ((board[actionBlock.row - 1][actionBlock.col - 1]).charAt(0) != (board[position.row - 1][position.col - 1]).charAt(0))
					{
						return true;
					}
				}
				else if (board[(position.row + i * negativeY) - 1][(position.col) - 1] != "")
				{
					return false;
				}
			}
		}
		else if (distanceY == 0)
		{
			for (var i = 1; i <= Math.abs(distanceX); i++)
			{
				if (i == Math.abs(distanceX) && (board[actionBlock.row - 1][actionBlock.col - 1]) != "")
				{
					if ((board[actionBlock.row - 1][actionBlock.col - 1]).charAt(0) != (board[position.row - 1][position.col - 1]).charAt(0))
					{
						return true;
					}
				}
				else if (board[(position.row) - 1][(position.col + i * negativeX) - 1] != "")
				{
					return false;
				}
			}
		}
		return true;
	}
	else if (Math.abs(distanceX) == Math.abs(distanceY))
	{
		for (var i = 1; i <= Math.abs(distanceX); i++)
		{
			if (i == Math.abs(distanceX) && (board[actionBlock.row - 1][actionBlock.col - 1]) != "")
			{
				if ((board[actionBlock.row - 1][actionBlock.col - 1]).charAt(0) != (board[position.row - 1][position.col - 1]).charAt(0))
				{
					return true;
				}
			}
			else if (board[(position.row + i * negativeY) - 1][(position.col + i * negativeX) - 1] != "")
			{
				return false;
			}
		}
		return true;	
	}
	else
	{
		return false;
	}
};

function isSafe(isKing, block, board)
{
	var kingPosition;
	var color = (board[block.row - 1][block.col - 1]).charAt(0);
	var oppcolor = 'b';
	if (color == 'b')
	{
		oppcolor = 'w';
	}
	if (isKing)
	{
		kingPosition = block;
	}

	var enemyPositions = [];

	for (var i = 0; i < 8; i++)
	{
		for (var j = 0; j < 8; j++)
		{
			if (board[i][j].charAt(0) == oppcolor)
			{
				enemyPositions.push({piece: board[i][j].charAt(1), row: i, col: j});
			}
			else if (board[i][j].substring(0,2) == color + "k" && !isKing)
			{
				kingPosition.row = i;
				kingPosition.col = j;
			}
		}
	}
	for (var i = 0; i < enemyPositions.length; i++)
	{
		if (enemyPositions[i].piece == 'k' && 
		(Math.abs(enemyPositions[i].row - kingPosition.row) <= 1 && 
		Math.abs(enemyPositions[i].col - kingPosition.col) <= 1)
		)
		{
			return false;
		}
		else if (enemyPositions[i].piece == 'q' &&
		((enemyPositions[i].row == kingPosition.row || enemyPositions[i].col == kingPosition.col) ||
		(Math.abs(enemyPositions[i].row - kingPosition.row) == Math.abs(enemyPositions[i].col - kingPosition.col))) &&
		this.isClearPath(enemyPositions[i], kingPosition))
		{
			return false;
		}
		else if (enemyPositions[i].piece == 'r' &&
		(enemyPositions[i].row == kingPosition.row || enemyPositions[i].col == kingPosition.col) &&
		this.isClearPath(enemyPositions[i], kingPosition))
		{
			return false;
		}
		else if (enemyPositions[i].piece == 'b' &&
		(Math.abs(enemyPositions[i].row - kingPosition.row) == Math.abs(enemyPositions[i].col - kingPosition.col)) &&
		this.isClearPath(enemyPositions[i], kingPosition))
		{
			return false;
		}
		else if (enemyPositions[i].piece == 'n' &&
		(((Math.abs(enemyPositions[i].row - kingPosition.row) == 1) && (Math.abs(enemyPositions[i].col - kingPosition.col) == 2)) ||
		((Math.abs(enemyPositions[i].row - kingPosition.row) == 2) && (Math.abs(enemyPositions[i].col - kingPosition.col) == 1))))
		{
			return false;
		}
		else if (enemyPositions[i].piece == 'p' &&
		((Math.abs(enemyPositions[i].row - kingPosition.row) == 1) && (Math.abs(enemyPositions[i].col - kingPosition.col) == 1)))
		{
			return false;
		}
	}
	return true;
};