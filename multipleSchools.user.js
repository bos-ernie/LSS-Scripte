// ==UserScript==
// @name         MultipleSchools
// @version      1.0.0
// @description  Use more than 4 classes at once
// @author       Allure149
// @match        https://*.leitstellenspiel.de/buildings/*
// @grant        none
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/multipleSchools.user.js
// @downloadURL  https://github.com/types140/LSS-Scripte/raw/master/multipleSchools.user.js
// ==/UserScript==
/* global $ */

(async function(){
    async function loadBuildingsApi(){
        if(!sessionStorage.aBuildings || JSON.parse(sessionStorage.aBuildings).lastUpdate < (new Date().getTime() - 5 * 1000 * 60)) {
            await $.getJSON("/api/buildings.json").done(data => sessionStorage.setItem("aBuildings", JSON.stringify({lastUpdate: new Date().getTime(), value: data})) );
        }
        return JSON.parse(sessionStorage.aBuildings).value;
    }

    var aBuildings = await loadBuildingsApi();
    var schoolToSearch = $("h1:first").attr("building_type");
    var freeClasses = 1;
    var schoolsToUse = [];
    var personalIds = [];

    for(var building of aBuildings){
        freeClasses = 1;
        if(building.building_type == schoolToSearch){
            for(var extension of building.extensions){
                if(extension.available && extension.enabled) freeClasses++;
            }

            if(building.schoolings.length > 0) freeClasses -= building.schoolings.length;

            if(freeClasses > 0) schoolsToUse.push({"id": building.id, "name": building.caption, "free": freeClasses});
        }
    }

    var freeTotal = Object.values(schoolsToUse).reduce((a,b)=>a+b.free,0);
    var freeThisBuilding = $("#building_rooms_use option").length;

    for(var i = freeThisBuilding+1; i <= freeTotal; i++){
        $("#building_rooms_use").append(`<option value="${i}">${i}</option>`);
    }

    $("input[name=commit]").after(`<input class="btn btn-success" name="multiple_commits" value="Ausbilden"><div class="msOutput"></div>`).remove();

    $("input[name=multiple_commits]").on("click", async function(){
        for(var counter in $(".schooling_checkbox")){
            var el = $(".schooling_checkbox")[counter];
            var usePersonal = el.checked;
            if(usePersonal) personalIds.push(el.value);
        }

        var education = (function() {
            for(var counter in $("form input.radio")){
                var el = $("form input.radio")[counter];

                if(el && el.checked) return +el.attributes.value.value;
            }
        })();

        var schoolCounter = Math.ceil(personalIds.length/10);

        var persTemp = [];
        for(var school of schoolsToUse){
            persTemp = [];
            var loopCounter = school.free * 10 > personalIds.length ? personalIds.length : school.free * 10;

            for(var j = 0; j < loopCounter; j++){
                persTemp.push(personalIds[0]);
                personalIds.splice(0,1);

                if(personalIds.length == 0) break;
            }

            var usedClasses = schoolCounter <= school.free ? schoolCounter : school.free;

            await $.post("/buildings/" + school.id + "/education", {"education": education, "personal_ids": persTemp, "building_rooms_use": usedClasses}, function(){
                $(".msOutput").text(school.name + " über " + usedClasses + " neue Lehrgänge informiert.");
            });

            schoolCounter -= school.free;
            if(schoolCounter <= 0) break;
        }

        window.location.reload();
    });
})();
