export const DENOUNCE_STATUS: Map<string, string> = new Map();
DENOUNCE_STATUS.set('EN PROCESO', 'PENDIENTE');
DENOUNCE_STATUS.set('RECHAZADA', 'RECHAZADO');
DENOUNCE_STATUS.set('APROBADA', 'APROBADO');
DENOUNCE_STATUS.set('APROBADO PARCIAL', 'APROBADO PARCIAL');

export enum DENOUNCE_APPLICATION_STATUS {
  PROSPECTO = 'PROSPECTO',
  EN_PROCESO = 'EN PROCESO',
  REMESA_CREADA = 'REMESA CREADA',
  SOLICITUD_CREADA = 'SOLICITUD CREADA',
  ARCHIVOS_PROCESADOS = 'ARCHIVOS PROCESADOS',
  CORREO_ENVIADO = 'CORREO ENVIADO',
  TERMINADO = 'TERMINADO'
}

export enum DENOUNCE_FILE_STATUS {
  PROSPECTO = 'PROSPECTO',
  EN_PROCESO = 'EN PROCESO',
  TERMINADO = 'TERMINADO'
}

export enum PAYROLL_STATUS {
  NO_CARGADO = 'NO CARGADO',
  EN_PROCESO = 'EN PROCESO',
  VALIDADO = 'VALIDADO',
  TERMINADO = 'TERMINADO',
  TERMINADO_CON_ERROR = 'TERMINADO CON ERROR'
}

export enum PAYROLL_STATUS_VS {
  INGRESADO = 'Ingresado',
  PROCESADA_CON_ERRORES = 'Procesada con errores',
  PROCESADA_SIN_ERRORES = 'Procesada sin errores',
  PENDIENTE = 'Pendiente',
  ERROR_EN_LA_CARGA = 'Error en la carga'
}

export enum PAYROLL_STATUS_VS_DETAIL {
  INGRESADO = 'Los registros fueron cargados staisfactoriamente, para el seguimiento de cada caso acceder al detalle',
  PROCESADA_CON_ERRORES = 'La nómina fue procesada con generándose ',
  PROCESADA_SIN_ERRORES = 'La nómina fue procesada satisfactoriamente',
  PENDIENTE = 'Estamos procesando su nómina, pronto tendremos el resultado de la transacción',
  ERROR_EN_LA_CARGA = 'Se produjo un error, favor intente más  tarde, si el problema persiste póngase en contacto con Vida Secutiry'
}

export enum PAYROLL_DETAIL_STATUS {
  EN_PROCESO = 'EN PROCESO',
  TERMINADO = 'TERMINADO',
  TERMINADO_CON_ERROR = 'TERMINADO CON ERROR'
}

export enum POLICY_STATUS {
  ANULADA = 'ANULADA',
  CADUCADA = 'CADUCADA',
  SOLICITUD = 'SOLICITUD',
  SUSCRIPCION = 'SUSCRIPCION',
  VIGENTE = 'VIGENTE'
}

export enum CONTRACTOR_STATUS {
  BLOQUEADO = 'BLOQUEADO',
  VIGENTE = 'VIGENTE'
}

export enum PRESCRIPTION_STATUS {
  CADUCADA = 'CADUCADA',
  VIGENTE = 'VIGENTE'
}

export enum INVOICE_DEBT_STATUS {
  EXPIRED = 'VENCIDA'
}

export enum DEBT_STATUS {
  EXPIRED = 'DEUDA VENCIDA',
  ON_GOING = 'DEUDA EN CURSO'
}
