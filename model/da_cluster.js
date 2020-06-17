const config = require('../config/config.js')
    // const mysql = require('mysql')
    // const db = mysql.createConnection(config.mysql_connect)
const { Client } = require('pg');

var Cluster = {
    insert: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `INSERT INTO vt_cluster (ct_sequence, ct_name_th, ct_name_en, ct_img, ct_color_code) VALUES ($1, $2, $3, $4, $5) RETURNING ct_id`;

        let ct_sequence = req.body.ct_sequence;
        let ct_name_th = req.body.ct_name_th;
        let ct_name_en = req.body.ct_name_en;
        let ct_img = req.body.ct_img;
        let ct_color_code = req.body.ct_color_code;
        let data = [ct_sequence, ct_name_th, ct_name_en, ct_img, ct_color_code]

        console.log(`Cluster -> call: insert [ct_name_th = ${ct_name_th}]`);

        //query the DB using prepared statement
        const db = new Client(config.postgresql_connect);
        db.connect()
        db.query(sql, data, function(err, results, fields) {
            if (err) {
                return console.error(err.message)
            }
            // get inserted id
            console.log(`ct_id: ${results.rows[0].ct_id}`)

            let sql = `INSERT INTO vt_system_matching (sm_ct_id, sm_sys_id) VALUES ($1, $2) RETURNING sm_id`;

            let sm_ct_id = results.rows[0].ct_id;
            let sm_sys_id = req.body.sm_sys_id;
            let data = [sm_ct_id, sm_sys_id]

            // db.query(sql, data, function(err, results, fields) {
            //     db.end()
            //     if (err) {
            //         return console.error(err.message)
            //     }
            //     let sm_id = results.rows[0].sm_id;
            //     console.log(`sm_id: ${sm_id}`)
            //     res.json({ 'sc_id': null, 'sm_ct_id': sm_ct_id, 'sm_id': sm_id })
            // });
            const db = new Client(config.postgresql_connect);
            db.query(sql, data)
                .then(result => {
                    let sm_id = results.rows[0].sm_id;
                    console.log(`sm_id: ${sm_id}`)
                    res.json({ 'sc_id': null, 'sm_ct_id': sm_ct_id, 'sm_id': sm_id })
                })
                .catch(e => {
                    console.error(e.stack)
                    res.json({ error: e.stack })
                })
                .then(() => db.end())

        });

    },
    update: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `UPDATE vt_cluster
                    SET ct_sequence = $1,
                        ct_name_th = $2,
                        ct_name_en = $3,
                        ct_img = $4,
                        ct_color_code = $5
                    WHERE ct_id = $6`;

        let ct_id = req.body.ct_id;
        let ct_sequence = req.body.ct_sequence;
        let ct_name_th = req.body.ct_name_th;
        let ct_name_en = req.body.ct_name_en;
        let ct_img = req.body.ct_img;
        let ct_color_code = req.body.ct_color_code;
        let data = [ct_sequence, ct_name_th, ct_name_en, ct_img, ct_color_code, ct_id]

        if (!ct_id) res.end();

        console.log(`Cluster -> call: update [ct_id = ${ct_id}]`);
        const db = new Client(config.postgresql_connect);
        db.connect()
            // db.query(sql, data, function(err, results, fields) {
            //     if (err) {
            //         return console.error(err.message)
            //     }

        //     let sql = `UPDATE vt_system_matching SET sm_sys_id = $1 WHERE sm_ct_id = $2`;
        //     let sm_ct_id = ct_id;
        //     let sm_sys_id = req.body.sm_sys_id;
        //     let data = [sm_sys_id, sm_ct_id]

        //     db.query(sql, data, function(err, results, fields) {
        //         db.end()
        //         if (err) {
        //             return console.error(err.message)
        //         }
        //         res.json({ 'status': true })
        //     });

        // })


        db.query(sql, data)
            .then(results => {
                let sql = `UPDATE vt_system_matching SET sm_sys_id = $1 WHERE sm_ct_id = $2`;
                let sm_ct_id = ct_id;
                let sm_sys_id = req.body.sm_sys_id;
                let data = [sm_sys_id, sm_ct_id]

                db.query(sql, data)
                    .then(result => {
                        res.json({ 'status': true })
                    })
                    .catch(e => {
                        console.error(e.stack)
                        res.json({ error: e.stack })
                    })
                    .then(() => db.end())
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
        let sql = `SELECT ct_id, ct_name_th, ct_name_en, ct_img, ct_color_code, sys_name_th, sys_name_en
                    FROM vt_cluster
                    LEFT JOIN vt_system_matching ON sm_ct_id = ct_id
                    LEFT JOIN vt_systems ON sm_sys_id = sys_id
                    WHERE ct_id = $1`;

        let ct_id = req.params.ct_id;
        let data = [ct_id]

        if (!ct_id) res.end();

        console.log(`Cluster -> call: get_by_key [ ct_id = ${ct_id} ]`);
        const db = new Client(config.postgresql_connect);
        db.connect()
        db.query(sql, data, function(err, results, fields) {
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

        db.query(sql, data)
            .then(result => {

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
        let sql = `DELETE FROM vt_system_matching WHERE sm_ct_id = $1`;

        let sm_ct_id = req.params.ct_id;
        let data = [sm_ct_id]

        if (!sm_ct_id) res.end();

        console.log(`Cluster -> call: delete vt_system_matching [sm_ct_id = ${sm_ct_id}]`);
        const db = new Client(config.postgresql_connect);
        db.connect()
            // db.query(sql, data, function(err, results, fields) {
            //     db.end()
            //     if (err) {
            //         return console.error(err.message)
            //     }

        //     let sql = `DELETE FROM vt_cluster WHERE ct_id = $1`;

        //     let ct_id = req.params.ct_id;
        //     let data = [ct_id]

        //     console.log(`call: delete vt_cluster [ct_id = ${ct_id}]`);

        //     //query the DB using prepared statement
        //     db.query(sql, data, function(err, results, fields) {
        //         if (err) {
        //             return console.error(err.message)
        //         }
        //         res.end()
        //     });
        // });

        db.query(sql, data)
            .then(result => {

                let sql = `DELETE FROM vt_cluster WHERE ct_id = $1`;
                let ct_id = req.params.ct_id;
                let data = [ct_id]
                console.log(`call: delete vt_cluster [ct_id = ${ct_id}]`);

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
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => db.end())

    },
}

module.exports.Cluster = Cluster