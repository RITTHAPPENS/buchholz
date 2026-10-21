(() => {
	const header = document.querySelector("[data-header]");
	const toggle = document.querySelector("[data-nav-toggle]");
	const nav = document.getElementById("hauptnavigation");
	const hero = document.querySelector(".hero, .page-hero");

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
})();
