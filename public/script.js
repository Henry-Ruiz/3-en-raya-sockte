// Conexión al servidor usando Socket.io
const socket = io();

// Selección de las celdas del tablero y otros elementos de la interfaz
const cells = document.querySelectorAll(".cell"); // Las celdas donde se colocan las "X" y "O"
const turnIndicator = document.getElementById("turn-indicator"); // Indicador de turno
const winnerMessage = document.getElementById("winner-message"); // Mensaje del ganador
const winnerText = document.getElementById("winner-text"); // Texto con el ganador
const resetButton = document.getElementById("reset"); // Botón para reiniciar el juego

let gameOver = false; // Variable que indica si el juego ha terminado

/**
 * Actualiza el tablero, el turno y el estado del juego
 * @param {Object} data - Datos del estado actual del juego.
 * @param {Array} data.board - El tablero de 3x3 con las marcas de los jugadores.
 * @param {string} data.currentPlayer - El jugador que tiene el turno ('X' o 'O').
 * @param {boolean} data.gameOver - Estado del juego, si ha terminado o no.
 */
socket.on("updateBoard", (data) => {
    const { board, currentPlayer, gameOver: serverGameOver } = data;

    // Actualiza el estado de las celdas según el tablero recibido
    board.forEach((value, index) => {
        const cell = cells[index];
        cell.textContent = value || ""; // Si hay un valor, lo muestra, si no, lo deja vacío
        cell.classList.toggle("taken", !!value); // Marca la celda como ocupada si tiene un valor
    });

    // Actualiza el estado de la variable gameOver y muestra el turno
    gameOver = serverGameOver;

    if (!gameOver) {
        winnerMessage.classList.add("hidden"); // Oculta el mensaje de ganador si el juego no ha terminado
        turnIndicator.textContent = `Turno de: ${currentPlayer}`; // Muestra quién tiene el turno
    }
});

/**
 * Maneja el evento de fin de juego y muestra el ganador
 * @param {Object} data - Datos del final del juego.
 * @param {string} data.winner - El jugador ganador ('X', 'O') o 'Empate'.
 */
socket.on("gameOver", (data) => {
    const { winner } = data;

    // Muestra el ganador o si es un empate
    if (winner === "Empate") {
        winnerText.textContent = "¡Es un empate!";
    } else {
        winnerText.textContent = `¡El ganador es: ${winner}!`;
    }

    winnerMessage.classList.remove("hidden"); // Muestra el mensaje del ganador
    turnIndicator.textContent = ""; // Elimina el mensaje de turno
    gameOver = true; // Bloquea nuevos movimientos
});

/**
 * Reinicia el juego y limpia el tablero
 */
socket.on("resetGame", () => {
    // Limpia las celdas del tablero
    cells.forEach((cell) => {
        cell.textContent = "";
        cell.classList.remove("taken"); // Remueve la clase de celda ocupada
    });

    // Oculta el mensaje de ganador y muestra el turno inicial
    winnerMessage.classList.add("hidden");
    turnIndicator.textContent = "Turno de: X"; // Establece el turno de inicio
    gameOver = false; // Permite nuevos movimientos
});

/**
 * Enviar un movimiento al servidor cuando se hace clic en una celda
 */
cells.forEach((cell) => {
    cell.addEventListener("click", () => {
        if (!gameOver) {
            const index = cell.getAttribute("data-cell"); // Obtiene el índice de la celda
            socket.emit("move", { index }); // Envía el movimiento al servidor
        }
    });
});

/**
 * Enviar el evento para reiniciar el juego
 */
resetButton.addEventListener("click", () => {
    socket.emit("resetGame"); // Envía la solicitud de reinicio al servidor
});
