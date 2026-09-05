import './styles.css';
import { classify, extractSignature, finishCheckpoint } from './calibration';
import { captureLicenseFromUrl, checkoutUrl, removeLicense, storeLicense, verifyLicense, type LicenseState } from './license';
import { isValidProfile, isValidStoredProfile } from './profile-validation';
import { clearProfile, loadProfile, saveProfile } from './storage';
import type { CalibrationProfile, Checkpoint, HistoryPoint, Signature, TestSummary } from './types';
import heroUrl from '../assets/src/movemap-hero.webp';

type Phase = 'idle' | 'capture' | 'ready' | 'testing' | 'results';

const BUILD_VERSION = '1.0.5';
const PUBLIC_ORIGIN = 'https://gesture-gameplay-calibrator.sociobot.in';
const normalizedPath = location.pathname.replace(/\/$/, '') || '/';
const demoMode = normalizedPath === '/demo';

const appElement = document.querySelector<HTMLDivElement>('#app');
if (!appElement) throw new Error('MoveMap could not start.');
const app: HTMLDivElement = appElement;

let phase: Phase = 'idle';
let profile: CalibrationProfile | null = null;
let stream: MediaStream | null = null;
let captureIndex = 0;
let historyPoints: HistoryPoint[] = [];
let testStarted = 0;
let testTimer: number | undefined;
let monitorTimer: number | undefined;
let currentConfidence = 0;
let peakConfidence = 0;
let triggers = 0;
let falseTrigger = false;
let activeTrigger = false;
let holdStarted = 0;
let cameraMessage = '';
let license: LicenseState = { unlocked: false, checking: true, message: 'Checking license…' };
let installPrompt: BeforeInstallPromptEvent | null = null;
const processingCanvas = document.createElement('canvas');

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

captureLicenseFromUrl();

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function makeProfile(name: string, checkpointNames: string[]): CalibrationProfile {
  const now = new Date().toISOString();
  return {
    schema: 'movemap-profile/v1',
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    frame: { width: 24, height: 18, feature: 'sobel-edge-24x18' },
    checkpoints: checkpointNames.map((checkpointName) => ({ id: crypto.randomUUID(), name: checkpointName, examples: [] })),
    settings: { holdMs: 450, releaseThreshold: 0.58 },
  };
}

function makeDemoProfile(): CalibrationProfile {
  const checkpointNames = ['Hands up', 'Lean left', 'Small duck'];
  const checkpoints = checkpointNames.map((name, checkpointIndex) => {
    const checkpoint: Checkpoint = {
      id: `demo-checkpoint-${checkpointIndex + 1}`,
      name,
      examples: Array.from({ length: 10 }, (_, exampleIndex) => (
        Array.from({ length: 352 }, (_, featureIndex) => {
          const wave = Math.sin((featureIndex + 1) * (checkpointIndex + 2) * 0.071);
          const variation = Math.cos((featureIndex + exampleIndex + 3) * 0.13) * 0.035;
          return Math.round((wave + variation) * 1000) / 1000;
        })
      )),
    };
    return finishCheckpoint(checkpoint);
  });
  return {
    schema: 'movemap-profile/v1',
    id: 'demo-room-rehearsal',
    name: 'Living room rhythm game',
    createdAt: '2026-08-30T10:00:00.000Z',
    updatedAt: '2026-08-30T10:05:00.000Z',
    frame: { width: 24, height: 18, feature: 'sobel-edge-24x18' },
    checkpoints,
    settings: { holdMs: 450, releaseThreshold: 0.58 },
    lastTest: {
      startedAt: '2026-08-30T10:04:30.000Z',
      durationSeconds: 30,
      triggers: 6,
      userReportedFalseTrigger: false,
      peakConfidence: 0.86,
    },
  };
}

function isCalibrationComplete(candidate: CalibrationProfile): boolean {
  return candidate.checkpoints.every((checkpoint) => checkpoint.examples.length === 10 && checkpoint.centroid !== undefined && checkpoint.threshold !== undefined);
}

async function persistProfile(): Promise<boolean> {
  if (!profile) return false;
  profile.updatedAt = new Date().toISOString();
  try {
    await saveProfile(profile, demoMode);
    return true;
  } catch {
    toast('This example could not be saved locally. Keep this tab open and export when finished.');
    return false;
  }
}

function header(): string {
  return `<header class="site-header">
    <a class="brand" href="/" aria-label="MoveMap home"><span class="brand-mark" aria-hidden="true">M</span><span>MoveMap</span></a>
    <nav aria-label="Primary"><a href="/#workbench">Workbench</a><a href="/demo">Demo</a><a href="/#method">How calibration works</a><a href="/#maker-pack">Maker Pack</a></nav>
    <button class="install-button secondary-button" type="button" hidden>Install app</button>
  </header>`;
}

