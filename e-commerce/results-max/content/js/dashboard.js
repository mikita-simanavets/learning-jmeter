/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 97.00528479154433, "KoPercent": 2.9947152084556663};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7230092388913331, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.20444638186573671, 500, 1500, "Transaction Controller (Logged user shopping)"], "isController": true}, {"data": [0.8061056105610561, 500, 1500, "HTTP Request (Add to item shopping cart)"], "isController": false}, {"data": [0.8328877005347594, 500, 1500, "HTTP Request (Forums)"], "isController": false}, {"data": [0.44333333333333336, 500, 1500, "HTTP Request (Log In)"], "isController": false}, {"data": [0.7566964285714286, 500, 1500, "HTTP Request (Search for a product)"], "isController": false}, {"data": [0.8187772925764192, 500, 1500, "HTTP Request (Check out)"], "isController": false}, {"data": [0.8311345646437994, 500, 1500, "HTTP Request (Privacy policy)"], "isController": false}, {"data": [0.8187830687830688, 500, 1500, "HTTP Request (Etsy blog)"], "isController": false}, {"data": [0.7963111467522053, 500, 1500, "HTTP Request (Search for particular item)"], "isController": false}, {"data": [0.8214285714285714, 500, 1500, "HTTP Request (Completing shipping information)"], "isController": false}, {"data": [0.7596695456252347, 500, 1500, "HTTP Request (Browse category)"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10218, 306, 2.9947152084556663, 3405.0678214914797, 175, 91302, 7201.1, 16264.549999999992, 60264.81, 53.77866432281935, 46.81082476210651, 8.182553562218093], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Transaction Controller (Logged user shopping)", 1147, 90, 7.846556233653008, 12556.353095030518, 982, 149831, 38470.00000000001, 62141.399999999994, 80912.03999999988, 6.306945337974189, 27.028329704227907, 5.7108310496775045], "isController": true}, {"data": ["HTTP Request (Add to item shopping cart)", 1212, 40, 3.3003300330033003, 3221.0264026402624, 175, 75721, 3301.4, 15311.7, 60258.87, 7.041435244358719, 5.357874265064721, 1.698471196637308], "isController": false}, {"data": ["HTTP Request (Forums)", 374, 18, 4.81283422459893, 3998.41176470588, 177, 60301, 3734.0, 43852.5, 60269.5, 2.3169658898016334, 2.346053801310882, 0.2737821022128883], "isController": false}, {"data": ["HTTP Request (Log In)", 300, 2, 0.6666666666666666, 5454.763333333334, 176, 61446, 16226.600000000017, 31252.9, 34324.75000000002, 3.831809124814796, 2.208030114826547, 0.8980802636284678], "isController": false}, {"data": ["HTTP Request (Search for a product)", 1344, 35, 2.6041666666666665, 3486.776041666667, 175, 61341, 7291.5, 16427.75, 60195.1, 7.136220033451031, 5.447552731834231, 0.8432447500464597], "isController": false}, {"data": ["HTTP Request (Check out)", 1145, 39, 3.406113537117904, 3188.8104803493393, 175, 62272, 3278.4000000000005, 15284.7, 60267.08, 6.537029847678641, 7.102803402752404, 0.8043610945385827], "isController": false}, {"data": ["HTTP Request (Privacy policy)", 379, 12, 3.1662269129287597, 3310.1635883905037, 175, 91302, 3294.0, 15286.0, 60261.6, 2.3874466919059887, 2.266775120159751, 0.2821104001177975], "isController": false}, {"data": ["HTTP Request (Etsy blog)", 378, 14, 3.7037037037037037, 3633.190476190473, 175, 75217, 7200.000000000001, 31256.7, 60300.15, 2.2949565597508332, 2.226227391945795, 0.27118139036118244], "isController": false}, {"data": ["HTTP Request (Search for particular item)", 1247, 35, 2.8067361668003206, 3080.606255012031, 175, 75281, 3305.8000000000015, 15297.599999999999, 60267.04, 6.781596693495758, 5.22540600527518, 0.8013410155400261], "isController": false}, {"data": ["HTTP Request (Completing shipping information)", 1176, 35, 2.9761904761904763, 2861.835034013608, 175, 75288, 3265.3, 15206.649999999998, 60263.15, 7.097334878331401, 5.31138467622936, 1.7119547997537659], "isController": false}, {"data": ["HTTP Request (Browse category)", 2663, 76, 2.853924145700338, 3599.2929027412706, 176, 75301, 7274.6, 18294.6, 60274.36, 14.789514606242363, 14.344155246862156, 1.8198035550649783], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 299, 97.7124183006536, 2.926208651399491], "isController": false}, {"data": ["522/Origin Connection Time-out", 7, 2.287581699346405, 0.06850655705617538], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10218, 306, "504/Gateway Time-out", 299, "522/Origin Connection Time-out", 7, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["HTTP Request (Add to item shopping cart)", 1212, 40, "504/Gateway Time-out", 40, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["HTTP Request (Forums)", 374, 18, "504/Gateway Time-out", 18, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["HTTP Request (Log In)", 300, 2, "504/Gateway Time-out", 2, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["HTTP Request (Search for a product)", 1344, 35, "504/Gateway Time-out", 33, "522/Origin Connection Time-out", 2, null, null, null, null, null, null], "isController": false}, {"data": ["HTTP Request (Check out)", 1145, 39, "504/Gateway Time-out", 38, "522/Origin Connection Time-out", 1, null, null, null, null, null, null], "isController": false}, {"data": ["HTTP Request (Privacy policy)", 379, 12, "504/Gateway Time-out", 12, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["HTTP Request (Etsy blog)", 378, 14, "504/Gateway Time-out", 14, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["HTTP Request (Search for particular item)", 1247, 35, "504/Gateway Time-out", 35, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["HTTP Request (Completing shipping information)", 1176, 35, "504/Gateway Time-out", 34, "522/Origin Connection Time-out", 1, null, null, null, null, null, null], "isController": false}, {"data": ["HTTP Request (Browse category)", 2663, 76, "504/Gateway Time-out", 73, "522/Origin Connection Time-out", 3, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
