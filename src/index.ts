//? CONFIG
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv";
import { addReport, changeReportStatus, deleteReport, getPICData, getReport, prisma, setupSignup, updateReport, userLogin, userSignup, verifySignup } from "./database";
import fastifyCookie from "@fastify/cookie";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCors from "@fastify/cors";
import { APIErrorType, generate_user_token, verify_teacher, verify_user_token } from "./utilities";
import { AccountType, Report, ReportStatus, ReportType } from "./generated/prisma";

dotenv.config();
const fastify = Fastify();



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
        res.setCookie("user_token", generate_user_token(result.email), {
            path: "/",
            expires: (new Date(Date.now() + 1000 * 60 * 60 * 24))
        });
        return res.code(200).send();
    }

    // If not, sends 401 Unauthorized status
    return res.code(401).send();
});

fastify.post('/api/user/signup', async (req: FastifyRequest<{ Body: { email: string } }>, res: FastifyReply) => {
    // Get email
    const { email } = req.body;

    // Register email and sends email
    const result = await userSignup(email);
    
    if(result) {
        return res.code(200).send();
    }
    
    return res.code(500).send();
});

fastify.post('/api/user/verify_signup', async (req: FastifyRequest<{ Body: { token: string } }>, res: FastifyReply) => {
    // Get the token
    const { token } = req.body;

    // Verify token
    const result = await verifySignup(token);

    // Check and match the result
    switch(result) {
        case APIErrorType.no_error: return res.code(200).send();
        case APIErrorType.internal_server_error: return res.code(500).send();
        case APIErrorType.unauthorized_error: return res.code(401).send();
    };
});

fastify.post('/api/user/setup_signup', async (req: FastifyRequest<{ Body: { username: string, password: string, token: string } }>, res: FastifyReply) => {
    // Get the username, password and token
    const { password, username, token } = req.body;

    // Setup Account
    const result = await setupSignup(username, password, token);

    // Check and match the result
    switch(result) {
        case APIErrorType.no_error: return res.code(200).send();
        case APIErrorType.internal_server_error: return res.code(500).send();
        case APIErrorType.unauthorized_error: return res.code(401).send();
    };
});

fastify.post('/api/report/add', async (req: FastifyRequest<{ Body: { message: string, pic_name: string, report_type: ReportType, follow_up: AccountType } }>, res: FastifyReply) => {
    // Get the data
    const { message, pic_name, report_type, follow_up } = req.body;

    // Verify the user token
    if(!req.cookies.user_token || !verify_user_token(req.cookies.user_token)) {
        return res.code(401).send();
    }

    // Add the report
    const result = await addReport(message, pic_name, report_type, follow_up);

    if(result) {
        return res.code(200).send();
    }
    
    return res.code(500).send();
});

fastify.get('/api/report/get', async (req: FastifyRequest, res: FastifyReply) => {
    // Verify the user token
    if(!req.cookies.user_token || !(await verify_teacher(req.cookies.user_token))) {
        return res.code(401).send();
    }

    // Get the report data
    const result = await getReport();

    if(result) {
        return res.code(200).send(result);
    }

    return res.code(500).send();
});

fastify.put('/api/report/change_status', async (req: FastifyRequest<{ Body: { report_id: string, report_status: ReportStatus } }>, res: FastifyReply) => {
    // Get the data
    const { report_id, report_status } = req.body;
    
    // Verify the user token
    if(!req.cookies.user_token || !(await verify_teacher(req.cookies.user_token))) {
        return res.code(401).send();
    }

    // Change the status
    const result = await changeReportStatus(report_id, report_status);

    // Check if there's error
    if(result) {
        return res.code(200).send();
    }

    return res.code(500).send();
});

fastify.delete('/api/report/delete', async (req: FastifyRequest<{ Body: { report_id: string } }>, res: FastifyReply) => {
    // Get the data
    const { report_id } = req.body;

    // Verify the user token
    if(!req.cookies.user_token || !(await verify_teacher(req.cookies.user_token))) {
        return res.code(401).send();
    }

    // Delete the report
    const result = await deleteReport(report_id);

    if(result) {
        return res.code(200).send();
    }

    return res.code(500).send();
});

fastify.put('/api/report/update', async (req: FastifyRequest<{ Body: { report_id: string, new_report_data: Report } }>, res: FastifyReply) => {
    // Get the data
    const { report_id, new_report_data } = req.body;

    // Verify the admin token
    if(!req.cookies.admin_token || req.cookies.admin_token != process.env.ADMIN_TOKEN!) {
        return res.code(401).send();
    }

    // Chang the report data
    const result = await updateReport(report_id, new_report_data);

    if(result) {
        return res.code(200).send();
    }

    return res.code(500).send()
});

fastify.post('/api/user/logout', async (req: FastifyRequest, res: FastifyReply) => {
    try {
        res.clearCookie("user_token");
    }
    catch(err) {
        console.error(`There's an error when trying to logout. Error: ${err}`);
        return res.code(500).send();
    }

    return res.code(200).send();
});

fastify.get('/api/pic/get', async (req: FastifyRequest, res: FastifyReply) => {
    // Verify the user token
    if(!req.cookies.user_token || !verify_user_token(req.cookies.user_token)) {
        return res.code(401).send();
    }

    // Chang the report data
    const result = await getPICData();

    if(result) {
        return res.code(200).send(result);
    }

    return res.code(500).send()
});


//? RUNNER
const start = async () => {
    await prisma.$connect();
    
    const port: string = process.env.API_PORT!;
    const host: string = process.env.API_HOST!;

    //? PLUGIN
    await fastify.register(fastifyCookie);
    await fastify.register(fastifyRateLimit, {
        max: 50,
        timeWindow: "1 minute",
        allowList: ["127.0.0.1"]
    });
    await fastify.register(fastifyCors, {
        origin: 'http://localhost:4321',
        credentials: true
    });

    try {
        await fastify.listen({ port: Number.parseInt(port), host: host });
        console.info(`Server listening at ${host}:${[port]}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();

export default fastify;