export interface t_Block {
    index: number;
    spriteX: number;
    spriteY: number;
    row: number;
    col: number;
    deltaX: number;
    deltaY: number;
};

export interface t_Grid {
    x: number;
    y: number;
    row: number;
    col: number;
    block: any;
};

export interface t_MatrixDimension {
    rows: number;
    cols: number;
};

export interface t_SliderPuzzle {
    canvas: HTMLCanvasElement;
    gameGrid: t_Grid[];
    numRows: number;
    numCols: number;
    sprite: HTMLImageElement;
    context: any;
    interval: number;
    start: (rows: number, cols: number) => void;
    clear: Function;
    draw: Function;
    swapPuzzleBlocks: (index1: number, index2: number) => void;
    slideablePiece: (piece: t_Grid) => boolean;
    checkWinState: Function;
    showSolution: Function;
    shuffleBoard: Function;
    _setBlankPieceIdx: (index1: number, index2: number) => void;
    insertionSortSolve: (compareIndex?: number) => void;
    _insert: (compareIndex: number, blockToInsertIndex: number) => void;
    bubbleSortSolve: (firstIndex?: number, swaps?: number) => void;
    selectionSortSolve: (currentIndex?: number) => void;
    quickSortSolve: (startIndex?: number, endIndex?: number) => void;
    _partition: (lessPtr: number, pivotPtr: number) => number;
    mergeSortSolve: (startIndex?: number, endIndex?: number) => void;
    _merge: (startIndex: number, mid: number, endIndex: number) => void;
    heapSortSolve: Function;
    _heapSort: (endIndex?: number) => void;
    _buildMaxHeap: (i?: number) => void;
    _leftChild: (key: number) => number;
    _rightChild: (key: number) => number;
    _parent: (key: number) => number;
    _heapifyUp: (key: number) => void;
    _heapifyDown: (key: number, endIndex: number) => void;
};

export interface t_MousePos {
    x: number;
    y: number;
};

export const GameStatus = Object.freeze({
    IN_PROGESS: 1,
    SOLVED: 2,
    SHOW_HINT: 3,
    SHUFFLE_BOARD: 4,
    BUBBLE_SORT: 5,
    SELECTION_SORT: 6,
    QUICK_SORT: 7,
    MERGE_SORT: 8,
    INSERTION_SORT: 9,
    HEAP_SORT: 10,
    EASY: 11,
    MEDIUM: 12,
    HARD: 13,
    GOOGLER: 14
});

interface t_GameState {
    STATUS: number;
    DEBUG: boolean;
    PRIOR_STATUS: number;
    BLOCK_WIDTH: number;
    BLOCK_HEIGHT: number;
    BLANK_PIECE_INDEX: number;
    GLOBAL_ALPHA: number;
    DELTA_ALPHA: number;
    SOLVABLE_PUZZLE: boolean;
    DIFFICULTY: number;
    gameBlocks: t_Block[];
    initGridIndices: any;
    sortTimeoutId: number[];
    sortIntervalId: number[];
};

export const GameState: t_GameState = {
    STATUS: GameStatus.IN_PROGESS,
    DEBUG: false,
    PRIOR_STATUS: GameStatus.IN_PROGESS,
    BLOCK_WIDTH: 90,
    BLOCK_HEIGHT: 90,
    BLANK_PIECE_INDEX: 0,
    GLOBAL_ALPHA: 0,
    DELTA_ALPHA: 0.05,
    SOLVABLE_PUZZLE: false,
    DIFFICULTY: GameStatus.MEDIUM,
    gameBlocks: [],
    initGridIndices: [],
    sortTimeoutId: [],
    sortIntervalId: []
};

export class puzzleBlock {
    index: number;
    spriteX: number;
    spriteY: number;
    row: number;
    col: number;
    deltaX: number;
    deltaY: number;

    constructor(
        index: number, 
        spriteX:number = 0, 
        spriteY:number = 0, 
        row:number = 0, 
        col:number = 0) 
    {
        this.index = index;
        this.spriteX = spriteX;
        this.spriteY = spriteY;
        this.row = row;
        this.col = col;
        this.deltaX = 0;
        this.deltaY = 0;
    }
}