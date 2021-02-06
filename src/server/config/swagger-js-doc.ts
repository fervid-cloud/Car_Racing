
export function swaggerJSDocSetup(apiPaths: string){
    const swaggerJSDoc = require('swagger-jsdoc');

    const swaggerDefinition = {
        openapi: '3.0.0',
        info: {
            title: 'Express API for RaceTracker',
            version: '1.0.0',
        },
    };

    const options = {
        swaggerDefinition,
        // Paths to files containing OpenAPI definitions
        // apis: ['./routes//*.js'],
        apis: [apiPaths],
    };

    const swaggerSpec = swaggerJSDoc(options);
    return swaggerSpec;

}
