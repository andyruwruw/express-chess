class Pawn extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead, Overload) {
        super(row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead);
        if (team) this.rowDirection = -1;
        else this.rowDirection = 1;
        this.type = "p";
        console.log("SET TYPE: " + this.type);
        this.points = 1;}

    getSendObject()
    {
        var data = super.getSendObject();
        data.rowDirection = this.rowDirection;
        return data;
    }

    checkPromotion()
    {
        if (this.rowDirection < 0 && row == 0)
        {
            return true;
        }
        if (this.rowDirection > 0 && row == 7)
        {
            return true;
        }
        return false;
    }

    findPossibleMoves(teamPositions, oppPositions, enemyKingPos) {
        super.findPossibleMoves();
        this.checkForwardPawn(0, this.rowDirection, teamPositions, oppPositions);
        if ((this.team && this.row == 6) || (!this.team && this.row == 1))
        {
            this.checkForwardPawn(0, this.rowDirection * 2, teamPositions, oppPositions);
        }
        this.checkKillDiag(1, this.rowDirection, teamPositions, oppPositions);
        this.checkKillDiag(-1, this.rowDirection, teamPositions, oppPositions);
    }

    checkForwardPawn(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkOncePawn(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }

    checkKillDiag(xDirection, yDirection, teamPositions, oppPositions) {
        var testBlock = this.addValues({row: this.row, col: this.col}, xDirection, yDirection);
        if (!this.isInBoard(testBlock))return true;

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
	this.blockBlocks.push(testBlock);
        return true;
    }

    checkOncePawn(xDirection, yDirection, teamPositions, oppPositions, currPos)
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
                this.blockBlocks.push(testBlock);
                return true;
            }
        }
        this.possibleMoves.push(testBlock);
        return true;
    }
}