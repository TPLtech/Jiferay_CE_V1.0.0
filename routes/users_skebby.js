var qs = require('querystring');
var https = require('https');
console.log('entrato in /routes/users_skebby');
var express = require('express');
var app = express.Router();

var send_sms_skebby = function(input, cb, cb_err) {
    var text = input.text;
    var sender_number = input.sender_number || "";
    var sender_string = input.sender_string || "";
    var method = input.method;
    var lrecipients = input.recipients || [];
    var username = input.username;
    var password = input.password;

    console.log("input.text=" + input.text +
        "\ninput.sender_number=" + input.sender_number +
        "\ninput.sender_string=" + input.sender_string +
        "\ninput.method=" + input.method +
        "\ninput.recipients=" + input.recipients +
        "\ninput.username=" + input.username +
        "\ninput.password=" + input.password
    );

    if (!method) {
        cb_err("No Method!");
        return;
    }

    switch (method) {
        case 'classic':
            method = 'send_sms_classic';
            break;
        case 'report':
            method = 'send_sms_classic_report';
            break;
        case 'basic':
        default:
            method = 'send_sms_basic';
    }

    var test = input.test || false;

    // Check params
    if (lrecipients.length == 0) {
        cb_err("No recipient!");
        return;
    }

    if (!sender_string && !sender_number) {
        cb_err("No sender!");
        return;
    }

    if (!text) {
        cb_err("No text!");
        return;
    }

    var params = {
        method: method,
        username: username,
        password: password,
        "recipients[]": lrecipients,
        text: text,
        charset: "UTF-8",
    };

    if (sender_number) {
        params.sender_number = sender_number;
    }
    else if (sender_string) {
        params.sender_string = sender_string;
    }

    if (test) {
        params.method = "test_" + params.method;
    }

    var res_done = false;
    var data = qs.stringify(params);
    console.log("data=" + data);
    var client = https.request({
        port: 443,
        path: "/api/send/smseasy/advanced/http.php?" + data,
        host: "gateway.skebby.it",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": data.length,
            "Content-Encoding": "utf8",
        }
    }, function(res) {
        var res_data = "";
        res.on('data', function(data) {
            res_data += data;
        });
        res.on("end", function() {
            if (!res_done) {
                var res_parsed = qs.parse(res_data);
                if (res_parsed.status == "success") {
                    cb({ data: res_parsed });
                }
                else {
                    console.log("res_parsed= ");
                    cb_err(res_parsed);

                }
                res_done = true;
            }
        });
    });

    client.end(data);
    client.on('error', function(e) {
        if (!res_done) {
            cb_err(e);
            res_done = true;
        }
    });
};



app.post('/sendSMS', function(req, res) {

    // SMS CLASSIC dispatch
    //basic
    send_sms_skebby({

        sender_number: "1234567890",
        sender_string: "Jiferay APP",
        method: "basic",
        username: "mail@mail.com",
        password: "password",
        recipients: ["0987654321"],
        text: "Test SMS",
    }, function(res) {
        console.log(res.data);
    }, function(err) {
        console.log(err);
    });




}); //app.post('/sendSMS'


module.exports = app;