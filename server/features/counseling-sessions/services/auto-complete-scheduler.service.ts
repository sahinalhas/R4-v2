import { autoCompleteSessions } from './counseling-sessions.service.js';

let schedulerInterval: NodeJS.Timeout | null = null;

export function startAutoCompleteScheduler(): void {
  if (schedulerInterval) {
    console.log('⏱️  Auto-complete scheduler already running');
    return;
  }

  console.log('🚀 Starting auto-complete background scheduler...');

  const checkInterval = 2 * 60 * 1000;

  schedulerInterval = setInterval(() => {
    try {
      const result = autoCompleteSessions();
      if (result.completedCount > 0) {
        console.log(`✅ Auto-completed ${result.completedCount} session(s)`);
      }
    } catch (error) {
      console.error('❌ Error in auto-complete scheduler:', error);
    }
  }, checkInterval);

  console.log('✅ Auto-complete scheduler started (check every 2 minutes)');
}

export function stopAutoCompleteScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('⏹️  Auto-complete scheduler stopped');
  }
}

export function getSchedulerStatus(): { running: boolean; intervalMinutes: number } {
  return {
    running: schedulerInterval !== null,
    intervalMinutes: 2
  };
}

export class AutoCompleteSchedulerService {
  private scheduler: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  constructor() {
    this.start();
    this.setupGracefulShutdown();
  }

  private setupGracefulShutdown() {
    const shutdown = () => {
      console.log('🛑 Shutting down auto-complete scheduler...');
      this.stop();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }

  public stop() {
    this.isShuttingDown = true;
    if (this.scheduler) {
      clearInterval(this.scheduler);
      this.scheduler = null;
      console.log('✅ Auto-complete scheduler stopped');
    }
  }

  // Placeholder for the start method, as it was not provided in the changes
  public start(): void {
    // This method should contain the logic to start the scheduler,
    // similar to the startAutoCompleteScheduler function in the original code.
    // For demonstration purposes, we'll assume it's similar.
    if (this.scheduler) {
      console.log('⏱️  Auto-complete scheduler already running');
      return;
    }

    console.log('🚀 Starting auto-complete background scheduler...');

    const checkInterval = 2 * 60 * 1000;

    this.scheduler = setInterval(() => {
      try {
        const result = autoCompleteSessions();
        if (result.completedCount > 0) {
          console.log(`✅ Auto-completed ${result.completedCount} session(s)`);
        }
      } catch (error) {
        console.error('❌ Error in auto-complete scheduler:', error);
      }
    }, checkInterval);

    console.log('✅ Auto-complete scheduler started (check every 2 minutes)');
  }
}