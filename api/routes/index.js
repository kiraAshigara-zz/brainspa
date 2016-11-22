var express = require('express');
var util = require('util');
var security = require('../security/basic_auth');
var dbconnection = require('../dbconnection');
var router = express.Router();


router.get('/', security.auth, function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/list-tables', security.auth, function (req, res, next) {
    var connection = dbconnection.getConnection();
    var query = 'show tables like \'%LUP%\'';
    connection.query(query, function (err, rows, fields) {
        if (err) throw err;
        var tableNames = [];
        for (var i in rows) {
            var val = rows[i]['Tables_in_brainspa (%LUP%)'];
            tableNames.push(val);
        }
        res.json(tableNames);
    });
    connection.end();
});


router.get('/list-tables/:tableName', security.auth, function (req, res, next) {
    var connection = dbconnection.getConnection();
    var tableName = req.params["tableName"];
    var query = util.format("DESCRIBE %s", tableName);
    connection.query(query, function (err, rows, fields) {
        if (err) return next(err);
        var result = {
            "table_name": tableName,
            "fields": []
        };
        for (var i in rows) {
            var field = rows[i]['Field'];
            var type = rows[i]['Type'];
            var nullable = rows[i]['Null'];
            var key = rows[i]['Key'];
            result.fields.push({
                "field": field,
                "type": type,
                "nullable": nullable,
                "key": key
            });
        }
        res.json(result);
    });
    connection.end();
});

module.exports = router;