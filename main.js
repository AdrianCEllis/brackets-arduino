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
 * Copyright 2015 Arduino Srl (http://www.arduino.org/)
 *
 * authors: arduino.org team - support@arduino.org
 *
 */

define(function (require, exports, module) {
    'use strict';
	var ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
    	CommandManager  = brackets.getModule("command/CommandManager"),
        Menus           = brackets.getModule("command/Menus"),
        EditorManager   = brackets.getModule("editor/EditorManager"),
        NodeDomain      = brackets.getModule("utils/NodeDomain"),
        AppInit         = brackets.getModule("utils/AppInit"),
        FileUtils       = brackets.getModule("file/FileUtils"),
        EventDispatcher = brackets.getModule("utils/EventDispatcher");

    var serialmonitorDomainName     = "org-arduino-ide-domain-serialmonitor",
        discoveryDomainName         = "org-arduino-ide-domain-discovery";

    brackets.arduino = {
        preferences : {},
        domains     : {},
        dispatcher  : {},
        options     : {
            target      : {
                port        : {},
                board       : {},
                programmer  : {}
            }
        }
    };

    //CREATE THE EVENT DISPATCHER
    EventDispatcher.makeEventDispatcher(brackets.arduino.dispatcher);

    var Preferences   = require("modules/Preferences/pref");
    var Options   = require("modules/Preferences/opts");
    var opts = new Options( FileUtils.getNativeModuleDirectoryPath(module) + "/hardware/arduino" );

    brackets.arduino.preferences  = new Preferences( FileUtils.getNativeModuleDirectoryPath(module) + "/shared/preferences.json" );

    AppInit.appReady(function () {

        //load domains
        brackets.arduino.domains[serialmonitorDomainName]   = new NodeDomain( serialmonitorDomainName, ExtensionUtils.getModulePath(module, "node/serialmonitor"));
        brackets.arduino.domains[discoveryDomainName]       = new NodeDomain( discoveryDomainName, ExtensionUtils.getModulePath(module, "node/discover"));

        //load eventdispatecher


        //load modules
        var SerialMonitor  = require("modules/SerialMonitor/main");
        var PortMenu       = require("modules/Discovery/main");

        
        var sm = new SerialMonitor();
        var pm = new PortMenu();




    });


});