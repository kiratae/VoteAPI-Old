const mysql_connect = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vote_database'
}

if (process.env.DATABASE_URL) {
    // postgresql "heroku"
    exports.postgresql_connect = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
} else {
    // postgresql "local"
    exports.postgresql_connect = {
        connectionString: 'postgresql://user:pwd@localhost:5432/db_name'
    }
}

exports.SECRET = "MY_SECRET_KEY";

exports.mysql_connect = mysql_connect