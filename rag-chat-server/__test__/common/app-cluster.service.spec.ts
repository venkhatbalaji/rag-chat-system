import { AppClusterService } from '../../src/common/utils/app-cluster.service';
import * as cluster from 'cluster';
import * as os from 'os';

jest.mock('cluster', () => ({
  isPrimary: true,
  fork: jest.fn(),
  on: jest.fn(),
}));

describe('AppClusterService', () => {
  const originalIsPrimary = (cluster as any).isPrimary;

  afterEach(() => {
    jest.clearAllMocks();
    (cluster as any).isPrimary = originalIsPrimary;
  });

  it('should fork for each CPU when in primary mode', () => {
    const callback = jest.fn();
    (cluster as any).isPrimary = true;

    AppClusterService.cluster(callback);

    expect((cluster as any).fork).toHaveBeenCalledTimes(os.cpus().length);
    expect(callback).not.toHaveBeenCalled();
    expect((cluster as any).on).toHaveBeenCalledWith(
      'exit',
      expect.any(Function),
    );
  });

  it('should call callback when not in primary mode', () => {
    const callback = jest.fn();
    (cluster as any).isPrimary = false;

    AppClusterService.cluster(callback);

    expect(callback).toHaveBeenCalled();
  });

  it('should call callback if error is thrown', () => {
    const callback = jest.fn();

    const originalFork = (cluster as any).fork;
    (cluster as any).fork = () => {
      throw new Error('Simulated cluster error');
    };

    AppClusterService.cluster(callback);

    expect(callback).toHaveBeenCalled();

    // Restore
    (cluster as any).fork = originalFork;
  });
});
