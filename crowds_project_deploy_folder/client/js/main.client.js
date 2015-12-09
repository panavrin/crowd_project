ace_editor = null;
minNumLineRegion = 7;
editor_rendered = false;
//accordionRegionRenedered = false;
Session.set("TASK_ID_IN_CREATION",null);
Session.set("MY_LOCKED_REGION", null);
Session.set("LOCK", false);
Session.set("EDIT_MODE",false);
task_view_flag = null;
admin_mode = null;
var tutorial_create_task_flag = true;
var tutorial_select_region_flag = true;
var tutorial_lock_task_flag = true;
var tutorial_archive_task_flag = true;
var tutorial_run_selection_flag = true;
var tutorial_create_task_msg = "Please select a region first when creating a task.";
var tutorial_select_region_msg= "Press one of the yellow buttons on the editor to create a region.";
var tutorial_lock_task_msg = "Once you create a task, you can write code after locking a task. Instead, you can keep creating tasks for others";
var tutorial_archive_task_msg = "You can always unarchive a task if needed. Find 'Show Arcived Tasks' in each region";
var tutorial_run_selection_msg = "Press run button will run the selected the code editor. It will run the entire code if there's no selection.";

var Range = require('ace/range').Range;


//version = Meteor.collection("version_number")
if (!Meteor.isClient)
  console.log("crowd_projects.js Error: Meteor.isClient:"+ Meteor.isClient)

