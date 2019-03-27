var app = new Vue({
  el: '#app',
  data: {
	matchMaker: 
	{
		_id: "",
		roomNum: 0,
		playerNum: 1,
		gameId: "",
	},
	findingMatch: 0,
	matchFound: 0,
	matchMade: 0,
	interval: 0,
	startGame: 0,
	gameSharedId: "",

	PLAYER_INFO: {color: "w", opponent: 'b'},
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
	displayedTurn: 0,
	playerTurn: 0,
	moveMade: 0,
	queenNum: 1,
  },
  methods: {
// ------------------------------------------------------------------REFRESH GAME FUNCTIONS------------------------------------------------------------------
	async checkData() 									// Interval Checks Depending on Variables
	{
		
		if (this.findingMatch && !this.matchFound && !this.matchMade)
		{
			this.checkMatch();
		}
		if (this.startGame)
		{
			if (!this.playerTurn)
			{
				console.log("Checking in with Server");
				this.checkOpponentTurn();
			}
			console.log("Refreshing Page");
			this.refreshBoard();
		}
	},

	async checkOpponentTurn()
	{
		await this.getBoard()
		{
			if (this.sharedData.turnNum > this.displayedTurn)
			{
				refreshBoard();
				this.displayedTurn = this.sharedData.turnNum;
			}
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
					if (element.classList.contains("empty"))
					{
						element.classList.remove("empty");
					}
					element.classList.add(this.sharedData.board[i][j].substring(0, 2));
				}
				else if (this.sharedData.board[i][j] == "")									// If it doens't have a piece
				{
					let colors = ["w", "b"];
					let pieces = ["q", "k", "n", "b", "r", "p"];
					for (var k = 0; k < colors.length; k++)							// It runs through removing any piece classes.
					{
						for (var l = 0; l < pieces.length; l++)
						{
							if (element.classList.contains(colors[k] + pieces[l]))
							{
								element.classList.remove(colors[k] + pieces[l]);
							}
						}
					}
					element.classList.add("empty");									// And adds empty background class.
				}
			}
		}
	},
// ------------------------------------------------------------------EXPRESS FUNCTIONS------------------------------------------------------------------
	
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
						this.respondToMatch();
						this.interval = setInterval(this.checkData, 3000);
					}
					else
					{
						matchNum += 1;
					}
				}
				if (!this.matchFound)
				{
					this.findingMatch = 1;
					this.createMatch(matchNum + 1);
					this.interval = setInterval(this.checkData, 3000);
				}
			}	
			else
			{
				this.findingMatch = 1;
				this.createMatch(matchNum + 1);
				this.interval = setInterval(this.checkData, 3000);
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
				this.setUpGame();
				this.matchMade = 1;
				this.findingMatch = 0;
				try
				{
					let response = await axios.delete("/api/queue/" + this.matchMaker._id);
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
			return true;
		} catch (error) {
			console.log(error);
		}
	},
