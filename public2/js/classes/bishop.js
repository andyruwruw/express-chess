
class Bishop extends Piece {
    points = 3;

    constructor (row, col, num, team) {
        super(row, col, num, team);
        }

    findPossibleMoves(boardPositions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        this.checkDiagonal(1, 1);
        this.checkDiagonal(-1, -1);
        this.checkDiagonal(-1, 1);
        this.checkDiagonal(1, -1);
        }

    checkDiagonal(xDirection, yDirection)
    {
        
    }
}