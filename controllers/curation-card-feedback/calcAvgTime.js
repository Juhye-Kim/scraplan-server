module.exports = (times, count) => {
  const totalTime = Math.floor(times) * 60 + Math.floor((times % 1) * 100);
  const avgTime = totalTime / count;

  let hours = Math.floor(avgTime / 60);
  let minutes = Math.round((avgTime % 60) / 15) * 15;

  if (minutes >= 60) hours++, (minutes -= 60);
  return hours + minutes / 100;
};
