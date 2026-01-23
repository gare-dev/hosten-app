export interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}

export default RegisterFormData;
