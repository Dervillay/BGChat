import React from "react";
import { Button, Link, Text } from "@chakra-ui/react";
import { FiGithub } from 'react-icons/fi';

const GitHubLink: React.FC = () => {
  return (
    <Link href="https://github.com/Dervillay/BGChat" isExternal _hover={{ textDecoration: "none" }}>
      <Button
        leftIcon={<FiGithub />}
        size="sm"
        variant="ghost"
        color="gray.400"
        _hover={{ color: "gray.500" }}
        _active={{ transform: "none" }}
        aria-label="GitHub Repository"
      >
        <Text fontSize="xs" color="inherit" fontWeight="thin">GitHub</Text>
      </Button>
    </Link>
  );
};

export default GitHubLink; 