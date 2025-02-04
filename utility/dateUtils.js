const dateUtils = {
  getMonthName(dateString) {
    const date = new Date(dateString);
    const shortMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = date.getMonth();
    return shortMonthNames[monthIndex];
  },
  getYear(dateString) {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  },
  getShortMonthName(dateString) {
    const date = new Date(dateString);
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = date.getMonth();
    return shortMonthNames[monthIndex];
  },
  getDayOfMonth(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    return day.toString().padStart(2, '0');
  },
};

export default dateUtils;
