"use strict";

module.exports = function (grunt) {

    var installation = grunt.option("installation") || "tiddlyspace";
    var spaceLinkFunctionFile = grunt.file.read("src/twikifier/functions/space_link/" + installation + ".js");
    var tagButtonFunctionFile = grunt.file.read("src/twikifier/functions/tag_button/" + installation + ".js");

    var tiddlyWikiFiles = ["BasicTypes.js", "Strings.js", "Config.js", "ConfigBrowser.js", "Filters.js",
        "FormatterHelpers.js", "Formatter.js", "Tiddler.js", "TiddlyWiki.js", "Utilities.js", "TiddlerFields.js",
        "Wikifier.js", "Macros.js", "Dates.js", "Lingo.js"];

    var tiddlySpaceLinkPluginFile = "TiddlySpaceLinkPlugin.js";

    var orderedLibFiles = [15];
    tiddlyWikiFiles.map(function (item, index) { orderedLibFiles[index] = "lib/" + item; });

    var testTiddlersUri = "http://cdent-test7.tiddlyspace.com/bags/cdent-test7_public/tiddlers";

    grunt.initConfig({
        "curl-dir": {
            "lib": [
                "https://github.com/TiddlyWiki/tiddlywiki/raw/master/js/{" + tiddlyWikiFiles + "}",
                "https://github.com/TiddlySpace/tiddlyspace/raw/master/src/plugins/" + tiddlySpaceLinkPluginFile
            ]
        },
        concat: {
            dist: {
                src: ["src/twikifier/TwikifierBase.js", orderedLibFiles, "lib/" + tiddlySpaceLinkPluginFile,
                    "gen/TwikifierEnd.js"],
                dest: "dist/twikifier.js"
            }
        },
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            gruntfile: {
                src: "Gruntfile.js"
            },
            src: {
                src: "src/*.js"
            },
            test: {
                src: "test/*.js"
            }
        },
        copy: {
            dist: {
                files: [{expand: true, flatten: true, src: ["src/twik*.js"], dest: "dist/" }]
            },
            bin: {
                files: [{expand: true, flatten: true, src: ["src/server.js"], dest: "bin/" }]
            }
        },
        clean: ["lib", "dist", "bin"],
        replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            match: "createSpaceLink",
                            replacement: spaceLinkFunctionFile
                        },
                        {
                            match: "createTagButton",
                            replacement: tagButtonFunctionFile
                        }
                    ]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ["src/twikifier/TwikifierEnd.js"],
                    dest: "gen/"
                }]
            }
        }
        // Uncomment to change default release options
//        release: {
//            options: {
//                bump: false,
//                add: false,
//                commit: false,
//                tag: false,
//                push: false,
//                pushTags: false,
//                npm: false
//            }
//        }
    });

    grunt.registerTask("twikify", "Run generated twikifier against some test tiddlers", function () {

        var done = this.async();

        var twikify = require("./test/twikify.js");
        grunt.file.recurse("test/files", function (absolutePath) {

            twikify.run(testTiddlersUri, absolutePath);
        });
        // Allow the HTTP requests that twikify runs to complete
        setTimeout(function() {
            done();
        }, 5000);
    });

    grunt.registerTask("test", ["replace", "concat", "twikify"]);
    grunt.registerTask("default", ["clean", "jshint", "curl-dir", "test", "copy"]);

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-curl");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-release");
    grunt.loadNpmTasks("grunt-replace");
};