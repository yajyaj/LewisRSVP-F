import AdminApp from './AdminApp'
import InvitationExperience from './InvitationExperience'

export default function App() {
  return window.location.pathname.startsWith('/admin')
    ? <AdminApp />
    : <InvitationExperience />
}
