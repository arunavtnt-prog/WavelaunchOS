// Workflow State Machine
// Manages state transitions and validation for the workflow automation system

// WorkflowStatus enum definition (mirrors Prisma schema)
export type WorkflowStatus =
  | 'SUBMITTED'
  | 'BLUEPRINT_QUEUED'
  | 'BLUEPRINT_GENERATING'
  | 'BLUEPRINT_COMPLETE'
  | 'BLUEPRINT_FAILED'
  | 'DRAFT_EMAIL_READY'
  | 'EMAIL_REVIEW_PENDING'
  | 'EMAIL_EDITED'
  | 'EMAIL_SENT'
  | 'AWAITING_RESPONSE'
  | 'FOLLOW_UP_QUEUED'
  | 'FOLLOW_UP_READY'
  | 'CONVERTED'
  | 'REJECTED'
  | 'ARCHIVED'

// Valid state transitions map
const VALID_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  SUBMITTED: ['BLUEPRINT_QUEUED'],
  BLUEPRINT_QUEUED: ['BLUEPRINT_GENERATING'],
  BLUEPRINT_GENERATING: ['BLUEPRINT_COMPLETE', 'BLUEPRINT_FAILED'],
  BLUEPRINT_FAILED: ['BLUEPRINT_QUEUED'],
  BLUEPRINT_COMPLETE: ['DRAFT_EMAIL_READY'],
  DRAFT_EMAIL_READY: ['EMAIL_REVIEW_PENDING'],
  EMAIL_REVIEW_PENDING: ['EMAIL_SENT', 'EMAIL_EDITED', 'REJECTED'],
  EMAIL_EDITED: ['EMAIL_REVIEW_PENDING'],
  EMAIL_SENT: ['AWAITING_RESPONSE'],
  AWAITING_RESPONSE: ['FOLLOW_UP_QUEUED', 'CONVERTED'],
  FOLLOW_UP_QUEUED: ['FOLLOW_UP_READY'],
  FOLLOW_UP_READY: ['EMAIL_REVIEW_PENDING'],
  CONVERTED: [],
  REJECTED: [],
  ARCHIVED: []
}

// Human checkpoint states - require manual intervention
export const HUMAN_CHECKPOINTS: WorkflowStatus[] = [
  'EMAIL_REVIEW_PENDING',
  'FOLLOW_UP_READY'
]

// States that can be triggered automatically
export const AUTO_STATES: WorkflowStatus[] = [
  'BLUEPRINT_QUEUED',
  'BLUEPRINT_GENERATING',
  'BLUEPRINT_COMPLETE',
  'BLUEPRINT_FAILED',
  'DRAFT_EMAIL_READY',
  'FOLLOW_UP_QUEUED'
]

export class WorkflowStateMachine {
  
  /**
   * Check if a state transition is valid
   */
  static canTransition(from: WorkflowStatus, to: WorkflowStatus): boolean {
    const validTransitions = VALID_TRANSITIONS[from] || []
    return validTransitions.includes(to)
  }
  
  /**
   * Get all valid next states from current state
   */
  static getValidTransitions(currentState: WorkflowStatus): WorkflowStatus[] {
    return VALID_TRANSITIONS[currentState] || []
  }
  
  /**
   * Check if state requires human approval
   */
  static isHumanCheckpoint(state: WorkflowStatus): boolean {
    return HUMAN_CHECKPOINTS.includes(state)
  }
  
  /**
   * Check if state can be processed automatically
   */
  static canAutoProcess(state: WorkflowStatus): boolean {
    return AUTO_STATES.includes(state)
  }
  
