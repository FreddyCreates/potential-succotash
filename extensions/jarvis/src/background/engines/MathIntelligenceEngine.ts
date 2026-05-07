import { OrganismEngine, Phi, type MeanReversionParams } from './OrganismCore.js';

/**
 * Extension-backend mirror of math intelligence:
 * - exactly two sub-protocols
 * - multi-engine AI model
 */
export class MathIntelligenceEngine extends OrganismEngine {
  protected params: MeanReversionParams = {
    theta: { cognitive: 0.08, affective: 0.05, somatic: 0.04, sovereign: 0.06 },
    J: {
      cognitive: { sovereign: 0.02, affective: 0.01 },
      affective: { cognitive: 0.01, somatic: 0.01 },
      somatic: { affective: 0.01, sovereign: 0.01 },
      sovereign: { cognitive: 0.02, affective: 0.01 },
    },
    mu: 1.0,
  };

  readonly subProtocols = {
    symbolicReasoning: {
      id: 'MATHX-A',
      name: 'Symbolic/Algebraic Sub-Protocol',
      capabilities: ['derive', 'simplify', 'series'],
    },
    geometricReasoning: {
      id: 'MATHX-B',
      name: 'Geometric/Real Sub-Protocol',
      capabilities: ['distance', 'angle', 'projection'],
    },
  } as const;

  readonly aiModel = {
    id: 'MATHX-AIMODEL',
    name: 'Math Intelligence Multi-Engine',
    engines: ['symbolic-engine', 'geometric-engine', 'fusion-engine'],
  } as const;

  constructor() {
    super('MATHX', 'Math Intelligence Engine');
  }

  runEngine(engine: string, input: Record<string, any> = {}) {
    switch (engine) {
      case 'symbolic-engine':
        return { mode: 'symbolic', expression: input.expression || 'x', order: input.order ?? 1 };
      case 'geometric-engine': {
        const p1 = input.p1 || [0, 0, 0];
        const p2 = input.p2 || [0, 0, 0];
        const distance = Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + ((p1[2] || 0) - (p2[2] || 0)) ** 2);
        return { mode: 'geometric', distance, phiScaledDistance: distance * Phi._1 };
      }
      case 'fusion-engine': {
        const complexity = (input.symbolicComplexity ?? 1) * (input.geometricComplexity ?? 1);
        return { mode: 'fusion', score: complexity * Phi.inv, heartbeat: Phi.tau };
      }
      default:
        throw new Error(`Unknown MathIntelligence engine: ${engine}`);
    }
  }

  getMathModel() {
    return this.aiModel;
  }
}

export const MATHX = new MathIntelligenceEngine();
MATHX.activate();

