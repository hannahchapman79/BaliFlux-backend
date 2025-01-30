const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require("../app")
const { User } = require("../models/users.model");

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

describe("/api/users/id", () => {
    describe("DELETE", () => {
        test("200: Validates JWT, and deletes the user by user id", async () => {
            const user = new User({
                username: "testuser",
                email: "ilovetravel@gmail.com",
                password: "hashedpassword123"
            });
            const savedUser = await user.save();
            
            const validToken = jwt.sign(
                { 
                    user_id: savedUser._id, 
                    username: "testuser", 
                    email: "ilovetravel@gmail.com" 
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15 min" }
            );

            return request(app)
                .delete(`/api/users/id/${savedUser._id}`)
                .set("Authorization", `Bearer ${validToken}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.message).toEqual("User successfully deleted");
                });
        });
    });
});

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
                    expect(user).toHaveProperty("user_id"); 
                });

            return request(app)
                .post("/api/users/login")
                .send(loginDetails)
                .expect(200)
                .then(({ body }) => {
                    const { accessToken, user } = body;
                    expect(user).toHaveProperty("username", "orangecat");
                    expect(user).toHaveProperty("email", "orangecat@gmail.com");
                    expect(user).not.toHaveProperty("password");
                    expect(user).toHaveProperty("user_id");

                    expect(accessToken).toBeDefined();

                    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
                    expect(decoded).toMatchObject({
                        username: "orangecat",
                        email: "orangecat@gmail.com"
                    });
                    expect(decoded).toHaveProperty("user_id"); 

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