  /**
   * Transition to new state with validation
   */
  static transition(
    currentState: WorkflowStatus, 
    newState: WorkflowStatus,
    performedBy: string = 'SYSTEM'
  ): { success: boolean; error?: string; oldState: WorkflowStatus; newState: WorkflowStatus } {
    
    if (!this.canTransition(currentState, newState)) {
      return {
        success: false,
        error: `Invalid transition from ${currentState} to ${newState}`,
        oldState: currentState,
        newState: currentState
      }
    }
    
    return {
      success: true,
      oldState: currentState,
      newState: newState
    }
  }
  
  /**
   * Get the initial state for a new workflow
   */
  static getInitialState(): WorkflowStatus {
    return 'SUBMITTED'
  }
  
  /**
   * Check if workflow is in a terminal state
   */
  static isTerminalState(state: WorkflowStatus): boolean {
    return ['CONVERTED', 'REJECTED', 'ARCHIVED'].includes(state)
  }
  
  /**
   * Get display name for state
   */
  static getStateDisplayName(state: WorkflowStatus): string {
    const displayNames: Record<WorkflowStatus, string> = {
      SUBMITTED: 'Submitted',
      BLUEPRINT_QUEUED: 'Blueprint Queued',
      BLUEPRINT_GENERATING: 'Generating Blueprint',
      BLUEPRINT_COMPLETE: 'Blueprint Complete',
      BLUEPRINT_FAILED: 'Blueprint Failed',
      DRAFT_EMAIL_READY: 'Draft Email Ready',
      EMAIL_REVIEW_PENDING: 'Email Review Pending',
      EMAIL_EDITED: 'Email Edited',
      EMAIL_SENT: 'Email Sent',
      AWAITING_RESPONSE: 'Awaiting Response',
      FOLLOW_UP_QUEUED: 'Follow-up Queued',
      FOLLOW_UP_READY: 'Follow-up Ready',
      CONVERTED: 'Converted',
      REJECTED: 'Rejected',
      ARCHIVED: 'Archived'
    }
    
    return displayNames[state] || state
  }
  
  /**
   * Get state color for UI
   */
  static getStateColor(state: WorkflowStatus): string {
    const colors: Record<WorkflowStatus, string> = {
      SUBMITTED: 'bg-gray-100 text-gray-600',
      BLUEPRINT_QUEUED: 'bg-blue-50 text-blue-600',
      BLUEPRINT_GENERATING: 'bg-yellow-50 text-yellow-600',
      BLUEPRINT_COMPLETE: 'bg-green-50 text-green-600',
      BLUEPRINT_FAILED: 'bg-red-50 text-red-600',
      DRAFT_EMAIL_READY: 'bg-purple-50 text-purple-600',
      EMAIL_REVIEW_PENDING: 'bg-orange-50 text-orange-600',
      EMAIL_EDITED: 'bg-blue-50 text-blue-600',
      EMAIL_SENT: 'bg-green-50 text-green-600',
      AWAITING_RESPONSE: 'bg-blue-50 text-blue-600',
      FOLLOW_UP_QUEUED: 'bg-gray-50 text-gray-600',
      FOLLOW_UP_READY: 'bg-orange-50 text-orange-600',
      CONVERTED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      ARCHIVED: 'bg-gray-100 text-gray-500'
    }
    
    return colors[state] || 'bg-gray-100 text-gray-600'
  }
}

// Workflow action types
export type WorkflowAction = 
  | 'GENERATE_BLUEPRINT'
  | 'BLUEPRINT_COMPLETE'
  | 'BLUEPRINT_FAILED'
  | 'PREPARE_EMAIL'
  | 'SEND_EMAIL'
  | 'EDIT_EMAIL'
  | 'REJECT_APPLICATION'
  | 'CONVERT_TO_CLIENT'
  | 'SCHEDULE_FOLLOW_UP'
  | 'MANUAL_OVERRIDE'

// Workflow event for audit logging
export interface WorkflowEvent {
  action: WorkflowAction
  performedBy: string
  oldStatus?: WorkflowStatus
  newStatus?: WorkflowStatus
  metadata?: Record<string, unknown>
  timestamp: Date
}
