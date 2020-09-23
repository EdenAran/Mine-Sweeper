function renderCell(location, value) {
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getEmptyCells(board) {
  var emptyCells = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var location = {
        i,
        j
      }
      if (board[i][j] === '') emptyCells.push(location);
    }
  }
  return emptyCells;
}

function updateElementInnerText(className, value){
  var elElement = document.querySelector(`.${className}`);
  elElement.innerText = value;
}