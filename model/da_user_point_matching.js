const config = require('../config/config.js');
// const mysql = require('mysql');
// const my_model = require('./my_model');
// const client = mysql.createConnection(config.mysql_connect);
const { Client } = require('pg');

var UserPointMatching = {
    insert: (req, res) => {
        // to do insert to client
    },
    get_by_key: (req, res) => {
        // to do get_by_key from client
    },
    update: (req, res) => {
        //sql
        let sql = `UPDATE vt_user_point_matching SET um_points = $1 WHERE um_us_id = $2`;

        let us_id = req.body.us_id;
        let sc_score = req.body.sc_score;
        let data = [sc_score, us_id]

        if (!us_id) res.end();

        console.log(`UserPointMatching -> call: update [us_id = ${us_id}]`);
        const client = new Client(config.postgresql_connect);
        client.connect()
        client.query(sql, data)
            .then(result => {
                res.end()
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => client.end())
    },
    // vote: (req, res) => {
    //     //check Hash
    //     let us_id = req.body.us_id;
    //     let data = [us_id]

    //     let sql = `SELECT um_points FROM vt_user_point_matching WHERE um_us_id = $1`;

    //     client.connect()
    //     client.query(sql, data, function (err, results) {
    //         //if error, print error results
    //         if (err) {
    //             console.log(err);
    //             res.json({ "error": err });
    //         }

    //         let hasPoint = results.rows[0].um_points;
    //         console.log(hasPoint);

    //         let scoreToVote = req.body.sc_score;

    //         if (hasPoint - scoreToVote >= 0) {
    //             //sql
    //             let sql = `UPDATE vt_user_point_matching SET um_points = um_points - $1 WHERE um_us_id = $2`;

    //             let us_id = req.body.us_id;
    //             let sc_score = req.body.sc_score;
    //             let data = [sc_score, us_id]

    //             if (!us_id) res.end();

    //             console.log(`UserPointMatching -> call: vote [us_id = ${us_id}]`);

    //             client.query(sql, data, function (err) {
    //                 client.end()
    //                 //if error, print error results
    //                 if (err) {
    //                     console.log(err);
    //                     res.json({ "error": err });
    //                 }

    //                 // my_model.da_voting_logs.VotingLogs.insert(req, res);

    //                 res.json({ "status": true });
    //             });
    //         } else {
    //             res.json({ "status": false });
    //         }

    //     });

    // },
    restore: (req, res) => {
        //sql
        let sql = `UPDATE vt_user_point_matching SET um_points = um_points + $1 WHERE um_us_id = $2`;

        let us_id = req.body.us_id;
        let sc_score = req.body.sc_score;
        let data = [sc_score, us_id];

        console.log(`UserPointMatching -> call: restore [us_id = ${us_id}, sc_score = ${sc_score}]`);
        const client = new Client(config.postgresql_connect);
        client.connect()
        client.query(sql, data)
            .then(result => {
                res.json({ status: true });
            })
            .catch(e => {
                console.error(e.stack)
                res.json({ error: e.stack })
            })
            .then(() => client.end())

    },
    delete: (req, res) => {
        // to do delete from client
    },
}

module.exports.UserPointMatching = UserPointMatching