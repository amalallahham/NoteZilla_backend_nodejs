// Swagger/OpenAPI configuration for API documentation
// AI Assistant: Swagger configuration and security schemes generated with assistance from GitHub Copilot

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NoteZilla API",
      version: "1.0.0",
      description:
        "API documentation for NoteZilla - Video transcription and note-taking application with AI-powered summarization",
      contact: {
        name: "NoteZilla Team",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Development server (v1)",
      },
      {
        url: "http://localhost:3000",
        description: "Development server (legacy)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token"
        }
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        cookieAuth: [],
      }
    ],
  },
  apis: ["./src/routes/*.js"], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
