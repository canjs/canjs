steal.config({
	map: {
		"app_a_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789/app_a_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789" : "app_a_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789",
		"app_b_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789/app_b_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789" : "app_b_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789",
		"app_c_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789/app_c_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789" : "app_c_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789",
		"app_d_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789/app_d_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789" : "app_d_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789"
	},
	paths: {
		"bundle.js": "bundle.js",
		"steal/*" : "../../node_modules/steal/*.js",
		"@traceur": "../../node_modules/traceur/bin/traceur.js"
	},
	bundle: [
	'app_a_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789', 
	'app_b_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789', 
	'app_c_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789', 
	'app_d_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789']
});


