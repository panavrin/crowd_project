ace_editor = null;
minNumLineRegion = 7;
editor_rendered = false;
//accordionRegionRenedered = false;
Session.set("TASK_ID_IN_CREATION",null);
Session.set("MY_LOCKED_REGION", null);
Session.set("LOCK", false);
"oZkoQypSJJjM7PBGL"
task_view_flag = null;
admin_mode = null;

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
      return Tasks.find( {region:region_id}, {sort: {createdAt:-1}});
  });

  Template.registerHelper("alltasks", function(){
      return Tasks.find({});
  });

  Template.registerHelper("allregions", function(){
      return Regions.find({},{sort: {start: 1}});
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
            var firstLine = gutterStart.children().first();
            var numFirstLine = parseInt(firstLine.text())-1;
            var margin_top = gutterStart.css("margin-top");
            lineHeight = firstLine.css("height");
            lineHeight = parseInt(lineHeight.substring(0,lineHeight.indexOf("px")));

            margin_top = parseInt(margin_top.substring(0,margin_top.indexOf("px")));
            if(DEBUG)console.log("changeScrollTop, numFirstLine:" + numFirstLine + " margin_top:" + margin_top)
            maxLineNumber = -1;
            $(".region").each(function(){
              if(DEBUG)console.log("region");
              var start = parseInt($(this).attr("start")),
              end = parseInt($(this).attr("end"));
              $(this).css("top", (lineHeight * ( parseInt($(this).attr("start") - numFirstLine) ) + margin_top) + "px");
              $(this).css("height", (lineHeight * ( parseInt($(this).attr("end") - parseInt($(this).attr("start")) ))) + "px");
              if (maxLineNumber < end)
                maxLineNumber = end;
            });
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
                updateRegions();

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
          ace_editor.setValue("# code monkey editors Ver1. (python)",-1)
        if(DEBUG)console.log("setMode");
      }
    },


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
  })

  Template.cm_task.onRendered(function(){
    this.$(".accordion-header").unbind('click');
    this.$(".accordion-header").click(function(event){
      this.$(".accordion-header")
      var panel = $(this).next();
      var isOpen = panel.is(':visible');
      // open or close as necessary
      panel[isOpen? 'slideUp': 'slideDown']()
          // trigger the correct custom event
          .trigger(isOpen? 'hide': 'show');
      // stop the link from causing a pagescroll
      return false;
    });
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
  })

  function updateTask(state){
    var task_in_creation_id = Session.get("TASK_ID_IN_CREATION") ;
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

    Meteor.call('updateTask', task_in_creation_id, title_store, desc_store, deliverable_store, $("#cm_dialog_region_dropdown_btn").val(),"in_creation",  function (error, result) {
      if (error) {
        if(DEBUG)console.log(error);
      } else {

      }
    });
  }

  function dropDownClickHandler(event){
    if(DEBUG) console.log("dropdown menu clicked:" + $(this).text());

    if($(this).attr("value") == "new"){
      $(".new_region").removeClass("hidden");
      dialog.dialog( "close" );
      $(this).next('ul').toggle();
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
        ace_editor.getSession().doc.insertLines(start,["# region " + region_name + "  end  (Do not modify below this line. )"]);
        ace_editor.getSession().doc.insertLines(start,emptylines);
        ace_editor.getSession().doc.insertLines(start,["# region " + region_name + " start (Do not modify above this line. )"]);

        $(".new_region").addClass("hidden");
//        $('.accordion_region').accordion("refresh");
        // insert region and open the dialog again.
        dialog.dialog('option', 'position',{of: "#cm_code_editor"});
        dialog.dialog( "open" );
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

    if (Meteor.user().username != "admin"){
      console.log("shi");
        $("#clean").css('visibility', 'hidden');
        // $(".register").css('visibility', 'visible');

    }


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

      valid = valid &&  checkRegion($("#cm_dialog_region_dropdown_btn"));
      valid = valid && checkLength(title, "Title", 0, 140);
      valid = valid && checkLength(desc, "Description", 0, 500);

      if (valid){
        // add task
        var title_store = $("#cm_dialog_title").val();
        desc_store = $("#cm_dialog_desc").val();
        deliverable_store = $("#cm_dialog_delverbale").val();

        Meteor.call('updateTask', Session.get("TASK_ID_IN_CREATION"), title_store, desc_store, deliverable_store,$("#cm_dialog_region_dropdown_btn").val(), "open",  function (error, result) {
          if (error) {
            if(DEBUG)console.log(error);
          } else {
            if(DEBUG)console.log(result);
          }
        });

        return true;
      }
      return false;
    }

    function resetDialog(){
      $("#crete_task_form")[0].reset();
      $("#cm_dialog_region_dropdown_btn").val("null");
      $("#cm_dialog_region_dropdown_btn").text("Create New Region.");
      allFields.removeClass( "ui-state-error" );
    }

    dialog = $( "#create_task_dialg" ).dialog({
      autoOpen: false,
      height: "auto",
      width: 600,
      modal: true,
      position: {of: "#cm_right_pane"},
      buttons: {
        "Create a Task": function(){
          if(addTask()){
            if(DEBUG) console.log("a task should be created")
            dialog.dialog("close");
            resetDialog();
            Session.set("TASK_ID_IN_CREATION",null)
          }
        },
        Cancel: function() {
          dialog.dialog( "close" );
          resetDialog();
          // remove task
          Meteor.call('deleteTask',Session.get("TASK_ID_IN_CREATION"));
          Session.set("TASK_ID_IN_CREATION",null)
        }
      },
      close: function() {
        if (DEBUG) console.log("dialog closed");
      }
    });
  });

  Template.cm_task.events({
    "click .task_lock_button": function(event){
      if(Session.get("LOCK")){
        alert("I know you are super-geneious but you can do one task at a time, for the sake of other code-monkeys.")
        return;
      }
      var task_id = $(event.target).attr("task_id");
      if (task_id == null){
        alert("task id is null for this button something is wrong. ")
        return;
      }
      Meteor.call("lockTask", task_id, Meteor.user().username, function(error, locked_region){
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
          Session.set("LOCK", false);
          Session.set("MY_LOCKED_REGION", null);
          Session.set("MY_LOCKED_TASK", null);
          ace_editor.setReadOnly(true);
          $(".existing_region").removeClass("blurred");

        }
      });

    },

    "click .task_complete_button": function(event){
      var task_id = $(event.target).attr("task_id");
      if (task_id == null){
        alert("task id is null for this button something is wrong. ")
        return;
      }
      Meteor.call("completeTask", task_id, Meteor.user().username, function(error, result){
        if (error){
          alert(error);
        }
        else{
          $(".existing_region").removeClass("blurred");

          Session.set("LOCK", false);
          Session.set("MY_LOCKED_REGION", null);
          ace_editor.setReadOnly(true);


        }
      });

    }


  });

  Template.cm_task_view.events({




    "click #clean": function(event){
      if (confirm('Clean up all editing')) {
          ace_editor.setValue("")
          Meteor.call('removeAll');
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
        alert("Sign up please!")
        return;
      }
      else{
        if(DEBUG) console.log("Create new task button clicked");
        dialog.dialog( "open" );
      }

      if (Session.get("TASK_ID_IN_CREATION") == null){
        Meteor.call('addTask', "", "", "", "", function (error, result) {
          if (error) {
            console.log(error);
          } else {
            console.log(result);
            Session.set("TASK_ID_IN_CREATION",result);
          }
        });
      }
      else{
        if(DEBUG) alert(" create new task / button not null");
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
      if ( _state == "open"){
        return true;
      }
      return false;
    },isTaskLocked: function(_state){
      if ( _state == "in_progress"){
        return true;
      }
      return false;
    }
    ,stringifyTaskState: function(_state){
      return _state.toUpperCase().replace("_", " ");;
    }
  });
  Template.cm_runtime.events({
    "click #run_editor_code": function (event) {
      runPythonCode(true);
    }
  });

  Template.cm_runtime.onRendered(function(){

    $("#run_time_input").keyup(function(){
      if (event.which == 13) {
          runPythonCode();
          $("#run_time_input").val("");
      }
    })
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
        var prog = $("#run_time_input").val();

        if (editor){
          if (ace_editor.getSelectedText().length > 0){
              prog = ace_editor.getSelectedText();

          }else {
              prog = ace_editor.getValue();
          }
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
             outf("\n" + err.toString());
         }).done();
         /*Sk.externalLibraries = {
            numpy : {
                path: 'http://example.com/static/primeronoo/skulpt/external/numpy/__init__.js',
                dependencies: ['/static/primeronoo/skulpt/extaskViewModeternal/deps/math.js'],
            },
            matplotlib : {
                path: '/static/primeronoo/skulpt/external/matplotlib/__init__.js'
            },
            "matplotlib.pyplot" : {
                path: '/static/primeronoo/skulpt/external/matplotlib/pyplot/__init__.js',
                dependencies: ['/static/primeronoo/skulpt/external/deps/d3.min.js'],
            },
            "arduino": {
                path: '/static/primeronoo/skulpt/external/arduino/__init__.js'
            }
        };*/
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

  Template.body.onRendered(function(){
    window.onbeforeunload = function(){

      if ( Session.get("TASK_ID_IN_CREATION") != null ){
        Meteor.call('deleteTask',Session.get("TASK_ID_IN_CREATION"));
        Session.set("TASK_ID_IN_CREATION",null);
      }

      if (Session.get("LOCK") == true){
        Meteor.call("unlockTask", Session.get("MY_LOCKED_TASK"), Meteor.user().username);
        Session.set("MY_LOCKED_REGION", null);
        Session.set("MY_LOCKED_TASK", null);
        Session.set("LOCK", false);
      }

    };

  })



  Meteor.startup(function(){
    $.getScript('http://www.skulpt.org/static/skulpt.min.js', function(error){
      if(DEBUG)console.log(error);
      $.getScript('http://www.skulpt.org/static/skulpt-stdlib.js', function(error){
        if(DEBUG)console.log(error);
      });
    });

    $.getScript('https://cdnjs.cloudflare.com/ajax/libs/chance/0.5.6/chance.min.js', function(){
    // script has loaded
      if(DEBUG) console.log("chance script imported");
    });
  });

}
