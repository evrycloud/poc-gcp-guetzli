const fs = require('fs');
const config = require('config');
const PubSub = require('@google-cloud/pubsub');
const Storage = require('@google-cloud/storage');

const compress = require('./src/compress');

const storage = Storage();

const pubsub = PubSub({ projectId: config.get('project.id') });

const subscribe = pubsub.subscription(config.get('pubsub.subscription.topic'));

const publisher = pubsub.topic(config.get('pubsub.publish.topic')).publisher();

async function message(msg) {
    const res = JSON.parse(msg.data.toString('utf8'));

    const { name } = res;

    const options = {
        destination: `uncompressed/${name}`
    };

    try {
        msg.ack();

        await publisher.publish(new Buffer(JSON.stringify({
            name,
            status: 'compressing'
        })));

        console.log(` [*] Downloading ${name} ...`);

        await storage.bucket(config.get('bucket.uncompressed')).file(name).download(options);

        console.log(` [*] Compressing ${name} ...`);

        await compress(name);

        console.log(` [*] Uploading file to bucket ...`);

        await storage.bucket(config.get('bucket.compressed')).upload(`compressed/${name}`);

        console.log(` [*] Clean up ...`);

        fs.unlink(`uncompressed/${name}`, () => {});
        fs.unlink(`compressed/${name}`, () => {});

        await publisher.publish(new Buffer(JSON.stringify({
            name,
            status: 'finished'
        })));

        console.log(` [*] Finished ... waiting for next image ...`);
    } catch (err) {
        await publisher.publish(new Buffer(JSON.stringify({
            name,
            status: 'failed'
        })));

        console.error(' [!] ERROR \n', err);
    }
}

subscribe.on('message', message);
