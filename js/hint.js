'use strict'

var gIsHint
var gElHintBtn

// onClick Hint, make gIsHint = true so next Click on cell will reveal
function onClickHint(elHintBtn) {
    if (!gGame.isOn || gClicks === 0) return
    if (elHintBtn.style.backgroundColor === 'gray') return
    gElHintBtn = elHintBtn
    elHintBtn.style.backgroundColor = 'yellow'
    gIsHint = true
}

// Build board for reveal & render on DOM
function hintAreaReveal(board, rowIdx, colIdx,) {
    const boardForReveal = []
    for (var i = 0; i < board.length; i++) {
        boardForReveal[i] = []
        for (var j = 0; j < board.length; j++) {
            boardForReveal[i][j] = {
                minesAroundCount: board[i][j].minesAroundCount,
                isShown: board[i][j].isShown,
                isMine: board[i][j].isMine,
                isMarked: board[i][j].isMarked
            }
        }
    }
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= boardForReveal.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= boardForReveal[0].length) continue
            var currCell = boardForReveal[i][j]
            currCell.isShown = true
        }
    }
    renderBoard(boardForReveal)
}

// Reset design for Hint Buttons
function resetHintButtons() {
    const elHint = document.querySelectorAll('.hint')
    elHint[0].style.backgroundColor = '#efefef'
    elHint[1].style.backgroundColor = '#efefef'
    elHint[2].style.backgroundColor = '#efefef'
}