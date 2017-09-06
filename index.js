const PubSub = require('@google-cloud/pubsub');
const Storage = require('@google-cloud/storage');

const compress = require('./src/compress');

const downloadBucket = 'uncompressed-images-demo';

const uploadBucket = 'compressed-images-demo';

const storage = Storage();

const pubsub = PubSub({ projectId: 'guetzli-179112' });

const sub = pubsub.subscription('new-image-sub');

sub.on('message', async message => {
    const res = JSON.parse(message.data.toString('utf8'));

    const { name } = res;

    const options = {
        destination: `uncompressed/${name}`
    };

    try {
        console.log(` [*] Downloading ${name} ...`);

        await storage.bucket(downloadBucket).file(name).download(options);

        // Do not acknowledge the message before we know we got the file
        message.ack();

        console.log(` [*] Compressing ${name} ...`);

        await compress(name);

        console.log(` [*] Uploading file to bucket ...`);

        await storage.bucket(uploadBucket).upload(`compressed/${name}`);

        console.log(` [*] Finished ... waiting for next image ...`);
    } catch (e) {
        console.error(' [!] ERROR \n', e);
    }
});
