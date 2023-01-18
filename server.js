const express = require('express')
const cors = require('cors')
const productRoute = require('./routes/products')
const bodyParser = require('body-parser')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
require('dotenv').config()

const PORT = process.env.PORT || 7099
const app = express()

app.use(cors())
app.use(bodyParser.json())

// swagger

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Epicode Sample CRUD API',
            version: '0.1.0',
            description:
                'This is a simple CRUD API application made with Express and documented with Swagger',
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            contact: {
                name: 'Marco Colia',
                url: 'https://marcocolia.io',
                email: 'nomail@noemail.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:7099',
            },
        ],
    },
    apis: ['./routes/*.js'],
}

const specs = swaggerJsdoc(options)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs))
app.use('/', productRoute)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
