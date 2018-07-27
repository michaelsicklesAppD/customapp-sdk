var generateRandomTimeData = function(){
    //For last 60 mins generate random counts
    var date = new Date();
    var results = [];
    var i = 0;
    for (i = 0; i < 60; i++) { 
        results.push([date.getTime(),Math.floor(Math.random() * 1000)]);
        date.setMinutes(date.getMinutes() - i);
    }
    return results;
}

var SI_PREFIXES = ["", "K", "M", "G", "T", "P", "E"];

function abbreviateNumber(number){

    // what tier? (determines SI prefix)
    var tier = Math.log10(number) / 3 | 0;

    // if zero, we don't need a prefix
    if(tier == 0) return number;

    // get prefix and determine scale
    var prefix = SI_PREFIXES[tier];
    var scale = Math.pow(10, tier * 3);

    // scale the number
    var scaled = number / scale;

    // format number and add prefix as suffix
    return scaled.toFixed(1) + prefix;
}
  


class BaseChart {
    constructor(options){
        this.updateDivs(options);
        this.options = options;
        if(options.template){
            this.template = $.templates(options.template);
        }else{
            this.template = $.templates("#noPanelComponent");
        }
    }

    getOptions(){
        return this.options;
    }

    updateDivs(options){
        if(options.targetId && !options.parentDiv && !options.div){
            options.parentDiv = options.targetId;
            options.div = options.parentDiv+"-chart";
        }
    }

    renderOuterComponent(template){
        if(!$("#"+this.getDivId()).length && this.options.parentDiv){
            $("#" + this.options.parentDiv).html(template.render(this.options));
        }
        this.show();
    }

    setTitle(options){
        var id = "#"+this.getDivId()+"Head";
        $(id).html(options.title);
    }

    getDiv(){
        return "#"+this.getDivId();
    }

    getDivId(){
        return this.options.div;
    }

    reset(){
        $(this.getDiv()).hide();
    }

    show(){
        $("#"+this.options.parentDiv).show();
        $(this.getDiv()).show();
    }

    updateChartOptions(options,chartOptions){
        if(options && chartOptions){
            for(var key in chartOptions){
                options[key] = chartOptions[key];
            }
        }
    }

    renderChart(data,clickFunction) {
        //implemented by subclasses
    }

    draw(onClick,callback){
        this.renderChart(this.options.data,onClick);  
    }
    
}


class LineChart extends BaseChart {
    constructor(options) {
        super(options);
    }

    isColumnData(data){
        if(data && data[0] && data[0].length == 2){
            return true;
        }
        return false;
    }

    isRowData(data){
        if(data && data[0] && data[0].length > 2){
            return true;
        }
        return false;
    }

    updateTimeSeriesData(data){
        var i;
        for (i = 1; i < data.length; i++) { 
            var rec = data[i];
            data[i] = parseInt(data[i]);
        }
        return data;
    }

    prepColumnData(data){
        var dates = ['dates'];
        var xLabel;
        if(super.getOptions().xLabel){
            xLabel = super.getOptions().xLabel;
        }else{
            xLabel = "Counts";
        }
        var counts = [xLabel];
        var columnArrays = [];
        columnArrays.push(dates);
        columnArrays.push(counts);
        data.forEach(function (rec) {
            dates.push(parseInt(rec[0]));
            counts.push(rec[1]);
        })
        return columnArrays;
    }


    prepColumnGroupData(options,data){
        var dates = ["dates"];
        data.forEach(function(rec){
            dates.push(parseInt(rec[0]));
            buildGroups(rec,options.groups)
        });
    }

    prepRowData(data,options){
        //set timestamp to int
        //row data is epected to be timestamp, group, count
        data.forEach(function(rec){
            rec[0] = parseInt(rec[0]);
        });

        var headers =["dates"];
        headers = headers.concat(options.rowHeaders);
        data.unshift(headers);
        return data;
    }

    renderChart(data,clickFunction) {
        var options = super.getOptions();
        super.setTitle(options);
        super.renderOuterComponent(this.template);
        var chartData = [];
        var key = options.dataKey;
        if(!key && options.query ){
            if(this.isColumnData(data)){
                key = "columns";
                chartData = this.prepColumnData(data);
            }else if (this.isRowData(data)){
                key = "rows";
                chartData = this.prepRowData(data,options);
            }else{
                key = "columns";
                chartData = data;
            }
        }else if(key && options.data){
            if(key == "raw_columns"){
                key = "columns";
                chartData = this.prepColumnData(data);
            }else if (key == "raw_rows"){
                key = "rows";
                chartData = this.prepRowData(data,options);
            }else{
                chartData = data;
            }
        }else if (!key && !options.data){
            key = "columns";
            chartData = this.prepColumnData(data);
        }else{
            key = "columns";
            chartData = data;
        }

        this.renderGraph(key,chartData,clickFunction);
    } 

