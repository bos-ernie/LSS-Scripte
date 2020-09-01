// ==UserScript==
// @name         Verbandslehrgaenge filtern
// @version      1.0.1
// @author       Allure149
// @include      *://www.leitstellenspiel.de/schoolings
// @include      *://leitstellenspiel.de/schoolings
// @grant        GM_addStyle
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    GM_addStyle(`.filterHide{display:none} .filterShow{display:table-row}`);

    $("h3:first").append(`<h6 id="filterOwnHide" style="cursor:pointer">(ausblenden)</h6>`);

    var educations = [];
    $(".schooling_opened_table_searchable").each(function(i){
        var e = $("td:first a", this);
        var educationHiorg = e.text().replace(/\s-.*/,"");
        var educationName = e.text().match(/-\s(.*)/)[1];
        var educationId = e.attr("href").replace("/schoolings/","");
        educations.push({"hiorg":educationHiorg,"name":educationName,"id":educationId,"show":true,"sorter":i});
    });
    educations.sort((a, b) => a.name.toUpperCase() > b.name.toUpperCase());

    $(".search_input_field").before(`<div id="allianceEducationFilter" class="btn-group"></div>`);

    var filterLabels = [{"name":"Feuerwehr","short":"FW","sorter":0,"show":true},
                        {"name":"Rettungsdienst","short":"RD","sorter":1,"show":true},
                        {"name":"Polizei","short":"PO","sorter":2,"show":true},
                        {"name":"THW","short":"TH","sorter":3,"show":true}];

    for(var filterLabel of filterLabels){
        $("#allianceEducationFilter").append(`<a class="btn btn-xs btn-success" id="filter${filterLabel.short}" title="${filterLabel.name} Grün = Die ${filterLabel.name}-Lehrgänge werden in der Liste angezeigt. Rot = Die ${filterLabel.name}-Lehrgänge werden nicht angezeigt.">${filterLabel.name}</a>`);
    }
    $("#allianceEducationFilter").append(`<select id="filterSelect" class="select optional form-control input-sm"><option>Lehrgang wählen</option></input>`);

    for(var education of educations){
        if($(`#filterSelect option[value="${education.name}"][hiorg="${education.hiorg}"]`).length <= 0){
            $("#filterSelect").append(`<option value="${education.name}" hiorg="${education.hiorg}">${education.hiorg} - ${education.name}</option>`);
        }
    }

    $("a").click(function(e) {
        var hiorg = filterLabels.filter((el)=>el.short==e.currentTarget.id.replace("filter",""))[0];
        if(hiorg){
            var $this = $(this);
            if($this.hasClass('clicked')){
                $this.removeClass('clicked');

                for(var education of educations){
                    if(education.hiorg != hiorg.name) {
                        $("#education_schooling_"+education.id).parent().removeClass("filterShow").addClass("filterHide");
                        filterLabels[hiorg.sorter].show = false;
                    } else {
                        $("#education_schooling_"+education.id).parent().removeClass("filterHide").addClass("filterShow");
                        filterLabels[hiorg.sorter].show = true;
                    }
                }

                for(var filterLabel of filterLabels){
                    $("#filter"+filterLabel.short).removeClass("btn-danger btn-success");
                    if(filterLabel.name != hiorg.name) $("#filter"+filterLabel.short).addClass("btn-danger");
                    else $("#filter"+filterLabel.short).addClass("btn-success");
                }
            } else {
                $this.addClass('clicked');
                setTimeout(function() {
                    if($this.hasClass('clicked')){
                        $this.removeClass('clicked');

                        for(var education of educations){
                            if(education.hiorg == hiorg.name){
                                if(education.show){
                                    $("#education_schooling_"+education.id).parent().removeClass("filterShow").addClass("filterHide");
                                    filterLabels[hiorg.sorter].show = false;
                                    educations[education.sorter].show = false;
                                } else {
                                    $("#education_schooling_"+education.id).parent().removeClass("filterHide").addClass("filterShow");
                                    filterLabels[hiorg.sorter].show = true;
                                    educations[education.sorter].show = true;
                                }
                            }
                        }

                        $("#filter"+hiorg.short).removeClass("btn-danger btn-success")
                        if(hiorg.show) $("#filter"+hiorg.short).addClass("btn-success");
                        else $("#filter"+hiorg.short).addClass("btn-danger");
                    }
                }, 250);
            }
        }
    });

    $("#filterSelect").change(function(e){
        if(e.target[0].textContent == "Lehrgang wählen") $("#filterSelect option:first").remove();

        for(var education of educations){
            if(education.name == e.target.value) {
                $("#education_schooling_"+education.id).parent().removeClass("filterHide").addClass("filterShow");
                educations[education.sorter].show = true;
            } else {
                $("#education_schooling_"+education.id).parent().removeClass("filterShow").addClass("filterHide");
                educations[education.sorter].show = false;
            }
        }
    });

    $("#filterOwnHide").click(function(){
        var executeFilter = "filterShow";
        console.log($("#schooling_own_table tbody tr:first"));
        if($("#schooling_own_table tbody tr:first").hasClass("filterHide")) {
            $("#schooling_own_table tbody tr:last").remove();
            $("#filterOwnHide").text("(ausblenden)");
        } else {
            executeFilter = "filterHide";
            $("#schooling_own_table tbody").append(`<tr class="filterSave"><td colspan="3"><center>- ausgeblendet -</center></td></tr>`)
            $("#filterOwnHide").text("(einblenden)");
        }

        $("#schooling_own_table tbody tr").each(function(){
            $(this).not(".filterSave").removeClass().addClass(executeFilter);
        });
    });
})();
