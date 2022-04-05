import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";

describe("Get Statement Operation Controller", () => {
  let connection: Connection;
  let token: string;
  let statementId: string;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("test", 8);
    statementId = uuidV4();

    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at)
      VALUES('${id}', 'test', 'test@fin_api.com.br', '${password}', 'now()')
      `);

    await connection.query(`
      INSERT INTO STATEMENTS(id, user_id, description, amount, type, created_at)
      VALUES('${statementId}', '${id}', 'test statement', '100', 'deposit', 'now()')
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

  it("should be able to get a statement operation", async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
  });

  it("should not be able to get a statement operation while unauthenticated", async () => {
    const response = await request(app).get(
      `/api/v1/statements/${statementId}`
    );

    expect(response.status).toBe(401);
  });

  it("should not be able to get a nonexistent statement operation", async () => {
    statementId = "nonexistent_id";

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(500);
  });
});
