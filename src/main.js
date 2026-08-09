const MAIN_WIDTH = 400;
const MAIN_HEIGHT = 900;

const AUX_WIDTH = 220;

const TOP_RESERVED_HEIGHT = 100;

const COLUMNS = 10;
const ROWS = 20;
const CELL_SIZE = 40;

const NORMAL_FALL_DELAY = 500;
const FAST_FALL_DELAY = 50;

const PREVIEW_CELL_SIZE = 16;

const CHARACTER_POOL = "abcdefghijklmnopqrstuvwxyz_";


// ============================================================
// Tetromino definitions
// ============================================================

const TETROMINOES = {
  I: {
    color: 0x00ffff,
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  },

  J: {
    color: 0x0000ff,
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ]
  },

  L: {
    color: 0xffa500,
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ]
  },

  O: {
    color: 0xffff00,
    shape: [
      [1, 1],
      [1, 1]
    ]
  },

  S: {
    color: 0x00ff00,
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ]
  },

  T: {
    color: 0x800080,
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ]
  },

  Z: {
    color: 0xff0000,
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ]
  }
};


// ============================================================
// Shared auxiliary data
// ============================================================

let auxSceneRef = null;

let clearedPhrases = [];


// ============================================================
// Main Phaser config
// ============================================================

const mainConfig = {
  type: Phaser.AUTO,

  width: MAIN_WIDTH,
  height: MAIN_HEIGHT,

  parent: "game",

  backgroundColor: "#1a1a1a",

  scene: {
    create: createMainScene,
    update: updateMainScene
  }
};


// ============================================================
// Main scene
// ============================================================

function createMainScene() {
  this.board = createEmptyBoard();

  this.activePiece = null;
  this.nextPiece = null;

  this.gameStarted = false;
  this.gameOver = false;

  this.lastFallTime = 0;

  this.graphics = this.add.graphics();
  this.previewGraphics = this.add.graphics();

  this.letterTexts = [];
  this.previewTexts = [];


  // ----------------------------------------------------------
  // Top reserved area
  // ----------------------------------------------------------

  this.nextText = this.add
    .text(
      MAIN_WIDTH / 2,
      7,
      "NEXT",
      {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#cccccc"
      }
    )
    .setOrigin(0.5, 0);


  this.statusText = this.add
    .text(
      MAIN_WIDTH / 2,
      TOP_RESERVED_HEIGHT / 2,
      "",
      {
        fontFamily: "Arial",
        fontSize: "21px",
        color: "#ffffff",
        align: "center"
      }
    )
    .setOrigin(0.5);


  // ----------------------------------------------------------
  // Start screen
  // ----------------------------------------------------------

  this.startTitle = this.add
    .text(
      MAIN_WIDTH / 2,
      220,
      "LANGTRIS",
      {
        fontFamily: "Arial",
        fontSize: "42px",
        color: "#ffffff"
      }
    )
    .setOrigin(0.5);


  this.controlsText = this.add
    .text(
      MAIN_WIDTH / 2,
      380,
      [
        "Controls",
        "",
        "← / A    Move Left",
        "→ / D    Move Right",
        "↓ / S    Fast Drop",
        "SPACE    Rotate",
        "R        Restart"
      ],
      {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#cccccc",
        align: "center",
        lineSpacing: 8
      }
    )
    .setOrigin(0.5);


  this.startButton = this.add
    .text(
      MAIN_WIDTH / 2,
      600,
      "START GAME",
      {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#ffffff",
        backgroundColor: "#444444",

        padding: {
          left: 24,
          right: 24,
          top: 12,
          bottom: 12
        }
      }
    )
    .setOrigin(0.5)
    .setInteractive({
      useHandCursor: true
    });


  this.startButton.on("pointerover", () => {
    this.startButton.setStyle({
      backgroundColor: "#666666"
    });
  });


  this.startButton.on("pointerout", () => {
    this.startButton.setStyle({
      backgroundColor: "#444444"
    });
  });


  this.startButton.on("pointerdown", () => {
    startGame(this);
  });


  // ----------------------------------------------------------
  // Keyboard
  // ----------------------------------------------------------

  this.keys = this.input.keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN,

    a: Phaser.Input.Keyboard.KeyCodes.A,
    d: Phaser.Input.Keyboard.KeyCodes.D,
    s: Phaser.Input.Keyboard.KeyCodes.S,

    space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    r: Phaser.Input.Keyboard.KeyCodes.R
  });


  this.input.keyboard.on("keydown-LEFT", () => {
    if (canControl(this)) {
      movePiece(this, -1, 0);
    }
  });


  this.input.keyboard.on("keydown-A", () => {
    if (canControl(this)) {
      movePiece(this, -1, 0);
    }
  });


  this.input.keyboard.on("keydown-RIGHT", () => {
    if (canControl(this)) {
      movePiece(this, 1, 0);
    }
  });


  this.input.keyboard.on("keydown-D", () => {
    if (canControl(this)) {
      movePiece(this, 1, 0);
    }
  });


  this.input.keyboard.on("keydown-DOWN", () => {
    if (canControl(this)) {
      movePieceDown(this);
      this.lastFallTime = this.time.now;
    }
  });


  this.input.keyboard.on("keydown-S", () => {
    if (canControl(this)) {
      movePieceDown(this);
      this.lastFallTime = this.time.now;
    }
  });


  this.input.keyboard.on("keydown-SPACE", () => {
    if (canControl(this)) {
      rotatePiece(this);
    }
  });


  this.input.keyboard.on("keydown-R", () => {
    if (this.gameStarted || this.gameOver) {
      restartGame(this);
    }
  });


  showStartScreen(this);
}


