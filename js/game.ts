import {
    GameStatus, 
    GameState, 
    puzzleBlock, 
    t_Grid, 
    t_Block, 
    t_MatrixDimension, 
    t_MousePos,
    t_SliderPuzzle
} from './sliderPuzzle.js';

function initPuzzleBlocks(grid: t_Grid[] = [], sprite: HTMLImageElement, rows: number, cols: number) {
    
    // build puzzle pieces
    const spriteWidth: number = sprite.width / cols;
    const spriteHeight: number = sprite.height / rows;
    GameState.gameBlocks = []; 
    GameState.SOLVABLE_PUZZLE = false;

    for (let row = 0; row < rows; ++ row) {
        for (let col = 0; col < cols; ++col) {
            let blockIndex = row * cols + col;
            let spriteX = col * spriteWidth;
            let spriteY = row * spriteHeight;
            GameState.gameBlocks.push(
                new puzzleBlock(
                    blockIndex, 
                    spriteX, 
                    spriteY
                )
            );
        }
    }

    while(!GameState.SOLVABLE_PUZZLE) {
        // array of ints [0,1,2,3... WxH] to help randomize pieces on grid
        let pieces: number[] = Array.from(Array(grid.length).keys())

        // randomly assign puzzle pieces on grid
        let str: string = '';
        GameState.initGridIndices = [];

        for (let i = 0; i < grid.length; ++i) {
            let pieceIndex: number = Math.floor(Math.random() * pieces.length);
            grid[i].block = GameState.gameBlocks[pieces[pieceIndex]];

            GameState.initGridIndices.push(grid[i].block.index);

            if (GameState.DEBUG) {
                str += `${grid[i].block.index}, `;
                if ((i+1) % cols == 0) {
                    console.log(str);
                    str = '';
                }
            }
            
            if (pieces[pieceIndex] == grid.length - 1) {
                GameState.BLANK_PIECE_INDEX = i;
            }
            pieces.splice(pieceIndex, 1);
        }

        let evenInversion: boolean = totalInversions() % 2 == 0;
        let oddNumCols: boolean = cols % 2 != 0
        GameState.SOLVABLE_PUZZLE = evenInversion && oddNumCols;
    }

    return grid
}

function getInitGrid(rows: number, cols: number, sprite: HTMLImageElement) {
    let tempGrid: t_Grid[] = [];
    for (let row=0; row<rows; ++row) {
        for (let col=0; col<cols; ++col) {
            tempGrid.push({ 
                x: col * GameState.BLOCK_WIDTH, 
                y: row * GameState.BLOCK_HEIGHT,
                row,
                col,
                block: null
            });
        }
    }

    tempGrid = initPuzzleBlocks(tempGrid, sprite, rows, cols);

    return tempGrid;
}

