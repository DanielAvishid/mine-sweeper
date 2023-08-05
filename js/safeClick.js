'use strict'

var gSafeClicks

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

// Mark random SafeClicks on gBoard
function markSafeClick() {
    const emptyCells = getEmptyCells(gBoard)
    const randPos = emptyCells[getRandomIntInclusive(0, emptyCells.length - 1)]
    const cell = gBoard[randPos.i][randPos.j]
    renderCell(randPos, SAFE_CLICK)
    gIntervalSafeClick = setTimeout(renderCell, 5000, randPos, EMPTY)
    --gSafeClicks
}