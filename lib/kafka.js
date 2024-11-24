const kafka = require('kafka-node');
const { KafkaClient, Producer, Consumer } = kafka;

// connect to kafka broker
const client = new KafkaClient({ kafkaHost: process.env.KAFKA_HOST || 'localhost:9092' });

// initiate kafka producer console for writing events
const KafkaProducer = new Producer(client);
KafkaProducer.on('ready', () => console.log('Kafka Producer is ready'));
KafkaProducer.on('error', (err) => console.error('Kafka Producer error:', err));

// initiate kafka consumer console for reading events
const KafkaConsumer = new Consumer(
    client,
    [{ topic: 'votes', partition: 0 }],
    { autoCommit: true }
);
KafkaConsumer.on('error', (err) => console.error('Kafka Consumer error:', err));

module.exports = { KafkaProducer, KafkaConsumer };