function routeAnnouncer(): string {
  return '<p class="visually-hidden" id="route-status" aria-live="polite" aria-atomic="true"></p>';
}

function footer(): string {
  return `<footer><div><strong>MoveMap</strong><p>Test webcam gestures before adding them to a game.</p><p class="build-id">Version ${BUILD_VERSION}</p></div><nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-gesture-gameplay-calibrator" aria-label="Source code on GitHub">Source</a></nav><p class="generated-note">Built by Param Factory. Editorial artwork was generated for MoveMap with the factory image model.</p></footer>`;
}

function updateMetadata(title: string, description: string, path: string): void {
  document.title = title;
  const canonical = new URL(path, PUBLIC_ORIGIN).href;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonical);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonical);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description);
}

function demoBanner(): string {
  if (!demoMode) return '';
  return `<aside class="demo-banner" aria-label="Demo mode"><div><strong>Demo — sample data, nothing is saved</strong><span>Changes use a separate demo notebook.</span></div><div><button id="reset-demo" class="banner-button" type="button">Reset demo</button><a class="banner-link" href="/" id="leave-demo">Start for real</a></div></aside>`;
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const privacy = `<article class="legal-sheet"><p class="eyebrow">Plain-language policy · 5 September 2026</p><h1 tabindex="-1">Privacy and your MoveMap data</h1>
  <p class="lede">MoveMap is designed so your camera frames and gesture profiles stay on your device.</p>
  <h2>Camera and gesture data</h2><p>Camera access begins only after you press “Allow camera & begin.” Frames are processed in your browser to create small numeric edge signatures. Video and images are never uploaded by MoveMap. Your current profile is stored in this browser’s IndexedDB until you reset it or clear site data.</p>
  <h2>Exports</h2><p>When you export a profile, your browser downloads a JSON file containing checkpoint names, normalized numeric signatures, thresholds, and test results. It contains no photo or video. You control where that file goes.</p>
  <h2>Licensing</h2><p>If you buy or restore Maker Pack, a license token is stored in local storage and sent to Sociobot’s API only to verify the purchase. Checkout is handled by Sociobot/Dodo, the merchant of record. MoveMap does not receive card details.</p>
  <h2>Analytics and profile contents</h2><p>MoveMap does not set cookies or send analytics requests. Profiles contain checkpoint labels, settings, results, and numeric signatures.</p>
  <h2>Your controls</h2><p>Use “Reset notebook” to remove the local profile. Remove the site’s camera permission in browser settings. Clearing site data removes profiles and license state. Questions: <a class="touch-link" href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></article>`;
  const terms = `<article class="legal-sheet"><p class="eyebrow">Fair-use terms · 5 September 2026</p><h1 tabindex="-1">Terms of use</h1>
  <p class="lede">MoveMap is an experimental calibration tool. It helps you measure a setup; it does not guarantee that a gesture will be safe or reliable in every room.</p>
  <h2>Using MoveMap</h2><p>You may use and modify the app under its MIT license. Use a clear, stable area and stop if movement causes discomfort. Movement is optional. Choose a seated, subtle, or hand-only pose when needed. Do not use the tool for surveillance, biometric identity, safety-critical controls, or decisions about people.</p>
  <h2>Maker Pack purchase</h2><p>Maker Pack is a one-time $12 purchase for project convenience features. Core calibration, testing, accessibility, safety information, and JSON export remain free. Sociobot/Dodo is the merchant of record and handles payment and refunds. A refund revokes the associated license.</p>
  <h2>No warranty</h2><p>The software is provided “as is,” without warranty. Camera hardware, lighting, browser behavior, and backgrounds can change recognition results. Always test in the actual environment before mapping a gesture to an action.</p>
  <h2>Acceptable use</h2><p>Do not use MoveMap to harm people, bypass consent, infer identity, or violate applicable law. Questions: <a class="touch-link" href="mailto:support@sociobot.in">support@sociobot.in</a>.</p></article>`;
  return `${routeAnnouncer()}${header()}<main id="main" class="legal-main">${kind === 'privacy' ? privacy : terms}<a class="back-link" href="/">← Back to the workbench</a></main>${footer()}`;
}

function notFoundPage(): string {
  return `${routeAnnouncer()}${header()}<main id="main" class="not-found-main"><section class="not-found-sheet"><p class="eyebrow">Page not found · 404</p><h1 tabindex="-1">This page is not in MoveMap</h1><p>The address may be wrong, or the page may have moved.</p><a class="primary-button button-link" href="/">Open the workbench</a></section></main>${footer()}`;
}

