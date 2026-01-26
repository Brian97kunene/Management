import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'


import Users from './Users.jsx'
import EditableUsers from './Products_Editable.jsx'



createRoot(document.getElementById('root')).render(
  <StrictMode>           
        <Users />
        <EditableUsers />
  </StrictMode>,
)




//    < ul >
//{
//    users.map(u => (
//        <li key={u.id}>
//            {u.name} ({u.email})
//            {/*<button onClick={() => updateUser(u.id)}>Update</button>*/}
//            {/*<button onClick={() => deleteUser(u.id)}>Delete</button>*/}
//        </li>
//    ))
//}
//            </ul >