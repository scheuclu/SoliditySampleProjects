# FlightSurety

This is my implementation for Udacity's Flight Surety Project.


## Interact with the deployed version

To interact with this application, you will need Metamask installed.
The contract runs on the Rinkeby testnet, so you'll need some test Ether there.


This is how the UI should look like **TODO**.

## Run locally

To run this locally, follow these steps:

### Download the repo

```bash
git clone <repo address>
```

### Install all dependencies
```bash
npm install
```
   
### Compile and migrate the contracts

```bash
truffle compile
truffle migrate
```

There might be some issues fetching the appropriate Solidity compiler. If so, run the above commands under sudo.


:point_up: Save the deployed addresses of the two contracts. These need to be copy pasted into [./src/server/coonfig.json](./src/server/coonfig.json).
   
### Run the dapp
   ```bash
   npm run dapp
   ```

   You can access it via [http://localhost:8000](http://localhost:8000).
   
### Run the server

Create a file `src/server/oracles.json` according to [src/server/oracles_template.json](src/server/oracles_template.json).
This file will contain the private keys of all oracles.
This file should never be commited to the repo.


   ```bash
   npm run server
   ```


###  Deploy

To build for prod:
```bash
npm run dapp:prod
```

The results will be written to the ./dapp folder.