import { routes } from '@/config/routes';
import { DUMMY_ID } from '@/config/constants';
import {
  PiShoppingCart,
  PiHeadset,
  PiPackage,
  PiChartBar,
  PiFileImage,
  PiCurrencyDollar,
  PiSquaresFour,
  PiGridFour,
  PiFeather,
  PiChartLineUp,
  PiMapPinLine,
  PiUserGear,
  PiBellSimpleRinging,
  PiUser,
  PiEnvelopeSimpleOpen,
  PiSteps,
  PiCreditCard,
  PiStack,
  PiTable,
  PiBrowser,
  PiBoundingBox,
  PiHourglassSimple,
  PiUserCircle,
  PiShootingStar,
  PiRocketLaunch,
  PiFolderLock,
  PiBinoculars,
  PiHammer,
  PiNoteBlank,
  PiUserPlus,
  PiShieldCheck,
  PiLockKey,
  PiChatCenteredDots,
  PiMagicWand,
} from 'react-icons/pi';
import { menuItemsHaydrogen } from '@/layouts/hydrogen/menu-items';

interface IHeliumItems {
  name: string;
  href?: string | undefined;
  icon?: JSX.Element | undefined;
}
interface IBerylliumItems extends IHeliumItems {
  dropdownItems?: IHeliumItems[] | undefined;
}

// Note: do not add href in the label object, it is rendering as label
export const berylliumSidebarMenuItems : IBerylliumItems[] = menuItemsHaydrogen;
