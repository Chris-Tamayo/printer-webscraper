const cheerio = require('cheerio');
const { contains } = require('cheerio/lib/static');
const request = require('request');

const colorPrinters = [
    'http://172.18.12.130/', 
    'http://172.18.13.133/', 
    'http://172.18.14.20/', 
    'http://172.18.15.129/',
    'http://172.18.15.131/'
];

var colorPrinterLocations = [];
var colorPrinterStatus = [];
var colorPrinterLinks = [];
var colorErrorList = [];

function getColorPrinters() {
    colorPrinterLocations = [];
    colorPrinterStatus = [];
    colorPrinterLinks = [];
    colorErrorList = [];
    colorPrinters.forEach((printer) => {
        let printerLocation = 'Nothing';
        let printerError = '';
        // Request printer location
        request(`${printer}`, (error, response, html) => {
            if (!error && response.statusCode == 200) {
                let containsError = false;
                const $ = cheerio.load(html);
                printerLocation = $('.printerlocation').text().replace(/\s\s+/g, '').replace('Location: ', '');
                // request happens async, so need console.log inside

                // Request Status Lines
                request(`${printer}webglue/isw/status`, (error, response, html) => {
                    if (!error && response.statusCode == 200) {
                        let statusLine = '';
                        const data = JSON.parse(response.body);
                        // printerError = data[0].IrTitle; // TODO: What if there's more than one error?? 'type': 'warning' for error printers
                        //console.log(printerLocation);
                        data.forEach((line) => {
                            statusLine = statusLine + '<li>' + line.IrTitle + '</li>';
                            if (line.type == "warning" || line.type == "ir") {
                                containsError = true;
                            }
                        })
                        //console.log(statusLine);
                        //console.log(containsError ? "Red" : "Green");
                        //console.log();
                        colorPrinterLocations.push(printerLocation);
                        colorPrinterStatus.push(statusLine);
                        colorPrinterLinks.push(printer);
                        colorErrorList.push(containsError ? true : false);
                    }
                })
            }
        });

        // NOTE: Tray empty for color printers has type: warning in variables
        // NOTE: type: status if status line is not an error
    });
}

const bwPrinters = [
    'http://172.18.12.129/',
    'http://172.18.13.135/',
    'http://172.18.13.130/',
    'http://172.18.13.134/',
    'http://172.18.13.156/',
    'http://172.18.14.128/',
    'http://172.18.14.130/',
    'http://172.18.14.129/',
    'http://172.18.15.133/',
    'http://172.18.15.134/'
];

var bwPrinterLocations = [];
var bwPrinterStatus = [];
var bwPrinterLinks = [];
var bwErrorList = [];

function getBwPrinters() {
    bwPrinterLocations = [];
    bwPrinterStatus = [];
    bwPrinterLinks = [];
    bwErrorList = [];

    bwPrinters.forEach((printer) => {
        let printerLocation = '';
        let statusLine = '';

        // Request printer location
        request(`${printer}cgi-bin/dynamic/topbar.html`, (error, response, html) => {
            if (!error && response.statusCode == 200) {
                let containsError = false;
                const $ = cheerio.load(html);
                printerLocation = $('b').last().text().replace(/\s\s+/g, '').replace('Location: ', '');
                // console.log(printerLocation);

                request(`${printer}cgi-bin/dynamic/printer/PrinterStatus.html`, (error, response, html) => {
                    if (!error && response.statusCode == 200) {
                        const $ = cheerio.load(html);
                        let currentLine = '';
                        $('.statusLine').each((i, element) => {
                            currentLine = $(element).text().replace(/\s\s+/g, '');
                            if (currentLine != "Sleep Mode" && currentLine != "" && currentLine != "Ready" && currentLine != "Busy") {
                                containsError = true;
                            }

                            if (currentLine != "") {
                                statusLine = statusLine + '<li>' + currentLine + '</li>';
                            }
                        })
                        // console.log(containsError ? "Red" : "Green");
                        // console.log(printerLocation);
                        // console.log(statusLine);

                        bwPrinterLocations.push(printerLocation);
                        bwPrinterStatus.push(statusLine);
                        bwPrinterLinks.push(printer);
                        bwErrorList.push(containsError ? true : false);
                    }
                })
            }
        })
        // NOTE: Error message for Change tray 1 to recycled executive is bgcolor = #FF3333
        // NOTE: Error for tray empty is bgcolor = #FFFF66 (yellow)
    });
}

const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

getColorPrinters();
getBwPrinters();

setInterval(function() {
    getColorPrinters();
    getBwPrinters();
}, 30000);

app.get('/', async function(req, res, next) { 
    console.log("Get Request");
    fs.readFile(path.join(__dirname, 'public\\index.html'), 'utf8', function (err,data) {
        if (err) {
            console.log(err);
            return console.log(err);
        }
        var $ = cheerio.load(data);
        for (var i = 0; i < colorPrinters.length; i++) {
            $('#color-container').append(`
            <a class="link" href="${colorPrinterLinks[i]}" target="_blank">
                <div class="printer-container ${colorErrorList[i] ? 'printer-error': 'printer-success'}">
                    <span class="location">${colorPrinterLocations[i]}</span>
                    <ul class="">
                        ${colorPrinterStatus[i]}
                    </ul>
                </div>
            </a>
    `       )
        }

        for (var i = 0; i < bwPrinters.length; i++) {
            $('#bw-container').append(`
            <a class="link" href="${bwPrinterLinks[i]}" target="_blank">
                <div class="printer-container ${bwErrorList[i] ? 'printer-error': 'printer-success'}">
                    <span class="location">${bwPrinterLocations[i]}</span>
                    <ul class="">
                        ${bwPrinterStatus[i]}
                    </ul>
                </div>
            </a>
    `       )
        }
        res.send($.html());
        console.log("Request Complete");
    });
});
app.use(express.static(path.join(__dirname, 'public')));

app.listen(8080, () => console.log("Server up!"));