ace_editor = null;
minNumLineRegion = 5;
editor_rendered = false;
//accordionRegionRenedered = false;
Session.set("taskID",null);

var Range = require('ace/range').Range;

//version = Meteor.collection("version_number")
if (!Meteor.isClient)
  console.log("crowd_projects.js Error: Meteor.isClient:"+ Meteor.isClient)

if (Meteor.isClient) {

  Meteor.subscribe("tasks");
  Meteor.subscribe("regions");

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
  // Use the Packery jQuery plugin
    if(DEBUG) console.log("task_on_rendered");
  /*  $( ".accordion_region" ).accordion({
      collapsible: true,
      heightStyle: "content",
      active:true,
      header:"h2",
      beforeActivate: function(event, ui) {
           // The accordion believes a panel is being opened
          if (ui.newHeader[0]) {
              var currHeader  = ui.newHeader;
              var currContent = currHeader.next('.ui-accordion-content');
           // The accordion believes a panel is being closed
          } else {
              var currHeader  = ui.oldHeader;
              var currContent = currHeader.next('.ui-accordion-content');
          }
           // Since we've changed the default behavior, this detects the actual status
          var isPanelSelected = currHeader.attr('aria-selected') == 'true';

           // Toggle the panel's header
          currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));

          // Toggle the panel's icon
          currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);

           // Toggle the panel's content
          currContent.toggleClass('accordion-content-active',!isPanelSelected)
          if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }

          return false; // Cancels the default action
      }
    });
    accordionRegionRenedered = true;
    $( ".accordion_task.not-rendered" ).accordion({
      collapsible: true,
      heightStyle: "content",
      active:true,
      header:"h3",
      beforeActivate: function(event, ui) {
           // The accordion believes a panel is being opened
          if (ui.newHeader[0]) {
              var currHeader  = ui.newHeader;
              var currContent = currHeader.next('.ui-accordion-content');
           // The accordion believes a panel is being closed
          } else {
              var currHeader  = ui.oldHeader;
              var currContent = currHeader.next('.ui-accordion-content');
          }
           // Since we've changed the default behavior, this detects the actual status
          var isPanelSelected = currHeader.attr('aria-selected') == 'true';

           // Toggle the panel's header
          currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));

          // Toggle the panel's icon
          currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);

           // Toggle the panel's content
          currContent.toggleClass('accordion-content-active',!isPanelSelected)
          if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }

          return false; // Cancels the default action
      }
    });

    $( ".accordion_task.not-rendered" ).removeClass("not-rendered");
*/
  });

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

        updateRegions = function(){
          var gutterStart = $("#editor .ace_gutter :first-child");
          var firstLine = gutterStart.children().first();
          var numFirstLine = parseInt(firstLine.text());
          var margin_top = gutterStart.css("margin-top");
          lineHeight = firstLine.css("height");
          lineHeight = parseInt(lineHeight.substring(0,lineHeight.indexOf("px")));

          margin_top = parseInt(margin_top.substring(0,margin_top.indexOf("px")));
          console.log("changeScrollTop, numFirstLine:" + numFirstLine + " margin_top:" + margin_top)
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
          if (regionUpdated) {
            updateRegions();
          }
          regionUpdated = false;
        });
      };
    },
    setMode: function(){
      return function(editor){
        ace_editor.setReadOnly(true);
        if (ace_editor.getValue().length==0)
          ace_editor.setValue("# code monkey editors Ver1. (python)",-1)
        if(DEBUG)console.log("setMode");
      }
    }
  });

  Template.cm_region_task_list.onRendered(function(){
  //  $('.accordion_region').accordion("refresh");
    $(".dropdown-menu li a").click(dropDownClickHandler);

  })

  Template.cm_task.onRendered(function(){
  /*  $( ".accordion_task.not-rendered" ).accordion({
      collapsible: true,
      heightStyle: "content",
      active:false,
      header:"h3"
    });

    $( ".accordion_task.not-rendered" ).removeClass("not-rendered");

    $('.accordion_task').accordion("refresh");*/
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

  function updateTask(){
    if (Session.get("taskID") == null){
      if (DEBUG) alert("task ID null, it should not happen. ");
      return;
    }
    var title_store = $("#cm_dialog_title").val();
    desc_store = $("#cm_dialog_desc").val();
    deliverable_store = $("#cm_dialog_delverbale").val();

    if (Session.get("taskID") == null)
    {
      alert("task ID should have been received.");
    }

    Meteor.call('updateTask', Session.get("taskID"), title_store, desc_store, deliverable_store, $("#cm_dialog_region_dropdown_btn").val(), function (error, result) {
      if (error) {
        console.log(error);
      } else {
        console.log(result);
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
            }
        });
        // programmtically add lines
        var emptylines = Array(minNumLineRegion).join('.').split('.') ;
        ace_editor.getSession().doc.insertLines(start,emptylines);
        $(".new_region").addClass("hidden");
//        $('.accordion_region').accordion("refresh");
        // insert region and open the dialog again.
        dialog.dialog( "open" );
        $("#cm_dialog_region_dropdown_btn").text("Region " + region_name);


      }
      ,"change #cm_dialog_title": updateTask
      ,"change #cm_dialog_desc": updateTask
      ,"change #cm_dialog_delverbale": updateTask
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

    $(".accordion-header").click(function(event){
      var panel = $(this).next();
      var isOpen = panel.is(':visible');
      // open or close as necessary
      panel[isOpen? 'slideUp': 'slideDown']()
          // trigger the correct custom event
          .trigger(isOpen? 'hide': 'show');

      // stop the link from causing a pagescroll
      return false;
    });
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

      valid = valid &&  checkRegion($("#cm_dialog_region_dropdown_btn"));
      valid = valid && checkLength(title, "Title", 0, 140);
      valid = valid && checkLength(desc, "Description", 5, 500);

      if (valid){
        // add task
        var title_store = $("#cm_dialog_title").val();
        desc_store = $("#cm_dialog_desc").val();
        deliverable_store = $("#cm_dialog_delverbale").val();

        Meteor.call('addTask', title_store, desc_store, deliverable_store, $("#cm_dialog_region_dropdown_btn").val(), function (error, result) {
          if (error) {
            console.log(error);
          } else {
            console.log(result);
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

          }
        },
        Cancel: function() {
          dialog.dialog( "close" );
          resetDialog();
          // remove task
          createdTaskId = null;
          Meteor.call('deleteTask',Session.get("taskId"));
          Session.set("taskID",null)

        }
      },
      close: function() {
        if (DEBUG) console.log("dialog closed");
      }
    });
  });

  Template.cm_task_view.events({

    "click #btn_creat_task": function (event) {

      if (Meteor.user()== null){
        alert("Sign up please!")
        return;
      }
      else{
        if(DEBUG) console.log("Create new task button clicked");
        dialog.dialog( "open" );
      }

      if (Session.get("taskId") == null){
        Meteor.call('addTask', "", "", "", "", function (error, result) {
          if (error) {
            console.log(error);
          } else {
            console.log(result);
            Session.set("taskID",result);
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

  Meteor.startup(function(){
    $.getScript('https://cdnjs.cloudflare.com/ajax/libs/chance/0.5.6/chance.min.js', function(){
    // script has loaded
      Session.set('chanceReady', true);
      if(DEBUG) console.log("chance script imported");
    });
  });

}
