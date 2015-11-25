var DEBUG = true;

//version = Meteor.collection("version_number")

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
/*
     counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
  */
  Session.setDefault('document', "collab_python_doc");

  Template.cm_task_view.onRendered(function () {
  // Use the Packery jQuery plugin
    console.log("task_on_rendered");
    this.$('.task-wrapper').dialog();
  });

  Template.cm_code_editor.helpers({
    config: function() {
      return function(cm) {
        if (DEBUG) {console.log("config function running");}
        cm.setOption("theme", "default");
        cm.setOption("lineNumbers", true);
        cm.setOption("lineWrapping", true);
        cm.setOption("smartIndent", true);
        cm.setOption("mode", "text/x-python");
        return cm.setOption("indentWithTabs", true);
      };
    },
    setMode: function(){
      return function(editor){
        console.log("when is it running?");
      }
    }

  });

/*
  Template.cm_code_editor.helpers({
    docid: function() {
           console.log("docid call");
 return Session.get("document");
    }
  });
  */
  //
  // Accounts.ui.config({
  //   passwordSignupFields: "USERNAME_ONLY"
  // });

}
