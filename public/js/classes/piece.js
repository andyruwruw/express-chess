class Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead) {
        this.row = row;
        this.col = col;
        this.team = team;
        this.enemy = !team;
        this.num = num;
        this.possibleMoves = possibleMoves;
        this.blockBlocks = blockBlocks;
        this.pathBlocks = pathBlocks;
        this.isDead = isDead;
        }

    getSendObject()
    {
        var data = new Object();
        data.row = this.row;
        data.col = this.col;
        data.team = this.team;
        data.num = this.num;
        data.possibleMoves = this.possibleMoves;
        data.blockBlocks = this.blockBlocks;
        data.pathBlocks = this.pathBlocks;
        data.isDead = this.isDead;
        return data;
    }

    getPositionObject() {
        var position = {row: this.row, col: this.col};
        return position;}

    getPossibleMoves() {
        return this.possibleMoves;}

    getblockBlocks() {
        return this.blockBlocks;}

    getpathBlocks(){
        return this.pathBlocks;}

    move(newPos, teamPositions, oppPositions, enemyKingPos) { // Checks if possibleMoves includes new position, then sends it there. Refinds possoible moves
        this.findPossibleMoves(teamPositions, oppPositions, enemyKingPos);
        for (var i = 0; i < this.possibleMoves.length; i++)
        {
            if (this.isEqual(this.possibleMoves[i], newPos))
            {
                this.row = newPos.row;
                this.col = newPos.col;
                this.findPossibleMoves(teamPositions, oppPositions, enemyKingPos);
                return true;}
        }
        console.log("MOVE FAILED");
        return false;
    }

    kill() { // Kills the piece, placing it at 9-9 and Returning its point worth.
        this.row = 100;
        this.col = 100;
        this.isDead = 1;
        return this.points;}

    getStatus() // false if dead
    {
        if (this.isDead) return false;
        return true;
    }

    checkForRefresh(changeBlock, teamPositions, oppPositions, enemyKingPos)
    {
        for (var i = 0; i < this.possibleMoves.length; i++)
        {
            if (this.isEqual(this.possibleMoves[i], changeBlock))
            {
                console.log("FINDING NEW POSITIONS");
                this.findPossibleMoves(teamPositions, oppPositions, enemyKingPos);
                return true;
            }
        }
        for (var i = 0; i < this.blockBlocks.length; i++)
        {
            if (this.isEqual(this.blockBlocks[i], changeBlock))
            {
                console.log("UNBLOCKED");
                this.findPossibleMoves(teamPositions, oppPositions, enemyKingPos);
                return true;
            }
        }
        for (var i = 0; i < this.pathBlocks.length; i++)
        {
            if (this.isEqual(this.pathBlocks[i], changeBlock))
            {
                console.log("PATH CHANGED");
                this.findPossibleMoves(teamPositions, oppPositions, enemyKingPos);
                return true;
            }
        }
        return false;
    }

    checkRecursive (xDirection, yDirection, teamPositions, oppPositions, inputBlock, enemyKingPos)
    {
        var testBlock = this.addValues(inputBlock, xDirection, yDirection);
        if (!(this.isInBoard(testBlock))) {return true;}
        
        for (var i = 0; i < teamPositions.length; i++)
        {
            if (this.isEqual(testBlock, teamPositions[i]))
            {
                this.blockBlocks.push(testBlock);
                return true;
            }
        }
        for (var i = 0; i < oppPositions.length; i++)
        {
            if (this.isEqual(testBlock, oppPositions[i]))
            {
                this.possibleMoves.push(testBlock);
                if (this.isEqual(testBlock, enemyKingPos))
                {
                    var onePast = this.addValues(inputBlock, xDirection, yDirection);
                    this.pathBlocks.push(onePast);
                }
                return true;
            }
        }
        this.possibleMoves.push(testBlock);
        if (this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, testBlock, enemyKingPos))
        {return true;}
    }

    checkOnce(xDirection, yDirection, teamPositions, oppPositions, currPos)
    {
        var testBlock = this.addValues(currPos, xDirection, yDirection);
        if (!this.isInBoard(testBlock)) return true;

        for (var i = 0; i < teamPositions.length; i++)
        {
            if (this.isEqual(testBlock, teamPositions[i]))
            {
                this.blockBlocks.push(testBlock);
                return true;
            }
        }
        for (var i = 0; i < oppPositions.length; i++)
        {
            if (this.isEqual(testBlock, oppPositions[i]))
            {
                this.possibleMoves.push(testBlock);
                return true;
            }
        }
        this.possibleMoves.push(testBlock);
        return true;
    }

    isEqual(a, b){
        var aProps = Object.keys(a);
        var bProps = Object.keys(b);
        if (aProps.length != bProps.length) return false;
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            if (a[propName] !== b[propName]) return false;}
        return true;
    }
    setData(a, b){
        var aProps = Object.getOwnPropertyNames(a);
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            a[propName] = b[propName]}
    }
    isInBoard(a){
        if (a.row < 0 || a.row > 7 || a.col < 0 || a.col > 7) {return false;}
        else {return true;}
    }
    addValues(block, x, y)
    {
        return {row: block.row + y, col: block.col + x};
    }

    findPossibleMoves()
    {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.pathBlocks = [];
    }
}