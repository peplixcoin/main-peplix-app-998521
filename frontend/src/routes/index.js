// All components mapping with path for internal routes

import { lazy } from 'react'
const Dashboard = lazy(() => import('../pages/protected/Dashboard'))

const Page404 = lazy(() => import('../pages/protected/404'))
const Blank = lazy(() => import('../pages/protected/Blank'))
const Charts = lazy(() => import('../pages/protected/Charts'))
const Team = lazy(() => import('../pages/protected/Leads'))
const Packages = lazy(() => import('../pages/protected/Integration'))
const Withdraw = lazy(() => import('../pages/protected/Calendar'))
const Transactions = lazy(() => import('../pages/protected/Transactions'))
const Bills = lazy(() => import('../pages/protected/Bills'))
const ProfileDetails = lazy(() => import('../pages/protected/ProfileDetails'))
const GettingStarted = lazy(() => import('../pages/GettingStarted'))
const DocFeatures = lazy(() => import('../pages/DocFeatures'))
const DocComponents = lazy(() => import('../pages/DocComponents'))
const RankBonus = lazy(() => import('../pages/protected/TokenDrop'))
const PackageDetails = lazy(() => import('../pages/protected/PackageDetails'))
const Aibot = lazy(() => import('../pages/protected/Aibot'))


const routes = [
  {
    path: '/dashboard', // the url
    component: Dashboard, // view rendered
  },
  {
    path: '/team',
    component: Team,
  },
  {
    path: '/withdraw',
    component: Withdraw,
  },
  {
    path: '/rankbonus',
    component: RankBonus,
  },
  {
    path: '/transactions',
    component: Transactions,
  },
  {
    path: '/profile-details',
    component: ProfileDetails,
  },
  {
    path: '/packages',
    component: Packages,
  },
  {
    path: '/packages/buy-package/:packageId',
    component: PackageDetails,
  },
  {
    path: '/404',
    component: Page404,
  },
  {
    path: '/blank',
    component: Blank,
  },
  {
    path: '/aibot',
    component: Aibot,
  },
]

export default routes
