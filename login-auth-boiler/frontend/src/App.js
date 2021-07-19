import { BrowserRouter as Router, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { Container } from 'react-bootstrap'
import Login from './screens/Login'

const App = () => {
  return (
    <Router>
      <Header />
      <main className='py-3'>
        <Container>
          <h1>Hello</h1>
          <Route path='/login' component={Login} exact />
        </Container>
      </main>
      <Footer />
    </Router>
  )
}

export default App
