const express = require('express')
const middlewares = require('./middlewares')

const app = express()
middlewares(app)

module.exports = app
