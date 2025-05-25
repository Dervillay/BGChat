import React, { useState, ChangeEvent } from "react";
import { Box, Text, IconButton, Input, Flex, InputGroup } from "@chakra-ui/react";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";

const commonButtonProps = {
    size: "sm",
    variant: "ghost",
    color: "gray.500",
    _hover: { color: "gray.700" }
};

interface UserMessageProps {
    content: string;
    onEdit: (newContent: string) => void;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);

    const handleEdit = () => {
        setIsEditing(true);
        setTimeout(() => {
            const input = document.querySelector('textarea');
            if (input) {
                input.select();
            }
        }, 0);
    };

    const handleSave = () => {
        const trimmedEditedContent = editedContent.trim();
        if (trimmedEditedContent && trimmedEditedContent !== content) {
            onEdit(trimmedEditedContent);
        } else {
            setEditedContent(content);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedContent(content);
        setIsEditing(false);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
        setEditedContent(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <Box maxW="70%" display="flex" flexDirection="column" alignItems="flex-end" w="100%">
                <InputGroup>
                    <Input
                        as="textarea"
                        value={editedContent}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        variant="chat"
                        pt="1rem"
                        pl="1rem"
                        pr="1rem"
                        pb="1rem"
                    />
                </InputGroup>
                <Flex justify="flex-end" w="100%">
                    <IconButton
                        aria-label="Save edit"
                        icon={<FiCheck />}
                        onClick={handleSave}
                        {...commonButtonProps}
                    />
                    <IconButton
                        aria-label="Cancel edit"
                        icon={<FiX />}
                        onClick={handleCancel}
                        {...commonButtonProps}
                    />
                </Flex>
            </Box>
        );
    }

    return (
        <Box position="relative" display="flex" flexDirection="column" alignItems="flex-end" w="100%">
            <Box maxW="70%" bg="gray.800" color="white" px={5} py={2.5} borderRadius="1.5rem">
                <Text>{content}</Text>
            </Box>
            <Flex justify="flex-end" w="100%" h="1.5rem" mt={0}>
                <IconButton
                    aria-label="Edit message"
                    icon={<FiEdit2 />}
                    onClick={handleEdit}
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    {...commonButtonProps}
                />
            </Flex>
        </Box>
    );
}; 