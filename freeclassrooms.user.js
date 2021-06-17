// ==UserScript==
// @name         FreeClassrooms
// @description  Zeigt die Anzahl freie Schulungsraeume pro Schule in der Gebaeudeuebersicht der Hauptseite an
// @version      1.1.1
// @author       Allure149
// @include      /^https?:\/\/[www.]*(?:leitstellenspiel\.de)\/$/
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/freeclassrooms.user.js
// @downloadURL  https://github.com/types140/LSS-Scripte/raw/master/freeclassrooms.user.js
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

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

    $.getJSON("/api/buildings.json", function(data){
        let d = data;
        const includedBuildings = [1,3,8,10]; //alle Schulen

        for(let i = 0; i < d.length; i++){
            let currentBuilding = d[i];
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
    });
})();
