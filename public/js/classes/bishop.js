class Bishop extends Piece {
    constructor (row, col, num, team) {
        super(row, col, num, team);
        this.points = 3;
        }

    findPossibleMoves(teamPositions, oppPostions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkDiagonal(1, 1, teamPositions, oppPostions);
        this.checkDiagonal(-1, -1, teamPositions, oppPostions);
        this.checkDiagonal(-1, 1, teamPositions, oppPostions);
        this.checkDiagonal(1, -1, teamPositions, oppPostions);
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
}