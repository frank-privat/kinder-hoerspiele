import { createBrowserRouter } from 'react-router'
import { Root } from './components/Root'
import { LoginScreen } from './screens/LoginScreen'
import { PlayerScreen } from './screens/PlayerScreen'
import { AdminScreen } from './screens/AdminScreen'
import { NotFoundScreen } from './screens/NotFoundScreen'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: Root,
      children: [
        { index: true, Component: LoginScreen },
        { path: 'player', Component: PlayerScreen },
        { path: 'admin', Component: AdminScreen },
        { path: '*', Component: NotFoundScreen },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL || '/' }
)
