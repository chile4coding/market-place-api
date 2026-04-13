import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/config/swagger';

const router = Router();

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { display: flex !important; }
    .swagger-ui .info .title { font-size: 2.5em; }
  `,
  customSiteTitle: 'Marketplace API Docs',
  customfavIcon: '/favicon.ico',
  customJs: '/swagger-auth.js',
}));

router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

export default router;
