"use client";
import React, { useState, useCallback, useId } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { X, Download } from "lucide-react";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker using the official method
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// PDF options for better rendering
const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
  wasmUrl: '/wasm/',
};

const PDFViewer = ({ isOpen, onClose, onDownload }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  const [containerRef, setContainerRef] = useState(null);
  const [containerWidth, setContainerWidth] = useState(800);

  const onResize = useCallback((entries) => {
    const [entry] = entries;
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, {}, onResize);

  if (!isOpen) return null;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setPdfError('Failed to load PDF. Please try downloading the file instead.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-primary rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-light">
          <h2 className="text-xl font-semibold text-text-primary">Resume</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-3 py-2 bg-accent-green hover:bg-accent-green/90 text-white rounded-lg transition-colors"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
            >
              <X size={20} className="text-text-primary" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex justify-center" ref={setContainerRef}>
            {pdfError ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="text-red-500 mb-4">
                  <X size={48} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">PDF Load Error</h3>
                <p className="text-text-secondary mb-4">{pdfError}</p>
                <button
                  onClick={onDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-green hover:bg-accent-green/90 text-white rounded-lg transition-colors"
                >
                  <Download size={16} />
                  Download Resume Instead
                </button>
              </div>
            ) : (
              <Document
                file="/resume.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                options={options}
                className="max-w-full"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={Math.min(containerWidth, 800)}
                    className="shadow-lg mb-4"
                  />
                ))}
              </Document>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PDFViewer;
