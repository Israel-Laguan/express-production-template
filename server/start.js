'use strict'
// const fs = require('fs')
const http = require('http')
const https = require('https')
const logger = require('../util/logger')

module.exports = app => {
  /**
   * Create HTTP server.
   */
  const httpPort = normalizePort(
    process.env.PORT || process.env.PORT_HTTP || 8080
  )
  const httpsPort = normalizePort(process.env.PORT || process.env.PORT_HTTPS || 8081)
  http
    .createServer(app)
    .listen(httpPort)
    .on('error', onError)
    .on('listening', onListening)

  if (process.env.NODE_ENV !== 'production') {
    /**
     * Create HTTPS server.
     */
    const options = {
    //   cert: fs.readFileSync('cert/cert.pem') || null,
    //   key: fs.readFileSync('cert/key.pem') || null
    }
    https
      .createServer(options, app)
      .listen(httpsPort)
      .on('error', onError)
      .on('listening', onListening)
  }

  /**
   * Normalize a port into a number, string, or false.
   */
  function normalizePort (val) {
    const port = parseInt(val, 10)

    if (isNaN(port)) {
      // named pipe
      return val
    }

    if (port >= 0) {
      // port number
      return port
    }

    return false
  }

  /**
   * Event listener for HTTP server "error" event.
   */
  function onError (error) {
    if (error.syscall !== 'listen') {
      throw error
    }

    const port = this.cert ? httpsPort : httpPort

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        logger.error(` ${bind} requires elevated privileges`)
        process.exit(1)
      case 'EADDRINUSE':
        logger.error(`${bind} is already in use`)
        process.exit(1)
      default:
        throw error
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */
  function onListening () {
    const addr = this.address()
    const type = this.cert ? '(HTTPS)' : '(HTTP)'
    const bind =
      (typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`) +
      ` ${type}`
    logger.info(bind)
    logger.info('App listening on http://127.0.0.1:8080/api')
  }
}
