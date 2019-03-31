class Queen extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        this.points = 9;
        }

    findPossibleMoves(teamPositions, oppPositions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkDiagonal(1, 1, teamPositions, oppPositions);
        this.checkDiagonal(-1, -1, teamPositions, oppPositions);
        this.checkDiagonal(-1, 1, teamPositions, oppPositions);
        this.checkDiagonal(1, -1, teamPositions, oppPositions);
        this.checkStraight(1, 0, teamPositions, oppPositions);
        this.checkStraight(-1, 0, teamPositions, oppPositions);
        this.checkStraight(0, 1, teamPositions, oppPositions);
        this.checkStraight(0, -1, teamPositions, oppPositions);
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
    
    checkDiagonal(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
}