// ============================================================
// Main update loop
// ============================================================

function updateMainScene(time) {
  if (!this.gameStarted || this.gameOver) {
    return;
  }


  const fastDrop =
    this.keys.down.isDown ||
    this.keys.s.isDown;


  const fallDelay =
    fastDrop
      ? FAST_FALL_DELAY
      : NORMAL_FALL_DELAY;


  if (time - this.lastFallTime >= fallDelay) {
    movePieceDown(this);

    this.lastFallTime = time;
  }
}


// ============================================================
// Start screen
// ============================================================

function showStartScreen(scene) {
  scene.gameStarted = false;

  scene.startTitle.setVisible(true);
  scene.controlsText.setVisible(true);
  scene.startButton.setVisible(true);

  scene.nextText.setVisible(false);
  scene.statusText.setVisible(false);

  scene.graphics.clear();
  scene.previewGraphics.clear();

  clearLetterTexts(scene);
  clearPreviewTexts(scene);
}


function hideStartScreen(scene) {
  scene.startTitle.setVisible(false);
  scene.controlsText.setVisible(false);
  scene.startButton.setVisible(false);

  scene.nextText.setVisible(true);
  scene.statusText.setVisible(true);
}


// ============================================================
// Start / restart
// ============================================================

function startGame(scene) {
  scene.board = createEmptyBoard();

  scene.activePiece = null;

  scene.gameStarted = true;
  scene.gameOver = false;

  scene.lastFallTime = scene.time.now;

  clearedPhrases = [];
  updateAuxiliaryList();

  hideStartScreen(scene);

  scene.statusText.setText("");

  scene.nextPiece = createRandomPiece();

  spawnPiece(scene);

  drawGame(scene);
}


function restartGame(scene) {
  scene.board = createEmptyBoard();

  scene.activePiece = null;

  scene.gameStarted = true;
  scene.gameOver = false;

  scene.lastFallTime = scene.time.now;

  clearedPhrases = [];
  updateAuxiliaryList();

  hideStartScreen(scene);

  scene.nextText.setVisible(true);
  scene.statusText.setText("");

  scene.nextPiece = createRandomPiece();

  spawnPiece(scene);

  drawGame(scene);
}


// ============================================================
// Control state
// ============================================================

function canControl(scene) {
  return (
    scene.gameStarted &&
    !scene.gameOver &&
    scene.activePiece !== null
  );
}


// ============================================================
// Board
// ============================================================

function createEmptyBoard() {
  const board = [];

  for (let row = 0; row < ROWS; row++) {
    board.push(
      new Array(COLUMNS).fill(null)
    );
  }

  return board;
}


// ============================================================
// Random characters
// ============================================================

function getRandomCharacter() {
  const index =
    Phaser.Math.Between(
      0,
      CHARACTER_POOL.length - 1
    );

  return CHARACTER_POOL[index];
}


// ============================================================
// Create a random Tetromino
// ============================================================

