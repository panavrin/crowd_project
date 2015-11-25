(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var __coffeescriptShare, ShareJS;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/mizzao_sharejs/sharejs-meteor-auth.coffee.js                                                     //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var Fiber, Future, LogicalOps, _monkeyPatch, _submitOpMonkeyPatched, runValidations,                         // 2
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };                          //
                                                                                                             //
Fiber = Npm.require('fibers');                                                                               // 2
                                                                                                             //
Future = Npm.require('fibers/future');                                                                       // 2
                                                                                                             //
LogicalOps = {                                                                                               // 2
  'or': function(a, b) {                                                                                     // 7
    return a || b;                                                                                           //
  },                                                                                                         //
  'and': function(a, b) {                                                                                    // 7
    return a && b;                                                                                           //
  }                                                                                                          //
};                                                                                                           //
                                                                                                             //
runValidations = function(currentOp, validations, doc, token) {                                              // 2
  var k, lookIn, nestedResult, result, v;                                                                    // 12
  if (currentOp === null) {                                                                                  // 12
    if ((validations != null ? validations.or : void 0) != null) {                                           // 13
      return runValidations("or", validations.or, doc, token);                                               // 15
    } else if ((validations != null ? validations.and : void 0) != null) {                                   //
      return runValidations("and", validations.and, doc, token);                                             // 18
    } else if (validations != null) {                                                                        //
      return runValidations("and", validations, doc, token);                                                 // 21
    } else {                                                                                                 //
      return true;                                                                                           // 25
    }                                                                                                        //
  } else if (currentOp != null) {                                                                            //
    if (currentOp === "or") {                                                                                // 27
      result = false;                                                                                        // 28
    } else if (currentOp = "and") {                                                                          //
      result = true;                                                                                         // 30
    }                                                                                                        //
    for (k in validations) {                                                                                 // 32
      v = validations[k];                                                                                    //
      if (k === "or" || k === "and") {                                                                       // 33
        nestedResult = runValidations(k, v, doc, token);                                                     // 35
        result = LogicalOps[currentOp](result, nestedResult);                                                // 35
      } else {                                                                                               //
        switch (v) {                                                                                         // 38
          case "is_in_array":                                                                                // 38
            result = LogicalOps[currentOp](result, indexOf.call(doc[k], token) >= 0);                        // 40
            break;                                                                                           // 39
          case "isnt_in_array":                                                                              // 38
            lookIn = doc.k || [];                                                                            // 42
            result = LogicalOps[currentOp](result, indexOf.call(doc[k], token) < 0);                         // 42
            break;                                                                                           // 41
          case "is_equal":                                                                                   // 38
            result = LogicalOps[currentOp](result, token === doc[k]);                                        // 45
            break;                                                                                           // 44
          case "isnt_equal":                                                                                 // 38
            result = LogicalOps[currentOp](result, token === !doc[k]);                                       // 47
        }                                                                                                    // 38
      }                                                                                                      //
    }                                                                                                        // 32
    return result;                                                                                           // 48
  }                                                                                                          //
};                                                                                                           // 11
                                                                                                             //
_submitOpMonkeyPatched = false;                                                                              // 2
                                                                                                             //
_monkeyPatch = function(agent) {                                                                             // 2
  var UserAgent, model;                                                                                      // 53
  UserAgent = Object.getPrototypeOf(agent);                                                                  // 53
  model = ShareJS.model;                                                                                     // 53
  UserAgent.submitOp = function(docName, opData, callback) {                                                 // 53
    var dupIfSource;                                                                                         // 58
    opData.meta || (opData.meta = {});                                                                       // 58
    opData.meta.userId = this.name;                                                                          // 58
    opData.meta.source = this.sessionId;                                                                     // 58
    dupIfSource = opData.dupIfSource || [];                                                                  // 58
    if (opData.op) {                                                                                         // 64
      return this.doAuth({                                                                                   //
        docName: docName,                                                                                    // 65
        op: opData.op,                                                                                       // 65
        v: opData.v,                                                                                         // 65
        meta: opData.meta,                                                                                   // 65
        dupIfSource: dupIfSource                                                                             // 65
      }, 'submit op', callback, (function(_this) {                                                           //
        return function() {                                                                                  //
          return model.applyOp(docName, opData, callback);                                                   //
        };                                                                                                   //
      })(this));                                                                                             //
    } else {                                                                                                 //
      return this.doAuth({                                                                                   //
        docName: docName,                                                                                    // 68
        meta: opData.meta                                                                                    // 68
      }, 'submit meta', callback, (function(_this) {                                                         //
        return function() {                                                                                  //
          return model.applyMetaOp(docName, opData, callback);                                               //
        };                                                                                                   //
      })(this));                                                                                             //
    }                                                                                                        //
  };                                                                                                         //
  console.log("ShareJS: patched UserAgent submitOp function to record Meteor userId");                       // 53
  return _submitOpMonkeyPatched = true;                                                                      //
};                                                                                                           // 52
                                                                                                             //
