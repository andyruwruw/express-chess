const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

const boardSchema = new mongoose.Schema({
    _id: String,
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

router.post('/', async (req, res) => {   // Create a new Game
const match = new Board({
    _id: req.body._id,
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

router.put('/:idNum', async (req, res) => { // Player Updates their Move
    try {
        var newroom = {};
        var newboard = [];
        var changeData = 0;
        var desiredAction = {};
        newroom = req.body.room;
        newboard = req.body.board;
        desiredAction = req.body.action;
        var movingpiece = req.body.board[desiredAction.selection.row - 1][desiredAction.selection.col - 1];
        let currTurn = req.body.room.turnNum;
        if (validMove(req.body, desiredAction))
        {
            changeData = 1;
            if (newboard[desiredAction.move.row - 1][desiredAction.move.col - 1] != "")
            {
                const PIECE_WORTH = {p: 1, n: 3, b: 3, r: 5, q: 9};
                if ((newboard[desiredAction.move.row - 1][desiredAction.move.col - 1]).charAt(0) == 'w')
                {
                    newroom.scores.b += PIECE_WORTH[(newboard[desiredAction.move.row - 1][desiredAction.move.col - 1]).charAt(1)];
                }
                else
                {
                    newroom.scores.w += PIECE_WORTH[(newboard[desiredAction.move.row - 1][desiredAction.move.col - 1]).charAt(1)];
                }
            }
            console.log("Saving Match");
            newboard[desiredAction.move.row - 1][desiredAction.move.col - 1] = movingpiece;
            newboard[desiredAction.selection.row - 1][desiredAction.selection.col - 1] = "";
            newroom.turnNum += 1;
            console.log("HERES THE NEW BOARD");
            console.log(newboard);
            if (changeData == 1)
            {
                try {
                    let data = await Board.updateOne({
                        _id: req.params.idNum
                    },
                    {
                        $push : {
                            board : {
                                $each: [newboard[0], newboard[1], newboard[2], newboard[3], newboard[4], newboard[5], newboard[6], newboard[7]],
                                $slice: -8
                            }
                        }
                    });
                    console.log(data);
                    res.send(data);
                    
                } catch (error) {
                console.log(error);
                res.sendStatus(500);
                }
            }
        }
    } catch (error) {
    console.log(error);
    res.sendStatus(500);
    }
});

router.get('/:idNum', async (req, res) => { 	// Check for Updates
try {
    let match = await Board.findOne({
    _id: req.params.idNum
    });
    res.send(match);
} catch (error) {
    res.send('Cannot Find Match')
}
});

module.exports = router;


// =============================================================================================


function validMove(match, action)
{
	if ((match.board[action.selection.row - 1][action.selection.col - 1]).charAt(1) == 'k')
	{
		if (kingAction(action.selection, action.move, match.board))
		{
			return true;
		}
	}
	else if (match.board[action.selection.row - 1][action.selection.col - 1].charAt(1) == 'q')
	{
		if (queenAction(action.selection, action.move, match.board))
		{
			return true;
		}
	}
	else if (match.board[action.selection.row - 1][action.selection.col - 1].charAt(1) == 'b')
	{
		if (bishopAction(action.selection, action.move, match.board))
		{
			return true;
		}
	}
	else if (match.board[action.selection.row - 1][action.selection.col - 1].charAt(1) == 'r')
	{
		if (rookAction(action.selection, action.move, match.board))
		{
			return true;
		}
	}
	else if (match.board[action.selection.row - 1][action.selection.col - 1].charAt(1) == 'n')
	{
		if (knightAction(action.selection, action.move, match.board))
		{
			return true;
		}
	}
	else if (match.board[action.selection.row - 1][action.selection.col - 1].charAt(1) == 'p')
	{
		if (pawnAction(action.selection, action.move, match.board))
		{
            console.log("Good move");
			return true;
		}
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
	 isSafe(0, position, board))
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
	 isSafe(0, position, board))
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
	 isSafe(0, position, board))
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
	isSafe(0, position, board))
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
	isSafe(0, position, board))
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
	isSafe(0, position, board))
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
		var piece = board[7][i];
		if (piece.charAt(1) == 'p' && piece.charAt(0) == 'w')
		{
			board[7][i] = "wq";
		}
		var piece = board[0][i];
		if (piece.charAt(1) == 'p' && piece.charAt(0) == 'b')
		{
			board[7][i] = "bq";
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
	var kingPosition = {row: 0, col: 0};
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
			else if (board[i][j].charAt(0) == color && board[i][j].charAt(1) == "k" && !isKing)
			{
				kingPosition.row = i;
				kingPosition.col = j;
			}
		}
    }
	for (i in enemyPositions)
	{
		if (enemyPositions[i].piece == 'k' && 
		(Math.abs(enemyPositions[i].row - kingPosition.row) <= 1 && 
		Math.abs(enemyPositions[i].col - kingPosition.col) <= 1))
		{
			return false;
		}
		else if (enemyPositions[i].piece == 'q' &&
		((enemyPositions[i].row == kingPosition.row || enemyPositions[i].col == kingPosition.col) ||
		(Math.abs(enemyPositions[i].row - kingPosition.row) == Math.abs(enemyPositions[i].col - kingPosition.col))) &&
		isClearPath(enemyPositions[i], kingPosition))
		{
			return false;
		}
		else if (enemyPositions[i].piece == 'r' &&
		(enemyPositions[i].row == kingPosition.row || enemyPositions[i].col == kingPosition.col) &&
		isClearPath(enemyPositions[i], kingPosition))
		{
			return false;
		}
		else if (enemyPositions[i].piece == 'b' &&
		(Math.abs(enemyPositions[i].row - kingPosition.row) == Math.abs(enemyPositions[i].col - kingPosition.col)) &&
		isClearPath(enemyPositions[i], kingPosition))
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