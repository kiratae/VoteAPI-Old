const config = require('../config/config.js')
// const mysql = require('mysql')
// const client = mysql.createConnection(config.mysql_connect)
const { Client } = require('pg');

const name = "Users";

var Users = {
    get_all: (req, res) => {
        //grab the site section from the req variable (/strains/)
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `SELECT us_id, us_username, ut_name_th, ut_name_en,
                        COALESCE(
                            um_points - (
                                SELECT COALESCE(SUM(vl_points), 0)
                                FROM vt_voting_logs
                                WHERE vl_us_id = us.us_id
                                GROUP BY vl_us_id
                            ), um_points) AS um_points
                    FROM vt_users us
                    LEFT JOIN vt_user_point_matching ON um_us_id = us_id
                    LEFT JOIN vt_user_type ON us_ut_id = ut_id`;

        console.log(`Users -> call: get_all`);

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

    },
    check_login: async (req, res) => {

        //grab the site section from the req variable (/strains/)
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `SELECT us_id, ut_name_th, ut_name_en, CASE WHEN COUNT(us_id) = 1 THEN true ELSE false END AS can_login
            FROM vt_users
            LEFT JOIN vt_user_type ON ut_id = us_ut_id
            WHERE us_username = $1 AND us_password = $2
            GROUP BY us_id, ut_name_th, ut_name_en`;

        let us_username = req.body.us_username;
        let us_password = req.body.us_password;
        let data = [us_username, us_password];

        if (!us_username || !us_password) res.end();

        console.log(`Users -> call: check_login [us_username = ${us_username}]`);

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
    get_logs: (req, res) => {

        //grab the site section from the req variable (/strains/)
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `SELECT vl_id, ct_id, vl_us_id, ct_name_th, ct_name_en, vl_timestamp, SUM(vl_points) AS voted_score
                    FROM vt_voting_logs
                    LEFT JOIN vt_cluster ON vl_ct_id = ct_id
                    WHERE vl_us_id = $1
                    GROUP BY vl_id, ct_id, vl_us_id, ct_name_th, ct_name_en, vl_timestamp`;

        let us_id = req.params.us_id;
        let data = [us_id];

        if (!us_id) res.end();

        console.log(`Users -> call: get_logs [us_id = ${us_id}]`);

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
    }
}

module.exports.Users = Users