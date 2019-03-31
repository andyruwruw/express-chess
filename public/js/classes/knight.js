class Knight extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, isDead) {
        super(row, col, num, team, possibleMoves, blockBlocks, isDead);
        this.points = 3;
        }

    findPossibleMoves(teamPositions, oppPositions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkKnightL(1, 2, teamPositions, oppPositions);
        this.checkKnightL(2, 1, teamPositions, oppPositions);
        this.checkKnightL(2, -1, teamPositions, oppPositions);
        this.checkKnightL(1, -2, teamPositions, oppPositions);
        this.checkKnightL(-1, -2, teamPositions, oppPositions);
        this.checkKnightL(-2, -1, teamPositions, oppPositions);
        this.checkKnightL(-2, 1, teamPositions, oppPositions);
        this.checkKnightL(-1, 2, teamPositions, oppPositions);
    }

    checkKnightL(xDirection, yDirection, teamPositions, oppPositions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col});
    }
}