import { createContext, useState } from "react";


type ServerContextType = {
    server: string;
    setServer: (server: string) => void;
};

type ServerProviderProps = {
    children: React.ReactNode;
};

export const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider = ({ children }: ServerProviderProps) => {
    const [server, setServer] = useState<string>("");

    return (
        <ServerContext.Provider value={{ server, setServer }}>
            {children}
        </ServerContext.Provider>
    );
}