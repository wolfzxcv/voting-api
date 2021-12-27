import { JSONFileSync, LowSync } from 'lowdb';
import { nanoid } from 'nanoid';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import app from './setting.js';

type IData = {
  votes: IVote[];
};

type IVote = {
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

type IUpdateVoteOption = {
  id: string;
  option: 'win' | 'lose' | 'draw';
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');

const db = new LowSync<IData>(new JSONFileSync<IData>(file));

const readDb = async () => {
  await db.read();
};

readDb();

db.data = db.data || { votes: [] };

const { votes } = db.data as IData;

const dataExist = (all: IData['votes'], id: string) => {
  return all.find((p) => p.id === id);
};

const generateOutput = (originVote: IVote) => {
  const output = JSON.parse(JSON.stringify(originVote));

  const win = output.result.win;
  const lose = output.result.lose;
  const draw = output.result.draw;
  const total = win + lose + draw;
  const winRate = Math.round((win / total) * 100) || 0;
  const loseRate = Math.round((lose / total) * 100) || 0;
  const drawRate =
    win === 0 && lose === 0 && draw === 0 ? 0 : 100 - winRate - loseRate;

  output.result.winRate = winRate + '%';
  output.result.loseRate = loseRate + '%';
  output.result.drawRate = drawRate + '%';
  output.result.total = total;

  return output;
};

app.get('/vote/:id', async (req, res) => {
  try {
    const vote = dataExist(votes, req.params.id);
    if (!vote) {
      throw new Error();
    }

    res.status(200).json({
      msg: `Votes id "${req.params.id}" got!`,
      code: 1,
      data: { ...generateOutput(vote) },
      status: 'success'
    });
  } catch {
    res.status(400).json({
      msg: `Can't get vote id "${req.params.id}".`,
      code: 0,
      status: 'error'
    });
  }
});

app.get('/votes', async (req, res) => {
  try {
    res.status(200).json({
      msg: 'Votes got!',
      code: 1,
      data: votes,
      status: 'success'
    });
  } catch {
    res.status(400).json({ msg: "Can't get votes.", code: 0, status: 'error' });
  }
});

app.post('/vote', async (req, res) => {
  try {
    const newVote = {
      id: nanoid(),
      title: (req.body.title as string) || '',
      result: {
        win: 0,
        lose: 0,
        draw: 0
      }
    };

    votes.push(newVote);
    await db.write();
    res.status(200).json({
      msg: 'New vote added!',
      code: 1,
      data: newVote,
      status: 'success'
    });
  } catch {
    res.status(400).json({ msg: 'error', code: 0, status: 'error' });
  }
});

app.patch('/vote', async (req, res) => {
  try {
    const { id, option } = req.body as IUpdateVoteOption;
    const validOption =
      option === 'win' || option === 'lose' || option === 'draw';
    if (id && option && validOption) {
      const vote = dataExist(votes, id);
      if (vote) {
        const idx = votes.indexOf(vote);
        votes[idx]['result'][option] = votes[idx]['result'][option] + 1;
        await db.write();
        res.status(200).json({
          msg: 'success',
          code: 1,
          data: { ...generateOutput(votes[idx]) },
          status: 'success'
        });
      } else {
        throw new Error();
      }
    } else {
      throw new Error();
    }
  } catch {
    res.status(400).json({
      msg: `Either params are wrong, or this id doesn't exist.`,
      code: 0,
      status: 'error'
    });
  }
});

app.delete('/vote/:id', async (req, res) => {
  try {
    const vote = dataExist(votes, req.params.id);
    if (vote) {
      const idx = votes.indexOf(vote);
      votes.splice(idx, 1);
      await db.write();
      res.status(200).json({
        msg: `Vote id "${req.params.id}" deleted!`,
        data: votes,
        code: 1,
        status: 'success'
      });
    } else {
      throw new Error();
    }
  } catch {
    res.status(400).json({
      msg: `Can't find vote id "${req.params.id}".`,
      code: 0,
      status: 'error'
    });
  }
});

try {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, (): void => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error(`Error: ${error}`);
}
