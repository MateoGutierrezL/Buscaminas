const boardSize = 8;
const numMines = 10;
let board = [];
let gameOver = false;
let flags = 0;  // Contador de banderas colocadas
let bombsRemaining = numMines; // Contador de bombas restantes


// Generar el tablero
function createBoard() {
    board = [];
    let mineCount = 0;

    // Crear las celdas
    for (let row = 0; row < boardSize; row++) {
        let rowArray = [];
        for (let col = 0; col < boardSize; col++) {
            rowArray.push({
                isMine: false,
                revealed: false,
                flagged: false,
                surroundingMines: 0,
            });
        }
        board.push(rowArray);
    }

    // Colocar minas aleatoriamente
    while (mineCount < numMines) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        if (!board[row][col].isMine) {
            board[row][col].isMine = true;
            mineCount++;
        }
    }

    // Calcular las minas adyacentes
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col].isMine) continue;

            let surroundingMines = 0;
            for (let r = row - 1; r <= row + 1; r++) {
                for (let c = col - 1; c <= col + 1; c++) {
                    if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c].isMine) {
                        surroundingMines++;
                    }
                }
            }

            board[row][col].surroundingMines = surroundingMines;
        }
    }
    renderBoard();
    updateBombCounter();

}

// Renderizar el tablero en el DOM
function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = ''; // Limpiar el tablero actual

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = board[row][col];
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.dataset.row = row;
            cellElement.dataset.col = col;

            if (cell.revealed) {
                if (cell.isMine) {
                    cellElement.classList.add('mine');
                } else if (cell.surroundingMines > 0) {
                    cellElement.textContent = cell.surroundingMines;
                }
                cellElement.classList.add('revealed');
            }

            if (cell.flagged) {
                cellElement.classList.add('flag');
            }

            cellElement.addEventListener('click', () => revealCell(row, col));
            cellElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(row, col);
            });

            boardElement.appendChild(cellElement);
        }
    }
}


// Mostrar todas las minas al perder
function showAllMines() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col].isMine && !board[row][col].revealed) {
                board[row][col].revealed = true; // Revelar la mina
            }
        }
    }
    renderBoard();  // Volver a renderizar el tablero
}

// Revelar una celda
function revealCell(row, col) {
    if (gameOver || board[row][col].revealed || board[row][col].flagged) return;

    board[row][col].revealed = true;

    if (board[row][col].isMine) {
        gameOver = true;
        alert('¡Juego terminado! Perdiste');
        showAllMines() //Revela todas las minas al perder
    } else {
        if (board[row][col].surroundingMines === 0) {
            // Revelar celdas adyacentes si no hay minas cerca
            for (let r = row - 1; r <= row + 1; r++) {
                for (let c = col - 1; c <= col + 1; c++) {
                    if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
                        if (!board[r][c].revealed) {
                            revealCell(r, c);
                        }
                    }
                }
            }
        }
    }

    renderBoard();
    checkWin();
}

// Actualizar el contador de minas restantes en la interfaz
function updateBombCounter() {
    const bombCountElement = document.getElementById('bomb-count');
    bombCountElement.textContent = bombsRemaining;
}

// Colocar o quitar una bandera
function toggleFlag(row, col) {
    if (gameOver || board[row][col].revealed) return;

    board[row][col].flagged = !board[row][col].flagged;

    if (board[row][col].flagged && board[row][col].isMine) {
        bombsRemaining--;  // Si la celda marcada tiene una mina, disminuimos el contador
    } else if (!board[row][col].flagged && board[row][col].isMine) {
        bombsRemaining++;  // Si se retira una bandera de una mina, aumentamos el contador
    }

    flags += board[row][col].flagged ? 1 : -1;  // Incrementar o decrementar el contador de banderas
    renderBoard();
    updateBombCounter();
}


// Comprobar si el jugador ha ganado
function checkWin() {
    let revealedCount = 0;
    let totalCells = boardSize * boardSize;

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col].revealed) revealedCount++;
        }
    }

    // Si el número de celdas reveladas es igual al total de celdas menos el número de minas, el jugador ha ganado
    if (revealedCount === totalCells - numMines) {
        gameOver = true;
        alert('¡Felicidades, has ganado!');
    }
}

// Reiniciar el juego
document.getElementById('reset').addEventListener('click', () => {
    gameOver = false;
    flags = 0;
    bombsRemaining = numMines;
    createBoard();
    renderBoard();
    updateBombCounter();
});

// Inicializar el juego
createBoard();
renderBoard();

