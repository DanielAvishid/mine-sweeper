'use strict'

var gBoard

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

function onInit() {
    gBoard = buildBoard()
    console.table(gBoard)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
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
                isMarked: true
            }
        }
    }
    // placeRandomMines(board)
    board[0][0].isMine = true
    board[0][1].isMine = true
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
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr class="cinema-row" >\n`
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            var value
            if (cell.isMine) {
                value = '💣'
            } else if (cell.minesAroundCount) {
                value = cell.minesAroundCount
            } else {
                value = ''
            }
            if (!cell.isShown) value = ''
            // var value = (cell.isMine) ? '💣' : `${cell.minesAroundCount}`
            strHTML += `\t<td data-i="${i}" data-j="${j}"
                                class="cell" 
                                onclick="onCellClicked(this, ${i}, ${j})">
                                ${value}
                             </td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elCells = document.querySelector(".board-cells")
    elCells.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    console.log(gBoard[i][j].isMine)
    gBoard[i][j].isShown = true
    renderBoard(gBoard)
}

function onCellMarked(elCell) {

}

function checkGameOver() {

}

function expandShown(board, elCell, i, j) {

}

function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerHTML = value;
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
            if (!currCell.isMine)
                emptyCells.push({ i, j });
        }
    }
    if (!emptyCells.length) return null;
    return emptyCells;
}

function placeRandomMines(board) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var emptyCells = getEmptyCells(board)
        var ranPosCell = emptyCells[getRandomIntInclusive(0, emptyCells.length - 1)]
        board[ranPosCell.i][ranPosCell.j].isMine = true
    }
}