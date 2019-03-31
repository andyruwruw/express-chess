
class Pawn extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead, hasMoved) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        if (team) this.rowDirection = -1;
        else this.rowDirection = 1;
        this.hasMoved = hasMoved;
        this.points = 1;}

    getSendObject()
    {
        var data = super.getSendObject();
        data.hasMoved = this.hasMoved;
        data.rowDirection = this.rowDirection;
        return data;
    }

    move(newPos, teamPositions, oppPostions) { // Checks if possibleMoves includes new position, then sends it there. Refinds possoible moves
        if (super.move(newPos, teamPositions, oppPostions)){
        this.hasMoved = 1; return true;}
        else return false;
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

    findPossibleMoves(teamPositions, oppPostions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkForward(0, this.rowDirection, teamPositions, oppPostions);
        if (!this.hasMoved)
        {
            this.checkForward(0, this.rowDirection * 2, teamPositions, oppPostions);
        }
        this.checkKillDiag(1, this.rowDirection, teamPositions, oppPostions);
        this.checkKillDiag(-1, this.rowDirection, teamPositions, oppPostions);
    }

    checkForward(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }

    checkKillDiag(xDirection, yDirection, teamPositions, oppPostions) {
        var testBlock = this.addValues({row: this.row, col: this.col}, xDirection, yDirection);
        if (!this.isInBoard(testBlock))return true;

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
                oppPostions.splice(position, 1);
                this.possibleMoves.push(testBlock);
                return true;
            }
        }  
        return true;
    }
}