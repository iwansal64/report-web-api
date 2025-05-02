import jwt from "jsonwebtoken";

function get_random_string_array(arr: (string|string[])): string {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function generate_user_token(email: string): string {
    return jwt.sign({ email }, process.env.JWT_SECRET!)
}