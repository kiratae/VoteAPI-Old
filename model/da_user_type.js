const config = require('../config/config.js')
// const mysql = require('mysql')
// const db = mysql.createConnection(config.mysql_connect)
const { Client } = require('pg');
const db = new Client(config.postgresql_connect);

var UserType = {
    insert: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `INSERT INTO vt_user_type (ut_name_th, ut_name_en) VALUES ($1, $2) RETURNING ut_id`;

        let ut_name_th = req.body.ut_name_th;
        let ut_name_en = req.body.ut_name_en;
        let data = [ut_name_th, ut_name_en]

        console.log(`UserType -> call: insert [ut_name_th = ${ut_name_th}]`);

        db.connect()
        db.query(sql, data)
            .then(result => {
                // get inserted id
                console.log(`ut_id: ${result.rows[0].ut_id}\n`);

                res.json({ 'ut_id': result.rows[0].ut_id });
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => db.end())

    },
    update: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `UPDATE vt_user_type
                    SET ut_name_th = $1,
                        ut_name_en = $2
                    WHERE ut_id = $3`;

        let ut_id = req.body.ut_id;
        let ut_name_th = req.body.ut_name_th;
        let ut_name_en = req.body.ut_name_en;
        let data = [ut_name_th, ut_name_en, ut_id]

        if (!ut_id) res.end();

        console.log(`UserType -> call: update [ut_id = ${ut_id}]`);

        db.connect()
        db.query(sql, data)
            .then(result => {
                res.json({ 'status': true })
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => db.end())
            
    },
    get_by_key: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `SELECT *
                    FROM vt_user_type
                    WHERE ut_id = $1`;

        let ut_id = req.params.ut_id;
        let data = [ut_id]

        if (!ut_id) res.end();

        console.log(`UserType -> call: get_by_key [ ut_id = ${ut_id} ]`);

        db.connect()
        db.query(sql, data)
            .then(result => {
                res.json({ status: 0, data: result.rows })
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => db.end())

    },
    delete: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `DELETE FROM vt_user_type WHERE ut_id = $1`;

        let ut_id = req.params.ut_id;
        let data = [ut_id]

        if (!ut_id) res.end();

        console.log(`UserType -> call: delete -> [ut_id = ${ut_id}]`);

        db.connect()
        db.query(sql, data)
            .then(result => {
                res.end()
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => db.end())

    }
}

module.exports.UserType = UserType