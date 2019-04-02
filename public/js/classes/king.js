class King extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead, hasMoved) {
        super(row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead);
        this.type = "k";
        this.hasMoved = hasMoved;
        this.points = 100;
        }

    getSendObject()
    {
        var data = super.getSendObject();
        data.hasMoved = this.hasMoved;
        return data;
    }

    findPossibleMoves(teamPositions, oppPositions, enemyKingPos) {
        super.findPossibleMoves();
        this.checkDiagonal(1, 1, teamPositions, oppPositions);
        this.checkDiagonal(-1, -1, teamPositions, oppPositions);
        this.checkDiagonal(-1, 1, teamPositions, oppPositions);
        this.checkDiagonal(1, -1, teamPositions, oppPositions);
        this.checkStraight(1, 0, teamPositions, oppPositions);
        this.checkStraight(-1, 0, teamPositions, oppPositions);
        this.checkStraight(0, 1, teamPositions, oppPositions);
        this.checkStraight(0, -1, teamPositions, oppPositions);
        for (var i = 0; i < this.possibleMoves.length; i++)
        {
            console.log("King can move: " + this.possibleMoves[i].row + " " + this.possibleMoves[i].col);
        }
    }

    removeUnsafeMoves(opponentBlockedMoves)
    {
        var newPossible = [];
        for (var j = 0; j < this.possibleMoves.length; j++)
        {
            var blocked = false;
            for (var i = 0; i < opponentBlockedMoves.length; i++)
            {
                if ((this.isEqual(this.possibleMoves[j], opponentBlockedMoves[i])))
                {
                    blocked = true;
                    break;
                }
            }
            if (!blocked)
            {
                newPossible.push(this.possibleMoves[j]);
            }
        }
        this.possibleMoves = newPossible;
    }

    isKingSafe(oppPossibleMoves){
    for (var i = 0; i < oppPossibleMoves.length; i++){
        if (this.isEqual({row: this.row, col: this.col}, oppPossibleMoves[i])) return false;}
        {console.log("IN CHECK");
        return true;}
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
}