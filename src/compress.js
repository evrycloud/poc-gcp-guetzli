const { spawn } = require('child_process');

function compress(image) {
    const output = ['compressed/', image].join('');
    const input = ['uncompressed/', image].join('');

    const guetzli = spawn('guetzli', ['--quality', 85, input, output]);

    return new Promise((resolve, reject) => {
        guetzli.stdout.on('data', data => console.log(data.toString('utf8')));

        guetzli.stderr.on('data', data => reject(data.toString('utf8')));

        guetzli.on('close', exitCode => resolve(exitCode === 0 ? output : ''));
    });

}

module.exports = compress;
