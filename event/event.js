/*
The MIT License (MIT)
Copyright (c) 2013 Kevin Conway

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*jslint node: true, indent: 2, passfail: true */
"use strict";

module.exports = (function () {

  var Modelo = require('modelo'),
    defer = require('deferjs'),
    EventMixin;

  // The Event object is a Modelo object that provides asynchronous
  // events. While new instances of Event can be created directly, it
  // is intended as more of a Mix-In object that can be added to any
  // inheritance chain.
  EventMixin = Modelo.define(function () {

    this.events = {};

  });

  // This method, and its alias `bind`, are used to register callbacks
  // to a particular event.
  //
  // Event callbacks are passed no parameters. If callbacks should run
  // in a special context, an object instance for example, then
  // a reference to the context should be passed in as an optional
  // third argument. In the absence of a special context a default,
  // empty context is used.
  EventMixin.prototype.on = function (event, callback, context) {

    if (typeof callback !== "function") {

      return this;

    }

    context = context || null;

    this.events[event] = this.events[event] || [];

    this.events[event].push({
      "callback": callback,
      "context": context
    });

    return this;

  };
  EventMixin.prototype.bind = EventMixin.prototype.on;

  // This method, and its alias `unbind`, are used to unregister
  // a callback from an event. This method uses a four-way logic
  // to determine which callbacks to remove.
  //
  // If no arguments are passed in then all callbacks for all events are
  // unregistered.
  //
  // If an event is the only argument given then all callbacks for that
  // event are unregistered.
  //
  // If an event and a reference to a callback are given then all
  // callbacks that equal the reference are removed from the specified
  // event.
  //
  // If an event, callback reference, and context reference are given
  // then only the callbacks that match both references are removed
  // from the event.
  //
  // It all depends on how specific you really need to be when
  // removing callbacks from an object.
  EventMixin.prototype.off = function (event, callback, context) {

    var x;

    if (callback === undefined &&
          context === undefined &&
          event === undefined) {

      this.events = {};
      return this;

    }

    if (callback === undefined && context === undefined) {

      this.events[event].splice(0, this.events[event].length);
      return this;

    }

    if (context === undefined) {

      for (x = this.events[event].length - 1; x >= 0; x = x - 1) {

        if (this.events[event][x].callback === callback) {

          this.events[event].splice(x, 1);

        }

      }

      return this;

    }

    for (x = this.events[event].length - 1; x >= 0; x = x - 1) {

      if (this.events[event][x].callback === callback &&
            this.events[event][x].context === context) {

        this.events[event].splice(x, 1);

      }

    }

    return this;

  };
  EventMixin.prototype.unbind = EventMixin.prototype.off;

  // This method, and its alias `fire`, are used to start the execution
  // of callbacks attached to an event. All callbacks are deferred using
  // the defer.js module and are not guaranteed an execution order.
  EventMixin.prototype.trigger = function (event) {

    var x,
      callback,
      ctx;

    this.events[event] = this.events[event] || [];

    for (x = 0; x < this.events[event].length; x = x + 1) {

      callback = this.events[event][x].callback;
      ctx = this.events[event][x].context;

      if (typeof callback === "function") {

        defer(defer.bind(callback, ctx));

      }

    }

    return this;

  };
  EventMixin.prototype.fire = EventMixin.prototype.trigger;


  return EventMixin;

}());
