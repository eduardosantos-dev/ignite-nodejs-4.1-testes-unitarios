import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show user profile", () => {
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show an user's profile", async () => {
    const userData: ICreateUserDTO = {
      name: "test user",
      email: "test@example.com",
      password: "test",
    };

    const user = await inMemoryUsersRepository.create(userData);

    const userProfile = await showUserProfileUseCase.execute(user.id as string);

    expect(userProfile).toHaveProperty("id");
    expect(userProfile).toHaveProperty("name");
    expect(userProfile).toHaveProperty("email");
    expect(userProfile).toHaveProperty("password");
  });

  it("should not be able to show an nonexistent user's profile", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("nonexistent_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
