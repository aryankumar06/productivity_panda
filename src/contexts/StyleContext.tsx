import { createContext, useContext, useEffect, useState } from "react";

type ProductivityStyle = "professional" | "student" | "creator";

interface StyleContextType {
    style: ProductivityStyle;
    setStyle: (style: ProductivityStyle) => void;
    getDensityClass: () => string;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export function StyleProvider({ children }: { children: React.ReactNode }) {
    const [style, setStyle] = useState<ProductivityStyle>(() => {
        // Load from local storage or default to professional
        const saved = localStorage.getItem("productivity-hub-style");
        return (saved as ProductivityStyle) || "professional";
    });

    useEffect(() => {
        localStorage.setItem("productivity-hub-style", style);
        
        // Apply global style class to body for broad CSS targeting if needed
        document.body.setAttribute('data-style', style);
    }, [style]);

    const getDensityClass = () => {
        switch (style) {
            case "student":
                return "density-compact"; // Tighter spacing for lists
            case "creator":
                return "density-comfortable"; // More breathing room
            case "professional":
            default:
                return "density-standard";
        }
    };

    const value = {
        style,
        setStyle,
        getDensityClass
    };

    return (
        <StyleContext.Provider value={value}>
            {children}
        </StyleContext.Provider>
    );
}

export const useStyle = () => {
    const context = useContext(StyleContext);
    if (context === undefined)
        throw new Error("useStyle must be used within a StyleProvider");
    return context;
};
