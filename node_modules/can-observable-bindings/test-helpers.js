const helpers = {
	browserSupports: {
		customElements: "customElements" in window,
		shadowDom: typeof document.body.attachShadow === "function"
	}
};

module.exports = helpers;