    renderGraph(dataKey,data,clickFunction) {
        var chartOptions = {
            bindto: super.getDiv(),
            data: {
                x: 'dates',
                type: 'line',
                onclick: function (e) {
                    var date = new Date(e.x.getTime());
                    if(clickFunction){
                        clickFunction({id:e.id,date:date});
                    }
                }
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%m-%d %H:%M %p',
                        fit: false,
                        rotate: 45
                    }
                }
            }
        }
        chartOptions.data[dataKey] = data;
        super.updateChartOptions(chartOptions,super.getOptions().chartOptions);
        this.chart = c3.generate(chartOptions);
    } 
}

class SparkLineChart extends LineChart{
    constructor(options) {
        super(options);
    }

    renderGraph(dataKey,data,clickFunction) {
        var options = super.getOptions();
        var chartOptions = {
            bindto: super.getDiv(),
            data: {
                x: 'dates',
                type: 'area-spline',
                onclick: function (e) {
                    var date = new Date(e.x.getTime());
                    if(clickFunction){
                        clickFunction({id:e.id,date:date});
                    }
                }
            },
            legend: {show: false},
            tooltip:{show:false},
            axis: {
                x: {show:false},
                y: {show:false}
            }, 
            size: {height:options.height, width:options.width},     
            point: {
                show: false
            }
        };
        chartOptions.data[dataKey] = data;
        super.updateChartOptions(chartOptions,super.getOptions().chartOptions);
        this.chart = c3.generate(chartOptions);
    } 
}

class DonutChart extends BaseChart {
    constructor(options) {
        super(options);
    }

    renderChart(data,clickFunction) {
        super.renderOuterComponent(this.template);

        var chartOptions = {
            bindto: super.getDiv(),
            data: {
                columns: data,
                type : 'donut',
                onclick: function (d, i) { 
                    if(clickFunction){
                        clickFunction(d.name); 
                    }
                }
            },
            legend: {
                show: false
            },
            donut: {
                title: this.options.title
            }
        };

        super.updateChartOptions(chartOptions,super.getOptions().chartOptions);
        this.chart = c3.generate(chartOptions);
    }
}

class PieChart extends BaseChart {
    constructor(options) {
        super(options);
    }

    renderChart(data,clickFunction) {
        super.renderOuterComponent(this.template);

        var chartOptions = {
            bindto: super.getDiv(),
            data: {
                columns: data,
                type : 'pie',
                onclick: function (d, i) { 
                    if(clickFunction){
                        clickFunction(d.name); 
                    }
                }
            },
        };

        super.updateChartOptions(chartOptions,super.getOptions().chartOptions);
        this.chart = c3.generate(chartOptions);
    }
}


class TableChart extends BaseChart {
    constructor(options) {
        super(options);
        this.order = options.order;
        if(!this.order){
            this.order = [[options.columns.length-1,"desc"]];
        }
    }

    renderChart(data,clickFunction) {
        super.renderOuterComponent(this.template);
        super.setTitle(super.getOptions());
        var id = this.getDiv();
        var table = $(id); 
        
        if ( ! $.fn.DataTable.isDataTable(id) ) {
            var initOptions = super.getOptions().tableInitOptions;
            if(!initOptions){
                initOptions = {};
            }else{
                initOptions = jQuery.extend({}, initOptions);
            }
            initOptions.data = data;
            initOptions.columns = super.getOptions().columns;
            initOptions.order = this.order;
            
            table.DataTable(initOptions);
            table.DataTable().on('click', 'tr[role="row"]', function () {
                table.DataTable().$('tr.selected').removeClass('selected');
                var tr = $(this);
                tr.toggleClass("selected");
                var row = table.DataTable().row( tr );
                if(clickFunction){
                    clickFunction(row.data()); 
                }
            } );
        }else{
            table.DataTable().clear();
            table.DataTable().rows.add(data);
            table.DataTable().draw();
        }
    }
}

class BaseComponent {

    constructor(options,chart) {
        this.options = options;
        this.chart = chart;
        addComponent(this);
        if(this.options.preProcessFn)
        {
           this.preProcess = this.options.preProcessFn;
        }
        if(this.options.preRenderFn)
        {
           this.preRender = this.options.preRenderFn;
        }
        if(this.options.postRenderFn)
        {
           this.postRender = this.options.postRenderFn;
        }
        if(!options.template){
            options.template = "#chartComponent";
        }
    }

    getOptions(){
        return this.options;
    }

