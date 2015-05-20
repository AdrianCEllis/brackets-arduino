/*
 * This file is part of Arduino
 *
 * Arduino is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * As a special exception, you may use this file as part of a free software
 * library without restriction.  Specifically, if other files instantiate
 * templates or use macros or inline functions from this file, or you compile
 * this file and link it with other files to produce an executable, this
 * file does not by itself cause the resulting executable to be covered by
 * the GNU General Public License.  This exception does not however
 * invalidate any other reasons why the executable file might be covered by
 * the GNU General Public License.
 *
 * Copyright 2015 Arduino Srl (http://www.arduino.org/) support@arduino.org
 *
 * authors: arduino.org team
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
 maxerr: 50, browser: true */
/*global $, define, brackets */

define(function(require, exports, module){
	"use strict";

	var	AppInit = brackets.getModule("utils/AppInit"),
		WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		StatusBar = brackets.getModule("widgets/StatusBar");

	var panelHTML = require("text!./html/Console.html"),
		panel,
		bTag = $('<div style="font-weight: bold"></div>'),
		pTag = $('<div style="font-weight: bold"></div>');

	var Strings;

	bTag.click(function(){
		brackets.arduino.dispatcher.trigger("arduino-event-menu-tool-boards","");
	});

	pTag.click(function(){
		brackets.arduino.dispatcher.trigger("arduino-event-menu-tool-ports","");
	});

		var writeLog 	= function($event, data){
							if(data){
								var logtype = $event.type;
							 	switch(logtype){
							 		case 'arduino-event-console-log':
							 				$('#logger').html($('#logger').html()+"["+new Date().toLocaleString()+"] - <span style='color: black;'>"+data+"</span><br />");
							 				break;
							 		case 'arduino-event-console-error':
							 				$('#logger').html($('#logger').html()+"["+new Date().toLocaleString()+"] - <span style='color: red;'>"+data+"</span><br />");
							 				break;
							 		case 'arduino-event-console-success':
							 				$('#logger').html($('#logger').html()+"["+new Date().toLocaleString()+"] - <span style='color: green;'>"+data+"</span><br />");
							 				break;
							 		default:
							 				break;
							 	}
							 	$('#logger').scrollTop($('#logger')[0].scrollHeight);
							}
		},
		clearLog	=	function($event){
							$('#logger').empty();
		},
		setBoard	=	function($event, data){
							if(data)
								document.getElementById("bTag").innerText = data;
		},
		setPort		=	function($event, data){
							if(data)
								document.getElementById("pTag").innerText = data;
		},
		showHideConsole = function($event){
							if(panel.isVisible())
								panel.hide();
							else
								panel.show();
		};


	function Console()
	{
		Strings = brackets.arduino.strings;

		bTag.html(Strings.ARDUINO.STATUS_BAR.DEF_LBL_BOARD);
		pTag.html(Strings.ARDUINO.STATUS_BAR.DEF_LBL_PORT);

		brackets.arduino.dispatcher.on("arduino-event-console-log", writeLog);
		brackets.arduino.dispatcher.on("arduino-event-console-error", writeLog);
		brackets.arduino.dispatcher.on("arduino-event-console-success", writeLog);

		brackets.arduino.dispatcher.on("arduino-event-console-board", setBoard);
		brackets.arduino.dispatcher.on("arduino-event-console-port", setPort);

		brackets.arduino.dispatcher.on("arduino-event-console-clear", clearLog);

		brackets.arduino.dispatcher.on("arduino-event-console-show", showHideConsole);

		if(brackets.arduino.preferences.get("arduino.ide.preferences.consoleshow"))
			panel.show();
	}

	AppInit.htmlReady(function () {
        
        ExtensionUtils.loadStyleSheet(module, "css/Console.css");

		StatusBar.addIndicator("pTag", pTag, true, "", "");
		StatusBar.addIndicator("bTag", bTag, true, "", "");

		panel = WorkspaceManager.createBottomPanel("console.panel", $(panelHTML));

	});

	return Console;

});