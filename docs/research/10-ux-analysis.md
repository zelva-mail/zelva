# 10 · UX analysis (snapshot taken before the decisions)

| | |
|---|---|
| Status | Analysis snapshot taken 2026-11-23, before the founder made the decisions. The flows, wireframes and voice samples feed PRD-11 |
| Basis | The brief and the research digest of that day |
| Precedence | Where this analysis conflicts with `docs/decisions/0001-pre-prd-product-decisions.md`, the decision log wins |

Its open questions 1 to 13 are all answered. Each one is mapped to a decision in `docs/gap-analysis.md`. The icon recommendation (concept A) and the typeface recommendation (Inter) were both adopted.

---


ASSUMPTION tags mark everything the brief does not state.

**User and success.** ASSUMPTION: the primary user is a privacy-conscious professional with one to three accounts (Fastmail and/or self-hosted Stalwart) who triages on desktop a few times a day and checks on a phone between meetings. Success means reaching "All caught up" daily, never finding mail moved or hidden without their say, and understanding every warning shown.

## 1. UX principles

1. **Nothing moves without you.** A suggestion is a proposal with a visible reason, one deliberate key to accept, and undo. Suggestion is never state.
2. **Safe by default, loud only when it matters.** Warnings stay rare and specific so they keep their authority.
3. **Zero is reached, not imposed.** The loop (next, decide, next) is the product; everything else gets out of its way.
4. **Plain words where it matters.** Capability gaps, sync state and device-only behavior are said in human language at the moment of use.
5. **AI is an invited, labeled, evictable guest.** The app is complete without it; anything it writes is marked and editable.
6. **Playful in the gaps, quiet over mail.** Voice and motion carry the personality; chrome never competes with other people's content.
7. **Fast for hands, clear for eyes.** Keyboard-first with visible hints, touch parity, and three routes to every action: shortcut, visible control, gesture.
8. **Degrade visibly.** Offline, slow phones and the web build say what they can't do and show what they queue.

## 2. IA and navigation

Top-level: **Mail** (Inbox, To follow up, Snoozed, Outbox and scheduled, Drafts, Sent, VIP, Archive, Spam, Trash, labels, saved views), **Calendar**, **Contacts**.

| Lives in | Desktop | Mobile |
|---|---|---|
| Navigation | 56 px icon rail + folder list | Tabs: Mail, Calendar, Contacts; compose button |
| Accounts | Avatar row atop folders; "All inboxes" by default at two or more (ASSUMPTION) | Header account menu |
| Search | Toolbar field; `/`; filter chips (From, Attachment, After, Label) | Header icon |
| Rules | Settings > Rules; message menu "Rule like this" | Settings > Mail > Rules |
| AI controls | Settings > AI; the label chip on any summary | Settings > AI |
| Settings | Rail; groups: Accounts, Mail, Notifications, Rules, Calendar, Privacy, AI, Appearance, Keyboard | Avatar menu; same groups |

Shapes: three panes from 1100 px; two panes 720–1099 (reading pane replaces list, back restores scroll); one pane below 720. Web uses the same IA, plus a visible "Updated 2 min ago" line where live updates are unavailable (ASSUMPTION, pending research) and scheduling copy that says the browser tab must stay open.

## 3. Key journeys

### (a) Onboarding
1. **Welcome**: "Bring your mail. Nothing else." [Add an account]
2. **Email**: one field; provider name appears while typing.
3. **Discovery** decision:
   - JMAP found → step 4.
   - Provider known, no JMAP → "Outlook isn't supported yet. IMAP is coming." [Notify me]
   - Not found → "We couldn't find your server automatically." [Enter server address] [How to find this] → rediscover → still nothing: "Check the address, or your server may not offer JMAP yet."
