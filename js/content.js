/* =====================================================================
   HIER STEHT ALLES, WAS DU ÄNDERN KANNST
   Einstellungen oben, die 24 Türchen weiter unten.
   Aktuell sind überall PLATZHALTER eingetragen, damit du alles testen kannst.
   ===================================================================== */

window.ADVENT_CONFIG = {
  year: 2026,
  month: 12,                  // Dezember
  days: 24,                   // letztes Türchen = Finale
  respectReducedMotion: false, // true = iPhone-Einstellung "Bewegung reduzieren" beachten (dann kein Konfetti/Schnee)

  eyebrow: 'Ein kleines Geschenk für dich',
  title: 'Sarahs Adventskalender',
  greeting: 'Liebe Sarah,\nvom 1. bis zum 24. Dezember wartet jeden Tag ein kleines Türchen auf dich.\nIch hoffe, sie zaubern dir ein Lächeln ins Gesicht.',
  footer: 'Mit ganz viel Liebe gemacht',

  // Reihenfolge der Türchen im Raster (jede Zahl 1–24 genau einmal)
  layout: [7, 19, 3, 12,  22, 1, 16, 9,  14, 5, 24, 18,  2, 21, 10, 6,  17, 13, 4, 23,  8, 15, 20, 11],

  // Test-Passwort (als Hash gespeichert). Aktivieren: 5x schnell auf den Stern ganz oben tippen.
  testPasswordHash: '1p49y3y5pk1'
};

/* ---------------------------------------------------------------------
   TÜRCHEN – mögliche Felder (alle optional, außer wo nötig):

   title        Überschrift
   text         Text (Leerzeile = neuer Absatz)
   signature    Unterschrift unten rechts, z. B. 'Dein Schatz'
   image        ein Foto, z. B. 'media/foto-1.svg' (Beschriftung: caption)
   images       mehrere Fotos: [{ src: 'media/a.jpg', caption: '…' }, …]
   youtube      YouTube-Link oder Video-ID (das Video spielt direkt auf der Seite)
   type         Mini-Game: 'memory' | 'quiz' | 'puzzle' | 'scratch' | 'catch'
   reward       Belohnung nach dem Spiel: { title, text, image }
   finale       true = großes Finale mit Konfetti (Türchen 24 ist automatisch Finale)

   Spiel-Felder:
   memory   pairs: ['media/a.jpg', …]  (2 bis 8 Bilder)
   quiz     questions: [{ q, options: [...], answer: 0, explain }]
            (answer = Nummer der richtigen Antwort, 0 = erste. Ohne answer gibt es kein Richtig/Falsch)
   puzzle   image: 'media/foto.jpg'   size: 3 (oder 4)
   scratch  reveal: { title, text, image }  (das, was freigerubbelt wird)
   catch    goal: 12  seconds: 30
   --------------------------------------------------------------------- */

