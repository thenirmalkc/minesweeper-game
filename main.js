const { floor, random } = Math;
const cellSize = 32;
const size = 16;
const width = cellSize * size;
const height = cellSize * size;
const board = [];
const minesCount = size * 2;

let flagCount = 0;
let openSet = [];
let gameOver = false;

let animation = false;
let flagCount_tag = undefined;

function createBoard() {
  for (let row = 0; row < size; row++) {
    board.push([]);
    for (let col = 0; col < size; col++) {
      board[row].push({ row, col, value: 0, flag: false, mine: false, revealed: false });
    }
  }
}

function createMines() {
  const temp = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      temp.push({ row, col });
    }
  }
  for (let i = 0; i < minesCount; i++) {
    const { row, col } = temp.splice(floor(random() * temp.length), 1).pop();
    board[row][col].mine = true;
  }
}

function getNeighbours({ row, col }) {
  const neighbours = [];
  if (row > 0) neighbours.push(board[row - 1][col]);
  if (col > 0) neighbours.push(board[row][col - 1]);
  if (row < size - 1) neighbours.push(board[row + 1][col]);
  if (col < size - 1) neighbours.push(board[row][col + 1]);
  if (row > 0 && col > 0) neighbours.push(board[row - 1][col - 1]);
  if (row < size - 1 && col < size - 1) neighbours.push(board[row + 1][col + 1]);
  if (row < size - 1 && col > 0) neighbours.push(board[row + 1][col - 1]);
  if (row > 0 && col < size - 1) neighbours.push(board[row - 1][col + 1]);
  return neighbours;
}

function calculateValue({ row, col }) {
  const neighbours = getNeighbours({ row, col });
  for (const neighbour of neighbours) {
    const { mine } = neighbour;
    if (mine) board[row][col].value++;
  }
}

function calculateValues() {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      calculateValue({ row, col });
    }
  }
}

function checkGameOver() {
  let count = 0;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const { revealed } = board[row][col];
      if (!revealed) count++;
    }
  }
  if (count == minesCount) return true;
  else return false;
}

function getColor({ row, col }) {
  let color = undefined;
  const { value } = board[row][col];
  if (value > 0) color = 'blue';
  if (value > 1) color = 'green';
  if (value > 2) color = 'red';
  return color;
}

function displayEmptyCells() {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      stroke(180);
      fill('white');
      square(col * cellSize + 2, row * cellSize + 2, cellSize - 4);
    }
  }
}

function reveal() {
  textSize(18);
  textAlign('center', 'center');
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const { mine, value } = board[row][col];
      if (mine) {
        noStroke();
        fill('black');
        square(col * cellSize + 2, row * cellSize + 2, cellSize - 4);
        fill('red');
        circle(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2, cellSize / 2);
      } else {
        stroke(180);
        fill(200);
        square(col * cellSize + 2, row * cellSize + 2, cellSize - 4);
        if (value) {
          noStroke();
          fill(getColor(board[row][col]));
          text(value, col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
        }
      }
    }
  }
}

function setup() {
  const canvas = createCanvas(width, height);
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  background('white');
  createBoard();
  createMines();
  calculateValues();
  displayEmptyCells();
  createElement('div', `<strong>Total Mines:</strong> ${minesCount}`).position(160, 20);
  flagCount_tag = createElement('div', `<strong>Flags Used:</strong> ${flagCount}`);
  flagCount_tag.position(160, 60);
}

function draw() {
  if (!openSet.length) {
    animation = false;
    return;
  }
  const cell = openSet.splice(0, 1)[0];
  const { row, col, value } = cell;
  cell.revealed = true;
  stroke(180);
  fill(200);
  square(col * cellSize + 2, row * cellSize + 2, cellSize - 4);
  if (value) {
    noStroke();
    fill(getColor(cell));
    textSize(18);
    textAlign('center', 'center');
    text(value, col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
    return;
  }
  for (let neighbour of getNeighbours(cell)) {
    if (openSet.includes(neighbour) || neighbour.flag || neighbour.revealed) continue;
    else openSet.push(neighbour);
  }
  if (!openSet.length) {
    gameOver = checkGameOver();
    if (gameOver) createElement('h3', 'You won !!').position(windowWidth / 2 - 40, 20);
  }
}

function mousePressed({ buttons, target }) {
  if (gameOver || animation) return;
  const row = floor(mouseY / cellSize);
  const col = floor(mouseX / cellSize);
  if (row < 0 || col < 0 || row > size - 1 || col > size - 1) return;
  target.oncontextmenu = () => false;
  if (buttons == 1) {
    const { flag, mine } = board[row][col];
    if (flag) return;
    else if (mine) {
      gameOver = true;
      reveal();
      createElement('h3', 'You Lost !!').position(windowWidth / 2 - 40, 20);
    } else {
      openSet.push(board[row][col]);
      animation = true;
    }
  } else if (buttons == 2) {
    if (board[row][col].revealed) return;
    board[row][col].flag = !board[row][col].flag;
    if (board[row][col].flag) {
      flagCount++;
      noStroke();
      fill('black');
      square(col * cellSize + 2, row * cellSize + 2, cellSize - 4);
      fill('white');
      textSize(18);
      textAlign('center', 'center');
      text('F', col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
      flagCount_tag.elt.innerHTML = `<strong>Flags Used:</strong> ${flagCount}`;
    } else {
      flagCount--;
      stroke(180);
      fill('white');
      square(col * cellSize + 2, row * cellSize + 2, cellSize - 4);
      flagCount_tag.elt.innerHTML = `<strong>Flags Used:</strong> ${flagCount}`;
    }
  }
}
