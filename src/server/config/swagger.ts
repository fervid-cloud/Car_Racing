
// const path = require("path");
// export default function swaggerSetup() {

//     const swaggerAutogen = require('swagger-autogen')()

//     const doc = {
//         info: {
//             "version": "1.0.1",                // by default: "1.0.0"
//             "title": "Car Racing Game",                  // by default: "REST API"
//             "description": "Apis for car racing game"             // by default: ""
//         },
//         host: "localhost:3500",                         // by default: "localhost:3000"
//         basePath: "",                     // by default: "/"
//         schemes: [],                      // by default: ['http']
//         consumes: [],                     // by default: ['application/json']
//         produces: [],                     // by default: ['application/json']
//         tags: [                           // by default: empty Array
//             {
//                 "name": "",               // Tag name
//                 "description": ""         // Tag description
//             },
//             // { ... }
//         ],
//         securityDefinitions: {},         // by default: empty object
//         definitions: {}                  // by default: empty object
//     }

//     const outputFile = path.join(__dirname, './swagger-output.json');
//     // const endpointsFiles = [path.join(__dirname, './../raceTracker/RaceController.ts')];
//     const endpointsFiles = [path.join(__dirname, './../index.ts')];
//     // NOTE: if you use the express Router, you must pass in the
//     // 'endpointsFiles' only the root file where the route starts.

//     swaggerAutogen(outputFile, endpointsFiles, doc);
// }