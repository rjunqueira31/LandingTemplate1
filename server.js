const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;
const publicDir = path.join(__dirname, 'public');
const imageCollections = {
  gallery: path.join(publicDir, 'resources/images/gallery'),
  partners: path.join(publicDir, 'resources/images/ProjectsPartners')
};

function isImageFile(fileName) {
  return /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(fileName);
}

app.use(express.static(publicDir));

app.get('/api/images/:collection', async (req, res) => {
  const directory = imageCollections[req.params.collection];

  if (!directory) {
    res.status(404).json({error: 'Unknown image collection'});
    return;
  }

  try {
    const entries = await fs.readdir(directory, {withFileTypes: true});
    const files =
        entries.filter((entry) => entry.isFile() && isImageFile(entry.name))
            .map((entry) => entry.name)
            .sort(
                (left, right) => left.localeCompare(
                    right, undefined, {numeric: true, sensitivity: 'base'}));

    res.json({files});
  } catch (error) {
    console.error(
        `Failed to read image collection \"${req.params.collection}\":`, error);
    res.status(500).json({error: 'Failed to read image collection'});
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/gallery', (_req, res) => {
  res.sendFile(path.join(publicDir, 'gallery.html'));
});

app.get('/partners', (_req, res) => {
  res.sendFile(path.join(publicDir, 'partners.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});