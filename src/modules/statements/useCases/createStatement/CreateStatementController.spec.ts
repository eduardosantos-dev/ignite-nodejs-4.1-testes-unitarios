import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";
import { OperationType } from "./OperationTypeEnum";

let connection: Connection;
let token: string;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("test", 8);

    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at)
      VALUES('${id}', 'test', 'test@fin_api.com.br', '${password}', 'now()')
      `);

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@fin_api.com.br",
      password: "test",
    });

    token = responseToken.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new deposit statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit test" })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("amount");
    expect(response.body.amount).toBe(100);
    expect(response.body.description).toBe("deposit test");
    expect(response.body.type).toBe(OperationType.DEPOSIT);
  });

  it("should be able to create a new deposit statement while unauthenticated", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit test" });

    expect(response.status).toBe(401);
  });

  it("should be able to create a new withdraw statement", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit test" });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 100, description: "withdraw test" })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("amount");
    expect(response.body.amount).toBe(100);
    expect(response.body.description).toBe("withdraw test");
    expect(response.body.type).toBe(OperationType.WITHDRAW);
  });

  it("should not be able to create a new withdraw statement while unauthenticated", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 100, description: "withdraw test" });

    expect(response.status).toBe(401);
  });

  it("should not be able to create a new withdraw statement with insufficient funds", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit test" });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 200, description: "withdraw test" })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });
});
