document.addEventListener('DOMContentLoaded', function () {
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());

	const helloBtn = document.getElementById('action-hello');
	if (helloBtn) {
		helloBtn.addEventListener('click', function () {
			// Minimal, accessible feedback
			alert('Hello — welcome to Banque Centrale Nature!');
		});
	}

	const toggleBtn = document.getElementById('action-toggle');
	if (toggleBtn) {
		toggleBtn.addEventListener('click', function () {
			const body = document.body;
			const dark = body.dataset.theme === 'dark';
			if (dark) {
				delete body.dataset.theme;
				body.style.background = '#f7faf7';
			} else {
				body.dataset.theme = 'dark';
				body.style.background = '#0f1720';
			}
		});
	}
});