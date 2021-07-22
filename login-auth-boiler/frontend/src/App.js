import { BrowserRouter as Router, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { Container } from 'react-bootstrap'
import Home from './screens/Home'
import Login from './screens/Login'
import Register from './screens/Register'
import Profile from './screens/Profile'
import UserList from './screens/UserList'
import UserEdit from './screens/UserEdit'

const App = () => {
  return (
    <Router>
      <Header />
      <main className='py-3'>
        <Container>
          <Route path='/' component={Home} exact />
          <Route path='/register' component={Register} />
          <Route path='/login' component={Login} />
          <Route path='/profile' component={Profile} />
          <Route path='/admin/userlist' component={UserList} />
          <Route path='/admin/user/:id/edit' component={UserEdit} />
        </Container>
      </main>
      <Footer />
    </Router>
  )
}

export default App
