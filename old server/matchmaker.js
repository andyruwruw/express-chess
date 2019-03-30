const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

const matchMakingSchema = new mongoose.Schema({
	_id: String,
	roomNum: Number,
	playerNum: Number,
	gameId: String
});

const Match = mongoose.model('Match', matchMakingSchema);

router.get('/', async (req, res) => {	// GET AVAILABLE MATCHES
	try {
		let rooms = await Match.find();
		for (room in rooms)
		{
			if (rooms[room].playerNum >= 2)
			{
				rooms.splice(room, 1);
			}
		}
		if (rooms.length > 0)
		{
			res.send(rooms);
		}
		else
		{
			var array = [];
			res.send(array);
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

router.put('/:idNum', async (req, res) => { // EDIT A ROOM TO SET A GAME
	try {
		let room = await Match.findOne({
      _id: req.params.idNum
		});
		room.playerNum = req.body.playerNum;
		await room.save();
        res.send(room);
  } catch (error) {
    console.log(error);
    res.sendStatus('Failed to Join Room');
  }
});

router.post('/', async (req, res) => { // IF NO MATCH FOUND, POST ONE
	const room = new Match({
		_id: req.body._id,
		roomNum: req.body.roomNum,
		playerNum: req.body.playerNum,
		gameId: req.body.gameId
	});
	try {
		await room.save();
		res.send(room);
	} catch (error) {
		console.log(error);
		res.send('Failure to Save Match');
	}
});

router.get('/:idNum', async (req, res) => { // Check your room for new players
	try {
		let room = await Match.findOne({
      _id: req.params.idNum
		});
		if (room.playerNum > 1)
		{
			res.send(room);
		}
		else
		{
			res.send(room);
		}
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.delete('/:idNum', async (req, res) => { // Delete after game found
	try {
    await Match.deleteOne({
      _id: req.params.idNum
	});
    res.send('Match Maker Deleted');
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;