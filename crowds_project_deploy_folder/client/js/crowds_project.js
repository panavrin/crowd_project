var DEBUG = true;

//version = Meteor.collection("version_number")
if (!Meteor.isClient)
  console.log("crowd_projects.js Error: Meteor.isClient:"+ Meteor.isClient)
if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
 
  Session.setDefault('document', "collab_python_doc");

  Template.cm_task_view.onRendered(function () {
  // Use the Packery jQuery plugin
    if(DEBUG) console.log("task_on_rendered");
    $( ".accordion" ).accordion({
      collapsible: true,
      heightStyle: "content",
      active:false,
      header:"h2"
    });
  });

  Template.cm_code_editor.helpers({
    config: function() {
      return function(cm) {
        if (DEBUG) {console.log("codemirror config function running");}
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

  Template.cm_task_view.onRendered(function(){
    dialog = $( "#create_task_dialg" ).dialog({
      autoOpen: false,
      height: "auto",
      width: 600,
      modal: true,
      buttons: {
        "Create a Task": function(){
          console.log("a task should be created")
        },
        Cancel: function() {
          dialog.dialog( "close" );
        }
      },
      close: function() {
        $("#crete_task_form")[0].reset();
        allFields.removeClass( "ui-state-error" );
      }
    });
  });

  Template.cm_task_view.events({
    "click #btn_creat_task": function (event) {
      dialog.dialog( "open" );
    }
  });

  Template.cm_code_editor.helpers({

  });
/*
  Template.cm_code_editor.helpers({
    docid: function() {
           console.log("docid call");
 return Session.get("document");
    }
  });
  */

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}