4. **Sign-in** (W4): OAuth opens the system browser and returns by deep link ("You sign in on their page. Zelva never sees your password"), or a token field with a provider help card; Stalwart also offers a device code. Errors: "That token didn't work. Fastmail needs an API token, not your password." / "Fastmail API access isn't available on the Basic plan." / "Sign-in was canceled."
5. **Connecting**: streamed progress; inbox usable after the first page. Only if needed: "Fastmail keeps your calendar in a separate service. Connect it with the same sign-in?" [Yes] [Not now]
6. **Guided setup**: four cards, defaults preselected, "Keep defaults" always one click: Notifications (Priority only / Everything / Nothing), Privacy (block images on, receipts ask), AI (Set up / Not now), Help improve Zelva (off; ASSUMPTION this is where the analytics opt-in is asked).
7. **Inbox** with three coach marks: `E` archive, `/` search, `?` shortcuts.

### (b) Triage loop
1. Focus starts in the list; `j`/`k` moves; the message opens in the reading pane.
2. A **suggestion strip** sits under the message: a reason plus up to three proposed actions (W1). Never pre-applied, never focused, never shown on Danger mail.
3. Decide by key, button or swipe. Your own archive or delete is immediate with a five-second Undo; a suggestion applies only on `t` or tap. Auto-advance after acting (on by default, ASSUMPTION).
4. `s` opens Snooze; its footer says where it returns: "Back Tue 8:00, on this Mac."
5. "12 more from this sender" opens a confirm sheet listing exactly what will happen.
6. **Bundles are a lens, not a folder**: opt-in groups (Newsletters, Receipts, Travel, custom) collapse matching rows in place with their own badge and notification setting. Nothing is filed until a rule is created.
7. View empty → **All caught up** (W2), honest about what is outside.

| Key | Action | Key | Action |
|---|---|---|---|
| `j`/`k` | next / previous | `s` | snooze |
| `e` | archive | `l` | label or move |
| `#` | delete | `f` | follow-up reminder |
| `!` | report spam or phishing | `v` | VIP sender |
| `r` | reply | `u` | unread |
| `t` | take suggestion | `Esc` | dismiss suggestion |
| `Ctrl/Cmd+Z` | undo, outside text fields | `/`, `Ctrl/Cmd+K`, `?` | search, command palette, shortcuts |

### (c) Safety
1. Opening a message runs the no-model checks (authentication results, lookalike domain, reply-to mismatch, first contact); the 70 MB classifier only raises confidence. Same UI either way.
2. **Danger** (ASSUMPTION: two or more independent signals): sticky banner above the header, announced on open (W3). "This isn't from acme.com. The sender is acme-corp.net. Don't reply or click links." [Report phishing] [I trust this sender]. Reply still works but confirms: "Replies go to billing@z-accounts.ru. Send anyway?"
3. **Caution**: "acme.com didn't sign this message. Common for newsletters, unusual for banks." **Info**: "Replies go elsewhere: billing@…" **First contact**: "First message from Dana Lee."
4. **Remote images**: "Images hidden, 2 trackers found. [Show images] [Always from acme.com]". One tap is this message only; per-sender is the secondary action and is listed in Settings > Privacy.
5. **Read receipt**: a non-modal card under the header, nothing preselected: "Ana asks to know when you open this. [Send receipt] [Not now]", optional "Remember for this sender".