function createRandomPiece() {
  const names =
    Object.keys(TETROMINOES);

  const name =
    Phaser.Utils.Array.GetRandom(names);

  const definition =
    TETROMINOES[name];


  const cells =
    definition.shape.map(row =>
      row.map(value => {
        if (!value) {
          return null;
        }

        return {
          char: getRandomCharacter()
        };
      })
    );


  return {
    name: name,
    color: definition.color,
    cells: cells
  };
}


// ============================================================
// Spawn
// ============================================================

function spawnPiece(scene) {
  const source =
    scene.nextPiece;


  scene.activePiece = {
    name: source.name,
    color: source.color,

    cells:
      source.cells.map(row =>
        row.map(cell =>
          cell
            ? { char: cell.char }
            : null
        )
      ),

    x: Math.floor(
      (
        COLUMNS -
        source.cells[0].length
      ) / 2
    ),

    y: 0
  };


  // Generate the real next piece immediately.
  scene.nextPiece =
    createRandomPiece();


  drawNextPiece(scene);


  if (
    hasCollision(
      scene,
      scene.activePiece.x,
      scene.activePiece.y,
      scene.activePiece.cells
    )
  ) {
    endGame(scene);
  }
}


// ============================================================
// Movement
// ============================================================

function movePiece(scene, dx, dy) {
  const piece =
    scene.activePiece;

  if (!piece) {
    return false;
  }


  const newX =
    piece.x + dx;

  const newY =
    piece.y + dy;


  if (
    !hasCollision(
      scene,
      newX,
      newY,
      piece.cells
    )
  ) {
    piece.x = newX;
    piece.y = newY;

    drawGame(scene);

    return true;
  }


  return false;
}


function movePieceDown(scene) {
  if (!scene.activePiece) {
    return;
  }


  const moved =
    movePiece(scene, 0, 1);


  if (!moved) {
    lockPiece(scene);


    if (scene.gameOver) {
      drawGame(scene);
      return;
    }


    clearFullRows(scene);

    spawnPiece(scene);

    drawGame(scene);
  }
}


// ============================================================
// Rotation
// ============================================================

function rotatePiece(scene) {
  const piece =
    scene.activePiece;

  if (!piece) {
    return;
  }


  if (piece.name === "O") {
    return;
  }


  /*
    The CELL OBJECTS rotate through the matrix.

    We do NOT rotate any Phaser.Text objects.

    Therefore:
      - letter positions rotate with the piece
      - letters themselves always remain upright
  */

  const rotatedCells =
    rotateMatrixClockwise(
      piece.cells
    );


  if (
    !hasCollision(
      scene,
      piece.x,
      piece.y,
      rotatedCells
    )
  ) {
    piece.cells =
      rotatedCells;

    drawGame(scene);

    return;
  }


  // Simple wall kicks.
  const kickOffsets =
    [-1, 1, -2, 2];


  for (const offset of kickOffsets) {
    if (
      !hasCollision(
        scene,
        piece.x + offset,
        piece.y,
        rotatedCells
      )
    ) {
      piece.x += offset;
      piece.cells =
        rotatedCells;

      drawGame(scene);

      return;
    }
  }
}


function rotateMatrixClockwise(matrix) {
  const rows =
    matrix.length;

  const columns =
    matrix[0].length;

  const rotated = [];


  for (
    let column = 0;
    column < columns;
    column++
  ) {
    const newRow = [];


    for (
      let row = rows - 1;
      row >= 0;
      row--
    ) {
      newRow.push(
        matrix[row][column]
      );
    }


    rotated.push(newRow);
  }


  return rotated;
}


// ============================================================
// Collision
// ============================================================

function hasCollision(
  scene,
  targetX,
  targetY,
  cells
) {
  for (
    let row = 0;
    row < cells.length;
    row++
  ) {
    for (
      let column = 0;
      column < cells[row].length;
      column++
    ) {
      if (!cells[row][column]) {
        continue;
      }


      const boardX =
        targetX + column;

      const boardY =
        targetY + row;


      if (
        boardX < 0 ||
        boardX >= COLUMNS
      ) {
        return true;
      }


      if (boardY >= ROWS) {
        return true;
      }


      if (boardY < 0) {
        continue;
      }


      if (
        scene.board[boardY][boardX]
        !== null
      ) {
        return true;
      }
    }
  }


  return false;
}


// ============================================================
// Lock piece
// ============================================================

