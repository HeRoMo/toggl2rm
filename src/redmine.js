"use strict"
var Redmine = {
  
  addTimeEntry:function (ticketId, date, hours, comment){
    var rmServer = Props.get('RM_SERVER')
    var apiKey = Props.get('RM_API_KEY')
    var url = rmServer + "/time_entries.xml?key=" + apiKey
    var time_entry = {
      "issue_id": ticketId,
      "spent_on": date,
      "hours": hours,
      "comments": comment
    }
    
    var opts = {
      "method": "post",
      "headers": { "Content-Type": "application/json" },
      "payload": JSON.stringify({"time_entry": time_entry })
    }
    var response = UrlFetchApp.fetch(url, opts)
    var code = response.getResponseCode()
    return (code == 201)
  }
}
