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
	const wizard = document.querySelector("[data-wizard]");
	if (wizard) {
		const steps = [...wizard.querySelectorAll("[data-step]")];
		const navItems = [...wizard.querySelectorAll("[data-nav-step]")];
		const count = wizard.querySelector("[data-wizard-count]");
		const back = wizard.querySelector("[data-wizard-back]");
		const summary = wizard.querySelector("[data-wizard-summary]");
		const mail = wizard.querySelector("[data-wizard-mail]");
		const last = steps.length - 1;
		let current = 0;

		const answers = () =>
			steps.slice(0, last).map((step) => ({
				question: step.querySelector("legend").textContent.trim(),
				answer: [...step.querySelectorAll("input:checked")].map((input) => input.value).join(", ") || "Keine Angabe",
			}));

		const show = (index, focus = true) => {
			current = index;
			steps.forEach((step, i) => {
				step.hidden = i !== index;
			});
			navItems.forEach((item, i) => {
				item.classList.toggle("is-done", i < index);
				item.classList.toggle("is-current", i === index);
			});
			count.hidden = index === last;
			count.textContent = `Frage ${index + 1} von ${last}`;
			back.hidden = index === 0;

			if (index === last) {
				const items = answers();
				summary.replaceChildren(
					...items.flatMap(({ question, answer }) => {
						const dt = document.createElement("dt");
						const dd = document.createElement("dd");
						dt.textContent = question;
						dd.textContent = answer;
						return [dt, dd];
					})
				);
				const lines = items.map(({ question, answer }) => `${question}\n${answer}`).join("\n\n");
				const body = `Guten Tag Herr Abt,\n\nanbei meine Bewerbung. Vorab meine Angaben:\n\n${lines}\n\nViele Grüße\n`;
				mail.href = `mailto:bewerbung@ib-buchholz.de?subject=${encodeURIComponent("Bewerbung")}&body=${encodeURIComponent(body)}`;
			}

			if (focus) {
				const target = steps[index].querySelector("input, h3");
				if (target) target.focus({ preventScroll: true });
			}
		};

		wizard.addEventListener("change", (event) => {
			if (event.target.type === "radio") window.setTimeout(() => show(current + 1), 220);
		});
		wizard.querySelectorAll("[data-wizard-next]").forEach((button) =>
			button.addEventListener("click", () => show(current + 1))
		);
		back.addEventListener("click", () => show(Math.max(0, current - 1)));
		wizard.addEventListener("submit", (event) => event.preventDefault());
		show(0, false);
	}
})();
