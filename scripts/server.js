// the server to handle in-line localization in lua abilities
// thanks to valve for removing io module in lua

const packageJson = require('../package.json');
const mainLang = packageJson.dota_developer.main_lang;
const fs = require('fs-extra');
const keyvalues = require('keyvalues-node');

const langPath = `localization/${mainLang}`;
if (!fs.existsSync(langPath)) {
    console.log(`creating localization directory for developer language ${mainLang}`);
    fs.mkdirSync(langPath);
}

const runserver = () => {
    // start a http server for valve engine
    const port = 62323;

    var express = require('express');
    var bodyParser = require('body-parser');
    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.post('/Localization', function (req, res) {
        const data = JSON.parse(req.body.data);

        const localPath = `${langPath}/inline_localization.txt`;
        if (!fs.existsSync(localPath)) {
            fs.createFileSync(localPath);
        }

        const kv = keyvalues.decode(fs.readFileSync(localPath, 'utf-8') ?? '') ?? {};

        Object.keys(data)
            .sort()
            .forEach((key) => (kv[key] = data[key]));
        // save it
        fs.writeFileSync(localPath, `// Auto-generated by x-template localization, edit will be overwrite!\r\n` + keyvalues.encode(kv));
        res.send('done!');
    });

    const server = app.listen(port, '0.0.0.0', () => {
        console.log('the x-template nodejs dev server is now running on port:', port);
    });
};

(async () => {
    runserver();
})().catch((error) => {
    console.error(error);
    process.exit(1);
});