import React from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    IconButton,
    Text,
} from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { theme } from "../theme/index.ts";
import { keyframes } from "@emotion/react";
import { useState, useEffect } from "react";
import { withError } from "../utils/withError.ts";
import { useFetchWithAuth } from "../utils/fetchWithAuth.ts";
import { usePDFViewer } from "../contexts/PDFViewerContext.tsx";

const borderChase = keyframes`
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
`;

export const PDFViewerModal: React.FC = () => {
    const { isOpen, url, title, pageNumber, closeViewer } = usePDFViewer();
    const [blobUrl, setBlobUrl] = useState<string>();
    const [iframeSrc, setIframeSrc] = useState<string>();
    const fetchWithAuth = useFetchWithAuth();

    const handleUpdateBlobUrl = async (newUrl: string) => {
        try {
            const response = await withError(() => fetchWithAuth(newUrl));
            const blob = await (response as Response).blob();
            const newBlobUrl = window.URL.createObjectURL(blob);

            if (blobUrl) {
                window.URL.revokeObjectURL(blobUrl);
            }

            setBlobUrl(newBlobUrl);
        } catch (error) {
            // TODO: add better error handling
            console.error("Error fetching PDF:", error);
        }
    };

    const handleUpdateIframeSrc = (blobUrl: string, pageNumber?: string) => {
        const baseParams = "toolbar=1&navpanes=1&view=FitH";
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
                sx={{
                    _before: {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        padding: "0.2rem",
                        borderRadius: "0.5rem",
                        background: theme.gradients.purpleToRed,
                        backgroundSize: "200% 200%",
                        backgroundPosition: "0% 50%",
                        animation: `${borderChase} 2s ease infinite`,
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        zIndex: -1,
                        pointerEvents: "none"
                    }
                }}
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
                    <iframe
                        src={iframeSrc}
                        title={title}
                        style={{
                            flex: 1,
                            width: "100%",
                            height: "100%",
                            borderRadius: "0 0 0.5rem 0.5rem"
                        }}
                    />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}; 