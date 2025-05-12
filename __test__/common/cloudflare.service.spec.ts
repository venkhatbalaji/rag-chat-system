import { CloudflareService } from '../../src/common/cloudflare/cloudflare.service';
import { ConfigService } from '@nestjs/config';
import { HttpServiceWrapper } from '../../src/common/http/http.service';

describe('CloudflareService', () => {
  let service: CloudflareService;
  let configService: ConfigService;
  let httpService: HttpServiceWrapper;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(() => {
    mockConfigService.get = jest.fn((key: string) => {
      const config = {
        'cloudflare.isEnabled': true,
        'cloudflare.apiKey': 'dummy-token',
        'cloudflare.zoneId': 'dummy-zone',
      };
      return config[key];
    });

    service = new CloudflareService(
      mockConfigService as any,
      mockHttpService as any,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should initialize with correct config values', () => {
    expect((service as any).isEnabled).toBe(true);
    expect((service as any).apiToken).toBe('dummy-token');
    expect((service as any).zoneId).toBe('dummy-zone');
  });

  it('should return true without calling API if isEnabled is false', async () => {
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        'cloudflare.isEnabled': false,
      };
      return config[key];
    });

    const cfService = new CloudflareService(
      mockConfigService as any,
      mockHttpService as any,
    );

    const result = await cfService.blockIp('1.2.3.4');
    expect(result).toBe(true);
    expect(mockHttpService.post).not.toHaveBeenCalled();
  });

  it('should make API call and return true if data is present', async () => {
    mockHttpService.post.mockResolvedValue({ data: { success: true } });

    const result = await service.blockIp('1.2.3.4');

    expect(mockHttpService.post).toHaveBeenCalledWith(
      'https://api.cloudflare.com/client/v4/zones/dummy-zone/firewall/access_rules/rules',
      {
        mode: 'block',
        configuration: { target: 'ip', value: '1.2.3.4' },
        notes: 'Blocked due to rate limit breach',
      },
      {
        headers: {
          Authorization: 'Bearer dummy-token',
          'Content-Type': 'application/json',
        },
      },
    );
    expect(result).toBe(true);
  });

  it('should return false if no data is returned from API', async () => {
    mockHttpService.post.mockResolvedValue({});

    const result = await service.blockIp('1.2.3.4');

    expect(result).toBe(false);
  });
});
