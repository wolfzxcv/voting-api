var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { JSONFileSync, LowSync } from 'lowdb';
import { nanoid } from 'nanoid';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import app from './setting.js';
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');
const db = new LowSync(new JSONFileSync(file));
const readDb = () => __awaiter(void 0, void 0, void 0, function* () {
    yield db.read();
});
readDb();
db.data = db.data || { votes: [] };
const { votes } = db.data;
const dataExist = (all, id) => {
    return all.find((p) => p.id === id);
};
const generateOutput = (originVote) => {
    const output = Object.assign({}, originVote);
    const total = output.result.win + output.result.lose + output.result.draw;
    const winRate = Math.round((output.result.win / total) * 100);
    const loseRate = Math.round((output.result.lose / total) * 100);
    const drawRate = 100 - winRate - loseRate;
    output.result.winRate = winRate + '%';
    output.result.loseRate = loseRate + '%';
    output.result.drawRate = drawRate + '%';
    output.result.total = total;
    return output;
};
app.get('/vote/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vote = dataExist(votes, req.params.id);
        if (!vote) {
            throw new Error();
        }
        res.status(200).json({
            msg: `Votes id "${req.params.id}" got!`,
            code: 1,
            data: generateOutput(vote),
            status: 'success'
        });
    }
    catch (_a) {
        res.status(400).json({
            msg: `Can't get vote id "${req.params.id}".`,
            code: 0,
            status: 'error'
        });
    }
}));
app.get('/votes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({
            msg: 'Votes got!',
            code: 1,
            data: votes,
            status: 'success'
        });
    }
    catch (_b) {
        res.status(400).json({ msg: "Can't get votes.", code: 0, status: 'error' });
    }
}));
app.post('/vote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newVote = {
            id: nanoid(),
            title: req.body.title || '',
            result: {
                win: 0,
                lose: 0,
                draw: 0
            }
        };
        votes.push(newVote);
        yield db.write();
        res.status(200).json({
            msg: 'New vote added!',
            code: 1,
            data: votes,
            status: 'success'
        });
    }
    catch (_c) {
        res.status(400).json({ msg: 'error', code: 0, status: 'error' });
    }
}));
app.patch('/vote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, option } = req.body;
        const validOption = option === 'win' || option === 'lose' || option === 'draw';
        if (id && option && validOption) {
            const vote = dataExist(votes, id);
            if (vote) {
                const idx = votes.indexOf(vote);
                votes[idx]['result'][option] = votes[idx]['result'][option] + 1;
                yield db.write();
                res.status(200).json({
                    msg: 'success',
                    code: 1,
                    data: generateOutput(vote),
                    status: 'success'
                });
            }
            else {
                throw new Error();
            }
        }
        else {
            throw new Error();
        }
    }
    catch (_d) {
        res.status(400).json({
            msg: `Either params are wrong, or this id doesn't exist.`,
            code: 0,
            status: 'error'
        });
    }
}));
app.delete('/vote/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vote = dataExist(votes, req.params.id);
        if (vote) {
            const idx = votes.indexOf(vote);
            votes.splice(idx, 1);
            yield db.write();
            res.status(200).json({
                msg: `Vote id "${req.params.id}" deleted!`,
                data: votes,
                code: 1,
                status: 'success'
            });
        }
        else {
            throw new Error();
        }
    }
    catch (_e) {
        res.status(400).json({
            msg: `Can't find vote id "${req.params.id}".`,
            code: 0,
            status: 'error'
        });
    }
}));
try {
    app.listen(port, () => {
        console.log(`Connected successfully on port ${port}`);
    });
}
catch (error) {
    console.error(`Error occured: ${error}`);
}
