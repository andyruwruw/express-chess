class King extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead, hasMoved) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        this.hasMoved = hasMoved;
        this.points = 100;
        }

    getSendObject()
    {
        var data = super.getSendObject();
        data.hasMoved = this.hasMoved;
        return data;
    }

    findPossibleMoves(teamPositions, oppPostions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkDiagonal(1, 1, teamPositions, oppPostions);
        this.checkDiagonal(-1, -1, teamPositions, oppPostions);
        this.checkDiagonal(-1, 1, teamPositions, oppPostions);
        this.checkDiagonal(1, -1, teamPositions, oppPostions);
        this.checkStraight(1, 0, teamPositions, oppPostions);
        this.checkStraight(-1, 0, teamPositions, oppPostions);
        this.checkStraight(0, 1, teamPositions, oppPostions);
        this.checkStraight(0, -1, teamPositions, oppPostions);
    }

    isKingSafe(oppPossibleMoves){
    for (var i = 0; i < oppPossibleMoves.length; i++){
        if (this.isEqual({row: this.row, col: this.col}, oppPossibleMoves[i])) return false;}
        return true;
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
}