function setupCard(): string {
  return `<section class="workbench setup-sheet" id="workbench" aria-labelledby="workbench-title">
    <div class="section-heading"><span class="scribble-number" aria-hidden="true">1</span><div><p class="eyebrow">Set up the experiment</p><h2 id="workbench-title">Name what you want to recognize</h2></div></div>
    <p class="measure">Choose one to three distinct poses. A checkpoint can be as small as a hand position or as broad as a full-body stance.</p>
    <form id="setup-form">
      <label for="profile-name">Experiment name</label><input id="profile-name" name="profileName" maxlength="48" value="${escapeHtml(profile?.name ?? 'My first move')}" aria-describedby="setup-error" required />
      <fieldset><legend>Pose checkpoints</legend><p class="field-note">Ten examples will be recorded for each one.</p>
        ${[0, 1, 2].map((index) => `<div class="checkpoint-field"><label for="checkpoint-${index}">Checkpoint ${index + 1}${index === 0 ? ' (required)' : ' (optional)'}</label><input id="checkpoint-${index}" name="checkpoint" maxlength="32" ${index === 0 ? 'aria-describedby="setup-error" required' : ''} value="${escapeHtml(profile?.checkpoints[index]?.name ?? (index === 0 ? 'Hands up' : ''))}" /></div>`).join('')}
      </fieldset>
      <div class="consent-note"><span class="privacy-dot" aria-hidden="true"></span><div><strong>Camera stays here.</strong><p>Frames are processed only in this tab. No video or photos are saved or sent anywhere.</p></div></div>
      <p class="movement-note"><strong>Move in your own way.</strong> Choose a seated, subtle, or hand-only pose when needed. Stop whenever you need to.</p>
      <div class="button-row"><button class="primary-button" type="submit">Allow camera & begin</button><button class="text-button" id="import-button" type="button">Import a profile</button><input id="import-file" type="file" accept="application/json,.json" hidden /></div>
      <p class="form-error" id="setup-error" role="alert">${escapeHtml(cameraMessage)}</p>
    </form>
    ${profile ? `<div class="button-row saved-actions"><button type="button" id="resume-button" class="secondary-button">${isCalibrationComplete(profile) ? 'Resume saved calibration' : 'Resume in-progress calibration'}</button><button type="button" id="reset-profile" class="text-button">Reset notebook</button></div>` : ''}
  </section>`;
}

function calibrationCard(): string {
  if (!profile) return '';
  const checkpoint = profile.checkpoints[captureIndex] ?? profile.checkpoints[0];
  const collected = checkpoint?.examples.length ?? 0;
  const ready = phase === 'ready' || phase === 'testing' || phase === 'results';
  return `<section class="workbench calibration-sheet" id="workbench" aria-labelledby="calibration-title">
    <div class="section-heading"><span class="scribble-number" aria-hidden="true">${ready ? '3' : '2'}</span><div><p class="eyebrow">${ready ? 'Reliability replay' : `Example ${Math.min(10, collected + 1)} of 10`}</p><h2 id="calibration-title">${ready ? `Test “${escapeHtml(profile.name)}”` : `Hold: ${escapeHtml(checkpoint?.name ?? '')}`}</h2></div></div>
    <div class="camera-grid">
      <div class="camera-frame">
        ${demoMode && ready ? `<div class="sample-preview" role="img" aria-label="Sample confidence trace from a completed living-room calibration"><span class="sample-person" aria-hidden="true"><i></i><b></b></span><div><strong>Completed sample</strong><p>Three poses · 30 examples · no camera opened</p></div></div>` : `<video id="camera" autoplay muted playsinline aria-label="Mirrored live camera preview"></video>
          <div class="frame-guide" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <div class="camera-badge"><span class="record-dot"></span> On-device camera</div>
          <div class="camera-empty" hidden>Camera preview unavailable</div>`}
      </div>
      <div class="capture-panel">
        ${ready ? testPanel() : `<p class="instruction">Match the pose naturally. Tiny differences between examples make the profile more useful.</p>
          <div class="sample-dots" aria-label="${collected} of 10 examples recorded">${Array.from({ length: 10 }, (_, index) => `<span class="sample-dot ${index < collected ? 'filled' : ''}">${index < collected ? '✓' : index + 1}</span>`).join('')}</div>
          <button id="capture-button" class="primary-button capture-button" type="button">Record example ${collected + 1}</button>
          <p class="keyboard-hint">Keyboard: press <kbd>Space</kbd> to record</p>
          <button id="restart-checkpoint" class="text-button" type="button" ${collected === 0 ? 'disabled' : ''}>Clear this checkpoint</button>`}
      </div>
    </div>
    <div class="checkpoint-tabs" aria-label="Calibration progress">${profile.checkpoints.map((item, index) => `<span class="checkpoint-tab ${index === captureIndex && !ready ? 'active' : ''} ${item.examples.length >= 10 ? 'done' : ''}"><span>${index + 1}</span>${escapeHtml(item.name)} <b>${Math.min(10, item.examples.length)}/10</b></span>`).join('')}</div>
  </section>`;
}

