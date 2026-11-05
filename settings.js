/* =====================================================================
   SETTINGS FOR YOUR BOOK WEBSITE
   ---------------------------------------------------------------------
   This is the ONLY file you need to edit.
   Rules:
     • Change only the text between the quote marks "like this"
       or the numbers (prices).
     • Keep every comma at the end of a line.
     • Prices are plain numbers: 299 (not "R299", not 299,00).
     • To hide something, set it to "" (empty quotes).
   After saving, the live site updates in about 1 minute.
   ===================================================================== */

const SITE = {

  /* ---------- THE BOOK ---------- */
  title: "Until I Come for You",
  author: "Gasan Sallies",
  series: "Book One of a trilogy",
  genre: "Young Adult Fantasy",

  // The cover picture. To change it: upload a new image into the
  // "images" folder, then put its exact file name here.
  coverImage: "images/cover.jpg",

  // Short line shown at the top of the page.
  // Examples: "Pre-order now", "Out now", "Coming 2027"
  status: "Pre-order now",

  // Optional extra line under the shop heading. Leave as "" to hide.
  shippingNote: "Pre-orders ship as soon as the first print run arrives. eBooks are emailed within 24 hours.",


  /* ---------- CURRENCIES ---------- */
  // The buyer picks one of these at the top of the shop.
  //   ZAR is paid through PayFast (South Africa).
  //   USD / GBP / EUR are paid through PayPal.
  // Remove a line to stop offering that currency.
  currencies: ["ZAR", "USD", "GBP", "EUR"],


  /* ---------- PRICES ---------- */
  // One block per format. Put a price for every currency above.
  //   physical    = true for printed books (delivery is added), false for eBooks
  //   available   = false shows "Coming soon" (can't be bought)
  //   amazonLink  = paste your Amazon link here once the book is on KDP.
  //                 Buyers paying in USD / GBP / EUR are then sent to Amazon
  //                 for this format instead of you posting it overseas.
  //                 Leave "" to sell and post it yourself.
  formats: [
    {
      name: "Paperback",
      detail: "Printed paperback, delivered to your door or nearest pickup point.",
      prices: { ZAR: 299, USD: 18, GBP: 14, EUR: 16 },
      physical: true,
      available: true,
      amazonLink: "",
    },
    {
      name: "Signed Paperback",
      detail: "Signed by the author. Add a name for a personal message.",
      prices: { ZAR: 349, USD: 21, GBP: 17, EUR: 19 },
      physical: true,
      available: true,
      amazonLink: "",   // keep "" — Amazon can't sign books!
    },
    {
      name: "eBook (EPUB)",
      detail: "EPUB file, emailed to you. Works on phones, tablets, Kobo and most e-readers.",
      prices: { ZAR: 129, USD: 7, GBP: 6, EUR: 7 },
      physical: false,
      available: true,
      amazonLink: "",
    },
  ],


  /* ---------- DELIVERY INSIDE SOUTH AFRICA (Rand) ---------- */
  // The buyer picks one. Add, remove or re-price freely.
  // address: true  = asks for a street address
  // address: false = asks only which store / locker (or nothing, for collection)
  deliverySouthAfrica: [
    { name: "PAXI — collect at any PEP store (7–9 days)", price: 60, address: false, askFor: "Which PEP store? (town + store name)" },
    { name: "PUDO — collect from a locker",               price: 70, address: false, askFor: "Which PUDO locker? (name or area)" },
    { name: "Courier to your door (2–4 days)",             price: 120, address: true },
    { name: "Collect from me (by arrangement)",            price: 0,  address: false, askFor: "" },
  ],

  /* ---------- DELIVERY OUTSIDE SOUTH AFRICA ---------- */
  // Only used for printed books bought in USD / GBP / EUR that have no amazonLink.
  deliveryInternational: { USD: 25, GBP: 20, EUR: 23 },


  /* ---------- PAYMENTS ---------- */
  // PayFast = Rand payments (card, Instant EFT, SnapScan etc.)
  // Copy these from your PayFast dashboard → Settings → Merchant details.
  // While they are empty, the button says "Reserve my copy by email".
  payfastMerchantId: "",
  payfastMerchantKey: "",
  // Keep true while you test on sandbox.payfast.co.za. Change to false to go live.
  payfastTestMode: true,

  // PayPal = USD / GBP / EUR payments. Your PayPal business account email.
  paypalEmail: "",


  /* ---------- CONTACT & LINKS ---------- */
  contactEmail: "gasansallies@gmail.com",
  // Paste full links (starting with https://). Leave "" to hide.
  instagram: "",
  tiktok: "",
  facebook: "",
  goodreads: "",
  amazon: "",          // your main Amazon book page (shown as a link at the bottom)
  // A sign-up form for news (e.g. a free Google Form). If empty, the
  // "Get updates" button opens an email to you instead.
  mailingListLink: "",


  /* ---------- WORDS ON THE PAGE ---------- */
  blurb: [
    "Jason Black has spent his whole life holding his broken family together, and holding his little sister Katy closest of all. So when she makes him promise he’ll always come back for her, he doesn’t think twice.",
    "Then he wakes beneath three moons, in a land where light pours from his hands and smoke hunts in the long grass. Strangers with eyes like fire call him Fatheus, and swear he’s come home.",
    "They say he can never go back.",
    "They don’t know Jason Black.",
    "And they don’t know what he promised Katy.",
  ],

  aboutAuthor: "Gasan Sallies is a South African filmmaker, playwright and novelist who writes for the screen, the stage and the page. Until I Come for You is Book One of his fantasy trilogy.",

  // Optional quotes from readers. Add as many as you like, or leave the list empty: []
  praise: [
    // { quote: "I couldn't put it down.", name: "Beta reader" },
  ],
};
