import './appsscript.json';
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
  ui.showModalDialog(dialog, '設定');
}

/**
 * Togglのワークスペースを取得する
 * @return {Array[Object]} ワークスペースの{id, name}のリスト
 */
function getWorkspaces() {
  try {
    return Toggl.getWorkspaces();
  } catch (error) {
    const user = Session.getTemporaryActiveUserKey();
    const message = 'Togglのワークスペース取得でエラーが発生しました。';
    console.error({ user, message, error });
    throw new Error(`${message} \n[${user}]`);
  }
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
  sheet.getDataRange().clear();
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
 * @param  {boolean} tikectOnly  trueの場合、チケットIDありのデータのみ書き込む
 */
function fillSheetWithReport(workplaceId, year, month, tikectOnly = true) {
  try {
    let report = Toggl.getAllReport(workplaceId, year, month);
    const totalCount = Math.max(report.length - 1, 0); // ヘッダ行を引いておく
    if (tikectOnly) report = report.filter(row => (row[1] !== null));
    const count = Math.max(report.length - 1, 0); // ヘッダ行を引いておく
    console.info({ message: `Togglから ${count} 件取得しました`, totalCount, count });
    SpreadsheetApp.getActiveSpreadsheet().toast(`Success ${count}件取得しました`, 'Toggl');
    writeToSheet(report);
  } catch (error) {
    const user = Session.getTemporaryActiveUserKey();
    const message = 'Togglデータの読み出しでエラーが発生しました。';
    console.error({ user, message, error });
    throw new Error(`${message} \n[${user}]`);
  }
}

/**
 * スプレッドシートの時間記録をRedmineに書き出す
 */
function addTimeEntryFromSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const activeRange = sheet.getDataRange();
  const data = activeRange.getValues();
  const dataCount = Math.max(data.length - 1, 0); // ヘッダ行を引いておく
  let count = 0;
  try {
    data.forEach((d) => {
      const ticketId = Utilities.formatString('%d', d[1]);
      const date = Utilities.formatDate(new Date(d[2]), 'JST', 'yyyy-MM-dd');
      const hours = d[3];
      const comment = d[4];
      if (ticketId !== 'NaN') {
        const success = Redmine.addTimeEntry(ticketId, date, hours, comment);
        if (success) count += 1;
      }
    });
  } catch (error) {
    const message = `Redmineへの登録でエラーが発生しました。(${count}件 登録済)`;
    console.error({
      message,
      error,
      dataCount,
      count,
    });
    const user = Session.getTemporaryActiveUserKey();
    throw new Error(`${message} \n[${user}]`);
  }
  console.info({ message: `Redmineに${count}件登録しました`, dataCount, count });
  SpreadsheetApp.getActiveSpreadsheet().toast(`Success ${count}件 登録しました`, 'Redmine');
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
