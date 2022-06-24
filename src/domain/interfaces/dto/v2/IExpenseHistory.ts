export interface IExpenseHistoryDTO {
  requestNumber: number;
  beneficiaryName: string;
  beneficiaryRut: string;
  payAmount: number;
  payDate: Date;
  reportDate: Date;
  status: string;
}
