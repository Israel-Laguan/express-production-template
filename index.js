const server = require('./server')
const boot = require('./server/start')
const api = require('./api')

api(server)
boot(server)
