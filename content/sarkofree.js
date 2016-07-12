//
// Sarkofree : extension permettant de faire disparaître
// d'Internet Nicolas Sarkozy et son épouse.
//
// Copyright 2009 / contact: adjudant.tifrice@gmail.com
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.



var Tifrice = {
    prefManager:null,
    heIsHidden:true,
    sheIsHidden:true,

    tagPattern: new RegExp ("^(p|li|tr|table|div|dl|h[123456]|input)$", "i"),
    pattern: new RegExp ("(sarko|carla.bruni|bruni.tedeschi)", "i"),

    modifications: new Array(),
    documents: new Array(),

    apply: function(doc) {
	if (this.heIsHidden || this.sheIsHidden) {
	    this.removeSarkoRec(doc);
	}
    },

    removeSarkoRec: function(node) {
	var mustRemove = 0;
	if (node.hasAttributes() && node.parentNode != null) {
	    var attrs = node.attributes;
	    for(var i=attrs.length-1; i>=0 && mustRemove==0; i--)
		if (this.pattern.test(attrs[i].value))
		    mustRemove = 1;
	}
	
	if (mustRemove == 0)
	    if (node.childNodes.length>0)
		for (var i=node.childNodes.length-1; i>=0; i--)
		    mustRemove += this.removeSarkoRec(node.childNodes[i]);
	    else
		if (this.pattern.test(node.nodeValue))
		    mustRemove = 1;
	
	if (this.tagPattern.test(node.tagName) && mustRemove>0) {
	    this.modifications.push([node,node.style.display]);
	    node.style.display="none";
	    mustRemove = 0;
	}
	return mustRemove;
    },

    resetDisplay: function() {
	var modif;
	while (this.modifications && this.modifications.length) {
	    modif = this.modifications.pop();
	    modif[0].style.display = modif[1];
	}
    },

    toggleHim: function () {
	this.heIsHidden = !this.prefManager.getBoolPref("extensions.sarkofree.hideHim");
	this.prefManager.setBoolPref("extensions.sarkofree.hideHim", this.heIsHidden);
    },
    
    toggleHer: function() {
	this.sheIsHidden = !this.prefManager.getBoolPref("extensions.sarkofree.hideHer");
	this.prefManager.setBoolPref("extensions.sarkofree.hideHer", this.sheIsHidden);
    },

    syncToPrefs: function() {
	this.heIsHidden = this.prefManager.getBoolPref("extensions.sarkofree.hideHim");
	this.sheIsHidden = this.prefManager.getBoolPref("extensions.sarkofree.hideHer");
	var icon_lui = document.getElementById("sarkofree_lui");
	if (this.heIsHidden)
	    icon_lui.setAttribute("src", "chrome://sarkofree/content/pas_ns.png");
	else
	    icon_lui.setAttribute("src", "chrome://sarkofree/content/ns.png");
	var icon_elle = document.getElementById("sarkofree_elle");
	if (this.sheIsHidden)
	    icon_elle.setAttribute("src", "chrome://sarkofree/content/pas_cb.png");
	else
	    icon_elle.setAttribute("src", "chrome://sarkofree/content/cb.png");
	this.generateRegexp();
    },

    toggle: function() {
	this.syncToPrefs();
	this.resetDisplay();
	for (var i=0; i<this.documents.length; i++) {
	    this.apply(this.documents[i]);
	}
    },

    generateRegexp: function() {
	if (this.heIsHidden)
	    if (this.sheIsHidden)
		this.pattern = new RegExp ("(sarko|carla.bruni|bruni.tedeschi)", "i");
	    else
		this.pattern = new RegExp ("sarko", "i");
	else
	    if (this.sheIsHidden)
		this.pattern = new RegExp ("(carla.bruni|bruni.tedeschi)", "i");
    },

    init: function () {
	var appcontent=window.document.getElementById("appcontent");
	if (appcontent && !appcontent.sarkofree_initialized) {
	    appcontent.sarkofree_initialized=true;
	    appcontent.addEventListener("DOMContentLoaded", Tifrice.onDomLoad, false);
	    appcontent.addEventListener("beforeunload", Tifrice.onUnload, false); 
	}
	Tifrice.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	Tifrice.prefManager.QueryInterface(Components.interfaces.nsIPrefBranch2);
	Tifrice.prefManager.addObserver("", Tifrice, false);
	Tifrice.tagPattern = new RegExp ("^(p|li|tr|div|dl|h[123456])$", "i");
	Tifrice.syncToPrefs();
    },

    terminate:function () {
	Tifrice.prefManager.removeObserver("", Tifrice);
	window.removeEventListener('load', Tifrice.init, false);
	window.removeEventListener('unload', Tifrice.terminate, false);
	var appcontent=window.document.getElementById("appcontent");
	appcontent.removeEventListener("DOMContentLoaded", Tifrice.onDomLoad, false);
	appcontent.removeEventListener("beforeunload", Tifrice.onUnLoad, false);
    },

    observe:function (subject, topic, data) {
	Tifrice.toggle();
    },

    onDomLoad: function (e) {
	Tifrice.syncToPrefs();
	var doc = e.target.body.QueryInterface(Components.interfaces.nsIDOMNSHTMLElement);
	Tifrice.documents.push(doc);
	Tifrice.apply(doc);
    },

    onUnload: function (e) {
	Tifrice.documents = new Array();
	Tifrice.modifications = new Array();
    }
};

window.addEventListener('load', Tifrice.init, false);
window.addEventListener('unload', Tifrice.terminate, false);
