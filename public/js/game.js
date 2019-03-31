var app = new Vue({
    el: '#app',
    data:
    {
        matchMaker: {
            _id: "",
            roomNum: 0,
            playerNum: 1,
            gameId: "",
        },
        matchData:
        {
            matchFound: 0,
            matchMade: 0,
            startGame: 0,
            findingMatch: 0,
        },
        testData:
        {
            whitePositions: [],
            blackPostions: [],
        },
        gameData:
        {
            gameStart: false,
            playerTurn: false,
            displayedTurn: 0,
            team: 0,
            opp: 1,
            whiteScore: 0,
            blackScore: 0,
            whiteCheck: false,
            blackCheck: false,
            whiteWin: false,
            blackWin: false,
            stalemate: false,
            deadArray: [],
        },
        selectData:
        {
            selected: {row: -1, col: -1},
            move: {row: -1, col: -1},
            selectImage: "",
            oppSelected: {row: -1, col: -1},
            oppMoved:  {row: -1, col: -1},
            blue: "",
            red: "",
            unselected: {row: -1, col: -1},
            oppSelectionDif: "",
        },
        serverData:
        {
            gameID: "",
            serverMessageText: "",
            opponentAFK: 10,
            intervalspeed: 1000,
            interval: 0,
        },
        chatData:
        {
            messages: [],
            messageText: "",
            messageBool: false,
        },
        pieceData:
        {
            whitePieces: {k1: new King(0, 4, 1, 0),   q1: new Queen(0, 3, 1, 0),  r1: new Rook(0, 0, 1, 0),   r2: new Rook(0, 7, 2, 0), 
                          b1: new Bishop(0, 2, 1, 0), b2: new Bishop(0, 5, 2, 0), n1: new Knight(0, 1, 1, 0), n2: new Knight(0, 6, 2, 0), 
                          p1: new Pawn(1, 0, 1, 0),   p2: new Pawn(1, 1, 2, 0),   p3: new Pawn(1, 2, 3, 0),   p4: new Pawn(1, 3, 4, 0), 
                          p5: new Pawn(1, 4, 5, 0),   p6: new Pawn(1, 5, 6, 0),   p7: new Pawn(1, 6, 7, 0),   p8: new Pawn(1, 7, 8, 0)},
            blackPieces: {k1: new King(7, 4, 1, 0),   q1: new Queen(7, 3, 1, 0),  r1: new Rook(7, 0, 1, 0),   r2: new Rook(7, 7, 2, 0), 
                          b1: new Bishop(7, 2, 1, 0), b2: new Bishop(7, 5, 2, 0), n1: new Knight(7, 1, 1, 0), n2: new Knight(7, 6, 2, 0), 
                          p1: new Pawn(6, 0, 1, 0),   p2: new Pawn(6, 1, 2, 0),   p3: new Pawn(6, 2, 3, 0),   p4: new Pawn(6, 3, 4, 0), 
                          p5: new Pawn(6, 4, 5, 0),   p6: new Pawn(6, 5, 6, 0),   p7: new Pawn(6, 6, 7, 0),   p8: new Pawn(6, 7, 8, 1)},
        },
        SOUNDS: { 
            select: {sound: "select", volume: .7},
            unselect: {sound: "unselect", volume: .7},
            error: {sound: "error", volume: .7},
            check: {sound: "check", volume: .7},
            checkmate: {sound: "checkmate", volume: .7},
            move: {sound: "move", volume: .7},
            matchfound: {sound: "matchfound", volume: .2},
            turn: {sound: "turn", volume: .7}},
    },
    methods:
    {
        //=====================================================ORDER=====================================================
        intervalMethod(){                                                                   // Runs every second, differs depending on turn.
            if (this.gameData.gameStart){
                if (this.gameData.playerTurn) this.awaitingPlayer();
                else this.awaitingOpponent();
                this.continuousTasks();}
            else if (this.matchData.findingMatch)
            {
                this.checkMatchMaker();
            }
        },

        awaitingPlayer()                                                                    // Actions taken while player turn is valid.
        {
            this.serverData.serverMessageText = ("Submit a Valid Move.");
        },

        awaitingOpponent()                                                                  // Actions taken while opponent turn is active.
        {
            this.serverData.serverMessageText = ("Awaiting Opponent...");
            this.getOppSelection();
            this.drawSelection();
            this.checkGameData();
        },

        continuousTasks()                                                                   // Actions taken regardless of who's turn it is.
        {
            this.getChatRoom();
            if (this.chatData.messageText.length > 75) this.messageText = this.messageText.substring(0,75);
        },
        //=====================================================SELECTION=====================================================
        clickBlock(blockString)                                                             // Runs following a click on the screen.
        {
            console.log(blockString);
            console.log(this.gameData.playerTurn);
            if (this.gameData.playerTurn)                                                       // If it's the player's turn
            {
                this.unselectRedBlockDiv();
                var clickBlock = this.parseBlock(blockString);
                console.log(this.selectData.selected);
                if (this.isEqual(this.selectData.selected, this.selectData.unselected))       // If nothing is selected
                {
                    console.log("New Selection");
                    if (this.isEmpty(clickBlock)) return 0;                                             // Or if it's empty, do nothing.
                    else if (this.isMyPiece(clickBlock)) this.selectBlock(clickBlock, blockString);     // If it's your piece, select it.
                    else this.throwError("You cannot select your opponent's pieces.");                  // Or if it's your opponent's piece, throw error
                }
                else                                                                                // If a piece is already selected.
                {
                    if (this.isMyPiece(clickBlock))                                                     // If next selection is your piece as well, unselect all.
                        this.unselectBlock(clickBlock, blockString);
                    else                                                                                // Or if next selection is not your piece, check if you can move there.
                    {
                        this.setData(this.selectData.move, clickBlock);
                        this.sendGameData();
                    }
                }
            }
            else this.throwError("Wait for your turn to select a piece!");                           // Or if it's not your turn, throw error.
        },
        /* HELPER */ 
        selectBlock(selectBlock, blockString)                                               // Player selects a block.
        {
            console.log("Selecting Block");
            this.serverData.serverMessageText = "Piece Selected.";                            // Notifies player.
            this.playSound(this.SOUNDS.select.sound, this.SOUNDS.select.volume);

            this.setData(this.selectData.selected, selectBlock);
            console.log(this.selectData.selected);

            this.selectData.selectImage = this.findBlockImage(selectBlock);                     // Adds the photo to the selected section up top.
            this.postOppSelection();                    
            this.drawSelection();

            if (this.selectData.blue != "") this.unselectBlueBlockDiv();                        // If something is already lit up as selected, undo it.
            this.selectBlueBlockDiv(blockString)                                                 // Color the selected block blue.

        },
        unselectBlock()                                                                     // Unselect a block.
        {
            this.serverData.serverMessageText = ("Piece Unselected.");                          // Notifies Player.
            this.playSound(this.SOUNDS.unselect.sound, this.SOUNDS.unselect.volume);

            this.setData(this.selectData.selected, this.selectData.unselected);

            this.selectData.selectImage = this.teamColor() + "t";
            this.postOppSelection();
            this.drawSelection();

            if (this.selectData.blue != "") this.unselectBlueBlockDiv();                        // If something is blue, uncolor it.
        },
        selectBlueBlockDiv(blockID)                                                           // Find the correct block and color it blue.
        {
            var element = document.getElementById(blockID);
            if (!element.classList.contains("selected"))
            element.classList.add("selected");
            this.selectData.blue = blockID;
        },
        unselectBlueBlockDiv()                                                              // Find the selected block and uncolor it.
        {
            var element = document.getElementById(this.selectData.blue);
            if (element.classList.contains("selected"))
            element.classList.remove("selected");
            this.selectData.blue = "";
        },
        /* HELPER */ 
        drawSelection(){                                                                    // Draw character into selection section up top.
            var selectedDiv = document.getElementById("selected");
            let colors = ["w", "b"];
            let pieces = ["q", "k", "n", "b", "r", "p", "t"];
            for (var k = 0; k < colors.length; k++){						                    // It runs through removing any piece classes.
                for (var l = 0; l < pieces.length; l++){
                    if (selectedDiv.classList.contains(colors[k] + pieces[l])) 
                    selectedDiv.classList.remove(colors[k] + pieces[l]);}}
            if (this.selectData.selectImage == "") selectedDiv.classList.add("wt");
            else selectedDiv.classList.add(this.selectData.selectImage);},                           // Then addds the correct Image.
        refreshChangedBlocks(changedSlots)
        {
            for (var i = 0; i < changedSlots.length; i++)
            {
                var element = document.getElementById(this.blockToString(changedSlots[i]));
                var changedColor;
                var id;
                if ((this.gameData.playerTurn && this.gameData.team) || (!this.gameData.playerTurn && !this.gameData.team)){
                id = findKeyOffPosition(changedSlots[slot], pieceData.whitePieces);
                changedColor = "w";}
                else{
                id = findKeyOffPosition(changedSlots[slot], pieceData.blackPieces);
                changedColor = "b";}
                let colors = ["w", "b"];
                let pieces = ["q", "k", "n", "b", "r", "p"];
                for (var k = 0; k < colors.length; k++){						                    // It runs through removing any piece classes.
                    for (var l = 0; l < pieces.length; l++){
                        if (element.classList.contains(colors[k] + pieces[l])) 
                        element.classList.remove(colors[k] + pieces[l]);}}
                if (id != "")
                element.classList.add(changedColor + id);    
            }
        },
        updateDead()
        {
            var wDead = document.getElementById("wDead");
            var bDead = document.getElementById("bDead");
            var wDeadString = "";
            var bDeadString = "";
            var whiteDead = {p: 0, b: 0, n: 0, r: 0, q: 0};
            var blackDead = {p: 0, b: 0, n: 0, r: 0, q: 0};

            for (var i = 0; i < this.gameData.deadArray.length; i++)
            {
                if (this.gameData.deadArray[i].charAt(0) == "w") whiteDead[this.gameData.deadArray[i].charAt(1)] += 1;
                if (this.gameData.deadArray[i].charAt(0) == "b") blackDead[this.gameData.deadArray[i].charAt(1)] += 1;
            }

            if (whiteDead.p > 0)
            {
                var element = document.getElementById("dead-wp");
                if (element.classList.contains("off")) element.classList.remove("off");
                if (whiteDead.p > 1) element.innerText = whiteDead.p;
            }
            if (whiteDead.b > 0)
            {
                var element = document.getElementById("dead-wb");
                if (element.classList.contains("off")) element.classList.remove("off");
                if (whiteDead.b > 1) element.innerText = whiteDead.b;
            }
            if (whiteDead.n > 0)
            {
                var element = document.getElementById("dead-wn");
                if (element.classList.contains("off")) element.classList.remove("off");
                if (whiteDead.n > 1) element.innerText = whiteDead.n;
            }
            if (whiteDead.r > 0)
            {
                var element = document.getElementById("dead-wr");
                if (element.classList.contains("off")) element.classList.remove("off");
                if (whiteDead.r > 1) element.innerText = whiteDead.r;
            }
            if (whiteDead.q > 0)
            {
                var element = document.getElementById("dead-wq");
                if (element.classList.contains("off")) element.classList.remove("off");
                if (whiteDead.q > 1) element.innerText = whiteDead.q;
            }
            if (blackDead.p > 0)
            {
                var element = document.getElementById("dead-bp");
                if (element.classList.contains("off")) element.classList.remove("off");
                if (blackDead.p > 1) element.innerText = blackDead.p;
            }
            if (blackDead.b > 0)
            {
                var element = document.getElementById("dead-bb");
                if (element.classList.contains("off")) element.classList.remove("off");
                if (blackDead.b > 1) element.innerText = blackDead.b;
            }
            if (blackDead.n > 0)
            {
                var element = document.getElementById("dead-bn");
                if (element.classList.contains("off")) element.classList.remove("off");
                if (blackDead.n > 1) element.innerText = blackDead.n;
            }
            if (blackDead.r > 0)
            {
                var element = document.getElementById("dead-br");
                if (element.classList.contains("off")) element.classList.remove("off");
                if (blackDead.r > 1) element.innerText = blackDead.r;
            }
            if (blackDead.q > 0)
            {
                var element = document.getElementById("dead-bq");
                if (element.classList.contains("off")) element.classList.remove("off");
                if (blackDead.q > 1) element.innerText = blackDead.q;
            }
        },
        //=====================================================GAME CONNECTION=====================================================
        async getGameData()
        {
            try {
                let response = await axios.get("/api/match/" + this.serverData.gameID);
                    this.gameData.displayedTurn = response.data.serverTurn;
                    this.gameData.whiteScore = response.data.whiteScore;
                    this.gameData.blackScore = response.data.blackScore;
                    this.gameDate.whiteCheck = response.data.whiteCheck;
                    this.gameData.blackCheck = response.data.blackCheck;
                    this.gameData.blackWin = response.data.whiteCheckMate;
                    this.gameData.whiteWin = response.data.blackCheckMate;
                    this.gameData.stalemate = response.data.stalemate;
                    this.gameData.deadArray = response.data.deadArray;
                    this.setData(this.pieceData.whitePieces, this.convertObject(response.data.pieceData.whitePieces));
                    this.setData(this.pieceData.blackPieces, this.convertObject(response.data.pieceData.blackPieces));
                    var changedSlots = response.data.changedSlots;
                    this.refreshChangedBlocks(changedSlots);
                    this.updateDead();
                return true;
            } catch (error) {
                console.log(error);
            }
        },
        async sendGameData()                                                                    // Following a move, sends data to server.
        {
            try {
                this.serverData.serverMessageText = "Sending Move to Server...";                               // Notifies player of the pending action...
                console.log("Sending Move to Server...");
                let request = { 
                    team: this.gameData.team,
                    pieceData: this.pieceData,
                    serverTurn: this.gameData.displayedTurn,
                    action: {selected: this.selectData.selected, move: this.selectData.move},
                    deadArray: this.gameData.deadArray,
                };
                let response = await axios.put("/api/match/" + this.serverData.gameID, request);
                if (response.data.nModified == 1)                                                   // If server approves move.
                {
                    this.serverData.serverMessageText = ("Move Approved by Server.");                              // Notifies player of request resolution.
                    console.log("Move Approved by Server.");
                    this.playSound(this.SOUNDS.move.sound, this.SOUNDS.move.volume);
                    this.gameData.playerTurn = false;
                    this.getGameData();                                                                    // Retrieves new data.
                }
                else                                                                                // If server declines move.
                {
                    this.serverData.serverMessageText = ("Move Declined by Server. Submit a Valid Move.");         // Notifies player of request failure.
                    this.playSound(this.SOUNDS.error.sound, this.SOUNDS.error.volume);
                }
            } catch (error) {
                console.log(error);
            }
        },
        async checkGameData()
        {
            try {
                let response = await axios.get("/api/match/" + this.serverData.gameID);
                if (response.data.serverTurn > this.gameData.displayedTurn)
                {
                    this.serverData.serverMessageText = ("Opponent Moved. Your Turn!");
                    this.gameData.playerTurn = true;
                    this.playSound(this.SOUNDS.move.sound, this.SOUNDS.move.volume);
                    this.getGameData();
                }
            } catch (error) {
                console.log(error);
            }
        },
        async createGameData()
        {
            this.setAllPossible();
            try {
                let match = {
                    _id: this.serverData.gameID,
                    serverTurn: this.gameData.displayedTurn,
                    whiteScore: 0,
                    blackScore: 0,
                    whiteCheck: false,
                    blackCheck: false,
                    whiteCheckMate: false,
                    blackCheckMate: false,
                    stalemate: false,
                    pieceData: {
                        whitePieces: {k1: this.pieceData.whitePieces.k1, q1: this.pieceData.whitePieces.q1, r1: this.pieceData.whitePieces.r1, r2: this.pieceData.whitePieces.r2, 
                                      b1: this.pieceData.whitePieces.b1, b2: this.pieceData.whitePieces.b2, n1: this.pieceData.whitePieces.n1, n2: this.pieceData.whitePieces.n2, 
                                      p1: this.pieceData.whitePieces.p1, p2: this.pieceData.whitePieces.p2, p3: this.pieceData.whitePieces.p3, p4: this.pieceData.whitePieces.p4, 
                                      p5: this.pieceData.whitePieces.p5, p6: this.pieceData.whitePieces.p6, p7: this.pieceData.whitePieces.p7, p8: this.pieceData.whitePieces.p8},
                        blackPieces: {k1: this.pieceData.blackPieces.k1, q1: this.pieceData.blackPieces.q1, r1: this.pieceData.blackPieces.r1, r2: this.pieceData.blackPieces.r2, 
                                      b1: this.pieceData.blackPieces.b1, b2: this.pieceData.blackPieces.b2, n1: this.pieceData.blackPieces.n1, n2: this.pieceData.blackPieces.n2, 
                                      p1: this.pieceData.blackPieces.p1, p2: this.pieceData.blackPieces.p2, p3: this.pieceData.blackPieces.p3, p4: this.pieceData.blackPieces.p4, 
                                      p5: this.pieceData.blackPieces.p5, p6: this.pieceData.blackPieces.p6, p7: this.pieceData.blackPieces.p7, p8: this.pieceData.blackPieces.p8},
                    },
                    changedSlots: [],
                    deadArray: [],
                };
                let upload = await axios.post('/api/match', match);
                this.serverData.serverMessageText = ("You're white! It's you're turn first.");
                this.createOppSelection();
                this.createChatRoom();
                this.matchData.startGame = true;
                this.gameData.gameStart = true;
                this.gameData.playerTurn = true;
                console.log(this.pieceData.whitePieces.k1);
            } catch (error) {
                console.log(error);
            }
        },

        //=====================================================DATA MANAGEMENT=====================================================
        getTeamPositions()
        {
            if (!this.gameData.team){
                this.findWhitePositions(); return this.testData.whitePositions;}
            this.findBlackPositions();
            return this.testData.blackPostions;
        },
        getOppPositions()
        {
            if (!this.gameData.team){
                this.findBlackPositions(); return this.testData.blackPostions;}
            this.findWhitePositions();
            return this.testData.whitePositions;
        },
        setAllPossible()
        {
            this.findWhitePositions();
            this.findBlackPositions();
            var keys = Object.keys(this.pieceData.blackPieces);
            for (key in keys){
                this.pieceData.whitePieces[keys[key]].findPossibleMoves(this.testData.blackPostions, this.testData.whitePositions)}
            keys = Object.keys(this.pieceData.whitePieces);
            for (key in keys){
                this.pieceData.whitePieces[keys[key]].findPossibleMoves(this.testData.blackPostions, this.testData.whitePositions)}
        },
        /* HELPER */ 
        findWhitePositions(){
            this.testData.whitePositions = [];
            var pieces = Object.values(this.pieceData.whitePieces);
            for (piece in pieces){
                if (!((pieces[piece]).getStatus())) continue;
                    var testObject = ((pieces[piece]).getPositionObject());
                    this.testData.whitePositions.push(testObject);}},
        /* HELPER */ 
        findBlackPositions(){
            this.testData.blackPostions = [];
            var pieces = Object.values(this.pieceData.blackPieces);
            for (piece in pieces){
                if (!((pieces[piece]).getStatus())) continue;
                else {var testObject = pieces[piece].getPositionObject();
                    this.testData.blackPostions.push(testObject);}}},
        /* HELPER */ 
        findPositionInArray(desired, array){
            for (item in array){
                if (this.isEqual(desired, array[item]))
                    return true;}
            return false;},
        /* HELPER */ 
        isMyPiece(testBlock) {
            if (this.teamColor() == "w") return this.findPositionInArray(testBlock, this.testData.whitePositions);
            else return this.findPositionInArray(testBlock, this.testData.blackPostions); },
        isEmpty(testBlock) {
            if (this.findPositionInArray(testBlock, this.testData.whitePositions) || findPositionInArray(testBlock, this.testData.blackPostions))
            return false;
            return true;},
        /* HELPER */ 
        parseBlock(string){
            var block = {row: parseInt(string.charAt(0), 10), col: parseInt(string.charAt(2), 10)};
            return block;},
        /* HELPER */ 
        blockToString(block){
            return block.row + "-" + block.col;
        },
        findBlockImage(findBlock) {
            var images = ["wp", "bp", "wq", "bq", "wr", "br", "wb", "bb", "wn", "bn", "wk", "bk"];
            var blockID = this.blockToString(findBlock);
            var element = document.getElementById(blockID);
            for (item in images) {
                if (element.classList.contains(images[item])) return images[item];}
            if (this.gameData.playerTurn) return this.teamColor() + "t";
            else return this.oppColor() + "t";},

        //=====================================================CHECKING AFK=====================================================
        afkCheck()
        {
            this.checkAFKCheck();
            this.changeAFKCheck();
        },
        async createAFKCheck()
        {

        },
        async checkAFKCheck()
        {

        },
        async changeAFKCheck()
        {

        },
        //=====================================================MATCH MAKING=====================================================

        async respondToMatch() {
            try {
                this.matchData.matchFound = 1;
                this.gameData.team = 1;
                this.gameData.opp = 0;
                this.matchData.startGame = true;
                this.gameData.gameStart = true;
                let response = await axios.put("/api/queue/" + this.matchMaker._id, {
                    playerNum: 2
                });
                return true;
            } catch (error) {
                console.log(error);
            }
        },
        async getMatchMakers()
        {
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
                            this.serverData.gameID = matches[match].gameId;
                            this.matchData.findingMatch = 0;
                            this.playSound(this.SOUNDS.matchfound.sound, this.SOUNDS.matchfound.volume);
                            this.respondToMatch();
                            this.serverData.interval = setInterval(this.intervalMethod, this.serverData.intervalspeed);
                        }
                        else matchNum += 1;
                    }
                    if (!this.matchData.matchFound)
                    {
                        this.matchData.findingMatch = 1;
                        this.postMatchMaker(matchNum + 1);
                        this.serverData.interval = setInterval(this.intervalMethod, this.serverData.intervalspeed);
                    }
                }	
                else
                {
                    this.matchData.findingMatch = 1;
                    this.postMatchMaker(matchNum + 1);
                    this.serverData.interval = setInterval(this.intervalMethod, this.serverData.intervalspeed);
                }
            } catch (error) {
                console.log(error);
            }
        },
        async postMatchMaker()
        {
            try {
                this.serverData.gameID = this.MAKEID();
                let match = await axios.post('/api/queue', {
                    _id: this.serverData.gameID,
                    roomNum: 0,
                    playerNum: 1,
                    gameId: this.serverData.gameID
                    });
                this.matchMaker._id = match.data._id;
                this.matchMaker.playerNum = match.data.playerNum;
            } catch (error) {
                console.log(error);
            }
        },
        async checkMatchMaker()
        {
            try {
                let match = await axios.get("/api/queue/" + this.serverData.gameID);
                this.matchMaker.playerNum = match.data.playerNum;
                if (this.matchMaker.playerNum > 1)
                {
                    this.playSound(this.SOUNDS.matchfound.sound, this.SOUNDS.matchfound.volume);
                    this.createGameData();
                    this.matchData.matchMade = 1;
                    this.matchData.findingMatch = 0;
                    this.matchData.startGame = true;
                    this.deleteMatchMaker();
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
        async deleteMatchMaker()
        {

        },
        /* HELPER */ 
        MAKEID() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            for (var i = 0; i < 10; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;},

        //=====================================================CHAT ROOM=====================================================
        async createChatRoom()
        {
            try {
                let chat = await axios.post('/api/chat', {
                    _id: this.serverData.gameID,
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async getChatRoom()
        {
            let chat = await axios.get("/api/chat/" + this.serverData.gameID);
            this.chatData.messages = chat.data.chats;
            if (this.chatData.messages.length > 0)
            {
                this.chatData.messageBool = true;
            }
        },
        async messageChatRoom()
        {
            try {
                var time = new Date();
                var hours = time.getHours();
                var dayTime = " AM";
                if (hours > 12) 
                {
                    hours = hours - 12;
                    dayTime = " PM";
                }
                var extraZero = "";
                if (time.getMinutes() < 10) extraZero = "0"
                var timeString = hours + ":" + extraZero + time.getMinutes() + dayTime;
                var color = "White";
                if (this.teamColor()  == "b") color = "Black";
                let response = await axios.put("/api/chat/" + this.serverData.gameID, {
                    message: {text: this.chatData.messageText, time: timeString, usr: color}
                });
                this.chatData.messageText = "";
                this.getChatRoom();
                return true;
            } catch (error) {
                console.log(error);
            }
        },
        //=====================================================OPP SELECTION=====================================================
        async createOppSelection()
        {
            try {
                let match = await axios.post('/api/selected', {
                    _id: this.serverData.gameID,
                    turn: this.displayedTurn,
                    selected: this.teamColor() + "t",
                    pos: {row: -1, col: -1}
                });
            } catch (error) {
                console.log(error);
            }
        },
        async postOppSelection()
        {
            try {
                await axios.put("/api/selected/" + this.serverData.gameID, {
                    selected: this.selectData.selectImage,
                    pos: this.selectData.selected
                });
            } catch (error) {
                console.log(error);
            }
        },
        async getOppSelection()
        {
            try {
                let response = await axios.get("/api/selected/" + this.serverData.gameID);
                console.log(response);
                if (this.selectData.oppSelectionDif != response.data.selected)
                {
                    this.serverData.serverMessageText = ("Opponent is thinking!");
                    this.selectData.oppSelectionDif = response.data.selected;
                    if (this.selectData.oppSelectionDif != "")
                    {
                        this.oppSelectBlock(response.data.pos, response.data.selected);
                    }
                }	
            } catch (error) {
                console.log(error);
            }
        },
        oppSelectBlock(selectBlock, blockString)
        {
            this.serverData.serverMessageText = ("Opponent Piece Selected.");
            this.playSound(this.SOUNDS.select.sound, this.SOUNDS.select.volume);
            
            this.setData(this.selectData.oppSelected, selectBlock);

            this.selectData.selectImage = blockString;
            this.drawSelection();

            if (this.selectData.red != "") this.unselectRedBlockDiv();
            if (this.isEqual(selectBlock, this.selectImage.unselected))
            {
                this.unselectRedBlockDiv();
            }
            else
            {
                this.selectRedBlockDiv(this.blockToString(selectBlock));
            }
        },
        selectRedBlockDiv(block)
        {
            var element = document.getElementById(block);
            if (!element.classList.contains("oppselected"))
            element.classList.add("oppselected");
            this.selectData.red = block;
        },
        unselectRedBlockDiv()
        {
            if (this.selectData.red != "")
            {
                var element = document.getElementById(this.selectData.red);
                if (element.classList.contains("oppselected"))
                element.classList.remove("oppselected");
                this.selectData.red = "";
            }
        },
        //=====================================================MISC=====================================================
        /* HELPER */ 
        playSound(sound, volume){
            if (!this.isGameOver || sound == this.SOUNDS.checkmate.sound){
                var media = document.getElementById(sound);
                media.volume = volume;
                const playPromise = media.play();
                if (playPromise !== null) playPromise.catch(() => {media.play();})}},
        /* HELPER */ 
        throwError(message){
            this.serverData.serverMessageText = message;
            this.playSound(this.SOUNDS.error.sound, this.SOUNDS.error.volume);},
        isEqual(a, b){
            var aProps = Object.keys(a);
            var bProps = Object.keys(b);
            if (aProps.length != bProps.length) return false;
            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i];
                if (a[propName] !== b[propName]) return false;}
            return true;
        },
        setData(a, b){
            var aProps = Object.getOwnPropertyNames(a);
            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i];
                a[propName] = b[propName]}
        },
        isInBoard(a){
            if (a.row < 0 || a.row > 7 && a.col < 0 && a.col > 7) return false;
            return true;
        },
        teamColor(){
            if (this.gameData.team) return "b";
            return "w";
        },
        oppColor(){
            if (this.gameData.team) return "w";
            return "b";
        },
        findKeyOffPosition(position, teamPieces)
        {
            var array = Object.entries(teamPieces);
            for (i = 0; i < array.length; i++)
            {
                if (isEqual(position, array[i][1].getPositionObject())){
                    return array[i][0];
                }
            }
            return "";
        },
        gameOver()
        {
            this.gameData.playerTurn = false;
        },
        convertObject(piecesData)
        {
            var piecesArray = Object.values(piecesData);
            var newData = new Object();
            newData.k1 = new King(piecesArray[0].row, piecesArray[0].col, piecesArray[0].num, piecesArray[0].team);
            newData.k1.setData(piecesArray[0].possibleMoves, piecesArray[0].blockBlocks, piecesArray[0].isDead);
            newData.q1 = new Queen(piecesArray[1].row, piecesArray[1].col, piecesArray[1].num, piecesArray[1].team);
            newData.q1.setData(piecesArray[1].possibleMoves, piecesArray[1].blockBlocks, piecesArray[1].isDead);
            newData.r1 = new Rook(piecesArray[2].row, piecesArray[2].col, piecesArray[2].num, piecesArray[2].team);
            newData.r1.setData(piecesArray[2].possibleMoves, piecesArray[2].blockBlocks, piecesArray[2].isDead);
            newData.r2 = new Rook(piecesArray[3].row, piecesArray[3].col, piecesArray[3].num, piecesArray[3].team);
            newData.r2.setData(piecesArray[3].possibleMoves, piecesArray[3].blockBlocks, piecesArray[3].isDead);
            newData.b1 = new Bishop(piecesArray[4].row, piecesArray[4].col, piecesArray[4].num, piecesArray[4].team);
            newData.b1.setData(piecesArray[4].possibleMoves, piecesArray[4].blockBlocks, piecesArray[4].isDead);
            newData.b2 = new Bishop(piecesArray[5].row, piecesArray[5].col, piecesArray[5].num, piecesArray[5].team);
            newData.b2.setData(piecesArray[5].possibleMoves, piecesArray[5].blockBlocks, piecesArray[5].isDead);
            newData.n1 = new Knight(piecesArray[6].row, piecesArray[6].col, piecesArray[6].num, piecesArray[6].team);
            newData.n1.setData(piecesArray[6].possibleMoves, piecesArray[6].blockBlocks, piecesArray[6].isDead);
            newData.n2 = new Knight(piecesArray[7].row, piecesArray[7].col, piecesArray[7].num, piecesArray[7].team);
            newData.n2.setData(piecesArray[7].possibleMoves, piecesArray[7].blockBlocks, piecesArray[7].isDead);
            newData.p1 = new Pawn(piecesArray[8].row, piecesArray[8].col, piecesArray[8].num, piecesArray[8].team);
            newData.p1.setData(piecesArray[8].possibleMoves, piecesArray[8].blockBlocks, piecesArray[8].isDead);
            newData.p2 = new Pawn(piecesArray[9].row, piecesArray[9].col, piecesArray[9].num, piecesArray[9].team);
            newData.p2.setData(piecesArray[9].possibleMoves, piecesArray[9].blockBlocks, piecesArray[9].isDead);
            newData.p3 = new Pawn(piecesArray[10].row, piecesArray[10].col, piecesArray[10].num, piecesArray[10].team);
            newData.p3.setData(piecesArray[10].possibleMoves, piecesArray[10].blockBlocks, piecesArray[10].isDead);
            newData.p4 = new Pawn(piecesArray[11].row, piecesArray[11].col, piecesArray[11].num, piecesArray[11].team);
            newData.p4.setData(piecesArray[11].possibleMoves, piecesArray[11].blockBlocks, piecesArray[11].isDead);
            newData.p5 = new Pawn(piecesArray[12].row, piecesArray[12].col, piecesArray[12].num, piecesArray[12].team);
            newData.p5.setData(piecesArray[12].possibleMoves, piecesArray[12].blockBlocks, piecesArray[12].isDead);
            newData.p6 = new Pawn(piecesArray[13].row, piecesArray[13].col, piecesArray[13].num, piecesArray[13].team);
            newData.p6.setData(piecesArray[13].possibleMoves, piecesArray[13].blockBlocks, piecesArray[13].isDead);
            newData.p7 = new Pawn(piecesArray[14].row, piecesArray[14].col, piecesArray[14].num, piecesArray[14].team);
            newData.p7.setData(piecesArray[14].possibleMoves, piecesArray[14].blockBlocks, piecesArray[14].isDead);
            newData.p8 = new Pawn(piecesArray[15].row, piecesArray[15].col, piecesArray[15].num, piecesArray[15].team);
            newData.p8.setData(piecesArray[15].possibleMoves, piecesArray[15].blockBlocks, piecesArray[15].isDead);
            return newData;
        },
    },
    computed:
    {
        findMatchButtonText()
        {
            if (this.matchData.findingMatch == 0) return "FIND A MATCH";
            else if (this.matchData.matchFound || this.matchData.matchMade) return "Opponent Found";
            else return "SEARCHING";
        },
        playerTurnCalc()
        {
            if (this.gameData.whiteWin ||
                this.gameData.blackWin ||
                this.gameData.stale) return "Total Moves";
            if (this.gameData.playerTurn) return "Your Move";
            else if (this.teamColor() == "b") return "Black's Move";
            else return "White's Move";
        },
        winningCalc()
        {
            if (this.gameData.whiteWin) return "WHITE WINS.";
            if (this.gameData.blackWin) return "BLACK WINS.";
            if (this.gameData.stalemate) return "STALEMATE.";
            const STRINGS = ["Dominating", "Winning", "Smarter", "Better", "Superior", "Destroying"];
            var returnString = STRINGS[Math.floor(Math.random() * 100 % STRINGS.length)];
            if (this.gameData.whiteScore > this.gameData.blackScore) return "White is " + returnString + "!";
            if (this.gameData.whiteScore == this.gameData.blackScore) return "No One's Ahead."
            if (this.gameData.whiteScore < this.gameData.blackScore) return "Black is " + returnString + "!";
        },
        serverMessage()
        {
            return this.serverData.serverMessageText;
        }
        
    },
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