'use strict';

const MINE = '💣';
const FLAG = '🏁';

var gBoard = [];
var gMines = [];
var gLevel = {
    size: 4,
    mines: 2
};
var gGame;
var gTimerInterval;
var gFlagNum;
var gHint = {
    num: 3,
    isactive: false
}

function init() {
    if (gTimerInterval) clearInterval(gTimerInterval);
    gTimerInterval = null;
    gFlagNum = gLevel.mines;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    }
    //Reset the lives
    updateElementInnerText('lives', '❤️❤️❤️');
    //Reset the smiley
    updateElementInnerText('smiley', '😊');

    //Reset the timer
    updateElementInnerText('timer', ('00' + gGame.secsPassed).slice(-3));

    //Reset the mine count
    updateElementInnerText('mines', ('0' + gFlagNum).slice(-2));

    //Blocks the right-click drop-down menu
    window.oncontextmenu = function () {
        return false;
    };
    gBoard = createBoard();
    renderBoard();
    gGame.isOn = true;
}

function cellClicked(ev, elCell) {
    if (!gGame.isOn) return;
    if (!gTimerInterval && ev.button === 0) {
        gMines = setMines(elCell);
        setMinesNegsCount();
        renderBoard();
        runTimer();
    }
    var cellContent
    var location = getCellLocation(elCell);
    var currCell = gBoard[location.i][location.j];
    var negMinesCount = currCell.minesAroundCount;
    if (ev.button === 0) {      //Left click
        if (currCell.isShown) return;
        updateElementInnerText('smiley', '😲')
        gGame.shownCount++;
        currCell.isShown = true;
        if (currCell.isMine) {
            cellContent = MINE;
            gGame.lives--;
            updateElementInnerText('lives', getHearts(gGame.lives));
            if (!gGame.lives) endGame(false);
        } else cellContent = negMinesCount;
        if (!cellContent) expendEmptyCells(location.i, location.j);
    } else if (ev.button === 2) {    //Right click
        if (!gTimerInterval) return;
        updateElementInnerText('smiley', '😲')
        switch (elCell.innerText) {
            case '':
                gFlagNum--;
                gGame.markedCount++;
                cellContent = FLAG;
                break;
            case FLAG:
                gFlagNum++;
                gGame.markedCount--;
                cellContent = '';
                break;
            default:
                updateElementInnerText('smiley', '😊')
                return;
        }
        var elMinesCount = document.querySelector('.mines');
        elMinesCount.innerText = ('0' + gFlagNum).slice(-2);
    }
    renderCell(location, cellContent);
    if (checkWin()) endGame(true);
    if (gGame.isOn) setTimeout(function () {
        updateElementInnerText('smiley', '😊')
    }, 200);
}

function getCellLocation(elCell) {
    var classElements = elCell.getAttribute('class').split('-');
    return { i: +classElements[1], j: +classElements[2] }
}

function runTimer() {
    var elTimer = document.querySelector('.timer');
    gTimerInterval = setInterval(function () {
        gGame.secsPassed++;
        elTimer.innerText = ('00' + gGame.secsPassed).slice(-3);
    }, 1000)
}

function checkWin() {
    return (gGame.shownCount + gGame.markedCount === gLevel.size ** 2);
}

function endGame(win) {
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    var elSmiley = document.querySelector('.smiley')
    if (win) {
        elSmiley.innerText = '😎';
        alert('You have WON!');
    } else {
        elSmiley.innerText = '😭';
        alert('You have LOST!');
    }
}

function setDifficulty(elBtn) {
    var diff = elBtn.innerText;
    switch (diff) {
        case 'Easy':
            gLevel.size = 4;
            gLevel.mines = 2;
            break;
        case 'Medium':
            gLevel.size = 8;
            gLevel.mines = 12;
            break;
        case 'Hard':
            gLevel.size = 12;
            gLevel.mines = 30;
            break;
    }
    init();
}

function expendEmptyCells(iIdx, jIdx) {
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i > gLevel.size - 1) continue;
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            var currCell = gBoard[i][j];
            if ((i === iIdx && j === jIdx) || (j < 0 || j > gLevel.size - 1) || currCell.isShown) continue;
            currCell.isShown = true;
            gGame.shownCount++;
            renderCell({ i, j }, currCell.minesAroundCount);
            if (currCell.minesAroundCount === 0) expendEmptyCells(i, j);
        }
    }
    return;
}

function getHearts(numOfLives) {
    switch (numOfLives) {
        case 3:
            return '❤️❤️❤️'
        case 2:
            return '❤️❤️🤍'
        case 1:
            return '❤️🤍🤍'
        case 0:
            return '🤍🤍🤍'
        default:
            break;
    }
}