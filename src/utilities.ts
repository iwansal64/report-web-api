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