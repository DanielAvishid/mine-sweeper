'use strict'

var gIsUndoFirstStep
var gUndoState = []
var gUndoLives = []
var gUndoShownCount = []
var gUndoMarkedCount = []

// Create undo state for Lives, Board, gGame.shown&Marked
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

// onClick undo, make the game go to last Step saved (ATM - Lives, Board, gGame.Shown&Marked)
function onClickUndo(elBtn) {
    if (!gGame.isOn || gIsUndoFirstStep) return
    gBoard = gUndoState[gUndoState.length - 1]
    gLives = gUndoLives[gUndoLives.length - 1]
    gGame.shownCount = gUndoShownCount[gUndoShownCount.length - 1]
    gGame.markedCount = gUndoMarkedCount[gUndoMarkedCount.length - 1]

    livesModal()
    renderBoard(gUndoState[gUndoState.length - 1])
    shownAndMarkModal()

    gUndoMarkedCount.splice(gUndoMarkedCount.length - 1, 1)
    gUndoShownCount.splice(gUndoShownCount.length - 1, 1)
    gUndoState.splice(gUndoState.length - 1, 1)
    gUndoLives.splice(gUndoLives.length - 1, 1)
    if (isNotShown(gBoard)) gIsUndoFirstStep = true
}

// Check if all cells in board are not shown
function isNotShown(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            const cell = board[i][j]
            if (cell.isShown) return false
        }
    }
    return true
}
