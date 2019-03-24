const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// app.use(express.static('public'));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/chess', {
  useNewUrlParser: true
});

app.listen(3000, () => console.log('Server listening on port 3000!'));

const pieceSchema = new mongoose.Schema({
	white: {K: "", Q: ["", "", ""],  R: ["", ""], B: ["", ""], KN: ["", ""], P: ["", "", "", "", "", "", "", ""]},
	black: {K: "", Q: ["", "", ""],  R: ["", ""], B: ["", ""], KN: ["", ""], P: ["", "", "", "", "", "", "", ""]},
	turnNum: 0,
});

const board = mongoose.model('Item', pieceSchema);


app.post('/api/items', async (req, res) => {
	const item = new Item({
		title: req.body.title,
		path: req.body.path,
		description: req.body.description,
	});
	try {
		await item.save();
		res.send(item);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

app.get('/api/items', async (req, res) => {
	try {
		let items = await Item.find();
		res.send(items);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

app.delete('/api/items/:idNum', async (req, res) => {
	try {
    await Item.deleteOne({
      _id: req.params.idNum
		});
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.put('/api/items/:idNum', async (req, res) => {
	try {
		let item = await Item.findOne({
      _id: req.params.idNum
		});
		item.title = req.body.title;
		item.description = req.body.description;
		await item.save();
    res.send(item);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
