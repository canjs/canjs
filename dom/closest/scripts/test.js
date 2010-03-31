load('steal/rhino/env.js');
load('jquery/dom/closest/settings.js')

if (!_args[0] || (_args[0]!="-functional" && _args[0]!="-unit" && _args[1]!="-email" && _args[1]!="-mail")) {
	print("Usage: steal/js jquery/dom/closest/scripts/test.js [option]");
	print("");
	print("options");
	print("-functional 	Runs funcunit tests");
	print("-unit 		Runs unit tests");
	print("-email 		Runs all tests and emails you results");
	quit();
}

if (_args[0] == "-functional") {
	Envjs('jquery/dom/closest/funcunit.html', {
		scriptTypes: {
			"text/javascript": true,
			"text/envjs": true
		},
		fireLoad: true,
		logLevel: 2
	});
}

if (_args[0] == "-unit") {
	Envjs('jquery/dom/closest/qunit.html', {
		scriptTypes: {
			"text/javascript": true,
			"text/envjs": true
		},
		fireLoad: true,
		logLevel: 2
	});
}

if(_args[1] == "-email" || _args[1] == "-mail"){
	if (typeof javax.mail.Session.getDefaultInstance != "function") {
		print('usage: steal\\js -mail jquery/dom/closest/scripts/test.js -email')
		quit()
	}
	load('steal/email/email.js');
	
	if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
		runCommand("cmd", "/C", "start /b steal\\js jquery/dom/closest/scripts/test.js -functional > jquery/dom/closest/test.log")
		runCommand("cmd", "/C", "start /b steal\\js jquery/dom/closest/scripts/test.js -unit >> jquery/dom/closest/test.log")
	}
	else {
		runCommand("sh", "-c", "nohup ./steal/js jquery/dom/closest/scripts/test.js -functional > jquery/dom/closest/test.log")
		runCommand("sh", "-c", "nohup ./steal/js jquery/dom/closest/scripts/test.js -unit >> jquery/dom/closest/test.log")
	}
	
	var log = readFile('jquery/dom/closest/test.log');
	steal.Emailer.setup(EmailerDefaults);
	steal.Emailer.send(log)
}