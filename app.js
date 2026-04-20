/* =========================================================
   AI교육컨설팅 — Interactions
   ========================================================= */

/* ============== Calendar (Step 1) ============== */
(function initCalendar() {
  const grid = document.getElementById('cal-grid');
  const title = document.getElementById('cal-title');
  const prev = document.getElementById('cal-prev');
  const next = document.getElementById('cal-next');
  const selectedList = document.getElementById('selected-list');
  const selectedEmpty = document.getElementById('selected-empty');
  const nextBtn = document.getElementById('step1-next');

  if (!grid) return;

  const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const DOW_KO = ['일', '월', '화', '수', '목', '금', '토'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Demo blocked dates (e.g. already-booked) within the view month
  const BLOCKED_DAYS = [20, 24, 27];

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  // selected = array of { year, month, day, dow } in priority order
  let selected = [];

  function saveSelection() {
    localStorage.setItem('inquiry_dates', JSON.stringify(selected));
  }

  function loadSelection() {
    try {
      const raw = localStorage.getItem('inquiry_dates');
      if (raw) selected = JSON.parse(raw);
    } catch (e) { selected = []; }
  }

  loadSelection();

  function findRank(year, month, day) {
    const idx = selected.findIndex(d => d.year === year && d.month === month && d.day === day);
    return idx === -1 ? 0 : idx + 1;
  }

  function render() {
    title.textContent = `${viewYear} · ${MONTHS[viewMonth]}`;

    grid.innerHTML = '';

    // DOW headers
    DOW.forEach(d => {
      const cell = document.createElement('div');
      cell.className = 'cal-dow';
      cell.textContent = d;
      grid.appendChild(cell);
    });

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Empty leading cells
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day';
      empty.style.visibility = 'hidden';
      grid.appendChild(empty);
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('button');
      cell.className = 'cal-day';
      cell.textContent = day;

      const cellDate = new Date(viewYear, viewMonth, day);
      cellDate.setHours(0, 0, 0, 0);

      const isPast = cellDate < now;
      const isToday = cellDate.getTime() === now.getTime();
      const isBlocked = BLOCKED_DAYS.includes(day) && !isPast;
      const rank = findRank(viewYear, viewMonth, day);

      if (isPast) cell.classList.add('past');
      else if (isToday) cell.classList.add('today');
      if (isBlocked) cell.classList.add('blocked');

      if (rank > 0) {
        cell.classList.add('selected', `rank-${rank}`);
        const badge = document.createElement('span');
        badge.className = 'cal-rank-badge';
        badge.textContent = rank;
        cell.appendChild(badge);
      }

      if (!isPast && !isBlocked) {
        cell.addEventListener('click', () => toggleDate(viewYear, viewMonth, day));
      } else {
        cell.disabled = true;
      }

      grid.appendChild(cell);
    }
  }

  function toggleDate(year, month, day) {
    const idx = selected.findIndex(d => d.year === year && d.month === month && d.day === day);
    if (idx !== -1) {
      selected.splice(idx, 1);
    } else {
      if (selected.length >= 3) {
        // shake: visual feedback would go here
        return;
      }
      const date = new Date(year, month, day);
      selected.push({ year, month, day, dow: date.getDay() });
    }
    saveSelection();
    render();
    renderSelectedList();
  }

  function renderSelectedList() {
    if (!selectedList) return;
    selectedList.innerHTML = '';

    if (selected.length === 0) {
      selectedEmpty.style.display = 'block';
      nextBtn.style.opacity = '0.4';
      nextBtn.style.pointerEvents = 'none';
      return;
    }

    selectedEmpty.style.display = 'none';
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'auto';

    selected.forEach((d, i) => {
      const item = document.createElement('div');
      item.className = 'selected-item';
      item.innerHTML = `
        <div class="rank-pill rank-pill-${i + 1}">${i + 1}</div>
        <div class="selected-date">${d.month + 1}월 ${d.day}일 <span class="dow">${DOW_KO[d.dow]}요일</span></div>
        <button class="selected-remove" data-idx="${i}" aria-label="제거">×</button>
      `;
      selectedList.appendChild(item);
    });

    selectedList.querySelectorAll('.selected-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        selected.splice(idx, 1);
        saveSelection();
        render();
        renderSelectedList();
      });
    });
  }

  if (prev) prev.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    render();
  });

  if (next) next.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    render();
  });

  render();
  renderSelectedList();
})();

/* ============== Inquiry Form (Step 2) ============== */
(function initInquiryForm() {
  // Chip multi-select for 교육 희망 분야
  document.querySelectorAll('[data-chip-group]').forEach(group => {
    group.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
      });
    });
  });

  // Single-select for mode toggle
  document.querySelectorAll('[data-mode-toggle]').forEach(group => {
    group.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  // Instructor picker
  document.querySelectorAll('[data-instructor-picker]').forEach(group => {
    group.querySelectorAll('.picker-card').forEach(card => {
      card.addEventListener('click', () => {
        group.querySelectorAll('.picker-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  });
})();

/* ============== Dashboard Filters ============== */
(function initDashboard() {
  const chips = document.querySelectorAll('[data-filter]');
  const rows = document.querySelectorAll('[data-status]');

  if (!chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      rows.forEach(row => {
        if (filter === 'all' || row.dataset.status === filter) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });
})();

/* ============== Dashboard Password Gate ============== */
(function initGate() {
  const gate = document.getElementById('gate');
  if (!gate) return;

  const form = document.getElementById('gate-form');
  const input = document.getElementById('gate-input');
  const err = document.getElementById('gate-error');

  // Demo password — in production this would be a server-side check
  const DEMO_PASSWORD = 'trio2026';

  // Check session
  if (sessionStorage.getItem('dash_unlocked') === '1') {
    gate.classList.add('hidden');
    return;
  }

  input.focus();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value === DEMO_PASSWORD) {
      sessionStorage.setItem('dash_unlocked', '1');
      gate.classList.add('hidden');
    } else {
      err.textContent = '비밀번호가 일치하지 않습니다';
      input.value = '';
      input.focus();
    }
  });
})();

/* ============== Smooth scroll reveal ============== */
(function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
})();
/* ============== Dashboard Counter ============== */
async function loadDashboardCounts() {
  try {
    const res = await fetch('https://hook.eu2.make.com/33lra5aitl7jpmqfxfyfrscvirqgw18i');
    const text = await res.text();

    const newCount     = (text.match(/신규/g) || []).length;
    const reviewCount  = (text.match(/검토중/g) || []).length;
    const confirmCount = (text.match(/확정/g) || []).length;

    cons nums = document.querySelectorAll('.stat-num');
   if (nums[0]) nums[0].textContent = newCount;
   if (nums[1]) nums[1].textContent = reviewCount;
   if (nums[2]) nums[2].textContent = confirmCount;

const total = newCount + reviewCount + confirmCount;
const chips = document.querySelectorAll('[data-filter]');
chips.forEach(chip => {
  const f = chip.dataset.filter;
  if (f === 'all')     chip.textContent = `전체 ${total}`;
  if (f === 'new')     chip.textContent = `신규 ${newCount}`;
  if (f === 'review')  chip.textContent = `검토중 ${reviewCount}`;
  if (f === 'confirm') chip.textContent = `확정 ${confirmCount}`;
});
  } catch(e) {
    console.log('카운터 로드 실패', e);
  }
}

if (document.querySelector('.stat-num')) loadDashboardCounts();
