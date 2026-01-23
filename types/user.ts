export interface User {
    id: string;
    email: string;
    username: string;
    roles: {
        id: string;
        name: string;
    }[]

}

