const TOGGL_API_TOKEN = 'TOGGL_API_TOKEN';
/**
 * TogglのAPIを実行する
 * @param  {[type]} url APIのエンドポイントURL＋クエリパラメータ
 * @return {[type]}     APIのレスポンス
 */
function callTogglApi(url) {
  const togglKey = Props.get(TOGGL_API_TOKEN);
  const authToken = Utilities.base64Encode(`${togglKey}:api_token`);
  const headers = { Authorization: `Basic ${authToken}` };
  const response = UrlFetchApp.fetch(url, { headers });
  return response;
}

/**
 * レポート（詳細）を取得する
 * @param  {Integer} workplaceId ワークプレイスID
 * @param  {String} since       取得開始日（YYYY-MM-DD）
 * @param  {String} until       取得最終日（YYYY-MM-DD）
 * @param  {Number} [page=1]    取得ページ番号
 * @return {Array[Obejct]}      Togglのレポートオブジェクト
 */
function fetchReport(workplaceId, since, until, page = 1) {
  const url = Utilities.formatString(
    'https://toggl.com/reports/api/v2/details?workspace_id=%s&since=%s&until=%s&page=%s&user_agent=toggl2rm',
    workplaceId,
    since,
    until,
    page,
  );
  const response = callTogglApi(url);
  const content = JSON.parse(response.getContentText());
  const reportJson = content.data;
  const hasNext = (content.per_page <= reportJson.length);
  Logger.log('%s, %s, %s', reportJson.length, hasNext, page);
  return { reportJson, hasNext };
}

/**
 * レポート（詳細）を扱いやすくパースする。
 * レポートオブジェクトから次の値の配列に変換する
 *   - report.id : TooglのタスクID
 *   - ticketNo :  Redmineのチケット 番号
 *   - startDate : 作業の日付
 *   - duration : 作業時間（Hour）
 *   - report.tags.join('、'): 作業のメモ（Togglのタグ）
 *   - report.description: Togglのタスク名
 * @param  {Array[Object]} reportJson Togglのレポートオブジェクトの配列
 * @return {Array[][]}     必要な値の配列のリスト
 */
function parseReportData(reportJson) {
  const ticketNoIndex = 1;
  const parsedReport = reportJson.map((report) => {
    const startDate = /^([0-9]{4}-[0-9]{2}-[0-9]{2})T.+$/.exec(report.start)[1];
    const duration = Math.round(report.dur / (60 * 60 * 10)) / 100;
    let ticketNo = /^#([0-9]+)/.exec(report.description);
    if (ticketNo) ticketNo = ticketNo[ticketNoIndex];
    const formattedRepo = [report.id, ticketNo, startDate, duration, report.tags.join('、'), report.description];
    return formattedRepo;
  });
  parsedReport.reverse();
  parsedReport.unshift(['togglId', 'ticketNo', 'date', 'hours', 'tags', 'toggl description']);
  return parsedReport;
}

const Toggl = {
  /**
   * ワークスペースを取得する
   * @return {Array[Object]} { id, name } の配列
   */
  getWorkspaces() {
    const url = 'https://www.toggl.com/api/v8/workspaces';
    const response = callTogglApi(url);
    const content = JSON.parse(response.getContentText());
    Logger.log(content);
    const workspaces = content.map(ws => ({ id: ws.id, name: ws.name }));
    Logger.log(workspaces);
    return workspaces;
  },

  /**
   * レポート（詳細）取得する
   * データは必要な項目のみの配列に変換済み
   * @param  {Integer} workplaceId ワークプレイスID
   * @param  {Integer} year        レポートを取得する年
   * @param  {Integer} month       レポートを取得する月
   * @return {Array[][]}             [タスクID, チケットNo, 日付, 時間, メモ, タスク名]の配列
   */
  getAllReport(workplaceId, year, month) {
    const period = Utils.getPeriod(year, month);
    const reportJson = this.fetchAllReport(workplaceId, period.since, period.until);
    return parseReportData(reportJson);
  },

  /**
   * レポート（詳細）を全部取得する。
   * 複数ページある場合、すべてのページを取得する
   * @param  {Integer} workplaceId ワークプレイスID
   * @param  {String} since       取得開始日（YYYY-MM-DD）
   * @param  {String} until       取得最終日（YYYY-MM-DD）
   * @return {Array[Obejct]}      Togglのレポートオブジェクト
   */
  fetchAllReport(workplaceId, since, until) {
    let page = 1;
    let hasNext = true;
    let report = [];
    while (hasNext) {
      const result = fetchReport(workplaceId, since, until, page);
      const reportJson = result.reportJson;
      hasNext = result.hasNext;
      Utilities.sleep(1500); // APIのrate limitを避けるため
      report = report.concat(reportJson);
      page += 1;
    }
    return report;
  },
};

export default Toggl;
