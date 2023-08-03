'use strict'

const FLAG = '🚩'
const MINE = '💣'
const EMPTY = ''
const SAFE_CLICK = '✅'

var gBoard
var gClicks
var gIntervalTime
var gLives
var gIsHint
var gElHintBtn
var gSafeClicks
var gUndoState = []
var gUndoLives = []
var gLivesCounter
var gStepUndoCounter
var gManualMinesCount
var gManual

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

// Restart the Game
function onInit() {
    resetGVariables()

    gBoard = buildBoard()
    renderBoard(gBoard)

    livesModal()
    resetHintButtons()
    document.querySelector('.safe-click').innerText = 'Safe Click ✅'
    document.querySelector('.timer').innerHTML = `<span class="timer-span">${gGame.secsPassed}</span>`
    document.querySelector('.smiley').innerText = '😃'
    document.querySelector('.modal').classList.add('hidden')
}

// Build empty Model board
function buildBoard() {
    const board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isExplored: false
            }
        }
    }
    return board
}

// Set each cell.minesAroundCount
function setMinesNegsCount(board) {
    var count = 0
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            for (var q = i - 1; q <= i + 1; q++) {
                if (q < 0 || q >= board.length) continue;
                for (var p = j - 1; p <= j + 1; p++) {
                    if (q === i && p === j) continue;
                    if (p < 0 || p >= board[0].length) continue;
                    // console.log("board[i][j]", board[q][p]);
                    var currCell = board[q][p];
                    if (currCell.isMine) {
                        count++;
                    }
                }
            }
            cell.minesAroundCount = count
            count = 0
        }
    }
}

// Render the model board to DOM
function renderBoard(board) {
    var strHTML = ""
    var numClass
    var value
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr class="board-row">`
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            if (cell.isShown) {
                if (cell.isMine) value = MINE
                else if (cell.minesAroundCount) {
                    value = cell.minesAroundCount
                    if (cell.minesAroundCount === 1) numClass = 'one'
                    else if (cell.minesAroundCount === 2) numClass = 'two'
                    else if (cell.minesAroundCount === 3) numClass = 'three'
                    else if (cell.minesAroundCount === 4) numClass = 'four'
                    else if (cell.minesAroundCount === 5) numClass = 'five'
                    else if (cell.minesAroundCount === 6) numClass = 'six'
                    else if (cell.minesAroundCount === 7) numClass = 'seven'
                    else if (cell.minesAroundCount === 8) numClass = 'eight'
                } else if (cell.minesAroundCount === 0) value = EMPTY
            } else {
                if (cell.isMarked) value = FLAG
                else value = EMPTY
            }
            var cellClass = getClassName({ i, j })
            var hiddenCell = (cell.isShown) ? '' : 'hidden-cell'
            strHTML += `<td data-i="${i}" data-j="${j}"
            class="cell ${numClass} ${hiddenCell} ${cellClass}"
            onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this)">
            ${value}
            </td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elCells = document.querySelector(".board-cells")
    elCells.innerHTML = strHTML
}

// Check all variations for left-clicking a cell
function onCellClicked(elCell, i, j) {
    console.log(elCell)
    const currCell = gBoard[i][j]
    if (!gGame.isOn) return
    if (currCell.isMarked) return
    if (gStepUndoCounter === 0) onInit()
    // if (gClicks === 1) gClicks = 2
    if (gIsHint) {
        hintAreaReveal(gBoard, i, j)
        setTimeout(renderBoard, 1000, gBoard)
        gIsHint = false
        gElHintBtn.style.backgroundColor = 'gray'
        return
    }

    createUndoState(gBoard)

    if (gClicks === 0 && !currCell.isMarked) {
        startTime()
        currCell.isShown = true
        renderCell({ i, j }, EMPTY)
        expandShownOneGen(gBoard, i, j)
        placeRandomMines(gBoard)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
        gClicks = 2
        return
    }
    if (currCell.isMine) {
        if (currCell.isShown) return
        else {
            gLives--
            currCell.isShown = true
            renderCell({ i, j }, MINE)
            shakeScreen()
            livesModal()
            if (gLives === 0) {
                gameOverModal()
                return
            }
        }
    }
    if (currCell.minesAroundCount === 0) {
        expandShownOneGen(gBoard, i, j)
    } else if (currCell.minesAroundCount !== 0) {
        currCell.isShown = true
    }
    renderBoard(gBoard)
    if (checkGameOver()) victoryModal()
}

