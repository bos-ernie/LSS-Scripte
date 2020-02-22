// ==UserScript==
// @name         Fahrzeugzaehler
// @version      2.1.1
// @author       Allure149
// @description  Zaehlt die Fahrzeuge auf Anfahrt und vor Ort von jedem am Einsatz teilnehmenden Kameraden
// @include      *://leitstellenspiel.de/missions/*
// @include      *://www.leitstellenspiel.de/missions/*
// @include      *://missionchief.co.uk/missions/*
// @include      *://www.missionchief.co.uk/missions/*
// @include      *://missionchief.com/missions/*
// @include      *://www.missionchief.com/missions/*
// @updateURL    https://github.com/types140/LSS-Scripte/blob/master/Fahrzeugzaehler.user.js
// @grant        none
// ==/UserScript==
/* global $ */

$(function() {
    'use strict';

    $("head").append(`
        <style>
            #fzTable { display:none; position:absolute; z-index: 1000; width: 60% !important; }
            #fzTable tr:nth-child(even) { background-color: dimgrey; }
        </style>
    `);

    let textOwnCars, textCars, textPlayers;
    if(I18n.locale == "de"){
        textOwnCars = "Eigene Fahrzeuge";
        textCars = "Fahrzeuge";
        textPlayers = "Spieler";
    } else if(I18n.locale == "en_US"){
        textOwnCars = "Own vehicles";
        textCars = "Vehicles";
        textPlayers = "Players";
    } else if(I18n.locale == "en_GB"){
        textOwnCars = "Own vehicles";
        textCars = "Vehicles";
        textPlayers = "Players";
    }

    function isInArray(str, arr){
        for(let i = 0; i < arr.length; i++){
            if(str === arr[i].name) return true;
        }
        return false;
    }

    let arrNames = [];

    function fzMain(){
        let outputText = "";
        let strName = "";
        let ownId = "";
        arrNames = [];

        $("#mission_vehicle_driving >> tr, #mission_vehicle_at_mission >> tr").each(function() {
            if($(this).find("a[href^='/profile/']:first").attr("href") === undefined) return true;
            else ownId = parseInt($(this).find("a[href^='/profile/']:first").attr("href").replace("/profile/", ""));

            if(ownId == user_id) return true;

            strName = $(this).find("a[href^='/profile/']:first").text();
            if(isInArray(strName, arrNames)) arrNames.map(record => { if(record.name == strName) record.count++; });
            else if(strName != "") arrNames.push({ name: strName, count: 1 });
        });

        arrNames.sort(function(a, b) { return a.count < b.count; });

        outputText = `<table id="fzTable" class="table table-dark mission_header_info table-condensed"><tr class="panel-heading"><td>${textOwnCars}</td><td>${ownVehiclesOnDrive + ownVehiclesAtMission}</td></tr>`;
        for(let j = 0; j < arrNames.length; j++){
            outputText += `<tr><td>${arrNames[j].name}</td><td>${arrNames[j].count}</td></tr>`;
        };
        outputText += `</table>`;

        console.log("input after");
        $("#fzCars").after(outputText);
    }

    let ownVehiclesOnDrive = $("#mission_vehicle_driving >> tr").find("td.hidden-xs >> a.btn-backalarm-ajax").length;
    let ownVehiclesAtMission = $("#mission_vehicle_at_mission").find(".btn-backalarm-ajax").length;
    let allVehiclesOnDrive = $("#mission_vehicle_driving >> tr[id^='vehicle_row_']").length;
    let allVehiclesAtMission = $("#mission_vehicle_at_mission >> tr[id^='vehicle_row_']").length;
    fzMain();

    $("#amount_of_people").append(`<span id="fzCars">${textCars} <span class="label label-default">${allVehiclesOnDrive + allVehiclesAtMission}</span></span>
                                   <span id="fzPlayers">${textPlayers} <span class="label" style="background-color: dimgrey;">${ownVehiclesOnDrive + ownVehiclesAtMission != 0 ? arrNames.length + 1 : arrNames.length}</span></span>`);

    $("#fzCars").hover(() => {
        fzMain();
        $("#amount_of_people").removeAttr("title");
        $("#fzTable").stop(true,true).fadeIn();
    }, () => {
        $.when($("#fzTable").stop(true,true).fadeOut()).done(() => $("#fzTable").remove());
    });
});
