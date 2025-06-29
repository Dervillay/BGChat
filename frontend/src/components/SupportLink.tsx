import React, { useState } from "react";
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from "@chakra-ui/react";
import { FiHeart } from 'react-icons/fi';

const SupportLink: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        leftIcon={<FiHeart />}
        size="sm"
        variant="ghost"
        color="gray.400"
        _hover={{ color: "gray.500" }}
        _active={{ transform: "none" }}
        aria-label="Support the project"
        onClick={() => setIsModalOpen(true)}
      >
        <span style={{ fontSize: '0.75rem', color: 'inherit', fontWeight: '100' }}>Support the project</span>
      </Button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent 
          border="none" 
          boxShadow="2xl" 
          bg="white" 
          borderRadius="2rem"
        >
          <ModalBody>
            <iframe
              id='kofiframe' 
              src='https://ko-fi.com/dervillay/?hidefeed=true&widget=true&embed=true&preview=false' 
              width='100%'
              height='600px'
              title='dervillay'
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SupportLink; 