const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

const selectionSchema = new mongoose.Schema({
    _id: String,
    turn: Number,
    selected: String,
});

const Selection = mongoose.model('Selection', selectionSchema);

router.post('/', async (req, res) => {   // Create a new Selection
    const selection = new Selection({
    _id: req.body._id,
    turn: req.body.turn,
    selected: req.body.selected
    });
    try {
        await selection.save();
        res.send(selection);
    } catch (error) {
        console.log(error);
        res.send("Failed to post current selection.");
    }
});

router.put('/:idNum', async (req, res) => { // Update with new Selection
	try {
        await Selection.updateOne({
            _id: req.params.idNum
        },
        {
            $set: { "selected": req.body.selected},
        });
        res.send("Selection Sent to Server.");
  } catch (error) {
    console.log(error);
    res.sendStatus('Failed to update selection');
  }
});

router.get('/:idNum', async (req, res) => { 	// Check for Updates
    try {
        let selection = await Selection.findOne({
        _id: req.params.idNum,
        });
        res.send(selection);
    } catch (error) {
        res.send('Cannot Find Opponent Selection');
    }
});

router.delete('/:idNum', async (req, res) => { // Delete selection object after move made.
	try {
    await Selection.deleteOne({
      _id: req.params.idNum
	});
    res.send('Stored Selection Deleted.');
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;