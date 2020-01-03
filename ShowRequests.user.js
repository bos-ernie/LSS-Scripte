// ==UserScript==
// @name         Sprechwuensche anzeigen
// @version      1.0.0
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

        for(let i = 0; i < arrSaMissions.length; i++){
            strOutput += `<tr><td>${arrSaMissions[i].missionAdress}</td><td><a href="/missions/${arrSaMissions[i].missionId}" class="btn btn-default btn-xs lightbox-open" id="alarm_button_${arrSaMissions[i].missionId}"> Alarm</a></td></tr>`;
        }

        strOutput += "</table>";

        return strOutput;
    }

    function saDoWork(){
        let speakRequest = [];
        $(".missionSideBarEntry").each(function() {
            let $this = $(this);
            let requestText = $this.find("div[id^='mission_missing_short']").text();
            let missionId = parseInt($this.attr("mission_id"));
            let missionAdress = $this.find("a[id^='mission_caption']").text().trim().replace("[Verband]", "");

            if(requestText.indexOf("Sprechwunsch") >= 0) {
                speakRequest.push({"missionId": missionId, "missionAdress": missionAdress});
            }
        });
        $("#saBody").html(saCreateTable(speakRequest));
    }

    $("body").on("click", "#showMissionRequests", () => {
        saDoWork();
    });
})();
