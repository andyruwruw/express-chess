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

    findPossibleMoves(teamPositions, oppPositions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkStraight(1, 0, teamPositions, oppPositions);
        this.checkStraight(-1, 0, teamPositions, oppPositions);
        this.checkStraight(0, 1, teamPositions, oppPositions);
        this.checkStraight(0, -1, teamPositions, oppPositions);
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
}