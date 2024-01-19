const express = require('express')
const router = express.Router()
const Subscriber = require('../models/subscriber')

//DATE SELECTOR ROUTE

const Data = require('../models/subscriber');

router.get('/data/:start/:end', async (req, res) => {
  try {
    const start = new Date(req.params.start);
    const end = new Date(req.params.end);
    const data = await Data.find({
      'msg.timestamp': { $gte: start, $lte: end }
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Getting all
router.get('/', async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
    res.json(subscribers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Getting One
router.get('/data/:start/:end', getSubscriber, (req, res) => {
 // res.json(res.subscriber)
 // res.send(res.subscriber.name)
  res.send(res.subscriber.timestamp)
})

// Creating one
router.post('/', async (req, res) => {
  const subscriber = new Subscriber({
    temperature: req.body.temperature,
    humidity: req.body.humidity,
    deviceId:req.body.deviceId,
    msg:req.body.msg
  })
  try {
    const newSubscriber = await subscriber.save()
    res.status(201).json(newSubscriber)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Updating One
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

// Deleting One
router.delete('/:id', getSubscriber, async (req, res) => {
  try {
    await res.subscriber.remove()
    res.json({ message: 'Deleted Subscriber' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// get Data
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

