const isBeforeHoursAgo = (dateString, hours) => {
  const inputDate = new Date(dateString);

  const now = new Date();

  const hoursAgo = new Date(now.getTime() - hours * 60 * 60 * 1000);

  return inputDate < hoursAgo;
};

module.exports = { isBeforeHoursAgo };
