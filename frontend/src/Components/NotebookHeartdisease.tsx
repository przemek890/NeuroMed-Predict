import React, { useState, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { Button, useMediaQuery, IconButton } from '@mui/material';
import { FaArrowRight, FaArrowLeft, FaFastForward, FaFastBackward, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useTranslation } from "react-i18next";

const NotebookDiabetes = () => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [windowDimensions, setWindowDimensions] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [pdfLoadError, setPdfLoadError] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0);
  const transformWrapperRef = useRef<any>(null);

  const pdfFile = '/PDF/Diabetes_prediction.pdf';

  const isMobile = useMediaQuery('(max-width:600px)');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPdfLoadError(false);
  }

  function onDocumentLoadError() {
    setPdfLoadError(true);
  }

  const pageWidth = isMobile ? windowDimensions.width * 0.9 : windowDimensions.height * 0.6;
  const pageHeight = windowDimensions.height * (isMobile ? 0.9 : 0.8);

  const zoomScales: number[] = [1, 1.25, 1.5, 2.0, 2.5, 3.0];

  const handleZoom = (newZoomLevel: number) => {
    if (newZoomLevel >= 0 && newZoomLevel <= 5) {
      setZoomLevel(newZoomLevel);
      if (transformWrapperRef.current) {
        transformWrapperRef.current.setTransform(0, 0, zoomScales[newZoomLevel]);
      }
    }
  };

  const handlePageChange = (newPageNumber: number) => {
    setPageNumber(newPageNumber);
    setZoomLevel(0);
    if (transformWrapperRef.current) {
      transformWrapperRef.current.resetTransform();
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-30px' }}>
      <div style={{ paddingTop: '64px' }} />
      <div style={{
        border: '1px solid lightgrey',
        maxWidth: isMobile ? '100%' : '1200px',
        position: 'relative',
        overflow: 'hidden',
        maxHeight: '90vh',
      }}>
        <TransformWrapper
          ref={transformWrapperRef}
          initialScale={zoomScales[0]}
          minScale={zoomScales[0]}
          maxScale={zoomScales[5]}
          panning={{ disabled: zoomLevel <= 0 }}
          pinch={{ disabled: false }}
          doubleClick={{ disabled: true }}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
                <IconButton
                  onClick={() => handleZoom(zoomLevel + 1)}
                  disabled={zoomLevel === 5}
                  color="default"
                  style={{ color: zoomLevel === 5 ? 'gray' : 'black' }}
                >
                  <FaSearchPlus />
                </IconButton>
                <IconButton
                  onClick={() => handleZoom(zoomLevel - 1)}
                  disabled={zoomLevel === 0}
                  color="default"
                  style={{ color: zoomLevel === 0 ? 'gray' : 'black' }}
                >
                  <FaSearchMinus />
                </IconButton>
              </div>
              <TransformComponent>
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                >
                  {!pdfLoadError ? (
                    <div style={{ marginBottom: '0px' }}>
                      <Page
                        pageNumber={pageNumber}
                        width={pageWidth}
                        height={pageHeight}
                      />
                    </div>
                  ) : (
                    <p>{t('noData')}</p>
                  )}
                </Document>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
      <br />
      {!pdfLoadError && (
        <>
          <p style={{ marginTop: '0px' }}>{t('page')} {pageNumber} {t('of')} {numPages}</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button variant="contained" onClick={() => handlePageChange(1)} disabled={pageNumber === 1}><FaFastBackward /></Button>
            <Button variant="contained" onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber === 1}><FaArrowLeft /></Button>
            <Button variant="contained" onClick={() => handlePageChange(pageNumber + 1)} disabled={pageNumber === numPages}><FaArrowRight /></Button>
            <Button variant="contained" onClick={() => handlePageChange(numPages)} disabled={pageNumber === numPages}><FaFastForward /></Button>
          </div>
        </>
      )}
      <br />
    </div>
  );
};

export default NotebookDiabetes;
