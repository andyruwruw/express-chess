
class Pawn extends Piece {
    rowDirection;
    hasMoved = 0;
    points = 1;

    constructor (row, col, num, team) {
        super(row, col, num, team);
        if (!team) this.rowDirection = -1;}

    findPossibleMoves(boardPositions) {
        this.possibleMoves = [];
        this.blockBlocks = [];
        if (!this.hasMoved) this.canJumpTwo();
        this.canMoveOne();
        this.canKillDiag(1);
        this.canKillDiag(-1);}

    canMoveOne(boardPositions) {
        var testBlock = {row: this.row + this.rowDirection, col: this.col};
        if (boardPositions.includes(testBlock)) this.blockBlocks.push(testBlock);
        else this.possibleMoves.push(testBlock);}

    canKillDiag(colDirection, boardPositions) {
        var testBlock = {row: this.row + this.rowDirection, col: this.col + colDirection};
        if (boardPositions.includes(testBlock))
           
        this.possibleMoves.push(testBlock);
        else this.possibleMoves.push(testBlock)
        {
            if (board[testBlock.row][testBlock.col] != Empty &&
                board[testBlock.row][testBlock.col].team != this.team)
            {
                this.possibleMoves.push(testBlock);
            } 
        }
    }
    
    canJumpTwo(board) {

    }
}