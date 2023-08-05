"use strict";

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getEmptyCells(board) {
  var emptyCells = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      const currCell = board[i][j];
      if (!currCell.isMine && !currCell.isShown)
        emptyCells.push({ i, j });
    }
  }
  return emptyCells;
}

// ** DOM
function getClassName(location) {
  const cellClass = 'cell-' + location.i + '-' + location.j
  return cellClass
}

function startTime() {
  var startTime = Date.now()
  gIntervalTime = setInterval(function () {
    var elapsedTime = Date.now() - startTime
    gGame.secsPassed = Math.round(elapsedTime / 1000)
    document.querySelector(".timer").innerHTML = `<span class="timer-span">${gGame.secsPassed}</span>`
  }, 37)
}

function resetGVariables() {
  gMegaIsFinish = false
  gIsManualM = false
  gManualMinesCount = 0
  gGame.markedCount = 0
  gGame.shownCount = 0
  gManualMinesCount = 0
  gManual = false
  gStepUndoCounter = 0
  gLivesCounter = 0
  gIsHint = false
  gGame.isOn = true
  gGame.secsPassed = 0
  gClicks = 0
  gLives = 3
  gSafeClicks = 3
  clearInterval(gIntervalTime)
}

function resetHintButtons() {
  const elHint = document.querySelectorAll('.hint')
  elHint[0].style.backgroundColor = '#efefef'
  elHint[1].style.backgroundColor = '#efefef'
  elHint[2].style.backgroundColor = '#efefef'
}

function createUndoState(board) {
  var undoStepBoard = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    undoStepBoard[i] = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      undoStepBoard[i][j] = {
        minesAroundCount: board[i][j].minesAroundCount,
        isShown: board[i][j].isShown,
        isMine: board[i][j].isMine,
        isMarked: board[i][j].isMarked
      }
    }
  }
  gUndoLives.push(gLives)
  gUndoState.push(undoStepBoard)
  gUndoShownCount.push(gGame.shownCount)
  gUndoMarkedCount.push(gGame.markedCount)
}

function shakeScreen() {
  const elBody = document.querySelector('body')
  elBody.style.animation = 'shake 0.5s'
  elBody.style.animationIterationCount = '1'
  setTimeout(() => {
    elBody.style.animation = ''
    elBody.style.animationIterationCount = ''
  }, 500);
}

function revealCell(board, rowIdx, colIdx) {
  // Check if the cell is valid and not already revealed
  if (
    rowIdx < 0 ||
    colIdx < 0 ||
    rowIdx >= board.length ||
    colIdx >= board[0].length ||
    board[rowIdx][colIdx].isShown
  ) {
    return;
  }

  // Mark the cell as revealed
  board[rowIdx][colIdx].isShown = true;

  // If the cell contains a mine, return (no need to reveal further)
  if (board[rowIdx][colIdx].isMine) {
    return;
  }

  // If the cell is not a mine and has no neighboring mines, reveal its neighbors
  if (countNeighboringMines(board, rowIdx, colIdx) === 0) {
    // Recursive calls to reveal all neighbors
    revealCell(board, rowIdx - 1, colIdx - 1)
    revealCell(board, rowIdx - 1, colIdx)
    revealCell(board, rowIdx - 1, colIdx + 1)
    revealCell(board, rowIdx, colIdx - 1)
    revealCell(board, rowIdx, colIdx + 1)
    revealCell(board, rowIdx + 1, colIdx - 1)
    revealCell(board, rowIdx + 1, colIdx)
    revealCell(board, rowIdx + 1, colIdx + 1)
  }
}

function countNeighboringMines(board, rowIdx, colIdx) {
  var count = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i >= 0 && i < board.length && j >= 0 && j < board[0].length) {
        if (board[i][j].isMine) {
          count++;
        }
      }
    }
  }
  return count;
}





