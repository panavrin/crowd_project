(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/js/crowds_project.js                                         //
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
                                                                       //
        return cm.setOption("indentWithTabs", true);                   // 29
      };                                                               //
    },                                                                 //
    setMode: function () {                                             // 32
      return function (editor) {                                       // 33
        console.log("when is it running?");                            // 34
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
  Accounts.ui.config({                                                 // 49
    passwordSignupFields: "USERNAME_ONLY"                              // 50
  });                                                                  //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);
