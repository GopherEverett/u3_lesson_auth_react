const { User } = require('../models')
const middleware = require('../middleware')

const Login = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
      raw: true
    })
    let isMatched = middleware.comparePassword(
      user.passwordDigest,
      req.body.password
    )
    if (isMatched) {
      let payload = {
        id: user.id,
        email: user.email
      }
      let token = middleware.createToken(payload)
      return res.send({ user: payload, token })
    }
  } catch (error) {
    res.status(401).send({ status: 'Error', msg: 'Unauthorized' })
  }
}

const Register = async (req, res) => {
  const { email, password, name } = req.body
  let passwordDigest = await middleware.hashPassword(password)
  const user = await User.create({ email, passwordDigest, name })
  res.send(user)
}

const UpdatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const user = await User.findByPk(req.params.user_id)
  let isMatched = middleware.comparePassword(
    user.dataValues.passwordDigest,
    oldPassword
  )
  if (isMatched) {
    let passwordDigest = await middleware.hashPassword(newPassword)
    await user.update({ passwordDigest })
    return res.send({ status: 'Ok', payload: user })
  }
  res.status(401).send({ status: 'Error', msg: 'Unauthorized' })
}

const CheckSession = async (req, res) => {
  const { payload } = res.locals
  res.send(payload)
}

module.exports = {
  Login,
  Register,
  UpdatePassword,
  CheckSession
}
