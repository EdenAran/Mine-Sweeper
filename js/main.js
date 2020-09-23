'use strict'

// Pieces Types
var KING_WHITE = '♔';
var QUEEN_WHITE = '♕';
var ROOK_WHITE = '♖';
var BISHOP_WHITE = '♗';
var KNIGHT_WHITE = '♘';
var PAWN_WHITE = '♙';
var KING_BLACK = '♚';
var QUEEN_BLACK = '♛';
var ROOK_BLACK = '♜';
var BISHOP_BLACK = '♝';
var KNIGHT_BLACK = '♞';
var PAWN_BLACK = '♟';

// The Chess Board
var gBoard;
var gSelectedElCell = null;

function restartGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < 8; i++) {
        board[i] = [];
        for (var j = 0; j < 8; j++) {
            if (i === 1) board[i][j] = PAWN_BLACK;
            else if (i === 6) board[i][j] = PAWN_WHITE;
            else board[i][j] = '';
        }
    }
    board[0][0] = board[0][7] = ROOK_BLACK;
    board[0][1] = board[0][6] = KNIGHT_BLACK;
    board[0][2] = board[0][5] = BISHOP_BLACK;
    board[0][3] = KING_BLACK;
    board[0][4] = QUEEN_BLACK;

    board[7][0] = board[7][7] = ROOK_WHITE;
    board[7][1] = board[7][6] = KNIGHT_WHITE;
    board[7][2] = board[7][5] = BISHOP_WHITE;
    board[7][3] = KING_WHITE;
    board[7][4] = QUEEN_WHITE;
    console.table(board);
    return board;

}

function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        var row = board[i];
        strHtml += '<tr>';
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            var className = ((i + j + 1) % 2 === 0) ? 'white' : 'black';
            var tdId = `cell-${i}-${j}`;
            strHtml += `<td id="${tdId}" onclick="cellClicked(this)" class="${className}">`
            strHtml += cell;
            strHtml += '</td>';
        }
        strHtml += '</tr>';
    }
    var elMat = document.querySelector('.game-board');
    elMat.innerHTML = strHtml;
}


function cellClicked(elCell) {

    if (elCell.classList.contains('mark')) {
        movePiece(gSelectedElCell, elCell);
        return;
    }
    cleanBoard();

    elCell.classList.add('selected');
    gSelectedElCell = elCell;

    // console.log('elCell.id: ', elCell.id);
    var cellCoord = getCellCoord(elCell.id); // {i:2, j:3}
    var piece = gBoard[cellCoord.i][cellCoord.j];

    var possibleCoords = [];
    switch (piece) {
        case ROOK_BLACK:
        case ROOK_WHITE:
            possibleCoords = getAllPossibleCoordsRook(cellCoord);
            break;
        case BISHOP_BLACK:
        case BISHOP_WHITE:
            possibleCoords = getAllPossibleCoordsBishop(cellCoord);
            break;
        case KNIGHT_BLACK:
        case KNIGHT_WHITE:
            possibleCoords = getAllPossibleCoordsKnight(cellCoord);
            break;
        case PAWN_BLACK:
        case PAWN_WHITE:
            possibleCoords = getAllPossibleCoordsPawn(cellCoord, piece === PAWN_WHITE);
            break;

    }
    markCells(possibleCoords);
}

function movePiece(elFromCell, elToCell) {
    var fromCoord = getCellCoord(elFromCell.id); // {i:2, j:3}
    var toCoord = getCellCoord(elToCell.id); // {i:2, j:3}

    // Update the model!
    // console.table(gBoard)
    var piece = gBoard[fromCoord.i][fromCoord.j];
    gBoard[fromCoord.i][fromCoord.j] = ''
    gBoard[toCoord.i][toCoord.j] = piece
    // console.table(gBoard)

    // Update the DOM
    renderBoard(gBoard)
}

function markCells(coords) { // [{i:2,j:3}]
    for (var i = 0; i < coords.length; i++) {
        var currCoord = coords[i];
        var tdId = `cell-${currCoord.i}-${currCoord.j}`;
        var elCell = document.querySelector(`#${tdId}`);
        elCell.classList.add('mark');
    }
}

// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-');
    var coord = {
        i: +parts[1],
        j: +parts[2],
    };
    // var coord = {};
    // coord.i = +parts[1];
    // coord.j = +parts[2];
    return coord;
}



function cleanBoard() {
    var elTds = document.querySelectorAll('.mark, .selected');
    for (var i = 0; i < elTds.length; i++) {
        elTds[i].classList.remove('mark', 'selected');
    }
}

function getSelector(coord) {
    return '#cell-' + coord.i + '-' + coord.j
}

function isEmptyCell(coord) {
    return gBoard[coord.i][coord.j] === ''
}


function getAllPossibleCoordsPawn(pieceCoord, isWhite) {
    var res = []; // [{i:2, j:3}]
    var diff = isWhite ? -1 : 1;
    var coord = {
        i: pieceCoord.i + diff,
        j: pieceCoord.j
    }
    if (!isEmptyCell(coord)) return res
    res.push(coord);
    if (isWhite && pieceCoord.i === 6 || !isWhite && pieceCoord.i === 1) {
        var secondStep = {
            i: coord.i + diff,
            j: coord.j
        }
        if (isEmptyCell(secondStep)) res.push(secondStep);
    }
    console.log(res)
    return res;
}



function getAllPossibleCoordsRook(pieceCoord) {
    var res = [];
    //right
    for (var colIdx = pieceCoord.j + 1; colIdx < 8; colIdx++) {
        var coord = { i: pieceCoord.i, j: colIdx };
        if (!isEmptyCell(coord)) break;
        res.push(coord);
    }
    //left
    for (var colIdx = pieceCoord.j - 1; colIdx >= 0; colIdx--) {
        var coord = { i: pieceCoord.i, j: colIdx };
        if (!isEmptyCell(coord)) break;
        res.push(coord);
    }
    //up
    for (var rowIdx = pieceCoord.i - 1; rowIdx >= 0; rowIdx--) {
        var coord = { i: rowIdx, j: pieceCoord.j };
        if (!isEmptyCell(coord)) break;
        res.push(coord);
    }
    //down
    for (var rowIdx = pieceCoord.i + 1; rowIdx < 8; rowIdx++) {
        var coord = { i: rowIdx, j: pieceCoord.j };
        if (!isEmptyCell(coord)) break;
        res.push(coord);
    }
    return res;
}

function getAllPossibleCoordsBishop(pieceCoord) { // {i:2, j:3}
    var res = [];
    // upper right
    var rowIdx = pieceCoord.i - 1;
    for (var colIdx = pieceCoord.j + 1; rowIdx >= 0 && colIdx < 8; colIdx++) {
        var coord = { i: rowIdx--, j: colIdx };
        if (!isEmptyCell(coord)) break;
        res.push(coord);
    }

    // upper left
    rowIdx = pieceCoord.i - 1;
    for (var colIdx = pieceCoord.j - 1; rowIdx >= 0 && colIdx >= 0; colIdx--) {
        var coord = { i: rowIdx--, j: colIdx };
        if (!isEmptyCell(coord)) break;
        res.push(coord);
    }

    // lower left
    rowIdx = pieceCoord.i + 1;
    for (var colIdx = pieceCoord.j - 1; rowIdx < 8 && colIdx >= 0; colIdx--) {
        var coord = { i: rowIdx++, j: colIdx };
        if (!isEmptyCell(coord)) break;
        res.push(coord);
    }

    // lower right
    rowIdx = pieceCoord.i + 1;
    for (var colIdx = pieceCoord.j + 1; rowIdx < 8 && colIdx < 8; colIdx++) {
        var coord = { i: rowIdx++, j: colIdx };
        if (!isEmptyCell(coord)) break;
        res.push(coord);
    }
    return res;
}

function getAllPossibleCoordsKnight(pieceCoord) {
    var res = [];

    return res;
}
