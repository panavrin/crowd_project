var DEBUG = true;

//version = Meteor.collection("version_number")
if (!Meteor.isClient)
  console.log("crowd_projects.js Error: Meteor.isClient:"+ Meteor.isClient)

if (Meteor.isClient) {

  Meteor.subscribe("tasks");
  Meteor.subscribe("regions");

  Template.registerHelper("tasksinregion", function(region){
      return Tasks.find( {region:{$eq:region}}, sorted:{});
  });

  Template.registerHelper("alltasks", function(region){
      return Tasks.find({});
  });

  Template.registerHelper("allregions", function(region){
      return Regions.find({});
  });



  // counter starts at 0
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

    var region = $("#cm_dialog_region_dropdown_btn"),
    title = $( "#cm_dialog_title" ),
    deliverable = $( "#cm_dialog_delverbale" ),
    desc = $( "#cm_dialog_desc" ),
    allFields = $( [] ).add(region).add( title ).add( desc ).add( deliverable );
    tips = $( ".validateTips" );

    $(".dropdown-menu li a").click(function (event) {
      if(DEBUG) console.log("dropdown menu clicked:" + $(this).text());
      $("#cm_dialog_region_dropdown_btn").text($(this).text());
      $("#cm_dialog_region_dropdown_btn").val($(this).text());
      $(this).next('ul').toggle();
    });

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

    function checkRegion(o){
      if (o.val() == "null"){
        o.addClass( "ui-state-error" );
        updateTips( "You MUST select the region associated with the task." );
        return false;
      }
      return true;
    }

    addTask = function(){
      var valid = true;
      allFields.removeClass( "ui-state-error" );

      valid = valid &&  checkRegion($("#cm_dialog_region_dropdown_btn"));
      valid = valid && checkLength(title, "Title", 5, 140);
      valid = valid && checkLength(desc, "Description", 10, 500);

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
      position: {of: "#cm_code_editor"},
      buttons: {
        "Create a Task": function(){
          if(addTask()){
            console.log("a task should be created")
            dialog.dialog("close");
          }
        },
        Cancel: function() {
          dialog.dialog( "close" );
        }
      },
      close: function() {
        if (DEBUG) console.log("dialog closed");
        $("#crete_task_form")[0].reset();
        $("#cm_dialog_region_dropdown_btn").val("null");
        $("#cm_dialog_region_dropdown_btn").text("Create New Task");
        allFields.removeClass( "ui-state-error" );
      }
    });
  });

  Template.cm_task_view.events({
    "click #btn_creat_task": function (event) {
      if(DEBUG) console.log("Create new task button clicked");
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
