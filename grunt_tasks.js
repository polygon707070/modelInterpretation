module.exports = function() {

    var kb = 'kb/set_drawings/';
    var components = 'sc-web/components/set/';
    var clientJsDirPath = '../sc-web/client/static/components/js/';
    var clientCssDirPath = '../sc-web/client/static/components/css/';
    var clientHtmlDirPath = '../sc-web/client/static/components/html/';
    var clientImgDirPath = '../sc-web/client/static/components/images/';

    return  {
        concat: {
            setcmp: {
                src: [
                    components + 'src/set-component.js'],
                dest: clientJsDirPath + 'set/set.js'
            }
        },
        copy: {
            setIMG: {
                cwd: components + 'static/components/images/',
                src: ['*'],
                dest: clientImgDirPath + 'set/',
                expand: true,
                flatten: true
            },
            setCSS: {
                cwd: components + 'static/components/css/',
                src: ['set.css'],
                dest: clientCssDirPath,
                expand: true,
                flatten: true
            },
            setHTML: {
                cwd: components + 'static/components/html/',
                src: ['*.html'],
                dest: clientHtmlDirPath,
                expand: true,
                flatten: true
            },
            kb: {
                cwd: kb,
                src: ['*'],
                dest: '../kb/set_drawings/',
                expand: true,
                flatten: true
            }
        },
        watch: {
            setcmp: {
                files: components + 'src/**',
                tasks: ['concat:setcmp']
            },
            setIMG: {
                files: [components + 'static/components/images/**'],
                tasks: ['copy:setIMG']
            },
            setCSS: {
                files: [components + 'static/components/css/**'],
                tasks: ['copy:setCSS']
            },
            setHTML: {
                files: [components + 'static/components/html/**',],
                tasks: ['copy:setHTML']
            },
            copyKB: {
                files: [kb + '**',],
                tasks: ['copy:kb']
            }
        },
        exec: {
          updateCssAndJs: 'sh add-css-and-js.sh'
        }
    }
};

