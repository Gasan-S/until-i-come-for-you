/* Website logic. You don't need to edit this file — use settings.js. */
(function () {
  "use strict";
  var S = typeof SITE !== "undefined" ? SITE : (window.SITE || {});
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; };

  var SYMBOL = { ZAR: "R", USD: "US$", GBP: "£", EUR: "€" };
  function money(n, cur) {
    n = Number(n) || 0;
    var s = n % 1 === 0 ? String(n) : n.toFixed(2);
    if (cur === "ZAR") s = Number(n).toLocaleString("en-ZA", { maximumFractionDigits: 2 }).replace(/ /g, " ");
    return (SYMBOL[cur] || cur + " ") + s;
  }

  /* ---------- fill text ---------- */
  $$("[data-text]").forEach(function (el) {
    var v = S[el.getAttribute("data-text")];
    if (v === "" || v == null) { if (el.matches("p,.note")) el.hidden = true; return; }
    el.textContent = v;
  });
  if (S.title) document.title = S.title + " · " + (S.author || "");
  $$("[data-cover]").forEach(function (img) { if (S.coverImage) img.src = S.coverImage; });
  var icon = $('link[rel="icon"]'); if (icon && S.coverImage) icon.href = S.coverImage;
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var blurb = $("[data-blurb]");
  if (blurb && S.blurb) blurb.innerHTML = S.blurb.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");

  var praise = $("[data-praise]");
  if (praise && S.praise && S.praise.length) {
    praise.innerHTML = S.praise.map(function (q) {
      return "<figure><blockquote>“" + esc(q.quote) + "”</blockquote><figcaption>" + esc(q.name || "") + "</figcaption></figure>";
    }).join("");
    praise.hidden = false;
  }

  var contact = S.contactEmail ? "mailto:" + S.contactEmail : "";
  $$("[data-contact]").forEach(function (a) { if (contact) a.href = contact; else a.parentNode.hidden = true; });
  var mailing = $("[data-mailing]");
  if (mailing) {
    if (S.mailingListLink) { mailing.href = S.mailingListLink; mailing.target = "_blank"; mailing.rel = "noopener"; }
    else if (contact) mailing.href = contact + "?subject=" + encodeURIComponent("Updates on " + S.title + " please");
    else mailing.hidden = true;
  }
  var links = $("[data-links]");
  if (links) {
    var defs = [["instagram", "Instagram"], ["tiktok", "TikTok"], ["facebook", "Facebook"], ["goodreads", "Goodreads"], ["amazon", "Amazon"]];
    links.innerHTML = defs.filter(function (d) { return S[d[0]]; }).map(function (d) {
      return '<a href="' + esc(S[d[0]]) + '" target="_blank" rel="noopener">' + d[1] + "</a>";
    }).join("");
  }

  /* ---------- chapter reader ---------- */
  var chapter = $("[data-chapter]"), keep = $("[data-keep-reading]");
  if (keep) keep.addEventListener("click", function () {
    chapter.classList.add("open");
    $("[data-chapter-fade]").hidden = true;
    $("[data-chapter-end]").hidden = false;
  });

  /* ---------- shop ---------- */
  var formats = (S.formats || []).filter(Boolean);
  var currencies = (S.currencies && S.currencies.length ? S.currencies : ["ZAR"]).filter(function (c) { return SYMBOL[c] || c; });
  var deliveryZA = (S.deliverySouthAfrica || []).filter(Boolean);
  var payfastReady = !!(S.payfastMerchantId && S.payfastMerchantKey);
  var paypalReady = !!S.paypalEmail;

  // Remember the buyer's currency; guess ZAR for South African browsers.
  var saved = null;
  try { saved = localStorage.getItem("currency"); } catch (e) {}
  var guess = /Africa\/Johannesburg/.test((Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || "") ? "ZAR" : null;
  var state = {
    i: formats.findIndex(function (f) { return f.available; }),
    cur: currencies.indexOf(saved) > -1 ? saved : (guess && currencies.indexOf(guess) > -1 ? guess : currencies[0]),
    del: 0,
  };

  var form = $("[data-order]"), grid = $("[data-formats]"), curBox = $("[data-currency]");
  function priceOf(f, cur) { return f && f.prices ? Number(f.prices[cur]) : NaN; }
  function current() { return formats[state.i]; }
  function qty() { var q = parseInt(form.qty.value, 10); return isNaN(q) || q < 1 ? 1 : Math.min(q, 20); }
  function isLocal() { return state.cur === "ZAR"; }
  function viaAmazon(f) { return !isLocal() && f && f.physical && f.amazonLink; }

  function renderFrom() {
    var avail = formats.filter(function (f) { return f.available && !isNaN(priceOf(f, state.cur)); });
    var from = $("[data-from]");
    if (from) from.textContent = avail.length ? "· from " + money(Math.min.apply(null, avail.map(function (f) { return priceOf(f, state.cur); })), state.cur) : "";
  }

  function renderCurrencies() {
    if (!curBox) return;
    curBox.hidden = currencies.length < 2;
    curBox.innerHTML = currencies.map(function (c) {
      return '<button type="button" role="radio" data-cur="' + c + '" aria-checked="' + (c === state.cur) + '">' + esc(({ ZAR: "R", USD: "$", GBP: "£", EUR: "€" })[c] || "") + " " + c + "</button>";
    }).join("");
  }
  if (curBox) curBox.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cur]"); if (!b) return;
    state.cur = b.getAttribute("data-cur");
    try { localStorage.setItem("currency", state.cur); } catch (err) {}
    update();
  });

  function renderFormats() {
    grid.innerHTML = formats.map(function (f, i) {
      var p = priceOf(f, state.cur);
      var label = !f.available ? '<span class="soon">Coming soon</span>'
        : viaAmazon(f) ? '<span class="soon">Available on Amazon</span>'
        : isNaN(p) ? '<span class="soon">Not sold in ' + state.cur + "</span>"
        : '<span class="price">' + money(p, state.cur) + "</span>";
      var off = !f.available || (isNaN(p) && !viaAmazon(f));
      return '<button type="button" class="format" role="radio" data-i="' + i + '" aria-checked="' + (i === state.i) + '"' + (off ? " disabled" : "") + ">" +
        "<h3>" + esc(f.name) + "</h3><p>" + esc(f.detail || "") + "</p>" + label + "</button>";
    }).join("");
  }
  if (grid) grid.addEventListener("click", function (e) {
    var b = e.target.closest(".format"); if (!b || b.disabled) return;
    state.i = Number(b.getAttribute("data-i")); update();
  });

  function renderDelivery() {
    var list = $("[data-delivery-list]");
    list.innerHTML = deliveryZA.map(function (d, i) {
      return '<label class="choice"><input type="radio" name="delivery" value="' + i + '"' + (i === state.del ? " checked" : "") + "> " +
        "<span>" + esc(d.name) + '</span><span class="cost">' + (Number(d.price) ? money(d.price, "ZAR") : "Free") + "</span></label>";
    }).join("");
  }

  function totals() {
    var f = current(); if (!f) return null;
    var unit = priceOf(f, state.cur); if (isNaN(unit)) return null;
    var q = qty(), delivery = 0, d = null;
    if (f.physical) {
      if (isLocal()) { d = deliveryZA[state.del]; delivery = d ? Number(d.price) || 0 : 0; }
      else delivery = Number((S.deliveryInternational || {})[state.cur]) || 0;
    }
    return { unit: unit, q: q, sub: unit * q, delivery: delivery, total: unit * q + delivery, d: d };
  }

  function update() {
    if (!form) return;
    var f = current();
    // if the chosen format can't be bought in this currency, jump to one that can
    if (f && isNaN(priceOf(f, state.cur)) && !viaAmazon(f)) {
      var alt = formats.findIndex(function (x) { return x.available && !isNaN(priceOf(x, state.cur)); });
      if (alt > -1) { state.i = alt; f = current(); }
    }
    renderCurrencies(); renderFormats(); renderFrom();

    var amazon = viaAmazon(f);
    $("[data-amazon]").hidden = !amazon;
    $("[data-direct]").hidden = !!amazon;
    if (amazon) { $("[data-amazon-link]").href = f.amazonLink; return; }

    var local = isLocal();
    var physLocal = !!(f && f.physical && local);
    $("[data-delivery]").hidden = !physLocal || !deliveryZA.length;
    if (physLocal) {
      var checked = form.querySelector('input[name="delivery"]:checked');
      if (checked) state.del = Number(checked.value);
      if (state.del >= deliveryZA.length) state.del = 0;
      renderDelivery();
    }
    var d = physLocal ? deliveryZA[state.del] : null;
    $("[data-address]").hidden = !(d && d.address);
    $("[data-pickup]").hidden = !(d && !d.address);
    if (d && !d.address) {
      var pick = form.pickup.closest(".field");
      pick.hidden = !d.askFor;
      $("[data-pickup-label]").textContent = d.askFor || "";
    }
    $("[data-intl-hint]").hidden = !(f && f.physical && !local);
    $("[data-inscription]").hidden = !(f && /sign/i.test(f.name));

    var t = totals(), sum = $("[data-summary]");
    if (!t) sum.innerHTML = "<p>Orders open soon.</p>";
    else {
      sum.innerHTML =
        '<div class="line"><span>' + t.q + " × " + esc(f.name) + "</span><span>" + money(t.sub, state.cur) + "</span></div>" +
        (f.physical ? '<div class="line"><span>Delivery' + (local ? (t.d ? " — " + esc(t.d.name.split(" (")[0]) : "") : " (international)") + "</span><span>" + (t.delivery ? money(t.delivery, state.cur) : "Free") + "</span></div>" : "") +
        '<div class="line total"><span>Total</span><span>' + money(t.total, state.cur) + "</span></div>";
    }

    var ready = local ? payfastReady : paypalReady;
    var pay = $("[data-pay]"), secure = $("[data-secure]");
    if (!t) { pay.disabled = true; pay.textContent = "Orders open soon"; secure.innerHTML = ""; }
    else if (ready) {
      pay.disabled = false;
      pay.textContent = "Pay " + money(t.total, state.cur) + (local ? " securely" : " with PayPal");
      secure.innerHTML = local
        ? "You’ll be taken to PayFast to pay safely by card, Instant EFT, SnapScan and more." + (S.payfastTestMode ? " <strong>(Test mode — no real money)</strong>" : "")
        : "You’ll be taken to PayPal to pay safely by card or PayPal balance.";
    } else {
      pay.disabled = false;
      pay.textContent = "Reserve my copy by email";
      secure.innerHTML = "Online payment opens soon. Reserve now and you’ll receive payment details by email.";
    }
    $("[data-error]").textContent = "";
  }

  if (form) {
    form.addEventListener("change", function (e) {
      if (e.target.name === "delivery") state.del = Number(e.target.value);
      update();
    });
    form.qty.addEventListener("input", update);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = current(); if (!f || viaAmazon(f)) return;
      var t = totals(); if (!t) return;
      var local = isLocal();
      var d = t.d;
      var required = ["name", "email"];
      if (f.physical && local && d) {
        if (d.address) required = required.concat(["phone", "street", "city", "postal"]);
        else if (d.askFor) required = required.concat(["pickup", "phone2"]);
      }
      var bad = null;
      $$(".field input", form).forEach(function (i) { i.classList.remove("bad"); });
      required.forEach(function (n) {
        var el = form[n], v = el.value.trim();
        var ok = n === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) : v.length > 1;
        if (!ok) { el.classList.add("bad"); bad = bad || el; }
      });
      if (bad) { $("[data-error]").textContent = "Please fill in the highlighted details."; bad.focus(); return; }

      var phone = (d && d.address ? form.phone.value : form.phone2.value).trim();
      var where = !f.physical ? "Email delivery (eBook)"
        : !local ? "International — address from PayPal"
        : d.address ? d.name.split(" (")[0] + ": " + [form.street.value, form.suburb.value, form.city.value, form.postal.value].map(function (s) { return s.trim(); }).filter(Boolean).join(", ")
        : d.name.split(" (")[0] + (form.pickup.value.trim() ? ": " + form.pickup.value.trim() : "");
      var o = {
        name: form.name.value.trim(), email: form.email.value.trim(), phone: phone, where: where,
        inscription: form.inscription.value.trim(),
      };
      var ref = "UICFY-" + Date.now().toString(36).toUpperCase();
      var item = S.title + " — " + f.name;
      var here = window.location.href.split("#")[0].split("?")[0];
      var base = here.replace(/[^\/]*$/, "");

      if (!local && paypalReady) {
        post("https://www.paypal.com/cgi-bin/webscr", {
          cmd: "_xclick", business: S.paypalEmail, item_name: item, item_number: ref,
          amount: t.unit.toFixed(2), quantity: t.q, shipping: t.delivery.toFixed(2), shipping2: "0.00",
          currency_code: state.cur, no_shipping: f.physical ? "2" : "1", email: o.email,
          on0: "Signed for", os0: o.inscription || "-",
          return: base + "thanks.html", cancel_return: here + "#buy", charset: "utf-8",
        });
      } else if (local && payfastReady) {
        var parts = o.name.split(/\s+/);
        post(S.payfastTestMode ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process", {
          merchant_id: S.payfastMerchantId, merchant_key: S.payfastMerchantKey,
          return_url: base + "thanks.html", cancel_url: here + "#buy",
          name_first: parts[0].slice(0, 100), name_last: (parts.slice(1).join(" ") || "-").slice(0, 100), email_address: o.email,
          m_payment_id: ref, amount: t.total.toFixed(2),
          item_name: (t.q + " x " + item).slice(0, 100),
          item_description: o.where.slice(0, 255),
          custom_str1: o.where.slice(0, 255), custom_str2: o.phone.slice(0, 255),
          custom_str3: (o.inscription ? "Sign for: " + o.inscription : "").slice(0, 255),
          custom_str4: (t.q + " x " + f.name).slice(0, 255),
        });
      } else {
        var body = [
          "Hi " + S.author + ",", "", "I’d like to reserve:",
          t.q + " × " + item, "Total: " + money(t.total, state.cur) + (f.physical ? " (incl. delivery)" : ""), "",
          "Name: " + o.name, "Email: " + o.email,
          o.phone ? "Phone: " + o.phone : "", "Delivery: " + o.where,
          o.inscription ? "Sign it for: " + o.inscription : "", "", "Order ref: " + ref,
        ].filter(function (l, i, a) { return l !== "" || a[i - 1] !== ""; }).join("\n");
        window.location.href = "mailto:" + S.contactEmail + "?subject=" + encodeURIComponent("Order: " + item) + "&body=" + encodeURIComponent(body);
      }
    });
  }

  function post(url, fields) {
    var f = document.createElement("form");
    f.method = "post"; f.action = url; f.acceptCharset = "UTF-8"; f.style.display = "none";
    Object.keys(fields).forEach(function (k) {
      if (fields[k] === "" || fields[k] == null) return;
      var i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = fields[k]; f.appendChild(i);
    });
    document.body.appendChild(f); f.submit();
  }

  if (form) update(); else renderFrom();
})();
