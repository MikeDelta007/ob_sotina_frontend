// components/PdfViewer.js
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

const PdfViewer = ({ fileUrl }) => {
  const [isClient, setIsClient] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setIsClient(true);
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
  }, []);

  if (!isClient) {
    return <p>Chargement du PDF...</p>;
  }

  const handleZoomIn = () => {
    setZoom((prevZoom) => prevZoom + 0.2);
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.2, 0.2));
  };

  const changePage = (newPageNumber) => {
    setPageNumber(newPageNumber);
  };

  return (
    <div style={{ border: '1px solid #ccc', height: '600px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <button onClick={handleZoomIn}>Zoom +</button>
        <button onClick={handleZoomOut}>Zoom -</button>
      </div>

      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
        loading="Chargement du PDF..."
        onLoadError={(error) => console.error("❌ Erreur chargement PDF:", error)}
      >
        <Page
          pageNumber={pageNumber}
          scale={zoom}
        />
      </Document>

      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          disabled={pageNumber <= 1}
          onClick={() => changePage(pageNumber - 1)}
        >
          Page Précédente
        </button>
        <span>Page {pageNumber} sur {totalPages}</span>
        <button
          disabled={pageNumber >= totalPages}
          onClick={() => changePage(pageNumber + 1)}
        >
          Page Suivante
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={pageNumber}
          onChange={(e) => {
            const newPageNumber = Math.min(Math.max(1, parseInt(e.target.value)), totalPages);
            setPageNumber(newPageNumber);
          }}
        />
        <span> de {totalPages} pages</span>
      </div>
    </div>
  );
};

export default PdfViewer;
