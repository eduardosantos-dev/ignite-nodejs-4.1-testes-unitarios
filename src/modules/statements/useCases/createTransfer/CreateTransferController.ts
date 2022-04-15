import { Request, Response } from "express";
import { container } from "tsyringe";
import { OperationType } from "../createStatement/OperationTypeEnum";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {
  async execute(request: Request, response: Response) {
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;
    const { user_id } = request.params;

    const createTransfer = container.resolve(CreateTransferUseCase);

    const transfer = await createTransfer.execute({
      amount,
      description,
      sender_id,
      user_id,
      type: OperationType.TRANSFER,
    });

    return response.status(201).json(transfer);
  }
}

export { CreateTransferController };