function lockPiece(scene) {
  const piece =
    scene.activePiece;


  for (
    let row = 0;
    row < piece.cells.length;
    row++
  ) {
    for (
      let column = 0;
      column < piece.cells[row].length;
      column++
    ) {
      const cell =
        piece.cells[row][column];


      if (!cell) {
        continue;
      }


      const boardX =
        piece.x + column;

      const boardY =
        piece.y + row;


      if (boardY < 0) {
        endGame(scene);
        return;
      }


      scene.board[boardY][boardX] = {
        color: piece.color,
        char: cell.char
      };
    }
  }


  scene.activePiece = null;
}


// ============================================================
// Clear rows
// ============================================================

function clearFullRows(scene) {
  for (
    let row = ROWS - 1;
    row >= 0;
    row--
  ) {
    const isFull =
      scene.board[row].every(
        cell => cell !== null
      );


    if (!isFull) {
      continue;
    }


    /*
      Read the 10 characters BEFORE removing the row.
    */

    const rawText =
      scene.board[row]
        .map(cell => cell.char)
        .join("");


    /*
      "__hello___you_"

      becomes:

      " hello you "

      then trim:

      "hello you"
    */

    const phrase =
      rawText
        .replace(/_+/g, " ")
        .trim();


    addClearedPhrase(phrase);


    // Remove completed row.
    scene.board.splice(row, 1);


    // Add a new empty row at top.
    scene.board.unshift(
      new Array(COLUMNS).fill(null)
    );


    // Check same position again because rows shifted down.
    row++;
  }
}


// ============================================================
// Game over
// ============================================================

function endGame(scene) {
  scene.gameOver = true;
  scene.gameStarted = false;

  scene.previewGraphics.clear();

  clearPreviewTexts(scene);

  scene.nextText.setVisible(false);

  scene.statusText
    .setVisible(true)
    .setText(
      "GAME OVER\nPress R to restart"
    );
}


// ============================================================
// Main board drawing
// ============================================================

function drawGame(scene) {
  const graphics =
    scene.graphics;

  graphics.clear();

  clearLetterTexts(scene);


  const gridX = 0;

  const gridY =
    TOP_RESERVED_HEIGHT;

  const gridWidth =
    COLUMNS * CELL_SIZE;

  const gridHeight =
    ROWS * CELL_SIZE;


  // ----------------------------------------------------------
  // Background
  // ----------------------------------------------------------

  graphics.fillStyle(
    0x111111,
    1
  );

  graphics.fillRect(
    gridX,
    gridY,
    gridWidth,
    gridHeight
  );


  // ----------------------------------------------------------
  // Locked cells
  // ----------------------------------------------------------

  for (
    let row = 0;
    row < ROWS;
    row++
  ) {
    for (
      let column = 0;
      column < COLUMNS;
      column++
    ) {
      const cell =
        scene.board[row][column];


      if (!cell) {
        continue;
      }


      drawBlock(
        scene,
        graphics,
        column,
        row,
        cell.color,
        cell.char
      );
    }
  }


  // ----------------------------------------------------------
  // Falling piece
  // ----------------------------------------------------------

  if (scene.activePiece) {
    const piece =
      scene.activePiece;


    for (
      let row = 0;
      row < piece.cells.length;
      row++
    ) {
      for (
        let column = 0;
        column < piece.cells[row].length;
        column++
      ) {
        const cell =
          piece.cells[row][column];


        if (!cell) {
          continue;
        }


        const boardX =
          piece.x + column;

        const boardY =
          piece.y + row;


        if (boardY >= 0) {
          drawBlock(
            scene,
            graphics,
            boardX,
            boardY,
            piece.color,
            cell.char
          );
        }
      }
    }
  }


  // ----------------------------------------------------------
  // Grid lines
  // ----------------------------------------------------------

  graphics.lineStyle(
    1,
    0x444444,
    1
  );


  for (
    let column = 0;
    column <= COLUMNS;
    column++
  ) {
    const x =
      gridX +
      column * CELL_SIZE;


    graphics.lineBetween(
      x,
      gridY,
      x,
      gridY + gridHeight
    );
  }


  for (
    let row = 0;
    row <= ROWS;
    row++
  ) {
    const y =
      gridY +
      row * CELL_SIZE;


    graphics.lineBetween(
      gridX,
      y,
      gridX + gridWidth,
      y
    );
  }
}


