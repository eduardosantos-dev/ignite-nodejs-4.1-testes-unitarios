import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { OperationType } from "../createStatement/OperationTypeEnum";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

describe("Create Transfer", () => {
  let createTransferUseCase: CreateTransferUseCase;
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let user1: User;
  let user2: User;

  beforeEach(async () => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createTransferUseCase = new CreateTransferUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    user1 = await inMemoryUsersRepository.create({
      name: "test user",
      email: "test@example.com",
      password: "test",
    });

    user2 = await inMemoryUsersRepository.create({
      name: "test user 2",
      email: "test2@example.com",
      password: "test2",
    });

    await inMemoryStatementsRepository.create({
      user_id: user1.id as string,
      amount: 100,
      description: "test deposit",
      type: OperationType.DEPOSIT,
    });
  });

  it("should be able to make a transfer between accounts", async () => {
    const response = await createTransferUseCase.execute({
      user_id: user2.id as string,
      sender_id: user1.id as string,
      amount: 100,
      description: "test transfer",
      type: OperationType.TRANSFER,
    });

    const user1Balance = await inMemoryStatementsRepository.getUserBalance({
      user_id: user1.id as string,
      with_statement: true,
    });

    const user2Balance = await inMemoryStatementsRepository.getUserBalance({
      user_id: user2.id as string,
      with_statement: true,
    });

    expect(response).toHaveProperty("id");
    expect(response).toHaveProperty("user_id");
    expect(response).toHaveProperty("sender_id");
    expect(response).toHaveProperty("type");
    expect(response).toHaveProperty("amount");
    expect(response).toHaveProperty("description");
    expect(response.amount).toBe(100);
    expect(response.type).toBe(OperationType.TRANSFER);

    expect(user2Balance.balance).toBe(100);
    expect(user1Balance.balance).toBe(0);
  });

  it("should not be possible to transfer amounts greater than what is available in an account balance", async () => {
    await expect(
      createTransferUseCase.execute({
        user_id: user2.id as string,
        sender_id: user1.id as string,
        amount: 200,
        description: "test transfer",
        type: OperationType.TRANSFER,
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });
});
