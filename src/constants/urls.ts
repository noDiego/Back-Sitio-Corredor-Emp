import config from '../config';

export const baseURLPolicy: string = config.apiVSURL.apiPolicy;

//export const baseURL = config.serviciosVSURL;

const baseURLGestorDocumental: string = config.gestorServiceURL;

const baseURLCustomer: string = config.apiVSURL.apiCustomer;

const baseURLCollection: string = config.apiVSURL.apiCollection;

const baseURLBilling: string = config.apiVSURL.apiBilling;

const baseURLPayment: string = config.apiVSURL.apiPayment;

const baseURLSuscription: string = config.apiVSURL.apiSuscription;

const baseURLInsuranceRequirements: string = config.apiVSURL.apiInsuranceRequirements;

const baseURLCommon: string = config.apiVSURL.apiCommon;

const baseURLClaims: string = config.apiVSURL.apiClaims;

const baseURLCommisions: string = config.apiVSURL.apiCommissions;

export const URLS: Record<string, any> = {
  userInfo: config.ssoURL + '/userinfo',
  token: config.ssoURL + '/token',
  validateToken: config.ssoURL + '/token/introspect',
  logout: config.ssoURL + '/logout',
  ssoAdmin: {
    token: config.ssoAdmin.urlMaster + '/protocol/openid-connect/token',
    users: config.ssoAdmin.urlUsers
  },
  policyApi: {
    uriBase: baseURLPolicy + '/Policy/',
    uriByInsurance: baseURLPolicy + '/Policy/insuranceCo/',
    reports: baseURLPolicy + '/Report/policy/'
  },
  collectionApi: {
    billingPendingByPolicy: baseURLBilling + '/Pending/Policy/',
    billingByPeriod: baseURLBilling + '/Policy/',
    billingDocument: baseURLBilling + '/invoice/',
    collectionsByPeriod: baseURLCollection + '/byPolicy/',
    paymentsByPolicy: baseURLPayment + '/byPolicy/'
  },
  customerApi: {
    clientDetail: baseURLCustomer + '/Client/'
  },
  subscriptionApi: {
    insuranceRequirement: baseURLInsuranceRequirements,
    virtualSubscription: baseURLSuscription
  },
  commonApi: {
    categories: baseURLCommon + '/Category/',
    cities: baseURLCommon + '/Category/Ciudades',
    communes: baseURLCommon + '/Category/Comunas',
    fileToken: baseURLCommon + '/File/'
  },
  claimsApi: {
    getPrescriptions: baseURLClaims + '/insured/',
    insured: baseURLClaims + '/insured/',
    insuranceCo: baseURLClaims + '/insuranceCo/',
    claimDetail: baseURLClaims + '/',
    paymentType: baseURLClaims + '/'
  },
  gestorDocumental: {
    links: baseURLGestorDocumental + '/Documentos/links'
  },
  commissionApi: {
    commissionsIntermediary: baseURLCommisions + '/Intermediary/',
    commissionsByTotals: baseURLCommisions + '/TotalPeriod',
    commissionsPeriods: baseURLCommisions + '/Periods'
  }
};
