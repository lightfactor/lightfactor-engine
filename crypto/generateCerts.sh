#!/bin/bash

PATH=/usr/local/opt/openssl/bin:$PATH
CURVE=prime256v1
SERVER=server
CA=ca

# generate CA

SUBJ="/C=US/ST=Virginia/L=Winchester/O=Lightfactor, LLC/CN=Lightfactor Localhost Test CA"

openssl ecparam -name $CURVE -genkey -noout -out $CA-key.pem
openssl req -new -x509 -sha256 -days 365 -key $CA-key.pem -subj "$SUBJ" -out $CA-crt.pem

# generate own key and csr

SUBJ="/C=US/ST=Virginia/L=Winchester/O=Lightfactor, LLC/CN=localhost.lightfactor.test"

openssl ecparam -name $CURVE -genkey -noout -out $SERVER-key.pem
openssl ec -in $SERVER-key.pem -pubout -out $SERVER-pub.pem
openssl req -new -sha256 -key $SERVER-key.pem -subj "$SUBJ" -out $SERVER-csr.pem

# sign with our own CA

openssl x509 -req -days 365 -in $SERVER-csr.pem -CA $CA-crt.pem -CAkey $CA-key.pem -set_serial 01 -out $SERVER-crt.pem -sha256
