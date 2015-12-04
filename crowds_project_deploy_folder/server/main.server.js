if (Meteor.isServer) {
  if(DEBUG) console.log("server js code is running");

  Meteor.publish("tasks", function () {
    return Tasks.find({});
  });

  Meteor.publish("regions", function () {
    return Regions.find({});
  });

  Meteor.methods({
    lockTask: function(taskId, username){
      var task = Tasks.findOne(taskId);
      if (task == null){
        throw new Meteor.Error("Cannot find the task : " + taskId);
      }
      if(task.state!="open"){
        throw new Meteor.Error("You cannot start the task. It is not in open state.");
      }
      return Tasks.update({_id:taskId},{$set:{
          state: "in_progress",
          lockedby:username
        }
      });
    }
  });


}
else{
  console.log("This cannot happne. Meteor.isServer is false in a file in server directory");
}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // Messages.remove({});
    Rooms.remove({});
    if (Rooms.find().count() === 0) {
      ["Meteor", "JavaScript", "Reactive", "MongoDB"].forEach(function(r) {
        Rooms.insert({roomname: r});
      });
    }
  });

  Rooms.deny({
    insert: function (userId, doc) {
      return true;
    },
    update: function (userId, doc, fieldNames, modifier) {
      return true;
    },
    remove: function (userId, doc) {
      return true;
    }
  });
  Messages.deny({
    insert: function (userId, doc) {
      return (userId === null);
    },
    update: function (userId, doc, fieldNames, modifier) {
      return true;
    },
    remove: function (userId, doc) {
      return true;
    }
  });
  Messages.allow({
    insert: function (userId, doc) {
      return (userId !== null);
    }
  });

  Meteor.publish("rooms", function () {
    return Rooms.find();
  });
  Meteor.publish("messages", function () {
    return Messages.find({}, {sort: {ts: -1}});
  });
}
