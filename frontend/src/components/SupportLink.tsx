import React, { useState } from "react";
import { Link, Text, Modal, ModalOverlay, ModalContent, ModalBody, Flex, Icon } from "@chakra-ui/react";
import { FiHeart } from 'react-icons/fi';

const SupportLink: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const iconColor = isHovered ? "gray.500" : "gray.400";

  return (
    <>
      <Link 
        onClick={() => setIsModalOpen(true)} 
        _hover={{ textDecoration: "none" }} 
        cursor="pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Flex align="center" gap={1}>
          <Icon as={FiHeart} boxSize={3} color={iconColor} />
          <Text fontSize="sm" color={iconColor} fontWeight="thin">
            Support the project
          </Text>
        </Flex>
      </Link>

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