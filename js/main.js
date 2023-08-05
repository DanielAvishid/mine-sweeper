'use strict'

const FLAG = '🚩'
const MINE = '💣'
const EMPTY = ''
const SAFE_CLICK = '✅'

var gBoard
var gClicks
var gLives

var gIntervalSafeClick
var gIntervalTime

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

// Flow Functions ------------------------------------------------------

// Restart the Game
function onInit() {
    clearInterval(gIntervalSafeClick)
    resetGVariables()

    gBoard = buildBoard()
    renderBoard(gBoard)

    livesModal()
    shownAndMarkModal()
    resetHintButtons()
    document.querySelector('.safe-click').innerText = 'Safe Click ✅'
    document.querySelector('.timer').innerHTML = `<span class="timer-span">${gGame.secsPassed}</span>`
    document.querySelector('.smiley').innerText = '😃'
    document.querySelector('.modal').classList.add('hidden')
}

// Reset Global Variables
function resetGVariables() {
    gMegaIsFinish = false
    gIsManualM = false
    gManualMinesCount = 0
    gGame.markedCount = 0
    gGame.shownCount = 0
    gManualMinesCount = 0
    gManual = false
    gIsHint = false
    gGame.isOn = true
    gGame.secsPassed = 0
    gClicks = 0
    gLives = 3
    gSafeClicks = 3
    clearInterval(gIntervalTime)
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
            }
        }
    }
    return board
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

// Place Random Mines (gLevel.MINES)
function placeRandomMines(board) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var emptyCells = getEmptyCells(board)
        var ranPosCell = emptyCells[getRandomIntInclusive(0, emptyCells.length - 1)]
        if (!ranPosCell.isMine) board[ranPosCell.i][ranPosCell.j].isMine = true
    }
}

// isVictory
function getIsVictory() {
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

// expandShown 1st generation
function expandShownOneGen(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMarked || currCell.isMine) continue
            if (!currCell.isShown) {
                currCell.isShown = true
                gGame.shownCount++
            }
        }
    }
}

// expandShown with Recursion
function expandShown(board, rowIdx, colIdx) {
    if (
        rowIdx < 0 ||
        colIdx < 0 ||
        rowIdx >= board.length ||
        colIdx >= board[0].length ||
        board[rowIdx][colIdx].isShown
    ) {
        return;
    }
    board[rowIdx][colIdx].isShown = true;
    gGame.shownCount++
    if (board[rowIdx][colIdx].isMine) {
        return;
    }
    if (countNegsMines(board, rowIdx, colIdx) === 0) {
        expandShown(board, rowIdx - 1, colIdx - 1)
        expandShown(board, rowIdx - 1, colIdx)
        expandShown(board, rowIdx - 1, colIdx + 1)
        expandShown(board, rowIdx, colIdx - 1)
        expandShown(board, rowIdx, colIdx + 1)
        expandShown(board, rowIdx + 1, colIdx - 1)
        expandShown(board, rowIdx + 1, colIdx)
        expandShown(board, rowIdx + 1, colIdx + 1)
    }
}

// Set each cell.minesAroundCount in board
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

// Render specific cell
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    if (gBoard[location.i][location.j].isShown) elCell.classList.remove('hidden-cell')
    elCell.innerHTML = value
}

// Reveal all mines on board
function revealAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            if (!cell.isShown && cell.isMine) {
                cell.isShown = true
            }
        }
    }
}

// Show GameOver Modal
function gameOverModal() {
    gGame.isOn = false

    const elModal = document.querySelector('.modal')
    elModal.classList.remove('hidden')
    document.querySelector('.modal h3').innerText = 'GAME OVER'
    const elBtn = document.querySelector('.smiley')
    elBtn.innerText = '🤯'

    revealAllMines(gBoard)
    renderBoard(gBoard)
    clearInterval(gIntervalTime)
}

// Update and show Lives Modal
function livesModal() {
    const elLives = document.querySelector('.lives h2')
    elLives.innerText = `${gLives} LIVES LEFT`
}

// Show Victory Modal
function victoryModal() {
    gGame.isOn = false
    const elModal = document.querySelector('.modal')
    elModal.classList.remove('hidden')
    document.querySelector('.modal h3').innerText = 'Victory'
    const elBtn = document.querySelector('.smiley')
    elBtn.innerText = '😎'
    clearInterval(gIntervalTime)
    if (gLevel.SIZE === 4) {
        if (gGame.secsPassed < +localStorage.getItem("beginner-score")) {
            alert('You broke the Beginner Level RECORD!')
            setTimeout(() => {
                localStorage.setItem("beginner-score", gGame.secsPassed)
                const userName = prompt('Enter your name:')
                localStorage.setItem("beginner-name", userName)
            }, 1000)
        }
    } else if (gLevel.SIZE === 8) {
        if (gGame.secsPassed < +localStorage.getItem("medium-score")) {
            alert('You broke the Medium Level RECORD!')
            setTimeout(() => {
                localStorage.setItem("medium-score", gGame.secsPassed)
                const userName = prompt('Enter your name:')
                localStorage.setItem("medium-name", userName)
            }, 1000)
        }
    } else if (gLevel.SIZE === 12) {
        if (gGame.secsPassed < +localStorage.getItem("expert-score")) {
            alert('You broke the Expert Level RECORD!')
            setTimeout(() => {
                localStorage.setItem("expert-score", gGame.secsPassed)
                const userName = prompt('Enter your name:')
                localStorage.setItem("expert-name", userName)
            }, 1000)
        }
    }
    renderRecords()
}

// Update and show Shown & Marked
function shownAndMarkModal() {
    const shownNum = (gGame.shownCount === -1) ? 0 : gGame.shownCount
    document.querySelector('.shown').innerText = `Cells shown: ${shownNum}`
    document.querySelector('.mark').innerText = `Cells marked: ${gGame.markedCount}`
}

// Render records on records.html PAGE
function renderRecords() {
    var elBeginner = document.querySelector('.beginner')
    var elMedium = document.querySelector('.medium')
    var elExpert = document.querySelector('.expert')

    var userName = (!localStorage.getItem("beginner-name")) ? 'Unknown' : localStorage.getItem("beginner-name")
    elBeginner.innerText = `Best Score: ${localStorage.getItem("beginner-score")} Name: ${userName}`

    userName = (!localStorage.getItem("medium-name")) ? 'Unknown' : localStorage.getItem("medium-name")
    elMedium.innerText = `Best Score: ${localStorage.getItem("medium-score")} Name: ${userName}`

    userName = (!localStorage.getItem("expert-name")) ? 'Unknown' : localStorage.getItem("expert-name")
    elExpert.innerText = `Best Score: ${localStorage.getItem("expert-score")} Name: ${userName}`
}