const express = require('express');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const db = new Low(new JSONFile('db.json'), { polls: [] });

async function initDB() {
    await db.read();
    db.data ||= { polls: [] };
    await db.write();
}
initDB();

function isExpired(poll) {
    const endTime = poll.createdAt + poll.duration * 60 * 1000;
    return Date.now() > endTime;
}

app.post('/create', async (req, res) => {
    const { question, options, duration } = req.body;

    const poll = {
        id: nanoid(6),
        question,
        options: options.map(o => ({ option: o, votes: 0 })),
        createdAt: Date.now(),
        duration: Number(duration)
    }; 

    db.data.polls.push(poll);
    await db.write();

    res.json({ link: `/poll/${poll.id}` });
});

app.get('/poll/:id', async (req, res) => {
    await db.read();
    const poll = db.data.polls.find(p => p.id === req.params.id);

    if (!poll) return res.status(404).json({ error: 'Not found' });

    res.json(poll);
});

app.post('/poll/:id/vote', async (req, res) => {
    const { option } = req.body;
    await db.read();

    const poll = db.data.polls.find(p => p.id === req.params.id);
    if (!poll) return res.status(404).json({ error: 'Not found' });

    if (isExpired(poll)) {
        return res.status(403).json({ error: 'Poll has ended' });
    }

    const opt = poll.options.find(o => o.option === option);
    if (opt) opt.votes++;

    await db.write();
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