if (Meteor.isClient) {

  Meteor.subscribe("tasks");
  Meteor.subscribe("regions");
  // debugger;
  // console.log(Meteor.user().username);
  Template.registerHelper("tasksinregion", function(region_id){
      return Tasks.find( {region:region_id, state: { $ne: "archived" }}, {sort: {createdAt:-1}});
  });

  Template.registerHelper("archivedTasksExist", function(region_id){
      if(Tasks.find( {region:region_id, state: "archived" }, {sort: {createdAt:-1}}).count() > 0)
        return true;
      return false;
  });

  Template.registerHelper("archivedtasksinregion", function(region_id){
      return Tasks.find( {region:region_id, state: "archived" }, {sort: {createdAt:-1}});
  });

  Template.registerHelper("isAdmin", function(){
      if ( Meteor.user()!= null && Meteor.user().username == "admin" )
      {
        return true;
      }
      return false;
    }
  );

  Template.registerHelper("alltasks", function(){
      return Tasks.find({});
  });


  Template.registerHelper("allregions", function(visible){
    return Regions.find({},{sort: {start: 1}});
  });

  Template.registerHelper("isInEdit", function(){
    return Session.get("EDIT_MODE");
  });
  Template.cm_task_view.onRendered(function () {

    // if (Meteor.user().username = "admin")
    //   $('button#cleanup').hide();
    //
  // Use the Packery jQuery plugin
    if(DEBUG) console.log("task_on_rendered");
    $("#cm_dialog_title").keyup(updateTask);
    $("#cm_dialog_delverbale").keyup(updateTask);
    $("#cm_dialog_desc").keyup(updateTask);
    $("#cm_dialog_title").mousedown(updateTask);
    $("#cm_dialog_delverbale").mousedown(updateTask);
    $("#cm_dialog_desc").mousedown(updateTask);
    $("#cm_dialog_title").keypress(function(event) {
      if (event.which == 13) {
          event.preventDefault();
      }
  });
    $("#cm_dialog_delverbale").mousedown(function(event) {
      if (event.which == 13) {
          event.preventDefault();
      }
  });
  });
  //
  // $("button#clean").on('click',function (event) {
  //     ace_editor.setValue("");
  //   });




  Template.cm_code_editor.helpers({


    config: function() {
      return function(ace) {
        if(DEBUG)console.log("config");

        ace_editor = ace;
        /*
        if (DEBUG) {console.log("codemirror config function running");}
        cm.setOption("theme", "default");
        cm.setOption("lineNumbers", true);
        cm.setOption("lineWrapping", true);
        cm.setOption("smartIndent", true);
        cm.setOption("mode", "text/x-python");
        return cm.setOption("indentWithTabs", true);*/
        ace.setTheme('ace/theme/terminal');
        ace.getSession().setMode("ace/mode/python");


        ace.setShowPrintMargin(false);
        ace.getSession().setUseWrapMode(false);
        regionUpdated = true;

        ace.getSession().on('changeScrollTop', function(scroll) {
          regionUpdated = true;
        });



        if ( task_view_flag){
          updateRegions = function(){
            var gutterStart = $("#editor .ace_gutter :first-child");
            var gutterEnd = $("#editor .ace_gutter :last-child");
            var firstLine = gutterStart.children().first();
            var numFirstLine = parseInt(firstLine.text())-1;
            var numLastLine = parseInt(gutterEnd.text());
            var margin_top = gutterStart.css("margin-top");
            lineHeight = firstLine.css("height");
            lineHeight = parseInt(lineHeight.substring(0,lineHeight.indexOf("px")));
            margin_top = parseInt(margin_top.substring(0,margin_top.indexOf("px")));
            var bottomPixel = parseInt(numLastLine - numFirstLine) * lineHeight + margin_top;

            if(DEBUG)console.log("changeScrollTop, numFirstLine:" + numFirstLine + " margin_top:" + margin_top)
            maxLineNumber = -1;
            endLinePixel = -1;
            var top, height;

            $(".region").each(function(){

              if(DEBUG)console.log("region");
              var start = parseInt($(this).attr("start")),
              end = parseInt($(this).attr("end"));
              top = (lineHeight * ( parseInt($(this).attr("start") - numFirstLine) ) + margin_top);
              height = (lineHeight * ( parseInt($(this).attr("end") - parseInt($(this).attr("start")) )));
              //if (top + height/* end line */ <0  || top /* startline */ > bottomPixel)
              //  return;
              $(this).css("top", top + "px");
              $(this).css("height",height + "px");
              if (maxLineNumber < end){
                maxLineNumber = end;
                endLinePixel = top + height;
              }
            });
      /*      if ( endLinePixel < bottomPixel){
              $("#region_masker").css("top", endLinePixel + "px");
              $("#region_masker").css("bottom", bottomPixel + "px");
            }*/

          }

          ace.renderer.on("afterRender", function(e) {
            editor_rendered = true;
            //if (regionUpdated) {
              updateRegions();
            //}
            regionUpdated = false;
          });


          ace_editor.getSession().selection.on('changeSelection', function(e) {
            if (!Session.get("LOCK"))
              return;
            if (Session.get("EDIT_MODE"))
                return;
            var region_id = Session.get("MY_LOCKED_REGION");
            var start_region_line = parseInt($("#"+region_id).attr("start")),
              end_region_line = parseInt($("#"+region_id).attr("end"));
              var cursorPosition =  ace_editor.selection.getRange();
              if ( cursorPosition.start.row < start_region_line+1 || cursorPosition.end.row>=end_region_line-1)
              {
                ace_editor.setReadOnly(true);
                if(DEBUG) console.log("cursor out of range start : " +start_region_line +",end_region_line:" + end_region_line );
              }
              else{
                ace_editor.setReadOnly(false);
                if(DEBUG) console.log("cursor in range");
              }
          });
          // idea is to make it readonly when selection is outside my locked region
          ace_editor.getSession().selection.on('changeCursor', function(e) {
            if (!Session.get("LOCK"))
              return;
            if (Session.get("EDIT_MODE"))
              return;
            var region_id = Session.get("MY_LOCKED_REGION");
            var start_region_line = parseInt($("#"+region_id).attr("start")),
              end_region_line = parseInt($("#"+region_id).attr("end"))
            var cursorPosition =  ace_editor.selection.getRange();
            if ( cursorPosition.start.row < start_region_line+1 || cursorPosition.end.row>=end_region_line-1)
            {
              ace_editor.setReadOnly(true);
              if(DEBUG) console.log("cursor out of range");

            }
            else{
              ace_editor.setReadOnly(false);
              if(DEBUG) console.log("cursor in range");
            }
          });
          ace_editor.on("change", function(e,v,g){
              if (!Session.get("LOCK"))
                return;
// first let's make sure if the cursor falls into the locked region
              var region_id = Session.get("MY_LOCKED_REGION");
              var start_region_line = parseInt($("#"+region_id).attr("start")),
                end_region_line = parseInt($("#"+region_id).attr("end")),
                startLine = e.data.range.start.row,
                endLine = e.data.range.end.row;

              if ( startLine < start_region_line || startLine >=end_region_line)
              {
                return;
                if (DEBUG)console.log("This is cursor move due to somebody else. somebody else probably  ");
                ace_editor.getSession().doc.insertLines(startLine,[""]);

          //      if(DEBUG) alert("this should not happen : Cursor position out of range. ");
              }

              var changedLine = endLine - startLine;

              if (e.data.action == "insertLines" || e.data.action == "insertText"){

              }
              else if (e.data.action == "removeLines" || e.data.action == "removeText"){
                changedLine = -changedLine;
              }
              else{
                if(DEBUG) alert ("unhandeld change action:" + e.data.action);
              }
              if(DEBUG) console.log (region_id + " changedLine:" + changedLine);


              if (changedLine == 0)
                return;

                regionUpdated = true;
              Meteor.call("updateRegionLines", region_id, changedLine, function(error,result){
                if(error){
                  if(DEBUG) console.error(error);
                }
                setTimeout(updateRegions, 200);

              })
              // time to update regions


          });

        }
      };
    },
    setMode: function(){
      return function(editor){
        if (task_view_flag){
          ace_editor.setReadOnly(true);
        }

        if (ace_editor.getValue().length==0)
          ace_editor.setValue("from document import *\ntextarea_input = getElementById('python_data').value\n#The textarea_input varaible will contain the text available in the textarea",-1)
        if(DEBUG)console.log("setMode");
      }
    },


  });

  Template.cm_region_task_list.events({
    "click .go_button": function(event){
      var start = parseInt($(event.target).attr("region_start_line"));
      ace_editor.scrollToLine(start, true, true);
      event.stopPropagation();
    },
    "click .archived_tasks_toggle": function(event){
      var shown = $(event.target).hasClass("archived_shown");
      if (shown){
        $(event.target).removeClass("archived_shown");
        $(event.target).next().slideUp();
        $(event.target).text("Show Archived Tasks")
      }
      else{
        $(event.target).addClass("archived_shown");
        $(event.target).next().slideDown();
        $(event.target).text("Hide Archived Tasks")

      }
    }
  });

  Template.cm_region_task_list.onRendered(function(){
  //  $('.accordion_region').accordion("refresh");
    $(".dropdown-menu li a").click(dropDownClickHandler);
    this.$(".accordion-header").unbind('click');
    this.$(".accordion-header").click(function(event){
      var panel = $(this).next();
      var isOpen = panel.is(':visible');
      // open or close as necessary
      panel[isOpen? 'slideUp': 'slideDown']()
          // trigger the correct custom event
          .trigger(isOpen? 'hide': 'show');
      // stop the link from causing a pagescroll
      return false;
    });

    this.$(".archived_tasks_toggle").next().removeClass("toggled");
    this.$(".archived_tasks_toggle").next().slideUp();

    this.$(".accordion-header").hover(function(event){
      var region_id = $(this).attr("region_id");
      $("#" + region_id).toggleClass("highlighted_region");
    });

    this.$(".go_button").click(function(event){
      var start = parseInt($(event.target).attr("region_start_line"));
      ace_editor.scrollToLine(start, true, true);
      event.stopPropagation();
    });
  })

  Template.cm_task.onRendered(function(){
    this.$(".accordion-header").unbind('click');
    this.$(".accordion-header").click(function(event){

      var panel = $(this).next();
      var isOpen = panel.is(':visible');
      // open or close as necessary
      panel[isOpen? 'slideUp': 'slideDown']()
          // trigger the correct custom event
          .trigger(isOpen? 'hide': 'show');
      // stop the link from causing a pagescroll
      return false;
    });
    this.$(".accordion-header").next().slideUp();

  })

  Template.cm_region.helpers({
    minusOne: function(num){
      return num-1;
    }
  })

  Template.cm_region.onRendered(function(){
    if (editor_rendered){
      updateRegions();
      if (maxLineNumber < ace_editor.getSession().getLength() ){
      //  ace_editor.remove(new Range(maxLineNumber+1,0,ace_editor.getSession().getLength(),1000000));
        ace_editor.selection.moveCursorToPosition({row: maxLineNumber-1, column: 1000000});
        ace_editor.selection.selectTo(ace_editor.getSession().getLength(),1000000);
        ace_editor.removeLines();
        if(DEBUG) alert("lines programtically removed! In general, this should not happen.  ")
      }

    }
    this.$(".innertext_region").hover(function(){
      var region_id = $(this).parent().attr("id");
      $(this).toggleClass("highlight_text")
      $("#region_acc_" + region_id).toggleClass("highlighted_region2");

    })
  })

  function updateTask(state){
    var task_in_creation_id = Session.get("TASK_ID_IN_CREATION");
    if (task_in_creation_id== null){
      if (DEBUG) alert("task ID null, it should not happen. ");
      return;
    }
    var title_store = $("#cm_dialog_title").val();
    desc_store = $("#cm_dialog_desc").val();
    deliverable_store = $("#cm_dialog_delverbale").val();

    if (task_in_creation_id == null)
    {
      alert("task ID should have been received.");
    }
    var state = "in_creation";
    if (Session.get("EDIT_MODE")){
      state = "in_edit";
    }

    Meteor.call('updateTask', task_in_creation_id, title_store, desc_store, deliverable_store, $("#cm_dialog_region_dropdown_btn").val(),state,  function (error, result) {
      if (error) {
        if(DEBUG)console.log(error);
      } else {

      }
    });
  }

  function dropDownClickHandler(event){
    if(DEBUG) console.log("dropdown menu clicked:" + $(this).text());

    if($(this).attr("value") == "new"){
      Session.set("REGION_SELECTION", true);
      $(".tasks_regions").css("pointer-events", "none");
      if(tutorial_select_region_flag){
        tutorial_select_region_flag = !tutorial_select_region_flag;
        alertMessage(tutorial_select_region_msg, "info", 4000);
      }

      $(".new_region").removeClass("hidden");
      $(this).next('ul').toggle();
      dialog.dialog( "close" );
      //alertMessage("Choose where you will create a new region by pressing one of the buttons.", "info");
    }
    else{
      $("#cm_dialog_region_dropdown_btn").text($(this).text());
      $("#cm_dialog_region_dropdown_btn").val($(this).attr("value"));
      $(this).next('ul').toggle();
      dialog.dialog('option', 'position',{of: "#cm_code_editor"});
    }
    // start to add new tasks
    updateTask();

  }

  Template.cm_region.onRendered(function(){
    var region_id = $(this).attr("id");
    if (Session.get("LOCK") && Session.get("MY_LOCKED_REGION") != region_id){
      var value = parseFloat($( "#mask_slider" ).slider( "option", "value" ))/100.0;
      $(".blurred").css("background", "rgba(255,255,255," + (value)+")");
      $(".blurred").css("border", "solid 1px rgba(255,255,255," + (1 - value) + ")");
    }
  });
  Template.cm_regions.events({

      "click .new_region button": function (event) {
        var start = parseInt($(event.target).attr("start")),
        end = parseInt($(event.target).attr("end"));

        if(DEBUG) console.log("click #new_region button:("+ start + ","+ end+")");
        var region_name = chance.first();
        console.log("region_name(" + region_name + "):" +  (Regions.findOne({name:region_name})== "undefined"));
        while(  Regions.findOne({name:region_name})!= undefined){
          region_name = chance.first();
        }

        Meteor.call("addRegion", start, start + minNumLineRegion, region_name, function(error, result){
            if (error){
              console.log(error);
            }
            else{
              if(DEBUG) console.log("region_id: :" + result);
              $("#cm_dialog_region_dropdown_btn").val(result);
              updateTask();
            }
        });
        // programmtically add lines

        var emptylines = Array(minNumLineRegion-2).join('.').split('.') ;
        ace_editor.getSession().doc.insertLines(start,["# region " + region_name + " end "]);
        ace_editor.getSession().doc.insertLines(start,emptylines);
        ace_editor.getSession().doc.insertLines(start,["# region " + region_name + " start "]);

        $(".new_region").addClass("hidden");
//        $('.accordion_region').accordion("refresh");
        // insert region and open the dialog again.
        dialog.dialog('option', 'position',{of: "#cm_code_editor"});
        $(".tasks_regions").css("pointer-events", "auto");
        dialog.dialog( "open" );
        Session.set("REGION_SELECTION", false);
        $("#cm_dialog_region_dropdown_btn").text("Region " + region_name);
      }

  });

  Template.cm_task_view.onRendered(function(){
    if(DEBUG)console.log(" cm_task_view onRendered");

    var region = $("#cm_dialog_region_dropdown_btn"),
    title = $( "#cm_dialog_title" ),
    deliverable = $( "#cm_dialog_delverbale" ),
    desc = $( "#cm_dialog_desc" ),
    allFields = $( [] ).add(region).add( title ).add( desc ).add( deliverable );
    tips = $( ".validateTips" );

    $(".dropdown-menu li a").click(dropDownClickHandler);
    $(".accordion-expand-all").data('isAllOpen',true);

    $(".accordion-expand-all").click(function(event){
      var isAllOpen = $(this).data('isAllOpen');
      var taskAreas = $('.accordion_task .ui-accordion-content ');
      var regionAreas = $('.accordion_region .ui-accordion-content ');

      regionAreas[isAllOpen? 'hide': 'show']();
        //  .trigger(isAllOpen? 'hide': 'show');
      taskAreas[isAllOpen? 'hide': 'show']();
          //.trigger(isAllOpen? 'hide': 'show');
      var expandLink = $('.accordion-expand-all');

      if(isAllOpen){
        expandLink.text('Expand All');
      }
      else {
        expandLink.text('Collapse All');
      }
      var isAllOpen = $(this).data('isAllOpen',!isAllOpen);
    });/*
    $(".ui-accordion-content").show( function(event){
      var isAllOpen = !$('.accordion_region .ui-accordion-content ').is(':hidden');
      isAllOpen = isAllOpen && !$('.accordion_task .ui-accordion-content ').is(':hidden');

      var expandLink = $('.accordion-expand-all');

      if(isAllOpen){
          expandLink.text('Collapse All')
              .data('isAllOpen', true);
      }
    });
    $(".ui-accordion-content").hide( function(event){
      var expandLink = $('.accordion-expand-all');
      expandLink.text('Expand All').data('isAllOpen', false);
    });


*/
//call this
// function (_title, _desc, _deliverable, _region_id) {
  //



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

      valid = valid && checkRegion($("#cm_dialog_region_dropdown_btn"));
      valid = valid && checkLength(title, "Title", 0, 140);
      valid = valid && checkLength(desc, "Description", 0, 500);
      if( valid == false)
        return false;
      // add task
      var title_store = $("#cm_dialog_title").val();
      var desc_store = $("#cm_dialog_desc").val();
      var deliverable_store = $("#cm_dialog_delverbale").val();
      var region_id = $("#cm_dialog_region_dropdown_btn").val();
      var state = "task_open"

      if (Session.get("EDIT_MODE")){
        Session.set("LOCK", false);
        Session.set("MY_LOCKED_TASK", null);
      }

      Meteor.call('updateTask', Session.get("TASK_ID_IN_CREATION"), title_store, desc_store, deliverable_store,region_id, state,  function (error, result) {
        if (error) {
          if(DEBUG)alert(error);
        } else {
          if(DEBUG)console.log(result);
        }
      });
      taskID = Session.get("TASK_ID_IN_CREATION");
      // console.log(typeof(taskID)+" "+title_store+ " "+desc_store+" "+deliverable_store);

      if (Session.get("EDIT_MODE")){
        if(DEBUG) console.log(" hahf ");
    //    debugger;
        Meteor.call('logTask', taskID, title_store, desc_store,deliverable_store ,region_id,"edit_complete");

      }else{
        Meteor.call("logTask",  taskID, title_store, desc_store,deliverable_store ,region_id, "create_complete");
      }

      return true;

    }

    resetDialog = function (){
      $("#crete_task_form")[0].reset();
      $("#cm_dialog_region_dropdown_btn").val("null");
      $("#cm_dialog_region_dropdown_btn").text("Select Region First!");
      allFields.removeClass( "ui-state-error" );
    }

    dialog = $( "#create_task_dialg" ).dialog({
      autoOpen: false,
      height: "auto",
      width: 400,
      modal: true,
      position: {of: "#cm_right_pane"},
      closeOnEscape: false,
      buttons: {
        "Submit": function(){
          if(addTask()){
            if(DEBUG) console.log("a task should be created")
            dialog.dialog("close");
            resetDialog();
            Session.set("TASK_ID_IN_CREATION",null)
            if(tutorial_lock_task_flag){
              tutorial_lock_task_flag = !tutorial_lock_task_flag;
              alertMessage(tutorial_lock_task_msg, "warning", 6000);
            }
          }
        },
        Cancel: function() {
          // remove task
          if (Session.get("EDIT_MODE")){
            Session.set("LOCK", false);
            Session.set("MY_LOCKED_TASK", null);
            Meteor.call('unlockTask',Session.get("TASK_ID_IN_CREATION"), Meteor.user().username, function(error, result){
              if(error){
                if(DEBUG) alert(error)
                else console.error(error);
              }
            });
          }
          else{
            Meteor.call('deleteTask',Session.get("TASK_ID_IN_CREATION"));
            Meteor.call("logTask",  Session.get("TASK_ID_IN_CREATION"), "", "", "", "", "Cancel the new task creation");
          }
          dialog.dialog( "close" );
          resetDialog();
        }
      },
      close: function() {
        if (DEBUG) console.log("dialog closed");
        if (!Session.get("REGION_SELECTION")){
          Session.set("TASK_ID_IN_CREATION",null);
          Session.set("EDIT_MODE",false);
        }
      }
    });
  });

  Template.cm_task.events({
    "click .task_lock_button": function(event){
      if(Session.get("LOCK")){
        alertMessage("I know you are super-geneious but you can do one task at a time, for the sake of other code-monkeys.")
        return;
      }
      var task_id = $(event.target).attr("task_id");
      if (task_id == null){
        alert("task id is null for this button something is wrong. ")
        return;
      }
      title = $("#cm_dialog_title").val();
      desc = $("#cm_dialog_desc").val();
      deliverable = $("#cm_dialog_delverbale").val();
      region = $("#cm_dialog_region_dropdown_btn").val()
      Meteor.call("logTask",  "", "", "", "", "", "Start (or Edit) the task");
      Meteor.call("lockTask", task_id, Meteor.user().username,"in_progress", function(error, locked_region){
        if (error){
          alert(error);
        }
        else{

          $(event.target).removeClass("btn-success");
          $(event.target).removeClass("btn-danger");

          Session.set("LOCK", true);
          Session.set("MY_LOCKED_REGION", locked_region);
          Session.set("MY_LOCKED_TASK", task_id);
          $("#" + locked_region).removeClass("blurred");

          ace_editor.setReadOnly(false);
          $slider = $('#mask_slider')
          setTimeout(function(){
            $slider.slider('option', 'slide').call($slider);
          },10);
        }
      });
    },
  /*  "click .task_delete_button": function(event){
      var task_id = $(event.target).attr("task_id");

      if (task_id == null || Session.get("MY_LOCKED_TASK") == null){
        alert("task id is null for this button something is wrong. ")
        return;
      }
      if ( confirm('Are you sure you want to delete this task?') ){
        Meteor.call("logTask",  "", "", "", "", "","Delete");

        dialog.dialog( "close" );
        resetDialog();
        Session.set("TASK_ID_IN_CREATION",null);
        Session.set("EDIT_MODE",false);
      }

    },*/
    "click .task_edit_button" : function(event){
      var task_id = $(event.target).attr("task_id");

      if (task_id == null ){
        alert("task id is null for this button something is wrong. ")
        return;
      }

      Meteor.call("lockTask", task_id, Meteor.user().username, "in_edit", function(error, locked_region){
        if (error){
          alert(error);
        }
        else{
          Session.set("LOCK", true);
          Session.set("MY_LOCKED_TASK", task_id);

          Meteor.call("logTask", task_id, "", "", "", "", "Edit");


          if (Session.get("TASK_ID_IN_CREATION") == null){
            var task = Tasks.findOne(task_id);
            if (task == null){
              if (DEBUG) alert("Cannot find the task : " + taskId);
              return;
            }
            if(task.state!="in_edit"){
              if (DEBUG) alert("You cannot edit the task. It is not in progress state.");
              return;
            }

            $("#cm_dialog_title").val(task.title);
            $("#cm_dialog_desc").val(task.desc);
            $("#cm_dialog_delverbale").val(task.deliverable);
            $("#cm_dialog_region_dropdown_btn").text("Region " + Regions.findOne(task.region).name)
            $("#cm_dialog_region_dropdown_btn").attr("value",task.region)
            dialog.dialog('option', 'position',{of: "#cm_code_editor"});
            dialog.dialog("open");
            Session.set("TASK_ID_IN_CREATION",task_id);
            Session.set("EDIT_MODE",true);

          }
          else{
            if(DEBUG) alert("EDIT new task / Session.get(\"TASK_ID_IN_CREATION\") not null");
          }
        }
      });

    },
    "click .task_unlock_button": function(event){
      var task_id = $(event.target).attr("task_id");
      if (task_id == null || Session.get("MY_LOCKED_TASK") == null){
        alert("task id is null for this button something is wrong. ")
        return;
      }
      Meteor.call("unlockTask", task_id, Meteor.user().username, function(error, result){
        if (error){
          alert(error);
        }
        else{
          Meteor.call("logTask",  task_id, "", "", "", "", "Leave for now (unlock)");

          $(".blurred").css("background", "");
          $(".blurred").css("border", "");
          Session.set("LOCK", false);
          Session.set("MY_LOCKED_REGION", null);
          Session.set("MY_LOCKED_TASK", null);
          ace_editor.setReadOnly(true);
          $(".existing_region").removeClass("blurred");
        }
      });

    },
    "mouseover .task_archive_button": function(event){
      if(tutorial_archive_task_flag){
        tutorial_archive_task_flag = !tutorial_archive_task_flag;
        alertMessage(tutorial_archive_task_msg, "warning", 4000);
      }
    },
    "click .task_archive_button": function(event){
      var task_id = $(event.target).attr("task_id");
      Meteor.call("logTask",  task_id, "", "", "", "", "Archive");
      if (task_id == null){
        alert("task id is null for this button something is wrong. ")
        return;
      }
      Meteor.call("archiveTask", task_id, Meteor.user().username, function(error, result){
        if (error){
          alert(error);
        }
        else{
          $(".blurred").css("background", "");
          $(".blurred").css("border", "");

          Session.set("LOCK", false);
          Session.set("MY_LOCKED_REGION", null);
          Session.set("MY_LOCKED_TASK", null);

          ace_editor.setReadOnly(true);
          $(".existing_region").removeClass("blurred");

        }
      });
    }
    ,
    "click .task_unarchive_button": function(event){
      var task_id = $(event.target).attr("task_id");
      Meteor.call("logTask",  task_id, "", "", "", "", "unarchive");
      if (task_id == null){
        alert("task id is null for this button something is wrong. ")
        return;
      }
      Meteor.call("unarchiveTask", task_id, Meteor.user().username, function(error, result){
        if (error){
          alert(error);
        }
      });
    }
  });

  Template.cm_task_view.events({

    "click #clean": function(event){
      if (confirm('Clean up all editing')) {
          ace_editor.setValue("");
          Meteor.call('removeAll', function(error, result){
            if(error){
              if(DEBUG) alert(error)
            }
            else{
              location.reload();
            }
          });
          //  Tasks.remove({});
          //  Messages.remove({});
        //  _.each(Messages.find().fetch(), function(item){
        //
        // });
      } else {
          // Do nothing!
      }
    },

    "click #btn_creat_task": function (event) {

      if (Meteor.user()== null){
        alertMessage("Sign up please!", "danger")
        return;
      }
      else if (Session.get("LOCK")){
        alertMessage("You cannot create a new task while doing another task. Press \"unlock\" the current task. ", "danger");
        return;
      }
      else{
        if(DEBUG) console.log("Create new task button clicked");
      }

      if ( tutorial_create_task_flag ) {
        alertMessage(tutorial_create_task_msg, "warning", 4000);
        tutorial_create_task_flag = !tutorial_create_task_flag;
      }

      if (Session.get("TASK_ID_IN_CREATION") == null){
        dialog.dialog( "open" );

        Meteor.call('addTask', "", "", "", "", function (error, result) {
          if (error) {
            if(DEBUG) alert(error);
            alertMessage("Could not issue a new task id. Try this again.");
            dialog.dialog("close");
          } else {
            if(DEBUG)console.log("new task id is assigned:" + result);
            Session.set("TASK_ID_IN_CREATION",result);
          }
        });
      }
      else{
        if(DEBUG) alert(" create new task / button not null . Sang should figure out why. ");
      }
    }/*,
    "click .dropdown-menu li a" : function (event) {
      if(DEBUG) console.log("dropdown menu clicked:" + $(this).text());
      if($(this).attr("value") == "new"){
        $(".new_region").removeClass("hidden");
        dialog.dialog( "close" );
        $(this).next('ul').toggle();
      }
      else{
        $("#cm_dialog_region_dropdown_btn").text($(this).text());
        $("#cm_dialog_region_dropdown_btn").val($(this).text());
        $(this).next('ul').toggle();
      }
    }*/
  });

  Template.registerHelper("isWorkingNow",function(){
    return (Session.get("LOCK") == true)
  });
  Template.registerHelper("notMine",function(region_id){
    return (Session.get("MY_LOCKED_REGION") != region_id)
  });

  Template.cm_task.helpers({

    isOwner:function(user_name){
      if(DEBUG) console.log(user_name + "," +Meteor.userId().username + "," + (user_name == Meteor.userId().username));
        return (user_name == Meteor.user().username);
    },
    isTaskOpen: function(_state){
      if ( _state == "task_open"){
        return true;
      }
      return false;
    },isTaskLocked: function(_state){
      if ( _state == "in_progress" || _state == "in_edit"){
        return true;
      }
      return false;
    }
    ,isInProgress: function(_state){
      if ( _state == "in_progress" ){
        return true;
      }
      return false;
    }
    ,isArchived: function(_state){
      if ( _state == "archived" ){
        return true;
      }
      return false;
    }
    ,stringifyTaskState: function(_state){
      return _state.toUpperCase().replace("_", " ");;
    }
  });
  Template.cm_header.events({
    "click #run_editor_code": function (event) {
      runPythonCode(true);
    },
    "mouseover #run_editor_code": function (event) {
      if(tutorial_run_selection_flag){
        tutorial_lock_task_flag = !tutorial_lock_task_flag;
        tutorial_run_selection_msg(tutorial_lock_task_msg, "warning", 4000);
      }else{
        alertMessage("Pressing this button will run the selected code in the editor. \n It runs the entire code if there's no selection.","info");
      }
     }
  });

  Template.cm_runtime.onRendered(function(){
    $("#run_time_input").keyup(function(){
      if (event.which == 13) {
          runPythonCode();
          $("#run_time_input").val("");
          $("#run_time_output").animate({
scrollTop: $("#run_time_output").get(0).scrollHeight}, 10);
;

      }
    })

    Sk.read = function(){
      return "if this is going to work";
    }
    //Sk.buildinFiles["files"]["data.txt"] = "how do you do?";
      outf = function (text) {
        var output = $("#run_time_output");
        output.append(text)
      };
      builtinRead = function (x) {
          if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
                  throw "File not found: '" + x + "'";
          return Sk.builtinFiles["files"][x];
      };

      runPythonCode = function(editor) {
        // if editor is true, it means the button is clicked.
        var prog = $("#run_time_input").val();
        // add print statement if no print is found in prog
        if(  prog.slice(0, 5) != "print")
        {
          prog = "print " + prog
        }

        if (editor){ // if buttonclicked, just run the whole thing.
          if (ace_editor.getSelectedText().length > 0){
              prog = ace_editor.getSelectedText();
          }
          else{
              prog = ace_editor.getValue();
          }
        }
        else
        {
          prog = ace_editor.getSelectedText() + "\n" + prog
        }

         Sk.pre = "run_time_output";
         Sk.configure({output:outf, read:builtinRead});
         (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';
         var myPromise = Sk.misceval.asyncToPromise(function() {
             return Sk.importMainWithBody("<stdin>", false, prog, true);
         });
         myPromise.then(function(mod) {
               console.log('success');
           },function(err) {
             outf(err.toString() + "\n");
         }).done();

        }
  //    });
  //  });

  })



  Template.body.helpers({
    taskViewMode : function(){

      if (task_view_flag == null ){
        task_view_flag = location.search.split("&")[0].replace("?","").split("=")[1]
        task_view_flag = task_view_flag == "true" ? true : false
      }
      // console.log(location.search.split("&")[1].split("=")[1]);
      console.log(task_view_flag);
      return task_view_flag;
    },
    admin: function(){

      if (admin_mode==null){
        admin_mode = location.search.split("&")[1].split("=")[1]
        admin_mode = admin_mode = admin_mode == "true" ? true : false
      }
      console.log(admin_mode);
      return admin_mode
    },
    loggedin : function(){

    }
  });

  Template.cm_header.onRendered(function(){
    $( "#mask_slider" ).slider({
      min: 0,
      max: 95,
      value:50,
      range: "min",
      animate: "fast",
      slide: function( event, ui ) {
        var value = parseFloat($( "#mask_slider" ).slider( "option", "value" ))/100.0;
        $(".blurred").css("background", "rgba(255,255,255," + (value)+")");
        $(".blurred").css("border", "solid 1px rgba(255,255,255," + (1 - value) + ")");
      }
    });
  })

  Template.body.onRendered(function(){


    alertMessage = function(string, type, time){
    //  if(myMsg) clearTimeout(myMsg);
      if (time == null)
        time = 2000;
      if (type == null)
        type = "info";
      $("#alert-msg").addClass("alert-" + type);
      $("#alert-msg").text(string);
      $("#alert-msg").fadeIn( 300 ).delay( time ).fadeOut( 400 );

    }

    alertMessage("You can only write code by creating and locking a task inside the region. Create or lock a task.", "info", 4000);

    initState = function(){
      if ( Session.get("TASK_ID_IN_CREATION") != null ){
        if (Session.get("EDIT_MODE") == false){
          addTask();
        }
        Session.set("TASK_ID_IN_CREATION",null);
        Session.set("EDIT_MODE",false);
      }

      if (Session.get("LOCK") == true){
        Meteor.call("unlockTask", Session.get("MY_LOCKED_TASK"), Meteor.user().username);
        Session.set("MY_LOCKED_REGION", null);
        Session.set("MY_LOCKED_TASK", null);
        Session.set("LOCK", false);
      }

    };
    initState();
    window.onbeforeunload = initState;
  })

  Meteor.startup(function(){
  /*  $.getScript('http://www.skulpt.org/static/skulpt.min.js', function(error){
      if(DEBUG)console.log(error);
      $.getScript('http://www.skulpt.org/static/skulpt-stdlib.js', function(error){
        if(DEBUG)console.log(error);
      });
    });

    $.getScript('https://cdnjs.cloudflare.com/ajax/libs/chance/0.5.6/chance.min.js', function(){
    // script has loaded
      if(DEBUG) console.log("chance script imported");
    });*/
  });

}
