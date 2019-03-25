var app = new Vue({
  el: '#app',
  data: {
	PLAYER_INFO: {color: "w", opponent: 'b'},
	sharedData: {
		room: {num: 2, turnNum: 0, currTeam: 'w', scores: {w: 0, b: 0}},
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
	async checkOpponentTurn()
	{
		await this.getBoard()
		{
			if (this.sharedData.turnNum > this.displayedTurn)
			{
				refreshBoard();
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
	async getBoard() {
		try {
			let response = await axios.get("/api/pieces");
			this.sharedData = response.data;
			this.moveMade = 1;
			this.displayedTurn = sharedData.turnNum;
			return true;
		} catch (error) {
			console.log(error);
		}
	},
	async upload() {
		if (this.moveMade)
		{
			this.moveMade = 0;
			this.sharedData.turnNum += 1;
			this.displayedTurn += 1;
			try {
				let upload = await axios.post('/api/pieces', sharedData);
			} catch (error) {
				console.log(error);
			}
		}
	},
	async checkOppMove()
	{
		if (!this.moveMade)
		{
			var temp;
			try {
				let response = await axios.get("/api/pieces");
				temp = response.data;
				if (temp.turnNum > displayedTurn)
				{
					this.getBoard();
				}
			} catch (error) {
				console.log(error);
			}
		}
	},
	async setUpGame()
	{
		try {
			let response = await axios.get("/api/pieces");
			temp = response.data;
			if (temp.playerNum == 2)
			{
				this.PLAYER_INFO.color = temp.yourTeam;
				if (this.PLAYER_INFO.color == "w")
				{
					this.moveMade = 1;
					this.PLAYER_INFO.opponent = "b";
				}
				else
				{
					this.moveMade = 0;
					this.PLAYER_INFO.opponent = "w";
				}
			}
			else
			{
				if (temp.playerNum == 0)
				{
					temp.playerNum == 1;
				}
				try {
					let upload = await axios.post('/api/pieces', temp);
				} catch (error) {
					console.log(error);
				}
			}
		} catch (error) {
			console.log(error);
		}
		setInterval(checkOppMove, 50);
	},
// ------------------------------------------------------------------SELECTION FUNCTION------------------------------------------------------------------
	selectPiece(block)
	{
		if (this.moveMade)
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
