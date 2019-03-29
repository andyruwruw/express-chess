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
        whitePieces: {k1: King(), q1: Queen(), r1: Rook(), r2: Rook(), 
                      b1: Bishop(), b2: Bishop(), n1: Knight(), n2: Knight(), 
                      p1: Pawn(), p2: Pawn(), p3: Pawn(), p4: Pawn(), 
                      p5: Pawn(), p6: Pawn(), p7: Pawn(), p8: Pawn()},
        blackPieces: {k1: King(), q1: Queen(), r1: Rook(), r2: Rook(), 
                      b1: Bishop(), b2: Bishop(), n1: Knight(), n2: Knight(), 
                      p1: Pawn(), p2: Pawn(), p3: Pawn(), p4: Pawn(), 
                      p5: Pawn(), p6: Pawn(), p7: Pawn(), p8: Pawn()},},
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
    stalemate: req.body,stalemate,
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
            teamPieces = req.body.pieceData.whitePieces;                              
            oppPieces = req.body.pieceData.blackPieces;
            teamScore = req.body.whiteScore;
            oppScore = req.body.blackScore;
        }
        else
        {
            oppPieces = req.body.pieceData.whitePieces;
            teamPieces = req.body.pieceData.blackPieces;
            teamScore = req.body.blackScore;
            oppScore = req.body.whiteScore;
        }
        var deadArray = req.body.deadArray;
        var action = req.body.action;                                                  // Preparing requested move data. (Needed to find Piece Key)
        var piece = getPiece(action.selected, teamPieces);                             // Finding Moving Piece Key. 
        var killPiece;
        var pieceKilled = false;
        if (!isEmpty(action.move)) {killPiece = getPiece(action.move, oppPieces); pieceKilled = true; deadArray.push(oppcolor + killPiece)}     
        var changedSlots = [action.selected, action.move];                         
        if (teamPieces[piece].move(action.move, changedSlots)){                        // Requesting the Move from Piece
        moveAccepted = true;}
        if (moveAccepted)                                                              // The move was valid for that piece.
        {
            if (pieceKilled) teamScore += oppPieces[killPiece].kill();                 // If a piece is killed in the movement, it's set to dead and it's score value is added.
            var teamPositions = gatherAllPositions(teamPieces);                        // Preparing two arrays with all the piece's locations.
            var blackPostions = gatherAllPositions(oppPieces);
            let keyArray = Object.getOwnPropertyNames(teamPieces);                     // Getting key values to iterate through pieces object.
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

/* HELPER */ 
function gatherAllPositions(whitePieces){
    var positions = [];
    var pieces = Object.values(whitePieces);
    for (piece in pieces){
        if (!((pieces[piece]).getStatus())) continue;
        else {var testObject = pieces[piece].getPositionObject();
            positions.push(testObject);}}
    return positions;}
/* HELPER */ 
function findPositionInArray(desired, array){
    for (item in array){
        if (isEqual(desired, array[item]))
            return true;}
    return false;}

/* HELPER */ 
function isMyPiece(testBlock, teamPositions) {
    return findPositionInArray(testBlock, teamPositions);}

function isEmpty(testBlock, whitePositions, blackPostions) {
    if (findPositionInArray(testBlock, whitePositions) || findPositionInArray(testBlock, blackPostions))
    return false;
    return true;}
/* HELPER */ 
function isEqual(a, b){
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) return false;
    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if (a[propName] !== b[propName]) return false;}
    return true;
}
function setData(a, b){
    var aProps = Object.getOwnPropertyNames(a);
    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        a[propName] = b[propName]}
}
function isInBoard(a){
    if (a.row < 0 || a.row > 7 && a.col < 0 && a.col > 7) return false;
    return true;
}

function findKeyOffPosition(position, teamPieces)
{
    var array = Object.entries(teamPieces);
    for (i = 0; i < array.length; i++)
    {
        if (isEqual(position, array[i][1].getPositionObject())){
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
    for (piece in pieces){
        if (!((pieces[piece]).getStatus())) continue;
        else {var pieceMoves = pieces[piece].getPossibleMoves();
            possibleMoves.concat(pieceMoves);}}
    return possibleMoves}

function isKingSafe(kingPos, oppPossibleMoves){
    for (move in oppPossibleMoves){
        if (isEqual(kingPos, oppPossibleMoves[move])) return false;}
    return true;}

function checkMate(kingPossibleMoves, teamPossibleMoves){
    var blockedMoves = [];
    for (move in kingPossibleMoves){
        var blocked = false;
        for (attack in teamPossibleMoves){
            if (isEqual(kingPossibleMoves[move], teamPossibleMoves[attack])) blocked = true;}
        if (!blocked) return false;}
    return true;}