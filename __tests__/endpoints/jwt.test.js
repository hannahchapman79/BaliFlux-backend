const request = require("supertest");
const jwt = require("jsonwebtoken");
const db = require("../../db/connection")
const seed = require("../../db/seeds/seed")
const data = require("../../db/data")
const app = require("../../app")

beforeEach(() => seed(data));

afterAll(() => db.end());

describe("/api/users", () => {
    describe("DELETE", () => {
        test("responds with 200 status, validates JWT, and deletes the user by user id", () => {
            const validToken = jwt.sign(
                { user_id: 1, username: "testuser", email: "ilovetravel@gmail.com" },
                process.env.JWT_SECRET,
                { expiresIn: "15 min" }
            );
            return request(app)
                .delete("/api/users/1")
                .set("Authorization", `${validToken}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.message).toEqual("User successfully deleted");
                });
        });
    })
})

describe("/api/login", () => {
    describe("POST", () => {
        test("200: Logs in a user with valid credentials and returns a JWT", async () => {
            const userSignup = {
                username: "orangecat",
                password: "football000",
                email: "orangecat@gmail.com",
            };
            const loginDetails = {
                email: "orangecat@gmail.com",
                password: "football000",
            };

            await request(app)
                .post("/api/users")
                .send(userSignup)
                .expect(201)
                .then(({ body }) => {
                    const { user } = body;
                    expect(user).toHaveProperty("username", "orangecat");
                    expect(user).toHaveProperty("email", "orangecat@gmail.com");
                    expect(user).not.toHaveProperty("password");
                });

            return request(app)
                .post("/api/users/login")
                .send(loginDetails)
                .expect(200)
                .then(({ body }) => {
                    const { token, user } = body;
                    expect(user).toHaveProperty("username", "orangecat");
                    expect(user).toHaveProperty("email", "orangecat@gmail.com");
                    expect(user).not.toHaveProperty("password");

                    expect(token).toBeDefined();

                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    expect(decoded).toMatchObject({
                        user_id: expect.any(Number),
                        username: "orangecat",
                        email: "orangecat@gmail.com",
                    });

                    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
                });
        });
        test("400: Returns error if email or password are incorrect", async () => {
            const loginDetails = {
                email: "nonexistentuser@gmail.com",
                password: "wrongpassword",
            };

            return request(app)
                .post("/api/users/login")
                .send(loginDetails)
                .expect(400)
                .then(({ body }) => {
                    expect(body.message).toEqual("Bad email or password");
                });
        });
    });
});