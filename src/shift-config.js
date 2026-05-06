/**
 * ═══════════════════════════════════════════
 *  SHIFT SCHEDULE CONFIG
 *  Konfigurasi jadwal shift yang otomatis menyesuaikan
 *  berdasarkan hari (Sabtu vs Senin-Jumat)
 * ═══════════════════════════════════════════
 */
const ShiftConfig = (() => {

  // Senin - Jumat: 4 group per shift, 7 jam kerja efektif
  const WEEKDAY_SLOTS = {
    SH1: [
      { id: 1, label: '07:30 - 08:30', startMins: 450, endMins: 510 },
      { id: 2, label: '09:00 - 10:00', startMins: 540, endMins: 600 },
      { id: 3, label: '10:30 - 11:30', startMins: 630, endMins: 690 },
      { id: 4, label: '13:00 - 14:00', startMins: 780, endMins: 840 },
    ],
    SH2: [
      { id: 1, label: '15:30 - 16:30', startMins: 930, endMins: 990 },
      { id: 2, label: '17:00 - 17:30', startMins: 1020, endMins: 1050 },
      { id: 3, label: '19:30 - 20:30', startMins: 1170, endMins: 1230 },
      { id: 4, label: '21:00 - 22:00', startMins: 1260, endMins: 1320 },
    ],
    SH3: [
      { id: 1, label: '23:30 - 00:30', startMins: 1410, endMins: 30 },
      { id: 2, label: '01:00 - 02:00', startMins: 60, endMins: 120 },
      { id: 3, label: '03:30 - 04:30', startMins: 210, endMins: 270 },
      { id: 4, label: '05:00 - 06:00', startMins: 300, endMins: 360 },
    ],
  };

  // Sabtu: 3 group per shift, 5 jam kerja efektif
  const SATURDAY_SLOTS = {
    SH1: [
      { id: 1, label: '07:30 - 08:30', startMins: 450, endMins: 510 },
      { id: 2, label: '09:00 - 10:00', startMins: 540, endMins: 600 },
      { id: 3, label: '10:30 - 11:30', startMins: 630, endMins: 690 },
    ],
    SH2: [
      { id: 1, label: '12:30 - 13:30', startMins: 750, endMins: 810 },
      { id: 2, label: '14:00 - 15:00', startMins: 840, endMins: 900 },
      { id: 3, label: '15:30 - 16:30', startMins: 930, endMins: 990 },
    ],
    SH3: [
      { id: 1, label: '17:30 - 18:00', startMins: 1050, endMins: 1080 },
      { id: 2, label: '19:30 - 20:30', startMins: 1170, endMins: 1230 },
      { id: 3, label: '21:00 - 22:30', startMins: 1260, endMins: 1350 },
    ],
  };

  // Jam shift (range jam per shift)
  const WEEKDAY_SHIFT_RANGES = {
    SH1: { start: 420, end: 900 },   // 07:00 - 15:00
    SH2: { start: 900, end: 1380 },   // 15:00 - 23:00
    SH3: { start: 1380, end: 420 },   // 23:00 - 07:00
  };

  const SATURDAY_SHIFT_RANGES = {
    SH1: { start: 420, end: 720 },    // 07:00 - 12:00
    SH2: { start: 720, end: 1020 },   // 12:00 - 17:00
    SH3: { start: 1020, end: 1380 },  // 17:00 - 23:00
  };

  /**
   * Cek apakah tanggal tertentu jatuh di hari Sabtu
   * @param {string} dateStr - Format 'YYYY-MM-DD'
   * @returns {boolean}
   */
  function isSaturday(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T12:00:00'); // Pakai noon untuk hindari timezone issue
    return d.getDay() === 6; // 0=Minggu, 6=Sabtu
  }

  /**
   * Ambil konfigurasi slot berdasarkan tanggal
   * @param {string} dateStr - Format 'YYYY-MM-DD'
   * @returns {Object} SHIFT_SLOTS config
   */
  function getSlots(dateStr) {
    return isSaturday(dateStr) ? SATURDAY_SLOTS : WEEKDAY_SLOTS;
  }

  /**
   * Ambil jumlah group per shift berdasarkan tanggal
   * @param {string} dateStr - Format 'YYYY-MM-DD'
   * @returns {number} 3 for Saturday, 4 for weekdays
   */
  function getGroupCount(dateStr) {
    return isSaturday(dateStr) ? 3 : 4;
  }

  /**
   * Ambil shift ranges berdasarkan tanggal
   * @param {string} dateStr - Format 'YYYY-MM-DD'
   * @returns {Object} Shift ranges
   */
  function getShiftRanges(dateStr) {
    return isSaturday(dateStr) ? SATURDAY_SHIFT_RANGES : WEEKDAY_SHIFT_RANGES;
  }

  /**
   * Deteksi shift aktif berdasarkan waktu saat ini dan tanggal
   * @param {string} dateStr - Format 'YYYY-MM-DD'
   * @param {number} mins - Current minutes from midnight (h*60 + m)
   * @returns {string} 'SH1', 'SH2', or 'SH3'
   */
  function detectCurrentShift(dateStr, mins) {
    const ranges = getShiftRanges(dateStr);
    
    if (ranges.SH3.start > ranges.SH3.end) {
      // SH3 wraps midnight (weekday)
      if (mins >= ranges.SH1.start && mins < ranges.SH1.end) return 'SH1';
      if (mins >= ranges.SH2.start && mins < ranges.SH2.end) return 'SH2';
      return 'SH3';
    } else {
      // Saturday: no midnight wrap
      if (mins >= ranges.SH1.start && mins < ranges.SH1.end) return 'SH1';
      if (mins >= ranges.SH2.start && mins < ranges.SH2.end) return 'SH2';
      if (mins >= ranges.SH3.start && mins < ranges.SH3.end) return 'SH3';
      // Before SH1 starts
      return 'SH1';
    }
  }

  /**
   * Label hari: "Sabtu" atau hari biasa
   */
  function getDayLabel(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[d.getDay()];
  }

  return {
    isSaturday,
    getSlots,
    getGroupCount,
    getShiftRanges,
    detectCurrentShift,
    getDayLabel,
    WEEKDAY_SLOTS,
    SATURDAY_SLOTS,
  };
})();

window.ShiftConfig = ShiftConfig;
export default ShiftConfig;
