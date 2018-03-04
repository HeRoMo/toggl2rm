const APP_NAME = 'Toggl > Redmine';

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const addon = ui.createAddonMenu();
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
function showSidebar() {
  // サイドバー表示
  const sidebarTmpl = HtmlService.createTemplateFromFile('sidebar');
  const sidebar = sidebarTmpl.evaluate();
  sidebar.setSandboxMode(HtmlService.SandboxMode.IFRAME);
  sidebar.setTitle(APP_NAME);
  SpreadsheetApp.getUi().showSidebar(sidebar);
}

/**
 * 設定ダイアログの表示
 */
function showSettingDialog() {
  const ui = SpreadsheetApp.getUi();
  const template = HtmlService.createTemplateFromFile('setting_dialog');
  const dialog = template.evaluate();
  dialog.setWidth(400).setHeight(300);
  const result = ui.showModalDialog(dialog, '設定');
  Logger.log(result);
}

function isValidSettings() {
  return Props.isValid();
}

//--------------------------

/**
 *
 */
function writeToSheet(parsedReport) {
  Logger.log(parsedReport);
  const sheet = SpreadsheetApp.getActiveSheet();

  const rowCount = parsedReport.length;
  const columnCount = parsedReport[0].length;

  const range = sheet.getRange(1, 1, rowCount, columnCount);
  range.setValues(parsedReport);
}

function extractFromToggl(workplaceId, year, month) {
  const period = Utils.getPeriod(year, month);
  Logger.log(period);

  const reportJson = Toggl.fetchReport(workplaceId, period.since, period.until);
  SpreadsheetApp.getActiveSpreadsheet().toast('Success', 'Toggl', 5);
  let parsedReport = Toggl.parseReportData(reportJson);
  parsedReport = parsedReport.reverse();
  writeToSheet(parsedReport);
}

function addTimeEntryFromSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();

  const activeRange = sheet.getDataRange();
  const data = activeRange.getValues();
  data.forEach((d) => {
    const togglId = Utilities.formatString('%d', d[0]);
    const ticketId = Utilities.formatString('%d', d[1]);
    const date = Utilities.formatDate(new Date(d[2]), 'JST', 'yyyy-MM-dd');
    const hours = d[3];
    const comment = d[4];
    if (togglId !== 'NaN') {
      const success = Redmine.addTimeEntry(ticketId, date, hours, comment);
      if (success) Logger.log('TimeEntry[%s]: %s, %s, %s, %s', togglId, ticketId, date, hours, comment);
    }
  });
  SpreadsheetApp.getActiveSpreadsheet().toast('Success', 'Redmine', 5);
}

function showError(message) {
  const ui = SpreadsheetApp.getUi();
  ui.alert('ERROR', message, ui.ButtonSet.OK);
}

global.onOpen = onOpen;
global.onInstall = onInstall;
global.showSidebar = showSidebar;
global.showSettingDialog = showSettingDialog;
global.isValidSettings = isValidSettings;
global.writeToSheet = writeToSheet;
global.extractFromToggl = extractFromToggl;
global.addTimeEntryFromSheet = addTimeEntryFromSheet;
global.showError = showError;
