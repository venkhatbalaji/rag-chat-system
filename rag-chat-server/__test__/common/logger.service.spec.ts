import { Logger } from '../../src/logger/logger.service';
import { LoggerService } from '@nestjs/common';
import { SlackService } from '../../src/common/slack/slack.service';

describe('Logger', () => {
  let customLogger: Logger;

  const mockWinstonLogger: Partial<LoggerService> = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockSlackService: Partial<SlackService> = {
    sendAlert: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    customLogger = new Logger(
      mockWinstonLogger as LoggerService,
      mockSlackService as SlackService,
    );
  });

  it('should call winston logger.log', () => {
    customLogger.log('Test log', 'TestContext');
    expect(mockWinstonLogger.log).toHaveBeenCalledWith('Test log', {
      context: 'TestContext',
    });
  });

  it('should call winston logger.warn', () => {
    customLogger.warn('Warning log', 'WarnContext');
    expect(mockWinstonLogger.warn).toHaveBeenCalledWith('Warning log', {
      context: 'WarnContext',
    });
  });

  it('should call winston logger.error and send Slack alert', () => {
    customLogger.error('Critical failure', 'stacktrace123', 'ErrorContext');

    expect(mockWinstonLogger.error).toHaveBeenCalledWith('Critical failure', {
      context: 'ErrorContext',
      trace: 'stacktrace123',
    });

    expect(mockSlackService.sendAlert).toHaveBeenCalledWith(
      expect.stringContaining('*Error Logged*'),
    );

    expect(mockSlackService.sendAlert).toHaveBeenCalledWith(
      expect.stringContaining('Critical failure'),
    );
  });

  it('should format trace as N/A if not provided', () => {
    customLogger.error('Error without trace', undefined, 'TraceTest');

    expect(mockSlackService.sendAlert).toHaveBeenCalledWith(
      expect.stringContaining('*Trace:* N/A'),
    );
  });
});
