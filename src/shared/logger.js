const { format } = require('express/lib/response');
const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'info',
    }),
    new winston.transports.File({ filename: 'error.log', level: 'erorr' }),
  ],
});

module.exports = { logger };
