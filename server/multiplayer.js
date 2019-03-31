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
        whitePieces: {k1: req.body.pieceData.whitePieces.k1, q1: req.body.pieceData.whitePieces.q1, r1: req.body.pieceData.whitePieces.r1, r2: req.body.pieceData.whitePieces.r2,
                      b1: req.body.pieceData.whitePieces.b1, b2: req.body.pieceData.whitePieces.b2, n1: req.body.pieceData.whitePieces.n1, n2: req.body.pieceData.whitePieces.n2,
                      p1: req.body.pieceData.whitePieces.p1, p2: req.body.pieceData.whitePieces.p2, p3: req.body.pieceData.whitePieces.p3, p4: req.body.pieceData.whitePieces.p4,
                      p5: req.body.pieceData.whitePieces.p5, p6: req.body.pieceData.whitePieces.p6, p7: req.body.pieceData.whitePieces.p7, p8: req.body.pieceData.whitePieces.p8},
        blackPieces: {k1: req.body.pieceData.blackPieces.k1, q1: req.body.pieceData.blackPieces.q1, r1: req.body.pieceData.blackPieces.r1, r2: req.body.pieceData.blackPieces.r2,
                      b1: req.body.pieceData.blackPieces.b1, b2: req.body.pieceData.blackPieces.b2, n1: req.body.pieceData.blackPieces.n1, n2: req.body.pieceData.blackPieces.n2,
                      p1: req.body.pieceData.blackPieces.p1, p2: req.body.pieceData.blackPieces.p2, p3: req.body.pieceData.blackPieces.p3, p4: req.body.pieceData.blackPieces.p4,
                      p5: req.body.pieceData.blackPieces.p5, p6: req.body.pieceData.blackPieces.p6, p7: req.body.pieceData.blackPieces.p7, p8: req.body.pieceData.blackPieces.p8}},
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
        if (color == "w")                                                             // Gathering both team's piece objects. (Needed to find Piece Key)
        {
            teamPieces = convertObject(req.body.pieceData.whitePieces);                              
            oppPieces = convertObject(req.body.pieceData.blackPieces);  
            teamScore = req.body.whiteScore;
        }
        else
        {
            oppPieces = convertObject(req.body.pieceData.whitePieces); 
            teamPieces = convertObject(req.body.pieceData.blackPieces);  
            teamScore = req.body.blackScore;
        }
        var deadArray = req.body.deadArray;
        var action = req.body.action;                                                  // Preparing requested move data. (Needed to find Piece Key)
        var piece = getPiece(action.selected, teamPieces);                             // Finding Moving Piece Key. 
        var killPiece;
        var changedSlots = [action.selected, action.move];
        var teamPositions = gatherAllPositions(teamPieces);                        // Preparing two arrays with all the piece's locations.
        var oppPositions = gatherAllPositions(oppPieces);     
        if (teamPieces[piece].move(action.move, teamPositions, oppPositions)){                        // Requesting the Move from Piece
        moveAccepted = true; console.log("Move Approved.");}
        else {console.log("Move Denied.");}
        if (moveAccepted)                                                              // The move was valid for that piece.
        {
            var pieceKilled = false;
            if (!isEmpty(action.move)) {killPiece = getPiece(action.move, oppPieces); pieceKilled = true; deadArray.push(oppcolor + killPiece)}
            if (pieceKilled) teamScore += oppPieces[killPiece].kill();                 // If a piece is killed in the movement, it's set to dead and it's score value is added.
            let keyArray = Object.keys(teamPieces);                     // Getting key values to iterate through pieces object.
            for (var i = 0; i < keyArray.length; i++)                                  // Going through each piece and determining if we need to update its POSSIBLE moves and BLOCKED moves.
            {
                if (teamPieces[keyArray[i]].getStatus())
                {
                    teamPieces[keyArray[i]].checkForRefresh(action.selected);
                    teamPieces[keyArray[i]].checkForRefresh(action.move);
                }
            }
            keyArray = Object.getOwnPropertyNames(oppPieces)
            for (var i = 0; i < keyArray.length; i++)
            {
                if (oppPieces[keyArray[i]].getStatus())
                {
                    oppPieces[keyArray[i]].checkForRefresh(action.selected);
                    oppPieces[keyArray[i]].checkForRefresh(action.move);
                }
            }                                                                          // We now have a clear idea of where each team can move and only updated the ones nessisary.
            
            // Checkmate Variables
            var possibleTeamMoves = gatherPossibleMoves(teamPieces);                   // Array of all possible moves create to for check, checkmate or stalemate
            var possibleOppMoves = gatherPossibleMoves(oppPieces);
            var teamKingPosition = teamPieces.k1.getPositionObject();                  // Accessing both King's Positions.
            var oppKingPosition = oppPieces.k1.getPositionObject();                       
            var oppInCheck = false;                                                    // Both values defaulted to false.
            var oppCheckMate = false;
            var stalemate = false;

            if (!(isKingSafe(oppPieces.k1.getPositionObject(), possibleOppMoves)))       h             // If the move put the player in check, or failed make him safe, request for move is denied.
            {
                var returnObject = {data: {_id: "Invalid_Move", nModified : 0, check: 1}};
                res.send(returnObject);
            }
            if (!(isKingSafe(oppKingPosition, possibleTeamMoves)))                     // If Opponent in check, save the data to report.
            {
                oppInCheck = true;
                var oppKingPossibleMoves = oppPieces.k1.getPossibleMoves();
                if (checkMate(oppKingPossibleMoves, possibleTeamMoves))                     // Checking if the check is a checkmate.
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
                    $set: { "pieceData.whitePieces": whitePieces, "pieceData.blackPieces": blackPieces, "changedSlots": changedSlots, 
                            "whiteScore": whiteScore, "blackScore": blackScore, "whiteCheck": whiteCheck, "blackCheck": blackCheck,
                            "whiteCheckMate": whiteCheckMate, "blackCheckMate": blackCheckMate, "stalemate": stalemate, "deadArray": deadArray},
                });
                res.send(data);
            } catch (error) {
            console.log(error);
            res.sendStatus(500);
            }
        }
        var returnObject = {data: {_id: "Invalid_Move", nModified : 0, check: 0}};
        res.send(returnObject);
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
function gatherAllPositions(whitePieces){
    var positions = [];
    var pieces = Object.values(whitePieces);
    for (var i = 0; i < pieces.length; i++){
        if (!((pieces[i]).getStatus())) continue;
        else {var testObject = pieces[i].getPositionObject();
            positions.push(testObject);}}
    return positions;}

