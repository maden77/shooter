// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bombBtn = document.getElementById('bomb-btn');

let width, height, radius;
const colors = ['#FF3E3E', '#00E5FF', '#FFD700', '#FF00FF', '#32FF7E'];
let bubbles = [];
const rows = 14, cols = 8;
let score = 0;
let bullet = null;
let nextPeluru1 = colors[Math.floor(Math.random() * colors.length)];
let nextPeluru2 = colors[Math.floor(Math.random() * colors.length)];
const bulletSpeed = 25;
let gameOver = false;
let bombCount = 3;

// Initialize Game
function init() {
    handleResize();
    initGrid();
    window.addEventListener('resize', handleResize);
    update();
    
    // Bomb button event
    bombBtn.addEventListener('click', useBomb);
    updateBombButton();
    
    // Hide splash screen
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('hidden');
    }, 1500);
}

// Handle Resize
function handleResize() {
    const container = document.getElementById('game-container');
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
    radius = width / (cols * 2.3);
    if(bullet && !bullet.moving) spawnBullet();
}

// Initialize Grid
function initGrid() {
    bubbles = [];
    for (let r = 0; r < rows; r++) {
        bubbles[r] = [];
        for (let c = 0; c < cols; c++) {
            if (r < 6) bubbles[r][c] = { 
                color: colors[Math.floor(Math.random() * colors.length)],
                type: 'normal'
            };
            else bubbles[r][c] = null;
        }
    }
    spawnBullet();
}

// Spawn Bullet
function spawnBullet() {
    bullet = {
        x: width / 2,
        y: height - (radius * 2.5),
        color: nextPeluru1,
        dx: 0, 
        dy: 0, 
        moving: false
    };
    nextPeluru1 = nextPeluru2;
    nextPeluru2 = colors[Math.floor(Math.random() * colors.length)];
}

// Draw Egg
function drawEgg(x, y, color, size = radius, isGlow = false) {
    ctx.save();
    if(isGlow) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
    }
    
    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    const grad = ctx.createRadialGradient(x - size/2.5, y - size/2.5, size/10, x, y, size);
    grad.addColorStop(0, "rgba(255,255,255,0.7)");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
}

// Main Update Loop
function update() {
    if (gameOver) return;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw Grid Bubbles
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (bubbles[r][c]) {
                const pos = getGridPosition(r, c);
                drawEgg(pos.x, pos.y, bubbles[r][c].color);
            }
        }
    }
    
    // Bottom Area & Gold Line
    const bottomH = 100;
    ctx.fillStyle = "rgba(142, 45, 226, 0.8)";
    ctx.fillRect(0, height - bottomH, width, bottomH);
    
    ctx.strokeStyle = "#ffd700"; 
    ctx.lineWidth = 6;
    ctx.beginPath(); 
    ctx.moveTo(0, height - bottomH); 
    ctx.lineTo(width, height - bottomH); 
    ctx.stroke();
    
    // Bullet Queue
    // Next bullet 1
    const c1Y = height - (radius * 2.8);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath(); 
    ctx.arc(width/2, c1Y, radius * 1.4, 0, Math.PI * 2); 
    ctx.fill();
    drawEgg(width/2, c1Y, nextPeluru1);
    
    ctx.fillStyle = "white"; 
    ctx.font = "bold 12px Arial"; 
    ctx.textAlign = "center";
    ctx.fillText("NEXT", width/2, c1Y + radius * 2);
    
    // Next bullet 2
    const c2Y = height - (radius * 1);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath(); 
    ctx.arc(width/2, c2Y, radius * 1.1, 0, Math.PI * 2); 
    ctx.fill();
    drawEgg(width/2, c2Y, nextPeluru2, radius * 0.8);
    ctx.fillText("NEXT", width/2, c2Y - radius * 1.4);
    
    // Active Bullet & Aim Line
    if (bullet) {
        if (!bullet.moving) {
            // Draw aim line
            ctx.setLineDash([5, 10]);
            ctx.beginPath(); 
            ctx.moveTo(bullet.x, bullet.y); 
            ctx.lineTo(bullet.x, bullet.y - 100);
            ctx.strokeStyle = "rgba(255,255,255,0.5)"; 
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
        } else {
            // Move bullet
            bullet.x += bullet.dx; 
            bullet.y += bullet.dy;
            
            // Wall collision
            if (bullet.x - radius < 0 || bullet.x + radius > width) bullet.dx *= -1;
            
            // Top collision
            if (bullet.y - radius < 0) {
                bullet.dy = 0;
                bullet.dx = 0;
                bullet.moving = false;
                snapBubble();
            }
            
            // Bubble collision
            if (checkCollision()) snapBubble();
        }
        drawEgg(bullet.x, bullet.y, bullet.color, radius, true);
    }
    
    // Check game over
    if (checkGameOver()) return;
    
    requestAnimationFrame(update);
}

