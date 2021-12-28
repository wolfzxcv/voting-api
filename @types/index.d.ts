export type IData = {
  whitelist: string[];
  votes: IVote[];
};

export type IVote = {
  id: string;
  title: string;
  result: {
    win: number;
    winRate?: string;
    lose: number;
    loseRate?: string;
    draw: number;
    drawRate?: string;
    total?: number;
  };
};

export type IUpdateVoteOption = {
  id: string;
  title?: string;
  option: 'win' | 'lose' | 'draw';
};
