// ==UserScript==
// @name         FreeClassrooms
// @description  Zeigt die Anzahl freie Schulungsraeume pro Schule in der Gebaeudeuebersicht der Hauptseite an
// @version      1.0.0
// @author       Allure149
// @include      /^https?:\/\/[www.]*(?:leitstellenspiel\.de)\/$/
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/freeclassrooms.user.js
// @downloadURL  https://github.com/types140/LSS-Scripte/raw/master/freeclassrooms.user.js
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    var freeSchools = [];

    $.getJSON("/api/buildings.json", function(data){
        let d = data;
        const includedBuildings = [1,3,8,10]; //alle Schulen

        for(let i = 0; i < d.length; i++){
            let currentBuilding = d[i];
            let countExtensions = 1;
            if(includedBuildings.includes(currentBuilding.building_type) && currentBuilding.schoolings){
                var countSchoolings = currentBuilding.schoolings.length;

                for(let j = 0; j < currentBuilding.extensions.length; j++){
                    let currentExtension = currentBuilding.extensions[j];
                    if(currentExtension.available) countExtensions++;
                }

                freeSchools.push({"buildingId":currentBuilding.id,"freeRooms":countExtensions-countSchoolings});
            }
        }

        for(let j = 0; j < freeSchools.length; j++){
            let currentSchool = freeSchools[j];

            let getStateColor = function(schoolrooms){
                switch(schoolrooms){
                    case 1:
                    case 2: return "warning";
                        break;
                    case 3:
                    case 4: return "success";
                        break;
                    default: return "danger";
                }
            }

            $("#building_list_caption_"+currentSchool.buildingId).append(`<span class="badge progress-bar-${getStateColor(currentSchool.freeRooms)}" style="margin-left: 5px">${currentSchool.freeRooms}</span>`);
        }
    });
})();
