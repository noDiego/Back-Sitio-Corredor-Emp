import fs from 'fs';
import internal, { Readable } from 'stream';
import path from 'path';
import moment from 'moment';
import config from '../config';
import rutjs = require('rut.js');

export default class Utils {
  public static REGEX_RUT = /^([0-9]{7,9})$/;
  public static REGEX_DV = /^([kK0-9]{1})$/;
  public static REGEX_POLIZA = /^([0-9]+)$/;
  public static REGEX_FECHA = /^(\d{2}\/\d{2}\/\d{4})$/;
  public static REGEX_FILIAL = /^(.{1,20})$/;
  public static REGEX_GRUPO = /^([0-9]{1,12})$/;
  public static REGEX_MONTO = /\d{1,18}(\.\d{1,2})?/;
  public static REGEX_EMAIL = /[^@]+@[^\.]+\..+/;
  public static REGEX_NOMBRES = /^(.{1,100})$/;
  public static REGEX_FONO = /^[+]*[0-9].{7,11}$/;

  private static reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(\.\d*)?)(Z|([+\-])([\d|:]*))?$/;
  private static reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;

  public static dateParser(key: any, value: any): any {
    if (typeof value === 'string') {
      let a: RegExpExecArray = Utils.reISO.exec(value);
      if (a) return new Date(value);
      a = Utils.reMsAjax.exec(value);
      if (a) {
        const b: string[] = a[1].split(/[-+,.]/);
        return new Date(b[0] ? +b[0] : 0 - +b[1]);
      }
    }
    return value;
  }

  public static jsonParse<T>(object: any): T {
    const stringJson: string = JSON.stringify(object);
    return JSON.parse(stringJson, this.dateParser);
  }

  public static get RUTINSURANCECO(): string {
    return config.rutInsuranceCo;
  }

  public static get RUTINSURANCECONUMBER(): number {
    return this.getRutNumber(config.rutInsuranceCo);
  }

  public static get BANKCODECATEGORY(): string {
    return 'BANCOS';
  }

  public static get ACCOUNTTYPECODECATEGORY(): string {
    return 'TIPOSDECUENTA';
  }

  public static get ISAPRECODECATEGORY(): string {
    return 'ISAPRES';
  }

  public static get REGIONCODECATEGORY(): string {
    return 'REGIONES';
  }

  // function to encode file data to base64 encoded string
  public static async base64_encode(filePath: string): Promise<string> {
    try {
      const bitmap: Buffer = fs.readFileSync(filePath);
      return Buffer.from(bitmap).toString('base64');
    } catch (e) {
      throw new Error('Error en ENCODE base64: ' + e);
    }
  }

  public static stringToBase64(data: string): string {
    const buff: Buffer = Buffer.from(data);
    return buff.toString('base64');
  }

  public static async base64_decode(base64file: string): Promise<Buffer> {
    try {
      const decodedFile: Buffer = Buffer.from(base64file, 'base64');
      return decodedFile;
    } catch (e) {
      throw new Error('Error en DECODE base64: ' + e);
    }
  }

  public static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  public static async bufferToStream(binary: Buffer): Promise<internal.Readable> {
    const readableInstanceStream: internal.Readable = new Readable({
      read(): void {
        this.push(binary);
        this.push(null);
      }
    });
    return readableInstanceStream;
  }

  public static async streamToBuffer(readableStream: internal.Readable): Promise<Buffer> {
    return new Promise((resolve: any, reject: any) => {
      const chunks: any[] = [];
      readableStream.on('data', (data: any) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }

  public static getRutDV(fullRut: string): string {
    return rutjs.format(fullRut).split('-')[1];
  }

  public static getRutNumber(fullRut: string): number {
    if (this.validateRut(fullRut) && this.cleanRut(fullRut).length > 7)
      return Number(rutjs.format(fullRut).split('-')[0].replace(/\./g, ''));
    else if (this.isNumeric(fullRut.replace(/\./g, ''))) {
      const rutNumber = Number(fullRut.replace(/\./g, ''));
      return rutNumber >= 1000000 ? rutNumber : NaN;
    } else return NaN;
  }

  public static getRutNumber2(fullRut: string): number {
    return Number(fullRut.split('-')[0].replace(/\./g, ''));
  }

  public static cleanRut(rut: string): string {
    return typeof rut === 'string' ? rut.replace(/^0+|[^0-9kK]+/g, '').toUpperCase() : '';
  }

  public static validateRut(rut: string): boolean {
    return this.cleanRut(rut).length >= 7 && rutjs.validate(rut);
  }

  public static formatRut(rut: string): string {
    rut = this.cleanRut(rut);
    let result: string = rut.slice(-4, -1) + '-' + rut.substr(rut.length - 1);
    for (let i = 4; i < rut.length; i += 3) {
      result = rut.slice(-3 - i, -i) + '.' + result;
    }

    return result;
  }

  public static getRutDigit(rut: string): string | number {
    rut = rut + '';
    // type check
    if (!rut || !rut.length || typeof rut !== 'string') {
      return -1;
    }
    // serie numerica
    const secuencia: number[] = [2, 3, 4, 5, 6, 7, 2, 3];
    let sum = 0;
    //
    for (let i: number = rut.length - 1; i >= 0; i--) {
      const d: string = rut.charAt(i);
      sum += Number(d) * secuencia[rut.length - (i + 1)];
    }
    // sum mod 11
    const rest: number = 11 - (sum % 11);
    // si es 11, retorna 0, sino si es 10 retorna K,
    // en caso contrario retorna el numero
    return rest === 11 ? 0 : rest === 10 ? 'K' : rest;
  }

  public static async arrayBufferToBuffer(ab: ArrayBuffer): Promise<Buffer> {
    const buf: Buffer = Buffer.alloc(ab.byteLength);
    const view: Uint8Array = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
    }
    return buf;
  }

  public static appendToFilename(filename: string, string: string): string {
    const dotIndex: number = filename.lastIndexOf('.');
    if (dotIndex == -1) return filename + string;
    else return filename.substring(0, dotIndex) + string + filename.substring(dotIndex);
  }

  public static jsonClean<T>(json: T | Array<T>, emptyValue: any = undefined): T | Array<T> {
    try {
      return JSON.parse(
        JSON.stringify(json, (key: string, value: string) => {
          return value == null || value == '' ? emptyValue : value;
        })
      );
    } catch (e) {
      return json;
    }
  }

  public static getTemplate(templateName: string): string {
    try {
      const fullTemplatePath: string = path.resolve(__dirname, `../resources/templates/${templateName}`);
      return fs.readFileSync(fullTemplatePath, 'utf8');
    } catch (e) {
      throw new Error('Errol leer archivo: ' + templateName);
    }
  }

  public static getTemplateImg(imgName: string): string {
    //Lee imagen a base64 para agregar en template de PDF
    try {
      const fullTemplatePath: string = path.resolve(__dirname, `../resources/templates/img/${imgName}`);
      return fs.readFileSync(fullTemplatePath, { encoding: 'base64' });
    } catch (e) {
      throw new Error('Errol leer archivo: ' + imgName);
    }
  }

  public static calculateAge(birthdate: Date): number {
    return moment().diff(birthdate, 'years');
  }

  public static formatStringDate(date: Date): string {
    return this.titleCase(moment(date).format('LL')).replace(/( De )/g, ' de ');
  }

  public static isNumeric(str: string): boolean {
    if (typeof str != 'string') return false;
    return !isNaN(Number(str)) && !isNaN(parseFloat(str));
  }

  public static titleCase(string: string): string {
    const sentence: string[] = string.toLowerCase().split(' ');
    for (let i = 0; i < sentence.length; i++) {
      sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }
    return sentence.join(' ');
  }

  public static getMapKeyByValue(map: Map<string, string>, searchValue: string): string {
    for (const [key, value] of map.entries()) {
      if (value === searchValue) return key;
    }
  }

  public static timeZoneSet(cellValue: Date): Date {
    const utcOffset: number = new Date(cellValue).getTimezoneOffset();
    return new Date(cellValue.getTime() + utcOffset * 60 * 1000);
  }

  public static toTitleCase(string: string): string {
    return string[0].toUpperCase() + string.slice(1);
  }
}

export function clone<T>(a: T): T {
  return JSON.parse(JSON.stringify(a));
}
