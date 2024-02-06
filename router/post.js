const {Router} =require('express')
const express = require('express')
const multer = require('multer')
const url = require('url')
const jwt = require('jsonwebtoken')
const {Posts} = require('../bd')
const config = require('config-json')
config.load('./config.json')
const SecretKey = config.get('SecretKey')
const router = Router()
// добавить пост
// POST
// http://localhost:3500/api/posts/add
// В body надо предать
// title
// text
// В headers надо предать
// authorization: {токен пользователя}
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
// На выходе мы поучаем объект mes 

//=========================
// удалить пост
// POST
//http://localhost:3500/api/posts/delete/?id={IDпоста}
// В headers надо предать
// authorization: {токен пользователя}
router.delete('/delete', async (req, res)=>{
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
// На выходе мы поучаем объект mes 
//=========================
// обновить пост
// PATCH
// http://localhost:3500/api/posts/updatePost/?id={IDпоста}
// В body надо предать
// title,
// text
// В headers надо предать
// authorization: {токен пользователя}
router.patch('/updatePost', async (req, res) => { 
    try{    
        const { title, text } = req.body 
        const parsUrl = url.parse(req.url, true) 
        const id = parsUrl.query.id 
        const token = jwt.verify(req.headers.authorization, SecretKey, (err, data) => { 
            if (err) { 
                return null 
            } else { 
                return data 
            } 
        }) 
        if (!token) { 
            return res.json({ 
                mes: "вы не авторизованы" 
            }) 
        } 
        if (token.role == 'admin') { 
            await Posts.update({ 
                title, 
                text 
            }, { 
                where: { 
                    id: id 
                } 
            }) 
            return res.json({ 
                mes: "пост обнавлен" 
            }) 
        } 
        const Post = await Posts.findOne({ 
            where: { 
                id: id 
            } 
        }) 
        if (!(Post.dataValues.id_user == token.id)) { 
            res.json({ 
                mes: "у вас нет прав обнавить этот пост" 
            }) 
        } 
        await Posts.update({ 
            title, 
            text 
        }, { 
            where: { 
                id: id 
            } 
        }) 
        res.json({ 
            mes: "пост обнавлен" 
        }) 
    }catch(e){

        res.json({
            mes: "Error"
        })
    }

})
// На выходе мы поучаем объект mes 

let image 

const storage = multer.diskStorage({
    destination: (req, file, cd)=>{
        cd(null, "content")
    },
    filename: (req, file, cb)=>{

        image = new Date().toISOString() + file.originalname
        cb(null, image)
    }
})

const upload = multer({storage:storage})

// загрузить файл
// POST
// http://localhost:3500/api/posts/addContent/?id={IDпоста}
// В headers надо предать
// authorization: {токен пользователя}
router.post('/addContent', async(req, res, next)=>{
    try{
        const parsUrl = url.parse(req.url, true)
        const id = parsUrl.query.id
        const token = jwt.verify(req.headers.authorization, SecretKey,(err, data)=>{
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
    
        if(token.role=="admin"){
            next()
        }
        const Post = await Posts.findOne({
            where: {
                id: id
            }
        })
        if(!(token.id == Post.dataValues.id_user)){
            return res.json({
                mes: "у вас нет доступа к этому посту"
            })
        }
        next()   
    }catch(e){
        res.json({
            mes: "Error"
        })
    }
    
},upload.single('content'), async (req, res)=>{
    const parsUrl = url.parse(req.url, true)
    const id = parsUrl.query.id

    await Posts.update({
        content: image
    },{
        where: {
            id: id
        }
    })
    res.json({
        mes: "контент добавлен"
    })
})
// На выходе мы поучаем объект mes 
// =================
// http://localhost:3500/api/posts/content/{название контента}
router.use("/content", express.static('./content'))

module.exports = router 
