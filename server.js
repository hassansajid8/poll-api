const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const prisma = require('./lib/db');
const { KafkaProducer, KafkaConsumer } = require('./lib/kafka');
const app = express();

app.use(bodyParser.json());

// create http server for express and socket.io
const server = http.createServer(app);
const io = new Server(server);

//handle websocket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on("join_poll", (pollId) => {
        socket.join(pollId);
        console.log(`A user joined ${pollId}`);
    });

    socket.on('disconnect', () => {
        console.log("A user disconnected");
    });
});


// API

// POST /polls --create poll
app.post('/polls', async (req, res) => {
    const { question, options } = req.body;
    const result = await prisma.polls.create({
        data: {
            question: question,
            options: JSON.stringify(options)
        }
    });
    res.json(result);
});

// POST /polls/:id/vote --vote in a poll
app.post('/polls/:id/vote', async (req, res) => {
    const { id: pollId } = req.params;
    const { optionId } = req.body;
    const vote = { pollId, optionId }

    KafkaProducer.send([{ topic: 'votes', messages: JSON.stringify(vote) }], (err) => {
        if (err) {
            console.log("Error writing kafka message", err);
            return res.status(500).send('Error processing vote');
        }

        return res.status(200).send('Vote recieved');
    });
});

// get vote count for a poll
app.get('/polls/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const poll = await prisma.polls.findUnique({
            where: {
                id: id
            }
        });

        if (!poll) {
            return res.status(404).send("poll not found");
        }

        const result = await prisma.votes.groupBy({
            by: ['option_id'],
            _count: {
                option_id: true,
            },
            where: {
                poll_id: id
            }
        });

        const fmtResults = result.map((entry) => ({
            option_id: entry.option_id,
            votes: entry._count.option_id,
        }));

        res.json({ poll: poll, result: fmtResults });
    } catch (err) {
        console.log("/polls/:id -- some error occurred", err);
        return res.status(500).send("some error occurred");
    }
});

// api for leaderboard
app.get('/leaderboard', async (req, res) => {
    const result = await prisma.votes.groupBy({
        by: ['poll_id'],
        _count: {
            poll_id: true,
        },
        orderBy: {
            _count: {
                poll_id: 'desc'
            },
        },
        take: 10
    });

    const leaderboard = result.map((entry) => ({
        poll_id: entry.poll_id,
        votes: entry._count.poll_id
    }));

    res.json(leaderboard);
})

// recieve processed votes, push to db and broadcast to clients
KafkaConsumer.on('message', async (msg) => {
    const vote = JSON.parse(msg.value);
    const result = await prisma.votes.create({
        data: {
            poll_id: vote.pollId,
            option_id: vote.optionId
        }
    });

    io.to(vote.pollId).emit('poll_update', result);
});

// listen to http requests on port 3000
server.listen(3000, () => {
    console.log(`Server running on port 3000`);
});



