(() => {
	const header = document.querySelector("[data-header]");
	const toggle = document.querySelector("[data-nav-toggle]");
	const nav = document.getElementById("hauptnavigation");
	const hero = document.querySelector(".hero, .page-hero");

	if (header && "IntersectionObserver" in window) {
		const sentinel = document.createElement("div");
		sentinel.setAttribute("aria-hidden", "true");
		sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none";
		document.body.prepend(sentinel);
		new IntersectionObserver(([entry]) => header.classList.toggle("is-stuck", !entry.isIntersecting)).observe(sentinel);
	}

	if (header && hero && "IntersectionObserver" in window) {
		const observer = new IntersectionObserver(
			([entry]) => header.classList.toggle("is-scrolled", !entry.isIntersecting),
			{ rootMargin: "-72px 0px 0px 0px" }
		);
		observer.observe(hero);
	} else if (header) {
		header.classList.add("is-scrolled");
	}

	if (toggle && nav) {
		const setOpen = (open) => {
			toggle.setAttribute("aria-expanded", String(open));
			nav.classList.toggle("is-open", open);
			header.classList.toggle("has-open-nav", open);
		};

		toggle.addEventListener("click", () => {
			setOpen(toggle.getAttribute("aria-expanded") !== "true");
		});

		nav.addEventListener("click", (event) => {
			if (event.target.closest("a")) setOpen(false);
		});

		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && nav.classList.contains("is-open")) {
				setOpen(false);
				toggle.focus();
			}
		});
	}

	document.querySelectorAll("[data-compare]").forEach((figure) => {
		const range = figure.querySelector("[data-compare-range]");
		if (!range) return;
		const update = () => figure.style.setProperty("--pos", `${range.value}%`);
		range.addEventListener("input", update);
		update();
	});
	const dialog = document.querySelector("[data-lightbox-dialog]");
	if (dialog && typeof dialog.showModal === "function") {
		const img = dialog.querySelector(".lightbox__img");
		const caption = dialog.querySelector(".lightbox__caption");
		let opener = null;

		document.querySelectorAll("[data-lightbox]").forEach((link) => {
			link.addEventListener("click", (event) => {
				event.preventDefault();
				const thumb = link.querySelector("img");
				const label = link.querySelector("span");
				opener = link;
				img.src = link.href;
				img.alt = thumb ? thumb.alt : "";
				caption.textContent = label ? label.textContent : "";
				dialog.showModal();
			});
		});

		dialog.addEventListener("click", (event) => {
			if (event.target === dialog || event.target.closest("[data-lightbox-close]")) dialog.close();
		});

		dialog.addEventListener("close", () => {
			img.src = "data:,";
			if (opener) opener.focus();
		});
	}
	const quiz = document.querySelector("[data-quiz]");
	if (quiz) {
		const steps = [...quiz.querySelectorAll("[data-step]")];
		const stepLabel = quiz.querySelector("[data-quiz-step]");
		const bar = quiz.querySelector("[data-quiz-bar]");
		const back = quiz.querySelector("[data-quiz-back]");
		const summary = quiz.querySelector("[data-quiz-summary]");
		const mail = quiz.querySelector("[data-quiz-mail]");
		const total = steps.length - 1;
		let current = 0;

		const questions = steps.slice(0, total).map((step) => ({
			step,
			label: step.querySelector("legend").textContent.trim(),
		}));

		const answerOf = (step) =>
			[...step.querySelectorAll("input:checked")].map((input) => input.value).join(", ") || "Keine Angabe";

		const show = (index) => {
			current = index;
			steps.forEach((step, i) => {
				step.hidden = i !== index;
			});
			const done = index === total;
			stepLabel.parentElement.hidden = done;
			bar.style.width = `${(Math.min(index, total) / total) * 100}%`;
			stepLabel.textContent = `Frage ${index + 1}`;
			back.hidden = index === 0;

			if (done) {
				summary.replaceChildren();
				const lines = [];
				questions.forEach(({ step, label }) => {
					const answer = answerOf(step);
					const dt = document.createElement("dt");
					const dd = document.createElement("dd");
					dt.textContent = label;
					dd.textContent = answer;
					summary.append(dt, dd);
					lines.push(`${label}\n${answer}`);
				});
				const body = `Guten Tag Herr Abt,\n\nhier meine Antworten aus dem Kurz-Check auf Ihrer Website:\n\n${lines.join("\n\n")}\n\nMeinen Lebenslauf finden Sie im Anhang.\n\nViele Grüße\n`;
				mail.href = `mailto:bewerbung@ib-buchholz.de?subject=${encodeURIComponent("Bewerbung über den Kurz-Check")}&body=${encodeURIComponent(body)}`;
			}

			const focusTarget = steps[index].querySelector("input, h3, a");
			if (focusTarget && quiz.dataset.started) focusTarget.focus({ preventScroll: true });
			quiz.dataset.started = "true";
		};

		quiz.addEventListener("change", (event) => {
			if (event.target.type === "radio") window.setTimeout(() => show(current + 1), 180);
		});

		quiz.querySelectorAll("[data-quiz-next]").forEach((button) =>
			button.addEventListener("click", () => show(current + 1))
		);

		back.addEventListener("click", () => show(Math.max(0, current - 1)));
		quiz.addEventListener("submit", (event) => event.preventDefault());
		show(0);
	}
})();
