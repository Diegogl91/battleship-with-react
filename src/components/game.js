import React, { useState, useEffect } from 'react'
import '../index.css'

//Tablero de Jugador
const Game = () => {
    const playerBoardSchema = [
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
    ];
    //Tablero de Maquina
    const pcBoardSchema = [
        [1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
    ];


    const [playerBoard, setPlayerBoard] = useState(playerBoardSchema);
    const [pcBoard, setPcBoard] = useState(pcBoardSchema);
    const [activePlayer, setActivePlayer] = useState(1); //1 for player , 0 for notebook
    const [playerHit, setPlayerHit] = useState(0);
    const [pcHit, setPcHit] = useState(0);
    const [trackingShip, setTrackingShip] = useState(false)//trackea si se hizo un hit para buscar los proximos puntos para atacar
    const [prevGuesses, setPrevGuesses] = useState([])
    const [currentHitCount, setCurrentHitCount] = useState(0)
    const [isHorizontal, setIsHorizontal] = useState(1)
    const [currentShipHits, setCurrentShipHits] = useState([])
    const [gameOver,setGameOver]= useState(false)

    useEffect(() => {
        if (activePlayer === 0) {
            pcPlaying();
            setActivePlayer(1);
        }

    }, [activePlayer])
    // 0 = empty
    // 1 = part of a ship
    // 2 = a sunken part of a ship
    // 3 = a missed shot

    const pcPlaying = () => {
        let board = [...playerBoard]
        let rowGuess
        let cellGuess
        // Condicion para indicarle a la maquina cuando consigue una nave enemiga y la empieza a cazar, mientras trackingShip sea false, 
        //la maquina disparara a posiciones aleatorias.
        if (!trackingShip) {
            //Se genera un numero aleatorio, si ya se uso esa combinacion, se generara otro numero.
            rowGuess = Math.round(Math.random() * 9);
            cellGuess = Math.round(Math.random() * 9);

            while (isHit(rowGuess, cellGuess)) {//Mientras que isHit sea true, se seguiran generarndo coordenadas.
                rowGuess = Math.round(Math.random() * 9);
                cellGuess = Math.round(Math.random() * 9);
            }
        } else {
            const firstGuess = prevGuesses[0];// se guarda en firstGuess el primer hit de la maquina.
            const lastGuess = prevGuesses[prevGuesses.length - 1];// se guarda el ultimo hit de la maquina
            let newMove = possibleGuesses(lastGuess);
            if (newMove.length == 0 && currentHitCount < 2) {
                setIsHorizontal(0)
                newMove = possibleGuesses(lastGuess, false);//Al no encontrar guesses en horizontal, busca en vertical
                if (newMove.length == 0) {
                    rowGuess = 1;
                    cellGuess = 1;
                } else {
                    rowGuess = newMove[0][0];
                    cellGuess = newMove[0][1];
                }
            } else if (newMove.length == 0) {
                newMove = possibleGuesses(firstGuess);
                if (newMove.length > 0) {
                    rowGuess = newMove[0][0];
                    cellGuess = newMove[0][1];
                } else {
                    rowGuess = 1;
                    cellGuess = 1;
                }
            } else {
                rowGuess = newMove[0][0];
                cellGuess = newMove[0][1];
            }
        }
        if (playerBoard[rowGuess][cellGuess] == 0) {
            board[rowGuess].splice(cellGuess, 1, 3);//Si la celda jugada por la maquina no contiene ningun barco, se setea la posicion a 3.
            if (trackingShip) { //si la maquina esta trackeando a una nave, chequea si hundio el barco o no.
                isShipSunk(currentShipHits, board) 
            }
        } else if (playerBoard[rowGuess][cellGuess] == 1) {//Al hacer impacto con el barco, marca el hit. Se guarda la informacion necesaria para el proximo ataque.
            board[rowGuess].splice(cellGuess, 1, 2);
            let hitTotal = pcHit;
            setPcHit(hitTotal + 1)
            setPlayerBoard(board)
            setTrackingShip(true)
            const previous = prevGuesses;
            previous.push([rowGuess, cellGuess])// se pushea la posicion que se acaba de adivinar, incluye las posiciones fallidas.
            setPrevGuesses(previous)
            const shipHits = currentShipHits;
            shipHits.push([rowGuess, cellGuess])//se setea para que se sepa en que posiciones se ha golpeado al barco
            setCurrentShipHits(shipHits)
            let hits = currentHitCount;
            setCurrentHitCount(hits + 1)
            isShipSunk(shipHits, board)
            if (pcHit == 17) {
                setGameOver(true)
                alert("game over")
                //setear game over
            }
        }

        setPlayerBoard(board);

    }
    //possibleGuesses revisa desde la ultima coordenada cuales son las posibles ubicaciones donde podria atacar, 
    //buscando primero horizontalmente y luego verticalmente, si no tiene posibilidad en alguna de las opciones buscara solo en la contraria.
    const possibleGuesses = (prev, horizontal = true) => {
        let guesses = [];
        const horizontalFlag = horizontal && isHorizontal
        if (prev[0] - 1 >= 0 && !horizontalFlag) {//se checkea en la posicion arriba del ultimo hit 

            if (!isHit(prev[0] - 1, prev[1])) {//valida si la posicion no fue atacada
                guesses.push([prev[0] - 1, prev[1]])
            }
        }
        if (prev[1] - 1 >= 0 && horizontalFlag) {//se checkea en la posicion izquierda del ultimo hit 
            
            if (!isHit(prev[0], prev[1] - 1)) {
                guesses.push([prev[0], prev[1] - 1])
            }
        }
        if (prev[0] + 1 < 9 && !horizontalFlag) {//se checkea en la posicion debajo del ultimo hit 
           
            if (!isHit(prev[0] + 1, prev[1])) {
                guesses.push([prev[0] + 1, prev[1]])
            }
        }
        if (prev[1] + 1 < 9 && horizontalFlag) {//se checkea en la posicion a la derecha del ultimo hit 
            if (!isHit(prev[0], prev[1] + 1)) {
                guesses.push([prev[0], prev[1] + 1])
            }
        }

        return guesses
    }
    //Metodo para determinar si una celda fue atacada previamente
    const isHit = (row, cell) => {
        return playerBoard[row][cell] == 3 || playerBoard[row][cell] == 2
    }
    //Determina si el barco fue hundido
    const isShipSunk = (shipHits, board) => {
        const lowestIndex = getLowestIndex(shipHits);

        if (isHorizontal && bounds(lowestIndex[0], lowestIndex[1], "left", board) == 3
            && board[lowestIndex[0]][lowestIndex[1]] == 2
            && board[lowestIndex[0]][lowestIndex[1] + 1] == 2
            && bounds(lowestIndex[0], lowestIndex[1] + 1, "right", board) == 3
        ) {
            
            resetPcState()
            return true
        }

        if (isHorizontal && bounds(lowestIndex[0], lowestIndex[1], "left", board) == 3
            && board[lowestIndex[0]][lowestIndex[1]] == 2
            && board[lowestIndex[0]][lowestIndex[1] + 1] == 2
            && board[lowestIndex[0]][lowestIndex[1] + 2] == 2
            && bounds(lowestIndex[0], lowestIndex[1] + 2, "right", board) == 3
        ) {
            
            resetPcState()
            return true
        }

        if (isHorizontal && bounds(lowestIndex[0], lowestIndex[1], "left", board) == 3
            && board[lowestIndex[0]][lowestIndex[1]] == 2
            && board[lowestIndex[0]][lowestIndex[1] + 1] == 2
            && board[lowestIndex[0]][lowestIndex[1] + 2] == 2
            && board[lowestIndex[0]][lowestIndex[1] + 3] == 2
            && bounds(lowestIndex[0], lowestIndex[1] + 3, "right", board) == 3
        ) {
            
            resetPcState()
            return true
        }

        if (isHorizontal && bounds(lowestIndex[0], lowestIndex[1], "left", board) == 3
            && board[lowestIndex[0]][lowestIndex[1]] == 2
            && board[lowestIndex[0]][lowestIndex[1] + 1] == 2
            && board[lowestIndex[0]][lowestIndex[1] + 2] == 2
            && board[lowestIndex[0]][lowestIndex[1] + 3] == 2
            && board[lowestIndex[0]][lowestIndex[1] + 4] == 2
            && bounds(lowestIndex[0], lowestIndex[1] + 4, "right", board) == 3
        ) {
            
            resetPcState()
            return true
        }


        if (!isHorizontal && bounds(lowestIndex[0], lowestIndex[1], "up", board) == 3
            && board[lowestIndex[0]][lowestIndex[1]] == 2
            && board[lowestIndex[0] + 1][lowestIndex[1]] == 2
            && bounds(lowestIndex[0] + 1, lowestIndex[1], "down", board) == 3
        ) {
            
            resetPcState()
            return true
        }

        if (!isHorizontal && bounds(lowestIndex[0], lowestIndex[1], "up", board) == 3
            && board[lowestIndex[0]][lowestIndex[1]] == 2
            && board[lowestIndex[0] + 1][lowestIndex[1]] == 2
            && board[lowestIndex[0] + 2][lowestIndex[1]] == 2
            && bounds(lowestIndex[0] + 2, lowestIndex[1], "down", board) == 3
        ) {
            
            resetPcState()
            return true
        }

        if (!isHorizontal && bounds(lowestIndex[0], lowestIndex[1], "up", board) == 3
            && board[lowestIndex[0]][lowestIndex[1]] == 2
            && board[lowestIndex[0] + 1][lowestIndex[1]] == 2
            && board[lowestIndex[0] + 2][lowestIndex[1]] == 2
            && board[lowestIndex[0] + 3][lowestIndex[1]] == 2
            && bounds(lowestIndex[0] + 3, lowestIndex[1], "down", board) == 3
        ) {
            
            resetPcState()
            return true
        }

        if (!isHorizontal && bounds(lowestIndex[0], lowestIndex[1], "up", board) == 3
            && board[lowestIndex[0]][lowestIndex[1]] == 2
            && board[lowestIndex[0] + 1][lowestIndex[1]] == 2
            && board[lowestIndex[0] + 2][lowestIndex[1]] == 2
            && board[lowestIndex[0] + 3][lowestIndex[1]] == 2
            && board[lowestIndex[0] + 4][lowestIndex[1]] == 2
            && bounds(lowestIndex[0] + 4, lowestIndex[1], "down", board) == 3
        ) {
            
            resetPcState()
            return true
        }
    }
    //Chequea si en determinada direccion se termina el tablero o se encuentra un tiro fallado
    const bounds = (row, cell, direction, board) => {
        console.log(row, cell)
        if (direction == "left") {
            if (cell == 0) {
                return 3;
            } else
                return board[row][cell - 1];
        }
        if (direction == "right") {
            if (cell == 9) {
                return 3;
            } else {
                return board[row][cell + 1];
            }
        }
        if (direction == "up") {
            if (row == 0) {
                return 3;
            } else
                return board[row - 1][cell];
        }
        if (direction == "down") {
            if (cell == 9) {
                return 3;
            } else
                return board[row + 1][cell];
        }
    }

    //Resetea el estado de la pc para que busque aleatoriamente
    const resetPcState = () => {
        setIsHorizontal(true)
        setTrackingShip(false)
        setPrevGuesses([])
        setCurrentShipHits([])
        setCurrentHitCount(0)
    }

    //Busca el extremo del barco al tratar de encontrar cual fue el indice mas bajo de todos los hits que recibio.
    const getLowestIndex = (arr) => {
        let lowest = 9;
        let i = 0;
        arr.map((value, index) => {
            const val = isHorizontal ? value[1] : value[0];
            if (val < lowest) {
                lowest = val
                i = index
            }
        })
        return arr[i]
    }


    return (
        <div className="container ">
            <div className="row player">
                <h5>Tablero Jugador</h5>
                {playerBoard.map((row, rowIndex) => {
                    return (
                        <div className="row" key={rowIndex}>
                            {row.map((cell, cellIndex) => {
                                return (
                                    <button
                                        disabled={playerBoard[rowIndex][cellIndex] == 2 || playerBoard[rowIndex][cellIndex] == 3}
                                        className={`cell ${cell == 0 || cell==1 ? "blue" : "" }` + `${cell == 2 ? "red" : ""} ${cell == 3 ? "orange":"" }`}
                                        key={cellIndex}
                                    >
                                        
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            <div className="row pc">
            <h5>Tablero Maquina</h5>
                {pcBoard.map((row, rowIndex) => {
                    return (
                        <div className="row" key={rowIndex}>
                            {row.map((cell, cellIndex) => {
                                return (
                                    <button
                                        className={`cell ${cell == 0 || cell==1 ? "blue" : "" }` + `${cell == 2 ? "red" : ""} ${cell == 3 ? "orange":"" }`}
                                        key={cellIndex}
                                        disabled={pcBoard[rowIndex][cellIndex] == 2 || pcBoard[rowIndex][cellIndex] == 3 || activePlayer === 0 || gameOver}
                                        onClick={() => {
                                            let board = [...pcBoard]
                                            if (pcBoard[rowIndex][cellIndex] == 0) {
                                                board[rowIndex].splice(cellIndex, 1, 3);
                                            } else if (pcBoard[rowIndex][cellIndex] == 1) {
                                                board[rowIndex].splice(cellIndex, 1, 2);
                                                let hitTotal = playerHit;
                                                setPlayerHit(hitTotal + 1)
                                                if (playerHit == 17) {
                                                    setGameOver(true)
                                                    alert("game over")
                                                }
                                            }
                                            setPcBoard(board);
                                            setActivePlayer(0);
                                        }}
                                    >
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default Game