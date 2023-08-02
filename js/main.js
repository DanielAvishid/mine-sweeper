'use strict'

const FLAG = '🚩'
const MINE = '💣'
const EMPTY = ''
const SAFE_CLICK = '✅'

var gBoard
var gClick
var gInterval
var gLivesCount
var gIsHint
var gElHintBtn
var gSafeClicks
var gUndoSteps = []
var gStepCounter

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

function undoOnClick(elBtn) {
    gBoard = gUndoSteps[gStepCounter - 1]
    renderBoard(gUndoSteps[gStepCounter - 1])
    gUndoSteps.splice(gStepCounter - 1, 1)
    gStepCounter--
    console.log(gStepCounter)
}

function addUndoStep(board) {
    var undoStep = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        undoStep[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            undoStep[i][j] = {
                minesAroundCount: board[i][j].minesAroundCount,
                isShown: board[i][j].isShown,
                isMine: board[i][j].isMine,
                isMarked: board[i][j].isMarked
            }
        }
    }
    gUndoSteps.push(undoStep)
    console.log(gUndoSteps)
    return undoStep
}

function onInit() {
    gStepCounter = 0
    gIsHint = false
    gGame.isOn = true
    gClick = 0
    gLivesCount = 3
    gSafeClicks = 0

    gBoard = buildBoard()
    renderBoard(gBoard)
    clearInterval(gInterval)

    livesModal()
    const elTimer = document.querySelector('.timer')
    elTimer.innerText = `Game Time: 0.000`
    const elBtn = document.querySelector('.smiley')
    elBtn.innerText = '😃'
    const elModal = document.querySelector('.modal')
    elModal.classList.add('hidden')
}

function buildBoard() {
    const board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

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

function renderBoard(board) {
    var strHTML = ""
    var numClass
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr class="table-row" >\n`
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            var value
            if (cell.isShown) {
                if (cell.isMine) {
                    value = MINE
                } else if (cell.minesAroundCount) {
                    value = cell.minesAroundCount
                } else {
                    value = EMPTY
                }
            } else {
                if (cell.isMarked) value = FLAG
                else value = EMPTY
            }
            var cellClass = getClassName({ i, j })
            var hiddenCell = (cell.isShown) ? '' : 'hidden-cell'
            if (cell.minesAroundCount === 1) numClass = 'one'
            if (cell.minesAroundCount === 2) numClass = 'two'
            if (cell.minesAroundCount === 3) numClass = 'three'
            if (cell.minesAroundCount === 4) numClass = 'four'
            if (cell.minesAroundCount === 5) numClass = 'five'
            if (cell.minesAroundCount === 6) numClass = 'six'
            if (cell.minesAroundCount === 7) numClass = 'seven'
            if (cell.minesAroundCount === 8) numClass = 'eight'

            // var value = (cell.isMine) ? '💣' : `${cell.minesAroundCount}`
            strHTML += `\t<td data-i="${i}" data-j="${j}"
                                class="cell ${numClass} ${hiddenCell} ${cellClass}" onclick="onCellClicked(this, ${i}, ${j})" 
                                oncontextmenu="onCellMarked(this)"
                                >
                                ${value}
                             </td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elCells = document.querySelector(".board-cells")
    elCells.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (gStepCounter === 0) onInit()
    if (gClick === 1) gClick = 2
    addUndoStep(gBoard)
    gStepCounter++
    if (gIsHint) {
        revealForSec(gBoard, i, j)
        setTimeout(renderBoard, 1000, gBoard)
        gIsHint = false
        gElHintBtn.style.backgroundColor = 'gray'
        return
    }
    if (!gGame.isOn) return
    const currCell = gBoard[i][j]
    if (gClick === 0 && !currCell.isMarked) {
        startTime()
        expandShown(gBoard, i, j)
        renderCell({ i, j }, EMPTY)
        placeRandomMines(gBoard)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
        gClick = 1
    }
    if (currCell.isMarked) return
    if (currCell.isMine) {
        if (currCell.isShown) return
        else {
            gLivesCount--
            currCell.isShown = true
            renderCell({ i, j }, MINE)
            livesModal()
            if (gLivesCount === 0) {
                gameOver()
                return
            }
            if (checkGameOver()) victoryModal()
            return
        }
    } else if (currCell.minesAroundCount === 0) {
        expandShown(gBoard, i, j)
    } else {
        currCell.isShown = true
    }
    renderBoard(gBoard)
    if (checkGameOver()) victoryModal()
}

function expandShown(board, rowIdx, colIdx,) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            currCell.isShown = true
        }
    }
}

function revealForSec(board, rowIdx, colIdx,) {
    const boardForSec = []
    for (var i = 0; i < board.length; i++) {
        boardForSec[i] = []
        for (var j = 0; j < board.length; j++) {
            boardForSec[i][j] = {
                minesAroundCount: board[i][j].minesAroundCount,
                isShown: board[i][j].isShown,
                isMine: board[i][j].isMine,
                isMarked: board[i][j].isMarked
            }
        }
    }
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= boardForSec.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= boardForSec[0].length) continue
            var currCell = boardForSec[i][j]
            currCell.isShown = true
        }
    }
    renderBoard(boardForSec)
}

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

function markRandomSafeOnClick(elBtn) {
    if (gSafeClicks === 3) {
        elBtn.innerText = 'No more Safe Clicks'
        return
    }
    const emptyCells = getEmptyCells(gBoard)
    const randPos = emptyCells[getRandomIntInclusive(0, emptyCells.length)]
    renderCell(randPos, SAFE_CLICK)
    gSafeClicks++
}

function renderCell2(board, currCell) {
}

function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    if (gBoard[location.i][location.j].isShown) elCell.classList.remove('hidden-cell')
    elCell.innerHTML = value
}

function gameOver() {
    gGame.isOn = false

    const elModal = document.querySelector('.modal')
    elModal.classList.remove('hidden')
    document.querySelector('.modal h3').innerText = 'GAME OVER'
    const elBtn = document.querySelector('.smiley')
    elBtn.innerText = '🤯'

    revealAllMines()
    clearInterval(gInterval)
}

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

function onClickBeginner() {
    gLevel.SIZE = 4
    gLevel.MINES = 2
    onInit()
}

function onClickMedium() {
    gLevel.SIZE = 8
    gLevel.MINES = 14
    onInit()
}

function onClickExpert() {
    gLevel.SIZE = 12
    gLevel.MINES = 32
    onInit()
}

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

function onClickHint(elHintBtn) {
    if (elHintBtn.style.backgroundColor === 'gray') return
    gElHintBtn = elHintBtn
    elHintBtn.style.backgroundColor = 'yellow'
    gIsHint = true
}


function victoryModal() {
    gGame.isOn = false
    const elModal = document.querySelector('.modal')
    elModal.classList.remove('hidden')
    document.querySelector('.modal h3').innerText = 'Victory'
    const elBtn = document.querySelector('.smiley')
    elBtn.innerText = '😎'

    clearInterval(gInterval)

}

function livesModal() {
    const elLives = document.querySelector('.lives h2')
    elLives.innerText = `${gLivesCount} LIVES LEFT`
}
///////////////////////////////////////////////////////////

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
    gInterval = setInterval(function () {
        var elapsedTime = Date.now() - startTime
        document.querySelector(".timer").innerHTML = `Game Time: <span class="span-mark">${(elapsedTime / 1000).toFixed(3)}</span>`
    }, 37)
}