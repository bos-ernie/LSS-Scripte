// ==UserScript==
// @name         Verbandsgebaeude einblenden
// @version      1.0.0
// @description  Behebt den aktuellen Fehler Verbandsgebaeude nicht einblenden zu koennen
// @author       Allure149
// @include      *://www.leitstellenspiel.de/
// @include      *://leitstellenspiel.de/
// @grant        none
// ==/UserScript==

(function(){"use strict";var m=document.querySelector(".alliance-buildings-filter").parentNode.parentNode,c=m.childNodes[0],st=(s)=>{alliance_building_show=s.checked;console.log(alliance_building_show)};st(c);m.addEventListener("click", ()=>st(c));})();
