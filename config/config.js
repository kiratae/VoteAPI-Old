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
        connectionString: 'postgresql://Kiratae:1150@localhost:5432/vote_db'
        
    }
}

exports.mysql_connect = mysql_connect