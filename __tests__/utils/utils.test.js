const { checkUserExists } = require("../../utils")
const db = require("../../db/connection")

describe("Check user exists", () => {
    test("Resolves to an object", () => {
        const username = "grumpycat"
        const email = "hellonature@gmail.com"
        return checkUserExists(username, email).then((result) => {
            expect(typeof result).toBe("object")
        });
    })
    test("Resolves to an object of {username: true} when a username already exists", () => {
        const username = "grumpycat"
        const email = "grumpycat099@gmail.com"
        return checkUserExists(username, email).then((result) => {
            expect(result).toEqual({ username: true });
        });
    });
    test("Resolves to an object of {email: true} when an email already exists", () => {
        const username = "nature01"
        const email = "katiep@gmail.com"
        return checkUserExists(username, email).then((result) => {
            expect(result).toEqual({ email: true });
        });
    });
    test("Resolves to an object of {username: true, email: true} when a username and email already exists", () => {
        const username = "katie07"
        const email = "katiep@gmail.com"
        return checkUserExists(username, email).then((result) => {
            expect(result).toEqual({ username: true, email: true });
        });
    });
    test("Resolves to an empty object when the username and email doesn't already exist", () => {
        const username = "katie00"
        const email = "katiep08@gmail.com"
        return checkUserExists(username, email).then((result) => {
            expect(result).toEqual({});
        });
    });
});