### (d) AI opt-in
1. Entry points: setup card, Settings > AI, a quiet chip where a summary would sit.
2. **Consent** (W5): two independent choices, Safety boost (70 MB, free) and AI assistant (2.78 GB desktop, 1.28 GB phones, 0.53 GB web; Pro). Says what it does, what it never does, free space, time, Wi-Fi only (default on phones), where to delete.
3. **Download**: background, pausable, mail stays usable. Errors: "You need 2.8 GB more space." / "Download paused. Resume."
4. **Toggles**: Summaries on, Filtering hints on, Draft replies off (ASSUMPTION), Platform model fallback off and labeled on each use ("Made with Apple Intelligence").
5. **Summary**: card atop the message, chip "AI summary, may be wrong", expandable source lines that highlight the sentence in the body. Single message first, cached, never blocks reading. Phones prepare summaries in the background while charging on Wi-Fi (ASSUMPTION); "Summarize now" on tap.
6. **Draft** (W6): "Draft a reply" with tone. Text arrives tinted under an "AI draft" band. The send button reads **Review** until the user edits or taps "Looks good" on the review step, which shows draft and original together.
7. **Delete**: "Delete AI model, frees 2.78 GB" → "Summaries and drafts disappear from this device. Your mail is untouched." [Delete]
8. **Unavailable**: below-spec device: "AI summaries aren't available on this device yet." No upsell. Web: summaries only; drafts and digests hidden with "Available in the desktop and mobile apps". Safety stays free on every tier.

### (e) Rules
1. Entry: message menu "Rule like this" (prefilled with sender) or Settings > Rules.
2. **Builder** (W7): a sentence. When [condition], Do [action]. Conditions: From, To, Subject, Has attachment, Sender is a contact, Sender is VIP. Actions: Move, Label, Mark read, Pin, Notify always, Never notify, Forward (server rules only).
3. **Where it runs is a visible choice**: server (always on, every device) or "On this Mac while Zelva is open". On Fastmail the server option shows disabled with "Fastmail doesn't offer this."
4. **Preview before saving**: "Would have matched 14 of your last 500 messages." [Preview]
5. Trace on every moved message: "Moved by your rule Newsletters". Rules pause, edit and reorder.
6. Pro: "Suggest a rule" opens the same builder prefilled, with the preview; saving is the confirmation.

### (f) Calendar and contacts
1. An invitation renders as an **RSVP card** at the top of the message (W8): time in your zone plus the organizer's if different, location, conflicts, [Accept] [Maybe] [Decline], Propose new time.
2. After RSVP: "Replied to Dana. Added to your calendar." [Undo] sends an updated reply (ASSUMPTION). "Also email Dana" is on by default.
3. Updates in place: "Time changed to 16:00." [Keep my reply] [Change]; "Dana canceled this event."
4. Calendar: Week on desktop, 3-day on tablets, Day with month overview on phones (ASSUMPTION). Drag to create, with click-to-create as the alternative. One Sky tint per calendar.
5. Tapping a sender name opens a **contact popover**: addresses, "12 recent messages", [Write] [Add to contacts] [VIP] [Copy address] [Block]. Contacts tab has search, source badge (JMAP or CardDAV write-back) and merge suggestions.

### (g) Multi-account and device-local features
1. "All inboxes" merges by time with an account dot per row. In an account view, what that server lacks is hidden; in the unified view an unsupported action is disabled with "Not available on Fastmail".
2. Replies send from the account that received the message; From is shown in mono and changes only by choice.
3. Snoozed, scheduled, to follow up and VIP sit under **Scheduled**, across accounts. Every scheduling surface states its condition: "Sends from this Mac when online."
4. VIP: toggle in the contact popover; always notifies within quiet hours; counted in the badge.
5. Follow-up: compose footer "Nudge me if no reply, 3 days", or `f` on any message.

## 4. Wireframes

**W1 Desktop triage** (list, receipt card, blocked images, suggestion strip)
```
+---+------------------------+---------------------------------+
| Z | (o)(o) All inboxes     | Liam Chen <liam@northwind.io>   |
| M | [ Search mail...  /  ] | to me                     yday  |
| C |------------------------|---------------------------------|
| P | Inbox 3   Follow up 2  | Ana asks to know when you      |
| S | Snoozed 6  Outbox 1    | open this. [Send receipt]      |
|   |------------------------| [Not now]                       |
|   |>*Dana Lee   Invoice    |---------------------------------|
|   | > Acme Digest  Thu...  | Images hidden, 2 trackers [Show]|
|   |   Liam Chen  Re: Q4    | Hi Priya, invoice #2211 is now  |
|   |------------------------| 14 days overdue. Can you...     |
|   | Bundles (a view)       |---------------------------------|
|   |   Newsletters 14       | SUGGESTION  Reply needed by Thu |
|   |   Receipts 3           | [Reply][Snooze to Thu][Label]   |
|   |------------------------| Why?        t = take   Esc = no |
|   | Scheduled              |---------------------------------|
|   |                        | [Reply][Forward][Archive][Delete]|
+---+------------------------+---------------------------------+
```

