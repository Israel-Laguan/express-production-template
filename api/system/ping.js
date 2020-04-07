const {
  name,
  version,
  description
} = require('../../package.json')

const ping = async (_req, res) => {
  res.status(200).json({
    name,
    description,
    version,
    uptime: process.uptime()
  })
}

module.exports = ping
