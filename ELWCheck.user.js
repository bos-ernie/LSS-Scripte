// ==UserScript==
// @name         ELW-Check
// @description  Zeigt an wer einen ELW 1, ELW 2 oder AB-Einsatzleitung geschickt hat
// @version      1.2.0
// @author       Allure149 exklusiv fuer den Verband Bundesweiter KatSchutz (Bund)
// @include      *://leitstellenspiel.de/missions/*
// @include      *://www.leitstellenspiel.de/missions/*
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/ELWCheck.user.js
// @grant        GM_addStyle
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    GM_addStyle(`.ecHide{ display:none; }
                 .ecShow{ display:block; }
                 .alert-small{ padding: 2px 5px; margin:0; }`);

    if (localStorage.getItem("ecSavedText") === null) {
        localStorage.ecSavedText = "Regelverstoß von %NAMES%";
        localStorage.ecVehicleIds = JSON.stringify("3, 34, 78");
        localStorage.ecInTextfield = false;
    }

    var config = {
        text: localStorage.ecSavedText,
        vehicleIds: JSON.parse(localStorage.ecVehicleIds),
        inTextField: localStorage.ecInTextfield
    };

    $("#h2_write_feedback").before(`<div class="btn-group pull-right">
                                        <div class="btn btn-xs btn-default" id="elwCheck">ELW-Check</div>
                                        <div class="btn btn-xs btn-default" id="ecShowOptions"><span class="glyphicon glyphicon-cog"></span></div>
                                    </div>
                                    <div class="alert alert-danger alert-small ecHide pull-right" id="elwCheckOutput"></div>`);
    $("#h2_write_feedback").after(`<div class="pull-right">
                                       <div class="well well-sm ecHide" id="ecOptions">
                                           <div class="input-group">
                                               <span class="input-group-addon" data-toggle="tooltip" data-placement="top" title="%NAMES% sollte vorhanden sein." style="text-decoration: underline dotted" id="ecInputTextHint">Text</span>
                                               <input type="text" class="form-control" id="ecInputText" value="${config.text}">
                                           </div>
                                           <div class="input-group">
                                               <span class="input-group-addon" data-toggle="tooltip" data-placement="top" title="Welches Fahrzeug welche ID hat findest du heraus durch Klick auf das Fragezeichen." style="text-decoration: underline dotted" id="ecInputVehicleIdsHint">Fahrzeug-IDs
                                                   <a href="https://github.com/LSS-Manager/lss-manager-v3/blob/master/lss-manager-v3/helperfunctions.js#L631" target="_blank">?</a>
                                               </span>
                                               <input type="text" class="form-control" id="ecInputVehicleIds" value="${config.vehicleIds}">
                                           </div>
                                           <div class="input-group">
                                               <div class="checkbox-inline" style="margin: 3px 0">
                                                   <input type="checkbox" id="ecInputTextfield" name="ecCheckbox">
                                                   <label for="ecCheckbox"> direkt ins Textfeld?</label>
                                               </div>
                                           </div>
                                           <div class="input-group">
                                               <div class="btn btn-xs btn-default" id="ecOptionsSave">Einstellungen speichern</div>
                                           </div>
                                       </div>
                                   </div><div class="clearfix"></div>`);

    $("#ecInputTextHint").tooltip();
    $("#ecInputVehicleIdsHint").tooltip();

    config.inTextField == "true" ? $("#ecInputTextfield").prop("checked", true): $("#ecInputTextfield").prop("checked", false);

    function getVehicleTypeId($parent){
        return $parent.find("a").attr("vehicle_type_id");
    }

    function getPlayerName($parent){
        return $parent.find("small > a[href^='/profile/']").text();
    }

    function checkElws(){
        let namesAgainstLaw = [];
        let playerName = "";

        $("tr[id^=vehicle_row], .vehicle_driving_hidden").each(function(){
            playerName = "@" + getPlayerName($(this));

            if(config.vehicleIds.indexOf(getVehicleTypeId($(this))) > -1 && !namesAgainstLaw.includes(playerName)) {
                namesAgainstLaw.push(playerName);
            }
        });

        if(namesAgainstLaw.length > 0) return config.text.replace("%NAMES%", namesAgainstLaw.join(" "));
        else $("#elwCheckOutput").removeClass("alert-danger").addClass("alert-success"); return "Keine Regelwidrigkeiten!";
    }

    $("body").on("click", "#elwCheck", function(){
        let returnElwCheck = checkElws;
        if(config.inTextField == "true"){
            $("#mission_reply_content").val(returnElwCheck);
        } else {
            $("#elwCheckOutput").text(returnElwCheck);
            $("#elwCheckOutput").removeClass("ecHide").addClass("ecShow");
        }
    });

    $("body").on("click", "#ecShowOptions", function(){
        $('#ecOptions').fadeToggle(500);
    });

    $("body").on("click", "#ecOptionsSave", function(){
        localStorage.ecSavedText = $("#ecInputText").val();
        localStorage.ecVehicleIds = JSON.stringify($("#ecInputVehicleIds").val());
        localStorage.ecInTextfield = $("#ecInputTextfield").is(":checked");
        location.reload();
    });
})();
