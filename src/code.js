import Toggl from './toggl';
import Redmine from './redmine';

const APP_NAME = 'Toggl2Rm';
/**
 * スプレッドシートのオープンイベント処理
 * メニューを追加する。
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const addon = ui.createAddonMenu();
  addon.addItem('サイドバーを表示', 'showSidebar');
  addon.addItem('設定', 'showSettingDialog');
  addon.addToUi();
}

/**
 * アドオンインストールイベントの処理
 * メニューを追加する。
 */
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

/**
 * Togglのワークスペースを取得する
 * @return {Array[Object]} ワークスペースの{id, name}のリスト
 */
function getWorkspaces() {
  return Toggl.getWorkspaces();
}

/**
 * データをスプレッドシートに書き込む
 * @param  {Array[][]} parsedReport [taskId,
 *                                   ticketNo,
 *                                   startDate,
 *                                   duration(H),
 *                                   memo,
 *                                   taskDescription]の配列
 */
function writeToSheet(report) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const rowCount = report.length;
  const columnCount = report[0].length;
  const range = sheet.getRange(1, 1, rowCount, columnCount);
  range.setValues(report);
}

/**
 * Togglからレポートを取得し、スプレッドシートに書き込む
 * @param  {Integer} workplaceId ワークプレイスID
 * @param  {Integer} year        レポートを取得する年
 * @param  {Integer} month       レポートを取得する月
 */
function fillSheetWithReport(workplaceId, year, month) {
  let report = Toggl.getAllReport(workplaceId, year, month);
  SpreadsheetApp.getActiveSpreadsheet().toast('Success', 'Toggl', 5);
  report = report.reverse();
  writeToSheet(report);
}

/**
 * スプレッドシートの時間記録をRedmineに書き出す
 */
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
    if (ticketId !== 'NaN') {
      const success = Redmine.addTimeEntry(ticketId, date, hours, comment);
      if (success) Logger.log('TimeEntry[%s]: %s, %s, %s, %s', togglId, ticketId, date, hours, comment);
    }
  });
  SpreadsheetApp.getActiveSpreadsheet().toast('Success', 'Redmine', 5);
}

/**
 * エラーメッセージを表示する
 * @param  {String} message エラーメッセージ
 */
function showError(message) {
  const ui = SpreadsheetApp.getUi();
  ui.alert('ERROR', message, ui.ButtonSet.OK);
}

/**
 * プロパティを保存する
 * @param {Object} props プロパティのhash
 */
function setProps(props) {
  Props.setProps(props);
}

/**
 * 設定が有効かどうかを判定する
 * @return {Boolean} すべての設定に値がある場合 true。それ以外はfalse
 */
function hasInvalidProps() {
  return !Props.isValid();
}

global.onOpen = onOpen;
global.onInstall = onInstall;
global.showSidebar = showSidebar;
global.showSettingDialog = showSettingDialog;
global.getWorkspaces = getWorkspaces;
global.fillSheetWithReport = fillSheetWithReport;
global.addTimeEntryFromSheet = addTimeEntryFromSheet;
global.showError = showError;

global.setProps = setProps;
global.hasInvalidProps = hasInvalidProps;
