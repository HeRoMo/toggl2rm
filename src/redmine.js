const RM_SERVER = 'RM_SERVER';
const RM_API_KEY = 'RM_API_KEY';

/**
 * Redmine APIにリクエストを投げる
 * @param  {String} path    API エンドポイントのパス（'/' 始まり）
 * @param  {Object} options リクエストのオプション
 * @return {Response}         [description]
 */
function callRedmineApi(path, options) {
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
   * @param {Integer} ticketNo チケットNo
   * @param {String}  date     日付
   * @param {Integer} hours    作業時間
   * @param {String} comments  作業メモ
   */
  addTimeEntry(ticketNo, date, hours, comments) {
    const timeEntry = {
      issue_id: ticketNo,
      spent_on: date,
      hours,
      comments,
    };
    const options = {
      method: 'post',
      payload: { time_entry: timeEntry },
    };
    const response = callRedmineApi('/time_entries.xml', options);
    const code = response.getResponseCode();
    return (code === 201);
  },
};

export default Redmine;
