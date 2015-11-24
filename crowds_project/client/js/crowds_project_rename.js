
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
  Session.setDefault('document', "javascriptDoc");


  Template.cm_code_editor.helpers({
    config: function() {
      return function(cm) {
        cm.setOption("theme", "default");
        cm.setOption("lineNumbers", true);
        cm.setOption("lineWrapping", true);
        cm.setOption("smartIndent", true);
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

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}




