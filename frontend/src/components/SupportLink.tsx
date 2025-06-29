import React from "react";
import { Button, Link, Text } from "@chakra-ui/react";
import { FiHeart } from 'react-icons/fi';

const SupportLink: React.FC = () => {
  return (
    <Link href="https://ko-fi.com/dervillay" isExternal _hover={{ textDecoration: "none" }}>
      <Button
        leftIcon={<FiHeart />}
        size="sm"
        variant="ghost"
        color="gray.400"
        _hover={{ color: "gray.500" }}
        _active={{ transform: "none" }}
        aria-label="Support the project"
      >
        <Text fontSize="xs" color="inherit" fontWeight="thin">Support the project</Text>
      </Button>
    </Link>
  );
};

export default SupportLink; 