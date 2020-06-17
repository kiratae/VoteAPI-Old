const config = require('../config/config.js')
// const mysql = require('mysql')
// const db = mysql.createConnection(config.mysql_connect)
const { Client } = require('pg');
const db = new Client(config.postgresql_connect);

var Cluster = {
    get_all: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `SELECT ct_id, ct_sequence, ct_name_th, ct_name_en, ct_img, ct_color_code, sys_id, sys_name_th, sys_name_en
                    FROM vt_cluster
                    LEFT JOIN vt_system_matching ON sm_ct_id = ct_id
                    LEFT JOIN vt_systems ON sm_sys_id = sys_id
                    ORDER BY ct_sequence ASC`;

        console.log(`Cluster -> call: get_all`);

        db.connect()
        db.query(sql)
            .then(result => {
                res.json({ status: 0, data: result.rows })
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => db.end())
    },
    get_all_dashboard: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `SELECT ct_id, ct_sequence, ct_name_th, ct_name_en, ct_img, ct_color_code, sys_id, sys_name_th, sys_name_en,
                    (
                        SELECT (
                                sc_money + IFNULL(
                                                    (SUM(se_values) ), 0
                                                )
                                ) AS total_money
                        FROM vt_score
                        LEFT JOIN vt_cluster ON sc_ct_id = ct_id
                        LEFT JOIN scrum_logs ON sl_ct_id = ct_id
                        LEFT JOIN scrum_events ON sl_se_id = se_id
                        WHERE sl_ct_id = ct.ct_id
                        GROUP BY sl_ct_id
                    ) AS total_money
                    FROM vt_cluster AS ct
                    LEFT JOIN vt_system_matching ON sm_ct_id = ct_id
                    LEFT JOIN vt_systems ON sm_sys_id = sys_id
                    LEFT JOIN vt_score ON sc_ct_id = ct_id
                    ORDER BY ct_sequence ASC`;

        console.log(`Cluster -> call: get_all_dashboard`);

        db.connect()
        db.query(sql)
            .then(result => {
                res.json({ status: 0, data: result.rows })
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => db.end())
    },
    get_all_leaderboard: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `SELECT ct_id, ct_sequence, ct_name_th, ct_name_en, ct_img, ct_color_code, sys_id, sys_name_th, sys_name_en,
                    (
                        SELECT (sc_money + IFNULL((SUM(se_values) ), 0)) AS total_money
                        FROM vt_score
                        LEFT JOIN vt_cluster ON sc_ct_id = ct_id
                        LEFT JOIN scrum_logs ON sl_ct_id = ct_id
                        LEFT JOIN scrum_events ON sl_se_id = se_id
                        WHERE sl_ct_id = ct.ct_id
                        GROUP BY sl_ct_id
                    ) AS total_money
                    FROM vt_cluster AS ct
                    LEFT JOIN vt_system_matching ON sm_ct_id = ct_id
                    LEFT JOIN vt_systems ON sm_sys_id = sys_id
                    LEFT JOIN vt_score ON sc_ct_id = ct_id
                    ORDER BY total_money DESC`;

        console.log(`Cluster -> call: get_all_leaderboard`);

        db.connect()
        db.query(sql)
            .then(result => {
                res.json({ status: 0, data: result.rows })
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => db.end())
    }
}


module.exports.Cluster = Cluster