// Get Grid Position
function getGridPosition(r, c) {
    let x = (c * 2 * radius) + radius + (r % 2 === 1 ? radius : 0);
    let y = (r * 1.7 * radius) + radius + 20;
    return { x, y };
}

// Check Collision
function checkCollision() {
    if (!bullet || !bullet.moving) return false;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (bubbles[r][c]) {
                const pos = getGridPosition(r, c);
                const distance = Math.hypot(bullet.x - pos.x, bullet.y - pos.y);
                if (distance < radius * 1.8) return true;
            }
        }
    }
    return false;
}

// Snap Bubble to Grid
function snapBubble() {
    if (!bullet || !bullet.moving) return;
    
    bullet.moving = false;
    let bestDist = Infinity, rIdx = -1, cIdx = -1;
    
    // Find closest empty cell
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!bubbles[r][c]) {
                const pos = getGridPosition(r, c);
                const d = Math.hypot(bullet.x - pos.x, bullet.y - pos.y);
                if (d < bestDist) { 
                    bestDist = d; 
                    rIdx = r; 
                    cIdx = c; 
                }
            }
        }
    }
    
    // Place bubble in grid
    if (rIdx !== -1 && cIdx !== -1) {
        bubbles[rIdx][cIdx] = { color: bullet.color, type: 'normal' };
        
        // Check for matches
        let matches = findMatches(rIdx, cIdx, bullet.color, []);
        if (matches.length >= 3) {
            matches.forEach(m => bubbles[m.r][m.c] = null);
            score += matches.length * 10;
            updateScore();
        }
    }
    
    spawnBullet();
}

// Find Matching Bubbles
function findMatches(r, c, color, visited) {
    let key = `${r},${c}`;
    if (visited.includes(key)) return [];
    visited.push(key);
    
    let matches = [{r, c}];
    let neighbors;
    
    if (r % 2 !== 0) {
        neighbors = [[-1,0], [-1,1], [0,-1], [0,1], [1,0], [1,1]];
    } else {
        neighbors = [[-1,-1], [-1,0], [0,-1], [0,1], [1,-1], [1,0]];
    }
    
    neighbors.forEach(o => {
        let nr = r + o[0], nc = c + o[1];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && 
            bubbles[nr][nc] && bubbles[nr][nc].color === color) {
            matches = matches.concat(findMatches(nr, nc, color, visited));
        }
    });
    
    return matches;
}

// Update Score
function updateScore() {
    scoreEl.textContent = score;
    scoreEl.classList.add('score-pop');
    setTimeout(() => {
        scoreEl.classList.remove('score-pop');
    }, 300);
}

// Check Game Over
function checkGameOver() {
    // Check if bubbles reached bottom
    for (let c = 0; c < cols; c++) {
        if (bubbles[rows - 3] && bubbles[rows - 3][c]) {
            endGame();
            return true;
        }
    }
    return false;
}

// End Game
function endGame() {
    gameOver = true;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').classList.remove('hidden');
}

// Restart Game
function restartGame() {
    gameOver = false;
    score = 0;
    bombCount = 3;
    document.getElementById('game-over').classList.add('hidden');
    updateScore();
    updateBombButton();
    initGrid();
}

// Bomb Function
function useBomb() {
    if (bombCount <= 0 || gameOver) return;
    
    bombCount--;
    updateBombButton();
    
    // Remove random bubble
    let bubblesList = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (bubbles[r][c]) {
                bubblesList.push({r, c});
            }
        }
    }
    
    if (bubblesList.length > 0) {
        let randomIndex = Math.floor(Math.random() * bubblesList.length);
        let bubble = bubblesList[randomIndex];
        bubbles[bubble.r][bubble.c] = null;
        score += 5;
        updateScore();
    }
}

// Update Bomb Button
function updateBombButton() {
    bombBtn.textContent = `💣 BOM (${bombCount})`;
    bombBtn.disabled = bombCount <= 0;
}

// Event Listeners
canvas.addEventListener('pointerdown', (e) => {
    if (gameOver || !bullet || bullet.moving) return;
    
    const rect = canvas.getBoundingClientRect();
    const tx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const ty = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Only shoot upward
    if (ty < bullet.y) {
        const dist = Math.hypot(tx - bullet.x, ty - bullet.y);
        bullet.dx = ((tx - bullet.x) / dist) * bulletSpeed;
        bullet.dy = ((ty - bullet.y) / dist) * bulletSpeed;
        bullet.moving = true;
    }
});

// Initialize
window.addEventListener('load', init);