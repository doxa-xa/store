//module requirements 
const express = require('express')
const hbs = require('hbs')
const mongoose = require('mongoose')
const Item = require('./utils/item')
const path = require('path')
const formidable = require('formidable')
const fs = require('fs')
const bodyParser = require('body-parser')

//paths
const publicDirectoryPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname,'./templates/views')
const partialsPath = path.join(__dirname,'./templates/views/partials')

//express & middleware setup
const app = express()
const form = formidable({multiples:true})
app.use(bodyParser.urlencoded({extended:true}))
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
app.get('/',(req,res)=>{
    res.render('controls',{
        title:'Controls',
        date: new Date().getFullYear()
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