function testPanel(): string {
  if (!profile) return '';
  const testing = phase === 'testing';
  const seconds = testing ? Math.max(0, 30 - Math.floor((Date.now() - testStarted) / 1000)) : 30;
  const status = currentConfidence >= 0.72 ? 'Match' : currentConfidence >= 0.55 ? 'Near' : 'Clear';
  return `<div class="confidence-readout" aria-live="polite"><div><span class="confidence-value" id="confidence-value">${Math.round(currentConfidence * 100)}%</span><span class="confidence-label" id="confidence-label">${status}</span></div><div class="meter" role="meter" aria-label="Live confidence" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(currentConfidence * 100)}"><span id="meter-fill" style="width:${Math.round(currentConfidence * 100)}%"></span><i></i></div></div>
    <p class="instruction">Stay out of the pose, then move into it a few times. A trigger needs a confident 0.45-second hold.</p>
    <div class="test-stats"><div><b id="test-time">0:${String(seconds).padStart(2, '0')}</b><span>remaining</span></div><div><b id="trigger-count">${triggers}</b><span>triggers</span></div></div>
    <svg class="history-chart" id="history-chart" viewBox="0 0 320 92" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">Live confidence history</title><desc id="chart-desc">Confidence over the most recent readings. The dashed line is the trigger threshold.</desc><line x1="0" y1="26" x2="320" y2="26" class="threshold-line"/><polyline id="history-line" points=""/></svg>
    ${phase === 'ready' ? '<button id="start-test" class="primary-button" type="button">Start 30-second replay</button>' : ''}
    ${testing ? '<button id="false-trigger" class="danger-button" type="button">Mark a false trigger</button>' : ''}
    ${phase === 'results' ? resultsPanel() : ''}`;
}

function resultsPanel(): string {
  const result = profile?.lastTest;
  if (!result) return '';
  const passed = result.userReportedFalseTrigger === false;
  return `<div class="result-slip ${passed ? 'pass' : 'review'}" aria-live="polite"><span aria-hidden="true">${passed ? '✓' : '!'}</span><div><strong>${passed ? 'Clean replay' : 'Needs another look'}</strong><p>${result.triggers} trigger${result.triggers === 1 ? '' : 's'}, ${Math.round(result.peakConfidence * 100)}% peak confidence. ${passed ? 'No false trigger reported.' : 'A false trigger was reported.'}</p></div></div>
  <div class="button-row"><button id="replay-test" class="secondary-button" type="button">Replay 30 seconds</button><button id="export-profile" class="primary-button" type="button">Export JSON profile</button>${license.unlocked ? '<button id="export-helper" class="secondary-button" type="button">Export JS trigger helper</button>' : ''}</div>`;
}

function methodSection(): string {
  return `<section class="method-section" id="method" aria-labelledby="method-title"><div class="section-heading"><span class="scribble-number" aria-hidden="true">?</span><div><p class="eyebrow">How confidence works</p><h2 id="method-title">How MoveMap measures a pose</h2></div></div>
  <div class="method-grid"><article><span>01</span><h3>Record each pose</h3><p>Each example becomes a numeric signature in your saved and exported profile.</p></article><article><span>02</span><h3>Compare your examples</h3><p>MoveMap uses ten examples to set a threshold for each checkpoint.</p></article><article><span>03</span><h3>Test in your room</h3><p>The replay shows confidence. Change distance or light and mark any false trigger you observe.</p></article></div>
  <aside class="limitations" role="note"><strong>Test condition:</strong> Keep the camera and background fixed when comparing runs. Room changes can alter the score. Use the export as a room-specific reference, not a universal pose model.</aside></section>`;
}

function makerPackSection(): string {
  return `<section class="maker-pack" id="maker-pack" aria-labelledby="maker-title"><div><p class="eyebrow">Optional one-time purchase</p><h2 id="maker-title">Add a JavaScript trigger helper</h2><p>Maker Pack generates a JavaScript helper from your calibrated hold and release settings. Calibration, testing, safety information, and JSON export stay free.</p><div class="price"><strong>$12</strong><span>one-time purchase</span></div>${license.unlocked ? '<p class="active-license">✓ Maker Pack is active on this device.</p>' : `<a class="primary-button button-link" href="${checkoutUrl}">Buy Maker Pack</a>`}<p class="purchase-note">Sociobot/Dodo handles checkout and refunds. See <a class="touch-link" href="/privacy/">privacy</a> and <a class="touch-link" href="/terms/">terms</a>.</p></div>
  <div class="license-slip"><span class="clip" aria-hidden="true"></span><h3>Restore a purchase</h3><p>Paste the license token from your receipt. It stays in this browser.</p><form id="license-form"><label for="license-token">License token</label><input id="license-token" autocomplete="off" spellcheck="false" required /><button class="secondary-button" type="submit">Verify license</button></form><p id="license-status" class="license-status" aria-live="polite">${escapeHtml(license.message)}</p>${license.unlocked ? '<button id="remove-license" class="text-button" type="button">Remove from this device</button>' : ''}</div></section>`;
}

