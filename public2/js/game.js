import { POINT_CONVERSION_COMPRESSED } from "constants";
import { create } from "domain";

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
            startGame: 0,
            findingMatch: 0,
        },
        pieceData:
        {
            whitePieces: {k1: King(0, 4, 1, 0), q1: Queen(0, 3, 1, 0), r1: Rook(0, 0, 1, 0), r2: Rook(0, 7, 2, 0), 
                          b1: Bishop(0, 2, 1, 0), b2: Bishop(0, 5, 2, 0), n1: Knight(0, 1, 1, 0), n2: Knight(0, 6, 2, 0), 
                          p1: Pawn(1, 0, 1, 0), p2: Pawn(1, 1, 2, 0), p3: Pawn(1, 2, 3, 0), p4: Pawn(1, 3, 4, 0), 
                          p5: Pawn(1, 4, 5, 0), p6: Pawn(1, 5, 6, 0), p7: Pawn(1, 6, 7, 0), p8: Pawn(1, 7, 8, 0)},
            blackPieces: {k1: King(7, 4, 1, 1), q1: Queen(7, 3, 1, 1), r1: Rook(7, 0, 1, 1), r2: Rook(7, 7, 2, 1), 
                          b1: Bishop(7, 2, 1, 1), b2: Bishop(7, 5, 2, 1), n1: Knight(7, 1, 1, 1), n2: Knight(7, 6, 2, 1), 
                          p1: Pawn(6, 0, 1, 1), p2: Pawn(6, 1, 2, 1), p3: Pawn(6, 2, 3, 1), p4: Pawn(6, 3, 4, 1), 
                          p5: Pawn(6, 4, 5, 1), p6: Pawn(6, 5, 6, 1), p7: Pawn(6, 6, 7, 1), p8: Pawn(6, 7, 8, 1)},
        },
        testData:
        {
            whitePositions: [],
            blackPostions: [],
        },
        gameData:
        {
            gameStart: false,
            playerTurn: 1,
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
            interval,
        },
        chatData:
        {
            messages: [],
            messageText: "",
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
            if (this.gameData.playerTurn)                                                       // If it's the player's turn
            {
                this.unselectRedBlockDiv();
                var clickBlock = this.parseBlock(blockString);
                if (this.isEqual(this.selectData.selected, this.selectData.unselected))       // If nothing is selected
                {
                    if (this.isMyPiece(clickBlock)) this.selectBlock(clickBlock, blockString);          // If it's your piece, select it.
                    else if (this.isEmpty(clickBlock)) return 0;                                        // Or if it's empty, do nothing.
                    else this.throwError("You cannot select your opponent's pieces.");                  // Or if it's your opponent's piece, throw error
                }
                else                                                                                // If a piece is already selected.
                {
                    if (this.isMyPiece(clickBlock))                                                     // If next selection is your piece as well, unselect all.
                    this.unselectBlock(clickBlock, blockString);
                    else                                                                                // Or if next selection is not your piece, check if you can move there.
                    {
                        this.setData(this.selectData.move, clickBlock);
                        // Move
                    }
                }
            }
            else throwError("Wait for your turn to select a piece!");                           // Or if it's not your turn, throw error.
        },
        /* HELPER */ 
        selectBlock(selectBlock, blockString)                                               // Player selects a block.
        {
            this.serverData.serverMessageText = ("Piece Selected.");                            // Notifies player.
            this.playSound(this.SOUNDS.select.sound, this.SOUNDS.select.volume);

            this.setData(this.selectData.selected, selectBlock);

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
            this.drawSelection();

            if (this.selectData.blue != "") this.unselectBlueBlockDiv();                        // If something is blue, uncolor it.
        },
        selectBlueBlockDiv(blockID)                                                           // Find the correct block and color it blue.
        {
            var element = document.getElementById(block);
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
            selectedDiv.classList.add(this.selectData.selectImage);},                           // Then addds the correct Image.
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
                    this.setData(this.pieceData.whitePieces, response.data.pieceData.whitePieces);
                    this.setData(this.pieceData.blackPieces, response.data.pieceData.blackPieces);
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
                this.serverMessageText = "Sending Move to Server...";                               // Notifies player of the pending action...
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
                    this.serverMessageText = ("Move Approved by Server.");                              // Notifies player of request resolution.
                    console.log("Move Approved by Server.");
                    this.playSound(this.SOUNDS.move.sound, this.SOUNDS.move.volume);
                    this.getGameData();                                                                    // Retrieves new data.
                    this.gameData.playerTurn = 0;
                }
                else                                                                                // If server declines move.
                {
                    this.serverMessageText = ("Move Declined by Server. Submit a Valid Move.");         // Notifies player of request failure.
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
                    this.serverMessageText = ("Opponent Moved. Your Turn!");
                    this.playSound(this.SOUNDS.move.sound, this.SOUNDS.move.volume);
                    this.playerTurn = 1;
                    this.getGameData();
                }
            } catch (error) {
                console.log(error);
            }
        },
        async createGameData()
        {

        },

        //=====================================================DATA MANAGEMENT=====================================================

        /* HELPER */ 
        findWhitePositions(){
            this.testData.whitePositions = [];
            var pieces = Object.values(this.pieceData.whitePieces);
            for (piece in pieces){
                if (!((pieces[piece]).getStatus())) continue;
                else {var testObject = pieces[piece].getPositionObject();
                    this.testData.whitePositions.push(testObject);}}},
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
            if (this.teamColor() == "w") return findPositionInArray(testBlock, this.testData.whitePositions);
            else return findPositionInArray(testBlock, this.testData.blackPostions); },
        isEmpty(testBlock) {
            if (findPositionInArray(testBlock, this.testData.whitePositions) || findPositionInArray(testBlock, this.testData.blackPostions))
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

        async respondToMatch() { matchFound
            try {
                this.matchData.matchFound = 1;
                this.gameData.team = 1;
                this.gameData.opp = 0;
                this.matchData.startGame = 1;
                let response = await axios.put("/api/queue/" + this.matchMaker._id, {
                    playerNum: 2
                });
                this.drawSelection();
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
                            this.matchData.matchFound = 1;
                            this.matchData.findingMatch = 0;
                            this.playSound(this.SOUNDS.matchfound.sound, this.SOUNDS.matchfound.volume);
                            this.respondToMatch();
                            this.interval = setInterval(this.intervalMethod, this.serverData.intervalspeed);
                        }
                        else matchNum += 1;
                    }
                    if (!this.matchData.matchFound)
                    {
                        this.matchData.findingMatch = 1;
                        this.postMatchMaker(matchNum + 1);
                        this.serverData.interval = setInterval(this.intervalMethod, this.intervalspeed);
                    }
                }	
                else
                {
                    this.matchData.findingMatch = 1;
                    this.postMatchMaker(matchNum + 1);
                    this.serverData.interval = setInterval(this.intervalMethod, this.intervalspeed);
                }
            } catch (error) {
                console.log(error);
            }
        },
        async postMatchMaker()
        {
            try {
                this.serverData.gameID = this.makeid(10);
                let match = await axios.post('/api/queue', {
                    _id: this.serverData.gameID,
                    roomNum: 0,
                    playerNum: 1,
                    gameId: this.serverData.gameID
                    });
                this.matchMaker._id = match.data._id;
                this.matchMaker.roomNum = match.data.roomNum;
                this.matchMaker.playerNum = match.data.playerNum;
                this.sharedData.roomNum = match.data.roomNum;
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
        async deleteMatchMaker()
        {

        },
        /* HELPER */ 
        MAKEID() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;},

        //=====================================================CHAT ROOM=====================================================
        async createChatRoom()
        {

        },
        async getChatRoom()
        {

        },
        async messageChatRoom()
        {

        },
        //=====================================================OPP SELECTION=====================================================
        async createOppSelection()
        {
            try {
                let match = await axios.post('/api/selected', {
                    _id: this.serverData.gameID,
                    turn: this.displayedTurn,
                    selected: this.PLAYER_INFO.color + "t",
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
                    selected: this.selectImage,
                    pos: this.sharedData.action.selection
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
                    this.oppSelectBlock(response.data.pos, response.data.selected)
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

            this.selectData.selectImage = this.findBlockImage(selectBlock);
            this.drawSelection();

            if (this.selectData.red != "") this.unselectRedBlockDiv();
            this.selectRedBlockDiv(blockString)
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
            var element = document.getElementById(this.selectData.blue);
            if (element.classList.contains("oppselected"))
            element.classList.remove("oppselected");
            this.selectData.red = "";
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
            var aProps = Object.getOwnPropertyNames(a);
            var bProps = Object.getOwnPropertyNames(b);
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
            this.gameData.playerTurn = 0;
        }
    },
    computed:
    {
        findMatchButtonText()
        {
            if (this.findingMatch == 0) return "FIND A MATCH";
            else if (this.matchFound || this.matchMade) return "Opponent Found";
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
            if (this.this.gameData.stale) return "STALEMATE.";
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



  