//module requirements 
const express = require('express')
const sessions = require('express-session')
const hbs = require('hbs')
const mongoose = require('mongoose')
const Item = require('./utils/item')
const {errorHandler} = require('./utils/item')
const MongoStore = require('connect-mongo')(sessions)
const path = require('path')
const formidable = require('formidable')
const fs = require('fs')
const bodyParser = require('body-parser')
const passport = require('passport')
const crypto = require('crypto')
const {genPassword} = require('./utils/passwordUtils')
const connection = require('./utils/database')
const User = connection
//require('dotenv').config()

//paths
const publicDirectoryPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname,'./templates/views')
const partialsPath = path.join(__dirname,'./templates/views/partials')
const mongoUrl = 'mongodb://127.0.0.1:27017/local'
const mongoSetup = {useNewUrlParser:true, useUnifiedTopology:true}
//express & middleware setup
const app = express()
const form = formidable({multiples:true})
const sessionStore = new MongoStore({
    mongooseConnection:mongoose.createConnection(mongoUrl,mongoSetup),
    collection:'sessions'
})
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(sessions({
    secret:'flj543lj543l4kh353',
    resave:false,
    saveUninitialized:true,
    store: sessionStore,
    cookie:{
        maxAge: 1000*60*60*24 // Active for a day
    }
}))
require('./utils/passport')
app.use(passport.initialize())
app.use(passport.session())

app.use('/public',express.static(publicDirectoryPath))
app.set('views',viewsPath)
app.set('view engine','hbs')

//handlebars setup
hbs.registerPartials(partialsPath)
hbs.registerHelper('JSONStringify',(object)=>{
    return JSON.stringify(object)
})

//database connection
mongoose.connect('mongodb://127.0.0.1/27017',mongoSetup)
.then((result)=>{app.listen(3000)}).catch((err)=>{console.log(err)})

//routing
app.get('/',(req,res,next)=>{
    res.redirect('/login')
})
app.post('/login',passport.authenticate('local',{
    failureRedirect:'/unauthorised',
    successRedirect:'/controls'
}))
app.get('/unauthorised',(req,res,next)=>{
    res.send('<h1>Username or password is invalid. You can try again <a href="/login">here</a></h1>')
})
app.post('/register',(req,res,next)=>{
    const saltHash = genPassword(req.body.pass)

    const salt = saltHash.salt
    const hash = saltHash.hash

    const newUser = new User({
        username:req.body.user,
        hash:hash,
        salt:salt,
    })

    newUser.save()
    .then((user)=>{
        console.log(user)
    })
    res.redirect('/login')
})
app.get('/login',(req,res,next)=>{
    res.render('welcome')
})
app.get('/register',(req,res,next)=>{
    res.render('register')
})

app.get('/controls',(req,res)=>{
    //console.log(req.session)
    User.findById({_id:req.session.passport.user}).then((user)=>{
        res.render('controls',{
            title:'Controls',
            user:user.username,
            date: new Date().getFullYear()
        })
    })
    
})
app.get('/create',(req,res)=>{ 
    res.render('create',{
        title:'Create an Item'
    })
})

//controls & routing utils (NEEDS TO BE LESS VERBOSE! UPDATE IN THE NEXT COMMIT)
app.get('/update',(req,res)=>{ //<- sends the Item for update
    Item.findById({_id:req.query.id}).then((result)=>{
        res.render('edit',{
            title:result._id,    
            name:result.name,
            price:result.price,
            qty:result.qty,
            description:result.description
        })
    })     
})
app.get('/updated',(req,res)=>{ // <- updates the selected item in the collection
    Item.updateOne({_id:req.query.id},{
        name:req.query.name,
        price:req.query.price,
        qty:req.query.qty,
        description:req.query.description
    }).then((result)=>{
        res.redirect('/all')
    })
})
app.get('/delete',(req,res)=>{ // <- deletes an item from store collection
    Item.deleteOne({_id:req.query.id}).then((result)=>{
        res.redirect('/all')
    })
    
})

app.post('/submit',(req,res)=>{ // <- creates a new Item in Store collection
    const imgUrlPrePath = './public/'
    if((req.url==='/submit')&&(req.method.toLowerCase()==='post')){
        //parsing file upload
        form.parse(req,(err,fields,files)=>{
            if(err){
                res.send('Something went wrong :( ')
            }
            var tempFilePath = files.imgUrl.filepath
            var projectFilePath = path.join(__dirname ,'./public' ,files.imgUrl.originalFilename)
            fs.rename(tempFilePath,projectFilePath,(err)=>{
                if(err)console.log(err)
                console.log(`File ${files.imgUrl.originalFilename} has been uploaded @ ${projectFilePath}`)
            })
        //adding new item to Store collection
            const item = new Item({
                name:fields.name,
                price:fields.price,
                imgUrl:imgUrlPrePath+files.imgUrl.originalFilename,
                qty:fields.qty,
                description:fields.description
            })
            item.save()
            .then((result)=>{
                res.status(200)
                res.redirect('/all')
            })
            .catch((err)=>{
                console.log(err)
            })
            
        })
    }
})
app.get('/all',(req,res)=>{ // <- list all Items currently in Store collection
    Item.find()
    .then((result)=>{
        res.render('index',{
            title:'Items',
            data:result
        })
    }).catch((err)=>{console.log(err)})
})
app.get('/logout',(req,res)=>{
    req.logOut((err)=>{
        if(err)console.log(err)
        res.redirect('/login')
    })
    
})
//error handling
