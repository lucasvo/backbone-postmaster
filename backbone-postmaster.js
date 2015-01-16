//     Copyright (c) 2015, Lucas Vogelsang
//     All rights reserved.
//     
//     Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
//         * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
//         * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
//         * Neither the name of the <organization> nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
//     
//     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//     DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
//     LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
//     SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// # Backbone Postmaster
// 
// Backbone Postmater is an extension to the built in backbone router. Postmaster let's 
// you split up your routes into smaller modules and register these. Take a look at `examples/todo.html`
// for a usage example.

(function(root, factory) {
  // Set up Postmaster appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone', 'exports'], function(_, Backbone, exports) {
      return factory(root, _, Backbone);
    });

  // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    var Backbone = require('backbone');
    exports = factory(root, _, Backbone);

  // Finally, as a browser global.
  } else {
    root.BackbonePostmaster = factory(root, root._, root.Backbone );
  }

}(this, function(root, _, Backbone) {

  Postmaster = function (options) {
    options || (options = {}); 
    this.initialize.apply(this, arguments);
  };

  _.extend(Postmaster.prototype, {
    initialize: function () {},
    
    // Backbone Router Object used to interface with Backbone.js
    _backboneRouter: new Backbone.Router(),

    // ## register method
    // The register function accepts a combination of different arguments. It can register 
    // single routes or objects that contain multiple routes.
    //
    // The method takes the following arguments:
    // * `path`: this is the entry point for routes to be registered. If
    // * `name` (*optional*): Backbone.Router let's you name routes. If this argument is omitted, the `path` will This parameter is only required 
    //      if route is "". 
    register: function (path, name, dest, noAppendSlash) {
    
      if (arguments.length == 2) {
        if (path == "") throw "Name argument is required if route is \"\"";
        dest = name;
        name = path;
      }
      

      if (_.isFunction(dest)) {
        this._route(path, name, dest);
        return; 
      }

      if (_.isObject(dest) && !_.isFunction(dest) && _.isObject(dest.routes)) {
        this._registerObject(path, name, dest.routes, dest, noAppendSlash);
        return;
      }

      throw "Calling ModularRouter with invalid arguments. Make sure the third argument is a function or an object."; 
    },

    _registerObject: function (route, name, object, context, noAppendSlash) {
      _.each(object, function (method, subroute) {
        subroute = this._joinPath(route, subroute, noAppendSlash);
        var routeName = name+"_"+method; 
        this._route(subroute, routeName, function() {
          method = context[method];
          method.apply(context, arguments);
        });
      }, this);
    },

    _joinPath: function (a, b, noAppendSlash) {
      if (a == "" || noAppendSlash === true) return a+b;
      if (a.slice(-1) == "/") return a+b;
      return a+"/"+b;
    },

    _route: function (route, name, dest) {
      this._backboneRouter.route(route, name, dest);
    } 
  });

  return Postmaster;

}));
