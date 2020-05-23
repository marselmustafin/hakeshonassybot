const { dbClient } = require('../dbClient');
const { getUserStatString } = require('../utils/render');

const collect = async ({ chat, date }) => {
  const messageDate = new Date(date * 1000);
  messageDate.setHours(messageDate.getHours() - 1);
  const hourTimestamp = Math.floor(messageDate / 1000);
  const data = await dbClient.queryMessages((messages) => messages.aggregate(
    [
      { $match: { 'chat.id': chat.id, date: { $gt: hourTimestamp } } },
      {
        $group: {
          _id: '$from.id',
          count: { $sum: 1 },
          username: { $first: '$from.username' },
          first_name: { $first: '$from.first_name' },
          last_name: { $first: '$from.last_name' },
        },
      },
      { $sort: { count: -1 } },
    ],
  ).toArray());
  return data;
};

const render = (collectedStat) => `Сообщений за последний час: ${collectedStat.map(getUserStatString).join(', ')}`;


module.exports = {
  render,
  collect,
};
