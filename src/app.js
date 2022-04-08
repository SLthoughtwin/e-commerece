const express = require('express');
const cors = require('cors');
const winston = require('winston');
const fileupload = require('express-fileupload')
const { port, connection } = require('./config/index');
const {hbs} = require("hbs");
const path = require('path')
const bodyParser = require('body-parser')
const {
  adminRoute,
  sellerRoute,
  userRoute,
  addressRoute,
  productRoute,
  brandRoute,
  categoryRoute
} = require('./routes/');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { logger } = require('./shared/');
const { errorHandler, checkvar } = require('./config/errorhandler');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'test swagger',
      version: '2.0',
      description: 'this is another task on swagger',
    },

    components: {
      securitySchemes: {
        jwt: {
          type: 'http',
          scheme: 'bearer',
          in: 'header',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        jwt: [],
      },
    ],

    servers: [
      {
        url: 'http://localhost:8080',
      },
    ],
  },
  apis: [`${__dirname}/routes/*.js`],
};

const spacs = swaggerJsDoc(options);
const app = express();
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(spacs));

app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json())
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, '../views')));
app.use('/auth/admin', adminRoute);
app.use('/auth/seller', sellerRoute);
app.use('/auth/user', userRoute);
app.use('/user/address/', addressRoute);
app.use('/v1/product/',productRoute);
app.use('/v1/brand',brandRoute)
app.use('/v1/category',categoryRoute)


app.use((req, res, next) => {
  const error = new Error('not found');
  error.status(404);
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
    },
  });
});

const envVariable = checkvar('PORT');
if (envVariable === undefined) {
  return logger.info(`env variable are not found`);
}
connection()
  .then((data) => {
    app.listen(port, () => {
      logger.info('connect db');
      logger.info(`connection successfull ${port}`);
    });
  })
  .catch((er) => {
    logger.info('error db is not connect');
  });
