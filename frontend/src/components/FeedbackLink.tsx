import React from "react";
import { Text, Link } from "@chakra-ui/react";

interface FeedbackLinkProps {
  onClick: () => void;
}

export const FeedbackLink: React.FC<FeedbackLinkProps> = ({ onClick }) => {
  return (
    <Text
        textAlign="center"
        fontSize="sm"
        color="chakra-body-text"
        position="fixed"
        bottom="0rem"
        py="0.5rem"
        transform="translateX(-50%)"
        left="50%"
    >
        Have feedback or want to add a new board game?{" "}
        <Link
            onClick={onClick}
            textDecoration="underline"
        >
            Let us know
        </Link>
    </Text>
  );
};
