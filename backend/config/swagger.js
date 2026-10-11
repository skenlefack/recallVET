const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RecallVET API',
      version: '1.0.0',
      description: 'API de gestion v\u00e9t\u00e9rinaire multi-tenant',
      contact: { name: 'RecallVET Support', email: 'support@recallvet.com' }
    },
    servers: [
      { url: '/api', description: 'API Server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      parameters: {
        tenantId: { in: 'header', name: 'X-Tenant-Id', required: true, schema: { type: 'integer' } }
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Public', description: 'Public endpoints (no auth required)' },
      { name: 'Animals', description: 'Animal management' },
      { name: 'Parties', description: 'Client/contact management' },
      { name: 'Appointments', description: 'Appointment scheduling' },
      { name: 'Encounters', description: 'Clinical encounters' },
      { name: 'Vaccinations', description: 'Vaccination records' },
      { name: 'Prescriptions', description: 'Prescription management' },
      { name: 'Invoices', description: 'Billing and invoices' },
      { name: 'Farm', description: 'Farm management' },
      { name: 'Pharmacy', description: 'Pharmacy and inventory' },
      { name: 'Team', description: 'Team management' },
      { name: 'Notifications', description: 'Notification system' },
      { name: 'Search', description: 'Global search' }
    ]
  },
  apis: ['./routes/**/*.js']
};

module.exports = swaggerJsdoc(options);
