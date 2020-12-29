let supportsClassFields;

try {
	eval(`class Foo {
		field = "value"
	}`);
	supportsClassFields = true;
} catch(e) {
	supportsClassFields = false;
}

export default supportsClassFields;
