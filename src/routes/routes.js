const { Router } = require('express');
const router = Router();
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Storage = multer.diskStorage({
    destination:(request, file, callback)=>{
        callback(null, './src/temp')
    },
    filename:(request, file, callback)=>{
        callback(null, file.fieldname + '_' + Date.now() + '_' + file.originalname.replace(' ', '_'))
    }
});

const Upload = multer({
    storage: Storage
}).any('adjunto');

router.post('/send-mail', (request, response)=>{
    
    Upload(request, response, (err) => {
        if(!err){

            let emailFor, subject, emailFrom, attachment, message;
            emailFor = request.body.emailFor;
            subject = request.body.subject;
            emailFrom = request.body.emailFrom;
            attachment = request.files;
            message = request.body.message;

            const attachments = attachment.map((file)=>{
                return { path: file.path };
            });

            contentHTML = `
                <div>${mensaje}</div>`;

            const trasnporter = nodemailer.createTransport({
                //read nodemailer documentation
                //or host
                service: 'gmail',
                //port: 26,
                //secure: true,
                auth: {              
                    //replace with your credentials          
                    user: process.env.MAIL,
                    pass: process.env.PASS_MAL
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailOptions = {
                from: "'MailerNode' <"+emailFrom+">",
                to: emailFor,
                subject: subject,
                html: contentHTML,
                attachments: attachments
            }

            trasnporter.sendMail(mailOptions, (err, info)=>{
                if(!err){
                    fs.readdir(directory, (err, files) => {
                        if(!err){
                            if (!files.length) {
                                return res.send({
                                    success_message: 'mail sent successfully without attachments',
                                    info: info,
                                    fail: false
                                });
                            }else{
                                for (const file of files) {
                                    fs.unlink(path.join(directory, file), err => {
                                        if (!err) {
                                            return res.send({
                                                success_message: 'mail sent successfully with attachments',
                                                info: info,
                                                fail: false
                                            });
                                        }else{
                                            return res.send({
                                                error_message: err,
                                                error_from: 'unlink function',
                                                fail: true
                                            });
                                        }
                                    });
                                }
                            }
                        }else{
                            return res.send({
                                error_message: err,
                                error_from: 'readdir function',
                                fail: true
                            });
                        }
                    });

                }else{
                    return res.send({
                        error_message: err,
                        error_from: 'transporter function',
                        fail: true
                    });
                }
            });

        }else{
            return res.send({
                error_message: err,
                error_from: 'upload function',
                fail: true
            });
        }
    })
})

module.exports = router;