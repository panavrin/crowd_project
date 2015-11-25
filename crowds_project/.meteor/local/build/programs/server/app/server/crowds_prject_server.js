(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// server/crowds_prject_server.js                                      //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
if (Meteor.isServer) {                                                 // 1
  console.log("server js code is running");                            // 2
                                                                       //
  Meteor.methods({                                                     // 4
    getDocumentText: function (docid) {                                // 5
      var getSnapshot = Meteor.wrapAsync(ShareJS.model.getSnapshot);   // 6
      console.log("getDocumentText is called:", docid);                // 7
      console.log(getSnapshot(docid).snapshot.toString());             // 8
      return getSnapshot(docid).snapshot;                              // 9
    }                                                                  //
  });                                                                  //
  /*                                                                   //
  Meteor.startup(function () {                                         //
  });                                                                  //
  */                                                                   //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=crowds_prject_server.js.map
