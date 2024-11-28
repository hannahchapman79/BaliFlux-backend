const request = require("supertest");
const db = require("../../db/connection")
const seed = require("../../db/seeds/seed")
const data = require("../../db/data")
const app = require("../../app")
const endpoints = require("../../endpoints.json")

beforeEach(() => seed(data));

afterAll(() => db.end());

describe("GET /api", () => {
    test("responds with a json detailing all available endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(body.endpoints).toEqual(endpoints);
        });
    });
  });

  describe("/api/users", () => {
    describe("POST", () => {
      test("201: Adds a user to the database", () => {
        const newUser = {
          username: "emilyy",
          password: "football02",
          email: "emilysmith@outlook.com",
        };
        return request(app)
          .post("/api/users")
          .send(newUser)
          .expect(201)
          .then(({ body }) => {
            const { user } = body;
            expect(Object.keys(user)).toHaveLength(3);
            expect(user.username).toBe("emilyy");
            expect(user.email).toBe("emilysmith@outlook.com");
          });
      });
      test("400: Responds with bad request when a username already exists", () => {
        const newUser = {
          username: "grumpycat",
          password: "Goodbye01",
          email: "grumpycat1@gmail.com",
        };
        return request(app)
          .post("/api/users")
          .send(newUser)
          .expect(400)
          .then(({ body }) => {
            const { message } = body;
            expect(message).toBe("Username already exists");
          });
      });
      test("400: Responds with bad request when an email already exists", () => {
        const newUser = {
          username: "katie09",
          password: "Nature1234",
          email: "jess@gmail.com",
        };
        return request(app)
          .post("/api/users")
          .send(newUser)
          .expect(400)
          .then(({ body }) => {
            const { message } = body;
            expect(message).toBe("Email already exists");
          });
      });
      test("400: Responds with bad request when the username and password already exists", () => {
        const newUser = {
          username: "travelforever",
          password: "travelforever",
          email: "jess@gmail.com",
        };
        return request(app)
          .post("/api/users")
          .send(newUser)
          .expect(400)
          .then(({ body }) => {
            const { message } = body;
            expect(message).toBe("User already exists");
          });
      });
      test("400: Responds with bad request when required fields are missing", () => {
        const newUser = {
          username: "wildlife9",
        };
        return request(app)
          .post("/api/users")
          .send(newUser)
          .expect(400)
          .then(({ body }) => {
            const { message } = body;
            expect(message).toBe(
              "All fields are required (username, password, email)"
            );
          });
      });
      test("400: Responds with bad request when email format is invalid", () => {
        const newUser = {
          username: "wildlife9",
          password: "Nature123",
          email: "invalid-email-format",
        };
        return request(app)
          .post("/api/users")
          .send(newUser)
          .expect(400)
          .then(({ body }) => {
            const { message } = body;
            expect(message).toBe("Invalid email format");
          });
      });
      test("400: Responds with bad request when password is too short", () => {
        const newUser = {
          username: "wildlife9",
          password: "123",
          email: "explorethewild@outlook.com",
        };
        return request(app)
          .post("/api/users")
          .send(newUser)
          .expect(400)
          .then(({ body }) => {
            const { message } = body;
            expect(message).toBe("Password must be at least 8 characters long");
          });
      });
    })
})