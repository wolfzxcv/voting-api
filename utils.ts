import { IData, IVote } from './@types';

export const dataExist = (all: IData['votes'], id: string) => {
  return all.find((p) => p.id === id);
};

export const generateOutput = (originVote: IVote) => {
  const output = JSON.parse(JSON.stringify(originVote));

  const win = output.result.win;
  const lose = output.result.lose;
  const draw = output.result.draw;
  const total = win + lose + draw;
  const winRate = Math.round((win / total) * 100) || 0;
  let loseRate = Math.round((lose / total) * 100) || 0;

  if (winRate + loseRate > 100) {
    loseRate = 100 - winRate;
  }

  const drawRate =
    win === 0 && lose === 0 && draw === 0 ? 0 : 100 - winRate - loseRate;

  output.result.winRate = winRate + '%';
  output.result.loseRate = loseRate + '%';
  output.result.drawRate = drawRate + '%';
  output.result.total = total;

  return output;
};
