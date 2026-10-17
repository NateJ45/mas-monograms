// Safe to edit by hand
// The @sanity/icons component for each guide icon name in ./iconNames.ts.
// Split out so the guide content stays plain data that a Node unit test can
// import without React. The Record type makes a missing name a compile error.
// (Pattern from fbcm, src/sanity/guides/icons.ts.)
import type { ComponentType } from 'react';
import { BasketIcon } from '@sanity/icons/Basket';
import { BulbOutlineIcon } from '@sanity/icons/BulbOutline';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { ChartUpwardIcon } from '@sanity/icons/ChartUpward';
import { CircleIcon } from '@sanity/icons/Circle';
import { ClipboardImageIcon } from '@sanity/icons/ClipboardImage';
import { ClockIcon } from '@sanity/icons/Clock';
import { ColorWheelIcon } from '@sanity/icons/ColorWheel';
import { CreditCardIcon } from '@sanity/icons/CreditCard';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { DownloadIcon } from '@sanity/icons/Download';
import { EarthAmericasIcon } from '@sanity/icons/EarthAmericas';
import { EditIcon } from '@sanity/icons/Edit';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { FolderIcon } from '@sanity/icons/Folder';
import { HeartIcon } from '@sanity/icons/Heart';
import { HelpCircleIcon } from '@sanity/icons/HelpCircle';
import { ImageIcon } from '@sanity/icons/Image';
import { MobileDeviceIcon } from '@sanity/icons/MobileDevice';
import { PinIcon } from '@sanity/icons/Pin';
import { PublishIcon } from '@sanity/icons/Publish';
import { SearchIcon } from '@sanity/icons/Search';
import { SparkleIcon } from '@sanity/icons/Sparkle';
import { StarIcon } from '@sanity/icons/Star';
import { TagIcon } from '@sanity/icons/Tag';
import { TextIcon } from '@sanity/icons/Text';
import { ThLargeIcon } from '@sanity/icons/ThLarge';
import { ThListIcon } from '@sanity/icons/ThList';
import { TrashIcon } from '@sanity/icons/Trash';
import { UndoIcon } from '@sanity/icons/Undo';
import { UsersIcon } from '@sanity/icons/Users';
import { WarningOutlineIcon } from '@sanity/icons/WarningOutline';
import { BulbFilledIcon } from '@sanity/icons/BulbFilled';
import { FaceHappyIcon } from '@sanity/icons/FaceHappy';
import { CommentIcon } from '@sanity/icons/Comment';
import { MarkerIcon } from '@sanity/icons/Marker';
import type { GuideIconName } from './iconNames.ts';

export const GUIDE_ICONS: Record<GuideIconName, ComponentType> = {
  wave: FaceHappyIcon,
  publish: PublishIcon,
  undo: UndoIcon,
  edit: EditIcon,
  page: DocumentTextIcon,
  phone: MobileDeviceIcon,
  tag: TagIcon,
  question: HelpCircleIcon,
  sparkle: SparkleIcon,
  image: ImageIcon,
  circle: CircleIcon,
  basket: BasketIcon,
  card: CreditCardIcon,
  text: TextIcon,
  color: ColorWheelIcon,
  folder: FolderIcon,
  clock: ClockIcon,
  warning: WarningOutlineIcon,
  search: SearchIcon,
  trash: TrashIcon,
  help: BulbOutlineIcon,
  list: ThListIcon,
  heart: HeartIcon,
  star: StarIcon,
  pin: PinIcon,
  globe: EarthAmericasIcon,
  users: UsersIcon,
  chart: ChartUpwardIcon,
  qr: ThLargeIcon,
  download: DownloadIcon,
  brush: BulbFilledIcon,
  envelope: EnvelopeIcon,
  calendar: CalendarIcon,
  camera: ClipboardImageIcon,
  megaphone: CommentIcon,
  map: MarkerIcon,
};