// expandShown 1st generation
function expandShownOneGen(board, rowIdx, colIdx,) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMarked || currCell.isMine) continue
            currCell.isShown = true
        }
    }
}

// expandShown recursion **Not Working**
function expandShown(board, elCell1, rowIdx, colIdx) {
}

// Build board for reveal and render on DOM
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

// Check all variations for right-clicking a cell
function onCellMarked(elCell) {
    window.addEventListener("contextmenu", e => e.preventDefault())
    if (!gGame.isOn) return
    const cellPos = elCell.dataset
    const currCell = gBoard[+elCell.dataset.i][+elCell.dataset.j]
    if (!currCell.isShown) {
        if (currCell.isMarked) {
            currCell.isMarked = false
            renderCell(cellPos, EMPTY)
            if (checkGameOver()) victoryModal()
            return
        } else currCell.isMarked = true
        renderCell(cellPos, FLAG)
    }
    if (checkGameOver()) victoryModal()
}

// Check victory
function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine && cell.isShown) continue
            if (cell.isMine && cell.isMarked) continue
            if (!cell.isMine && cell.isShown) continue
            return false
        }
    }
    return true
}

// onClickSafe change btn text and use markSafeClick()
function onClickSafe(elBtn) {
    if (gClicks === 0 || gSafeClicks === 0) return
    if (gSafeClicks === 3) {
        elBtn.innerText = `Safe Click ✅ ${gSafeClicks - 1} available`
        markSafeClick()
        return
    }
    else if (gSafeClicks === 2) {
        elBtn.innerText = `Safe Click ✅ ${gSafeClicks - 1} available`
        markSafeClick()
        return
    }
    else if (gSafeClicks === 1) {
        elBtn.innerText = `Safe Click ✅ ${gSafeClicks - 1} available`
        markSafeClick()
        return
    }
}

// Mark random SafeClicks on board
function markSafeClick() {
    const emptyCells = getEmptyCells(gBoard)
    const randPos = emptyCells[getRandomIntInclusive(0, emptyCells.length - 1)]
    renderCell(randPos, SAFE_CLICK)
    setTimeout(renderCell, 5000, randPos, EMPTY)
    --gSafeClicks
}

// Render specific cell
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    if (gBoard[location.i][location.j].isShown) elCell.classList.remove('hidden-cell')
    elCell.innerHTML = value
}

// Show GameOver Modal
function gameOverModal() {
    gGame.isOn = false

    const elModal = document.querySelector('.modal')
    elModal.classList.remove('hidden')
    document.querySelector('.modal h3').innerText = 'GAME OVER'
    const elBtn = document.querySelector('.smiley')
    elBtn.innerText = '🤯'

    revealAllMines()
    clearInterval(gIntervalTime)
}

// Reveal all mines on board
function revealAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (!cell.isShown && cell.isMine) {
                cell.isShown = true
            }
        }
    }
    renderBoard(gBoard)
}

// onClick btn to set gLevel Beginner
function onClickBeginner() {
    gLevel.SIZE = 4
    gLevel.MINES = 2
    onInit()
}

// onClick btn to set gLevel Medium
function onClickMedium() {
    gLevel.SIZE = 8
    gLevel.MINES = 14
    onInit()
}

// onClick btn to set gLevel Expert
function onClickExpert() {
    gLevel.SIZE = 12
    gLevel.MINES = 32
    onInit()
}

// onClick DarkMode option
function onClickDarkMode(elDarkBtn) {
    const elBody = document.querySelector('body')
    elBody.classList.toggle('dark-mode')

    if (elDarkBtn.innerText === 'Dark Mode') {
        elDarkBtn.innerText = 'Disable Dark Mode'
        return

    } else if (elDarkBtn.innerText === 'Disable Dark Mode') {
        elDarkBtn.innerText = 'Dark Mode'
        return

    }
}

