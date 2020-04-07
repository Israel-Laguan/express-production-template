const express = require('express')
const ping = require('./ping')

const system = express.Router()
system.get('/ping', ping)

module.exports = system
