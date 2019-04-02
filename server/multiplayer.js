"use strict";

const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

const boardSchema = new mongoose.Schema({
    _id: String,
    serverTurn: Number,
    whiteScore: Number,
    blackScore: Number,
    whiteCheck: false,
    blackCheck: false,
    whiteCheckMate: false,
    blackCheckMate: false,
    stalemate: false,
    pieceData:{
        whitePieces: Object,
        blackPieces: Object},
    changedSlots: [],
    deadArray: [],
});

const Board = mongoose.model('Board', boardSchema);

router.post('/', async (req, res) => {   // Create a new Game
const match = new Board({
    _id: req.body._id,
    serverTurn: req.body.serverTurn,
    whiteScore: req.body.whiteScore,
    blackScore: req.body.blackScore,
    whiteCheck: req.body.whiteCheck,
    blackCheck: req.body.blackCheck,
    whiteCheckMate: req.body.whiteCheckMate,
    blackCheckMate: req.body.blackCheckMate,
    stalemate: req.body.stalemate,
    pieceData:{
        whitePieces: convertObjectFromRecieved(req.body.pieceData.whitePieces),
        blackPieces: convertObjectFromRecieved(req.body.pieceData.blackPieces),},
    changedSlots: req.body.changedSlots,
    deadArray: req.body.deadArray,
    });
    try {
        await match.save();
        res.send(match);
    } catch (error) {
        console.log(error);
        res.send("Failed to create game.");
    }
});

