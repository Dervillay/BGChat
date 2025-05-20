import React, { useState } from "react";
import { Box, Text, IconButton, Input, Flex } from "@chakra-ui/react";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";

interface UserMessageProps {
    content: string;
    onEdit: (newContent: string) => void;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        onEdit(editedContent);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedContent(content);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <Box maxW="70%" bg="gray.800" color="white" px={5} py={2.5} borderRadius="1.5rem">
                <Flex direction="column" gap={2}>
                    <Input
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        color="black"
                        bg="white"
                        _focus={{ borderColor: "purple.500" }}
                    />
                    <Flex gap={2} justify="flex-end">
                        <IconButton
                            aria-label="Save edit"
                            icon={<FiCheck />}
                            size="sm"
                            colorScheme="green"
                            onClick={handleSave}
                        />
                        <IconButton
                            aria-label="Cancel edit"
                            icon={<FiX />}
                            size="sm"
                            colorScheme="red"
                            onClick={handleCancel}
                        />
                    </Flex>
                </Flex>
            </Box>
        );
    }

    return (
        <Box position="relative" display="flex" flexDirection="column" alignItems="flex-end">
            <Box maxW="70%" bg="gray.800" color="white" px={5} py={2.5} borderRadius="1.5rem">
                <Text>{content}</Text>
            </Box>
            <Flex justify="flex-end" mt={1}>
                <IconButton
                    aria-label="Edit message"
                    icon={<FiEdit2 />}
                    size="sm"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    onClick={handleEdit}
                    variant="ghost"
                    color="gray.500"
                    _hover={{ color: "gray.700" }}
                />
            </Flex>
        </Box>
    );
}; 