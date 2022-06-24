import { Inject, Service } from 'typedi';
import { IToken } from '../../domain/interfaces/dto/v3/IToken';
import { URLS } from '../../constants/urls';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import qs from 'qs';
import { Logger } from 'winston';
import { trackDependency } from '../../loaders/insight';
import config from '../../config';
import { IServiceResponse } from '../../domain/interfaces/dto/v3/IServiceResponse';
import { SsoUser, SsoUserCreation, SsoUserSearch } from './dto/sso/ssoUser';

@Service('SsoClient')
export default class SsoClient {
  @Inject('logger') private readonly logger: Logger;
  private readonly clientId: string = 'vs-site-brokers';

  public async obtieneToken(authcode: string, redirectUri: string): Promise<IToken> {
    const formArray: string[] = [];
    const startTime: number = Date.now();

    formArray.push('grant_type' + '=' + encodeURIComponent('authorization_code'));
    formArray.push('client_id' + '=' + encodeURIComponent(this.clientId));
    formArray.push('redirect_uri' + '=' + encodeURIComponent(redirectUri));
    formArray.push('code' + '=' + encodeURIComponent(authcode));
    const formBody: string = formArray.join('&');
    const headers: any = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const request: AxiosRequestConfig = {
      method: 'POST',
      url: URLS.token,
      data: formBody,
      headers: headers
    };

    return axios
      .post(URLS.token, formBody, {
        headers: headers
      })
      .then((response: AxiosResponse) => {
        const { data } = response;
        trackDependency(response, request, startTime, true);
        return {
          accessToken: data.access_token,
          expiresIn: data.expires_in,
          refreshExpiresIn: data.refresh_expires_in,
          refreshToken: data.refresh_token,
          tokenType: data.token_type,
          idToken: data.id_token,
          notBeforePolicy: data['not-before-policy'],
          sessionState: data.session_state
        };
      })
      .catch((error: any) => {
        trackDependency(error.response, request, startTime, false, error);
        throw this.errorHandler(error);
      });
  }

  public async refreshToken(refreshToken: string): Promise<IToken> {
    const formArray: string[] = [];
    const startTime: number = Date.now();

    formArray.push('grant_type' + '=' + encodeURIComponent('refresh_token'));
    formArray.push('client_id' + '=' + encodeURIComponent(this.clientId));
    formArray.push('refresh_token' + '=' + encodeURIComponent(refreshToken));
    const formBody: string = formArray.join('&');

    const headers: any = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const request: AxiosRequestConfig = {
      method: 'POST',
      url: URLS.token,
      data: formBody,
      headers: headers
    };

    return axios
      .post(URLS.token, formBody, {
        headers: headers
      })
      .then((response: AxiosResponse) => {
        const { data } = response;
        trackDependency(response, request, startTime, true);
        return {
          accessToken: data.access_token,
          expiresIn: data.expires_in,
          refreshExpiresIn: data.refresh_expires_in,
          refreshToken: data.refresh_token,
          tokenType: data.token_type,
          idToken: data.id_token,
          notBeforePolicy: data['not-before-policy'],
          sessionState: data.session_state
        };
      })
      .catch((error: any) => {
        trackDependency(error.response, request, startTime, false, error);
        throw this.errorHandler(error);
      });
  }

  public async obtieneUser(token: string): Promise<IUserSSO> {
    const data: any = { access_token: token };
    const startTime: number = Date.now();

    const headers: any = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const request: AxiosRequestConfig = {
      method: 'POST',
      url: URLS.token,
      data: data,
      headers: headers
    };

    return axios
      .post(URLS.userInfo, qs.stringify(data), {
        headers: headers
      })
      .then((response: AxiosResponse) => {
        const { data } = response;
        trackDependency(response, request, startTime, true);
        return {
          sub: data.sub,
          name: data.name,
          preferredUsername: data.preferred_username,
          givenName: data.given_name,
          familyName: data.family_name,
          email: data.email,
          authorizationToken: token
        };
      })
      .catch((error: any) => {
        trackDependency(error.response, request, startTime, false, error);
        throw this.errorHandler(error);
      });
  }

