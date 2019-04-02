class Bishop extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead);
        this.type = "b";
        this.points = 3;
        }

    findPossibleMoves(teamPositions, oppPositions, enemyKingPos) {
        super.findPossibleMoves();
        this.checkDiagonal(1, 1, teamPositions, oppPositions, enemyKingPos);
        this.checkDiagonal(-1, -1, teamPositions, oppPositions, enemyKingPos);
        this.checkDiagonal(-1, 1, teamPositions, oppPositions, enemyKingPos);
        this.checkDiagonal(1, -1, teamPositions, oppPositions, enemyKingPos);
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPositions, enemyKingPos)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col}, enemyKingPos);
    }
}