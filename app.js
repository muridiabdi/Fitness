(() => {
  "use strict";

  const STORAGE_KEY = "form-and-fuel-tracker-v1";
  const DEFAULTS = {
    profile: { heightCm: null, startingWeightKg: null },
    targets: { calories: 2200, protein: 150 },
    workouts: [],
    meals: [],
    weighIns: [],
    weeklyCheckIns: [],
    planAdjustments: [],
    groceryChecks: {}
  };
  const dateInput = document.getElementById("active-date");
  const toast = document.getElementById("toast");
  let state;
  let toastTimer;

  const todayISO = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };
  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const numberFormat = value => new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(value);
  const prettyDate = (date, options = { weekday: "short", day: "numeric", month: "short" }) =>
    new Intl.DateTimeFormat("en-GB", options).format(new Date(`${date}T12:00:00`));

  function localISO(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function nextMonday() {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    return localISO(date);
  }

  function weekForDate(date, startDate) {
    const day = new Date(`${date}T12:00:00`);
    const start = new Date(`${startDate}T12:00:00`);
    return Math.max(1, Math.min(4, Math.floor((day - start) / 604800000) + 1));
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return structuredClone(DEFAULTS);
      const parsed = JSON.parse(saved);
      const savedCheckins = Array.isArray(parsed.weeklyCheckIns)
        ? parsed.weeklyCheckIns.map(entry => entry.joint === undefined && entry.hip !== undefined
          ? { ...entry, joint: entry.hip }
          : entry)
        : [];
      const savedAdjustments = Array.isArray(parsed.planAdjustments)
        ? parsed.planAdjustments.map(entry => entry.joint === undefined && entry.hip !== undefined
          ? { ...entry, joint: entry.hip }
          : entry)
        : [];
      const savedStartDate = parsed.planStartDate || nextMonday();
      const planStartDate = !savedCheckins.length && savedStartDate > nextMonday() ? nextMonday() : savedStartDate;
      return {
        profile: { ...DEFAULTS.profile, ...parsed.profile },
        targets: { ...DEFAULTS.targets, ...parsed.targets },
        workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
        meals: Array.isArray(parsed.meals) ? parsed.meals : [],
        weighIns: Array.isArray(parsed.weighIns) ? parsed.weighIns : [],
        weeklyCheckIns: savedCheckins,
        planAdjustments: savedAdjustments,
        groceryChecks: parsed.groceryChecks && typeof parsed.groceryChecks === "object" ? parsed.groceryChecks : {},
        planStartDate,
        planWeek: parsed.planWeek
      };
    } catch (error) {
      console.error("Could not load saved tracker data.", error);
      showToast("Saved data could not be read. Your current entries may not be available.");
      return structuredClone(DEFAULTS);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error("Could not save tracker data.", error);
      showToast("Couldn't save your data. Download a backup or free up browser storage.");
      return false;
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 3000);
  }

  function selectedDate() {
    return dateInput.value || todayISO();
  }

  function renderAll() {
    renderExercises();
    renderFood();
    renderWeight();
    renderPlan();
    renderMealPlan();
    renderCheckin();
  }

  function planWeekDates(week) {
    const start = new Date(`${state.planStartDate}T12:00:00`);
    start.setDate(start.getDate() + (week - 1) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start: localISO(start), end: localISO(end) };
  }

  function getWeeklyCheckin(week) {
    return state.weeklyCheckIns.find(entry => entry.week === week);
  }

  function planAdjustmentForWeek(week) {
    return state.planAdjustments.find(adjustment => adjustment.week === week);
  }

  function fillWeekSelect(select, selectedWeek) {
    select.innerHTML = window.FITNESS_PLAN.weeks.map((week, index) =>
      `<option value="${index + 1}">Week ${index + 1}</option>`
    ).join("");
    select.value = String(selectedWeek);
  }

  function renderPlan() {
    const week = Math.max(1, Math.min(4, Number(state.planWeek) || weekForDate(todayISO(), state.planStartDate)));
    state.planWeek = week;
    document.getElementById("plan-start-date").value = state.planStartDate;
    fillWeekSelect(document.getElementById("workout-plan-week"), week);
    fillWeekSelect(document.getElementById("food-plan-week"), week);
    fillWeekSelect(document.getElementById("checkin-week"), week);
    const weekData = window.FITNESS_PLAN.weeks[week - 1];
    const dates = planWeekDates(week);
    const dateRange = `${prettyDate(dates.start, { day: "numeric", month: "short" })} – ${prettyDate(dates.end, { day: "numeric", month: "short" })}`;
    const summary = `<strong>${escapeHTML(weekData.title)}</strong><span>${escapeHTML(weekData.focus)} · ${dateRange}</span>`;
    document.getElementById("workout-week-summary").innerHTML = `${summary}<p>${escapeHTML(weekData.progression)}</p>`;
    document.getElementById("food-week-summary").innerHTML = `<strong>${escapeHTML(weekData.title)}</strong><span>${escapeHTML(window.FITNESS_PLAN.nutritionNote)}</span>`;
    const adjustmentData = planAdjustmentForWeek(week);
    const checkin = getWeeklyCheckin(adjustmentData ? adjustmentData.sourceWeek : week - 1);
    const adjusted = checkin && checkin.joint >= 4
      ? "Your last check-in flagged joint discomfort. Keep movements comfortable, reduce the listed sets and skip any exercise that causes pain."
      : checkin && (checkin.sessions < 3 || checkin.energy <= 2)
        ? "Your last check-in suggests holding your previous loads and reps this week; prioritise recovery rather than adding work."
        : "";
    document.getElementById("workout-plan-list").innerHTML = window.FITNESS_PLAN.workouts.map((workout, index) => {
      const lowerBody = workout.name.startsWith("Lower");
      const rows = workout.exercises.map(exercise => {
        let sets = exercise.sets;
        if (week === 4 && sets > 2) sets -= 1;
        if (lowerBody && checkin && checkin.joint >= 4 && week !== 4) sets = Math.max(2, sets - 1);
        const note = exercise.note ? `<span class="exercise-note">${escapeHTML(exercise.note)}</span>` : "";
        return `<tr><td><strong>${escapeHTML(exercise.name)}</strong>${note}</td><td>${sets}${exercise.sets === 1 ? "" : " sets"}</td><td>${escapeHTML(exercise.reps)}</td><td>${escapeHTML(exercise.rest)}</td></tr>`;
      }).join("");
      const conditioning = workout.finisher ? `<p class="workout-finisher"><strong>Optional conditioning:</strong> ${escapeHTML(workout.finisher)}</p>` : "";
      return `<details class="workout-day-card"${index === 0 ? " open" : ""}>
        <summary><span class="workout-day-name">${escapeHTML(workout.day)}</span><strong>${escapeHTML(workout.name)}</strong><span class="workout-time">~60 min</span></summary>
        <div class="workout-day-body"><p class="workout-warmup"><strong>Warm-up:</strong> ${escapeHTML(workout.warmup)}</p>
        <div class="table-scroll"><table class="exercise-plan-table"><thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Rest</th></tr></thead><tbody>${rows}</tbody></table></div>${conditioning}</div>
      </details>`;
    }).join("");
    const adjustment = document.getElementById("workout-adjustment");
    adjustment.hidden = !adjusted;
    adjustment.textContent = adjusted;
    renderGroceries(week);
  }

  function createMealDay(week, dayIndex) {
    const cycle = window.FITNESS_PLAN.menuCycles[week - 1];
    const labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const keys = ["breakfast", "lunch", "snack", "dinner"];
    const meals = keys.map(key => window.FITNESS_PLAN.mealOptions[key][cycle[key][dayIndex]]);
    return {
      day: labels[dayIndex],
      date: (() => {
        const start = new Date(`${state.planStartDate}T12:00:00`);
        start.setDate(start.getDate() + (week - 1) * 7 + dayIndex);
        return localISO(start);
      })(),
      meals
    };
  }

  function renderMealPlan() {
    const week = Math.max(1, Math.min(4, Number(state.planWeek) || 1));
    document.getElementById("meal-plan-list").innerHTML = Array.from({ length: 7 }, (_, dayIndex) => {
      const day = createMealDay(week, dayIndex);
      const totals = day.meals.reduce((result, meal) => ({
        calories: result.calories + meal.calories,
        protein: result.protein + meal.protein
      }), { calories: 0, protein: 0 });
      return `<details class="meal-plan-day"${dayIndex === 0 ? " open" : ""}>
        <summary><span>${escapeHTML(day.day)}</span><strong>${numberFormat(totals.calories)} kcal</strong><span>${numberFormat(totals.protein)} g protein</span></summary>
        <div class="planned-meals">${day.meals.map((meal, mealIndex) => `
          <article class="planned-meal">
            <div class="planned-meal-copy"><span class="meal-tag">${["Breakfast", "Lunch", "Snack", "Dinner"][mealIndex]}</span><strong>${escapeHTML(meal.name)}</strong><p>${escapeHTML(meal.details)}</p><span class="planned-macros">~${numberFormat(meal.calories)} kcal · ${numberFormat(meal.protein)} g protein</span></div>
            <button type="button" class="text-button log-planned-meal" data-plan-day="${dayIndex}" data-plan-slot="${mealIndex}">Log meal</button>
          </article>`).join("")}</div></details>`;
    }).join("");
    document.getElementById("grocery-list").innerHTML = window.FITNESS_PLAN.groceries[week - 1].map((group, groupIndex) =>
      `<section class="grocery-group"><h4>${escapeHTML(group.section)}</h4>${group.items.map((item, itemIndex) => {
        const key = `${week}-${groupIndex}-${itemIndex}`;
        const checked = Boolean(state.groceryChecks[key]);
        return `<label class="grocery-item${checked ? " checked" : ""}"><input type="checkbox" data-grocery-key="${key}"${checked ? " checked" : ""}><span>${escapeHTML(item)}</span></label>`;
      }).join("")}</section>`
    ).join("");
  }

  function renderGroceries(week) {
    const selected = document.getElementById("food-plan-week");
    if (selected) selected.value = String(week);
  }

  function checkinFeedback(checkin) {
    if (!checkin) return "";
    const parts = [];
    if (checkin.week < 4) {
      if (checkin.adherence < 5) {
        parts.push("Keep the calorie target steady; build consistency with meals before cutting food further.");
      } else if (checkin.weeklyLoss === null) {
        parts.push("Keep the calorie target steady; this check-in establishes your weight baseline for next week.");
      } else if (checkin.calorieChange > 0) {
        parts.push(`Next week's calorie target increases by ${checkin.calorieChange} kcal to support recovery and a steadier rate of loss.`);
      } else if (checkin.calorieChange < 0) {
        parts.push(`Next week's calorie target decreases by ${Math.abs(checkin.calorieChange)} kcal after a well-adhered week with little weight change.`);
      } else {
        parts.push("Keep the current calorie and protein targets; the weight trend is in a reasonable range.");
      }
      if (checkin.joint >= 7) {
        parts.push("Your discomfort score is high. Pause painful movements and arrange advice from a qualified clinician before progressing them.");
      } else if (checkin.joint >= 4) {
        parts.push("Next week, take one set off lower-body lifts and use only comfortable ranges; skip any movement that causes pain.");
      } else if (checkin.sessions < 3 || checkin.energy <= 2) {
        parts.push("Repeat the previous week's loads and reps rather than progressing; give recovery priority.");
      } else {
        parts.push("Continue the planned gradual progression only when reps stay controlled and pain-free.");
      }
    } else {
      parts.push("Four weeks complete. Review your weight trend, energy, adherence and movement comfort before choosing another block; avoid making a large calorie change from one check-in.");
    }
    return parts.join(" ");
  }

  function renderCheckin() {
    const weekSelect = document.getElementById("checkin-week");
    if (!weekSelect) return;
    const week = Number(weekSelect.value || state.planWeek || 1);
    const saved = getWeeklyCheckin(week);
    document.getElementById("checkin-weight").value = saved ? saved.weight : "";
    document.getElementById("checkin-sessions").value = saved ? saved.sessions : "0";
    document.getElementById("checkin-adherence").value = saved ? saved.adherence : "0";
    document.getElementById("checkin-energy").value = saved ? saved.energy : "3";
    document.getElementById("checkin-hunger").value = saved ? saved.hunger : "3";
    document.getElementById("checkin-joint").value = saved ? saved.joint : "0";
    document.getElementById("checkin-feedback").textContent = saved
      ? checkinFeedback(saved)
      : `Week ${week} check-in not saved yet. Your current starting targets are ${numberFormat(state.targets.calories)} kcal and ${numberFormat(state.targets.protein)} g protein.`;
  }

  function saveWeeklyCheckin(form) {
    const week = Number(document.getElementById("checkin-week").value);
    const previous = [...state.weeklyCheckIns]
      .filter(entry => entry.week < week)
      .sort((a, b) => b.week - a.week)[0];
    const previousWeight = previous ? previous.weight
      : Number.isFinite(state.profile.startingWeightKg) ? state.profile.startingWeightKg
        : null;
    const weight = Number(form.elements.weight.value);
    const sessions = Number(form.elements.sessions.value);
    const adherence = Number(form.elements.adherence.value);
    const energy = Number(form.elements.energy.value);
    const hunger = Number(form.elements.hunger.value);
    const joint = Number(form.elements.joint.value);
    const weeklyLoss = previousWeight === null ? null : previousWeight - weight;
    let calorieChange = 0;
    if (week < 4 && adherence >= 5 && weeklyLoss !== null) {
      if (weeklyLoss > 0.75 || energy <= 2 || hunger >= 5) calorieChange = 100;
      else if (weeklyLoss < 0.1 && energy >= 3 && hunger <= 3) calorieChange = -100;
    }
    const newCalories = week < 4
      ? Math.max(1800, Math.min(2700, state.targets.calories + calorieChange))
      : state.targets.calories;
    const checkin = { week, weight, sessions, adherence, energy, hunger, joint, weeklyLoss, calorieChange: newCalories - state.targets.calories };
    state.weeklyCheckIns = state.weeklyCheckIns.filter(entry => entry.week !== week);
    state.weeklyCheckIns.push(checkin);
    state.weeklyCheckIns.sort((a, b) => a.week - b.week);
    const weighInDate = planWeekDates(week).end;
    const weighIn = state.weighIns.find(entry => entry.date === weighInDate);
    if (weighIn) weighIn.weight = weight;
    else state.weighIns.push({ date: weighInDate, weight });
    if (week < 4) {
      state.targets.calories = newCalories;
      state.planAdjustments = state.planAdjustments.filter(item => item.week !== week + 1);
      state.planAdjustments.push({ week: week + 1, sourceWeek: week, joint, sessions, energy, calorieTarget: newCalories });
    }
    if (saveState()) {
      renderAll();
      document.getElementById("checkin-week").value = String(week);
      renderCheckin();
      showToast(`Week ${week} check-in saved. Next week's guidance is updated.`);
    }
  }

  let installPrompt = null;

  function registerInstallSupport() {
    const installButton = document.getElementById("install-app");
    const installDialog = document.getElementById("install-dialog");
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    document.querySelectorAll(".close-install-dialog").forEach(button => {
      button.addEventListener("click", () => installDialog.close());
    });
    installButton.addEventListener("click", async () => {
      if (installPrompt) {
        const prompt = installPrompt;
        await prompt.prompt();
        const choice = await prompt.userChoice;
        installPrompt = null;
        if (choice.outcome === "accepted") installButton.hidden = true;
        else installButton.classList.remove("install-available");
      } else {
        installDialog.showModal();
      }
    });
    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      installPrompt = event;
      installButton.classList.add("install-available");
    });
    window.addEventListener("appinstalled", () => {
      installPrompt = null;
      installButton.hidden = true;
      showToast("Form & Fuel is installed on your device.");
    });
    if (isIOS) installButton.classList.add("install-ios");

    if ("serviceWorker" in navigator && window.isSecureContext) {
      navigator.serviceWorker.register("./sw.js").catch(error => {
        console.error("Could not register the offline app worker.", error);
      });
    }
  }

  function logPlannedMeal(dayIndex, mealIndex) {
    const week = Number(state.planWeek);
    const day = createMealDay(week, dayIndex);
    const meal = day.meals[mealIndex];
    const type = ["Breakfast", "Lunch", "Snack", "Dinner"][mealIndex];
    state.meals.push({
      id: uid(), date: day.date, name: meal.name, calories: meal.calories,
      protein: meal.protein, type, planned: true
    });
    if (saveState()) {
      dateInput.value = day.date;
      renderFood();
      showToast(`${meal.name} logged for ${prettyDate(day.date)}.`);
    }
  }

  function renderExercises() {
    const exercises = state.workouts.filter(item => item.date === selectedDate());
    const list = document.getElementById("exercise-list");
    document.getElementById("exercise-count").textContent = `${exercises.length} ${exercises.length === 1 ? "exercise" : "exercises"}`;
    document.getElementById("empty-exercises").hidden = exercises.length > 0;
    list.innerHTML = exercises.map(exercise => `
      <article class="exercise-item">
        <div class="exercise-item-head">
          <strong>${escapeHTML(exercise.name)}</strong>
          <span>${exercise.sets.length} ${exercise.sets.length === 1 ? "set" : "sets"}</span>
          <button class="delete-button" type="button" data-remove-exercise="${escapeHTML(exercise.id)}" aria-label="Remove ${escapeHTML(exercise.name)}">×</button>
        </div>
        <div class="exercise-sets">${exercise.sets.map((set, index) =>
          `<span class="set-chip">Set ${index + 1} · ${numberFormat(set.reps)} reps · ${numberFormat(set.weight)} kg</span>`
        ).join("")}</div>
      </article>`).join("");
  }

  function renderFood() {
    const meals = state.meals.filter(item => item.date === selectedDate());
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
    document.getElementById("calories-current").textContent = numberFormat(totalCalories);
    document.getElementById("protein-current").textContent = numberFormat(totalProtein);
    document.getElementById("calories-target").textContent = numberFormat(state.targets.calories);
    document.getElementById("protein-target").textContent = numberFormat(state.targets.protein);
    document.getElementById("calories-progress").style.width = `${Math.min(100, totalCalories / state.targets.calories * 100)}%`;
    document.getElementById("protein-progress").style.width = `${Math.min(100, totalProtein / state.targets.protein * 100)}%`;
    const caloriesLeft = Math.max(0, state.targets.calories - totalCalories);
    const proteinLeft = Math.max(0, state.targets.protein - totalProtein);
    document.getElementById("calories-remaining").textContent = caloriesLeft ? `${numberFormat(caloriesLeft)} kcal to go` : `${numberFormat(totalCalories - state.targets.calories)} kcal over target`;
    document.getElementById("protein-remaining").textContent = proteinLeft ? `${numberFormat(proteinLeft)} g to go` : `${numberFormat(totalProtein - state.targets.protein)} g over target`;
    document.getElementById("meal-count").textContent = `${meals.length} ${meals.length === 1 ? "meal" : "meals"}`;
    document.getElementById("empty-meals").hidden = meals.length > 0;
    document.getElementById("meal-list").innerHTML = meals.map(meal => `
      <article class="meal-item">
        <div class="meal-item-main">
          <div class="meal-name">${escapeHTML(meal.name)}</div>
          <div class="meal-meta"><span class="meal-tag">${escapeHTML(meal.type)}</span></div>
        </div>
        <div class="meal-nutrition"><strong>${numberFormat(meal.calories)} kcal</strong><span>${numberFormat(meal.protein)} g protein</span></div>
        <button class="delete-button" type="button" data-remove-meal="${escapeHTML(meal.id)}" aria-label="Remove ${escapeHTML(meal.name)}">×</button>
      </article>`).join("");
  }

  function renderWeight() {
    const weighIns = [...state.weighIns].sort((a, b) => a.date.localeCompare(b.date));
    const chart = document.getElementById("weight-chart");
    const latest = weighIns[weighIns.length - 1];
    document.getElementById("latest-weight").textContent = latest ? numberFormat(latest.weight) : "—";
    document.getElementById("weigh-in-count").textContent = `${weighIns.length} ${weighIns.length === 1 ? "entry" : "entries"}`;
    document.getElementById("chart-range").textContent = weighIns.length > 1
      ? `${prettyDate(weighIns[0].date, { month: "short", year: "2-digit" })} — ${prettyDate(weighIns[weighIns.length - 1].date, { month: "short", year: "2-digit" })}`
      : "Add weigh-ins to see your trend";
    if (!weighIns.length) {
      chart.innerHTML = '<div class="chart-empty">Add your first weigh-in to start your chart.</div>';
    } else {
      chart.innerHTML = buildChart(weighIns);
    }
    document.getElementById("weigh-in-list").innerHTML = [...weighIns].reverse().map(entry => `
      <div class="weigh-in-row">
        <span class="weigh-in-date">${escapeHTML(prettyDate(entry.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</span>
        <span class="weigh-in-weight">${numberFormat(entry.weight)} kg</span>
        <button class="delete-button" type="button" data-remove-weight="${escapeHTML(entry.date)}" aria-label="Remove weigh-in for ${escapeHTML(entry.date)}">×</button>
      </div>`).join("");
    const selectedEntry = state.weighIns.find(entry => entry.date === selectedDate());
    document.getElementById("weight-value").value = selectedEntry ? selectedEntry.weight : "";
  }

  function buildChart(entries) {
    const width = 720;
    const height = 235;
    const left = 43;
    const right = 12;
    const top = 14;
    const bottom = 35;
    const values = entries.map(entry => entry.weight);
    const low = Math.floor((Math.min(...values) - 1) * 2) / 2;
    const high = Math.ceil((Math.max(...values) + 1) * 2) / 2;
    const span = Math.max(high - low, 1);
    const x = index => entries.length === 1 ? (left + width - right) / 2 : left + index * (width - left - right) / (entries.length - 1);
    const y = weight => top + (high - weight) / span * (height - top - bottom);
    const line = entries.map((entry, index) => `${index ? "L" : "M"} ${x(index).toFixed(1)} ${y(entry.weight).toFixed(1)}`).join(" ");
    const yTicks = Array.from({ length: 4 }, (_, i) => high - span * i / 3);
    const xIndexes = [...new Set([0, Math.floor((entries.length - 1) / 2), entries.length - 1])];
    const grid = yTicks.map(value => `<g><line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}" stroke="#edf0eb" stroke-width="1"/><text x="${left - 10}" y="${y(value) + 3}" text-anchor="end" fill="#9aa198" font-size="10">${numberFormat(value)}</text></g>`).join("");
    const labels = xIndexes.map(index => `<text x="${x(index)}" y="${height - 7}" text-anchor="${index === 0 ? "start" : index === entries.length - 1 ? "end" : "middle"}" fill="#9aa198" font-size="10">${escapeHTML(prettyDate(entries[index].date, { day: "numeric", month: "short" }))}</text>`).join("");
    const points = entries.map((entry, index) => `<circle cx="${x(index)}" cy="${y(entry.weight)}" r="4.5" fill="#fff" stroke="#245c43" stroke-width="2.5"><title>${escapeHTML(prettyDate(entry.date))}: ${numberFormat(entry.weight)} kg</title></circle>`).join("");
    return `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">${grid}<path d="${line}" fill="none" stroke="#245c43" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${points}${labels}</svg>`;
  }

  function addSetRow(reps = "", weight = "") {
    const row = document.createElement("div");
    row.className = "set-row";
    row.innerHTML = `<span class="set-number"></span><input aria-label="Reps" type="number" min="1" max="1000" step="1" placeholder="8" value="${escapeHTML(reps)}" required><input aria-label="Weight in kilograms" type="number" min="0" max="2000" step="0.5" placeholder="40" value="${escapeHTML(weight)}" required><button class="remove-set" type="button" aria-label="Remove set">×</button>`;
    document.getElementById("set-rows").append(row);
    updateSetNumbers();
  }

  function updateSetNumbers() {
    const rows = [...document.querySelectorAll(".set-row")];
    rows.forEach((row, index) => {
      row.querySelector(".set-number").textContent = index + 1;
      row.querySelector(".remove-set").disabled = rows.length === 1;
    });
  }

  function setPage(name) {
    document.querySelectorAll(".page").forEach(page => {
      const isActive = page.id === `page-${name}`;
      page.hidden = !isActive;
      page.classList.toggle("active", isActive);
    });
    document.querySelectorAll(".nav-link").forEach(link => {
      const isActive = link.dataset.page === name;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function downloadBackup() {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data: state }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `form-and-fuel-backup-${todayISO()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Your tracker backup has been downloaded.");
  }

  function bindEvents() {
    document.querySelectorAll(".nav-link").forEach(button => button.addEventListener("click", () => setPage(button.dataset.page)));
    dateInput.addEventListener("change", renderAll);
    ["workout-plan-week", "food-plan-week"].forEach(id => {
      document.getElementById(id).addEventListener("change", event => {
        state.planWeek = Number(event.currentTarget.value);
        if (saveState()) {
          renderPlan();
          renderMealPlan();
          renderCheckin();
        }
      });
    });
    document.getElementById("plan-start-date").addEventListener("change", event => {
      if (!event.currentTarget.value) return;
      state.planStartDate = event.currentTarget.value;
      state.planWeek = weekForDate(todayISO(), state.planStartDate);
      if (saveState()) renderAll();
    });
    document.getElementById("checkin-week").addEventListener("change", renderCheckin);
    document.getElementById("checkin-form").addEventListener("submit", event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (form.reportValidity()) saveWeeklyCheckin(form);
    });
    document.getElementById("meal-plan-list").addEventListener("click", event => {
      const button = event.target.closest("[data-plan-day]");
      if (!button) return;
      logPlannedMeal(Number(button.dataset.planDay), Number(button.dataset.planSlot));
    });
    document.getElementById("grocery-list").addEventListener("change", event => {
      const checkbox = event.target.closest("[data-grocery-key]");
      if (!checkbox) return;
      state.groceryChecks[checkbox.dataset.groceryKey] = checkbox.checked;
      if (saveState()) checkbox.closest(".grocery-item").classList.toggle("checked", checkbox.checked);
    });
    document.getElementById("add-set").addEventListener("click", () => addSetRow());
    document.getElementById("set-rows").addEventListener("click", event => {
      const removeButton = event.target.closest(".remove-set");
      if (removeButton && document.querySelectorAll(".set-row").length > 1) {
        removeButton.closest(".set-row").remove();
        updateSetNumbers();
      }
    });
    document.getElementById("exercise-form").addEventListener("submit", event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const sets = [...form.querySelectorAll(".set-row")].map(row => ({
        reps: Number(row.querySelectorAll("input")[0].value),
        weight: Number(row.querySelectorAll("input")[1].value)
      }));
      state.workouts.push({ id: uid(), date: selectedDate(), name: form.elements.name.value.trim(), sets });
      if (saveState()) {
        form.reset();
        document.getElementById("set-rows").innerHTML = "";
        addSetRow();
        renderExercises();
        showToast("Exercise added to your session.");
      }
    });
    document.getElementById("exercise-list").addEventListener("click", event => {
      const button = event.target.closest("[data-remove-exercise]");
      if (!button) return;
      state.workouts = state.workouts.filter(item => item.id !== button.dataset.removeExercise);
      if (saveState()) renderExercises();
    });
    document.getElementById("meal-form").addEventListener("submit", event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      state.meals.push({
        id: uid(), date: selectedDate(), name: form.elements.name.value.trim(),
        calories: Number(form.elements.calories.value), protein: Number(form.elements.protein.value),
        type: form.elements.type.value
      });
      if (saveState()) {
        form.reset();
        renderFood();
        showToast("Meal added to your food diary.");
      }
    });
    document.getElementById("meal-list").addEventListener("click", event => {
      const button = event.target.closest("[data-remove-meal]");
      if (!button) return;
      state.meals = state.meals.filter(item => item.id !== button.dataset.removeMeal);
      if (saveState()) renderFood();
    });
    const targetsDialog = document.getElementById("targets-dialog");
    document.getElementById("edit-targets").addEventListener("click", () => {
      document.getElementById("target-calories").value = state.targets.calories;
      document.getElementById("target-protein").value = state.targets.protein;
      targetsDialog.showModal();
    });
    document.querySelectorAll(".close-dialog").forEach(button => button.addEventListener("click", () => targetsDialog.close()));
    document.getElementById("targets-form").addEventListener("submit", event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      state.targets.calories = Number(form.elements[0].value);
      state.targets.protein = Number(form.elements[1].value);
      if (saveState()) {
        targetsDialog.close();
        renderFood();
        showToast("Daily targets updated.");
      }
    });
    document.getElementById("weight-form").addEventListener("submit", event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const weight = Number(form.elements.weight.value);
      const date = selectedDate();
      const existing = state.weighIns.find(entry => entry.date === date);
      if (existing) existing.weight = weight;
      else state.weighIns.push({ date, weight });
      state.weighIns.sort((a, b) => a.date.localeCompare(b.date));
      if (saveState()) {
        renderWeight();
        showToast(existing ? "Weigh-in updated." : "Weigh-in saved.");
      }
    });
    document.getElementById("weigh-in-list").addEventListener("click", event => {
      const button = event.target.closest("[data-remove-weight]");
      if (!button) return;
      state.weighIns = state.weighIns.filter(entry => entry.date !== button.dataset.removeWeight);
      if (saveState()) renderWeight();
    });
    document.querySelectorAll(".backup-button, .mobile-backup, .footer-backup").forEach(button => button.addEventListener("click", downloadBackup));
  }

  state = loadState();
  if (!state.planStartDate) state.planStartDate = nextMonday();
  if (!state.planWeek) state.planWeek = weekForDate(todayISO(), state.planStartDate);
  if (!state.weighIns.length && Number.isFinite(state.profile.startingWeightKg) && state.profile.startingWeightKg > 0) {
    state.weighIns.push({ date: todayISO(), weight: state.profile.startingWeightKg });
    saveState();
  }
  dateInput.value = todayISO();
  addSetRow();
  bindEvents();
  registerInstallSupport();
  renderAll();
})();
