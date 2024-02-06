const {Router} = require('express')
const config = require('config-json')
config.load("./config.json")
const SecretKey = config.get('SecretKey')
const {Users, Posts} = require('../bd')
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
// POST
// http://localhost:3500/api/auth/registor
// В body надо предать
// mail
// password
// name
// tag
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
        return res.json({
            mes: "пользователь создан"
        })
    }catch(e){
        res.json({
            mes: "Error" 
        })
    }
})
// На выходе мы поучаем объект mes 

//=========================


// POST
// http://localhost:3500/api/auth/login
// В body надо предать
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
// На выходе мы поучаем объект token 

//=========================
// GET
// http://localhost:3500/api/auth/entrance
// В headers надо предать
// Authorization: {токен пользователя}
router.get('/entrance', async (req, res)=>{
    const token = jwt.verify(req.headers.authorization, SecretKey, (err, data)=>{
        if(err){
            return false
        }else{
            return data
        }
    })

    if(!token){
        return res.json({
            user: null
        })
    }
    const user = await Users.findOne({

        attributes: ["id", "name", "tag", "role"],
        where:{
            id: token.id
        }
    })
    const post = await Posts.findAll()
    
    return res.json({
        user: user,
        post: post
    })
    

})
// На выходе мы получаем объекты user и posts с полями
// user: id, name, tag, role
// posts: [{id, id_user, title, text, content }]
module.exports = router