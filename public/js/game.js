var app = new Vue({
  el: '#app',
  data: {
	PLAYER_INFO: {color: "w", opponent: 'b'},
	PIECE_WORTH: {p: 1, n: 3, b: 3, r: 5, q: 9},
	sharedData: {
		playerNum: 2,
		turnNum: 0,
		scores: {w: 0, b: 0},
		board: [["wr1", "wn1", "wb1", "wq1", "wk",  "wb2", "wn2", "wr2"], 
		["wp1", "wp2", "wp3", "wp4", "wp5", "wp6", "wp7", "wp8"],
		["",    "",    "",    "",    "",    "",    "",    ""   ], 
		["",    "",    "",    "",    "",    "",    "",    ""   ], 
		["",    "",    "",    "",    "",    "",    "",    ""   ], 
		["",    "",    "",    "",    "",    "",    "",    ""   ], 
		["bp1", "bp2", "bp3", "bp4", "bp5", "bp6", "bp7", "bp8"],
		["br1", "bn1", "bb1", "bq1", "bk",  "bb2", "bn2", "br2"]],
		yourTeam: 'w',
	},

	selected: {piece: "", position: ""},
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
				if (this.selected.piece == "")
				{
					if (this.isMyPiece(block)) // If no unit is selected
					{
						this.selectedToggle(block);	
						//this.highlightOptions(block);																					// Set selected to whatever's at that space
						console.log("Selected: " + this.selected.piece + " on " + this.selected.position);								// Also store that place
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
					if (this.selected.piece == this.sharedData.board[(parseInt(block.charAt(0), 10) - 1)][(parseInt(block.charAt(2), 10) - 1)])
					{
						this.selectedToggle(this.selected.position);
						console.log("Unselected " + this.selected.position);
					}
					else		// If a unit is selected
					{
						switch (this.selected.piece.charAt(1))		// Find out what piece
						{
							case 'k':
								this.kingAction(this.selected.position, block);		// Run it's actions with position as parameter and new block
								break;
							case 'q':
								this.queenAction(this.selected.position, block);
								break;
							case 'r':
								this.rookAction(this.selected.position, block);
								break;
							case 'b':
								this.bishopAction(this.selected.position, block);
								break;
							case 'n':
								this.knightAction(this.selected.position, block);
								break;
							case 'p':
								this.pawnAction(this.selected.position, block);
								break;
						}
						this.selectedToggle(this.selected.position);
						this.refreshBoard();
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
				this.selected.piece = "";
				this.selected.position = "";
			}
			else
			{
				element.classList.add("selected");
				this.selected.piece = this.sharedData.board[(parseInt(block.charAt(0), 10) - 1)][(parseInt(block.charAt(2), 10) - 1)]; 	
				this.selected.position = block;	
			}
		},
		killPiece(block)
		{
			this.position[this.PLAYER_INFO.opponent][(this.sharedData.board[parseInt(block.charAt(0), 10) - 1]
			[parseInt(block.charAt(2), 10) - 1]).charAt(1)][(this.sharedData.board[parseInt(block.charAt(0), 10) - 1]
			[parseInt(block.charAt(2), 10) - 1]).charAt(2)] = "##";
		},
// ------------------------------------------------------------------PIECE ACTIONS AND LOGIC------------------------------------------------------------------
		kingAction(position, actionBlock)
		{
			if ((Math.abs(parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10)) <= 1) &&
			(Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10)) <= 1) &&
			 this.isClearPath(position, actionBlock) &&
			 this.isSafe(1, actionBlock))
			{
				if (this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] == "")
				{
					this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
				else if ((this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]).charAt(0) != this.PLAYER_INFO.color)
				{
					console.log("Going for the kill");
					this.sharedData.scores[this.PLAYER_INFO.color] += this.PIECE_WORTH[this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1].charAt(1)];
					this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
			}
		},
		queenAction(position, actionBlock)
		{
			if (((actionBlock.charAt(0) == position.charAt(0) || actionBlock.charAt(2) == position.charAt(2)) || 
			(Math.abs(parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10)) == Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10)))) &&
			 this.isClearPath(position, actionBlock) &&
			 this.isSafe(0, actionBlock))
			{
				if (this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] == "")
				{
					this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
				else if ((this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]).charAt(0) != this.PLAYER_INFO.color)
				{
					console.log("Going for the kill");
					this.sharedData.scores[this.PLAYER_INFO.color] += this.PIECE_WORTH[this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1].charAt(1)];
					this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
			}
		},
		rookAction(position, actionBlock)
		{
			if ((actionBlock.charAt(0) == position.charAt(0) || actionBlock.charAt(2) == position.charAt(2)) &&
			 this.isClearPath(position, actionBlock) &&
			 this.isSafe(0, actionBlock))
			{
				if (this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] == "")
				{
					this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
				else if ((this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]).charAt(0) != this.PLAYER_INFO.color)
				{
					this.sharedData.scores[this.PLAYER_INFO.color] += this.PIECE_WORTH[this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1].charAt(1)];
					this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
			}
		},
		bishopAction(position, actionBlock)
		{
			if ((Math.abs(parseInt(actionBlock.charAt(0)) - parseInt(position.charAt(0), 10)) == Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10))) &&
			 this.isClearPath(position, actionBlock) &&
			 this.isSafe(0, actionBlock))
			{
				if (this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] == "")
				{
					this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
				else if ((this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]).charAt(0) != this.PLAYER_INFO.color)
				{
					this.sharedData.scores[this.PLAYER_INFO.color] += this.PIECE_WORTH[this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1].charAt(1)];
					this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
			}
		},
		knightAction(position, actionBlock)
		{
			if ((((Math.abs(parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10)) == 2) &&
			(Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10)) == 1)) ||
			((Math.abs(parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10)) == 1) &&
			(Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10)) == 2))) &&
			this.isSafe(0, actionBlock))
			{
				
				if (this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] == "")
				{
					this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
				else if ((this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]).charAt(0) != this.PLAYER_INFO.color)
				{
					console.log("Going for the kill");
					this.sharedData.scores[this.PLAYER_INFO.color] += this.PIECE_WORTH[this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1].charAt(1)];
					this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
			}
		},
		pawnAction(position, actionBlock)
		{
			colorDirection = 1;
			if (this.PLAYER_INFO.color == 'b')
			{
				colorDirection = -1;
			}

			if ((parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10) == colorDirection) && 
			(Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10)) == 0) &&
			this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] == "" &&
			this.isSafe(0, actionBlock))
			{
				this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.selected.piece;
				this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
			}
			else if ((parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10) == colorDirection) && 
			(Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10)) == 1) &&
			((this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]) != "") &&
			this.isSafe(0, actionBlock))
			{
				if ((this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]).charAt(0) != this.PLAYER_INFO.color)
				{
					this.sharedData.scores[this.PLAYER_INFO.color] += this.PIECE_WORTH[this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1].charAt(1)];
					if (colorDirection == 1 && parseInt(actionBlock.charAt(0), 10) == 8)
					{
						this.queenNum += 1;
						var newQueen = this.PLAYER_INFO.color + "q" + this.queenNum;
						this.position[this.PLAYER_INFO.color].q.push(actionBlock);
						this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = newQueen;
						this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
					}
					else if (colorDirection == -1 && parseInt(actionBlock.charAt(0), 10) == 1)
					{
						this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
						this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
					}
					else
					{
						this.sharedData.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
						this.sharedData.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
					}
				}
			}
		},

