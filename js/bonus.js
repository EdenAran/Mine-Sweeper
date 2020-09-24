'use strict';

function getHearts(numOfLives) {
    if (gLevel.size === 4) {
        return (numOfLives === 0) ? '🤍🤍' : (numOfLives === 1) ? '❤️🤍' : '❤️❤️';
    }

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

function generateHints() {
    updateElementInnerText('.hints h2', 'Hints')
    var elHints = document.querySelectorAll('.hints span');
    for (var i = 0; i < 3; i++) {
        var hint = {
            id: i + 1,
            isActive: false,
            isUsed: false
        }
        gHints.push(hint)
        elHints[i].innerHTML = '<img width="30px" src="img/hint.png"/>'
    }
}

function handleHintPress(elHint) {
    if (!gTimerInterval) return;
    var currHint = elHint.className.split("-");
    var currHintIdx = currHint[1] - 1;
    currHint = gHints[currHintIdx];
    if (!currHint.isActive) {
        if (gHintActive) return;
        currHint.isActive = true;
        gHintActive = true;
        elHint.innerHTML = '<img width="30px" src="img/hintActive.png"/>'
    } else {
        currHint.isActive = false;
        gHintActive = false;
        elHint.innerHTML = '<img width="30px" src="img/hint.png"/>'

    }
}

function handleHint(location) {
    var iIdx = location.i;
    var jIdx = location.j;
    var hintCount = 3;
    gHintActive = false;
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i > gLevel.size - 1) continue;
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            var currCell = gBoard[i][j];
            if ((j < 0 || j > gLevel.size - 1) || currCell.isShown) continue;
            var currValue = (currCell.isMine) ? MINE : currCell.minesAroundCount;
            renderCell({ i, j }, currValue)
        }
    }
    setTimeout(function () {
        for (var i = iIdx - 1; i <= iIdx + 1; i++) {
            if (i < 0 || i > gLevel.size - 1) continue;
            for (var j = jIdx - 1; j <= jIdx + 1; j++) {
                var currCell = gBoard[i][j];
                if ((j < 0 || j > gLevel.size - 1) || currCell.isShown) continue;
                renderCell({ i, j }, '')
                gGame.isOn = true;
            }
        }
    }, 1000)
    for (var i = 0; i < gHints.length; i++) {
        if (!gHints[i].isActive) continue;
        var elHint = document.querySelector(`.hint-${i + 1}`);
        hintCount--;
        elHint.innerHTML = '';
    }
    if (!hintCount) updateElementInnerText('.hints h2', 'There are no more hints')
    return;
}

function setBestScore() {
    var level = (gLevel.size === 4) ? 'easy' : (gLevel.size === 8) ? 'medium' : 'hard';
    var prevBest = +localStorage.getItem(`${level}`);
    if (!prevBest) {
        prevBest = gGame.secsPassed;
        localStorage.setItem(`${level}`, prevBest);
    }
    var best = (prevBest < gGame.secsPassed) ? prevBest : gGame.secsPassed;
    localStorage.setItem(`${level}`, best);
    updateElementInnerText(`.best-scores .${level}`, best);
}

function resetScores() {
    updateElementInnerText(`.best-scores .easy`, '--');
    updateElementInnerText(`.best-scores .medium`, '--');
    updateElementInnerText(`.best-scores .hard`, '--');
    localStorage.removeItem('easy');
    localStorage.removeItem('medium');
    localStorage.removeItem('hard');
}

function handleSafeClick() {
    if (!gTimerInterval || !gGame.isOn || gHintActive || !gSafeClicksCount) return;
    var safeCells = findSafeCells();
    var idx = getRandomIntInclusive(0, safeCells.length - 1)
    var iIdx = safeCells[idx].i
    var jIdx = safeCells[idx].j
    var elCell = document.querySelector(`.cell-${iIdx}-${jIdx}`)
    elCell.style.backgroundColor = 'orange';
    gGame.isOn = false;
    gSafeClicksCount--;
    updateElementInnerText('.safe-click span', gSafeClicksCount);
    setTimeout(function () {
        elCell.style.backgroundColor = 'lightblue';
        gGame.isOn = true;
    }, 1000)
}


function findSafeCells() {
    var safeCells = [];
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = gBoard[i][j];
            var location = {
                i,
                j
            }
            if (!currCell.isMine && !currCell.isShown) safeCells.push(location);
        }
    }
    return safeCells;
}

function manualClick() {
    if (gTimerInterval) return;
    gIsManual = !gIsManual;
    var elManual = document.querySelector('.manual h4');
    var elMinesCount = document.querySelector('.manual span');
    elMinesCount.innerText = (gManualMinesCount === 1) ? `${gManualMinesCount} mine` : `${gManualMinesCount} mines`;
    if (gIsManual) {
        elManual.style.display = 'block';
    } else {
        elManual.style.display = 'none';
        init();
        return;
    }
}

function manualMines(elCell) {
    if (!gManualMinesCount) return;
    gManualMinesCount--;
    var location = getCellLocation(elCell);
    var currCell = gBoard[location.i][location.j];
    currCell.isMine = true;
    gMines.push(location);
    renderCell(location, MINE)
    var value = (gManualMinesCount === 1) ? `${gManualMinesCount} mine` : `${gManualMinesCount} mines`;
    updateElementInnerText('.manual span', value)
    if (!gManualMinesCount) {
        var elManualBtn = document.querySelector('.manual-btn');
        var elManual = document.querySelector('.manual h4');
        elManualBtn.style.display = 'none';
        elManual.style.display = 'none';
        var elStartBtn = document.querySelector('.manual-start');
        elStartBtn.style.display = 'block';
    }
}

function startManualGame() {
    if (gTimerInterval) return;
    gIsManual = false;
    for (var i = 0; i < gMines.length; i++) {
        renderCell(gMines[i], '');
    }
    var elStartBtn = document.querySelector('.manual-start');
    elStartBtn.style.display = 'none';
}

function initManualBtn() {
    var elManualBtn = document.querySelector('.manual-btn');
    var elManual = document.querySelector('.manual h4');
    var elStartBtn = document.querySelector('.manual-start');
    elManualBtn.style.display = 'block';
    elManual.style.display = 'none';
    elStartBtn.style.display = 'none';
}

function undo() {
    if (!gTimerInterval || !gGame.isOn) return
    for (var i = gMoves.length - 1; i >= 0; i--) {
        if (gMoves[i][1] !== gMoveId) {
            gMoveId--;
            return;
        }
        var location = gMoves.pop()[0];
        var currCell = gBoard[location.i][location.j];
        if (currCell.isShown) gGame.shownCount--;
        if (currCell.isMarked) {
            gGame.markedCount--;
            gMinesCount++;
        }
        if (currCell.isMine && !currCell.isMarked) {
            gGame.lives++;
            gMinesCount++;
        }
        updateElementInnerText('.lives', getHearts(gGame.lives));
        updateElementInnerText('.mines', ('0' + gMinesCount).slice(-2));
        currCell.isShown = false;
        currCell.isMarked = false;
        renderCell(location, '');
    }
}
