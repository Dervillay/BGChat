import React, { useState } from 'react';
import { Box, Button, Input, VStack, Text, useToast } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext.tsx';

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(username, password);
        } catch (error) {
            toast({
                title: 'Login failed',
                description: 'Invalid username or password',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box maxW="md" mx="auto" mt={8}>
            <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                    <Text fontSize="2xl" fontWeight="bold">Login to BGChat</Text>
                    <Input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit" colorScheme="blue" width="full">
                        Login
                    </Button>
                </VStack>
            </form>
        </Box>
    );
}; 