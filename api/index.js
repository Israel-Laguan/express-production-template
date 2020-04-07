// const express = require('express')
// const rateLimit = require('express-rate-limit')
// const limiter = rateLimit({
//   windowMs: 5 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// })

// const versionController = require('./version');
const system = require('./system')

module.exports = (server) => {
  try {
    server.use('/', system)
    // server.get('/', function (_, res) {
    //   res.sendFile('/index.html', { root: path.join(__dirname, '../webpage') });
    // });
    // server.use(express.static(path.join(__dirname, '../webpage')));
    // server.use('/api', versionController);
    // server.use('/api',limiter);
  } catch (error) {
    console.error(error)
  }
}
