const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');

let mainWindow;

function configPath() {
  return path.join(app.getPath('userData'), 'ares.json');
}

function readConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(configPath(), 'utf8'));
    if (config.apiKeyEncrypted && safeStorage.isEncryptionAvailable()) {
      config.apiKey = safeStorage.decryptString(Buffer.from(config.apiKeyEncrypted, 'base64'));
    }
    return config;
  } catch {
    return {};
  }
}

function saveConfig(config) {
  const stored = { model: config.model || 'qwen2.5:1.5b' };
  if (config.apiKey) {
    if (safeStorage.isEncryptionAvailable()) {
      stored.apiKeyEncrypted = safeStorage.encryptString(config.apiKey).toString('base64');
    }
  }
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(stored, null, 2), 'utf8');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 720,
    backgroundColor: '#090d18',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
}

function postJson(url, headers, body) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const client = target.protocol === 'https:' ? https : http;
    const request = client.request(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers }
    }, response => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        try {
          resolve({ status: response.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: response.statusCode, data: { error: data || 'Réponse invalide' } });
        }
      });
    });
    request.on('error', reject);
    request.setTimeout(120000, () => request.destroy(new Error('Temps de réponse dépassé')));
    request.end(body);
  });
}

ipcMain.handle('ares:get-config', () => {
  const config = readConfig();
  return { apiKey: config.apiKey || '', model: config.model || 'qwen2.5:1.5b' };
});

ipcMain.handle('ares:save-config', (_event, config) => {
  saveConfig(config);
  return true;
});

ipcMain.handle('ares:ask-local', async (_event, messages, model) => {
  const body = JSON.stringify({ model: model || 'qwen2.5:1.5b', stream: false, messages });
  const response = await postJson('http://127.0.0.1:11434/api/chat', {}, body);
  if (response.status !== 200) {
    throw new Error(response.data.error || 'Ollama indisponible. Lancez Ollama et vérifiez le modèle.');
  }
  return response.data.message?.content || 'Aucune réponse reçue.';
});

ipcMain.handle('ares:ask-online', async (_event, messages) => {
  const config = readConfig();
  if (!config.apiKey) throw new Error('Ajoutez votre clé API personnelle dans les paramètres.');
  const body = JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.7 });
  const response = await postJson(
    'https://api.openai.com/v1/chat/completions',
    { Authorization: `Bearer ${config.apiKey}` },
    body
  );
  if (response.status !== 200) {
    throw new Error(response.data.error?.message || `Erreur en ligne (${response.status})`);
  }
  return response.data.choices?.[0]?.message?.content || 'Aucune réponse reçue.';
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
