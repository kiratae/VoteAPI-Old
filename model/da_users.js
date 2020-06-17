const config = require('../config/config.js')
// const mysql = require('mysql')
// const db = mysql.createConnection(config.mysql_connect)
const { Client } = require('pg');
const db = new Client(config.postgresql_connect);

var Users = {
    insert: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `INSERT INTO vt_users (us_username, us_password, us_ut_id) VALUES ($1, $2, $3) RETURNING us_id`;

        let us_username = req.body.us_username;
        let us_password = req.body.us_password;
        let us_ut_id = req.body.us_ut_id;
        let data = [us_username, us_password, us_ut_id];

        console.log(`Users -> call: insert [us_username = ${us_username}]`);

        db.connect()
        db.query(sql, data)
            .then(result => {
                // get inserted id
                console.log(`us_id: ${result.rows[0].us_id}`)

                //sql
                let sql = `INSERT INTO vt_user_point_matching (um_us_id, um_points) VALUES ($1, $2) RETURNING um_id`;

                let um_us_id = results.rows[0].us_id;
                let um_points = req.body.um_points;
                let data = [um_us_id, um_points];

                console.log(`Users -> call: insert [um_points = ${um_points}]`);

                db.query(sql, data)
                    .then(result => {
                        // get inserted id
                        console.log(`um_id: ${result.rows[0].um_id}`)
                        res.json({ "um_id": result.rows[0].um_id })
                    })
                    .catch(e => {
                        console.error(e.stack)
                        res.json({ error: e })
                    })
                    .then(() => db.end())

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
        let sql = `SELECT us_id, us_username, us_lastlogin,
                        COALESCE(
                            um_points - (
                                SELECT COALESCE(SUM(vl_points), 0)
                                FROM vt_voting_logs
                                WHERE vl_us_id = us.us_id
                                GROUP BY vl_us_id
                            ), um_points) AS um_points
                    FROM vt_users us
                    LEFT JOIN vt_user_point_matching um ON um_us_id = us_id
                    WHERE us_id = $1`;

        let us_id = req.params.us_id;
        // let us_id = 1;
        let data = [us_id]

        if (!us_id) res.end();

        console.log(`Users -> call: get_by_key [ us_id = ${us_id} ]`);

        db.connect()
        db.query(sql, data)
            .then(result => {
                res.json({ status: 1, data: result.rows })
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e })
            })
            .then(() => db.end())
    },
    can_vote: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `SELECT IF(IFNULL(um_points, (um_points - (SELECT SUM(vl_points) FROM vt_voting_logs WHERE vl_us_id = us.us_id GROUP BY vl_us_id))) - ? >= 0, true, false) AS can_vote
                    FROM vt_users us
                    LEFT JOIN vt_user_point_matching ON um_us_id = us_id
                    WHERE us_id = $1`;

        let us_id = req.body.us_id;
        let sc_score = req.body.sc_score;
        let data = [sc_score, us_id]

        if (!us_id) res.end();

        console.log(`Users -> call: can_vote [ us_id = ${us_id} ]`);

        db.connect()
        db.query(sql, dat)
            .then(result => res.json(result.rows[0]))
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e })
            })
            .then(() => db.end())
    },
    update_login: (req, res) => {
        //sql
        let sql = `UPDATE vt_users SET us_lastlogin = CURRENT_TIMESTAMP WHERE us_id = $1`;

        let us_id = req.body.us_id;
        let data = [us_id]

        if (!us_id) res.end();

        console.log(`Users -> call: update_login [us_id = ${us_id}]`);

        db.connect()
        db.query(sql, data)
            .then(result => {
                res.end()
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e })
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
        let sql = `DELETE FROM vt_users WHERE us_id = $1`;

        let us_id = req.params.us_id;
        let data = [us_id]

        if (!us_id) res.end();

        console.log(`Users -> call: delete [us_id = ${us_id}]`);

        db.connect()
        db.query(sql, data)
            .then(result => {

                //sql
                let sql = `DELETE FROM vt_user_point_matching WHERE um_us_id = $1`;

                let um_us_id = req.params.us_id;
                let data = [um_us_id]

                db.query(sql, data)
                    .then(result => {
                        res.end()
                    })
                    .catch(e => {
                        console.error(e.stack)
                        res.json({ error: e })
                    })
                    .then(() => db.end())

            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e })
            })
            .then(() => db.end())
    },
}

module.exports.Users = Users