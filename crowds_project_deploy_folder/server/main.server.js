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
      if(DEBUG) console.log("LOCK:" + username + "," +taskId + ","+task.region);
      Regions.update({_id:task.region_id}, {$set:{
        state : "region_locked",
        region_locked_by:username
      }});

      Tasks.update({_id:taskId},{$set:{
          state: "in_progress",
          lockedby:username
        }
      });
      return task.region
    }
    ,
    updateRegionLines : function(region_id, line){
      var region = Regions.findOne(region_id);
      if (region == undefined){
        if(DEBUG) console.error("region id :" + region_id);
        throw new Meteor.Error("region undefined  " + region_id);
      }
      Regions.update({ start: {$gte: region.end}}, { $inc: { start: line, end: line} }, {multi: true}, function(error, num){
        if(DEBUG) console.log("region shifted:" + num);
        if(error) throw new Meteor.Error("Cannot shift the regions below " + region_id + ",num" + num);
      });
      return Regions.update({ _id: region_id}, { $inc: { end: line} }, {multi: true}, function(error, num){
        if(DEBUG) console.log("locked region update completed:" + region_id + " line:" + line + " updated:" +num);
        if(error) throw new Meteor.Error("Cannot update the region " + region_id);``
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
