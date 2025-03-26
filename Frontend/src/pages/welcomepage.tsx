import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const Welcomepage = () => {
  return (
    <div>
      <h1 className='text-6xl'>Welcome to the Welcome Page</h1>
      <Link to="/login" >
      <Button>Login</Button>
      </Link>
        <Link to="/regiter">
        <Button>Register now</Button>
        </Link>
    </div>
  )
}

export default Welcomepage
