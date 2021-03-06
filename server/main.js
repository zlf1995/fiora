const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = require('./app');
const config = require('../config/server');
const checkVersion = require('../build/check-versions');

const Socket = require('./models/socket');
const Group = require('./models/group');
const getRandomAvatar = require('../utils/getRandomAvatar');

global.mdb = new Map(); // As a memory database
global.mdb.set('sealList', new Set()); // Set default seat user list

mongoose.Promise = Promise;
checkVersion(); // Check node and npm version

function createDirectory(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
}

mongoose.connect(config.database, async (err) => {
    if (err) {
        console.error('connect database error!');
        console.error(err);
        return process.exit(1);
    }

    // Determine if the default group exists. Create if it does not exist
    const group = await Group.findOne({ isDefault: true });
    if (!group) {
        const defaultGroup = await Group.create({
            name: 'fiora',
            avatar: getRandomAvatar(),
            announcement: '欢迎光临Fiora, 这是一个开源/自由的聊天室',
            isDefault: true,
        });
        if (!defaultGroup) {
            console.error('create default group fail');
            return process.exit(1);
        }
    }

    createDirectory(path.join(__dirname, '../public'));

    app.listen(config.port, async () => {
        await Socket.remove({});
        console.log(` >>> server listen on http://localhost:${config.port}`);
    });
});
