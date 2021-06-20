// ==UserScript==
// @name         FreeClassrooms
// @description  Zeigt die Anzahl freier Schulungsraeume pro Schule sowie freie Betten pro Krankenhaus in der Gebaeudeuebersicht der Hauptseite an
// @version      1.3.1
// @author       Allure149
// @include      /^https?:\/\/(?:w{3}\.)?(?:(policie\.)?operacni-stredisko\.cz|(politi\.)?alarmcentral-spil\.dk|(polizei\.)?leitstellenspiel\.de|(?:(police\.)?missionchief-australia|(police\.)?missionchief|(poliisi\.)?hatakeskuspeli|missionchief-japan|missionchief-korea|(politiet\.)?nodsentralspillet|(politie\.)?meldkamerspel|operador193|(policia\.)?jogo-operador112|jocdispecerat112|dispecerske-centrum|112-merkez|dyspetcher101-game)\.com|(police\.)?missionchief\.co\.uk|centro-de-mando\.es|centro-de-mando\.mx|(police\.)?operateur112\.fr|(polizia\.)?operatore112\.it|(policja\.)?operatorratunkowy\.pl|dispetcher112\.ru|(polis\.)?larmcentralen-spelet\.se)\/$/
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/freeclassrooms.user.js
// @downloadURL  https://github.com/types140/LSS-Scripte/raw/master/freeclassrooms.user.js
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    async function loadBuildingsApi(){
        if(!sessionStorage.aBuildings || JSON.parse(sessionStorage.aBuildings).lastUpdate < (new Date().getTime() - 5 * 1000 * 60)) {
            await $.getJSON("/api/buildings.json").done(data => sessionStorage.setItem("aBuildings", JSON.stringify({lastUpdate: new Date().getTime(), value: data})) );
        }
        return JSON.parse(sessionStorage.aBuildings).value;
    }

    async function loadAllianceBuildingsApi(){
        if(!sessionStorage.aAllianceBuildings || JSON.parse(sessionStorage.aAllianceBuildings).lastUpdate < (new Date().getTime() - 5 * 1000 * 60)) {
            await $.getJSON("/api/alliance_buildings.json").done(data => sessionStorage.setItem("aAllianceBuildings", JSON.stringify({lastUpdate: new Date().getTime(), value: data})) );
        }
        return JSON.parse(sessionStorage.aAllianceBuildings).value;
    }

    function loadBuildings(buildings){
        for(let i = 0; i < buildings.length; i++){
            let currBuilding = buildings[i];

            let buildingImage = function(buildingType){
                let ret = "";
                switch(buildingType){
                    case 1: ret = "building_fireschool";
                        break;
                    case 3: ret = "building_rettungsschule";
                        break;
                    case 4: ret = "building_hospital";
                        break;
                    case 8: ret = "building_polizeischule";
                        break;
                    case 10: ret = "building_thw_school";
                        break;
                    case 16: ret = "building_polizeiwache";
                        break;
                }

                return ret;
            }

            $("#building_list").prepend(`
    	<li class="building_list_li category_selected" building_type_id="${currBuilding.building_type}" leitstelle_building_id="${currBuilding.leitstelle_building_id}" style="display: list-item;">
      	<div class="building_list_caption" id="building_list_caption_${currBuilding.id}">
        	<a href="/buildings/${currBuilding.id}" building_type="0" class="btn btn-xs pull-right btn-default lightbox-open" id="building_button_${currBuilding.id}">Details</a>
          <img class="building_marker_image" building_id="${currBuilding.id}" src="/images/${buildingImage(currBuilding.building_type)}.png">
          <a href="" class="map_position_mover" data-latitude="${currBuilding.latitude}" data-longitude="${currBuilding.longitude}">${currBuilding.caption}</a>
        </div>
      </li>`);
        }

        let buildingTypeIds = $("#building_selection_polizei").attr("building_Type_ids");
        $("#building_selection_polizei").attr("building_Type_ids",buildingTypeIds.replace("]",", 16]"));
    }

    function publishInfos(id,free){
        let getStateColor = function(free){
            switch(free){
                case 0: return "danger";
                    break;
                case 1:
                case 2: return "warning";
                    break;

                default: return "success";
            }
        }

        $("#building_list_caption_"+id).append(`<span class="badge progress-bar-${getStateColor(free)}" style="margin-left: 5px">${free}</span>`);
    }

    function checkData(d){
        const includedBuildings = [1,3,8,10]; //alle Schulen

        for(let i = 0; i < d.length; i++){
            let currentBuilding = d[i];

            if("patient_count" in currentBuilding){
                let countPatients = currentBuilding.patient_count;
                let buildingLevel = currentBuilding.level+10;

                publishInfos(currentBuilding.id,buildingLevel-countPatients);
            } else if("prisoner_count" in currentBuilding){
                let countPrisoners = currentBuilding.prisoner_count;

                publishInfos(currentBuilding.id,currentBuilding.level-countPrisoners);
            } else if("schoolings" in currentBuilding){
                let countSchoolings = currentBuilding.schoolings.length;
                let schoolExtensions = 1;

                for(let j = 0; j < currentBuilding.extensions.length; j++){
                    let currentExtension = currentBuilding.extensions[j];
                    if(currentExtension.available) schoolExtensions++;
                }

                publishInfos(currentBuilding.id,schoolExtensions-countSchoolings);
            }
        }
    }

    async function collectData(){
        // load apis
        let aBuildings = await loadBuildingsApi();
        let aAllianceBuildings = await loadAllianceBuildingsApi();

        // load alliance buildings and add them to the standard overview
        await loadBuildings(aAllianceBuildings);

        // check counts of patients, prisoners and schoolings for own and alliance buildings
        await checkData(aBuildings);
        await checkData(aAllianceBuildings);
    }

    collectData();

    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var observer = new MutationObserver(function(){
        if($("#btn-group-building-select").length === 1) collectData();
    }).observe($("#buildings")[0],{childList: true});
})();
