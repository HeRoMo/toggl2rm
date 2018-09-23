import Props from './props';

const RM_SERVER = 'RM_SERVER';
const RM_API_KEY = 'RM_API_KEY';

/**
 * Redmine APIにリクエストを投げる
 * @param path    API エンドポイントのパス（'/' 始まり）
 * @param options リクエストのオプション
 * @return APIのレスポンス
 */
function callRedmineApi(
  path: string,
  options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions,
): GoogleAppsScript.URL_Fetch.HTTPResponse {
  const rmServer = Props.get(RM_SERVER);
  const apiKey = Props.get(RM_API_KEY);
  const opts = options;
  opts.headers = options.headers || {};
  opts.headers['X-Redmine-API-Key'] = apiKey;
  if (options.payload) {
    opts.headers['Content-Type'] = 'application/json';
    opts.payload = JSON.stringify(options.payload);
  }
  const url = `${rmServer}${path}`;
  const response = UrlFetchApp.fetch(url, opts);
  return response;
}

const Redmine = {
  /**
   * Redmineに時間を記録する
   * @param ticketNo チケットNo
   * @param date     日付
   * @param hours    作業時間
   * @param comments 作業メモ
   * @returns 登録の成否。成功の場合 true。それ以外は false
   */
  addTimeEntry(ticketNo: number, date: string, hours: number, comments: string): boolean {
    const timeEntry = {
      issue_id: ticketNo,
      spent_on: date,
      // tslint:disable-next-line:object-literal-sort-keys
      hours,
      comments,
    };
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post',
      payload: { time_entry: timeEntry },
    };
    const response = callRedmineApi('/time_entries.xml', options);
    const code = response.getResponseCode();
    return (code === 201);
  },
};

export default Redmine;
