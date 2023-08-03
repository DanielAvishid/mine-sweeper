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

function placeRandomMines(board) {
  for (var i = 0; i < gLevel.MINES; i++) {
    var emptyCells = getEmptyCells(board)
    var ranPosCell = emptyCells[getRandomIntInclusive(0, emptyCells.length - 1)]
    if (!ranPosCell.isMine) board[ranPosCell.i][ranPosCell.j].isMine = true
  }
}

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
  var undoStepBoard = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    undoStepBoard[i] = [];
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
  gStepUndoCounter++
  gLivesCounter++
  return undoStepBoard
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

function renderRecords() {
  const elRecordsBeg = document.querySelector('.records-beginner p')
  elRecordsBeg.innerHTML = `${localStorage.getItem("best-score-beginner")} ${localStorage.getItem("best-score-beginner-name")}`
  const elRecordsMed = document.querySelector('.records-medium p')
  elRecordsMed.innerHTML = `${localStorage.getItem("best-score-medium")} ${localStorage.getItem("best-score-medium-name")}`
  const elRecordsExp = document.querySelector('.records-expert p')
  elRecordsExp.innerHTML = `${localStorage.getItem("best-score-expert")} ${localStorage.getItem("best-score-expert-name")}`
}