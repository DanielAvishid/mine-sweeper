'use strict'

var gMegaIsActive = false
var gMegaIsFirst
var gMegaIsLast
var gMegaLastCell
var gMegaFirstCell
var gMegaIsFinish

// Reveal megaHint Mode selected Area
function getMegaHintAreaReveal(board, firstCell, lastCell) {
    const MegaHintCells = []
    for (var i = firstCell.dataset.i; i <= lastCell.dataset.i; i++) {
        for (var j = firstCell.dataset.j; j <= lastCell.dataset.j; j++) {
            board[i][j].isShown = true
            MegaHintCells.push(board[i][j])
        }
    }
    renderBoard(board)
    return MegaHintCells
}

// onClick megaHint, make gMegaIsActive to start mode
function onClickMegaHint(elBtn) {
    if (gMegaIsFinish) return
    gMegaIsFirst = true
    gMegaIsActive = true
}

// Hide all megaHint cells that was shown
function hideMegaHint(MegaHintCells) {
    for (var i = 0; i < MegaHintCells.length; i++) {
        MegaHintCells[i].isShown = false
    }
}