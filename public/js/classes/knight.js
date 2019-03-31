
class Knight extends Piece {
    constructor (row, col, num, team) {
        super(row, col, num, team);
        this.points = 3;
        }

    findPossibleMoves(teamPositions, oppPostions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkKnightL(1, 2, teamPositions, oppPostions);
        this.checkKnightL(2, 1, teamPositions, oppPostions);
        this.checkKnightL(2, -1, teamPositions, oppPostions);
        this.checkKnightL(1, -2, teamPositions, oppPostions);
        this.checkKnightL(-1, -2, teamPositions, oppPostions);
        this.checkKnightL(-2, -1, teamPositions, oppPostions);
        this.checkKnightL(-2, 1, teamPositions, oppPostions);
        this.checkKnightL(-1, 2, teamPositions, oppPostions);
    }

    checkKnightL(xDirection, yDirection, teamPositions, oppPostions)
    {
        this.checkOnce(xDirection, yDirection, teamPositions, oppPostions, {row: this.row, col: this.col});
    }
}