**W2 All caught up** (one 600 ms plane glide, static under reduced motion)
```
+----------------------------------------+
|            All caught up               |
|  You cleared 23: 12 archived, 4        |
|  snoozed, 3 replied, 4 labeled        |
|  Still around: 14 in Bundles,          |
|  6 snoozed, 3 in Spam                  |
|  [Review bundles] [Snoozed]            |
+----------------------------------------+
```

**W3 Mobile list and reading**
```
+--------------------------+  +---------------------------+
| All inboxes         (A)  |  | < Inbox               ... |
| [ Search ]      Filter v |  | Dana Lee <dana@acme-c...>|
|--------------------------|  | ! This isn't from acme.com|
|>*Dana Lee        9:14    |  | ! Sender: acme-corp.net   |
|  Invoice #2211 overdue   |  | ! Don't reply or click.   |
|>* Acme Digest    8:02    |  | ! [Report]   [I trust it] |
|  Your Thursday digest    |  |---------------------------|
|  Liam Chen       yday    |  | Images hidden    [Show]   |
|  Re: Q4 plan             |  | Hi Priya, the invoice...  |
|--------------------------|  |---------------------------|
|  Mail   Calendar  Contacts| | [Delete][Snooze][Move][R]|
+--------------------------+  +---------------------------+
 swipe left: Archive (long: Delete)  swipe right: Snooze (long: Unread)
```

**W4 Sign-in**
```
+------------------------------------------+
|  you@fastmail.com              [Change]  |
|  Fastmail found. Two ways in:            |
|  [       Continue with Fastmail       ]  |
|  You sign in on Fastmail's page.        |
|  Zelva never sees your password.        |
|  ---- or use an API token ----           |
|  [##################]  [Paste]          |
|  Fastmail > Settings > Privacy & Security|
|  > Integrations. Needs a Standard plan.  |
|  [Open instructions]         [Sign in]   |
+------------------------------------------+
```

**W5 AI consent**
```
+-- On-device AI --------------------------+
| Runs on this Mac. Your mail never leaves |
| to make it work.                         |
| [x] Safety boost  70 MB    Free          |
|     Better at spotting lookalikes        |
| [ ] AI assistant  2.78 GB  Pro           |
|     Summaries, draft replies, hints      |
| [x] Wi-Fi only    8.4 GB free, ~6 min    |
| [Not now]                 [Download]     |
| Delete any time in Settings > AI.        |
+------------------------------------------+
```

**W6 AI draft with review gate**
```
+-- Reply to Dana -------------------------+
| From  you@acme.com                       |
| ........................................ |
| : AI DRAFT, may be wrong     [Redo] [x]  :
| : Hi Dana, thanks for the reminder.     :
| : Payment for #2211 goes out Friday.    :
| ........................................ |
| Tone: Short v                            |
| [Discard draft]            [Review >]    |
+------------------------------------------+
```

**W7 Rule builder**
```
+-- New rule ------------------------------+
| When  [from v] [acme.com              ]  |
|       + condition                        |
| Do    [Move to v] [Newsletters v]        |
|       + action                           |
| Runs   ( ) On Fastmail's server          |
|             Fastmail doesn't offer this. |
|        (*) On this Mac while Zelva is    |
|            open                          |
| Would have matched 14 of your last 500.  |
| [Preview]                                |
| [Cancel]                [Turn on rule]   |
+------------------------------------------+
```

