//var config = require("../config.json") || {};
var dashboards = require("../dashboards.json");
var libraries = require("../public-libraries.json");
var config = {};


const fs = require('fs');

exports.init = function () {

	const configpath = './config.json'
	const configjson = {
		"localport": 3000,
		"controller": "",
		"https": false,
		"globalKey": "",
		"accessKey": "",
		"analyticsUrl": "https://analytics.api.appdynamics.com",
		"restdebug": false,
		"proxy_old": "http://<user>:<password>@<host>:<port>"
	};
	try {
		if (!fs.existsSync(configpath)) {
			config = configjson;
			console.warn('Config file "config.json" was missing.  Created with default values.');
			fs.writeFileSync(configpath, JSON.stringify(configjson,null, 2));
		} else {
			config = JSON.parse(fs.readFileSync(configpath));
		}
	} catch (err) {
		console.error(err);
	}

}

exports.getExcludedApps = function () {
	return config.exclude_app_ids;
}

exports.getConfiguredScores = function () {
	return config.scores;
}

exports.getExcludedAppHealthRules = function () {
	return config.exclude_app_hr;
}

exports.getIncludedHRRules = function () {
	return config.only_include_hrs_that_match;
}

exports.getConfig = function () {
	return config;
}

exports.getScoreRange = function () {
	return config.score_date_range;
}

exports.getIncidentRange = function () {
	return config.incident_date_range;
}

exports.getAppRange = function () {
	return config.app_date_range;
}

exports.getController = function () {
	return config.controller;
}

exports.getCronExpression = function () {
	return config.nightly_cron;
}

exports.isNightlyProcessEnabled = function () {
	return config.run_nightly_process;
}

exports.isSyntheticJobEnabled = function () {
	return config.fetchSyntheticData;
}

exports.getSleep = function () {
	if (config.sleep) {
		return config.sleep;
	} else {
		return 5;
	}
}

exports.getTrendDateRange = function () {
	return config.syntheticTrendRange;
}

exports.getSyntheticTrendMetricDev = function () {
	if (config.syntheticMetricDeviation) {
		return config.syntheticMetricDeviation;
	}
	return 3;
}

exports.getSyntheticTrendAvailabilityDev = function () {
	if (config.syntheticAvailabilityDiff) {
		return config.syntheticAvailabilityDiff;
	}
	return 10;
}

exports.getControllerUrl = function () {
	if (config.https) {
		return "https://" + exports.getController();
	} else {
		return "http://" + exports.getController();
	}
}

exports.isDemoMode = function () {
	return config.demomode;
}

exports.isScoreMenuEnabled = function () {
	return config.menus.score;
}

exports.isSyntheticMenuEnabled = function () {
	return config.menus.synthetics;
}

exports.isFilterByAgentAvailabilityEnabled = function () {
	return config.filter_by_agent_availability_enabled;
}

exports.getAgentAvailabilityHrs = function () {
	return config.agent_availability_hrs;
}

exports.getGlobalAccount = function () {
	return config.globalKey;
}

exports.getAccessKey = function () {
	return config.accessKey;
}

exports.getAnalyticsUrl = function () {
	return config.analyticsUrl;
}

exports.getPort = function () {
	return config.port;
}

exports.getLocalPort = function () {
	return config.localport;
}

exports.getVersion = function () {
	return dashboards.version;
}

exports.getDashboards = function () {
	return dashboards.dashboards;
}
exports.getLibraries = function () {
	return libraries.libraries;
}

exports.isHTTPs = function(){
	return config.https;
}

exports.getProtocol = function(){
	if (config.https){
		return "https";
	}else{
		return "http";
	}
}