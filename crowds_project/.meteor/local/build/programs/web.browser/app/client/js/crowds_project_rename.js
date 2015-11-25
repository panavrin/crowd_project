(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/js/crowds_project_rename.js                                  //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
                                                                       //
if (Meteor.isClient) {                                                 // 2
  // counter starts at 0                                               //
  Session.setDefault('counter', 0);                                    // 4
  /*                                                                   //
       counter: function () {                                          //
        return Session.get('counter');                                 //
      }                                                                //
    });                                                                //
                                                                       //
    Template.hello.events({                                            //
      'click button': function () {                                    //
        // increment the counter when button is clicked                //
        Session.set('counter', Session.get('counter') + 1);            //
      }                                                                //
    });                                                                //
    */                                                                 //
  Session.setDefault('document', "javascriptDoc");                     // 18
                                                                       //
  Template.cm_code_editor.helpers({                                    // 21
    config: function () {                                              // 22
      return function (cm) {                                           // 23
        cm.setOption("theme", "default");                              // 24
        cm.setOption("lineNumbers", true);                             // 25
        cm.setOption("lineWrapping", true);                            // 26
        cm.setOption("smartIndent", true);                             // 27
        return cm.setOption("indentWithTabs", true);                   // 28
      };                                                               //
    },                                                                 //
    setMode: function () {                                             // 31
      return function (editor) {                                       // 32
        console.log("when is it running?");                            // 33
      };                                                               //
    }                                                                  //
                                                                       //
  });                                                                  //
                                                                       //
  /*                                                                   //
    Template.cm_code_editor.helpers({                                  //
      docid: function() {                                              //
             console.log("docid call");                                //
   return Session.get("document");                                     //
      }                                                                //
    });                                                                //
    */                                                                 //
                                                                       //
  Accounts.ui.config({                                                 // 48
    passwordSignupFields: "USERNAME_ONLY"                              // 49
  });                                                                  //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);
