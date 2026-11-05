'use strict';

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const livesEl = document.getElementById('lives');
  const overlay = document.getElementById('overlay');
  const overlayIcon = document.getElementById('overlayIcon');
  const overlayEyebrow = document.getElementById('overlayEyebrow');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayText = document.getElementById('overlayText');
  const startButton = document.getElementById('startButton');
  const leftButton = document.getElementById('leftButton');
  const rightButton = document.getElementById('rightButton');

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const DURATION = 60;
  const TOTAL_LIVES = 3;
  const starImage = new Image();
  starImage.src = './assets/star.svg';

  let score = 0;
  let lives = TOTAL_LIVES;
  let timeLeft = DURATION;
  let running = false;
  let lastFrame = 0;
  let elapsed = 0;
  let starTimer = 0;
  let meteorTimer = 0;
  let objects = [];
  let particles = [];
  let keys = { left: false, right: false };
  let player = { x: WIDTH / 2, y: HEIGHT - 62, width: 76, height: 34, speed: 390 };
  let backgroundStars = Array.from({ length: 90 }, () => ({
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    radius: Math.random() * 1.7 + .3,
    alpha: Math.random() * .55 + .2,
    phase: Math.random() * Math.PI * 2
  }));

  function updateHud() {
    scoreEl.textContent = String(score);
    timeEl.textContent = String(Math.max(0, Math.ceil(timeLeft)));
    livesEl.textContent = Array.from({ length: TOTAL_LIVES }, (_, i) => i < lives ? '♥' : '♡').join(' ');
  }

  function showOverlay(mode) {
    overlay.classList.remove('hidden');
    if (mode === 'start') {
      overlayIcon.textContent = '✦';
      overlayEyebrow.textContent = 'SIAP BERMAIN?';
      overlayTitle.textContent = 'Tangkap Bintangnya!';
      overlayText.textContent = 'Kumpulkan bintang sebanyak mungkin selama 60 detik. Hindari meteor agar nyawamu tidak habis.';
      startButton.textContent = 'Mulai Permainan';
    } else {
      overlayIcon.textContent = mode === 'win' ? '🏆' : '☄';
      overlayEyebrow.textContent = 'PERMAINAN SELESAI';
      overlayTitle.textContent = mode === 'win' ? 'Waktu Habis!' : 'Nyawa Habis!';
      overlayText.textContent = `Skor akhir kamu: ${score}. Coba lagi dan kumpulkan lebih banyak bintang!`;
      startButton.textContent = 'Main Lagi';
    }
  }

  function resetGame() {
    score = 0;
    lives = TOTAL_LIVES;
    timeLeft = DURATION;
    elapsed = 0;
    starTimer = .45;
    meteorTimer = 1.2;
    objects = [];
    particles = [];
    player.x = WIDTH / 2;
    keys.left = false;
    keys.right = false;
    updateHud();
  }

  function startGame() {
    resetGame();
    running = true;
    lastFrame = performance.now();
    overlay.classList.add('hidden');
    requestAnimationFrame(loop);
  }

  function finishGame(reason) {
    running = false;
    showOverlay(reason);
  }

  function spawnStar() {
    objects.push({ type: 'star', x: 22 + Math.random() * (WIDTH - 44), y: -25, radius: 18, speed: 145 + Math.random() * 65, rotation: Math.random() * 6 });
  }

  function spawnMeteor() {
    const radius = 17 + Math.random() * 8;
    objects.push({ type: 'meteor', x: radius + Math.random() * (WIDTH - radius * 2), y: -radius, radius, speed: 190 + Math.random() * 85, rotation: Math.random() * 6, spin: (Math.random() - .5) * 2.5 });
  }

  function addBurst(x, y, color, amount = 12) {
    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 45 + Math.random() * 145;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .35 + Math.random() * .45, maxLife: .8, size: 2 + Math.random() * 3, color });
    }
  }

  function circleRectCollision(circle, rect) {
    const closestX = Math.max(rect.x - rect.width / 2, Math.min(circle.x, rect.x + rect.width / 2));
    const closestY = Math.max(rect.y - rect.height / 2, Math.min(circle.y, rect.y + rect.height / 2));
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return dx * dx + dy * dy < circle.radius * circle.radius;
  }

  function update(dt) {
    elapsed += dt;
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      updateHud();
      finishGame('win');
      return;
    }

    if (keys.left) player.x -= player.speed * dt;
    if (keys.right) player.x += player.speed * dt;
    player.x = Math.max(player.width / 2 + 5, Math.min(WIDTH - player.width / 2 - 5, player.x));

    starTimer -= dt;
    meteorTimer -= dt;
    if (starTimer <= 0) {
      spawnStar();
      starTimer = .65 + Math.random() * .45;
    }
    if (meteorTimer <= 0) {
      spawnMeteor();
      meteorTimer = 1.05 + Math.random() * .75;
    }

    for (let i = objects.length - 1; i >= 0; i--) {
      const object = objects[i];
      object.y += object.speed * dt;
      object.rotation += (object.spin || .8) * dt;
      if (circleRectCollision(object, player)) {
        if (object.type === 'star') {
          score += 10;
          addBurst(object.x, object.y, '#ffe16e', 13);
        } else {
          lives -= 1;
          addBurst(object.x, object.y, '#ff718b', 18);
          if (lives <= 0) {
            lives = 0;
            objects.splice(i, 1);
            updateHud();
            finishGame('lose');
            return;
          }
        }
        objects.splice(i, 1);
      } else if (object.y - object.radius > HEIGHT + 5) {
        objects.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(.08, dt);
      p.vy *= Math.pow(.08, dt);
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    updateHud();
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, '#101a3b');
    gradient.addColorStop(1, '#080d22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const glow = ctx.createRadialGradient(WIDTH * .5, HEIGHT * .5, 10, WIDTH * .5, HEIGHT * .5, 420);
    glow.addColorStop(0, 'rgba(59, 91, 170, .22)');
    glow.addColorStop(1, 'rgba(59, 91, 170, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (const s of backgroundStars) {
      const twinkle = .65 + Math.sin(elapsed * 1.8 + s.phase) * .25;
      ctx.globalAlpha = s.alpha * twinkle;
      ctx.fillStyle = '#e3efff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'rgba(117, 155, 230, .07)';
    ctx.lineWidth = 1;
    for (let y = 70; y < HEIGHT; y += 70) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke();
    }
  }

  function drawPlayer() {
    const x = player.x;
    const y = player.y;
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = 'rgba(79, 224, 255, .7)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#57d9eb';
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(34, 18);
    ctx.quadraticCurveTo(0, 8, -34, 18);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#eafcff';
    ctx.beginPath(); ctx.ellipse(0, -3, 9, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffbd61';
    ctx.beginPath(); ctx.moveTo(-10, 15); ctx.lineTo(0, 31 + Math.random() * 5); ctx.lineTo(10, 15); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.fillRect(-24, 17, 11, 4); ctx.fillRect(13, 17, 11, 4);
    ctx.restore();
  }

  function drawStar(object) {
    ctx.save();
    ctx.translate(object.x, object.y);
    ctx.rotate(object.rotation);
    if (starImage.complete && starImage.naturalWidth > 0) {
      ctx.shadowColor = 'rgba(255, 211, 87, .8)';
      ctx.shadowBlur = 16;
      ctx.drawImage(starImage, -object.radius, -object.radius, object.radius * 2, object.radius * 2);
    } else {
      ctx.fillStyle = '#ffdb68';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5;
        const r = i % 2 === 0 ? object.radius : object.radius * .45;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawMeteor(object) {
    ctx.save();
    ctx.translate(object.x, object.y);
    ctx.rotate(object.rotation);
    ctx.shadowColor = 'rgba(255, 105, 115, .55)';
    ctx.shadowBlur = 15;
    const g = ctx.createRadialGradient(-7, -8, 2, 0, 0, object.radius * 1.35);
    g.addColorStop(0, '#ffc08b');
    g.addColorStop(.55, '#f0796c');
    g.addColorStop(1, '#873e63');
    ctx.fillStyle = g;
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const r = object.radius * (i % 2 === 0 ? 1 : .83);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(87, 32, 66, .36)';
    ctx.beginPath(); ctx.arc(-5, 4, object.radius * .22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -6, object.radius * .14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    drawBackground();
    for (const object of objects) object.type === 'star' ? drawStar(object) : drawMeteor(object);
    drawParticles();
    drawPlayer();
  }

  function loop(timestamp) {
    if (!running) return;
    const dt = Math.min((timestamp - lastFrame) / 1000, .035);
    lastFrame = timestamp;
    update(dt);
    draw();
    if (running) requestAnimationFrame(loop);
  }

  function setKey(event, value) {
    const key = event.key.toLowerCase();
    if (['arrowleft', 'arrowright', 'a', 'd', ' '].includes(key)) event.preventDefault();
    if (key === 'arrowleft' || key === 'a') keys.left = value;
    if (key === 'arrowright' || key === 'd') keys.right = value;
    if (key === ' ' && value && !running) startGame();
  }

  window.addEventListener('keydown', event => setKey(event, true));
  window.addEventListener('keyup', event => setKey(event, false));
  window.addEventListener('blur', () => { keys.left = false; keys.right = false; });

  function bindHoldButton(button, direction) {
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      keys[direction] = true;
      button.setPointerCapture(event.pointerId);
    });
    const stop = () => { keys[direction] = false; };
    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('lostpointercapture', stop);
    button.addEventListener('pointerleave', stop);
  }
  bindHoldButton(leftButton, 'left');
  bindHoldButton(rightButton, 'right');

  startButton.addEventListener('click', startGame);
  canvas.addEventListener('pointerdown', () => canvas.focus());

  updateHud();
  showOverlay('start');
  draw();
})();
