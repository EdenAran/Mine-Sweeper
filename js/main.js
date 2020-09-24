'use strict';

const MINE = '💣';
const FLAG = '🏁';

var gBoard = [];
var gMines;
var gLevel = {
    size: 4,
    mines: 2
};
var gGame;
var gTimerInterval;
var gMinesCount;
var gHints = [];
var gHintActive = false;
var gSafeClicksCount;
var gIsManual;
var gManualMinesCount;
var gMoves;
var gMoveId;

function init() {
    if (gTimerInterval) clearInterval(gTimerInterval);
    gIsManual = false;
    gTimerInterval = null;
    gMinesCount = gManualMinesCount = gLevel.mines;
    gMines = [];
    gHints = [];
    gMoves = [];
    gMoveId = 0;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: (gLevel.size === 4) ? 2 : 3
    }
    //Reset the lives
    if (gGame.lives === 2) updateElementInnerText('.lives', '❤️❤️');
    else updateElementInnerText('.lives', '❤️❤️❤️');
    //Reset the smiley
    updateElementInnerText('.smiley', '😊');

    //Reset the timer
    updateElementInnerText('.timer', ('00' + gGame.secsPassed).slice(-3));

    //Reset the mine count
    updateElementInnerText('.mines', ('0' + gMinesCount).slice(-2));

    //Reset the safe click count
    gSafeClicksCount = 3;
    updateElementInnerText('.safe-click span', gSafeClicksCount);

    //Blocks the right-click drop-down menu
    window.oncontextmenu = function () {
        return false;
    };
    gBoard = createBoard();
    renderBoard();
    generateHints();
    initManualBtn();
    gGame.isOn = true;
    gHintActive = false;
}

function cellClicked(ev, elCell) {
    if (!gGame.isOn) return;
    if (!gTimerInterval && ev.button === 0) {
        if (!gIsManual) {
            if (gMines.length === 0) gMines = setMines(elCell);
        }
        else {
            manualMines(elCell);
            return;
        }
        setMinesNegsCount();
        renderBoard();
        runTimer();
    }
    var cellContent;
    var location = getCellLocation(elCell);
    var currCell = gBoard[location.i][location.j];
    var negMinesCount = currCell.minesAroundCount;
    if (currCell.isShown) return;
    //If Hint is active
    if (gHintActive) {
        if (ev.button !== 0 || currCell.isShown) return;
        gGame.isOn = false;
        handleHint(location);
        return;
    }
    if (ev.button === 0) {      //Left click
        if (currCell.isShown || currCell.isMarked) return;
        updateElementInnerText('.smiley', '😲')
        gMoves.push([location, ++gMoveId]);
        gGame.shownCount++;
        currCell.isShown = true;
        if (currCell.isMine) {
            cellContent = MINE;
            gGame.lives--;
            updateElementInnerText('.lives', getHearts(gGame.lives));
            gMinesCount--;
            updateElementInnerText('.mines', ('0' + gMinesCount).slice(-2));
            if (!gGame.lives) endGame(false);
        } else cellContent = negMinesCount;
        if (!cellContent) expendEmptyCells(location.i, location.j);
    } else if (ev.button === 2) {    //Right click
        if (!gTimerInterval) return;
        updateElementInnerText('.smiley', '😲')
        gMoves.push([location, ++gMoveId]);
        switch (elCell.innerText) {
            case '':
                if (gMinesCount === 0) return;
                currCell.isMarked = true;
                gMinesCount--;
                gGame.markedCount++;
                cellContent = FLAG;
                break;
            case FLAG:
                currCell.isMarked = false;
                gMinesCount++;
                gGame.markedCount--;
                cellContent = '';
                break;
            default:
                updateElementInnerText('.smiley', '😊')
                return;
        }
        var elMinesCount = document.querySelector('.mines');
        elMinesCount.innerText = ('0' + gMinesCount).slice(-2);
    }
    renderCell(location, cellContent);
    if (checkWin()) endGame(true);
    if (gGame.isOn) setTimeout(function () {
        updateElementInnerText('.smiley', '😊')
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
        setBestScore();
        elSmiley.innerText = '😎';
        // alert('You have WON!');
    } else {
        elSmiley.innerText = '😭';
        // alert('You have LOST!');
    }
}

function setDifficulty(elBtn) {
    var diff = elBtn.innerText;
    switch (diff) {
        case 'Easy':
            if (gLevel.size === 4) return;
            gLevel.size = 4;
            gLevel.mines = 2;
            break;
        case 'Medium':
            if (gLevel.size === 8) return;
            gLevel.size = 8;
            gLevel.mines = 12;
            break;
        case 'Hard':
            if (gLevel.size === 12) return;
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
            if ((i === iIdx && j === jIdx) || (j < 0 || j > gLevel.size - 1) || currCell.isShown || currCell.isMarked) continue;
            currCell.isShown = true;
            gGame.shownCount++;
            gMoves.push([{i,j}, gMoveId]);
            renderCell({ i, j }, currCell.minesAroundCount);
            if (currCell.minesAroundCount === 0) expendEmptyCells(i, j);
        }
    }
    return;
}


