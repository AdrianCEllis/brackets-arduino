/*
 * This file is part of Arduino
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Copyright 2015 Arduino Srl (http://www.arduino.org/)
 *
 * authors: arduino.org team - support@arduino.org
 * 
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global $, define, brackets */

define(function (require, exports, module) {
    "use strict";

    var CommandManager      = brackets.getModule("command/CommandManager"),
        Commands            = brackets.getModule("command/Commands"),
        Menus               = brackets.getModule("command/Menus"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        FileUtils           = brackets.getModule("file/FileUtils"),
        File                = brackets.getModule("filesystem/File"),
        FileSystem          = brackets.getModule("filesystem/FileSystem"),
        WorkspaceManager    = brackets.getModule("view/WorkspaceManager"),
        EventDispatcher     = brackets.getModule("utils/EventDispatcher"),
        EditorManager       = brackets.getModule("editor/EditorManager"),
        DocumentManager     = brackets.getModule("document/DocumentManager");


    var debugDomainName     = "org-arduino-ide-domain-debug",
        debugIcon           = null,
        debugPanel          = null,
        debugPanelHTML      = null;

    var cmdOpenDebugWindow  = "org.arduino.ide.view.debug.openwindow",
        cmdSetBreakpoint    = "org.arduino.ide.view.debug.setbreakpoint";

    var debugDomain         = null;
    var debugPrefix         = "[arduino ide - debug]";

    var pref,
        evt,
        bp = [];

    /**
     * [debug description]
     */
    function Debug () {
        pref = brackets.arduino.preferences;
        evt  = brackets.arduino.dispatcher;

        debugDomain = brackets.arduino.domains[debugDomainName];

        debugPanelInit();

        //REGISTER COMMANDS and ADD MENU ITEMS
        CommandManager.register("Debug", cmdOpenDebugWindow, this.showHideDebug);

        //TODO: it would be better to get the menu items and their position in a configuration file
        var toolsMenu = Menus.getMenu("arduino.ide.menu.tools");
        toolsMenu.addMenuItem( cmdOpenDebugWindow, null, Menus.AFTER);

        CommandManager.register("Set breakpoint", cmdSetBreakpoint, this.setBreakpoint);
        Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuDivider();
        Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(cmdSetBreakpoint, null)

        //ATTACH EVENT HANDLER
        debugDomain.on('debug_data', debugDataHandler);
        debugDomain.on('debug_err', debugErrorHandler);

        brackets.arduino.dispatcher.on("arduino-event-debug-show",showDebug);
        brackets.arduino.dispatcher.on("arduino-event-debug-hide",hideDebug);
        brackets.arduino.dispatcher.on("arduino-event-debug",this.showHideDebug);
    }


    var showDebug = function(){
        //TODO ???
        //brackets.arduino.dispatcher.trigger("arduino-event-debug-hide");
        $('#toolbar-debug-btn').removeClass('debughover');

        if (!debugPanel.isVisible()) {
            debugPanel.show();
            //TODO: Open Debug channel
            /*
             openSerialPort(serialPort, serialPortRate, serialPortEol, function(err){
             if(err) { //TODO send error to arudino console.
             console.error(serialMonitorPrefix + " Error in serial port opening: ", err);
             brackets.arduino.dispatcher.trigger("arduino-event-console-error", serialMonitorPrefix + " Error in serial port opening: " + err.toString());
             }
             else{
             brackets.arduino.dispatcher.trigger("arduino-event-console-log", serialMonitorPrefix + " Serial monitor connected to " + serialPort.address);
             }
             });
            */
            $('#toolbar-debug-btn').addClass('debughover');
        }
    }

    var hideDebug = function(){
        $('#toolbar-debug-btn').removeClass('debughover');

        if (debugPanel.isVisible()){
            debugPanel.hide();
            //TODO: Close Debug channel
            /*closeSerialPort(serialPort, function(err){
                if(err) { //TODO send error to arudino console.
                    console.error(debugPrefix + " Error in serial port closing: ", err);
                    brackets.arduino.dispatcher.trigger( "arduino-event-console-error" , debugPrefix + " Error in serial port closing: " + err.toString());
                }
                else{
                    brackets.arduino.dispatcher.trigger("arduino-event-console-log", debugPrefix + " Serial monitor disconnected from " + serialPort.address);
                }
            });*/
        }
    }

    function selectElfFile()
    {
        //TODO : Get window title from String
        debugDomain.exec("getTmpFolder")
            .done(function (tmpDir) {
                console.log("Tmp dir : " + tmpDir)

                FileSystem.showOpenDialog(false, false, "Select elf file", tmpDir , ['elf'], function(a,selectedElf,c){
                    if (selectedElf[0].length > 0) {
                        console.log("Elf selected : " + selectedElf[0])

                        FileSystem.showOpenDialog(false, true, "Select sketch folder", "" , "", function(a,selectedFolder,c){
                            if (selectedFolder[0].length > 0) {
                                console.log("Selected folder : " + selectedFolder[0])

                                debugDomain.exec("launchOpenOcd")
                                    .done(function(pid)
                                    {
                                        if(pid > 1) {
                                            console.log("OpenOcd running...")

                                            debugDomain.exec("launchGdb", selectedElf[0], selectedFolder[0])
                                                .done(function () {
                                                    console.log("Gdb running...")
                                                    //TODO open cpp file
                                                    /*
                                                        get Document from name
                                                     * EditorManager.openDocument(document_to_open , pane )
                                                     */
                                                    //var fileCpp = File(selectedElf[0].replace('.elf',''));
                                                    //var documentCpp = Document(fileCpp);
                                                    //var EditorManager.openDocument(documentCpp, Pane,)
                                                    CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN, {fullPath: selectedElf[0].replace('.elf',''), paneId: "first-pane"});

                                                })
                                                .fail(function(err)
                                                {
                                                    console.log("Error in gdb launch")
                                                })
                                        }
                                    })
                            }
                        } );
                    }
                } );
            })
            .fail(function(err)
            {
                console.log("Error in get tmp dir")
            })
    }

    function selectSketchFolder()
    {
        //TODO : Get window title from String
        FileSystem.showOpenDialog(false, true, "Select sketch folder", "" , "", function(a,selectedFolder,c) {
            if (selectedFolder[0].length > 0) {
                console.log("Selected folder : " + selectedFolder[0])
            }
        })
    }

    /**
     * [openDebugWindow description]
     * @return {[type]} [description]
     */
    Debug.prototype.showHideDebug = function(){
        togglePanel();
    }

    /**
     * [setBreakpoint description]
     */
    Debug.prototype.setBreakpoint = function(){
        var editor = EditorManager.getCurrentFullEditor();
        var line = editor.getCursorPos().line + 1;
        bp.push(line);
        //TODO: how to highlight the breakpoint ?
    }

    var togglePanel = function() {
        if (debugPanel.isVisible()) {
            hideDebug();
        } 
        else {
            showDebug();
        }
    };

    var debugDataHandler = function($event, data){
        if(data)
        {
            if(data != "(gdb)")
            $('#debug_log').html( $('#debug_log').html() + "<span style='color: black;'>" + data.replace("(gdb)","").substring(data.indexOf("=")+1) + "</span><hr>");
            //TODO: evaluate condition ?
            //(brackets.arduino.preferences.get("arduino.ide.debug.autoscroll") )
                $('#debug_log').scrollTop($('#debug_log')[0].scrollHeight);
        }
            
    };

    /**
     * callback function, called when the serial communication fails.
     * @param  {Event} $event the event emitted by the NodeDomain of brackets
     * @param  {String} error the string sent by the board
     */
    var debugErrorHandler = function($event, error){
        if(error){
            brackets.arduino.dispatcher.trigger("arduino-event-debug-error", debugPrefix + " Error in debugging : " + error.toString());
        }
    }

    /**
     * used to clear the text area
     */
    function clear() {
        $('#console_log').html( "");
    };


    function debugPanelInit(){

        ExtensionUtils.loadStyleSheet(module, "css/Debug.css");
        
        debugPanelHTML = require("text!modules/debug/html/Debug.html");
        debugPanel = WorkspaceManager.createBottomPanel("modules/debug/html/debug.panel", $(debugPanelHTML));

        //TODO : it's necessary ?
        debugPanel.$panel.find("#clear_button").on("click", function () {
            clear();
        });

        debugPanel.$panel.find("#startDebug_button").on("click",function(){

            selectElfFile();
            /*var sketchFolder = selectSketchFolder(),
                elfFile = selectElfFile();

            debugDomain.exec("launchOpenOcd")
                .done(function(pid)
                {
                    if(pid > 1) {
                        console.log("OpenOcd running...")

                            debugDomain.exec("launchGdb", elfFile, sketchFolder)
                            .done(function () {
                                console.log("Gdb running...")
                            })
                            .fail(function(err)
                            {
                                console.log("Error in gdb launch")
                            })
                    }
                })*/
        });

        debugPanel.$panel.find("#haltsketchDebug_button").on("click",function(){
            debugDomain.exec("halt")
                .done(function(){
                    console.log("Halt execution")
                })
                .fail(function(err)
                {
                    console.log("Error in gdb launch")
                })
        });

        debugPanel.$panel.find("#restartsketchDebug_button").on("click",function(){
            debugDomain.exec("restart")
                .done(function(){
                    console.log("Halt execution")
                })
                .fail(function(err)
                {
                    console.log("Error in gdb launch")
                })
        });

        debugPanel.$panel.find("#continuesketchDebug_button").on("click",function(){
            debugDomain.exec("step_next_bp")
                .done(function(){
                    console.log("Continue execution (next bp)")
                })
                .fail(function(err)
                {
                    console.log("Error")
                })
        });

        debugPanel.$panel.find("#stepsketchDebug_button").on("click",function(){
            debugDomain.exec("step_next_line")
                .done(function(){
                    console.log("Continue execution (next line)")
                })
                .fail(function(err)
                {
                    console.log("Error")
                })
        });

        debugPanel.$panel.find("#showbreakpointDebug_button").on("click",function(){
            debugDomain.exec("show_breakpoints")
                .done(function(){
                    console.log("List of breakpoints")
                })
                .fail(function(err)
                {
                    console.log("Error")
                })
        });

        debugPanel.$panel.find("#setbreakpointDebug_button").on("click",function(){
            var currentFileName = DocumentManager.getCurrentDocument().file.name.replace('.ino','.cpp');
            for ( var i = 0 ; i < bp.length ; i++ ) {
                var cur_bp = bp[i];
                debugDomain.exec("set_breakpoint", currentFileName, cur_bp)
                    .done(function () {
                        console.log("Breakpoint setted at " + currentFileName + " : " + cur_bp);
                    })
                    .fail(function (err) {
                        console.log("Error")
                    })
            }
        });

        debugPanel.$panel.find("#showvalueDebug_button").on("click",function(){
            debugDomain.exec("show_value", "a") //TODO how to get variable name?
                .done(function(){
                    console.log("The value of [a] is [undefined]" )
                })
                .fail(function(err)
                {
                    console.log("Error")
                })
        });

        debugPanel.$panel.find(".close").on("click", function () {
            debugPanel.hide();
            debugIcon.removeClass("on");
        });

    };

    return Debug;
});

//TODO : UI
//TODO : closeing gdb/openocd at hidden panel?