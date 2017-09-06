const PubSub = require('@google-cloud/pubsub');
const Storage = require('@google-cloud/storage');

const compress = require('./src/compress');

const bucketName = 'uncompressed-images-demo';

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
        console.log(` [*] downloading ${name} ...`);

        await storage.bucket(bucketName).file(name).download(options);

        // Do not acknowledge the message before we know we got the file
        message.ack();

        console.log(` [*] compressing ${name} ...`);

        await compress(name);

        console.log(` [*] Compression finished ... waiting ...`);
    } catch (e) {
        console.error(' [!] ERROR \n', e);
    }
});
