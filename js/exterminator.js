'use strict'

// onClick Exterminator, use deleteThreeRandMines()
function onClickExterminator(elBtn) {
    if (!gGame.isOn) return
    deleteThreeRandMines(gBoard)
    renderBoard(gBoard)
}

// Remove 3 random Mines from board
function deleteThreeRandMines(board) {
    var minesCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            if (currCell.isMine && !currCell.isShown)
                minesCells.push({ i, j })
        }
    }
    if (minesCells.length === 0) return
    var randIdx = getRandomIntInclusive(0, minesCells.length - 1)
    const randPos1 = minesCells[randIdx]
    board[randPos1.i][randPos1.j].isMine = false
    minesCells.splice(randIdx, 1)

    if (minesCells.length === 0) return
    randIdx = getRandomIntInclusive(0, minesCells.length - 1)
    const randPos2 = minesCells[randIdx]
    board[randPos2.i][randPos2.j].isMine = false
    minesCells.splice(randIdx, 1)

    if (gLevel.MINES <= 2) {
        setMinesNegsCount(board)
        return
    }

    if (minesCells.length === 0) return
    randIdx = getRandomIntInclusive(0, minesCells.length - 1)
    const randPos3 = minesCells[randIdx]
    board[randPos3.i][randPos3.j].isMine = false
    minesCells.splice(randIdx, 1)
    setMinesNegsCount(board)
    return minesCells
}