@echo off
open -na "Google Chrome" --args --new-window "http://localhost:8000/index.html"
ruby -r webrick -e "s = WEBrick::HTTPServer.new(:Port => 8000, :DocumentRoot => Dir.pwd); trap('INT') { s.shutdown }; s.start"
