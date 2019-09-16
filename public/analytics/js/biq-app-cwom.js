var _cwomIconComponent = "#_cwomIconComponent";
var _cwomPanelComponent = "#_cwomIconPanel";


class CWOMIconComponent extends BaseComponent {
    constructor(options) {
        if (!options.action) {
            options.action = options.title;
        }
        if (options.critcal > 0) {
            options.sevclass = "sevIconCritical";
        } else if (options.major > 0) {
            options.sevclass = "sevIconMajor";
        } else if (options.minor > 0) {
            options.sevclass = "sevIconMinor";
        } else {
            options.sevclass = "sevIconNone";
        }
        options.hasChart = false;
        super(options, null);
    }
    draw(onClick, callback) {
        var options = super.getOptions();
        $("#" + options.targetId).html(
            $.templates({ markup: _cwomIconComponent }).render(options)
        );
        if (options.animate) {
            animateDiv(options.targetId, options.animate);
        }
    }

}
class CWOMPanelComponent extends BaseComponent {

    constructor(options) {
        if (!options.action) {
            options.action = options.title;
        }
        options.hasChart = false;
        //options.selectedFilter = 'none';
        super(options, null);
    }
    draw(onClick, callback) {
        var options = super.getOptions();
        //$("#" + options.targetId).html(
        var container = "#" + options.targetId;
        $.views.helpers({
            actionFilter: function (action, index, actions) {
                var view = this;
                var type = view.ctxPrm("selectedFilter") || "";
                var critOnly = view.ctxPrm("critOnly");
                var correct_class = action.target.className === type;
                var matches_filter = correct_class;
                if(critOnly) {
                    matches_filter = correct_class && action.risk.severity === "CRITICAL";
                }
                return  matches_filter;
        }});
        $.views.helpers.actionFilter.depends = ["~selectedFilter", "~critOnly"];
        
        var tmpl = $.templates({
                markup: _cwomPanelComponent,
                converters: {
                    actionCount: function (actioncounts, critOnly) {
                        var count = 0;
                        for (var i = 0; i < actioncounts.length; i++) {
                            var ac = actioncounts[i];
                            count += ac.critical || 0;
                            count += critOnly ? 0 : ac.major || 0;
                            count += critOnly ? 0 : ac.minor || 0;
                        }
                        return count;
                    },
                    getval: function (reasonCommodity, newValue, displayValue) {
                        var formatBytes = function (a, b) {
                            if (0 == a)
                                return "0 Bytes";
                            a = a * 1024;
                            var c = 1024,
                                d = b || 2,
                                e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
                                f = Math.floor(Math.log(a) / Math.log(c));
                            
                            return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
                        }
                        var ret = displayValue;
                        if(reasonCommodity.toUpperCase() === "VMEM" || reasonCommodity.toUpperCase() === "HEAP") {
                            if(newValue > 1024) {
                                ret = formatBytes(displayValue,1);
                            }

                        }
                        return ret;
                    },
                    actionDescription: function (newValue, currentValue, risk) {
                        return (newValue  > currentValue ? "Scale Up" : "Scale Down") + " " + risk.reasonCommodity;
                    },
                    host:function(displayName) { 
                        return displayName.substring(displayName.indexOf(",")+1, displayName.indexOf("]"));

                    },
                    ip:function(displayName) {
                        return displayName.substring(displayName.indexOf("[")+1, displayName.indexOf(",")) 
                    },  
                    targetDisplay: function (target, type) {
                        var ret = '';
                        if(type === "ApplicationServer") {
                            ret = target.displayName.substring(target.displayName.indexOf(",") + 1, target.displayName.indexOf("]"));
                        } else {
                            ret = target.displayName;
                        }
                        return ret;
                    }

                }
            });
          //  .render(options, )
        tmpl.link(container, options, {
            selectedFilter: 'none',
            critOnly: false,
            updateFilter: function(newfilter, ev, eventArgs) {
                var view = eventArgs.view;
                view.ctxPrm("selectedFilter", newfilter);
            }
            
        } );

        if (options.animate) {
            animateDiv(options.targetId, options.animate);
        }
    }
}



