
var app = new Vue({
  el: '#app',
  data: {
	SOUNDS: { 
		select: {sound: "select", volume: .7},
		unselect: {sound: "unselect", volume: .7},
		error: {sound: "error", volume: .7},
		check: {sound: "check", volume: .7},
		checkmate: {sound: "checkmate", volume: .7},
		move: {sound: "move", volume: .7},
		matchfound: {sound: "matchfound", volume: .7},
		turn: {sound: "turn", volume: .7}},
	matchMaker: {
		_id: "",
		roomNum: 0,
		playerNum: 1,
		gameId: "",},
	sharedData: {
		_id: "",
		room: {num: 1, turnNum: 0, currTeam: 'w', scores: {w: 0, b: 0}},
		board: [
		["wr1", "wn1", "wb1", "wq1", "wk",  "wb2", "wn2", "wr2"], 
		["wp1", "wp2", "wp3", "wp4", "wp5", "wp6", "wp7", "wp8"],
		["",    "",    "",    "",    "",    "",    "",    ""   ], 
		["",    "",    "",    "",    "",    "",    "",    ""   ], 
		["",    "",    "",    "",    "",    "",    "",    ""   ], 
		["",    "",    "",    "",    "",    "",    "",    ""   ], 
		["bp1", "bp2", "bp3", "bp4", "bp5", "bp6", "bp7", "bp8"],
		["br1", "bn1", "bb1", "bq1", "bk",  "bb2", "bn2", "br2"]],
		action: {selection: {row: -1, col: -1}, move: {row: -1, col: -1}},
	},
	findingMatch: 0,
	matchFound: 0,
	matchMade: 0,
	interval: 0,
	intervalspeed: 1000,
	startGame: 0,
	gameSharedId: "",
	selectImage: "wt",
	PLAYER_INFO: {color: "w", opponent: 'b'},

	displayedTurn: 0,
	playerTurn: 0,
	moveMade: 0,
	queenNum: 1,
	messages: [{text: "This is a sample message sent.", usr: "Black", time: "12:13:14 PM"}, {text: "Whats up my dude", usr: "White", time: "12:13:14 PM"}],
	messageText: "",

  },
  methods: {
// ------------------------------------------------------------------REFRESH GAME FUNCTIONS------------------------------------------------------------------
	async checkData() 									// Interval Checks Depending on Variables
	{
		this.sharedData._id = this.gameSharedId;
		if (this.findingMatch && !this.matchFound && !this.matchMade) this.checkMatch();
		if (this.startGame)
		{
			
			if (!this.playerTurn) 
			{
				this.checkOppMove();
				if (!this.playerTurn) this.getSelection();
			}
			this.getChat();
			this.refreshBoard();
		}
	},
	refreshBoard()
	{
		for (var i = 0; i < 8 ; i++)												// Runs through each block.
		{
			for (var j = 0; j < 8; j++)
			{
				var element = document.getElementById((i + 1) + "-" + (j + 1)); 	// Gets each block by ID
				if (this.sharedData.board[i][j] != "")											// If it has a piece, it adds piece class
				{
					if (element.classList.contains("empty")) element.classList.remove("empty");
					if (!element.classList.contains(this.sharedData.board[i][j].substring(0, 2))) 
						element.classList.add(this.sharedData.board[i][j].substring(0, 2));
					let colors = ["w", "b"];
					let pieces = ["q", "k", "n", "b", "r", "p"];
					for (var k = 0; k < colors.length; k++)							// It runs through removing any piece classes.
					{
						for (var l = 0; l < pieces.length; l++)
						{
							if ((colors[k] + pieces[l]) == this.sharedData.board[i][j].substring(0, 2)) continue;
							if (element.classList.contains(colors[k] + pieces[l])) element.classList.remove(colors[k] + pieces[l]);
						}
					}
				}
				else if (this.sharedData.board[i][j] == "")									// If it doens't have a piece
				{
					let colors = ["w", "b"];
					let pieces = ["q", "k", "n", "b", "r", "p"];
					for (var k = 0; k < colors.length; k++)							// It runs through removing any piece classes.
					{
						for (var l = 0; l < pieces.length; l++)
						{
							if (element.classList.contains(colors[k] + pieces[l])) element.classList.remove(colors[k] + pieces[l]);
						}
					}
					element.classList.add("empty");									// And adds empty background class.
				}
			}
		}
	},
// ------------------------------------------------------------------GAME SERVER FUNCTIONS------------------------------------------------------------------
	async getBoard() {
		try {
			console.log("Recieving Data From Server...");
			let response = await axios.get("/api/match/" + this.gameSharedId);
				this.sharedData.room.turnNum = response.data.room.turnNum;
				this.sharedData.room.scores.w = response.data.room.scores.w;
				this.sharedData.room.scores.b = response.data.room.scores.b;
				this.sharedData.action.selection.row = response.data.action.selection.row;
				this.sharedData.action.selection.col = response.data.action.selection.col;
				this.sharedData.action.move.row = response.data.action.move.row;
				this.sharedData.action.move.col = response.data.action.move.col;
				this.sharedData.board[0] = response.data.board[0];
				this.sharedData.board[1] = response.data.board[1];
				this.sharedData.board[2] = response.data.board[2];
				this.sharedData.board[3] = response.data.board[3];
				this.sharedData.board[4] = response.data.board[4];
				this.sharedData.board[5] = response.data.board[5];
				this.sharedData.board[6] = response.data.board[6];
				this.sharedData.board[7] = response.data.board[7];
			return true;
		} catch (error) {
			console.log(error);
		}
	},
	async upload() {
		try {
			console.log("Sending Move to Server...");
			var block = (this.sharedData.action.selection.row).toString() + "-" + (this.sharedData.action.selection.col).toString();
			var element = document.getElementById(block);
			if (element.classList.contains("selected")) element.classList.remove("selected");
			let response = await axios.put("/api/match/" + this.gameSharedId, this.sharedData);
			if (response.data.nModified == 1)
			{
				console.log("Move Approved by Server.");
				this.playSound(this.SOUNDS.move.sound, this.SOUNDS.move.volume);
				console.log("Awaiting Opponent's Move.");
				this.selectImage = this.PLAYER_INFO.opponent + "t";
				this.updateSelection();
				this.drawSelection();
				this.playerTurn = 0;
				this.displayedTurn += 1;
				this.getBoard();
			}
			else
			{
				console.log("Move Declined by Server.");
				console.log("Submit a Valid Move.");
				this.playSound(this.SOUNDS.error.sound, this.SOUNDS.error.volume);
				this.selectImage = this.PLAYER_INFO.color + "t";
				this.updateSelection();
				this.drawSelection();
				this.playerTurn = 1;
				this.sharedData.action.selection.row = -1;
				this.sharedData.action.selection.col = -1;
				this.sharedData.action.move.row = -1;
				this.sharedData.action.move.col = -1;
			}
			
		} catch (error) {
			console.log(error);
		}
	},
	async checkOppMove()
	{
		try {
			let response = await axios.get("/api/match/" + this.gameSharedId);
			if (response.data.room.turnNum > this.displayedTurn)
			{
				console.log("Opponent's Move Approved by Server.");
				console.log("Submit a Valid Move.");
				this.playSound(this.SOUNDS.move.sound, this.SOUNDS.move.volume);
				this.playerTurn = 1;
				this.displayedTurn = response.data.room.turnNum;
				this.getBoard();
				this.refreshBoard();
			}
		} catch (error) {
			console.log(error);
		}
	},
// ------------------------------------------------------------------SELECTION FUNCTION------------------------------------------------------------------
	async selectPiece(block)
	{
		if (this.playerTurn)
		{
			if (this.sharedData.action.selection.row == -1 && this.sharedData.action.selection.col == -1)
			{
				if (this.isMyPiece(block)) // If no unit is selected
				{
					console.log("Selecting:" + block);
					this.playSound(this.SOUNDS.select.sound, this.SOUNDS.select.volume);
					this.selectedToggle(block);	
					//this.highlightOptions(block);																					// Set selected to whatever's at that space							// Also store that place
				}
				else if (this.sharedData.board[(parseInt(block.charAt(0), 10) - 1)][(parseInt(block.charAt(2), 10) - 1)] == "")
					return 0;
				else if (!this.isMyPiece(block))
				{
					this.playSound(this.SOUNDS.error.sound, this.SOUNDS.error.volume);
					console.log("You cannot select your opponent's pieces.");
				}
			}
			else
			{
				if (this.sharedData.action.selection.row == parseInt(block.charAt(0), 10) && this.sharedData.action.selection.col == parseInt(block.charAt(2), 10))
				{
					console.log("Unselected - " + block);
					this.playSound(this.SOUNDS.unselect.sound, this.SOUNDS.unselect.volume);
					this.selectedToggle(block);
				}
				else		// If a unit is selected
				{
					this.sharedData.action.move.row = parseInt(block.charAt(0), 10);
					this.sharedData.action.move.col = parseInt(block.charAt(2), 10);
					this.upload();
				}
			}	
		}
	},
	async selectedToggle(block)
	{
		var element = document.getElementById(block);
		if (this.sharedData.action.selection.row == -1 &&
			this.sharedData.action.selection.col == -1)
		{
			this.selectImage = this.sharedData.board[parseInt(block.charAt(0), 10) - 1][parseInt(block.charAt(2), 10) - 1].substring(0,2);
			this.drawSelection();
			this.sharedData.action.selection.row = parseInt(block.charAt(0), 10);
			this.sharedData.action.selection.col = parseInt(block.charAt(2), 10);
			if (!(element.classList.contains("selected"))) element.classList.add("selected");	
		}
		else
		{
			this.selectImage = this.PLAYER_INFO.color + "t";
			this.drawSelection();
			this.sharedData.action.selection.row = -1;
			this.sharedData.action.selection.col = -1;
			if (element.classList.contains("selected")) element.classList.remove("selected");
		}	
		this.updateSelection();
	},
	async getSelection()
	{
		try {
			let response = await axios.get("/api/selected/" + this.gameSharedId);
			if (this.selectImage != response.data.selected)
			{
				this.selectImage = response.data.selected;
				this.playSound(this.SOUNDS.select.sound, this.SOUNDS.select.volume);
				this.drawSelection();
			}	
		} catch (error) {
			console.log(error);
		}
	},
	async createSelection()
	{
		try {
			let match = await axios.post('/api/selected', {
				_id: this.gameSharedId,
				turn: this.displayedTurn,
				selected: this.PLAYER_INFO.color + "t",
			});
		} catch (error) {
			console.log(error);
		}
	},
	async updateSelection()
	{
		try {
			await axios.put("/api/selected/" + this.gameSharedId, {
				selected: this.selectImage
			});
		} catch (error) {
			console.log(error);
		}

	},
	async deleteSelection()
	{
		try {
			await axios.delete("/api/selected/" + this.gameSharedId);
		} catch (error) {
			console.log(error);
		}
	},
	drawSelection()
	{
		var selectedDiv = document.getElementById("selected");
		let colors = ["w", "b"];
		let pieces = ["q", "k", "n", "b", "r", "p", "t"];
		for (var k = 0; k < colors.length; k++)							// It runs through removing any piece classes.
		{
			for (var l = 0; l < pieces.length; l++)
			{
				if (selectedDiv.classList.contains(colors[k] + pieces[l])) 
				selectedDiv.classList.remove(colors[k] + pieces[l]);
			}
		}
		selectedDiv.classList.add(this.selectImage);
	},
	isMyPiece(block)
	{
		if (((this.sharedData.board[(parseInt(block.charAt(0), 10) - 1)][(parseInt(block.charAt(2), 10) - 1)]).charAt(0)) == this.PLAYER_INFO.color)
			return true;
		return false;
	},
	highlightOptions(block)
	{
		switch ((this.sharedData.board[(parseInt(block.charAt(2), 10) - 1)][(parseInt(block.charAt(2), 10) - 1)]).charAt(1))
		{
			case "k":
				for (var i = -1; i < 2; i++)
				{
					for (var j = -1; j < 2; j++)
					{
						if ((this.sharedData.board[(parseInt(block.charAt(2), 10) - 1 + i)][(parseInt(block.charAt(2), 10) - 1 + j)]) == (this.PLAYER_INFO.color + "k"))
							continue;
						else if ((this.sharedData.board[(parseInt(block.charAt(2), 10) - 1 + i)][(parseInt(block.charAt(2), 10) - 1 + j)]) == "")
						{
							var id = (parseInt(block.charAt(2), 10) + i).toString() + "-" + (parseInt(block.charAt(2), 10) + j).toString();
							var element = document.getElementById(id);
							if (element.classList.contains("possible")) element.classList.remove("possible");
							else element.classList.add("possible");
						}
						else if ((this.sharedData.board[(parseInt(block.charAt(2), 10) - 1 + i)][(parseInt(block.charAt(2), 10) - 1 + j)]).charAt(0) != this.PLAYER_INFO.color)
						{
							var id = (parseInt(block.charAt(2), 10) + i).toString() + "-" + (parseInt(block.charAt(2), 10) + j).toString();
							var element = document.getElementById(id);
							if (element.classList.contains("possiblekill")) element.classList.remove("possiblekill");
							else element.classList.add("possiblekill");
						}
					}
				}
				break;
			case "q":
				break;
			case "r":
				break;
			case "n":
				break;
			case "b":
				break;
			case "p":
				break;
		}
	},
	// ------------------------------------------------------------------MATCHMAKING FUNCTIONS------------------------------------------------------------------
	async checkAvailableMatches() {
		try {
			let response = await axios.get("/api/queue");
			var matches = response.data;
			var matchNum = 0;
			if (matches.length > 0)
			{
				for (match in matches)
				{
					if (matches[match].playerNum == 1)
					{
						this.matchMaker._id = matches[match]._id;
						this.matchMaker.roomNum = matches[match].roomNum;
						this.matchMaker.playerNum = matches[match].playerNum;
						this.matchMaker.gameId = matches[match].gameId;
						this.gameSharedId = matches[match].gameId;
						this.matchFound = 1;
						this.findingMatch = 0;
						this.playSound(this.SOUNDS.matchfound.sound, this.SOUNDS.matchfound.volume);
						this.respondToMatch();
						this.interval = setInterval(this.checkData, this.intervalspeed);
					}
					else matchNum += 1;
				}
				if (!this.matchFound)
				{
					this.findingMatch = 1;
					this.createMatch(matchNum + 1);
					this.interval = setInterval(this.checkData, this.intervalspeed);
				}
			}	
			else
			{
				this.findingMatch = 1;
				this.createMatch(matchNum + 1);
				this.interval = setInterval(this.checkData, this.intervalspeed);
			}
		} catch (error) {
			console.log(error);
		}
	},
	async createMatch(matchNum) {
		try {
			this.gameSharedId = this.makeid(10);
			this.sharedData._id = this.gameSharedId;
			let match = await axios.post('/api/queue', {
				_id: this.gameSharedId,
				roomNum: 0,
				playerNum: 1,
				gameId: this.gameSharedId
				});
			this.matchMaker._id = match.data._id;
			this.matchMaker.roomNum = match.data.roomNum;
			this.matchMaker.playerNum = match.data.playerNum;
			this.sharedData.roomNum = match.data.roomNum;
		} catch (error) {
			console.log(error);
		}
	},
	async checkMatch() {
		try {
			let match = await axios.get("/api/queue/" + this.gameSharedId);
			this.matchMaker.playerNum = match.data.playerNum;
			if (this.matchMaker.playerNum > 1)
			{
				this.playSound(this.SOUNDS.matchfound.sound, this.SOUNDS.matchfound.volume);
				this.setUpGame();
				this.matchMade = 1;
				this.findingMatch = 0;
				try
				{
					await axios.delete("/api/queue/" + this.matchMaker._id);
				} catch (error) {
				  console.log(error);
				}
			}
			return true;
		} catch (error) {
			console.log(error);
		}
	},
	async respondToMatch() {
		try {
			this.matchFound = 1;
			this.PLAYER_INFO.color = 'b';
			this.PLAYER_INFO.opponent = 'w';
			this.startGame = 1;
			let response = await axios.put("/api/queue/" + this.matchMaker._id, {
				playerNum: 2
			});
			this.drawSelection();
			return true;
		} catch (error) {
			console.log(error);
		}
	},
	async setUpGame()
	{
		try {
			this.sharedData.room.num = this.matchMaker.roomNum;
			this.sharedData._id = this.gameSharedId;
			let upload = await axios.post('/api/match', this.sharedData);
			this.createSelection();
			this.createChat();
			this.startGame = 1;
			this.playerTurn = 1;
		} catch (error) {
			console.log(error);
		}
	},
	makeid(length) 
	{
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (var i = 0; i < length; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	},
	// ------------------------------------------------------------------CHAT FUNCTIONS------------------------------------------------------------------
	async getChat()
	{
		let chat = await axios.get("/api/chat/" + this.gameSharedId);
		console.log(chat);
		this.messages = chat.data.chats;
	},
	async sendMesage()
	{
		try {
			var time = Date.now();
			var timeString = time.toLocaleTimeString();
			var color = "White";
			this.messages.push({text: this.messageText, time: timeString, usr: color});
			if (this.PLAYER_INFO.color == "b") color = "Black";
			let response = await axios.put("/api/chat/" + this.matchMaker._id, {
				message: {text: this.messageText, time: timeString, usr: color}
			});
			this.messageText = "";
			return true;
		} catch (error) {
			console.log(error);
		}
	},
	async createChat()
	{
		try {
			let chat = await axios.post('/api/chat', {
				_id: this.gameSharedId,
				chats: []
				});
		} catch (error) {
			console.log(error);
		}
	},
	// ------------------------------------------------------------------CHAT FUNCTIONS------------------------------------------------------------------
	playSound(sound, volume)
	{
		if (!this.isGameOver || sound == this.SOUNDS.checkmate.sound)
		{
			var media = document.getElementById(sound);
			media.volume = volume;
			const playPromise = media.play();
			if (playPromise !== null) {
				playPromise.catch(() => {media.play();})
			}
		}
	}
  },
  created() {
  },
  computed:
  {
	buttonText()
	{
		if (this.findingMatch == 0) return "FIND A MATCH";
		else if (this.matchFound || this.matchMade) return "Opponent Found";
		else return "SEARCHING";
	},
	playerTurnCalc()
	{
		if (this.playerTurn) return "Your Move";
		else if (this.PLAYER_INFO.color == "w") return "Black's Move";
		else return "White's Move";
	},
	winningCalc()
	{
		const STRINGS = ["Dominating", "Winning", "Smarter", "Better", "Superior", "Destroying"];
		var returnString = STRINGS[Math.floor(Math.random() * 100 % STRINGS.length)];
		if (this.sharedData.room.scores.w > this.sharedData.room.scores.b) return "White is " + returnString + "!";
		if (this.sharedData.room.scores.w == this.sharedData.room.scores.b) return "No One's Ahead."
		if (this.sharedData.room.scores.w < this.sharedData.room.scores.b) return "Black is " + returnString + "!";
	},
	messageCharLim()
	{
		if (this.messageText.length > 40) this.messageText = this.messageText.substring(0,40);
	}
  }
});

function playMusic()
{
	var media = document.getElementById("music");
	media.volume = .2;
	const playPromise = media.play();
	if (playPromise !== null){
		playPromise.catch(() => { media.play(); })
	}
}
