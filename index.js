const config = require('config-json')
config.load('./config.json')
const PORT = config.get('port')
const app = require('./app')

app.listen(PORT)