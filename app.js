const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(bodyParser.json());
// MongoDB connection
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


// Event schema
const eventSchema = new mongoose.Schema({
  action: String,
  author: String,
  from_branch: String,
  to_branch: String,
  timestamp: Date,
});

const Event = mongoose.model('Event', eventSchema);

// Webhook receiver endpoint
app.get('/test',async (req,res)=>{
    res.status(200).send('Webhook received');
})
app.post('/webhook', async (req, res) => {
  const payload = req.body;
  const { ref, pusher, commits } = payload;

  // Check if it's a push event
  if (payload.ref && payload.pusher) {
    const author = pusher.name;
    const toBranch = ref.split('/').pop();
    const timestamp = new Date(commits[0].timestamp);

    const formattedEvent = {
      eventType: 'push',
      author: author,
      toBranch: toBranch,
      timestamp: timestamp
    };

    // Store the event in MongoDB
    const event = new WebhookEvent(formattedEvent);
    await event.save();

    res.status(200).send('Push event processed');
  } else {
    res.status(400).send('Unsupported event');
  }
});

app.listen(8080, () => {
  console.log('Webhook receiver running on port 8080');
});
