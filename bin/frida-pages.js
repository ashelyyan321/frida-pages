#!/usr/bin/env node

process.argv.push('--cwd')
process.argv.push(process.cwd())
process.argv.push('--gulpfile')
process.argv.push(require.resolve('..'))

require('gulp/bin/gulp')

//(base) frida@MacBook-Pro fridagulp % zce-pages build

//console.log('frida-pages')

//chmod 755 frida-pages.js 
//yarn unlink  yarn link
//zce-pages