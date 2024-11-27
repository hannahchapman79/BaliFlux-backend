const db = require("../connection")
const format = require("pg-format")

const seed = ( { } ) => {
    return (
        db 
        // clear tables
        .query("DROP TABLE IF EXISTS users")
        .then(() => {
            return createUsers();
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


module.exports = seed;