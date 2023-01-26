const express = require('express')
const hbs = require('hbs')
const mongoose = require('mongoose')
const Item = require('./utils/item')
const path = require('path')

const publicDirectoryPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname,'./templates/views')
const partialsPath = path.join(__dirname,'./templates/views/partials')

const app = express()
app.use('/public',express.static(publicDirectoryPath))
app.set('views',viewsPath)
app.set('view engine','hbs')
hbs.registerPartials(partialsPath)

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
    res.render('controls',{
        title:'Controls - Update'
    })
})
app.get('/delete',(req,res)=>{
    res.render('controls',{
        title:'Controls - Delete'
    })
})
app.get('/submit',(req,res)=>{
    console.log(req)
    res.send('Item Submitted')
})

// app.get('/',(req,res)=>{
//     const item = new Item({
//         name:'Bit Tropic Mix',
//         price:12.50,
//         imgUrl:'./public/tropic-mix.jpg',
//         qty:0,
//         description:'15mg/g'
//     })
//     item.save()
//     .then((result)=>{
//         res.send(result)
//     })
//     .catch((err)=>{
//         console.log(err)
//     })
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