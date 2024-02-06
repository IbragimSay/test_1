const Sequelize = require('sequelize')

const Post = (sequelize)=>{
    return sequelize.define('posts', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        id_user: {
            type: Sequelize.INTEGER.UNSIGNED
        },
        title: {
            type: Sequelize.STRING
        },
        text: {
            type: Sequelize.STRING
        },
        content: {
            type: Sequelize.STRING
        }
    },{
        timestamps: false
    })
}

module.exports = Post