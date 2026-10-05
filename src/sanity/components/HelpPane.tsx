import { Box, Card, Stack, Text } from '@sanity/ui';
import { ToolHeading } from './ToolHeading';
import { useStudioLink, type StudioTarget } from './studioLink';
import { DESK } from '../studioTargets';
import { HEIRLOOM } from '../theme';

// =============================================================================
// HelpPane: "Help (how do I...?)", the short version (Phase A, 2026-10-05)
// =============================================================================
// A placeholder that is still worth opening: the five questions Mary Ann is
// most likely to arrive with, each answered in two or three plain sentences,
// with a "Take me there" link where there is somewhere to go. Phase B of
// docs/superpowers/specs/2026-10-05-studio-direction.md replaces this with the
// full handbook held as repo data (PORTS.md card 41). The older Start Here
// guides stay listed under this pane so nothing she had is lost.
//
// Every answer must be TRUE of the site as it is (spec principle 8): the
// rebuild takes 2 to 3 minutes since the 2026-10-05 deploy hook, Undo is in the
// three-dots menu beside Publish (src/sanity/editorActions.ts), and so on.
// =============================================================================

interface Answer {
  question: string;
  answer: string;
  link?: { label: string; target: StudioTarget };
}

const ANSWERS: Answer[] = [
  {
    question: 'I pressed Publish but my website has not changed',
    answer:
      'That is normal for a couple of minutes. After each Publish the website rebuilds itself, which takes about 2 to 3 minutes. Then refresh the page on your website (press F5, or pull down on a phone).',
  },
  {
    question: 'I changed something by mistake',
    answer:
      'Click the button with three dots beside the Publish button and choose "Undo last change". If you have not pressed Publish yet, your website still shows the old version, so nothing is lost.',
  },
  {
    question: 'How do I add a photo of my work?',
    answer:
      'Open a new photo, drag your picture into the Photo box, type a few words about what it shows, pick what kind of item it is, then press Publish.',
    link: { label: 'Add a photo now', target: { create: 'galleryItem', template: 'new-photo' } },
  },
  {
    question: 'How do I mark a clearance item sold?',
    answer:
      'Open the item, turn on Sold near the top, then press Publish. It stays on the page with a "Sold" badge and the Buy button goes away.',
    link: {
      label: 'Open my clearance items',
      target: { pane: `${DESK.clearance};${DESK.clearanceItems}` },
    },
  },
  {
    question: 'There is a red note on a box',
    answer:
      'A red note means that box needs filling in before you can Publish. Read the note under the box: it says what is missing. A yellow note is only a gentle tip, and you can still Publish.',
  },
];

function AnswerCard({ item }: { item: Answer }) {
  const linkTo = useStudioLink();
  const link = item.link ? linkTo(item.link.target) : null;
  return (
    <Card padding={4} radius={3} border style={{ background: HEIRLOOM.paper }}>
      <Stack space={3}>
        <Text size={3} weight="semibold">
          {item.question}
        </Text>
        <Text size={2} style={{ lineHeight: 1.6 }}>
          {item.answer}
        </Text>
        {link && item.link && (
          <Text size={2} weight="semibold">
            <a href={link.href} onClick={link.onClick} style={{ color: HEIRLOOM.indigo }}>
              {item.link.label} →
            </a>
          </Text>
        )}
      </Stack>
    </Card>
  );
}

export function HelpPane() {
  return (
    <Box padding={[4, 4, 5]}>
      <Stack space={5} style={{ maxWidth: 760, margin: '0 auto' }}>
        <ToolHeading emoji="❔">How do I...?</ToolHeading>
        <Stack space={3}>
          {ANSWERS.map((a) => (
            <AnswerCard key={a.question} item={a} />
          ))}
        </Stack>
        <Card padding={4} radius={3} tone="primary" border>
          <Stack space={3}>
            <Text size={3} weight="semibold">
              Still stuck?
            </Text>
            <Text size={2} style={{ lineHeight: 1.6 }}>
              Ask Nathan. A confusing Studio is something he can fix, not something you have to work
              around. The older guides are listed under this page in the menu on the left.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
