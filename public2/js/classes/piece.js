
class Piece {
    row;
    col;
    team;
    enemy;
    num;
    possibleMoves = [];
    blockBlocks = [];
    points = 0;
    isDead = 0;

    constructor (row, col, num, team) {
        this.row = row;
        this.col = col;
        this.team = team;
        this.enemy = !team;
        this.num = num;
        this.findPossibleMoves(whitePositions, blackPositions);}

    get getPositionObject() {
        var position = {row: this.row, col: this.col};
        return position;}

    get getPossibleMoves() {
        return this.possibleMoves;}

    get blockBlocks() {
        return this.blockBlocks;}

    move(newPos) { // Checks if possibleMoves includes new position, then sends it there. Refinds possoible moves
        for (var i = 0; i < possibleMoves.length; i++)
        {
            if (this.isEqual(this.possibleMoves[i], newPos))
            {
                this.row = newPos.row;
                this.col = newPos.col;
                this.findPossibleMoves();
                return true;}
        }
        return false;
    }

    kill() { // Kills the piece, placing it at 9-9 and Returning its point worth.
        this.row = 100;
        this.col = 100;
        this.isDead = 1;
        return this.points;}

    getStatus() // false if dead
    {
        if (this.isDead) return false;
        return true;
    }

    checkForRefresh(changeBlock)
    {
        for (i = 0; i < this.possibleMoves.length; i++)
        {
            if (this.isEqual(this.possibleMoves[i], changeBlock))
            {
                this.findPossibleMoves();
                return true;
            }
        }
        for (i = 0; i < this.blockBlocks; i++)
        {
            if (this.isEqual(this.blockBlocks[i], changeBlock))
            {
                this.findPossibleMoves();
                return true;
            }
        }
        return false;
    }
    isEqual(a, b){
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
        if (aProps.length != bProps.length) return false;
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            if (a[propName] !== b[propName]) return false;}
        return true;
    }
    setData(a, b){
        var aProps = Object.getOwnPropertyNames(a);
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            a[propName] = b[propName]}
    }
    isInBoard(a){
        if (a.row < 0 || a.row > 7 && a.col < 0 && a.col > 7) return false;
        return true;
    }
}