**W8 Invitation card**
```
+-- Invitation ----------------------------+
| Q4 Budget Review                         |
| Tue 3 Nov, 15:00-16:00 CET (14:00 yours) |
| Zoom                                     |
| ! Overlaps Team standup, 15:00-15:30     |
| [Accept] [Maybe] [Decline]  Propose time |
| [x] Also email Dana                      |
+------------------------------------------+
```

## 5. Cross-platform, notifications, states, voice

**Adaptation rules**
- One layout, three shapes (thresholds in section 2). Density: comfortable on touch, compact with a pointer.
- Desktop shell: tray or menu bar icon carrying the priority badge and quick compose; macOS title bar with traffic lights inset; Windows jump list; Linux header bar conventions (all ASSUMPTION that Tauri supports them).
- Mobile: back from a message returns to the same scroll position; share-sheet target "Open in Zelva"; haptic tick at swipe threshold; shortcut hints only with a hardware keyboard.
- Web: install hint after the second visit, never a modal (ASSUMPTION); no tray; sends queue in the tab; polls where live updates fail.
- Everywhere: message HTML renders in a sandboxed iframe; lists virtualised; targets 44 px on touch, 32 px with a pointer.

**Notifications**
- Default "Priority only" (ASSUMPTION: direct mail from people, excluding automated senders, plus VIP and calendar alerts). Badge and tray count show priority unread. Danger mail never notifies.
- Per account and per bundle: Always / Badge only / Never; a bundle can notify as one daily digest. VIP always notifies.
- Quiet hours follow the system Focus mode by default, with app-level hours in Settings.
- Nothing hides silently: a muted category appears in the caught-up screen and as "Notifications off" on its row.
- Lock screen shows sender and subject, sender only, or "New mail".
- Mobile push relay, asked once when notifications are first enabled: "Timely alerts on this phone need a signal routed through Zelva's relay. It carries a random device ID and the account ID, never sender, subject or content." [Enable] [Not now]. Declining means mail syncs when the app opens.

**Empty states**

| Where | Copy | Action |
|---|---|---|
| First-run inbox | "Your inbox is empty. New mail will land here." | Add another account |
| Search | "No mail from 'zora' in All mail." | Search in Spam and Trash; Clear filters |
| Rules | "No rules yet. Rules sort mail before you see it, and you stay in charge." | Create rule |
| Calendar | "A free day." | Add event |
| Contacts | "No contacts yet. Add people as you write to them." | none |
| Bundles | "No newsletters spotted yet." | none |

**Offline and error states**
- Offline banner: "You're offline. You can read and sort. 3 actions will go out when you're back." Queued items show a clock icon; Outbox lists them.
- Expired sign-in: a card atop the list, never a blocking dialog: "Fastmail sign-in expired. What you see is from this morning." [Sign in again]. Sending is disabled with that reason.
- Missing capability: control disabled with "Not available on Fastmail"; the full list under Settings > Accounts > What this server supports, in plain words.
- Failed send: to Outbox as "Not sent. Fastmail rejected it." [Try again] [Edit]
- Sync stalled: "Can't reach Stalwart. Retrying in 30 s." [Retry now]
- Web without live updates: "Live updates aren't available here. Refreshing every minute."

**Voice samples**

| Context | String |
|---|---|
| Inbox empty | "All caught up. Nothing needs you in Inbox." |
| Discovery failed | "We couldn't find your server automatically. If you know its address, we'll take it from here." |
| Token rejected | "That didn't work. Fastmail needs an API token, not your password. Here's where to find one." |
| Suggestion | "Looks like a newsletter. Want to file it?" |
| Lookalike | "This isn't from acme.com. The sender is acme-corp.net. Don't reply or click anything." |
| Images | "Images are hidden so trackers can't see you opened this." |
| Receipt | "Ana will know you opened this only if you say so." |
| AI consent | "Want AI that never leaves this device? 2.78 GB, off by default, deletable any time." |
| AI draft | "Drafted by on-device AI. Give it a read. It sends when you're happy." |
| Device-only | "Scheduled for Tue 8:00. Sends from this Mac when it's online." |

