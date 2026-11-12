const conversation = document.querySelector('#conversation');
const form = document.querySelector('#prompt-form');
const input = document.querySelector('#prompt');
const stage = document.querySelector('.stage');

function replyTo(message) {
  const text = message.toLowerCase();
  if (text.includes('focus')) return 'Try this: choose one small task, set a 20-minute timer, and put everything else out of reach until it rings.';
  if (text.includes('plan') || text.includes('today')) return 'A simple start: pick your top priority, one quick win, and a real break. Add times to each, then begin with the priority.';
  if (text.includes('what can you do') || text.includes('help')) return 'I’m the starter shell for your personal companion. Right now I can show the interface and update flow; an AI provider connection is the next step for real conversations.';
  return 'I’m running in local preview mode, so I can’t answer that for real yet. Connect an AI provider in a future build to give me a brain.';
}
function send(message) {
  const value = message.trim();
  if (!value) return;
  stage.hidden = true;
  conversation.querySelector('.welcome-note')?.remove();
  const user = document.createElement('div');
  user.className = 'bubble user';
  user.textContent = value;
  const zero = document.createElement('div');
  zero.className = 'bubble zero';
  zero.textContent = replyTo(value);
  conversation.append(user, zero);
  conversation.scrollTop = conversation.scrollHeight;
  input.value = '';
}
form.addEventListener('submit', event => { event.preventDefault(); send(input.value); });
document.querySelectorAll('.chips button').forEach(button => button.addEventListener('click', () => send(button.dataset.prompt)));
const shade = document.querySelector('#shade');
document.querySelector('#settings-button').addEventListener('click', () => shade.classList.add('open'));
document.querySelector('#close-settings').addEventListener('click', () => shade.classList.remove('open'));
shade.addEventListener('click', event => { if (event.target === shade) shade.classList.remove('open'); });

const statusLabel = document.querySelector('#update-status');
const settingsStatus = document.querySelector('#settings-update');
const installButton = document.querySelector('#install-update');
function showStatus(status) {
  statusLabel.textContent = status;
  settingsStatus.textContent = status;
  installButton.hidden = !status.includes('is ready');
}
window.zero.getUpdateStatus().then(showStatus);
window.zero.onUpdateStatus(showStatus);
installButton.addEventListener('click', () => window.zero.installUpdate());
