let towers = [[], [], []];
let moveCount = 0;
let timer = null;
let startTime = null;
let solving = false;
let isAutoSolving = false;
let autoSolveInterval;
let autoSolving = false;
let totalMoves = 0;

const startGameBtn = document.getElementById('startGame');
const solveGameBtn = document.getElementById('solveGame');
const diskCountInput = document.getElementById('diskCount');
const moveCountDisplay = document.getElementById('moveCount');
const timerDisplay = document.getElementById('timer');
const autoSolveBtn = document.getElementById('autoSolveBtn');

startGameBtn.addEventListener('click', startGame);
solveGameBtn.addEventListener('click', solveGame);

function startGame() {
    resetGame();
    const diskCount = parseInt(diskCountInput.value);
    createDisks(diskCount);
    startTimer();
}

function resetGame() {
    towers = [[], [], []];
    moveCount = 0;
    moveCountDisplay.textContent = moveCount;
    clearInterval(timer);
    timerDisplay.textContent = '00:00';
    document.querySelectorAll('.tower').forEach(tower => tower.innerHTML = '');
}

function createDisks(count) {
    const tower = document.getElementById('tower1');
    for (let i = count; i > 0; i--) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.style.width = `${i * 20 + 20}px`;
        disk.draggable = true;
        disk.addEventListener('dragstart', dragStart);
        disk.addEventListener('dragend', dragEnd);
        tower.appendChild(disk);
        towers[0].push(disk);
    }
}

function selectDisk(disk) {
    if (disk !== towers[towers.indexOf(towers.find(t => t.includes(disk)))][towers.find(t => t.includes(disk)).length - 1]) return;
    
    const selectedDisk = document.querySelector('.disk.selected');
    if (selectedDisk) {
        if (selectedDisk === disk) {
            disk.classList.remove('selected');
        } else {
            moveDisk(selectedDisk, disk.parentElement);
        }
    } else {
        disk.classList.add('selected');
    }
}

function moveDisk(disk, targetTower) {
    return new Promise(resolve => {
        const sourceTower = disk.parentElement;
        if (canMoveDisk(disk, targetTower)) {
            const rect = disk.getBoundingClientRect();
            const targetRect = targetTower.getBoundingClientRect();
            const yOffset = targetRect.top - rect.top + (targetTower.children.length * disk.offsetHeight);
            const xOffset = targetRect.left - rect.left;

            disk.style.transition = 'transform 0.5s ease-in-out';
            disk.style.transform = `translate(${xOffset}px, ${yOffset}px)`;

            setTimeout(() => {
                disk.style.transition = '';
                disk.style.transform = '';
                targetTower.appendChild(disk);
                updateTowers(sourceTower, targetTower, disk);
                moveCount++;
                moveCountDisplay.textContent = moveCount;
                resolve();
            }, 500);
        } else {
            resolve();
        }
    });
}

function canMoveDisk(disk, targetTower) {
    if (targetTower.children.length === 0) return true;
    const topDisk = targetTower.children[targetTower.children.length - 1];
    return parseInt(disk.style.width) < parseInt(topDisk.style.width);
}

function updateTowers(sourceTower, targetTower, disk) {
    const sourceIndex = Array.from(document.querySelectorAll('.tower')).indexOf(sourceTower);
    const targetIndex = Array.from(document.querySelectorAll('.tower')).indexOf(targetTower);
    towers[sourceIndex] = Array.from(sourceTower.children);
    towers[targetIndex] = Array.from(targetTower.children);
}

async function checkWin() {
    if (towers[2].length === parseInt(diskCountInput.value)) {
        // Đợi một chút để đảm bảo rằng đĩa cuối cùng đã được đặt đúng vị trí
        await new Promise(resolve => setTimeout(resolve, 100));
        alert(`Chúc mừng! Bạn đã giải quyết bài toán trong ${moveCount} bước.`);
        clearInterval(timer);
    }
}

