// eslint-disable-next-line @typescript-eslint/no-unused-vars
import redis = require('redis');

declare module 'redis' {
  export interface RedisClient extends NodeJS.EventEmitter {
    setAsync(key: string, value: string): Promise<string>;
    getAsync(key: string): Promise<string>;
    expireAsync(key: string, durationSecs: number): Promise<string>;
    delAsync(key: string): Promise<string>;
  }
}
