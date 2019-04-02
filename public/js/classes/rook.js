class Rook extends Piece {
    constructor (row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead, Overload) {
        super(row, col, num, team, possibleMoves, blockBlocks, pathBlocks, isDead);
        this.type = "r";
        console.log("SET TYPE: " + this.type);
        this.points = 5;}

    getSendObject()
    {
        var data = super.getSendObject();
        return data;
    }

    findPossibleMoves(teamPositions, oppPositions, enemyKingPos) {
        super.findPossibleMoves();
        this.checkStraight(1, 0, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(-1, 0, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(0, 1, teamPositions, oppPositions, enemyKingPos);
        this.checkStraight(0, -1, teamPositions, oppPositions, enemyKingPos);
    }
    
    checkStraight(xDirection, yDirection, teamPositions, oppPositions, enemyKingPos)
    {
        this.checkRecursive(xDirection, yDirection, teamPositions, oppPositions, {row: this.row, col: this.col}, enemyKingPos);
    }
}