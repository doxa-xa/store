const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./database')
const validatePassword = require('./passwordUtils').validаtePassword

//in order passport to recognize the field forms
// they must be listed as username/password in the post request obj
// we can give custom parameters to passport as such 
const customFields = {
    usernameField:'user',
    passwordField:'pass'
}


const verifyCB = (username,password,done)=>{
    User.findOne({username:username})
    .then((user)=>{
        if(!user){return done(null,false)}

        const isValid = validatePassword(password, user.hash, user.salt)

        if(isValid){
            return done(null,user)
        }else{
            return done(null,false)
        }
    })
    .catch((err)=>{
        done(err)
    })
}

const strategy = new LocalStrategy(customFields,verifyCB)

passport.use(strategy)

passport.serializeUser((user,done)=>{
    done(null,user.id)
})

passport.deserializeUser((userId,done)=>{
    User.findById(userId)
    .then((user)=>{
        done(null,user)
    })
    .catch((err)=>{done(err)})
})