// ==UserScript==
// @name         Sprechwuensche anzeigen
// @version      1.8.0
// @author       Allure149
// @description  Zeigt Sprechwuensche aller Einsaetze an
// @include      *://www.leitstellenspiel.de/*
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/ShowRequests.user.js
// @grant        none
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    $("head").append(`<style>.modal-dialog{
                                 overflow-y: initial !important
                             }
                             .modal-body{
                                 height: 650px;
                                 overflow-y: auto;
                             }
                             .modal-dialog{
                                 position: relative;
                                 display: table; /* This is important */
                                 overflow-y: auto;
                                 overflow-x: auto;
                                 width: auto;
                                 min-width: 300px;
                             }
                      </style><script></script>`);
    $("#btn-group-mission-select").before(`<a href="#"
                                              class="btn btn-xs btn-warning"
                                              id="showMissionRequests"
                                              data-toggle="modal"
                                              data-target="#saShowMissions"
                                           >
                                               Sprechwünsche
                                           </a>`);

    $("#btn-group-mission-select")
        .after(`<div class="modal fade"
                     id="saShowMissions"
                     tabindex="-1"
                     role="dialog"
                     aria-labelledby="exampleModalLabel"
                     aria-hidden="true"
                >
                    <div class="modal-dialog modal-lg" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">
                                    Wo sind aktuell Sprechwünsche offen?
                                </h5>
                                <button type="button"
                                        class="close"
                                        data-dismiss="modal"
                                        aria-label="Close"
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body" id="saBody"></div>
                            <div class="modal-footer">
                                <div class="pull-left">
                                    Legende:
                                    <span class="alert alert-warning" style="padding: 2px 5px; margin:0 5px;">Patienten</span>
                                    <span class="alert alert-success" style="padding: 2px 5px; margin:0 5px;">Gefangene</span>
                                    <span class="alert alert-danger" style="padding: 2px 5px; margin:0 5px;">beides</span>
                                    <span class="alert alert-info" style="padding: 2px 5px; margin:0 5px;">Einsatz älter als 3 Stunden</span>
                                </div><br/>
                                <div class="pull-left" style="margin-top: 5px">
                                    <span class="alert" style="padding: 2px 5px; margin:0 5px; background-color: #e5e8e8;">
                                        <div class="glyphicon glyphicon-home"></div> normaler Einsatz
                                    </span>
                                    <span class="alert" style="padding: 2px 5px; margin:0 5px; background-color: #e5e8e8;">
                                        <div class="glyphicon glyphicon-eur"></div> Coin-Einsatz
                                    </span>
                                    <span class="alert" style="padding: 2px 5px; margin:0 5px; background-color: #e5e8e8;">
                                        <div class="glyphicon glyphicon-plus"></div> reiner RD-Einsatz
                                    </span>
                                    <span class="alert" style="padding: 2px 5px; margin:0 5px; background-color: #e5e8e8;">
                                        <div class="glyphicon glyphicon-star"></div> Event-Einsatz
                                    </span>
                                    <span class="alert" style="padding: 2px 5px; margin:0 5px; background-color: #e5e8e8;">
                                        <div class="glyphicon glyphicon-ok"></div> Einsatz erledigt
                                    </span>
                                </div>
                                v${GM_info.script.version}
                                <button type="button"
                                        id="saCloseButton"
                                        class="btn btn-secondary"
                                        data-dismiss="modal"
                                >
                                    Schließen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`);

    function saCreateTable(arrSaMissions){
        $("#saTable").remove();
        let strOutput = `<table id="saTable" class="table">
                             <tr>
                                 <th class="col-4">Einsatzbezeichnung</th>
                                 <th class="col-4">Einsatzadresse</th>
                                 <th class="col-3">Einsatzbeginn</th>
                                 <th class="col">SW</th>
                                 <th class="col"></th>
                             </tr>`;
        let statusVal = -1;

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
            strOutput += `<tr class="alert alert-${statusVal}">
                              <td class="col-4"><div id="saMissionSign_${arrSaMissions[i].missionId}" class="glyphicon glyphicon-question-sign"></div> ${arrSaMissions[i].missionName}</td>
                              <td class="col-4">${arrSaMissions[i].missionAdress}</td>
                              <td class="col-3 text-nowrap" id="missionTime_${arrSaMissions[i].missionId}">
                                  ${arrSaMissions[i].missionTime}
                              </td>
                              <td class="col text-nowrap" id="countSw_${arrSaMissions[i].missionId}">?</td>
                              <td class="pull-right col">
                                  <a href="/missions/${arrSaMissions[i].missionId}"
                                     class="btn btn-default btn-xs lightbox-open"
                                     id="sa_alarm_button_${arrSaMissions[i].missionId}">
                                      Anzeigen
                                  </a>
                              </td>
</tr>`;
        }
        strOutput += "</table>";

        return strOutput;
    }

    function saDoWork(){
        let speakRequest = [];
        $("#mission_list_alliance > .missionSideBarEntry, #mission_list_alliance_event > .missionSideBarEntry").each(function() {
            let $this = $(this);
            if($this.hasClass("mission_deleted")) return true;

            let missionId = $this.attr("mission_id");
            let requestPrisoners = $this.find("#mission_prisoners_" + missionId).text();
            let requestPatients = $this.find("#mission_patients_" + missionId).text();
            let requestText = $this.find("#mission_missing_short_" + missionId).text();
            let missionAdress = $this.find("#mission_address_" + missionId).text() == "" ? "unbekannt" : $this.find("#mission_address_" + missionId).text();
            let regexMissionName = new RegExp(/\[.*\](.*?),/gm);
            let missionName = $this.find("#mission_caption_" + missionId).text().match(regexMissionName) == null ?
                $this.find("#mission_caption_" + missionId).text() : $this.find("#mission_caption_" + missionId).text().match(regexMissionName)[0];
            let missionOrigin = missionName.indexOf("Event") >= 0 ? "Event" : "Verband";

            missionName = missionName.replace("[Verband] ", "").replace("[Event] ", "").replace(",", "");

            let status = -1; // status 0 = nur Patienten, 1 = nur Gefangene, 2 = Gefangene und Patienten

            if(requestText.indexOf("Sprechwunsch") >= 0) {
                if(requestPatients && requestPrisoners) status = 2;
                else if(requestPatients) status = 0;
                else if(requestPrisoners) status = 1;
                else status = -1;

                speakRequest.push({"missionId": missionId,
                                   "missionName": missionName,
                                   "missionAdress": missionAdress,
                                   "status": status,
                                   "missionTime": "Lade...",
                                   "missionOrigin": missionOrigin
                                  });
            }
        });

        $("#saBody").html(saCreateTable(speakRequest));

        let monthsWord = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        let monthsNumber = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        let getYear = new Date().getFullYear();

        $.each(speakRequest, function(key, item){
            setTimeout(function(){
                requestMissionTime(item.missionId).done(function(result){
                    let actMissionId = item.missionId;
                    let $this = $(result);
                    let missionTime = $this.find("#missionH1").attr("title").replace("Einsatz eingegangen: ", "");
                    let isoTime = "";

                    console.log(missionTime);
                    for(let i = 0; i < monthsWord.length; i++){
                        if(missionTime.indexOf(monthsWord[i]) >= 0) {
                            missionTime = missionTime.replace(" " + monthsWord[i], monthsNumber[i] + "." + getYear);
                            let missionTimeLength = missionTime.length;
                            isoTime = new Date(getYear,
                                               missionTime.slice(3, 5) - 1,
                                               missionTime.slice(0, 2),
                                               missionTime.slice(missionTimeLength - 9, missionTimeLength - 7),
                                               missionTime.slice(missionTimeLength - 6, missionTimeLength - 4),
                                               "00"
                                              );

                            let actualDate = new Date();
                            let calcDifference = actualDate.getTime() - isoTime.getTime();
                            let missionType = $this.find("#mission_help").attr("href").replace("/einsaetze/","").split("?");
                            let checkIsAllianceMission = isAllianceMission(missionType[0]);

                            if(checkIsAllianceMission) item.missionOrigin = "Coin";

                            if((calcDifference >= 10800000 && !checkIsAllianceMission) || (checkIsAllianceMission && calcDifference >= 43200000)){
                                $("#sa_alarm_button_" + actMissionId).toggleClass("btn-default btn-info");
                            };

                            let timeSinceStart = new Date(calcDifference);
                            let hoursSinceStart = timeSinceStart.getHours();
                            let minsSinceStart = timeSinceStart.getMinutes();

                            //$("#missionTime_" + actMissionId).html(`${missionTime.replace(" Uhr", "")}<br/>vor ${hoursSinceStart-1}h ${minsSinceStart}m`);
                            $("#missionTime_" + item.missionId).html(`<span title="vor ${hoursSinceStart-1}h ${minsSinceStart}m">${missionTime.replace(" Uhr", "")}</span>`);

                            $("#countSw_" + item.missionId).text($this.find(".building_list_fms_5").length);

                            let missionInProgress = $this.find("#mission_bar_" + actMissionId + " > div").hasClass("progress-striped-inner-active");
                            let patientInProgress = false;
                            $this.find(".mission_patient").each(function(){
                                if($(this).find("[id^='mission_patients']").css("width") !== "0%") patientInProgress = true;
                            });
                            let missionWidth = $this.find("#mission_bar_" + actMissionId).css("width");

                            let checkMissionAmbulanceOnly = isAmbulanceOnly(missionType[0]);
                            if((missionWidth == "0%" && !patientInProgress) || checkMissionAmbulanceOnly){
                                $("#countSw_" + item.missionId).append(` <div class="glyphicon glyphicon-ok"></div>`);
                            }

                            if(checkMissionAmbulanceOnly) item.missionOrigin = "RD";

                            let setMissionGlyhicon = "";
                            switch(item.missionOrigin){
                                case "Event": setMissionGlyhicon = "glyphicon-star";
                                    break;
                                case "Coin": setMissionGlyhicon = "glyphicon-eur";
                                    break;
                                case "RD": setMissionGlyhicon = "glyphicon-plus";
                                    break;
                                default: setMissionGlyhicon = "glyphicon-home";
                            }

                            $("#saMissionSign_" + actMissionId).toggleClass("glyphicon-question-sign " + setMissionGlyhicon);
                            break;
                        }
                    }
                });
            }, key * 500);
        });
    }

    function isAmbulanceOnly(missionType){
        let ambulanceMissions = ["44", "45", "46", "47", "48", "49", "50", "54", "56", "57", "58", "92", "108", "109", "110", "115", "147", "155", "156", "157", "164", "165", "179",
                                 "180", "181", "182", "183", "184", "185", "210", "211", "212", "274", "281", "293", "297", "312", "326", "339", "340", "341", "354", "373", "374",
                                 "377", "391", "397", "416", "417", "420", "425", "426", "427", "431", "440", "461", "466", "467", "468"];

        for(let a = 0; a < ambulanceMissions.length; a++){
            if(missionType == ambulanceMissions[a]) {
                return true;
            }
        }

        return false;
    }

    function isAllianceMission(missionType){
        let allianceMissions = ["-1","41","43","59","75","99","207","221","222","256","350"];

        for(let a = 0; a < allianceMissions.length; a++){
            if(missionType == allianceMissions[a]) {
                return true;
            }
        }

        return false;
    }

    function requestMissionTime(missionId){
        return $.ajax({
            url: "/missions/" + missionId,
            method: "GET"
        });
    }

    $("body").on("click", "#showMissionRequests", function(){
        saDoWork();
    });
})();
