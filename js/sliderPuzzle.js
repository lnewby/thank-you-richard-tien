;
;
;
;
;
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
;
export const GameState = {
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
    constructor(index, spriteX = 0, spriteY = 0, row = 0, col = 0) {
        this.index = index;
        this.spriteX = spriteX;
        this.spriteY = spriteY;
        this.row = row;
        this.col = col;
        this.deltaX = 0;
        this.deltaY = 0;
    }
}
//# sourceMappingURL=sliderPuzzle.js.map