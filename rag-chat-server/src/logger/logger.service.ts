import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SlackService } from '../common/slack/slack.service';

@Injectable()
export class Logger implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly slackService: SlackService,
  ) {
    this.logger = logger;
  }

  log(message: any, context?: string) {
    this.logger.log(message, { context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
    this.slackService.sendAlert(
      `*Error Logged*\n*Context:* ${context}\n*Message:* ${message}\n*Trace:* ${trace || 'N/A'}`,
    );
  }
}
