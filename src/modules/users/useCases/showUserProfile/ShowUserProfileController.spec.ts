import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";
import { ShowUserProfileError } from "./ShowUserProfileError";

let connection: Connection;
let token: string;

describe("Show User Profile Controller", () => {
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

  it("should be able to show user profile", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toEqual("test@fin_api.com.br");
  });

  it("should not be able to to show an unauthenticated user's profile", async () => {
    const response = await request(app).get("/api/v1/profile");

    expect(response.status).toBe(401);
  });
});
