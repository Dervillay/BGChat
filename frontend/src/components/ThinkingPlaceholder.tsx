import React from "react";
import { Container, Flex, Text, useColorMode } from "@chakra-ui/react";
import { shimmer } from "../theme/animations.ts";
import { css } from "@emotion/react";

export const ThinkingPlaceholder = () => {
    const { colorMode } = useColorMode();
    const gradient = colorMode === "light"
        ? "linear-gradient(90deg, rgba(125,125,125,0.3), rgba(125,125,125,0.7), rgba(125,125,125,0.3))"
        : "linear-gradient(90deg, rgba(250,250,250,0.3), rgba(250,250,250,0.7), rgba(250,250,250,0.3))";
    return (
        <Container maxW="48rem" py={0}>
            <Flex justifyContent="flex-start">
                <Text
                    as="span"
                    css={css`
                        background-image: ${gradient};
                        background-size: 200% 100%;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: ${shimmer} 2s infinite linear;
                    `}
                >
                    Thinking...
                </Text>
            </Flex>
        </Container>
    );
};