/**
 * Wyoming Charter Backend — Main Entry Point
 * 
 * Express API server for:
 * - Settlement relay (Web3 → ICP)
 * - Node health monitoring
 * - Grant pipeline automation
 * - Legislative dashboard API
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SettlementRelay } from './services/settlement-relay.js';
import { NodeHealthMonitor } from './services/node-health-monitor.js';
import { GrantAutomation } from './services/grant-automation.js';
import { LegislativeDashboard } from './services/legislative-dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3873; // 873ms heartbeat reference

// Middleware
app.use(cors());
app.use(express.json());

// Services
const settlementRelay = new SettlementRelay();
const nodeHealthMonitor = new NodeHealthMonitor();
const grantAutomation = new GrantAutomation();
const legislativeDashboard = new LegislativeDashboard();

// ── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'wyoming-charter-backend',
    version: '1.0.0',
    timestamp: Date.now(),
    heartbeatMs: 873
  });
});

// ── Settlement API ───────────────────────────────────────────────────────
app.post('/api/settle', async (req: Request, res: Response) => {
  try {
    const { recipient, amount, memo } = req.body;
    const result = await settlementRelay.initiateSettlement(recipient, amount, memo);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/settlement/:id', async (req: Request, res: Response) => {
  try {
    const result = await settlementRelay.getSettlementStatus(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/settlement/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await settlementRelay.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/settlement/compare', async (_req: Request, res: Response) => {
  try {
    const comparison = await settlementRelay.compareSettlementMethods();
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ── Node Health API ──────────────────────────────────────────────────────
app.get('/api/nodes', async (_req: Request, res: Response) => {
  try {
    const nodes = await nodeHealthMonitor.getAllNodes();
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/nodes/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await nodeHealthMonitor.getGridStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/nodes/:id', async (req: Request, res: Response) => {
  try {
    const node = await nodeHealthMonitor.getNode(req.params.id);
    res.json(node);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/nodes/state/:state', async (req: Request, res: Response) => {
  try {
    const nodes = await nodeHealthMonitor.getNodesByState(req.params.state);
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ── Grant API ────────────────────────────────────────────────────────────
app.get('/api/grants', async (_req: Request, res: Response) => {
  try {
    const grants = await grantAutomation.getAllGrants();
    res.json(grants);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/grants/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await grantAutomation.getPipelineStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/grants/:id/submit', async (req: Request, res: Response) => {
  try {
    const result = await grantAutomation.markSubmitted(parseInt(req.params.id, 10));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/grants/:id/award', async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const result = await grantAutomation.markAwarded(parseInt(req.params.id, 10), amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ── Legislative Dashboard API ────────────────────────────────────────────
app.get('/api/legislative/demo', async (_req: Request, res: Response) => {
  try {
    const demo = await legislativeDashboard.getDemoData();
    res.json(demo);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/legislative/milestones', async (_req: Request, res: Response) => {
  try {
    const milestones = await legislativeDashboard.getMilestones();
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/legislative/comparison', async (_req: Request, res: Response) => {
  try {
    const comparison = await legislativeDashboard.getSettlementComparison();
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ── Start Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           WYOMING CHARTER BACKEND — ONLINE                    ║
╠═══════════════════════════════════════════════════════════════╣
║  Port:      ${PORT}                                              ║
║  Heartbeat: 873ms                                             ║
║  Status:    OPERATIONAL                                       ║
╚═══════════════════════════════════════════════════════════════╝
  `);
  
  // Start 873ms heartbeat
  setInterval(() => {
    nodeHealthMonitor.tick();
  }, 873);
});

export default app;
