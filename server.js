const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;
const publicDir = path.join(__dirname, 'public');
const templatesDir = path.join(__dirname, 'templates');
const collectionPageTemplatePath =
    path.join(templatesDir, 'collection-page.html');
const imageCollections = {
  gallery: path.join(publicDir, 'resources/images/gallery'),
  partners: path.join(publicDir, 'resources/images/ProjectsPartners')
};

function isImageFile(fileName) {
  return /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(fileName);
}

function applyTemplateValues(template, values) {
  return Object.entries(values).reduce((result, [key, value]) => {
    return result.replaceAll(`{{${key}}}`, value);
  }, template);
}

async function renderCollectionPage(config) {
  const template = await fs.readFile(collectionPageTemplatePath, 'utf8');

  return applyTemplateValues(template, config);
}

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

app.get(['/gallery', '/gallery.html'], async (_req, res, next) => {
  try {
    res.send(await renderCollectionPage({
      sectionId: 'galeria',
      eyebrow: 'Galeria',
      subtitle:
          'Todas as imagens da galeria, organizadas em grelha e com ampliacao ao clique.',
      gridId: 'gallery-grid',
      lightboxId: 'gallery-lightbox',
      lightboxCloseId: 'gallery-lightbox-close',
      lightboxDismissId: 'gallery-lightbox-dismiss',
      lightboxImageId: 'gallery-lightbox-image',
      lightboxCaptionId: 'gallery-lightbox-caption',
      lightboxLabel: 'Imagem ampliada da galeria'
    }));
  } catch (error) {
    next(error);
  }
});

app.get(['/partners', '/partners.html'], async (_req, res, next) => {
  try {
    res.send(await renderCollectionPage({
      sectionId: 'parceiros',
      eyebrow: 'Parceiros',
      subtitle:
          'Todos os parceiros, organizados em grelha e com ampliacao ao clique.',
      gridId: 'partners-grid',
      lightboxId: 'partners-lightbox',
      lightboxCloseId: 'partners-lightbox-close',
      lightboxDismissId: 'partners-lightbox-dismiss',
      lightboxImageId: 'partners-lightbox-image',
      lightboxCaptionId: 'partners-lightbox-caption',
      lightboxLabel: 'Imagem ampliada de parceiros'
    }));
  } catch (error) {
    next(error);
  }
});

app.use(express.static(publicDir));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});