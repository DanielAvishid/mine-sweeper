'use strict'

var gIsManualM
var gManualMinesCount
var gManual

// Build board for Manual MODE
function buildBoardManual() {
    const board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: true,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board

}

// Hide all cells value on board
function hideAllCells(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            cell.isShown = false
        }
    }
    renderBoard(gBoard)
}

// onClick Manual create board
function onClickManual() {
    onInit()
    gBoard = buildBoardManual()
    renderBoard(gBoard)
    gIsManualM = true
}