// ==UserScript==
// @name         ELW-Check
// @version      1.0.0
// @author       Allure149 exklusiv fuer den Verband Bundesweiter KatSchutz (Bund)
// @include      *://leitstellenspiel.de/missions/*
// @include      *://www.leitstellenspiel.de/missions/*
// @grant        none
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    let sendText = "Regelverstoß von %NAMES%"; //frei waehlbar, aber %NAMES% sollte vorhanden sein
    let autoInsert = false; //true = wird in Rueckmeldung eingefuegt, nicht mehr extra

    let checkIds, vehicle_type_id, playerName, returnElwCheck, alreadyChecked;
    let namesAgainstLaw = [];

    function check_elws(){
        $("tr[id^=vehicle_row]").each(function(){
            checkIds = ["3","34","78"]; // ELW1, ELW2, AB-Einsatzleitung
            vehicle_type_id = $(this).find("a").attr("vehicle_type_id");
            playerName = $(this).find("small > a[href^='/profile/']").text();

            if(checkIds.indexOf(vehicle_type_id) > -1 && !namesAgainstLaw.includes("@" + playerName)) {
                namesAgainstLaw.push("@" + playerName);
            }
        });

        if(namesAgainstLaw.length > 0) return sendText.replace("%NAMES%", namesAgainstLaw.join(" "));
        else return "Keine Regelwidrigkeiten!";
    }

    $("body").on("click", "#elw_check", function(){
        if(!alreadyChecked) alreadyChecked = true;
        returnElwCheck = check_elws;

        if(autoInsert) $("#mission_reply_content").val(returnElwCheck);
        else $("#elw_check").text(returnElwCheck)
    });

    $("#h2_write_feedback").before("<div id='elw_check' class='alert alert-danger' style='float:right; padding: 2px 5px; margin:0'>ELW-Check</div>");
})();