## 6. Accessibility, localisation, tokens

**Accessibility (WCAG 2.2 AA, keyboard-first)**
- 4.5:1 text and 3:1 controls and focus; a 2 px focus ring that is always visible; sticky bars never cover a focused element; no drag-only actions; tokens pasteable and password managers supported; the email address is entered once.
- Never color alone: unread is bold plus a dot; warnings carry icon, label and text; suggestions are outlined and titled "Suggestion".
- Screen reader: list as listbox with selection; reading pane a labeled region; status and toasts in a polite live region; Danger banner announced on open; the sanitised text is the accessible source for the iframe body.
- Reduced motion replaces the caught-up animation with the static state.
- Handoff to accessibility-specialist: verify the token contrasts below, iframe reading order, focus return after modals.

**Localisation**
- ICU messages, no concatenation, pseudo-localisation at +40 % length, CJK line-breaking, locale calendars and first weekday, named time zones.
- RTL: logical CSS properties, mirrored directional icons, swipes and calendar grid.
- JetBrains Mono needs a fallback stack for non-Latin addresses. ASSUMPTION: Inter has wider script coverage than Plus Jakarta Sans, which argues for Inter as the UI face.

**Tokens** (contrasts approximate, computed from the brand hex values; to be verified)

| Role | Daylight Canvas | Midnight Slate | Note |
|---|---|---|---|
| Canvas / raised | Mist #F8FAFC / #FFFFFF | #0F172A / #1E293B | raised = reading pane, cards |
| Sidebar | Slate #0F172A | #0B1120 | |
| Ink / secondary | #0F172A / #475569 | #F1F5F9 / #94A3B8 | |
| Primary fill / text on it | Emerald #10B981 / Slate | same | 7.1:1 |
| Emerald text | #047857 | #34D399 | brand emerald is 2.5:1 on white |
| Coral fill / text | #FF6B4A / #B4411F | #FF6B4A / #FCAE97 | illustration, Pro, pinned; brand coral is 2.8:1 on white |
| Sky fill / text | #38BDF8 / #0369A1 | #38BDF8 / #7DD3FC | calendar, tags, hover, AI label; brand sky is 2.1:1 on white |
| Danger (new) | #B91C1C on #FEF2F2 | #F87171 on #2A1416 | phishing |
| Warning (new) | #B45309 on #FFFBEB | #FBBF24 on #2A1F0B | unsigned, reply elsewhere |

Type: Inter 14/20 for UI (16/24 on phones), 13/18 list metadata, 20/28 and 16/24 titles; JetBrains Mono 13/20 for addresses, headers and rule conditions. Scale 12/13/14/16/20/24/32, spacing base 4, radius 10 for cards and 8 for controls, motion 150–200 ms plus one 600 ms moment for caught up.

## 7. Icon and brand

**Recommendation: A, Folded Z-Plane, simplified to one fold.**
- 16 px: A collapses to a bold Z with a single diagonal, legible as a tray and menu bar glyph. B's crease vanishes at 16 px and leaves a generic envelope, the most crowded shape in the category. C's shield is the security-tool cliché the brand rejects, and it promises "security product" over "zero mail".
- Category signal: A doesn't say "email" on its own; the tile (emerald plane on slate) and the wordmark carry that until recognition builds. ASSUMPTION: no widely used mail client owns a Z mark; check Zoho Mail side by side.
- Risks: folds reading as a lightning bolt (acceptable, speed) or a paper plane (Telegram association); the single fold limits both.
- Brand moment: the plane glides in once for "All caught up".
- Use the tortoise as the illustration character in onboarding and empty states, never as the app icon: unhurried, carries its own house, which is the assist-only and on-device promise in one image.

