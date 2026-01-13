const optionColors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'];

async function createPoll() {
    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const durationEl = document.getElementById('duration');

    if (!questionEl || !optionsEl || !durationEl) {
        alert('HTML elements missing');
        return;
    }

    const question = questionEl.value;
    const options = optionsEl.value
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);

    const duration = Number(durationEl.value);

    if (!question || options.length < 2 || !duration) {
        alert('Please fill all fields correctly');
        return;
    }

    const res = await fetch('/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options, duration })
    });

    const data = await res.json();
    const id = data.link.split('/').pop();

    document.getElementById('link').innerHTML = `
        Poll created!<br>
        <a href="poll.html?id=${id}" target="_blank">
            ${location.origin}/poll.html?id=${id}
        </a>
    `;
}

async function loadPoll(id) {
    const res = await fetch(`/poll/${id}`);
    const poll = await res.json();

    const container = document.getElementById('options');
    container.innerHTML = '';

    document.getElementById('question').innerText = poll.question;

    const durationMs = Number(poll.duration) * 60 * 1000;
    const endTime = Number(poll.createdAt) + durationMs;

    const timer = document.createElement('div');
    timer.style.margin = '15px 0';
    container.appendChild(timer);

    const interval = setInterval(() => {
        const remaining = endTime - Date.now();

        if (remaining <= 0) {
            timer.innerText = '⏰ Poll ended';
            clearInterval(interval);

            fetch(`/poll/${id}`)
                .then(res => res.json())
                .then(latestPoll => renderOptions(latestPoll, container, endTime, id));

            return;
        }

        const totalSeconds = Math.floor(remaining / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        timer.innerText = `Time left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);

    renderOptions(poll, container, endTime, id);
}

function renderOptions(poll, container, endTime, id) {
    const timer = container.firstChild;
    container.innerHTML = '';
    container.appendChild(timer);

    const totalVotes = poll.options.reduce((a, o) => a + o.votes, 0) || 1;

    poll.options.forEach((opt, i) => {
        const bar = document.createElement('div');
        bar.className = 'option-bar';
        bar.style.position = 'relative';

        const fill = document.createElement('div');
        fill.className = 'option-fill';
        fill.style.width = `${(opt.votes / totalVotes) * 100}%`;
        fill.style.background = optionColors[i % optionColors.length];

        const text = document.createElement('div');
        text.className = 'option-text';
        text.innerText = opt.option;

        const votesEl = document.createElement('div');
        votesEl.className = 'option-votes';
        votesEl.innerText = opt.votes;

        if (Date.now() > endTime) {
            bar.classList.add('disabled');
        } else {
            bar.onclick = () => vote(id, opt.option, endTime);
        }

        bar.appendChild(fill);
        bar.appendChild(text);
        bar.appendChild(votesEl);
        container.appendChild(bar);
    });
}

async function vote(id, option, endTime) {
    if (Date.now() > endTime) {
        alert('Poll has ended');
        return;
    }

    if (localStorage.getItem('voted_' + id)) {
        alert('You already voted');
        return;
    }

    await fetch(`/poll/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option })
    });

    localStorage.setItem('voted_' + id, 'true');
    loadPoll(id);
}
