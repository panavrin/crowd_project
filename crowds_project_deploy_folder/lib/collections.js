Tasks = new Meteor.Collection("tasks");
Regions = new Meteor.Collection("regions");
Messages = new Meteor.Collection("messages");
Rooms = new Meteor.Collection("rooms");
Tasklogs = new Meteor.Collection("logs")



DEBUG  = true;
Meteor.methods({

  removeAll: function(){
    return (Tasks.remove({}) & (Messages.remove({})) & (Regions.remove({})));
  },

  logTask: function(taskID,_title, _desc, _deliverable, _region_id, _region_value, action_type ){
    //buttonClick is the store which button clicks.
    //The options are: lock, unlock, cancel
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
//    debugger;
    var now = new Date();
    return Tasklogs.insert({
      taskID: taskID,
      title: _title,
      desc:_desc,
      deliverable:_deliverable,
      region: _region_id,
      region_value: _region_value,
      state: action_type,
      operator: Meteor.userId(),
      username: Meteor.user().username,
      updatedAt: now
    });
  },

  addTask: function (_title, _desc, _deliverable, _region_id) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    console.log(_title);
    var now = new Date();
    return Tasks.insert({
      title: _title,
      desc:_desc,
      deliverable:_deliverable,
      createdAt: now,
      region: _region_id,
      owner: Meteor.userId(),
      username: Meteor.user().username,
      state: "in_creation",
      lockedby:"",
      updatedAt: now
    });
    //store task data
  },
// lockTask is in server.js for atomic operation.
  unlockTask: function(taskId, username){
    var task = Tasks.findOne(taskId);
    if (task == null){
      throw new Meteor.Error("Cannot find the task : " + taskId);
    }
    if(task.state!="in_progress" && task.state!="in_edit"){
      throw new Meteor.Error("You cannot unlock the task. It is not in the locked state. (state:" + task.state + ")");
    }
    return Tasks.update({_id:taskId},{$set:{
        state: "task_open",
        lockedby:null
      }
    });
  },
  archiveTask: function(taskId, username){
    var task = Tasks.findOne(taskId);
    if (task == null){
      throw new Meteor.Error("Cannot find the task : " + taskId);
    }
    if(task.state!="in_progress"){
      throw new Meteor.Error("You cannot archive the task. ");
    }
    return Tasks.update({_id:taskId},{$set:{
        state: "archived",
        lockedby:null
      }
    });
  },
  unarchiveTask :  function(taskId, username){
    var task = Tasks.findOne(taskId);
    if (task == null){
      throw new Meteor.Error("Cannot find the task : " + taskId);
    }
    if(task.state!="archived"){
      throw new Meteor.Error("You cannot unarchive the task. It is not in archived state.");
    }
    return Tasks.update({_id:taskId},{$set:{
        state: "task_open"
      }
    });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    if (task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }

    return Tasks.remove(taskId);
  },
  updateTask: function(taskId, _title, _desc, _deliverable, _region_id,_state){
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    //if(DEBUG) console.log("updated:" + taskId);
    var now = new Date();
    return Tasks.update({_id:taskId},{$set:{
        title: _title,
        desc:_desc,
        deliverable:_deliverable,

        region: _region_id,
        state: _state, // state can be : open, available, locked,
        updatedAt: now
      }
    });

  },
  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }

    return Tasks.update(taskId, { $set: { checked: setChecked} });
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

    return Regions.insert({
      name: _name,
      start: _start,
      end:_end,
      createdAt: now,
      owner: Meteor.userId(),
      username: Meteor.user().username,
      state: "region_open", // state can be : open or locked,
      updatedAt: now,
      region_locked_by:""
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
