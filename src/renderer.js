const form = document.querySelector('#form');
const prompt = document.querySelector('#prompt');
const mode = document.querySelector('#mode');
const messages = document.querySelector('#messages');
const send = document.querySelector('#send');
const settings = document.querySelector('#settings');
const settingsButton = document.querySelector('#settingsButton');
const apiKey = document.querySelector('#apiKey');
const localModel = document.querySelector('#localModel');
const saveSettings = document.querySelector('#saveSettings');

const history = [{ role: 'system', content: 'Tu es Ares, un assistant utile, clair, prudent et concis. Réponds en français.' }];

function addMessage(text, role = 'assistant', extraClass = '') {
  const element = document.createElement('div');
  element.className = `message ${role} ${extraClass}`.trim();
  element.textContent = text;
  messages.appendChild(element);
  messages.scrollTop = messages.scrollHeight;
  return element;
}

async function loadConfig() {
  const config = await window.ares.getConfig();
  apiKey.value = config.apiKey || '';
  localModel.value = config.model || 'qwen2.5:1.5b';
}

settingsButton.addEventListener('click', () => settings.classList.toggle('open'));
saveSettings.addEventListener('click', async () => {
  await window.ares.saveConfig({ apiKey: apiKey.value.trim(), model: localModel.value.trim() || 'qwen2.5:1.5b' });
  settings.classList.remove('open');
  addMessage('Paramètres enregistrés sur cet appareil.');
});

prompt.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const text = prompt.value.trim();
  if (!text || send.disabled) return;

  prompt.value = '';
  send.disabled = true;
  addMessage(text, 'user');
  history.push({ role: 'user', content: text });
  const pending = addMessage('Réflexion…');

  try {
    const answer = mode.value === 'local'
      ? await window.ares.askLocal(history, localModel.value.trim() || 'qwen2.5:1.5b')
      : await window.ares.askOnline(history);
    pending.remove();
    addMessage(answer);
    history.push({ role: 'assistant', content: answer });
  } catch (error) {
    pending.remove();
    addMessage(error.message || 'Une erreur est survenue.', 'assistant', 'error');
  } finally {
    send.disabled = false;
    prompt.focus();
  }
});

loadConfig();
addMessage('Bonjour, je suis Ares. Comment puis-je vous aider ?');
