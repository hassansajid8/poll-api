# API for a Polling App Using Apache Kafka, Nodejs and Websockets

## Instructions

1. **Clone the repository.**

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
    - Create .env file in root
    - Enter fields for connecting to your database through PrismaORM:
        - DATABASE_URL
        - DIRECT_URL
    - (*Optional*) Enter fields for your kafka server:
        - KAFKA_HOST

4. **Setup prisma orm**
    - Push schema to database
    ```bash
    npx prisma db push
    ```

    - Generate prisma client
    ```bash
    npx prisma generate
    ```

5. **Start zookeeper + kafka**
    - cd into 'kafka_2.13-3.9.0' directory
    - Start zookeeper service
    ```bash
    bin/zookeeper-server-start.sh config/zookeeper.properties
    ```

    - From another terminal, start kafka broker
    ```bash
    bin/kafka-server-start.sh config/server.properties
    ```
    
    - Create a new topic votes using another terminal
    ```bash
    bin/kafka-topics.sh --create --topic votes --bootstrap-server localhost:9092
    ```
    - You can also define partitions and replicas. Check this link for more: [text](https://kafka.apache.org/quickstart)

6. **Start the server**
```bash
npm start
```

7. **Testing**
    - You can use Postman for API testing
    - run sockets.test.js file for testing websocket connections
    ```bash
    node tests/sockets.test.js
    ```
    - Use kafka CLI for testing consumer and producer sides.


# API

1. *POST /polls*
    - Create a new poll.
    - Accepts request body:
    ```bash
    {
        question: //question,
        options: //array of options
    }
    ```

    - Returns result object 
    ```bash
    result: {
        id: string;
        question: string;
        options: JsonValue;
        created_at: Date;
    }
    ```

2. *POST /polls/:id/vote*
    - Casts a vote to poll *:id*
    - Accepts request body:
    ```bash
    {
        optionId: index of option in the options array
    }
    ```
    - Returns status 500 on error, and 200 on success with a message

3. *GET /polls/:id*
    - Returns poll details with poll_id = *:id*, and it's vote counts
    - poll object
    ```bash
    poll: {
        id: string;
        question: string;
        options: JsonValue;
        created_at: Date;
    } 
    ```
    - votes array of objects:
    ```bash
    result: {
        option_id: number;
        votes: number;
    }[]
    ```

4. *GET /leaderboard*
    - returns top 10 polls with largest amount of votes
    - returns leaderboard array of objects:
    ```bash
    leaderboard: {
        poll_id: string;
        votes: number;
    }[]
    ```

# Contact
    - Contact for any queries or bugs.
    - hassansajid.dev@gmail.com