function findPositionInArray(desired, array){
    for (var i = 0; i < array.length; i++){
        if (isEqual(desired, array[i]))
            return true;}
    return false;}

function isEmpty(testBlock, whitePositions, blackPostions) {
    if (findPositionInArray(testBlock, whitePositions) || findPositionInArray(testBlock, blackPostions))
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
    possibleMoves = [];
    var pieces = Object.values(pieces);
    for (var i = 0; i < pieces.length; i++){
        if (!((pieces[i]).getStatus())) continue;
        else {var pieceMoves = pieces[i].getPossibleMoves();
            possibleMoves.concat(pieceMoves);}}
    return possibleMoves;}

function isKingSafe(kingPos, oppPossibleMoves){
    for (var i = 0; i < oppPossibleMoves.length; i++){
        if (isEqual(kingPos, oppPossibleMoves[i])) return false;}
    return true;}

function checkMate(kingPossibleMoves, teamPossibleMoves, oppPossibleMoves, dangeringBlock, dangeringPath){
    var blockedMoves = [];
    for (var i = 0; i < kingPossibleMoves.length; i++){
        var blocked = false;
        for (var j = 0; j < teamPossibleMoves.length; i++){
            if (isEqual(kingPossibleMoves[i], teamPossibleMoves[j])) blocked = true;}
        if (!blocked) return false;}
    for (var i = 0; i < oppPossibleMoves.length; i++)
    {
        if (isEqual(oppPossibleMoves[i], dangeringBlock)) return false;
        for (var j = 0; j < dangeringPath.length; j++)
        {
            if (isEqual(oppPossibleMoves[i], dangeringPath[j])) return false;
        }
    }
    return true;}

