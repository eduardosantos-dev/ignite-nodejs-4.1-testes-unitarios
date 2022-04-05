import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

describe("Create an User", () => {
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const userData: ICreateUserDTO = {
      name: "test user",
      email: "test@example.com",
      password: "test",
    };

    const user = await createUserUseCase.execute(userData);

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("password");
  });

  it("should not be able to create a new user with existent email", async () => {
    expect(async () => {
      const userData: ICreateUserDTO = {
        name: "test user",
        email: "test@example.com",
        password: "test",
      };

      await createUserUseCase.execute(userData);
      await createUserUseCase.execute(userData);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
