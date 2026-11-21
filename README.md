# Ares

Ares est un assistant IA multi-plateformes destiné à fonctionner sous Windows, macOS et Linux.

## Fonctionnalités prévues

- Mode local gratuit basé sur Ollama
- Mode en ligne avec clé API personnelle de l'utilisateur
- Interface bureau simple
- Installation Windows, macOS et Linux

## Développement

```bash
npm install
npm start
```

## Mode local

1. Installe Ollama: https://ollama.com/download
2. Télécharge le petit modèle léger:

```bash
ollama pull qwen2.5:1.5b
```

3. Lance Ares avec `npm start`.

## Construction des installateurs

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

> Ne placez jamais une clé API dans les fichiers publiés du dépôt.