    resetChildren(children){
        if(children){
            children.forEach(function(child){
                $("#"+child).hide();
            });
        }
    }

    getChart(){
        return this.chart;
    }

    _updateQuery(options,query){
        if(options.ignoreFilters){
            return query;
        }else{
            if(_biqFilters && _biqFilters.length > 0){
                var orderByPos = query.toLowerCase().indexOf("order by");
                var preQuery, postQuery = '';
                if(orderByPos > 0){
                    preQuery = query.substring(0,orderByPos);
                    postQuery = query.substring(orderByPos,query.length);
                }else{
                    preQuery = query;
                }

                _biqFilters.forEach(function(filter){
                    preQuery +=" AND "+filter.field+" = '"+filter.value+"'";
                });
                return preQuery+" "+postQuery;
            }else{
                return query;
            }
        }
    }

    draw(onClick,callback){
        var options = this.getOptions();
        var chart = this.getChart();
        this._draw(options,chart,this.resetChildren,this.preProcess,onClick,this._render,this.preRender,this.postRender,callback);    
    }

    _draw(options,chart,resetChildrenFunction,preProcess,onClick,_render,preRender,postRender,callback){
        if(options.query){
            var queryOptions = options.query;
            if(typeof queryOptions == "string"){
                queryOptions = {query:this._updateQuery(options,options.query)};
            }else{
                queryOptions.query = this._updateQuery(options,queryOptions.query);
            }
            search(queryOptions,function(data){
                _render(chart,options,onClick,resetChildrenFunction,preProcess,data,preRender,postRender,callback);
            });
        }else{
            var data;
            if(options.data == true || !options.data){
                data = this.generateRandomData();
            }else{
                data = options.data;
            }
            if(!data){
                data = [];
            }
            _render(chart,options,onClick,resetChildrenFunction,preProcess,data,preRender,postRender,callback);
        }
    }

    generateRandomData(){
        return generateRandomTimeData();
    }

    _render(chart,options,onClick,resetChildrenFunction,preProcess,data,preRender,postRender,callback){
        
        if(preProcess){
            data = preProcess(options,data);
        }
        if(preRender){
            preRender(chart,options,data);
        }
        chart.renderChart(data,function(result){
            resetChildrenFunction(options.reset);
            if(onClick){
                onClick(result);
            }
        });
        if(postRender){
            postRender(chart,options,data);
        }
        if(callback){
            callback(options,data);
        }
    }
}

class TableComponent extends BaseComponent {
    constructor(options) {
        if(!options.template){
            options.template = "#tableComponent";
        }
        super(options,new TableChart(options));
    }
}

class LineChartComponent extends BaseComponent {
    constructor(options) {
        if(!options.template){
            options.template = "#chartComponent";
        }
        super(options,new LineChart(options));
    }
}

class DonutChartComponent extends BaseComponent {
    constructor(options) {
        if(!options.template){
            options.template = "#chartComponent";
        }
        super(options,new DonutChart(options));
    }
}

class TimeRangeComponent extends BaseComponent {
    constructor(options) {
        options.template = "#timeRangeComponent";
        super(options);
    }

    draw(onClick,callback){
        var options = this.getOptions();
        $("#" + options.targetId).html(this.template.render(options));
        $("#timeRange").on( "change", function() {
            if(onClick){
                onClick({timebucket:getTimeBucket(),text:getTimeRangeText(),start:getTimeRange().start,end:getTimeRange().end});
            }
        });
        if(callback){
            callback(options);
        }
    }
}

class BoxChartComponent extends BaseComponent {
    constructor(options) {
        options.div = options.targetId+"-chart";
        super(options,new SparkLineChart(options));
    }

    preProcess(options,data){
        if(!options.value){
            try {
                var total = 0;
                data.forEach(function(rec){
                    total += rec[1];
                });
                options.value = abbreviateNumber(total);
            } catch (error) {
                console.log(error);
            }
        }
        return data;
    }

    preRender(chart,options,data){
       $("#" + options.targetId).html($.templates("#boxChartComponent").render(options));
    };
}

class BoxComponent extends BaseComponent {
    constructor(options) {
        if(!options.action){
            options.action = options.title;
        }
        super(options,null);
    }

    draw(onClick,callback){
        var options = super.getOptions();
        $("#" + options.targetId).html($.templates("#boxComponent").render(options));
    };
}

class FilterComponent extends BaseComponent {
    constructor(options) {
        this.template = "#filtersComponent";
        super(options);
    }

