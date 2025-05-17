import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    IconButton,
    Box,
} from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';

interface PDFViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
    pageNumber?: string;
}

// TODO: Extract out styling
export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ isOpen, onClose, pdfUrl, pageNumber }) => {
    const baseParams = 'toolbar=0&navpanes=0&view=FitH';
    const pageParams = pageNumber ? `&page=${pageNumber}` : '';
    const iframeSrc = `${pdfUrl}#${baseParams}${pageParams}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="slideInBottom">
            <ModalOverlay />
            <ModalContent 
                maxW="90vw" 
                maxH="90vh" 
                my="5vh" 
                mx="auto"
                bg="white"
                borderRadius="xl"
                boxShadow="xl"
            >
                <ModalHeader 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="space-between"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    pb={4}
                >
                    <Box flex="1" />
                    <IconButton
                        aria-label="Close modal"
                        icon={<FiX />}
                        variant="ghost"
                        onClick={onClose}
                        position="absolute"
                        right={4}
                        top={4}
                    />
                </ModalHeader>
                <ModalBody p={0}>
                    <iframe
                        src={iframeSrc}
                        style={{
                            width: '100%',
                            height: 'calc(90vh - 80px)',
                            border: 'none',
                        }}
                        title="PDF Viewer"
                    />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}; 