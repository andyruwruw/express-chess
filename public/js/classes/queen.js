class Queen extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        this.points = 9;
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
    
    checkStraight(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
}