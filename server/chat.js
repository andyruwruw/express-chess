const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

const chatSchema = new mongoose.Schema({
    _id: String,
	chats: []
});

const Chat = mongoose.model('Chat', chatSchema);

router.post('/', async (req, res) => {   // Create a new Selection
    const chat = new Chat({
    _id: req.body._id,
    chats: [],
    });
    try {
        await chat.save();
        res.send(chat);
    } catch (error) {
        console.log(error);
        res.send("Failed to post chat.");
    }
});

router.put('/:idNum', async (req, res) => { // Update with new Selection
	try {
        await Chat.updateOne({
            _id: req.params.idNum
        },
        {
            $push : {
                chats : {
                    $each : [req.body.message],
                    $slice: -4
                }
            }
        });
        res.send("Message Added to Chat on Server.");
  } catch (error) {
    console.log(error);
    res.sendStatus('Failed to update chat with message.');
  }
});

router.get('/:idNum', async (req, res) => { 	// Check for Updates
    try {
        let chat = await Chat.findOne({
        _id: req.params.idNum,
        });
        res.send(chat);
    } catch (error) {
        res.send('Cannot Find Opponent Selection');
    }
});

router.delete('/:idNum', async (req, res) => { // Delete selection object after move made.
	try {
    await Chat.deleteOne({
      _id: req.params.idNum
	});
    res.send('Stored Chat Deleted.');
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;