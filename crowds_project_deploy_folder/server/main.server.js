if (Meteor.isServer) {
  console.log("server js code is running");
  Meteor.publish("tasks", function () {
    return Tasks.find({});
  });

  Meteor.publish("regions", function () {
    return Regions.find({});
  });
  
  Meteor.startup(function () {
    
  });

}
else{
  console.log("This cannot happne. Meteor.isServer is false in a file in server directory");
}