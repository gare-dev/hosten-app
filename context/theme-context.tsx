// ─────────────────────────────────────────────────────────────────────────────
// Theme Context
// ─────────────────────────────────────────────────────────────────────────────
// Provides theme management with system preference detection and user override.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
    /** Current theme setting (light, dark, or system) */
    theme: ThemeMode;
    /** Resolved theme after system preference is applied */
    resolvedTheme: ResolvedTheme;
    /** Set theme mode */
    setTheme: (theme: ThemeMode) => void;
    /** Toggle between light and dark (ignores system) */
    toggleTheme: () => void;
    /** Whether the component has mounted (for SSR) */
    mounted: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "hosten-theme";

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
    children: React.ReactNode;
    /** Default theme mode */
    defaultTheme?: ThemeMode;
    /** Storage key for persisting theme */
    storageKey?: string;
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
    const [mounted, setMounted] = useState(false);
    const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
    const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("dark");

    // Get resolved theme based on current setting
    const resolvedTheme = useMemo<ResolvedTheme>(() => {
        if (theme === "system") {
            return systemTheme;
        }
        return theme;
    }, [theme, systemTheme]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setSystemTheme(e.matches ? "dark" : "light");
        };

        // Set initial value
        handleChange(mediaQuery);

        // Listen for changes
        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    // Load saved theme from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey) as ThemeMode | null;
            if (saved && ["light", "dark", "system"].includes(saved)) {
                setThemeState(saved);
            }
        } catch {
            // localStorage not available
        }
        setMounted(true);
    }, [storageKey]);

    // Apply theme to document
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        // Remove old theme
        root.removeAttribute("data-theme");

        // Apply new theme
        if (theme === "system") {
            // Let CSS media queries handle it
            root.removeAttribute("data-theme");
        } else {
            root.setAttribute("data-theme", theme);
        }

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                "content",
                resolvedTheme === "dark" ? "#0a0f1a" : "#f1f5f9"
            );
        }
    }, [theme, resolvedTheme, mounted]);

    // Set theme and persist
    const setTheme = useCallback(
        (newTheme: ThemeMode) => {
            setThemeState(newTheme);
            try {
                localStorage.setItem(storageKey, newTheme);
            } catch {
                // localStorage not available
            }
        },
        [storageKey]
    );

    // Toggle between light and dark
    const toggleTheme = useCallback(() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }, [resolvedTheme, setTheme]);

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            resolvedTheme,
            setTheme,
            toggleTheme,
            mounted,
        }),
        [theme, resolvedTheme, setTheme, toggleTheme, mounted]
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Toggle Component
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const { resolvedTheme, toggleTheme, mounted } = useTheme();

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <button
                className={className}
                aria-label="Toggle theme"
                style={{ opacity: 0, pointerEvents: "none" }}
            >
                <span style={{ width: 20, height: 20 }} />
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={className}
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        >
            {resolvedTheme === "dark" ? (
                // Sun icon for dark mode (click to switch to light)
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                </svg>
            ) : (
                // Moon icon for light mode (click to switch to dark)
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
            )}
        </button>
    );
}
