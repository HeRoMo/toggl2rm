"use strict"

var APP_NAME = 'Toggl > Redmine'

function onOpen(){
  var ui = SpreadsheetApp.getUi();
  var addon = ui.createAddonMenu();
  addon.addItem('サイドバーを表示', 'showSidebar');
  addon.addItem('設定', 'showSettingDialog');
  addon.addToUi();
}

function onInstall() {
  onOpen();
}

/**
 * サイドバーの表示
 */
function showSidebar(){  
  // サイドバー表示
  var sidebarTmpl = HtmlService.createTemplateFromFile('sidebar');
  var sidebar = sidebarTmpl.evaluate();
  sidebar.setSandboxMode(HtmlService.SandboxMode.IFRAME)
  sidebar.setTitle(APP_NAME);
  SpreadsheetApp.getUi().showSidebar(sidebar);
}

/**
 * 設定ダイアログの表示
 */
function showSettingDialog(){
  var ui = SpreadsheetApp.getUi();
  var template = HtmlService.createTemplateFromFile('setting_dialog');
  var dialog = template.evaluate();
  dialog.setWidth(400).setHeight(300);
  var result = SpreadsheetApp.getUi().showModalDialog(dialog, '設定');
  Logger.log(result)
}

function isValidSettings(){
  var props = Props.getAll()
  var isValid = Object.keys(props).every(function(key){
    return !!props[key] && props[key].length > 0
  })
  return isValid
}




////////////////////////////////////////////////////

/**
 *
 */
function writeToSheet(parsedReport) {
  Logger.log(parsedReport)
  var sheet = SpreadsheetApp.getActiveSheet();
  
  var rowCount = parsedReport.length
  var columnCount = parsedReport[0].length
 
  var row = 1
  var column = 1
  var range = sheet.getRange(1, 1, rowCount, columnCount)
  range.setValues(parsedReport)
}


function extractFromToggl(workplace_id, year, month){
  var period = getPeriod(year, month)
  Logger.log(period)

  var reportJson = Toggl.fetchReport(workplace_id, period.since, period.until)
  SpreadsheetApp.getActiveSpreadsheet().toast("Success", 'Toggl', 5);
  var parsedReport = Toggl.parseReportData(reportJson)
  parsedReport = parsedReport.reverse()
  var result = writeToSheet(parsedReport)
}

function addTimeEntryFromSheet(){  
  var sheet = SpreadsheetApp.getActiveSheet();
  
  var activeRange = sheet.getDataRange()
  var data = activeRange.getValues()
  data.forEach(function(d){
    var togglId = Utilities.formatString('%d',d[0])
    var ticketId = Utilities.formatString('%d',d[1])
    var date = Utilities.formatDate(new Date(d[2]), "JST", "yyyy-MM-dd")
    var hours = d[3]
    var comment = d[4]
    if(togglId != 'NaN'){
      var success = Redmine.addTimeEntry(ticketId, date, hours, comment)
      if(success) Logger.log('TimeEntry[%s]: %s, %s, %s, %s', togglId, ticketId, date, hours, comment );
    }
  })
  SpreadsheetApp.getActiveSpreadsheet().toast("Success", 'Redmine', 5);
}

function showError(message){
  var ui = SpreadsheetApp.getUi()
  ui.alert('ERROR', message, ui.ButtonSet.OK)
}

////////////////////////////////

function getYearMonths(){
  var now = new Date()
  var yearMonths = [Utilities.formatDate(now, "JST", "yyyy-MM")]
  for(var i = 0; i < 5; i++){
    now.setMonth(now.getMonth()-1)
    var ym = Utilities.formatDate(now, "JST", "yyyy-MM")
    yearMonths.push(ym)
  }
  return yearMonths
}

function getPeriod(year, month){  
  var start = new Date(year, (month - 1), 1)
  var end = new Date(year, month, 0)
  var since = Utilities.formatDate(start, "JST", "yyyy-MM-dd")
  var until = Utilities.formatDate(end, "JST", "yyyy-MM-dd")
  var period = { since: since, until: until }
  return period
}
