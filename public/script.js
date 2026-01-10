const optionColors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];

async function createPoll() {
    const question = document.getElementById('question').value;
    const options = document.getElementById('options').value
        .split(',')
        .map(o => o.trim())
        .filter(o => o);

    if (!question || options.length < 2) {
        alert('Enter a question and at least 2 options.');
        return;
    }

    const res = await fetch('/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ question, options })
    });

    const data = await res.json();

    document.getElementById('link').innerHTML = `
        Poll created! Share this link: 
        <a href="poll.html?id=${data.link.split('/').pop()}" target="_blank">
            ${window.location.origin}/poll.html?id=${data.link.split('/').pop()}
        </a>
    `;
}

async function loadPoll(id) {
    const res = await fetch(`/poll/${id}`);
    if (!res.ok) {
        document.body.innerHTML = '<h1>Poll not found</h1>';
        return;
    }

    const poll = await res.json();
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';

    document.getElementById('question').innerText = poll.question;

    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0) || 1;

    let totalDiv = document.createElement('div');
    totalDiv.style.margin = '20px 0';
    totalDiv.innerText = `Total votes: ${totalVotes}`;
    optionsDiv.appendChild(totalDiv);

    poll.options.forEach((opt, index) => {
        const container = document.createElement('div');
        container.className = 'option-bar';

        const fill = document.createElement('div');
        fill.className = 'option-fill';
        fill.style.width = `${(opt.votes / totalVotes) * 100}%`;
        fill.style.backgroundColor = optionColors[index % optionColors.length];
        fill.style.transition = 'width 0.5s';
        fill.innerText = `${opt.votes}`;

        const text = document.createElement('div');
        text.className = 'option-text';
        text.innerText = opt.option;

        container.onclick = () => vote(id, opt.option);

        container.appendChild(fill);
        container.appendChild(text);
        optionsDiv.appendChild(container);
    });
}
async function vote(id, option) {
    if (localStorage.getItem('voted_' + id)) {
        alert("You already voted in this poll!");
        return;
    }

    await fetch(`/poll/${id}/vote`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ option })
    });

    localStorage.setItem('voted_' + id, 'true');
    loadPoll(id);
}
