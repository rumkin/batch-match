const bm = require('../');

bm.search(process.argv[2])
.then(files => {
    files.forEach(file => console.log(file.join('\t')));
})
.catch(error => {
    console.error(error);
    process.exit(1);
})
