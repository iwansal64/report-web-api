//? CONFIG
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv";
import { prisma, userLogin } from "./database";
import fastifyCookie from "@fastify/cookie";
import { generate_user_token } from "./utilities";

dotenv.configDotenv();
const fastify = Fastify();



//? PLUGIN
fastify.register(fastifyCookie);



//? MIDDLEWARE
fastify.addHook("onRequest", async (req, res) => {
    console.log(`Incoming IP : ${req.ip}`);
    console.log(`Request URL : ${req.url}`);
    console.log();
    
    return;
});



//? ROUTE
fastify.get('/', async (request, reply) => {
    return { message: 'Hello, Fastify!' };
});

fastify.post('/api/user/login', async (req: FastifyRequest<{ Body: { username: string, password: string } }>, res: FastifyReply) => {
    // Get username and password
    const { username, password } = req.body;
    
    // Verify username and password
    const result = await userLogin(username, password);    

    // If it's verified,
    if(result) {
        // Set cookie for user token and send 200 OK status
        res.setCookie("user_token", generate_user_token(result.email), )
        return res.code(200).send();
    }

    // If not, sends 401 Unauthorized status
    return res.code(401).send();
})




//? RUNNER
const start = async () => {
    await prisma.$connect();
    
    const port: string = process.env.API_PORT!;
    const host: string = process.env.API_HOST!;

    try {
        await fastify.listen({ port: Number.parseInt(port), host: host });
        console.info(`Server listening at ${host}:${[port]}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
