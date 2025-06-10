/** Icons are imported separatly to reduce build time */
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon'
import WalletIcon from '@heroicons/react/24/outline/WalletIcon'
import GiftIcon from '@heroicons/react/24/outline/GiftIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon'
import UsersIcon from '@heroicons/react/24/outline/UsersIcon'
import CubeIcon from '@heroicons/react/24/outline/CubeIcon'
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
const iconClasses = `h-6 w-6`
const submenuIconClasses = `h-5 w-5`

const routes = [

  {
    path: '/app/dashboard',
    icon: <Squares2X2Icon className={iconClasses} />,
    name: 'Dashboard',
  },
  {
    path: '/app/team', // url
    icon: <UsersIcon className={iconClasses} />, // icon component
    name: 'Team', // name that appear in Sidebar
  },
  {
    path: '/app/transactions', // url
    icon: <CurrencyDollarIcon className={iconClasses} />, // icon component
    name: 'Transactions', // name that appear in Sidebar
  },

  {
    path: '/app/packages', // url
    icon: <CubeIcon  className={iconClasses} />, // icon component
    name: 'Packages', // name that appear in Sidebar
  },
  {
    path: '/app/withdraw', // url
    icon: <WalletIcon className={iconClasses} />, // icon component
    name: 'Withdraw', // name that appear in Sidebar
  },
  {
    path: '/app/rankbonus', // url
    icon: <CreditCardIcon className={iconClasses} />, // icon component
    name: 'Smart Card', // name that appear in Sidebar
  },
  {
    path: '/app/aibot', // url
    icon: <ChatBubbleLeftRightIcon className={iconClasses} />, // icon component
    name: 'Ai Bot', // name that appear in Sidebar
  }
  

]

export default routes


