"use strict"
var Toggl = {

  getWorkspaces: function (){
    var url = "https://www.toggl.com/api/v8/workspaces"
    var response = this._callTogglApi(url)
    var content = JSON.parse(response.getContentText())
    Logger.log(content)
    var workspaces = content.map(function(ws){
      return {id: ws.id, name: ws.name}
    })
    Logger.log(workspaces)
    return workspaces
  },

  fetchReport: function (workplace_id, since, until) {
    var page = 1
    var hasNext = true
    var report = []
    while(hasNext){
      var reportJson = null;
      var result = this.getReport(workplace_id, since, until, page)
      var reportJson = result.reportJson
      hasNext = result.hasNext
      Utilities.sleep(1500) // APIのrate limitを避けるため
      report = report.concat(reportJson)
      page++
    }
    return report
  },

  getReport: function (workplace_id, since, until, page){
    if(!page) page = 1;
    var url = Utilities.formatString("https://toggl.com/reports/api/v2/details?workspace_id=%s&since=%s&until=%s&page=%s&user_agent=toggl2rm", workplace_id, since, until, page)
    var response = this._callTogglApi(url)
    var content = JSON.parse(response.getContentText())
    var reportJson = content.data
    var hasNext = (content.per_page <= reportJson.length)
    Logger.log("%s, %s, %s", reportJson.length, hasNext, page)
    return {reportJson: reportJson, hasNext: hasNext}
  },

  parseReportData: function (reportJson){
    var parsedReport = reportJson.map(function(report){
      var startDate = /^([0-9]{4}-[0-9]{2}-[0-9]{2})T.+$/.exec(report.start)[1]
      var duration = Math.round(report.dur/(60*60*10))/100
      var ticketNo = ""
      if (/^#/.test(report.description)){
        ticketNo = /^#([0-9]+):?[\s][\S]+/.exec(report.description)[1]
      } else {
        return
      }
      var formattedRepo = [report.id, ticketNo, startDate, duration, report.tags.join('、'), report.description]
      return formattedRepo
    }).filter(function(elm){ return elm != null })
    return parsedReport
  },

  _callTogglApi: function (url){
    var togglKey = Props.get("TOGGL_API_TOKEN")
    Logger.log(togglKey)
    var authToken = Utilities.base64Encode( togglKey + ":api_token")
    var headers = { 'Authorization': "Basic "+ authToken }
    var response = UrlFetchApp.fetch(url, {"headers": headers})
    return response
  }
}

function _togglTest(){
  var since = "2018-02-01"
  var until = "2018-02-25"
  var togglKey = API_TOKEN
  var reportJson = fetchReport(togglKey, since, until)
  var parsedReport = Toggl.parseReportData(reportJson)
  Logger.log(parsedReport.length)
//  var result = getReport(since, until, 3)
//  Logger.log(result.reportJson)
//  Logger.log(result.hasNext)
}

global.Toggl = Toggl;
