const RM_SERVER = 'RM_SERVER';
const RM_API_KEY = 'RM_API_KEY';

const Redmine = {
  /**
   * Redmineに時間を記録する
   * @param {Integer} ticketNo チケットNo
   * @param {String}  date     日付
   * @param {Integer} hours    作業時間
   * @param {String} comments  作業メモ
   */
  addTimeEntry(ticketNo, date, hours, comments) {
    const rmServer = Props.get(RM_SERVER);
    const apiKey = Props.get(RM_API_KEY);
    const url = `${rmServer}/time_entries.xml?key=${apiKey}`;
    const timeEntry = {
      issue_id: ticketNo,
      spent_on: date,
      hours,
      comments,
    };

    const opts = {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify({ time_entry: timeEntry }),
    };
    const response = UrlFetchApp.fetch(url, opts);
    const code = response.getResponseCode();
    return (code === 201);
  },
};

export default Redmine;
