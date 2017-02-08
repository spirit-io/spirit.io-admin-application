[![Build Status](https://travis-ci.org/spirit-io/spirit.io-admin-application.svg?branch=master)](https://travis-ci.org/spirit-io/spirit.io-admin-application)
[![Coverage Status](https://coveralls.io/repos/github/spirit-io/spirit.io-admin-application/badge.svg?branch=master)](https://coveralls.io/github/spirit-io/spirit.io-admin-application?branch=master)

# admin-spirit.io
Administration spirit.io application


## Generate certificate for https
```sh
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 10000
openssl rsa -in key.pem -out newkey.pem
mv newkey.pem key.pem
```