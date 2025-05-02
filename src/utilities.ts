import jwt from "jsonwebtoken";

const alphabets: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function get_random_string_array(arr: (string|string[])): string {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function generate_user_token(email: string): string {
    return jwt.sign({ email }, process.env.JWT_SECRET!)
}

export function generate_signup_token(): string {
    let return_value: string = "";

    for(let i = 0; i < 24; i++) {
        return_value += get_random_string_array(alphabets);
    }

    return return_value;
}

export function verify_user_token(token: string): jwt.JwtPayload | string | undefined {
    try {
        return jwt.verify(token, process.env.JWT_SECRET!);
    }
    catch(error) {
        return undefined;
    }
}

export enum APIErrorType {
    unauthorized_error,
    internal_server_error,
    no_error
};