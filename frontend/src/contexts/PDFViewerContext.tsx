import React, { createContext, useContext, useState, useCallback } from 'react';

interface PDFViewerContextType {
    isOpen: boolean;
    url: string | null;
    title: string | null;
    pageNumber: string | null;
    openViewer: (url: string, title: string, pageNumber?: string) => void;
    closeViewer: () => void;
}

const PDFViewerContext = createContext<PDFViewerContextType | undefined>(undefined);

export const PDFViewerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState<string | null>(null);
    const [title, setTitle] = useState<string | null>(null);
    const [pageNumber, setPageNumber] = useState<string | null>(null);

    const openViewer = useCallback((url: string, title: string, pageNumber?: string) => {
        setUrl(url);
        setTitle(title);
        setPageNumber(pageNumber || null);
        setIsOpen(true);
    }, []);

    const closeViewer = useCallback(() => {
        setIsOpen(false);
        setUrl(null);
        setTitle(null);
        setPageNumber(null);
    }, []);

    return (
        <PDFViewerContext.Provider value={{ isOpen, url, title, pageNumber, openViewer, closeViewer }}>
            {children}
        </PDFViewerContext.Provider>
    );
};

export const usePDFViewer = () => {
    const context = useContext(PDFViewerContext);
    if (context === undefined) {
        throw new Error('usePDFViewer must be used within a PDFViewerProvider');
    }
    return context;
}; 