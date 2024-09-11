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
  const { action, sender, pull_request, ref } = req.body;
  console.log(req.body,'-----------------32',req.headers)
  let event = {};

  if (action === 'push') {
    event = {
      action: 'PUSH',
      author: sender.login,
      to_branch: ref.split('/').pop(),
      timestamp: new Date(),
    };
  } else if (action === 'pull_request') {
    event = {
      action: 'PULL_REQUEST',
      author: sender.login,
      from_branch: pull_request.head.ref,
      to_branch: pull_request.base.ref,
      timestamp: new Date(),
    };
  } else if (action === 'merge') {
    event = {
      action: 'MERGE',
      author: sender.login,
      from_branch: pull_request.head.ref,
      to_branch: pull_request.base.ref,
      timestamp: new Date(),
    };
  }

  const newEvent = new Event(event);
  await newEvent.save();
  res.status(200).send('Webhook received');
});

app.listen(8080, () => {
  console.log('Webhook receiver running on port 8080');
});
