const {
    BUCKET_UNCOMPRESSED = 'uncompressed-images-demo',
    BUCKET_COMPRESSED = 'compressed-images-demo',
    PROJECT_ID = 'guetzli-179112',
    SUBSCRIPTION = 'new-image-sub',
    PUBLISH_TOPIC = 'compressed-image',
} = process.env;

module.exports = {
    bucket: {
        uncompressed: BUCKET_UNCOMPRESSED,
        compressed: BUCKET_COMPRESSED,
    },
    project: {
        id: PROJECT_ID,
    },
    pubsub: {
        publish: {
            topic: PUBLISH_TOPIC,
        },
        subscription: {
            topic: SUBSCRIPTION
        }
    }
};
