module.exports = {
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
          url: 'http://localhost:5000',
        },
      ],
    },
    apis: [`${__dirname}/../routes/*.js`],
  };