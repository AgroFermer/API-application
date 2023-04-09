var express = require('express');
var router = express.Router();
var fs = require("fs")
const axios = require('axios');
const bodyParser = require('body-parser');

/* Проверка на бота */
router.use(express.json());
router.use(bodyParser.text());

router.post('/audit', async(req, res) => {
    console.log(req.body)
    const decode = atob(req.body); // декодируем полученый текст 

    const about = JSON.parse(decode) // превращаем даный текст в json объект

    const { url } = about; // Получение ссылки из тела запроса
    console.log(url)
    const ip = req.ip; // Получение IP запроса 

    let botCount = 0;
    let ips = {};

    try {
        const response = await axios.get(url); // Отправка GET-запроса по указанной ссылке
        const data = response.data; // сохраняем ответ в переменную

        if (data == "Bot") {
            const fileContent = fs.readFileSync('ips.json', 'utf8');

            if (fileContent) {
                ips = JSON.parse(fileContent)
            }

            botCount++;

            // Создаем ключ для текущего IP-адреса вида Bot_1, Bot_2 и т.д.
            ips[`Bot_${botCount}`] = ip;

            // Сохраняем массив с IP-адресами в файле
            fs.writeFileSync('ips.json', JSON.stringify(ips), 'utf8');
            console.log("Bot")
            res.json("Bot");

        } else {
            console.log("Non-Bot")
            res.json("Non-Bot");
        }


        // Отправка ответа с данными, полученными по ссылке
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: 'Ошибка при запросе данных по указанной ссылке' });
    }
});

/* Проверка на бота */

// отправка данных на AppsFlyer

router.post('/events', async(req, res) => {
    try {
        const yard = req.query;

        const response = await axios({
            method: 'post',
            url: `https://api2.appsflyer.com/inappevent/${yard.bundle}`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authentication: yard.DevKey
            },
            data: yard
        });
        res.send(response.data);

        if (response.data === 'ok') {
            console.log(yard);
            console.log('Data transferred successfully, Данные переданы успешно');
        }
    } catch (error) {
        res.send(error.response.statusText)
            //console.error(error);
        console.log(error.response.statusText);
        console.log(error.data);

    }
});

// Запуск сервера

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
