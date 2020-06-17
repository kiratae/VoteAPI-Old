const config = require('../config/config.js')
    // const mysql = require('mysql')
    // const db = mysql.createConnection(config.mysql_connect)
const { Client } = require('pg');
const db = new Client(config.postgresql_connect);

var Systems = {
    insert: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `INSERT INTO vt_systems (sys_name_th, sys_name_en) VALUES ($1, $2) RETURNING sys_id`;

        let sys_name_th = req.body.sys_name_th;
        let sys_name_en = req.body.sys_name_en;
        let data = [sys_name_th, sys_name_en]

        console.log(`Systems -> call: insert [sys_name_th = ${sys_name_th}]`);

        db.connect()
            // db.query(sql, data, function(err, results, fields) {
            //     db.end()
            //     if (err) {
            //         return console.error(err.message)
            //     }
            //     // get inserted id
            //     console.log(`sys_id: ${results.rows[0].sys_id}\n`)
            //     res.json({ 'sys_id': results.rows[0].sys_id })
            // });

        db.query(sql, data)
            .then(result => {
                // get inserted id
                console.log(`sys_id: ${results.rows[0].sys_id}\n`)
                res.json({ 'sys_id': results.rows[0].sys_id })
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
        let sql = `UPDATE vt_systems
                    SET sys_name_th = $1,
                        sys_name_en = $2
                    WHERE sys_id = $3`;

        let sys_id = req.body.sys_id;
        let sys_name_th = req.body.sys_name_th;
        let sys_name_en = req.body.sys_name_en;
        let data = [sys_name_th, sys_name_en, sys_id]

        if (!sys_id) res.end();

        console.log(`Systems -> call: update [sys_id = ${sys_id}]`);

        db.connect()
            // db.query(sql, data, function(err, results, fields){
            //     db.end()
            //     if (err) {
            //         return console.error(err.message)
            //     }

        //     res.json({ 'status':true })

        // });

        db.query(sql, data)
            .then(result => {
                res.json({ 'status': true })
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e })
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
        let sql = `SELECT ct_id, ct_name_th, ct_name_en, ct_img, ct_color_code, sys_name_th, sys_name_en
                    FROM vt_cluster
                    LEFT JOIN vt_system_matching ON sm_ct_id = ct_id
                    LEFT JOIN vt_systems ON sm_sys_id = sys_id
                    WHERE ct_id = $1`;

        let ct_id = req.params.ct_id;
        let data = [ct_id]

        if (!ct_id) res.end();

        console.log(`Systems -> call: get_by_key [ ct_id = ${ct_id} ]`);

        db.connect()
            // db.query(sql, data, function(err, results, fields) {
            //     db.end()
            //         //if error, print blank results
            //     if (err) {
            //         // console.log(err);
            //         var apiResult = {};

        //         apiResult.meta = {
        //                 table: section,
        //                 type: "collection",
        //                 total: 0
        //             }
        //             //create an empty data table
        //         apiResult.data = [];

        //         //send the results (apiResult) as JSON to Express (res)
        //         //Express uses res.json() to send JSON to client
        //         //you will see res.send() used for HTML
        //         res.json(apiResult);

        //     }

        //     //make results 
        //     var resultJson = JSON.stringify(results.rows);
        //     resultJson = JSON.parse(resultJson);
        //     var apiResult = {}

        //     // create a meta table to help apps
        //     //do we have results? what section? etc
        //     apiResult.meta = {
        //         table: section,
        //         type: "collection",
        //         total: 1,
        //         total_entries: resultJson.length
        //     }

        //     //add our JSON results to the data table
        //     apiResult.data = resultJson;

        //     //send JSON to Express
        //     res.json(apiResult)
        // })

        db.query(sql, data)
            .then(result => {
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
        let sql = `DELETE FROM vt_system_matching WHERE sm_sys_id = $1`;
        let sm_sys_id = req.params.sys_id;
        let data = [sm_sys_id]

        if (!sys_id) res.end();

        console.log(`Systems -> call: delete [sm_sys_id = ${sm_sys_id}]`);

        db.connect()
        db.query(sql, data, function(err, results, fields) {
            if (err) {
                return console.error(err.message)
            }
            let sql = `DELETE FROM vt_systems WHERE sys_id = $1`;

            let sys_id = req.params.sys_id;
            let data = [sys_id]

            console.log(`Systems -> call: delete [sys_id = ${sys_id}]`);

            //query the DB using prepared statement
            // db.query(sql, data, function(err, results, fields) {
            //     db.end()
            //     if (err) {
            //         return console.error(err.message)
            //     }
            //     res.end()
            // })

            db.query(sql, data)
                .then(result => {
                    res.end()
                })
                .catch(e => {
                    console.error(e.stack)
                    res.json({ error: e.stack })
                })
                .then(() => db.end())
        })
    },
}

module.exports.Systems = Systems