function landingHero(): string {
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow">Webcam gesture calibration</p><h1 tabindex="-1">Test webcam gestures before wiring your game</h1><p class="lede">For webcam game makers and players who need a gesture that works in their real room.</p><div class="hero-actions"><a class="primary-button button-link" href="/demo">Try it with sample data</a><a class="secondary-button button-link" href="#workbench">Set up my camera</a><span>See a finished profile, or record your own.</span></div><ul class="hero-facts"><li><strong>Private:</strong> camera frames stay on this device.</li><li><strong>Offline:</strong> works after the first visit.</li><li><strong>Price:</strong> calibration and JSON export are free.</li></ul></div><figure class="hero-art"><img src="${heroUrl}" width="1152" height="768" alt="An open graph-paper notebook with an abstract jointed paper figure and red checkpoint circles" fetchpriority="high" decoding="async" /><figcaption>Three steps for testing a webcam gesture</figcaption></figure></section>`;
}

function demoIntro(): string {
  return `<section class="demo-intro"><div><p class="eyebrow">Sample gesture profile</p><h1 tabindex="-1">Inspect a completed gesture calibration</h1><p class="lede">Review three sampled poses, a 30-second replay, and the exported profile before using your camera.</p></div><button class="secondary-button" id="demo-camera" type="button">Try my camera in this demo</button></section>`;
}

function homePage(): string {
  return `${routeAnnouncer()}${demoBanner()}${header()}<main id="main">
    ${demoMode ? demoIntro() : landingHero()}
    ${phase === 'idle' ? setupCard() : calibrationCard()}
    ${methodSection()}${makerPackSection()}
  </main>${footer()}<div class="status-toast" id="status-toast" role="status" hidden></div><div class="offline-ribbon" id="offline-ribbon" ${navigator.onLine ? 'hidden' : ''}>Offline — calibration still works</div>`;
}

function finishRouteRender(shouldFocusRoute: boolean): void {
  if (!shouldFocusRoute) return;
  requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLHeadingElement>('h1');
    if (!heading) return;
    heading.focus({ preventScroll: true });
    const announcer = document.querySelector<HTMLElement>('#route-status');
    if (announcer) announcer.textContent = `${heading.textContent?.trim() ?? 'Page'} loaded.`;
  });
}

function render(shouldFocusRoute = false): void {
  stopMonitoring();
  const route = location.pathname.replace(/\/$/, '');
  if (route === '/privacy' || route === '/terms') {
    const isPrivacy = route === '/privacy';
    updateMetadata(
      `${isPrivacy ? 'Privacy' : 'Terms'} — MoveMap`,
      isPrivacy ? 'How MoveMap handles camera frames, local profiles, exports, and license data.' : 'The terms for using MoveMap and buying the optional Maker Pack.',
      `${route}/`,
    );
    app.innerHTML = legalPage(route === '/privacy' ? 'privacy' : 'terms');
    bindShared();
    finishRouteRender(shouldFocusRoute);
    return;
  }
  if (route !== '' && route !== '/' && route !== '/demo') {
    updateMetadata('Page not found — MoveMap', 'The requested MoveMap page could not be found.', location.pathname);
    app.innerHTML = notFoundPage();
    bindShared();
    finishRouteRender(shouldFocusRoute);
    return;
  }
  updateMetadata(
    demoMode ? 'Demo — MoveMap' : 'MoveMap — test webcam gestures locally',
    demoMode ? 'Try a completed three-pose MoveMap calibration with isolated sample data.' : 'Test webcam gestures locally, replay them for false triggers, and export a profile for your game.',
    demoMode ? '/demo' : '/',
  );
  app.innerHTML = homePage();
  bindShared();
  bindHome();
  if (stream && phase !== 'idle') attachStream();
  if (phase === 'ready' || phase === 'testing' || phase === 'results') startMonitoring();
  finishRouteRender(shouldFocusRoute);
}

function bindShared(): void {
  const installButton = document.querySelector<HTMLButtonElement>('.install-button');
  if (installButton && installPrompt) {
    installButton.hidden = false;
    installButton.addEventListener('click', async () => {
      await installPrompt?.prompt();
      installPrompt = null;
      installButton.hidden = true;
    });
  }
}

