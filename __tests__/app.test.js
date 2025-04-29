const request = require("supertest");
const app = require("../app");
const endpoints = require("../endpoints.json");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = mongoose.model("User");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
});

jest.mock("../middleware/jwtAuth", () => (request, response, next) => next());

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
    test("400: Responds with bad request when a username already exists", async () => {
      await User.create({
        username: "grumpycat",
        password: "Goodbye01",
        email: "original@gmail.com",
      });

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
          expect(body.message).toBe("Username already exists");
        });
    });

    test("400: Responds with bad request when an email already exists", async () => {
      await User.create({
        username: "originaluser",
        password: "Nature1234",
        email: "jess@gmail.com",
      });

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
          expect(body.message).toBe("Email already exists");
        });
    });
  });

  describe("GET", () => {
    test("200: Responds with the user object when the username exists", async () => {
      const testUser = await User.create({
        username: "katie07",
        password: "password123",
        email: "katiep@gmail.com",
      });

      return request(app)
        .get(`/api/users/katie07`)
        .expect(200)
        .then(({ body }) => {
          expect(body.user).toMatchObject({
            username: "katie07",
            email: "katiep@gmail.com",
          });
        });
    });

    test("404: Responds with 'User not found' when the username does not exist", () => {
      return request(app)
        .get("/api/users/nonexistentuser")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("User not found");
        });
    });
  });

  describe("DELETE", () => {
    test("200: Successfully deletes a user", async () => {
      const testUser = await User.create({
        username: "userToDelete",
        password: "password123",
        email: "delete@test.com",
      });

      return request(app)
        .delete(`/api/users/id/${testUser._id}`)
        .expect(200)
        .then((response) => {
          expect(response.body.message).toBe("User successfully deleted");
        });
    });

    test("404: Responds with 'User not found' when the given user id doesn't exist", () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      return request(app)
        .delete(`/api/users/id/${nonExistentId}`)
        .expect(404)
        .then((response) => {
          expect(response.body.message).toBe("user does not exist");
        });
    });

    test("400: Responds with bad request when given an invalid user id", () => {
      return request(app)
        .delete("/api/users/id/not-a-valid-id")
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe("Invalid ID format");
        });
    });
  });

  describe("POST api/itinerary (Guest User)", () => {
    it("should generate an itinerary for a guest user", async () => {
      const mockAnswers = {
        interests: "Beaches",
        cuisine: "Local Cuisine",
        vibe: "Relaxed",
        nature: "Waterfalls",
        travelStyle: "Solo Adventures",
        tripLength: "5 days",
      };

      const response = await request(app)
        .post("/api/itinerary")
        .send({ isGuest: true, answers: mockAnswers })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("userId", "guest");
      expect(response.body).toHaveProperty("result");
      expect(response.body.result).toBeInstanceOf(Object);
    });

    it("should return 400 if answers are missing", async () => {
      const response = await request(app)
        .post("/api/itinerary")
        .send({ isGuest: true })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "answers are required and userId is required for non-guest users",
      );
    });
  });
});
