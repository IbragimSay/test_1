const Sequelize = require('sequelize')
const User = require('./User')
const Post = require('./Post')

const bd = new Sequelize('test_1', 'root', 'argen',{
    dialect: 'mysql',
    host: 'localhost',
    logging: false
})

const Users =  User(bd)
const Posts = Post(bd)

module.exports = {Users, Posts}
