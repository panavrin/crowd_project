if (Meteor.isServer) {
	        console.log("server js code is running");

  Meteor.methods({
      getDocumentText: function (docid) {
        var getSnapshot = Meteor.wrapAsync(ShareJS.model.getSnapshot);
        console.log("getDocumentText is called:", docid);
        console.log(getSnapshot(docid).snapshot.toString());
        return getSnapshot(docid).snapshot;
      }   
  });
  /*
  Meteor.startup(function () {
  });
  */
}