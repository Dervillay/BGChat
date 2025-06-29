import React from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    IconButton,
    Text,
    Flex,
    Spinner,
} from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { theme } from "../theme/index.ts";
import { useState, useEffect } from "react";
import { withError } from "../utils/withError.ts";
import { useFetchWithAuth } from "../utils/fetchWithAuth.ts";
import { usePDFViewer } from "../contexts/PDFViewerContext.tsx";

export const PDFViewerModal: React.FC = () => {
    const { isOpen, url, title, pageNumber, closeViewer } = usePDFViewer();
    const [blobUrl, setBlobUrl] = useState<string>();
    const [iframeSrc, setIframeSrc] = useState<string>();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fetchWithAuth = useFetchWithAuth();

    const handleUpdateBlobUrl = async (newUrl: string) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await withError(() => fetchWithAuth(newUrl));
            const blob = await (response as Response).blob();
            
            if (!blob.type.includes('pdf')) {
                throw new Error('The requested file is not a PDF');
            }
            
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
            } else if (error.message === 'The requested file is not a PDF') {
                errorMessage = "The requested file is not a PDF document.";
            } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                errorMessage = "Network error occurred. Please check your connection and try again.";
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateIframeSrc = (blobUrl: string, pageNumber?: string) => {
        const baseParams = "toolbar=1&navpanes=0&scrollbar=0";
        const pageParams = pageNumber ? `&page=${pageNumber}` : "";
        const fullUrl = `${blobUrl}#${baseParams}${pageParams}`;
        setIframeSrc(fullUrl);
    };

    useEffect(() => {
        if (!url) return;
        handleUpdateBlobUrl(url);
    }, [url]);

    useEffect(() => {
        if (!blobUrl) return;
        handleUpdateIframeSrc(blobUrl, pageNumber ?? undefined);
    }, [pageNumber, blobUrl]);

    useEffect(() => {
        if (!isOpen) {
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    if (!url || !title) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={closeViewer} 
            size="4xl" 
            motionPreset="scale"
        >
            <ModalOverlay />
            <ModalContent
                bg="white"
                borderRadius="xl"
                boxShadow="xl"
                position="relative"
                maxW="80vw"
                h="80vh"
                flexDirection="column"
                flex="1"
                border="1px solid"
                borderColor="gray.200"
            >
                <ModalHeader
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    pb={2}
                    position="relative"
                    zIndex={1}
                >
                    <Text
                        fontSize="lg"
                        fontWeight="semibold"
                        bgGradient={theme.gradients.purpleToRed}
                        bgClip="text"
                    >
                        {title}
                    </Text>
                    <IconButton
                        aria-label="Close modal"
                        icon={<FiX />}
                        variant="ghost"
                        onClick={closeViewer}
                        position="absolute"
                        right={3}
                        top={3}
                    />
                </ModalHeader>
                <ModalBody
                    p={1}
                    display="flex"
                    flexDirection="column"
                    flex="1"
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
                                color="gray.600"
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
                            data={blobUrl}
                            type="application/pdf"
                            style={{
                                flex: 1,
                                width: "100%",
                                height: "100%",
                                borderRadius: "0 0 0.5rem 0.5rem"
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