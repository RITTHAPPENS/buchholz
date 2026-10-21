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
		const mail = document.querySelector("[data-quiz-mail]");
		const summary = document.querySelector("[data-quiz-summary]");
		const fields = [...quiz.querySelectorAll("fieldset")];
		const empty = summary.innerHTML;

		const update = () => {
			const answers = fields
				.map((fieldset) => ({
					question: fieldset.querySelector("legend").textContent.trim(),
					answer: [...fieldset.querySelectorAll("input:checked")].map((input) => input.value).join(", "),
				}))
				.filter((item) => item.answer);

			if (answers.length) {
				summary.replaceChildren(
					...answers.map(({ question, answer }) => {
						const li = document.createElement("li");
						const label = document.createElement("span");
						label.textContent = question;
						li.append(label, answer);
						return li;
					})
				);
			} else {
				summary.innerHTML = empty;
			}

			let href = `mailto:bewerbung@ib-buchholz.de?subject=${encodeURIComponent("Bewerbung")}`;
			if (answers.length) {
				const lines = answers.map(({ question, answer }) => `${question}: ${answer}`).join("\n");
				const body = `Guten Tag Herr Abt,\n\nanbei meine Bewerbung. Vorab ein paar Angaben:\n\n${lines}\n\nViele Grüße\n`;
				href += `&body=${encodeURIComponent(body)}`;
			}
			mail.setAttribute("href", href);
		};

		quiz.addEventListener("change", update);
		quiz.addEventListener("submit", (event) => event.preventDefault());
	}
})();