function startTimer() {
    startTime = new Date();
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const currentTime = new Date();
    const elapsedTime = new Date(currentTime - startTime);
    const minutes = elapsedTime.getUTCMinutes().toString().padStart(2, '0');
    const seconds = elapsedTime.getUTCSeconds().toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

function solveGame() {
    resetGame();
    const diskCount = parseInt(diskCountInput.value);
    createDisks(diskCount);
    startTimer();
    solveTowerOfHanoi(diskCount, 'tower1', 'tower3', 'tower2');
}

async function solveTowerOfHanoi(n, source, target, auxiliary) {
    if (n > 0) {
        await solveTowerOfHanoi(n - 1, source, auxiliary, target);
        await moveDiskAuto(source, target);
        await solveTowerOfHanoi(n - 1, auxiliary, target, source);
    }
}

async function moveDiskAuto(sourceId, targetId) {
    const sourceTower = document.getElementById(sourceId);
    const targetTower = document.getElementById(targetId);
    const disk = sourceTower.lastElementChild;
    await moveDisk(disk, targetTower);
    await checkWin();
}

// ... existing code ...

function createDisks(count) {
    const tower = document.getElementById('tower1');
    for (let i = count; i > 0; i--) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.style.width = `${i * 20 + 20}px`;
        disk.draggable = true;
        disk.addEventListener('dragstart', dragStart);
        disk.addEventListener('dragend', dragEnd);
        tower.appendChild(disk);
        towers[0].push(disk);
    }
}

function dragStart(e) {
    if (e.target !== e.target.parentElement.lastElementChild) return;
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => e.target.classList.add('dragging'), 0);
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

document.querySelectorAll('.tower').forEach(tower => {
    tower.addEventListener('dragover', dragOver);
    tower.addEventListener('drop', drop);
});

function dragOver(e) {
    e.preventDefault();
    const disk = document.querySelector('.dragging');
    if (disk && canMoveDisk(disk, e.currentTarget)) {
        e.currentTarget.classList.add('highlight');
    }
}

function dragLeave(e) {
    e.currentTarget.classList.remove('highlight');
}

async function drop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('highlight');
    const disk = document.querySelector('.dragging');
    if (canMoveDisk(disk, e.currentTarget)) {
        await moveDisk(disk, e.currentTarget);
        await checkWin();
    }
}

document.querySelectorAll('.tower').forEach(tower => {
    tower.addEventListener('dragover', dragOver);
    tower.addEventListener('dragleave', dragLeave);
    tower.addEventListener('drop', drop);
});

// ... existing code ...

function initializeButtons() {
    const solveButton = document.getElementById('solveButton');
    const playAgainButton = document.getElementById('playAgainButton');
    const skipButton = document.getElementById('skipButton');

    solveButton.addEventListener('click', () => {
        if (!solving) {
            solving = true;
            disableButtons();
            solvePuzzle();
        }
    });

    playAgainButton.addEventListener('click', () => {
        if (!solving) {
            resetPuzzle();
        }
    });

    skipButton.addEventListener('click', () => {
        if (!solving) {
            solving = true;
            disableButtons();
            showFinalResult();
        }
    });
}

function disableButtons() {
    const buttons = document.querySelectorAll('#controls button');
    buttons.forEach(button => button.disabled = true);
}

function enableButtons() {
    const buttons = document.querySelectorAll('#controls button');
    buttons.forEach(button => button.disabled = false);
}

function resetPuzzle() {
    // Reset the puzzle to its initial state
    // ... code to reset the puzzle ...
    console.log('Puzzle reset');
}

function showFinalResult() {
    // Skip animations and show the final result
    // ... code to show final result ...
    console.log('Showing final result');
    solving = false;
    enableButtons();
}

function solvePuzzle() {
    // Your existing solve logic here
    // ...

    // When solving is complete:
    solving = false;
    enableButtons();
}

// Call this function to set up the buttons when the page loads
initializeButtons();

// ... rest of your existing code ...

function toggleAutoSolve() {
    if (!isAutoSolving) {
        startAutoSolve();
    } else {
        skipToEnd();
    }
}

function startAutoSolve() {
    isAutoSolving = true;
    document.getElementById('autoSolveBtn').textContent = 'Bỏ qua sự kiện';
    autoSolveInterval = setInterval(performNextStep, 1000); // Thực hiện bước tiếp theo mỗi giây
}

function skipToEnd() {
    clearInterval(autoSolveInterval);
    while (currentStep < totalSteps) {
        performNextStep();
    }
    finishAutoSolve();
}

function performNextStep() {
    // Thực hiện bước tiếp theo của giải pháp
    // ... (code để thực hiện bước tiếp theo) ...

    if (currentStep >= totalSteps) {
        finishAutoSolve();
    }
}

