/**
 * Paddlebase registration backend.
 * Bound to the Google Sheet (Extensions > Apps Script).
 *
 * Sheet tab "Registrations" columns (row 1 headers, created by setupSheet()):
 *   timestamp | name | venue_name | courts_count | rates | email | phone | source | email_status
 *
 * Script properties (Project Settings > Script properties):
 *   OWNER_EMAIL  - address that receives the "new registration" alert
 *   EVENT_NAME   - optional, default "Paddlebase registration"
 *   EVENT_WHEN   - optional, default "Sunday, October 18, 2026 at 2:00 PM (Manila time)"
 */

var SHEET_NAME = 'Registrations';
var HEADERS = ['timestamp', 'name', 'venue_name', 'courts_count', 'rates', 'email', 'phone', 'source', 'email_status'];
var WELCOME_POSTER_URL = 'https://almanalaysay93-gif.github.io/paddlebase-registration-/assets/welcome-to-paddlebase.png';

// ---------- Web app entry point ----------

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Honeypot: real users leave this empty. Pretend success so bots learn nothing.
    if (data.website) {
      return json_({ ok: true });
    }

    var result = validate_(data);
    if (Object.keys(result.errors).length > 0) {
      return json_({ ok: false, errors: result.errors });
    }
    var clean = result.clean;

    var sheet = getSheet_();
    if (isDuplicateEmail_(sheet, clean.email)) {
      return json_({
        ok: false,
        errors: { email: 'This email is already registered.' }
      });
    }

    sheet.appendRow([
      new Date(),
      clean.name,
      clean.venue_name,
      clean.courts_count,
      clean.rates,
      clean.email,
      clean.phone,
      'form',
      'pending'
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'Something went wrong. Please try again.' });
  }
}

// ---------- Email automation (runs on a time-driven trigger) ----------

/**
 * Sends the owner alert and registrant welcome for every form row still "pending".
 * Only rows with source = "form" are processed, so manual sheet edits send nothing.
 */
function processPending() {
  var sheet = getSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return;

  var rows = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var props = PropertiesService.getScriptProperties();
  var owner = props.getProperty('OWNER_EMAIL');
  var eventName = props.getProperty('EVENT_NAME') || 'Paddlebase registration';
  var eventWhen = props.getProperty('EVENT_WHEN') || 'Sunday, October 18, 2026 at 2:00 PM (Manila time)';

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var source = row[7];
    var status = row[8];
    if (source !== 'form' || status !== 'pending') continue;

    var reg = {
      name: row[1], venue_name: row[2], courts_count: row[3],
      rates: row[4], email: row[5], phone: row[6]
    };
    var rowNumber = i + 2;

    try {
      var poster = UrlFetchApp.fetch(WELCOME_POSTER_URL).getBlob().setName('Welcome to Paddlebase.png');
      if (owner) {
        MailApp.sendEmail({
          to: owner,
          subject: 'New registration: ' + reg.venue_name,
          body: 'New registration for ' + eventName + '\n' +
            'Name: ' + reg.name + '\nVenue: ' + reg.venue_name + '\n' +
            'Paddlebase: https://paddlebase.org/\n' +
            'Owner portal: https://paddlebaseowner.org/',
          htmlBody: ownerEmailHtml_(reg, eventName),
          inlineImages: { welcomePoster: poster },
          attachments: [poster]
        });
      }
      MailApp.sendEmail({
        to: reg.email,
        subject: 'Welcome to ' + eventName + '!',
        body: 'Welcome, ' + reg.name + '!\n' +
          'You are registered for ' + eventName + '.\n' +
          'Event: ' + eventWhen + '\n' +
          'Paddlebase: https://paddlebase.org/\n' +
          'Owner portal: https://paddlebaseowner.org/',
        htmlBody: welcomeEmailHtml_(reg, eventName, eventWhen),
        inlineImages: { welcomePoster: poster },
        attachments: [poster]
      });
      sheet.getRange(rowNumber, 9).setValue('sent');
    } catch (err) {
      sheet.getRange(rowNumber, 9).setValue('failed: ' + err.message);
    }
  }
}

// ---------- Setup (run once, from the Apps Script editor) ----------

/** Creates the Registrations tab and headers if missing. */
function setupSheet() {
  getSheet_();
  return 'Sheet ready';
}

/** Creates a time-driven trigger that runs processPending every minute. Run once. */
function installTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processPending') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('processPending').timeBased().everyMinutes(1).create();
  return 'Trigger installed';
}