// onClick Hint, make gIsHint = true so next Click on cell will reveal
function onClickHint(elHintBtn) {
    if (!gGame.isOn) return
    if (elHintBtn.style.backgroundColor === 'gray') return
    gElHintBtn = elHintBtn
    elHintBtn.style.backgroundColor = 'yellow'
    gIsHint = true
}

// onClick Exterminator, use deleteThreeRandMines()
function onClickExterminator(elBtn) {
    if (!gGame.isOn) return
    deleteThreeRandMines(gBoard)
    renderBoard(gBoard)
}

// onClick Manual create board
function manualOnClick() {
    gBoard = buildBoard()
    renderBoard(gBoard)
    gManual = true
}

// onClick undo, make the game go to last Step saved (ATM - Lives, Board)
function undoOnClick(elBtn) {
    if (!gGame.isOn) return
    console.log(gUndoState)
    gBoard = gUndoState[gStepUndoCounter - 1]
    gLives = gUndoLives[gLivesCounter - 1]
    if (!gLives) gLives = 3
    livesModal()
    renderBoard(gUndoState[gStepUndoCounter - 1])
    gUndoState.splice(gStepUndoCounter - 1, 1)
    gUndoLives.splice(gLivesCounter - 1, 1)
    gStepUndoCounter--
    gLivesCounter--
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
    const randPos1 = minesCells[getRandomIntInclusive(0, minesCells.length - 1)]
    console.log(randPos1)
    board[randPos1.i][randPos1.j].isMine = false
    minesCells.splice(minesCells[randPos1.i][randPos1.j], 1)
    const randPos2 = minesCells[getRandomIntInclusive(0, minesCells.length - 1)]
    board[randPos2.i][randPos2.j].isMine = false
    minesCells.splice(minesCells[randPos2.i][randPos2.j], 1)
    const randPos3 = minesCells[getRandomIntInclusive(0, minesCells.length - 1)]
    board[randPos3.i][randPos3.j].isMine = false
    minesCells.splice(minesCells[randPos3.i][randPos3.j], 1)
    setMinesNegsCount(board)
    return minesCells
}

// Show Victory Modal
function victoryModal() {
    clearInterval(gIntervalTime)
    if (gLevel.SIZE === 4) {
        if (gGame.secsPassed < +localStorage.getItem("best-score-beginner")) {
            renderBoard(gBoard)
            setTimeout(() => {
                localStorage.setItem("best-score-beginner", gGame.secsPassed)
                localStorage.setItem("best-score-beginner-name", prompt('Enter your Name:'))
            }, 1000);
            renderRecords()
        }
    } else if (gLevel.SIZE === 8) {
        if (gGame.secsPassed < +localStorage.getItem("best-score-beginner")) {
            renderBoard(gBoard)
            setTimeout(() => {
                localStorage.setItem("best-score-medium", gGame.secsPassed)
                localStorage.setItem("best-score-medium-name", prompt('Enter your Name:'))
            }, 1000);
            renderRecords()
        }
    } else if (gLevel.SIZE === 12) {
        if (gGame.secsPassed < +localStorage.getItem("best-score-expert")) {
            renderBoard(gBoard)
            setTimeout(() => {
                localStorage.setItem("best-score-expert", gGame.secsPassed)
                localStorage.setItem("best-score-expert-name", prompt('Enter your Name:'))
            }, 1000);
            renderRecords()
        }
    }

    gGame.isOn = false
    const elModal = document.querySelector('.modal')
    elModal.classList.remove('hidden')
    document.querySelector('.modal h3').innerText = 'Victory'
    const elBtn = document.querySelector('.smiley')
    elBtn.innerText = '😎'
}

// Update and show Lives Modal
function livesModal() {
    const elLives = document.querySelector('.lives h2')
    elLives.innerText = `${gLives} LIVES LEFT`
}