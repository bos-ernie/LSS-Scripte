// ==UserScript==
// @name         Sprechwuensche anzeigen
// @version      1.1.0
// @author       Allure149
// @description  Zeigt Sprechwuensche aller Einsaetze an
// @include      *://www.leitstellenspiel.de/*
// @grant        none
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    $("#btn-group-mission-select").before(`<a href="#" class="btn btn-xs btn-warning" id="showMissionRequests" data-toggle="modal" data-target="#saShowMissions">Sprechwünsche</a>`);

    $("#btn-group-mission-select").after(`<div class="modal fade" id="saShowMissions" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Wo sind aktuell Sprechwünsche offen?</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" id="saBody"></div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Schließen</button>
      </div>
    </div>
  </div>
</div>`);

    function saCreateTable(arrSaMissions){
        let strOutput = "<table>";
        let statusVal = -1;
            console.log("3");

        for(let i = 0; i < arrSaMissions.length; i++){
            switch(arrSaMissions[i].status){
                case 0: statusVal = "warning"
                    break;
                case 1: statusVal = "success"
                    break;
                case 2: statusVal = "danger"
                    break;
                default: statusVal = "default";
            }
            strOutput += `<tr class="alert alert-${statusVal}"><td>${arrSaMissions[i].missionAdress}</td><td><a href="/missions/${arrSaMissions[i].missionId}" class="btn btn-default btn-xs lightbox-open" id="alarm_button_${arrSaMissions[i].missionId}"> Alarm</a></td></tr>`;
        }
            console.log("4");

        strOutput += "</table>";

        return strOutput;
    }

    function saDoWork(){
        let speakRequest = []; // status 0 = nur Patienten, 1 = nur Gefangene, 2 = Gefangene und Patienten
        $(".missionSideBarEntry").each(function() {
            let $this = $(this);
            if(($this).hasClass("mission_deleted")) return true;

            let missionId = parseInt($this.attr("mission_id"));
            let requestPrisoners = $this.find("#mission_prisoners_" + missionId).text();
            let requestPatients = $this.find("#mission_patients_" + missionId).text();
            let requestText = $this.find("#mission_missing_short_" + missionId).text();
            let missionAdress = $this.find("#mission_caption_" + missionId).text().replace("[Verband] ", "");
            let status = -1;

            if(requestText.indexOf("Sprechwunsch") >= 0) {
                console.log(requestPrisoners + " => " + requestPatients + " => " + requestText + " => " + missionAdress);
                if(requestPatients && requestPrisoners) status = 2;
                else if(requestPatients) status = 0;
                else if(requestPrisoners) status = 1;
                else status = -1;

                speakRequest.push({"missionId": missionId, "missionAdress": missionAdress, "status": status});
            }
        });
        $("#saBody").html(saCreateTable(speakRequest));
    }

    $("body").on("click", "#showMissionRequests", () => {
        saDoWork();
    });
})();