router.put('/:idNum', async (req, res) => {                                         // Function Updates Game Data with Player Move.
    try {
        var moveAccepted = false;
        var team = req.body.team;
        var color = teamColor(team);                                         // Getting the moving piece's team. (Needed to find Piece Key without looking through both teams)
        var oppcolor = oppColor(team);
        var teamPieces;
        var oppPieces;
        var teamScore;
        var oppScore;
        if (color == "w")                                                             // Gathering both team's piece objects. (Needed to find Piece Key)
        {
            teamPieces = convertObjectFromRecieved(req.body.pieceData.whitePieces);                              
            oppPieces = convertObjectFromRecieved(req.body.pieceData.blackPieces);
            console.log(teamPieces); 
            teamScore = req.body.whiteScore;
            oppScore = req.body.blackScore;
        }
        else
        {
            oppPieces = convertObjectFromRecieved(req.body.pieceData.whitePieces); 
            teamPieces = convertObjectFromRecieved(req.body.pieceData.blackPieces);
            console.log(teamPieces);
            teamScore = req.body.blackScore;
            oppScore = req.body.whiteScore;
        }
        var teamKingPos = teamPieces.k1.getPositionObject(); 
        var oppKingPos = oppPieces.k1.getPositionObject(); 
        
        var deadArray = req.body.deadArray;
        var action = req.body.action;                                                  // Preparing requested move data. (Needed to find Piece Key)
        var piece = getPiece(action.selected, teamPieces);                             // Finding Moving Piece Key. 

        var killPiece;
        var pieceKilled = false;

        var teamPositions = gatherAllPositions(teamPieces);                        // Preparing two arrays with all the piece's locations.
        var oppPositions = gatherAllPositions(oppPieces);

        if (!isEmpty(action.move, teamPositions, oppPositions)) {killPiece = getPiece(action.move, oppPieces); pieceKilled = true; console.log("Piece to be killed: " + killPiece);}

        var changedSlots = [action.selected, action.move];

        var possibleTeamMoves = gatherPossibleMoves(teamPieces);                   // Array of all possible moves create to for check, checkmate or stalemate
        var possibleOppMoves = gatherPossibleMoves(oppPieces); 

        var teamBlocked = gatherBlockedMoves(teamPieces);
        var oppBlocked = gatherBlockedMoves(oppPieces);
        teamPieces.k1.removeUnsafeMoves(oppBlocked, possibleOppMoves);
        oppPieces.k1.removeUnsafeMoves(teamBlocked, possibleTeamMoves);

        if (teamPieces[piece].move(action.move, teamPositions, oppPositions, oppKingPos)){                        // Requesting the Move from Piece
        moveAccepted = true; console.log("Move Approved.");}
        else if (piece.charAt(0) == "k")
        {
            console.log("Checking for caslte");
            if (!teamPieces.k1.getHasMoved())
            {
                console.log("He hsasn't moved yet");
                var possible;
                if (color == "w")
                {
                    console.log("he white");
                    possible = [{row: 0, col: 2}, {row: 0, col: 6}];
                }
                else
                {
                    console.log("he black");
                    possible = [{row: 7, col: 2}, {row: 0, col: 6}];
                }
                if (isEmpty(action.move, teamPositions, oppPositions))
                {
                    console.log("The sapce is empty");
                    if (isEqual(action.move, possible[0]) && isEqual(teamPieces.r1.getPositionObject(), {row: possible[0].row, col: 0}) && isEmpty({row: possible[0].row, col: 1}, teamPositions, oppPositions) && isEmpty({row: possible[0].row, col: 3}, teamPositions, oppPositions))
                    {
                        console.log("ok moving him left");
                        teamPieces.k1.setPosition(action.move.row, action.move.col, teamPositions, oppPositions, oppKingPos);
                        teamPieces.r1.setPosition(action.move.row, action.move.col + 1, teamPositions, oppPositions, oppKingPos);
                        changedSlots.push({row: possible[0].row, col: 0});
                        changedSlots.push({row: possible[0].row, col: 3});
                        moveAccepted = true;
                    }
                    if (isEqual(action.move, possible[1]) && isEqual(teamPieces.r2.getPositionObject(), {row: possible[0].row, col: 7}) && isEmpty({row: possible[0].row, col: 5}, teamPositions, oppPositions))
                    {
                        console.log("ok moving him right;")
                        teamPieces.k1.setPosition(action.move.row, action.move.col, teamPositions, oppPositions, oppKingPos);
                        teamPieces.r2.setPosition(action.move.row, action.move.col - 1, teamPositions, oppPositions, oppKingPos);
                        changedSlots.push({row: possible[0].row, col: 7});
                        changedSlots.push({row: possible[0].row, col: 5});
                        moveAccepted = true;
                    }
                }
            }
        }
        if (moveAccepted)                                                              // The move was valid for that piece.
        {
            if (pieceKilled) {deadArray.push(oppcolor + killPiece); teamScore += oppPieces[killPiece].kill(); }                // If a piece is killed in the movement, it's set to dead and it's score value is added.
            if (piece.charAt(0) == "p" && teamPieces[piece].checkPromotion())
            {
                var position = teamPieces[piece].getPositionObject();
                var keys = Object.keys(teamPieces);
                var queenNum = 0;
                for (var i = 0; i < keys.length; i++)
                {
                    if (keys[i].charAt(0) == "q")
                    {
                        queenNum += 1;
                    }
                }
                var num = queenNum + 1;
                var newQueen = "q" + num;
                delete teamPieces[piece];
                teamPieces[newQueen] = new Queen(position.row, position.col, (queenNum + 1), team, [], [], [], 0);
                teamPositions = gatherAllPositions(teamPieces);
                oppPositions = gatherAllPositions(oppPieces);
                teamPieces[newQueen].findPossibleMoves(teamPositions, oppPositions, oppKingPos);
                console.log(teamPieces[newQueen].getPossibleMoves());
            }
            teamPositions = gatherAllPositions(teamPieces);
            oppPositions = gatherAllPositions(oppPieces);
            var keyArray = Object.keys(teamPieces);                     // Getting key values to iterate through pieces object.
            for (var i = 0; i < keyArray.length; i++)                                  // Going through each piece and determining if we need to update its POSSIBLE moves and BLOCKED moves.
            {
                if (teamPieces[keyArray[i]].getStatus())
                {
                    teamPieces[keyArray[i]].checkForRefresh(action.selected, teamPositions, oppPositions, oppKingPos);
                    teamPieces[keyArray[i]].checkForRefresh(action.move, teamPositions, oppPositions, oppKingPos);
                }
            }
            keyArray = Object.keys(oppPieces);
            for (var i = 0; i < keyArray.length; i++)
            {
                if (oppPieces[keyArray[i]].getStatus())
                {
                    oppPieces[keyArray[i]].checkForRefresh(action.selected, oppPositions, teamPositions, teamKingPos);
                    oppPieces[keyArray[i]].checkForRefresh(action.move, oppPositions, teamPositions, teamKingPos);
                }
            }                                                                          // We now have a clear idea of where each team can move and only updated the ones nessisary.
            
            // Checkmate Variables
            possibleTeamMoves = gatherPossibleMoves(teamPieces);                   // Array of all possible moves create to for check, checkmate or stalemate
            possibleOppMoves = gatherPossibleMoves(oppPieces);                 
            var oppInCheck = false;                                                    // Both values defaulted to false.
            var oppCheckMate = false;
            var stalemate = false;
            var kingSafe = true;
            if (!(teamPieces.k1.isKingSafe(possibleOppMoves))) kingSafe = false;
                                                                                        // If the move put the player in check, or failed make him safe, request for move is denied.
            if (kingSafe)
            {
                if (!(oppPieces.k1.isKingSafe(possibleTeamMoves)))                  // If Opponent in check, save the data to report.
                {
                    oppInCheck = true;
                    possibleTeamMoves = gatherPossibleMoves(teamPieces);
                    teamBlocked = gatherBlockedMoves(teamPieces);
                    oppPieces.k1.removeUnsafeMoves(teamBlocked, possibleTeamMoves);
                    var oppKingPossibleMoves = oppPieces.k1.getPossibleMoves();
                    var dangeringPiece = findDangeringPiece(oppPieces.k1.getPositionObject(), teamPieces);
                    var dangeringPath = findDangeringPath(oppPieces.k1.getPositionObject(), dangeringPiece);
                    possibleTeamMoves = gatherPossibleMoves(teamPieces);                   // Array of all possible moves create to for check, checkmate or stalemate
                    possibleOppMoves = gatherPossibleMoves(oppPieces); 
                    if (checkMate(oppKingPossibleMoves, possibleTeamMoves, possibleOppMoves, dangeringPiece, dangeringPath))                     // Checking if the check is a checkmate.
                    oppCheckMate = true;
                }  
                if (possibleOppMoves.length == 0)                                          // If opponent has no available moves, stalemate is called.
                {
                    stalemate = true;
                }
                var whitePieces;
                var blackPieces;
                var whiteScore;
                var blackScore;
                var whiteCheck = false;
                var blackCheck = false;
                var whiteCheckMate = false;
                var blackCheckMate = false;
                if (color == "w")
                {
                    whitePieces = teamPieces;
                    blackPieces = oppPieces;
                    whiteScore = teamScore;
                    blackScore = oppScore;
                    blackCheck = oppInCheck;
                    blackCheckMate = oppCheckMate;
                }
                else
                {
                    blackPieces = teamPieces;
                    whitePieces = oppPieces;
                    blackScore = teamScore;
                    whiteScore = oppScore;
                    whiteCheck = oppInCheck;
                    whiteCheckMate = oppCheckMate;
                }
                try {
                    let data = await Board.updateOne({
                        _id: req.params.idNum
                    },
                    {
                        $inc: { "serverTurn": 1 },
                        $set: { "pieceData.whitePieces": convertObjectToSend(whitePieces), "pieceData.blackPieces": convertObjectToSend(blackPieces), "changedSlots": changedSlots, 
                                "whiteScore": whiteScore, "blackScore": blackScore, "whiteCheck": whiteCheck, "blackCheck": blackCheck,
                                "whiteCheckMate": whiteCheckMate, "blackCheckMate": blackCheckMate, "stalemate": stalemate, "deadArray": deadArray},
                    });
                    res.send(data);
                } catch (error) {
                console.log(error);
                res.sendStatus(500);
                }
            }
            else
            {
                var returnObject = {data: {_id: "Invalid_Move", nModified : 0, check: 1}};
                res.send(returnObject);
            }
        }
        else {
            var returnObject = {data: {_id: "Invalid_Move", nModified : 0, check: 0}};
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

// Game logic

// =====================================Piece Classes
function gatherAllPositions(pieceObjects){
    var positions = [];
    var pieceKeys = Object.keys(pieceObjects);
    for (var i = 0; i < pieceKeys.length; i++){
        if (!((pieceObjects[pieceKeys[i]]).getStatus())) continue;
        else {
            var testObject = {row: (pieceObjects[pieceKeys[i]]).row, col: (pieceObjects[pieceKeys[i]]).col};
            
            positions.push(testObject);}}
    return positions;}

function findPositionInArray(desired, array){
    for (var i = 0; i < array.length; i++){
        if (isEqual(desired, array[i]))
            return true;}
    return false;}

function isEmpty(testBlock, teamPositions, oppPositions) {
    if (findPositionInArray(testBlock, teamPositions) || findPositionInArray(testBlock, oppPositions))
    return false;
    return true;}

function isEqual(a, b){
    var aProps = Object.keys(a);
    var bProps = Object.keys(b);
    if (aProps.length != bProps.length) return false;
    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if (a[propName] !== b[propName]) return false;}
    return true;
}

function findKeyOffPosition(position, teamPieces)
{
    var array = Object.entries(teamPieces);
    for (var i = 0; i < array.length; i++)
    {
        var item = array[i][1];
        var itemPos = item.getPositionObject();
        if (isEqual(position, itemPos)){
            return array[i][0];
        }
    }
    return false;
}

function teamColor(team){
    if (team) return "b";
    return "w";
}

function oppColor(team){
    if (team) return "w";
    return "b";
}

function getPiece(selection, teamPieces)
{
    return findKeyOffPosition(selection, teamPieces);
}

function gatherPossibleMoves(pieces){
    var possibleMoves = [];
    var pieceKeys = Object.keys(pieces);
    for (var i = 0; i < pieceKeys.length; i++){
        if (!(pieces[pieceKeys[i]].getStatus())) {continue;}
        else {var pieceMoves = (pieces[pieceKeys[i]]).getPossibleMoves();
            possibleMoves = possibleMoves.concat(pieceMoves);}}
    return possibleMoves;}

function gatherBlockedMoves(pieces){
    var blockedMoves = [];
    var pieceKeys = Object.keys(pieces);
    for (var i = 0; i < pieceKeys.length; i++){
        if (!(pieces[pieceKeys[i]].getStatus())) {continue;}
        else 
        {
            var pieceMoves = (pieces[pieceKeys[i]]).getblockBlocks();
            var continuedPath = (pieces[pieceKeys[i]]).getpathBlocks();
            blockedMoves = blockedMoves.concat(pieceMoves);
            blockedMoves = blockedMoves.concat(continuedPath);
        }}
    return blockedMoves;}

function checkMate(kingPossibleMoves, teamPossibleMoves, oppPossibleMoves, dangeringBlock, dangeringPath){
    var blockedMoves = [];
    for (var i = 0; i < kingPossibleMoves.length; i++)
    {
        var blocked = false;
        for (var j = 0; j < teamPossibleMoves.length; j++)
        {
            if (isEqual(kingPossibleMoves[i], teamPossibleMoves[j])) 
            blocked = true;
        } 
        if (!blocked) {console.log("NOT BLOCKED"); return false;}
    }
    for (var i = 0; i < oppPossibleMoves.length; i++)
    {
        if (isEqual(oppPossibleMoves[i], dangeringBlock)) {console.log("CAN BE KILLED"); return false;}
        for (var j = 0; j < dangeringPath.length; j++)
        {
            if (isEqual(oppPossibleMoves[i], dangeringPath[j])) {console.log("BLOCKED PATH"); return false;}
        }
    }
    console.log("CheckMate");
    return true;}

function convertObjectFromRecieved(recievedData){
    var pieces = new Object();
    var keys = Object.keys(recievedData);
    for (var i = 0; i < keys.length; i++)
    {
        console.log(keys[i]);
        console.log(recievedData[keys[i]]);
        switch (recievedData[keys[i]].type) {
            case "k":
                pieces[keys[i]] = new King(recievedData[keys[i]].row, recievedData[keys[i]].col, recievedData[keys[i]].num, recievedData[keys[i]].team, recievedData[keys[i]].possibleMoves, 
                    recievedData[keys[i]].blockBlocks, recievedData[keys[i]].pathBlocks, recievedData[keys[i]].isDead, recievedData[keys[i]].hasMoved);
                break;
            case "q":
                pieces[keys[i]] = new Queen(recievedData[keys[i]].row, recievedData[keys[i]].col, recievedData[keys[i]].num, recievedData[keys[i]].team, recievedData[keys[i]].possibleMoves, 
                    recievedData[keys[i]].blockBlocks, recievedData[keys[i]].pathBlocks, recievedData[keys[i]].isDead);
                break;
            case "r":
                pieces[keys[i]] = new Rook(recievedData[keys[i]].row, recievedData[keys[i]].col, recievedData[keys[i]].num, recievedData[keys[i]].team, recievedData[keys[i]].possibleMoves, 
                    recievedData[keys[i]].blockBlocks, recievedData[keys[i]].pathBlocks, recievedData[keys[i]].isDead);
                break;
            case "b":
                pieces[keys[i]] = new Bishop(recievedData[keys[i]].row, recievedData[keys[i]].col, recievedData[keys[i]].num, recievedData[keys[i]].team, recievedData[keys[i]].possibleMoves, 
                    recievedData[keys[i]].blockBlocks, recievedData[keys[i]].pathBlocks, recievedData[keys[i]].isDead);
                break;
            case "n":
                pieces[keys[i]] = new Knight(recievedData[keys[i]].row, recievedData[keys[i]].col, recievedData[keys[i]].num, recievedData[keys[i]].team, recievedData[keys[i]].possibleMoves, 
                    recievedData[keys[i]].blockBlocks, recievedData[keys[i]].pathBlocks, recievedData[keys[i]].isDead);
                break;
            case "p":
                pieces[keys[i]] = new Pawn(recievedData[keys[i]].row, recievedData[keys[i]].col, recievedData[keys[i]].num, recievedData[keys[i]].team, recievedData[keys[i]].possibleMoves, 
                    recievedData[keys[i]].blockBlocks, recievedData[keys[i]].pathBlocks, recievedData[keys[i]].isDead);
                break;
        }
    }
    return pieces;};

function convertObjectToSend(piecesData){
    var result = new Object();
    var keys = Object.keys(piecesData);
    for (var i = 0; i < keys.length; i++){
        result[keys[i]] = piecesData[keys[i]].getSendObject();}
    return result;}

function findDangeringPiece(kingPos, teamPieces)
{
    var teamKeys = Object.keys(teamPieces);
    for (var i = 0; i < teamKeys.length; i++)
    {
        if (!((teamPieces[teamKeys[i]]).getStatus())) continue;
        var possArray = teamPieces[teamKeys[i]].getPossibleMoves();
        for (var j = 0; j < possArray.length; j++)
        {
            if (isEqual(possArray[j], kingPos))
            {
                return teamPieces[teamKeys[i]].getPositionObject();
            }
        }
    }
    console.log("Failed to find dangering Pieces");
    return false;
}

function findDangeringPath(kingPos, dangeringPos)
{
    var path = [];
    if (isKnight(kingPos, dangeringPos))
    {
        return path;
    }
    var yDirection = 0;
    if (kingPos.row > dangeringPos.row) yDirection = 1;
    if (kingPos.row < dangeringPos.row) yDirection = -1;
    var xDirection = 0;
    if (kingPos.col > dangeringPos.col) xDirection = 1;
    if (kingPos.col < dangeringPos.col) xDirection = -1;
    
    var testBlock = {row: dangeringPos.row, col: dangeringPos.col};
    addValues(testBlock, xDirection, yDirection);
    while (!(isEqual(testBlock, kingPos)))
    {
        path.push(testBlock);
        testBlock = addValues(testBlock, xDirection, yDirection);
    }
    return path;
}

function addValues(block, x, y)
{
    return {row: block.row + y, col: block.col + x};
}
function isKnight(a, b)
{
    var x = Math.abs(a.col - b.col);
    var y = Math.abs(a.row - b.row);
    if ((x == 2 && y == 1) || (x == 1 && y == 2))
    return true;
    else
    return false;
}
//=========================================PIECE CLASSES

// Castle
// Finish Queen Promotion


class Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead) {
        this.row = row;
        this.col = col;
        this.team = team;
        this.enemy = !team;
        this.num = num;
        this.possibleMoves = possibleMoves;
        this.blockBlocks = blockBlocks;
        this.pathBlocks = pathBlocks;
        this.isDead = isDead;
        }

    setPosition(row, col, teamPositions, oppPositions, enemeyKingPos)
    {
        this.row = row;
        this.col = col;
        this.findPossibleMoves(teamPositions, oppPositions, enemeyKingPos);
    }

    getSendObject()
    {
        var data = new Object();
        data.row = this.row;
        data.col = this.col;
        data.team = this.team;
        data.num = this.num;
        data.type = this.type;
        data.possibleMoves = this.possibleMoves;
        data.blockBlocks = this.blockBlocks;
        data.pathBlocks = this.pathBlocks;
        data.isDead = this.isDead;
        return data;
    }

    getType()
    {
        return this.type;
    }

    getPositionObject() {
        var position = {row: this.row, col: this.col};
        return position;}

    getPossibleMoves() {
        return this.possibleMoves;}

    getblockBlocks() {
        return this.blockBlocks;}

    getpathBlocks(){
        return this.pathBlocks;}

    move(newPos, teamPositions, oppPositions, enemyKingPos) { // Checks if possibleMoves includes new position, then sends it there. Refinds possoible moves
        this.findPossibleMoves(teamPositions, oppPositions, enemyKingPos);
        for (var i = 0; i < this.possibleMoves.length; i++)
        {
            if (this.isEqual(this.possibleMoves[i], newPos))
            {
                this.row = newPos.row;
                this.col = newPos.col;
                this.findPossibleMoves(teamPositions, oppPositions, enemyKingPos);
                return true;}
        }
        console.log("MOVE FAILED");
        return false;
    }

    kill() { // Kills the piece, placing it at 9-9 and Returning its point worth.
        this.row = 100;
        this.col = 100;
        this.isDead = 1;
        return this.points;}

    getStatus() // false if dead
    {
        if (this.isDead) return false;
        return true;
    }

    checkForRefresh(changeBlock, teamPositions, oppPositions, enemyKingPos)
    {
        for (var i = 0; i < this.possibleMoves.length; i++)
        {
            if (this.isEqual(this.possibleMoves[i], changeBlock))
            {
                console.log("FINDING NEW POSITIONS");
                this.findPossibleMoves(teamPositions, oppPositions, enemyKingPos);
                return true;
            }
        }
        for (var i = 0; i < this.blockBlocks.length; i++)
        {
            if (this.isEqual(this.blockBlocks[i], changeBlock))
            {
                console.log("UNBLOCKED");
                this.findPossibleMoves(teamPositions, oppPositions, enemyKingPos);
                return true;
            }
        }
        for (var i = 0; i < this.pathBlocks.length; i++)
        {
            if (this.isEqual(this.pathBlocks[i], changeBlock))
            {
                console.log("PATH CHANGED");
                this.findPossibleMoves(teamPositions, oppPositions, enemyKingPos);
                return true;
            }
        }
        return false;
    }

    checkRecursive (xDirection, yDirection, teamPositions, oppPositions, inputBlock, enemyKingPos)
    {
        var testBlock = this.addValues(inputBlock, xDirection, yDirection);
        if (!(this.isInBoard(testBlock))) {return true;}
        
        for (var i = 0; i < teamPositions.length; i++)
        {
            if (this.isEqual(testBlock, teamPositions[i]))
            {
                this.blockBlocks.push(testBlock);
                return true;
            }
        }
        for (var i = 0; i < oppPositions.length; i++)
        {
            if (this.isEqual(testBlock, oppPositions[i]))
            {
                this.possibleMoves.push(testBlock);
                if (this.isEqual(testBlock, enemyKingPos))
                {
                    var onePast = this.addValues(testBlock, xDirection, yDirection);
                    this.pathBlocks.push(onePast);
                }
                return true;
            }
        }
        this.possibleMoves.push(testBlock);
        if (this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, testBlock, enemyKingPos))
        {return true;}
    }

    checkOnce(xDirection, yDirection, teamPositions, oppPositions, currPos)
    {
        var testBlock = this.addValues(currPos, xDirection, yDirection);
        if (!this.isInBoard(testBlock)) return false;

        for (var i = 0; i < teamPositions.length; i++)
        {
            if (this.isEqual(testBlock, teamPositions[i]))
            {
                this.blockBlocks.push(testBlock);
                return false;
            }
        }
        for (var i = 0; i < oppPositions.length; i++)
        {
            if (this.isEqual(testBlock, oppPositions[i]))
            {
                this.possibleMoves.push(testBlock);
                return false;
            }
        }
        this.possibleMoves.push(testBlock);
        return true;
    }

    isEqual(a, b){
        var aProps = Object.keys(a);
        var bProps = Object.keys(b);
        if (aProps.length != bProps.length) return false;
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            if (a[propName] !== b[propName]) return false;}
        return true;
    }
    setData(a, b){
        var aProps = Object.getOwnPropertyNames(a);
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            a[propName] = b[propName]}
    }
    isInBoard(a){
        if (a.row < 0 || a.row > 7 || a.col < 0 || a.col > 7) {return false;}
        else {return true;}
    }
    addValues(block, x, y)
    {
        return {row: block.row + y, col: block.col + x};
    }

    findPossibleMoves()
    {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.pathBlocks = [];
    }
}

