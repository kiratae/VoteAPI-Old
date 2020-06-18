const config = require('../config/config.js');
// const mysql = require('mysql');
// const md5 = require('md5');
// const client = mysql.createConnection(config.mysql_connect);
const { Pool, Client } = require('pg');

var VotingLogs = {
    insert: (req, res) => {

        const pool = new Pool(config.postgresql_connect);
        pool.connect((err, client, done) => {
            const shouldAbort = err => {
                if (err) {
                    console.error('Error in transaction', err.stack)
                    client.query('ROLLBACK', err => {
                        if (err) {
                            console.error('Error rolling back client', err.stack)
                        }
                        // release the client back to the pool
                        done()
                    })
                }
                return !!err
            }

            client.query('BEGIN', err => {
                if (shouldAbort(err)) return

                const sql = `SELECT CASE 
                            WHEN COALESCE((um_points - (SELECT SUM(vl_points) FROM vt_voting_logs WHERE vl_us_id = us.us_id GROUP BY vl_us_id)), um_points) - $1 >= 0
                            THEN true ELSE false END
                            AS can_vote
                            FROM vt_users us
                            LEFT JOIN vt_user_point_matching ON um_us_id = us_id
                            WHERE us_id = $2`

                const us_id = req.body.us_id
                const sc_score = req.body.sc_score
                const data = [sc_score, us_id]

                client.query(sql, data, (err, result) => {
                    if (shouldAbort(err)) return

                    if (result.rows[0].can_vote) {

                        const sql = `INSERT INTO vt_voting_logs (vl_us_id, vl_ct_id, vl_points) VALUES ($1, $2, $3) RETURNING vl_id`;

                        const us_id = req.body.us_id;
                        const sc_score = req.body.sc_score;
                        const sc_ct_id = req.body.ct_id;
                        const data = [us_id, sc_ct_id, sc_score]

                        client.query(sql, data, (err, result) => {
                            if (shouldAbort(err)) return
    
                            res.json({ "status": 0, "vl_id": result.rows[0].vl_id })
    
                            client.query('COMIT', err => {
                                if (err) console.error('Error committing transaction', err.stack)
                                done()
                            })
    
                        })

                    } else {
                        res.json({ "status": 1 })
                    }

                })
            })
        })

    },
    get_by_key: (req, res) => {
        // to do get_by_key from client
    },
    update: (req, res) => {
        // to do update in client
    },
    delete: (req, res) => {
        //sql
        let sql = `DELETE FROM vt_voting_logs WHERE vl_id = $1`;

        let vl_id = req.body.vl_id;
        let data = [vl_id]

        console.log(`VotingLogs -> call: delete [vl_id = ${vl_id}]`);

        const client = new Client(config.postgresql_connect);
        client.connect()
        client.query(sql, data)
            .then(result => {
                res.json({ "status": true });
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => client.end())

    },
}

module.exports.VotingLogs = VotingLogs