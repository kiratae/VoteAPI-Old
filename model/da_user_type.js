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
        db.query(sql, data, function (err, results, fields) {
            db.end()
            if (err) {
                return console.error(err.message)
            }
            // get inserted id
            console.log(`ut_id: ${results.rows[0].ut_id}\n`);

            res.json({ 'ut_id': results.rows[0].ut_id });

        });

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
        db.query(sql, data, function (err, results, fields) {
            db.end()
            if (err) {
                return console.error(err.message)
            }

            res.json({ 'status': true })

        })
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
        db.query(sql, data, function (err, results, fields) {
            db.end()
            //if error, print blank results
            if (err) {
                // console.log(err);
                var apiResult = {};

                apiResult.meta = {
                    table: section,
                    type: "collection",
                    total: 0
                }
                //create an empty data table
                apiResult.data = [];

                //send the results (apiResult) as JSON to Express (res)
                //Express uses res.json() to send JSON to client
                //you will see res.send() used for HTML
                res.json(apiResult);

            }

            //make results 
            var resultJson = JSON.stringify(results.rows);
            resultJson = JSON.parse(resultJson);
            var apiResult = {}

            // create a meta table to help apps
            //do we have results? what section? etc
            apiResult.meta = {
                table: section,
                type: "collection",
                total: 1,
                total_entries: resultJson.length
            }

            //add our JSON results to the data table
            apiResult.data = resultJson;

            //send JSON to Express
            res.json(apiResult)
        })
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
        db.query(sql, data, function (err, results, fields) {
            db.end()
            if (err) {
                return console.error(err.message)
            }

            res.end();

        });

    }
}

module.exports.UserType = UserType