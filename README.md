# Lightfactor Identity Engine

Lightfactor Identity Engine is a lightweight server that implements the [FIDO UAF protocol](https://fidoalliance.org/specifications/overview/) for identity and authentication.  This implementation participated in the August 2016 FIDO Interop event and was [certified](https://fidoalliance.org/certification/fido-certified/) by FIDO in September 2016.  It has been load-tested against a free-tier AWS instance and can support at least 200 simultaneous UAF operations in that configuration.

Lightfactor Identity Engine was designed and built with an emphasis on scalability and simplicity with regard to installation, dependencies, architecture, etc. It is offered here, in Open Source form, to educate, drive further adoption of FIDO, and expand the FIDO ecosystem. No warranty is offered or implied.

A running instance of this server is normally available at https://qiwisrv.lightfactor.co. This instance is for demonstration purposes and is **not** intended for operational use.  UAF client implementers wishing to test against this instance may submit their metadata addition requests to meta@lightfactor.co.

Source code review is appreciated, and contributions are welcomed and encouraged.

Check us out at https://lightfactor.co.

## Features

Per the FIDO specifications, it offers the following UAF features: registration, authentication (including transaction confirmation), deregistration.

## Requirements

* Lightfactor Identity Engine is implemented using [Node.js](https://nodejs.org/en/) and [Express](http://expressjs.com).
* It uses [MongoDB](https://www.mongodb.com) for persistence; a connection URL for your instance is required.
* It relies on the lightfactor-uaf library for UAF operations.
* You will need Python >=2.5.0 & < 3.0.0 for node-gyp.
* You will need to provision a **real** SSL certificate (not a self-signed certificate!) for use with iOS UAF clients and/or the FIDO Conformance testing app due to the Application Transport Security features included with iOS 9.0.

## Installation

1. Install node and python on your platform
2. **git clone** this repo into a local directory
3. **npm install** to install modules (including lightfactor-uaf)
4. Edit **config.js** to reflect your MongoDB endpoint and database (and SSL paths, if changed)
5. **node seed** to seed configured database with minimal facet, policy, metadata, and challenge data (and indexes)
6. **node app** to run server

This process assumes that you know how to install and use node. Note that, depending on your platform, there may be additional libraries required, particularly with regard to transaction confirmation image generation. Also note that you may want or need to edit the seeded data to conform with your particular requirements; if you'd like to edit it before insertion, it is located in the new *db* subdirectory.

## Usage

For specific details on the underlying FIDO payloads, please refer to the [specifications](https://fidoalliance.org/specifications/overview/). The API is exposed via HTTP POST. The following are example bodies:

### Initiate (/Get)
The same endpoint is used to initiate all transactions. The body posted should contain **one** of the following:
```javascript
  {
    "op": "Reg",
    "context": {
      "userName": "lfuser"
    }
  }
```
or
```javascript
  {
    "op": "Auth"
  }
```
or
```javascript
  {
    "op": "Auth",
    "context": {
      "userName": "lfuser",
      "transaction": "$1000"
    }
  }
```
or
```javascript
  {
    "op": "Dereg",
    "context": {
      "userName": "lfuser"
    }
  }
```
### Complete Registration (/Send/Reg)
Example body:
```javascript
{"uafResponse":"[{'header':{'upv':{'major':1,'minor':0},'appID':'https://qiwisrv.lightfactor.co','serverData':'B7-mk5fRi94rfqSm6E7k-ACoCeYEgIYqIkafD6Xj9m8','op':'Reg'},'fcParams':'eyJmYWNldElEIjogImh0dHBzOi8vcWl3aXNydi5saWdodGZhY3Rvci5jbyIsICJjaGFsbGVuZ2UiOiAiYjc3NXU2aGY2akVYUEk3ZVEzN3ljb0c4ZFpLMmxJX1YxMkYtLWxRa3dOYyIsICJjaGFubmVsQmluZGluZyI6IHt9LCAiYXBwSUQiOiAiaHR0cHM6Ly9xaXdpc3J2LmxpZ2h0ZmFjdG9yLmNvIn0','assertions':[{'assertion':'AT41AgM-sQALLgkARkZGRiMwMDAxDi4HAAEAAQEAAAEKLiAAPDn21S3xlHLH2W51em44-8P_v_LX-UZaL0FXNkUDNQAJLiAAXdPpYhpiooGXyI2n9u4Fz02C445v42ESCkYryN2-j24NLggAAwAAAAMAAAAMLkEABAIjcjq0lei6RVOiOeGe5bunZHTvPTxyiVCRiMsle_Q4ajK-_zpexgjH_UwsFygEqrY3AnEjGuQBeOmW5DwYEqEHPnwBBi5AAOGgto4194zKfJAmGNf6crhDlbuQEOEqn57xIIO9rSPmP2dRSYMy6QIoa-Uc08m9jMeRVj86L21t9jvyzbGIO4EFLjQBMIIBMDCB2AIBATAKBggqhkjOPQQDAjAlMSMwIQYDVQQDDBpGSURPIENPTkZPUk1BTkNFIFRFU1QgUk9PVDAeFw0xNTA5MDEyMzM0MzRaFw0yMDA4MzEyMzM0MzRaMCUxIzAhBgNVBAMMGkZJRE8gQ09ORk9STUFOQ0UgRkZGRiMwMDAxMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErDoSk47tm5c4zbInHY4DIIwAFyl4pVeB5P9Bp9eXAk2H4-bcve9lylVwhwlJ9Y9NlZ9KMemR_qWjhLXtK5urwDAKBggqhkjOPQQDAgNHADBEAiAqioGSW3CJ_7TCXCAvRJfr5OkiEqRJIMHro3iiMGO6LQIgbc2VmvOZfZWXbp3lQZeRiz-W5Ca276gFNSJEElKwO9g','assertionScheme':'UAFV1TLV'}]}]"}
```
where uafResponse is a **JSON.stringify**'ed version of
```javascript
[
  {
    "header": {
      "upv": {
        "major": 1,
        "minor": 0
      },
      "appID": "https://qiwisrv.lightfactor.co",
      "serverData": "B7-mk5fRi94rfqSm6E7k-ACoCeYEgIYqIkafD6Xj9m8",
      "op": "Reg"
    },
    "fcParams": "eyJmYWNldElEIjogImh0dHBzOi8vcWl3aXNydi5saWdodGZhY3Rvci5jbyIsICJjaGFsbGVuZ2UiOiAiYjc3NXU2aGY2akVYUEk3ZVEzN3ljb0c4ZFpLMmxJX1YxMkYtLWxRa3dOYyIsICJjaGFubmVsQmluZGluZyI6IHt9LCAiYXBwSUQiOiAiaHR0cHM6Ly9xaXdpc3J2LmxpZ2h0ZmFjdG9yLmNvIn0",
    "assertions": [
      {
        "assertion": "AT41AgM-sQALLgkARkZGRiMwMDAxDi4HAAEAAQEAAAEKLiAAPDn21S3xlHLH2W51em44-8P_v_LX-UZaL0FXNkUDNQAJLiAAXdPpYhpiooGXyI2n9u4Fz02C445v42ESCkYryN2-j24NLggAAwAAAAMAAAAMLkEABAIjcjq0lei6RVOiOeGe5bunZHTvPTxyiVCRiMsle_Q4ajK-_zpexgjH_UwsFygEqrY3AnEjGuQBeOmW5DwYEqEHPnwBBi5AAOGgto4194zKfJAmGNf6crhDlbuQEOEqn57xIIO9rSPmP2dRSYMy6QIoa-Uc08m9jMeRVj86L21t9jvyzbGIO4EFLjQBMIIBMDCB2AIBATAKBggqhkjOPQQDAjAlMSMwIQYDVQQDDBpGSURPIENPTkZPUk1BTkNFIFRFU1QgUk9PVDAeFw0xNTA5MDEyMzM0MzRaFw0yMDA4MzEyMzM0MzRaMCUxIzAhBgNVBAMMGkZJRE8gQ09ORk9STUFOQ0UgRkZGRiMwMDAxMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErDoSk47tm5c4zbInHY4DIIwAFyl4pVeB5P9Bp9eXAk2H4-bcve9lylVwhwlJ9Y9NlZ9KMemR_qWjhLXtK5urwDAKBggqhkjOPQQDAgNHADBEAiAqioGSW3CJ_7TCXCAvRJfr5OkiEqRJIMHro3iiMGO6LQIgbc2VmvOZfZWXbp3lQZeRiz-W5Ca276gFNSJEElKwO9g",
        "assertionScheme": "UAFV1TLV"
      }
    ]
  }
]
```
### Complete Authentication (/Send/Reg; without transaction)
```javascript
{"uafResponse":"[{'header':{'upv':{'major':1,'minor':0},'appID':'https://qiwisrv.lightfactor.co','serverData':'Vo-nBoXDXT53nrEcBUgi_ntKMUCCZ4y9ekcBHp5R6Cw','op':'Auth'},'fcParams':'eyJmYWNldElEIjogImh0dHBzOi8vcWl3aXNydi5saWdodGZhY3Rvci5jbyIsICJjaGFsbGVuZ2UiOiAielVNS0lwQ0l5QkhnZThIeW53cE9wUThzNm0waUlvWmZ0SDJPYk1jbVJTRSIsICJjaGFubmVsQmluZGluZyI6IHt9LCAiYXBwSUQiOiAiaHR0cHM6Ly9xaXdpc3J2LmxpZ2h0ZmFjdG9yLmNvIn0','assertions':[{'assertion':'Aj7WAAQ-jgALLgkARkZGRiMwMDAxDi4FAAEAAQEADy4gAI4_pledO12j6LtqwOwb0d8zc9__4b6zk8tSpldId-dMCi4gAMnc0IqtePkwvfA9DXtJus4Ih59neG9W33zCcn92LKJxEC4AAAkuIAAbnOxDpSJkPh-UlxeCCvM4u2-2TO7RQoIRCrOL1Pbz7Q0uBAAAAAASBi5AALr-HeqCieo2HEQmnocjB5ulvM0cgYALK9pTyMHGYfl1RjlaAGlyD7JydBA4JfB_cEvhhn_Uj035RWjiz_8O9g4','assertionScheme':'UAFV1TLV'}]}]"}
```
where uafResponse is a **JSON.stringify**'ed version of
```javascript
[
  {
    "header": {
      "upv": {
        "major": 1,
        "minor": 0
      },
      "appID": "https://qiwisrv.lightfactor.co",
      "serverData": "Vo-nBoXDXT53nrEcBUgi_ntKMUCCZ4y9ekcBHp5R6Cw",
      "op": "Auth"
    },
    "fcParams": "eyJmYWNldElEIjogImh0dHBzOi8vcWl3aXNydi5saWdodGZhY3Rvci5jbyIsICJjaGFsbGVuZ2UiOiAielVNS0lwQ0l5QkhnZThIeW53cE9wUThzNm0waUlvWmZ0SDJPYk1jbVJTRSIsICJjaGFubmVsQmluZGluZyI6IHt9LCAiYXBwSUQiOiAiaHR0cHM6Ly9xaXdpc3J2LmxpZ2h0ZmFjdG9yLmNvIn0",
    "assertions": [
      {
        "assertion": "Aj7WAAQ-jgALLgkARkZGRiMwMDAxDi4FAAEAAQEADy4gAI4_pledO12j6LtqwOwb0d8zc9__4b6zk8tSpldId-dMCi4gAMnc0IqtePkwvfA9DXtJus4Ih59neG9W33zCcn92LKJxEC4AAAkuIAAbnOxDpSJkPh-UlxeCCvM4u2-2TO7RQoIRCrOL1Pbz7Q0uBAAAAAASBi5AALr-HeqCieo2HEQmnocjB5ulvM0cgYALK9pTyMHGYfl1RjlaAGlyD7JydBA4JfB_cEvhhn_Uj035RWjiz_8O9g4",
        "assertionScheme": "UAFV1TLV"
      }
    ]
  }
]
```
### Complete Authentication (/Send/Reg; with transaction)
```javascript
{"uafResponse":"[{'header':{'upv':{'major':1,'minor':0},'appID':'https://qiwisrv.lightfactor.co','serverData':'azwtq2ASNffLMDA7-mgiHMATcY1YNGlMopDceldQI_4','op':'Auth'},'fcParams':'eyJmYWNldElEIjogImh0dHBzOi8vcWl3aXNydi5saWdodGZhY3Rvci5jbyIsICJjaGFsbGVuZ2UiOiAiRjZFaDBoUk9MeWxBZjVDWmtOYmxyUnR5a1pvc0VjT005UnBEaW56Yy1YbyIsICJjaGFubmVsQmluZGluZyI6IHt9LCAiYXBwSUQiOiAiaHR0cHM6Ly9xaXdpc3J2LmxpZ2h0ZmFjdG9yLmNvIn0','assertions':[{'assertion':'Aj72AAQ-rgALLgkARkZGRiM1MjAxDi4FAAEAAgEADy4gAJRypMJ9diToGZn6_QUqc13NApSrrnG6iQLr7W-NKG-pCi4gAMpfd9DbYLSJXKryUrW8GyctW3Vrp-k_97kctUNn7hxZEC4gAH0aVBJ7IiUC9bebX7CAMGEVKkT5KzfiPGUnuvZl1NqaCS4gABaojU-533ck8iU0Z4o646-PRi2PjLtAA18pjk-R5I3SDS4EAAAAABIGLkAAhQhheOytxg8Z-we8Ced02s-zlAS6kHJ1aCSM3BVW22b49cu7HLkFUK9pSKJZFn4n2gAj5wyqufRcJ-Wa9V4PFQ','assertionScheme':'UAFV1TLV'}]}]"}
```
where uafResponse is a **JSON.stringify**'ed version of
```javascript
[
  {
    "header": {
      "upv": {
        "major": 1,
        "minor": 0
      },
      "appID": "https://qiwisrv.lightfactor.co",
      "serverData": "azwtq2ASNffLMDA7-mgiHMATcY1YNGlMopDceldQI_4",
      "op": "Auth"
    },
    "fcParams": "eyJmYWNldElEIjogImh0dHBzOi8vcWl3aXNydi5saWdodGZhY3Rvci5jbyIsICJjaGFsbGVuZ2UiOiAiRjZFaDBoUk9MeWxBZjVDWmtOYmxyUnR5a1pvc0VjT005UnBEaW56Yy1YbyIsICJjaGFubmVsQmluZGluZyI6IHt9LCAiYXBwSUQiOiAiaHR0cHM6Ly9xaXdpc3J2LmxpZ2h0ZmFjdG9yLmNvIn0",
    "assertions": [
      {
        "assertion": "Aj72AAQ-rgALLgkARkZGRiM1MjAxDi4FAAEAAgEADy4gAJRypMJ9diToGZn6_QUqc13NApSrrnG6iQLr7W-NKG-pCi4gAMpfd9DbYLSJXKryUrW8GyctW3Vrp-k_97kctUNn7hxZEC4gAH0aVBJ7IiUC9bebX7CAMGEVKkT5KzfiPGUnuvZl1NqaCS4gABaojU-533ck8iU0Z4o646-PRi2PjLtAA18pjk-R5I3SDS4EAAAAABIGLkAAhQhheOytxg8Z-we8Ced02s-zlAS6kHJ1aCSM3BVW22b49cu7HLkFUK9pSKJZFn4n2gAj5wyqufRcJ-Wa9V4PFQ",
        "assertionScheme": "UAFV1TLV"
      }
    ]
  }
]
```
### Complete Deregistration
There is no corresponding operation for deregistration.

## Acknowledgements

[Christopher Buecheler's tutorial](http://cwbuecheler.com/web/tutorials/2014/restful-web-app-node-express-mongodb/) is a great reference for getting started with Node.js, REST interfaces, Express, and MongoDB.

(And many thanks to Dave Atherton who spent numerous sleepless nights getting this server project done while Jeff Cesnik was off designing hardware and doing other stuff).

# License

[GNU AGPLv3](http://www.gnu.org/licenses/agpl-3.0.txt)
