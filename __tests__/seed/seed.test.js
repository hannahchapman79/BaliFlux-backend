const db = require("../../db/connection");
const seed = require("../../db/seeds/seed");
const data = require("../../db/data");

beforeAll(() => seed(data));

afterAll(() => db.end());

describe("seed", () => {
  describe("users table", () => {
    test("users table exists", () => {
      return db
        .query(
          `SELECT EXISTS (SELECT FROM
        information_schema.tables
        WHERE
        table_name = 'users')`
        )
        .then(({ rows: [{ exists }] }) => {
          expect(exists).toBe(true);
        });
    });
  test("users table has a unique primary key", () => {
    return db 
    .query(
        `SELECT column_name, data_type, column_default
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'user_id';`
    )
    .then(({ rows: [column] }) => {
        expect(column.column_name).toBe("user_id");
        expect(column.data_type).toBe("integer");
        expect(column.column_default).toBe(
          "nextval('users_user_id_seq'::regclass)"
        );
      });
  })
  test("users table has correct columns and test data", () => {
    return db.query(`SELECT * FROM users`).then(({ rows: users }) => {
      expect(users).toHaveLength(5);
      users.forEach((user) => {
        expect(user).toHaveProperty("user_id");
        expect(user).toHaveProperty("username");
        expect(user).toHaveProperty("password");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("created_date");
      });
    });
  });
})
})