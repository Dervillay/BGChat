import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { theme } from "../theme/index.ts";
import { useFetchWithAuth } from "../utils/fetchWithAuth.ts";
import { withError } from "../utils/withError.ts";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBoardGame?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  selectedBoardGame,
}) => {
  const [content, setContent] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchWithAuth = useFetchWithAuth();
  const toast = useToast({
    position: "top",
  });

  const handleSubmit = async () => {
    if (!content.trim() || content.trim().length < 10) {
      toast({
        title: "Invalid feedback",
        description: "Please provide feedback with at least 10 characters.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (email && !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please provide a valid email address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await withError(() => fetchWithAuth(
        `${process.env.REACT_APP_BACKEND_URL}/submit-feedback`,
        {
          method: "POST",
          body: JSON.stringify({
            content: content.trim(),
            email: email.trim() || undefined,
          }),
        }
      ));

      toast({
        title: "Thank you for your feedback!",
        description: "If you provided an email, we'll aim to get back to you as soon as possible.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setContent("");
      setEmail("");
      onClose();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit feedback. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setContent("");
      setEmail("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay {...theme.components.FeedbackModal.baseStyle.overlay} />
      <ModalContent {...theme.components.FeedbackModal.baseStyle.content}>
        <ModalHeader {...theme.components.FeedbackModal.baseStyle.header}>
          <Text {...theme.components.FeedbackModal.baseStyle.headerText}>
            Share Your Feedback
          </Text>
          <IconButton
            aria-label="Close modal"
            icon={<FiX />}
            onClick={handleClose}
            {...theme.components.FeedbackModal.baseStyle.closeButton}
          />
        </ModalHeader>
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel {...theme.components.FeedbackModal.baseStyle.formLabel}>
                Feedback
              </FormLabel>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell us your thoughts, how we can improve, or what new board games you'd like to see"
                {...theme.components.FeedbackModal.baseStyle.textarea}
              />
              <Text {...theme.components.FeedbackModal.baseStyle.helperText}>
                {content.length}/1000 characters (minimum 10)
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium" color="chakra-body-text">
                Email (Optional)
              </FormLabel>
              <Text fontSize="sm" color="chakra-body-text" mb={4}>
                Provide your email if you're happy to receive updates
              </Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                borderColor="chakra-body-border"
                _hover={{ borderColor: "chakra-body-border-focus" }}
                _focus={{ borderColor: "chakra-body-border-focus", boxShadow: "outline" }}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent="flex-end">
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Sending..."
          >
            Send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
