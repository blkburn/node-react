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
import SheetNew from './screens/SheetNew'
import ScheduleScreen from './screens/ScheduleScreen'
import ScheduleEdit from './screens/ScheduleEdit'

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
          <Route path='/schedule' component={ScheduleScreen} />
          <Route path='/admin/userlist' component={UserList} />
          <Route path='/admin/sheetnew' component={SheetNew} />
          <Route path='/admin/sheets/:id/edit' component={ScheduleEdit} />
          <Route path='/admin/user/:id/edit' component={UserEdit} />
        </Container>
      </main>
      <Footer />
    </Router>
  )
}

export default App
