import { useTheme } from "../contexts/ThemeContext";
import { gradients } from "../theme/gradients";

export const useCurrentGradient = () => {
    const { themeId } = useTheme();
    return gradients[themeId];
};

