const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hero API',
      description: 'Example of CRUD API ',
      version: '1.0.0',
    },
  },
  server:[{
    url: `http://localhost:5000`,
  }],
  // looks for configuration in specified directories
  apis: ['./Routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

function swaggerDocs(app, port) {
  // Swagger Page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  // Documentation in JSON format
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })
}

module.exports = swaggerDocs;