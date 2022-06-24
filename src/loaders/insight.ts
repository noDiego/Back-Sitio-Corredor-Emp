import config from '../config';
import * as appInsights from 'applicationinsights';
import { Contracts } from 'applicationinsights';
import NodeClient from 'applicationinsights/out/Library/NodeClient';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request } from 'express';
import { Container } from 'typedi';
import AppInsights = require('applicationinsights');
import { CorrelationContext } from 'applicationinsights/out/AutoCollection/CorrelationContextManager';

export default (): NodeClient => {
  appInsights
    .setup(config.insight.key)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectDependencies(false)
    .setAutoCollectRequests(false)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    // .setAutoCollectConsole(false)
    // .setUseDiskRetryCaching(false)
    .start();
  return appInsights.defaultClient;
};

export function getContextId(request?: Request): string {
  const correlationContext: CorrelationContext = AppInsights.getCorrelationContext();
  if (!correlationContext && request && request.currentUser) return request.currentUser.transactionID;
  else if (!correlationContext && (!request || !request.currentUser)) return String(new Date().getTime());
  return correlationContext.operation.id;
}

export function trackRequest(
  request: Request,
  status: number,
  responseData: any,
  success: boolean,
  error?: Error
): void {
  const insightClient: NodeClient = Container.get<NodeClient>('InsightClient');
  const telemetryData: Contracts.RequestTelemetry & Contracts.Identified = {
    url: request.url,
    name: request.method.toUpperCase() + ' ' + request.url,
    resultCode: status,
    success: success,
    properties: {
      request: {
        params: request.params,
        query: request.query,
        body: request.body,
        headers: request.headers
      },
      response: {
        data: responseData,
        status: status
      },
      error: error
    },
    duration: Date.now() - request.startTime,
    id: getContextId(request)
  };

  insightClient.trackRequest(telemetryData);
}

export function trackDependency(
  response: AxiosResponse,
  request: AxiosRequestConfig,
  startTime: number,
  success: boolean,
  error?: AxiosError
): void {
  // Track Request on completion
  const insightClient: NodeClient = Container.get<NodeClient>('InsightClient');
  const telemetryData: Contracts.DependencyTelemetry & Contracts.Identified = {
    dependencyTypeName: 'HTTP',
    name: !request.method ? 'GET' : request.method.toUpperCase() + ' ' + request.url,
    resultCode: response ? response.status : error.response ? error.response.status : 500,
    success: success,
    data: request.url,
    properties: {
      request: {
        params: request.params,
        data: request.data,
        headers: request.headers
      },
      response: !response
        ? error.message
        : {
            data: response.data,
            headers: response.headers,
            statusText: response.statusText,
            status: response.status
          }
    },
    duration: Date.now() - startTime,
    id: getContextId()
  };

  insightClient.trackDependency(telemetryData);
}

export function trackRedis(data: any, dataKey: string, startTime: number): void {
  // Track Request on completion
  const insightClient: NodeClient = Container.get<NodeClient>('InsightClient');
  const telemetryData: Contracts.DependencyTelemetry & Contracts.Identified = {
    dependencyTypeName: 'redis',
    name: 'GET REDISCACHE DATAKEY: ' + dataKey,
    resultCode: data ? 200 : 404,
    success: !!data,
    data: dataKey,
    properties: {
      response: data
        ? {
            data: data
          }
        : undefined
    },
    duration: Date.now() - startTime,
    id: getContextId()
  };

  insightClient.trackDependency(telemetryData);
}

export function trackSQL(request: any, queryName: string, data: any, startTime: number): void {
  // Track Request on completion

  const insightClient: NodeClient = Container.get<NodeClient>('InsightClient');
  const telemetryData: Contracts.DependencyTelemetry & Contracts.Identified = {
    dependencyTypeName: 'SQL',
    name: queryName,
    resultCode: data ? 200 : 404,
    success: !!data,
    data: queryName,
    properties: {
      request: request,
      response: data
        ? {
            data: data
          }
        : undefined
    },
    duration: Date.now() - startTime,
    id: getContextId()
  };

  insightClient.trackDependency(telemetryData);
}
