import React, { useEffect, useRef } from 'react';
import { Ghost } from 'lucide-react';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const CELL_SIZE = 20;
    const PACMAN_SIZE = 16;
    const GHOST_SIZE = 16;
    const DOT_SIZE = 4;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const maze = [
      '############################',
      '#............##............#',
      '#.####.#####.##.#####.####.#',
      '#.####.#####.##.#####.####.#',
      '#.####.#####.##.#####.####.#',
      '#..........................#',
      '#.####.##.########.##.####.#',
      '#.####.##.########.##.####.#',
      '#......##....##....##......#',
      '######.##### ## #####.######',
      '     #.##### ## #####.#     ',
      '     #.##          ##.#     ',
      '     #.## ###--### ##.#     ',
      '######.## #      # ##.######',
      '      .   #      #   .      ',
      '######.## #      # ##.######',
      '     #.## ######## ##.#     ',
      '     #.##          ##.#     ',
      '     #.## ######## ##.#     ',
      '######.## ######## ##.######',
      '#............##............#',
      '#.####.#####.##.#####.####.#',
      '#.####.#####.##.#####.####.#',
      '#...##................##...#',
      '###.##.##.########.##.##.###',
      '#......##....##....##......#',
      '#.##########.##.##########.#',
      '#..........................#',
      '############################'
    ];

    let pacman = {
      x: 14,
      y: 23,
      direction: 0,
      mouthOpen: true
    };

    let ghosts = [
      { x: 13, y: 14, direction: 0, color: '#FF0000' },
      { x: 14, y: 14, direction: 0, color: '#00FFFF' },
      { x: 15, y: 14, direction: 0, color: '#FFB8FF' },
      { x: 16, y: 14, direction: 0, color: '#FFB852' }
    ];

    let score = 0;
    let dots: { x: number; y: number }[] = [];

    // Initialize dots
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        if (maze[y][x] === '.') {
          dots.push({ x, y });
        }
      }
    }

    function drawMaze() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
          if (maze[y][x] === '#') {
            ctx.fillStyle = '#00F';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }

    function drawDots() {
      ctx.fillStyle = '#FFF';
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(
          dot.x * CELL_SIZE + CELL_SIZE / 2,
          dot.y * CELL_SIZE + CELL_SIZE / 2,
          DOT_SIZE / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
    }

    function drawPacman() {
      ctx.fillStyle = '#FF0';
      ctx.beginPath();
      const x = pacman.x * CELL_SIZE + CELL_SIZE / 2;
      const y = pacman.y * CELL_SIZE + CELL_SIZE / 2;
      const mouth = pacman.mouthOpen ? 0.2 : 0;
      ctx.arc(
        x,
        y,
        PACMAN_SIZE / 2,
        (0.2 + pacman.direction * 0.5) * Math.PI + mouth,
        (1.8 + pacman.direction * 0.5) * Math.PI - mouth
      );
      ctx.lineTo(x, y);
      ctx.fill();
    }

    function drawGhosts() {
      ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        const x = ghost.x * CELL_SIZE + CELL_SIZE / 2;
        const y = ghost.y * CELL_SIZE + CELL_SIZE / 2;
        ctx.arc(x, y - 2, GHOST_SIZE / 2, Math.PI, 0);
        ctx.lineTo(x + GHOST_SIZE / 2, y + GHOST_SIZE / 2);
        ctx.lineTo(x - GHOST_SIZE / 2, y + GHOST_SIZE / 2);
        ctx.fill();
      });
    }

    function drawScore() {
      ctx.fillStyle = '#FFF';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, canvas.height - 10);
    }

    function checkCollision(x: number, y: number) {
      return maze[y][x] !== '#';
    }

    function moveGhosts() {
      ghosts.forEach(ghost => {
        const directions = [
          { dx: 0, dy: -1 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 }
        ];

        const validDirections = directions.filter(dir =>
          checkCollision(ghost.x + dir.dx, ghost.y + dir.dy)
        );

        if (validDirections.length > 0) {
          const randomDir =
            validDirections[Math.floor(Math.random() * validDirections.length)];
          ghost.x += randomDir.dx;
          ghost.y += randomDir.dy;
        }
      });
    }

    function checkDotCollision() {
      const dotIndex = dots.findIndex(
        dot => dot.x === pacman.x && dot.y === pacman.y
      );
      if (dotIndex !== -1) {
        dots.splice(dotIndex, 1);
        score += 10;
      }
    }

    function checkGhostCollision() {
      return ghosts.some(
        ghost => ghost.x === pacman.x && ghost.y === pacman.y
      );
    }

    function gameLoop() {
      drawMaze();
      drawDots();
      drawPacman();
      drawGhosts();
      drawScore();

      pacman.mouthOpen = !pacman.mouthOpen;
      moveGhosts();
      checkDotCollision();

      if (checkGhostCollision()) {
        alert('Game Over! Score: ' + score);
        resetGame();
      }

      if (dots.length === 0) {
        alert('You Win! Score: ' + score);
        resetGame();
      }

      gameRef.current = requestAnimationFrame(gameLoop);
    }

    function resetGame() {
      pacman = { x: 14, y: 23, direction: 0, mouthOpen: true };
      ghosts = [
        { x: 13, y: 14, direction: 0, color: '#FF0000' },
        { x: 14, y: 14, direction: 0, color: '#00FFFF' },
        { x: 15, y: 14, direction: 0, color: '#FFB8FF' },
        { x: 16, y: 14, direction: 0, color: '#FFB852' }
      ];
      score = 0;
      dots = [];
      for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
          if (maze[y][x] === '.') {
            dots.push({ x, y });
          }
        }
      }
    }

    document.addEventListener('keydown', (e) => {
      const key = e.key;
      let newX = pacman.x;
      let newY = pacman.y;

      switch (key) {
        case 'ArrowUp':
          newY--;
          pacman.direction = 3;
          break;
        case 'ArrowRight':
          newX++;
          pacman.direction = 0;
          break;
        case 'ArrowDown':
          newY++;
          pacman.direction = 1;
          break;
        case 'ArrowLeft':
          newX--;
          pacman.direction = 2;
          break;
      }

      if (checkCollision(newX, newY)) {
        pacman.x = newX;
        pacman.y = newY;
      }
    });

    gameLoop();

    return () => {
      if (gameRef.current) {
        cancelAnimationFrame(gameRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-yellow-400 mb-4">Pac-Man</h1>
      <canvas
        ref={canvasRef}
        width={560}
        height={620}
        className="border-4 border-blue-600"
      />
      <div className="text-white mt-4">
        <p>Use arrow keys to move Pac-Man</p>
        <p>Collect all dots to win!</p>
      </div>
    </div>
  );
}

export default App;