**Brand adjustments from the research**
1. Separate semantic danger and warning colors; coral stays brand, Pro and pinned.
2. Ink variants of Emerald, Coral and Sky for text on light surfaces.
3. Keep "AI" literal in labels (EU AI Act Article 50); no "smart" euphemisms.
4. Inter over Plus Jakarta Sans for the UI face.
5. "All caught up", never "inbox zero" as an achievement to chase.

## 8. Risks, test plan, open questions

**Top usability risks**

| Risk | Why it hurts | Mitigation |
|---|---|---|
| Automation bias on suggestions | `t` accepted without reading breaks the consent promise | Reason always visible, accept never focused, undo, measure accept vs. correct |
| Onboarding token friction | Drop-off before the first mail | Provider help card, paste button, specific errors |
| Device-local snooze and send later | Mail doesn't return or send as expected | State the condition at scheduling and in Scheduled |
| Bundles mistaken for filing | Users think mail was moved | "A view" label, trace text, nothing filed without a rule |
| Warning fatigue or false Danger | Banner ignored when it matters | Two-signal threshold, "I trust this sender" |
| AI on mid-range phones | A minute-long wait reads as broken | Background preparation, single-message first |
| Capability differences | "Why can't I…" moments on Fastmail | Disabled with reason, plain-word server list |

**Usability test plan (outline)**
- Participants: desktop round of 8 (3 Fastmail users, 3 Stalwart self-hosters, 2 privacy-minded non-technical); phone round of 5 including one mid-range Android. ASSUMPTION: 5–8 per round surfaces the major issues.
- Seeded inbox: 20 messages including 1 lookalike phishing, 2 newsletters with trackers, 1 receipt request, 1 invite with a conflict, 1 long thread.
- Method: moderated think-aloud; a scripted pass on the web build via Browser Use. After each task ask "What happened to that message?"

| Task | Observe | Pass |
|---|---|---|
| Onboard with a test Fastmail account | Where they look for the token; error recovery | 80% unaided, under 4 min |
| Clear the seeded inbox | Suggestion read vs. accepted; undo; `?` | 90% describe each message's fate |
| Handle phishing mail and trackers | Show images? Receipt sent? | 0 unintended receipts |
| Create "file sender X to News" | Notices where it runs; uses preview | 80% answer "where does this run" |
| Decline AI, then enable, summarize, draft, delete | Understands size, label, review gate | 100% see label; 0 sends without review |
| RSVP with a conflict; add sender to contacts | | 90% complete |
| Add second account, snooze on phone, go offline mid-triage | Right From? Understands pending? | 90% explain what happens next |

**Open questions for the founder, by impact**
1. What counts as Priority for badges and notifications by default? It defines "caught up" and the whole notification model.
2. Are bundles a view only in v1, or is one-tap "always file this" (creating a rule) included, and is bundling Pro?
3. Is the 70 MB safety classifier offered in its own consent step, free on every tier, and on once downloaded?
4. Multi-account default: unified or per-account, and is cross-account search in v1?
5. Do snooze, send later, follow-ups, VIP and device rules stay device-local in v1 or sync between devices, and is server-side snooze planned for Stalwart?
6. Push relay in v1: who operates it, what payload, and what does the privacy page promise?
7. Is Fastmail OAuth available to third-party clients today, or is the token the default path?
8. Platform-model fallback in v1 or later?
9. RSVP on Fastmail via CalDAV: reply by email by default, and is Undo after sending acceptable?
10. Is an analytics opt-in card in first-run acceptable, or should it live only in Settings?
11. Is a demo inbox needed for the alpha listing and reviewers?
12. Sign-off on icon A and Inter.
13. Verify the Fastmail token path shown in W4 (Settings > Privacy & Security > Integrations).