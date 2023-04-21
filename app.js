require('dotenv').config();
const express = require('express')
const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
const app = express()
var request = require('request');
const session = require('express-session');
const flash = require('express-flash');
var fs = require('fs');
var morgan = require('morgan')
var expressLayouts = require('express-ejs-layouts');

app.use(morgan('dev'));

app.use(express.static(__dirname+'/public'));
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use(flash());
app.use(session({
    cookie: { maxAge: 60000 },
    // store: sessionStore,
    saveUninitialized: true,
    resave: 'true',
    secret: "secret"
}));

app.use(expressLayouts);
app.set('view engine','ejs');

const storage = multer.diskStorage({
    destination: function(req,file,cd){
        cd(null,'uploads/');
    },
    filename: function(req,file,cd){
        var ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
        cd(null, file.fieldname + '_' + Date.now() + ext);
    }
})
const upload = multer({ storage: storage })

app.get('/',(req,res) => {
    const message = req.flash("message");
    res.render('layout',{
        message
    })
})


app.post('/upload', upload.single('image') ,(req,res) => {
    // console.log(req.file);
    //enter your access token
    var access_token = process.env.DROPBOX_ACCESS_TOKEN;
    //Name of the file to be uploaded
    var filename = `uploads/${req.file.filename}`;
    //reading the contents 
    var content = fs.readFileSync(filename);

    options = {
        method: "POST",
        url: 'https://content.dropboxapi.com/2/files/upload',
        headers: {
        "Content-Type": "application/octet-stream",
        "Authorization": "Bearer " + access_token,
        "Dropbox-API-Arg": JSON.stringify({"path": "/Node/"+filename,"mode":"overwrite","autorename":true,"mute":false})
        },
        body:content
    };

    request(options,function(err,res,body){
        // console.log("Err : " + err);
        // console.log("res : " + res);
        // console.log("body : " + body);    
    })

    req.flash("message","File uploaded to Dropbox Successfully");
    // return res.redirect('back')
    return res.json({
        "success":"success"
    })

})


app.listen(process.env.PORT,process.env.HOST,() => {
    console.log(`Server Started http://${process.env.HOST}:${process.env.PORT}`);
})
