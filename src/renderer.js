const form = document.querySelector('#form');
const prompt = document.querySelector('#prompt');
const mode = document.querySelector('#mode');
const messages = document.querySelector('#messages');
const send = document.querySelector('#send');

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

async function requestLocal(text) {
  const response = await fetch('http://127.0.0.1:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5:1.5b',
      stream: false,
      messages: [
        { role: 'system', content: 'Tu es Ares, un assistant utile, clair et concis.' },
        { role: 'user', content: text }
      ]
    })
  });
  if (!response.ok) throw new Error(`Ollama indisponible (${response.status})`);
  const data = await response.json();
  return data.message?.content || 'Aucune réponse reçue.';
}

async function requestOnline(text) {
  return window.ares.askOnline(text);
}

form.addEventListener('submit', async event => {
  event.prevent.preventDefault;
});
