import { ServerContext } from "@/context/server-context"
import { useContext } from "react"

const useServer = () => {
    const context = useContext(ServerContext)
    if (!context) {
        throw new Error("useServer must be used within a ServerProvider")
    }
    return context
}

export default useServer    