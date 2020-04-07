const bodyParser = require('body-parser')
const compression = require('compression')
const cors = require('cors')
const errorHandler = require('errorhandler')
const helmet = require('helmet')
const methodOverride = require('method-override')
const morgan = require('morgan')
const responseTime = require('response-time')
const logger = require('../util/logger')

const isProduction = process.env.NODE_ENV === 'production'
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:8081'
]

const productionURL = process.env.PRODUCTION_URL
if (productionURL) allowedOrigins.push(productionURL)

const originUndefined = (req, _, next) => {
  if (!req.headers.origin) {
    logger.error(
      'Hi, you are visiting the service locally? If this was a CORS the origin header should not be undefined'
    )
  }
  if (req.headers.host === 'localhost:8080' || req.headers.host === 'localhost:8081') {
    req.headers.origin = 'http://' + req.headers.host
  }
  next()
}

module.exports = app => {
  // Enable if you're behind a reverse proxy (Heroku in our case)
  // see https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', 1)
  app.disable('x-powered-by')
  app.use(responseTime())
  app.use(helmet())
  app.use(
    originUndefined,
    cors({
      origin: (origin, next) => {
        if (allowedOrigins.indexOf(origin) > -1) {
          next(null, true)
        } else {
          const msg = `
              The CORS policy for this site does not allow 
              access from the specified Origin: ${origin}`
          logger.error(msg)
          next(Error(msg))
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Access-Token'
      ],
      preflightContinue: false
    })
  )

  // Used to extract info and pass it to wiston
  app.use(
    morgan(
      ':remote-addr - :remote-user ":method :url HTTP/:http-version" status: :status :res[content-length] - :response-time ms ":referrer" ":user-agent"',
      {
        stream: logger.stream
      }
    )
  )

  app.use(compression())
  app.use(bodyParser.json({ limit: '5mb' }))
  app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(methodOverride('X-HTTP-Method-Override'))
  app.use((req, res, next) => {
    if (
      isProduction &&
      !(req.secure || req.headers['x-forwarded-proto'] === 'https')
    ) {
      res.redirect(
        `https://${req.hostname}:${process.env.PORT_HTTPS}${req.url}`
      )
    } else {
      next()
    }
  })

  if (!isProduction) {
    app.use(errorHandler({ log: errorNotification }))
  }

  function errorNotification (err, str, req) {
    const title = `Error in ${req.method} ${req.url}`
    logger.error(title, str, err.msg)
  }

  app.get('*', function (req, _res, next) {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Request: ${req.method} http://${req.headers.host}${req.url}`)
    }
    return next()
  })
}
