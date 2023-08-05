'use strict'

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
                hideMegaHint(MegaHintCells)
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
        expandShown(gBoard, i, j)
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
    const elH1Main = document.querySelector('.main-h1')

    if (elDarkBtn.innerText === 'Dark Mode') {
        elDarkBtn.innerText = 'Disable Dark Mode'
        elH1Main.classList.add('dark-mode-h1')
        elH1Main.classList.remove('no-dark-mode')
        return

    } else if (elDarkBtn.innerText === 'Disable Dark Mode') {
        elDarkBtn.innerText = 'Dark Mode'
        elH1Main.classList.remove('dark-mode-h1')
        elH1Main.classList.add('no-dark-mode')
        return

    }
}
