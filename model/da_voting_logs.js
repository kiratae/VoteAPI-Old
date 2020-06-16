const config = require('../config/config.js');
// const mysql = require('mysql');
// const md5 = require('md5');
// const db = mysql.createConnection(config.mysql_connect);
const { Client } = require('pg');
const db = new Client(config.postgresql_connect);
db.connect();

var VotingLogs = {
    insert: (req, res) => {
        //check Hash
        // if(md5("l3ear@Hunt;") == req.body.hash){
            //sql
            let sql = `SELECT IF(COALESCE((um_points - (SELECT SUM(vl_points) FROM vt_voting_logs WHERE vl_us_id = us.us_id GROUP BY vl_us_id)), um_points) - $1 >= 0, true, false) AS can_vote
                        FROM vt_users us
                        LEFT JOIN vt_user_point_matching ON um_us_id = us_id
                        WHERE us_id = $2`;

            let us_id = req.body.us_id;
            let sc_score = req.body.sc_score;
            let data = [ sc_score, us_id ];

            //query the DB using prepared statement
            db.query(sql, data, function(err, results){
                //if error, print error results
                if (err) {
                    console.log(err);
                    res.json({"error": err});
                }

                if(results.rows[0].can_vote){

                    let sql = `INSERT INTO vt_voting_logs (vl_us_id, vl_ct_id, vl_points) VALUES ($1, $2, $3) RETURNING vl_id`;

                    let us_id = req.body.us_id;
                    let sc_score = req.body.sc_score;
                    let sc_ct_id = req.body.ct_id;
                    let data = [ us_id, sc_ct_id, sc_score ]

                    console.log(`VotingLogs -> call: insert [us_id = ${us_id}]`);

                    //query the DB using prepared statement
                    db.query(sql, data, function(err, vl_results){
                        //if error, print error results
                        if (err) {
                            console.log(err);
                            res.json({"error": err});
                        }

                        res.json({"status": 0, "vl_id": vl_results.rows[0].vl_id});
                        
                    });

                }else{
                    res.json({"status": 1});
                }
            });
        // }else{
        //     res.end();
        // }
        
    },
    get_by_key: (req, res) => {
        // to do get_by_key from db
    },
    update: (req, res) => {
        // to do update in db
    },
    delete: (req, res) => {
        //sql
        let sql = `DELETE FROM vt_voting_logs WHERE vl_id = $1`;

        let vl_id = req.body.vl_id;
        let data = [ vl_id ]

        console.log(`VotingLogs -> call: delete [vl_id = ${vl_id}]`);

        //query the DB using prepared statement
        db.query(sql, data, function(err, results){
            //if error, print error results
            if (err) {
                console.log(err);
                res.json({"error": err});
            }

            res.json({"status": true});
        });
    },
}

module.exports.VotingLogs = VotingLogs