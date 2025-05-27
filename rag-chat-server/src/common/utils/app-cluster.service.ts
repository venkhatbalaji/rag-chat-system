import cluster = require('cluster');
import * as os from 'os';
import { Injectable } from '@nestjs/common';

const numCPUs = os.cpus().length;

@Injectable()
export class AppClusterService {
  static cluster(callback: Function): void {
    try {
      const Cluster = cluster as any;
      if (Cluster?.isPrimary) {
        for (let i = 0; i < numCPUs; i++) {
          Cluster.fork();
        }
        Cluster.on('exit', (worker, code, signal) => {
          Cluster.fork();
        });
      } else {
        callback();
      }
    } catch (error) {
      callback();
    }
  }
}
