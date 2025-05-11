import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpServiceWrapper } from '../http/http.service';

@Injectable()
export class CloudflareService {
  private readonly apiToken: string;
  private readonly zoneId: string;
  private readonly isEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpServiceWrapper,
  ) {
    this.isEnabled = this.configService.get<boolean>('cloudflare.isEnabled');
    this.apiToken = this.configService.get<string>('cloudflare.apiKey');
    this.zoneId = this.configService.get<string>('cloudflare.zoneId');
  }

  async blockIp(ip: string): Promise<boolean> {
    if (!this.isEnabled) {
      return true;
    }
    const url = `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/firewall/access_rules/rules`;
    const result = await this.http.post(
      url,
      {
        mode: 'block',
        configuration: { target: 'ip', value: ip },
        notes: 'Blocked due to rate limit breach',
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return result.data ? true : false;
  }
}
