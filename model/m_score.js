const config = require('../config/config.js')
// const mysql = require('mysql')
// const client = mysql.createConnection(config.mysql_connect)
const { Client } = require('pg');

var Score = {
    get_score: (req, res)=>{
        //grab the site section from the req variable (/strains/)
        //console.log(req) to see all the goodies
        let pathname = req._parsedUrl.pathname.split('/');
        //split makes an array, so pick the second row
        let section = pathname[1];

        //sql
        let sql =  `SELECT ct_name_th, ct_color_code, ct_img, SUM(vl_points) as sc_score
                    FROM vt_cluster
                    LEFT JOIN vt_voting_logs ON vl_ct_id = ct_id
                    GROUP BY ct_id
                    ORDER BY ct_sequence`;

        console.log(`Score(vt_voting_logs) -> call: get_score`);

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
            .finally(() => client.end())

    }
}

module.exports.Score = Score