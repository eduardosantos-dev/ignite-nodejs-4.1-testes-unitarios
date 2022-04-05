import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from "./OperationTypeEnum";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create a deposit statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to make a deposit", async () => {
    const userData: ICreateUserDTO = {
      name: "test user",
      email: "test@example.com",
      password: "test",
    };

    const user = await inMemoryUsersRepository.create(userData);

    const response = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test deposit",
    });

    expect(response).toHaveProperty("id");
    expect(response).toHaveProperty("user_id");
    expect(response).toHaveProperty("type");
    expect(response).toHaveProperty("amount");
    expect(response).toHaveProperty("description");
    expect(response.amount).toBe(100);
    expect(response.type).toBe(OperationType.DEPOSIT);
  });

  it("should not be able to make a deposit for a nonexistent user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "nonexistent_id",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Test deposit",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});

describe("Create a withdraw statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to make a withdraw", async () => {
    const userData: ICreateUserDTO = {
      name: "test user",
      email: "test@example.com",
      password: "test",
    };

    const user = await inMemoryUsersRepository.create(userData);

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      description: "test deposit",
      amount: 100,
      type: OperationType.DEPOSIT,
    });

    const response = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Test withdraw",
    });

    expect(response).toHaveProperty("id");
    expect(response).toHaveProperty("user_id");
    expect(response).toHaveProperty("type");
    expect(response).toHaveProperty("amount");
    expect(response).toHaveProperty("description");
    expect(response.amount).toBe(100);
    expect(response.type).toBe(OperationType.WITHDRAW);
  });

  it("should not be able to make a withdraw with invalid amount", async () => {
    const userData: ICreateUserDTO = {
      name: "test user",
      email: "test@example.com",
      password: "test",
    };

    const user = await inMemoryUsersRepository.create(userData);

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      description: "test deposit",
      amount: 100,
      type: OperationType.DEPOSIT,
    });

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 200,
        description: "Test withdraw",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to make a withdraw for a nonexistent user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "nonexistent_id",
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "Test withdraw",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