function bindHome(): void {
  document.querySelector<HTMLButtonElement>('#reset-demo')?.addEventListener('click', resetDemo);
  document.querySelector<HTMLAnchorElement>('#leave-demo')?.addEventListener('click', async (event) => {
    event.preventDefault();
    await clearProfile(true);
    location.assign('/');
  });
  document.querySelector<HTMLButtonElement>('#demo-camera')?.addEventListener('click', async () => {
    await clearProfile(true);
    profile = null;
    phase = 'idle';
    currentConfidence = 0;
    cameraMessage = '';
    render();
    document.querySelector('#workbench')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.querySelector<HTMLFormElement>('#setup-form')?.addEventListener('submit', startSetup);
  document.querySelector<HTMLButtonElement>('#import-button')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#import-file')?.click());
  document.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', importProfile);
  document.querySelector<HTMLButtonElement>('#resume-button')?.addEventListener('click', async () => {
    if (!profile) return;
    try {
      await startCamera();
      captureIndex = profile.checkpoints.findIndex((checkpoint) => checkpoint.examples.length < 10);
      phase = captureIndex < 0 ? 'ready' : 'capture';
      if (captureIndex < 0) captureIndex = Math.max(0, profile.checkpoints.length - 1);
      cameraMessage = '';
      render();
    } catch (error) {
      cameraMessage = cameraErrorMessage(error);
      render();
      document.querySelector('#workbench')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
  document.querySelector<HTMLButtonElement>('#reset-profile')?.addEventListener('click', async () => {
    if (!confirm(`Delete “${profile?.name ?? 'this calibration'}” from this browser? Export it first if you want a copy.`)) return;
    await clearProfile(demoMode);
    profile = null;
    cameraMessage = 'The saved notebook was removed from this browser.';
    render();
  });
  document.querySelector<HTMLButtonElement>('#capture-button')?.addEventListener('click', captureExample);
  document.querySelector<HTMLButtonElement>('#restart-checkpoint')?.addEventListener('click', clearCurrentCheckpoint);
  document.querySelector<HTMLButtonElement>('#start-test')?.addEventListener('click', startTest);
  document.querySelector<HTMLButtonElement>('#replay-test')?.addEventListener('click', startTest);
  document.querySelector<HTMLButtonElement>('#false-trigger')?.addEventListener('click', () => {
    falseTrigger = true;
    toast('False trigger marked. Keep testing; it will appear in the result.');
  });
  document.querySelector<HTMLButtonElement>('#export-profile')?.addEventListener('click', exportProfile);
  document.querySelector<HTMLButtonElement>('#export-helper')?.addEventListener('click', exportHelper);
  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', restoreLicense);
  document.querySelector<HTMLButtonElement>('#remove-license')?.addEventListener('click', () => {
    removeLicense();
    license = { unlocked: false, checking: false, message: 'License removed from this device' };
    render();
  });
}

async function resetDemo(): Promise<void> {
  if (!demoMode) return;
  await clearProfile(true);
  profile = makeDemoProfile();
  await saveProfile(profile, true);
  phase = 'results';
  currentConfidence = profile.lastTest?.peakConfidence ?? 0;
  cameraMessage = '';
  render();
  document.querySelector('#workbench')?.scrollIntoView({ behavior: 'smooth' });
  toast('The sample calibration was restored.');
}

function showSetupError(input: HTMLInputElement | null, message: string): void {
  const error = document.querySelector<HTMLElement>('#setup-error');
  if (error) error.textContent = message;
  input?.setAttribute('aria-invalid', 'true');
  input?.focus();
}

async function startSetup(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const formElement = event.currentTarget as HTMLFormElement;
  const form = new FormData(formElement);
  const names = form.getAll('checkpoint').map(String).map((value) => value.trim()).filter(Boolean).slice(0, 3);
  const name = String(form.get('profileName') ?? '').trim();
  formElement.querySelectorAll('[aria-invalid="true"]').forEach((input) => input.removeAttribute('aria-invalid'));
  if (!name) {
    showSetupError(formElement.querySelector<HTMLInputElement>('#profile-name'), 'Enter an experiment name, not only spaces.');
    return;
  }
  if (!names.length) {
    showSetupError(formElement.querySelector<HTMLInputElement>('#checkpoint-0'), 'Enter a checkpoint name, not only spaces.');
    return;
  }
  profile = makeProfile(name, names);
  captureIndex = 0;
  cameraMessage = '';
  await persistProfile();
  try {
    await startCamera();
    phase = 'capture';
    render();
  } catch (error) {
    cameraMessage = cameraErrorMessage(error);
    render();
    document.querySelector('#workbench')?.scrollIntoView({ behavior: 'smooth' });
  }
}

async function startCamera(): Promise<void> {
  if (stream?.active) return;
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } }, audio: false });
}

function cameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'NotAllowedError') return 'Camera permission was declined. Allow camera access in your browser settings, then try again.';
  if (error instanceof DOMException && error.name === 'NotFoundError') return 'No camera was found. Connect one, or import an existing profile.';
  return 'This browser could not start the camera. Check that another app is not using it, then try again.';
}

