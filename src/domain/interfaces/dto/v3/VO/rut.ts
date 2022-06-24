import rutjs from 'rut.js';
import { shallowEqual } from 'shallow-equal-object';

export class Rut {
  public number: number;
  public dv: string;

  private constructor(number: number, dv: string) {
    this.number = number;
    this.dv = dv;
  }

  public static create(number: number, dv: string): Rut {
    if (!rutjs.validate(number + dv)) {
      throw new Error('Invalid RUT');
    } else {
      return new Rut(number, dv);
    }
  }

  get clean(): string {
    return rutjs.clean(this.number + this.dv);
  }

  get format(): string {
    return rutjs.format(this.number + this.dv);
  }

  public equals(rut: Rut): boolean {
    if (rut === null || rut === undefined) {
      return false;
    }
    if (rut.number === undefined || rut.dv === undefined) {
      return false;
    }
    return shallowEqual(this.clean, rut.clean);
  }
}
