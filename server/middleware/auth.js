import jwt from 'jsonwebtoken'

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const isCustomAuth = token.length < 500 //if grater than 500 it's google token

    let decodedData

    if (token && isCustomAuth) {
      decodedData = jwt.verify(
        token,
        'secret_text_getting_from_secret_env_or_somewhere_else'
      )

      req.userId = decodedData?.id
    } else {
      decodedData = jwt.decode(token)

      req.userId = decodedData?.sub
    }

    next()
  } catch (error) {
    console.log(error)
  }
}

export default auth
