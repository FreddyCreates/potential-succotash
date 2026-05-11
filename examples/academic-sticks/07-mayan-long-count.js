#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ACADEMIC EXAMPLE 07: ANCIENT CALENDAR TIMERS - MAYAN LONG COUNT FOCUS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MATHEMATICAL FOUNDATION:
 * ─────────────────────────
 * Ancient civilizations developed sophisticated calendar systems based on
 * astronomical observations. Each system encodes different temporal cycles
 * and can be mapped to phi-modulated computational rhythms.
 * 
 * MAYAN CALENDAR SYSTEM:
 * ──────────────────────
 * The Maya developed three interlocking calendar systems:
 * 
 *   1. TZOLKIN (260-day Sacred Calendar)
 *      - 13 day-numbers × 20 day-names = 260 days
 *      - Day-names: Imix, Ik, Akbal, Kan, Chicchan, Cimi, Manik, Lamat,
 *                   Muluc, Oc, Chuen, Eb, Ben, Ix, Men, Cib, Caban,
 *                   Etznab, Cauac, Ahau
 *   
 *   2. HAAB (365-day Civil Calendar)
 *      - 18 months × 20 days + 5 Wayeb days = 365 days
 *      - Months: Pop, Wo, Sip, Sotz, Sek, Xul, Yaxkin, Mol, Chen, Yax,
 *                Sak, Keh, Mak, Kankin, Muwan, Pax, Kayab, Kumku + Wayeb
 *   
 *   3. LONG COUNT (Linear Count from Creation Date)
 *      - Units: kin (1 day), winal (20 kin), tun (360 kin),
 *               katun (7,200 kin), baktun (144,000 kin)
 *      - Format: baktun.katun.tun.winal.kin (e.g., 13.0.10.5.12)
 *      - Creation date: August 11, 3114 BCE (Julian)
 * 
 * CALENDAR ROUND:
 * ───────────────
 * Tzolkin × Haab = 52-year cycle (18,980 days)
 * Every 52 years, both calendars realign.
 * 
 * PHI INTEGRATION:
 * ────────────────
 * We modulate each calendar output with a phi-phase:
 *   phiPhase = (dayCount × φ) % 1
 * 
 * This creates a mathematical bridge between ancient temporal wisdom
 * and the golden ratio's universal patterns.
 * 
 * COMPUTATIONAL APPLICATION:
 * ──────────────────────────
 * In the Organism AI system, agents can run on any calendar system:
 *   - Tzolkin for sacred/ritual timing
 *   - Long Count for long-term scheduling
 *   - Combined with Vedic, Egyptian, Chinese calendars
 * 
 * This provides rich temporal metadata that can influence AI behavior
 * based on cyclical patterns humans have observed for millennia.
 * 
 * @module examples/academic-sticks/07-ancient-calendars
 * @author Organism AI Research Division
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// ═══════════════════════════════════════════════════════════════════════════════
// MAYAN CALENDAR CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const TZOLKIN = {
  days: 260,
  numbers: 13,
  dayNames: [
    'Imix', 'Ik', 'Akbal', 'Kan', 'Chicchan', 'Cimi', 'Manik', 'Lamat',
    'Muluc', 'Oc', 'Chuen', 'Eb', 'Ben', 'Ix', 'Men', 'Cib', 'Caban',
    'Etznab', 'Cauac', 'Ahau'
  ],
  meanings: {
    'Imix': 'Crocodile (Earth Monster)',
    'Ik': 'Wind (Breath, Spirit)',
    'Akbal': 'Night (Darkness, House)',
    'Kan': 'Seed (Corn, Lizard)',
    'Chicchan': 'Serpent (Sky Serpent)',
    'Cimi': 'Death (Transformation)',
    'Manik': 'Deer (Hand, Grasp)',
    'Lamat': 'Star (Venus, Rabbit)',
    'Muluc': 'Water (Moon, Jade)',
    'Oc': 'Dog (Loyalty, Guide)',
    'Chuen': 'Monkey (Artisan)',
    'Eb': 'Grass (Road, Tooth)',
    'Ben': 'Reed (Corn Stalk)',
    'Ix': 'Jaguar (Earth Lord)',
    'Men': 'Eagle (Wise One)',
    'Cib': 'Owl (Vulture, Wax)',
    'Caban': 'Earth (Earthquake)',
    'Etznab': 'Flint (Mirror, Knife)',
    'Cauac': 'Storm (Rain)',
    'Ahau': 'Sun Lord (Flower)'
  }
};

