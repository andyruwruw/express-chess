class Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead) {
        this.row = row;
        this.col = col;
        this.team = team;
        this.enemy = !team;
        this.num = num;
        this.possibleMoves = possibleMoves;
        this.blockBlocks = blockBlocks;
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

    move(newPos, teamPositions, oppPostions) { // Checks if possibleMoves includes new position, then sends it there. Refinds possoible moves
        this.findPossibleMoves(teamPositions, oppPostions);
        console.log(this.possibleMoves);
        console.log(newPos);
        
        for (var i = 0; i < this.possibleMoves.length; i++)
        {
            
            console.log(this.isEqual(this.possibleMoves[i], newPos));
            if (this.isEqual(this.possibleMoves[i], newPos))
            {
                this.row = newPos.row;
                this.col = newPos.col;
                this.findPossibleMoves(teamPositions, oppPostions);
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

    checkForRefresh(changeBlock, teamPositions, oppPostions)
    {
        for (var i = 0; i < this.possibleMoves.length; i++)
        {
            if (this.isEqual(this.possibleMoves[i], changeBlock))
            {
                this.findPossibleMoves(teamPositions, oppPostions);
                return true;
            }
        }
        for (var i = 0; i < this.blockBlocks; i++)
        {
            if (this.isEqual(this.blockBlocks[i], changeBlock))
            {
                this.findPossibleMoves(teamPositions, oppPostions);
                return true;
            }
        }
        return false;
    }

    checkRecursive (xDirection, yDirection, teamPositions, oppPostions, inputBlock)
    {
        var testBlock = this.addValues(inputBlock, xDirection, yDirection);
        if (!(this.isInBoard(testBlock))) {return true;}
        
        for (var i = 0; i < teamPositions.length; i++)
        {
            if (this.isEqual(testBlock, teamPositions[i]))
            {
                teamPositions.splice(i, 1);
                this.blockBlocks.push(testBlock);
                return true;
            }
        }
        for (var i = 0; i < oppPostions.length; i++)
        {
            if (this.isEqual(testBlock, oppPostions[i]))
            {
                oppPostions.splice(i, 1);
                this.possibleMoves.push(testBlock);
                return true;
            }
        }
        this.possibleMoves.push(testBlock);
        if (this.checkRecursive(xDirection, yDirection, teamPositions, oppPostions, testBlock))
        {return true;}
    }

    checkOnce(xDirection, yDirection, teamPositions, oppPostions, testBlock)
    {
        var testBlock = this.addValues(testBlock, xDirection, yDirection);
        if (!this.isInBoard(testBlock)) return true;

        for (var i = 0; i < teamPositions.length; i++)
        {
            if (this.isEqual(testBlock, teamPositions[i]))
            {
                teamPositions.splice(i, 1);
                this.blockBlocks.push(testBlock);
                return true;
            }
        }
        for (var i = 0; i < oppPostions.length; i++)
        {
            if (this.isEqual(testBlock, oppPostions[i]))
            {
                oppPostions.splice(i, 1);
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
}