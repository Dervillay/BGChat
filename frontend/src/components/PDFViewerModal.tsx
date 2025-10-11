import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    Text,
    Flex,
    IconButton,
    Spinner,
    Box,
    HStack,
    Button,
} from "@chakra-ui/react";
import { FiX, FiMaximize2, FiMinimize2, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiRotateCcw, FiMonitor, FiSettings } from "react-icons/fi";
import * as pdfjsLib from 'pdfjs-dist';
import { theme } from "../theme/index.ts";
import { withError } from "../utils/withError.ts";
import { useFetchWithAuth } from "../utils/fetchWithAuth.ts";
import { usePDFViewer } from "../contexts/PDFViewerContext.tsx";

export const PDFViewerModal: React.FC = () => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ''}/pdf.worker.min.js`;

    const { isOpen, url, title, pageNumber, closeViewer } = usePDFViewer();
    const fetchWithAuth = useFetchWithAuth();
    const isIOSDevice = (): boolean => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) // iPad on iOS 13+
    };

    const [blobUrl, setBlobUrl] = useState<string>();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [useNativeViewer, setUseNativeViewer] = useState(!isIOSDevice()); // Disable native viewer on iOS
    const [nativeViewerFailed, setNativeViewerFailed] = useState(false);
    const modalContentRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const objectRef = useRef<HTMLObjectElement>(null);

    useEffect(() => {
        if (!url) return;
        setIsLoading(true);
        setError(null);
        setPdfDocument(null);
        setNativeViewerFailed(false);
        
        (async () => {
            try {
                const response = await withError(() => fetchWithAuth(url));
                const arrayBuffer = await response.arrayBuffer();
                
                // Clean up previous blob URL if it exists
                if (blobUrl) {
                    window.URL.revokeObjectURL(blobUrl);
                }
                
                // Create blob URL for both native and PDF.js viewers
                const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
                const newBlobUrl = window.URL.createObjectURL(blob);
                setBlobUrl(newBlobUrl);

                // Use PDF.js if native PDF viewer can't be used or using an iOS device
                if (!useNativeViewer || nativeViewerFailed || isIOSDevice()) {
                    const loadingTask = pdfjsLib.getDocument({ 
                        data: arrayBuffer,
                        cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
                        cMapPacked: true,
                    });
                    const pdf = await loadingTask.promise;
                    
                    setPdfDocument(pdf);
                    setTotalPages(pdf.numPages);
                    setCurrentPage(typeof pageNumber === 'number' ? pageNumber : 1);
                }
            } catch (error: any) {
                let errorMessage = "Failed to load the PDF file.";
                
                if (error.name === "InvalidPDFException") {
                    errorMessage = "The file is not a valid PDF or is corrupted.";
                } else if (error.name === "MissingPDFException") {
                    errorMessage = "The PDF file is missing or empty.";
                } else if (error.name === "UnexpectedResponseException") {
                    errorMessage = "Unexpected response from server while loading PDF.";
                } else if (error.message?.includes("dynamically imported module")) {
                    errorMessage = "PDF viewer failed to load. Please refresh the page and try again.";
                } else if (error.message?.includes("worker")) {
                    errorMessage = "PDF processing worker failed to load. Please check your internet connection.";
                } else if (error.status === 404) {
                    errorMessage = "The PDF file was not found. It may have been moved or deleted.";
                } else if (error.status === 403) {
                    errorMessage = "You don't have permission to access this PDF file.";
                } else if (error.status === 401) {
                    errorMessage = "Authentication required. Please log in again.";
                } else if (error.status >= 500) {
                    errorMessage = "Server error occurred while loading the PDF. Please try again later.";
                } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                    errorMessage = "Network error occurred. Please check your connection and try again.";
                }
                
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [url, pageNumber, useNativeViewer, nativeViewerFailed]);

    useEffect(() => {
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (blobUrl) {
                window.URL.revokeObjectURL(blobUrl);
            }
            if (pdfDocument) {
                pdfDocument.destroy();
            }
        };
    }, [blobUrl, pdfDocument]);

    const renderPage = useCallback(async (pageNum: number) => {
        if (!pdfDocument || !canvasRef.current) return;

        try {
            const page = await pdfDocument.getPage(pageNum);
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            if (!context) return;

            const viewport = page.getViewport({ scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
                canvas: canvas,
            };

            await page.render(renderContext).promise;
        } catch (error) {
            console.error('Error rendering PDF page:', error);
        }
    }, [pdfDocument, scale]);

    useEffect(() => {
        if (pdfDocument && currentPage) {
            renderPage(currentPage);
        }
    }, [pdfDocument, currentPage, renderPage]);

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const zoomIn = () => {
        setScale(prevScale => Math.min(prevScale + 0.25, 3.0));
    };

    const zoomOut = () => {
        setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
    };

    const resetZoom = () => {
        setScale(1.0);
    };

    const handleNativeViewerError = () => {
        setNativeViewerFailed(true);
        setUseNativeViewer(false);
    };

    const handleToggleFullscreen = () => {
        if (!modalContentRef.current) return;

        if (!isFullscreen) {
            modalContentRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        setIsFullscreen(!isFullscreen);
    };

    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    
    const handleClose = () => {
        closeViewer();
        setIsFullscreen(false);
    };

    if (!url || !title) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            size={{ 
                base: "full", 
                md: isFullscreen ? "full" : "6xl" 
            }}
            motionPreset="scale"
            isCentered={true}
        >
            <ModalOverlay />
            <ModalContent
                ref={modalContentRef}
                bg="chakra-body-bg"
                position="relative"
                maxW={{ base: "100vw", md: isFullscreen ? "100vw" : "90vw" }}
                h={{ 
                    base: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))", 
                    md: isFullscreen ? "100vh" : "95vh" 
                }}
                flexDirection="column"
                flex="1"
                overflow="hidden"
                sx={{
                    '::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        borderRadius: { base: '0', md: isFullscreen ? '0' : '1rem' },
                        padding: '2px',
                        background: theme.gradients.cosmic,
                        WebkitMask:
                            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        pointerEvents: 'none',
                    },
                }}
            >
                    <ModalHeader
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        pl={5}
                        pr={2}
                        pt={2}
                        pb={0}
                        position="relative"
                    >
                        <Text
                            fontSize="lg"
                            fontWeight="normal"
                            color="chakra-body-text"
                        >
                            {title}
                        </Text>
                        <Flex align="center" position="relative" minW={{ base: "2.5rem", md: "5rem" }}>
                            <IconButton
                                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                                icon={isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
                                variant="ghost"
                                onClick={handleToggleFullscreen}
                                color="gray.500"
                                _hover={{ color: "gray.700" }}
                                _dark={{
                                    color: "#a0a0a0",
                                    _hover: { 
                                        color: "#e0e0e0",
                                        filter: "brightness(1.3)"
                                    }
                                }}
                                size="md"
                                display={{ base: "none", md: "flex" }}
                            />
                            <Box position="relative">
                                <IconButton
                                    aria-label="Close modal"
                                    icon={<FiX />}
                                    variant="ghost"
                                    onClick={handleClose}
                                    color="gray.500"
                                    _hover={{ color: "gray.700" }}
                                    _dark={{
                                        color: "#a0a0a0",
                                        _hover: { 
                                            color: "#e0e0e0",
                                            filter: "brightness(1.3)"
                                        }
                                    }}
                                    size="md"
                                />
                            </Box>
                        </Flex>
                    </ModalHeader>
                    <ModalBody
                        p={2}
                        display="flex"
                        flexDirection="column"
                        flex="1"
                        bg="chakra-body-bg"
                        borderRadius={{ base: "0", md: "0 0 1rem 1rem" }}
                    >
                        {error ? (
                            <Flex
                                flex="1"
                                direction="column"
                                align="center"
                                justify="center"
                                p={8}
                                textAlign="center"
                            >
                                <Text 
                                    color="chakra-body-text"
                                    fontSize="sm"
                                    mb={4}
                                >
                                    {error}
                                </Text>
                                {blobUrl && (
                                    <Text color="chakra-body-text" fontSize="sm" textAlign="center">
                                        <a 
                                            href={blobUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ color: 'inherit', textDecoration: 'underline' }}
                                        >
                                            Click here to download the rulebook
                                        </a>
                                    </Text>
                                )}
                            </Flex>
                        ) : isLoading ? (
                            <Flex
                                flex="1"
                                align="center"
                                justify="center"
                                direction="column"
                                p={8}
                            >
                                <Spinner size="xl" color="gray.300" speed="0.65s" />
                            </Flex>
                        ) : blobUrl ? (
                            <>
                                {/* Native PDF Viewer - disabled on iOS */}
                                {useNativeViewer && !nativeViewerFailed && !isIOSDevice() ? (
                                    <object
                                        ref={objectRef}
                                        data={pageNumber ? `${blobUrl}#page=${pageNumber}` : blobUrl}
                                        type="application/pdf"
                                        style={{
                                            flex: 1,
                                            width: "100%",
                                            height: "100%",
                                            border: "none",
                                        }}
                                        title={title}
                                        onError={handleNativeViewerError}
                                    >
                                        <Text color="chakra-body-text" fontSize="sm" textAlign="center">
                                            Your browser doesn't support native PDF viewing.
                                            <br />
                                            <Button
                                                variant="link"
                                                color="inherit"
                                                textDecoration="underline"
                                                onClick={() => setUseNativeViewer(false)}
                                                size="sm"
                                            >
                                                Switch to PDF.js viewer
                                            </Button>
                                        </Text>
                                    </object>
                                ) : pdfDocument ? (
                                    <>
                                        {/* PDF.js Viewer Controls */}
                                        <HStack justify="center" spacing={4} mb={4} flexWrap="wrap">
                                            {/* Page Navigation */}
                                            {totalPages > 1 && (
                                                <>
                                                    <IconButton
                                                        aria-label="Previous page"
                                                        icon={<FiChevronLeft />}
                                                        onClick={goToPreviousPage}
                                                        isDisabled={currentPage <= 1}
                                                        variant="ghost"
                                                        size="sm"
                                                        color="gray.500"
                                                        _hover={{ color: "gray.700" }}
                                                        _dark={{
                                                            color: "#a0a0a0",
                                                            _hover: { 
                                                                color: "#e0e0e0",
                                                                filter: "brightness(1.3)"
                                                            }
                                                        }}
                                                    />
                                                    <Text color="chakra-body-text" fontSize="sm" minW="80px" textAlign="center">
                                                        Page {currentPage} of {totalPages}
                                                    </Text>
                                                    <IconButton
                                                        aria-label="Next page"
                                                        icon={<FiChevronRight />}
                                                        onClick={goToNextPage}
                                                        isDisabled={currentPage >= totalPages}
                                                        variant="ghost"
                                                        size="sm"
                                                        color="gray.500"
                                                        _hover={{ color: "gray.700" }}
                                                        _dark={{
                                                            color: "#a0a0a0",
                                                            _hover: { 
                                                                color: "#e0e0e0",
                                                                filter: "brightness(1.3)"
                                                            }
                                                        }}
                                                    />
                                                </>
                                            )}
                                            
                                            {/* Zoom Controls */}
                                            <Box borderLeft="1px solid" borderColor="gray.300" pl={4} ml={4}>
                                                <HStack spacing={2}>
                                                    <IconButton
                                                        aria-label="Zoom out"
                                                        icon={<FiZoomOut />}
                                                        onClick={zoomOut}
                                                        isDisabled={scale <= 0.5}
                                                        variant="ghost"
                                                        size="sm"
                                                        color="gray.500"
                                                        _hover={{ color: "gray.700" }}
                                                        _dark={{
                                                            color: "#a0a0a0",
                                                            _hover: { 
                                                                color: "#e0e0e0",
                                                                filter: "brightness(1.3)"
                                                            }
                                                        }}
                                                    />
                                                    <Text color="chakra-body-text" fontSize="sm" minW="50px" textAlign="center">
                                                        {Math.round(scale * 100)}%
                                                    </Text>
                                                    <IconButton
                                                        aria-label="Zoom in"
                                                        icon={<FiZoomIn />}
                                                        onClick={zoomIn}
                                                        isDisabled={scale >= 3.0}
                                                        variant="ghost"
                                                        size="sm"
                                                        color="gray.500"
                                                        _hover={{ color: "gray.700" }}
                                                        _dark={{
                                                            color: "#a0a0a0",
                                                            _hover: { 
                                                                color: "#e0e0e0",
                                                                filter: "brightness(1.3)"
                                                            }
                                                        }}
                                                    />
                                                    <IconButton
                                                        aria-label="Reset zoom"
                                                        icon={<FiRotateCcw />}
                                                        onClick={resetZoom}
                                                        variant="ghost"
                                                        size="sm"
                                                        color="gray.500"
                                                        _hover={{ color: "gray.700" }}
                                                        _dark={{
                                                            color: "#a0a0a0",
                                                            _hover: { 
                                                                color: "#e0e0e0",
                                                                filter: "brightness(1.3)"
                                                            }
                                                        }}
                                                    />
                                                </HStack>
                                            </Box>
                                        </HStack>
                                        
                                        {/* PDF.js Canvas */}
                                        <Flex
                                            flex="1"
                                            align="center"
                                            justify="center"
                                            overflow="auto"
                                            p={2}
                                        >
                                            <Box
                                                border="1px solid"
                                                borderColor="gray.200"
                                                borderRadius="md"
                                                overflow="hidden"
                                                _dark={{
                                                    borderColor: "gray.600"
                                                }}
                                            >
                                                <canvas
                                                    ref={canvasRef}
                                                    style={{
                                                        maxWidth: "100%",
                                                        maxHeight: "100%",
                                                        display: "block",
                                                    }}
                                                />
                                            </Box>
                                        </Flex>
                                    </>
                                ) : (
                                    <Flex
                                        flex="1"
                                        align="center"
                                        justify="center"
                                        direction="column"
                                        p={8}
                                    >
                                        <Spinner size="xl" color="gray.300" speed="0.65s" />
                                    </Flex>
                                )}
                            </>
                        ) : null}
                    </ModalBody>
                </ModalContent>
        </Modal>
    );
}; 