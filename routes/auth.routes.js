const {Router} = require('express')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const config = require('config')
const router = Router()

router.post('/register',
  [
    check('email', 'Некорректный E-mail').isEmail(),
    check('password', 'Минимальная длина пароля 6 символов').isLength({min: 6})
  ],
  async (req, res) =>  {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Некорректные данные при регистрации'
      })
    }
    const {email, password} = req.body
    const candidate = await User.findOne({email})
    if (candidate) {
      return res.status(400).json({message: 'Такой пользователь уже существует!'})
    }
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({email, password: hashedPassword})
    await user.save()
    res.status(201).json({message: 'Пользователь создан'})
  } catch (e) {
    res.status(500).json({message: 'Произошла ошибка. Повторите попытку'})
  }
})

router.post('/login',
  [
    check('email', 'Некорректный E-mail').normalizeEmail().isEmail(),
    check('password', 'Неверный пароль').exists()
  ],
  async (req, res) =>  {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Некорректные данные при регистрации'
      })
    }
    const {email, password} = req.body
    const user = await User.findOne({email})
    if (!user) {
      res.status(404).json({message: 'E-mail не существует'})
    }
    const isMatched = bcrypt.compare(password, user.password)
    if (!isMatched) {
      res.status(400).json({message: 'Неверный пароль'})
    }
    const token = jwt.sign({userId: user.id}, config.get('jwtSecretKey'), {expiresIn: '1h'})
    res.status(200).json({token, userId: user.id})
  } catch (e) {
    console.log(e)
    res.status(500).json({message: 'Произошла ошибка. Повторите попытку'})
  }
})

module.exports = router
