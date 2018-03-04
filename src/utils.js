const Utils = {
  getYearMonths() {
    const now = new Date();
    const yearMonths = [Utilities.formatDate(now, 'JST', 'yyyy-MM')];
    for (let i = 0; i < 5; i += 1) {
      now.setMonth(now.getMonth() - 1);
      const ym = Utilities.formatDate(now, 'JST', 'yyyy-MM');
      yearMonths.push(ym);
    }
    return yearMonths;
  },

  getPeriod(year, month) {
    const start = new Date(year, (month - 1), 1);
    const end = new Date(year, month, 0);
    const since = Utilities.formatDate(start, 'JST', 'yyyy-MM-dd');
    const until = Utilities.formatDate(end, 'JST', 'yyyy-MM-dd');
    const period = { since, until };
    return period;
  },
};

global.Utils = Utils;
