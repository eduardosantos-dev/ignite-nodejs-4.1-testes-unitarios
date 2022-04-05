import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;
describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("test", 8);

    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at)
      VALUES('${id}', 'test', 'test@fin_api.com.br', '${password}', 'now()')
      `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@fin_api.com.br",
      password: "test",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
  });

  it("should not be able to authenticate user with incorrect credentials", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@fin_api.com.br",
      password: "incorrect_password",
    });

    expect(response.status).toBe(401);
  });
});
