import { JSONFileSync, LowSync } from 'lowdb';
import { nanoid } from 'nanoid';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { IData, IUpdateVoteOption } from './@types/index.js';
import app from './setting.js';
import { dataExist, generateOutput } from './utils.js';

// lowdb settings
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');

const db = new LowSync<IData>(new JSONFileSync<IData>(file));

const readDb = async () => {
  await db.read();
};

readDb();

db.data = db.data || { whitelist: [], votes: [] };

const { votes, whitelist } = db.data as IData;

// get one
app.get('/vote/:id', async (req, res) => {
  try {
    const vote = dataExist(votes, req.params.id);

    if (!vote) {
      throw new Error();
    }

    res.status(200).json({
      msg: `Votes "${req.params.id}" got.`,
      code: 1,
      data: generateOutput(vote),
      status: 'success'
    });
  } catch {
    res.status(400).json({
      msg: `Can't get vote "${req.params.id}".`,
      code: 0,
      status: 'error'
    });
  }
});

// get all
app.get('/votes', async (req, res) => {
  try {
    res.status(200).json({
      msg: 'Votes got.',
      code: 1,
      data: votes,
      status: 'success'
    });
  } catch {
    res.status(400).json({ msg: "Can't get votes.", code: 0, status: 'error' });
  }
});

// post
app.post('/vote', async (req, res) => {
  try {
    const title = req.body.title;

    const newVote = {
      id: nanoid(),
      title: title ? (title.toString() as string) : '',
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

// patch
app.patch('/vote', async (req, res) => {
  try {
    const { id, option, title } = req.body as IUpdateVoteOption;
    const validOption =
      option === 'win' || option === 'lose' || option === 'draw';

    if (id && option && validOption) {
      const vote = dataExist(votes, id);

      if (vote) {
        const idx = votes.indexOf(vote);

        votes[idx]['result'][option] = votes[idx]['result'][option] + 1;

        if (title && title.length) {
          votes[idx]['title'] = title;
        }

        await db.write();

        res.status(200).json({
          msg: 'success',
          code: 1,
          data: generateOutput(votes[idx]),
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

// delete
app.delete('/vote/:id', async (req, res) => {
  let msg;
  try {
    const id = req.params.id;

    const vote = dataExist(votes, id);

    if (vote && whitelist.find((eachId) => eachId === id)) {
      msg = `"${id}" is protected.`;
      throw new Error();
    } else if (vote) {
      const idx = votes.indexOf(vote);
      votes.splice(idx, 1);
      await db.write();
      res.status(200).json({
        msg: `Vote id "${req.params.id}" deleted!`,
        code: 1,
        status: 'success'
      });
    } else {
      msg = `Can't find vote id "${id}".`;
      throw new Error();
    }
  } catch (e) {
    res.status(400).json({
      msg: msg || e,
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
