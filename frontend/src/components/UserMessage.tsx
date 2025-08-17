import React, { useState, ChangeEvent } from "react";
import { Box, Text, IconButton, Input, Flex, InputGroup } from "@chakra-ui/react";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";

const commonButtonProps = {
    variant: "ghost",
    color: "gray.500",
    _hover: { color: "gray.700" },
    _dark: {
        color: "#a0a0a0",
        _hover: { 
            color: "#e0e0e0",
            filter: "brightness(1.3)"
        }
    }
};

const messageStyle = {
    maxW: { base: "85%", md: "70%" },
    bg: "gray.800",
    _dark: { bg: "#2a2a2a" },
    color: "white",
    px: { base: 3, md: 5 },
    py: { base: 2, md: 2.5 },
    borderRadius: "1.5rem"
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
            <Box position="relative" display="flex" flexDirection="column" alignItems="flex-end" w="100%" role="group">
                <Input
                    as="textarea"
                    value={editedContent}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    fontSize="md"
                    borderColor="transparent"
                    _focus={{
                        borderColor: "chakra-body-border-focus",
                        boxShadow: "none"
                    }}
                    {...messageStyle}
                />
                <Flex justify="flex-end" w="100%">
                    <IconButton
                        aria-label="Save edit"
                        icon={<FiCheck />}
                        onClick={handleSave}
                        size="sm"
                        {...commonButtonProps}
                    />
                    <IconButton
                        aria-label="Cancel edit"
                        icon={<FiX />}
                        onClick={handleCancel}
                        size="sm"
                        {...commonButtonProps}
                    />
                </Flex>
            </Box>
        );
    }

    return (
        <Box position="relative" display="flex" flexDirection="column" alignItems="flex-end" w="100%" role="group">
            <Box {...messageStyle}>
                <Text fontSize="md">{content}</Text>
            </Box>
            <Flex justify="flex-end" w="100%" h="1.5rem" mt={0}>
                <IconButton
                    aria-label="Edit message"
                    icon={<FiEdit2 />}
                    onClick={handleEdit}
                    opacity={{ base: 1, md: 0 }}
                    _groupHover={{ opacity: 1 }}
                    size="sm"
                    {...commonButtonProps}
                />
            </Flex>
        </Box>
    );
}; 