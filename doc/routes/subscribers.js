const express = require('express')
const router = express.Router()
const Subscriber = require('../models/subscriber')

// Getting all subscribers
router.get('/', async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
    res.json(subscribers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})



//Get data by Chart-data for highchart
router.get('/chart-data', async (req, res) => {
  try {
    const start = new Date(req.query.start);
    const end = new Date(req.query.end);
    const data = await Subscriber.find({
      "msg.timestamp": {
        $gte: start,
        $lt: end
      }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get data by deviceId
router.get('/:deviceId', async (req, res) => {
  try {
    const data = await Subscriber.find({
      deviceId: req.params.deviceId
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Creating a subscriber
router.post('/', async (req, res) => {
  const subscriber = new Subscriber({
    temperature: req.body.temp,
    humidity: req.body.humid,
    deviceId: req.body.deviceId,
    msg: req.body.msg
  })
  try {
    const newSubscriber = await subscriber.save()
    res.status(201).json(newSubscriber)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Updating a subscriber
router.patch('/:id', getSubscriber, async (req, res) => {
  if (req.body.name != null) {
    res.subscriber.name = req.body.name
  }
  if (req.body.subscribedToChannel != null) {
    res.subscriber.subscribedToChannel = req.body.subscribedToChannel
  }
  try {
    const updatedSubscriber = await res.subscriber.save()
    res.json(updatedSubscriber)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Deleting a subscriber
router.delete('/:id', getSubscriber, async (req, res) => {
  try {
    await res.subscriber.remove()
    res.json({ message: 'Deleted Subscriber' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Middleware function to get a subscriber by ID
async function getSubscriber(req, res, next) {
  let subscriber
  try {
    subscriber = await Subscriber.findById(req.params.id)
    if (subscriber == null) {
      return res.status(404).json({ message: 'Cannot find subscriber' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.subscriber = subscriber
  next()
}


module.exports = router
