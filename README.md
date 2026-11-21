# Ares

Ares est un assistant IA bureau pour Windows, macOS et Linux.

## Modes

- **Local gratuit** : modèle léger via Ollama.
- **En ligne** : clé API personnelle saisie dans les paramètres.

Aucune clé API n'est intégrée au dépôt.

## Installation

1. Installez Node.js 20 ou une version récente.
2. Installez Ollama depuis https://ollama.com/download.
3. Téléchargez le modèle : `ollama pull qwen2.5:1.5b`
4. Lancez : `npm install && npm start`

## Configuration en ligne

Ouvrez **Paramètres**, saisissez votre clé API personnelle et enregistrez-la. Elle est chiffrée localement lorsque le système le permet.

## Build

- Windows : `npm run build:win`
- macOS : `npm run build:mac`
- Linux : `npm run build:linux`
