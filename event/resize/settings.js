var path = new java.io.File(".").getCanonicalPath();
var browserURL = "file:///"+path.replace("\\", "/")+"/resize/";

SeleniumDefaults = {
	// the domain where selenium will run
    serverHost: "localhost",
	// the port where selenium will run
    serverPort: 4444,
	// the domain/url where your page will run from (change if not filesystem)
    browserURL: browserURL
    //browserURL: "file:///C:/development/framework/funcunit/"
}

// the list of browsers that selenium runs tests on
SeleniumBrowsers = ["*firefox"]

// set up your smtp settings
// these are used to email you test results
/**
* Example 1: Gmail SMTP
EmailerDefaults = {
    host: "smtp.gmail.com",
    port: 587,
	auth: true,
	tls: true,
	username: "yourname@gmail.com",
	password: "yourpass",
    from: "yourname@gmail.com",
    to: ["yourname@gmail.com", "anotherdev@gmail.com"],
    subject: "Test Logs"
}
* Example 2: SMTP Server without authentication 
EmailerDefaults = {
    host: "smtp.myserver.com",
    port: 25,
    from: "myemail@myserver.com",
    to: ["yourname@myserver.com", "anotherdev@myserver.com"],
    subject: "Test Logs"
}
*/