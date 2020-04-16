// ==UserScript==
// @name         Toplister
// @version      1.0.0
// @author       Allure149
// @include      *://www.leitstellenspiel.de/toplist*
// @include      *://leitstellenspiel.de/toplist*
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/toplister.user.js
// @grant        none
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    var pageCount = 10;

    var getDate = () =>{
        var da = new Date;
        var y = da.getFullYear();
        var m = da.getMonth() < 10 ? "0"+da.getMonth() : da.getMonth();
        var d = da.getDay() < 10 ? "0"+da.getDay() : da.getDay();

        return y+""+m+""+d;
    }

    $('h1').append(` <a class="btn btn-xs btn-default" href="#" id="toplistDownload">Toplist auslesen</a> <div id="toplistOutput"></div>`);

    var getToplistMembers = async pages => {
        var players = "name;credits\n";
        for(var i = 1; i <= pages; i++){
            await $.get('/toplist?page='+i, {"authenticity_token" : $("meta[name=csrf-token]").attr("content")}).done(function(res){
                $('#toplistDownload').text(`Seite ${i} von ${pages} gelesen`);
                $('table tbody tr', res).each(function(){
                    var $this = $(this);
                    var credits = $('td:nth-child(2)', $this).text().replace(' Credits','');
                    var name = $('td:nth-child(3) a', $this).text();

                    if(name) players += name+";"+credits+"\n";//players.push({"name":name, "credits":credits});
                });

                if(i == pages) {
                    $('#toplistDownload').attr('download',getDate()+'_toplist.csv').attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(players)).text("Herunterladen");
                }
            });
        }

    }

    $('#toplistDownload').on('click', async function(){
        getToplistMembers(pageCount);

    });
})();
