const { urlencoded, json, static } = require('express');
const express = require('express');
const path = require('path');

const app = express();

app.use(urlencoded({extended: false}));
app.use(json());
app.use(require('./routes/routes'));
app.use(static(path.join(__dirname, 'public')));

app.listen( 3000, () =>{
     console.log("server running");
})