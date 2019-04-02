class Queen extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead);
        this.type = "q";
        this.points = 9;
        }

    findPossibleMoves(teamPositions, oppPositions, enemyKingPos) {
        super.findPossibleMoves();
        this.checkDiagonal(1, 1, teamPositions, oppPositions, enemyKingPos);
        this.checkDiagonal(-1, -1, teamPositions, oppPositions, enemyKingPos);
        this.checkDiagonal(-1, 1, teamPositions, oppPositions, enemyKingPos);
        this.checkDiagonal(1, -1, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(1, 0, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(-1, 0, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(0, 1, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(0, -1, teamPositions, oppPositions, enemyKingPos);
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPositions, enemyKingPos)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col}, enemyKingPos);
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPositions, enemyKingPos)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col}, enemyKingPos);
    }
}