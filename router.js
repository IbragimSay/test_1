const {Router} = require('express')
const auth = require('./router/auth')
const post = require('./router/post')
const account = require('./router/account')

const router = Router()

router.use('/auth', auth)
router.use('/posts', post)
router.use('/account', account)

module.exports = router