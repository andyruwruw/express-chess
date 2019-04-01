function loading()
{
    document.getElementById("loading").style.display = "none";
};
var music = "orionstheme";

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
            rejoin: 0,
        },
        testData:
        {
            whitePositions: [],
            blackPostions: [],
            whiteBlocked: [],
            blackBlocked: [],
            whitePossible: [],
            blackPossible: [],
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
            possible: [],
            check: "",
            unselected: {row: -1, col: -1},
            oppSelectionDif: "",
            assist: true,
            showSong: false,
            gameCopy: false,
            songChange: false,
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
            whitePieces: {k1: new King(0, 4, 1, 0, sD(1,"wk1"), sD(2,"wk1"), 0),   q1: new Queen(0, 3, 1, 0, sD(1,"wq1"), sD(2,"wq1"), 0),  
                          r1: new Rook(0, 0, 1, 0, sD(1,"wr1"), sD(2,"wr1"), 0),   r2: new Rook(0, 7, 2, 0, sD(1,"wr2"), sD(2,"wr2"), 0), 
                          b1: new Bishop(0, 2, 1, 0, sD(1,"wb1"), sD(2,"wb1"), 0), b2: new Bishop(0, 5, 2, 0, sD(1,"wb2"), sD(2,"wb2"), 0), 
                          n1: new Knight(0, 1, 1, 0, sD(1,"wn1"), sD(2,"wn1"), 0), n2: new Knight(0, 6, 2, 0, sD(1,"wn2"), sD(2,"wn2"), 0), 
                          p1: new Pawn(1, 0, 1, 0, sD(1,"wp1"), sD(2,"wp1"), 0),   p2: new Pawn(1, 1, 2, 0, sD(1,"wp2"), sD(2,"wp2"), 0),   
                          p3: new Pawn(1, 2, 3, 0, sD(1,"wp3"), sD(2,"wp3"), 0),   p4: new Pawn(1, 3, 4, 0, sD(1,"wp4"), sD(2,"wp4"), 0), 
                          p5: new Pawn(1, 4, 5, 0, sD(1,"wp5"), sD(2,"wp5"), 0),   p6: new Pawn(1, 5, 6, 0, sD(1,"wp6"), sD(2,"wp6"), 0),   
                          p7: new Pawn(1, 6, 7, 0, sD(1,"wp7"), sD(2,"wp7"), 0),   p8: new Pawn(1, 7, 8, 0, sD(1,"wp8"), sD(2,"wp8"), 0)},
            blackPieces: {k1: new King(7, 4, 1, 1, sD(1,"bk1"), sD(2,"bk1"), 0),   q1: new Queen(7, 3, 1, 1, sD(1,"bq1"), sD(2,"bq1"), 0),  
                          r1: new Rook(7, 0, 1, 1, sD(1,"br1"), sD(2,"br1"), 0),   r2: new Rook(7, 7, 2, 1, sD(1,"br2"), sD(2,"br2"), 0), 
                          b1: new Bishop(7, 2, 1, 1, sD(1,"bb1"), sD(2,"bb1"), 0), b2: new Bishop(7, 5, 2, 1, sD(1,"bb2"), sD(2,"bb2"), 0), 
                          n1: new Knight(7, 1, 1, 1, sD(1,"bn1"), sD(2,"bn1"), 0), n2: new Knight(7, 6, 2, 1, sD(1,"bn2"), sD(2,"bn2"), 0), 
                          p1: new Pawn(6, 0, 1, 1, sD(1,"bp1"), sD(2,"bp1"), 0),   p2: new Pawn(6, 1, 2, 1, sD(1,"bp2"), sD(2,"bp2"), 0),   
                          p3: new Pawn(6, 2, 3, 1, sD(1,"bp3"), sD(2,"bp3"), 0),   p4: new Pawn(6, 3, 4, 1, sD(1,"bp4"), sD(2,"bp4"), 0), 
                          p5: new Pawn(6, 4, 5, 1, sD(1,"bp5"), sD(2,"bp5"), 0),   p6: new Pawn(6, 5, 6, 1, sD(1,"bp6"), sD(2,"bp6"), 0),   
                          p7: new Pawn(6, 6, 7, 1, sD(1,"bp7"), sD(2,"bp7"), 0),   p8: new Pawn(6, 7, 8, 1, sD(1,"bp8"), sD(2,"bp8"), 0)},
        },
        SOUNDS: { 
            select: {sound: "select", volume: .7},
            unselect: {sound: "unselect", volume: .7},
            error: {sound: "error", volume: .7},
            check: {sound: "check", volume: .7},
            checkmate: {sound: "checkmate", volume: .7},
            move: {sound: "move", volume: .7},
            matchfound: {sound: "matchfound", volume: .1},
            turn: {sound: "turn", volume: .7},
            end: {sound: "end", volume: .7},
            stalemate: {sound: "stalemate", volume: .7}},
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
            if (this.gameData.playerTurn)                                                       // If it's the player's turn
            {
                this.unselectRedBlockDiv();
                var blockData = this.parseBlock(blockString);
                if (this.isEqual(this.selectData.selected, this.selectData.unselected))       // If nothing is selected
                {
                    console.log("New Selection");
                    if (this.isEmpty(blockData)) {console.log("Empty Selected"); return 0;}                                             // Or if it's empty, do nothing.
                    else if (this.isMyPiece(blockData)) this.selectBlock(blockData, blockString);     // If it's your piece, select it.
                    else this.throwError("You cannot select your opponent's pieces.");                  // Or if it's your opponent's piece, throw error
                }
                else                                                                                // If a piece is already selected.
                {
                    if (this.isMyPiece(blockData))                                                     // If next selection is your piece as well, unselect all.
                        this.unselectBlock(blockData, blockString);
                    else                                                                                // Or if next selection is not your piece, check if you can move there.
                    {
                        this.setData(this.selectData.move, blockData);
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

            this.selectData.selectImage = this.findBlockImage(selectBlock);                     // Adds the photo to the selected section up top.
            this.postOppSelection();                    
            this.drawSelection();
            this.colorPossible(selectBlock);

            if (this.selectData.blue != "") this.unselectBlueBlockDiv();                        // If something is already lit up as selected, undo it.
            this.selectBlueBlockDiv(blockString)                                                 // Color the selected block blue.

        },
        colorPossible(block)
        {
            if (this.selectData.assist)
            {
                if (!this.gameData.team)
                {
                    var keys = Object.keys(this.pieceData.whitePieces);
                    var piece;
                    for (var i = 0; i < keys.length; i++)
                    {
                        if (this.isEqual(this.pieceData.whitePieces[keys[i]].getPositionObject(), block))
                        {
                            var piece = keys[i];
                            console.log(piece);
                        }
                    }
                    this.pieceData.whitePieces[piece].findPossibleMoves(this.testData.whitePositions, this.testData.blackPositions);

                    if (piece == "k1") {this.getBlackBlocked(); this.getBlackPossible();this.pieceData.whitePieces.k1.removeUnsafeMoves(this.testData.blackBlocked, this.testData.blackPossible);}
                    var possible = this.pieceData.whitePieces[piece].getPossibleMoves();
                    for (var i = 0; i < possible.length; i++)
                    {
                        var id = this.blockToString(possible[i]);
                        this.selectData.possible.push(id);
                        var element = document.getElementById(id);
                        if (!(element.classList.contains("possible")))
                        {
                            element.classList.add("possible");
                        }
                    }
                }
                if (this.gameData.team)
                {
                    var keys = Object.keys(this.pieceData.blackPieces);
                    var piece;
                    for (var i = 0; i < keys.length; i++)
                    {
                        if (this.isEqual(this.pieceData.blackPieces[keys[i]].getPositionObject(), block))
                        {
                            var piece = keys[i];
                            console.log(piece);
                        }
                    }
                    this.pieceData.blackPieces[piece].findPossibleMoves(this.testData.blackPositions, this.testData.whitePositions);
                    if (piece == "k1") {this.getWhiteBlocked(); this.getWhitePossible();this.pieceData.blackPieces.k1.removeUnsafeMoves(this.testData.whiteBlocked, this.testData.whitePossible);}
                    var possible = this.pieceData.blackPieces[piece].getPossibleMoves();
                    for (var i = 0; i < possible.length; i++)
                    {
                        var id = this.blockToString(possible[i]);
                        this.selectData.possible.push(id);
                        var element = document.getElementById(id);
                        if (!(element.classList.contains("possible")))
                        {
                            element.classList.add("possible");
                        }
                    }
                }
            }
        },
        getWhiteBlocked()
        {
            this.testData.whiteBlocked = [];
            let keys = Object.keys(this.pieceData.whitePieces);
            for (var i = 0; i < keys.length; i++)
            {
                if (!(this.pieceData.whitePieces[keys[i]].getStatus())) continue;
                this.pieceData.whitePieces[keys[i]].findPossibleMoves(this.testData.whitePositions, this.testData.blackPositions);
                this.testData.whiteBlocked = this.testData.whiteBlocked.concat(this.pieceData.whitePieces[keys[i]].getblockBlocks());
            }
        },
        getBlackBlocked()
        {
            this.testData.blackBlocked = [];
            let keys = Object.keys(this.pieceData.blackPieces);
            for (var i = 0; i < keys.length; i++)
            {
                if (!(this.pieceData.blackPieces[keys[i]].getStatus())) continue;
                this.pieceData.blackPieces[keys[i]].findPossibleMoves(this.testData.blackPositions, this.testData.whitePositions);
                this.testData.blackBlocked = this.testData.blackBlocked.concat(this.pieceData.blackPieces[keys[i]].getblockBlocks());
            }
        },
        getWhitePossible()
        {
            this.testData.whitePossible = [];
            let keys = Object.keys(this.pieceData.whitePieces);
            for (var i = 0; i < keys.length; i++)
            {
                if (!(this.pieceData.whitePieces[keys[i]].getStatus())) continue;
                this.pieceData.whitePieces[keys[i]].findPossibleMoves(this.testData.whitePositions, this.testData.blackPositions);
                this.testData.whitePossible = this.testData.whitePossible.concat(this.pieceData.whitePieces[keys[i]].getPossibleMoves());
            }
        },
        getBlackPossible()
        {
            this.testData.blackPossible = [];
            let keys = Object.keys(this.pieceData.blackPieces);
            for (var i = 0; i < keys.length; i++)
            {
                if (!(this.pieceData.blackPieces[keys[i]].getStatus())) continue;
                this.pieceData.blackPieces[keys[i]].findPossibleMoves(this.testData.blackPositions, this.testData.whitePositions);
                this.testData.blackPossible = this.testData.blackPossible.concat(this.pieceData.blackPieces[keys[i]].getPossibleMoves());
            }
        },




        unColorPossible()
        {
            for (var i = 0; i < this.selectData.possible.length; i++)
            {
                var id = this.selectData.possible[i];
                var element = document.getElementById(id);
                if (element.classList.contains("possible"))
                {
                    element.classList.remove("possible");
                }
            }
            this.selectData.possible = [];
        },
        toggleAssistSelect()
        {
            this.playSound(this.SOUNDS.select.sound, this.SOUNDS.select.volume);
            var element = document.getElementById("moveAssist");
            if (this.selectData.assist)
            {
                element.style.color = "rgb(70,70,70)";
                this.selectData.assist = false;
                this.unColorPossible();
            }
            else
            {
                element.style.color = "white";
                this.selectData.assist = true;
                if (!(this.isEqual(this.selectData.selected, this.selectData.unselected)))
                {
                    this.colorPossible(this.selectData.selected);
                }
            }
        },
        unselectBlock()                                                                     // Unselect a block.
        {
            this.serverData.serverMessageText = ("Piece Unselected.");                          // Notifies Player.
            this.playSound(this.SOUNDS.unselect.sound, this.SOUNDS.unselect.volume);

            this.setData(this.selectData.selected, this.selectData.unselected);
            this.unColorPossible();

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

            if (this.selectData.selectImage.charAt(0) == this.teamColor() && !this.gameData.playerTurn)
            {
                selectedDiv.classList.add(this.oppColor() + "t");
            } 
            else
            {
                selectedDiv.classList.add(this.selectData.selectImage);
            }
        },                    // Then addds the correct Image.
        refreshChangedBlocks(changedSlots)
        {
            for (var i = 0; i < changedSlots.length / 2; i++)
            {
                var element = document.getElementById(this.blockToString(changedSlots[i * 2]));
                var elementMove = document.getElementById(this.blockToString(changedSlots[i * 2 + 1]));
                var id;
                let colors = ["w", "b"];
                let pieces = ["q", "k", "n", "b", "r", "p"];
                for (var k = 0; k < colors.length; k++){						                    // It runs through removing any piece classes.
                    for (var l = 0; l < pieces.length; l++){
                        if (element.classList.contains(colors[k] + pieces[l])) {
                        id = (colors[k] + pieces[l]);
                        element.classList.remove(colors[k] + pieces[l]);}
                        if (elementMove.classList.contains(colors[k] + pieces[l])) 
                        elementMove.classList.remove(colors[k] + pieces[l]);}}
                elementMove.classList.add(id);    
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
                    this.unselectCheckBlock();
                    this.gameData.whiteCheck = response.data.whiteCheck;
                    this.gameData.blackCheck = response.data.blackCheck;
                    this.gameData.blackWin = response.data.whiteCheckMate;
                    this.gameData.whiteWin = response.data.blackCheckMate;
                    this.gameData.stalemate = response.data.stalemate;
                    this.gameData.deadArray = response.data.deadArray;
                    this.convertObjectFromRecieved(response.data.pieceData);
                    var changedSlots = response.data.changedSlots;
                    this.refreshChangedBlocks(changedSlots);
                    this.findAllPositions();
                    if (this.gameData.whiteCheck || this.gameData.blackCheck) this.selectCheckBlock();
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
                    pieceData: 
                    {
                        whitePieces: this.convertObjectToSend(this.pieceData.whitePieces), 
                        blackPieces: this.convertObjectToSend(this.pieceData.blackPieces)
                    },
                    serverTurn: this.gameData.displayedTurn,
                    action: {selected: this.selectData.selected, move: this.selectData.move},
                    deadArray: this.gameData.deadArray,
                    whiteScore: this.gameData.whiteScore,
                    blackScore: this.gameData.blackScore,
                };
                let response = await axios.put("/api/match/" + this.serverData.gameID, request);
                if (response.data.nModified == 1)                                                   // If server approves move.
                {
                    this.serverData.serverMessageText = ("Move Approved by Server.");                              // Notifies player of request resolution.
                    console.log("Move Approved by Server.");
                    this.playSound(this.SOUNDS.move.sound, this.SOUNDS.move.volume);
                    this.gameData.playerTurn = false;
                    this.selectData.selectImage = this.oppColor() + "t";
                    this.postOppSelection();
                    this.drawSelection();
                    this.unselectBlock();
                    this.setData(this.selectData.selected, this.selectData.unselected);
                    this.getGameData();                                                                    // Retrieves new data.
                }
                else                                                                                // If server declines move.
                {
                    if (response.data.check == true)
                        this.serverData.serverMessageText = ("That Endangers Your King! Submit a Valid Move.");         // Notifies player of request failure.
                    else
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
                    this.setData(this.selectData.selected, this.selectData.unselected);
                    this.selectData.selectImage = this.teamColor() + "t";
                    this.unselectRedBlockDiv();
                    this.drawSelection();
                    this.playSound(this.SOUNDS.move.sound, this.SOUNDS.move.volume);
                    this.getGameData();
                }
            } catch (error) {
                console.log(error);
            }
        },
        async createGameData()
        {
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
                        whitePieces: this.convertObjectToSend(this.pieceData.whitePieces),
                        blackPieces: this.convertObjectToSend(this.pieceData.blackPieces),
                    },
                    changedSlots: [],
                    deadArray: [],
                };
                let upload = await axios.post('/api/match', match);
                this.serverData.serverMessageText = ("You're white! It's you're turn first.");
                this.findAllPositions();
                this.createOppSelection();
                this.createChatRoom();
                this.matchData.startGame = true;
                this.gameData.gameStart = true;
                this.gameData.playerTurn = true;
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
            for (var i = 0; i < keys.length; i++){
                this.pieceData.whitePieces[keys[i]].findPossibleMoves(this.testData.blackPostions, this.testData.whitePositions)}
            keys = Object.keys(this.pieceData.whitePieces);
            for (var i = 0; i < keys.length; i++){
                this.pieceData.whitePieces[keys[i]].findPossibleMoves(this.testData.blackPostions, this.testData.whitePositions)}
        },
        /* HELPER */ 
        findWhitePositions(){
            this.testData.whitePositions = [];
            var pieceKeys = Object.keys(this.pieceData.whitePieces);
            for (var i = 0; i < pieceKeys.length; i++){
                if (!((this.pieceData.whitePieces[pieceKeys[i]]).getStatus())) {console.log("This one's dead"); continue;}
                else {
                    var testObject = this.pieceData.whitePieces[pieceKeys[i]].getPositionObject();
                    this.testData.whitePositions.push(testObject);}}
        },
        /* HELPER */ 
        findBlackPositions(){
            this.testData.blackPositions = [];
            var pieceKeys = Object.keys(this.pieceData.blackPieces);
            for (var i = 0; i < pieceKeys.length; i++){
                if (!((this.pieceData.blackPieces[pieceKeys[i]]).getStatus())) {console.log("This one's dead"); continue;}
                else {
                    var testObject = this.pieceData.blackPieces[pieceKeys[i]].getPositionObject();
                    this.testData.blackPositions.push(testObject);}}
        },
        findAllPositions()
        {
            this.findBlackPositions();
            this.findWhitePositions();
        },
        /* HELPER */ 
        findPositionInArray(desired, array){
            for (var i = 0; i < array.length; i++){
                if (this.isEqual(desired, array[i]))
                    return true;}
            return false;},
        /* HELPER */ 
        isMyPiece(testBlock) {
            if (this.teamColor() == "w") return this.findPositionInArray(testBlock, this.testData.whitePositions);
            else return this.findPositionInArray(testBlock, this.testData.blackPositions); },

        isEmpty(testBlock) {
            if (this.findPositionInArray(testBlock, this.testData.whitePositions) || this.findPositionInArray(testBlock, this.testData.blackPositions))
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
                this.findAllPositions();
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
                this.playSound(this.SOUNDS.select.sound, this.SOUNDS.select.volume);
                if (this.matchData.findingMatch)
                {
                    this.matchData.findingMatch = 0;
                    await axios.delete("/api/queue/" + this.serverData.gameID);
                    this.serverData.gameID = "";
                }
                else
                {
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
            await axios.delete("/api/queue/" + this.serverData.gameID);
        },
        /* HELPER */ 
        MAKEID() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            for (var i = 0; i < 10; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;},
        rejoinMatch()
        {

        },

        //=====================================================CHAT ROOM=====================================================
        async createChatRoom()
        {
            try {
                let chat = await axios.post('/api/chat', {
                    _id: this.serverData.gameID,
                    chats: this.chatData.messages,
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async getChatRoom()
        {
            let response = await axios.get("/api/chat/" + this.serverData.gameID);
            //console.log(response);
            this.chatData.messages = response.data.chats;
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
            if (this.isEqual(selectBlock, this.selectData.unselected))
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
        selectCheckBlock()
        {
            if (this.gameData.whiteCheck)
            {
                var kingPos = this.pieceData.whitePieces.k1.getPositionObject();
                var keys = Object.keys(this.pieceData.blackPieces);
                var dangerousBlock;
                var done = 0;
                for (var i = 0; i < keys.length; i++)
                {
                    this.pieceData.blackPieces[keys[i]].findPossibleMoves(this.testData.blackPositions, this.testData.whitePositions);
                    var possible = this.pieceData.blackPieces[keys[i]].getPossibleMoves();
                    for (var j = 0; j < possible.length; j++)
                    {
                        
                        if (this.isEqual(possible[j], kingPos))
                        {
                            dangerousBlock = keys[i];
                            console.log("Found at: " + dangerousBlock);
                            done = 1;
                            break;
                        }
                    }
                    if (done)
                    {
                        break;
                    }
                }
                console.log(dangerousBlock);
                var id = this.blockToString(this.pieceData.blackPieces[dangerousBlock].getPositionObject());
                var element = document.getElementById(id);
                if (!element.classList.contains("check"))
                element.classList.add("check");
                this.selectData.check = id;
            }
            if (this.gameData.blackCheck)
            {
                var kingPos = this.pieceData.blackPieces.k1.getPositionObject();
                var keys = Object.keys(this.pieceData.whitePieces);
                var dangerousBlock;
                var done = 0;
                for (var i = 0; i < keys.length; i++)
                {
                    this.pieceData.whitePieces[keys[i]].findPossibleMoves(this.testData.whitePositions, this.testData.blackPositions);
                    var possible = this.pieceData.whitePieces[keys[i]].getPossibleMoves();
                    for (var j = 0; j < possible.length; j++)
                    {
                        if (this.isEqual(possible[j], kingPos))
                        {
                            var id = this.blockToString(this.pieceData.whitePieces[keys[i]].getPositionObject());
                            var element = document.getElementById(id);
                            if (!element.classList.contains("check"))
                            element.classList.add("check");
                            this.selectData.check = id;
                            done = 1;
                            break;
                        }
                    }
                    if (done)
                    {
                        break;
                    }
                }

            }
        },
        unselectCheckBlock()
        {
            if (this.selectData.check != "")
            {
                var element = document.getElementById(this.selectData.check);
                if (element.classList.contains("check"))
                element.classList.remove("check");
                this.selectData.check = "";
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
            if (this.gameData.team) {return "w";}
            return "b";
        },
        findKeyOffPosition(position, teamPieces)
        {
            var array = Object.entries(teamPieces);
            for (i = 0; i < array.length; i++)
            {
                if (this.isEqual(position, array[i][1].getPositionObject())){
                    return array[i][0];
                }
            }
            return "";
        },
        gameOver()
        {
            this.gameData.playerTurn = false;
        },
        convertObjectToSend(piecesData)
        {
            var result = new Object();
            var keys = Object.keys(piecesData);
            for (var i = 0; i < keys.length; i++){
                result[keys[i]] = piecesData[keys[i]].getSendObject();}
            return result;
        },
        convertObjectFromRecieved(recievedData)
        {
            this.pieceData.whitePieces.k1 = new King(recievedData.whitePieces.k1.row, recievedData.whitePieces.k1.col, recievedData.whitePieces.k1.num, recievedData.whitePieces.k1.team, recievedData.whitePieces.k1.possibleMoves, recievedData.whitePieces.k1.blockBlocks, recievedData.whitePieces.k1.isDead, recievedData.whitePieces.k1.hasMoved);
            this.pieceData.whitePieces.q1 = new Queen(recievedData.whitePieces.q1.row, recievedData.whitePieces.q1.col, recievedData.whitePieces.q1.num, recievedData.whitePieces.q1.team, recievedData.whitePieces.q1.possibleMoves, recievedData.whitePieces.q1.blockBlocks, recievedData.whitePieces.q1.isDead);
            this.pieceData.whitePieces.r1 = new Rook(recievedData.whitePieces.r1.row, recievedData.whitePieces.r1.col, recievedData.whitePieces.r1.num, recievedData.whitePieces.r1.team, recievedData.whitePieces.r1.possibleMoves, recievedData.whitePieces.r1.blockBlocks, recievedData.whitePieces.r1.isDead);
            this.pieceData.whitePieces.r2 = new Rook(recievedData.whitePieces.r2.row, recievedData.whitePieces.r2.col, recievedData.whitePieces.r2.num, recievedData.whitePieces.r2.team, recievedData.whitePieces.r2.possibleMoves, recievedData.whitePieces.r2.blockBlocks, recievedData.whitePieces.r2.isDead);
            this.pieceData.whitePieces.b1 = new Bishop(recievedData.whitePieces.b1.row, recievedData.whitePieces.b1.col, recievedData.whitePieces.b1.num, recievedData.whitePieces.b1.team, recievedData.whitePieces.b1.possibleMoves, recievedData.whitePieces.b1.blockBlocks, recievedData.whitePieces.b1.isDead);
            this.pieceData.whitePieces.b2 = new Bishop(recievedData.whitePieces.b2.row, recievedData.whitePieces.b2.col, recievedData.whitePieces.b2.num, recievedData.whitePieces.b2.team, recievedData.whitePieces.b2.possibleMoves, recievedData.whitePieces.b2.blockBlocks, recievedData.whitePieces.b2.isDead);
            this.pieceData.whitePieces.n1 = new Knight(recievedData.whitePieces.n1.row, recievedData.whitePieces.n1.col, recievedData.whitePieces.n1.num, recievedData.whitePieces.n1.team, recievedData.whitePieces.n1.possibleMoves, recievedData.whitePieces.n1.blockBlocks, recievedData.whitePieces.n1.isDead);
            this.pieceData.whitePieces.n2 = new Knight(recievedData.whitePieces.n2.row, recievedData.whitePieces.n2.col, recievedData.whitePieces.n2.num, recievedData.whitePieces.n2.team, recievedData.whitePieces.n2.possibleMoves, recievedData.whitePieces.n2.blockBlocks, recievedData.whitePieces.n2.isDead);
            this.pieceData.whitePieces.p1 = new Pawn(recievedData.whitePieces.p1.row, recievedData.whitePieces.p1.col, recievedData.whitePieces.p1.num, recievedData.whitePieces.p1.team, recievedData.whitePieces.p1.possibleMoves, recievedData.whitePieces.p1.blockBlocks, recievedData.whitePieces.p1.isDead, recievedData.whitePieces.p1.hasMoved);
            this.pieceData.whitePieces.p2 = new Pawn(recievedData.whitePieces.p2.row, recievedData.whitePieces.p2.col, recievedData.whitePieces.p2.num, recievedData.whitePieces.p2.team, recievedData.whitePieces.p2.possibleMoves, recievedData.whitePieces.p2.blockBlocks, recievedData.whitePieces.p2.isDead, recievedData.whitePieces.p2.hasMoved);
            this.pieceData.whitePieces.p3 = new Pawn(recievedData.whitePieces.p3.row, recievedData.whitePieces.p3.col, recievedData.whitePieces.p3.num, recievedData.whitePieces.p3.team, recievedData.whitePieces.p3.possibleMoves, recievedData.whitePieces.p3.blockBlocks, recievedData.whitePieces.p3.isDead, recievedData.whitePieces.p3.hasMoved);
            this.pieceData.whitePieces.p4 = new Pawn(recievedData.whitePieces.p4.row, recievedData.whitePieces.p4.col, recievedData.whitePieces.p4.num, recievedData.whitePieces.p4.team, recievedData.whitePieces.p4.possibleMoves, recievedData.whitePieces.p4.blockBlocks, recievedData.whitePieces.p4.isDead, recievedData.whitePieces.p4.hasMoved);
            this.pieceData.whitePieces.p5 = new Pawn(recievedData.whitePieces.p5.row, recievedData.whitePieces.p5.col, recievedData.whitePieces.p5.num, recievedData.whitePieces.p5.team, recievedData.whitePieces.p5.possibleMoves, recievedData.whitePieces.p5.blockBlocks, recievedData.whitePieces.p5.isDead, recievedData.whitePieces.p5.hasMoved);
            this.pieceData.whitePieces.p6 = new Pawn(recievedData.whitePieces.p6.row, recievedData.whitePieces.p6.col, recievedData.whitePieces.p6.num, recievedData.whitePieces.p6.team, recievedData.whitePieces.p6.possibleMoves, recievedData.whitePieces.p6.blockBlocks, recievedData.whitePieces.p6.isDead, recievedData.whitePieces.p6.hasMoved);
            this.pieceData.whitePieces.p7 = new Pawn(recievedData.whitePieces.p7.row, recievedData.whitePieces.p7.col, recievedData.whitePieces.p7.num, recievedData.whitePieces.p7.team, recievedData.whitePieces.p7.possibleMoves, recievedData.whitePieces.p7.blockBlocks, recievedData.whitePieces.p7.isDead, recievedData.whitePieces.p7.hasMoved);
            this.pieceData.whitePieces.p8 = new Pawn(recievedData.whitePieces.p8.row, recievedData.whitePieces.p8.col, recievedData.whitePieces.p8.num, recievedData.whitePieces.p8.team, recievedData.whitePieces.p8.possibleMoves, recievedData.whitePieces.p8.blockBlocks, recievedData.whitePieces.p8.isDead, recievedData.whitePieces.p8.hasMoved);

            this.pieceData.blackPieces.k1 = new King(recievedData.blackPieces.k1.row, recievedData.blackPieces.k1.col, recievedData.blackPieces.k1.num, recievedData.blackPieces.k1.team, recievedData.blackPieces.k1.possibleMoves, recievedData.blackPieces.k1.blockBlocks, recievedData.blackPieces.k1.isDead, recievedData.blackPieces.k1.hasMoved);
            this.pieceData.blackPieces.q1 = new Queen(recievedData.blackPieces.q1.row, recievedData.blackPieces.q1.col, recievedData.blackPieces.q1.num, recievedData.blackPieces.q1.team, recievedData.blackPieces.q1.possibleMoves, recievedData.blackPieces.q1.blockBlocks, recievedData.blackPieces.q1.isDead);
            this.pieceData.blackPieces.r1 = new Rook(recievedData.blackPieces.r1.row, recievedData.blackPieces.r1.col, recievedData.blackPieces.r1.num, recievedData.blackPieces.r1.team, recievedData.blackPieces.r1.possibleMoves, recievedData.blackPieces.r1.blockBlocks, recievedData.blackPieces.r1.isDead);
            this.pieceData.blackPieces.r2 = new Rook(recievedData.blackPieces.r2.row, recievedData.blackPieces.r2.col, recievedData.blackPieces.r2.num, recievedData.blackPieces.r2.team, recievedData.blackPieces.r2.possibleMoves, recievedData.blackPieces.r2.blockBlocks, recievedData.blackPieces.r2.isDead);
            this.pieceData.blackPieces.b1 = new Bishop(recievedData.blackPieces.b1.row, recievedData.blackPieces.b1.col, recievedData.blackPieces.b1.num, recievedData.blackPieces.b1.team, recievedData.blackPieces.b1.possibleMoves, recievedData.blackPieces.b1.blockBlocks, recievedData.blackPieces.b1.isDead);
            this.pieceData.blackPieces.b2 = new Bishop(recievedData.blackPieces.b2.row, recievedData.blackPieces.b2.col, recievedData.blackPieces.b2.num, recievedData.blackPieces.b2.team, recievedData.blackPieces.b2.possibleMoves, recievedData.blackPieces.b2.blockBlocks, recievedData.blackPieces.b2.isDead);
            this.pieceData.blackPieces.n1 = new Knight(recievedData.blackPieces.n1.row, recievedData.blackPieces.n1.col, recievedData.blackPieces.n1.num, recievedData.blackPieces.n1.team, recievedData.blackPieces.n1.possibleMoves, recievedData.blackPieces.n1.blockBlocks, recievedData.blackPieces.n1.isDead);
            this.pieceData.blackPieces.n2 = new Knight(recievedData.blackPieces.n2.row, recievedData.blackPieces.n2.col, recievedData.blackPieces.n2.num, recievedData.blackPieces.n2.team, recievedData.blackPieces.n2.possibleMoves, recievedData.blackPieces.n2.blockBlocks, recievedData.blackPieces.n2.isDead);
            this.pieceData.blackPieces.p1 = new Pawn(recievedData.blackPieces.p1.row, recievedData.blackPieces.p1.col, recievedData.blackPieces.p1.num, recievedData.blackPieces.p1.team, recievedData.blackPieces.p1.possibleMoves, recievedData.blackPieces.p1.blockBlocks, recievedData.blackPieces.p1.isDead, recievedData.blackPieces.p1.hasMoved);
            this.pieceData.blackPieces.p2 = new Pawn(recievedData.blackPieces.p2.row, recievedData.blackPieces.p2.col, recievedData.blackPieces.p2.num, recievedData.blackPieces.p2.team, recievedData.blackPieces.p2.possibleMoves, recievedData.blackPieces.p2.blockBlocks, recievedData.blackPieces.p2.isDead, recievedData.blackPieces.p2.hasMoved);
            this.pieceData.blackPieces.p3 = new Pawn(recievedData.blackPieces.p3.row, recievedData.blackPieces.p3.col, recievedData.blackPieces.p3.num, recievedData.blackPieces.p3.team, recievedData.blackPieces.p3.possibleMoves, recievedData.blackPieces.p3.blockBlocks, recievedData.blackPieces.p3.isDead, recievedData.blackPieces.p3.hasMoved);
            this.pieceData.blackPieces.p4 = new Pawn(recievedData.blackPieces.p4.row, recievedData.blackPieces.p4.col, recievedData.blackPieces.p4.num, recievedData.blackPieces.p4.team, recievedData.blackPieces.p4.possibleMoves, recievedData.blackPieces.p4.blockBlocks, recievedData.blackPieces.p4.isDead, recievedData.blackPieces.p4.hasMoved);
            this.pieceData.blackPieces.p5 = new Pawn(recievedData.blackPieces.p5.row, recievedData.blackPieces.p5.col, recievedData.blackPieces.p5.num, recievedData.blackPieces.p5.team, recievedData.blackPieces.p5.possibleMoves, recievedData.blackPieces.p5.blockBlocks, recievedData.blackPieces.p5.isDead, recievedData.blackPieces.p5.hasMoved);
            this.pieceData.blackPieces.p6 = new Pawn(recievedData.blackPieces.p6.row, recievedData.blackPieces.p6.col, recievedData.blackPieces.p6.num, recievedData.blackPieces.p6.team, recievedData.blackPieces.p6.possibleMoves, recievedData.blackPieces.p6.blockBlocks, recievedData.blackPieces.p6.isDead, recievedData.blackPieces.p6.hasMoved);
            this.pieceData.blackPieces.p7 = new Pawn(recievedData.blackPieces.p7.row, recievedData.blackPieces.p7.col, recievedData.blackPieces.p7.num, recievedData.blackPieces.p7.team, recievedData.blackPieces.p7.possibleMoves, recievedData.blackPieces.p7.blockBlocks, recievedData.blackPieces.p7.isDead, recievedData.blackPieces.p7.hasMoved);
            this.pieceData.blackPieces.p8 = new Pawn(recievedData.blackPieces.p8.row, recievedData.blackPieces.p8.col, recievedData.blackPieces.p8.num, recievedData.blackPieces.p8.team, recievedData.blackPieces.p8.possibleMoves, recievedData.blackPieces.p8.blockBlocks, recievedData.blackPieces.p8.isDead, recievedData.blackPieces.p8.hasMoved);
        },
        changeSong()
        {
            pauseMusic();
            this.playSound(this.SOUNDS.select.sound, this.SOUNDS.select.volume);
            var songs = ["orionstheme", "lowfi", "bach", "wouh", "outkast", "chopin", "bluemantique", "minecraft",];
            var currIndex = songs.indexOf(music);
            music = songs[(currIndex + 1) % songs.length];
            this.selectData.songChange = true;
            playMusic();
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
            else if (this.teamColor() == "b") return "White's Move";
            else return "Black's Move";
        },
        winningCalc()
        {
            if (this.gameData.whiteWin) {
                this.playSound(this.SOUNDS.end.sound, this.SOUNDS.end.volume);this.gameOver(); return "WHITE WINS.";}
            if (this.gameData.blackWin) {
                this.playSound(this.SOUNDS.end.sound, this.SOUNDS.end.volume);this.gameOver(); return "BLACK WINS.";}
            if (this.gameData.stalemate) {
                this.playSound(this.SOUNDS.stalemate.sound, this.SOUNDS.stalemate.volume);this.gameOver(); return "STALEMATE";}
            const STRINGS = ["Dominating", "Winning", "Smarter", "Better", "Superior", "Destroying"];
            var returnString = STRINGS[Math.floor(Math.random() * 100 % STRINGS.length)];
            if (this.gameData.whiteScore > this.gameData.blackScore) return "White is " + returnString + "!";
            if (this.gameData.whiteScore == this.gameData.blackScore) return "No One's Ahead."
            if (this.gameData.whiteScore < this.gameData.blackScore) return "Black is " + returnString + "!";
        },
        serverMessage()
        {
            return this.serverData.serverMessageText;
        },
        currmusic()
        {
            if (this.selectData.showSong)
            {   
                if (this.selectData.songChange)
                {
                    this.selectData.songChange = false;
                }
                var songs = ["orionstheme", "lowfi", "bach", "wouh", "outkast", "chopin", "bluemantique", "minecraft",];
                var returns = ["Orions Theme", "Motions", "Bach", "Wouh", "Outkast", "Chopin", "Bluemantique", "Minecraft"];
                var currIndex = songs.indexOf(music);
                return returns[currIndex];
            }
            return "CHANGE SONG";
        },
        gameIDButton()
        {
            return "Game ID: " + this.serverData.gameID;
        }

        
    },
});

function playMusic()
{
	var media = document.getElementById(music);
	media.volume = .2;
	const playPromise = media.play();
	if (playPromise !== null){
		playPromise.catch(() => { media.play(); })
	}
}

function pauseMusic()
{
    var media = document.getElementById(music);
    const playPromise = media.pause();
}