const Sequelize = require('sequelize')

const User = (sequelize)=>{
    return sequelize.define('users', {
        id: {
            type: Sequelize.INTEGER.UNSIGNED,
            primaryKey: true
        },
        mail: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        tag: {
            type: Sequelize.STRING
        },
        role:{
            type: Sequelize.STRING(5)
        }
    }, {
        timestamps: false
    })
}

module.exports = User