import nodemailer from "nodemailer";

// Transportador de correo Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "conducelegal194@gmail.com", // ✅ tu correo
        pass: "furi wlxp vhmu ypzb",           // ⚠️ usa "contraseña de aplicación" si tienes 2FA
    },
});

export default transporter;
