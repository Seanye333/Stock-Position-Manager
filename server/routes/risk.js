import { Router } from 'express';
import { computeRiskMetrics } from '../services/riskService.js';

const router = Router();

router.get('/metrics', async (req, res, next) => {
  try {
    const metrics = await computeRiskMetrics();
    res.json(metrics);
  } catch (err) { next(err); }
});

export default router;
