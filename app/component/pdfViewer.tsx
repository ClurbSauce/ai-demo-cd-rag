import React, { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { zoomPlugin } from '@react-pdf-viewer/zoom';

interface PDFViewerProps {
    fileUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
    const zoomPluginInstance = zoomPlugin();
    const { ZoomInButton, ZoomOutButton, ZoomPopover } = zoomPluginInstance;
    return (
        // <div style={{ height: '100%' }}>
        //     <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
        //         <Viewer fileUrl={fileUrl} />
        //     </Worker>
        // </div>
        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <ZoomOutButton />
                <ZoomPopover />
                <ZoomInButton />
            </div>
            <div style={{ height: '90%' }}>
                <Viewer
                    fileUrl={fileUrl}
                    plugins={[zoomPluginInstance]}
                />
            </div>
        </Worker>
    );
};

export default PDFViewer;
