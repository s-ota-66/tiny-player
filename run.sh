open -na "Google Chrome" --args --new-window "http://localhost:8000/index.html"
ruby -run -ehttpd . -p8000
