export interface IPrescription {
  beneficiary: IBeneficiary;
  requestNumber: number;
  name: string;
  issueDate: Date;
  comment: string;
  endDate: Date;
  status?: string;
}

interface IBeneficiary {
  correlative: number;
  rut: number;
  dv: string;
  name: string;
  relacion: string;
}
