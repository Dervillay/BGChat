import React, { useState } from "react";
import { Link, Text, Flex, Icon } from "@chakra-ui/react";
import { FiGithub } from 'react-icons/fi';

const GitHubLink: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const iconColor = isHovered ? "gray.500" : "gray.400";

  return (
    <Link 
      href="https://github.com/Dervillay/BGChat" 
      isExternal 
      _hover={{ textDecoration: "none" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Flex align="center" gap={1}>
        <Icon as={FiGithub} boxSize={3} color={iconColor} />
        <Text fontSize="sm" color={iconColor} fontWeight="thin">
          GitHub
        </Text>
      </Flex>
    </Link>
  );
};

export default GitHubLink; 