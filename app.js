//module requirements 
const express = require('express')
const hbs = require('hbs')
const mongoose = require('mongoose')
const Item = require('./utils/item')
const path = require('path')
const bodyParser = require('body-parser')

//paths
const publicDirectoryPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname,'./templates/views')
const partialsPath = path.join(__dirname,'./templates/views/partials')

//express & middleware setup
const app = express()
app.use(bodyParser.urlencoded({extended:false}))
app.use('/public',express.static(publicDirectoryPath))
app.set('views',viewsPath)
app.set('view engine','hbs')

//handlebars setup
hbs.registerPartials(partialsPath)
hbs.registerHelper('JSONStringify',(object)=>{
    return JSON.stringify(object)
})

//database connection
mongoose.connect('mongodb://127.0.0.1/27017',{useNewUrlParser:true},{useUnifiedTopology:true})
.then((result)=>{app.listen(3000)}).catch((err)=>{console.log(err)})

//routing
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

app.get('/submit',(req,res)=>{ // <- creates a new Item in Store collection
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
    app.get('/all',(req,res)=>{ // <- list all Items currently in Store collection
        Item.find()
        .then((result)=>{
            res.render('index',{
                title:'Items',
                data:result
            })
        }).catch((err)=>{console.log(err)})
    })

