// ==UserScript==
// @name         FreeClassrooms
// @description  Zeigt die Anzahl freier Schulungsraeume pro Schule sowie freie Betten pro Krankenhaus in der Gebaeudeuebersicht der Hauptseite an
// @version      1.2.0
// @author       Allure149
// @include      /^https?:\/\/[www.]*(?:leitstellenspiel\.de)\/$/
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

    async function collectData(){
        let aBuildings = await loadBuildingsApi();
        const includedBuildings = [1,3,8,10]; //alle Schulen

        for(let i = 0; i < aBuildings.length; i++){
            let currentBuilding = aBuildings[i];
            let schoolExtensions = 1;

            if(currentBuilding.building_type === 4){
                let countPatients = currentBuilding.patient_count;
                let buildingLevel = currentBuilding.level+10;

                publishInfos(currentBuilding.id,buildingLevel-countPatients);
            } else if(includedBuildings.includes(currentBuilding.building_type) && currentBuilding.schoolings){
                var countSchoolings = currentBuilding.schoolings.length;

                for(let j = 0; j < currentBuilding.extensions.length; j++){
                    let currentExtension = currentBuilding.extensions[j];
                    if(currentExtension.available) schoolExtensions++;
                }

                publishInfos(currentBuilding.id,schoolExtensions-countSchoolings);
            }
        }
    }

    collectData();

    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var observer = new MutationObserver(function(mutations, observer){
        if($("#btn-group-building-select").length === 1) collectData();
    }).observe($("#buildings")[0],{childList: true});
})();
