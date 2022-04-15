import { OperationType } from "./OperationTypeEnum";

export interface ICreateStatementDTO {
  user_id: string;
  sender_id?: string;
  amount: number;
  description: string;
  type: OperationType;
}
