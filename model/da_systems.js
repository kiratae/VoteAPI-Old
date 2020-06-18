const config = require('../config/config.js')
// const mysql = require('mysql')
// const client = mysql.createConnection(config.mysql_connect)
const { Client } = require('pg');

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
        const client = new Client(config.postgresql_connect);
        client.connect()
        client.query(sql, data)
            .then(result => {
                // get inserted id
                console.log(`sys_id: ${result.rows[0].sys_id}\n`)
                res.json({ 'sys_id': result.rows[0].sys_id })
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => client.end())

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
        const client = new Client(config.postgresql_connect);
        client.connect()
        client.query(sql, data)
            .then(result => {
                res.json({ 'status': true })
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e })
            })
            .then(() => client.end())
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
        const client = new Client(config.postgresql_connect);
        client.connect()
        client.query(sql, data)
            .then(result => {
                res.json({ status: 0, data: result.rows })
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => client.end())
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
        const client = new Client(config.postgresql_connect);
        client.connect()
        client.query(sql, data)
            .then(result => {

                let sql = `DELETE FROM vt_systems WHERE sys_id = $1`;
                let sys_id = req.params.sys_id;
                let data = [sys_id]

                console.log(`Systems -> call: delete [sys_id = ${sys_id}]`);

                client.query(sql, data)
                    .then(result => {
                        res.end()
                    })
                    .catch(e => {
                        console.error(e.stack)
                        res.json({ error: e.stack })
                    })
                    .then(() => client.end())
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => client.end())
    },
}

module.exports.Systems = Systems