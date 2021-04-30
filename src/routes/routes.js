const { Router } = require('express');
const router = Router();
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

//multer function for storage in disk
const Storage = multer.diskStorage({
    destination:(request, file, callback)=>{
        callback(null, './src/temp')
    },
    filename:(request, file, callback)=>{
        callback(null, file.fieldname + '_' + Date.now() + '_' + file.originalname.replace(' ', '_'))
    }
});

//middleware
const Upload = multer({
    storage: Storage
}).any('adjunto');

router.post('/send-email', (request, response)=>{
    
    Upload(request, response, (err) => {
        if(err){
            console.error(err);
            return response.end('Ocurrió un error inesperado');
        }else{
            let emailPara;
            let asunto;
            let emailDe;
            let adjunto;
            let mensaje;
            emailPara = request.body.emailPara;
            asunto = request.body.asunto;
            emailDe = request.body.emailDe;
            adjunto = request.files;
            mensaje = request.body.mensaje;

            const attachments = adjunto.map((file)=>{
                return { path: file.path };
            });

            contentHTML = `
                <p>${mensaje}</p>`;

            const trasnporter = nodemailer.createTransport({
                //or host
                service: 'gmail',
                //port: 26,
                //secure: true,
                auth: {
                    user: process.env.MAIL,
                    pass: process.env.PASS_MAL
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailOptions = {
                from: "'Yeltsin López' <"+emailDe+">",
                to: emailPara,
                subject: asunto,
                html: contentHTML,
                attachments: attachments
            }

            trasnporter.sendMail(mailOptions, (err, info)=>{
                if(err){
                    console.error(err);
                }else{
                    console.log("enviado: ", info);
                    const directory = 'src/temp';
                    fs.readdir(directory, (err, files) => {
                        if (err) throw err;
                        for (const file of files) {
                            fs.unlink(path.join(directory, file), err => {
                                if (err) {
                                    throw err;
                                }else{
                                    return response.redirect('/success.html');
                                }
                            });
                        }
                    });
                }
            });
        }
    })
})

module.exports = router;