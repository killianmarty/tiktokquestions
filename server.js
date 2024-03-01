const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
var bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'outputs')));

const port = 3000;

// Définir le moteur de vue et le répertoire des vues
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Afficher le formulaire pour sélectionner le dossier distant et le nombre de vidéos
app.get('/', (req, res) => {
  res.render('index');
});

// Gérer la soumission du formulaire
app.post('/concatenate', (req, res) => {
  const remoteFolder = req.body.remoteFolder;
  const numVideos = req.body.numVideos;

  // Vérifier si le dossier distant existe
  const remoteFolderPath = path.join(__dirname, remoteFolder);
  if (!fs.existsSync(remoteFolderPath)) {
    return res.status(400).send('Le dossier distant spécifié n\'existe pas.');
  }
  // Exécuter le programme C pour concaténer les vidéos
  exec(`./main ${remoteFolder} ${numVideos}`, (error, stdout, stderr) => {
    
    // Renvoyer la vidéo concaténée au client
    res.redirect("output.mp4")
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
