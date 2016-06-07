# Batch Match

Is a file pattern matcher like glob built for routing. It returns path and
wildcard values separately.

##

Install
```
npm i batch-match
```

## Example

For example we want to select each file which ends with `-service.js` and use everything before prefix as name (eg. search, file and task).

Example directory:
```
.
|-- search-service.js
|-- file-service.js
`-- task-service.js
```

Code to find files with routes:

```javascript
const bm = require('batch-match');

bm.search('./*-service.js')
.then(files => {
    console.log(files); // -> [['search-service.js', 'search'], ['file-service.js', 'file'], ...]
});
```

## Cli util

There is cli util to find matches and output it to stdio in row mode:

```shell
batch-match '*-service.js'
```

Will output:
```
search-service.js search
file-service.js file
task-service.js task
```
