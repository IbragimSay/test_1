const {Router} = require('express')
const config = require('config-json')
config.load("./config.json")
const SecretKey = config.get('SecretKey')
const {Users} = require('../bd')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const router = Router()

const getToken =(id, role)=>{
    return jwt.sign({
        id, 
        role
    }, SecretKey, {
        expiresIn: "24h"
    })
}

// http://localhost:3500/api/auth/registor
// body:
// mail
// password
// name
// tag
// role
router.post('/registor', async (req, res)=>{
    try{
        const {mail, password, name, tag} = req.body
        
        const  userMail = await Users.findOne({
            where: {
                mail: mail
            }
        })
        if(userMail){
            return res.json({
                user: "пользователь с таким mail уже существует"
            })
        }
        const  userTag = await Users.findOne({
            where: {
                tag: tag
            }
        })
        if(userTag){
            return res.json({
                mes: "пользователь с таким tag уже существует"
            })
        }
        const hashPassword = bcrypt.hashSync(password, 5)
        await Users.create({
            mail, 
            password: hashPassword, 
            name, 
            tag, 
            role: "user"
        })
        res.json({
            mes: "пользователь создан"
        })
    }catch(e){
        res.json({
            mes: "Error" 
        })
    }
})

// http://localhost:3500/api/auth/login
// body:
// mail
// password
router.post('/login', async (req, res)=>{
    const {mail, password} = req.body
    const user = await Users.findOne({
        where: {
            mail
        }
    })
    if(!user){
        return res.json({
            mes: 'password или mail неверный'
        })
    }
    const comparePassword = await bcrypt.compare(password, user.dataValues.password)
    if(!comparePassword){
        return res.json({
            mes: 'password или mail неверный'
        })
    }
    const token = getToken(user.dataValues.id, user.dataValues.role)
    return res.json({
        token: token
    })
})

// http://localhost:3500/api/auth/entrance
// headers:
// Authorization: token
router.get('/entrance', async (req, res)=>{
    const token = req.headers.authorization
    const tokenV = jwt.verify(token, SecretKey, (err, data)=>{
        if(err){
            return false
        }else{
            return data
        }
    })
    if(!tokenV){
        return res.json({
            user: null
        })
    }
    const user = await Users.findOne({
        where:{
            id: tokenV.id
        }
    })
    return res.json({
        user: user
    })
})

module.exports = router