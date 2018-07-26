// # C3 Butterfly Execution Flow
// _Demonstrates a Butterfly Caller/Callee flow chart for program execution_.
// Example data sets
var cfg_datasets = {
    libpthread: {
        functions: [{ "id": 255, "name": "Home Page", "module": "irinsight","time":12345}, 
        { "id": 256, "name": "Tab 1", "module": "irinsight","time":12345 }, 
        { "id": 257, "name": "Tab 2", "module": "irinsight2","time":12345 }, 
        { "id": 318, "name": "Tab 3", "module": "irinsight2","time":12345 }],
        links: [{ "source": 255, "target": 318, "value": 170 },
        { "source": 255, "target": 256, "value": 10 },
        { "source": 255, "target": 257, "value": 100 },
        { "source": 256, "target": 257, "value": 50 }]
    }
};
// A Scale to generate colors for each function name.
var function_color = d3.scale.category20();
// # Create Butterly visualization
// Create `Butterfly` visualization object
var cfg = new c3.Butterfly({
    // Bind to the DOM and set height.
    anchor: '#cfg_butterfly',
    height: 600,
    // Link to control flow graph `functions` and `links` **data**
    data: cfg_datasets['libpthread'].functions,
    links: cfg_datasets['libpthread'].links,
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
        orientation: 'vertical',
        animate: true,
        duration: 2000
    }
});
cfg.render();
// ## Extend dynamic chart behavior
// Resize the control flow graph when the window is resized.
window.onresize = function () { cfg.resize(); };
// Select example **data set**
document.getElementById('dataset').addEventListener('change', function () {
    var element = this;
    cfg.data = cfg_datasets[element.value].functions;
    cfg.links = cfg_datasets[element.value].links;
    cfg.redraw();
});
// Set **Depth of Field**
document.getElementById('depth_of_field').addEventListener('change', function () {
    var element = this;
    cfg.depth_of_field = +element.value;
    cfg.redraw();
});
