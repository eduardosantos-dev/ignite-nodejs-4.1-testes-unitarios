import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;
describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create an user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "test name",
      email: "test@fin_api.com.br",
      password: "test",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create an user with existent email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test name",
      email: "test@fin_api.com.br",
      password: "test",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "test name",
      email: "test@fin_api.com.br",
      password: "test",
    });

    expect(response.status).toBe(400);
  });
});
