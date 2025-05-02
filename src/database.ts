import { AccountType, PrismaClient, Registration, Report, ReportStatus, ReportType, User } from "./generated/prisma";
import { APIErrorType, generate_signup_token } from "./utilities";
import nodemailer from "nodemailer";

export const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
    service: 'gmail', // or use 'smtp' with custom host and port for other services
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
  


export async function userLogin(username: string, password: string): Promise<User|null> {    
    // Find the user by username that user gives
    const result = await prisma.user.findUnique({
        where: {
            username: username
        }
    });

    // Match the password
    if(result && result.password == password) {
        return result;
    }

    return null;
}

export async function userSignup(email: string): Promise<boolean> {
    // Create registration token
    let result: Registration|null;
    try {
        result = await prisma.registration.create({
            data: {
                email: email,
                token: generate_signup_token()
            }
        });
    }
    catch(err) {
        console.error(`There's an error when trying to create registration. Error: ${err}`);
        return false;
    }

    
    // Send email confirmation to targetted email user
    transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Confirm Account Registration",
        html: `<p style="letter-spacing: 2px; font-size: 26px">Hello! This is your token for registration: <code style="letter-spacing: 1px; font-weight: bold; font-style: italic;">[${result.token}]</code> . If you found this email mistaken, we're sorry but you can ignore this.</p>`,
    }, (error) => {
        if(error) {
            console.error(`There's an error when trying to send email. Error: ${error}`);
        }
    });

    return true;
}

export async function verifySignup(token: string): Promise<APIErrorType> {
    try {
        // Get the registration data
        const registration_data = await prisma.registration.findUnique({
            where: {
                token: token
            }
        });
    
        // If the registration data found!
        if(registration_data) {
            return APIErrorType.no_error;
        }
        // If the registration data not found :(
        else {
            return APIErrorType.unauthorized_error;
        }
    }
    catch(err) {
        // If there's an error.
        return APIErrorType.internal_server_error;
    }
}

export async function setupSignup(username: string, password: string, token: string): Promise<APIErrorType> {
    let registration_data: Registration | null;
    try {
        // Get the registration data
        registration_data = await prisma.registration.findUnique({
            where: {
                token: token
            }
        });
    
        // If the registration data found!
        if(!registration_data) {
            return APIErrorType.unauthorized_error;
        }
    }
    catch(err) {
        // If there's an error.
        return APIErrorType.internal_server_error;
    }

    const result = await prisma.user.create({
        data: {
            email: registration_data.email,
            username: username,
            password: password,
            role: "Siswa"
        }
    });
    
    // If its all safe, return no error
    return APIErrorType.no_error;
}

export async function addReport(message: string, pic_name: string, report_type: ReportType,  follow_up: AccountType): Promise<boolean> {
    // Create report data
    try {
        await prisma.report.create({
            data: {
                message: message,
                follow_up: follow_up,
                type: report_type,
                pic: {
                    connect: {
                        username: pic_name
                    }
                },
            }
        });
    }
    catch(err) {
        return false;
    }
    
    return true;
}

export async function getReport(): Promise<Report[] | null> {
    // Get the report data
    let report_data: Report[];
    try {
        report_data = await prisma.report.findMany();
    }
    catch(err) {
        console.error(`There's an error when trying to get report data. Error: ${err}`);
        return null;
    }

    return report_data;
}

export async function changeReportStatus(report_id: string, report_status: ReportStatus): Promise<boolean> {
    try {
        const result = await prisma.report.update({
            where: {
                id: report_id
            },
            data: {
                status: report_status
            }
        });
    }
    catch(err) {
        console.error(`There's an error when trying to change report status. Error: ${err}`);
        return false;
    }
    
    return true;
}

export async function deleteReport(report_id: string): Promise<boolean> {
    try {
        await prisma.report.delete({
            where: {
                id: report_id
            }
        });
    }
    catch(err) {
        console.error(`There's an error when trying to delete report data. Error: ${err}`);
        return false;
    }

    return true;
}

export async function updateReport(report_id: string, new_report_data: Report): Promise<boolean> {
    try {
        await prisma.report.update({
            where: {
                id: report_id
            },
            data: new_report_data
        });
    }
    catch(err) {
        console.error(`There's an error when trying to update report data. Error: ${err}`);
        return false;
    }

    return true;
}

export async function checkAccountType(user_email: string): Promise<AccountType|undefined> {
    // Get the user data
    const user_data = await prisma.user.findUnique({
        where: {
            email: user_email
        }
    });

    if(!user_data) {
        return undefined;
    }
    
    return user_data.role;
}