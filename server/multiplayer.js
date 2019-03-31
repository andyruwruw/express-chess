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
        whitePieces: {k1: Object, q1: Object, r1: Object, r2: Object, 
                      b1: Object, b2: Object, n1: Object, n2: Object, 
                      p1: Object, p2: Object, p3: Object, p4: Object, 
                      p5: Object, p6: Object, p7: Object, p8: Object},
        blackPieces: {k1: Object, q1: Object, r1: Object, r2: Object, 
                      b1: Object, b2: Object, n1: Object, n2: Object, 
                      p1: Object, p2: Object, p3: Object, p4: Object, 
                      p5: Object, p6: Object, p7: Object, p8: Object},},
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
        var color = teamColor(req.body.team);                                         // Getting the moving piece's team. (Needed to find Piece Key without looking through both teams)
        var oppcolor = oppColor(req.body.team);
        var teamPieces;
        var oppPieces;
        var teamScore;
        var oppScore;
        if (color == "w")                                                             // Gathering both team's piece objects. (Needed to find Piece Key)
        {
            teamPieces = convertObjectFromRecieved(req.body.pieceData.whitePieces);                              
            oppPieces = convertObjectFromRecieved(req.body.pieceData.blackPieces);  
            teamScore = req.body.whiteScore;
            oppScore = req.body.blackScore;
        }
        else
        {
            oppPieces = convertObjectFromRecieved(req.body.pieceData.whitePieces); 
            teamPieces = convertObjectFromRecieved(req.body.pieceData.blackPieces);  
            teamScore = req.body.blackScore;
            oppScore = req.body.whiteScore;
        }
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
        teamPieces.k1.removeUnsafeMoves(oppBlocked);
        oppPieces.k1.removeUnsafeMoves(teamBlocked);
        if (teamPieces[piece].move(action.move, teamPositions, oppPositions)){                        // Requesting the Move from Piece
        moveAccepted = true; console.log("Move Approved.");}
        else {console.log("Move Denied.");}
        if (moveAccepted)                                                              // The move was valid for that piece.
        {
            if (pieceKilled) {deadArray.push(oppcolor + killPiece); teamScore += oppPieces[killPiece].kill(); }                // If a piece is killed in the movement, it's set to dead and it's score value is added.
            teamPositions = gatherAllPositions(teamPieces);
            oppPositions = gatherAllPositions(oppPieces);
            var keyArray = Object.keys(teamPieces);                     // Getting key values to iterate through pieces object.
            for (var i = 0; i < keyArray.length; i++)                                  // Going through each piece and determining if we need to update its POSSIBLE moves and BLOCKED moves.
            {
                if (teamPieces[keyArray[i]].getStatus())
                {
                    teamPieces[keyArray[i]].checkForRefresh(action.selected, teamPositions, oppPositions);
                    teamPieces[keyArray[i]].checkForRefresh(action.move, teamPositions, oppPositions);
                }
            }
            keyArray = Object.keys(oppPieces);
            for (var i = 0; i < keyArray.length; i++)
            {
                if (oppPieces[keyArray[i]].getStatus())
                {
                    oppPieces[keyArray[i]].checkForRefresh(action.selected, oppPositions, teamPositions);
                    oppPieces[keyArray[i]].checkForRefresh(action.move, oppPositions, teamPositions);
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
                    teamBlocked = gatherBlockedMoves(teamPieces);
                    oppPieces.k1.removeUnsafeMoves(teamBlocked);
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
function setData(a, b){
    var aProps = Object.keys(a);
    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        a[propName] = b[propName]}
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
        else {var pieceMoves = (pieces[pieceKeys[i]]).getblockBlocks();
            blockedMoves = blockedMoves.concat(pieceMoves);}}
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
    pieces.k1 = new King(recievedData.k1.row, recievedData.k1.col, recievedData.k1.num, recievedData.k1.team, recievedData.k1.possibleMoves, recievedData.k1.blockBlocks, recievedData.k1.isDead, recievedData.k1.hasMoved);
    pieces.q1 = new Queen(recievedData.q1.row, recievedData.q1.col, recievedData.q1.num, recievedData.q1.team, recievedData.q1.possibleMoves, recievedData.q1.blockBlocks, recievedData.q1.isDead);
    pieces.r1 = new Rook(recievedData.r1.row, recievedData.r1.col, recievedData.r1.num, recievedData.r1.team, recievedData.r1.possibleMoves, recievedData.r1.blockBlocks, recievedData.r1.isDead);
    pieces.r2 = new Rook(recievedData.r2.row, recievedData.r2.col, recievedData.r2.num, recievedData.r2.team, recievedData.r2.possibleMoves, recievedData.r2.blockBlocks, recievedData.r2.isDead);
    pieces.b1 = new Bishop(recievedData.b1.row, recievedData.b1.col, recievedData.b1.num, recievedData.b1.team, recievedData.b1.possibleMoves, recievedData.b1.blockBlocks, recievedData.b1.isDead);
    pieces.b2 = new Bishop(recievedData.b2.row, recievedData.b2.col, recievedData.b2.num, recievedData.b2.team, recievedData.b2.possibleMoves, recievedData.b2.blockBlocks, recievedData.b2.isDead);
    pieces.n1 = new Knight(recievedData.n1.row, recievedData.n1.col, recievedData.n1.num, recievedData.n1.team, recievedData.n1.possibleMoves, recievedData.n1.blockBlocks, recievedData.n1.isDead);
    pieces.n2 = new Knight(recievedData.n2.row, recievedData.n2.col, recievedData.n2.num, recievedData.n2.team, recievedData.n2.possibleMoves, recievedData.n2.blockBlocks, recievedData.n2.isDead);
    pieces.p1 = new Pawn(recievedData.p1.row, recievedData.p1.col, recievedData.p1.num, recievedData.p1.team, recievedData.p1.possibleMoves, recievedData.p1.blockBlocks, recievedData.p1.isDead, recievedData.p1.hasMoved);
    pieces.p2 = new Pawn(recievedData.p2.row, recievedData.p2.col, recievedData.p2.num, recievedData.p2.team, recievedData.p2.possibleMoves, recievedData.p2.blockBlocks, recievedData.p2.isDead, recievedData.p2.hasMoved);
    pieces.p3 = new Pawn(recievedData.p3.row, recievedData.p3.col, recievedData.p3.num, recievedData.p3.team, recievedData.p3.possibleMoves, recievedData.p3.blockBlocks, recievedData.p3.isDead, recievedData.p3.hasMoved);
    pieces.p4 = new Pawn(recievedData.p4.row, recievedData.p4.col, recievedData.p4.num, recievedData.p4.team, recievedData.p4.possibleMoves, recievedData.p4.blockBlocks, recievedData.p4.isDead, recievedData.p4.hasMoved);
    pieces.p5 = new Pawn(recievedData.p5.row, recievedData.p5.col, recievedData.p5.num, recievedData.p5.team, recievedData.p5.possibleMoves, recievedData.p5.blockBlocks, recievedData.p5.isDead, recievedData.p5.hasMoved);
    pieces.p6 = new Pawn(recievedData.p6.row, recievedData.p6.col, recievedData.p6.num, recievedData.p6.team, recievedData.p6.possibleMoves, recievedData.p6.blockBlocks, recievedData.p6.isDead, recievedData.p6.hasMoved);
    pieces.p7 = new Pawn(recievedData.p7.row, recievedData.p7.col, recievedData.p7.num, recievedData.p7.team, recievedData.p7.possibleMoves, recievedData.p7.blockBlocks, recievedData.p7.isDead, recievedData.p7.hasMoved);
    pieces.p8 = new Pawn(recievedData.p8.row, recievedData.p8.col, recievedData.p8.num, recievedData.p8.team, recievedData.p8.possibleMoves, recievedData.p8.blockBlocks, recievedData.p8.isDead, recievedData.p8.hasMoved);
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
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead) {
        this.row = row;
        this.col = col;
        this.team = team;
        this.enemy = !team;
        this.num = num;
        this.possibleMoves = possibleMoves;
        this.blockBlocks = blockBlocks;
        this.isDead = isDead;
        }

    getSendObject()
    {
        var data = new Object();
        data.row = this.row;
        data.col = this.col;
        data.team = this.team;
        data.num = this.num;
        data.possibleMoves = this.possibleMoves;
        data.blockBlocks = this.blockBlocks;
        data.isDead = this.isDead;
        return data;
    }

    getPositionObject() {
        var position = {row: this.row, col: this.col};
        return position;}

    getPossibleMoves() {
        return this.possibleMoves;}

    getblockBlocks() {
        return this.blockBlocks;}

    move(newPos, teamPositions, oppPositions) { // Checks if possibleMoves includes new position, then sends it there. Refinds possoible moves
        this.findPossibleMoves(teamPositions, oppPositions);
        for (var i = 0; i < this.possibleMoves.length; i++)
        {
            if (this.isEqual(this.possibleMoves[i], newPos))
            {
                this.row = newPos.row;
                this.col = newPos.col;
                this.findPossibleMoves(teamPositions, oppPositions);
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

    checkForRefresh(changeBlock, teamPositions, oppPositions)
    {
        for (var i = 0; i < this.possibleMoves.length; i++)
        {
            if (this.isEqual(this.possibleMoves[i], changeBlock))
            {
                console.log("FINDING NEW POSITIONS");
                this.findPossibleMoves(teamPositions, oppPositions);
                return true;
            }
        }
        for (var i = 0; i < this.blockBlocks.length; i++)
        {
            if (this.isEqual(this.blockBlocks[i], changeBlock))
            {
                console.log("UNBLOCKED");
                this.findPossibleMoves(teamPositions, oppPositions);
                return true;
            }
        }
        return false;
    }

    checkRecursive (xDirection, yDirection, teamPositions, oppPositions, inputBlock)
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
                return true;
            }
        }
        this.possibleMoves.push(testBlock);
        if (this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, testBlock))
        {return true;}
    }

    checkOnce(xDirection, yDirection, teamPositions, oppPositions, currPos)
    {
        var testBlock = this.addValues(currPos, xDirection, yDirection);
        if (!this.isInBoard(testBlock)) return true;

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
}

