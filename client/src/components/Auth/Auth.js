import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Avatar,
  Button,
  Paper,
  Grid,
  Typography,
  Container,
} from '@material-ui/core'
import LockOutlinedIcon from '@material-ui/icons/LockOpenOutlined'
import { GoogleLogin } from '@react-oauth/google'
import { useDispatch } from 'react-redux'
import jwt from 'jwt-decode'

import Input from './Input'
import { signin, signup } from '../../actions/auth'
import useStyles from './styles.js'

const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({ ...initialFormState })
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isSignUp) {
      dispatch(signup(formData, history))
    } else {
      dispatch(signin(formData, history))
    }
  }

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleShowPassword = () =>
    setShowPassword((prevShowPassword) => !prevShowPassword)

  const switchMode = () => {
    setIsSignUp((prevIsSignUp) => !prevIsSignUp)
    setShowPassword(false)
  }

  const googleSuccess = async (res) => {
    console.log('login success')
    const result = jwt(res.credential)
    const token = result.jti

    try {
      dispatch({ type: 'AUTH', data: { result, token } })

      history.push('/')
    } catch (error) {
      console.log(error)
    }
  }
  const googleFailure = async (error) => {
    console.log(error)
    console.log('Google Sign In was unsuccessful. Try again later.')
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper className={classes.paper} elevation={3}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography variant="h5">{ isSignUp ? 'Sign Up' : 'Sign In'}</Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {isSignUp && (
              <>
                <Input
                  name="firstName"
                  label="First Name"
                  handleChange={handleChange}
                  autoFocus
                  half
                />
                <Input
                  name="lastName"
                  label="Last Name"
                  handleChange={handleChange}
                  half
                />
              </>
            )}
            <Input
              name="email"
              label="Email Address"
              handleChange={handleChange}
              type="email"
            />
            <Input
              name="password"
              label="Password"
              handleChange={handleChange}
              type={showPassword ? 'text' : 'password'}
              handleShowPassword={handleShowPassword}
            />
            {isSignUp && (
              <Input
                name="confirmPassword"
                label="Repeat Password"
                handleChange={handleChange}
                type="password"
                handleShowPassword={handleShowPassword}
              />
            )}
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <GoogleLogin onSuccess={googleSuccess} onError={googleFailure} />
            </Grid>
            <Grid item>
              <Button onClick={switchMode}>
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  )
}

export default Auth
