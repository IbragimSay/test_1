const {Router} = require('express')
const jwt = require('jsonwebtoken')
const config = require('config-json')
config.load('./config.json')
const SecretKey = config.get('SecretKey')
const url = require('url')
const {Users, Posts} = require('../bd')

const router = Router()
// GET
// http://localhost:3500/api/account/myProfile
// В headers надо предать
// Authorization: {токен пользователя}
router.get("/myProfile", async (req, res)=>{
    const token = jwt.verify(req.headers.authorization, SecretKey, (err, data)=>{
        if(err){
            return null
        }else{
            return data
        }
    })

    if(!token){
        return res.json({
            mes: "вы не авторизованы"
        })
    }

    console.log(token)
    
    const user = await Users.findOne({
        attributes: ["id", "mail", "name", "tag"],
        where: {
            id: token.id
        }
    })

    const posts = await Posts.findAll({
        where: {
            id_user: user.id
        }
    })

    return res.json({
        user: user,
        posts: posts
    })
})
// На выходе мы получаем объекты user с полями
// user: id, mail, name, tag

// GET
// http://localhost:3500/api/account/getUserId/?tag={teg пользователя}
router.get('/getUserId', async (req, res)=>{
    const parsUrl = url.parse(req.url, true)
    const tag = parsUrl.query.tag

    const user = await Users.findOne({
        attributes:["id", "name", "tag", "role"],
        where: {
            tag: tag
        }
    })

    if(!user){
        return res.json({
            mes: "такого пользователя не существует"
        })
    }

    const posts = await Posts.findAll({
        where: {
            id_user: user.dataValues.id
        }
    })

    return res.json({
        user: user,
        posts: posts
    })
})
// На выходе мы получаем объекты user и posts с полями
// user: id, name, tag, role
// posts: [{id, id_user, title, text, content }]

module.exports = router