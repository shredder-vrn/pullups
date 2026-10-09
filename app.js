const STORAGE_KEY = 'challenges';

const PROGRAM = [
  [6, 5, 5, 4, 3], [7, 6, 5, 4, 4], [8, 6, 5, 5, 4], [8, 7, 5, 5, 5], [9, 7, 6, 5, 5],
  [10, 7, 6, 6, 5], [10, 8, 6, 6, 6], [11, 8, 7, 6, 6], [12, 8, 7, 7, 6], [12, 9, 7, 7, 7],
  [13, 9, 8, 7, 7], [14, 9, 8, 8, 7], [14, 10, 8, 8, 7], [15, 10, 9, 8, 8], [16, 10, 9, 9, 8],
  [16, 11, 9, 9, 8], [17, 11, 10, 9, 9], [18, 11, 10, 10, 9], [18, 12, 10, 10, 9], [19, 12, 11, 10, 10],
  [20, 12, 11, 11, 10], [20, 13, 11, 11, 10], [21, 13, 12, 11, 11], [22, 13, 12, 12, 11], [22, 14, 12, 12, 11],
  [23, 14, 13, 12, 12], [24, 14, 13, 13, 12], [24, 15, 13, 13, 12], [25, 15, 14, 13, 13], [26, 15, 14, 14, 13]
];

let state = loadState();

function defaultState() {
  return { week: 1, log: [] };
}

function loadState() {
  try {
    return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function planFor(week) {
  return PROGRAM[week - 1];
}

function isLastWeek() {
  return state.week === PROGRAM.length;
}

function showScreen(id) {
  document.getElementById('home').hidden = id !== 'home';
  document.getElementById('pullups').hidden = id !== 'pullups';
  window.scrollTo(0, 0);
}

function openPullups() {
  render();
  showScreen('pullups');
  scrollToCurrentWeek();
}

function goHome() {
  render();
  showScreen('home');
}

function selectWeek(week) {
  state.week = week;
  saveState();
  render();
}

function finishWorkout(result) {
  state.log.unshift({ date: new Date().toISOString(), week: state.week, result });
  if (result === 'next' && !isLastWeek()) {
    state.week += 1;
  }
  saveState();
  render();
  scrollToCurrentWeek();
}

function scrollToCurrentWeek() {
  const current = document.querySelector('.week.current');
  if (current) {
    current.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function weekClass(week) {
  if (week === state.week) {
    return 'week current';
  }
  return week < state.week ? 'week passed' : 'week';
}

function renderHome() {
  document.getElementById('tile-week').textContent = `Week ${state.week}`;
}

function renderWeeks() {
  document.getElementById('weeks').innerHTML = PROGRAM
    .map((plan, index) => `<button class="${weekClass(index + 1)}" data-week="${index + 1}">${index + 1}</button>`)
    .join('');
}

function renderPlan() {
  const plan = planFor(state.week);
  document.getElementById('week-name').textContent = `Week ${state.week}`;
  document.getElementById('week-total').textContent = `Total ${sum(plan)}`;
  document.getElementById('sets').innerHTML = plan
    .map((reps, index) => `<li class="set"><span class="set-reps">${reps}</span><span class="set-label">set ${index + 1}</span></li>`)
    .join('');
}

function renderActions() {
  const next = document.getElementById('next');
  next.disabled = isLastWeek();
  next.textContent = isLastWeek() ? 'Program complete' : 'Done clean · next week';
}

function renderLog() {
  const items = state.log.slice(0, 10).map(entry => {
    const label = entry.result === 'next' ? 'Next week' : 'Repeat';
    return `<li><span>${formatDate(entry.date)}</span><span>Week ${entry.week}</span><span class="result ${entry.result}">${label}</span></li>`;
  });
  document.getElementById('log').innerHTML = items.length ? items.join('') : '<li class="empty">No workouts yet</li>';
}

function render() {
  renderHome();
  renderWeeks();
  renderPlan();
  renderActions();
  renderLog();
}

function handleWeekClick(event) {
  const button = event.target.closest('.week');
  if (button) {
    selectWeek(Number(button.dataset.week));
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

function init() {
  document.getElementById('open-pullups').addEventListener('click', openPullups);
  document.getElementById('back').addEventListener('click', goHome);
  document.getElementById('weeks').addEventListener('click', handleWeekClick);
  document.getElementById('next').addEventListener('click', () => finishWorkout('next'));
  document.getElementById('repeat').addEventListener('click', () => finishWorkout('repeat'));
  registerServiceWorker();
  render();
}

init();
