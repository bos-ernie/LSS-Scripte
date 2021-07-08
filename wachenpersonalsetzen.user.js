// ==UserScript==
// @name         Wachenpersonal setzen
// @description  Massenbearbeitung des Maximal-Personals der Wachen
// @version      1.0.0
// @author       Allure149
// @include      /^https?:\/\/(?:w{3}\.)?(?:(policie\.)?operacni-stredisko\.cz|(politi\.)?alarmcentral-spil\.dk|(polizei\.)?leitstellenspiel\.de|(?:(police\.)?missionchief-australia|(police\.)?missionchief|(poliisi\.)?hatakeskuspeli|missionchief-japan|missionchief-korea|(politiet\.)?nodsentralspillet|(politie\.)?meldkamerspel|operador193|(policia\.)?jogo-operador112|jocdispecerat112|dispecerske-centrum|112-merkez|dyspetcher101-game)\.com|(police\.)?missionchief\.co\.uk|centro-de-mando\.es|centro-de-mando\.mx|(police\.)?operateur112\.fr|(polizia\.)?operatore112\.it|(policja\.)?operatorratunkowy\.pl|dispetcher112\.ru|(polis\.)?larmcentralen-spelet\.se)\/buildings\/.*$/
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/wachenpersonalsetzen.user.js
// @downloadURL  https://github.com/types140/LSS-Scripte/raw/master/wachenpersonalsetzen.user.js
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    if(!user_premium) return false;

    if($("#tab_buildings")[0]){
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var observer = new MutationObserver(function(mutations){
            mutations.forEach(function(mutation) {
                if(mutation.addedNodes.length > 1) {
                    if($("#selectBuilding").length === 0) buildInterface();
                }
            })
        }).observe($("#tab_buildings")[0],{childList: true});
    }

    function buildInterface(){
        $("#building_table").before(`<div class="input-group col-xs-3">
                                         <span class="input-group-addon">Alle</span>
                                         <select class="select optional form-control" id="selectBuilding">
                                         	  <option value="">wählen ...</option>
	                                       	  <option value="0"">Feuerwachen</option>
	                                       	  <option value="18">Feuerwachen (klein)</option>
                                              <option value="2">Rettungswachen</option>
                                              <option value="20">Rettungswachen (klein)</option>
                                              <option value="5">Rettungshubschrauber-Stationen</option>
                                              <option value="12">Schnelleinsatzgruppen (SEG)</option>
                                              <option value="6">Polizeiwachen</option>
                                              <option value="19">Polizeiwachen (Kleinwache)</option>
                                              <option value="11">Bereitschaftspolizeien</option>
                                              <option value="17">Polizei-Sondereinheiten</option>
                                              <option value="13">Polizeihubschrauberstationen</option>
                                              <option value="9">THW-Ortsverbände</option>
                                              <option value="15">Wasserrettungen</option>
                                              <option value="21">Rettungshundestaffeln</option>
                                         </select>
                                         <span class="input-group-addon">auf</span>
                                         <input class="numeric integer optional form-control" id="setMaxPersonal" step="1" type="number" value="0">
                                         <span class="input-group-addon">Personal setzen</span>
                                     </div>
                                     <input class="btn btn btn-success" id="savePersonalSettings" name="commit" type="button" value="Speichern">
                                     <span id="persOut" style="margin-left: 5px"></span>`);

        $("#savePersonalSettings").on("click",function(){
            var selectedTypeId = $("#selectBuilding option:selected")[0].value;
            var selectedTypeName = $("#selectBuilding option:selected")[0].innerText;
            var countSelectedTypes = $("#building_table tbody tr td:nth-child(2) a[building_type='"+selectedTypeId+"']").length;
            var countDoneTypes = 0,
                countLoopings = 0;

            var timerStart = Date.now();
            $("#building_table tbody tr").each(function(i){
                let t = $(this);
                let buildingId = $("td:nth-child(2) a", t).attr("href").match(/\d+/);
                let buildingTypeId = $("td:nth-child(2) a", t).attr("building_type");
                let maxPers = $("#setMaxPersonal")[0].value;

                if(buildingTypeId === selectedTypeId) {
                    countLoopings++;
                    setTimeout(async function(i){
                        await $.post("/buildings/"+buildingId+"?personal_count_target_only=1", {"building":{"personal_count_target":maxPers}, "_method":"put"}).done(function(){
                            countDoneTypes++;
                            $("#building_personal_count_target_"+buildingId).text(maxPers);
                            $("#persOut").text(`${countDoneTypes} von ${countSelectedTypes} ${selectedTypeName} auf ${maxPers} Personaler gesetzt.`);
                            console.log("Wache Nr. " + countDoneTypes + " in " + (Date.now() - timerStart) + " ms");
                        });
                    },countLoopings*250);
                }
            });
        });
    }
})();
