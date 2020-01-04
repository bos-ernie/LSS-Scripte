// ==UserScript==
// @name         Sprechwuensche anzeigen
// @version      1.5.0
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
                             .modal-lg {
                                 width: 1024px !important;
                             }
                      </style>`);
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
                                <div class="pull-left">Legende:
                                    <span class="alert alert-warning" style="padding: 2px 5px; margin:0 5px;">Patienten</span>
                                    <span class="alert alert-success" style="padding: 2px 5px; margin:0 5px;">Gefangene</span>
                                    <span class="alert alert-danger" style="padding: 2px 5px; margin:0 5px;">beides</span>
                                    <span class="alert" style="padding: 2px 5px; margin:0 5px; background-color: #e5e8e8;">
                                        <div class="glyphicon glyphicon-ok"></div> Einsatz erledigt
                                    </span>
                                    <span class="alert alert-info" style="padding: 2px 5px; margin:0 5px;">Einsatz älter als 3 Stunden</span>
                                </div>
                                <button type="button"
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
                             <div class="row">
                                 <tr>
                                     <th class="col-4">Einsatzbezeichnung</th>
                                     <th class="col-4">Einsatzadresse</th>
                                     <th class="col-3" scope="row">Einsatzbeginn</th>
                                     <th class="col">SW</th>
                                     <th class="col"></th>
                                 </tr>
                             </div>`;
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
            strOutput += `<div class="row">
                              <tr class="alert alert-${statusVal}"a>
                                  <td class="col-4">${arrSaMissions[i].missionName}</td>
                                  <td class="col-4">${arrSaMissions[i].missionAdress}</td>
                                  <td class="col-3" id="missionTime_${arrSaMissions[i].missionId}">
                                      ${arrSaMissions[i].missionTime}
                                  </td>
                                  <td class="col" id="countSw_${arrSaMissions[i].missionId}">?</td>
                                  <td class="pull-right col">
                                      <a href="/missions/${arrSaMissions[i].missionId}"
                                         class="btn btn-default btn-xs lightbox-open"
                                         id="sa_alarm_button_${arrSaMissions[i].missionId}">
                                          Anzeigen
                                      </a>
                                  </td>
                              </tr>
                          </div>`;
        }
        strOutput += "</table>";

        return strOutput;
    }

    function saDoWork(){
        let speakRequest = [];
        $("#mission_list_alliance > .missionSideBarEntry").each(function() {
            let $this = $(this);
                if($this.hasClass("mission_deleted")) return true;

                let missionId = $this.attr("mission_id");
                let requestPrisoners = $this.find("#mission_prisoners_" + missionId).text();
                let requestPatients = $this.find("#mission_patients_" + missionId).text();
                let requestText = $this.find("#mission_missing_short_" + missionId).text();
                let missionAdress = $this.find("#mission_address_" + missionId).text();
                let missionName = $("#mission_address_" + missionId).map(function(){
                    return this.previousSibling.nodeValue.replace("[Verband] ", "").replace(", ", "");
                });

                let status = -1; // status 0 = nur Patienten, 1 = nur Gefangene, 2 = Gefangene und Patienten

                if(requestText.indexOf("Sprechwunsch") >= 0) {
                    if(requestPatients && requestPrisoners) status = 2;
                    else if(requestPatients) status = 0;
                    else if(requestPrisoners) status = 1;
                    else status = -1;

                    speakRequest.push({"missionId": missionId,
                                       "missionName": missionName[0],
                                       "missionAdress": missionAdress,
                                       "status": status,
                                       "missionTime": "Lade..."});
                }
        });

        $("#saBody").html(saCreateTable(speakRequest));

        let monthsWord = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        let monthsNumber = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        let getYear = new Date().getFullYear();

        $.each(speakRequest, function(key, item){
            setTimeout(function(){
                requestMissionTime(item.missionId).done(function(result){
                    let $this = $(result);
                    let missionTime = $this.find("#missionH1").attr("title").replace("Einsatz eingegangen: ", "");
                    let isoTime = "";

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
                            if(calcDifference > 10800000){
                                $("#sa_alarm_button_" + item.missionId).toggleClass("btn-default btn-info");
                            };

                            let timeSinceStart = new Date(calcDifference);
                            let hoursSinceStart = timeSinceStart.getHours();
                            let minsSinceStart = timeSinceStart.getMinutes();

                            $("#missionTime_" + item.missionId).html(`<span title="vor ${hoursSinceStart-1}h ${minsSinceStart}m">${missionTime.replace(" Uhr", "")}</span>`);

                            $("#countSw_" + item.missionId).text($this.find(".building_list_fms_5").length);

                            if($this.find("#mission_bar_" + item.missionId).css("width") == "0%"){
                                $("#countSw_" + item.missionId).append(` <div class="glyphicon glyphicon-ok"></div>`);
                            }
                            break;
                        }
                    }
                });
            }, key * 500);
        });
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
