(function(){
Template.body.addContent((function() {
  var view = this;
  return HTML.DIV({
    "class": "container-fluid"
  }, "\n		\n		", HTML.DIV({
    "class": "row header"
  }, "\n			Ver 2. ", Spacebars.include(view.lookupTemplate("cm_header")), "\n		"), "\n\n		", HTML.DIV({
    "class": "row-fluid fill2 border_live"
  }, "\n			", HTML.DIV({
    "class": "col-md-6 col-lg-6 fill border_live"
  }, "  \n				", Spacebars.include(view.lookupTemplate("cm_code_editor")), "\n			"), "\n			", HTML.DIV({
    "class": "col-md-3 col-lg-3 fill border_live"
  }, " \n			 ", Spacebars.include(view.lookupTemplate("cm_task_view")), "\n			"), "\n			", HTML.DIV({
    "class": "col-md-3 col-lg-3 fill"
  }, " \n		 		", HTML.DIV({
    "class": "row-fluid half_fill border_live"
  }, "\n					", Spacebars.include(view.lookupTemplate("cm_chat")), "\n				"), "\n		 		", HTML.DIV({
    "class": "row-fluid half_fill border_live"
  }, "	\n			 		", Spacebars.include(view.lookupTemplate("cm_runtime")), "\n			 	"), "\n			"), "\n		"), "\n	");
}));
Meteor.startup(Template.body.renderToDocument);

Template.__checkName("cm_code_editor");
Template["cm_code_editor"] = new Template("Template.cm_code_editor", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      docid: Spacebars.call("javascriptDoc"),
      onRender: Spacebars.call(view.lookup("config")),
      onConnect: Spacebars.call(view.lookup("setMode")),
      id: Spacebars.call("editor")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("sharejsCM"));
  });
}));

}).call(this);
