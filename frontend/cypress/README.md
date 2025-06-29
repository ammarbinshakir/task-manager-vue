# Cypress E2E Testing

This directory contains end-to-end tests for the Task Manager application using Cypress.

## Test Structure

- `e2e/task-manager.cy.ts` - Core functionality tests (add, list, complete tasks)

## Running Tests

### Prerequisites

1. Make sure both frontend and backend servers are running:

   ```bash
   # Terminal 1 - Backend
   cd backend && npm start

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

### Run Tests

**Open Cypress Test Runner (Interactive Mode):**

```bash
npm run cypress:open
```

**Run Tests Headlessly:**

```bash
npm run cypress:run
```

**Alternative command:**

```bash
npm run test:e2e
```

## Test Coverage

The current test suite covers:

1. **Adding Tasks**

   - Add a single task
   - Add multiple tasks
   - Verify task appears in list
   - Verify statistics update

2. **Listing Tasks**

   - Display multiple tasks
   - Show empty state when no tasks
   - Verify task statistics

3. **Completing Tasks**

   - Toggle task completion status
   - Verify visual completion state
   - Verify statistics update

4. **Basic Workflow**
   - End-to-end workflow: add → complete → verify

## Test Selectors

The tests use the following CSS selectors:

- `.add-task-input` - Task input field
- `.add-task-btn` - Add task button
- `.task-title` - Task title text
- `.modern-checkbox` - Task completion checkbox
- `.task-stats` - Statistics container
- `.empty-state` - Empty state message
- `.loading-state` - Loading indicator

## Notes

- Tests automatically clear existing tasks before each test for a clean state
- Tests include appropriate waits for API responses
- Tests verify both UI state and statistics updates
