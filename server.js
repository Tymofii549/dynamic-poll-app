const express = require('express');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');
const app = express();
const PORT = 3000;

const adapter = new JSONFile('db.json');

const db = new Low(adapter, { polls: [] });

async function start() {
    await db.read();
    db.data ||= { polls: [] };

    app.use(express.json());
    app.use(express.static('public'));

    app.post('/create', async (req, res) => {
        const { question, options } = req.body;
        const id = nanoid(6);
        db.data.polls.push({
            id,
            question,
            options: options.map(o => ({ option: o, votes: 0 }))
        });
        await db.write();
        res.send({ link: `/poll/${id}` });
    });

    app.get('/poll/:id', async (req, res) => {
        const poll = db.data.polls.find(p => p.id === req.params.id);
        if (!poll) return res.status(404).send('Poll not found');
        res.send(poll);
    });

    app.post('/poll/:id/vote', async (req, res) => {
        const { option } = req.body;
        const poll = db.data.polls.find(p => p.id === req.params.id);
        if (!poll) return res.status(404).send('Poll not found');

        const opt = poll.options.find(o => o.option === option);
        if (opt) opt.votes++;
        await db.write();
        res.send(poll);
    });

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start();