function attachStream(): void {
  const video = document.querySelector<HTMLVideoElement>('#camera');
  if (!video || !stream) return;
  video.srcObject = stream;
  video.play().catch(() => undefined);
}

function currentSignature(): Signature | null {
  const video = document.querySelector<HTMLVideoElement>('#camera');
  if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;
  return extractSignature(video, processingCanvas);
}

async function captureExample(): Promise<void> {
  if (!profile) return;
  const signature = currentSignature();
  if (!signature) {
    toast('The camera is still warming up. Hold the pose and try again.');
    return;
  }
  const checkpoint = profile.checkpoints[captureIndex];
  if (!checkpoint) return;
  checkpoint.examples.push(signature);
  if (checkpoint.examples.length >= 10) {
    profile.checkpoints[captureIndex] = finishCheckpoint(checkpoint);
    if (captureIndex < profile.checkpoints.length - 1) {
      captureIndex += 1;
      toast(`Checkpoint saved. Next: ${profile.checkpoints[captureIndex]?.name ?? ''}`);
    } else {
      phase = 'ready';
      toast('Calibration saved on this device. Ready for replay.');
    }
  }
  await persistProfile();
  render();
}

async function clearCurrentCheckpoint(): Promise<void> {
  if (!profile) return;
  const checkpoint = profile.checkpoints[captureIndex];
  if (!checkpoint) return;
  checkpoint.examples = [];
  delete checkpoint.centroid;
  delete checkpoint.threshold;
  await persistProfile();
  toast(`Cleared examples for ${checkpoint.name}.`);
  render();
}

function startMonitoring(): void {
  stopMonitoring();
  monitorTimer = window.setInterval(() => {
    if (!profile) return;
    const signature = currentSignature();
    if (!signature) return;
    const result = classify(signature, profile.checkpoints);
    currentConfidence = result.best?.confidence ?? 0;
    peakConfidence = Math.max(peakConfidence, currentConfidence);
    const now = Date.now();
    if (phase === 'testing') {
      if (result.passes) {
        if (!holdStarted) holdStarted = now;
        if (!activeTrigger && now - holdStarted >= profile.settings.holdMs) {
          activeTrigger = true;
          triggers += 1;
        }
      } else if (currentConfidence < profile.settings.releaseThreshold) {
        activeTrigger = false;
        holdStarted = 0;
      }
    }
    historyPoints.push({ time: now, confidence: currentConfidence, label: result.best?.checkpoint.name ?? 'No match', triggered: activeTrigger });
    historyPoints = historyPoints.slice(-60);
    updateLiveUi(result.best?.checkpoint.name ?? 'No match');
  }, 180);
}

function stopMonitoring(): void {
  if (monitorTimer) window.clearInterval(monitorTimer);
  monitorTimer = undefined;
}

function updateLiveUi(label: string): void {
  const percentage = Math.round(currentConfidence * 100);
  const value = document.querySelector('#confidence-value');
  const state = document.querySelector('#confidence-label');
  const meter = document.querySelector<HTMLElement>('#meter-fill');
  const meterRoot = document.querySelector<HTMLElement>('[role="meter"]');
  const count = document.querySelector('#trigger-count');
  if (value) value.textContent = `${percentage}%`;
  if (state) state.textContent = currentConfidence >= 0.72 ? `Match · ${label}` : currentConfidence >= 0.55 ? `Near · ${label}` : 'Clear';
  if (meter) meter.style.width = `${percentage}%`;
  meterRoot?.setAttribute('aria-valuenow', String(percentage));
  if (count) count.textContent = String(triggers);
  const line = document.querySelector<SVGPolylineElement>('#history-line');
  if (line && historyPoints.length > 1) {
    const points = historyPoints.map((point, index) => `${Math.round(index * (320 / 59))},${Math.round(88 - point.confidence * 84)}`).join(' ');
    line.setAttribute('points', points);
  }
}

function startTest(): void {
  phase = 'testing';
  historyPoints = [];
  triggers = 0;
  falseTrigger = false;
  peakConfidence = 0;
  currentConfidence = 0;
  activeTrigger = false;
  holdStarted = 0;
  testStarted = Date.now();
  render();
  if (testTimer) window.clearInterval(testTimer);
  testTimer = window.setInterval(() => {
    const remaining = Math.max(0, 30 - Math.floor((Date.now() - testStarted) / 1000));
    const timer = document.querySelector('#test-time');
    if (timer) timer.textContent = `0:${String(remaining).padStart(2, '0')}`;
    if (remaining <= 0) finishTest();
  }, 250);
}

