class Rook extends Piece {
    constructor (row, col, num, team) {
        super(row, col, num, team);
        this.points = 5;
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