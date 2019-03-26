var app = new Vue({
  el: '#home',
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
  },
  methods: {
		async checkAvailableMatches() {
			try {
				let response = await axios.get("/api/queue");
				var matchNum = 0;
				var matches = response.data;
				if (matches.length > 0)
				{
					for (match in matches)
					{
						if (matches[match].playerNum == 1)
						{
							this.matchMaker = matches[match];
							this.matchFound = 1;
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
					this.createMatch(matchNum + 1);
					this.interval = setInterval(checkMatch, 3000);
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
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		
	},
	created() {

	},
	computed: {
		buttonText()
		{
			if (this.findingMatch == 0)
			{
				return "Find a Match";
			}
			else
			{
				return "Searching";
			}
		},
  },
});