async function finishTest(): Promise<void> {
  if (!profile || phase !== 'testing') return;
  if (testTimer) window.clearInterval(testTimer);
  testTimer = undefined;
  const summary: TestSummary = { startedAt: new Date(testStarted).toISOString(), durationSeconds: 30, triggers, userReportedFalseTrigger: falseTrigger, peakConfidence };
  profile.lastTest = summary;
  profile.updatedAt = new Date().toISOString();
  await saveProfile(profile, demoMode);
  phase = 'results';
  render();
}

function exportProfile(): void {
  if (!profile) return;
  const payload = { ...profile, exportedAt: new Date().toISOString(), privacy: 'No images or video are included.' };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${profile.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'movemap'}-profile.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  toast('JSON profile exported. It contains numbers and labels, never images.');
}

function exportHelper(): void {
  if (!profile || !license.unlocked) return;
  const source = `// MoveMap trigger helper for ${profile.name}\n// Feed this helper the confidence (0–1) reported by your own runtime pose comparison.\nexport function createMoveMapTrigger({ holdMs = ${profile.settings.holdMs}, releaseAt = ${profile.settings.releaseThreshold} } = {}) {\n  let began = 0;\n  let active = false;\n  return function update(confidence, now = performance.now()) {\n    if (confidence >= 0.72) {\n      began ||= now;\n      if (!active && now - began >= holdMs) { active = true; return { triggered: true, active }; }\n    } else if (confidence < releaseAt) { active = false; began = 0; }\n    return { triggered: false, active };\n  };\n}\n`;
  const blob = new Blob([source], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'movemap-trigger.js';
  anchor.click();
  URL.revokeObjectURL(url);
  toast('JavaScript trigger helper exported.');
}

async function importProfile(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const candidate: unknown = JSON.parse(await file.text());
    if (!isValidProfile(candidate)) throw new Error('invalid');
    profile = candidate;
    await saveProfile(profile, demoMode);
    cameraMessage = 'Profile imported. Start the camera to replay it.';
    phase = 'idle';
    render();
  } catch {
    cameraMessage = 'That file is not a valid MoveMap v1 profile. Choose an exported .json file.';
    render();
  }
}

async function restoreLicense(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const input = document.querySelector<HTMLInputElement>('#license-token');
  if (!input?.value.trim()) return;
  storeLicense(input.value);
  license = { unlocked: false, checking: true, message: 'Checking license…' };
  const status = document.querySelector('#license-status');
  if (status) status.textContent = license.message;
  license = await verifyLicense();
  render();
  document.querySelector('#maker-pack')?.scrollIntoView();
}

function toast(message: string): void {
  requestAnimationFrame(() => {
    const toastElement = document.querySelector<HTMLElement>('#status-toast');
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.hidden = false;
    window.setTimeout(() => { toastElement.hidden = true; }, 4200);
  });
}

function updateOnlineState(): void {
  const ribbon = document.querySelector<HTMLElement>('#offline-ribbon');
  if (ribbon) ribbon.hidden = navigator.onLine;
}

window.addEventListener('online', updateOnlineState);
window.addEventListener('offline', updateOnlineState);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) finishRouteRender(true);
});
window.addEventListener('popstate', () => finishRouteRender(true));
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event as BeforeInstallPromptEvent;
  const button = document.querySelector<HTMLButtonElement>('.install-button');
  if (button) button.hidden = false;
});
window.addEventListener('keydown', (event) => {
  const target = event.target;
  const isInteractive = target instanceof Element && Boolean(target.closest('button, a, input, select, textarea, summary, [contenteditable="true"]'));
  if (event.code === 'Space' && phase === 'capture' && !isInteractive) {
    event.preventDefault();
    captureExample();
  }
});

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) toast('A fresh notebook is ready. Reload to update.');
    });
  });
}

async function boot(): Promise<void> {
  if (location.pathname === '/' || location.pathname === '' || demoMode) {
    try {
      const savedProfile = await loadProfile(demoMode);
      if (savedProfile && !isValidStoredProfile(savedProfile)) {
        await clearProfile(demoMode);
        cameraMessage = 'An incomplete saved profile was removed. Import a valid export or start a new calibration.';
      } else {
        profile = savedProfile;
      }
      if (demoMode && !profile) {
        profile = makeDemoProfile();
        await saveProfile(profile, true);
      }
      if (demoMode && profile && isCalibrationComplete(profile)) {
        phase = 'results';
        currentConfidence = profile.lastTest?.peakConfidence ?? 0;
      }
    } catch { cameraMessage = 'Local saving is unavailable in this browser. You can still export your profile.'; }
  }
  render();
  license = await verifyLicense();
  const route = location.pathname.replace(/\/$/, '') || '/';
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  render(route !== '/' || navigation?.type === 'back_forward');
  registerServiceWorker().catch(() => undefined);
}

void boot();
