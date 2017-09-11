const fs = require('fs');
const PubSub = require('@google-cloud/pubsub');
const Storage = require('@google-cloud/storage');

const compress = require('./src/compress');

const {
    DOWNLOAD_BUCKET = 'uncompressed-images-demo',
    UPLOAD_BUCKET = 'compressed-images-demo',
    PROJECT_ID = 'guetzli-179112',
    SUBSCRIPTION = 'new-image-sub',
    PUBLISH_TOPIC = 'compressed-image',
} = process.env;

const storage = Storage();

const pubsub = PubSub({ projectId: PROJECT_ID });

const subscribe = pubsub.subscription(SUBSCRIPTION);

const publisher = pubsub.topic(PUBLISH_TOPIC).publisher();

async function message(msg) {
    const res = JSON.parse(msg.data.toString('utf8'));

    const { name } = res;

    const options = {
        destination: `uncompressed/${name}`
    };

    try {
        msg.ack();

        console.log(` [*] Downloading ${name} ...`);

        await storage.bucket(DOWNLOAD_BUCKET).file(name).download(options);

        console.log(` [*] Compressing ${name} ...`);

        await compress(name);

        console.log(` [*] Uploading file to bucket ...`);

        await storage.bucket(UPLOAD_BUCKET).upload(`compressed/${name}`);

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
