file = File.open("index.md", "rb")
contents = file.read

link_matcher = /\{% jmvclink ([a-zA-Z\. :\$\/]+) %\}/

link_converter = Proc.new do |m|
	text_array = $1.split(' ')
	if text_array.length > 1
		@url  = text_array.first
		@link = text_array[1..-1].join(' ')
	else
		@url  = text_array.first
		@link = text_array.first
	end
	%Q([#{@link}](http://javascriptmvc.com/docs.html#!#{@url}))
end

code_matcher = /(\{% highlight [a-z]+ %\})(.*?)(\{% endhighlight %\})/m
code_converter = Proc.new do |m|
	code = [$1]
	$2.lines.each do |l|
		code << "\t" + l
	end
	code << $3
	code.join("")
end

contents.gsub!(link_matcher, &link_converter)
contents.gsub!(code_matcher, &code_converter)

File.open("new_index.md", 'w') {|f| f.write(contents) }