const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

const chatSchema = new mongoose.Schema({
	chats: []
});

const Chat = mongoose.model('Chat', chatSchema);

router.post('/', async (req, res) => {   // Create a new Chat
    const chat = new Chat({
        chats: [],
    });
    try {
        await chat.save();
        res.send(chat);
    } catch (error) {
        res.send("Failed to create chat.");
    }
});

router.put('/:idNum', async (req, res) => { // Player Send a message
	try {
		let chat = await Chat.findOne({
      _id: req.params.idNum
		});
		chat.chats.push({text: req.body.text, username: req.body.username});
		await chat.save();
		res.send(chat);
  } catch (error) {
    res.send('Failed to Send Chat')
  }
});

router.get('/:idNum', async (req, res) => { 	// Check for Chat Updates
	try {
		let chat = await Chat.findOne({
      _id: req.params.idNum
		});
		res.send(chat);
	} catch (error) {
		res.send('Cannot Find Chat')
	}
});

module.exports = router;