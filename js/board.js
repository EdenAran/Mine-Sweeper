function renderBoard() {
    var strHTML = '<table>';
    var innerText = '';
    for (var i = 0; i < gLevel.size; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gLevel.size; j++) {
            var cellClass = `cell cell-${i}-${j}`;
            var currCell = gBoard[i][j];
            if (currCell.isShown) innerText = (currCell.isMine) ? MINE : currCell.minesAroundCount;
            strHTML += `<td class="${cellClass}" onmousedown="cellClicked(event, this)"> `
            strHTML += `${innerText}</td>`
        }
        strHTML += '</tr>\n'
    }
    strHTML += '</table>'
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function createBoard() {
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board;
}

function setMines(elCell) {
    var mines = [];
    var location = getCellLocation(elCell);
    var iIdx, jIdx;
    for (var i = 0; i < gLevel.mines; i++) {
        iIdx = getRandomIntInclusive(0, gLevel.size - 1);
        jIdx = getRandomIntInclusive(0, gLevel.size - 1);
        console.log(iIdx,jIdx)
        if ((location.i === iIdx && location.j === jIdx) ||
            gBoard[iIdx][jIdx].isMine) {
            i--;
            continue;
        }
        var currCell = gBoard[iIdx][jIdx];
        currCell.isMine = true;
        var currMine = { i: iIdx, j: jIdx };
        gMines.push(currMine);
    }
    return mines;
}

function getMinesNegsCount(iIdx, jIdx) {
    var minesCount = 0;
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i > gLevel.size - 1) continue;
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if ((i === iIdx && j === jIdx) || (j < 0 || j > gLevel.size - 1)) continue;
            if (gBoard[i][j].isMine) minesCount++;
        }
    }
    return minesCount;
}

function setMinesNegsCount() {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = gBoard[i][j];
            var minesCount = getMinesNegsCount(i, j);
            currCell.minesAroundCount = minesCount;
        }
    }
}