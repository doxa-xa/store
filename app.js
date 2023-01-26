const express = require('express')
const hbs = require('hbs')
const mongoose = require('mongoose')
const Item = require('./utils/item')
const path = require('path')
const bodyParser = require('body-parser')

const publicDirectoryPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname,'./templates/views')
const partialsPath = path.join(__dirname,'./templates/views/partials')

const app = express()

app.use(bodyParser.urlencoded({extended:false}))
app.use('/public',express.static(publicDirectoryPath))
app.set('views',viewsPath)
app.set('view engine','hbs')

hbs.registerPartials(partialsPath)
hbs.registerHelper('JSONStringify',(object)=>{
    return JSON.stringify(object)
})

mongoose.connect('mongodb://127.0.0.1/27017',{useNewUrlParser:true},{useUnifiedTopology:true})
.then((result)=>{app.listen(3000)}).catch((err)=>{console.log(err)})

app.get('/controls',(req,res)=>{
    res.render('controls',{
        title:'Controls'
    })
})
app.get('/create',(req,res)=>{
    res.render('controls',{
        title:'Controls - Create'
    })
})
app.get('/update',(req,res)=>{
    console.log(req.query)
    res.redirect('/all')
})
app.get('/delete',(req,res)=>{
    console.log(req.query)
    res.redirect('/all')
})
// app.get('/submit',(req,res)=>{
//     console.log(req.query)
//     res.send('item added')
// })

app.get('/submit',(req,res)=>{
    const imgUrlPrePath = './public'
    const item = new Item({
        name:req.query.name,
        price:req.query.price,
        imgUrl:imgUrlPrePath+req.query.imgUrl,
        qty:req.query.qty,
        description:req.query.description
    })
    item.save()
    .then((result)=>{
        res.redirect('/controls')
    })
    .catch((err)=>{
        console.log(err)
    })
})
    app.get('/all',(req,res)=>{
        Item.find()
        .then((result)=>{
            res.render('index',{
                title:'Items',
                data:result
            })
            //console.log(result)
        }).catch((err)=>{console.log(err)})
    })

console.log(partialsPath)