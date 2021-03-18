// ==UserScript==
// @name         Fahrzeugzaehler
// @version      2.2.0
// @author       Allure149
// @description  Zaehlt die Fahrzeuge auf Anfahrt und vor Ort von jedem am Einsatz teilnehmenden Kameraden
// @include      *://leitstellenspiel.de/missions/*
// @include      *://www.leitstellenspiel.de/missions/*
// @include      *://missionchief.co.uk/missions/*
// @include      *://www.missionchief.co.uk/missions/*
// @include      *://missionchief.com/missions/*
// @include      *://www.missionchief.com/missions/*
// @updateURL    https://github.com/types140/LSS-Scripte/blob/master/Fahrzeugzaehler.user.js
// @downloadURL  https://github.com/types140/LSS-Scripte/blob/master/Fahrzeugzaehler.user.js
// @grant        GM_addStyle
// ==/UserScript==
/* global $,I18n,user_id */

(async function () {
    'use strict';

    GM_addStyle(`
        .fzTable { display:none; position:absolute; z-index: 1000; width: 60% !important; }
        .fzTable tr:nth-child(even) { background-color: dimgrey; }
    `);

    if (!localStorage.aVehicleTypesC || JSON.parse(localStorage.aVehicleTypesC).lastUpdate < (new Date().getTime() - 5 * 60 * 1000)) {
        try {
            await $.getJSON(`https://api.lss-cockpit.de/${I18n.locale}vehicletypes.json`).done((d) => localStorage.setItem('aVehicleTypesC', JSON.stringify({
                lastUpdate: new Date().getTime(),
                value: d
            })));
        } catch (e) {
            console.error(e.message);
            return false;
        }
    }

    var aVehicleTypesC = JSON.parse(localStorage.aVehicleTypesC).value;

    const oLang = {
        de_DE: {
            ownVehicles: "Eigene Fahrzeuge",
            vehicles: "Fahrzeuge",
            vehicleTypes: "Fahrzeugtypen",
            players: "Spieler"
        },
        en_US: {
            ownCars: "Own vehicles",
            cars: "Vehicles",
            vehicleTypes: "Vehicletypes",
            players: "Players"
        },
        en_GB: {
            ownCars: "Own vehicles",
            cars: "Vehicles",
            vehicleTypes: "Vehicletypes",
            players: "Players"
        }
    };

    const sortObjectByCount = (o, d) => d == "desc" ? o.sort((a, b) => a.vcount < b.vcount) : d == "asc" ? o.sort((a, b) => a.vcount > b.vcount) : false;

    var fzPlayers = [],
        fzVehicles = [],
        vehiclesCount = 0,
        ownVehicle = {};

    function scanVehicles() {
        $("#mission_vehicle_driving tbody tr, #mission_vehicle_at_mission tbody tr").each(function () {
            var $this = $(this);
            var playerProfile = $("a[href^='/profile/']:first", $this) || false;

            if (!playerProfile.length) return true;

            var playerId = +playerProfile.attr("href").replace("/profile/", "");
            var playerName = playerProfile.text();
            var vehicle = aVehicleTypesC[$("td:nth-child(2) a", $this).attr("vehicle_type_id")].short_name;

            var playerIndex = fzPlayers.findIndex((e) => e.pid == playerId);
            if (playerId == user_id) {
                if ($.isEmptyObject(ownVehicle)) {
                    ownVehicle = {
                        pid: playerId,
                        pname: oLang[I18n.locale].ownVehicles,
                        vcount: 1
                    };
                } else {
                    ownVehicle.vcount++;
                }
            } else {
                if (playerIndex == -1) {
                    fzPlayers.push({
                        pid: playerId,
                        pname: playerName,
                        vcount: 1
                    });
                } else {
                    fzPlayers[playerIndex].vcount++;
                }
            }

            var vehicleIndex = fzVehicles.findIndex((e) => e.vname == vehicle);
            if (vehicleIndex == -1) {
                fzVehicles.push({
                    vname: vehicle,
                    vcount: 1
                });
            } else {
                fzVehicles[vehicleIndex].vcount++;
            }

            vehiclesCount++;
        });

        /**
         *	Sortiermoeglichkeiten:
         *	asc = aufsteigend
         *	desc = absteigend
         */
        var sortedPlayers = sortObjectByCount(fzPlayers, "desc").unshift(ownVehicle);
        var sortedVehicles = sortObjectByCount(fzVehicles, "desc");

        if (!sortedPlayers || !sortedVehicles) {
            console.error("Suchmethode unbekannt!");
            return false;
        }
    }

    function writeOutput() {
        $("#amount_of_people").append(`
            <span id="fzPlayers">${ oLang[I18n.locale].players } <span class="label" style="background-color: dimgrey;">${ fzPlayers.length }</span></span>
            <span id="fzVehicles">${ oLang[I18n.locale].vehicles } <span class="label label-default">${ vehiclesCount }</span></span>
            <span id="fzVehicleTypes">${ oLang[I18n.locale].vehicleTypes } <span class="label" style="background-color: dimgrey;">${ fzVehicles.length }</span></span>
        `);

    }

    function writeVehicleTable() {
        var outputText = `<table id="fzVehiclesTable" class="table table-dark mission_header_info table-condensed fzTable">`;
        outputText += fzPlayers.map((e) => `<tr><td>${e.pname}</td><td>${e.vcount}</td></tr>`).join("");
        outputText += `</table>`;
        $("#fzVehicles").after(outputText);
    }

    function writeVehicleTypesTable() {
        var outputText = `<table id="fzVehicleTypesTable" class="table table-dark mission_header_info table-condensed fzTable">`;
        outputText += fzVehicles.map((e) => `<tr><td>${e.vname}</td><td>${e.vcount}</td></tr>`).join("");
        outputText += `</table>`;
        $("#fzVehicleTypes").after(outputText);
    }

    scanVehicles();
    writeOutput();

    $("#fzVehicles").hover(() => {
        writeVehicleTable();
        $("#amount_of_people").removeAttr("title");
        $("#fzVehiclesTable").stop(true, true).fadeIn();
    }, () => {
        $.when($("#fzVehiclesTable").stop(true, true).fadeOut()).done(() => $("#fzVehiclesTable").remove());
    });

    $("#fzVehicleTypes").hover(() => {
        writeVehicleTypesTable();
        $("#amount_of_people").removeAttr("title");
        $("#fzVehicleTypesTable").stop(true, true).fadeIn();
    }, () => {
        $.when($("#fzVehicleTypesTable").stop(true, true).fadeOut()).done(() => $("#fzVehicleTypesTable").remove());
    });
})();