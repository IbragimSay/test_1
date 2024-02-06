const {Router} = require('express')
const auth = require('./router/auth')
const post = require('./router/post')


const router = Router()

router.use('/auth', auth)
router.use('/posts', post)

module.exports = router