/** Sends one test registration through the full path. Use your own address as the email. */
function testRegistration() {
  var sample = {
    name: 'Test Owner',
    venue_name: 'Test Courts',
    courts_count: '4',
    rates: '500',
    email: 'REPLACE_WITH_YOUR_TEST_EMAIL@example.com',
    phone: '+63 912 345 6789'
  };
  var e = { postData: { contents: JSON.stringify(sample) } };
  Logger.log(doPost(e).getContent());
}

// ---------- Validation ----------

function validate_(data) {
  var errors = {};
  var clean = {};

  clean.name = trimmed_(data.name);
  if (clean.name.length < 2 || clean.name.length > 80) errors.name = 'Enter your full name.';

  clean.venue_name = trimmed_(data.venue_name);
  if (clean.venue_name.length < 2 || clean.venue_name.length > 120) errors.venue_name = "Enter your venue's name.";

  var courtsText = trimmed_(data.courts_count);
  var courts = Number(courtsText);
  if (!/^\d+$/.test(courtsText) || courts < 1 || courts > 200) errors.courts_count = 'Use a whole number, 1 or more.';
  clean.courts_count = courts;

  var ratesText = trimmed_(data.rates);
  var rates = Number(ratesText);
  if (!/^\d+(\.\d{1,2})?$/.test(ratesText) || rates > 100000) {
    errors.rates = 'Enter a number, like 350 or 350.50.';
  }
  clean.rates = rates;

  clean.email = trimmed_(data.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean.email) || clean.email.length > 254) {
    errors.email = 'Enter a valid email, like name@venue.ph.';
  }

  // PH mobile: +63 9XX XXX XXXX or 09XX XXX XXXX (spaces and dashes ignored)
  clean.phone = trimmed_(data.phone);
  if (!/^(\+63|0)9\d{9}$/.test(clean.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Use a PH mobile number, like 0917 123 4567.';
  }

  return { errors: errors, clean: clean };
}

function trimmed_(v) {
  return String(v === undefined || v === null ? '' : v).trim();
}

function isWhole_(n) {
  return isFinite(n) && Math.floor(n) === n;
}

// ---------- Helpers ----------

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function isDuplicateEmail_(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var emails = sheet.getRange(2, 6, last - 1, 1).getValues();
  for (var i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).trim().toLowerCase() === email) return true;
  }
  return false;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function ownerEmailHtml_(reg, eventName) {
  return '<div style="font-family:Arial,sans-serif;color:#111A16;max-width:560px">' +
    '<h2 style="color:#111A16">New registration for ' + esc_(eventName) + '</h2>' +
    '<table cellpadding="6" style="border-collapse:collapse">' +
    row_('Name', reg.name) + row_('Venue', reg.venue_name) + row_('Courts', reg.courts_count) +
    row_('Rate (PHP/hr)', reg.rates) + row_('Email', reg.email) + row_('Phone', reg.phone) +
    '</table>' +
    '<p><a href="https://paddlebase.org/">Paddlebase</a> | ' +
    '<a href="https://paddlebaseowner.org/">Paddlebase Owner</a></p>' +
    '<img src="cid:welcomePoster" alt="Welcome to Paddlebase" ' +
    'style="display:block;width:100%;max-width:560px;height:auto" />' +
    '</div>';
}

function welcomeEmailHtml_(reg, eventName, eventWhen) {
  return '<div style="font-family:Arial,sans-serif;color:#111A16;max-width:560px">' +
    '<div style="background:#111A16;color:#D4F73A;padding:24px;border-radius:12px">' +
    '<h1 style="margin:0;font-size:24px">Welcome, ' + esc_(reg.name) + '!</h1>' +
    '<p style="color:#F6F5EE">You are registered for ' + esc_(eventName) + '.</p></div>' +
    '<p>Event: <strong>' + esc_(eventWhen) + '</strong></p>' +
    '<p>We have your venue, <strong>' + esc_(reg.venue_name) + '</strong>, with ' + esc_(reg.courts_count) +
    ' court(s) listed at PHP ' + esc_(reg.rates) + ' per hour. We will be in touch with more details.</p>' +
    '<p><a href="https://paddlebase.org/">Paddlebase</a> | ' +
    '<a href="https://paddlebaseowner.org/">Paddlebase Owner</a></p>' +
    '<img src="cid:welcomePoster" alt="Welcome to Paddlebase" ' +
    'style="display:block;width:100%;max-width:560px;height:auto" />' +
    '<p style="color:#5f6b64;font-size:12px">You received this email because you registered on the Paddlebase registration page.</p>' +
    '</div>';
}

function row_(label, value) {
  return '<tr><td style="border:1px solid #e6e8e3;background:#F6F5EE"><strong>' + esc_(label) +
    '</strong></td><td style="border:1px solid #e6e8e3">' + esc_(value) + '</td></tr>';
}
