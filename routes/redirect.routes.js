const {Router} = require('express')
const Link = require('../models/Link')
const router = Router()

router.get('/:code', async (req, res) => {
  try {
    const link = await Link.findOne({code: req.params.code})
    if (link) {
      link.clicks++
      await link.save()
      res.redirect(link.from)
    }
    res.status(400).json({message: 'Неверный код ссылки'})
  } catch (e) {
    console.log(e)
    res.status(500).json({message: 'Произошла ошибка. Повторите попытку'})
  }
})

module.exports = router
