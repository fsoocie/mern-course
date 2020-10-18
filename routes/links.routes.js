const Router = require('express')
const Link = require('../models/Link')
const shortid = require('shortid')
const config = require('config')
const auth = require('../middlewares/auth.middleware')

const router = Router()

router.post('/generate', auth, async (req, res) => {
  try {
    const baseUrl = config.get('baseUrl')
    const {from} = req.body

    const code = shortid.generate()
    const existing = await Link.findOne({from})
    if (existing) {
      res.status(200).json({link: existing})
    }
    const to = baseUrl + '/t/' + code
    const link = new Link({from, to, code, owner: req.user.userId})
    await link.save()
    res.status(201).json(link)
  } catch (e) {
    res.status(500).json({message: 'Произошла ошибка. Повторите попытку'})
  }
})

router.get('/', auth, async (req, res) => {
  try {
    console.log(req.user)
    const links = await Link.find({owner: req.user.userId})
    res.status(200).json(links)
  } catch (e) {
    res.status(500).json({message: 'Произошла ошибка. Повторите попытку'})
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id)
    res.status(200).json(link)
  } catch (e) {
    res.status(500).json({message: 'Произошла ошибка. Повторите попытку'})
  }
})

module.exports = router
