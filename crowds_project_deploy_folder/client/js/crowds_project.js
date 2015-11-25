var DEBUG = true;

//version = Meteor.collection("version_number")
if (!Meteor.isClient)
  console.log("crowd_projects.js Error: Meteor.isClient:"+ Meteor.isClient)
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
    if(DEBUG) console.log("task_on_rendered");
    $( ".accordion_region" ).accordion({
      collapsible: true,
      heightStyle: "content",
      active:false,
      header:"h2"
    });

    $( ".accordion_task" ).accordion({
      collapsible: true,
      heightStyle: "content",
      active:false,
      header:"h3"
    });
  });

  Template.cm_code_editor.helpers({
    config: function() {
      return function(ace) {
        /*
        if (DEBUG) {console.log("codemirror config function running");}
        cm.setOption("theme", "default");
        cm.setOption("lineNumbers", true);
        cm.setOption("lineWrapping", true);
        cm.setOption("smartIndent", true);
        cm.setOption("mode", "text/x-python");
        return cm.setOption("indentWithTabs", true);*/
        ace.setTheme('ace/theme/monokai')
        ace.getSession().setMode("ace/mode/python");
        ace.setShowPrintMargin(false)
        ace.getSession().setUseWrapMode(true)
      };
    },
    setMode: function(){
      return function(editor){
        console.log("when is it running?");
      }
    }

  });

  Template.cm_task_view.onRendered(function(){



    title = $( "#cm_dialog_title" ),
    deliverable = $( "#cm_dialog_delverbale" ),
    desc = $( "#cm_dialog_desc" ),
    allFields = $( [] ).add( title ).add( desc ).add( deliverable );

    function updateTips( t ) {
      tips
        .text( t )
        .addClass( "ui-state-highlight" );
      setTimeout(function() {
        tips.removeClass( "ui-state-highlight", 1500 );
      }, 500 );
    }

    function checkLength( o, n, min, max ) {
      if ( o.val().length > max || o.val().length < min ) {
        o.addClass( "ui-state-error" );
        updateTips( "Length of " + n + " must be between " +
          min + " and " + max + "." );
        return false;
      } else {
        return true;
      }
    }

    addTask = function(){
      var valid = true;
      allFields.removeClass( "ui-state-error" );

      valid = valid && checkLength(title, "Title", 5, 140);
      valid = valid && checkLength(desc, "Desc", 0, 1500);
      valid = valid &&  ($("#cm_dialog_region_dropdown").val() == "null")

      if (valid){
        // add task
        return true;
      }
      return false;
    }


    dialog = $( "#create_task_dialg" ).dialog({
      autoOpen: false,
      height: "auto",
      width: 600,
      modal: true,
      buttons: {
        "Create a Task": function(){
          if(addUser())
            console.log("a task should be created")
          else
            dialog.dialog("close");
        },
        Cancel: function() {
          dialog.dialog( "close" );
        }
      },
      close: function() {
        if (DEBUG) console.log("dialog closed");
        $("#crete_task_form")[0].reset();
        $("#cm_dialog_region_dropdown").val("null");
        allFields.removeClass( "ui-state-error" );
      }
    });
  });

  Template.cm_task_view.events({
    "click #btn_creat_task": function (event) {
      dialog.dialog( "open" );
    },
    "click .dropdown li a": function (event) {
      $("#cm_dialog_region_dropdown").text($(this).text());
      $("#cm_dialog_region_dropdown").val($(this).text());
      $(this).next('ul').toggle();
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
  //
  // Accounts.ui.config({
  //   passwordSignupFields: "USERNAME_ONLY"
  // });

}
