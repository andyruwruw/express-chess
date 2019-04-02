const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

const activeSchema = new mongoose.Schema({
    _id: String,
    player1: Boolean,
    player2: Boolean,
    playerNum: Number,
    turn: Number,
    server: Boolean,
    inactive: Number,
});

const Active = mongoose.model('Active', activeSchema);

router.post('/', async (req, res) => {   // Create a new Selection
    const tracker = new Active({
    _id: req.body._id,
    player1: req.body.player1,
    player2: req.body.player2,
    playerNum: req.body.playerNum,
    turn: req.body.turn,
    server: req.body.server,
    inactive: req.body.inactive
    });
    try {
        await tracker.save();
        res.send(tracker);
    } catch (error) {
        console.log(error);
        res.send("Failed to post tracker.");
    }
});

router.put('/:idNum', async (req, res) => { // Update with new Selection
	try {
        await Active.updateOne({
            _id: req.params.idNum
        },
        {
            $set: { "player1": req.body.player1, "player2": req.body.player2, "playerNum": req.body.playerNum, "turn": req.body.turn, "server": req.body.server, "inactive": req.body.inactive},
        });
        res.send("Success.");
  } catch (error) {
    console.log(error);
    res.sendStatus('Failed to update tracker.');
  }
});

router.get('/:idNum', async (req, res) => { 	// Check for Updates
    try {
        let tracker = await Active.findOne({
        _id: req.params.idNum,
        });
        res.send(tracker);
    } catch (error) {
        res.send('Cannot Find Opponent Selection');
    }
});

router.delete('/:idNum', async (req, res) => { // Delete selection object after move made.
	try {
    await Active.deleteOne({
      _id: req.params.idNum
	});
    res.send('Tracker Deleted.');
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.get('/', async (req, res) => {	// GET AVAILABLE MATCHES
	try {
		let trackers = await Active.find();
		res.send(trackers);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

module.exports = router;