import { PrismaClient, User } from "./generated/prisma";

export const prisma = new PrismaClient();

export async function userLogin(username: string, password: string): Promise<User|null> {    
    const result = await prisma.user.findUnique({
        where: {
            username: username
        }
    });

    if(result && result.password == password) {
        return result;
    }

    return null;
}
