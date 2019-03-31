class Bishop extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        this.points = 3;
        }

    findPossibleMoves(teamPositions, oppPositions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkDiagonal(1, 1, teamPositions, oppPositions);
        this.checkDiagonal(-1, -1, teamPositions, oppPositions);
        this.checkDiagonal(-1, 1, teamPositions, oppPositions);
        this.checkDiagonal(1, -1, teamPositions, oppPositions);
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
}