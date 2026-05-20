// Manual Workflow Processor
// Handles on-demand workflow execution via "Run Now" button

import { PrismaClient } from '@prisma/client'
import { WorkflowStateMachine, WorkflowStatus, WorkflowEvent } from './state-machine'
import { BlueprintGenerator } from './blueprint-generator'
import { EmailDraftComposer } from './email-draft-composer'
import { SnapshotManager } from './snapshot-manager'

const prisma = new PrismaClient()

export interface ProcessingResult {
  appId: string
  status: 'success' | 'error'
  workflowStateId?: string
  result?: string
  error?: string
}

export interface WorkflowExecutionResult {
  success: boolean
  processed: number
  failed: number
  details: ProcessingResult[]
  executionLogId: string
}

export class ManualWorkflowProcessor {
  private blueprintGenerator: BlueprintGenerator
  private emailComposer: EmailDraftComposer
  private snapshotManager: SnapshotManager

  constructor() {
    this.blueprintGenerator = new BlueprintGenerator()
    this.emailComposer = new EmailDraftComposer()
    this.snapshotManager = new SnapshotManager()
  }

  /**
   * Execute workflow on-demand (triggered by "Run Now" button)
   */
  async executeWorkflow(triggeredBy: string = 'USER'): Promise<WorkflowExecutionResult> {
    const executionLog = await prisma.executionLog.create({
      data: {
        executionType: 'MANUAL_RUN',
        startedAt: new Date(),
        status: 'RUNNING',
        triggeredBy
      }
    })

    const results: ProcessingResult[] = []

    try {
      // Find approved applications without workflow state
      const pendingApps = await prisma.application.findMany({
        where: {
          status: 'APPROVED',
          workflowState: null
        }
      })

      console.log(`Found ${pendingApps.length} pending applications to process`)

      // Process each application through pipeline
      for (const app of pendingApps) {
        try {
          const result = await this.processApplication(app, executionLog.id)
          results.push({
            appId: app.id,
            status: 'success',
            workflowStateId: result.workflowStateId,
            result: result.status
          })
        } catch (error) {
          console.error(`Failed to process application ${app.id}:`, error)
          results.push({
            appId: app.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      // Update execution log
      await prisma.executionLog.update({
        where: { id: executionLog.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          itemsProcessed: results.filter(r => r.status === 'success').length,
          itemsFailed: results.filter(r => r.status === 'error').length,
          logData: { results }
        }
      })

      return {
        success: true,
        processed: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length,
        details: results,
        executionLogId: executionLog.id
      }

    } catch (error) {
      // Update execution log with failure
      await prisma.executionLog.update({
        where: { id: executionLog.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          logData: { results }
        }
      })

      throw error
    }
  }

  /**
   * Process a single application through the workflow pipeline
   */
  private async processApplication(app: any, executionLogId: string): Promise<{ workflowStateId: string; status: WorkflowStatus }> {
    console.log(`Processing application: ${app.fullName} (${app.email})`)

    // Step 1: Create workflow state
    const workflowState = await prisma.workflowState.create({
      data: {
        applicationId: app.id,
        status: 'BLUEPRINT_QUEUED',
        statusHistory: [{
          status: 'SUBMITTED',
          timestamp: new Date().toISOString(),
          notes: 'Application submitted'
        }, {
          status: 'BLUEPRINT_QUEUED',
          timestamp: new Date().toISOString(),
          notes: 'Queued for blueprint generation'
        }]
      }
    })

    // Step 2: Update to generating state
    await this.updateWorkflowState(workflowState.id, 'BLUEPRINT_GENERATING', 'SYSTEM')

    try {
      // Step 3: Generate blueprint
      const blueprint = await this.blueprintGenerator.generate(app)

      // Step 4: Convert to PDF using DockMaker
      const pdfPath = await this.blueprintGenerator.convertToPdf(blueprint, app.id)

      // Step 5: Update state with blueprint
      await prisma.workflowState.update({
        where: { id: workflowState.id },
        data: {
          blueprintMarkdown: blueprint,
          blueprintPdfPath: pdfPath,
          generationCompletedAt: new Date()
        }
      })

      await this.updateWorkflowState(workflowState.id, 'BLUEPRINT_COMPLETE', 'SYSTEM')

      // Step 6: Compose draft email
      const draftEmail = await this.emailComposer.compose(app, pdfPath)

      // Step 7: Create email draft record
      await prisma.emailDraft.create({
        data: {
          workflowId: workflowState.id,
          subject: draftEmail.subject,
          body: draftEmail.body,
          attachments: [{ filename: `${app.fullName.replace(/\s+/g, '_')}_Blueprint.pdf`, path: pdfPath, mimeType: 'application/pdf' }],
          status: 'PENDING_REVIEW'
        }
      })

      // Step 8: Update state to ready for review
      await this.updateWorkflowState(workflowState.id, 'DRAFT_EMAIL_READY', 'SYSTEM')
      await this.updateWorkflowState(workflowState.id, 'EMAIL_REVIEW_PENDING', 'SYSTEM')

      // Step 9: Create snapshot
      await this.snapshotManager.createSnapshot(workflowState.id, app)

      console.log(`Successfully processed application ${app.id}`)

      return {
        workflowStateId: workflowState.id,
        status: 'EMAIL_REVIEW_PENDING'
      }

    } catch (error) {
      // Mark as failed
      await this.updateWorkflowState(
        workflowState.id,
        'BLUEPRINT_FAILED',
        'SYSTEM',
        error instanceof Error ? error.message : 'Unknown error'
      )

      throw error
    }
  }

  /**
   * Update workflow state with audit logging
   */
  private async updateWorkflowState(
    workflowId: string,
    newStatus: WorkflowStatus,
    performedBy: string,
    notes?: string
  ): Promise<void> {
    const workflow = await prisma.workflowState.findUnique({
      where: { id: workflowId }
    })

    if (!workflow) {
      throw new Error(`Workflow state not found: ${workflowId}`)
    }

    // Validate transition
    const transition = WorkflowStateMachine.transition(
      workflow.status as WorkflowStatus,
      newStatus,
      performedBy
    )

    if (!transition.success) {
      throw new Error(transition.error)
    }

    // Update status history
    const statusHistory = [...(workflow.statusHistory as any[]), {
      status: newStatus,
      timestamp: new Date().toISOString(),
      notes: notes || `Transition from ${workflow.status} to ${newStatus}`
    }]

    // Update workflow state
    await prisma.workflowState.update({
      where: { id: workflowId },
      data: {
        status: newStatus,
        statusHistory,
        updatedAt: new Date()
      }
    })

    // Create audit log
    await prisma.workflowAuditLog.create({
      data: {
        workflowId,
        action: `STATUS_CHANGE`,
        performedBy,
        oldStatus: workflow.status,
        newStatus,
        metadata: { notes }
      }
    })
  }

  /**
   * Get execution status for progress tracking
   */
  async getExecutionStatus(executionLogId: string): Promise<{
    status: string
    itemsProcessed: number
    itemsFailed: number
    total: number
  }> {
    const log = await prisma.executionLog.findUnique({
      where: { id: executionLogId }
    })

    if (!log) {
      throw new Error(`Execution log not found: ${executionLogId}`)
    }

    return {
      status: log.status,
      itemsProcessed: log.itemsProcessed,
      itemsFailed: log.itemsFailed,
      total: log.itemsProcessed + log.itemsFailed
    }
  }
}
