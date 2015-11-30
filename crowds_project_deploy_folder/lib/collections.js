Tasks = new Meteor.Collection("tasks");
Regions = new Meteor.Collection("regions");
DEBUG  = true;
Meteor.methods({
  addTask: function (_title, _desc, _deliverable, _region_id) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    console.log(_title);
    var now = new Date();
    Tasks.insert({
      title: _title,
      desc:_desc,
      deliverable:_deliverable,
      createdAt: now,
      region: _region_id,
      owner: Meteor.userId(),
      username: Meteor.user().username,
      // state: _state, // state can be : open, available, locked,
      updatedAt: now
    });

    //store task data
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    if (task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }

    Tasks.remove(taskId);
  },
  updateTask: function(taskId, _title, _desc, _deliverable, _region_id){
    //  var
  },
  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
  addRegion: function (_start, _end, _name) {
    if(DEBUG)console.log("Server:" + Meteor.isServer + " addRegion:("+_start+","+_end+")");

    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    var now = new Date();
    Regions.update({ start: {$gte: _start}}, { $inc: { start: _end-_start, end: _end-_start} }, {multi: true}, function(error, num){
      if(DEBUG) console.log("update completed:" + num);
      if(error) console.log(error);
    });

    Regions.insert({
      name: _name,
      start: _start,
      end:_end,
      createdAt: now,
      owner: Meteor.userId(),
      username: Meteor.user().username,
      state: "open", // state can be : open, available, locked,
      updatedAt: now
    });
    // update other region's start/end numbers
    //console.log(Tasks.find({ start: {$gt: _end}}));
  }
/*  shiftRegion: function () {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(selector, {
      $set: {start: _start,
             end : _end}
    });
  }*/

});
