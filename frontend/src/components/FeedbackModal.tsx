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
  FormHelperText,
} from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { theme } from "../theme/index.ts";
import { useFetchWithAuth } from "../utils/fetchWithAuth.ts";
import { withError } from "../utils/withError.ts";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [content, setContent] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchWithAuth = useFetchWithAuth();
  const toast = useToast({
    position: "top",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await withError(() => fetchWithAuth(
        `${process.env.REACT_APP_BACKEND_URL}/submit-feedback`,
        {
          method: "POST",
          body: JSON.stringify({
            content: content.trim(),
            email: email.trim() || "",
          }),
        }
      ));
      toast({
        title: "Thanks for your feedback!",
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
    }
    setIsSubmitting(false);
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
                minLength={10}
                isRequired
                isInvalid={content.length > 0 && content.length < 10}
                {...theme.components.FeedbackModal.baseStyle.textarea}
              />
              <FormHelperText>
                {content.length}/1000 characters
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel {...theme.components.FeedbackModal.baseStyle.formLabel}>
                Email (Optional)
              </FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                isInvalid={email.length > 0 && !email.includes("@")}
                {...theme.components.FeedbackModal.baseStyle.input}
              />
              <FormHelperText>
                Provide your email if you're happy to receive updates
              </FormHelperText>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter {...theme.components.FeedbackModal.baseStyle.footer}>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Sending..."
            {...theme.components.FeedbackModal.baseStyle.submitButton}
          >
            Send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
