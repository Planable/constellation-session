// Hook in to constellation UI

var Constellation = Package["planable:console"].API;

Constellation.addTab({
  name: "Session",
  headerContentTemplate: "Constellation_session_header",
  menuContentTemplate: "Constellation_session_menu",
  mainContentTemplate: "Constellation_session_main",
  guideContentTemplate: "Constellation_session_guide",
});

var ReactiveDictDep = new Tracker.Dependency();
var currentDict = new ReactiveVar({
  name: "Session",
  dict: Session,
});

// We're not going to get newly created reactive dictionaries this way until a change is made
var firstRun = true;
// Check if someone has added something to the Session every 3 seconds
Meteor.setInterval(function () {
  var currentTab = Constellation && Constellation.getCurrentTab();
  if ((currentTab && currentTab.id === "Session") || firstRun) {
    firstRun = false;
    // This could get heavy for large reactive dictionaries, so we're going for every 3 seconds
    var change = false;
    var siftedDict = {};
    EditableJSON = Package["planable:editable-json"].EditableJSON;
    var currentJSON =
      (EditableJSON && EditableJSON.retrieve("constellation_session")) || {};
    _.each(
      (currentDict && currentDict.get().dict.keys) || {},
      function (val, key) {
        if (excludedKey(val, key)) {
          return;
        }
        if (
          _.isUndefined(currentJSON[key]) ||
          EJSON.stringify(currentJSON[key]) !== val
        ) {
          change = true;
        }
      }
    );
    if (change) {
      ReactiveDictDep.changed();
    }
  }
}, 3000);

var excludedKey = function (val, key) {
  var excluded = Constellation.excludedSessionKeys();
  var keyExcluded = _.find(excluded, function (prefix) {
    return key.indexOf(prefix) > -1;
  });
  return keyExcluded || _.isUndefined(val) || val === "undefined";
};

EditableJSON = Package["planable:editable-json"].EditableJSON;

EditableJSON.afterUpdate(function (store, action, JSONbefore, documentsUpdated) {
  // Make the changes
  // TODO -- this is  quick and dirty and complete overkill -- resetting (almost) everything in the Session.keys
  //         when we can just read the `action` parameter and make the exact granular changes needed
  var cd = currentDict.get();
  _.each(this, function (val, key) {
    cd.dict.set(key, val);
  });
  // Need to make sure any field names that have been changed or deleted have their corresponding session value deleted
  var missingKeys = _.difference(_.keys(JSONbefore),_.keys(this));
  _.each(missingKeys, function (key) {
    var cd = currentDict.get();
	cd.dict.set(key, undefined); // To maintain reactivity
	Tracker.flush();
    delete cd.dict.keys[key]; // Doesn't maintain reactivity by itself
  });
  ReactiveDictDep.changed();
},'constellation_session');

Template.Constellation_session_header.helpers({
  keyCount: function () {
	ReactiveDictDep.depend();
	return Object.keys(_.filter(currentDict.get().dict.keys, function (val, key) { return !excludedKey(val, key); })).length;
  }
});

Template.Constellation_session_main.helpers({
  reactivedict: function () {
    ReactiveDictDep.depend();
    var siftedDict = {};
    _.each(currentDict.get().dict.keys, function (val, key) {
      if (excludedKey(val, key)) {
		return;
	  }
      siftedDict[key] = EJSON.parse(val);
    });
    return siftedDict;
  }
});

Template.Constellation_session_menu.helpers({
  dictionaries: function () {
    ReactiveDictDep.depend();
    var dictionaries = [];
	// for ... in gets deprecated warning in Chrome
    // for (var member in window) {
	_.each(Object.keys(window), function (member) {
      if (member !== 'webkitStorageInfo' && member !=='webkitIndexedDB' && window[member] instanceof ReactiveDict) {
        dictionaries.push({
          name: member,
          dict: window[member]
        });
      }
    });
    return dictionaries;
  },
  selected: function () {
    ReactiveDictDep.depend();
    var cd = currentDict.get();
    return (this.name === cd.name) ? true : false;
  }
});

Template.Constellation_session_menu.events({
  'change .Constellation_reactive_dictionaries' : function (evt, tmpl) {
    currentDict.set(Blaze.getData(tmpl.$(evt.target).find(':selected')[0]));
  }
});