const HAAB = {
  days: 365,
  months: [
    'Pop', 'Wo', 'Sip', 'Sotz', 'Sek', 'Xul', 'Yaxkin', 'Mol',
    'Chen', 'Yax', 'Sak', 'Keh', 'Mak', 'Kankin', 'Muwan', 'Pax',
    'Kayab', 'Kumku', 'Wayeb'
  ],
  monthDays: 20,  // Except Wayeb which has 5
  wayebDays: 5
};

const LONG_COUNT = {
  units: {
    kin: 1,
    winal: 20,
    tun: 360,
    katun: 7200,
    baktun: 144000
  },
  // August 11, 3114 BCE in Julian Day Number
  // This is the Maya "creation date" (correlation: GMT constant 584283)
  creationJD: 584283,
  cycleLength: 13 * 144000,  // 13 baktuns = 1 great cycle
};

// ═══════════════════════════════════════════════════════════════════════════════
// TZOLKIN TIMER
// ═══════════════════════════════════════════════════════════════════════════════

class TzolkinTimer {
  constructor(options = {}) {
    this.baseMs = options.baseMs || HEARTBEAT;
    this.dayCount = options.startDay || 0;
    this.callbacks = [];
  }

  /**
   * Get current Tzolkin date
   */
  getDate() {
    const position = this.dayCount % TZOLKIN.days;
    const dayNumber = (position % TZOLKIN.numbers) + 1;
    const dayName = TZOLKIN.dayNames[position % 20];
    
    return {
      calendar: 'tzolkin',
      dayCount: this.dayCount,
      position,
      dayNumber,       // 1-13
      dayName,         // One of 20 day names
      meaning: TZOLKIN.meanings[dayName],
      fullDate: `${dayNumber} ${dayName}`,
      phiPhase: (position * PHI) % 1,
      timestamp: Date.now()
    };
  }

  /**
   * Advance to next day
   */
  advance() {
    this.dayCount++;
    const date = this.getDate();
    this.callbacks.forEach(cb => cb(date));
    return date;
  }