window.ADVENT_DOORS = {

  1: {
    title: 'Es geht los',
    text: 'Willkommen zu deinem ganz persönlichen Adventskalender.\n\nJeden Tag öffnet sich ein neues Türchen. Mal gibt es ein paar Worte, mal ein Foto, mal ein Video und manchmal ein kleines Spiel.\n\nHeute: ein erstes Hallo und ein ganz dickes Lächeln von mir.',
    image: 'media/foto-1.svg',
    caption: 'Hier kommt ein Foto von euch hin',
    signature: 'Dein Schatz'
  },

  2: {
    title: 'Ein Moment für uns',
    image: 'media/foto-2.svg',
    caption: 'Eine schöne Erinnerung'
  },

  3: {
    title: 'Memory',
    text: 'Finde alle Paare.',
    type: 'memory',
    pairs: ['media/memory-1.svg', 'media/memory-2.svg', 'media/memory-3.svg', 'media/memory-4.svg', 'media/memory-5.svg', 'media/memory-6.svg'],
    reward: { title: 'Gut gemerkt', text: 'Du hast ein Gedächtnis wie ein Elefant. Hier kann später etwas Persönliches stehen.' }
  },

  4: {
    title: 'Wie gut kennst du uns?',
    type: 'quiz',
    questions: [
      { q: 'Wo haben wir uns zum ersten Mal gesehen?', options: ['Platzhalter A', 'Platzhalter B', 'Platzhalter C'], answer: 1, explain: 'Hier kann eine kleine Erinnerung dazu stehen.' },
      { q: 'Was ist dein liebstes Weihnachtsessen?', options: ['Option 1', 'Option 2', 'Option 3'], explain: 'Bei dieser Frage gibt es keine falsche Antwort.' },
      { q: 'Wohin würden wir als Nächstes gerne reisen?', options: ['Ziel A', 'Ziel B', 'Ziel C'], answer: 0 }
    ],
    reward: { title: 'Quiz geschafft', text: 'Egal wie viele richtig waren: Ich liebe dich trotzdem.' }
  },

  5: {
    title: 'Ein paar Worte',
    text: 'Hier könnte ein kurzer Brief stehen, eine Liste mit Dingen, die ich an dir liebe, oder ein Gedicht.\n\nDu kannst so viele Absätze schreiben, wie du magst.',
    signature: 'Für dich'
  },

  6: {
    title: 'Nikolaus',
    text: 'Heute ist Nikolaus. Rubble die Fläche frei und schau, was der Nikolaus gebracht hat.',
    type: 'scratch',
    reveal: { title: 'Überraschung', text: 'Hier steht später, was dich erwartet.', image: 'media/foto-4.svg' }
  },

  7: {
    title: 'Unser Video',
    text: 'Mach es dir gemütlich und drück auf Play.',
    youtube: ''   // hier später den YouTube-Link eintragen, z. B. 'https://youtu.be/XXXXXXXXXXX'
  },

  8: {
    title: 'Puzzle',
    text: 'Schiebe die Teile an die richtige Stelle.',
    type: 'puzzle',
    image: 'media/puzzle.svg',
    size: 3,
    reward: { title: 'Perfekt', text: 'Das Bild ist fertig. So schön passt alles zusammen.' }
  },

  9: {
    title: 'Fünf Dinge',
    text: 'Fünf Dinge, die ich an dir liebe:\n\n1. Platzhalter\n2. Platzhalter\n3. Platzhalter\n4. Platzhalter\n5. Platzhalter'
  },

  10: {
    title: 'Schneefang',
    type: 'catch',
    goal: 12,
    seconds: 30,
    reward: { title: 'Sternenfängerin', text: 'Geschickt wie immer. Hier kann eine kleine Überraschung stehen.' }
  },

  11: {
    title: 'Zwei Erinnerungen',
    images: [
      { src: 'media/foto-3.svg', caption: 'Erinnerung Nr. 1' },
      { src: 'media/foto-2.svg', caption: 'Erinnerung Nr. 2' }
    ],
    text: 'Manchmal sagt ein Bild mehr als tausend Worte.'
  },

  12: {
    title: 'Winter-Quiz',
    type: 'quiz',
    questions: [
      { q: 'Wie viele Zacken hat eine Schneeflocke?', options: ['4', '6', '8'], answer: 1, explain: 'Schneeflocken haben immer sechs Arme.' },
      { q: 'Was gehört zu Weihnachten auf jeden Fall dazu?', options: ['Plätzchen', 'Glühwein', 'Kuscheln'], explain: 'Am besten alles zusammen.' }
    ],
    reward: { title: 'Winterprofi', text: 'Gut gemacht.' }
  },

  13: {
    title: 'Für kalte Tage',
    text: 'Hier kann ein Gutschein stehen, zum Beispiel für einen gemeinsamen Abend mit Film und Snacks.'
  },

  14: {
    title: 'Memory, Teil 2',
    text: 'Noch eine Runde.',
    type: 'memory',
    pairs: ['media/memory-1.svg', 'media/memory-3.svg', 'media/memory-5.svg', 'media/memory-6.svg'],
    reward: { title: 'Wieder geschafft', text: 'Platzhalter für eine kleine Nachricht.' }
  },

  15: {
    title: 'Rubbellos',
    type: 'scratch',
    reveal: { title: 'Gewinn', text: 'Ein Abend deiner Wahl, ich koche.' }
  },

  16: {
    title: 'Ein Gruß in Bewegung',
    text: 'Dieses Türchen hat Text und Video zusammen.',
    youtube: '',
    signature: 'Deine Nr. 1'
  },

  17: {
    title: 'Puzzle, Teil 2',
    type: 'puzzle',
    image: 'media/foto-3.svg',
    size: 3,
    reward: { title: 'Wunderbar', text: 'Hier kann etwas Persönliches stehen.' }
  },

  18: {
    title: 'Ein Foto zum Schmunzeln',
    image: 'media/foto-1.svg',
    caption: 'Kannst du dich daran erinnern?'
  },

  19: {
    title: 'Schneefang, schwerer',
    text: 'Diesmal sind es mehr.',
    type: 'catch',
    goal: 18,
    seconds: 30,
    reward: { title: 'Meisterin', text: 'Du bist unschlagbar.' }
  },

  20: {
    title: 'Noch vier Tage',
    text: 'Noch vier Mal schlafen, dann ist Weihnachten.\n\nIch freue mich so sehr darauf, die Zeit mit dir zu verbringen.'
  },

  21: {
    title: 'Der kürzeste Tag',
    text: 'Heute ist Wintersonnenwende. Ab jetzt werden die Tage wieder länger.',
    type: 'quiz',
    questions: [
      { q: 'Was wünschst du dir für das neue Jahr?', options: ['Viel Zeit zu zweit', 'Neue Abenteuer', 'Ruhe und Gemütlichkeit'] }
    ],
    reward: { title: 'Wunsch gemerkt', text: 'Ich kümmere mich darum.' }
  },

  22: {
    title: 'Fast da',
    image: 'media/foto-2.svg',
    caption: 'Noch zwei Türchen'
  },

  23: {
    title: 'Memory, das letzte',
    type: 'memory',
    pairs: ['media/memory-1.svg', 'media/memory-2.svg', 'media/memory-3.svg', 'media/memory-4.svg', 'media/memory-5.svg', 'media/memory-6.svg'],
    reward: { title: 'Bis morgen', text: 'Morgen wartet das große Finale auf dich.' }
  },

  24: {
    finale: true,
    title: 'Frohe Weihnachten, Sarah',
    text: 'Das war er, dein Adventskalender.\n\nHier steht später ein langer, persönlicher Brief oder die schönste Nachricht des ganzen Kalenders.\n\nIch liebe dich.',
    image: 'media/foto-1.svg',
    caption: 'Für immer wir',
    signature: 'Dein Schatz'
  }
};
