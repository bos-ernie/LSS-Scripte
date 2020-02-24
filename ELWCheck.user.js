// ==UserScript==
// @name         ELW-Check
// @description  Zeigt an wer einen ELW 1, ELW 2 oder AB-Einsatzleitung geschickt hat
// @version      1.1.2
// @author       Allure149 exklusiv fuer den Verband Bundesweiter KatSchutz (Bund)
// @include      *://leitstellenspiel.de/missions/*
// @include      *://www.leitstellenspiel.de/missions/*
// @grant        none
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    var config = {
        //frei waehlbar, aber %NAMES% sollte vorhanden sein
        text: "Regelverstoß von %NAMES%",

        //true = wird in Rueckmeldung eingefuegt, nicht mehr extra
        inTextfield: false
    };

    function getVehicleTypeId($parent){
        return $parent.find("a").attr("vehicle_type_id");
    }

    function getPlayerName($parent){
        return $parent.find("small > a[href^='/profile/']").text();
    }

    function checkElws(){
        let checkIds = ["3","34","78"]; // ELW1, ELW2, AB-Einsatzleitung
        let namesAgainstLaw = [];
        let playerName = "";

        $("tr[id^=vehicle_row], .vehicle_driving_hidden").each(function(){
            playerName = "@" + getPlayerName($(this));

            if(checkIds.indexOf(getVehicleTypeId($(this))) > -1 && !namesAgainstLaw.includes(playerName)) {
                namesAgainstLaw.push(playerName);
            }
        });

        if(namesAgainstLaw.length > 0) return config.text.replace("%NAMES%", namesAgainstLaw.join(" "));
        else $("#elw_check").removeClass("alert-danger").addClass("alert-success"); return "Keine Regelwidrigkeiten!";
    }

    $("body").on("click", "#elw_check", function(){
        let returnElwCheck = checkElws;
        config.inTextfield ? $("#mission_reply_content").val(returnElwCheck) : $("#elw_check").text(returnElwCheck);
    });

    $("#h2_write_feedback").before(`<div id="elw_check" class="alert alert-danger" style="float:right; padding: 2px 5px; margin:0">ELW-Check</div>`);
})();
