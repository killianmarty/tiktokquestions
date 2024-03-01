const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
var bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'outputs')));

const port = 8080;

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
    res.redirect('output.mp4');
    /*const videoPath = 'outputs/output.mp4'; // Remplacez par le chemin vers votre fichier vidéo
    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }*/
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