this.MeteorAccountsAuthHandler = (function() {                                                               // 2
  function MeteorAccountsAuthHandler(options, client) {                                                      // 76
    this.options = options;                                                                                  // 76
    this.client = client;                                                                                    // 76
    this.handle = bind(this.handle, this);                                                                   // 76
  }                                                                                                          //
                                                                                                             //
  MeteorAccountsAuthHandler.prototype.fetchDocument = function(collection, key) {                            // 76
    var future;                                                                                              // 80
    future = new Future;                                                                                     // 80
    this.client.collection(collection, function(err, collection) {                                           // 80
      if (err) {                                                                                             // 82
        return future["throw"](err);                                                                         // 82
      }                                                                                                      //
      return collection.findOne({                                                                            //
        _id: key                                                                                             // 84
      }, function(err, doc) {                                                                                //
        if (err) {                                                                                           // 85
          console.warn("failed to get doc in " + collection + " with key " + key + ": " + err);              // 85
        }                                                                                                    //
        if (err) {                                                                                           // 86
          future["throw"](null);                                                                             // 86
        }                                                                                                    //
        return future["return"](doc);                                                                        //
      });                                                                                                    //
    });                                                                                                      //
    return future;                                                                                           // 89
  };                                                                                                         //
                                                                                                             //
  MeteorAccountsAuthHandler.prototype.getAuthentication = function(agent) {                                  // 76
    var collection, future, token, user, validations;                                                        // 93
    token = agent.authentication;                                                                            // 93
    validations = this.options.authenticate.token_validations;                                               // 93
    collection = this.options.authenticate.collection;                                                       // 93
    future = new Future;                                                                                     // 93
    user = this.fetchDocument(collection, agent.authentication).wait();                                      // 93
    if (!((user != null) || ((validations.or != null) && (validations.and != null)))) {                      // 102
      future["return"](false);                                                                               // 103
    }                                                                                                        //
    future["return"](runValidations(null, validations, user, token));                                        // 93
    return future;                                                                                           // 107
  };                                                                                                         //
                                                                                                             //
  MeteorAccountsAuthHandler.prototype.getAuthorization = function(agent, action) {                           // 76
    var collection, doc, future, token, validations;                                                         // 111
    token = agent.authentication;                                                                            // 111
    validations = this.options.authorize.token_validations;                                                  // 111
    collection = this.options.authorize.collection;                                                          // 111
    future = new Future;                                                                                     // 111
    doc = this.fetchDocument(collection, action.docName).wait();                                             // 111
    if (!((doc != null) || ((validations.or != null) && (validations.and != null)))) {                       // 120
      future["return"](false);                                                                               // 121
    }                                                                                                        //
    future["return"](runValidations(null, validations, doc, token));                                         // 111
    return future;                                                                                           // 125
  };                                                                                                         //
                                                                                                             //
  MeteorAccountsAuthHandler.prototype.handle = function(agent, action) {                                     // 76
    var authenticate, authorize, opsToAuthorize, ref;                                                        // 129
    if (!_submitOpMonkeyPatched) {                                                                           // 129
      _monkeyPatch(agent);                                                                                   // 129
    }                                                                                                        //
    authenticate = this.options.authenticate != null;                                                        // 129
    authorize = this.options.authorize != null;                                                              // 129
    opsToAuthorize = (ref = this.options.authorize) != null ? ref.apply_on : void 0;                         // 129
    return (Fiber(((function(_this) {                                                                        //
      return function() {                                                                                    //
        var ref1, res;                                                                                       // 136
        res = false;                                                                                         // 136
        if (authenticate && (action.type === "connect")) {                                                   // 138
          res = _this.getAuthentication(agent).wait();                                                       // 139
          if (res) {                                                                                         // 141
            agent.name = agent.authentication;                                                               // 141
          }                                                                                                  //
        } else if (authorize && (ref1 = action.type, indexOf.call(opsToAuthorize, ref1) >= 0)) {             //
          res = _this.getAuthorization(agent, action).wait();                                                // 144
        } else {                                                                                             //
          res = true;                                                                                        // 147
        }                                                                                                    //
        if (res) {                                                                                           // 149
          return action.accept();                                                                            //
        } else {                                                                                             //
          return action.reject();                                                                            //
        }                                                                                                    //
      };                                                                                                     //
    })(this)))).run();                                                                                       //
  };                                                                                                         //
                                                                                                             //
  return MeteorAccountsAuthHandler;                                                                          //
                                                                                                             //
})();                                                                                                        //
                                                                                                             //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/mizzao_sharejs/sharejs-server.coffee.js                                                          //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var Future, options, ref;                                                                                    // 3
                                                                                                             //