function finishAutoSolve() {
    isAutoSolving = false;
    document.getElementById('autoSolveBtn').textContent = 'Giải tự động';
    clearInterval(autoSolveInterval);
}

// ... existing code ...

function initializeGame() {
    // ... existing initialization code ...
    
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('autoSolveButton').addEventListener('click', startAutoSolve);
    document.getElementById('resultButton').addEventListener('click', showResult);
}

function startAutoSolve() {
    if (autoSolving) return;
    autoSolving = true;
    document.getElementById('autoSolveButton').style.display = 'none';
    document.getElementById('resultButton').style.display = 'inline-block';
    
    // Start the auto-solving process
    totalMoves = Math.pow(2, numDisks) - 1;
    autoSolve(numDisks, 0, 2, 1);
}

function showResult() {
    // Move all disks to the last peg instantly
    towers[2] = towers[0].concat(towers[1]);
    towers[0] = [];
    towers[1] = [];
    updateTowers();
    
    // Display the total number of moves
    alert(`Số bước cần thiết: ${totalMoves}`);
}

// ... existing code ...

function autoSolve(n, from, to, aux) {
    if (n === 1) {
        setTimeout(() => {
            moveDisk(from, to);
            updateTowers();
            if (towers[2].length === numDisks) {
                autoSolving = false;
                alert(`Giải tự động hoàn thành trong ${totalMoves} bước!`);
            }
        }, moveDelay * totalMoves);
        return;
    }
    
    autoSolve(n - 1, from, aux, to);
    autoSolve(1, from, to, aux);
    autoSolve(n - 1, aux, to, from);
}

// ... existing code ...

let totalSteps = 0;

function solveTower() {
  const solveBtn = document.getElementById('solveBtn');
  
  if (solveBtn.textContent === 'Giải tự động') {
    solveBtn.textContent = 'Đang giải...';
    solveBtn.disabled = true;
    
    setTimeout(() => {
      const steps = solve(numDisks, 0, 2, 1);
      totalSteps = steps.length;
      
      solveBtn.textContent = 'Kết quả';
      solveBtn.classList.add('result');
      solveBtn.disabled = false;
    }, 100);
  } else if (solveBtn.textContent === 'Kết quả') {
    moveDisksToFinalColumn();
    solveBtn.textContent = `Đã giải trong ${totalSteps} bước`;
    solveBtn.disabled = true;
  }
}

function moveDisksToFinalColumn() {
  const finalColumn = towers[2];
  for (let i = numDisks; i > 0; i--) {
    finalColumn.push(i);
  }
  towers[0] = [];
  towers[1] = [];
  updateTowers();
}

// ... existing code ...

// Thay đổi event listener cho nút giải
document.getElementById('solveBtn').addEventListener('click', solveTower);

// ... existing code ...

// Tăng lực kéo của đĩa
function updateDiskDrag() {
  const dragForce = 0.8; // Tăng giá trị này để làm cho đĩa dễ kéo hơn
  // ... code xử lý kéo đĩa ...
}

// Thêm hiệu ứng "snap" khi đĩa gần vị trí hợp lệ
function snapDiskToColumn(disk, column) {
  const snapDistance = 20; // Khoảng cách để kích hoạt hiệu ứng snap
  if (Math.abs(disk.x - column.x) < snapDistance) {
    disk.x = column.x;
  }
}

// Kiểm tra xem đĩa có thể thả được không
function canDropDisk(disk, column) {
  // ... logic kiểm tra điều kiện thả đĩa ...
  return isValidMove;
}

// Làm sáng cột khi có thể thả đĩa
function highlightColumn(column, canDrop) {
  if (canDrop) {
    column.tint = 0xFFFF00; // Màu vàng cho hiệu ứng sáng
  } else {
    column.tint = 0xFFFFFF; // Màu trắng bình thường
  }
}

// Trong game loop hoặc hàm update
function update() {
  // ... existing code ...
  
  updateDiskDrag();
  
  disks.forEach(disk => {
    columns.forEach(column => {
      snapDiskToColumn(disk, column);
      const canDrop = canDropDisk(disk, column);
      highlightColumn(column, canDrop);
    });
  });
  
  // ... existing code ...
}