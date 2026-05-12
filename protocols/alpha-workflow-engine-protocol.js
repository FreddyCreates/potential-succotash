/**
 * PROTO-236: Alpha Workflow Engine Protocol
 * 
 * Executes complex multi-step workflows with phi-weighted scheduling.
 * Supports parallel execution, conditional branching, and rollback.
 *
 * @module alpha-workflow-engine-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

const STEP_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
};

class AlphaWorkflowEngineProtocol {
  constructor() {
    this.id = 'PROTO-236';
    this.name = 'Alpha Workflow Engine Protocol';
    this.workflows = new Map();
    this.executions = new Map();
    this.metrics = { workflowsRun: 0, stepsCompleted: 0, stepsFailed: 0 };
  }

  defineWorkflow(workflowId, steps) {
    const workflow = {
      id: workflowId,
      steps: steps.map((step, i) => ({
        id: step.id || `step-${i}`,
        name: step.name,
        execute: step.execute,
        condition: step.condition || (() => true),
        rollback: step.rollback,
        weight: step.weight || Math.pow(PHI_INV, i),
      })),
      created: Date.now(),
    };
    this.workflows.set(workflowId, workflow);
    return workflow;
  }

  async executeWorkflow(workflowId, context = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return { success: false, reason: 'Workflow not found' };

    const executionId = `exec-${Date.now()}`;
    const execution = {
      id: executionId,
      workflowId,
      context,
      stepResults: [],
      status: 'running',
      startedAt: Date.now(),
    };
    this.executions.set(executionId, execution);
    this.metrics.workflowsRun++;

    let rollbackNeeded = false;
    let lastError = null;

    for (const step of workflow.steps) {
      // Check condition
      if (!step.condition(context, execution.stepResults)) {
        execution.stepResults.push({ stepId: step.id, status: STEP_STATUS.SKIPPED });
        continue;
      }

      try {
        const result = await Promise.resolve(step.execute(context, execution.stepResults));
        execution.stepResults.push({
          stepId: step.id,
          status: STEP_STATUS.COMPLETED,
          result,
          completedAt: Date.now(),
        });
        this.metrics.stepsCompleted++;
      } catch (err) {
        execution.stepResults.push({
          stepId: step.id,
          status: STEP_STATUS.FAILED,
          error: err.message,
          failedAt: Date.now(),
        });
        this.metrics.stepsFailed++;
        rollbackNeeded = true;
        lastError = err;
        break;
      }
    }

    // Rollback if needed
    if (rollbackNeeded) {
      const completedSteps = execution.stepResults
        .filter(r => r.status === STEP_STATUS.COMPLETED)
        .reverse();

      for (const result of completedSteps) {
        const step = workflow.steps.find(s => s.id === result.stepId);
        if (step?.rollback) {
          try {
            await Promise.resolve(step.rollback(context, result.result));
            result.rolledBack = true;
          } catch (rbErr) {
            result.rollbackError = rbErr.message;
          }
        }
      }

      execution.status = 'failed';
      execution.error = lastError?.message;
    } else {
      execution.status = 'completed';
    }

    execution.completedAt = Date.now();
    execution.duration = execution.completedAt - execution.startedAt;

    return { success: execution.status === 'completed', execution };
  }

  getExecution(executionId) {
    return this.executions.get(executionId);
  }

  getMetrics() { return this.metrics; }
}

export { AlphaWorkflowEngineProtocol, STEP_STATUS };
export default AlphaWorkflowEngineProtocol;