function convertObject(piecesData)
{
    var piecesArray = Object.values(piecesData);
    var newData = new Object();
    newData.k1 = new King(piecesArray[0].row, piecesArray[0].col, piecesArray[0].num, piecesArray[0].team);
    newData.k1.setData(piecesArray[0].possibleMoves, piecesArray[0].blockBlocks, piecesArray[0].isDead);
    newData.q1 = new Queen(piecesArray[1].row, piecesArray[1].col, piecesArray[1].num, piecesArray[1].team);
    newData.q1.setData(piecesArray[1].possibleMoves, piecesArray[1].blockBlocks, piecesArray[1].isDead);
    newData.r1 = new Rook(piecesArray[2].row, piecesArray[2].col, piecesArray[2].num, piecesArray[2].team);
    newData.r1.setData(piecesArray[2].possibleMoves, piecesArray[2].blockBlocks, piecesArray[2].isDead);
    newData.r2 = new Rook(piecesArray[3].row, piecesArray[3].col, piecesArray[3].num, piecesArray[3].team);
    newData.r2.setData(piecesArray[3].possibleMoves, piecesArray[3].blockBlocks, piecesArray[3].isDead);
    newData.b1 = new Bishop(piecesArray[4].row, piecesArray[4].col, piecesArray[4].num, piecesArray[4].team);
    newData.b1.setData(piecesArray[4].possibleMoves, piecesArray[4].blockBlocks, piecesArray[4].isDead);
    newData.b2 = new Bishop(piecesArray[5].row, piecesArray[5].col, piecesArray[5].num, piecesArray[5].team);
    newData.b2.setData(piecesArray[5].possibleMoves, piecesArray[5].blockBlocks, piecesArray[5].isDead);
    newData.n1 = new Knight(piecesArray[6].row, piecesArray[6].col, piecesArray[6].num, piecesArray[6].team);
    newData.n1.setData(piecesArray[6].possibleMoves, piecesArray[6].blockBlocks, piecesArray[6].isDead);
    newData.n2 = new Knight(piecesArray[7].row, piecesArray[7].col, piecesArray[7].num, piecesArray[7].team);
    newData.n2.setData(piecesArray[7].possibleMoves, piecesArray[7].blockBlocks, piecesArray[7].isDead);
    newData.p1 = new Pawn(piecesArray[8].row, piecesArray[8].col, piecesArray[8].num, piecesArray[8].team);
    newData.p1.setData(piecesArray[8].possibleMoves, piecesArray[8].blockBlocks, piecesArray[8].isDead);
    newData.p2 = new Pawn(piecesArray[9].row, piecesArray[9].col, piecesArray[9].num, piecesArray[9].team);
    newData.p2.setData(piecesArray[9].possibleMoves, piecesArray[9].blockBlocks, piecesArray[9].isDead);
    newData.p3 = new Pawn(piecesArray[10].row, piecesArray[10].col, piecesArray[10].num, piecesArray[10].team);
    newData.p3.setData(piecesArray[10].possibleMoves, piecesArray[10].blockBlocks, piecesArray[10].isDead);
    newData.p4 = new Pawn(piecesArray[11].row, piecesArray[11].col, piecesArray[11].num, piecesArray[11].team);
    newData.p4.setData(piecesArray[11].possibleMoves, piecesArray[11].blockBlocks, piecesArray[11].isDead);
    newData.p5 = new Pawn(piecesArray[12].row, piecesArray[12].col, piecesArray[12].num, piecesArray[12].team);
    newData.p5.setData(piecesArray[12].possibleMoves, piecesArray[12].blockBlocks, piecesArray[12].isDead);
    newData.p6 = new Pawn(piecesArray[13].row, piecesArray[13].col, piecesArray[13].num, piecesArray[13].team);
    newData.p6.setData(piecesArray[13].possibleMoves, piecesArray[13].blockBlocks, piecesArray[13].isDead);
    newData.p7 = new Pawn(piecesArray[14].row, piecesArray[14].col, piecesArray[14].num, piecesArray[14].team);
    newData.p7.setData(piecesArray[14].possibleMoves, piecesArray[14].blockBlocks, piecesArray[14].isDead);
    newData.p8 = new Pawn(piecesArray[15].row, piecesArray[15].col, piecesArray[15].num, piecesArray[15].team);
    newData.p8.setData(piecesArray[15].possibleMoves, piecesArray[15].blockBlocks, piecesArray[15].isDead);
    return newData;
}

