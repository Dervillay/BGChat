import React from "react";
import { Container, Flex, Text } from "@chakra-ui/react";
import { shimmer } from "../theme/animations.ts";

export const ThinkingPlaceholder = () => {
    return (
        <Container maxW="48rem">
            <Flex justifyContent="flex-start">
                <Text
                    color="gray.400"
                    position="relative"
                    overflow="hidden"
                    _before={{
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                        backgroundSize: "200% 100%",
                        animation: `${shimmer} 2s infinite linear`,
                    }}
                >
                    Thinking...
                </Text>
            </Flex>
        </Container>
    );
};