    draw(onClick,callback){

        var options = this.getOptions();
        $("#" + options.targetId).html(this.template.render(options));
        options.filters.forEach(function(filter){
            if(filter.query){
                autoCompleteOnFilter("#"+filter.id,filter.query,filter.adqlField,function(selection){
                });
            }
        });

        $("#submitFilter").on("click", function() {
            var results = [];
            options.filters.forEach(function(filter){
                var value = $("#"+filter.id).val();
                if(value && value.length > 0){
                    results.push({field:filter.adqlField,value:value})
                }   
            })
            _biqFilters = results;
            if(onClick){
                onClick(_biqFilters);
            }
        });
        $("#resetFilter").on("click", function() {
            options.filters.forEach(function(filter){
                $("#"+filter.id).val('');
            })
            _biqFilters = [];
        });
        if(callback){
            callback(options);
        }
        new TimeRangeComponent({
			targetId:"timeSelector"
		}).draw();
    }

    updateQuery(query){
        return updateQueryWithFilters(query);
    }
}

var hideElements = function (elems){
    if(elems){
        elems.forEach(function(elem){
            $("#"+elem).hide();
        });
    }
}

var _biqComponents = [];
var addComponent = function(comp){
    _biqComponents.push(comp);
    return comp;
}

var _biqFilters = [];

var updateQueryWithFilters = function(query){
    if(_biqFilters && _biqFilters.length > 0){
        _biqFilters.forEach(function(filter){
            var noSpaceQuery = query.replace(/\s/g, '');;
            if(!noSpaceQuery.includes(filter.field+"=")){
                query +=" AND "+filter.field+" = '"+filter.value+"'";
            }
        });
    }
    return query;
}

class PieChartComponent extends BaseComponent {
    constructor(options) {
        options.template = "#chartComponent";
        super(options,new PieChart(options));
    }

    generateRandomData(){
        return [
            ["Customer A",1000],
            ["Customer B",2000],
            ["Customer C",3000],
            ["Customer D",4000]
        ]
    }

}

class PlotlySankeyChart extends BaseChart {
    constructor(options) {
        super(options);
    }

    renderChart(data,onClick){
        var options = {
            type: "sankey",
            orientation: "h",
            node: {
              pad: 15,
              thickness: 30,
              line: {
                color: "black",
                width: 0.5
              },
             label: data.nodes,
             color: ["blue", "blue", "blue", "blue", "blue", "blue"]
            },
          
            link: {
              source: data.source,
              target: data.target,
              value:  data.values
            }
          }
          
          var layout = {
            title: super.getOptions().title,
            font: {
              size: 10
            }
          }
          
          Plotly.react(super.getDivId(), [options], layout);

          var elem = document.getElementById(super.getDivId());
          elem.on('plotly_click',function(data){
            var source = data.points[0].source.label;
            var target = data.points[0].target.label;
            onClick({source:source,target:target});
          });
    }
}

class ButterflySankeyChart extends BaseChart {
    constructor(options) {
        super(options);
    }

    renderChart(data,onClick){
        var function_color = d3.scale.category20();
        var sankeyOptions = {
            // Bind to the DOM and set height.
            anchor: '#'+super.getDivId(),
            // Link to control flow graph `functions` and `links` **data**
            data: data.nodes,
            links: data.links,
            // Define unique **key** accessor for functions
            key: function (func) { return func.id; },
            // **Align** CFG to start on the `left`
            align: 'left',
            // **Style** nodes based on the function name and create tooltips.
            // **Animate** transitions for all of the nodes and links.
            node_options: {
                title: function (func) { return func.name; },
                animate: true,
                duration: 2000
            },
            rect_options: {
                styles: {
                    fill: function (func) { return function_color(func.name); },
                    stroke: 'black'
                },
                animate: true,
                duration: 2000
            },
            link_options: {
                // A poor-performing method of constructing a tooltip with function names.
                // A look-up hash could be used.  The sankey object could be extended with this
                // functionality if requested for relatively little additional space cost.
                title: function (link) { return cfg.data.filter(function (f) { return f.id == link.source; })[0].name + " → " + cfg.data.filter(function (f) { return f.id == link.target; })[0].name; },
                animate: true,
                duration: 2000
            },
            path_options: {
                animate: true,
                duration: 2000
            },
            // Add text **labels** for each node
            node_label_options: {
                text: function (func) { return func.name; },
                styles: {
                    'font-weight': 'bold',
                    'font-size': 'x-small'
                },
                orientation: 'horizontal',
                animate: true,
                duration: 2000
            }
        };
        super.updateChartOptions(sankeyOptions,super.getOptions().chartOptions);
        var cfg = new c3.Butterfly(sankeyOptions);
        cfg.render();
        cfg.on("selectNode",function(context,value){
            console.log(value);
            console.log(context);
        });
    }

    resize(){
        this.sankey.resize();
    }
}
