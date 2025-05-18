import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    IconButton,
    Text,
} from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';
import { theme } from '../theme/index.ts';

interface PDFViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
    title: string;
    pageNumber?: string;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ isOpen, onClose, pdfUrl, pageNumber, title }) => {
    const baseParams = 'toolbar=1&navpanes=1&view=FitH';
    const pageParams = pageNumber ? `&page=${pageNumber}` : '';
    const iframeSrc = `${pdfUrl}#${baseParams}${pageParams}`;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
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
                        animation: "gradientFlow 3s linear infinite",
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
                        onClick={onClose}
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