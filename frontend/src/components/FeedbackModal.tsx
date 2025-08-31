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
} from "@chakra-ui/react";
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
  const [feedbackType, setFeedbackType] = useState<string>("general");
  const [content, setContent] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchWithAuth = useFetchWithAuth();
  const toast = useToast();

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
            feedback_type: feedbackType,
            content: content.trim(),
            email: email.trim() || undefined,
            board_game: selectedBoardGame || undefined,
          }),
        }
      ));

      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. If you provided an email, we'll aim to get back to you as soon as possible.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form and close modal
      setFeedbackType("general");
      setContent("");
      setEmail("");
      onClose();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit feedback. Please try again.",
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
      setFeedbackType("general");
      setContent("");
      setEmail("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.300" />
      <ModalContent
        bg="chakra-body-bg"
        border="1px solid"
        borderColor="chakra-body-border"
        borderRadius="xl"
        boxShadow="xl"
        mx={4}
      >
        <ModalHeader
          bgGradient={theme.gradients.cosmic}
          bgClip="text"
          textAlign="center"
          fontSize="2xl"
          fontWeight="semibold"
        >
          Share Your Feedback
        </ModalHeader>
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel fontWeight="medium" color="chakra-body-text">
                Your Feedback
              </FormLabel>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell us what you think, what we can improve, or what new features you'd like to see..."
                minH="120px"
                resize="vertical"
                bg="chakra-body-bg"
                borderColor="chakra-body-border"
                _hover={{ borderColor: "chakra-body-border-focus" }}
                _focus={{ borderColor: "chakra-body-border-focus", boxShadow: "outline" }}
                _placeholder={{ color: "chakra-body-text", opacity: 0.6 }}
              />
              <Text fontSize="sm" color="chakra-body-text" mt={1}>
                {content.length}/1000 characters (minimum 10)
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium" color="chakra-body-text">
                Email (Optional)
              </FormLabel>
              <Text fontSize="sm" color="chakra-body-text" mb={4}>
                Provide your email if you'd like us to follow up on your feedback
              </Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                bg="chakra-body-bg"
                borderColor="chakra-body-border"
                _hover={{ borderColor: "chakra-body-border-focus" }}
                _focus={{ borderColor: "chakra-body-border-focus", boxShadow: "outline" }}
                _placeholder={{ color: "chakra-body-text", opacity: 0.6 }}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            variant="outline"
            onClick={handleClose}
            isDisabled={isSubmitting}
            borderColor="chakra-body-border"
            color="chakra-body-text"
            _hover={{ bg: "chakra-body-message-bg" }}
          >
            Cancel
          </Button>
          <Button
            bgGradient={theme.gradients.cosmic}
            color="white"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Submitting..."
            _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
            _active={{ transform: "translateY(0)" }}
          >
            Submit Feedback
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
