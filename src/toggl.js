const Toggl = {

  getWorkspaces() {
    const url = 'https://www.toggl.com/api/v8/workspaces';
    const response = this._callTogglApi(url);
    const content = JSON.parse(response.getContentText());
    Logger.log(content);
    const workspaces = content.map(ws => ({ id: ws.id, name: ws.name }));
    Logger.log(workspaces);
    return workspaces;
  },

  fetchReport(workplaceId, since, until) {
    let page = 1;
    let hasNext = true;
    let report = [];
    while (hasNext) {
      const result = this.getReport(workplaceId, since, until, page);
      const reportJson = result.reportJson;
      hasNext = result.hasNext;
      Utilities.sleep(1500); // APIのrate limitを避けるため
      report = report.concat(reportJson);
      page += 1;
    }
    return report;
  },

  getReport(workplaceId, since, until, page = 1) {
    const url = Utilities.formatString(
      'https://toggl.com/reports/api/v2/details?workspace_id=%s&since=%s&until=%s&page=%s&user_agent=toggl2rm',
      workplaceId,
      since,
      until,
      page,
    );
    const response = this._callTogglApi(url);
    const content = JSON.parse(response.getContentText());
    const reportJson = content.data;
    const hasNext = (content.per_page <= reportJson.length);
    Logger.log('%s, %s, %s', reportJson.length, hasNext, page);
    return { reportJson, hasNext };
  },

  parseReportData(reportJson) {
    const ticketNoIndex = 1;
    const parsedReport = reportJson.map((report) => {
      const startDate = /^([0-9]{4}-[0-9]{2}-[0-9]{2})T.+$/.exec(report.start)[1];
      const duration = Math.round(report.dur / (60 * 60 * 10)) / 100;
      let ticketNo = '';
      if (/^#/.test(report.description)) {
        ticketNo = /^#([0-9]+):?[\s][\S]+/.exec(report.description)[ticketNoIndex];
      } else {
        return null;
      }
      const formattedRepo = [report.id, ticketNo, startDate, duration, report.tags.join('、'), report.description];
      return formattedRepo;
    }).filter(elm => (elm != null));
    return parsedReport;
  },

  _callTogglApi(url) {
    const togglKey = Props.get('TOGGL_API_TOKEN');
    Logger.log(togglKey);
    const authToken = Utilities.base64Encode(`${togglKey}:api_token`);
    const headers = { Authorization: `Basic ${authToken}` };
    const response = UrlFetchApp.fetch(url, { headers });
    return response;
  },
};

global.Toggl = Toggl;
