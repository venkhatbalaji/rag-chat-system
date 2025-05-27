import { SlackService } from '../../src/common/slack/slack.service';
import { ConfigService } from '@nestjs/config';
import { HttpServiceWrapper } from '../../src/common/http/http.service';

describe('SlackService', () => {
  let service: SlackService;
  const mockHttp = { post: jest.fn() };
  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'slack.url': 'https://hooks.slack.com/fake-url',
        'slack.isEnabled': true,
      };
      return config[key];
    }),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    service = new SlackService(mockConfigService as any, mockHttp as any);
  });

  it('should send alert when enabled and webhookUrl is set', async () => {
    await service.sendAlert('test message');
    expect(mockHttp.post).toHaveBeenCalledWith(
      'https://hooks.slack.com/fake-url',
      {
        text: 'test message',
      },
    );
  });

  it('should not send alert if slack.isEnabled is false', async () => {
    (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'slack.url') return 'https://hooks.slack.com/fake-url';
      if (key === 'slack.isEnabled') return false;
    });

    service = new SlackService(mockConfigService as any, mockHttp as any);

    await service.sendAlert('should not be sent');
    expect(mockHttp.post).not.toHaveBeenCalled();
  });

  it('should not send alert if slack.url is missing', async () => {
    (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'slack.url') return null;
      if (key === 'slack.isEnabled') return true;
    });

    service = new SlackService(mockConfigService as any, mockHttp as any);

    await service.sendAlert('should not be sent');
    expect(mockHttp.post).not.toHaveBeenCalled();
  });
});
