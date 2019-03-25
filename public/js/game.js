var app = new Vue({
  el: '#app',
  data: {
		position: {w: {k: ["1-5"], q: ["1-4", "##", "##"],  r: ["1-1", "1-8"], b: ["1-3", "1-6"], n: ["1-2", "1-7"], p: ["2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "2-7", "2-8"]},
				   b: {k: ["8-5"], q: ["8-4", "##", "##"],  r: ["8-1", "8-8"], b: ["8-3", "8-6"], n: ["8-2", "8-7"], p: ["7-1", "7-2", "7-3", "7-4", "7-5", "7-6", "7-7", "7-8"]},
				   turnNum: 0},
		board: [["wr1", "wn1", "wb1", "wq1", "wk",  "wb2", "wn2", "wr2"], 
				["wp1", "wp2", "wp3", "wp4", "wp5", "wp6", "wp7", "wp8"],
				["",    "",    "",    "",    "",    "",    "",    ""   ], 
				["",    "",    "",    "",    "",    "",    "",    ""   ], 
				["",    "",    "",    "",    "",    "",    "",    ""   ], 
				["",    "",    "",    "",    "",    "",    "",    ""   ], 
				["bp1", "bp2", "bp3", "bp4", "bp5", "bp6", "bp7", "bp8"],
				["br1", "bn1", "bb1", "bq1", "bk",  "bb2", "bn2", "br2"] ],
		selected: {piece: "", position: ""},
		displayedTurn: 0,
		playerTurn: 1,
		moveMade: 0,
		player: {score: 0, color: "w", opponent: 'b'},
		points: {p: 1, n: 3, b: 3, r: 5, q: 9},
  },
  methods: {
// ------------------------------------------------------------------REFRESH GAME FUNCTIONS------------------------------------------------------------------
		async checkOpponentTurn()
		{
			await this.getBoard()
			{
				if (this.position.turnNum > this.displayedTurn)
				{
					refreshBoard();
				}
			}
		},
		refreshBoard()
		{
			console.log("Refreshing Page");
			for (var i = 7; i >= 0 ; i--)												// Runs through each block.
			{
				for (var j = 0; j < 8; j++)
				{
					var element = document.getElementById((i + 1) + "-" + (j + 1)); 	// Gets each block by ID
					if (this.board[i][j] != "")											// If it has a piece, it adds piece class
					{
						element.classList.add(this.board[i][j].substring(0, 2));
					}
					else if (this.board[i][j] == "")									// If it doens't have a piece
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
				this.position = response.data;
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		updateData(position, newPosition)
		{
			//this.highlightOptions(this.selected.position);
			var id = this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
			var color = id.charAt(0);
			var type = id.charAt(1);
			var num = parseInt(id.charAt(2), 10);
			this.position[color][type][num - 1] = newPosition;
		},
		async upload() {
			if (this.moveMade)
			{
				this.moveMade = 0;
				this.position.turnNum += 1;
				try {
					let upload = await axios.post('/api/pieces', position);
				} catch (error) {
					console.log(error);
				}
			}
		},
// ------------------------------------------------------------------SELECTION FUNCTION------------------------------------------------------------------
		selectPiece(block)
		{
			if (this.playerTurn)
			{
				if (this.selected.piece == "")
				{
					if (this.isMyPiece(block)) // If no unit is selected
					{
						this.selectedToggle(block);	
						//this.highlightOptions(block);																					// Set selected to whatever's at that space
						console.log("Selected: " + this.selected.piece + " on " + this.selected.position);								// Also store that place
					}
					else if (this.board[(parseInt(block.charAt(0), 10) - 1)][(parseInt(block.charAt(2), 10) - 1)] == "")
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
					if (this.selected.piece == this.board[(parseInt(block.charAt(0), 10) - 1)][(parseInt(block.charAt(2), 10) - 1)])
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
						console.log("Move: " + this.selected.piece + " to " + block);
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
				this.selected.piece = this.board[(parseInt(block.charAt(0), 10) - 1)][(parseInt(block.charAt(2), 10) - 1)]; 	
				this.selected.position = block;	
			}
		},

// ------------------------------------------------------------------PIECE ACTIONS AND LOGIC------------------------------------------------------------------
		kingAction(position, actionBlock)
		{
			if ((Math.abs(parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10)) <= 1) &&
			(Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10)) <= 1) &&
			 this.isClearPath(position, actionBlock) &&
			 this.isSafe(actionBlock))
			{
				if (this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] == "")
				{
					this.updateData(position, actionBlock);
					this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
				else if ((this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]).charAt(0) != this.player.color)
				{
					console.log("Going for the kill");
					this.updateData(position, actionBlock);
					this.player.score += this.points[this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1].charAt(1)];
					this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
			}
		},
		queenAction(position, actionBlock)
		{
			if (((actionBlock.charAt(0) == position.charAt(0) || actionBlock.charAt(2) == position.charAt(2)) || 
			(Math.abs(parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10)) == Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10)))) &&
			 this.isClearPath(position, actionBlock) &&
			 this.isSafe(this.position[this.player.color].k[0]))
			{
				if (this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] == "")
				{
					this.updateData(position, actionBlock);
					this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
				else if ((this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]).charAt(0) != this.player.color)
				{
					this.updateData(position, actionBlock);
					console.log("Going for the kill");
					this.player.score += this.points[this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1].charAt(1)];
					this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
			}
		},
		rookAction(position, actionBlock)
		{
			if ((actionBlock.charAt(0) == position.charAt(0) || actionBlock.charAt(2) == position.charAt(2)) &&
			 this.isClearPath(position, actionBlock) &&
			 this.isSafe(this.position[this.player.color].k[0]))
			{
				if (this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] == "")
				{
					this.updateData(position, actionBlock);
					this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
				else if ((this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]).charAt(0) != this.player.color)
				{
					this.updateData(position, actionBlock);
					this.player.score += this.points[this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1].charAt(1)];
					this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
			}
		},
		bishopAction(position, actionBlock)
		{
			if ((Math.abs(parseInt(actionBlock.charAt(0)) - parseInt(position.charAt(0), 10)) == Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10))) &&
			 this.isClearPath(position, actionBlock) &&
			 this.isSafe(this.position[this.player.color].k[0]))
			{
				if (this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] == "")
				{
					this.updateData(position, actionBlock);
					this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
				else if ((this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]).charAt(0) != this.player.color)
				{
					this.updateData(position, actionBlock);
					this.player.score += this.points[this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1].charAt(1)];
					this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
			}
		},
		knightAction(position, actionBlock)
		{
			if ((((Math.abs(parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10)) == 2) &&
			(Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10)) == 1)) ||
			((Math.abs(parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10)) == 1) &&
			(Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10)) == 2))) &&
			this.isSafe(this.position[this.player.color].k[0]))
			{
				
				if (this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] == "")
				{
					this.updateData(position, actionBlock);
					this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
				else if ((this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]).charAt(0) != this.player.color)
				{
					console.log("Going for the kill");
					this.updateData(position, actionBlock);
					this.player.score += this.points[this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1].charAt(1)];
					this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
				}
			}
		},
		pawnAction(position, actionBlock)
		{
			console.log("Attempting to move pawn. " + parseInt(actionBlock.charAt(0), 10) + " " + parseInt(position.charAt(0), 10));
			colorDirection = 1;
			if (this.player.color == 'b')
			{
				colorDirection = -1;
			}

			if ((parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10) == colorDirection) && 
			(Math.abs(parseInt(actionBlock.charAt(2), 10) - parseInt(position.charAt(2), 10)) == 0) &&
			this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] == "" &&
			this.isSafe(this.position[this.player.color].k[0]))
			{
				this.updateData(position, actionBlock);
				this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.selected.piece;
				this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
			}
			else if ((parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10) == colorDirection) && 
			(Math.abs(parseInt(actionBlock.charAt(0), 10) - parseInt(position.charAt(0), 10)) == 1) &&
			((this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]) != "") &&
			this.isSafe(this.position[this.player.color].k[0]))
			{
				if ((this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1]).charAt(0) != this.player.color)
				{
					this.updateData(position, actionBlock);
					this.player.score += this.points[this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1].charAt(1)];
					this.board[parseInt(actionBlock.charAt(0), 10) - 1][parseInt(actionBlock.charAt(2), 10) - 1] = this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1];
					this.board[parseInt(position.charAt(0), 10) - 1][parseInt(position.charAt(2), 10) - 1] = "";
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
						if (i == Math.abs(distanceY) && (this.board[parseInt(end.charAt(0), 10) - 1][parseInt(end.charAt(2), 10) - 1]) != "")
						{
							if ((this.board[parseInt(end.charAt(0), 10) - 1][parseInt(end.charAt(2), 10) - 1]).charAt(0) != this.player.color)
							{
								return true;
							}
						}
						else if (this.board[(parseInt(start.charAt(0), 10) + i * negativeY) - 1][(parseInt(start.charAt(2), 10)) - 1] != "")
						{
							return false;
						}
					}
				}
				else if (distanceY == 0)
				{
					for (var i = 1; i <= Math.abs(distanceX); i++)
					{
						if (i == Math.abs(distanceX) && (this.board[parseInt(end.charAt(0), 10) - 1][parseInt(end.charAt(2), 10) - 1]) != "")
						{
							if ((this.board[parseInt(end.charAt(0), 10) - 1][parseInt(end.charAt(2), 10) - 1]).charAt(0) != this.player.color)
							{
								return true;
							}
						}
						else if (this.board[(parseInt(start.charAt(0), 10)) - 1][(parseInt(start.charAt(2), 10) + i * negativeX) - 1] != "")
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
					if (i == Math.abs(distanceX) && (this.board[parseInt(end.charAt(0), 10) - 1][parseInt(end.charAt(2), 10) - 1]) != "")
					{
						if ((this.board[parseInt(end.charAt(0), 10) - 1][parseInt(end.charAt(2), 10) - 1]).charAt(0) != this.player.color)
						{
							return true;
						}
					}
					else if (this.board[(parseInt(start.charAt(0), 10) + i * negativeY) - 1][(parseInt(start.charAt(2), 10) + i * negativeX) - 1] != "")
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
			if (((this.board[(parseInt(block.charAt(0), 10) - 1)][(parseInt(block.charAt(2), 10) - 1)]).charAt(0)) == this.player.color)
			{
				return true;
			}
			return false;
		},
		isSafe(block)
		{
			//position: {w: {k: ["1-5"], q: ["1-4", "##", "##"],  r: ["1-1", "1-8"], b: ["1-3", "1-6"], n: ["1-2", "1-7"], p: ["2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "2-7", "2-8"]},
			//			b: {k: ["8-5"], q: ["8-4", "##", "##"],  r: ["8-1", "8-8"], b: ["8-3", "8-6"], n: ["8-2", "8-7"], p: ["7-1", "7-2", "7-3", "7-4", "7-5", "7-6", "7-7", "7-8"]},
			//			turnNum: 0},
			if (Math.abs(parseInt(this.position[this.player.opponent].k[0].charAt(0), 10) - parseInt(block.charAt(0), 10)) <= 1 &&
			Math.abs(parseInt(this.position[this.player.opponent].k[0].charAt(2), 10) - parseInt(block.charAt(2), 10)) <= 1)
			{
				return false;
			}

			for (piece in this.position[this.player.opponent].q)
			{
				if (this.position[this.player.opponent].q[piece].charAt(0) == '#')
				{
					continue;
				}
				else if (((this.position[this.player.opponent].q[piece].charAt(0) == block.charAt(0) || this.position[this.player.opponent].q[piece].charAt(2) == block.charAt(2)) || 
				(Math.abs(parseInt(this.position[this.player.opponent].q[piece].charAt(0), 10) - parseInt(block.charAt(0), 10)) == 
				Math.abs(parseInt(this.position[this.player.opponent].q[piece].charAt(2), 10) - parseInt(block.charAt(2), 10)))) &&
				 this.isClearPath(this.position[this.player.opponent].q[piece], block))
				{
					return false;
				}
			}
			for (piece in this.position[this.player.opponent].r)
			{
				if (this.position[this.player.opponent].r[piece].charAt(0) == '#')
				{
					continue;
				}
			}
			for (piece in this.position[this.player.opponent].b)
			{
				if (this.position[this.player.opponent].b[piece].charAt(0) == '#')
				{
					continue;
				}
			}
			for (piece in this.position[this.player.opponent].n)
			{
				if (this.position[this.player.opponent].n[piece].charAt(0) == '#')
				{
					continue;
				}
			}
			for (piece in this.position[this.player.opponent].p)
			{
				colorDirection = 1;
				if (this.player.color == 'b')
				{
					colorDirection = -1;
				}
				if (this.position[this.player.opponent].p[piece].charAt(0) == '#')
				{
					continue;
				}
				else if (parseInt(this.position[this.player.opponent].p[piece].charAt(0), 10) - parseInt(block.charAt(0), 10) == colorDirection &&
				Math.abs(parseInt(this.position[this.player.opponent].p[piece].charAt(2), 10) - parseInt(block.charAt(2), 10)) == 1)
				{
					return false;
				}
			}
			return true;
		},
		highlightOptions(block)
		{
			switch ((this.board[(parseInt(block.charAt(2), 10) - 1)][(parseInt(block.charAt(2), 10) - 1)]).charAt(1))
			{
				case "k":
					for (var i = -1; i < 2; i++)
					{
						for (var j = -1; j < 2; j++)
						{
							if ((this.board[(parseInt(block.charAt(2), 10) - 1 + i)][(parseInt(block.charAt(2), 10) - 1 + j)]) == (this.player.color + "k"))
							{
								continue;
							}
							else if ((this.board[(parseInt(block.charAt(2), 10) - 1 + i)][(parseInt(block.charAt(2), 10) - 1 + j)]) == "")
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
							else if ((this.board[(parseInt(block.charAt(2), 10) - 1 + i)][(parseInt(block.charAt(2), 10) - 1 + j)]).charAt(0) != this.player.color)
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
		}
  },
  created() {
	this.refreshBoard();
  }
});
