export interface Beneficiary {
  correlative: number;
  rut: number;
  dv: string;
  name: string;
  relacion: string;
}

export interface Prescription {
  beneficiary: Beneficiary;
  requestNumber: number;
  issueDate: Date;
  comments: string;
  endValidityDate: Date;
  name: string;
}

export interface PrescriptionResponse {
  prescriptions: Prescription[];
}
