// ==UserScript==
// @name         POIs löschen
// @version      1.0.0
// @description  Hiermit koennen POIs etwas ausgeduennt werden
// @author       Allure149
// @include      *://www.leitstellenspiel.de/
// @include      *://leitstellenspiel.de/
// @grant        none
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    $("#building_panel_heading .btn-group").append(`<a class="btn btn-xs btn-default" id="overviewPoi">POI löschen</a>`);

    var deletePoisOpened = false;
    $("#overviewPoi").on("click",function(){
        if(deletePoisOpened){
            deletePoisOpened = false;
            $("#btn-group-building-select").css("display","block");
            $("#building_list").css("display","block");
            $("#mainDeletePoi").remove();
            return false;
        } else {
            deletePoisOpened = true;
            if($("#mainDeletePoi").length <= 0){
                $("#building_panel_body").prepend(`<div id="mainDeletePoi"><select id="selectDeletePoi"></select></div>`);
            } else {
                $("#mainDeletePoi").css("display","block");
            }

            $("#btn-group-building-select").css("display","none");
            $("#building_list").css("display","none");
        }

        $("#selectDeletePoi").after(`<br/>% POI löschen: <select id="percentDeletePoi"></select><span id="deletePoiOutput"></span>`);

        var pois = ["Auto-Werkstatt","Autobahnauf.- / abfahrt","Automobilindustrie","Bahnhof (Regional und Fernverkehr)","Bahnhof (Regionalverkehr)","Bahnübergang","Bank","Bauernhof","Baumarkt","Biogasanlage","Bushaltestelle","Bürokomplex","Chemiepark","Diskothek","Einkaufszentrum","Eishalle","Festplatz","Flughafen (groß): Parkhaus","Flughafen (groß): Start-/Landebahn","Flughafen (groß): Terminal","Flughafen (groß): Vorfeld / Standplätze","Flughafen (klein): Flugzeug Standplatz","Flughafen (klein): Gebäude","Flughafen (klein): Start-/Landebahn","Fluss","Güterbahnhof","Holzverarbeitung","Industrie-Allgemein","Kirche","Krankenhaus","Lagerhalle","Museum","Müllverbrennungsanlage","Park","Schule","Schwimmbad","See","Stadion","Straßenbahnhaltestelle","Supermarkt (Groß)","Supermarkt (Klein)","Tankstelle","Theater","Wald","Weihnachtsmarkt"];

        $("#mainDeletePoi").append(`<br/><input type="button" class="btn btn-danger" value="Löschen" id="deletePoi">`);
        $("#mainDeletePoi").append("<br/>Übersicht der POI:<br/>");

        var countOverall = 0;

        for(var i=0;i<pois.length;i++){
            $("#selectDeletePoi").append(`<option value="${pois[i]}">${pois[i]}</option>`);

            var txt = $("#main_container").find("script:first")[0].innerHTML;
            var regex = new RegExp("(?:"+pois[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')+".*id\":)(\\d+)","gm");
            var matches = [];
            var match = regex.exec(txt);
            var countMatches = 0;
            while (match != null) {
                matches.push(+match[1]);
                countMatches++;
                countOverall++;
                match = regex.exec(txt);
            }

            $("#mainDeletePoi").append(countMatches + "x " + pois[i] + "<br/>");
        }

        for(var j=1;j<=10;j++){
            var percent = j*10;
            $("#percentDeletePoi").append(`<option value="${percent}">${percent}%</option>`);
        }

        $("#mainDeletePoi").append("Gesamt: "+countOverall);

        $("#deletePoi").on("click",async function(){
            var txt = $("#main_container").find("script:first")[0].innerHTML;
            var regex = new RegExp("(?:"+$("#selectDeletePoi option:selected").val().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')+".*id\":)(\\d+)","gm");
            var matches = [];
            var match = regex.exec(txt);
            while (match != null) {
                matches.push(+match[1]);
                match = regex.exec(txt);
            }

            var countDeleteRuns = Math.round(matches.length/100*$("#percentDeletePoi option:selected").val());
            for (var i = 0; i < countDeleteRuns; i++) {
                var idx = Math.floor(Math.random() * matches.length);
                $("#deletePoiOutput").text(`${i+1} von ${countDeleteRuns} POIs gelöscht.`);
                await $.post("/mission_positions/"+matches[idx],{"_method":"delete"});
                matches.splice(idx, 1);
                if(i+1==countDeleteRuns) $("#deletePoiOutput").text(`${i+1} POIs wurden erfolgreich entfernt.`);
            }
        });
    });
})();
