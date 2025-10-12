import React, { useState, ChangeEvent } from "react";
import { Box, Text, IconButton, Input, Flex } from "@chakra-ui/react";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { theme } from "../theme/index.ts";


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
            <Box {...theme.components.UserMessage.container}>
                <Input
                    value={editedContent}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    {...theme.components.UserMessage.editInput}
                />
                <Flex {...theme.components.UserMessage.buttonContainer}>
                    <IconButton
                        aria-label="Save edit"
                        icon={<FiCheck />}
                        onClick={handleSave}
                        {...theme.components.UserMessage.button}
                    />
                    <IconButton
                        aria-label="Cancel edit"
                        icon={<FiX />}
                        onClick={handleCancel}
                        {...theme.components.UserMessage.button}
                    />
                </Flex>
            </Box>
        );
    }

    return (
        <Box {...theme.components.UserMessage.container}>
            <Box {...theme.components.UserMessage.messageBox}>
                <Text {...theme.components.UserMessage.messageText}>{content}</Text>
            </Box>
            <Flex {...theme.components.UserMessage.buttonContainer}>
                <IconButton
                    aria-label="Edit message"
                    icon={<FiEdit2 />}
                    onClick={handleEdit}
                    {...theme.components.UserMessage.button}
                    {...theme.components.UserMessage.requireHoverOnDesktop}
                />
            </Flex>
        </Box>
    );
}; 