#!/usr/bin/env node
//require dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000
const my_model = require('./model/my_model');
const config = require('./config/config');

// EXPRESS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

// client postgresql
var types = require('pg').types
types.setTypeParser(20, parseInt);
const { Client } = require('pg');

// JWT
// jwt middleware libs
const jwt = require("jwt-simple");
const passport = require("passport");
//ใช้ในการ decode jwt ออกมา
const ExtractJwt = require("passport-jwt").ExtractJwt;
//ใช้ในการประกาศ Strategy
const JwtStrategy = require("passport-jwt").Strategy;

//สร้าง Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader("Authorization"),
    secretOrKey: config.SECRET
};
const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {

    let sql = `SELECT us_id FROM vt_users WHERE us_username = $1`;
    let data = [payload.sub];

    const client = new Client(config.postgresql_connect);
    client.connect()
    client.query(sql, data)
        .then(result => {
            if (result.rows.length > 0) done(null, true);
            else done(null, false);
        })
        .catch(e => {
            console.error(e.stack)
            res.json({ error: e })
        })
        .finally(() => client.end())
});
//เสียบ Strategy เข้า Passport
passport.use(jwtAuth);

//ทำ Passport Middleware
const requireJWTAuth = passport.authenticate("jwt", { session: false });

//ทำ Middleware สำหรับขอ JWT
const loginMiddleWare = (req, res, next) => {

    let sql = ` SELECT us_id, ut_name_th, ut_name_en
                FROM vt_users
                LEFT JOIN vt_user_type ON ut_id = us_ut_id
                WHERE us_username = $1 AND us_password = $2`;
    let us_username = req.body.us_username;
    let us_password = req.body.us_password;
    let data = [us_username, us_password];

    if (!us_username || !us_password) res.end();

    console.log(`JWT -> call: loginMiddleWare [us_username = ${us_username}]`);
    
    const client = new Client(config.postgresql_connect);
    client.connect()
    client.query(sql, data)
        .then(result => {
            if (result.rows.length > 0) {
                res.locals.user = result.rows[0]
                next()
            }
            else res.json({ status: 1 })
        })
        .catch(e => {
            console.error(e.stack)
            res.json({ error: e.stack })
        })
        .finally(() => client.end())
};
// END JWT

// CORS
var corsOptions = {
    origin: ["https://bearhunt-vote.herokuapp.com", /localhost/, /bearhunt-vote.herokuapp.com/],
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}
app.use(cors(corsOptions))
// END CORS

//start Express server on defined port
app.listen(PORT);

//define a route, usually this would be a bunch of routes imported from another file
app.get('/', function (req, res, next) {
    res.send('Welcome to the BearHunt, Inc. API');
});

//log to console to let us know it's working
console.log('BearHunt, Inc. API server started on: ' + PORT);

app.post('/users/login', loginMiddleWare, (req, res) => {
    const payload = {
        sub: res.locals.user.us_username,
        iat: new Date().getTime()
    };
    res.json({ status: 0, user: res.locals.user, token: jwt.encode(payload, config.SECRET) })
})
app.post('/users/check', my_model.da_users.Users.can_vote)
app.put('/users/logged_in', my_model.da_users.Users.update_login)
app.get('/users/logs/:us_id', my_model.m_users.Users.get_logs)

app.get('/users', my_model.m_users.Users.get_all)
app.get('/users/:us_id', my_model.da_users.Users.get_by_key)
app.post('/users', my_model.da_users.Users.insert)
app.delete('/users/:us_id', my_model.da_users.Users.delete)

app.get('/user_type', my_model.m_user_type.UserType.get_all)
app.get('/user_type/:ut_id', my_model.da_user_type.UserType.get_by_key)
app.post('/user_type', my_model.da_user_type.UserType.insert)
app.put('/user_type', my_model.da_user_type.UserType.update)
app.delete('/user_type/:ut_id', my_model.da_user_type.UserType.delete)

app.get('/cluster', my_model.m_cluster.Cluster.get_all)
app.get('/cluster/dashboard', my_model.m_cluster.Cluster.get_all_dashboard) // get $E 
app.get('/cluster/leaderboard', my_model.m_cluster.Cluster.get_all_leaderboard)

app.get('/cluster/:ct_id', my_model.da_cluster.Cluster.get_by_key)
app.post('/cluster', my_model.da_cluster.Cluster.insert)
app.put('/cluster', my_model.da_cluster.Cluster.update)
app.delete('/cluster/:ct_id', my_model.da_cluster.Cluster.delete)

app.get('/systems', my_model.m_systems.Systems.get_all)
app.post('/systems', my_model.da_systems.Systems.insert)
app.put('/systems', my_model.da_systems.Systems.update)
app.delete('/systems/:sys_id', my_model.da_systems.Systems.delete)

// app.post('/add_score' , my_model.da_score.Score.update)
// app.post('/minus_score' , my_model.da_user_point_matching.UserPointMatching.vote)
app.post('/log', my_model.da_voting_logs.VotingLogs.insert)

app.post('/restore_um', my_model.da_user_point_matching.UserPointMatching.restore)
app.post('/restore_sc', my_model.da_score.Score.restore)
app.post('/restore_vl', my_model.da_voting_logs.VotingLogs.delete)


app.get('/score', my_model.m_score.Score.get_score)
app.put('/score', my_model.da_user_point_matching.UserPointMatching.update)
app.get('/resetScore', my_model.da_score.Score.reset_all)

app.get('/vote_time', my_model.m_vote_time.VoteTime.get_all)
app.put('/vote_time', my_model.da_vote_time.VoteTime.update)

// ------------- START scrum -------------------------

app.post('/scrum/all_money', my_model.m_log.Log.get_all_by_cluster)
app.get('/scrum/all_money_now', my_model.m_log.Log.get_all_by_cluster_now)
app.get('/scrum/all_income_money_now', my_model.m_log.Log.get_all_income_by_cluster_now)
app.get('/scrum/all_outcome_money_now', my_model.m_log.Log.get_all_outcome_by_cluster_now)
app.post('/scrum/find_event', my_model.m_event.Event.get_find_by_name)
app.post('/scrum/history', my_model.m_event.Event.get_event_log)

app.get('/scrum/logs', my_model.m_log.Log.get_all)
app.post('/scrum/logs', my_model.da_log.Log.insert)

app.get('/scrum/events', my_model.m_event.Event.get_all)
app.get('/scrum/events/:se_id', my_model.da_event.Event.get_by_key)
app.post('/scrum/events', my_model.da_event.Event.insert)
app.put('/scrum/events', my_model.da_event.Event.update)


// ------------- END scrum ---------------------------

app.get("/timesync", (req, res) => {

    //sql
    let sql = `SELECT NOW() AS now`;

    console.log(`timesync -> call now`)

    const client = new Client(config.postgresql_connect);
    client.connect()
    client.query(sql)
        .then(result => {
            res.json(result.rows)
        })
        .catch(e => {
            console.error(e.stack)
            res.json({ error: e.stack })
        })
        .finally(() => client.end())

});