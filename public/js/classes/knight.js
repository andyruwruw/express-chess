class Knight extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead, Overload) {
        super(row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead);
        this.type = "n";
        console.log("SET TYPE: " + this.type);
        this.points = 3;
        }

    findPossibleMoves(teamPositions, oppPositions, enemyKingPos) {
        super.findPossibleMoves();
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