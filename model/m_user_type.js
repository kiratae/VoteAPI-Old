const config = require('../config/config.js')
// const mysql = require('mysql')
// const client = mysql.createConnection(config.mysql_connect)
const { Client } = require('pg');

var UserType = {
    get_all: function(req, res){
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql =  `SELECT * FROM vt_user_type`;

        console.log(`UserType -> call: get_all *`);

        const client = new Client(config.postgresql_connect);
        client.connect()
        client.query(sql)
            .then(result => {
                res.json({ status: 0, data: result.rows })
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => client.end())
    }
}

module.exports.UserType = UserType