class Bishop extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead);
        this.type = "b";
        this.points = 3;
        }

    findPossibleMoves(teamPositions, oppPositions, enemyKingPos) {
        super.findPossibleMoves();
        this.checkDiagonal(1, 1, teamPositions, oppPositions, enemyKingPos);
        this.checkDiagonal(-1, -1, teamPositions, oppPositions, enemyKingPos);
        this.checkDiagonal(-1, 1, teamPositions, oppPositions, enemyKingPos);
        this.checkDiagonal(1, -1, teamPositions, oppPositions, enemyKingPos);
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPositions, enemyKingPos)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col}, enemyKingPos);
    }
}

class King extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead, hasMoved) {
        super(row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead);
        this.type = "k";
        this.hasMoved = hasMoved;
        this.points = 100;
        }

    getSendObject()
    {
        var data = super.getSendObject();
        data.hasMoved = this.hasMoved;
        return data;
    }

    move(newPos, teamPositions, oppPositions, enemyKingPos)
    {
        var move = super.move(newPos, teamPositions, oppPositions, enemyKingPos);
        if (move)
        {
            this.hasMoved = true;
        }
        return move;
    }

    findPossibleMoves(teamPositions, oppPositions, enemyKingPos) {
        super.findPossibleMoves();
        this.checkDiagonal(1, 1, teamPositions, oppPositions);
        this.checkDiagonal(-1, -1, teamPositions, oppPositions);
        this.checkDiagonal(-1, 1, teamPositions, oppPositions);
        this.checkDiagonal(1, -1, teamPositions, oppPositions);
        var right = this.checkStraight(1, 0, teamPositions, oppPositions);
        this.checkStraight(-1, 0, teamPositions, oppPositions);
        var left = this.checkStraight(0, 1, teamPositions, oppPositions);
        this.checkStraight(0, -1, teamPositions, oppPositions);
    }

    getHasMoved()
    {
        return this.hasMoved;
    }

    removeUnsafeMoves(opponentBlockedMoves, oppPossibleMoves)
    {
        var nonos = opponentBlockedMoves.concat(oppPossibleMoves);
        var newPossible = [];
        for (var j = 0; j < this.possibleMoves.length; j++)
        {
            var blocked = false;
            for (var i = 0; i < nonos.length; i++)
            {
                if ((this.isEqual(this.possibleMoves[j], nonos[i])))
                {
                    blocked = true;
                    break;
                }
            }
            if (!blocked)
            {
                newPossible.push(this.possibleMoves[j]);
            }
        }
        this.possibleMoves = newPossible;
    }

    isKingSafe(oppPossibleMoves){
    for (var i = 0; i < oppPossibleMoves.length; i++){
        if (this.isEqual({row: this.row, col: this.col}, oppPossibleMoves[i])) return false;}
        return true;
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPositions)
    {
        return this.checkOnce(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
}

class Knight extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead);
        this.type = "n";
        this.points = 3;
        }

    findPossibleMoves(teamPositions, oppPositions, enemyKingPos) {
        super.findPossibleMoves();
        this.checkKnightL(1, 2, teamPositions, oppPositions);
        this.checkKnightL(2, 1, teamPositions, oppPositions);
        this.checkKnightL(2, -1, teamPositions, oppPositions);
        this.checkKnightL(1, -2, teamPositions, oppPositions);
        this.checkKnightL(-1, -2, teamPositions, oppPositions);
        this.checkKnightL(-2, -1, teamPositions, oppPositions);
        this.checkKnightL(-2, 1, teamPositions, oppPositions);
        this.checkKnightL(-1, 2, teamPositions, oppPositions);
    }

    checkKnightL(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
}

