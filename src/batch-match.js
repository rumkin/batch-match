const path = require('path');
const escapeRegexp = require('escape-regexp');
const fsp = require('fs-promise');

exports.map = mapWithPattern;
exports.forEach = forEachWithPattern;
exports.search = searchWithPattern;
exports.parsePattern = parsePattern;
exports.searchWithMap = searchWithMap;

function parsePattern(pattern){
    var map = [];
    var sep = escapeRegexp(path.sep);

    pattern = pattern.replace(new RegExp('^.?' + sep + '+|' + sep + '+$', 'g'), '');
    pattern.split(path.sep).forEach(part => {
        var mask = part.split('*');
        map.push({
            mask: new RegExp('^' + mask.map(escapeRegexp).join('(.*)') + '$'),
            slices:  mask.length - 1,
        });
    });

    return map;
}

function searchWithMap(map, {cwd=process.cwd(), base=''} = {}) {
    return fsp.readdir(path.join(cwd, base)).then(
        files => Promise.all(files.map(
            file => {
                var match = map[0].mask.exec(file);
                if (! match) {
                    return false;
                }

                return {
                    file: file,
                    match: match,
                    slices: map[0].slices,
                };
            }
        )
        .filter(item => item)
        .map(
            item => fsp.stat(path.join(cwd, base, item.file))
            .then(stat => Object.assign(item, {stat}))
        ))
    )
    .then(items => {
        if (map.length === 1) {
            return items.filter(item => item.stat.isFile());
        } else {
            return Promise.all(items.filter(item => item.stat.isDirectory()).map(
                item => searchWithMap(map.slice(1), {cwd, base: path.join(base, item.file)})
                .then(files => {
                    return files.map(file => {
                        if (Array.isArray(file)) {
                            return [item, ...file];
                        } else {
                            return [item, file];
                        }
                    });
                })
            ))
            .then(files => [].concat(...files));
        }
    })
    .catch(error => {
        if (error.code !== 'EACCES') {
            throw error;
        }

        return [];
    });
}

function searchWithPattern(pattern, {cwd=process.cwd()} = {}) {
    if (pattern.charAt(0) === path.sep) {
        cwd = path.sep;
    }

    return searchWithMap(parsePattern(pattern), {cwd})
    .then(files =>
        files.map(items => {
            var filepath = [];
            var params = [];

            items.forEach(item => {
                filepath.push(item.file);
                var i = 0;
                while (item.slices--) {
                    params.push(item.match[++i]);
                }
            });

            return [filepath.join(path.sep), ...params];
        })
    );
}

function mapWithPattern(pattern, {cwd=process.cwd()} = {}, map) {
    return searchWithPattern(pattern, {cwd}).then(files =>
        Promise.all(files.map(file => map(...file)))
    );
}

function forEachWithPattern(pattern, {cwd=process.cwd()} = {}, forEach) {
    return searchWithPattern(pattern, {cwd}).then(files => {
        files.forEach(file => forEach(...file))
    });
}
