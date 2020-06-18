const config = require('../config/config.js')
// const mysql = require('mysql')
// const client = mysql.createConnection(config.mysql_connect)
const { Client } = require('pg');

var VoteTime = {
    update: (req, res) => {
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql = `UPDATE vt_vote_time
                    SET vt_start_vote = $1,
                        vt_end_vote = $2
                    WHERE vt_id = 1`;

        let vt_start_vote = req.body.vt_start_vote;
        let vt_end_vote = req.body.vt_end_vote;
        let data = [ vt_start_vote, vt_end_vote ]

        console.log(`VoteTime -> call: update [vt_vote_time]`);

        const client = new Client(config.postgresql_connect);
        client.connect()
        client.query(sql, data)
        .then(result => {
            res.json({ status: 1, data: result.rows })
        })
        .catch(e => {
            console.error(e.stack)
            res.json({ error: e })
        })
        .then(() => client.end())
    }
}

module.exports.VoteTime = VoteTime