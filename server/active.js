const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

const activeSchema = new mongoose.Schema({
    _id: String,
	toggle: Number
});

const Active = mongoose.model('Active', activeSchema);

router.post('/', async (req, res) => {   // Create a new Selection
    const tracker = new Active({
    _id: req.body._id,
    toggle: req.body.toggle
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
            $set: { "toggle": req.body.toggle},
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

module.exports = router;