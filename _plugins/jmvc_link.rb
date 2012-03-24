module Jekyll
  class JMVCLink < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
      text_array = text.split(' ')
      if text_array.length > 1
        @url  = text_array.first
        @link = text_array[1..-1].join(' ')
      else
        @url  = text_array.first
        @link = text_array.first
      end
    end

    def render(context)
    	%Q([#{@link}](http://javascriptmvc.com/docs.html#!##{@url}))
    end
  end
end

Liquid::Template.register_tag('jmvclink', Jekyll::JMVCLink)