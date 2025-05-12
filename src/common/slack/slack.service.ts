import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpServiceWrapper } from '../http/http.service';

@Injectable()
export class SlackService {
  private readonly webhookUrl: string;
  private readonly isEnabled: boolean;
  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpServiceWrapper,
  ) {
    this.webhookUrl = this.configService.get<string>('slack.url');
    this.isEnabled = this.configService.get<boolean>('slack.isEnabled');
  }

  async sendAlert(message: string) {
    if (this.webhookUrl && this.isEnabled) {
      await this.http.post(this.webhookUrl, { text: message });
    }
  }
}
