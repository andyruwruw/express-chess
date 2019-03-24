var app = new Vue({
  el: '#app',
  data: {
		position: {white: {K: "51", Q: ["41", "##", "##"],  R: ["11", "81"], B: ["31", "61"], KN: ["21", "71"], P: ["12", "22", "32", "42", "52", "62", "72", "82"]},
							 black: {K: "58", Q: ["48", "##", "##"],  R: ["18", "88"], B: ["38", "68"], KN: ["28", "78"], P: ["17", "27", "37", "47", "57", "67", "77", "87"]},
							 turnNum: 0},
		board: [["wr1", "wp1", "", "", "", "", "bp1", "br1"], ["wn1", "wp2", "", "", "", "", "bp2", "bn1"], ["wb1", "wp3", "", "", "", "", "bp3", "bb1"], 
						["wq1", "wp4", "", "", "", "", "bp4", "bq1"], ["wk1", "wp5", "", "", "", "", "bp5", "bk1"], ["wb2", "wp6", "", "", "", "", "bp6", "bb2"], 
						["wn2", "bp7", "", "", "", "", "bp7", "bn2"], ["wr2", "wp8", "", "", "", "", "bp8", "br2"], ],
		selected: {piece: "", position: ""},
		displayedTurn: 0,
		moveMade: 0,
		player: {score: 0, color: ""},
  },
  methods: {
		checkOpponentTurn()
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

		},

		async getBoard() {
			try {
				let response = await axios.get("/api/pieces");
				this.position = response.data;
				return true;
			} catch (error) {
				console.log(error);
			}
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

		selectPiece(block)
		{
			if (this.selected == "") // If no unit is selected
			{
				this.selected.piece = this.board[parseInt(block.charAt(0), 10)][parseInt(block.charAt(2), 10)]; 	// Set selected to whatever's at that space
				this.selected.position = block;																																		// Also store that place
			}
			else		// If a unit is selected
			{
				switch (this.selected.piece)		// Find out what piece
				{
					case 'K':
						this.kingAction(this.selected.position, block);		// Run it's actions with position as parameter and new block
						break;
				}
			}
			
		},

		kingAction(position, actionBlock)
		{

		},
		queenAction(position, actionBlock)
		{
			if (actionBlock.charAt(0) == position.charAt(0) && this.clearPath(position, actionBlock))
			{
				if (this.board[actionBlock.charAt(0)][parseInt(actionBlock.charAt(2), 10)] == "")
				{

				}
			}
			else if (actionBlock.charAt(1) == position.charAt(1))
			{

			}
		},


		rookAction(position, actionBlock)
		{

		},
		bishopAction(position, actionBlock)
		{

		},
		knightAction(position, actionBlock)
		{

		},
		pawnAction(position, actionBlock)
		{

		},




  },
  created() {
		this.startBoard();
		this.sendBoard();
  }
});
