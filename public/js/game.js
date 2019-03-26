var app = new Vue({
  el: '#app',
  data: {
	matchMaker: 
	{
		roomNum: 0,
		playerNum: 1,
	},
	findingMatch: 0,
	matchFound: 0,
	matchMade: 0,
	interval: 0,
	startGame: 0,

	PLAYER_INFO: {color: "w", opponent: 'b'},
	sharedData: {
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
	playerTurn: 1,
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
		if (this.startGame && !this.playerTurn)
		{
			this.checkOpponentTurn();
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
						this.matchMaker = matches[match];
						this.matchFound = 1;
						this.findingMatch = 0;
						this.respondToMatch();
					}
					else
					{
						matchNum += 1;
					}
				}	
			}	
			else
			{
				this.findingMatch = 1;
				this.createMatch(matchNum + 1);
				this.interval = setInterval(checkData, 3000);
			}
		} catch (error) {
			console.log(error);
		}
	},

	async createMatch(matchNum) {
		try {
			let match = await axios.post('/api/queue', {
				roomNum: matchNum,
				playerNum: 1,
				});
			this.matchMaker = match;
		} catch (error) {
			console.log(error);
		}
	},

	async checkMatch() {
		try {
			let response = await axios.get("/api/items/" + this.matchMaker._id);
			this.matchMaker = response.data;
			if (this.matchMaker.playerNum > 1)
			{
				this.matchMade = 1;
				this.findingMatch = 0;
				this.setUpGame();
			}
			return true;
		} catch (error) {
			console.log(error);
		}
	},

	async respondToMatch() {
		try {
			let response = await axios.put("/api/items/" + this.matchMaker._id, {
				playerNum: 2,
			});

			this.matchFound = 1;
			this.PLAYER_INFO.color = 'b';
			this.PLAYER_INFO.opponent = 'w';
			this.startGame = 1;
			return true;
		} catch (error) {
			console.log(error);
		}
	},
// ------------------------------------------------------------------EXPRESS FUNCTIONS------------------------------------------------------------------
	async getBoard() {
		try {
			let response = await axios.get("/api/pieces/" + this.sharedData._id,);
			var temp = response.data;
			this.sharedData = temp;
			return true;
		} catch (error) {
			console.log(error);
		}
	},

	async upload() {
		try {
			let response = await axios.post('/api/pieces', sharedData);
			var temp = response.data;
			if (temp.turnNum > this.displayedTurn)
			{
				this.playerTurn = 0;
			}
		} catch (error) {
			console.log(error);
		}
	},

	async checkOppMove()
	{
		try {
			let response = await axios.get("/api/pieces");
			var temp = response.data;
			if (temp.turnNum > this.displayedTurn)
			{
				this.playerTurn = 1;
				this.getBoard();
			}
		} catch (error) {
			console.log(error);
		}
	},

	async setUpGame()
	{
		try {
			this.sharedData.room.num = this.matchMaker.roomNum;
			let upload = await axios.post('/api/pieces', sharedData);
			this.startGame = 1;
		} catch (error) {
			console.log(error);
		}
	},
// ------------------------------------------------------------------SELECTION FUNCTION------------------------------------------------------------------
	selectPiece(block)
	{
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
				if (this.sharedData.action.selection.row == parseInt(block.charAt(0), 10) && this.sharedData.action.selection.col == parseInt(block.charAt(1), 10))
				{
					this.selectedToggle(block);
				}
				else		// If a unit is selected
				{
					this.sharedData.action.move.row = parseInt(block.charAt(0), 10);
					this.sharedData.action.move.col = parseInt(block.charAt(1), 10);
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
			this.sharedData.action.selection.col = parseInt(block.charAt(1), 10);
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
	this.setupGame();
	this.refreshBoard();
  },
});