//=========================================PIECE CLASSES

// Castle
// Finish Queen Promotion


class Piece {
    constructor (row, col, num, team) {
        this.row = row;
        this.col = col;
        this.team = team;
        this.enemy = !team;
        this.num = num;
        this.possibleMoves = [];
        this.blockBlocks = [{row: this.row, col: this.col}];
        this.isDead = 0;
        }

    setData(possibleMoves, blockBlocks, isDead)
    {
        this.possibleMoves = possibleMoves;
        this.blockBlocks = blockBlocks;
        this.isDead = isDead;
    }

    getPositionObject() {
        var position = {row: this.row, col: this.col};
        return position;}

    getPossibleMoves() {
        return this.possibleMoves;}

    getblockBlocks() {
        return this.blockBlocks;}

    move(newPos, teamPositions, oppPostions) { // Checks if possibleMoves includes new position, then sends it there. Refinds possoible moves
        this.findPossibleMoves(teamPositions, oppPostions);
        console.log(this.possibleMoves);
        console.log(newPos);
        
        for (var i = 0; i < this.possibleMoves.length; i++)
        {
            
            console.log(this.isEqual(this.possibleMoves[i], newPos));
            if (this.isEqual(this.possibleMoves[i], newPos))
            {
                this.row = newPos.row;
                this.col = newPos.col;
                this.findPossibleMoves(teamPositions, oppPostions);
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

    checkForRefresh(changeBlock, teamPositions, oppPostions)
    {
        for (i = 0; i < this.possibleMoves.length; i++)
        {
            if (this.isEqual(this.possibleMoves[i], changeBlock))
            {
                this.findPossibleMoves(teamPositions, oppPostions);
                return true;
            }
        }
        for (i = 0; i < this.blockBlocks; i++)
        {
            if (this.isEqual(this.blockBlocks[i], changeBlock))
            {
                this.findPossibleMoves(teamPositions, oppPostions);
                return true;
            }
        }
        return false;
    }

    checkRecursive (xDirection, yDirection, teamPositions, oppPostions, testBlock)
    {
        var testBlock = this.addValues(testBlock, xDirection, yDirection);
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
        for (var i = 0; i < oppPostions.length; i++)
        {
            if (this.isEqual(testBlock, oppPostions[i]))
            {
                oppPostions.splice(i, 1);
                this.possibleMoves.push(testBlock);
                return true;
            }
        }
        this.possibleMoves.push(testBlock);
        if (this.checkDiagonal(xDirection, yDirection, teamPositions, oppPostions, testBlock))
        return true;
    }

    checkOnce(xDirection, yDirection, teamPositions, oppPostions, testBlock)
    {
        var testBlock = this.addValues(testBlock, xDirection, yDirection);
        if (!this.isInBoard(testBlock)) return true;

        for (var i = 0; i < teamPositions.length; i++)
        {
            if (this.isEqual(testBlock, teamPositions[i]))
            {
                teamPositions.splice(i, 1);
                this.blockBlocks.push(testBlock);
                return true;
            }
        }
        for (var i = 0; i < oppPostions.length; i++)
        {
            if (this.isEqual(testBlock, oppPostions[i]))
            {
                oppPostions.splice(i, 1);
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
        if (a.row < 0 || a.row > 7 || a.col < 0 || a.col > 7) return false;
        return true;
    }

    addValues(block, x, y)
    {
        return {row: block.row + y, col: block.col + x};
    }
}

class Bishop extends Piece {
    constructor (row, col, num, team) {
        super(row, col, num, team);
        this.points = 3;
        }

    findPossibleMoves(teamPositions, oppPostions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkDiagonal(1, 1, teamPositions, oppPostions);
        this.checkDiagonal(-1, -1, teamPositions, oppPostions);
        this.checkDiagonal(-1, 1, teamPositions, oppPostions);
        this.checkDiagonal(1, -1, teamPositions, oppPostions);
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
}

class King extends Piece {
    constructor (row, col, num, team) {
        super(row, col, num, team);
        this.hasMoved = 0;
        this.points = 0;
        }

    findPossibleMoves(teamPositions, oppPostions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkDiagonal(1, 1, teamPositions, oppPostions);
        this.checkDiagonal(-1, -1, teamPositions, oppPostions);
        this.checkDiagonal(-1, 1, teamPositions, oppPostions);
        this.checkDiagonal(1, -1, teamPositions, oppPostions);
        this.checkStraight(1, 0, teamPositions, oppPostions);
        this.checkStraight(-1, 0, teamPositions, oppPostions);
        this.checkStraight(0, 1, teamPositions, oppPostions);
        this.checkStraight(0, -1, teamPositions, oppPostions);
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
}

class Knight extends Piece {
    constructor (row, col, num, team) {
        super(row, col, num, team);
        this.points = 3;
        }

    findPossibleMoves(teamPositions, oppPostions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkKnightL(1, 2, teamPositions, oppPostions);
        this.checkKnightL(2, 1, teamPositions, oppPostions);
        this.checkKnightL(2, -1, teamPositions, oppPostions);
        this.checkKnightL(1, -2, teamPositions, oppPostions);
        this.checkKnightL(-1, -2, teamPositions, oppPostions);
        this.checkKnightL(-2, -1, teamPositions, oppPostions);
        this.checkKnightL(-2, 1, teamPositions, oppPostions);
        this.checkKnightL(-1, 2, teamPositions, oppPostions);
    }

    checkKnightL(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
}

class Pawn extends Piece {
    constructor (row, col, num, team) {
        super(row, col, num, team);
        if (!team) this.rowDirection = -1;
        else this.rowDirection = 1;
        this.hasMoved = 0;
        this.points = 1;}

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

    findPossibleMoves(teamPositions, oppPostions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkForward(0, this.rowDirection, teamPositions, oppPostions);
        if (!this.hasMoved)
        {
            this.checkForward(0, this.rowDirection * 2, teamPositions, oppPostions);
        }
        this.checkKillDiag(1, this.rowDirection, teamPositions, oppPostions);
        this.checkKillDiag(-1, this.rowDirection, teamPositions, oppPostions);
    }

    checkForward(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }

    checkKillDiag(xDirection, yDirection, teamPositions, oppPostions) {
        var testBlock = this.addValues({row: this.row, col: this.col}, xDirection, yDirection);
        if (!isInBoard(testBlock))return true;

        for (var i = 0; i < teamPositions.length; i++)
        {
            if (this.isEqual(testBlock, teamPositions[i]))
            {
                teamPositions.splice(i, 1);
                this.blockBlocks.push(testBlock);
                return true;
            }
        }
        for (var i = 0; i < oppPostions.length; i++)
        {
            if (this.isEqual(testBlock, oppPostions[position]))
            {
                oppPostions.splice(position, 1);
                this.possibleMoves.push(testBlock);
                return true;
            }
        }  
        return true;
    }
}

class Queen extends Piece {
    constructor (row, col, num, team) {
        super(row, col, num, team);
        this.points = 9;

        }

    findPossibleMoves(teamPositions, oppPostions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkDiagonal(1, 1, teamPositions, oppPostions);
        this.checkDiagonal(-1, -1, teamPositions, oppPostions);
        this.checkDiagonal(-1, 1, teamPositions, oppPostions);
        this.checkDiagonal(1, -1, teamPositions, oppPostions);
        this.checkStraight(1, 0, teamPositions, oppPostions);
        this.checkStraight(-1, 0, teamPositions, oppPostions);
        this.checkStraight(0, 1, teamPositions, oppPostions);
        this.checkStraight(0, -1, teamPositions, oppPostions);
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
}

class Rook extends Piece {
    constructor (row, col, num, team) {
        super(row, col, num, team);
        this.points = 5;
        }

    findPossibleMoves(teamPositions, oppPostions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkStraight(1, 0, teamPositions, oppPostions);
        this.checkStraight(-1, 0, teamPositions, oppPostions);
        this.checkStraight(0, 1, teamPositions, oppPostions);
        this.checkStraight(0, -1, teamPositions, oppPostions);
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
}