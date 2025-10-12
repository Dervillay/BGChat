import { IconButton, useColorMode } from "@chakra-ui/react";
import { FiSun, FiMoon } from "react-icons/fi";

export const DarkModeToggle = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const isDark = colorMode === "dark";

    return (
        <IconButton
            aria-label="Toggle color mode"
            icon={isDark ? <FiSun /> : <FiMoon />}
            onClick={toggleColorMode}
            size="sm"
            variant="ghost"
            color="gray.500"
            _hover={{ color: "gray.700" }}
            _dark={{
                color: "#a0a0a0",
                _hover: { 
                    color: "#e0e0e0",
                    filter: "brightness(1.3)"
                }
            }}
        />
    );
}; 