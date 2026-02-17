// copy-pdf-worker.js
const fs = require('fs');
const path = require('path');

const sourcePath = path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.js');
const targetPath = path.resolve(__dirname, 'public/pdf.worker.min.js');

fs.copyFile(sourcePath, targetPath, (err) => {
  if (err) {
    console.error('Erreur lors de la copie du worker PDF:', err);
  } else {
    console.log('✅ pdf.worker.min.js copié avec succès dans /public');
  }
});