Future = Npm.require('fibers/future');                                                                       // 3
                                                                                                             //
ShareJS = ShareJS || {};                                                                                     // 3
                                                                                                             //
options = _.extend({                                                                                         // 3
  staticPath: null,                                                                                          // 9
  db: {                                                                                                      // 9
    type: 'mongo',                                                                                           // 12
    opsCollectionPerDoc: false                                                                               // 12
  }                                                                                                          //
}, (ref = Meteor.settings.sharejs) != null ? ref.options : void 0);                                          //
                                                                                                             //
switch (options.db.type) {                                                                                   // 20
  case 'mongo':                                                                                              // 20
                                                                                                             // 22
    /*                                                                                                       // 22
      ShareJS 0.6.3 mongo driver:                                                                            //
      https://github.com/share/ShareJS/blob/v0.6.3/src/server/db/mongo.coffee                                //
      It will create its own indices on the 'ops' collection.                                                //
     */                                                                                                      //
    options.db.client = MongoInternals.defaultRemoteCollectionDriver().mongo.db;                             // 22
    options.db.client.open = function() {};                                                                  // 22
    if (options.accounts_auth != null) {                                                                     // 40
      options.auth = new MeteorAccountsAuthHandler(options.accounts_auth, options.db.client).handle;         // 41
    }                                                                                                        //
    break;                                                                                                   // 21
  default:                                                                                                   // 20
    Meteor._debug("ShareJS: using unsupported db type " + options.db.type + ", falling back to in-memory.");
}                                                                                                            // 20
                                                                                                             //
RoutePolicy.declare('/channel/', 'network');                                                                 // 3
                                                                                                             //
Npm.require('share').server.attach(WebApp.connectHandlers, options);                                         // 3
                                                                                                             //
                                                                                                             // 51
/*                                                                                                           // 51
  ShareJS attaches the server API to a weird place. Oh well...                                               //
  https://github.com/share/ShareJS/blob/v0.6.2/src/server/index.coffee                                       //
 */                                                                                                          //
                                                                                                             //
ShareJS.model = WebApp.connectHandlers.model;                                                                // 3
                                                                                                             //
ShareJS.initializeDoc = function(docName, content) {                                                         // 3
  return ShareJS.model.create(docName, 'text', {}, function(err) {                                           //
    var opData;                                                                                              // 60
    if (err) {                                                                                               // 60
      console.log(err);                                                                                      // 61
      return;                                                                                                // 62
    }                                                                                                        //
    opData = {                                                                                               // 60
      op: [                                                                                                  // 65
        {                                                                                                    //
          i: content,                                                                                        // 66
          p: 0                                                                                               // 66
        }                                                                                                    //
      ],                                                                                                     //
      v: 0,                                                                                                  // 65
      meta: {}                                                                                               // 65
    };                                                                                                       //
    return ShareJS.model.applyOp(docName, opData, function(err, res) {                                       //
      if (err) {                                                                                             // 71
        return console.log(err);                                                                             //
      }                                                                                                      //
    });                                                                                                      //
  });                                                                                                        //
};                                                                                                           // 58
                                                                                                             //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['mizzao:sharejs'] = {
  ShareJS: ShareJS
};

})();

//# sourceMappingURL=mizzao_sharejs.js.map
