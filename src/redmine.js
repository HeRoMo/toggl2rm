const Redmine = {

  addTimeEntry(ticketId, date, hours, comments) {
    const rmServer = Props.get('RM_SERVER');
    const apiKey = Props.get('RM_API_KEY');
    const url = `${rmServer}/time_entries.xml?key=${apiKey}`;
    const timeEntry = {
      issue_id: ticketId,
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

global.Redmine = Redmine;
