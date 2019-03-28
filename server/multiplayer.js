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
    action: {selection: {row: Number, col: Number}, move: {row: Number, col: Number}},
    dead: [],
    special: {wkingmv: Number, bkingmv: Number, wWin: Number, bWin: Number, stale: Number, lastAction: 
        {selection: {row: Number, col: Number}, move: {row: Number, col: Number}}},
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
    action: {selection: {row: req.body.action.selection.row, col: req.body.action.selection.col}, move: {row: req.body.action.move.row, col: req.body.action.move.col}},
    dead: req.body.dead,
    special: {wkingmv: req.body.special.wkingmv, bkingmv: req.body.special.bkingmv, 
        wWin: req.body.special.wWin, bWin: req.body.special.bWin, stale: req.body.special.stale, 
        lastAction: {selection: {row: req.body.action.selection.row, col: req.body.action.selection.col}, move: {row: req.body.action.move.row, col: req.body.action.move.col}}},
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
        var newdead = [];
        var newGame = {wWin: 0, bWin: 0};
        var changeData = 0;
        var desiredAction = {};
        newroom = req.body.room;
        newboard = req.body.board;
        newdead = req.body.dead;
        desiredAction = req.body.action;
        var didWKingMv = req.body.special.wkingmv;
        var didBKingMv = req.body.special.bkingmv;
        var movingpiece = req.body.board[desiredAction.selection.row - 1][desiredAction.selection.col - 1];
        var landingBlock = req.body.board[desiredAction.move.row - 1][desiredAction.move.col - 1];
        console.log("Game \"" + req.params.idNum + "\": Requesting Move");
        if (validMove(req.body, desiredAction, didBKingMv, didWKingMv))
        {
            if (movingpiece.charAt(1) == "k" && movingpiece.charAt(0) == "w")
            didWKingMv = 1;
            if (movingpiece.charAt(1) == "k" && movingpiece.charAt(0) == "b")
            didBKingMv = 1;
            console.log("Game \"" + req.params.idNum + "\": Valid Move");
            changeData = 1;
            if (landingBlock != "")
            {
                newdead.push(landingBlock);
                const PIECE_WORTH = {p: 1, n: 3, b: 3, r: 5, q: 9};
                if (landingBlock.charAt(0) == 'w')
                newroom.scores.b += PIECE_WORTH[landingBlock.charAt(1)];
                else newroom.scores.w += PIECE_WORTH[landingBlock.charAt(1)];
            }
            console.log("Game \"" + req.params.idNum + "\": Saving Match");
            newboard[desiredAction.move.row - 1][desiredAction.move.col - 1] = movingpiece;
            newboard[desiredAction.selection.row - 1][desiredAction.selection.col - 1] = "";
            
            if (movingpiece.charAt(1) == "k" &&
            (desiredAction.move.row - desiredAction.selection.row == 0) && 
            (Math.abs(desiredAction.move.col - desiredAction.selection.col) == 2))
            {
                console.log("Castle: Moving Rook as well.");
                if (desiredAction.move.col - desiredAction.selection.col < 0)
                {
                    var rook = newboard[desiredAction.move.row - 1][0];
                    console.log("Rook: " + rook);
                    newboard[desiredAction.move.row - 1][0] = "";
                    newboard[desiredAction.move.row - 1][desiredAction.move.col] = rook;
                }
                else if (desiredAction.move.col - desiredAction.selection.col > 0)
                {
                    var rook = newboard[desiredAction.move.row - 1][7];
                    console.log("Rook: " + rook);
                    newboard[desiredAction.move.row - 1][7] = "";
                    newboard[desiredAction.move.row - 1][desiredAction.move.col - 2] = rook;
                }
            }
            newboard = newQueen(newboard);
            newroom.turnNum += 1;
            newGame.bWin = checkForCheckMate(req.body.board, 'w');
            newGame.wWin = checkForCheckMate(req.body.board, 'b');
            if (changeData == 1)
            {
                try {
                    let data = await Board.updateOne({
                        _id: req.params.idNum
                    },
                    {
                        $inc: { "room.turnNum": 1 },
                        $set: { "action.selection.row": -1, "action.selection.col": -1, "action.move.row": -1, "action.move.col": -1,
                                "room.scores.w": newroom.scores.w, "room.scores.b": newroom.scores.b, "dead": newdead, "special.wkingmv": didWKingMv,
                                "special.bkingmv": didBKingMv, "special.wWin": newGame.wWin, "special.bWin": newGame.bWin,
                            "special.lastAction.selection.row": desiredAction.selection.row, "special.lastAction.selection.col": desiredAction.selection.col, 
                            "special.lastAction.move.row": desiredAction.move.row, "special.lastAction.move.col": desiredAction.move.col},
                        $push : {
                            board : {
                                $each: [newboard[0], newboard[1], newboard[2], newboard[3], newboard[4], newboard[5], newboard[6], newboard[7]],
                                $slice: -8
                            }
                        }
                    });
                    res.send(data);
                } catch (error) {
                console.log(error);
                res.sendStatus(500);
                }
            }
        }
        else
        {
            var returnObject = {data: {_id: "Invalid_Move", nModified : 0}};
            res.send(returnObject);
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

// GAME LOGIC =============================================================================================
// If the move is valid, returns true.
function validMove(match, action, didBKingMv, didWKingMv)
{
    // If the Player Tries to Move His Piece onto another one of his Pieces.
    if ((match.board[action.move.row - 1][action.move.col - 1]) != "")
        if ((match.board[action.selection.row - 1][action.selection.col - 1]).charAt(0) == (match.board[action.move.row - 1][action.move.col - 1]).charAt(0))
            return false; 
    // Get Selected Piece Type
    var color = (match.board[action.selection.row - 1][action.selection.col - 1]).charAt(0); 
    var char = (match.board[action.selection.row - 1][action.selection.col - 1]).charAt(1); 
    // For Each Piece, if it is a valid move, return true.
    switch (char)   
    {
        case 'k':
            if (kingAction(action.selection, action.move, match.board, color, didBKingMv, didWKingMv)) return true;
            break;
        case 'q':
            if (queenAction(action.selection, action.move, match.board, color)) return true;
            break;
        case 'r':
            if (rookAction(action.selection, action.move, match.board, color)) return true;
            break;
        case 'b':
            if (bishopAction(action.selection, action.move, match.board, color)) return true;
            break;
        case 'n':
            if (knightAction(action.selection, action.move, match.board, color)) return true;
            break;
        case 'p':
            if (pawnAction(action.selection, action.move, match.board, color)) return true;
            break;
    }
};
// Checks the Validity of a KING Move
function kingAction(position, actionBlock, board, color, didBKingMv, didWKingMv)
{
    console.log("Processing King Logic");
    // If the move square is Adjacent.
	if ((Math.abs(actionBlock.row - position.row) <= 1) &&
	(Math.abs(actionBlock.col - position.col) <= 1) &&
	 isClearPath(position, actionBlock, board))
	{
        // Moves the piece and checks that the King is Safe.
        board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
        board[position.row - 1][position.col - 1] = "";
        if (isSafe(1, actionBlock, board, color)) return true;
        return false;
    }
    // Logic for Castling
    if ((Math.abs(actionBlock.row - position.row) == 0) &&
	(Math.abs(actionBlock.col - position.col) == 2) &&
     isClearPath(position, actionBlock, board) &&
     isValidCastle(position, actionBlock, board, color) &&
     (((color == "w") && (!didWKingMv)) || 
     ((color == "b") && (!didBKingMv))))
     {
        return true;  
     }
};
// Checks the Validity of a QUEEN Move
function queenAction(position, actionBlock, board, color)
{
    console.log("Processing Queen Logic");
    // If the move is DIAGONAL, HORIZONTAL or VERTICAL
	if (((actionBlock.row == position.row || actionBlock.col == position.col) || 
	(Math.abs(actionBlock.row - position.row) == Math.abs(actionBlock.col - position.col))) &&
	 isClearPath(position, actionBlock, board))
	{
        // Moves the piece and checks that the King is Safe.
        board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
        board[position.row - 1][position.col - 1] = "";
        if (isSafe(0, actionBlock, board, color)) return true;
        return false;
	}
};
// Checks the Validity of a ROOK Move
function rookAction(position, actionBlock, board, color)
{
    console.log("Processing Rook Logic");
    // If the move is HORIZONTAL or VERTICAL
	if ((actionBlock.row == position.row || actionBlock.col == position.col) &&
	 isClearPath(position, actionBlock, board))
	{
        // Moves the piece and checks that the King is Safe.
        board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
        board[position.row - 1][position.col - 1] = "";
        if (isSafe(0, actionBlock, board, color)) return true;
		return false;
	}
};
// Checks the Validity of a BISHOP Move
function bishopAction(position, actionBlock, board, color)
{
    console.log("Processing Bishop Logic");
    // If the move is DIAGONAL
	if ((Math.abs(actionBlock.row - position.row) == Math.abs(actionBlock.col - position.col)) &&
	 isClearPath(position, actionBlock, board))
	{
        // Moves the piece and checks that the King is Safe.
        board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
        board[position.row - 1][position.col - 1] = "";
        if (isSafe(0, actionBlock, board, color)) return true;
        return false;
	}
};
// Checks the Validity of a KNIGHT Move
function knightAction(position, actionBlock, board, color)
{
    console.log("Processing Knight Logic");
    // If the move is a 2 - 1 ratio.
	if ((((Math.abs(actionBlock.row - position.row) == 2) &&
	(Math.abs(actionBlock.col - position.col) == 1)) ||
	((Math.abs(actionBlock.row - position.row) == 1) &&
	(Math.abs(actionBlock.col - position.col) == 2))))
	{
        // Moves the piece and checks that the King is Safe.
        board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
        board[position.row - 1][position.col - 1] = "";
        if (isSafe(0, actionBlock, board, color)) return true;
        return false;
	}
};
// Checks the Validity of a BISHOP Move
function pawnAction(position, actionBlock, board, color)
{
    console.log("Processing Pawn Logic");
    // Setting Direction for Color
	var colorDirection = 1;
    if ((board[position.row - 1][position.col - 1]).charAt(0) == 'b') colorDirection = -1;
    // Allows Double on First Move
    var doubleMove = 0;
    if ((colorDirection == 1 && position.row == 2) || (colorDirection == -1 && position.row == 7)) doubleMove = 1;
    // If the move is forward and empty.
    if (((actionBlock.row - position.row == colorDirection) ||
     (doubleMove && (actionBlock.row - position.row == (colorDirection * 2)))) && 
	(Math.abs(actionBlock.col - position.col) == 0) &&
	board[actionBlock.row - 1][actionBlock.col - 1] == "")
	{
        // Moves the piece and checks that the King is Safe.
		board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
		board[position.row - 1][position.col - 1] = "";
		if (isSafe(0, actionBlock, board, color)) return true;
		return false;
    }
    // If move is DIAGONAL 1, FORWARD 1, and KILLS
	else if ((actionBlock.row - position.row == colorDirection) && 
	(Math.abs(actionBlock.col - position.col) == 1) &&
	((board[actionBlock.row - 1][actionBlock.col - 1]) != ""))
	{
        // Moves the piece and checks that the King is Safe.
        board[actionBlock.row - 1][actionBlock.col - 1] = board[position.row - 1][position.col - 1];
        board[position.row - 1][position.col - 1] = "";
        if (isSafe(0, actionBlock, board, color)) return true;
        return false;
	}
};

// Checks far rows for brave pawns to turn to queens.
function newQueen(board)
{
    console.log("Checking for New Queens.");
	for (var i = 0; i < 8; i++)
	{
        var piece = board[7][i];
        if (piece != "")
            if (piece.charAt(1) == 'p' && piece.charAt(0) == 'w') board[7][i] = "wq";
        piece = board[0][i];
        if (piece != "")
		    if (piece.charAt(1) == 'p' && piece.charAt(0) == 'b') board[0][i] = "bq";
	}
	return board;
};

// Returns true if castle is valid.
function isValidCastle(position, actionBlock, board, color)
{
    console.log("Checking for valid castle...");
    if (color == "w" && (position.row != 1 || position.col != 5)) {console.log("King not on base row."); return false;}
    if (color == "b" && (position.row != 8 || position.col != 5)) {console.log("King not on base row."); return false;}


    var direction = 1;
    if (actionBlock.col - position.col < 0) direction = -1;
    
    var castleObjects = [{direction: 1, piece: "wr2"}, {direction: -1, piece: "wr1"}];
    if (color == "b") castleObjects = [{direction: 1, piece: "br2"}, {direction: -1, piece: "br1"}];
    var index = 0;
    var end = 8;
    if (direction == castleObjects[1].direction)  {index = 1; end = 1}
    testBlock = position.col;
    for (var i = 0; i < 3; i++)
    {
        testBlock = position.col + i * direction;
        console.log("TESTING: " + testBlock + " Found: " + board[position.row - 1][testBlock - 1]);
        if (board[position.row - 1][testBlock - 1] != "") if (board[position.row - 1][testBlock - 1].charAt(1) != "k") {console.log("Path not clear for Castle."); return false;}
        var checkposition = {row: position.row, col: testBlock};
        if (!isSafe(1, checkposition, board, color)) {console.log("King not safe on path or in check."); return false;}
    }
    if (board[position.row - 1][testBlock + 1 * direction - 1] != castleObjects[index].piece)
    {
        if (board[position.row - 1][testBlock + 1 * direction - 1] != "") {console.log("Path not clear for Castle."); return false;}
    }
    if (board[position.row - 1][end - 1] != castleObjects[index].piece) {console.log("Rook ID Not Correct for Castle."); return false;}
    console.log("Valid Castle.");
    return true;
}

// Returns true if no pieces are in the way.
function isClearPath(position, actionBlock, board)
{
    console.log("Processing Path...");
    var distanceX = actionBlock.col - position.col;
    var distanceY = actionBlock.row - position.row;
    if (Math.abs(distanceX) <= 1 && Math.abs(distanceY) <= 1) return true;
    var directionX = 0;
    var directionY = 0;
    if (distanceX != 0)
    {
        if (distanceX < 0) directionX = -1;
        else directionX = 1;
    }
    if (distanceY != 0)
    {
        if (distanceY < 0) directionY = -1;
        else directionY = 1;
    }
    var testBlock = {row: (position.row + directionY), col: (position.col + directionX)};
    var distance = 0;
    if (Math.abs(distanceY) > Math.abs(distanceX)) distance = Math.abs(distanceY) - 1;
    else distance = Math.abs(distanceX) - 1;
    for (var i = 0; i < distance; i++)
    {
        if (board[testBlock.row - 1][testBlock.col - 1] != "") {console.log("Path is Blocked."); return false;}
        testBlock.row += directionY;
        testBlock.col += directionX;
    }
    console.log("Valid Path.");
    return true;
};

function isSafe(isKing, block, board, color)
{
    console.log("Processing King Safety.");
    var kingPosition = {row: 0, col: 0};
    var oppcolor = "";
    if (color == 'b') oppcolor = 'w'; 
    else oppcolor = "b";
	if (isKing)
	{
        kingPosition.row = block.row - 1;
        kingPosition.col = block.col - 1;
    }
    else
    {
        // Finds the King and Stores Location
        for (var i = 0; i < 8; i++) { for (var j = 0; j < 8; j++) {
            if (board[i][j].charAt(0) == color && board[i][j].charAt(1) == "k")
            { kingPosition.row = i; kingPosition.col = j; }
        }}
    }
    var testBlock = {row: kingPosition.row, col: kingPosition.col};
    var testDirection = [{row: 1, col: 0}, {row: -1, col: 0}, {row: 0, col: 1}, {row: 0, col: -1},
                         {row: 1, col: 1}, {row: -1, col: 1}, {row: -1, col: -1}, {row: 1, col: -1}];
    // For each direction.
    for (var i = 0; i < testDirection.length; i++)
    {
        testBlock = {row: (kingPosition.row + testDirection[i].row), col: (kingPosition.col + testDirection[i].col)};
        // Ensures we don't check for data past or before the array
        if (testBlock.row < 0 || testBlock.row > 7 ||
            testBlock.col < 0 || testBlock.col > 7) continue;
        if (board[testBlock.row][testBlock.col] != "")
            if (board[testBlock.row][testBlock.col].charAt(0) == color) continue;
        var distance = 0;
        var end = 0;
        // Extend that direction until you find a piece.
        while(board[testBlock.row][testBlock.col] == "")
        {
            // Ensures we don't check for data past or before the array while moving.
            if ((testBlock.row + testDirection[i].row) < 0 ||
            (testBlock.row + testDirection[i].row > 7) ||
            (testBlock.col + testDirection[i].col < 0) || 
            (testBlock.col + testDirection[i].col > 7))
            {
                end = 1;
                break;
            }
            distance += 1;
            testBlock.row += testDirection[i].row;
            testBlock.col += testDirection[i].col;
        }
        // If the while loop didn't end by finding the edge, check danger.
        if (!end)
        {
            // If that piece is player color, continue.
            if (board[testBlock.row][testBlock.col].charAt(0) == color) continue;
            // If that piece is an enemy QUEEN one, NOT SAFE.
            else if ((board[testBlock.row][testBlock.col].charAt(1) == "q")) {console.log("King is not Safe."); return false;}
            // If that piece is an enemy KING one away, NOT SAFE.
            else if ((board[testBlock.row][testBlock.col].charAt(1) == "k") && distance == 1) {console.log("King is not Safe."); return false;}
            // If that piece is an enemy ROOK and direction is HORIZONTAL or VERTICAL, NOT SAFE.
            else if ((board[testBlock.row][testBlock.col].charAt(1) == "r") && (i < 4)) {console.log("King is not Safe."); return false;}
            // If that piece is an enemy BISHOP and direction is DIAGONAL, NOT SAFE.
            else if ((board[testBlock.row][testBlock.col].charAt(1) == "b") && (i >= 4)) {console.log("King is not Safe."); return false;}
            // If that piece is an enemey PAWN and direction is DIAGONAL one away in the right direction, NOT SAFE.
            else if ((board[testBlock.row][testBlock.col].charAt(1) == "p") &&
            (((color == 'w') && ((i == 5) || (i == 6))) ||
            ((color == 'b') && ((i == 4) || (i == 5)))) 
            && distance == 1) {console.log("King is not Safe."); return false;}
        }
    }
    // Separately check for a knight.
    var knightTest = [{row: 1, col: 2}, {row: -1, col: 2}, {row: 1, col: -2}, {row: -1, col: -2},
                      {row: 2, col: 1}, {row: -2, col: 1}, {row: 2, col: -1}, {row: -2, col: -1}];
    for (test in knightTest)
    {
        testBlock = {row: (kingPosition.row + knightTest[test].row), col: (kingPosition.col + knightTest[test].col)};
        // Ensures we don't check for dat apast or before the array.
        if (testBlock.row < 0 || testBlock.row > 7 ||
        testBlock.col < 0 || testBlock.col > 7) continue;
        // If the block is empty, continue.
        if (board[testBlock.row][testBlock.col] == "") continue;
        // If the pices is king color, continue.
        if (board[testBlock.row][testBlock.col].charAt(0) == color) continue;
        // If the pices is an enemy knight, NOT SAFE.
        if ((board[testBlock.row][testBlock.col].charAt(1) == "n")) {console.log("King is not Safe."); return false;}
    }
    console.log("King is Safe.");
    return true;
};

function checkForCheckMate(board, color)
{
    // Is the King Currently Safe?
    var kingPosition = {row: 0, col: 0};
    for (var i = 0; i < 8; i++) { for (var j = 0; j < 8; j++) {
        if (board[i][j].charAt(0) == color && board[i][j].charAt(1) == "k")
        { kingPosition.row = i; kingPosition.col = j; }
    }}
    if (isSafe(1, kingPosition, board, color)) return false;
    var testDirection = [{row: 1, col: 0}, {row: -1, col: 0}, {row: 0, col: 1}, {row: 0, col: -1},
        {row: 1, col: 1}, {row: -1, col: 1}, {row: -1, col: -1}, {row: 1, col: -1}];
    for (var i = 0; i < testDirection.length; i++)
    {
        var testBlock = {row: kingPosition.row + testDirection[i].row, col: kingPosition.col + testDirection[i].col};
        if (testBlock.row < 0 || testBlock.row > 7 ||
            testBlock.col < 0 || testBlock.col > 7) continue;
        if (isSafe(1, testBlock, board, color)) return false;
    }
    return true;
}