  public async getAdminToken(): Promise<IToken> {
    const formArray: string[] = [];
    const startTime: number = Date.now();

    formArray.push('client_id' + '=' + encodeURIComponent(config.ssoAdmin.clientId));
    formArray.push('username' + '=' + encodeURIComponent(config.ssoAdmin.user));
    formArray.push('password' + '=' + encodeURIComponent(config.ssoAdmin.password));
    formArray.push('grant_type' + '=' + encodeURIComponent(config.ssoAdmin.grantType));
    const formBody: string = formArray.join('&');
    const headers: any = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const requestConfig: AxiosRequestConfig = {
      method: 'POST',
      data: formBody,
      headers: headers,
      url: URLS.ssoAdmin.token
    };

    try {
      const response: AxiosResponse = await axios(requestConfig);
      trackDependency(response, requestConfig, startTime, true);
      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
        refreshExpiresIn: response.data.refresh_expires_in,
        refreshToken: response.data.refresh_token,
        tokenType: response.data.token_type,
        idToken: response.data.id_token,
        notBeforePolicy: response.data['not-before-policy'],
        sessionState: response.data.session_state
      };
    } catch (e) {
      trackDependency(e.response, requestConfig, startTime, false, e);
      throw this.errorHandler(e);
    }
  }

  public async refreshAdminToken(refreshToken: string): Promise<IToken> {
    const formArray: string[] = [];
    const startTime: number = Date.now();

    formArray.push('grant_type' + '=' + encodeURIComponent('refresh_token'));
    formArray.push('refresh_token' + '=' + refreshToken);
    formArray.push('client_id' + '=' + encodeURIComponent(config.ssoAdmin.clientId));
    const formBody: string = formArray.join('&');

    const headers: any = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const request: AxiosRequestConfig = {
      method: 'POST',
      url: URLS.ssoAdmin.token,
      data: formBody,
      headers: headers
    };

    try {
      const response: AxiosResponse = await axios(request);
      trackDependency(response, request, startTime, true);
      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
        refreshExpiresIn: response.data.refresh_expires_in,
        refreshToken: response.data.refresh_token,
        tokenType: response.data.token_type,
        idToken: response.data.id_token,
        notBeforePolicy: response.data['not-before-policy'],
        sessionState: response.data.session_state
      };
    } catch (e) {
      trackDependency(e.response, request, startTime, false, e);
      throw this.errorHandler(e);
    }
  }

  public async createUser(request: SsoUserCreation, tokenAdmin: string): Promise<IServiceResponse> {
    const startTime: number = Date.now();

    const headers: any = {
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${tokenAdmin}`
    };

    const requestConfig: AxiosRequestConfig = {
      method: 'POST',
      data: request,
      headers: headers,
      url: URLS.ssoAdmin.users
    };

    try {
      const response: AxiosResponse = await axios(requestConfig);
      trackDependency(response, requestConfig, startTime, true);
      return { code: 0, message: 'OK', success: true };
    } catch (e) {
      trackDependency(e.response, requestConfig, startTime, false, e);
      if (e.response && e.response.data && e.response.data.errorMessage) {
        return { code: 2, status: e.response.status, message: e.response.data.errorMessage, success: false };
      }
      return { code: -1, status: e.status, message: e.message, success: false, error: e };
    }
  }

  public async updateUser(request: SsoUserCreation, idUser: string, tokenAdmin: string): Promise<IServiceResponse> {
    const startTime: number = Date.now();

    const headers: any = {
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${tokenAdmin}`
    };

    const requestConfig: AxiosRequestConfig = {
      method: 'PUT',
      data: request,
      headers: headers,
      url: URLS.ssoAdmin.users + '/' + idUser
    };

    try {
      const response: AxiosResponse = await axios(requestConfig);
      trackDependency(response, requestConfig, startTime, true);
      return { code: 0, message: 'OK', success: true };
    } catch (e) {
      trackDependency(e.response, requestConfig, startTime, false, e);
      if (e.response && e.response.data && e.response.data.errorMessage) {
        return { code: 2, status: e.response.status, message: e.response.data.errorMessage, success: false };
      }
      return { code: -1, status: e.status, message: e.message, success: false, error: e };
    }
  }

  public async searchUser(userSearch: SsoUserSearch, tokenAdmin: string): Promise<IServiceResponse> {
    const startTime: number = Date.now();

    const headers: any = {
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${tokenAdmin}`
    };

    const requestConfig: AxiosRequestConfig = {
      method: 'GET',
      headers: headers,
      url: URLS.ssoAdmin.users,
      params: userSearch
    };

    try {
      const response: AxiosResponse<SsoUser[]> = await axios(requestConfig);
      trackDependency(response, requestConfig, startTime, true);
      return { code: 0, message: 'OK', success: true, data: response.data };
    } catch (e) {
      trackDependency(e.response, requestConfig, startTime, false, e);
      if (e.response && e.response.data && e.response.data.errorMessage) {
        return { code: 2, status: e.response.status, message: e.response.data.errorMessage, success: false };
      }
      return { code: -1, status: e.status, message: e.message, success: false, error: e };
    }
  }

  private errorHandler(error: any): Error {
    this.logger.info(error);
    if (error.status == 401) {
      const err: Error = new Error(error.statusText);
      err.name = 'UnauthorizedError';
      err['status'] = 401;
      return err;
    } else {
      return new Error(error.response.data.error_description);
    }
  }
}
