import React, { useState, useEffect, useRef } from "react";
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
} from "@chakra-ui/react";
import { FiX, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { theme } from "../theme/index.ts";
import { withError } from "../utils/withError.ts";
import { useFetchWithAuth } from "../utils/fetchWithAuth.ts";
import { usePDFViewer } from "../contexts/PDFViewerContext.tsx";

export const PDFViewerModal: React.FC = () => {
    const { isOpen, url, title, pageNumber, closeViewer } = usePDFViewer();
    const [blobUrl, setBlobUrl] = useState<string>();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const objectRef = useRef<HTMLObjectElement>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);
    const fetchWithAuth = useFetchWithAuth();

    useEffect(() => {
        if (!url) return;
        setIsLoading(true);
        setError(null);
        
        (async () => {
            try {
                const response = await withError(() => fetchWithAuth(url));
                const blob = await response.blob();
                const newBlobUrl = window.URL.createObjectURL(blob);

                if (blobUrl) {
                    window.URL.revokeObjectURL(blobUrl);
                }

                setBlobUrl(newBlobUrl);
            } catch (error: any) {
                let errorMessage = "Failed to load the PDF file.";
                
                if (error.status === 404) {
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
    }, [url]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

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
            size={isMobile ? undefined : "4xl"}
            motionPreset="scale"
            isCentered
        >
            <ModalOverlay />
            <ModalContent
                ref={modalContentRef}
                bg="chakra-body-bg"
                position="relative"
                borderRadius="1rem"
                maxW={isMobile ? "100vw" : "80vw"}
                h={isMobile ? "100vh" : "95vh"}
                flexDirection="column"
                flex="1"
                overflow="hidden"
                sx={{
                    '::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        borderRadius: '1rem',
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
                            {!isMobile && (
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
                                />
                            )}
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
                        borderRadius="0 0 1rem 1rem"
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
                        ) : (
                            <object
                                ref={objectRef}
                                data={blobUrl}
                                type="application/pdf"
                                style={{
                                    flex: 1,
                                    width: "100%",
                                    height: "100%",
                                }}
                            >
                                <p>Your browser does not support PDF viewing. 
                                    <a href={blobUrl} target="_blank" rel="noopener noreferrer">
                                        Click here to download the PDF
                                    </a>
                                </p>
                            </object>
                        )}
                    </ModalBody>
                </ModalContent>
        </Modal>
    );
}; 