const sliderPuzzle: t_SliderPuzzle = {
    canvas: document.getElementById("game-canvas"),
    gameGrid: [],
    numRows: 0,
    numCols: 0,
    sprite: new Image(),
    context: null,
    interval: 0,
    start: function(rows = 2, cols = 2) {
        this.context = sliderPuzzle.canvas!.getContext("2d");
        GameState.BLOCK_WIDTH = Math.floor(this.canvas.width / cols);
        GameState.BLOCK_HEIGHT = Math.floor(this.canvas.height / rows);
        this.sprite.src = "img/Googler-Richard-Tien.png";
        this.numRows = rows;
        this.numCols = cols;
        this.gameGrid = getInitGrid(rows, cols, this.sprite);
        this.interval = setInterval(updateGame, 20);  
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    draw: function() {
        switch (GameState.STATUS) {
            case GameStatus.IN_PROGESS:
                const spriteWidth: number = this.sprite.width / this.numCols;
                const spriteHeight: number = this.sprite.height / this.numRows;
                for (let i = 0; i < this.gameGrid.length; ++i) {
                    const {x, y, block} = this.gameGrid[i];
                    if (i != GameState.BLANK_PIECE_INDEX) {
                        this.context.drawImage(
                            this.sprite, 
                            block.spriteX, 
                            block.spriteY, 
                            spriteWidth, 
                            spriteHeight, 
                            x, y, 
                            GameState.BLOCK_WIDTH, 
                            GameState.BLOCK_HEIGHT
                        );
                    } else {
                        this.context.fillStyle = "grey";
                        this.context.fillRect(x, y, GameState.BLOCK_WIDTH, GameState.BLOCK_HEIGHT);
                    }
                    
                }
                break;
            case GameStatus.SOLVED:
                this.showSolution();
                break;
            case GameStatus.SHOW_HINT:
                this.context.drawImage(this.sprite, 0, 0, this.canvas.width, this.canvas.height);
                break;
            case GameStatus.SHUFFLE_BOARD:
                this.shuffleBoard();
                break;
            default:
                break;
        }
    },
    swapPuzzleBlocks(index1: number, index2: number) {
        const tempBlock: t_Block = this.gameGrid[index1].block;
        this.gameGrid[index1].block = this.gameGrid[index2].block;
        this.gameGrid[index2].block = tempBlock;
    },
    slideablePiece(piece: t_Grid) {
        const blankPiece: t_Grid = this.gameGrid[GameState.BLANK_PIECE_INDEX];
        return ((piece.row == blankPiece.row && piece.col == blankPiece.col - 1) ||
            (piece.row == blankPiece.row && piece.col == blankPiece.col + 1) ||
            (piece.row == blankPiece.row - 1 && piece.col == blankPiece.col) ||
            (piece.row == blankPiece.row + 1 && piece.col == blankPiece.col));
    },
    checkWinState() {
        let winState: boolean = true;

        for (let gridIndex = 0; gridIndex < this.gameGrid.length; ++gridIndex) {
            const { block } = this.gameGrid[gridIndex];
            winState &&= (block.index == gridIndex);
            if (!winState) break;
        }

        if (winState) { 
            GameState.STATUS = GameStatus.SOLVED;
            clearTimeIntervals();
        }
    },
    showSolution() {
        if (GameState.GLOBAL_ALPHA < 1) {
            GameState.GLOBAL_ALPHA += GameState.DELTA_ALPHA;
        }
        this.context.globalAlpha = GameState.GLOBAL_ALPHA;
        this.context.drawImage(this.sprite, 0, 0, this.canvas.width, this.canvas.height);
    },
    shuffleBoard() {
        this.gameGrid = getInitGrid(this.numRows, this.numCols, this.sprite);
        if (GameState.DEBUG) 
            console.log(`inversions: ${totalInversions()}`);

        GameState.STATUS = GameStatus.IN_PROGESS;
    },
    _setBlankPieceIdx(index1: number, index2: number) {
        if (GameState.BLANK_PIECE_INDEX == index1 || GameState.BLANK_PIECE_INDEX == index2) {
            GameState.BLANK_PIECE_INDEX = (GameState.BLANK_PIECE_INDEX == index1)
            ? index2 
            : index1;
        }
    },
    insertionSortSolve(compareIndex: number = 0) { // O(n^2)
        const blockToInsertIndex: number = compareIndex + 1;
        if (blockToInsertIndex < sliderPuzzle.gameGrid.length) {
            sliderPuzzle._insert(compareIndex, blockToInsertIndex); // O(nlogn)
        }
        GameState.sortTimeoutId.push(
            setTimeout(() => {
                this.insertionSortSolve(blockToInsertIndex);
            }, 300)
        );
    },
    _insert(compareIndex: number, blockToInsertIndex: number) {
        let currentIndex: number;
        const blockToInsert = this.gameGrid[blockToInsertIndex].block;

        for (currentIndex = compareIndex;
             currentIndex >= 0 && this.gameGrid[currentIndex].block.index > blockToInsert.index;
             --currentIndex)
        {
            const nextIndex: number = currentIndex + 1;
            this.gameGrid[nextIndex].block = this.gameGrid[currentIndex].block;

            if (currentIndex == GameState.BLANK_PIECE_INDEX) {
                if (GameState.DEBUG) {
                    console.log("Blank moved");
                }
                GameState.BLANK_PIECE_INDEX = nextIndex;
            }
        }
        
        this.gameGrid[currentIndex + 1].block = blockToInsert;
        if (blockToInsertIndex == GameState.BLANK_PIECE_INDEX) {
            if (GameState.DEBUG) {
                console.log("Blank inserted");
            }
            GameState.BLANK_PIECE_INDEX = currentIndex + 1;
        }
    },
    bubbleSortSolve(firstIndex: number = 0, swaps: number = 0) { // O(n^2)
        if (firstIndex < this.gameGrid.length - 1) {
            const secondIndex: number = firstIndex + 1;
            
            if (this.gameGrid[firstIndex].block.index > this.gameGrid[secondIndex].block.index) {
                sliderPuzzle.swapPuzzleBlocks(firstIndex, secondIndex);
                sliderPuzzle._setBlankPieceIdx(firstIndex, secondIndex);
                ++swaps;
            }
            GameState.sortTimeoutId.push(
                setTimeout(function(){ sliderPuzzle.bubbleSortSolve(secondIndex, swaps); }, 50)
            );
        } else if (swaps) {
            GameState.sortTimeoutId.push(
                setTimeout(function(){ sliderPuzzle.bubbleSortSolve(); }, 50)
            );
        }
    },
    selectionSortSolve(currentIndex: number = 0) { // O(n^2)
        if (currentIndex < this.gameGrid.length - 1) {
            let minIndex: number = currentIndex;
            
            for (let i = currentIndex + 1; i < this.gameGrid.length; ++i)
                minIndex = (this.gameGrid[minIndex].block.index < this.gameGrid[i].block.index) ? minIndex : i;
            
            if (currentIndex != minIndex) {
                sliderPuzzle.swapPuzzleBlocks(minIndex, currentIndex);
                sliderPuzzle._setBlankPieceIdx(minIndex, currentIndex);
            }
            GameState.sortTimeoutId.push(
                setTimeout(function(){ sliderPuzzle.selectionSortSolve(currentIndex + 1); }, 150)
            );
        }
    },
    quickSortSolve(startIndex: number = 0, endIndex: number = sliderPuzzle.gameGrid.length-1) { // O(nlogn)
        if (startIndex < endIndex) {
            const pivot: number = sliderPuzzle._partition(startIndex, endIndex);
            GameState.sortTimeoutId.push(
                setTimeout(function(){ sliderPuzzle.quickSortSolve(startIndex, pivot - 1); }, 250)
            );
            GameState.sortTimeoutId.push(
                setTimeout(function(){ sliderPuzzle.quickSortSolve(pivot + 1, endIndex); }, 250)
            );
        }
    },
    _partition(lessPtr: number, pivotPtr: number) {
        let greaterPtr = lessPtr;
        let unpartitionedPtr = lessPtr;
        let pivotPos: number;
        
        while (pivotPtr > unpartitionedPtr) {
            if (this.gameGrid[unpartitionedPtr].block.index < this.gameGrid[pivotPtr].block.index) {
                sliderPuzzle.swapPuzzleBlocks(unpartitionedPtr, greaterPtr);
                sliderPuzzle._setBlankPieceIdx(unpartitionedPtr, greaterPtr);
                ++greaterPtr;
            }
            ++unpartitionedPtr;
        }
        
        if (this.gameGrid[unpartitionedPtr].block.index == this.gameGrid[pivotPtr].block.index) {
            sliderPuzzle.swapPuzzleBlocks(pivotPtr, greaterPtr);
            sliderPuzzle._setBlankPieceIdx(pivotPtr, greaterPtr);
        }
        
        pivotPos = greaterPtr;
        
        return pivotPos;
    },
    async mergeSortSolve(startIndex: number = 0, endIndex: number = sliderPuzzle.gameGrid.length - 1) { // O(nlogn)
        if (startIndex < endIndex) {
            // divide & conquer
            const mid: number = Math.floor((startIndex + endIndex) >> 1);
            
            Promise.resolve()
                .then(() => sliderPuzzle.mergeSortSolve(startIndex, mid))
                .then(() => sliderPuzzle.mergeSortSolve(mid + 1, endIndex))
                .then(() => {
                    GameState.sortIntervalId.push(
                        setInterval(() => {
                            if (GameState.STATUS == GameStatus.SOLVED) {
                                clearTimeIntervals();
                            } else {
                                sliderPuzzle._merge(startIndex, mid, endIndex);
                            }
                        }, 250)
                    );
                });      
        }
    },
    _merge(startIndex: number, mid: number, endIndex: number) {
        if (GameState.STATUS == GameStatus.SOLVED) return;

        let tempBlock: t_Block[] = [];
        let l_index: number = startIndex;
        let r_index: number = mid + 1;
        const blankBlock: t_Block = this.gameGrid[GameState.BLANK_PIECE_INDEX].block;
        while (l_index <= mid && r_index <= endIndex)
        {
            if (this.gameGrid[l_index].block.index <= this.gameGrid[r_index].block.index) {
                tempBlock.push(this.gameGrid[l_index++].block);
            } else {
                tempBlock.push(this.gameGrid[r_index++].block);
            }
        }
        
        while (l_index <= mid) {
            tempBlock.push(this.gameGrid[l_index++].block);
        }
        
        while (r_index <= endIndex) {
            tempBlock.push(this.gameGrid[r_index++].block);
        }
        
        // add merged elements back to the gameGrid
        tempBlock.forEach((block: t_Block, index: number) => { 
            if (block == blankBlock) {
                GameState.BLANK_PIECE_INDEX = startIndex + index;
            }
            this.gameGrid[startIndex + index].block = block; 
        });
    },
    async heapSortSolve() { // T: O(nlogn), S: O(1)
        // build heap
        Promise.resolve()
            .then(() => sliderPuzzle._buildMaxHeap())
            .then(() => {
                // sort array
                sliderPuzzle._heapSort();
            });
    },
    async _heapSort(endIndex: number = sliderPuzzle.gameGrid.length) {
        if (endIndex > 0) {
            // replace root with last node & heapify down
            Promise.resolve()
                .then(() => {
                    GameState.sortIntervalId.push(
                        setInterval(() => {
                            if (GameState.STATUS == GameStatus.SOLVED) {
                                clearTimeIntervals();
                            } else {
                                sliderPuzzle.swapPuzzleBlocks(0, endIndex);
                                sliderPuzzle._setBlankPieceIdx(0, endIndex);
                            }
                        }, 100)
                    );
                })
                .then(() => {
                    sliderPuzzle._heapifyDown(0, endIndex);
                })
                .then(() => sliderPuzzle._heapSort(--endIndex));
        }
    },
    async _buildMaxHeap(i: number = 0) {
        if (i < this.gameGrid.length) {
            Promise.resolve()
            .then(() => sliderPuzzle._heapifyUp(i))
            .then(() => sliderPuzzle._buildMaxHeap(++i));
        }
    },
    _leftChild(key: number) { // O(1)
        const l: number = Math.floor((key << 1) + 1);
        return (l < this.gameGrid.length) ? l : -Infinity;
    },
    _rightChild(key: number) { // O(1)
        const r: number = Math.floor((key << 1) + 2);
        return (r < this.gameGrid.length) ? r : -Infinity;
    },  
    _parent(key: number) { // O(1)
        if (key == 0) return -Infinity;
        
        const p: number = Math.floor((key - 1) >> 1);
        return (p >= 0) ? p : -Infinity;
    },
    async _heapifyUp(key: number) { // O(log n)
        const p: number = sliderPuzzle._parent(key);
        
        if (p != -Infinity && this.gameGrid[p].block.index < this.gameGrid[key].block.index) {
            Promise.resolve()
            .then(() => {
                GameState.sortIntervalId.push(
                    setInterval(() => {
                        if (GameState.STATUS == GameStatus.SOLVED) {
                            clearTimeIntervals();
                        } else {
                            sliderPuzzle.swapPuzzleBlocks(p, key);
                            sliderPuzzle._setBlankPieceIdx(p, key)
                        }
                    }, 100)
                )
            })
            .then(() => sliderPuzzle._heapifyUp(p));          
        }
    }, 
    _heapifyDown(key: number, endIndex: number) { // O(log n)
        if (key != -Infinity && key < endIndex) {
            const gg: t_Grid[] = this.gameGrid;
            const l: number = sliderPuzzle._leftChild(key);
            const r: number = sliderPuzzle._rightChild(key);
            let heapKey: number;

            if (l != -Infinity && r != -Infinity) {
                if (r < endIndex && gg[l].block.index > gg[r].block.index && gg[l].block.index > gg[key].block.index) {
                    heapKey = l;
                } else if (r < endIndex && gg[r].block.index > gg[key].block.index) {
                    heapKey = r;
                } else if (l < endIndex && gg[l].block.index > gg[key].block.index) {
                    heapKey = l;
                }
            } else if (l < endIndex && l != -Infinity && r == -Infinity) {
                if (gg[l].block.index > gg[key].block.index) {
                    heapKey = l;
                }
            } else if (r < endIndex && r != -Infinity && l == -Infinity) {
                if (gg[r].block.index > gg[key].block.index) {
                    heapKey = r;
                }
            }

            Promise.resolve()
            .then(() => {
                GameState.sortIntervalId.push(
                    setInterval(() => {
                        if (GameState.STATUS == GameStatus.SOLVED) {
                            clearTimeIntervals();
                        } else {
                            sliderPuzzle.swapPuzzleBlocks(heapKey, key);
                            sliderPuzzle._setBlankPieceIdx(heapKey, key);
                        }
                    }, 100)
                )
            })
            .then(() => sliderPuzzle._heapifyDown(heapKey, endIndex));
            
        }
    }
};

function totalInversions() { // O(nlogn)
    let inversions: number = 0;
    for (let i = 0; i < GameState.initGridIndices.length; ++i) {
        for (let j = i+1; j < GameState.initGridIndices.length; ++j) {
            if (GameState.initGridIndices[i] > GameState.initGridIndices[j])
                ++inversions;
        }
    }

    return inversions;
}

function getGridDimensions() { // O(1)
    let dimensions: t_MatrixDimension = {rows: 0, cols: 0};

    switch (GameState.DIFFICULTY) {
        case GameStatus.EASY:
            dimensions = {rows: 3, cols: 3};
            break;
        case GameStatus.MEDIUM:
            dimensions = {rows: 5, cols: 5};
            break;
        case GameStatus.HARD:
            dimensions = {rows: 7, cols: 7};
            break;
        case GameStatus.GOOGLER:
            dimensions = {rows: 9, cols: 9};
            break;
    }

    return dimensions;
};

function updateGame() {
    sliderPuzzle.clear();
    sliderPuzzle.draw();
    sliderPuzzle.checkWinState()
}

//
// Event System
//

function getMousePos(event: any) { // O(1)
    const clientRect = sliderPuzzle.canvas!.getBoundingClientRect();
    return {
        x: event.clientX - clientRect.left,
        y: event.clientY - clientRect.top
    };
}

function moveup() { // O(1)
    const { numRows, numCols } = sliderPuzzle;
    const pieceAboveIndex: number = GameState.BLANK_PIECE_INDEX + numCols;

    if (pieceAboveIndex < numRows * numCols) {
        sliderPuzzle.swapPuzzleBlocks(pieceAboveIndex, GameState.BLANK_PIECE_INDEX);
        GameState.BLANK_PIECE_INDEX = pieceAboveIndex;
    }
}

function movedown() { // O(1)
    const pieceAboveIndex: number = GameState.BLANK_PIECE_INDEX - sliderPuzzle.numCols;

    if (pieceAboveIndex >= 0) {
        sliderPuzzle.swapPuzzleBlocks(pieceAboveIndex, GameState.BLANK_PIECE_INDEX);
        GameState.BLANK_PIECE_INDEX = pieceAboveIndex;
    }
}

function moveleft() { // O(1)
    const pieceRightIndex: number = GameState.BLANK_PIECE_INDEX + 1
    const { gameGrid, numRows, numCols } = sliderPuzzle;
    if (pieceRightIndex < numRows * numCols && gameGrid[pieceRightIndex].col > 0) {
        sliderPuzzle.swapPuzzleBlocks(pieceRightIndex, GameState.BLANK_PIECE_INDEX);
        GameState.BLANK_PIECE_INDEX = pieceRightIndex;
    }
}

function moveright() { // O(1)
    const pieceLeftIndex: number = GameState.BLANK_PIECE_INDEX - 1
    const { gameGrid, numCols } = sliderPuzzle;
    if (pieceLeftIndex >= 0 && gameGrid[pieceLeftIndex].col < numCols - 1) {
        sliderPuzzle.swapPuzzleBlocks(pieceLeftIndex, GameState.BLANK_PIECE_INDEX);
        GameState.BLANK_PIECE_INDEX = pieceLeftIndex;
    }
}

function showHint() { // O(1)
    if (GameState.STATUS != GameStatus.SHOW_HINT) {
        GameState.PRIOR_STATUS = GameState.STATUS;
        GameState.STATUS = GameStatus.SHOW_HINT;
    }
}

function hideHint() { // O(1)
    GameState.STATUS = GameState.PRIOR_STATUS;
}

let easyBtn: HTMLElement | null = document.getElementById("easy-puzzle");
let mediumBtn: HTMLElement | null = document.getElementById("medium-puzzle");
let hardBtn: HTMLElement | null = document.getElementById("hard-puzzle");
let googlerBtn: HTMLElement | null = document.getElementById("googler-puzzle");
let insertBtn: HTMLElement | null = document.getElementById("insertion-btn");
let bubbleBtn: HTMLElement | null = document.getElementById("bubble-btn");
let selectBtn: HTMLElement | null = document.getElementById("selection-btn");
let quickBtn: HTMLElement | null = document.getElementById("quick-btn");
let mergeBtn: HTMLElement | null = document.getElementById("merge-btn");
let heapBtn: HTMLElement | null = document.getElementById("heap-btn");
let hintBtn: HTMLElement | null = document.getElementById("hint-btn");

function clearTimeIntervals() {
    while(GameState.sortIntervalId.length) {
        clearInterval(GameState.sortIntervalId.pop());
    }

    while (GameState.sortTimeoutId.length) {
        clearTimeout(GameState.sortTimeoutId.pop());
    }
}

easyBtn?.addEventListener('click', () => {
    clearTimeIntervals();

    easyBtn?.classList.add("easy-puzzle");
    mediumBtn?.classList.remove("medium-puzzle");
    hardBtn?.classList.remove("hard-puzzle");
    googlerBtn?.classList.remove("googler-puzzle");

    clearSortBtnHighlignt();

    startGame(GameStatus.EASY);
}, false);


mediumBtn?.addEventListener('click', () => {
    clearTimeIntervals();

    easyBtn?.classList.remove("easy-puzzle");
    mediumBtn?.classList.add("medium-puzzle");
    hardBtn?.classList.remove("hard-puzzle");
    googlerBtn?.classList.remove("googler-puzzle");

    clearSortBtnHighlignt();

    startGame(GameStatus.MEDIUM);
}, false);

hardBtn?.addEventListener('click', () => {
    clearTimeIntervals();

    easyBtn?.classList.remove("easy-puzzle");
    mediumBtn?.classList.remove("medium-puzzle");
    hardBtn?.classList.add("hard-puzzle");
    googlerBtn?.classList.remove("googler-puzzle");

    clearSortBtnHighlignt();

    startGame(GameStatus.HARD);
}, false);

googlerBtn?.addEventListener('click', () => {
    clearTimeIntervals();
    
    easyBtn?.classList.remove("easy-puzzle");
    mediumBtn?.classList.remove("medium-puzzle");
    hardBtn?.classList.remove("hard-puzzle");
    googlerBtn?.classList.add("googler-puzzle");

    clearSortBtnHighlignt();

    startGame(GameStatus.GOOGLER);
}, false);

insertBtn?.addEventListener('click', () => {
    insertBtn?.classList.add("selected-sort-btn");
    bubbleBtn?.classList.remove("selected-sort-btn");
    selectBtn?.classList.remove("selected-sort-btn");
    quickBtn?.classList.remove("selected-sort-btn");
    mergeBtn?.classList.remove("selected-sort-btn");
    heapBtn?.classList.remove("selected-sort-btn");

    sliderPuzzle.insertionSortSolve();
}, false);

bubbleBtn?.addEventListener('click', () => {
    insertBtn?.classList.remove("selected-sort-btn");
    bubbleBtn?.classList.add("selected-sort-btn");
    selectBtn?.classList.remove("selected-sort-btn");
    quickBtn?.classList.remove("selected-sort-btn");
    mergeBtn?.classList.remove("selected-sort-btn");
    heapBtn?.classList.remove("selected-sort-btn");

    sliderPuzzle.bubbleSortSolve();
}, false);

selectBtn?.addEventListener('click', () => {
    insertBtn?.classList.remove("selected-sort-btn");
    bubbleBtn?.classList.remove("selected-sort-btn");
    selectBtn?.classList.add("selected-sort-btn");
    quickBtn?.classList.remove("selected-sort-btn");
    mergeBtn?.classList.remove("selected-sort-btn");
    heapBtn?.classList.remove("selected-sort-btn");

    sliderPuzzle.selectionSortSolve();
}, false);

quickBtn?.addEventListener('click', () => {
    insertBtn?.classList.remove("selected-sort-btn");
    bubbleBtn?.classList.remove("selected-sort-btn");
    selectBtn?.classList.remove("selected-sort-btn");
    quickBtn?.classList.add("selected-sort-btn");
    mergeBtn?.classList.remove("selected-sort-btn");
    heapBtn?.classList.remove("selected-sort-btn");

    sliderPuzzle.quickSortSolve();
}, false);

mergeBtn?.addEventListener('click', () => {
    insertBtn?.classList.remove("selected-sort-btn");
    bubbleBtn?.classList.remove("selected-sort-btn");
    selectBtn?.classList.remove("selected-sort-btn");
    quickBtn?.classList.remove("selected-sort-btn");
    mergeBtn?.classList.add("selected-sort-btn");
    heapBtn?.classList.remove("selected-sort-btn");

    sliderPuzzle.mergeSortSolve();
}, false);

heapBtn?.addEventListener('click', () => {
    insertBtn?.classList.remove("selected-sort-btn");
    bubbleBtn?.classList.remove("selected-sort-btn");
    selectBtn?.classList.remove("selected-sort-btn");
    quickBtn?.classList.remove("selected-sort-btn");
    mergeBtn?.classList.remove("selected-sort-btn");
    heapBtn?.classList.add("selected-sort-btn");

    sliderPuzzle.heapSortSolve();
}, false);

hintBtn?.addEventListener('mousedown', () => {
    showHint();
});

hintBtn?.addEventListener('mouseup', () => {
    hideHint();
});

function clearSortBtnHighlignt() {
    insertBtn?.classList.remove("selected-sort-btn");
    bubbleBtn?.classList.remove("selected-sort-btn");
    selectBtn?.classList.remove("selected-sort-btn");
    quickBtn?.classList.remove("selected-sort-btn");
    mergeBtn?.classList.remove("selected-sort-btn");
    heapBtn?.classList.remove("selected-sort-btn");
}

sliderPuzzle.canvas?.addEventListener('mousemove', (event: Event) => {
    const mouse: t_MousePos = getMousePos(event);

    sliderPuzzle.gameGrid.forEach((piece: t_Grid) => {
        if (mouse.x >= piece.x && mouse.x <= piece.x + GameState.BLOCK_WIDTH &&
            mouse.y >= piece.y && mouse.y <= piece.y + GameState.BLOCK_HEIGHT &&
            GameState.STATUS == GameStatus.IN_PROGESS) {

            if (sliderPuzzle.slideablePiece(piece)) {
                sliderPuzzle.canvas?.classList.add('cursor-pointer');
            } else {
                sliderPuzzle.canvas?.classList.remove('cursor-pointer');
            } 
        }
    })
}, false);

sliderPuzzle.canvas?.addEventListener('mousedown', (event: Event) => {
    const mouse: t_MousePos = getMousePos(event);

    sliderPuzzle.gameGrid.forEach((piece: t_Grid, index: number) => {
        if (mouse.x >= piece.x && mouse.x <= piece.x + GameState.BLOCK_WIDTH &&
            mouse.y >= piece.y && mouse.y <= piece.y + GameState.BLOCK_HEIGHT &&
            sliderPuzzle.slideablePiece(piece) &&
            GameState.STATUS == GameStatus.IN_PROGESS) {
                sliderPuzzle.swapPuzzleBlocks(index, GameState.BLANK_PIECE_INDEX);
                GameState.BLANK_PIECE_INDEX = index;
            }
    })
 }, false);

document.addEventListener('keydown', e => {
    let key: string = e.key || String.fromCharCode(e.keyCode);
    key = key.toLowerCase();

    switch(key) {
        case 'w':
        case "arrowup": 
            e.preventDefault();
            moveup();
            break;
        case 's':
        case "arrowdown": 
            e.preventDefault();
            movedown();
            break;
        case 'a':
        case "arrowleft": 
            e.preventDefault();
            moveleft();
            break;
        case 'd':
        case "arrowright": 
            e.preventDefault();
            moveright();
            break;
        case 'h':
            showHint();
            break;
    }
}, false);

document.addEventListener('keyup', (e: KeyboardEvent) => {
    let key: string = e.key || String.fromCharCode(e.keyCode);
    key = key.toLowerCase();

    switch(key) {
        case 'h':
            hideHint();
            break;
    }
}, false);

// Event System End

function mobileCheck() {
    const deviceTypes: RegExp[] = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return deviceTypes.some((deviceType: RegExp) => {
        return navigator.userAgent.match(deviceType);
    });
}

function messageForMobile() {

    if (mobileCheck()) {
        document.getElementById('main')!.style.display = 'none';
        document.getElementById('mobile-device-msg')!.classList.remove('hidden')
        document.getElementById('mobile-device-msg')!.style.display = 'flex';
    }
}

//
// Game Entry Point
//
function startGame(difficulty: number = GameStatus.MEDIUM) {
    messageForMobile();
    console.clear();
    console.log(`
    ____                   __                
    /  / _   /           / _     _ /_ _  _| 
   (  /)(//)/( (/()(/,  (__)()()(/((-/ _) . 
               /               _/           
`);
    console.log("Richard Tien - Lead Engineer @ Google");

    GameState.STATUS = GameStatus.IN_PROGESS;
    GameState.DIFFICULTY = difficulty;
    GameState.DEBUG = false;

    const dim: t_MatrixDimension = getGridDimensions();

    sliderPuzzle.start(dim.rows, dim.cols);

    if (GameState.DEBUG) 
        console.log(`inversions: ${totalInversions()}`);
}

document.body.onload = () => startGame();

// Game Entry Point End