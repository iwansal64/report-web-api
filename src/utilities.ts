import jwt from "jsonwebtoken";
import { AccountType, User } from "./generated/prisma";
import { checkAccountType, getUser } from "./database";

const alphabets: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function get_random_string_array(arr: (string|string[])): string {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function generate_user_token(email: string): string {
    return jwt.sign({ email: email }, process.env.JWT_SECRET!)
}

export function generate_signup_token(): string {
    let return_value: string = "";

    for(let i = 0; i < 24; i++) {
        return_value += get_random_string_array(alphabets);
    }

    return return_value;
}

export async function verify_user(token: string): Promise<AccountType | undefined> {
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!);
        if(typeof payload == "string" || !payload.email) {
            return undefined;
        }
        
        const account_type = await checkAccountType(payload.email);
        
        return account_type;
    }
    catch(error) {
        return undefined;
    }
}

export async function verify_teacher(token: string): Promise<boolean> {
    return (await verify_user(token)) == AccountType.Guru;
}

export async function get_user_data_from_token(token: string): Promise<User|undefined> {
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!);
        if(typeof payload == "string" || !payload.email) {
            return undefined;
        }
        
        return (await getUser(payload.email));
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