// ------------------------------------------------------------------BOOLIAN HELPER FUNCTION------------------------------------------------------------------
		isClearPath(start, end)
		{
			distanceY = parseInt(end.charAt(0), 10) - parseInt(start.charAt(0), 10);
			distanceX = parseInt(end.charAt(2), 10) - parseInt(start.charAt(2), 10);
			negativeX = 1;
			negativeY = 1;

			if (distanceX < 0)
			{
				negativeX = -1;
			}
			if (distanceY < 0)
			{
				negativeY = -1;
			}
			console.log("Running: " + distanceX + " H and " + distanceY + " V ");
			
			if (distanceX == 0 || distanceY == 0)
			{
				if (distanceX == 0)
				{
					for (var i = 1; i <= Math.abs(distanceY); i++)
					{
						if (i == Math.abs(distanceY) && (this.sharedData.board[parseInt(end.charAt(0), 10) - 1][parseInt(end.charAt(2), 10) - 1]) != "")
						{
							if ((this.sharedData.board[parseInt(end.charAt(0), 10) - 1][parseInt(end.charAt(2), 10) - 1]).charAt(0) != this.PLAYER_INFO.color)
							{
								return true;
							}
						}
						else if (this.sharedData.board[(parseInt(start.charAt(0), 10) + i * negativeY) - 1][(parseInt(start.charAt(2), 10)) - 1] != "")
						{
							return false;
						}
					}
				}
				else if (distanceY == 0)
				{
					for (var i = 1; i <= Math.abs(distanceX); i++)
					{
						if (i == Math.abs(distanceX) && (this.sharedData.board[parseInt(end.charAt(0), 10) - 1][parseInt(end.charAt(2), 10) - 1]) != "")
						{
							if ((this.sharedData.board[parseInt(end.charAt(0), 10) - 1][parseInt(end.charAt(2), 10) - 1]).charAt(0) != this.PLAYER_INFO.color)
							{
								return true;
							}
						}
						else if (this.sharedData.board[(parseInt(start.charAt(0), 10)) - 1][(parseInt(start.charAt(2), 10) + i * negativeX) - 1] != "")
						{
							return false;
						}
					}
				}
				return true;
			}
			else if (Math.abs(distanceX) == Math.abs(distanceY))
			{
				for (var i = 1; i <= Math.abs(distanceX); i++)
				{
					if (i == Math.abs(distanceX) && (this.sharedData.board[parseInt(end.charAt(0), 10) - 1][parseInt(end.charAt(2), 10) - 1]) != "")
					{
						if ((this.sharedData.board[parseInt(end.charAt(0), 10) - 1][parseInt(end.charAt(2), 10) - 1]).charAt(0) != this.PLAYER_INFO.color)
						{
							return true;
						}
					}
					else if (this.sharedData.board[(parseInt(start.charAt(0), 10) + i * negativeY) - 1][(parseInt(start.charAt(2), 10) + i * negativeX) - 1] != "")
					{
						return false;
					}
				}
				return true;	
			}
			else
			{
				console.log("Invalid Path: Cannot check for collisions");
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

		isSafe(isKing, block)
		{
			var kingPosition = {row: (parseInt(block.charAt(0), 10) - 1), col: (parseInt(block.charAt(2), 10) - 1)};
			var enemyPositions = [];
			for (var i = 0; i < 8; i++)
			{
				for (var j = 0; j < 8; j++)
				{
					if (this.sharedData.board[i][j].charAt(0) == this.PLAYER_INFO.opponent)
					{
						enemyPositions.push({piece: this.sharedData.board[i][j].charAt(1), row: i, col: j});
					}
					else if (this.sharedData.board[i][j].substring(0,2) == this.PLAYER_INFO.color + "k" && !isKing)
					{
						kingPosition.row = i;
						kingPosition.col = j;
					}
				}
			}
			var kingBlock = (kingPosition.row + 1).toString() + "-" + (kingPosition.col + 1).toString();
			for (var i = 0; i < enemyPositions.length; i++)
			{
				var enemyBlock = (enemyPositions[i].row + 1).toString() + "-" + (enemyPositions[i].col + 1).toString();
				console.log(enemyBlock);
				if (enemyPositions[i].piece == 'k' && 
				(Math.abs(enemyPositions[i].row - kingPosition.row) <= 1 && 
				Math.abs(enemyPositions[i].col - kingPosition.col) <= 1)
				)
				{
					console.log("King too close to other King!");
					return false;
				}
				else if (enemyPositions[i].piece == 'q' &&
				((enemyPositions[i].row == kingPosition.row || enemyPositions[i].col == kingPosition.col) ||
				(Math.abs(enemyPositions[i].row - kingPosition.row) == Math.abs(enemyPositions[i].col - kingPosition.col))) &&
				this.isClearPath(enemyBlock, kingBlock))
				{
					console.log("King too close to other Queen!");
					return false;
				}
				else if (enemyPositions[i].piece == 'r' &&
				(enemyPositions[i].row == kingPosition.row || enemyPositions[i].col == kingPosition.col) &&
				this.isClearPath(enemyBlock, kingBlock))
				{
					console.log("King too close to rook!");
					return false;
				}
				else if (enemyPositions[i].piece == 'b' &&
				(Math.abs(enemyPositions[i].row - kingPosition.row) == Math.abs(enemyPositions[i].col - kingPosition.col)) &&
				this.isClearPath(enemyBlock, kingBlock))
				{
					console.log("King too close to bishop!");
					return false;
				}
				else if (enemyPositions[i].piece == 'n' &&
				(((Math.abs(enemyPositions[i].row - kingPosition.row) == 1) && (Math.abs(enemyPositions[i].col - kingPosition.col) == 2)) ||
				((Math.abs(enemyPositions[i].row - kingPosition.row) == 2) && (Math.abs(enemyPositions[i].col - kingPosition.col) == 1))))
				{
					console.log("King too close to knight!");
					return false;
				}
				else if (enemyPositions[i].piece == 'p' &&
				((Math.abs(enemyPositions[i].row - kingPosition.row) == 1) && (Math.abs(enemyPositions[i].col - kingPosition.col) == 1)))
				{
					console.log("King too close to pawn!");
					return false;
				}
				console.log("THE KING IS SAFE");
			}
			return true;
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
