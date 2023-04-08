var express = require('express');
var router = express.Router();
var fs = require("fs")
const axios = require('axios');


/* Проверка на бота */
router.use(express.json());
router.post('/audit', async(req, res) => {
    const { url } = req.body; // Получение ссылки из тела запроса
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

            res.json("Это Бот!");

        } else {

            res.json("Это не Бот!");
        }


        // Отправка ответа с данными, полученными по ссылке
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при запросе данных по указанной ссылке' });
    }
});

/* Проверка на бота */

// отправка данных на AppsFlyer

router.post('/events', (req, res) => {
    const yard = req.query;

    const config = {
        method: 'POST',
        url: `https://api2.appsflyer.com/inappevent/${yard.APP_BUNDLE}`,
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authentication: yard.DevKey
        },
        data: yard
    };

    axios(config)
        .then(response => {
            res.send(response.data);

            if (response.data == "ok") {
                console.log("Data transferred successfully, Данные переданы успешно");
            } else {
                console.log(yard.APP_BUNDLE);
            }
        })
        .catch(error => {
            console.error(error);
        });
});

// Запуск сервера

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;