import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { OperationType } from "../createStatement/OperationTypeEnum";

interface IRequest {
  amount: number;
  description: string;
  sender_id: string;
  user_id: string;
  type: OperationType;
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ amount, description, sender_id, user_id, type }: IRequest) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });

    if (amount > balance) {
      throw new CreateStatementError.InsufficientFunds();
    }

    const transferOperation = await this.statementsRepository.create({
      sender_id,
      user_id,
      amount,
      description,
      type,
    });

    return transferOperation;
  }
}

export { CreateTransferUseCase };
