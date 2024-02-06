const {Router} =require('express')
const url = require('url')
const jwt = require('jsonwebtoken')
const {Posts} = require('../bd')
const config = require('config-json')
config.load('./config.json')
const SecretKey = config.get('SecretKey')
const router = Router()

// http://localhost:3500/api/posts/add
// body: 
// title
// text
// headers:
// authorization: token
router.post('/add', async (req, res)=>{
    try{
        const {title, text} = req.body
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
        await Posts.create({
            id_user: token.id,
            title,
            text
        })
        res.json({
            mes: "пост был добавлен"
        })
    }catch(e){
        res.json({
            mes: "Error"
        })
    } 
})  

//http://localhost:3500/api/posts/delete/?id=IDпоста
// headers: 
// authorization: token
router.post('/delete', async (req, res)=>{
    try{
        const urlPars = url.parse(req.url, true)
        const id = urlPars.query.id
    
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
    
        if(token.role == "admin"){
            await Posts.delete({where:{
                id: id
            }})
            return res.json({
                mes: 'пост удалён'
            })
        }
    
        const post = await Posts.findOne({where: {
            id: id
        }})
        if(!post){
            return res.json({
                mes: "такого поста не существует"
            })
        }
        if(!(token.id == post.dataValues.id_user)){
            return res.json({
               mes: " у вас нет прав чтобы удалить этот пост"
            })
        }
    
        await Posts.destroy({where: {
            id: id
        }})

        return res.json({
            mes: 'пост удалён'
        })
    }catch(e){
        res.json({
            mes: 'Error'
        })
    }
    
})

module.exports = router 
