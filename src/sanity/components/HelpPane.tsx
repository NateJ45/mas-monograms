import { useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { Box, Card, Heading, Stack, Text } from '@sanity/ui';
import { GuideView } from './GuideView';
import { ToolHeading } from './ToolHeading';
import { useStudioLink, type StudioTarget } from './studioLink';
import { DESK } from '../studioTargets';
import { HEADING_STACK, HEIRLOOM } from '../theme';

// =============================================================================
// HelpPane: "Help (how do I...?)" (Phase A, extended in Phase B, 2026-10-05)
// =============================================================================
// Top: the five questions Mary Ann is most likely to arrive with, each answered
// in two or three plain sentences, with a "Take me there" link. Then the full
// handbook (GuideView: search, "Guides by topic", the open guide, Print), held
// as repo data in src/sanity/guides (PORTS.md card 41). Bottom: who to ask,
// read from the "Who to ask for help" box in My notes (studioNotes.helpContact),
// or HELP_CONTACT_FALLBACK when it is empty. No contact details are invented.
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

/**
 * Shown when the "Who to ask for help" box in My notes is empty. Deliberately
 * not a name or an address: nobody's contact details are invented here.
 */
export const HELP_CONTACT_FALLBACK = 'the person who built your website';

/** The "Who to ask for help" box from My notes (studioNotes.helpContact). */
function useHelpContact(): string | null {
  const client = useClient({ apiVersion: '2026-05-01' });
  const [contact, setContact] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    client
      .fetch<string | null>('*[_id == "studioNotes"][0].helpContact')
      .then((v) => {
        if (!cancelled) setContact(typeof v === 'string' && v.trim() ? v.trim() : null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [client]);
  return contact;
}

export function HelpPane() {
  const contact = useHelpContact();
  return (
    <Box padding={[4, 4, 5]}>
      <Stack space={6} style={{ maxWidth: 760, margin: '0 auto' }}>
        <ToolHeading emoji="❔">How do I...?</ToolHeading>
        <Stack space={3}>
          <Text size={3} weight="semibold">
            Quick answers
          </Text>
          {ANSWERS.map((a) => (
            <AnswerCard key={a.question} item={a} />
          ))}
        </Stack>

        <Stack space={4}>
          <Heading as="h2" size={3} style={{ fontFamily: HEADING_STACK, color: HEIRLOOM.ink }}>
            Guides by topic
          </Heading>
          <Text size={2} style={{ lineHeight: 1.6 }}>
            Step-by-step guides, with what you will see after each step. Each one says whether you
            can do it yourself. Open a guide, then press Print this guide if you would like it on
            paper.
          </Text>
          <GuideView />
        </Stack>

        <Card padding={4} radius={3} tone="primary" border>
          <Stack space={3}>
            <Text size={3} weight="semibold">
              Still stuck?
            </Text>
            <Text size={2} style={{ lineHeight: 1.6 }}>
              Ask {contact ?? HELP_CONTACT_FALLBACK}. A confusing Studio is something they can fix,
              not something you have to work around. The guide "Before you ask for help" says what
              to tell them.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
