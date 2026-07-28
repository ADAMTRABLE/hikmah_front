import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../../services/authService'
import logo from '../../assets/images/hikimalogo2.png'
import styles from './Auth.module.css'

const Register = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    contact: '',
    location: '',
    date_of_birth: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await authService.register(formData)
      authService.saveTokens(data.access, data.refresh)
      navigate('/')
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: Record<string, unknown> } }
      const apiErrors = anyErr?.response?.data
      if (apiErrors && typeof apiErrors === 'object') {
        const message = Object.entries(apiErrors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : String(msgs)}`)
          .join(' | ')
        setError(message || 'Registration failed. Please check your details and try again.')
      } else {
        setError('Registration failed. Please check your details and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src={logo} alt="Hikmah Online School" className={styles.logoImg} />
          <h2>Create Account</h2>
          <p>Join Hikmah Online School today</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First name"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last name"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="contact">Phone Number</label>
            <input
              id="contact"
              name="contact"
              type="tel"
              value={formData.contact}
              onChange={handleChange}
              placeholder="e.g. +256 700 000000"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="date_of_birth">Date of Birth</label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="location">Location (City, Country)</label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Kampala, Uganda"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>

          <button type="submit" className={styles.btn} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  )
}

export default Register