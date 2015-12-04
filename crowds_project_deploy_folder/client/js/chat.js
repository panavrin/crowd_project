
if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });

  Meteor.subscribe("rooms");
  Meteor.subscribe("messages");
  Session.setDefault("roomname", "Meteor");

  Template.input.events({
    'click .sendMsg': function(e) {
       _sendMessage();
    },
    'keyup #msg': function(e) {
      if (e.type == "keyup" && e.which == 13) {
        _sendMessage();
      }
    }
  });

  _sendMessage = function() {
    var el = document.getElementById("msg");
    console.log(Meteor.user().username);
    Messages.insert({user: Meteor.user().username, msg: el.value, ts: new Date(), room: Session.get("roomname")});
    el.value = "";
    // el.focus();
  };
  Template.message.onRendered(function(){
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
  });

  Template.messages.helpers({
    messages: function() {
      return Messages.find({room: Session.get("roomname")}, {sort: {ts: 1}});
    },
	roomname: function() {
      return Session.get("roomname");
    }
  });

  Template.message.helpers({
    timestamp: function() {
      return this.ts.toLocaleString();
    }
  });

  Template.rooms.events({
    'click li': function(e) {
      Session.set("roomname", e.target.innerText);
    }
  });

  Template.rooms.helpers({
    rooms: function() {
      return Rooms.find();
    }
  });

  Template.room.helpers({
	roomstyle: function() {
      return Session.equals("roomname", this.roomname) ? "font-weight: bold" : "";
    }
  });

  Template.chat.helpers({
    release: function() {
      return Meteor.release;
    }
  });
}