class Bishop extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        this.points = 3;
        }

    findPossibleMoves(teamPositions, oppPositions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkDiagonal(1, 1, teamPositions, oppPositions);
        this.checkDiagonal(-1, -1, teamPositions, oppPositions);
        this.checkDiagonal(-1, 1, teamPositions, oppPositions);
        this.checkDiagonal(1, -1, teamPositions, oppPositions);
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
}

class King extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead, hasMoved) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        this.hasMoved = hasMoved;
        this.points = 100;
        }

    getSendObject()
    {
        var data = super.getSendObject();
        data.hasMoved = this.hasMoved;
        return data;
    }

    findPossibleMoves(teamPositions, oppPositions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkDiagonal(1, 1, teamPositions, oppPositions);
        this.checkDiagonal(-1, -1, teamPositions, oppPositions);
        this.checkDiagonal(-1, 1, teamPositions, oppPositions);
        this.checkDiagonal(1, -1, teamPositions, oppPositions);
        this.checkStraight(1, 0, teamPositions, oppPositions);
        this.checkStraight(-1, 0, teamPositions, oppPositions);
        this.checkStraight(0, 1, teamPositions, oppPositions);
        this.checkStraight(0, -1, teamPositions, oppPositions);
        for (var i = 0; i < this.possibleMoves.length; i++)
        {
            console.log("King can move: " + this.possibleMoves[i].row + " " + this.possibleMoves[i].col);
        }
    }

    removeUnsafeMoves(opponentBlockedMoves)
    {
        var newPossible = [];
        for (var j = 0; j < this.possibleMoves.length; j++)
        {
            var blocked = false;
            for (var i = 0; i < opponentBlockedMoves.length; i++)
            {
                if ((this.isEqual(this.possibleMoves[j], opponentBlockedMoves[i])))
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
        {console.log("IN CHECK");
        return true;}
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
}

class Knight extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        this.points = 3;
        }

    findPossibleMoves(teamPositions, oppPositions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
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
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead, hasMoved) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        if (team) this.rowDirection = -1;
        else this.rowDirection = 1;
        this.hasMoved = hasMoved;
        this.points = 1;}

    getSendObject()
    {
        var data = super.getSendObject();
        data.hasMoved = this.hasMoved;
        data.rowDirection = this.rowDirection;
        return data;
    }

    move(newPos, teamPositions, oppPositions) { // Checks if possibleMoves includes new position, then sends it there. Refinds possoible moves
        if (super.move(newPos, teamPositions, oppPositions)){
        this.hasMoved = 1; return true;}
        else return false;
    }

    checkPromotion()
    {
        if (this.rowDirection < 0 && row == 0)
        {
            return true;
        }
        if (this.rowDirection > 0 && row == 7)
        {
            return true;
        }
        return false;
    }

    findPossibleMoves(teamPositions, oppPositions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkForward(0, this.rowDirection, teamPositions, oppPositions);
        if (!this.hasMoved)
        {
            this.checkForward(0, this.rowDirection * 2, teamPositions, oppPositions);
        }
        this.checkKillDiag(1, this.rowDirection, teamPositions, oppPositions);
        this.checkKillDiag(-1, this.rowDirection, teamPositions, oppPositions);
    }

    checkForward(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }

    checkKillDiag(xDirection, yDirection, teamPositions, oppPositions) {
        var testBlock = this.addValues({row: this.row, col: this.col}, xDirection, yDirection);
        if (!this.isInBoard(testBlock))return true;

        for (var i = 0; i < teamPositions.length; i++)
        {
            if (this.isEqual(testBlock, teamPositions[i]))
            {
                teamPositions.splice(i, 1);
                this.blockBlocks.push(testBlock);
                return true;
            }
        }
        for (var i = 0; i < oppPositions.length; i++)
        {
            if (this.isEqual(testBlock, oppPositions[i]))
            {
                oppPositions.splice(i, 1);
                this.possibleMoves.push(testBlock);
                return true;
            }
        }  
        return true;
    }
}

class Queen extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        this.points = 9;
        }

    findPossibleMoves(teamPositions, oppPositions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkDiagonal(1, 1, teamPositions, oppPositions);
        this.checkDiagonal(-1, -1, teamPositions, oppPositions);
        this.checkDiagonal(-1, 1, teamPositions, oppPositions);
        this.checkDiagonal(1, -1, teamPositions, oppPositions);
        this.checkStraight(1, 0, teamPositions, oppPositions);
        this.checkStraight(-1, 0, teamPositions, oppPositions);
        this.checkStraight(0, 1, teamPositions, oppPositions);
        this.checkStraight(0, -1, teamPositions, oppPositions);
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
}

class Rook extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        this.points = 5;
        }

    getSendObject()
    {
        var data = super.getSendObject();
        data.hasMoved = this.hasMoved;
        return data;
    }

    findPossibleMoves(teamPositions, oppPositions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkStraight(1, 0, teamPositions, oppPositions);
        this.checkStraight(-1, 0, teamPositions, oppPositions);
        this.checkStraight(0, 1, teamPositions, oppPositions);
        this.checkStraight(0, -1, teamPositions, oppPositions);
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
}


