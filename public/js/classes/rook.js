class Rook extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        this.points = 5;
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
        this.checkStraight(1, 0, teamPositions, oppPostions);
        this.checkStraight(-1, 0, teamPositions, oppPostions);
        this.checkStraight(0, 1, teamPositions, oppPostions);
        this.checkStraight(0, -1, teamPositions, oppPostions);
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
}