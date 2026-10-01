const timeEl = document.querySelector('#time');
const startBtn = document.querySelector('#startBtn');
const startLabel = document.querySelector('#startLabel');
const resetBtn = document.querySelector('#resetBtn');
const lapBtn = document.querySelector('#lapBtn');
const lapsBody = document.querySelector('#lapsBody');
const lapCount = document.querySelector('#lapCount');
const statusPill = document.querySelector('#statusPill');
const statusText = document.querySelector('#statusText');
const timerCard = document.querySelector('.timer-card');
const orbitUnits = {
  hours: document.querySelector('#orbitHours'),
  minutes: document.querySelector('#orbitMinutes'),
  seconds: document.querySelector('#orbitSeconds'),
};
const runnerUnits = {
  hours: { card: document.querySelector('#hoursRunner'), value: document.querySelector('#hoursValue'), state: document.querySelector('#hoursState'), character: document.querySelector('#hoursCharacter') },
  minutes: { card: document.querySelector('#minutesRunner'), value: document.querySelector('#minutesValue'), state: document.querySelector('#minutesState'), character: document.querySelector('#minutesCharacter') },
  seconds: { card: document.querySelector('#secondsRunner'), value: document.querySelector('#secondsValue'), state: document.querySelector('#secondsState'), character: document.querySelector('#secondsCharacter') },
};

let elapsed = 0;
let lastLap = 0;
let running = false;
let startedAt = 0;
let animationFrame;
let laps = [];

function format(ms) {
  const totalCentiseconds = Math.floor(ms / 10);
  const minutes = Math.floor(totalCentiseconds / 6000);
  const seconds = Math.floor((totalCentiseconds % 6000) / 100);
  const centiseconds = totalCentiseconds % 100;
  return { main: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`, fraction: `.${String(centiseconds).padStart(2, '0')}` };
}

function renderTime() {
  const value = format(elapsed);
  timeEl.innerHTML = `${value.main}<span>${value.fraction}</span>`;
  renderRunners();
}

function renderRunners() {
  const totalSeconds = Math.floor(elapsed / 1000);
  const values = { hours: Math.floor(totalSeconds / 3600), minutes: Math.floor(totalSeconds / 60) % 60, seconds: totalSeconds % 60 };
  Object.entries(values).forEach(([unit, number]) => {
    const item = runnerUnits[unit];
    const isResting = number === 0;
    const isFast = number >= 10;
    item.value.textContent = String(number).padStart(2, '0');
    item.state.textContent = isResting ? '휴식 중' : (isFast ? '힘차게 달리는 중' : '천천히 달리는 중');
    item.character.textContent = isResting ? '🧘' : (isFast ? '🏃' : '🚶');
    item.card.classList.toggle('resting', isResting);
    item.card.classList.toggle('active', !isResting && !isFast);
    item.card.classList.toggle('fast', isFast);
    const orbitCharacter = orbitUnits[unit];
    orbitCharacter.textContent = item.character.textContent;
    orbitCharacter.parentElement.classList.toggle('active', !isResting && !isFast);
    orbitCharacter.parentElement.classList.toggle('fast', isFast);
  });
}

function tick(now) {
  elapsed = now - startedAt;
  renderTime();
  if (running) animationFrame = requestAnimationFrame(tick);
}

function setRunning(next) {
  running = next;
  startBtn.classList.toggle('running', running);
  startLabel.textContent = running ? '일시정지' : (elapsed > 0 ? '계속' : '시작');
  lapBtn.disabled = !running;
  statusPill.classList.toggle('running', running);
  timerCard.classList.toggle('running', running);
  statusText.textContent = running ? '측정 중' : (elapsed > 0 ? '일시정지됨' : '준비됨');
  if (running) {
    startedAt = performance.now() - elapsed;
    animationFrame = requestAnimationFrame(tick);
  } else {
    cancelAnimationFrame(animationFrame);
  }
}

function addLap() {
  if (!running) return;
  const split = elapsed - lastLap;
  lastLap = elapsed;
  laps.unshift({ split, total: elapsed });
  renderLaps();
}

function renderLaps() {
  lapCount.textContent = `${laps.length}개`;
  if (!laps.length) {
    lapsBody.innerHTML = '<tr class="empty-row"><td colspan="3"><div class="empty-state"><span class="empty-icon">＋</span><span>스톱워치를 시작하고 랩을 기록해 보세요</span></div></td></tr>';
    return;
  }
  lapsBody.innerHTML = laps.map((lap, index) => {
    const split = format(lap.split); const total = format(lap.total);
    return `<tr><td>${String(laps.length - index).padStart(2, '0')}</td><td>${split.main}${split.fraction}</td><td>${total.main}${total.fraction}</td></tr>`;
  }).join('');
}

function reset() {
  setRunning(false); elapsed = 0; lastLap = 0; laps = []; renderTime(); renderLaps();
}

startBtn.addEventListener('click', () => setRunning(!running));
resetBtn.addEventListener('click', reset);
lapBtn.addEventListener('click', addLap);
document.addEventListener('keydown', (event) => {
  if (event.target.matches('input, textarea, button')) return;
  if (event.code === 'Space') { event.preventDefault(); setRunning(!running); }
  if (event.key.toLowerCase() === 'l') addLap();
  if (event.key.toLowerCase() === 'r') reset();
});

renderTime();
