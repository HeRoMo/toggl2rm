import Props from './props';
import Utils from './utils';

const TOGGL_API_TOKEN = 'TOGGL_API_TOKEN';

interface IToggleReportData {
  id: number;
  dur: number;
  description: string;
  start: string;
  tags: string[];
}
/**
 * TogglのAPIを実行する
 * @param url APIのエンドポイントURL＋クエリパラメータ
 * @return APIのレスポンス
 */
function callTogglApi(url: string): GoogleAppsScript.URL_Fetch.HTTPResponse {
  const togglKey = Props.get(TOGGL_API_TOKEN);
  const authToken = Utilities.base64Encode(`${togglKey}:api_token`);
  const headers = { Authorization: `Basic ${authToken}` }; // eslint-disable-line @typescript-eslint/naming-convention
  const response = UrlFetchApp.fetch(url, { headers });
  return response;
}

/**
 * レポート（詳細）を取得する
 * @param orkplaceId ワークプレイスID
 * @param since       取得開始日（YYYY-MM-DD）
 * @param until       取得最終日（YYYY-MM-DD）
 * @param page        取得ページ番号
 * @return            Togglのレポートオブジェクト
 */
function fetchReport(
  workplaceId: number,
  since: string,
  until: string,
  page: number = 1,
): { reportJson: object, hasNext: boolean } {
  // tslint:disable-next-line:max-line-length
  const url = `https://api.track.toggl.com/reports/api/v2/details?workspace_id=${workplaceId}&since=${since}&until=${until}&page=${page}&user_agent=toggl2rm`;
  const response = callTogglApi(url);
  const content = JSON.parse(response.getContentText());
  const reportJson = content.data;
  const hasNext = (content.per_page <= reportJson.length);
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
 * @param reportJson Togglのレポートオブジェクトの配列
 * @return 必要な値の配列のリスト
 */
function parseReportData(reportJson: IToggleReportData[]): any[][] {
  const ticketNoIndex = 1;
  const parsedReport = reportJson.map((report) => {
    const startDate = /^([0-9]{4}-[0-9]{2}-[0-9]{2})T.+$/.exec(report.start)[1];
    const duration = Math.round(report.dur / (60 * 60 * 10)) / 100;
    const ticketNoReg = /^#([0-9]+)/.exec(report.description);
    let ticketNo = null;
    if (ticketNoReg) ticketNo = ticketNoReg[ticketNoIndex];
    const formattedRepo = [report.id, ticketNo, startDate, duration, report.tags.join('、'), report.description];
    return formattedRepo;
  });
  parsedReport.reverse();
  parsedReport.unshift(['togglId', 'ticketNo', 'date', 'hours', 'tags', 'toggl description']);
  return parsedReport;
}

const Toggl = { // eslint-disable-line @typescript-eslint/naming-convention
  /**
   * ワークスペースを取得する
   * @return ワークスペースのリスト。 { id, name } の配列
   */
  getWorkspaces(): Array<{ id: number, name: string }> {
    const url = 'https://api.track.toggl.com/api/v8/workspaces';
    const response = callTogglApi(url);
    const content = JSON.parse(response.getContentText());
    const workspaces = content.map((ws) => ({ id: ws.id, name: ws.name }));
    return workspaces;
  },

  /**
   * レポート（詳細）取得する
   * データは必要な項目のみの配列に変換済み
   * @param workplaceId ワークプレイスID
   * @param year        レポートを取得する年
   * @param month       レポートを取得する月
   * @return [タスクID, チケットNo, 日付, 時間, メモ, タスク名]の配列
   */
  getAllReport(workplaceId: number, year: number, month: number): any[][] {
    const period = Utils.getPeriod(year, month);
    const reportJson = this.fetchAllReport(workplaceId, period.since, period.until);
    return parseReportData(reportJson);
  },

  /**
   * レポート（詳細）を全部取得する。
   * 複数ページある場合、すべてのページを取得する
   * @param workplaceId ワークプレイスID
   * @param since       取得開始日（YYYY-MM-DD）
   * @param until       取得最終日（YYYY-MM-DD）
   * @return Togglのレポートオブジェクト
   */
  fetchAllReport(workplaceId: number, since: string, until: string): IToggleReportData[] {
    let page = 1;
    let hasNext = true;
    let report = [];
    while (hasNext) {
      const result = fetchReport(workplaceId, since, until, page);
      const { reportJson } = result;
      hasNext = result.hasNext;
      Utilities.sleep(1500); // APIのrate limitを避けるため
      report = report.concat(reportJson);
      page += 1;
    }
    return report;
  },
};

export default Toggl;