// ============================================================
// Draw one board cell
// ============================================================

function drawBlock(
  scene,
  graphics,
  column,
  row,
  color,
  char
) {
  const x =
    column * CELL_SIZE;

  const y =
    TOP_RESERVED_HEIGHT +
    row * CELL_SIZE;


  graphics.fillStyle(
    color,
    1
  );


  graphics.fillRect(
    x + 1,
    y + 1,
    CELL_SIZE - 2,
    CELL_SIZE - 2
  );


  graphics.lineStyle(
    2,
    0xffffff,
    0.2
  );


  graphics.strokeRect(
    x + 2,
    y + 2,
    CELL_SIZE - 4,
    CELL_SIZE - 4
  );


  /*
    Text is created separately from the block graphics.

    Its angle always stays at zero.
  */

  const text =
    scene.add
      .text(
        x + CELL_SIZE / 2,
        y + CELL_SIZE / 2,
        char,
        {
          fontFamily: "Arial",
          fontSize: "22px",
          color: "#ffffff"
        }
      )
      .setOrigin(0.5)
      .setAngle(0);


  scene.letterTexts.push(text);
}


// ============================================================
// Clear board character Text objects
// ============================================================

function clearLetterTexts(scene) {
  for (
    const text
    of scene.letterTexts
  ) {
    text.destroy();
  }

  scene.letterTexts = [];
}


// ============================================================
// Next piece preview
// ============================================================

function drawNextPiece(scene) {
  scene.previewGraphics.clear();

  clearPreviewTexts(scene);


  if (
    !scene.nextPiece ||
    scene.gameOver
  ) {
    return;
  }


  const piece =
    scene.nextPiece;

  const cells =
    piece.cells;


  let minRow =
    cells.length;

  let maxRow = 0;

  let minColumn =
    cells[0].length;

  let maxColumn = 0;


  for (
    let row = 0;
    row < cells.length;
    row++
  ) {
    for (
      let column = 0;
      column < cells[row].length;
      column++
    ) {
      if (!cells[row][column]) {
        continue;
      }


      minRow =
        Math.min(
          minRow,
          row
        );

      maxRow =
        Math.max(
          maxRow,
          row
        );

      minColumn =
        Math.min(
          minColumn,
          column
        );

      maxColumn =
        Math.max(
          maxColumn,
          column
        );
    }
  }


  const width =
    (
      maxColumn -
      minColumn +
      1
    ) *
    PREVIEW_CELL_SIZE;


  const height =
    (
      maxRow -
      minRow +
      1
    ) *
    PREVIEW_CELL_SIZE;


  const startX =
    MAIN_WIDTH / 2 -
    width / 2;


  const startY =
    58 -
    height / 2;


  for (
    let row = minRow;
    row <= maxRow;
    row++
  ) {
    for (
      let column = minColumn;
      column <= maxColumn;
      column++
    ) {
      const cell =
        cells[row][column];


      if (!cell) {
        continue;
      }


      const x =
        startX +
        (
          column -
          minColumn
        ) *
        PREVIEW_CELL_SIZE;


      const y =
        startY +
        (
          row -
          minRow
        ) *
        PREVIEW_CELL_SIZE;


      scene.previewGraphics.fillStyle(
        piece.color,
        1
      );


      scene.previewGraphics.fillRect(
        x + 1,
        y + 1,
        PREVIEW_CELL_SIZE - 2,
        PREVIEW_CELL_SIZE - 2
      );


      scene.previewGraphics.lineStyle(
        1,
        0xffffff,
        0.25
      );


      scene.previewGraphics.strokeRect(
        x + 1,
        y + 1,
        PREVIEW_CELL_SIZE - 2,
        PREVIEW_CELL_SIZE - 2
      );


      const text =
        scene.add
          .text(
            x + PREVIEW_CELL_SIZE / 2,
            y + PREVIEW_CELL_SIZE / 2,
            cell.char,
            {
              fontFamily: "Arial",
              fontSize: "10px",
              color: "#ffffff"
            }
          )
          .setOrigin(0.5)
          .setAngle(0);


      scene.previewTexts.push(text);
    }
  }
}


function clearPreviewTexts(scene) {
  for (
    const text
    of scene.previewTexts
  ) {
    text.destroy();
  }

  scene.previewTexts = [];
}


