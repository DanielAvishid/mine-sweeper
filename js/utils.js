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

function shakeScreen() {
  const elBody = document.querySelector('body')
  elBody.style.animation = 'shake 0.5s'
  elBody.style.animationIterationCount = '1'
  setTimeout(() => {
    elBody.style.animation = ''
    elBody.style.animationIterationCount = ''
  }, 500);
}

function countNegsMines(board, rowIdx, colIdx) {
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