/*global require, define, module

*/
(function (factory) {
    "use strict";

    var env = factory.env,
        def = factory.def,
        deps = {
            amd: [],
            node: [],
            browser: []
        };

    def.call(this, 'modelo/defer', deps[env], function () {

        var defer;

        defer = (function () {

            if (typeof process !== "undefined" && !!process.nextTick) {

                return process.nextTick;

            }

            if (typeof window !== "undefined") {

                if (!!window.postMessage) {

                    return (function () {

                        var queue = [],
                            message = "nextTick",
                            handle = function (event) {

                                if (event.source === window &&
                                    event.data === message) {

                                    if (!!event.stopPropogation) {

                                        event.stopPropogation();

                                    }

                                    if (queue.length > 0) {

                                        queue.shift()();

                                    }

                                }

                            };

                        if (!!window.addEventListener) {

                            window.addEventListener("message", handle, true);

                        } else {

                            window.attachEvent("onmessage", handle);

                        }

                        return function (fn) {

                            queue.push(fn);
                            window.postMessage(message, '*');

                        };

                    }.call(this));

                }

                return function (fn) {

                    setTimeout(fn, 0);

                };

            }

            throw new Error("Unsupported environment for async events.");

        }.call(this));


        return defer;

    });

}.call(this, (function () {
    "use strict";

    var currentEnvironment,
        generator;

    // Check the environment to determine the dependency management strategy.

    if (typeof define === "function" && !!define.amd) {

        currentEnvironment = 'amd';

    } else if (typeof require === "function" &&
                        module !== undefined && !!module.exports) {

        currentEnvironment = 'node';

    } else if (this.window !== undefined) {

        currentEnvironment = 'browser';

    }

    generator = (function () {
        switch (currentEnvironment) {

        case 'amd':

            // If RequireJS is used to load this module then return the global
            // define() function.
            return function (name, deps, mod) {
                define(deps, mod);
            };

        case 'node':

            // If this module is loaded in Node, require each of the
            // dependencies and pass them along.
            return function (name, deps, mod) {

                var x,
                    dep_list = [];

                for (x = 0; x < deps.length; x = x + 1) {

                    dep_list.push(require(deps[x]));

                }

                module.exports = mod.apply(this, dep_list);

            };

        case 'browser':

            // If this module is being used in a browser environment first
            // generate a list of dependencies, run the provided definition
            // function with the list of dependencies, and insert the returned
            // object into the global namespace using the provided module name.
            return function (name, deps, mod) {

                var namespaces = name.split('/'),
                    root = this,
                    dep_list = [],
                    current_scope,
                    current_dep,
                    i,
                    x;

                for (i = 0; i < deps.length; i = i + 1) {

                    current_scope = root;
                    current_dep = deps[i].split('/');

                    for (x = 0; x < current_dep.length; x = x + 1) {

                        current_scope = current_scope[current_dep[x]] || {};

                    }

                    dep_list.push(current_scope);

                }

                current_scope = root;
                for (i = 1; i < namespaces.length; i = i + 1) {

                    current_scope = current_scope[namespaces[i - 1]] || {};

                }

                current_scope[namespaces[i - 1]] = mod.apply(this, dep_list);

            };

        default:
            throw new Error("Unrecognized environment.");

        }

    }.call());


    return {
        env: currentEnvironment,
        def: generator
    };

}.call(this))));