  /**
   * Start timer with specified interval
   */
  start(callback, intervalMs = null) {
    if (callback) this.callbacks.push(callback);
    const interval = intervalMs || (this.baseMs * TZOLKIN.days * PHI_INV);
    
    this.timer = setInterval(() => {
      this.advance();
    }, interval);
    
    return this.timer;
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HAAB TIMER
// ═══════════════════════════════════════════════════════════════════════════════

class HaabTimer {
  constructor(options = {}) {
    this.baseMs = options.baseMs || HEARTBEAT;
    this.dayOfYear = options.startDay || 0;
    this.callbacks = [];
  }

  /**
   * Get current Haab date
   */
  getDate() {
    const day = this.dayOfYear % HAAB.days;
    
    let month, dayOfMonth;
    if (day >= 360) {
      // Wayeb (5 unlucky days at end of year)
      month = 'Wayeb';
      dayOfMonth = day - 360;
    } else {
      const monthIndex = Math.floor(day / 20);
      month = HAAB.months[monthIndex];
      dayOfMonth = day % 20;
    }
    
    return {
      calendar: 'haab',
      dayOfYear: day,
      month,
      dayOfMonth,
      fullDate: `${dayOfMonth} ${month}`,
      isWayeb: day >= 360,
      seasonIndex: Math.floor(day / (365 / 3)),  // Roughly 3 seasons
      phiPhase: (day * PHI / HAAB.days) % 1,
      timestamp: Date.now()
    };
  }

  advance() {
    this.dayOfYear++;
    const date = this.getDate();
    this.callbacks.forEach(cb => cb(date));
    return date;
  }

  start(callback, intervalMs = null) {
    if (callback) this.callbacks.push(callback);
    const interval = intervalMs || (this.baseMs * HAAB.days * PHI_INV);
    
    this.timer = setInterval(() => {
      this.advance();
    }, interval);
    
    return this.timer;
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LONG COUNT TIMER (The most interesting one!)
// ═══════════════════════════════════════════════════════════════════════════════

class LongCountTimer {
  constructor(options = {}) {
    this.baseMs = options.baseMs || HEARTBEAT;
    
    // Initialize Long Count position
    this.baktun = options.baktun || 13;
    this.katun = options.katun || 0;
    this.tun = options.tun || 0;
    this.winal = options.winal || 0;
    this.kin = options.kin || 0;
    
    this.callbacks = [];
  }

  /**
   * Get total kin (days) from creation
   */
  getTotalKin() {
    return (
      this.baktun * LONG_COUNT.units.baktun +
      this.katun * LONG_COUNT.units.katun +
      this.tun * LONG_COUNT.units.tun +
      this.winal * LONG_COUNT.units.winal +
      this.kin
    );
  }

  /**
   * Get Long Count date representation
   */
  getDate() {
    const totalKin = this.getTotalKin();
    
    // Calculate progress through current Great Cycle
    const cycleProgress = (totalKin % LONG_COUNT.cycleLength) / LONG_COUNT.cycleLength;
    
    // Determine era
    const era = this.baktun >= 13 ? 'Post-Classical' : 'Classical';
    
    return {
      calendar: 'long-count',
      baktun: this.baktun,
      katun: this.katun,
      tun: this.tun,
      winal: this.winal,
      kin: this.kin,
      longCount: `${this.baktun}.${this.katun}.${this.tun}.${this.winal}.${this.kin}`,
      totalKin,
      era,
      greatCycleProgress: cycleProgress,
      yearsFromCreation: Math.floor(totalKin / 365.25),
      phiPhase: ((this.kin + this.winal * PHI + this.tun * PHI * PHI) % 1),
      timestamp: Date.now()
    };
  }

  /**
   * Advance by one kin (day)
   */
  advance() {
    this.kin++;
    
    // Carry over system
    if (this.kin >= 20) {
      this.kin = 0;
      this.winal++;
    }
    if (this.winal >= 18) {
      this.winal = 0;
      this.tun++;
    }
    if (this.tun >= 20) {
      this.tun = 0;
      this.katun++;
    }
    if (this.katun >= 20) {
      this.katun = 0;
      this.baktun++;
    }
    
    const date = this.getDate();
    this.callbacks.forEach(cb => cb(date));
    return date;
  }

  /**
   * Set to specific Long Count date
   */
  setDate(baktun, katun, tun, winal, kin) {
    this.baktun = baktun;
    this.katun = katun;
    this.tun = tun;
    this.winal = winal;
    this.kin = kin;
  }

  /**
   * Convert Gregorian date to Long Count (approximate)
   */
  static fromGregorian(year, month, day) {
    // Julian Day Number calculation
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
               Math.floor(y / 4) - Math.floor(y / 100) + 
               Math.floor(y / 400) - 32045;
    
    // Days since creation
    const daysSinceCreation = jd - LONG_COUNT.creationJD;
    
    // Convert to Long Count units
    let remaining = daysSinceCreation;
    const baktun = Math.floor(remaining / LONG_COUNT.units.baktun);
    remaining %= LONG_COUNT.units.baktun;
    const katun = Math.floor(remaining / LONG_COUNT.units.katun);
    remaining %= LONG_COUNT.units.katun;
    const tun = Math.floor(remaining / LONG_COUNT.units.tun);
    remaining %= LONG_COUNT.units.tun;
    const winal = Math.floor(remaining / LONG_COUNT.units.winal);
    const kin = remaining % LONG_COUNT.units.winal;
    
    return { baktun, katun, tun, winal, kin };
  }

  start(callback, intervalMs = null) {
    if (callback) this.callbacks.push(callback);
    const interval = intervalMs || (this.baseMs * PHI * 20);
    
    this.timer = setInterval(() => {
      this.advance();
    }, interval);
    
    return this.timer;
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR ROUND (Tzolkin + Haab Combination)
// ═══════════════════════════════════════════════════════════════════════════════

class CalendarRound {
  constructor() {
    this.tzolkin = new TzolkinTimer();
    this.haab = new HaabTimer();
    this.dayCount = 0;
  }

  getDate() {
    const tz = this.tzolkin.getDate();
    const hb = this.haab.getDate();
    
    // Calculate position in 52-year cycle
    const calendarRoundPosition = this.dayCount % 18980;
    const calendarRoundProgress = calendarRoundPosition / 18980;
    
    return {
      calendar: 'calendar-round',
      tzolkin: tz,
      haab: hb,
      fullDate: `${tz.fullDate} ${hb.fullDate}`,
      calendarRoundDay: calendarRoundPosition,
      calendarRoundProgress,
      yearsInCycle: Math.floor(calendarRoundPosition / 365),
      isNewCycle: calendarRoundPosition === 0,
      phiPhase: (this.dayCount * PHI) % 1,
      timestamp: Date.now()
    };
  }

  advance() {
    this.dayCount++;
    this.tzolkin.advance();
    this.haab.advance();
    return this.getDate();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMONSTRATION
// ═══════════════════════════════════════════════════════════════════════════════

function demonstrate() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║  ANCIENT CALENDAR TIMERS - MAYAN LONG COUNT                               ║');
  console.log('║  ─────────────────────────────────────────────────────────────────────────║');
  console.log('║  "Time is not a line but a cycle, and within cycles, golden spirals"     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Tzolkin demonstration
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('TZOLKIN (260-day Sacred Calendar):');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   13 day-numbers × 20 day-names = 260 unique days');
  console.log('');
  
  const tzolkin = new TzolkinTimer({ startDay: 0 });
  console.log('   Sample Tzolkin dates:');
  for (let i = 0; i < 10; i++) {
    const date = tzolkin.getDate();
    console.log(`     Day ${String(i).padStart(3)}: ${date.fullDate.padEnd(12)} - ${date.meaning}`);
    tzolkin.advance();
  }
  
  console.log('\n   Day names (20 nawales):');
  TZOLKIN.dayNames.forEach((name, i) => {
    if (i % 5 === 0) process.stdout.write('     ');
    process.stdout.write(name.padEnd(10));
    if ((i + 1) % 5 === 0) console.log('');
  });
  
  // Haab demonstration
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('HAAB (365-day Civil Calendar):');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   18 months × 20 days + 5 Wayeb days = 365 days');
  console.log('');
  
  const haab = new HaabTimer({ startDay: 0 });
  console.log('   Sample Haab dates:');
  for (let i = 0; i < 5; i++) {
    const date = haab.getDate();
    console.log(`     Day ${String(i * 30).padStart(3)}: ${date.fullDate.padEnd(12)} ${date.isWayeb ? '(Unlucky!)' : ''}`);
    for (let j = 0; j < 30 && i < 4; j++) haab.advance();
  }
  
  console.log('\n   Months:');
  HAAB.months.forEach((name, i) => {
    if (i % 6 === 0) process.stdout.write('     ');
    process.stdout.write(name.padEnd(10));
    if ((i + 1) % 6 === 0) console.log('');
  });
  
  // Long Count demonstration
  console.log('\n\n═══════════════════════════════════════════════════════════════════════════');
  console.log('MAYAN LONG COUNT (Linear Time from Creation):');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   Format: baktun.katun.tun.winal.kin');
  console.log('');
  console.log('   Units:');
  console.log('     1 kin    = 1 day');
  console.log('     1 winal  = 20 kin (20 days)');
  console.log('     1 tun    = 18 winal = 360 days (~1 year)');
  console.log('     1 katun  = 20 tun = 7,200 days (~20 years)');
  console.log('     1 baktun = 20 katun = 144,000 days (~394 years)');
  console.log('');
  
  // Calculate today's Long Count
  const today = new Date();
  const todayLC = LongCountTimer.fromGregorian(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );
  
  const longCount = new LongCountTimer(todayLC);
  const todayDate = longCount.getDate();
  
  console.log(`   Today's Long Count: ${todayDate.longCount}`);
  console.log(`   Total kin since creation: ${todayDate.totalKin.toLocaleString()} days`);
  console.log(`   Years from creation: ~${todayDate.yearsFromCreation.toLocaleString()} years`);
  console.log(`   Era: ${todayDate.era}`);
  console.log(`   Great Cycle progress: ${(todayDate.greatCycleProgress * 100).toFixed(2)}%`);
  console.log(`   Phi-phase: ${todayDate.phiPhase.toFixed(6)}`);
  
  // Historical dates
  console.log('\n   Historical Long Count dates:');
  const historicalDates = [
    { name: 'Creation (4 Ahau 8 Kumku)', year: -3114, month: 8, day: 11 },
    { name: 'End of 13th Baktun', year: 2012, month: 12, day: 21 },
    { name: 'Declaration of Independence', year: 1776, month: 7, day: 4 },
    { name: 'Moon Landing', year: 1969, month: 7, day: 20 },
    { name: 'Fall of Rome', year: 476, month: 9, day: 4 },
  ];
  
  historicalDates.forEach(h => {
    if (h.year > -3114) {
      const lc = LongCountTimer.fromGregorian(h.year, h.month, h.day);
      console.log(`     ${h.name}: ${lc.baktun}.${lc.katun}.${lc.tun}.${lc.winal}.${lc.kin}`);
    } else {
      console.log(`     ${h.name}: 0.0.0.0.0`);
    }
  });
  
  // Long Count progression
  console.log('\n   Long Count advancement (simulation):');
  const lcSim = new LongCountTimer({ baktun: 13, katun: 0, tun: 10, winal: 0, kin: 0 });
  console.log(`     Start: ${lcSim.getDate().longCount}`);
  for (let i = 0; i < 25; i++) lcSim.advance();
  console.log(`     +25 kin: ${lcSim.getDate().longCount}`);
  for (let i = 0; i < 335; i++) lcSim.advance();
  console.log(`     +1 tun: ${lcSim.getDate().longCount}`);
  
  // Calendar Round
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('CALENDAR ROUND (Tzolkin + Haab):');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   260 × 365 / GCD(260,365) = 18,980 days = 52 years');
  console.log('   Every 52 years, both calendars realign.');
  console.log('');
  
  const cr = new CalendarRound();
  console.log('   Sample Calendar Round dates:');
  for (let i = 0; i < 5; i++) {
    const date = cr.getDate();
    console.log(`     ${date.fullDate}`);
    cr.advance();
  }
  
  // Phi integration
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('PHI INTEGRATION:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   Each calendar date carries a phi-phase:');
  console.log(`     phiPhase = (dayCount × φ) mod 1`);
  console.log('');
  console.log('   This creates a phi-modulated rhythm that bridges ancient');
  console.log('   temporal cycles with the golden ratio\'s natural patterns.');
  console.log('');
  console.log('   Example phi-phases for first 10 Tzolkin days:');
  
  const tzDemo = new TzolkinTimer();
  console.log('     Day | Tzolkin Date  | Phi-Phase');
  console.log('     ──────────────────────────────────');
  for (let i = 0; i < 10; i++) {
    const date = tzDemo.getDate();
    console.log(`     ${String(i).padStart(3)} | ${date.fullDate.padEnd(12)} | ${date.phiPhase.toFixed(6)}`);
    tzDemo.advance();
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('APPLICATION IN AI SYSTEMS:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   By running AI agents on ancient calendar rhythms, we provide:');
  console.log('');
  console.log('   • CYCLICAL AWARENESS: Agents understand time as cycles, not just linear');
  console.log('   • TEMPORAL DIVERSITY: Different calendars for different task types');
  console.log('   • PHI RESONANCE: All cycles modulated by golden ratio');
  console.log('   • CULTURAL DEPTH: 5000+ years of human astronomical observation');
  console.log('');
  console.log('   Example: Research agents on Tzolkin (sacred), governance on Haab (civil),');
  console.log('            long-term memory on Long Count (linear history)');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

// Run if executed directly
demonstrate();

export {
  TzolkinTimer,
  HaabTimer,
  LongCountTimer,
  CalendarRound,
  TZOLKIN,
  HAAB,
  LONG_COUNT,
};