// ============================================================
// Cleared phrase handling
// ============================================================

function addClearedPhrase(phrase) {
  clearedPhrases.push(phrase);

  /*
    Whenever a new line is created,
    automatically return to the bottom
    so the newest phrase is visible.
  */
  if (auxSceneRef) {
    auxSceneRef.scrollOffset = 0;
  }

  updateAuxiliaryList();
}

function updateAuxiliaryList() {
  if (!auxSceneRef) {
    return;
  }

  renderAuxiliaryText(auxSceneRef);
}

function renderAuxiliaryText(scene) {
  const lineHeight = 30;

  const topPadding = 20;
  const bottomPadding = 20;

  const availableHeight =
    MAIN_HEIGHT -
    topPadding -
    bottomPadding;

  const maxVisibleLines =
    Math.floor(
      availableHeight / lineHeight
    );


  if (clearedPhrases.length === 0) {
    scene.poemTexts.forEach(text => {
      text.destroy();
    });

    scene.poemTexts = [];

    scene.scrollOffset = 0;

    return;
  }


  // Remove previous rendered text objects.
  scene.poemTexts.forEach(text => {
    text.destroy();
  });

  scene.poemTexts = [];


  const maxScroll =
    Math.max(
      0,
      clearedPhrases.length -
      maxVisibleLines
    );


  scene.scrollOffset =
    Phaser.Math.Clamp(
      scene.scrollOffset,
      0,
      maxScroll
    );


  /*
    scrollOffset = 0
    means we are looking at the newest lines.

    Increasing scrollOffset moves upward
    through older lines.
  */

  const endIndex =
    clearedPhrases.length -
    scene.scrollOffset;

  const startIndex =
    Math.max(
      0,
      endIndex -
      maxVisibleLines
    );


  const visiblePhrases =
    clearedPhrases.slice(
      startIndex,
      endIndex
    );


  /*
    Align the newest visible line to the bottom.

    Example:

        aaa
        bbb
        ccc

    ccc sits at the bottom.
  */

  const totalHeight =
    visiblePhrases.length *
    lineHeight;

  const startY =
    MAIN_HEIGHT -
    bottomPadding -
    totalHeight;


  visiblePhrases.forEach(
    (phrase, index) => {

      const text =
        scene.add.text(
          20,
          startY +
            index * lineHeight,
          phrase,
          {
            fontFamily: "Arial",
            fontSize: "18px",
            color: "#dddddd",

            wordWrap: {
              width: AUX_WIDTH - 40
            }
          }
        );

      scene.poemTexts.push(text);
    }
  );
}


function scrollAuxiliary(scene, direction) {
  const lineHeight = 30;

  const availableHeight =
    MAIN_HEIGHT - 40;

  const maxVisibleLines =
    Math.floor(
      availableHeight /
      lineHeight
    );

  const maxScroll =
    Math.max(
      0,
      clearedPhrases.length -
      maxVisibleLines
    );


  scene.scrollOffset =
    Phaser.Math.Clamp(
      scene.scrollOffset +
      direction,
      0,
      maxScroll
    );


  renderAuxiliaryText(scene);
}



// ============================================================
// Auxiliary canvas
// ============================================================

const auxConfig = {
  type: Phaser.AUTO,

  width: AUX_WIDTH,
  height: MAIN_HEIGHT,

  parent: "aux",

  backgroundColor: "#222222",

  scene: {
    create: createAuxScene
  }
};


function createAuxScene() {
  auxSceneRef = this;

  this.poemTexts = [];

  /*
    0 = latest lines are visible.

    Higher values mean the user has
    scrolled upward into older lines.
  */
  this.scrollOffset = 0;


  // Mouse wheel scrolling.
  this.input.on(
    "wheel",
    (
      pointer,
      gameObjects,
      deltaX,
      deltaY,
      deltaZ
    ) => {

      if (deltaY > 0) {
        // Scroll toward newer lines.
        scrollAuxiliary(this, -1);
      }

      else if (deltaY < 0) {
        // Scroll toward older lines.
        scrollAuxiliary(this, 1);
      }
    }
  );


  updateAuxiliaryList();
}


// ============================================================
// Start Phaser
// ============================================================

const mainGame =
  new Phaser.Game(mainConfig);

const auxGame =
  new Phaser.Game(auxConfig);