import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../createStatement/OperationTypeEnum";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get a statement operation", async () => {
    const userData: ICreateUserDTO = {
      name: "test user",
      email: "test@example.com",
      password: "test",
    };

    const user = await inMemoryUsersRepository.create(userData);

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      description: "test deposit",
      amount: 100,
      type: OperationType.DEPOSIT,
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(statementOperation).toHaveProperty("id");
  });

  it("should not be able to get a statement operation for a nonexistent user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "nonexistent_user_id",
        statement_id: "nonexistent_statement_id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a nonexistent statement operation", async () => {
    expect(async () => {
      const userData: ICreateUserDTO = {
        name: "test user",
        email: "test@example.com",
        password: "test",
      };

      const user = await inMemoryUsersRepository.create(userData);

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "nonexistent_statement_id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
