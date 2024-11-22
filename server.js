// Importamos las dependencias necesarias
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Creamos la aplicación y el servidor
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Variables para gestionar el estado del juego
let board = Array(9).fill(null); // El tablero de 3x3, representado como un array de 9 celdas
let currentPlayer = 'X'; // El jugador que tiene el turno (X o O)
let gameOver = false; // Indica si el juego ha terminado

// Ruta principal para servir la página
app.use(express.static('public'));

// Establece la conexión con los clientes
io.on('connection', (socket) => {
    console.log('Nuevo jugador conectado');

    // Enviar el estado actual del juego al cliente
    socket.emit('updateBoard', { board, currentPlayer, gameOver });

    /**
     * Maneja el evento cuando un jugador hace un movimiento.
     * @param {Object} data - Datos del movimiento.
     * @param {number} data.index - El índice de la celda donde se coloca la marca (0-8).
     * @returns {void}
     */
    socket.on('move', (data) => {
        if (gameOver) return; // Si el juego ha terminado, no se permite otro movimiento

        const { index } = data;
        if (!board[index]) { // Si la celda está vacía
            board[index] = currentPlayer; // Coloca la marca del jugador actual
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Cambia el turno
            gameOver = checkWinner() || board.every(cell => cell !== null); // Verifica si hay un ganador o empate
            io.emit('updateBoard', { board, currentPlayer, gameOver }); // Actualiza el tablero en todos los clientes

            if (gameOver) {
                const winner = checkWinner();
                io.emit('gameOver', { winner: winner || 'Empate' }); // Notifica a todos los clientes
            }
        }
    });

    /**
     * Maneja el reinicio del juego.
     * @returns {void}
     */
    socket.on('resetGame', () => {
        board = Array(9).fill(null); // Reinicia el tablero
        currentPlayer = 'X'; // Restablece el turno a X
        gameOver = false; // Reinicia el estado del juego
        io.emit('resetGame'); // Notifica a todos los clientes para reiniciar el juego
    });

    /**
     * Función para verificar si hay un ganador.
     * Revisa las combinaciones posibles de 3 celdas (filas, columnas y diagonales).
     * @returns {string|null} El ganador ('X' o 'O'), o null si no hay ganador.
     */
    function checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
            [0, 4, 8], [2, 4, 6] // Diagonales
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a]; // Retorna el ganador (X o O)
            }
        }

        return null; // No hay ganador
    }
});

// Inicia el servidor
server.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});
