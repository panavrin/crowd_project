(function(){
Template.__checkName("cm_header");
Template["cm_header"] = new Template("Template.cm_header", (function() {
  var view = this;
  return [ Spacebars.include(view.lookupTemplate("loginButtons")), "\n	Hello this is the header" ];
}));

}).call(this);
