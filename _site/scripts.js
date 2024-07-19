curButton = "s_tot";

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer",
    "esri/layers/CSVLayer",
    "esri/layers/FeatureLayer",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/Color",
    "esri/renderers/SimpleRenderer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/renderers/UniqueValueRenderer",
    "esri/layers/support/LabelClass",
    "esri/widgets/Legend",
    "esri/symbols/TextSymbol"
], function(Map, MapView, GeoJSONLayer, CSVLayer, FeatureLayer, SimpleLineSymbol, SimpleMarkerSymbol, SimpleFillSymbol, Color, SimpleRenderer, ClassBreaksRenderer, UniqueValueRenderer, LabelClass, Legend, TextSymbol) {


    const labelingInfoBlank = new LabelClass({
        labelExpressionInfo: {
            expression: ""
        },
        symbol: new TextSymbol({
            color: "black",
            haloColor: "white",
            haloSize: "2px",
            font: {
                size: "12px",
                family: "Arial"
            }
        }),
        labelPlacement: "above-center",
        minScale: 0,
        maxScale: 0
    });

    // percent renderer
    const rendererPercentChangeable = new ClassBreaksRenderer({
        valueExpression: "$feature.pctu_ch",
        classBreakInfos: [
            { minValue:         0, maxValue: 0.1000000, symbol: new SimpleFillSymbol({ color: new Color("#FFF7FB"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "0% to 10%"    },
            { minValue: 0.1000000, maxValue: 0.3333333, symbol: new SimpleFillSymbol({ color: new Color("#D0D1E6"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "10% to 33%"   },
            { minValue: 0.3333333, maxValue: 0.6666667, symbol: new SimpleFillSymbol({ color: new Color("#74A9CF"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "33% to 67%"   },
            { minValue: 0.6666667, maxValue: 0.9000000, symbol: new SimpleFillSymbol({ color: new Color("#0570B0"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "67% to 90%"   },
            { minValue: 0.9000000, maxValue: 1.0000000, symbol: new SimpleFillSymbol({ color: new Color("#023858"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "More than 90%"},
        ]
    });
    const labelingInfoChangeable = new LabelClass({
        labelExpressionInfo: {
            expression: "Text($feature.pctu_ch, '#0%')"
        },
        symbol: new TextSymbol({
            color: "black",
            haloColor: "white",
            haloSize: "2px",
            font: {
                size: "12px",
                family: "Arial"
            }
        }),
        labelPlacement: "above-center",
        minScale: 0,
        maxScale: 0,
        where: "pctu_ch IS NOT NULL"
    });

    // total renderer
    const rendererTotal = new ClassBreaksRenderer({
        valueExpression: "$feature.s_tot",
        classBreakInfos: [
            { minValue:    0, maxValue:      499, symbol: new SimpleFillSymbol({ color: new Color("#FFF7FB"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "0 to 500"       },
            { minValue:  500, maxValue:      999, symbol: new SimpleFillSymbol({ color: new Color("#D0D1E6"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "500 to 1,000"   },
            { minValue: 1000, maxValue:     1499, symbol: new SimpleFillSymbol({ color: new Color("#74A9CF"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "1,000 to 1,500" },
            { minValue: 1500, maxValue:     2999, symbol: new SimpleFillSymbol({ color: new Color("#0570B0"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "1,500 to 3,000" },
            { minValue: 3000, maxValue: 10000000, symbol: new SimpleFillSymbol({ color: new Color("#023858"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "More than 3,000"},
        ]
    });
    const labelingInfoTotal = new LabelClass({
        labelExpressionInfo: {
            expression: "Text($feature.s_tot, '#,##0')"
        },
        symbol: new TextSymbol({
            color: "black",
            haloColor: "white",
            haloSize: "2px",
            font: {
                size: "12px",
                family: "Arial"
            }
        }),
        labelPlacement: "above-center",
        minScale: 0,
        maxScale: 0
    });

    // total renderer
    const rendererTotalDiff = new ClassBreaksRenderer({
        valueExpression: "$feature.s_tot",
        classBreakInfos: [
            { minValue: -10000, maxValue: -5000, symbol: new SimpleFillSymbol({ color: new Color("#800026"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "-10,000 to -5,000"},
            { minValue:  -5000, maxValue: -3000, symbol: new SimpleFillSymbol({ color: new Color("#BD0026"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "-5,000 to -3,000" },
            { minValue:  -3000, maxValue: -1000, symbol: new SimpleFillSymbol({ color: new Color("#E31A1C"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "-3,000 to -1,000" },
            { minValue:  -1000, maxValue:  -100, symbol: new SimpleFillSymbol({ color: new Color("#FC4E2A"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "-1,000 to -100"   },
            { minValue:   -100, maxValue:   100, symbol: new SimpleFillSymbol({ color: new Color("#B0B0B0"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "-100 to 100"      },
            { minValue:    100, maxValue:  1000, symbol: new SimpleFillSymbol({ color: new Color("#78C679"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "100 to 1,000"     },
            { minValue:   1000, maxValue:  3000, symbol: new SimpleFillSymbol({ color: new Color("#41AB5D"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "1,000 to 3,000"   },
            { minValue:   3000, maxValue:  5000, symbol: new SimpleFillSymbol({ color: new Color("#238443"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "3,000 to 5,000"   },
            { minValue:   5000, maxValue: 10000, symbol: new SimpleFillSymbol({ color: new Color("#006837"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "5,000 to 10,000"  }
        ]
    });

    // total renderer
    const rendererDensity = new ClassBreaksRenderer({
        classBreakInfos: [
            { minValue:  0, maxValue:        5, symbol: new SimpleFillSymbol({ color: new Color("#FFF7FB"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "0 to 5"      },
            { minValue:  5, maxValue:       20, symbol: new SimpleFillSymbol({ color: new Color("#D0D1E6"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "5 to 20"     },
            { minValue: 20, maxValue:       50, symbol: new SimpleFillSymbol({ color: new Color("#74A9CF"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "20 to 50"    },
            { minValue: 50, maxValue:       85, symbol: new SimpleFillSymbol({ color: new Color("#0570B0"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "50 to 85"    },
            { minValue: 85, maxValue: 10000000, symbol: new SimpleFillSymbol({ color: new Color("#023858"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label: "More than 85"},
        ]
    });
    const labelingInfoDensity = new LabelClass({
        labelExpressionInfo: {
          expression: "", // Placeholder; will be updated in the function
        },
        symbol: new TextSymbol({
            color: "black",
            haloColor: "white",
            haloSize: "2px",
            font: {
                size: "12px",
                family: "Arial"
            }
        }),
        labelPlacement: "above-center",
        minScale: 0,
        maxScale: 0
    });

    
    // total renderer
    const rendererDensityDiff = new ClassBreaksRenderer({
        valueExpression: "$feature.s_tot",
        classBreakInfos: [
            { minValue: -100, maxValue: -50, symbol: new SimpleFillSymbol({ color: new Color("#800026"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label:  "-100 to -50"},
            { minValue:  -50, maxValue: -30, symbol: new SimpleFillSymbol({ color: new Color("#BD0026"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label:  "-50 to -30" },
            { minValue:  -30, maxValue: -10, symbol: new SimpleFillSymbol({ color: new Color("#E31A1C"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label:  "-30 to -10" },
            { minValue:  -10, maxValue:  -1, symbol: new SimpleFillSymbol({ color: new Color("#FC4E2A"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label:  "-10 to -1"  },
            { minValue:   -1, maxValue:   1, symbol: new SimpleFillSymbol({ color: new Color("#B0B0B0"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label:  "-1 to 1"    },
            { minValue:    1, maxValue:  10, symbol: new SimpleFillSymbol({ color: new Color("#78C679"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label:  "1 to 10"    },
            { minValue:   10, maxValue:  30, symbol: new SimpleFillSymbol({ color: new Color("#41AB5D"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label:  "10 to 30"   },
            { minValue:   30, maxValue:  50, symbol: new SimpleFillSymbol({ color: new Color("#238443"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label:  "30 to 50"   },
            { minValue:   50, maxValue: 100, symbol: new SimpleFillSymbol({ color: new Color("#006837"), outline: { width: 0.5, color: new Color("#DDDDDD") }}), label:  "50 to 100"  }
        ]
    });



    // CREATE MAP
    const map = new Map({
        basemap: "gray-vector" // Basemap service
        //basemap: "osm"
    });


    // ADD NEW VIEW OF MAP
    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-111.9738, 41.1240], // center on Salt Lake County
        zoom: 11, // Zoom level
    });


    // LISTENERS FOR USING SEGMENTS WIDGETS

    // add listener to update renderer based on selection change
    document.getElementById("selectParameter").addEventListener("calciteSelectChange", function(event) {
        const selectedValue = event.target.selectedOption.value;
        console.log("Selected value:", selectedValue);
        updateMap();
    });

    // add listener to update renderer based on selection change
    document.getElementById("selectAbsDen").addEventListener("calciteSelectChange", function(event) {
        const selectedValue = event.target.selectedOption.value;
        console.log("Selected value:", selectedValue);
        updateMap();
    });

    const radioButtons = document.querySelectorAll("calcite-radio-button");

    radioButtons.forEach((item) => {
        item.addEventListener("calciteRadioButtonChange", (event) => {
            if (event.target.checked) {
            console.log("Selected option:", event.target.value);
            curButton = event.target.value;
            updateMap();
            }
        });
    });

    // updateMap
    function updateMap() {
        console.log("updateMap");

        const _selectedOption = curButton;
        console.log('Option: ' + _selectedOption);

        const _measure = document.getElementById("selectParameter").value;
        console.log('Measure: ' + _measure);

        var _absden = document.getElementById("selectAbsDen").value;
        console.log('AbsDen: ' + _absden);

        if (_absden===' ') {
            _absden = '';
        }

        lyrSeCalcs.definitionExpression = "parameter = '" + _measure + "'";
        
        lyrSeCalcs.labelingInfo = labelingInfoBlank;

        if (_selectedOption==="pct_ch") {
            console.log("Percent Changeable");
            lyrSeCalcs.renderer = rendererPercentChangeable;
            lyrSeCalcs.labelingInfo = labelingInfoChangeable;
            //lyrSeCalcs.valueExpressionTitle = "Percent Changeable";
        } else {
            var _expression = "$feature." + _selectedOption + _absden;
            console.log("Value Expression: " + _expression);
            if (_absden==='') {
                if (_selectedOption=='s_diff' | _selectedOption=='s_grow') {
                    lyrSeCalcs.renderer = rendererTotalDiff
                } else {
                    lyrSeCalcs.renderer = rendererTotal;
                }
                labelingInfoTotal.labelExpressionInfo.expression = "Text(" + _expression + ", '#,##0')"
                lyrSeCalcs.labelingInfo = labelingInfoTotal;
            } else if (_absden==='_den') {
                if (_selectedOption=='s_diff' | _selectedOption=='s_grow') {
                    lyrSeCalcs.renderer = rendererDensityDiff
                } else {
                    lyrSeCalcs.renderer = rendererDensity;
                }
                labelingInfoDensity.labelExpressionInfo.expression = "Text(" + _expression + ", '#0.0')"
                lyrSeCalcs.labelingInfo = labelingInfoDensity;
            }
            lyrSeCalcs.renderer.valueExpression = _expression;
        }
        lyrSeCalcs.refresh();
    }


    // Create a GeoJSONLayer
    var lyrDevStatus = new GeoJSONLayer({
        url: "data/future_land_use_2023_filtered.geojson",
        renderer: new UniqueValueRenderer({
            field: "dev_status",
            uniqueValueInfos: [
                { value: "changeable", symbol: { type: "simple-fill", color: "lightgreen" , outline: { width: 0, color: "black" } }, label: "Changeable"              },
                { value: "no_build"  , symbol: { type: "simple-fill", color: "lightgrey"  , outline: { width: 0, color: "black" } }, label: "No Change - No Build"    },
                { value: "no_change" , symbol: { type: "simple-fill", color: "lightyellow", outline: { width: 0, color: "black" } }, label: "No Change - Single-Family Residential" } ]
        })
    });
    map.add(lyrDevStatus);


    // Create a GeoJSONLayer
    var lyrSeCalcs = new GeoJSONLayer({
        url: "data/se_calcs.geojson",
    });
    lyrSeCalcs.definitionExpression = "parameter = 'TOTHH'";
    lyrSeCalcs.renderer = rendererTotal;
    lyrSeCalcs.labelingInfo = labelingInfoTotal;
    map.add(lyrSeCalcs);


    // Create a GeoJSONLayer
    var lyrTazWhite = new GeoJSONLayer({
        url: "data/taz.geojson",
        renderer: new SimpleRenderer({
            symbol: {
                type: "simple-line",  // autocasts as new SimpleLineSymbol()
                color: "#FFFFFF",
                width: 2
            }
        })
    });
    map.add(lyrTazWhite)

    // Create a GeoJSONLayer
    var lyrTaz = new GeoJSONLayer({
        url: "data/taz.geojson",
        renderer: new SimpleRenderer({
            symbol: {
                type: "simple-line",  // autocasts as new SimpleLineSymbol()
                color: "#686868",
                width: 1
            }
        })
    });
    map.add(lyrTaz)

    
    // Create a GeoJSONLayer
    var lyrWcCentersWhite = new GeoJSONLayer({
        url: "data/wc_centers.geojson",
        renderer: new SimpleRenderer({
            symbol: {
                type: "simple-line",  // autocasts as new SimpleLineSymbol()
                color: "#FFFFFF",
                width: 5
            }
        })
    });
    map.add(lyrWcCentersWhite)


    // Create a GeoJSONLayer
    var lyrWcCenters = new GeoJSONLayer({
        url: "data/wc_centers.geojson",
        renderer: new UniqueValueRenderer({
            field: "AreaType",
            uniqueValueInfos: [
                { value: "Metropolitan Center", symbol: { type: "simple-fill", color: null, outline: { width: 2.5, color: "purple" } }, label: "Metropolitan Center"},
                { value: "Urban Center"       , symbol: { type: "simple-fill", color: null, outline: { width: 2.5, color: "darkred" } }, label: "Urban Center"       },
                { value: "City Center"        , symbol: { type: "simple-fill", color: null, outline: { width: 2.5, color: "darkblue" } }, label: "City Center"        },
                { value: "Neighborhood Center", symbol: { type: "simple-fill", color: null, outline: { width: 2.5, color: "darkorange" } }, label: "Neighborhood Center"} ]
        })
    });
    map.add(lyrWcCenters)

    
    // Create a GeoJSONLayer
    var lyrBufferedStops = new GeoJSONLayer({
        url: "data/buffered_stops.geojson",
        renderer: new SimpleRenderer({
            symbol: {
                type: "simple-fill",
                color: null,
                outline: {
                    width: 2,
                    color: "black"
                } 
            }
        })
    });
    map.add(lyrBufferedStops)
    

    // CREATE LEGEND WIDGET
    const legend = new Legend({
        view: view,
        layerInfos: [
                        { layer: lyrDevStatus    , title: 'Changeable Status'     },
                        { layer: lyrBufferedStops, title: 'Station Buffers'       },
                        { layer: lyrSeCalcs      , title: 'Main Display'    },
                        { layer: lyrWcCenters    , title: 'Wasatch Choice Centers'}
                    ]
    });
    view.ui.add(legend, "top-right");

});
