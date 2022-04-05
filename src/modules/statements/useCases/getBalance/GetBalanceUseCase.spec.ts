import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("Get Balance", () => {
  let getBalanceUseCase: GetBalanceUseCase;
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get the balance of an user", async () => {
    const userData: ICreateUserDTO = {
      name: "test user",
      email: "test@example.com",
      password: "test",
    };

    const user = await inMemoryUsersRepository.create(userData);

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(response).toHaveProperty("balance");
    expect(response).toHaveProperty("statement");
  });

  it("should not be able to get the balance of an nonexistent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "nonexistent_id",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
