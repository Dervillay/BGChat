import React, { useState, useEffect } from "react";
import { Box, Text, Container, Flex, Icon, IconButton } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FiAlertCircle, FiX } from "react-icons/fi";
import { theme } from "../theme/index.ts";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const errorTitles = [
    "Something went wrong...",
    "Well, that's not ideal...",
    "Houston, we have a problem...",
    "This is awkward..."
];

interface ErrorMessageProps {
    content: string;
    onClose?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ content, onClose }) => {
    const [title, setTitle] = useState(errorTitles[0]);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * errorTitles.length);
        setTitle(errorTitles[randomIndex]);
    }, []);

    return (
        <Container maxW="48rem" p={0}>
            <Flex justifyContent="flex-start">
                <Box 
                    maxW="100%" 
                    bg="white"
                    border="1px" 
                    borderColor="red.100" 
                    borderRadius="lg" 
                    p={5}
                    position="relative"
                    boxShadow="sm"
                    _before={{
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "lg",
                        padding: "1px",
                        background: theme.gradients.purpleToRed,
                        opacity: 0.5,
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                    }}
                    animation={`${fadeIn} 0.3s ease-out`}
                >
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        h="4px"
                        bgGradient={theme.gradients.purpleToRed}
                        borderTopRadius="lg"
                    />
                    {onClose && (
                        <IconButton
                            icon={<FiX />}
                            position="absolute"
                            top={3}
                            right={3}
                            size="sm"
                            variant="ghost"
                            color="gray.400"
                            _hover={{ color: "gray.600" }}
                            onClick={onClose}
                            aria-label="Close"
                        />
                    )}
                    <Flex alignItems="center" mb={3}>
                        <Text 
                            bgGradient={theme.gradients.purpleToRed}
                            bgClip="text"
                            fontWeight="semibold"
                            fontSize="sm"
                            letterSpacing="wide"
                        >
                            {title}
                        </Text>
                    </Flex>
                    <Text 
                        color="gray.700"
                        fontSize="sm"
                        lineHeight="tall"
                    >
                        {content}
                    </Text>
                </Box>
            </Flex>
        </Container>
    );
}; 