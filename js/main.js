'use strict'

const FLAG = '🚩'
const MINE = '💣'
const EMPTY = ''
const SAFE_CLICK = '✅'

var gIsUndoFirstStep
var gIsHint
var gIsMegaHintM
var gIsSafeClickM
var gIsManualM

var gIsVictory
var gIsGameOver

var gBoard
var gClicks
var gLives
var gLivesCounter
var gSafeClicks
var gElHintBtn
var gManualMinesCount

var gMegaIsActive = false
var gMegaIsFirst
var gMegaIsLast
var gMegaLastCell
var gMegaFirstCell
var gMegaIsFinish

var gMegaFirstCell
var gMegaLastCell


var gStepUndoCounter
var gUndoState = []
var gUndoLives = []
var gUndoShownCount = []
var gUndoMarkedCount = []

var gIntervalSafeClick
var gIntervalTime
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

// localStorage.setItem("expert-score", 200)
// localStorage.setItem("medium-score", 200)
// localStorage.setItem("beginner-score", 200)

////////////////////////////////////////////////
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
    clearInterval(gIntervalSafeClick)
    const currCell = gBoard[i][j]
    if (!gGame.isOn || currCell.isMarked || currCell.isShown && !gIsManualM) return
    if (!gIsManualM && gClicks === 999) {
        gClicks++
        startTime()
    }
    if (gMegaIsActive) {
        if (gMegaIsFirst) {
            gMegaFirstCell = elCell
            gMegaIsFirst = false
            gMegaIsLast = true
            return
        } else if (gMegaIsLast) {
            gMegaLastCell = elCell
            const MegaHintCells = getMegaHintAreaReveal(gBoard, gMegaFirstCell, gMegaLastCell)
            gMegaIsActive = false
            setTimeout(() => {
                revealBackMegaHint(MegaHintCells)
                renderBoard(gBoard)
            }, 2000);
            gMegaIsFinish = true
            return
        }
    }
    if (gIsManualM) {
        if (currCell.isMine) return
        renderCell({ i, j }, MINE)
        currCell.isMine = true
        gManualMinesCount++
        if (gManualMinesCount === gLevel.MINES) {
            hideAllCells(gBoard)
            setMinesNegsCount(gBoard)
            renderBoard(gBoard)
            gIsManualM = false
            gClicks = 999
            return
        }
        return
    }
    createUndoState(gBoard)
    if (gClicks === 0 && !currCell.isMarked || gIsUndoFirstStep) {
        onInit()
        startTime()
        currCell.isShown = true
        // gGame.shownCount++
        renderCell({ i, j }, EMPTY)
        expandShownOneGen(gBoard, i, j)
        placeRandomMines(gBoard)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
        shownAndMarkModal()
        gClicks = 2
        gIsUndoFirstStep = false
        return
    }

    if (gIsHint) {
        hintAreaReveal(gBoard, i, j)
        setTimeout(renderBoard, 1000, gBoard)
        gIsHint = false
        gElHintBtn.style.backgroundColor = 'gray'
        return
    }
    if (currCell.isMine) {
        if (currCell.isShown) return
        else {
            gLives--
            currCell.isShown = true
            gGame.shownCount++
            renderCell({ i, j }, MINE)
            shakeScreen()
            livesModal()
            shownAndMarkModal()
            if (gLives === 0) {
                gameOverModal()
                return
            }
        }
    }
    if (currCell.minesAroundCount === 0) {
        revealCell(gBoard, i, j)
        shownAndMarkModal()
    } else if (currCell.minesAroundCount !== 0) {
        if (currCell.isShown) return
        currCell.isShown = true
        gGame.shownCount++
        shownAndMarkModal()
    }
    renderBoard(gBoard)
    if (getIsVictory()) victoryModal()
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
            gGame.markedCount--
            shownAndMarkModal()
            if (getIsVictory()) victoryModal()
            return
        } else currCell.isMarked = true
        renderCell(cellPos, FLAG)
        gGame.markedCount++
        shownAndMarkModal()
    }
    if (getIsVictory()) victoryModal()
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

////////////////////////////////////////////////
// Do Functions ------------------------------------------------------

// expandShown recursion **Not Working**
function expandShown(board, elCell1, rowIdx, colIdx) {
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

// Mark random SafeClicks on gBoard
function markSafeClick() {
    const emptyCells = getEmptyCells(gBoard)
    const randPos = emptyCells[getRandomIntInclusive(0, emptyCells.length - 1)]
    const cell = gBoard[randPos.i][randPos.j]
    renderCell(randPos, SAFE_CLICK)
    gIntervalSafeClick = setTimeout(renderCell, 5000, randPos, EMPTY)
    --gSafeClicks
}

// Render specific cell
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    if (gBoard[location.i][location.j].isShown) elCell.classList.remove('hidden-cell')
    elCell.innerHTML = value
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

////////////////////////////////////////////////
// Modal Functions ------------------------------------------------------

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

////////////////////////////////////////////////
// OnClick Functions ------------------------------------------------------

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

// onClickSafe change btn text and use markSafeClick()
function onClickSafe(elBtn) {
    if (gClicks === 0 || gSafeClicks === 0 || !gGame.isOn) return
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

// onClick DarkMode option
function onClickDarkMode(elDarkBtn) {
    const elBody = document.querySelector('body')
    elBody.classList.toggle('dark-mode')
    const elH1Main = document.querySelector('.main-h1')

    if (elDarkBtn.innerText === 'Dark Mode') {
        elDarkBtn.innerText = 'Disable Dark Mode'
        elH1Main.classList.add('dark-mode-h1')
        return

    } else if (elDarkBtn.innerText === 'Disable Dark Mode') {
        elDarkBtn.innerText = 'Dark Mode'
        elH1Main.classList.remove('dark-mode-h1')
        return

    }
}

// onClick Hint, make gIsHint = true so next Click on cell will reveal
function onClickHint(elHintBtn) {
    if (!gGame.isOn || gClicks === 0) return
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
function onClickManual() {
    onInit()
    gBoard = buildBoardManual()
    renderBoard(gBoard)
    gIsManualM = true
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

function onClickMegaHint(elBtn) {
    if (gMegaIsFinish) return
    gMegaIsFirst = true
    gMegaIsActive = true
}

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

function revealBackMegaHint(MegaHintCells) {
    for (var i = 0; i < MegaHintCells.length; i++) {
        MegaHintCells[i].isShown = false
    }
}

////////////////////////////////////////////////////////

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

function isNotShown(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            const cell = board[i][j]
            if (cell.isShown) return false
        }
    }
    return true
}