// ------------------------------------------------------------------EXPRESS FUNCTIONS------------------------------------------------------------------
	async getBoard() {
		try {
			let response = await axios.get("/api/match/" + this.gameSharedId);
			console.log("NEW BOARD");
			console.log(response);
				this.sharedData.room.turnNum = response.data.room.turnNum;
				this.sharedData.room.scores.w = response.data.room.scores.w;
				this.sharedData.room.scores.b = response.data.room.scores.b;
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
			var block = (this.sharedData.action.selection.row).toString() + "-" + (this.sharedData.action.selection.col).toString();
			var element = document.getElementById(block);
			if (element.classList.contains("selected"))
			{
				element.classList.remove("selected");
			}
			let response = await axios.put("/api/match/" + this.gameSharedId, this.sharedData);
			console.log(response.data);
			if (response.data.nModified == 1)
			{
				this.getBoard();
			}
			
			/*
			console.log(this.displayedTurn);
			if (response.data.room.turnNum > this.displayedTurn)
			{
				console.log("Valid Move");
				this.playerTurn = 0;
				this.sharedData.room.turnNum = response.data.room.turnNum;
				this.sharedData.room.scores.w = response.data.room.scores.w;
				this.sharedData.room.scores.b = response.data.room.scores.b;
				this.sharedData.board[0] = response.data.board[0];
				this.sharedData.board[1] = response.data.board[1];
				this.sharedData.board[2] = response.data.board[2];
				this.sharedData.board[3] = response.data.board[3];
				this.sharedData.board[4] = response.data.board[4];
				this.sharedData.board[5] = response.data.board[5];
				this.sharedData.board[6] = response.data.board[6];
				this.sharedData.board[7] = response.data.board[7];
				this.displayedTurn = response.data.room.turnNum;
			this.refreshBoard();
				this.refreshBoard();
			}
			*/
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
				console.log("Move Made");
				this.playerTurn = 1;
				this.getBoard();
				this.refreshBoard();
			}
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
// ------------------------------------------------------------------SELECTION FUNCTION------------------------------------------------------------------
	selectPiece(block)
	{
		console.log(block);
		if (this.playerTurn)
		{
			if (this.sharedData.action.selection.row == -1 && this.sharedData.action.selection.col == -1)
			{
				if (this.isMyPiece(block)) // If no unit is selected
				{
					this.selectedToggle(block);	
					//this.highlightOptions(block);																					// Set selected to whatever's at that space							// Also store that place
				}
				else if (this.sharedData.board[(parseInt(block.charAt(0), 10) - 1)][(parseInt(block.charAt(2), 10) - 1)] == "")
				{
					return 0;
				}
				else if (!this.isMyPiece(block))
				{
					console.log("You cannot select your opponent's pieces.");
				}
			}
			else
			{
				if (this.sharedData.action.selection.row == parseInt(block.charAt(0), 10) && this.sharedData.action.selection.col == parseInt(block.charAt(2), 10))
				{
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

	selectedToggle(block)
	{
		var element = document.getElementById(block);
		if (element.classList.contains("selected"))
		{
			element.classList.remove("selected");
			this.sharedData.action.selection.row = -1;
			this.sharedData.action.selection.col = -1;
		}
		else
		{
			element.classList.add("selected");
			this.sharedData.action.selection.row = parseInt(block.charAt(0), 10);
			this.sharedData.action.selection.col = parseInt(block.charAt(2), 10);
		}
	},

	isMyPiece(block)
	{
		if (((this.sharedData.board[(parseInt(block.charAt(0), 10) - 1)][(parseInt(block.charAt(2), 10) - 1)]).charAt(0)) == this.PLAYER_INFO.color)
		{
			return true;
		}
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
						{
							continue;
						}
						else if ((this.sharedData.board[(parseInt(block.charAt(2), 10) - 1 + i)][(parseInt(block.charAt(2), 10) - 1 + j)]) == "")
						{
							var id = (parseInt(block.charAt(2), 10) + i).toString() + "-" + (parseInt(block.charAt(2), 10) + j).toString();
							var element = document.getElementById(id);
							if (element.classList.contains("possible"))
							{
								element.classList.remove("possible");
							}
							else
							{
								element.classList.add("possible");
							}
						}
						else if ((this.sharedData.board[(parseInt(block.charAt(2), 10) - 1 + i)][(parseInt(block.charAt(2), 10) - 1 + j)]).charAt(0) != this.PLAYER_INFO.color)
						{
							var id = (parseInt(block.charAt(2), 10) + i).toString() + "-" + (parseInt(block.charAt(2), 10) + j).toString();
							var element = document.getElementById(id);
							if (element.classList.contains("possiblekill"))
							{
								element.classList.remove("possiblekill");
							}
							else
							{
								element.classList.add("possiblekill");
							}
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
  },
  created() {
  },
  computed:
  {
	buttonText()
	{
		if (this.findingMatch == 0)
		{
			return "Find a Match";
		}
		else if (this.matchFound || this.matchMade)
		{
			return "Opponent Found";
		}
		else
		{
			return "Searching";
		}
	},
  }
});
