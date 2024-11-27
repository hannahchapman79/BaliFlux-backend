const db = require("../connection")
const format = require("pg-format")

const seed = ( { users } ) => {
    return (
        db 
        // clear tables
        .query("DROP TABLE IF EXISTS users")
        // re-create tables
        .then(() => {
            return createUsers();
        })
        // populate tables
        .then(() => {
            return insertUsers(users)
        })
    )
}

function createUsers() {
	return db.query(`CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(40) NOT NULL,
        password VARCHAR(40) NOT NULL,
        email VARCHAR(100) NOT NULL
        )`);
}

function insertUsers(users) {
    const nestedUsers = users.map((user) => {
		return [user.username, user.password, user.email];
	});
	return db.query(
		format(
			`INSERT INTO users 
  (username, password, email)
  VALUES %L RETURNING *`,
			nestedUsers
		)
	);
}


module.exports = seed;