const form = document.querySelector('#form');
const prompt = document.querySelector('#prompt');
const mode = document.querySelector('#mode');
const messages = document.querySelector('#messages');
const send = document.querySelector('#send');

const history = [{ role: 'system', content: 'Tu es Ares, un assistant utile, clair, prudent et concis. Réponds en français.' }];

function addMessage(text, role = 'assistant', extraClass = '') {
  const element = document.createElement('div');
  element.className = `message ${role} ${extraClass}`.trim();
  element.textContent = text;
  messages.appendChild(element);
  messages.scrollTop = messages.scrollHeight;
  return element;
}

form.addEventListener('submit', async (event) => {
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
      ? await window.ares.askLocal(history)
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