class Pawn extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead, Overload) {
        super(row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead);
        if (team) this.rowDirection = -1;
        else this.rowDirection = 1;
        this.type = "p";
        this.points = 1;}

    getSendObject()
    {
        var data = super.getSendObject();
        data.rowDirection = this.rowDirection;
        return data;
    }

    checkPromotion()
    {
        if (this.rowDirection < 0 && this.row == 0)
        {
            return true;
        }
        if (this.rowDirection > 0 && this.row == 7)
        {
            return true;
        }
        return false;
    }

    findPossibleMoves(teamPositions, oppPositions, enemyKingPos) {
        super.findPossibleMoves();
        var notBlocked = this.checkForwardPawn(0, this.rowDirection, teamPositions, oppPositions);
        if (((this.team && this.row == 6) || (!this.team && this.row == 1)) && notBlocked)
        {
            this.checkForwardPawn(0, this.rowDirection * 2, teamPositions, oppPositions);
        }
        this.checkKillDiag(1, this.rowDirection, teamPositions, oppPositions);
        this.checkKillDiag(-1, this.rowDirection, teamPositions, oppPositions);
    }

    checkForwardPawn(xDirection, yDirection, teamPositions, oppPositions)
    {
        return this.checkOncePawn(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }

    checkKillDiag(xDirection, yDirection, teamPositions, oppPositions) {
        var testBlock = this.addValues({row: this.row, col: this.col}, xDirection, yDirection);
        if (!this.isInBoard(testBlock))return true;

        for (var i = 0; i < teamPositions.length; i++)
        {
            if (this.isEqual(testBlock, teamPositions[i]))
            {
                this.blockBlocks.push(testBlock);
                return true;
            }
        }
        for (var i = 0; i < oppPositions.length; i++)
        {
            if (this.isEqual(testBlock, oppPositions[i]))
            {
                this.possibleMoves.push(testBlock);
                return true;
            }
        }  
	this.blockBlocks.push(testBlock);
        return true;
    }

    checkOncePawn(xDirection, yDirection, teamPositions, oppPositions, currPos)
    {
        var testBlock = this.addValues(currPos, xDirection, yDirection);
        if (!this.isInBoard(testBlock)) return false;

        for (var i = 0; i < teamPositions.length; i++)
        {
            if (this.isEqual(testBlock, teamPositions[i]))
            {
                this.blockBlocks.push(testBlock);
                return false;
            }
        }
        for (var i = 0; i < oppPositions.length; i++)
        {
            if (this.isEqual(testBlock, oppPositions[i]))
            {
                this.blockBlocks.push(testBlock);
                return false;
            }
        }
        this.possibleMoves.push(testBlock);
        return true;
    }
}

class Queen extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead);
        this.type = "q";
        this.points = 9;
        }

    findPossibleMoves(teamPositions, oppPositions, enemyKingPos) {
        super.findPossibleMoves();
        this.checkDiagonal(1, 1, teamPositions, oppPositions, enemyKingPos);
        this.checkDiagonal(-1, -1, teamPositions, oppPositions, enemyKingPos);
        this.checkDiagonal(-1, 1, teamPositions, oppPositions, enemyKingPos);
        this.checkDiagonal(1, -1, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(1, 0, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(-1, 0, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(0, 1, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(0, -1, teamPositions, oppPositions, enemyKingPos);
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPositions, enemyKingPos)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col}, enemyKingPos);
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPositions, enemyKingPos)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col}, enemyKingPos);
    }
}

class Rook extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead);
        this.type = "r";
        this.points = 5;
        }

    getSendObject()
    {
        var data = super.getSendObject();
        return data;
    }

    findPossibleMoves(teamPositions, oppPositions, enemyKingPos) {
        super.findPossibleMoves();
        this.checkStraight(1, 0, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(-1, 0, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(0, 1, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(0, -1, teamPositions, oppPositions, enemyKingPos);
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPositions, enemyKingPos)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col}, enemyKingPos);
    }
}


